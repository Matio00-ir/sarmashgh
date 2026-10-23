import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { getTrack, locateLesson } from "@/lib/catalog";
import { loadLesson } from "@/lib/content";
import { mockReply, tutorConfigured, tutorSystemPrompt, type ChatMessage } from "@/lib/tutor";

const MAX_MESSAGES = 20;
const MAX_CHARS = 2000;

function today() {
  return new Date().toISOString().slice(0, 10);
}

function textStream(iter: AsyncIterable<string>) {
  const enc = new TextEncoder();
  return new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for await (const chunk of iter) controller.enqueue(enc.encode(chunk));
      } catch (e) {
        console.error("[chat]", e);
        controller.enqueue(enc.encode("\n\n⚠️ ارتباط با معلم هوشمند قطع شد. دوباره امتحان کن."));
      }
      controller.close();
    },
  });
}

async function* mockStream(text: string) {
  for (const word of text.split(/(\s+)/)) {
    yield word;
    await new Promise((r) => setTimeout(r, 15));
  }
}

/** خواندن پاسخ جریانی از هر API سازگار با OpenAI Chat Completions */
async function* providerStream(system: string, messages: ChatMessage[]) {
  const base = process.env.AI_BASE_URL!.replace(/\/+$/, "");
  const res = await fetch(`${base}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.AI_API_KEY}`,
    },
    body: JSON.stringify({
      model: process.env.AI_MODEL,
      stream: true,
      max_tokens: 1200,
      temperature: 0.4,
      messages: [{ role: "system", content: system }, ...messages],
    }),
  });
  if (!res.ok || !res.body) {
    throw new Error(`AI provider ${res.status}: ${await res.text().catch(() => "")}`);
  }

  const reader = res.body.getReader();
  const dec = new TextDecoder();
  let buf = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += dec.decode(value, { stream: true });
    const lines = buf.split("\n");
    buf = lines.pop() ?? "";
    for (const line of lines) {
      const data = line.replace(/^data:\s*/, "").trim();
      if (!line.startsWith("data:") || !data || data === "[DONE]") continue;
      try {
        const delta = JSON.parse(data).choices?.[0]?.delta?.content;
        if (delta) yield delta as string;
      } catch {
        // خط ناقص یا غیر JSON
      }
    }
  }
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user?.name) return NextResponse.json({ error: "اول وارد شو" }, { status: 401 });
  const track = getTrack(user.grade, user.stream);
  if (!track?.available) return NextResponse.json({ error: "پایه انتخاب نشده" }, { status: 400 });

  const body = await req.json().catch(() => ({}));
  const [book, chapter, lesson] = String(body.lessonKey ?? "").split("/");
  const loc = locateLesson(track, book, chapter, lesson);
  const content = loc && (await loadLesson(track.id, loc.key));
  if (!loc || !content) return NextResponse.json({ error: "درس پیدا نشد" }, { status: 404 });

  const messages: ChatMessage[] = Array.isArray(body.messages)
    ? body.messages
        .filter((m: ChatMessage) => (m?.role === "user" || m?.role === "assistant") && typeof m.content === "string")
        .slice(-MAX_MESSAGES)
        .map((m: ChatMessage) => ({ role: m.role, content: m.content.slice(0, MAX_CHARS) }))
    : [];
  if (messages.at(-1)?.role !== "user") {
    return NextResponse.json({ error: "پیامی فرستاده نشده" }, { status: 400 });
  }

  const limit = Number(process.env.AI_DAILY_LIMIT || 40);
  const usage = await db.chatUsage.upsert({
    where: { userId_day: { userId: user.id, day: today() } },
    update: { count: { increment: 1 } },
    create: { userId: user.id, day: today(), count: 1 },
  });
  if (usage.count > limit) {
    return NextResponse.json(
      { error: "سهمیه سؤال امروزت تمام شده. فردا دوباره می‌توانی بپرسی." },
      { status: 429 },
    );
  }

  // بخش موردنظر با شناسه‌اش از متن خود درس پیدا می‌شود، نه از متن ارسالی کاربر
  const focus = content.sections.find((s) => s.id === body.focusSectionId)?.title;
  const system = tutorSystemPrompt({
    studentName: user.name,
    track,
    loc,
    lessonBody: content.body,
    focusSection: focus,
  });

  const configured = tutorConfigured();
  const stream = configured
    ? providerStream(system, messages)
    : mockStream(mockReply(messages.at(-1)!.content));

  return new Response(textStream(stream), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Remaining": String(Math.max(0, limit - usage.count)),
      "X-Tutor-Mode": configured ? "live" : "demo",
    },
  });
}

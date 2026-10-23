import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "اول وارد شو" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const lessonKey = String(body.lessonKey ?? "");
  if (!/^[a-z0-9-]+\/fasl-\d+\/dars-\d+$/.test(lessonKey)) {
    return NextResponse.json({ error: "درس نامعتبر" }, { status: 400 });
  }

  const data: { lastVisitedAt: Date; completedAt?: Date; quizScore?: number; quizTotal?: number } = {
    lastVisitedAt: new Date(),
  };
  if (body.event === "complete") data.completedAt = new Date();
  if (body.event === "quiz") {
    const score = Number(body.score);
    const total = Number(body.total);
    if (!Number.isInteger(score) || !Number.isInteger(total) || total <= 0 || score < 0 || score > total) {
      return NextResponse.json({ error: "نمره نامعتبر" }, { status: 400 });
    }
    data.quizScore = score;
    data.quizTotal = total;
  }

  await db.lessonProgress.upsert({
    where: { userId_lessonKey: { userId: user.id, lessonKey } },
    update: data,
    create: { userId: user.id, lessonKey, ...data },
  });
  return NextResponse.json({ ok: true });
}

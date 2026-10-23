"use client";
import { useId, useState } from "react";
import {
  Bookmark,
  Brain,
  History,
  Lightbulb,
  NotebookPen,
  Target,
  TriangleAlert,
  type LucideIcon,
} from "lucide-react";
import { Markdown } from "../Markdown";
import type { Block, CalloutKind } from "@/lib/lesson-format";

// هر نوع باکس: رنگ (توکن --callout-*)، آیکون و عنوان ثابت؛ نوع محتوا فقط با رنگ مشخص نمی‌شود
const CALLOUTS: Record<CalloutKind, { token: string; label: string; Icon: LucideIcon }> = {
  key: { token: "definition", label: "نکته‌ی کلیدی", Icon: Bookmark },
  tip: { token: "tip", label: "ترفند", Icon: Lightbulb },
  example: { token: "example", label: "مثال حل‌شده", Icon: NotebookPen },
  mistake: { token: "mistake", label: "اشتباه رایج", Icon: TriangleAlert },
  konkur: { token: "konkur", label: "نکته‌ی کنکور", Icon: Target },
  remember: { token: "prerequisite", label: "یادآوری پیش‌نیاز", Icon: History },
};

function CalloutFrame({
  token,
  label,
  title,
  Icon,
  tintedBody = true,
  children,
}: {
  token: string;
  label: string;
  title?: string;
  Icon: LucideIcon;
  tintedBody?: boolean;
  children: React.ReactNode;
}) {
  const color = `var(--callout-${token})`;
  const bg = `var(--callout-${token}-bg)`;
  return (
    <aside
      className="overflow-hidden rounded-card border border-s-4"
      style={{
        borderColor: `color-mix(in srgb, ${color} 28%, transparent)`,
        borderInlineStartColor: color,
        background: tintedBody ? bg : "var(--surface)",
      }}
    >
      <div
        className="flex items-start gap-2 px-4 pt-3 pb-1"
        style={tintedBody ? undefined : { background: bg, paddingBottom: "0.75rem" }}
      >
        <Icon className="mt-0.5 size-4.5 shrink-0" style={{ color }} aria-hidden />
        <span className="text-label leading-6">
          <span className="font-semibold whitespace-nowrap" style={{ color }}>
            {label}
          </span>
          {title && <span className="font-semibold text-foreground"> · {title}</span>}
        </span>
      </div>
      <div className="px-4 pt-2 pb-4">{children}</div>
    </aside>
  );
}

function TryBlock({ title, question, answer }: { title?: string; question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  const answerId = useId();
  return (
    <CalloutFrame token="practice" label="خودت امتحان کن" title={title} Icon={Brain}>
      <Markdown text={question} />
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={answerId}
        className="mt-3 inline-flex min-h-11 items-center rounded-md border px-4 text-label font-semibold transition-colors hover:bg-surface"
        style={{ borderColor: "var(--callout-practice)", color: "var(--callout-practice)" }}
      >
        {open ? "پنهان کردن پاسخ" : "اول خودت حل کن، بعد پاسخ را ببین"}
      </button>
      <div id={answerId} hidden={!open} className="animate-rise mt-3 rounded-md bg-surface p-3.5">
        <div className="mb-1 text-label font-semibold" style={{ color: "var(--callout-practice)" }}>
          پاسخ
        </div>
        <Markdown text={answer} />
      </div>
    </CalloutFrame>
  );
}

export function Blocks({ blocks }: { blocks: Block[] }) {
  return (
    <div className="space-y-5">
      {blocks.map((b, i) => {
        if (b.type === "md") return <Markdown key={i} text={b.text} />;
        if (b.type === "try") return <TryBlock key={i} {...b} />;
        const c = CALLOUTS[b.kind];
        return (
          <CalloutFrame
            key={i}
            token={c.token}
            label={c.label}
            title={b.title}
            Icon={c.Icon}
            // مثال‌های حل‌شده طولانی‌اند؛ متنشان روی زمینه‌ی خنثی خواناتر است
            tintedBody={b.kind !== "example"}
          >
            <Markdown text={b.text} />
          </CalloutFrame>
        );
      })}
    </div>
  );
}

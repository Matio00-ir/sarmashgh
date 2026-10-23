"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Bot,
  CircleCheck,
  ClipboardCheck,
  Clock3,
  FileClock,
  HelpCircle,
  ListChecks,
  ChevronLeft,
} from "lucide-react";
import { Blocks } from "./Blocks";
import { Quiz } from "./Quiz";
import { TutorChat, type ChatRequest } from "./TutorChat";
import { Markdown } from "../Markdown";
import { ThemeToggle } from "../ThemeToggle";
import { Badge } from "../ui/Badge";
import { Button, buttonClass } from "../ui/Button";
import type { Block, QuizQuestion, Section } from "@/lib/lesson-format";
import type { LessonMeta } from "@/lib/content";
import type { Subject } from "@/lib/catalog";
import { toFa } from "@/lib/fa";
import { cx } from "@/lib/cx";

type NavLink = { href: string; title: string } | undefined;

function saveProgress(body: object) {
  return fetch("/api/progress", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }).then((r) => r.ok);
}

/** درصد پیمایش صفحه، برای نوار پیشرفت مطالعه */
function useReadingProgress() {
  const [value, setValue] = useState(0);
  useEffect(() => {
    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const max = document.documentElement.scrollHeight - innerHeight;
        setValue(max > 0 ? Math.min(1, scrollY / max) : 1);
      });
    };
    update();
    addEventListener("scroll", update, { passive: true });
    addEventListener("resize", update);
    return () => {
      removeEventListener("scroll", update);
      removeEventListener("resize", update);
    };
  }, []);
  return value;
}

export function LessonView(props: {
  lessonKey: string;
  bookSlug: string;
  bookTitle: string;
  subject: Subject;
  chapterNumber: number;
  chapterTitle: string;
  lessonNumber: number;
  title: string;
  meta: LessonMeta;
  intro: Block[];
  sections: Section[];
  quiz: QuizQuestion[];
  prev: NavLink;
  next: NavLink;
  initiallyCompleted: boolean;
  tutorLive: boolean;
}) {
  const [chatOpen, setChatOpen] = useState(false);
  const [request, setRequest] = useState<ChatRequest | null>(null);
  const [completed, setCompleted] = useState(props.initiallyCompleted);
  const [completeState, setCompleteState] = useState<"idle" | "saving" | "error">("idle");
  const [quizDone, setQuizDone] = useState(false);
  const reading = useReadingProgress();
  const color = `var(--subject-${props.subject})`;

  useEffect(() => {
    saveProgress({ lessonKey: props.lessonKey, event: "visit" }).catch(() => {});
  }, [props.lessonKey]);

  const ask = useCallback((text: string, section?: Section) => {
    setRequest({ text, focusSectionId: section?.id, focusTitle: section?.title, id: Date.now() });
    setChatOpen(true);
  }, []);
  const closeChat = useCallback(() => setChatOpen(false), []);

  async function complete() {
    setCompleteState("saving");
    const ok = await saveProgress({ lessonKey: props.lessonKey, event: "complete" }).catch(() => false);
    setCompleteState(ok ? "idle" : "error");
    if (ok) setCompleted(true);
  }

  return (
    <>
      <div className={cx("transition-[margin] duration-300 ease-standard", chatOpen && "lg:ms-0 lg:me-[26rem]")}>
        <header className="sticky top-0 z-30 border-b border-border-subtle bg-background/90 backdrop-blur-md">
          <div className="mx-auto flex h-14 max-w-3xl items-center gap-2 px-2 sm:px-4">
            <Link
              href={`/learn/${props.bookSlug}`}
              className="grid size-11 shrink-0 place-items-center rounded-full text-subtle hover:bg-surface-secondary"
              aria-label={`بازگشت به فهرست فصل‌های ${props.bookTitle}`}
            >
              <ArrowRight className="size-5" aria-hidden />
            </Link>
            <div className="min-w-0 flex-1">
              <p className="truncate text-body-sm font-semibold">{props.title}</p>
              <p className="truncate text-caption text-muted">
                {props.bookTitle} · فصل {toFa(props.chapterNumber)}
              </p>
            </div>
            <ThemeToggle />
          </div>
          <div
            className="h-0.5 origin-right"
            style={{ background: color, transform: `scaleX(${reading})` }}
            role="progressbar"
            aria-label="پیشرفت مطالعه‌ی این صفحه"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(reading * 100)}
          />
        </header>

        <main className="lesson-content mx-auto max-w-3xl px-4 pt-6 pb-36">
          <nav aria-label="مسیر" className="text-body-sm text-muted">
            <ol className="flex flex-wrap items-center gap-1">
              <li>
                <Link href={`/learn/${props.bookSlug}`} className="hover:text-foreground">
                  {props.bookTitle}
                </Link>
              </li>
              <li aria-hidden>
                <ChevronLeft className="size-4" />
              </li>
              <li>
                فصل {toFa(props.chapterNumber)}: {props.chapterTitle}
              </li>
            </ol>
          </nav>

          <p className="mt-4 text-label font-semibold" style={{ color }}>
            درس {toFa(props.lessonNumber)}
          </p>
          <h1 className="mt-1 text-h1 font-bold sm:text-[2rem]">{props.title}</h1>

          <div className="mt-3 flex flex-wrap gap-2">
            {props.meta.duration && (
              <Badge icon={<Clock3 className="size-3.5" aria-hidden />}>حدود {toFa(props.meta.duration)} دقیقه</Badge>
            )}
            {props.quiz.length > 0 && (
              <Badge icon={<ClipboardCheck className="size-3.5" aria-hidden />}>
                آزمونک {toFa(props.quiz.length)} سؤالی
              </Badge>
            )}
            {completed && (
              <Badge tone="success" icon={<CircleCheck className="size-3.5" aria-hidden />}>
                تمام‌شده
              </Badge>
            )}
            {props.meta.status === "draft" && (
              <Badge tone="warning" icon={<FileClock className="size-3.5" aria-hidden />}>
                پیش‌نویس · در انتظار بازبینی معلم
              </Badge>
            )}
          </div>

          {props.meta.objectives?.length ? (
            <section aria-labelledby="goals" className="mt-6 rounded-card border border-border-subtle bg-surface p-4 shadow-card sm:p-5">
              <h2 id="goals" className="mb-2 flex items-center gap-2 text-h4 font-semibold">
                <ListChecks className="size-5 text-primary" aria-hidden />
                بعد از این درس می‌توانی:
              </h2>
              <ul className="space-y-1.5">
                {props.meta.objectives.map((o) => (
                  <li key={o} className="flex gap-2.5 text-body">
                    <CircleCheck className="mt-1.5 size-4 shrink-0 text-muted" aria-hidden />
                    <Markdown text={o} />
                  </li>
                ))}
              </ul>
              {props.meta.prerequisites?.length ? (
                <p className="mt-3 border-t border-border-subtle pt-3 text-body-sm text-subtle">
                  <span className="font-semibold">پیش‌نیاز: </span>
                  {props.meta.prerequisites.join("، ")}
                </p>
              ) : null}
            </section>
          ) : null}

          {props.intro.length > 0 && (
            <div className="mt-8">
              <Blocks blocks={props.intro} />
            </div>
          )}

          {props.sections.map((s, i) => (
            <section key={s.id} id={s.id} aria-labelledby={`${s.id}-title`} className="mt-12 scroll-mt-20">
              <h2 id={`${s.id}-title`} className="mb-5 flex items-start gap-3 text-h2 font-bold">
                <span
                  className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-md text-body font-bold"
                  style={{ background: `color-mix(in srgb, ${color} 12%, transparent)`, color }}
                  aria-hidden
                >
                  {toFa(i + 1)}
                </span>
                {s.title}
              </h2>
              <Blocks blocks={s.blocks} />
              <button
                type="button"
                onClick={() =>
                  ask(`بخش «${s.title}» رو متوجه نشدم. می‌شه ساده‌تر و با یه مثال دیگه توضیح بدی؟`, s)
                }
                className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-full border border-border bg-surface px-4 text-label font-medium text-subtle transition-colors hover:border-secondary hover:text-secondary"
              >
                <HelpCircle className="size-4.5" aria-hidden />
                این قسمت رو نفهمیدم
              </button>
            </section>
          ))}

          {props.quiz.length > 0 && (
            <section id="quiz" aria-labelledby="quiz-title" className="mt-14 scroll-mt-20">
              <h2 id="quiz-title" className="flex items-center gap-2 text-h2 font-bold">
                <ClipboardCheck className="size-6 text-primary" aria-hidden />
                آزمونک
              </h2>
              <p className="mt-1 mb-4 text-body text-subtle">
                یک سؤال در هر مرحله. بعد از هر پاسخ، دلیلش را می‌بینی.
              </p>
              <Quiz
                questions={props.quiz}
                onAsk={(t) => ask(t)}
                onFinish={(score, total) => {
                  setQuizDone(true);
                  saveProgress({ lessonKey: props.lessonKey, event: "quiz", score, total }).catch(() => {});
                }}
              />
            </section>
          )}

          <section aria-live="polite" className="mt-10 rounded-xl border border-border-subtle bg-surface p-5 text-center shadow-card">
            {completed ? (
              <div className="animate-rise">
                <span className="mx-auto grid size-12 place-items-center rounded-full bg-success-bg text-success">
                  <CircleCheck className="size-7" aria-hidden />
                </span>
                <p className="mt-3 text-h4 font-semibold">
                  {props.quiz.length > 0 && !quizDone
                    ? "این درس رو تموم کردی؛ حالا یه سؤال حل کنیم تا مطمئن بشیم جا افتاده."
                    : "آفرین، این درس تمام شد."}
                </p>
                {props.quiz.length > 0 && !quizDone && (
                  <a href="#quiz" className={buttonClass("soft", "md", "mt-4")}>
                    رفتن به آزمونک
                  </a>
                )}
              </div>
            ) : (
              <>
                <p className="text-body font-medium">درس را خواندی و مثال‌ها را دنبال کردی؟</p>
                <Button
                  variant="success"
                  onClick={complete}
                  loading={completeState === "saving"}
                  className="mt-3"
                  icon={<CircleCheck className="size-5" aria-hidden />}
                >
                  این درس را تمام کردم
                </Button>
                {completeState === "error" && (
                  <p role="alert" className="mt-2 text-body-sm text-danger-text">
                    ذخیره نشد. اتصال را بررسی کن و دوباره بزن.
                  </p>
                )}
              </>
            )}
          </section>

          <nav aria-label="درس قبل و بعد" className="mt-6 grid grid-cols-2 gap-3">
            {props.prev ? (
              <Link
                href={props.prev.href}
                className="flex min-h-16 flex-col justify-center rounded-card border border-border-subtle bg-surface p-3 shadow-card hover:border-border"
              >
                <span className="flex items-center gap-1 text-caption text-muted">
                  <ArrowRight className="size-3.5" aria-hidden />
                  درس قبل
                </span>
                <span className="mt-0.5 line-clamp-1 text-body-sm font-semibold">{props.prev.title}</span>
              </Link>
            ) : (
              <span />
            )}
            {props.next ? (
              <Link
                href={props.next.href}
                className="flex min-h-16 flex-col items-end justify-center rounded-card border border-border-subtle bg-surface p-3 text-end shadow-card hover:border-border"
              >
                <span className="flex items-center gap-1 text-caption text-muted">
                  درس بعد
                  <ArrowLeft className="size-3.5" aria-hidden />
                </span>
                <span className="mt-0.5 line-clamp-1 text-body-sm font-semibold">{props.next.title}</span>
              </Link>
            ) : (
              <Link
                href={`/learn/${props.bookSlug}`}
                className="flex min-h-16 flex-col items-end justify-center rounded-card border border-border-subtle bg-surface p-3 text-end shadow-card hover:border-border"
              >
                <span className="text-caption text-muted">پایان درس‌های آماده</span>
                <span className="mt-0.5 text-body-sm font-semibold">فهرست فصل‌ها</span>
              </Link>
            )}
          </nav>
        </main>
      </div>

      {!chatOpen && (
        <button
          type="button"
          onClick={() => setChatOpen(true)}
          className="fixed bottom-[calc(1.25rem+env(safe-area-inset-bottom))] left-4 z-30 flex min-h-13 items-center gap-2 rounded-full bg-secondary ps-4 pe-5 text-body font-semibold text-white shadow-raised transition-transform hover:-translate-y-0.5 sm:left-6 dark:text-[#0b1120]"
        >
          <Bot className="size-5.5" aria-hidden />
          از معلم بپرس
        </button>
      )}

      <TutorChat
        lessonKey={props.lessonKey}
        lessonTitle={props.title}
        live={props.tutorLive}
        open={chatOpen}
        onClose={closeChat}
        request={request}
      />
    </>
  );
}

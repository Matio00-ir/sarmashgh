"use client";
import { useState } from "react";
import { CircleCheck, CircleX, MessageCircleQuestion, RotateCcw } from "lucide-react";
import { Markdown } from "../Markdown";
import { Button } from "../ui/Button";
import { ProgressBar } from "../ui/ProgressBar";
import type { QuizQuestion } from "@/lib/lesson-format";
import { toFa } from "@/lib/fa";
import { cx } from "@/lib/cx";

const LETTERS = ["الف", "ب", "ج", "د", "هـ", "و"];

export function Quiz(props: {
  questions: QuizQuestion[];
  onFinish: (score: number, total: number) => void;
  onAsk: (prompt: string) => void;
}) {
  const { questions } = props;
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [answers, setAnswers] = useState<number[]>([]); // پاسخ ثبت‌شده‌ی هر سؤال
  const [finished, setFinished] = useState(false);

  if (questions.length === 0) return null;

  const q = questions[index];
  const checked = answers.length > index;
  const correct = checked && answers[index] === q.answer;
  const score = answers.filter((a, i) => a === questions[i].answer).length;

  function check() {
    if (picked === null) return;
    setAnswers([...answers, picked]);
  }

  function next() {
    if (index + 1 < questions.length) {
      setIndex(index + 1);
      setPicked(null);
    } else {
      setFinished(true);
      props.onFinish(score, questions.length);
    }
  }

  function restart() {
    setIndex(0);
    setPicked(null);
    setAnswers([]);
    setFinished(false);
  }

  function askAbout(i: number) {
    const qq = questions[i];
    props.onAsk(
      `در آزمونک این سؤال را غلط زدم:\n\n${qq.question}\n\nمن گزینه‌ی «${qq.options[answers[i]]}» را انتخاب کردم ولی جواب «${qq.options[qq.answer]}» بود. می‌شه توضیح بدی اشتباه فکرم کجا بوده؟`,
    );
  }

  if (finished) {
    const ratio = score / questions.length;
    const wrong = questions.map((_, i) => i).filter((i) => answers[i] !== questions[i].answer);
    return (
      <div className="animate-rise rounded-xl border border-border-subtle bg-surface p-5 shadow-card sm:p-6">
        <div className="text-center">
          <p className="text-body-sm text-muted">نتیجه‌ی آزمونک</p>
          <p className="mt-1 text-display font-bold">
            {toFa(score)} <span className="text-h3 font-medium text-muted">از {toFa(questions.length)}</span>
          </p>
          <p className="mx-auto mt-2 max-w-md text-body text-subtle">
            {ratio === 1
              ? "همه را درست جواب دادی؛ این درس خوب جا افتاده."
              : ratio >= 0.6
                ? "خوب پیش رفتی. سؤال‌هایی که درست نشد را یک بار دیگر مرور کن."
                : "این بار درست نشد؛ بیا ببینیم کجای راه رو می‌تونیم بهتر کنیم. توضیح هر سؤال پایین آمده."}
          </p>
          <ProgressBar value={ratio} label="درصد پاسخ درست" className="mx-auto mt-4 max-w-xs" />
        </div>

        <h3 className="mt-6 mb-2 text-h4 font-semibold">مرور پاسخ‌ها</h3>
        <ol className="space-y-2">
          {questions.map((qq, i) => {
            const ok = answers[i] === qq.answer;
            return (
              <li key={i}>
                <details className="group rounded-card border border-border-subtle bg-background">
                  <summary className="flex min-h-12 cursor-pointer list-none items-center gap-2 px-3 py-2 [&::-webkit-details-marker]:hidden">
                    {ok ? (
                      <CircleCheck className="size-5 shrink-0 text-success" aria-label="درست" />
                    ) : (
                      <CircleX className="size-5 shrink-0 text-danger" aria-label="نادرست" />
                    )}
                    <span className="text-body-sm font-medium">سؤال {toFa(i + 1)}</span>
                    <span className="ms-auto text-caption text-muted group-open:hidden">نمایش توضیح</span>
                  </summary>
                  <div className="space-y-2 border-t border-border-subtle px-3 py-3">
                    <Markdown text={qq.question} />
                    <p className="text-body-sm">
                      <span className="text-muted">پاسخ تو: </span>
                      <span className={ok ? "text-success-text" : "text-danger-text"}>{LETTERS[answers[i]]}</span>
                      <span className="text-muted"> · پاسخ درست: </span>
                      <span className="text-success-text">{LETTERS[qq.answer]}</span>
                    </p>
                    <Markdown text={qq.explanation} className="text-body-sm" />
                    {!ok && (
                      <Button variant="ghost" size="sm" onClick={() => askAbout(i)} className="-ms-2 text-secondary">
                        <MessageCircleQuestion className="size-4" aria-hidden />
                        از معلم بپرس
                      </Button>
                    )}
                  </div>
                </details>
              </li>
            );
          })}
        </ol>

        <div className="mt-5 flex flex-wrap gap-2">
          <Button variant="secondary" onClick={restart} icon={<RotateCcw className="size-4" aria-hidden />}>
            دوباره امتحان کن
          </Button>
          {wrong.length > 0 && (
            <Button variant="ghost" onClick={() => askAbout(wrong[0])} className="text-secondary">
              <MessageCircleQuestion className="size-4.5" aria-hidden />
              کمک برای سؤال‌های نادرست
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border-subtle bg-surface p-4 shadow-card sm:p-6">
      <div className="mb-4">
        <div className="mb-2 flex justify-between text-body-sm text-muted">
          <span>
            سؤال {toFa(index + 1)} از {toFa(questions.length)}
          </span>
          <span>{toFa(score)} پاسخ درست</span>
        </div>
        <ProgressBar value={(index + (checked ? 1 : 0)) / questions.length} label="پیشرفت آزمونک" />
      </div>

      <div key={index} className="animate-rise">
        <Markdown text={q.question} className="text-body-lg font-medium" />

        <div role="radiogroup" aria-label="گزینه‌ها" className="mt-4 space-y-2.5">
          {q.options.map((opt, i) => {
            const isAnswer = checked && i === q.answer;
            const isWrongPick = checked && i === answers[index] && !correct;
            const isPicked = !checked && picked === i;
            return (
              <button
                key={i}
                type="button"
                role="radio"
                aria-checked={checked ? i === answers[index] : picked === i}
                disabled={checked}
                onClick={() => setPicked(i)}
                className={cx(
                  "flex min-h-14 w-full items-center gap-3 rounded-card border-2 px-3 py-2 text-start transition-colors duration-150",
                  isAnswer && "border-success bg-success-bg",
                  isWrongPick && "border-danger bg-danger-bg",
                  isPicked && "border-primary bg-[color-mix(in_srgb,var(--brand-primary)_8%,transparent)]",
                  !isAnswer && !isWrongPick && !isPicked && "border-border-subtle hover:border-border",
                  checked && !isAnswer && !isWrongPick && "opacity-60",
                )}
              >
                <span
                  className={cx(
                    "grid size-8 shrink-0 place-items-center rounded-full text-caption font-semibold",
                    isPicked ? "bg-primary text-on-primary" : "bg-surface-secondary text-subtle",
                  )}
                >
                  {LETTERS[i]}
                </span>
                <Markdown text={opt} className="flex-1" />
                {isAnswer && <CircleCheck className="size-5.5 shrink-0 text-success" aria-label="پاسخ درست" />}
                {isWrongPick && <CircleX className="size-5.5 shrink-0 text-danger" aria-label="پاسخ تو، نادرست" />}
              </button>
            );
          })}
        </div>

        {checked && (
          <div
            role="status"
            className={cx("animate-rise mt-4 rounded-card p-4", correct ? "bg-success-bg" : "bg-danger-bg")}
          >
            <div
              className={cx(
                "mb-1.5 flex items-center gap-2 text-body font-semibold",
                correct ? "text-success-text" : "text-danger-text",
              )}
            >
              {correct ? <CircleCheck className="size-5" aria-hidden /> : <CircleX className="size-5" aria-hidden />}
              {correct ? "درسته!" : "این بار درست نشد؛ پاسخ درست مشخص شده."}
            </div>
            <Markdown text={q.explanation} />
            {!correct && (
              <Button variant="ghost" size="sm" onClick={() => askAbout(index)} className="mt-2 -ms-2 text-secondary">
                <MessageCircleQuestion className="size-4" aria-hidden />
                هنوز گنگه؟ از معلم بپرس
              </Button>
            )}
          </div>
        )}
      </div>

      {/* دکمه‌ی اصلی سمت راست (شروع خط)، تا زیر دکمه‌ی شناور «از معلم بپرس» نرود */}
      <div className="mt-5 flex">
        {checked ? (
          <Button onClick={next}>{index + 1 < questions.length ? "سؤال بعد" : "دیدن نتیجه"}</Button>
        ) : (
          <Button onClick={check} disabled={picked === null}>
            ثبت پاسخ
          </Button>
        )}
      </div>
    </div>
  );
}

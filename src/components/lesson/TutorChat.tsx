"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { Bot, Maximize2, Minimize2, RotateCw, SendHorizontal, Trash2, TriangleAlert, X } from "lucide-react";
import { Markdown } from "../Markdown";
import { toFa } from "@/lib/fa";
import { cx } from "@/lib/cx";

type Msg = { role: "user" | "assistant"; content: string; focus?: string };
export type ChatRequest = { text: string; focusSectionId?: string; focusTitle?: string; id: number };

const SUGGESTIONS = ["ساده‌تر توضیح بده", "یه مثال دیگه بزن", "مرحله‌به‌مرحله حل کن", "ازم سؤال بپرس ببینم یاد گرفتم یا نه"];

const storageKey = (lessonKey: string) => `sarmashgh-chat:${lessonKey}`;

// تاریخچه‌ی گفتگوی هر درس فقط در مرورگر همین دستگاه نگه داشته می‌شود
function loadHistory(lessonKey: string): Msg[] {
  try {
    const raw = localStorage.getItem(storageKey(lessonKey));
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((m) => m?.content) : [];
  } catch {
    return [];
  }
}

function saveHistory(lessonKey: string, messages: Msg[]) {
  try {
    if (messages.length) localStorage.setItem(storageKey(lessonKey), JSON.stringify(messages.slice(-30)));
    else localStorage.removeItem(storageKey(lessonKey));
  } catch {
    // ذخیره‌سازی در دسترس نیست
  }
}

export function TutorChat(props: {
  lessonKey: string;
  lessonTitle: string;
  live: boolean;
  open: boolean;
  onClose: () => void;
  request: ChatRequest | null;
}) {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<{ text: string; retry?: { content: string; focusSectionId?: string; focus?: string } }>();
  const [remaining, setRemaining] = useState<number | null>(null);
  const [expanded, setExpanded] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const queue = useRef<ChatRequest[]>([]);
  const handled = useRef<number | null>(null);

  useEffect(() => setMessages(loadHistory(props.lessonKey)), [props.lessonKey]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, props.open, busy]);

  useEffect(() => {
    if (!props.open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && props.onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [props.open, props.onClose]);

  const send = useCallback(
    async (text: string, focusSectionId?: string, focus?: string, base?: Msg[]) => {
      const content = text.trim();
      if (!content) return;
      setError(undefined);
      setInput("");
      const history: Msg[] = [...(base ?? messages), { role: "user", content, focus }];
      setMessages(history);
      setBusy(true);
      let answer = "";
      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            lessonKey: props.lessonKey,
            messages: history.map(({ role, content }) => ({ role, content })),
            focusSectionId,
          }),
        });
        if (!res.ok || !res.body) {
          const data = await res.json().catch(() => ({}));
          // سقف روزانه قابل تلاش دوباره نیست
          setError({ text: data.error ?? "پاسخ دریافت نشد.", retry: res.status === 429 ? undefined : { content, focusSectionId, focus } });
          setMessages(history.slice(0, -1));
          return;
        }
        const rem = res.headers.get("X-Remaining");
        if (rem) setRemaining(Number(rem));
        const reader = res.body.getReader();
        const dec = new TextDecoder();
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          answer += dec.decode(value, { stream: true });
          setMessages([...history, { role: "assistant", content: answer }]);
        }
        saveHistory(props.lessonKey, [...history, { role: "assistant", content: answer }]);
      } catch {
        setError({ text: "اتصال برقرار نشد. اینترنتت را بررسی کن.", retry: { content, focusSectionId, focus } });
        if (!answer) setMessages(history.slice(0, -1));
      } finally {
        setBusy(false);
      }
    },
    [messages, props.lessonKey],
  );

  // درخواست‌هایی که از دکمه‌های «نفهمیدم» یا آزمونک می‌آیند؛ اگر در حال پاسخ باشد، در صف می‌مانند
  useEffect(() => {
    const r = props.request;
    if (r && r.id !== handled.current) {
      handled.current = r.id;
      queue.current.push(r);
    }
    if (!busy && queue.current.length) {
      const next = queue.current.shift()!;
      send(next.text, next.focusSectionId, next.focusTitle);
    }
  }, [props.request, busy, send]);

  useEffect(() => {
    if (props.open && !props.request) inputRef.current?.focus({ preventScroll: true });
  }, [props.open, props.request]);

  function clear() {
    setMessages([]);
    setError(undefined);
    saveHistory(props.lessonKey, []);
  }

  const waiting = busy && messages.at(-1)?.role === "user";

  return (
    <>
      {/* پس‌زمینه‌ی تیره فقط در موبایل/تبلت؛ در دسکتاپ پنل کنار درس است */}
      <div
        onClick={props.onClose}
        aria-hidden
        className={cx(
          "fixed inset-0 z-40 bg-black/40 transition-opacity duration-300 lg:hidden",
          props.open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      />
      <aside
        role="dialog"
        aria-label="معلم هوشمند"
        aria-hidden={!props.open}
        inert={!props.open}
        className={cx(
          "fixed z-50 flex flex-col bg-surface shadow-modal transition-[transform,height] duration-300 ease-standard",
          // موبایل: برگه‌ی پایین صفحه، قابل گسترش تا تمام صفحه
          "inset-x-0 bottom-0 rounded-t-xl",
          expanded ? "h-dvh rounded-t-none" : "h-[78dvh]",
          // دسکتاپ: پنل کنار درس (سمت چپ در راست‌به‌چپ)
          "lg:inset-y-0 lg:right-auto lg:left-0 lg:h-dvh lg:w-[26rem] lg:rounded-none lg:border-e lg:border-border-subtle lg:shadow-raised",
          props.open ? "translate-y-0 lg:translate-x-0" : "translate-y-full lg:translate-y-0 lg:-translate-x-full",
        )}
      >
        <div className="flex justify-center pt-2 lg:hidden" aria-hidden>
          <span className="h-1.5 w-10 rounded-full bg-border" />
        </div>
        <header className="flex items-center gap-3 border-b border-border-subtle px-4 py-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-full bg-secondary-soft text-secondary">
            <Bot className="size-5.5" aria-hidden />
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="text-body font-semibold">معلم هوشمند</h2>
            <p className="truncate text-caption text-muted">درباره‌ی «{props.lessonTitle}»</p>
          </div>
          {messages.length > 0 && (
            <IconButton label="پاک کردن گفتگو" onClick={clear} disabled={busy}>
              <Trash2 className="size-4.5" />
            </IconButton>
          )}
          <IconButton label={expanded ? "کوچک کردن" : "تمام صفحه"} onClick={() => setExpanded((v) => !v)} className="lg:hidden">
            {expanded ? <Minimize2 className="size-4.5" /> : <Maximize2 className="size-4.5" />}
          </IconButton>
          <IconButton label="بستن" onClick={props.onClose}>
            <X className="size-5" />
          </IconButton>
        </header>

        {!props.live && (
          <p className="flex gap-2 border-b border-warning-bg bg-warning-bg px-4 py-2 text-caption leading-5 text-warning-text">
            <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
            حالت نمایشی: دستیار هنوز به سرویس هوش مصنوعی وصل نشده و پاسخ‌ها ثابت و غیرواقعی‌اند.
          </p>
        )}

        <div ref={listRef} className="scroll-thin flex-1 space-y-4 overflow-y-auto px-4 py-4" aria-live="polite">
          {messages.length === 0 && !busy && (
            <div className="py-6 text-center">
              <span className="mx-auto grid size-14 place-items-center rounded-full bg-secondary-soft text-secondary">
                <Bot className="size-7" aria-hidden />
              </span>
              <p className="mt-3 text-body font-semibold">اشکالی نداره؛ بگو کدوم قسمت برات گنگه.</p>
              <p className="mx-auto mt-1 max-w-xs text-body-sm text-muted">
                جواب‌ها بر اساس همین درس و کتاب درسی است. زیر هر بخش هم دکمه‌ی «این قسمت رو نفهمیدم» هست.
              </p>
            </div>
          )}

          {messages.map((m, i) =>
            m.role === "user" ? (
              <div key={i} className="ms-auto max-w-[88%]">
                {m.focus && (
                  <p className="mb-1 text-end text-caption text-muted">درباره‌ی بخش «{m.focus}»</p>
                )}
                <div className="whitespace-pre-wrap rounded-xl rounded-ee-sm bg-primary px-4 py-2.5 text-body-sm leading-7 text-on-primary">
                  {m.content}
                </div>
              </div>
            ) : (
              <div key={i} className="flex gap-2.5">
                <span className="mt-1 grid size-7 shrink-0 place-items-center rounded-full bg-secondary-soft text-secondary">
                  <Bot className="size-4" aria-hidden />
                </span>
                <div className="min-w-0 flex-1 rounded-xl rounded-es-sm bg-surface-secondary px-4 py-3 text-body-sm">
                  <Markdown text={m.content} />
                </div>
              </div>
            ),
          )}

          {waiting && (
            <div className="flex items-center gap-2.5 text-body-sm text-muted" role="status">
              <span className="grid size-7 place-items-center rounded-full bg-secondary-soft text-secondary">
                <Bot className="size-4" aria-hidden />
              </span>
              دارم توضیح می‌دم
              <span className="flex gap-1" aria-hidden>
                <span className="typing-dot size-1.5 rounded-full bg-current" />
                <span className="typing-dot size-1.5 rounded-full bg-current [animation-delay:150ms]" />
                <span className="typing-dot size-1.5 rounded-full bg-current [animation-delay:300ms]" />
              </span>
            </div>
          )}

          {error && (
            <div role="alert" className="rounded-card bg-danger-bg p-3 text-body-sm text-danger-text">
              <p>{error.text}</p>
              {error.retry && (
                <button
                  type="button"
                  onClick={() => send(error.retry!.content, error.retry!.focusSectionId, error.retry!.focus)}
                  className="mt-2 inline-flex min-h-10 items-center gap-1.5 rounded-md bg-surface px-3 font-semibold text-foreground"
                >
                  <RotateCw className="size-4" aria-hidden />
                  تلاش دوباره
                </button>
              )}
            </div>
          )}
        </div>

        <div className="border-t border-border-subtle p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
          <div className="scroll-thin -mx-3 mb-2 flex gap-2 overflow-x-auto px-3 pb-1">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                type="button"
                disabled={busy}
                onClick={() => send(s)}
                className="min-h-9 shrink-0 rounded-full border border-border px-3 text-caption font-medium text-subtle transition-colors hover:border-secondary hover:text-secondary disabled:opacity-50"
              >
                {s}
              </button>
            ))}
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!busy) send(input);
            }}
            className="flex items-end gap-2"
          >
            <label htmlFor="tutor-input" className="sr-only">
              سؤالت را بنویس
            </label>
            <textarea
              id="tutor-input"
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  if (!busy) send(input);
                }
              }}
              rows={1}
              maxLength={2000}
              placeholder="سؤالت را بنویس…"
              className="max-h-32 min-h-11 flex-1 resize-none rounded-card border border-border bg-background px-3.5 py-2.5 text-body-sm outline-none transition-colors focus:border-primary"
            />
            <button
              type="submit"
              disabled={busy || !input.trim()}
              aria-label="فرستادن"
              className="grid size-11 shrink-0 place-items-center rounded-card bg-primary text-on-primary transition-colors hover:bg-primary-hover disabled:opacity-40"
            >
              <SendHorizontal className="size-5 -scale-x-100" aria-hidden />
            </button>
          </form>
          {remaining !== null && (
            <p className="mt-1.5 text-caption text-muted">{toFa(remaining)} سؤال دیگر برای امروز باقی مانده</p>
          )}
        </div>
      </aside>
    </>
  );
}

function IconButton({
  label,
  className,
  children,
  ...rest
}: { label: string } & React.ComponentProps<"button">) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={cx(
        "grid size-11 shrink-0 place-items-center rounded-full text-muted transition-colors hover:bg-surface-secondary hover:text-foreground disabled:opacity-40",
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}

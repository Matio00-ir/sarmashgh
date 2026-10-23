import Link from "next/link";
import { notFound } from "next/navigation";
import { Check, ChevronDown, ChevronLeft } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { SubjectIcon, subjectColor } from "@/components/SubjectIcon";
import { Badge, SoonBadge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { buttonClass } from "@/components/ui/Button";
import { requireStudent } from "@/lib/auth";
import { GRADE_TITLES, STREAMS, getBook, lessonKey } from "@/lib/catalog";
import { availableLessonKeys } from "@/lib/content";
import { bookProgress, getProgress } from "@/lib/progress";
import { toFa } from "@/lib/fa";

export async function generateMetadata({ params }: { params: Promise<{ book: string }> }) {
  const { track } = await requireStudent();
  return { title: getBook(track, (await params).book)?.title ?? "کتاب" };
}

export default async function BookPage({ params }: { params: Promise<{ book: string }> }) {
  const { book: slug } = await params;
  const { user, track } = await requireStudent();
  const book = getBook(track, slug);
  if (!book) notFound();

  const available = await availableLessonKeys(track.id);
  const { byKey } = await getProgress(user.id);
  const p = bookProgress(book, available, byKey);
  const color = subjectColor(book.subject);

  return (
    <AppShell name={user.name!}>
      <main className="mx-auto max-w-3xl px-4 py-6">
        <nav aria-label="مسیر" className="text-body-sm text-muted">
          <ol className="flex flex-wrap items-center gap-1">
            <li>
              <Link href="/learn/books" className="hover:text-foreground">
                {GRADE_TITLES[track.grade]}
                {track.stream ? ` · ${STREAMS[track.stream]}` : ""}
              </Link>
            </li>
            <li aria-hidden>
              <ChevronLeft className="size-4" />
            </li>
            <li aria-current="page" className="font-medium text-foreground">
              {book.title}
            </li>
          </ol>
        </nav>

        <header
          className="mt-3 rounded-xl border p-5 sm:p-6"
          style={{
            borderColor: `color-mix(in srgb, ${color} 30%, transparent)`,
            background: `color-mix(in srgb, ${color} 7%, var(--surface))`,
          }}
        >
          <div className="flex items-start gap-4">
            <SubjectIcon book={book} size="lg" />
            <div className="min-w-0">
              <h1 className="text-h1 font-bold">{book.title}</h1>
              <p className="mt-1 text-body text-subtle">{book.description}</p>
            </div>
          </div>
          {p.ready > 0 && (
            <div className="mt-5">
              <div className="mb-1.5 flex justify-between text-body-sm text-subtle">
                <span>پیشرفت کتاب</span>
                <span>
                  {toFa(p.done)} از {toFa(p.ready)} درسِ آماده
                </span>
              </div>
              <ProgressBar value={p.ratio} color={color} label={`پیشرفت ${book.title}`} />
            </div>
          )}
        </header>

        {book.chapters.length === 0 && (
          <div className="mt-6 rounded-card border border-dashed border-border bg-surface p-8 text-center">
            <SoonBadge />
            <p className="mt-3 text-body text-subtle">فهرست و محتوای این کتاب در حال آماده‌سازی است.</p>
          </div>
        )}

        <ol className="mt-6 space-y-3">
          {book.chapters.map((c, ci) => {
            const keys = c.lessons.map((x) => lessonKey(book.slug, c.slug, x.slug));
            const ready = keys.filter((k) => available.has(k));
            const done = ready.filter((k) => byKey.get(k)?.completedAt);
            const hasContent = ready.length > 0;
            return (
              <li key={c.slug}>
                <details
                  open={hasContent}
                  className="group overflow-hidden rounded-card border border-border-subtle bg-surface shadow-card"
                >
                  <summary className="flex min-h-16 cursor-pointer list-none items-center gap-3 p-4 [&::-webkit-details-marker]:hidden">
                    <span
                      className="grid size-10 shrink-0 place-items-center rounded-md text-body font-bold"
                      style={{ background: `color-mix(in srgb, ${color} 12%, transparent)`, color }}
                    >
                      {toFa(ci + 1)}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-caption text-muted">فصل {toFa(ci + 1)}</span>
                      <span className="block text-h4 font-semibold">{c.title}</span>
                    </span>
                    {hasContent ? (
                      <span className="text-caption text-muted">
                        {toFa(done.length)}/{toFa(ready.length)}
                      </span>
                    ) : (
                      <SoonBadge />
                    )}
                    <ChevronDown
                      className="size-5 shrink-0 text-muted transition-transform duration-200 group-open:rotate-180"
                      aria-hidden
                    />
                  </summary>

                  {c.lessons.length > 0 ? (
                    <ul className="divide-y divide-border-subtle border-t border-border-subtle">
                      {c.lessons.map((x, li) => {
                        const key = keys[li];
                        const has = available.has(key);
                        const row = byKey.get(key);
                        const completed = Boolean(row?.completedAt);
                        return (
                          <li key={x.slug} className="flex min-h-16 items-center gap-3 px-4 py-2.5">
                            <span
                              className={
                                completed
                                  ? "grid size-8 shrink-0 place-items-center rounded-full bg-success text-white dark:text-[#0b1120]"
                                  : "grid size-8 shrink-0 place-items-center rounded-full bg-surface-secondary text-caption font-semibold text-muted"
                              }
                            >
                              {completed ? <Check className="size-4" aria-label="تمام‌شده" /> : toFa(li + 1)}
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className={has ? "block text-body" : "block text-body text-muted"}>{x.title}</span>
                              {row?.quizTotal != null && (
                                <span className="block text-caption text-muted">
                                  آزمونک: {toFa(row.quizScore ?? 0)} از {toFa(row.quizTotal)}
                                </span>
                              )}
                            </span>
                            {has ? (
                              <Link
                                href={`/learn/${key}`}
                                aria-label={`${completed ? "مرور" : row ? "ادامه" : "شروع"} درس ${x.title}`}
                                className={buttonClass(completed ? "secondary" : row ? "soft" : "primary", "sm", "shrink-0")}
                              >
                                {completed ? "مرور" : row ? "ادامه" : "شروع"}
                              </Link>
                            ) : (
                              <SoonBadge />
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  ) : (
                    <p className="border-t border-border-subtle px-4 py-4 text-body-sm text-muted">
                      فهرست درس‌های این فصل به‌زودی اضافه می‌شود.
                    </p>
                  )}
                </details>
              </li>
            );
          })}
        </ol>

        {p.ready > 0 && p.done === p.ready && (
          <p className="mt-6 text-center">
            <Badge tone="success" icon={<Check className="size-3.5" aria-hidden />}>
              همه‌ی درس‌های آماده‌ی این کتاب را تمام کرده‌ای
            </Badge>
          </p>
        )}
      </main>
    </AppShell>
  );
}

import Link from "next/link";
import { ArrowLeft, Clock3, RotateCcw } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { BookCard } from "@/components/BookCard";
import { SubjectIcon, subjectColor } from "@/components/SubjectIcon";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { requireStudent } from "@/lib/auth";
import { trackTitle } from "@/lib/catalog";
import { availableLessonKeys } from "@/lib/content";
import { bookProgress, getProgress, lessonActivity, needsReview } from "@/lib/progress";
import { toFa } from "@/lib/fa";

export const metadata = { title: "خانه" };

export default async function LearnPage() {
  const { user, track } = await requireStudent();
  const available = await availableLessonKeys(track.id);
  const { rows, byKey } = await getProgress(user.id);
  const activity = lessonActivity(track, rows).filter((a) => available.has(a.key));

  const resume = activity.find((a) => !a.row.completedAt) ?? activity[0];
  const recent = activity.filter((a) => a !== resume).slice(0, 3);
  const review = activity.filter((a) => needsReview(a.row)).slice(0, 3);
  const mainBooks = track.books.filter((b) => b.kind === "main");
  const firstBook = mainBooks.find((b) => bookProgress(b, available, byKey).ready > 0);

  return (
    <AppShell name={user.name!}>
      <main className="mx-auto max-w-5xl space-y-8 px-4 py-6">
        <section>
          <p className="text-body-sm text-muted">{trackTitle(track)}</p>
          <h1 className="mt-1 text-h1 font-bold">سلام {user.name}!</h1>
          <p className="mt-1 text-body text-subtle">
            {resume
              ? "لازم نیست همه‌چیز رو یک‌جا یاد بگیری؛ از همین قدم بعدی شروع کن."
              : "بیا اولین مبحث رو از پایه با هم یاد بگیریم."}
          </p>
        </section>

        {/* کارت ادامه‌ی یادگیری */}
        {resume ? (
          <Link
            href={`/learn/${resume.key}`}
            className="group relative block overflow-hidden rounded-xl bg-primary p-5 text-on-primary shadow-raised sm:p-6"
          >
            <div
              aria-hidden
              className="pointer-events-none absolute -top-16 -left-16 size-56 rounded-full bg-white/10 dark:bg-black/10"
            />
            <div className="relative">
              <Badge className="bg-white/18 text-inherit dark:bg-black/15">
                {resume.row.completedAt ? "مرور آخرین درس" : "ادامه‌ی یادگیری"}
              </Badge>
              <p className="mt-3 text-body-sm opacity-85">
                {resume.book.title} · فصل {toFa(resume.chapterIndex + 1)}: {resume.chapter.title}
              </p>
              <h2 className="mt-1 text-h3 font-bold">
                درس {toFa(resume.lessonIndex + 1)}: {resume.lesson.title}
              </h2>
              <span className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-md bg-white px-4 text-label font-semibold text-[#2548ce] transition-transform group-hover:-translate-x-0.5 dark:bg-[#0b1120] dark:text-[#a5b8ff]">
                {resume.row.completedAt ? "مرور درس" : "ادامه بده"}
                <ArrowLeft className="size-4" aria-hidden />
              </span>
            </div>
          </Link>
        ) : (
          firstBook && (
            <div className="rounded-xl border border-border-subtle bg-surface p-5 shadow-card sm:p-6">
              <div className="flex items-start gap-4">
                <SubjectIcon book={firstBook} size="lg" />
                <div className="min-w-0">
                  <p className="text-body-sm text-muted">پیشنهاد شروع</p>
                  <h2 className="mt-0.5 text-h3 font-bold">
                    {firstBook.title} · فصل ۱: {firstBook.chapters[0].title}
                  </h2>
                  <p className="mt-1 text-body-sm text-subtle">
                    از درس اول شروع کن؛ هر درس با یک مثال ساده از زندگی شروع می‌شود.
                  </p>
                </div>
              </div>
              <ButtonLink
                href={`/learn/${firstBook.slug}/${firstBook.chapters[0].slug}/${firstBook.chapters[0].lessons[0].slug}`}
                className="mt-4 w-full sm:w-auto"
              >
                شروع یادگیری
              </ButtonLink>
            </div>
          )
        )}

        {(recent.length > 0 || review.length > 0) && (
          <div className="grid gap-4 md:grid-cols-2">
            {recent.length > 0 && (
              <section aria-labelledby="recent-title" className="rounded-card border border-border-subtle bg-surface p-4 shadow-card">
                <h2 id="recent-title" className="mb-2 flex items-center gap-2 text-h4 font-semibold">
                  <Clock3 className="size-4.5 text-muted" aria-hidden />
                  درس‌های اخیر
                </h2>
                <ActivityList items={recent} />
              </section>
            )}
            {review.length > 0 && (
              <section aria-labelledby="review-title" className="rounded-card border border-border-subtle bg-surface p-4 shadow-card">
                <h2 id="review-title" className="mb-1 flex items-center gap-2 text-h4 font-semibold">
                  <RotateCcw className="size-4.5 text-muted" aria-hidden />
                  پیشنهاد مرور
                </h2>
                <p className="mb-2 text-body-sm text-muted">در آزمونک این درس‌ها جای تمرین بیشتر هست.</p>
                <ActivityList items={review} showScore />
              </section>
            )}
          </div>
        )}

        <section aria-labelledby="books-title">
          <div className="mb-3 flex items-end justify-between">
            <h2 id="books-title" className="text-h3 font-bold">
              کتاب‌های من
            </h2>
            <Link href="/learn/books" className="min-h-11 content-center text-label font-medium text-link">
              همه‌ی کتاب‌ها
            </Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {mainBooks.map((b) => (
              <BookCard key={b.slug} book={b} progress={bookProgress(b, available, byKey)} />
            ))}
          </div>
        </section>
      </main>
    </AppShell>
  );
}

function ActivityList({
  items,
  showScore,
}: {
  items: ReturnType<typeof lessonActivity>;
  showScore?: boolean;
}) {
  return (
    <ul className="divide-y divide-border-subtle">
      {items.map((a) => (
        <li key={a.key}>
          <Link href={`/learn/${a.key}`} className="flex min-h-14 items-center gap-3 py-2 hover:text-primary">
            <span
              aria-hidden
              className="h-9 w-1 shrink-0 rounded-full"
              style={{ background: subjectColor(a.book.subject) }}
            />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-body font-medium">{a.lesson.title}</span>
              <span className="block truncate text-caption text-muted">
                {a.book.title} · فصل {toFa(a.chapterIndex + 1)}
              </span>
            </span>
            {showScore && a.row.quizTotal != null ? (
              <Badge tone="warning">
                {toFa(a.row.quizScore ?? 0)} از {toFa(a.row.quizTotal)}
              </Badge>
            ) : a.row.completedAt ? (
              <Badge tone="success">تمام‌شده</Badge>
            ) : null}
          </Link>
        </li>
      ))}
    </ul>
  );
}

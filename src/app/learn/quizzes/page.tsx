import Link from "next/link";
import { ClipboardCheck } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { SubjectIcon } from "@/components/SubjectIcon";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink, buttonClass } from "@/components/ui/Button";
import { requireStudent } from "@/lib/auth";
import { flatLessons } from "@/lib/catalog";
import { availableLessonKeys, loadLesson } from "@/lib/content";
import { getProgress, needsReview } from "@/lib/progress";
import { toFa } from "@/lib/fa";

export const metadata = { title: "آزمون‌ها" };

export default async function QuizzesPage() {
  const { user, track } = await requireStudent();
  const available = await availableLessonKeys(track.id);
  const { byKey } = await getProgress(user.id);

  const groups = await Promise.all(
    track.books.map(async (book) => {
      const items = await Promise.all(
        flatLessons(book)
          .filter((x) => available.has(x.key))
          .map(async (x) => ({ ...x, count: (await loadLesson(track.id, x.key))?.quiz.length ?? 0 })),
      );
      return { book, items: items.filter((x) => x.count > 0) };
    }),
  );
  const nonEmpty = groups.filter((g) => g.items.length > 0);
  const taken = nonEmpty.flatMap((g) => g.items).filter((x) => byKey.get(x.key)?.quizTotal != null);

  return (
    <AppShell name={user.name!}>
      <main className="mx-auto max-w-3xl space-y-6 px-4 py-6">
        <div>
          <h1 className="text-h1 font-bold">آزمون‌ها</h1>
          <p className="mt-1 text-body text-subtle">
            آزمونک آخر هر درس. تا حالا {toFa(taken.length)} آزمونک را زده‌ای.
          </p>
        </div>

        {nonEmpty.length === 0 && (
          <div className="rounded-card border border-dashed border-border bg-surface p-8 text-center">
            <ClipboardCheck className="mx-auto size-8 text-muted" aria-hidden />
            <p className="mt-3 text-body text-subtle">هنوز آزمونکی آماده نشده است.</p>
            <ButtonLink href="/learn/books" variant="secondary" className="mt-4">
              رفتن به کتاب‌ها
            </ButtonLink>
          </div>
        )}

        {nonEmpty.map(({ book, items }) => (
          <section
            key={book.slug}
            aria-label={book.title}
            className="rounded-card border border-border-subtle bg-surface shadow-card"
          >
            <h2 className="flex items-center gap-3 p-4 text-h4 font-semibold">
              <SubjectIcon book={book} />
              {book.title}
            </h2>
            <ul className="divide-y divide-border-subtle border-t border-border-subtle">
              {items.map((x) => {
                const row = byKey.get(x.key);
                const tookIt = row?.quizTotal != null;
                return (
                  <li key={x.key} className="flex min-h-16 items-center gap-3 px-4 py-2.5">
                    <span className="min-w-0 flex-1">
                      <span className="block text-body">{x.lesson.title}</span>
                      <span className="block text-caption text-muted">
                        {x.chapter.title} · {toFa(x.count)} سؤال
                      </span>
                    </span>
                    {tookIt && (
                      <Badge tone={needsReview(row!) ? "warning" : "success"}>
                        {toFa(row!.quizScore ?? 0)} از {toFa(row!.quizTotal!)}
                      </Badge>
                    )}
                    <Link
                      href={`/learn/${x.key}#quiz`}
                      className={buttonClass(tookIt ? "secondary" : "primary", "sm", "shrink-0")}
                    >
                      {tookIt ? "دوباره" : "شروع"}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </main>
    </AppShell>
  );
}

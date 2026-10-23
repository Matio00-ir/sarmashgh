import { AppShell } from "@/components/AppShell";
import { BookCard } from "@/components/BookCard";
import { requireStudent } from "@/lib/auth";
import { trackTitle } from "@/lib/catalog";
import { availableLessonKeys } from "@/lib/content";
import { bookProgress, getProgress } from "@/lib/progress";

export const metadata = { title: "کتاب‌ها" };

export default async function BooksPage() {
  const { user, track } = await requireStudent();
  const available = await availableLessonKeys(track.id);
  const { byKey } = await getProgress(user.id);

  const groups = [
    { title: "دروس اختصاصی", books: track.books.filter((b) => b.kind === "main") },
    { title: "دروس عمومی", books: track.books.filter((b) => b.kind === "general") },
  ];

  return (
    <AppShell name={user.name!}>
      <main className="mx-auto max-w-5xl space-y-8 px-4 py-6">
        <div>
          <p className="text-body-sm text-muted">{trackTitle(track)}</p>
          <h1 className="mt-1 text-h1 font-bold">کتاب‌ها</h1>
        </div>
        {groups.map((g) => (
          <section key={g.title} aria-label={g.title}>
            <h2 className="mb-3 text-h3 font-bold">{g.title}</h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {g.books.map((b) => (
                <BookCard key={b.slug} book={b} progress={bookProgress(b, available, byKey)} />
              ))}
            </div>
          </section>
        ))}
      </main>
    </AppShell>
  );
}

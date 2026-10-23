import { db } from "./db";
import { flatLessons, type Book, type Chapter, type LessonRef, type Track } from "./catalog";

export type ProgressRow = {
  lessonKey: string;
  completedAt: Date | null;
  quizScore: number | null;
  quizTotal: number | null;
  lastVisitedAt: Date;
};

export async function getProgress(userId: string) {
  const rows: ProgressRow[] = await db.lessonProgress.findMany({
    where: { userId },
    orderBy: { lastVisitedAt: "desc" },
  });
  return { rows, byKey: new Map(rows.map((r) => [r.lessonKey, r])) };
}

/** نسبت درس‌های تمام‌شده به درس‌هایی که محتوایشان آماده است */
export function bookProgress(book: Book, available: Set<string>, byKey: Map<string, ProgressRow>) {
  const ready = flatLessons(book).filter((x) => available.has(x.key));
  const done = ready.filter((x) => byKey.get(x.key)?.completedAt).length;
  return { ready: ready.length, done, ratio: ready.length ? done / ready.length : 0 };
}

export type LessonActivity = {
  key: string;
  book: Book;
  chapter: Chapter;
  chapterIndex: number;
  lesson: LessonRef;
  lessonIndex: number;
  row: ProgressRow;
};

/** ردیف‌های پیشرفت را به درس‌های واقعی فهرست کتاب وصل می‌کند (جدیدترین اول) */
export function lessonActivity(track: Track, rows: ProgressRow[]): LessonActivity[] {
  const out: LessonActivity[] = [];
  for (const row of rows) {
    const [bookSlug, chapterSlug, lessonSlug] = row.lessonKey.split("/");
    const book = track.books.find((b) => b.slug === bookSlug);
    const chapterIndex = book?.chapters.findIndex((c) => c.slug === chapterSlug) ?? -1;
    if (!book || chapterIndex < 0) continue;
    const chapter = book.chapters[chapterIndex];
    const lessonIndex = chapter.lessons.findIndex((x) => x.slug === lessonSlug);
    if (lessonIndex < 0) continue;
    out.push({ key: row.lessonKey, book, chapter, chapterIndex, lesson: chapter.lessons[lessonIndex], lessonIndex, row });
  }
  return out;
}

/** آزمونکی که کمتر از ۶۰٪ آن درست بوده، برای مرور پیشنهاد می‌شود */
export function needsReview(row: ProgressRow) {
  return row.quizTotal != null && (row.quizScore ?? 0) / row.quizTotal < 0.6;
}

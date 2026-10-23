import { notFound } from "next/navigation";
import { requireStudent } from "@/lib/auth";
import { flatLessons, locateLesson } from "@/lib/catalog";
import { availableLessonKeys, loadLesson } from "@/lib/content";
import { db } from "@/lib/db";
import { tutorConfigured } from "@/lib/tutor";
import { LessonView } from "@/components/lesson/LessonView";

type Params = { book: string; chapter: string; lesson: string };

export async function generateMetadata({ params }: { params: Promise<Params> }) {
  const { book, chapter, lesson } = await params;
  const { track } = await requireStudent();
  const loc = locateLesson(track, book, chapter, lesson);
  return { title: loc ? `${loc.lesson.title} · ${loc.book.title}` : "درس" };
}

export default async function LessonPage({ params }: { params: Promise<Params> }) {
  const { book, chapter, lesson } = await params;
  const { user, track } = await requireStudent();
  const loc = locateLesson(track, book, chapter, lesson);
  if (!loc) notFound();
  const content = await loadLesson(track.id, loc.key);
  if (!content) notFound();

  const available = await availableLessonKeys(track.id);
  const all = flatLessons(loc.book).filter((x) => available.has(x.key));
  const i = all.findIndex((x) => x.key === loc.key);
  const nav = (x?: (typeof all)[number]) => x && { href: `/learn/${x.key}`, title: x.lesson.title };

  const progress = await db.lessonProgress.findUnique({
    where: { userId_lessonKey: { userId: user.id, lessonKey: loc.key } },
  });

  return (
    <LessonView
      lessonKey={loc.key}
      bookSlug={loc.book.slug}
      bookTitle={loc.book.title}
      subject={loc.book.subject}
      tutorLive={tutorConfigured()}
      chapterNumber={loc.chapterIndex + 1}
      chapterTitle={loc.chapter.title}
      lessonNumber={loc.lessonIndex + 1}
      title={loc.lesson.title}
      meta={content.meta}
      intro={content.intro}
      sections={content.sections}
      quiz={content.quiz}
      prev={nav(all[i - 1])}
      next={nav(all[i + 1])}
      initiallyCompleted={Boolean(progress?.completedAt)}
    />
  );
}

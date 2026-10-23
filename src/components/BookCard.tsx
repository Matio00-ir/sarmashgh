import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import type { Book } from "@/lib/catalog";
import { toFa } from "@/lib/fa";
import { SubjectIcon, subjectColor } from "./SubjectIcon";
import { ProgressBar } from "./ui/ProgressBar";
import { SoonBadge } from "./ui/Badge";

export function BookCard({ book, progress }: { book: Book; progress: { ready: number; done: number; ratio: number } }) {
  const hasContent = progress.ready > 0;
  return (
    <Link
      href={`/learn/${book.slug}`}
      className="group flex flex-col gap-3 rounded-card border border-border-subtle bg-surface p-4 shadow-card transition-[box-shadow,border-color] duration-200 hover:border-border hover:shadow-raised"
    >
      <div className="flex items-start gap-3">
        <SubjectIcon book={book} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-h4 font-semibold">{book.title}</h3>
            {!hasContent && <SoonBadge />}
          </div>
          <p className="mt-0.5 line-clamp-2 text-body-sm leading-6 text-muted">{book.description}</p>
        </div>
        <ChevronLeft
          className="mt-1 size-5 shrink-0 text-muted transition-transform group-hover:-translate-x-0.5"
          aria-hidden
        />
      </div>
      {hasContent && (
        <div>
          <div className="mb-1.5 flex justify-between text-caption text-muted">
            <span>پیشرفت</span>
            <span>
              {toFa(progress.done)} از {toFa(progress.ready)} درس
            </span>
          </div>
          <ProgressBar value={progress.ratio} color={subjectColor(book.subject)} label={`پیشرفت ${book.title}`} />
        </div>
      )}
    </Link>
  );
}

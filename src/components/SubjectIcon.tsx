import {
  Atom,
  BookOpenText,
  ChartColumn,
  FlaskConical,
  Languages,
  Mountain,
  PenLine,
  Sigma,
  Sparkles,
  Triangle,
  type LucideIcon,
} from "lucide-react";
import type { Book, Subject } from "@/lib/catalog";
import { cx } from "@/lib/cx";

const BY_SUBJECT: Record<Subject, LucideIcon> = {
  calculus: Sigma,
  geometry: Triangle,
  statistics: ChartColumn,
  physics: Atom,
  chemistry: FlaskConical,
  general: BookOpenText,
};

// کتاب‌های عمومی آیکون اختصاصی خودشان را دارند
const BY_BOOK: Record<string, LucideIcon> = {
  "negaresh-2": PenLine,
  "arabi-2": Languages,
  "zaban-2": Languages,
  "dini-2": Sparkles,
  zaminshenasi: Mountain,
};

export function subjectColor(subject: Subject) {
  return `var(--subject-${subject})`;
}

/** کاشی آیکون کتاب با رنگ موضوعی */
export function SubjectIcon({ book, size = "md" }: { book: Pick<Book, "slug" | "subject">; size?: "md" | "lg" }) {
  const Icon = BY_BOOK[book.slug] ?? BY_SUBJECT[book.subject];
  const color = subjectColor(book.subject);
  return (
    <span
      aria-hidden
      className={cx(
        "grid shrink-0 place-items-center rounded-md",
        size === "lg" ? "size-14 rounded-card" : "size-11",
      )}
      style={{ background: `color-mix(in srgb, ${color} 14%, transparent)`, color }}
    >
      <Icon className={size === "lg" ? "size-7" : "size-5.5"} strokeWidth={2} />
    </span>
  );
}

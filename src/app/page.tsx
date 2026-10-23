import Link from "next/link";
import { ArrowLeft, BookCheck, Bot, HelpCircle, NotebookPen } from "lucide-react";
import { Logo, LogoMark } from "@/components/Logo";
import { SubjectIcon } from "@/components/SubjectIcon";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Blocks } from "@/components/lesson/Blocks";
import { Badge, SoonBadge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { getCurrentUser } from "@/lib/auth";
import { BRAND } from "@/lib/brand";
import { GRADE_TITLES, STREAMS, TRACKS, flatLessons } from "@/lib/catalog";
import { availableLessonKeys } from "@/lib/content";
import { toFa } from "@/lib/fa";

const TRUST = [
  {
    Icon: BookCheck,
    title: "مطابق کتاب درسی رسمی",
    text: "فصل به فصل و درس به درس، با همان ترتیب، نمادها و روش‌های کتاب.",
  },
  {
    Icon: NotebookPen,
    title: "مثال تشریحی، قدم‌به‌قدم",
    text: "هر مثال دلیل هر قدم را می‌گوید، نه فقط جواب نهایی را.",
  },
  {
    Icon: Bot,
    title: "معلم هوشمند کنار درس",
    text: "هر بخشی را نفهمیدی، همان بخش را ساده‌تر و با مثال دیگری توضیح می‌دهد.",
  },
];

const STEPS = [
  "شروع با یک موقعیت ملموس از زندگی",
  "ساختن درک شهودی از مفهوم",
  "تعریف دقیق و فرمول",
  "مثال حل‌شده، مرحله‌به‌مرحله و با دلیل",
  "اشتباه‌های رایج",
  "تمرین «خودت امتحان کن»",
  "آزمونک کوتاه با توضیح هر پاسخ",
];

// پیش‌نمایش واقعی از درس ۱ حسابان (۱)
const PREVIEW = [
  {
    type: "callout" as const,
    kind: "key" as const,
    title: "مجموع جملات دنباله‌ی حسابی",
    text: "$$S_n = \\frac{n}{2}\\,(t_1 + t_n)$$\n**به زبان ساده:** مجموع = تعداد جمله‌ها × میانگینِ جمله‌ی اول و آخر.",
  },
];

export default async function Home() {
  const user = await getCurrentUser();
  const cta = user ? "/learn" : "/login";
  const active = TRACKS.find((t) => t.available)!;
  const available = await availableLessonKeys(active.id);
  const grades = ["7", "8", "9", "10", "11", "12", "konkur"];

  return (
    <div className="min-h-dvh">
      <header className="mx-auto flex h-16 max-w-5xl items-center gap-2 px-4">
        <Logo />
        <div className="ms-auto flex items-center gap-1">
          <ThemeToggle />
          <ButtonLink href={cta} variant="secondary" size="sm">
            {user ? "ادامه‌ی یادگیری" : "ورود / ثبت‌نام"}
          </ButtonLink>
        </div>
      </header>

      <main>
        {/* معرفی */}
        <section className="relative overflow-hidden">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 -top-40 h-[34rem] bg-[radial-gradient(ellipse_at_top,color-mix(in_srgb,var(--brand-primary)_16%,transparent),transparent_65%)]"
          />
          <div className="relative mx-auto grid max-w-5xl items-center gap-10 px-4 pt-10 pb-16 md:grid-cols-[1.1fr_1fr] md:pt-16">
            <div>
              <Badge tone="primary">پایه‌ی یازدهم ریاضی و فیزیک · فعال</Badge>
              <h1 className="mt-5 text-[2.25rem] leading-[1.35] font-bold sm:text-[2.75rem]">{BRAND.tagline}</h1>
              <p className="mt-4 max-w-lg text-body-lg leading-8 text-subtle">
                {BRAND.name} درس‌های مدرسه را از پایه یاد می‌دهد؛ فرض می‌کنیم اولین بار است که با موضوع روبه‌رو
                می‌شوی. از پایه‌ی هفتم تا کنکور، مطابق کتاب درسی رسمی.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <ButtonLink href={cta} size="lg">
                  شروع یادگیری
                  <ArrowLeft className="size-5" aria-hidden />
                </ButtonLink>
                <ButtonLink href="#how" variant="secondary" size="lg">
                  هر درس چطور است؟
                </ButtonLink>
              </div>
            </div>

            <div aria-label="نمونه‌ای از یک درس" className="lesson-content rounded-xl border border-border-subtle bg-surface p-4 shadow-raised sm:p-5">
              <div className="mb-3 flex items-center gap-2 text-caption text-muted">
                <LogoMark className="size-5" />
                حسابان (۱) · فصل ۱ · درس ۱
              </div>
              <p className="mb-4 text-h4 font-semibold">مجموع جملات دنباله‌های حسابی و هندسی</p>
              <Blocks blocks={PREVIEW} />
              <span className="mt-4 inline-flex min-h-10 items-center gap-2 rounded-full border border-border px-4 text-label text-subtle">
                <HelpCircle className="size-4" aria-hidden />
                این قسمت رو نفهمیدم
              </span>
            </div>
          </div>
        </section>

        {/* اعتمادسازی */}
        <section aria-label="ویژگی‌ها" className="mx-auto max-w-5xl px-4">
          <div className="grid gap-3 md:grid-cols-3">
            {TRUST.map(({ Icon, title, text }) => (
              <div key={title} className="rounded-card border border-border-subtle bg-surface p-5 shadow-card">
                <span className="grid size-11 place-items-center rounded-md bg-[color-mix(in_srgb,var(--brand-primary)_12%,transparent)] text-primary">
                  <Icon className="size-5.5" aria-hidden />
                </span>
                <h2 className="mt-3 text-h4 font-semibold">{title}</h2>
                <p className="mt-1 text-body-sm leading-7 text-muted">{text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ساختار درس */}
        <section id="how" aria-labelledby="how-title" className="mx-auto max-w-5xl scroll-mt-6 px-4 pt-16">
          <h2 id="how-title" className="text-h2 font-bold">
            هر درس چطور پیش می‌رود؟
          </h2>
          <p className="mt-1 text-body text-subtle">از ساده به سخت، بدون جا انداختن هیچ قدمی.</p>
          <ol className="mt-6 grid gap-2.5 sm:grid-cols-2">
            {STEPS.map((s, i) => (
              <li key={s} className="flex min-h-14 items-center gap-3 rounded-card border border-border-subtle bg-surface px-4 py-3">
                <span className="grid size-8 shrink-0 place-items-center rounded-full bg-surface-secondary text-label font-bold text-primary">
                  {toFa(i + 1)}
                </span>
                <span className="text-body">{s}</span>
              </li>
            ))}
          </ol>
        </section>

        {/* کتاب‌های فعال */}
        <section aria-labelledby="books-title" className="mx-auto max-w-5xl px-4 pt-16">
          <h2 id="books-title" className="text-h2 font-bold">
            کتاب‌های پایه‌ی یازدهم ریاضی
          </h2>
          <p className="mt-1 text-body text-subtle">فهرست فصل‌ها کامل است؛ درس‌ها به‌تدریج اضافه می‌شوند.</p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {active.books
              .filter((b) => b.kind === "main")
              .map((b) => {
                const ready = flatLessons(b).filter((x) => available.has(x.key)).length;
                return (
                  <div key={b.slug} className="flex items-center gap-3 rounded-card border border-border-subtle bg-surface p-4">
                    <SubjectIcon book={b} />
                    <div className="min-w-0 flex-1">
                      <div className="text-h4 font-semibold">{b.title}</div>
                      <div className="text-caption text-muted">{toFa(b.chapters.length)} فصل</div>
                    </div>
                    {ready > 0 ? <Badge tone="success">{toFa(ready)} درس آماده</Badge> : <SoonBadge />}
                  </div>
                );
              })}
          </div>
        </section>

        {/* پایه‌ها */}
        <section aria-labelledby="grades-title" className="mx-auto max-w-5xl px-4 pt-16">
          <h2 id="grades-title" className="text-h2 font-bold">
            پایه‌ها و رشته‌ها
          </h2>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {grades.map((g) => (
              <div key={g} className="rounded-card border border-border-subtle bg-surface p-4">
                <div className="text-h4 font-semibold">{GRADE_TITLES[g]}</div>
                <ul className="mt-2 space-y-1.5 text-body-sm">
                  {TRACKS.filter((t) => t.grade === g).map((t) => (
                    <li key={t.id} className="flex min-h-7 items-center justify-between gap-2">
                      <span className={t.available ? "font-medium" : "text-muted"}>
                        {t.stream ? STREAMS[t.stream] : "همه‌ی دروس"}
                      </span>
                      {t.available ? <Badge tone="success">فعال</Badge> : <SoonBadge />}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-4 py-16">
          <div className="rounded-xl bg-primary p-6 text-center text-on-primary sm:p-10">
            <h2 className="text-h2 font-bold">بیا از همین قدم بعدی شروع کنیم.</h2>
            <p className="mt-2 opacity-90">ثبت‌نام فقط با شماره موبایل؛ کمتر از یک دقیقه.</p>
            <Link
              href={cta}
              className="mt-6 inline-flex min-h-12 items-center gap-2 rounded-md bg-white px-6 font-semibold text-[#2548ce] dark:bg-[#0b1120] dark:text-[#a5b8ff]"
            >
              شروع یادگیری
              <ArrowLeft className="size-5" aria-hidden />
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-border-subtle py-6 text-center text-caption text-muted">
        {BRAND.name} · {BRAND.tagline}
      </footer>
    </div>
  );
}

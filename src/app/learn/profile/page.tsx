import { LogOut, Pencil } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { ThemeSelect } from "@/components/ThemeToggle";
import { Button, ButtonLink } from "@/components/ui/Button";
import { requireStudent } from "@/lib/auth";
import { trackTitle } from "@/lib/catalog";
import { getProgress } from "@/lib/progress";
import { toFa } from "@/lib/fa";

export const metadata = { title: "پروفایل" };

export default async function ProfilePage() {
  const { user, track } = await requireStudent();
  const { rows } = await getProgress(user.id);
  const completed = rows.filter((r) => r.completedAt).length;
  const quizzes = rows.filter((r) => r.quizTotal != null);
  const avg = quizzes.length
    ? Math.round((quizzes.reduce((s, r) => s + (r.quizScore ?? 0) / r.quizTotal!, 0) / quizzes.length) * 100)
    : null;

  const stats = [
    { label: "درس تمام‌شده", value: toFa(completed) },
    { label: "آزمونک زده‌شده", value: toFa(quizzes.length) },
    { label: "میانگین آزمونک", value: avg == null ? "—" : `${toFa(avg)}٪` },
  ];

  return (
    <AppShell name={user.name!}>
      <main className="mx-auto max-w-2xl space-y-5 px-4 py-6">
        <h1 className="text-h1 font-bold">پروفایل</h1>

        <section className="flex items-center gap-4 rounded-card border border-border-subtle bg-surface p-4 shadow-card">
          <span className="grid size-14 shrink-0 place-items-center rounded-full bg-secondary-soft text-h3 font-bold text-secondary">
            {user.name!.slice(0, 1)}
          </span>
          <div className="min-w-0 flex-1">
            <div className="text-h4 font-semibold">{user.name}</div>
            <div className="text-body-sm text-muted">{trackTitle(track)}</div>
            <div className="text-body-sm text-muted" dir="ltr">
              {user.phone}
            </div>
          </div>
          <ButtonLink href="/onboarding" variant="secondary" size="sm" icon={<Pencil className="size-4" aria-hidden />}>
            ویرایش
          </ButtonLink>
        </section>

        <section aria-label="آمار یادگیری" className="grid grid-cols-3 gap-3">
          {stats.map((s) => (
            <div key={s.label} className="rounded-card border border-border-subtle bg-surface p-3 text-center shadow-card">
              <div className="text-h3 font-bold">{s.value}</div>
              <div className="mt-0.5 text-caption text-muted">{s.label}</div>
            </div>
          ))}
        </section>

        <section className="rounded-card border border-border-subtle bg-surface p-4 shadow-card">
          <h2 className="mb-3 text-h4 font-semibold">حالت نمایش</h2>
          <ThemeSelect />
          <p className="mt-2 text-caption text-muted">انتخابت فقط روی همین دستگاه ذخیره می‌شود.</p>
        </section>

        <form action="/api/auth/logout" method="post">
          <Button
            variant="secondary"
            className="w-full text-danger-text"
            icon={<LogOut className="size-4.5" aria-hidden />}
          >
            خروج از حساب
          </Button>
        </form>
      </main>
    </AppShell>
  );
}

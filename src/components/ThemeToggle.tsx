"use client";
import { useEffect, useState } from "react";
import { Monitor, Moon, Sun } from "lucide-react";
import { applyThemeChoice, readThemeChoice, type ThemeChoice } from "@/lib/theme";
import { cx } from "@/lib/cx";

function useThemeChoice() {
  const [choice, setChoice] = useState<ThemeChoice>("system");
  useEffect(() => {
    setChoice(readThemeChoice());
    // وقتی تم سیستم عوض شود و کاربر «خودکار» را انتخاب کرده باشد
    const mq = matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => readThemeChoice() === "system" && applyThemeChoice("system");
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  const set = (c: ThemeChoice) => {
    setChoice(c);
    applyThemeChoice(c);
  };
  return [choice, set] as const;
}

/** دکمه‌ی سریع روشن/تاریک در سربرگ */
export function ThemeToggle({ className }: { className?: string }) {
  const [, set] = useThemeChoice();
  return (
    <button
      type="button"
      onClick={() => set(document.documentElement.classList.contains("dark") ? "light" : "dark")}
      className={cx(
        "grid size-11 place-items-center rounded-full text-subtle transition-colors hover:bg-surface-secondary hover:text-foreground",
        className,
      )}
      aria-label="تغییر حالت روشن و تاریک"
      title="حالت روشن / تاریک"
    >
      <Sun className="size-5 dark:hidden" aria-hidden />
      <Moon className="hidden size-5 dark:block" aria-hidden />
    </button>
  );
}

const OPTIONS: { value: ThemeChoice; label: string; Icon: typeof Sun }[] = [
  { value: "light", label: "روشن", Icon: Sun },
  { value: "dark", label: "تاریک", Icon: Moon },
  { value: "system", label: "خودکار", Icon: Monitor },
];

/** انتخاب سه‌حالته در صفحه‌ی پروفایل */
export function ThemeSelect() {
  const [choice, set] = useThemeChoice();
  return (
    <div role="radiogroup" aria-label="حالت نمایش" className="grid grid-cols-3 gap-1 rounded-card bg-surface-secondary p-1">
      {OPTIONS.map(({ value, label, Icon }) => (
        <button
          key={value}
          type="button"
          role="radio"
          aria-checked={choice === value}
          onClick={() => set(value)}
          className={cx(
            "flex min-h-11 items-center justify-center gap-1.5 rounded-md text-label font-medium transition-colors",
            choice === value ? "bg-surface text-foreground shadow-card" : "text-muted hover:text-foreground",
          )}
        >
          <Icon className="size-4" aria-hidden />
          {label}
        </button>
      ))}
    </div>
  );
}

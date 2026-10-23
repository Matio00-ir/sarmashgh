import type { ReactNode } from "react";
import { Logo } from "./Logo";
import { ThemeToggle } from "./ThemeToggle";
import { cx } from "@/lib/cx";

/** قاب ساده‌ی صفحه‌های ورود و شروع اولیه */
export function AuthFrame({ children, wide }: { children: ReactNode; wide?: boolean }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between px-4">
        <Logo />
        <ThemeToggle />
      </header>
      <main className={cx("mx-auto w-full flex-1 px-4 pt-4 pb-12 sm:pt-10", wide ? "max-w-2xl" : "max-w-md")}>
        {children}
      </main>
    </div>
  );
}

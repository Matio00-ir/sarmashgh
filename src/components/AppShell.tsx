import Link from "next/link";
import type { ReactNode } from "react";
import { Logo } from "./Logo";
import { MainNav } from "./MainNav";
import { ThemeToggle } from "./ThemeToggle";

/** قاب صفحه‌های داخلی: سربرگ بالا + ناوبری پایین در موبایل */
export function AppShell({ name, children }: { name: string; children: ReactNode }) {
  return (
    <>
      <header className="sticky top-0 z-30 border-b border-border-subtle bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-5xl items-center gap-4 px-4">
          <Logo href="/learn" />
          <MainNav variant="top" />
          <div className="ms-auto flex items-center gap-1">
            <ThemeToggle />
            <Link
              href="/learn/profile"
              aria-label="پروفایل"
              className="grid size-11 place-items-center rounded-full bg-secondary-soft text-body font-bold text-secondary transition-colors hover:brightness-95"
            >
              {name.slice(0, 1)}
            </Link>
          </div>
        </div>
      </header>
      <div className="pb-[calc(5rem+env(safe-area-inset-bottom))] md:pb-10">{children}</div>
      <MainNav variant="bottom" />
    </>
  );
}

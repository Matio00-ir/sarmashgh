"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ClipboardCheck, House, Library, UserRound } from "lucide-react";
import { cx } from "@/lib/cx";

const ITEMS = [
  { href: "/learn", label: "خانه", Icon: House },
  { href: "/learn/books", label: "کتاب‌ها", Icon: Library },
  { href: "/learn/quizzes", label: "آزمون‌ها", Icon: ClipboardCheck },
  { href: "/learn/profile", label: "پروفایل", Icon: UserRound },
];

function isActive(pathname: string, href: string) {
  if (href === "/learn") return pathname === "/learn";
  // صفحه‌های کتاب و درس زیرمجموعه‌ی «کتاب‌ها» حساب می‌شوند
  if (href === "/learn/books") {
    return pathname.startsWith("/learn/") && !["/learn/quizzes", "/learn/profile"].some((p) => pathname.startsWith(p));
  }
  return pathname.startsWith(href);
}

export function MainNav({ variant }: { variant: "top" | "bottom" }) {
  const pathname = usePathname();

  if (variant === "top") {
    return (
      <nav aria-label="ناوبری اصلی" className="hidden items-center gap-1 md:flex">
        {ITEMS.map(({ href, label }) => {
          const active = isActive(pathname, href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={cx(
                "rounded-md px-3 py-2 text-label font-medium transition-colors",
                active ? "bg-surface-secondary text-foreground" : "text-muted hover:text-foreground",
              )}
            >
              {label}
            </Link>
          );
        })}
      </nav>
    );
  }

  return (
    <nav
      aria-label="ناوبری اصلی"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-border-subtle bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden"
    >
      <ul className="mx-auto grid max-w-md grid-cols-4">
        {ITEMS.map(({ href, label, Icon }) => {
          const active = isActive(pathname, href);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={cx(
                  "flex min-h-16 flex-col items-center justify-center gap-1 text-caption font-medium transition-colors",
                  active ? "text-primary" : "text-muted hover:text-foreground",
                )}
              >
                <span
                  className={cx(
                    "grid h-7 w-12 place-items-center rounded-full transition-colors",
                    active && "bg-[color-mix(in_srgb,var(--brand-primary)_14%,transparent)]",
                  )}
                >
                  <Icon className="size-5" strokeWidth={active ? 2.25 : 2} aria-hidden />
                </span>
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

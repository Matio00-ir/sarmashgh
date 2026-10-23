import Link from "next/link";
import { BRAND } from "@/lib/brand";
import { LOGO_PAGE_LEFT, LOGO_PAGE_RIGHT, LOGO_STAR, LOGO_VIEWBOX } from "@/lib/logo";
import { cx } from "@/lib/cx";

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox={LOGO_VIEWBOX} aria-hidden className={cx("size-8", className)}>
      <path d={LOGO_PAGE_RIGHT} fill="var(--brand-primary)" />
      <path d={LOGO_PAGE_LEFT} fill="var(--brand-primary)" opacity={0.78} />
      <path d={LOGO_STAR} fill="var(--brand-secondary)" />
    </svg>
  );
}

export function Logo({ href = "/", className }: { href?: string; className?: string }) {
  return (
    <Link
      href={href}
      aria-label={`${BRAND.name} — صفحه‌ی اصلی`}
      className={cx("inline-flex min-h-11 items-center gap-2 text-h4 font-bold tracking-tight", className)}
    >
      <LogoMark />
      <span>{BRAND.name}</span>
    </Link>
  );
}

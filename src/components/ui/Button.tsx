import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { Spinner } from "./Spinner";
import { cx } from "@/lib/cx";

type Variant = "primary" | "secondary" | "ghost" | "soft" | "success";
type Size = "sm" | "md" | "lg";

const VARIANTS: Record<Variant, string> = {
  primary: "bg-primary text-on-primary hover:bg-primary-hover shadow-card",
  secondary: "bg-surface text-foreground border border-border hover:bg-surface-secondary",
  ghost: "text-subtle hover:bg-surface-secondary hover:text-foreground",
  soft: "bg-[color-mix(in_srgb,var(--brand-primary)_12%,transparent)] text-primary hover:bg-[color-mix(in_srgb,var(--brand-primary)_18%,transparent)]",
  success: "bg-success text-white dark:text-[#0b1120] hover:brightness-110",
};

const SIZES: Record<Size, string> = {
  sm: "min-h-10 px-3.5 text-label rounded-md gap-1.5",
  md: "min-h-11 px-5 text-body rounded-md gap-2",
  lg: "min-h-13 px-6 text-body-lg rounded-card gap-2",
};

export function buttonClass(variant: Variant = "primary", size: Size = "md", extra?: string) {
  return cx(
    "inline-flex select-none items-center justify-center font-semibold transition-[background-color,color,box-shadow,transform,filter] duration-150 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50",
    VARIANTS[variant],
    SIZES[size],
    extra,
  );
}

type Common = { variant?: Variant; size?: Size; icon?: ReactNode; className?: string };

export function Button({
  variant,
  size,
  icon,
  loading,
  className,
  children,
  disabled,
  ...rest
}: Common & ComponentProps<"button"> & { loading?: boolean }) {
  return (
    <button
      {...rest}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={buttonClass(variant, size, className)}
    >
      {loading ? <Spinner /> : icon}
      {children}
    </button>
  );
}

export function ButtonLink({ variant, size, icon, className, children, ...rest }: Common & ComponentProps<typeof Link>) {
  return (
    <Link {...rest} className={buttonClass(variant, size, className)}>
      {icon}
      {children}
    </Link>
  );
}

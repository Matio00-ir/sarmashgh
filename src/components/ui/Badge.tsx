import type { ReactNode } from "react";
import { cx } from "@/lib/cx";

type Tone = "neutral" | "soon" | "success" | "info" | "warning" | "danger" | "primary";

const TONES: Record<Tone, string> = {
  neutral: "bg-surface-secondary text-subtle",
  soon: "bg-surface-secondary text-muted border border-dashed border-border",
  success: "bg-success-bg text-success-text",
  info: "bg-info-bg text-info-text",
  warning: "bg-warning-bg text-warning-text",
  danger: "bg-danger-bg text-danger-text",
  primary: "bg-[color-mix(in_srgb,var(--brand-primary)_14%,transparent)] text-primary",
};

export function Badge({
  tone = "neutral",
  icon,
  children,
  className,
}: {
  tone?: Tone;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cx(
        "inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-0.5 text-caption font-medium leading-5",
        TONES[tone],
        className,
      )}
    >
      {icon}
      {children}
    </span>
  );
}

export function SoonBadge({ className }: { className?: string }) {
  return (
    <Badge tone="soon" className={className}>
      به‌زودی
    </Badge>
  );
}

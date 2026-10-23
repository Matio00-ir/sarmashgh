import { cx } from "@/lib/cx";
import { toFa } from "@/lib/fa";

export function ProgressBar({
  value,
  color = "var(--brand-primary)",
  label,
  className,
}: {
  value: number;
  color?: string;
  label: string;
  className?: string;
}) {
  const pct = Math.round(Math.min(1, Math.max(0, value)) * 100);
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={pct}
      aria-valuetext={`${toFa(pct)} درصد`}
      className={cx("h-2 overflow-hidden rounded-full bg-surface-secondary", className)}
    >
      <div
        className="h-full rounded-full transition-[width] duration-300 ease-standard"
        style={{ width: `${pct}%`, background: color }}
      />
    </div>
  );
}

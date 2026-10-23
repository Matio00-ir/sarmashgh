import { LoaderCircle } from "lucide-react";
import { cx } from "@/lib/cx";

export function Spinner({ className }: { className?: string }) {
  return <LoaderCircle aria-hidden className={cx("size-4.5 animate-spin", className)} />;
}

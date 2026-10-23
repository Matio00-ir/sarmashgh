/** کنار هم گذاشتن کلاس‌ها و حذف مقدارهای خالی */
export function cx(...parts: (string | false | null | undefined)[]) {
  return parts.filter(Boolean).join(" ");
}

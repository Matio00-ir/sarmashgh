const FA_DIGITS = "۰۱۲۳۴۵۶۷۸۹";
const AR_DIGITS = "٠١٢٣٤٥٦٧٨٩";

/** عدد را با ارقام فارسی نشان می‌دهد */
export function toFa(n: number | string) {
  return String(n).replace(/\d/g, (d) => FA_DIGITS[Number(d)]);
}

/** ارقام فارسی و عربی را به لاتین تبدیل می‌کند */
export function toEnDigits(s: string) {
  return s
    .replace(/[۰-۹]/g, (d) => String(FA_DIGITS.indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String(AR_DIGITS.indexOf(d)));
}

/** شماره موبایل ایران را به شکل 09xxxxxxxxx درمی‌آورد؛ اگر نامعتبر باشد null */
export function normalizePhone(input: string): string | null {
  let s = toEnDigits(input).replace(/[\s\-()]/g, "");
  if (s.startsWith("+98")) s = "0" + s.slice(3);
  else if (s.startsWith("0098")) s = "0" + s.slice(4);
  else if (s.startsWith("98") && s.length === 12) s = "0" + s.slice(2);
  else if (s.startsWith("9") && s.length === 10) s = "0" + s;
  return /^09\d{9}$/.test(s) ? s : null;
}

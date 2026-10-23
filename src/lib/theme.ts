// تم روشن/تاریک: انتخاب کاربر در مرورگر خودش ذخیره می‌شود؛ پیش‌فرض، تنظیم سیستم‌عامل است.
export type ThemeChoice = "light" | "dark" | "system";

export const THEME_STORAGE_KEY = "sarmashgh-theme";

/** اسکریپت کوچکی که پیش از نمایش صفحه کلاس .dark را تنظیم می‌کند */
export const THEME_INIT_SCRIPT = `(function(){try{var c=localStorage.getItem("${THEME_STORAGE_KEY}");var d=c==="dark"||(c!=="light"&&matchMedia("(prefers-color-scheme: dark)").matches);document.documentElement.classList.toggle("dark",d)}catch(e){}})()`;

export function readThemeChoice(): ThemeChoice {
  try {
    const v = localStorage.getItem(THEME_STORAGE_KEY);
    return v === "light" || v === "dark" ? v : "system";
  } catch {
    return "system";
  }
}

export function applyThemeChoice(choice: ThemeChoice) {
  try {
    if (choice === "system") localStorage.removeItem(THEME_STORAGE_KEY);
    else localStorage.setItem(THEME_STORAGE_KEY, choice);
  } catch {
    // ذخیره‌سازی در دسترس نیست؛ فقط همین صفحه عوض می‌شود
  }
  const dark = choice === "dark" || (choice === "system" && matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.classList.toggle("dark", dark);
}

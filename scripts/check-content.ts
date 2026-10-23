// بررسی همه‌ی فایل‌های درس: قالب درست، وجود در فهرست کتاب، و آزمونک
// اجرا: npm run content:check
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { TRACKS, flatLessons } from "../src/lib/catalog";
import { parseLessonBody } from "../src/lib/lesson-format";

const root = path.join(process.cwd(), "content");
let errors = 0;
let lessons = 0;

for (const track of TRACKS) {
  const dir = path.join(root, track.id);
  if (!fs.existsSync(dir)) continue;
  const known = new Set(track.books.flatMap((b) => flatLessons(b).map((x) => x.key)));

  for (const f of fs.readdirSync(dir, { recursive: true }).map(String)) {
    if (!f.endsWith(".md")) continue;
    const key = f.split(path.sep).join("/").slice(0, -3);
    const rel = `${track.id}/${key}.md`;
    lessons++;
    if (!known.has(key)) {
      console.error(`✗ ${rel}: این درس در فهرست کتاب (src/lib/catalog.ts) نیست`);
      errors++;
      continue;
    }
    try {
      const { data, content } = matter(fs.readFileSync(path.join(dir, f), "utf8"));
      const parsed = parseLessonBody(content, rel);
      const warn: string[] = [];
      if (!data.objectives?.length) warn.push("اهداف درس (objectives) ندارد");
      if (parsed.quiz.length < 3) warn.push(`فقط ${parsed.quiz.length} سؤال آزمونک دارد (حداقل ۳)`);
      if (!parsed.sections.length) warn.push("هیچ بخشی (##) ندارد");
      // فرمول درون‌خطی بلند در موبایل جا نمی‌شود؛ باید با $$ جدا نوشته شود
      // (جدول‌ها اسکرول افقی دارند و بررسی نمی‌شوند)
      const inline = content
        .replace(/\$\$[\s\S]*?\$\$/g, "")
        .replace(/^\|.*$/gm, "")
        .matchAll(/\$([^$\n]+)\$/g);
      for (const m of inline) {
        if (m[1].length >= 50) warn.push(`فرمول درون‌خطی بلند (بهتر است با $$ جدا شود): ${m[1].slice(0, 40)}…`);
      }
      const status = data.status === "reviewed" ? "تأییدشده" : "پیش‌نویس";
      console.log(
        `${warn.length ? "!" : "✓"} ${rel} — ${parsed.sections.length} بخش، ${parsed.quiz.length} سؤال، ${status}`,
      );
      for (const w of warn) console.log(`    ! ${w}`);
    } catch (e) {
      console.error(`✗ ${(e as Error).message}`);
      errors++;
    }
  }
}

console.log(`\n${lessons} درس بررسی شد، ${errors} خطا.`);
process.exit(errors ? 1 : 0);

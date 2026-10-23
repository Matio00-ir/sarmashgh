import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import { parseLessonBody, type ParsedLesson } from "./lesson-format";

export type LessonMeta = {
  duration?: number; // دقیقه
  objectives?: string[];
  prerequisites?: string[];
  status: "draft" | "reviewed";
};

export type LessonContent = ParsedLesson & { meta: LessonMeta; body: string };

const CONTENT_DIR = path.join(process.cwd(), "content");

export function lessonFile(trackId: string, key: string) {
  return path.join(CONTENT_DIR, trackId, `${key}.md`);
}

export async function loadLesson(trackId: string, key: string): Promise<LessonContent | null> {
  let src: string;
  try {
    src = await fs.readFile(lessonFile(trackId, key), "utf8");
  } catch {
    return null;
  }
  const { data, content } = matter(src);
  return {
    ...parseLessonBody(content, `${trackId}/${key}.md`),
    body: content,
    meta: {
      duration: data.duration,
      objectives: data.objectives,
      prerequisites: data.prerequisites,
      status: data.status === "reviewed" ? "reviewed" : "draft",
    },
  };
}

/** کلید درس‌هایی که فایل محتوا دارند */
export async function availableLessonKeys(trackId: string): Promise<Set<string>> {
  const root = path.join(CONTENT_DIR, trackId);
  const keys = new Set<string>();
  try {
    for (const f of await fs.readdir(root, { recursive: true })) {
      const rel = String(f).split(path.sep).join("/");
      if (rel.endsWith(".md")) keys.add(rel.slice(0, -3));
    }
  } catch {
    // پوشه‌ای برای این مسیر وجود ندارد
  }
  return keys;
}

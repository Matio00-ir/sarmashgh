// تبدیل متن مارک‌داون یک درس به ساختار قابل‌نمایش.
// راهنمای کامل قالب در CONTENT_GUIDE.md آمده است. خلاصه:
//   ## عنوان بخش            ← هر بخش یک دکمه «این قسمت رو نفهمیدم» می‌گیرد
//   :::key عنوان             ← کادرهای ویژه: key, tip, example, mistake, konkur, remember
//   ...
//   :::
//   :::try عنوان             ← «خودت امتحان کن»: صورت سؤال، سپس خط ---، سپس پاسخ
//   :::quiz                  ← سؤال آزمونک: متن، گزینه‌ها با - (غلط) و + (درست)، سپس ---، سپس توضیح

export const CALLOUT_KINDS = ["key", "tip", "example", "mistake", "konkur", "remember"] as const;
export type CalloutKind = (typeof CALLOUT_KINDS)[number];

export type Block =
  | { type: "md"; text: string }
  | { type: "callout"; kind: CalloutKind; title?: string; text: string }
  | { type: "try"; title?: string; question: string; answer: string };

export type Section = { id: string; title: string; blocks: Block[] };

export type QuizQuestion = {
  question: string;
  options: string[];
  answer: number;
  explanation: string;
};

export type ParsedLesson = { intro: Block[]; sections: Section[]; quiz: QuizQuestion[] };

export class LessonFormatError extends Error {}

const OPEN = /^:::([a-z]+)\s*(.*)$/;
const CLOSE = /^:::\s*$/;

function splitOnRule(text: string): [string, string] | null {
  const lines = text.split("\n");
  const i = lines.findIndex((x) => x.trim() === "---");
  if (i < 0) return null;
  return [lines.slice(0, i).join("\n").trim(), lines.slice(i + 1).join("\n").trim()];
}

export function parseQuiz(body: string, where: string): QuizQuestion {
  const parts = splitOnRule(body);
  const [head, explanation] = parts ?? [body.trim(), ""];
  const lines = head.split("\n");
  const first = lines.findIndex((x) => /^[+-]\s/.test(x));
  if (first < 0) throw new LessonFormatError(`${where}: سؤال آزمونک گزینه ندارد`);
  const question = lines.slice(0, first).join("\n").trim();
  const options: string[] = [];
  let answer = -1;
  for (const line of lines.slice(first)) {
    if (!line.trim()) continue;
    const m = /^([+-])\s+(.*)$/.exec(line);
    if (!m) throw new LessonFormatError(`${where}: خط نامعتبر بین گزینه‌ها: «${line}»`);
    if (m[1] === "+") {
      if (answer >= 0) throw new LessonFormatError(`${where}: بیش از یک گزینه‌ی درست`);
      answer = options.length;
    }
    options.push(m[2].trim());
  }
  if (!question) throw new LessonFormatError(`${where}: متن سؤال خالی است`);
  if (options.length < 2) throw new LessonFormatError(`${where}: حداقل دو گزینه لازم است`);
  if (answer < 0) throw new LessonFormatError(`${where}: گزینه‌ی درست (با +) مشخص نشده`);
  if (!explanation) throw new LessonFormatError(`${where}: توضیح پاسخ (بعد از ---) نوشته نشده`);
  return { question, options, answer, explanation };
}

export function parseLessonBody(body: string, file = "lesson"): ParsedLesson {
  const intro: Block[] = [];
  const sections: Section[] = [];
  const quiz: QuizQuestion[] = [];

  let current: Block[] = intro;
  let currentSection: Section | null = null;
  let md: string[] = [];

  const flushMd = () => {
    const text = md.join("\n").trim();
    if (text) current.push({ type: "md", text });
    md = [];
  };

  const lines = body.replace(/\r\n/g, "\n").split("\n");
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    const heading = /^##\s+(.+)$/.exec(line);
    if (heading) {
      flushMd();
      currentSection = { id: `s${sections.length + 1}`, title: heading[1].trim(), blocks: [] };
      sections.push(currentSection);
      current = currentSection.blocks;
      continue;
    }

    const open = OPEN.exec(line);
    if (!open) {
      md.push(line);
      continue;
    }

    flushMd();
    const [, kind, title] = open;
    const where = `${file} (خط ${i + 1})`;
    const inner: string[] = [];
    let closed = false;
    for (i++; i < lines.length; i++) {
      if (CLOSE.test(lines[i])) {
        closed = true;
        break;
      }
      inner.push(lines[i]);
    }
    if (!closed) throw new LessonFormatError(`${where}: بلوک :::${kind} بسته نشده`);
    const text = inner.join("\n").trim();

    if (kind === "quiz") {
      quiz.push(parseQuiz(text, where));
    } else if (kind === "try") {
      const parts = splitOnRule(text);
      if (!parts) throw new LessonFormatError(`${where}: در بلوک try باید پاسخ بعد از --- بیاید`);
      current.push({ type: "try", title: title || undefined, question: parts[0], answer: parts[1] });
    } else if ((CALLOUT_KINDS as readonly string[]).includes(kind)) {
      current.push({ type: "callout", kind: kind as CalloutKind, title: title || undefined, text });
    } else {
      throw new LessonFormatError(`${where}: نوع بلوک ناشناخته «${kind}»`);
    }
  }
  flushMd();

  return {
    intro,
    // بخشی که فقط سؤال‌های آزمونک داشته (مثل «## آزمونک») نمایش داده نمی‌شود
    sections: sections.filter((s) => s.blocks.length > 0),
    quiz,
  };
}

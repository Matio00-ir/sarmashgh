import { describe, expect, it } from "vitest";
import { LessonFormatError, parseLessonBody } from "../src/lib/lesson-format";
import { normalizePhone, toFa } from "../src/lib/fa";
import { isolateDisplayMath } from "../src/lib/math-text";

describe("parseLessonBody", () => {
  it("splits intro, sections, callouts, try blocks and quiz", () => {
    const body = [
      "مقدمه",
      "## بخش اول",
      "متن $x^2$",
      ":::key عنوان",
      "تعریف",
      ":::",
      ":::try",
      "سؤال",
      "---",
      "پاسخ",
      ":::",
      "## آزمونک",
      ":::quiz",
      "۲+۲؟",
      "- ۳",
      "+ ۴",
      "---",
      "چون ۴",
      ":::",
    ].join("\n");
    const r = parseLessonBody(body);
    expect(r.intro).toEqual([{ type: "md", text: "مقدمه" }]);
    expect(r.sections).toHaveLength(1);
    expect(r.sections[0].blocks.map((b) => b.type)).toEqual(["md", "callout", "try"]);
    expect(r.sections[0].blocks[1]).toMatchObject({ kind: "key", title: "عنوان", text: "تعریف" });
    expect(r.quiz).toEqual([{ question: "۲+۲؟", options: ["۳", "۴"], answer: 1, explanation: "چون ۴" }]);
  });

  it("rejects unclosed blocks and quizzes without a correct option", () => {
    expect(() => parseLessonBody(":::tip\nمتن")).toThrow(LessonFormatError);
    expect(() => parseLessonBody(":::quiz\nسؤال\n- الف\n- ب\n---\nتوضیح\n:::")).toThrow(/گزینه‌ی درست/);
    expect(() => parseLessonBody(":::unknown\nx\n:::")).toThrow(/ناشناخته/);
  });
});

describe("fa helpers", () => {
  it("normalizes Iranian mobile numbers", () => {
    expect(normalizePhone("۰۹۱۲۳۴۵۶۷۸۹")).toBe("09123456789");
    expect(normalizePhone("+98 912 345 6789")).toBe("09123456789");
    expect(normalizePhone("9123456789")).toBe("09123456789");
    expect(normalizePhone("0212345678")).toBeNull();
  });
  it("renders Persian digits", () => {
    expect(toFa(1404)).toBe("۱۴۰۴");
  });
});

describe("isolateDisplayMath", () => {
  it("puts a $$ line in its own block even without blank lines around it", () => {
    expect(isolateDisplayMath("پس:\n$$x = 1$$\nبعد")).toBe("پس:\n\n$$\nx = 1\n$$\n\nبعد");
  });
  it("leaves inline math alone", () => {
    expect(isolateDisplayMath("مقدار $x$ و $$y$$ وسط متن")).toBe("مقدار $x$ و $$y$$ وسط متن");
  });
});

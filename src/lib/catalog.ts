// ساختار درسی: مسیر (پایه + رشته) ← کتاب ← فصل ← درس
// فهرست فصل‌ها و درس‌ها بر اساس کتاب‌های درسی رسمی است؛
// پیش از هر سال تحصیلی باید با آخرین چاپ کتاب (chap.sch.ir) تطبیق داده شود.

export type StreamId = "riazi" | "tajrobi" | "ensani";

export const STREAMS: Record<StreamId, string> = {
  riazi: "ریاضی و فیزیک",
  tajrobi: "علوم تجربی",
  ensani: "ادبیات و علوم انسانی",
};

export type Subject = "calculus" | "geometry" | "statistics" | "physics" | "chemistry" | "general";

export type LessonRef = { slug: string; title: string };
export type Chapter = { slug: string; title: string; lessons: LessonRef[] };
export type Book = {
  slug: string;
  title: string;
  kind: "main" | "general";
  description: string;
  subject: Subject; // رنگ و آیکون موضوعی کتاب (توکن‌های --subject-*)
  chapters: Chapter[];
};

export type Track = {
  id: string; // مثل "11-riazi" یا "8"
  grade: string; // "7" تا "12" یا "konkur"
  stream?: StreamId;
  available: boolean;
  books: Book[];
};

export const GRADE_TITLES: Record<string, string> = {
  "7": "پایه هفتم",
  "8": "پایه هشتم",
  "9": "پایه نهم",
  "10": "پایه دهم",
  "11": "پایه یازدهم",
  "12": "پایه دوازدهم",
  konkur: "کنکور",
};

export function trackTitle(t: Pick<Track, "grade" | "stream">) {
  const g = GRADE_TITLES[t.grade];
  return t.stream ? `${g} · ${STREAMS[t.stream]}` : g;
}

const l = (n: number, title: string): LessonRef => ({ slug: `dars-${n}`, title });
const ch = (n: number, title: string, lessons: string[] = []): Chapter => ({
  slug: `fasl-${n}`,
  title,
  lessons: lessons.map((t, i) => l(i + 1, t)),
});

const GRADE_11_RIAZI: Book[] = [
  {
    slug: "hesaban-1",
    title: "حسابان (۱)",
    kind: "main",
    description: "جبر، تابع، لگاریتم، مثلثات و حد؛ پایه‌ی اصلی ریاضیات دوازدهم و کنکور.",
    subject: "calculus",
    chapters: [
      ch(1, "جبر و معادله", [
        "مجموع جملات دنباله‌های حسابی و هندسی",
        "معادلات درجه دوم",
        "معادلات گویا و معادلات رادیکالی",
        "قدرمطلق و ویژگی‌های آن",
        "هندسه تحلیلی",
      ]),
      ch(2, "تابع", [
        "تبدیل نمودار توابع",
        "تابع درجه سوم، توابع یکنوا و بخش‌پذیری و تقسیم",
        "ترکیب توابع",
        "تابع وارون",
      ]),
      ch(3, "توابع نمایی و لگاریتمی", [
        "تابع نمایی و ویژگی‌های آن",
        "تابع لگاریتمی و ویژگی‌های آن",
        "ویژگی‌های لگاریتم و حل معادلات لگاریتمی",
      ]),
      ch(4, "مثلثات", [
        "رادیان",
        "نسبت‌های مثلثاتی برخی زوایا",
        "توابع مثلثاتی",
        "روابط مثلثاتی مجموع و تفاضل زوایا",
      ]),
      ch(5, "حد و پیوستگی", ["فرایندهای حدی", "محاسبه حد توابع", "پیوستگی"]),
    ],
  },
  {
    slug: "hendese-2",
    title: "هندسه (۲)",
    kind: "main",
    description: "دایره، تبدیل‌های هندسی و روابط طولی در مثلث.",
    subject: "geometry",
    chapters: [
      ch(1, "دایره", [
        "مفاهیم اولیه و زاویه‌ها در دایره",
        "رابطه‌های طولی در دایره",
        "چندضلعی‌های محاطی و محیطی",
      ]),
      ch(2, "تبدیل‌های هندسی و کاربردها", ["تبدیل‌های هندسی", "کاربرد تبدیل‌ها"]),
      ch(3, "روابط طولی در مثلث", [
        "قضیه سینوس‌ها",
        "قضیه کسینوس‌ها",
        "قضیه نیمسازهای زوایای داخلی و محاسبه طول نیمسازها",
        "قضیه هرون",
      ]),
    ],
  },
  {
    slug: "amar-ehtemal",
    title: "آمار و احتمال",
    kind: "main",
    description: "منطق و مجموعه، احتمال، آمار توصیفی و آمار استنباطی.",
    subject: "statistics",
    chapters: [
      ch(1, "آشنایی با مبانی ریاضیات", ["آشنایی با منطق ریاضی", "مجموعه‌ها"]),
      ch(2, "احتمال", [
        "مبانی احتمال",
        "احتمال غیرهم‌شانس",
        "احتمال شرطی",
        "پیشامدهای مستقل و وابسته",
      ]),
      ch(3, "آمار توصیفی", [
        "توصیف و نمایش داده‌ها",
        "معیارهای گرایش به مرکز",
        "معیارهای پراکندگی",
      ]),
      ch(4, "آمار استنباطی", ["گردآوری داده‌ها", "برآورد"]),
    ],
  },
  {
    slug: "fizik-2",
    title: "فیزیک (۲)",
    kind: "main",
    description: "الکتریسیته ساکن، جریان الکتریکی، مغناطیس و القای الکترومغناطیسی.",
    subject: "physics",
    chapters: [
      ch(1, "الکتریسیته ساکن"),
      ch(2, "جریان الکتریکی و مدارهای جریان مستقیم"),
      ch(3, "مغناطیس"),
      ch(4, "القای الکترومغناطیسی و جریان متناوب"),
    ],
  },
  {
    slug: "shimi-2",
    title: "شیمی (۲)",
    kind: "main",
    description: "منابع زمینی، شیمی غذا و شیمی پوشاک.",
    subject: "chemistry",
    chapters: [
      ch(1, "قدر هدایای زمینی را بدانیم"),
      ch(2, "در پی غذای سالم"),
      ch(3, "پوشاک، نیازی پایان‌ناپذیر"),
    ],
  },
  ...(
    [
      ["farsi-2", "فارسی (۲)", "ادبیات فارسی و درک متن."],
      ["negaresh-2", "نگارش (۲)", "مهارت نوشتن و انشا."],
      ["arabi-2", "عربی، زبان قرآن (۲)", "قواعد، ترجمه و درک متن عربی."],
      ["dini-2", "دین و زندگی (۲)", "مفاهیم دینی و آیات."],
      ["zaban-2", "زبان انگلیسی (۲)", "واژگان، گرامر و مهارت‌های زبان."],
      ["zaminshenasi", "زمین‌شناسی", "شناخت زمین و منابع آن."],
    ] as const
  ).map(
    ([slug, title, description]): Book => ({
      slug,
      title,
      kind: "general",
      description,
      subject: "general",
      chapters: [],
    }),
  ),
];

function buildTracks(): Track[] {
  const tracks: Track[] = [];
  for (const grade of ["7", "8", "9"]) {
    tracks.push({ id: grade, grade, available: false, books: [] });
  }
  for (const grade of ["10", "11", "12", "konkur"]) {
    for (const stream of Object.keys(STREAMS) as StreamId[]) {
      const id = `${grade}-${stream}`;
      const books = id === "11-riazi" ? GRADE_11_RIAZI : [];
      tracks.push({ id, grade, stream, available: books.length > 0, books });
    }
  }
  return tracks;
}

export const TRACKS = buildTracks();

export function getTrack(grade?: string | null, stream?: string | null) {
  return TRACKS.find((t) => t.grade === grade && (t.stream ?? null) === (stream ?? null));
}

export function getBook(track: Track, bookSlug: string) {
  return track.books.find((b) => b.slug === bookSlug);
}

export type LessonLocation = {
  book: Book;
  chapter: Chapter;
  lesson: LessonRef;
  chapterIndex: number;
  lessonIndex: number;
  key: string;
};

export function lessonKey(book: string, chapter: string, lesson: string) {
  return `${book}/${chapter}/${lesson}`;
}

export function locateLesson(track: Track, book: string, chapter: string, lesson: string) {
  const b = getBook(track, book);
  const ci = b?.chapters.findIndex((c) => c.slug === chapter) ?? -1;
  if (!b || ci < 0) return undefined;
  const c = b.chapters[ci];
  const li = c.lessons.findIndex((x) => x.slug === lesson);
  if (li < 0) return undefined;
  return {
    book: b,
    chapter: c,
    lesson: c.lessons[li],
    chapterIndex: ci,
    lessonIndex: li,
    key: lessonKey(book, chapter, lesson),
  } satisfies LessonLocation;
}

/** همه‌ی درس‌های یک کتاب به ترتیب، برای دکمه‌های «درس قبل / بعد» */
export function flatLessons(book: Book) {
  return book.chapters.flatMap((c) =>
    c.lessons.map((x) => ({ chapter: c, lesson: x, key: lessonKey(book.slug, c.slug, x.slug) })),
  );
}

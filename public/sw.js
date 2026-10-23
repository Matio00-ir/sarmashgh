// سرویس‌ورکر ساده: فایل‌های ثابت از حافظه، صفحه‌ها از شبکه با پشتیبان آفلاین
const STATIC_CACHE = "sarmashgh-static-v1";
const PAGE_CACHE = "sarmashgh-pages-v1";

self.addEventListener("install", () => self.skipWaiting());

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => ![STATIC_CACHE, PAGE_CACHE].includes(k)).map((k) => caches.delete(k))),
    ),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);
  if (request.method !== "GET" || url.origin !== location.origin || url.pathname.startsWith("/api/")) return;

  // فایل‌های ساخته‌شده‌ی Next و فونت‌ها تغییر نمی‌کنند: اول از حافظه
  if (url.pathname.startsWith("/_next/static/") || url.pathname.startsWith("/icons/")) {
    event.respondWith(
      caches.match(request).then(
        (hit) =>
          hit ||
          fetch(request).then((res) => {
            const copy = res.clone();
            caches.open(STATIC_CACHE).then((c) => c.put(request, copy));
            return res;
          }),
      ),
    );
    return;
  }

  // صفحه‌ها: اول شبکه؛ اگر اینترنت قطع بود، آخرین نسخه‌ی ذخیره‌شده (درس‌هایی که قبلاً باز شده‌اند)
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((res) => {
          const copy = res.clone();
          caches.open(PAGE_CACHE).then((c) => c.put(request, copy));
          return res;
        })
        .catch(() =>
          caches.match(request).then(
            (hit) =>
              hit ||
              new Response(
                '<!doctype html><html lang="fa" dir="rtl"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><body style="font-family:sans-serif;text-align:center;padding:3rem">اینترنت وصل نیست. بعد از اتصال دوباره امتحان کن.</body></html>',
                { headers: { "Content-Type": "text/html; charset=utf-8" } },
              ),
          ),
        ),
    );
  }
});

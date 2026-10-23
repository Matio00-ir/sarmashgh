import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "سرمشق — آموزش درس‌های مدرسه",
    short_name: "سرمشق",
    description: "یادگیری درس‌های مدرسه، فصل به فصل و مطابق کتاب درسی، با معلم هوشمند",
    lang: "fa",
    dir: "rtl",
    start_url: "/learn",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#f8fafc",
    theme_color: "#365ceb",
    icons: [
      { src: "/icons/192", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/512", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/512", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}

import type { MetadataRoute } from "next";

// Манифест устанавливаемого PWA. Дублируется как источник для TWA-обёртки под
// RuStore (см. twa-manifest.json и docs/rustore.md): те же имя, иконки, цвета и
// scope. Для RuStore важны заполненные lang, description, orientation и иконки
// 192/512 (в т.ч. maskable) — они здесь есть.
export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "doki.help — семейный архив документов",
    short_name: "doki.help",
    description:
      "Все важные документы вашей семьи — в одном защищённом месте: удостоверения, медицина, имущество. Напоминания о сроках и безопасная отправка по истекающей ссылке.",
    lang: "ru",
    dir: "ltr",
    start_url: "/my",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    categories: ["productivity", "utilities", "lifestyle"],
    background_color: "#f9f5f0",
    theme_color: "#b85c38",
    icons: [
      { src: "/icon-192", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon-512", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}

import type { MetadataRoute } from "next";
import { SEGMENT_KEYS } from "@/lib/segments";
import { COMPARISON_KEYS, comparisonLocales } from "@/lib/comparisons";
import { USECASE_KEYS } from "@/lib/usecases";
import { LANDING_KEYS } from "@/lib/landings";
import { TRUST_KEYS } from "@/lib/trust";
import { CHECKLIST_KEYS } from "@/lib/checklists";
import { GUIDE_KEYS } from "@/lib/guides";
import { buildSitemap, type SitemapPage } from "@/lib/sitemapBuilder";

// lastModified — дата последней правки СОДЕРЖИМОГО источника страницы
// (`git log -1 --format=%cs -- <файл>`). Меняешь текст реестра или страницы —
// обнови дату здесь же: неверный lastmod хуже, чем никакой.
const LASTMOD = {
  home: "2026-08-26", // app/page.tsx
  demo: "2026-07-27",
  pricing: "2026-07-27",
  security: "2026-08-02",
  about: "2026-07-19",
  privacy: "2026-08-02",
  terms: "2026-08-02",
  faq: "2026-07-19",
  hiring: "2026-08-26",
  segments: "2026-09-28", // lib/segments.ts
  comparisons: "2026-09-28", // lib/comparisons.ts
  landings: "2026-08-02", // lib/landings.ts
  trust: "2026-07-14", // lib/trust.ts
  checklists: "2026-08-26", // lib/checklists.ts
  guides: "2026-08-26", // lib/guides.ts
  usecases: "2026-06-24", // lib/usecases.ts
} as const;

const page = (
  path: string,
  lastModified: string,
  extra: Partial<SitemapPage> = {}
): SitemapPage => ({
  path,
  lastModified,
  priority: 0.5,
  changeFrequency: "monthly",
  ...extra,
});

function sitemapPages(): SitemapPage[] {
  return [
    page("", LASTMOD.home, { priority: 1, changeFrequency: "weekly" }),
    page("/demo", LASTMOD.demo),
    page("/pricing", LASTMOD.pricing),
    page("/security", LASTMOD.security),
    page("/about", LASTMOD.about),
    page("/privacy", LASTMOD.privacy),
    page("/terms", LASTMOD.terms),
    page("/faq", LASTMOD.faq),
    page("/hiring", LASTMOD.hiring),
    ...SEGMENT_KEYS.map((k) => page(`/for/${k}`, LASTMOD.segments)),
    // Сравнения — только на языках с собственным текстом: HR-сравнения без uz,
    // Госуслуги — только ru (российский контент без честных EN/ID/UZ версий).
    ...COMPARISON_KEYS.map((k) =>
      page(`/vs/${k}`, LASTMOD.comparisons, {
        locales: comparisonLocales(k),
        ...(k === "gosuslugi" ? { priority: 0.4 } : {}),
      })
    ),
    ...LANDING_KEYS.map((k) => page(`/${k}`, LASTMOD.landings)),
    ...TRUST_KEYS.map((k) => page(`/${k}`, LASTMOD.trust)),
    ...CHECKLIST_KEYS.map((k) => page(`/checklists/${k}`, LASTMOD.checklists)),
    ...GUIDE_KEYS.map((k) => page(`/blog/${k}`, LASTMOD.guides)),
    // Российские документы: только явный русский URL.
    ...USECASE_KEYS.map((k) =>
      page(`/keep/${k}`, LASTMOD.usecases, { locales: ["ru"], priority: 0.4 })
    ),
  ];
}

export default function sitemap(): MetadataRoute.Sitemap {
  return buildSitemap(sitemapPages());
}

import type { MetadataRoute } from "next";
import { SEGMENT_KEYS } from "@/lib/segments";
import { COMPARISON_KEYS } from "@/lib/comparisons";
import { USECASE_KEYS } from "@/lib/usecases";
import { LANDING_KEYS } from "@/lib/landings";
import { TRUST_KEYS } from "@/lib/trust";
import { CHECKLIST_KEYS } from "@/lib/checklists";
import { GUIDE_KEYS } from "@/lib/guides";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://www.doki.help";
const LOCALES = ["ru", "en", "id", "uz"] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const globalPages = [
    "",
    "/demo",
    "/pricing",
    "/security",
    "/about",
    "/privacy",
    "/terms",
    ...SEGMENT_KEYS.map((k) => `/for/${k}`),
    ...COMPARISON_KEYS.filter((k) => k !== "gosuslugi").map((k) => `/vs/${k}`),
    ...LANDING_KEYS.map((k) => `/${k}`),
    ...TRUST_KEYS.map((k) => `/${k}`),
    ...CHECKLIST_KEYS.map((k) => `/checklists/${k}`),
    ...GUIDE_KEYS.map((k) => `/blog/${k}`),
  ];
  const ruOnlyPages = [
    ...USECASE_KEYS.map((k) => `/keep/${k}`),
    "/vs/gosuslugi",
  ];

  const result: MetadataRoute.Sitemap = [];

  for (const path of globalPages) {
    const baseUrl = `${APP_URL}${path === "" ? "/" : path}`;
    const languages: Record<string, string> = { "x-default": baseUrl };
    for (const locale of LOCALES) {
      languages[locale] = `${APP_URL}/${locale}${path}`;
    }

    for (const url of [baseUrl, ...LOCALES.map((locale) => languages[locale])]) {
      result.push({
        url,
        changeFrequency: path === "" ? "weekly" : "monthly",
        priority: path === "" ? 1 : 0.5,
        alternates: { languages },
      });
    }
  }

  // Российские документы и Госуслуги не имеют честных EN/ID/UZ версий.
  // Индексируем только явный русский URL, без ложных hreflang-alternates.
  for (const path of ruOnlyPages) {
    const url = `${APP_URL}/ru${path}`;
    result.push({
      url,
      changeFrequency: "monthly",
      priority: 0.4,
      alternates: { languages: { ru: url } },
    });
  }

  return result;
}

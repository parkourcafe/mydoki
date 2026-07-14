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
  const pages = [
    "",
    "/demo",
    "/pricing",
    "/security",
    "/privacy",
    "/terms",
    ...SEGMENT_KEYS.map((k) => `/for/${k}`),
    ...COMPARISON_KEYS.map((k) => `/vs/${k}`),
    ...USECASE_KEYS.map((k) => `/keep/${k}`),
    ...LANDING_KEYS.map((k) => `/${k}`),
    ...TRUST_KEYS.map((k) => `/${k}`),
    ...CHECKLIST_KEYS.map((k) => `/checklists/${k}`),
    ...GUIDE_KEYS.map((k) => `/blog/${k}`),
  ];
  return pages.map((path) => {
    // hreflang: каждая языковая версия по своему URL (/ru/…, /en/… и т.д.).
    const languages: Record<string, string> = {};
    for (const l of LOCALES) languages[l] = `${APP_URL}/${l}${path}`;
    return {
      url: `${APP_URL}${path === "" ? "/" : path}`,
      changeFrequency: path === "" ? "weekly" : "monthly",
      priority: path === "" ? 1 : 0.5,
      alternates: { languages },
    };
  });
}

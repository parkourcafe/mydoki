import type { MetadataRoute } from "next";
import { SEGMENT_KEYS } from "@/lib/segments";
import { COMPARISON_KEYS } from "@/lib/comparisons";
import { USECASE_KEYS } from "@/lib/usecases";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://doki.help";

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
  ];
  return pages.map((path) => ({
    url: `${APP_URL}${path}`,
    changeFrequency: path === "" ? "weekly" : "monthly",
    priority: path === "" ? 1 : 0.5,
  }));
}

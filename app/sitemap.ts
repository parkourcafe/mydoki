import type { MetadataRoute } from "next";
import { SEGMENT_KEYS } from "@/lib/segments";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://doki.help";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = [
    "",
    "/privacy",
    "/terms",
    ...SEGMENT_KEYS.map((k) => `/for/${k}`),
  ];
  return pages.map((path) => ({
    url: `${APP_URL}${path}`,
    changeFrequency: path === "" ? "weekly" : "monthly",
    priority: path === "" ? 1 : 0.5,
  }));
}

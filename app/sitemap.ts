import type { MetadataRoute } from "next";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://doki.help";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = ["", "/privacy", "/terms"];
  return pages.map((path) => ({
    url: `${APP_URL}${path}`,
    changeFrequency: path === "" ? "weekly" : "monthly",
    priority: path === "" ? 1 : 0.5,
  }));
}

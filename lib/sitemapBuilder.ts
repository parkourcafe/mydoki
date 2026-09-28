import type { MetadataRoute } from "next";
import type { Locale } from "./i18n";
import { SITE_LOCALES, localizedAlternates, siteUrl } from "./seoAlternates.ts";

export type SitemapPage = {
  /** Путь без языкового префикса; "" — главная. */
  path: string;
  /** Локали с честным переводом. По умолчанию — все четыре. */
  locales?: readonly Locale[];
  /** YYYY-MM-DD — дата последней правки содержимого (см. app/sitemap.ts). */
  lastModified: string;
  priority: number;
  changeFrequency: "weekly" | "monthly";
};

/**
 * В sitemap идут только self-canonical URL: префиксные /{locale}{path}.
 * Без-префиксный URL отдаёт контент по cookie/Accept-Language и canonical
 * у него всегда префиксный (lib/seo.ts), поэтому он живёт только как
 * x-default в hreflang, но не как отдельная запись.
 */
export function buildSitemap(
  pages: readonly SitemapPage[],
  appUrl: string = siteUrl()
): MetadataRoute.Sitemap {
  const result: MetadataRoute.Sitemap = [];
  for (const page of pages) {
    const locales = page.locales ?? SITE_LOCALES;
    const { languages } = localizedAlternates(page.path, locales, locales[0], "ru", appUrl);
    for (const l of locales) {
      result.push({
        url: `${appUrl}/${l}${page.path}`,
        lastModified: page.lastModified,
        changeFrequency: page.changeFrequency,
        priority: page.priority,
        alternates: { languages },
      });
    }
  }
  return result;
}

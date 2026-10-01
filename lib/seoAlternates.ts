import type { Locale } from "./i18n";

// Чистые (без next/headers и server-only) SEO-хелперы: их используют и
// страницы, и sitemap, и юнит-тесты (node --experimental-strip-types).

export const SITE_LOCALES: readonly Locale[] = ["ru", "en", "id", "uz"];

export function siteUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL || "https://www.doki.help";
}

/**
 * canonical + hreflang для страницы, у которой перевод есть не на всех языках.
 *
 * `path` — путь без языкового префикса ("" для главной). В hreflang попадают
 * только `available` локали. Если посетитель пришёл на язык без перевода,
 * страница показывает `fallback`-версию — и canonical указывает на неё, а не
 * на саму себя: иначе /uz/… с русским текстом становится дублем /ru/….
 * x-default (без-префиксный URL) ставим, только когда перевод есть везде.
 */
export function localizedAlternates(
  path: string,
  available: readonly Locale[],
  served: Locale,
  fallback: Locale = "ru",
  appUrl: string = siteUrl()
): { canonical: string; languages: Record<string, string> } {
  const languages: Record<string, string> = {};
  if (SITE_LOCALES.every((l) => available.includes(l))) {
    languages["x-default"] = `${appUrl}${path === "" ? "/" : path}`;
  }
  for (const l of available) languages[l] = `${appUrl}/${l}${path}`;

  const canonicalLocale = available.includes(served)
    ? served
    : available.includes(fallback)
      ? fallback
      : available[0];
  return { canonical: `${appUrl}/${canonicalLocale}${path}`, languages };
}

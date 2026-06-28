import "server-only";
import { headers } from "next/headers";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://doki.help";
const LOCALES = ["ru", "en", "id", "uz"] as const;

/**
 * Канонический URL + hreflang-кластер для текущей страницы.
 *
 * middleware кладёт в заголовки:
 *   x-pathname — путь без языкового префикса (база для hreflang),
 *   x-orig-path — фактически запрошенный путь (может быть с /ru, /en…) — канон.
 *
 * Каждая языковая версия (/ru/…, /en/…) сама себе canonical, а hreflang
 * связывает их между собой; без-префиксный путь — x-default.
 */
export async function altLangs() {
  const h = await headers();
  const unpref = h.get("x-pathname") || "/";
  const orig = h.get("x-orig-path") || unpref;
  const base = unpref === "/" ? "" : unpref;

  const languages: Record<string, string> = { "x-default": `${APP_URL}${unpref}` };
  for (const l of LOCALES) languages[l] = `${APP_URL}/${l}${base}`;

  return {
    canonical: `${APP_URL}${orig}`,
    languages,
  };
}

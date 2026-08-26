import "server-only";
import { headers } from "next/headers";
import { getLocale } from "./i18n";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://www.doki.help";
const LOCALES = ["ru", "en", "id", "uz"] as const;

/**
 * Канонический URL + hreflang-кластер для текущей страницы.
 *
  * proxy (бывший middleware) кладёт в заголовок x-pathname путь без языкового префикса
 * (база для hreflang). Без-префиксный путь (/pricing) отдаёт контент по
 * getLocale() (cookie → Accept-Language) — он ИДЕНТИЧЕН своей префиксной
 * версии (/en/pricing), поэтому canonical всегда = префиксная форма
 * ФАКТИЧЕСКИ отданной локали (совпадает с getLocale(), которую использует
 * сама страница для рендера) — без-префиксный путь остаётся только
 * x-default, но никогда не self-canonical. Это закрывает дубликат-риск
 * "/ vs /en" на одинаковый английский контент.
 */
export async function altLangs() {
  const h = await headers();
  const unpref = h.get("x-pathname") || "/";
  const base = unpref === "/" ? "" : unpref;
  const served = await getLocale();

  const languages: Record<string, string> = { "x-default": `${APP_URL}${unpref}` };
  for (const l of LOCALES) languages[l] = `${APP_URL}/${l}${base}`;

  return {
    canonical: `${APP_URL}/${served}${base}`,
    languages,
  };
}

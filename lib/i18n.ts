import "server-only";
import { cookies, headers } from "next/headers";

export type Locale = "ru" | "en";

/**
 * Язык интерфейса: явный выбор из cookie `locale`, иначе — по языку браузера
 * (Accept-Language). Русский → ru, всё остальное → en (для иностранцев).
 */
export async function getLocale(): Promise<Locale> {
  const fromCookie = (await cookies()).get("locale")?.value;
  if (fromCookie === "ru" || fromCookie === "en") return fromCookie;

  const al = (await headers()).get("accept-language") ?? "";
  const primary = al.split(",")[0]?.trim().toLowerCase() ?? "";
  return primary.startsWith("ru") ? "ru" : "en";
}

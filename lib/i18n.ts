import "server-only";
import { cookies, headers } from "next/headers";

export type Locale = "ru" | "en" | "id";

/**
 * Язык интерфейса: явный выбор из cookie `locale`, иначе — по языку браузера
 * (Accept-Language). Русский → ru, индонезийский → id, остальное → en.
 */
export async function getLocale(): Promise<Locale> {
  const fromCookie = (await cookies()).get("locale")?.value;
  if (fromCookie === "ru" || fromCookie === "en" || fromCookie === "id")
    return fromCookie;

  const al = (await headers()).get("accept-language") ?? "";
  const primary = al.split(",")[0]?.trim().toLowerCase() ?? "";
  if (primary.startsWith("ru")) return "ru";
  if (primary.startsWith("id")) return "id";
  return "en";
}

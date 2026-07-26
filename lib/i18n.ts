import "server-only";
import { cookies, headers } from "next/headers";
import { isNativeUserAgent, isRuStoreUserAgent } from "./nativeUserAgent";

export type Locale = "ru" | "en" | "id" | "uz";

const LOCALES: Locale[] = ["ru", "en", "id", "uz"];

// Temporary App Review account fallback. Production can override this without
// a code change by setting APP_REVIEW_EMAIL.
const DEFAULT_REVIEW_EMAIL = "saidalarust+doki-review-20260715@gmail.com";

export function isAppReviewAccountEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const configured = (process.env.APP_REVIEW_EMAIL || DEFAULT_REVIEW_EMAIL)
    .trim()
    .toLowerCase();
  return !!configured && email.trim().toLowerCase() === configured;
}

/**
 * Язык интерфейса: явный выбор из cookie `locale`, иначе — по языку браузера
 * (Accept-Language). ru → русский, id → индонезийский, uz → узбекский, остальное → en.
 */
export async function getLocale(): Promise<Locale> {
  const requestHeaders = await headers();

  // Store shells have fixed listing languages. The RuStore build must remain
  // Russian even if a web cookie was previously set to another locale.
  const ua = requestHeaders.get("user-agent") || "";
  if (isRuStoreUserAgent(ua)) return "ru";
  if (isNativeUserAgent(ua)) return "en";

  // Языковой префикс в URL (/ru, /en…) — middleware кладёт его в заголовок.
  const fromPath = requestHeaders.get("x-locale") as Locale | undefined;
  if (fromPath && LOCALES.includes(fromPath)) return fromPath;

  const fromCookie = (await cookies()).get("locale")?.value as Locale | undefined;
  if (fromCookie && LOCALES.includes(fromCookie)) return fromCookie;

  const al = requestHeaders.get("accept-language") ?? "";
  const primary = al.split(",")[0]?.trim().toLowerCase() ?? "";
  if (primary.startsWith("ru")) return "ru";
  if (primary.startsWith("id")) return "id";
  if (primary.startsWith("uz")) return "uz";
  return "en";
}

/** Public hiring links support EN/ID only for the Indonesia launch. */
export async function getPublicHiringLocale(): Promise<"en" | "id"> {
  return (await getLocale()) === "id" ? "id" : "en";
}

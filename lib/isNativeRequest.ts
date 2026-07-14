import "server-only";
import { headers } from "next/headers";

// Метка, которую нативная обёртка Capacitor добавляет в User-Agent
// (см. appendUserAgent в capacitor.config.ts).
export const NATIVE_UA_MARKER = "dokiNativeApp";

/**
 * Пришёл ли запрос из нативной iOS/Android-обёртки. Используется на сервере,
 * чтобы НЕ отдавать приложению сторонние аналитики (App Privacy: «not tracking»).
 * В обычном браузере/PWA вернёт false, и аналитика работает как раньше.
 */
export async function isNativeRequest(): Promise<boolean> {
  const ua = (await headers()).get("user-agent") || "";
  return ua.includes(NATIVE_UA_MARKER);
}

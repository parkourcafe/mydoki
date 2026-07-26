import "server-only";
import { headers } from "next/headers";
import { isNativeUserAgent } from "./nativeUserAgent";

export {
  NATIVE_UA_MARKER,
  NATIVE_UA_MARKERS,
  RUSTORE_UA_MARKER,
  isNativeUserAgent,
  isRuStoreUserAgent,
} from "./nativeUserAgent";

/**
 * Пришёл ли запрос из нативной iOS/Android-обёртки. Используется на сервере,
 * чтобы НЕ отдавать приложению сторонние аналитики (App Privacy: «not tracking»).
 * В обычном браузере/PWA вернёт false, и аналитика работает как раньше.
 */
export async function isNativeRequest(): Promise<boolean> {
  const ua = (await headers()).get("user-agent") || "";
  return isNativeUserAgent(ua);
}

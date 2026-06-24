/**
 * Безопасный локальный путь для редиректа после входа.
 * Принимаем только относительные пути на этом же сайте (открытые редиректы
 * на чужие домены запрещены).
 */
export function safeNextPath(raw: unknown, fallback = "/my"): string {
  const s = typeof raw === "string" ? raw : "";
  if (s.startsWith("/") && !s.startsWith("//") && !s.startsWith("/\\")) return s;
  return fallback;
}

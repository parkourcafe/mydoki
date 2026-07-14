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

/**
 * Дописывает одноразовый флаг аналитического события к локальному пути
 * (?ev=…&m=…). Клиент читает его после успешного редиректа, шлёт событие и
 * убирает из URL (см. components/AnalyticsEvents.tsx). Так события входа/
 * регистрации/создания срабатывают только по факту успеха, а не по клику.
 */
export function withEv(path: string, ev: string, method?: string): string {
  const sep = path.includes("?") ? "&" : "?";
  const m = method ? `&m=${encodeURIComponent(method)}` : "";
  return `${path}${sep}ev=${encodeURIComponent(ev)}${m}`;
}

"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { initPostHog, pageview, setCaptureEnabled } from "@/lib/analytics";
import { isPrivatePath } from "@/lib/analyticsPrivatePaths";

/**
 * Инициализирует PostHog один раз и шлёт $pageview при смене маршрута.
 * Ничего не рендерит. Живёт рядом с Яндекс.Метрикой в корневом layout.
 *
 * autocapture у PostHog слушает клики глобально и переживает SPA-переходы —
 * поэтому на приватных путях (реальные документы/данные кандидата в DOM) мы
 * явно выключаем capture через opt_out_capturing(), а не просто не шлём
 * pageview(). См. lib/analyticsPrivatePaths.ts.
 */
export default function PostHogProvider() {
  const pathname = usePathname();

  useEffect(() => {
    initPostHog();
  }, []);

  useEffect(() => {
    const isPrivate = isPrivatePath(pathname ?? "/");
    setCaptureEnabled(!isPrivate);
    if (!isPrivate) pageview();
  }, [pathname]);

  return null;
}

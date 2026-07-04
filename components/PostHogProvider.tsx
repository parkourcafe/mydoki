"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { initPostHog, pageview } from "@/lib/analytics";

/**
 * Инициализирует PostHog один раз и шлёт $pageview при смене маршрута.
 * Ничего не рендерит. Живёт рядом с Яндекс.Метрикой в корневом layout.
 */
export default function PostHogProvider() {
  const pathname = usePathname();

  useEffect(() => {
    initPostHog();
  }, []);

  useEffect(() => {
    pageview();
  }, [pathname]);

  return null;
}

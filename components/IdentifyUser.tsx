"use client";

import { useEffect } from "react";
import { initPostHog, identify } from "@/lib/analytics";

/**
 * Связывает текущую сессию PostHog со стабильным ID пользователя. Монтируется
 * в защищённых layout'ах (/my, /employer) и ТОЛЬКО для не-нативных запросов
 * (в нативной обёртке сторонняя аналитика выключена). Ничего не рендерит.
 *
 * Сам вызывает initPostHog() перед identify — порядок эффектов между
 * компонентами не гарантирован, а init идемпотентен.
 */
export default function IdentifyUser({
  userId,
  locale,
}: {
  userId: string;
  locale?: string;
}) {
  useEffect(() => {
    if (!userId) return;
    initPostHog();
    identify(userId, locale ? { locale } : undefined);
  }, [userId, locale]);

  return null;
}

"use client";

import { Suspense, useEffect, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { initPostHog, track } from "@/lib/analytics";

// Одноразовые события, приходящие флагом ?ev= после успешного серверного
// редиректа (вход/регистрация/создание). Только success-based — не срабатывают
// на неудачных попытках.
const ALLOWED = new Set(["logged_in", "signed_up", "member_added"]);

function Reader() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const done = useRef(false);

  useEffect(() => {
    const ev = params.get("ev");
    if (!ev || done.current || !ALLOWED.has(ev)) return;
    done.current = true;

    initPostHog();
    const method = params.get("m");
    track(ev, method ? { method } : undefined);

    // Убираем одноразовые параметры, чтобы событие не повторилось при
    // перезагрузке/шаринге ссылки.
    const sp = new URLSearchParams(params.toString());
    sp.delete("ev");
    sp.delete("m");
    const qs = sp.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }, [params, router, pathname]);

  return null;
}

/**
 * Читатель одноразовых аналитических флагов из URL. Монтируется в защищённых
 * layout'ах (только для не-нативных запросов — в приложении аналитика выключена).
 * useSearchParams обёрнут в Suspense (требование Next для клиентского чтения query).
 */
export default function AnalyticsEvents() {
  return (
    <Suspense fallback={null}>
      <Reader />
    </Suspense>
  );
}

"use client";

import { useEffect, useRef } from "react";

// Публичный Site Key (можно переопределить переменной в Vercel).
const SITE_KEY =
  process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "0x4AAAAAADvZkW3XBHdLV6DR";

type TurnstileApi = {
  render: (el: HTMLElement, opts: Record<string, unknown>) => string;
  remove: (id: string) => void;
};
declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

const SCRIPT_SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js";

/**
 * Cloudflare Turnstile — «невидимая капча» против спам-откликов. Отдаёт токен
 * через onToken (сервер проверит его в submitApplication). Если Site Key не
 * задан — ничего не рендерит и не мешает отправке.
 */
export default function TurnstileWidget({
  onToken,
}: {
  onToken: (token: string | null) => void;
}) {
  const boxRef = useRef<HTMLDivElement | null>(null);
  const widgetId = useRef<string | null>(null);
  const cb = useRef(onToken);
  cb.current = onToken;

  useEffect(() => {
    if (!SITE_KEY) return;
    let cancelled = false;

    function render() {
      if (cancelled || !boxRef.current || widgetId.current || !window.turnstile)
        return;
      widgetId.current = window.turnstile.render(boxRef.current, {
        sitekey: SITE_KEY,
        callback: (t: string) => cb.current(t),
        "expired-callback": () => cb.current(null),
        "error-callback": () => cb.current(null),
      });
    }

    if (window.turnstile) {
      render();
    } else {
      let s = document.querySelector<HTMLScriptElement>(
        `script[src="${SCRIPT_SRC}"]`,
      );
      if (!s) {
        s = document.createElement("script");
        s.src = SCRIPT_SRC;
        s.async = true;
        s.defer = true;
        document.head.appendChild(s);
      }
      s.addEventListener("load", render);
      // Подстраховка: если скрипт уже был, ждём готовности объекта.
      const iv = setInterval(() => {
        if (window.turnstile) {
          render();
          clearInterval(iv);
        }
      }, 300);
      setTimeout(() => clearInterval(iv), 12000);
    }

    return () => {
      cancelled = true;
      if (widgetId.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetId.current);
        } catch {
          /* noop */
        }
      }
      widgetId.current = null;
    };
  }, []);

  if (!SITE_KEY) return null;
  return <div ref={boxRef} className="my-1" />;
}

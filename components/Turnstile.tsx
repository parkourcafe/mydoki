"use client";

import { useEffect, useRef } from "react";

// Общий виджет Cloudflare Turnstile (explicit render). Нет site key → не
// рисуется, токен остаётся null, сервер пропускает проверку (dev).
type TurnstileAPI = {
  render: (el: HTMLElement, opts: Record<string, unknown>) => string;
  remove: (id: string) => void;
};
declare global {
  interface Window {
    turnstile?: TurnstileAPI;
  }
}

export default function Turnstile({ onToken }: { onToken: (t: string | null) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  useEffect(() => {
    if (!siteKey || !ref.current) return;
    let widgetId: string | undefined;
    const el = ref.current;

    function render() {
      const ts = window.turnstile;
      if (!ts || !el) return;
      widgetId = ts.render(el, {
        sitekey: siteKey,
        callback: (token: string) => onToken(token),
        "expired-callback": () => onToken(null),
        "error-callback": () => onToken(null),
      });
    }

    if (window.turnstile) {
      render();
    } else {
      const id = "cf-turnstile-script";
      let s = document.getElementById(id) as HTMLScriptElement | null;
      if (!s) {
        s = document.createElement("script");
        s.id = id;
        s.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
        s.async = true;
        document.head.appendChild(s);
      }
      s.addEventListener("load", render);
    }

    return () => {
      const ts = window.turnstile;
      if (ts && widgetId) {
        try {
          ts.remove(widgetId);
        } catch {
          /* noop */
        }
      }
    };
  }, [siteKey, onToken]);

  if (!siteKey) return null;
  return <div ref={ref} className="mt-1" />;
}

"use client";

import { useEffect, useState } from "react";
import type { Locale } from "@/lib/i18n";
import { savePushSubscription, removePushSubscription } from "@/app/push/actions";

const M = {
  en: { enable: "🔔 Turn on notifications", disable: "Turn off notifications" },
  id: { enable: "🔔 Aktifkan notifikasi", disable: "Matikan notifikasi" },
  ru: { enable: "🔔 Включить уведомления", disable: "Выключить уведомления" },
  uz: { enable: "🔔 Bildirishnomalarni yoqish", disable: "Bildirishnomalarni o‘chirish" },
} as const;

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const arr = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);
  return arr;
}

/**
 * Контекстная кнопка подписки на пуши (T9). Никогда не просит разрешение на
 * загрузке — только по клику. Скрыта, если браузер/VAPID не поддерживают.
 */
export default function PushOptIn({ locale, label }: { locale: Locale; label?: string }) {
  const t = M[locale];
  const [state, setState] = useState<"loading" | "unsupported" | "off" | "on">("loading");
  const [busy, setBusy] = useState(false);
  const vapid = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

  useEffect(() => {
    // Проверка поддержки и подписки — асинхронная цепочка: ни один setState
    // не выполняется синхронно в теле эффекта
    // (react-hooks/set-state-in-effect).
    let cancelled = false;
    void Promise.resolve().then(async () => {
      if (
        typeof window === "undefined" ||
        !("serviceWorker" in navigator) ||
        !("PushManager" in window) ||
        !vapid
      ) {
        if (!cancelled) setState("unsupported");
        return;
      }
      try {
        const reg = await navigator.serviceWorker.ready;
        const sub = await reg.pushManager.getSubscription();
        if (!cancelled) setState(sub ? "on" : "off");
      } catch {
        if (!cancelled) setState("off");
      }
    });
    return () => {
      cancelled = true;
    };
  }, [vapid]);

  async function enable() {
    if (!vapid) return;
    setBusy(true);
    try {
      const perm = await Notification.requestPermission();
      if (perm !== "granted") return;
      const reg = await navigator.serviceWorker.register("/sw.js");
      await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapid) as unknown as BufferSource,
      });
      const json = sub.toJSON();
      if (json.keys?.p256dh && json.keys?.auth) {
        await savePushSubscription(
          { endpoint: sub.endpoint, p256dh: json.keys.p256dh, auth: json.keys.auth },
          locale
        );
        setState("on");
      }
    } catch {
      /* пользователь отклонил / браузер не дал */
    } finally {
      setBusy(false);
    }
  }

  async function disable() {
    setBusy(true);
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await removePushSubscription(sub.endpoint);
        await sub.unsubscribe();
      }
      setState("off");
    } catch {
      /* noop */
    } finally {
      setBusy(false);
    }
  }

  if (state === "loading" || state === "unsupported") return null;

  return (
    <button
      type="button"
      onClick={state === "on" ? disable : enable}
      disabled={busy}
      className={
        state === "on"
          ? "text-sm text-slate-500 underline hover:text-slate-700 disabled:opacity-50"
          : "btn-primary disabled:opacity-50"
      }
    >
      {state === "on" ? t.disable : label || t.enable}
    </button>
  );
}

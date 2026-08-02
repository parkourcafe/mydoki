"use client";

import { useState } from "react";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import type { Locale } from "@/lib/i18n";

const M = {
  ru: {
    text: "Подтвердите email, чтобы загружать и делиться документами. Ссылку мы отправили на",
    resend: "Отправить письмо повторно",
    sending: "Отправляю…",
    sent: "Отправили новую ссылку. Проверьте почту (и «Спам»).",
  },
  en: {
    text: "Verify your email to upload and share documents. We sent the link to",
    resend: "Resend verification email",
    sending: "Sending…",
    sent: "We've sent a new link. Check your inbox (and Spam).",
  },
  id: {
    text: "Verifikasi email untuk mengunggah dan berbagi dokumen. Tautan kami kirim ke",
    resend: "Kirim ulang email verifikasi",
    sending: "Mengirim…",
    sent: "Kami kirim tautan baru. Periksa kotak masuk (dan Spam).",
  },
  uz: {
    text: "Hujjatlarni yuklash va ulashish uchun emailni tasdiqlang. Havolani yubordik:",
    resend: "Tasdiqlash xatini qayta yuborish",
    sending: "Yuborilmoqda…",
    sent: "Yangi havola yubordik. Pochtangizni (va Spam) tekshiring.",
  },
} as const;

/**
 * Баннер «подтвердите email» в личном кабинете (P0-1, компромисс). Показывается
 * только неподтверждённым; загрузка/шеринг у них уже закрыты на сервере. Тут —
 * заметная подсказка + повторная отправка письма в один клик.
 */
export default function VerifyEmailBanner({
  locale,
  email,
}: {
  locale: Locale;
  email: string;
}) {
  const t = M[locale];
  const [state, setState] = useState<"idle" | "sending" | "sent">("idle");

  async function resend() {
    if (!email) return;
    setState("sending");
    const supabase = getSupabaseBrowser();
    // Ошибку глушим намеренно (не раскрываем наличие аккаунта / лимиты).
    await supabase.auth.resend({ type: "signup", email });
    setState("sent");
  }

  return (
    <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
      {state === "sent" ? (
        <p>✅ {t.sent}</p>
      ) : (
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="min-w-0">
            ✉️ {t.text} <span className="font-medium break-all">{email}</span>.
          </p>
          <button
            type="button"
            onClick={resend}
            disabled={state === "sending"}
            className="shrink-0 rounded-lg border border-amber-300 bg-white px-3 py-1.5 text-sm font-medium text-amber-800 hover:bg-amber-100 disabled:opacity-50"
          >
            {state === "sending" ? t.sending : t.resend}
          </button>
        </div>
      )}
    </div>
  );
}

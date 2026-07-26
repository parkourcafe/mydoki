"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Locale } from "@/lib/i18n";
import {
  requestEmployerVerification,
  confirmEmployerVerification,
} from "@/app/employer/actions";

const M = {
  en: {
    title: "Verify to publish",
    text: "To create a vacancy, confirm your email. We'll send a 6-digit code to your contact email.",
    send: "Send code",
    sending: "Sending…",
    sent: "Code sent. Check your email.",
    codeLabel: "Verification code",
    confirm: "Confirm",
    confirming: "Confirming…",
    resend: "Resend code",
    resendIn: (s: number) => `Resend in ${s}s`,
    errSend: "Couldn't send the code. Please try again.",
    errEmailConfig: "Email delivery is temporarily unavailable. Please contact support.",
    errCode: "Enter the 6-digit code.",
    errWrong: "Wrong code. Please try again.",
    errExpired: "The code expired. Request a new one.",
    errTooMany: "Too many attempts. Request a new code.",
  },
  id: {
    title: "Verifikasi untuk mempublikaslikan",
    text: "Untuk membuat lowongan, konfirmasi email Anda. Kami kirim kode 6 digit ke email kontak.",
    send: "Kirim kode",
    sending: "Mengirim…",
    sent: "Kode terkirim. Cek email Anda.",
    codeLabel: "Kode verifikasi",
    confirm: "Konfirmasi",
    confirming: "Mengonfirmasi…",
    resend: "Kirim ulang",
    resendIn: (s: number) => `Kirim ulang ${s}d`,
    errSend: "Gagal mengirim kode. Coba lagi.",
    errEmailConfig: "Pengiriman email sedang tidak tersedia. Hubungi dukungan.",
    errCode: "Masukkan kode 6 digit.",
    errWrong: "Kode salah. Coba lagi.",
    errExpired: "Kode kedaluwarsa. Minta yang baru.",
    errTooMany: "Terlalu banyak percobaan. Minta kode baru.",
  },
  ru: {
    title: "Подтвердите, чтобы публиковать",
    text: "Чтобы создать вакансию, подтвердите email. Отправим 6-значный код на контактный адрес.",
    send: "Отправить код",
    sending: "Отправка…",
    sent: "Код отправлен. Проверьте почту.",
    codeLabel: "Код подтверждения",
    confirm: "Подтвердить",
    confirming: "Проверка…",
    resend: "Отправить снова",
    resendIn: (s: number) => `Повтор через ${s} с`,
    errSend: "Не удалось отправить код. Попробуйте ещё раз.",
    errEmailConfig: "Отправка email временно недоступна. Обратитесь в поддержку.",
    errCode: "Введите 6-значный код.",
    errWrong: "Неверный код. Попробуйте ещё раз.",
    errExpired: "Код истёк. Запросите новый.",
    errTooMany: "Слишком много попыток. Запросите новый код.",
  },
  uz: {
    title: "Chop etish uchun tasdiqlang",
    text: "Vakansiya yaratish uchun emailni tasdiqlang. Aloqa emailingizga 6 xonali kod yuboramiz.",
    send: "Kod yuborish",
    sending: "Yuborilmoqda…",
    sent: "Kod yuborildi. Emailni tekshiring.",
    codeLabel: "Tasdiqlash kodi",
    confirm: "Tasdiqlash",
    confirming: "Tekshirilmoqda…",
    resend: "Qayta yuborish",
    resendIn: (s: number) => `${s} s dan keyin`,
    errSend: "Kodni yuborib bo‘lmadi. Qayta urining.",
    errEmailConfig: "Email yuborish vaqtincha ishlamayapti. Qo‘llab-quvvatlashga murojaat qiling.",
    errCode: "6 xonali kodni kiriting.",
    errWrong: "Kod noto‘g‘ri. Qayta urining.",
    errExpired: "Kod muddati tugadi. Yangisini so‘rang.",
    errTooMany: "Urinishlar ko‘p. Yangi kod so‘rang.",
  },
} as const;

export default function EmployerVerification({ locale }: { locale: Locale }) {
  const t = M[locale];
  const router = useRouter();
  const [sent, setSent] = useState(false);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (cooldown <= 0) return;
    const h = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(h);
  }, [cooldown]);

  async function send() {
    setBusy(true);
    setError(null);
    const r = await requestEmployerVerification();
    setBusy(false);
    if (r.ok) {
      setSent(true);
      setCooldown(60);
    } else {
      setError(r.error === "not_configured" ? t.errEmailConfig : t.errSend);
    }
  }

  async function confirm() {
    if (code.trim().length < 6) {
      setError(t.errCode);
      return;
    }
    setBusy(true);
    setError(null);
    const r = await confirmEmployerVerification(code.trim());
    setBusy(false);
    if (r.ok) {
      router.refresh();
      return;
    }
    setError(
      r.error === "expired" ? t.errExpired : r.error === "too_many" ? t.errTooMany : t.errWrong
    );
  }

  return (
    <div className="mx-auto max-w-lg">
      <div className="card space-y-4">
        <div>
          <h1 className="text-xl font-semibold">{t.title}</h1>
          <p className="mt-1 text-sm text-slate-500">{t.text}</p>
        </div>

        {!sent ? (
          <button type="button" onClick={send} disabled={busy} className="btn-primary w-full">
            {busy ? t.sending : t.send}
          </button>
        ) : (
          <>
            <p className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">{t.sent}</p>
            <div>
              <label className="label">{t.codeLabel}</label>
              <input
                className="input tracking-widest"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                inputMode="numeric"
                autoComplete="one-time-code"
                placeholder="••••••"
              />
            </div>
            <button type="button" onClick={confirm} disabled={busy} className="btn-primary w-full">
              {busy ? t.confirming : t.confirm}
            </button>
            <button
              type="button"
              onClick={send}
              disabled={busy || cooldown > 0}
              className="btn-ghost w-full disabled:opacity-50"
            >
              {cooldown > 0 ? t.resendIn(cooldown) : t.resend}
            </button>
          </>
        )}

        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
        )}
      </div>
    </div>
  );
}

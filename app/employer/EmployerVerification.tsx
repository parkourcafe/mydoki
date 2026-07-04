"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Locale } from "@/lib/i18n";
import {
  requestEmployerVerification,
  confirmEmployerVerification,
} from "@/app/employer/actions";

const M = {
  ru: {
    title: "Подтвердите, что вы работодатель",
    intro:
      "Чтобы публиковать вакансии, подтвердите email кодом. Это защищает кандидатов от фейковых работодателей.",
    sendTo: "Отправим код на:",
    send: "Отправить код",
    sending: "Отправляю…",
    sent: "Код отправлен на",
    codeLabel: "Код из письма",
    codePh: "6 цифр",
    confirm: "Подтвердить",
    confirming: "Проверяю…",
    resend: "Отправить код заново",
    okMsg: "Готово! Аккаунт подтверждён.",
    errWrong: "Неверный код. Проверьте письмо и попробуйте снова.",
    errExpired: "Код истёк. Запросите новый.",
    errTooMany: "Слишком много попыток. Запросите новый код позже.",
    errNoEmail: "У профиля нет email — добавьте его в настройках компании.",
    errSend: "Не удалось отправить письмо. Попробуйте ещё раз.",
    errGeneric: "Что-то пошло не так. Попробуйте ещё раз.",
  },
  en: {
    title: "Verify you're an employer",
    intro:
      "To post vacancies, confirm your email with a code. This protects candidates from fake employers.",
    sendTo: "We'll send the code to:",
    send: "Send code",
    sending: "Sending…",
    sent: "Code sent to",
    codeLabel: "Code from the email",
    codePh: "6 digits",
    confirm: "Confirm",
    confirming: "Checking…",
    resend: "Send the code again",
    okMsg: "Done! Account verified.",
    errWrong: "Wrong code. Check the email and try again.",
    errExpired: "The code has expired. Request a new one.",
    errTooMany: "Too many attempts. Request a new code later.",
    errNoEmail: "Your profile has no email — add one in company settings.",
    errSend: "Couldn't send the email. Please try again.",
    errGeneric: "Something went wrong. Please try again.",
  },
  id: {
    title: "Verifikasi bahwa Anda perusahaan",
    intro:
      "Untuk memasang lowongan, konfirmasi email Anda dengan kode. Ini melindungi kandidat dari perusahaan palsu.",
    sendTo: "Kode akan dikirim ke:",
    send: "Kirim kode",
    sending: "Mengirim…",
    sent: "Kode dikirim ke",
    codeLabel: "Kode dari email",
    codePh: "6 digit",
    confirm: "Konfirmasi",
    confirming: "Memeriksa…",
    resend: "Kirim ulang kode",
    okMsg: "Selesai! Akun terverifikasi.",
    errWrong: "Kode salah. Periksa email dan coba lagi.",
    errExpired: "Kode kedaluwarsa. Minta yang baru.",
    errTooMany: "Terlalu banyak percobaan. Minta kode baru nanti.",
    errNoEmail: "Profil tak punya email — tambahkan di pengaturan perusahaan.",
    errSend: "Gagal mengirim email. Coba lagi.",
    errGeneric: "Terjadi kesalahan. Coba lagi.",
  },
  uz: {
    title: "Ish beruvchi ekaningizni tasdiqlang",
    intro:
      "Vakansiya joylash uchun emailingizni kod bilan tasdiqlang. Bu nomzodlarni soxta ish beruvchilardan himoya qiladi.",
    sendTo: "Kod yuboriladi:",
    send: "Kod yuborish",
    sending: "Yuborilmoqda…",
    sent: "Kod yuborildi:",
    codeLabel: "Xatdagi kod",
    codePh: "6 raqam",
    confirm: "Tasdiqlash",
    confirming: "Tekshirilmoqda…",
    resend: "Kodni qayta yuborish",
    okMsg: "Tayyor! Akkaunt tasdiqlandi.",
    errWrong: "Kod noto‘g‘ri. Xatni tekshiring va qayta urining.",
    errExpired: "Kod muddati tugadi. Yangisini so‘rang.",
    errTooMany: "Urinishlar juda ko‘p. Keyinroq yangi kod so‘rang.",
    errNoEmail: "Profilda email yo‘q — kompaniya sozlamalarida qo‘shing.",
    errSend: "Xat yuborilmadi. Qayta urining.",
    errGeneric: "Xatolik yuz berdi. Qayta urining.",
  },
} as const;

export default function EmployerVerification({ locale }: { locale: Locale }) {
  const t = M[locale];
  const router = useRouter();
  const [stage, setStage] = useState<"start" | "code">("start");
  const [sentTo, setSentTo] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function mapErr(key: string) {
    switch (key) {
      case "no_email":
        return t.errNoEmail;
      case "email_off":
      case "send_failed":
        return t.errSend;
      case "expired":
        return t.errExpired;
      case "too_many":
        return t.errTooMany;
      default:
        return t.errGeneric;
    }
  }

  async function onSend() {
    setBusy(true);
    setError(null);
    const res = await requestEmployerVerification();
    setBusy(false);
    if ("error" in res) {
      setError(mapErr(res.error));
    } else {
      setSentTo(res.sentTo);
      setStage("code");
    }
  }

  async function onConfirm() {
    setBusy(true);
    setError(null);
    const res = await confirmEmployerVerification(code);
    setBusy(false);
    if ("error" in res) {
      setError(mapErr(res.error));
    } else if (res.ok) {
      router.refresh(); // verified_at теперь заполнен → покажется форма вакансии
    } else {
      setError(t.errWrong);
    }
  }

  return (
    <div className="mx-auto max-w-lg">
      <div className="card space-y-4">
        <div>
          <h1 className="text-xl font-semibold">🔐 {t.title}</h1>
          <p className="mt-1 text-sm text-slate-500">{t.intro}</p>
        </div>

        {stage === "start" ? (
          <button
            type="button"
            onClick={onSend}
            disabled={busy}
            className="btn-primary w-full"
          >
            {busy ? t.sending : t.send}
          </button>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-slate-600">
              {t.sent} <span className="font-medium">{sentTo}</span>
            </p>
            <div>
              <label className="label">{t.codeLabel}</label>
              <input
                className="input tracking-[0.4em]"
                value={code}
                onChange={(e) =>
                  setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                }
                placeholder={t.codePh}
                inputMode="numeric"
                autoComplete="one-time-code"
              />
            </div>
            <button
              type="button"
              onClick={onConfirm}
              disabled={busy || code.length !== 6}
              className="btn-primary w-full"
            >
              {busy ? t.confirming : t.confirm}
            </button>
            <button
              type="button"
              onClick={onSend}
              disabled={busy}
              className="w-full text-sm text-brand-600 hover:underline"
            >
              {t.resend}
            </button>
          </div>
        )}

        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>
    </div>
  );
}

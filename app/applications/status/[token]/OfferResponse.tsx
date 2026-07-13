"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Locale } from "@/lib/i18n";
import {
  type CandidateOffer,
  offerStatusLabel,
} from "@/lib/offer";
import { employmentTypeLabel } from "@/lib/employment";
import { respondToOffer } from "@/app/applications/actions";

const M = {
  ru: {
    title: "Предложение о работе",
    position: "Должность",
    type: "Тип занятости",
    compensation: "Оплата",
    start: "Дата начала",
    terms: "Условия",
    consent: "Я ознакомился с условиями и принимаю предложение",
    accept: "Принять предложение",
    decline: "Отклонить",
    accepted: "Вы приняли предложение 🎉 Работодатель свяжется с вами для оформления.",
    declined: "Вы отклонили предложение.",
    errConsent: "Отметьте согласие, чтобы принять.",
    errGeneric: "Не удалось отправить ответ. Обновите страницу и попробуйте снова.",
    disclaimerTitle: "Важно",
  },
  en: {
    title: "Job offer",
    position: "Position",
    type: "Employment type",
    compensation: "Compensation",
    start: "Start date",
    terms: "Terms",
    consent: "I've reviewed the terms and accept the offer",
    accept: "Accept offer",
    decline: "Decline",
    accepted: "You accepted the offer 🎉 The employer will reach out to finalize.",
    declined: "You declined the offer.",
    errConsent: "Check the consent box to accept.",
    errGeneric: "Couldn't submit your response. Refresh and try again.",
    disclaimerTitle: "Important",
  },
  id: {
    title: "Penawaran kerja",
    position: "Posisi",
    type: "Jenis kerja",
    compensation: "Kompensasi",
    start: "Tanggal mulai",
    terms: "Ketentuan",
    consent: "Saya telah membaca ketentuan dan menerima penawaran",
    accept: "Terima penawaran",
    decline: "Tolak",
    accepted: "Anda menerima penawaran 🎉 Perusahaan akan menghubungi untuk proses.",
    declined: "Anda menolak penawaran.",
    errConsent: "Centang persetujuan untuk menerima.",
    errGeneric: "Gagal mengirim jawaban. Muat ulang dan coba lagi.",
    disclaimerTitle: "Penting",
  },
  uz: {
    title: "Ish taklifi",
    position: "Lavozim",
    type: "Bandlik turi",
    compensation: "Toʻlov",
    start: "Boshlanish sanasi",
    terms: "Shartlar",
    consent: "Men shartlar bilan tanishdim va taklifni qabul qilaman",
    accept: "Taklifni qabul qilish",
    decline: "Rad etish",
    accepted: "Siz taklifni qabul qildingiz 🎉 Ish beruvchi rasmiylashtirish uchun bogʻlanadi.",
    declined: "Siz taklifni rad etdingiz.",
    errConsent: "Qabul qilish uchun rozilikni belgilang.",
    errGeneric: "Javob yuborilmadi. Sahifani yangilab, qayta urining.",
    disclaimerTitle: "Muhim",
  },
} as const;

export default function OfferResponse({
  locale,
  token,
  offer,
}: {
  locale: Locale;
  token: string;
  offer: CandidateOffer;
}) {
  const t = M[locale];
  const router = useRouter();
  const [pending, start] = useTransition();
  const [consent, setConsent] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  // Результат ответа в этой сессии (мгновенная обратная связь до refresh).
  const [done, setDone] = useState<"accepted" | "declined" | null>(null);

  const status = done ?? offer.status;

  if (status === "accepted") {
    return (
      <div className="rounded-lg bg-emerald-50 p-4 text-sm text-emerald-800">
        <p className="font-medium">{t.title}</p>
        <p className="mt-1">{t.accepted}</p>
      </div>
    );
  }
  if (status === "declined") {
    return (
      <div className="rounded-lg bg-slate-50 p-4 text-sm text-slate-600">
        <p className="font-medium">{t.title}</p>
        <p className="mt-1">{t.declined}</p>
      </div>
    );
  }

  function respond(accept: boolean) {
    setErr(null);
    if (accept && !consent) {
      setErr(t.errConsent);
      return;
    }
    start(async () => {
      const res = await respondToOffer(token, accept, consent);
      if (!res.ok) {
        setErr(t.errGeneric);
        return;
      }
      setDone((res.status as "accepted" | "declined") ?? (accept ? "accepted" : "declined"));
      router.refresh();
    });
  }

  const row = (label: string, value: React.ReactNode) =>
    value ? (
      <div className="flex justify-between gap-3 py-1">
        <dt className="text-slate-400">{label}</dt>
        <dd className="text-right text-slate-800">{value}</dd>
      </div>
    ) : null;

  return (
    <div className="rounded-lg border border-brand-200 bg-brand-50/40 p-4">
      <p className="mb-2 text-sm font-semibold text-brand-800">{t.title}</p>
      <dl className="text-sm">
        {row(t.position, offer.position)}
        {row(t.type, employmentTypeLabel(locale, offer.employment_type))}
        {row(t.compensation, offer.compensation)}
        {row(t.start, offer.start_date ? new Date(offer.start_date).toLocaleDateString() : null)}
        {row(t.terms, offer.terms)}
      </dl>

      <div className="mt-3 rounded-lg bg-white/70 p-3 text-xs text-slate-500">
        <p className="font-medium text-slate-600">{t.disclaimerTitle}</p>
        <p className="mt-1">{offer.disclaimer}</p>
      </div>

      <label className="mt-3 flex items-start gap-2 text-sm text-slate-700">
        <input
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          className="mt-0.5"
        />
        <span>{t.consent}</span>
      </label>

      {err && <p className="mt-2 text-sm text-red-600">{err}</p>}

      <div className="mt-3 flex gap-2">
        <button
          type="button"
          disabled={pending || !consent}
          onClick={() => respond(true)}
          className="btn-primary"
        >
          {t.accept}
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={() => respond(false)}
          className="btn-ghost"
        >
          {t.decline}
        </button>
      </div>
    </div>
  );
}

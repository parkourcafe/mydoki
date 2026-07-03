"use client";

import { useState } from "react";
import type { Locale } from "@/lib/i18n";
import Turnstile from "@/components/Turnstile";
import { reportVacancy } from "../actions";

const REASONS = ["scam", "data_collection", "fake", "other"] as const;
type Reason = (typeof REASONS)[number];

const M = {
  en: {
    trigger: "Report this vacancy",
    title: "Report this vacancy",
    reason: "Reason",
    rScam: "Scam / suspicious",
    rData: "Just collecting documents",
    rFake: "Fake vacancy",
    rOther: "Other",
    commentPh: "What's wrong? (optional)",
    contactPh: "Your contact (optional)",
    cancel: "Cancel",
    send: "Send report",
    sending: "Sending…",
    thanks: "Thank you. We'll review this vacancy.",
    close: "Close",
    errRate: "Too many reports. Please try later.",
    errTurnstile: "Anti-bot check failed. Try again.",
    errGeneric: "Couldn't send. Please try again.",
  },
  id: {
    trigger: "Laporkan lowongan ini",
    title: "Laporkan lowongan ini",
    reason: "Alasan",
    rScam: "Penipuan / mencurigakan",
    rData: "Hanya mengumpulkan dokumen",
    rFake: "Lowongan palsu",
    rOther: "Lainnya",
    commentPh: "Apa yang salah? (opsional)",
    contactPh: "Kontak Anda (opsional)",
    cancel: "Batal",
    send: "Kirim laporan",
    sending: "Mengirim…",
    thanks: "Terima kasih. Kami akan meninjau lowongan ini.",
    close: "Tutup",
    errRate: "Terlalu banyak laporan. Coba lagi nanti.",
    errTurnstile: "Pemeriksaan anti-bot gagal. Coba lagi.",
    errGeneric: "Gagal mengirim. Coba lagi.",
  },
  ru: {
    trigger: "Пожаловаться на вакансию",
    title: "Пожаловаться на вакансию",
    reason: "Причина",
    rScam: "Мошенничество / подозрительно",
    rData: "Просто собирают документы",
    rFake: "Фейковая вакансия",
    rOther: "Другое",
    commentPh: "Что не так? (необязательно)",
    contactPh: "Ваш контакт (необязательно)",
    cancel: "Отмена",
    send: "Отправить жалобу",
    sending: "Отправка…",
    thanks: "Спасибо. Мы проверим эту вакансию.",
    close: "Закрыть",
    errRate: "Слишком много жалоб. Попробуйте позже.",
    errTurnstile: "Проверка на бота не пройдена. Попробуйте ещё раз.",
    errGeneric: "Не удалось отправить. Попробуйте ещё раз.",
  },
  uz: {
    trigger: "Vakansiya haqida shikoyat",
    title: "Vakansiya haqida shikoyat",
    reason: "Sabab",
    rScam: "Firibgarlik / shubhali",
    rData: "Faqat hujjat yig‘ilyapti",
    rFake: "Soxta vakansiya",
    rOther: "Boshqa",
    commentPh: "Nima noto‘g‘ri? (ixtiyoriy)",
    contactPh: "Kontaktingiz (ixtiyoriy)",
    cancel: "Bekor qilish",
    send: "Shikoyat yuborish",
    sending: "Yuborilmoqda…",
    thanks: "Rahmat. Vakansiyani tekshiramiz.",
    close: "Yopish",
    errRate: "Shikoyat ko‘p. Keyinroq urining.",
    errTurnstile: "Antibot tekshiruvi o‘tmadi. Qayta urining.",
    errGeneric: "Yuborib bo‘lmadi. Qayta urining.",
  },
} as const;

export default function ReportModal({
  locale,
  slug,
  vacancyId,
  vacancyTitle,
  company,
}: {
  locale: Locale;
  slug: string;
  vacancyId: string;
  vacancyTitle: string;
  company: string;
}) {
  const t = M[locale];
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<Reason>("scam");
  const [comment, setComment] = useState("");
  const [contact, setContact] = useState("");
  const [token, setToken] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [ok, setOk] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const reasonLabel: Record<Reason, string> = {
    scam: t.rScam,
    data_collection: t.rData,
    fake: t.rFake,
    other: t.rOther,
  };

  async function submit() {
    setBusy(true);
    setErr(null);
    const r = await reportVacancy({
      slug,
      reason,
      comment: comment.trim() || undefined,
      contact: contact.trim() || undefined,
      turnstileToken: token,
      vacancyTitle,
      company,
      vacancyId,
    });
    setBusy(false);
    if (r.ok) setOk(true);
    else
      setErr(
        r.error === "rate_limited"
          ? t.errRate
          : r.error === "turnstile"
            ? t.errTurnstile
            : t.errGeneric
      );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-xs text-slate-400 underline hover:text-slate-600"
      >
        {t.trigger}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center"
          onClick={() => !busy && setOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-xl bg-white p-4"
            onClick={(e) => e.stopPropagation()}
          >
            {ok ? (
              <div className="py-2 text-center">
                <p className="text-3xl">✅</p>
                <p className="mt-2 text-sm text-slate-600">{t.thanks}</p>
                <button type="button" onClick={() => setOpen(false)} className="btn-ghost mt-4 w-full">
                  {t.close}
                </button>
              </div>
            ) : (
              <>
                <h3 className="text-base font-semibold">{t.title}</h3>
                <div className="mt-3 space-y-3">
                  <div>
                    <label className="label">{t.reason}</label>
                    <select
                      className="input"
                      value={reason}
                      onChange={(e) => setReason(e.target.value as Reason)}
                    >
                      {REASONS.map((r) => (
                        <option key={r} value={r}>
                          {reasonLabel[r]}
                        </option>
                      ))}
                    </select>
                  </div>
                  <textarea
                    className="input"
                    rows={3}
                    placeholder={t.commentPh}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                  />
                  <input
                    className="input"
                    placeholder={t.contactPh}
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                  />
                  <Turnstile onToken={setToken} />
                  {err && (
                    <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{err}</p>
                  )}
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setOpen(false)}
                      disabled={busy}
                      className="btn-ghost flex-1"
                    >
                      {t.cancel}
                    </button>
                    <button
                      type="button"
                      onClick={submit}
                      disabled={busy}
                      className="btn-primary flex-1"
                    >
                      {busy ? t.sending : t.send}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}

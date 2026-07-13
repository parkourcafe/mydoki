"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Locale } from "@/lib/i18n";
import { EMPLOYMENT_TYPES, employmentTypeLabel } from "@/lib/employment";
import {
  type Offer,
  offerStatusLabel,
  canEditOffer,
  defaultDisclaimer,
} from "@/lib/offer";
import { saveOffer, sendOffer, withdrawOffer } from "@/app/employer/actions";

const M = {
  ru: {
    title: "Оффер",
    intro: "Сформируйте предложение о работе. Кандидат подтвердит его согласием на своей странице статуса.",
    position: "Должность",
    type: "Тип занятости",
    compensation: "Оплата",
    compensationPh: "Например: 5 000 000 IDR/мес",
    start: "Дата начала",
    terms: "Условия",
    termsPh: "Испытательный срок, график, другие условия",
    disclaimer: "Дисклеймер (виден кандидату)",
    saveDraft: "Сохранить черновик",
    send: "Отправить оффер",
    withdraw: "Отозвать оффер",
    edit: "Изменить",
    newOffer: "Новый оффер",
    cancel: "Отмена",
    status: "Статус",
    sentHint: "Оффер отправлен — ждём ответа кандидата.",
    acceptedHint: "Кандидат принял оффер. Ниже — оформление сотрудника.",
    declinedHint: "Кандидат отклонил оффер. Можно предложить новый.",
    err: "Не удалось. Проверьте статус отклика.",
  },
  en: {
    title: "Offer",
    intro: "Put together a job offer. The candidate confirms it with consent on their status page.",
    position: "Position",
    type: "Employment type",
    compensation: "Compensation",
    compensationPh: "e.g. 5,000,000 IDR/mo",
    start: "Start date",
    terms: "Terms",
    termsPh: "Probation, schedule, other terms",
    disclaimer: "Disclaimer (shown to candidate)",
    saveDraft: "Save draft",
    send: "Send offer",
    withdraw: "Withdraw offer",
    edit: "Edit",
    newOffer: "New offer",
    cancel: "Cancel",
    status: "Status",
    sentHint: "Offer sent — waiting for the candidate's response.",
    acceptedHint: "The candidate accepted. Onboarding is below.",
    declinedHint: "The candidate declined. You can send a new offer.",
    err: "Failed. Check the application status.",
  },
  id: {
    title: "Penawaran",
    intro: "Susun penawaran kerja. Kandidat mengonfirmasinya dengan persetujuan di halaman statusnya.",
    position: "Posisi",
    type: "Jenis kerja",
    compensation: "Kompensasi",
    compensationPh: "mis. 5.000.000 IDR/bln",
    start: "Tanggal mulai",
    terms: "Ketentuan",
    termsPh: "Masa percobaan, jadwal, ketentuan lain",
    disclaimer: "Disclaimer (dilihat kandidat)",
    saveDraft: "Simpan draf",
    send: "Kirim penawaran",
    withdraw: "Tarik penawaran",
    edit: "Ubah",
    newOffer: "Penawaran baru",
    cancel: "Batal",
    status: "Status",
    sentHint: "Penawaran terkirim — menunggu jawaban kandidat.",
    acceptedHint: "Kandidat menerima. Proses karyawan di bawah.",
    declinedHint: "Kandidat menolak. Anda bisa kirim penawaran baru.",
    err: "Gagal. Periksa status lamaran.",
  },
  uz: {
    title: "Taklif",
    intro: "Ish taklifini tuzing. Nomzod uni status sahifasida rozilik bilan tasdiqlaydi.",
    position: "Lavozim",
    type: "Bandlik turi",
    compensation: "Toʻlov",
    compensationPh: "masalan: 5 000 000 IDR/oy",
    start: "Boshlanish sanasi",
    terms: "Shartlar",
    termsPh: "Sinov muddati, jadval, boshqa shartlar",
    disclaimer: "Diskleymer (nomzod koʻradi)",
    saveDraft: "Qoralamani saqlash",
    send: "Taklifni yuborish",
    withdraw: "Taklifni qaytarib olish",
    edit: "Oʻzgartirish",
    newOffer: "Yangi taklif",
    cancel: "Bekor qilish",
    status: "Holat",
    sentHint: "Taklif yuborildi — nomzod javobini kutmoqdamiz.",
    acceptedHint: "Nomzod qabul qildi. Quyida — rasmiylashtirish.",
    declinedHint: "Nomzod rad etdi. Yangi taklif yuborishingiz mumkin.",
    err: "Boʻlmadi. Ariza holatini tekshiring.",
  },
} as const;

export default function CandidateOffer({
  locale,
  applicationId,
  defaultPosition,
  offer,
}: {
  locale: Locale;
  applicationId: string;
  defaultPosition: string;
  offer: Offer | null;
}) {
  const t = M[locale];
  const router = useRouter();
  const [pending, start] = useTransition();
  const [editing, setEditing] = useState(!offer);
  const [err, setErr] = useState(false);

  const [position, setPosition] = useState(offer?.position ?? defaultPosition);
  const [type, setType] = useState<string>(offer?.employment_type ?? "full_time");
  const [compensation, setCompensation] = useState(offer?.compensation ?? "");
  const [startDate, setStartDate] = useState(offer?.start_date ?? "");
  const [terms, setTerms] = useState(offer?.terms ?? "");
  const [disclaimer, setDisclaimer] = useState(offer?.disclaimer ?? defaultDisclaimer(locale));

  const status = offer?.status ?? null;

  function run(fn: () => Promise<{ error?: string } | { id: string }>) {
    setErr(false);
    start(async () => {
      const res = await fn();
      if (res && "error" in res && res.error) {
        setErr(true);
        return;
      }
      setEditing(false);
      router.refresh();
    });
  }

  return (
    <section className="card space-y-3">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
        {t.title}
      </h2>

      {err && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{t.err}</p>}

      {editing ? (
        <div className="space-y-3">
          <p className="text-xs text-slate-400">{t.intro}</p>
          <div>
            <label className="label">{t.position}</label>
            <input value={position} onChange={(e) => setPosition(e.target.value)} className="input" />
          </div>
          <div>
            <label className="label">{t.type}</label>
            <select value={type} onChange={(e) => setType(e.target.value)} className="input">
              {EMPLOYMENT_TYPES.map((v) => (
                <option key={v} value={v}>
                  {employmentTypeLabel(locale, v)}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">{t.compensation}</label>
              <input
                value={compensation}
                onChange={(e) => setCompensation(e.target.value)}
                className="input"
                placeholder={t.compensationPh}
              />
            </div>
            <div>
              <label className="label">{t.start}</label>
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="input" />
            </div>
          </div>
          <div>
            <label className="label">{t.terms}</label>
            <textarea value={terms} onChange={(e) => setTerms(e.target.value)} rows={2} className="input" placeholder={t.termsPh} />
          </div>
          <div>
            <label className="label">{t.disclaimer}</label>
            <textarea value={disclaimer} onChange={(e) => setDisclaimer(e.target.value)} rows={2} className="input" />
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={pending || !position.trim()}
              onClick={() =>
                run(() =>
                  saveOffer({
                    applicationId,
                    position: position.trim(),
                    type,
                    compensation,
                    startDate: startDate || null,
                    terms,
                    disclaimer,
                  })
                )
              }
              className="btn-primary"
            >
              {t.saveDraft}
            </button>
            {offer && (
              <button type="button" onClick={() => setEditing(false)} className="btn-ghost">
                {t.cancel}
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <dl className="text-sm">
            <div className="flex justify-between gap-3 py-1">
              <dt className="text-slate-400">{t.status}</dt>
              <dd className="font-medium">{offerStatusLabel(locale, status ?? "")}</dd>
            </div>
            <div className="flex justify-between gap-3 py-1">
              <dt className="text-slate-400">{t.position}</dt>
              <dd>{offer?.position}</dd>
            </div>
            <div className="flex justify-between gap-3 py-1">
              <dt className="text-slate-400">{t.type}</dt>
              <dd>{offer && employmentTypeLabel(locale, offer.employment_type)}</dd>
            </div>
            {offer?.compensation && (
              <div className="flex justify-between gap-3 py-1">
                <dt className="text-slate-400">{t.compensation}</dt>
                <dd>{offer.compensation}</dd>
              </div>
            )}
          </dl>

          {status === "sent" && (
            <p className="rounded-lg bg-blue-50 px-3 py-2 text-sm text-blue-700">{t.sentHint}</p>
          )}
          {status === "accepted" && (
            <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{t.acceptedHint}</p>
          )}
          {status === "declined" && (
            <p className="rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-600">{t.declinedHint}</p>
          )}

          <div className="flex flex-wrap gap-2">
            {status === "draft" && (
              <>
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => run(() => sendOffer(applicationId))}
                  className="btn-primary"
                >
                  {t.send}
                </button>
                <button type="button" onClick={() => setEditing(true)} className="btn-ghost">
                  {t.edit}
                </button>
              </>
            )}
            {status === "sent" && (
              <button
                type="button"
                disabled={pending}
                onClick={() => run(() => withdrawOffer(applicationId))}
                className="btn-ghost"
              >
                {t.withdraw}
              </button>
            )}
            {(status === "declined" || status === "withdrawn") && (
              <button type="button" onClick={() => setEditing(true)} className="btn-primary">
                {t.newOffer}
              </button>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

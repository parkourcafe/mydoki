"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Locale } from "@/lib/i18n";
import { employmentTypeLabel } from "@/lib/employment";
import {
  type Amendment,
  amendmentKindLabel,
  amendmentStatusLabel,
} from "@/lib/amendments";
import { respondToAmendment } from "@/app/my/actions";

const M = {
  ru: {
    title: "Изменения условий",
    pending: "Предложение об изменении",
    newPosition: "Новая должность", newType: "Новый тип", newComp: "Новая оплата",
    effective: "Дата вступления", terms: "Условия",
    consent: "Я ознакомился и согласен с изменением условий",
    accept: "Принять", decline: "Отклонить",
    accepted: "Вы приняли изменение. Условия обновлены.",
    declined: "Вы отклонили изменение.",
    errConsent: "Отметьте согласие, чтобы принять.",
    errGeneric: "Не удалось отправить ответ. Обновите страницу.",
    disclaimerTitle: "Важно", history: "История изменений", empty: "Изменений пока нет.",
  },
  en: {
    title: "Terms changes",
    pending: "Proposed change",
    newPosition: "New position", newType: "New type", newComp: "New compensation",
    effective: "Effective date", terms: "Terms",
    consent: "I've reviewed and agree to the change of terms",
    accept: "Accept", decline: "Decline",
    accepted: "You accepted the change. Terms updated.",
    declined: "You declined the change.",
    errConsent: "Check the consent box to accept.",
    errGeneric: "Couldn't submit your response. Refresh the page.",
    disclaimerTitle: "Important", history: "Change history", empty: "No changes yet.",
  },
  id: {
    title: "Perubahan ketentuan",
    pending: "Usulan perubahan",
    newPosition: "Posisi baru", newType: "Tipe baru", newComp: "Kompensasi baru",
    effective: "Tanggal berlaku", terms: "Ketentuan",
    consent: "Saya telah meninjau dan setuju dengan perubahan ketentuan",
    accept: "Terima", decline: "Tolak",
    accepted: "Anda menerima perubahan. Ketentuan diperbarui.",
    declined: "Anda menolak perubahan.",
    errConsent: "Centang persetujuan untuk menerima.",
    errGeneric: "Gagal mengirim jawaban. Muat ulang halaman.",
    disclaimerTitle: "Penting", history: "Riwayat perubahan", empty: "Belum ada perubahan.",
  },
  uz: {
    title: "Shartlar o‘zgarishi",
    pending: "Taklif etilgan o‘zgarish",
    newPosition: "Yangi lavozim", newType: "Yangi tur", newComp: "Yangi to‘lov",
    effective: "Kuchga kirish sanasi", terms: "Shartlar",
    consent: "Men shartlar o‘zgarishini ko‘rib chiqdim va roziman",
    accept: "Qabul qilish", decline: "Rad etish",
    accepted: "Siz o‘zgarishni qabul qildingiz. Shartlar yangilandi.",
    declined: "Siz o‘zgarishni rad etdingiz.",
    errConsent: "Qabul qilish uchun rozilikni belgilang.",
    errGeneric: "Javob yuborilmadi. Sahifani yangilang.",
    disclaimerTitle: "Muhim", history: "O‘zgarishlar tarixi", empty: "Hozircha o‘zgarish yo‘q.",
  },
} as const;

function Pending({
  locale, employmentId, a,
}: { locale: Locale; employmentId: string; a: Amendment }) {
  const t = M[locale];
  const router = useRouter();
  const [pending, start] = useTransition();
  const [consent, setConsent] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [done, setDone] = useState<"accepted" | "declined" | null>(null);

  if (done === "accepted")
    return <p className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800">{t.accepted}</p>;
  if (done === "declined")
    return <p className="rounded-lg bg-slate-50 p-3 text-sm text-slate-600">{t.declined}</p>;

  function respond(accept: boolean) {
    setErr(null);
    if (accept && !consent) { setErr(t.errConsent); return; }
    start(async () => {
      const res = await respondToAmendment(a.id, employmentId, accept, consent);
      if (!res.ok) { setErr(t.errGeneric); return; }
      setDone((res.status as "accepted" | "declined") ?? (accept ? "accepted" : "declined"));
      router.refresh();
    });
  }

  const row = (label: string, value: React.ReactNode) =>
    value ? (
      <div className="flex justify-between gap-3 py-0.5">
        <dt className="text-slate-400">{label}</dt>
        <dd className="text-right text-slate-800">{value}</dd>
      </div>
    ) : null;

  return (
    <div className="rounded-lg border border-brand-200 bg-brand-50/40 p-4">
      <p className="mb-2 text-sm font-semibold text-brand-800">
        {t.pending}: {amendmentKindLabel(locale, a.kind)}
      </p>
      <dl className="text-sm">
        {row(t.newPosition, a.new_position)}
        {row(t.newType, a.new_employment_type ? employmentTypeLabel(locale, a.new_employment_type) : null)}
        {row(t.newComp, a.new_compensation)}
        {row(t.effective, a.effective_date)}
        {row(t.terms, a.terms)}
      </dl>
      <div className="mt-3 rounded-lg bg-white/70 p-3 text-xs text-slate-500">
        <p className="font-medium text-slate-600">{t.disclaimerTitle}</p>
        <p className="mt-1">{a.disclaimer}</p>
      </div>
      <label className="mt-3 flex items-start gap-2 text-sm text-slate-700">
        <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-0.5" />
        <span>{t.consent}</span>
      </label>
      {err && <p className="mt-2 text-sm text-red-600">{err}</p>}
      <div className="mt-3 flex gap-2">
        <button type="button" disabled={pending || !consent} onClick={() => respond(true)} className="btn-primary">
          {t.accept}
        </button>
        <button type="button" disabled={pending} onClick={() => respond(false)} className="btn-ghost">
          {t.decline}
        </button>
      </div>
    </div>
  );
}

export default function AmendmentsPanel({
  locale, employmentId, amendments,
}: { locale: Locale; employmentId: string; amendments: Amendment[] }) {
  const t = M[locale];
  const proposed = amendments.filter((a) => a.status === "proposed");
  const history = amendments.filter((a) => a.status !== "proposed" && a.status !== "draft");

  if (amendments.length === 0) return null;

  return (
    <section className="card space-y-3">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">{t.title}</h2>

      {proposed.map((a) => (
        <Pending key={a.id} locale={locale} employmentId={employmentId} a={a} />
      ))}

      {history.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-medium text-slate-400">{t.history}</p>
          <ul className="space-y-1 text-sm">
            {history.map((a) => (
              <li key={a.id} className="flex items-center justify-between gap-2">
                <span>
                  {amendmentKindLabel(locale, a.kind)}
                  {a.effective_date && <span className="ml-2 text-xs text-slate-400">{a.effective_date}</span>}
                </span>
                <span className="shrink-0 text-xs text-slate-400">{amendmentStatusLabel(locale, a.status)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

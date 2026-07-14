"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Locale } from "@/lib/i18n";
import { EMPLOYMENT_TYPES, employmentTypeLabel } from "@/lib/employment";
import {
  type Amendment,
  AMENDMENT_KINDS,
  amendmentKindLabel,
  amendmentStatusLabel,
  defaultAmendmentDisclaimer,
} from "@/lib/amendments";
import { saveAmendment, proposeAmendment, withdrawAmendment } from "@/app/employer/actions";

const M = {
  ru: {
    title: "Изменения условий",
    intro: "Допсоглашение: предложите изменение, человек подтвердит согласием. После принятия условия обновятся.",
    add: "+ Новое допсоглашение",
    kind: "Вид", effective: "Дата вступления", newPosition: "Новая должность",
    newType: "Новый тип", noChange: "— без изменения", newComp: "Новая оплата",
    terms: "Условия", note: "Заметка", disclaimer: "Дисклеймер (виден сотруднику)",
    save: "Сохранить черновик", propose: "Предложить", withdraw: "Отозвать",
    edit: "Изменить", cancel: "Отмена", status: "Статус", effShort: "с",
    empty: "Изменений пока нет.", err: "Не удалось. Проверьте данные.",
    proposedHint: "Предложено — ждём ответа сотрудника.",
  },
  en: {
    title: "Terms changes",
    intro: "Amendment: propose a change, the person confirms with consent. Terms update once accepted.",
    add: "+ New amendment",
    kind: "Kind", effective: "Effective date", newPosition: "New position",
    newType: "New type", noChange: "— no change", newComp: "New compensation",
    terms: "Terms", note: "Note", disclaimer: "Disclaimer (shown to employee)",
    save: "Save draft", propose: "Propose", withdraw: "Withdraw",
    edit: "Edit", cancel: "Cancel", status: "Status", effShort: "from",
    empty: "No changes yet.", err: "Failed. Check the fields.",
    proposedHint: "Proposed — awaiting the employee's response.",
  },
  id: {
    title: "Perubahan ketentuan",
    intro: "Adendum: ajukan perubahan, orangnya konfirmasi dengan persetujuan. Ketentuan diperbarui setelah diterima.",
    add: "+ Adendum baru",
    kind: "Jenis", effective: "Tanggal berlaku", newPosition: "Posisi baru",
    newType: "Tipe baru", noChange: "— tanpa perubahan", newComp: "Kompensasi baru",
    terms: "Ketentuan", note: "Catatan", disclaimer: "Disclaimer (dilihat karyawan)",
    save: "Simpan draf", propose: "Ajukan", withdraw: "Tarik",
    edit: "Ubah", cancel: "Batal", status: "Status", effShort: "dari",
    empty: "Belum ada perubahan.", err: "Gagal. Periksa isian.",
    proposedHint: "Diajukan — menunggu jawaban karyawan.",
  },
  uz: {
    title: "Shartlar o‘zgarishi",
    intro: "Qo‘shimcha kelishuv: o‘zgarishni taklif qiling, inson rozilik bilan tasdiqlaydi. Qabuldan so‘ng shartlar yangilanadi.",
    add: "+ Yangi kelishuv",
    kind: "Turi", effective: "Kuchga kirish sanasi", newPosition: "Yangi lavozim",
    newType: "Yangi tur", noChange: "— o‘zgarishsiz", newComp: "Yangi to‘lov",
    terms: "Shartlar", note: "Eslatma", disclaimer: "Diskleymer (xodim ko‘radi)",
    save: "Qoralamani saqlash", propose: "Taklif qilish", withdraw: "Qaytarib olish",
    edit: "O‘zgartirish", cancel: "Bekor qilish", status: "Holat", effShort: "dan",
    empty: "Hozircha o‘zgarish yo‘q.", err: "Bo‘lmadi. Maydonlarni tekshiring.",
    proposedHint: "Taklif qilindi — xodim javobini kutmoqdamiz.",
  },
} as const;

const statusCls: Record<string, string> = {
  draft: "bg-slate-100 text-slate-500",
  proposed: "bg-blue-100 text-blue-700",
  accepted: "bg-emerald-100 text-emerald-700",
  declined: "bg-red-100 text-red-700",
  withdrawn: "bg-slate-100 text-slate-500",
};

const empty = {
  kind: "promotion", effectiveDate: "", newPosition: "", newType: "",
  newCompensation: "", terms: "", note: "",
};

export default function AmendmentsManager({
  locale,
  employmentId,
  amendments,
}: {
  locale: Locale;
  employmentId: string;
  amendments: Amendment[];
}) {
  const t = M[locale];
  const router = useRouter();
  const [pending, start] = useTransition();
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [err, setErr] = useState(false);
  const [f, setF] = useState({ ...empty });
  const [disclaimer, setDisclaimer] = useState(defaultAmendmentDisclaimer(locale));

  function reset() {
    setF({ ...empty });
    setDisclaimer(defaultAmendmentDisclaimer(locale));
    setOpen(false);
    setEditId(null);
    setErr(false);
  }

  function startEdit(a: Amendment) {
    setF({
      kind: a.kind,
      effectiveDate: a.effective_date ?? "",
      newPosition: a.new_position ?? "",
      newType: a.new_employment_type ?? "",
      newCompensation: a.new_compensation ?? "",
      terms: a.terms ?? "",
      note: a.note ?? "",
    });
    setDisclaimer(a.disclaimer);
    setEditId(a.id);
    setOpen(true);
  }

  function run(fn: () => Promise<{ error?: string } | { id: string }>) {
    setErr(false);
    start(async () => {
      const res = await fn();
      if (res && "error" in res && res.error) { setErr(true); return; }
      reset();
      router.refresh();
    });
  }

  return (
    <section className="card space-y-3">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">{t.title}</h2>
      {err && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{t.err}</p>}

      {open ? (
        <div className="space-y-3 rounded-lg bg-slate-50 p-3">
          <p className="text-xs text-slate-400">{t.intro}</p>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="label">{t.kind}</label>
              <select value={f.kind} onChange={(e) => setF({ ...f, kind: e.target.value })} className="input">
                {AMENDMENT_KINDS.map((k) => (
                  <option key={k} value={k}>{amendmentKindLabel(locale, k)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">{t.effective}</label>
              <input type="date" value={f.effectiveDate} onChange={(e) => setF({ ...f, effectiveDate: e.target.value })} className="input" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="label">{t.newPosition}</label>
              <input value={f.newPosition} onChange={(e) => setF({ ...f, newPosition: e.target.value })} className="input" />
            </div>
            <div>
              <label className="label">{t.newType}</label>
              <select value={f.newType} onChange={(e) => setF({ ...f, newType: e.target.value })} className="input">
                <option value="">{t.noChange}</option>
                {EMPLOYMENT_TYPES.map((v) => (
                  <option key={v} value={v}>{employmentTypeLabel(locale, v)}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="label">{t.newComp}</label>
            <input value={f.newCompensation} onChange={(e) => setF({ ...f, newCompensation: e.target.value })} className="input" />
          </div>
          <div>
            <label className="label">{t.terms}</label>
            <textarea value={f.terms} onChange={(e) => setF({ ...f, terms: e.target.value })} rows={2} className="input" />
          </div>
          <div>
            <label className="label">{t.note}</label>
            <textarea value={f.note} onChange={(e) => setF({ ...f, note: e.target.value })} rows={1} className="input" />
          </div>
          <div>
            <label className="label">{t.disclaimer}</label>
            <textarea value={disclaimer} onChange={(e) => setDisclaimer(e.target.value)} rows={2} className="input" />
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={pending}
              onClick={() =>
                run(() =>
                  saveAmendment({
                    employmentId, id: editId, kind: f.kind,
                    effectiveDate: f.effectiveDate || null, newPosition: f.newPosition || null,
                    newType: f.newType || null, newCompensation: f.newCompensation || null,
                    terms: f.terms || null, note: f.note || null, disclaimer,
                  })
                )
              }
              className="btn-primary"
            >
              {t.save}
            </button>
            <button type="button" onClick={reset} className="btn-ghost">{t.cancel}</button>
          </div>
        </div>
      ) : (
        <button type="button" onClick={() => setOpen(true)} className="btn-ghost">{t.add}</button>
      )}

      {amendments.length === 0 ? (
        <p className="text-sm text-slate-400">{t.empty}</p>
      ) : (
        <ul className="space-y-2">
          {amendments.map((a) => (
            <li key={a.id} className="rounded-lg border border-slate-100 p-2.5 text-sm">
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium">{amendmentKindLabel(locale, a.kind)}</span>
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusCls[a.status] ?? ""}`}>
                  {amendmentStatusLabel(locale, a.status)}
                </span>
              </div>
              <p className="mt-0.5 text-xs text-slate-500">
                {a.new_position && <>{t.newPosition}: {a.new_position}. </>}
                {a.new_employment_type && <>{t.newType}: {employmentTypeLabel(locale, a.new_employment_type)}. </>}
                {a.new_compensation && <>{t.newComp}: {a.new_compensation}. </>}
                {a.effective_date && <>({t.effShort} {a.effective_date})</>}
              </p>
              {a.status === "proposed" && (
                <p className="mt-1 text-xs text-blue-600">{t.proposedHint}</p>
              )}
              {(a.status === "draft" || a.status === "proposed") && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {a.status === "draft" && (
                    <>
                      <button type="button" disabled={pending} onClick={() => run(() => proposeAmendment(a.id, employmentId))} className="btn-primary">
                        {t.propose}
                      </button>
                      <button type="button" onClick={() => startEdit(a)} className="btn-ghost">{t.edit}</button>
                    </>
                  )}
                  <button type="button" disabled={pending} onClick={() => run(() => withdrawAmendment(a.id, employmentId))} className="btn-ghost">
                    {t.withdraw}
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

"use client";

import { useState, useTransition, useRef } from "react";
import { useRouter } from "next/navigation";
import type { Locale } from "@/lib/i18n";
import { EMPLOYMENT_TYPES, employmentTypeLabel } from "@/lib/employment";
import { addManualEmployment } from "@/app/my/actions";

const M = {
  ru: {
    add: "+ Добавить место работы",
    cancel: "Отмена",
    company: "Компания",
    companyPh: "Название компании",
    position: "Должность",
    positionPh: "Например: бариста",
    type: "Тип занятости",
    start: "Начало",
    end: "Окончание (если завершено)",
    save: "Сохранить",
    hint: "Ручная запись — работодателя нет в Doki. Видна только вам.",
  },
  en: {
    add: "+ Add a workplace",
    cancel: "Cancel",
    company: "Company",
    companyPh: "Company name",
    position: "Position",
    positionPh: "e.g. barista",
    type: "Employment type",
    start: "Start",
    end: "End (if finished)",
    save: "Save",
    hint: "Manual entry — the employer isn't on Doki. Only you can see it.",
  },
  id: {
    add: "+ Tambah tempat kerja",
    cancel: "Batal",
    company: "Perusahaan",
    companyPh: "Nama perusahaan",
    position: "Posisi",
    positionPh: "mis. barista",
    type: "Jenis kerja",
    start: "Mulai",
    end: "Selesai (jika sudah)",
    save: "Simpan",
    hint: "Entri manual — perusahaan tidak ada di Doki. Hanya Anda yang melihat.",
  },
  uz: {
    add: "+ Ish joyi qoʻshish",
    cancel: "Bekor qilish",
    company: "Kompaniya",
    companyPh: "Kompaniya nomi",
    position: "Lavozim",
    positionPh: "masalan: barista",
    type: "Bandlik turi",
    start: "Boshlanishi",
    end: "Tugashi (agar yakunlangan)",
    save: "Saqlash",
    hint: "Qoʻlda kiritish — kompaniya Doki'da yoʻq. Faqat siz koʻrasiz.",
  },
} as const;

export default function AddEmploymentForm({ locale }: { locale: Locale }) {
  const t = M[locale];
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="btn-ghost">
        {t.add}
      </button>
    );
  }

  return (
    <form
      ref={formRef}
      action={(fd) =>
        start(async () => {
          await addManualEmployment(fd);
          formRef.current?.reset();
          setOpen(false);
          router.refresh();
        })
      }
      className="card space-y-3"
    >
      <p className="text-xs text-slate-400">{t.hint}</p>
      <div>
        <label className="label">{t.company}</label>
        <input name="company_name" required className="input" placeholder={t.companyPh} />
      </div>
      <div>
        <label className="label">{t.position}</label>
        <input name="position" required className="input" placeholder={t.positionPh} />
      </div>
      <div>
        <label className="label">{t.type}</label>
        <select name="employment_type" defaultValue="full_time" className="input">
          {EMPLOYMENT_TYPES.map((v) => (
            <option key={v} value={v}>
              {employmentTypeLabel(locale, v)}
            </option>
          ))}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">{t.start}</label>
          <input type="date" name="start_date" className="input" />
        </div>
        <div>
          <label className="label">{t.end}</label>
          <input type="date" name="end_date" className="input" />
        </div>
      </div>
      <div className="flex gap-2">
        <button type="submit" disabled={pending} className="btn-primary">
          {t.save}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="btn-ghost">
          {t.cancel}
        </button>
      </div>
    </form>
  );
}

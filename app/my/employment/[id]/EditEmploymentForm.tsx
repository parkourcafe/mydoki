"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Locale } from "@/lib/i18n";
import {
  EMPLOYMENT_TYPES,
  employmentTypeLabel,
  type Employment,
} from "@/lib/employment";
import { updateManualEmployment, deleteManualEmployment } from "@/app/my/actions";

const M = {
  ru: {
    edit: "Редактировать",
    company: "Компания",
    position: "Должность",
    type: "Тип занятости",
    start: "Начало",
    end: "Окончание (если завершено)",
    save: "Сохранить",
    cancel: "Отмена",
    remove: "Удалить запись",
    confirm: "Удалить это место работы?",
  },
  en: {
    edit: "Edit",
    company: "Company",
    position: "Position",
    type: "Employment type",
    start: "Start",
    end: "End (if finished)",
    save: "Save",
    cancel: "Cancel",
    remove: "Delete record",
    confirm: "Delete this workplace?",
  },
  id: {
    edit: "Ubah",
    company: "Perusahaan",
    position: "Posisi",
    type: "Jenis kerja",
    start: "Mulai",
    end: "Selesai (jika sudah)",
    save: "Simpan",
    cancel: "Batal",
    remove: "Hapus catatan",
    confirm: "Hapus tempat kerja ini?",
  },
  uz: {
    edit: "Tahrirlash",
    company: "Kompaniya",
    position: "Lavozim",
    type: "Bandlik turi",
    start: "Boshlanishi",
    end: "Tugashi (agar yakunlangan)",
    save: "Saqlash",
    cancel: "Bekor qilish",
    remove: "Yozuvni oʻchirish",
    confirm: "Bu ish joyini oʻchirilsinmi?",
  },
} as const;

export default function EditEmploymentForm({
  locale,
  employment,
}: {
  locale: Locale;
  employment: Employment;
}) {
  const t = M[locale];
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [pending, start] = useTransition();

  if (!editing) {
    return (
      <div className="flex gap-2">
        <button type="button" onClick={() => setEditing(true)} className="btn-ghost">
          {t.edit}
        </button>
        <form
          action={(fd) => {
            if (!confirm(t.confirm)) return;
            start(async () => {
              await deleteManualEmployment(fd);
            });
          }}
        >
          <input type="hidden" name="id" value={employment.id} />
          <button type="submit" disabled={pending} className="btn-danger">
            {t.remove}
          </button>
        </form>
      </div>
    );
  }

  return (
    <form
      action={(fd) =>
        start(async () => {
          await updateManualEmployment(fd);
          setEditing(false);
          router.refresh();
        })
      }
      className="card space-y-3"
    >
      <input type="hidden" name="id" value={employment.id} />
      <div>
        <label className="label">{t.company}</label>
        <input name="company_name" required defaultValue={employment.company_name} className="input" />
      </div>
      <div>
        <label className="label">{t.position}</label>
        <input name="position" required defaultValue={employment.position} className="input" />
      </div>
      <div>
        <label className="label">{t.type}</label>
        <select name="employment_type" defaultValue={employment.employment_type} className="input">
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
          <input type="date" name="start_date" defaultValue={employment.start_date ?? ""} className="input" />
        </div>
        <div>
          <label className="label">{t.end}</label>
          <input type="date" name="end_date" defaultValue={employment.end_date ?? ""} className="input" />
        </div>
      </div>
      <div className="flex gap-2">
        <button type="submit" disabled={pending} className="btn-primary">
          {t.save}
        </button>
        <button type="button" onClick={() => setEditing(false)} className="btn-ghost">
          {t.cancel}
        </button>
      </div>
    </form>
  );
}

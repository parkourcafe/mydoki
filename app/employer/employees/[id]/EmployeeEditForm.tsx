"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Locale } from "@/lib/i18n";
import {
  EMPLOYMENT_TYPES,
  employmentTypeLabel,
  type Employment,
} from "@/lib/employment";
import { updateEmployment } from "@/app/employer/actions";

const M = {
  ru: {
    edit: "Редактировать",
    position: "Должность",
    type: "Тип занятости",
    start: "Начало",
    end: "Окончание",
    status: "Статус",
    active: "Работает",
    ended: "Завершено",
    save: "Сохранить",
    cancel: "Отмена",
  },
  en: {
    edit: "Edit",
    position: "Position",
    type: "Employment type",
    start: "Start",
    end: "End",
    status: "Status",
    active: "Active",
    ended: "Ended",
    save: "Save",
    cancel: "Cancel",
  },
  id: {
    edit: "Ubah",
    position: "Posisi",
    type: "Jenis kerja",
    start: "Mulai",
    end: "Selesai",
    status: "Status",
    active: "Aktif",
    ended: "Selesai",
    save: "Simpan",
    cancel: "Batal",
  },
  uz: {
    edit: "Tahrirlash",
    position: "Lavozim",
    type: "Bandlik turi",
    start: "Boshlanishi",
    end: "Tugashi",
    status: "Holat",
    active: "Ishlayapti",
    ended: "Yakunlangan",
    save: "Saqlash",
    cancel: "Bekor qilish",
  },
} as const;

export default function EmployeeEditForm({
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
      <button type="button" onClick={() => setEditing(true)} className="btn-ghost">
        {t.edit}
      </button>
    );
  }

  return (
    <form
      action={(fd) =>
        start(async () => {
          await updateEmployment(fd);
          setEditing(false);
          router.refresh();
        })
      }
      className="card space-y-3"
    >
      <input type="hidden" name="id" value={employment.id} />
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
      <div>
        <label className="label">{t.status}</label>
        <select name="status" defaultValue={employment.status} className="input">
          <option value="active">{t.active}</option>
          <option value="ended">{t.ended}</option>
        </select>
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

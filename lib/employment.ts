import type { Locale } from "./i18n";

// ============================ Employment ==============================
// Одна каноническая сущность трудовых отношений (v1.1 §7.4) с двумя
// проекциями (карточка сотрудника у работодателя / «Мои трудовые
// отношения» у человека). Здесь — типы и чистые хелперы (метки/валидация),
// покрываемые юнит-тестами.

export type EmploymentType =
  | "full_time"
  | "part_time"
  | "contract"
  | "intern"
  | "other";

export type EmploymentStatus = "active" | "ended";

export const EMPLOYMENT_TYPES: EmploymentType[] = [
  "full_time",
  "part_time",
  "contract",
  "intern",
  "other",
];

export type Employment = {
  id: string;
  company_id: string | null;
  company_name: string;
  employee_user_id: string;
  application_id: string | null;
  position: string;
  employment_type: EmploymentType;
  start_date: string | null;
  end_date: string | null;
  status: EmploymentStatus;
  manual: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

/** Проверка допустимости типа занятости (для валидации форм/входных данных). */
export function isEmploymentType(v: unknown): v is EmploymentType {
  return (
    typeof v === "string" &&
    (EMPLOYMENT_TYPES as string[]).includes(v)
  );
}

/** Нормализация типа занятости: невалидное значение → 'other'. */
export function normalizeEmploymentType(v: unknown): EmploymentType {
  return isEmploymentType(v) ? v : "other";
}

const TYPE_LABELS: Record<Locale, Record<EmploymentType, string>> = {
  ru: {
    full_time: "Полная занятость",
    part_time: "Частичная занятость",
    contract: "Договор/подряд",
    intern: "Стажировка",
    other: "Другое",
  },
  en: {
    full_time: "Full-time",
    part_time: "Part-time",
    contract: "Contract",
    intern: "Internship",
    other: "Other",
  },
  id: {
    full_time: "Penuh waktu",
    part_time: "Paruh waktu",
    contract: "Kontrak",
    intern: "Magang",
    other: "Lainnya",
  },
  uz: {
    full_time: "Toʻliq bandlik",
    part_time: "Qisman bandlik",
    contract: "Shartnoma/pudrat",
    intern: "Amaliyot",
    other: "Boshqa",
  },
};

export function employmentTypeLabel(
  locale: Locale,
  type: EmploymentType | string
): string {
  const map = TYPE_LABELS[locale];
  return map[type as EmploymentType] ?? String(type);
}

const STATUS_LABELS: Record<Locale, Record<EmploymentStatus, string>> = {
  ru: { active: "Работает", ended: "Завершено" },
  en: { active: "Active", ended: "Ended" },
  id: { active: "Aktif", ended: "Selesai" },
  uz: { active: "Ishlayapti", ended: "Yakunlangan" },
};

export function employmentStatusLabel(
  locale: Locale,
  status: EmploymentStatus | string
): string {
  const map = STATUS_LABELS[locale];
  return map[status as EmploymentStatus] ?? String(status);
}

/** Человекочитаемый период «start — end» (или «start — н. в.»). */
export function formatPeriod(
  locale: Locale,
  start: string | null,
  end: string | null
): string {
  const present: Record<Locale, string> = {
    ru: "н. в.",
    en: "present",
    id: "sekarang",
    uz: "hozir",
  };
  const fmt = (d: string) => new Date(d).toLocaleDateString();
  if (!start && !end) return "—";
  const s = start ? fmt(start) : "—";
  const e = end ? fmt(end) : present[locale];
  return `${s} — ${e}`;
}

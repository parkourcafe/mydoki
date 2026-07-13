import type { Locale } from "./i18n";

/** Целых дней от today до target (обе YYYY-MM-DD). Может быть < 0 / NaN. */
function daysUntil(target: string, today: string): number {
  const t = Date.parse(`${target}T00:00:00Z`);
  const n = Date.parse(`${today}T00:00:00Z`);
  return Math.round((t - n) / 86_400_000);
}

// ======================= Employment documents ========================
// Документы сотрудника (договор/виза/разрешение/сертификация) с датой
// действия. Здесь — типы, метки и чистый хелпер статуса срока (для бейджей
// и напоминаний). Порог напоминаний в кроне — тот же bucketKind (фаза 1).

export type EmploymentDocType =
  | "contract"
  | "visa"
  | "permit"
  | "certification"
  | "other";

export const EMPLOYMENT_DOC_TYPES: EmploymentDocType[] = [
  "contract",
  "visa",
  "permit",
  "certification",
  "other",
];

export type EmploymentDocument = {
  id: string;
  employment_id: string;
  doc_type: EmploymentDocType;
  label: string;
  file_path: string;
  file_name: string;
  file_size: number | null;
  expires_at: string | null;
  uploaded_by: string | null;
  uploaded_at: string;
};

const TYPE_LABELS: Record<Locale, Record<EmploymentDocType, string>> = {
  ru: {
    contract: "Трудовой договор",
    visa: "Виза",
    permit: "Разрешение на работу",
    certification: "Сертификация",
    other: "Другое",
  },
  en: {
    contract: "Employment contract",
    visa: "Visa",
    permit: "Work permit",
    certification: "Certification",
    other: "Other",
  },
  id: {
    contract: "Kontrak kerja",
    visa: "Visa",
    permit: "Izin kerja",
    certification: "Sertifikasi",
    other: "Lainnya",
  },
  uz: {
    contract: "Mehnat shartnomasi",
    visa: "Viza",
    permit: "Ishlash ruxsatnomasi",
    certification: "Sertifikatsiya",
    other: "Boshqa",
  },
};

export function docTypeLabel(
  locale: Locale,
  type: EmploymentDocType | string
): string {
  return TYPE_LABELS[locale][type as EmploymentDocType] ?? String(type);
}

export type ExpiryStatus = "none" | "ok" | "soon" | "expired";

/**
 * Статус срока действия относительно опорной даты (today, YYYY-MM-DD):
 * none — без срока; expired — срок прошёл; soon — истекает в ≤30 дней;
 * ok — позже. Порог 30 дней согласован с окном напоминаний фазы 1.
 */
export function expiryStatus(
  expiresAt: string | null,
  today: string
): ExpiryStatus {
  if (!expiresAt) return "none";
  const d = daysUntil(expiresAt, today);
  if (Number.isNaN(d)) return "none";
  if (d < 0) return "expired";
  if (d <= 30) return "soon";
  return "ok";
}

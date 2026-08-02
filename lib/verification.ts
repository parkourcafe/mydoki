import type { Locale } from "./i18n";
import type { EmploymentType } from "./employment";

// ===================== Employment verification =======================
// Внешнее подтверждение занятости (P4-4). Человек создаёт секретную ссылку;
// публичная страница показывает ТОЛЬКО факты (компания/должность/период/
// статус) из записи работодателя. Без оплаты/причин/оценок. Здесь — типы и
// чистый хелпер активности ссылки под юнит-тесты.

export type EmploymentVerification = {
  id: string;
  employment_id: string;
  token: string;
  created_at: string;
  revoked_at: string | null;
  expires_at: string | null;
  view_count: number;
};

/** Публичная проекция подтверждения (из get_employment_verification). */
export type VerifiedEmployment = {
  company_name: string;
  position: string;
  employment_type: EmploymentType;
  start_date: string | null;
  end_date: string | null;
  status: "active" | "ended";
  verified_at: string;
};

/** Активна ли ссылка на опорный момент (nowIso): не отозвана и не истекла. */
export function isVerificationActive(
  v: { revoked_at: string | null; expires_at: string | null },
  nowIso: string
): boolean {
  if (v.revoked_at) return false;
  if (v.expires_at && v.expires_at <= nowIso) return false;
  return true;
}

const STATUS_LABELS: Record<Locale, { active: string; ended: string }> = {
  ru: { active: "Работает по настоящее время", ended: "Трудовые отношения завершены" },
  en: { active: "Currently employed", ended: "Employment ended" },
  id: { active: "Masih bekerja", ended: "Hubungan kerja berakhir" },
  uz: { active: "Hozirda ishlamoqda", ended: "Mehnat munosabatlari tugagan" },
};

export function verifiedStatusLabel(
  locale: Locale,
  status: "active" | "ended" | string
): string {
  const m = STATUS_LABELS[locale];
  return status === "ended" ? m.ended : m.active;
}

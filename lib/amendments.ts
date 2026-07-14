import type { Locale } from "./i18n";
import type { EmploymentType } from "./employment";

// ======================= Employment amendments =======================
// Допсоглашение (изменение условий трудовых отношений, P3-1): предложение
// работодателя, подтверждённое согласием человека. Здесь — типы, метки и
// чистые хелперы (сводка изменений/дисклеймер) под юнит-тесты.

export type AmendmentKind =
  | "promotion"
  | "transfer"
  | "comp_change"
  | "schedule_change"
  | "terms_change"
  | "other";

export type AmendmentStatus =
  | "draft"
  | "proposed"
  | "accepted"
  | "declined"
  | "withdrawn";

export const AMENDMENT_KINDS: AmendmentKind[] = [
  "promotion",
  "transfer",
  "comp_change",
  "schedule_change",
  "terms_change",
  "other",
];

export type Amendment = {
  id: string;
  employment_id: string;
  kind: AmendmentKind;
  effective_date: string | null;
  new_position: string | null;
  new_employment_type: EmploymentType | null;
  new_compensation: string | null;
  terms: string | null;
  note: string | null;
  disclaimer: string;
  status: AmendmentStatus;
  created_by: string | null;
  created_at: string;
  proposed_at: string | null;
  responded_at: string | null;
  responded_actor: string | null;
};

/** Сотрудник может ответить только на предложенное допсоглашение. */
export function canRespondToAmendment(status: AmendmentStatus | string): boolean {
  return status === "proposed";
}

/** Работодатель может редактировать только черновик. */
export function canEditAmendment(status: AmendmentStatus | string): boolean {
  return status === "draft";
}

const KIND_LABELS: Record<Locale, Record<AmendmentKind, string>> = {
  ru: {
    promotion: "Повышение",
    transfer: "Перевод",
    comp_change: "Изменение оплаты",
    schedule_change: "Изменение графика",
    terms_change: "Изменение условий",
    other: "Другое",
  },
  en: {
    promotion: "Promotion",
    transfer: "Transfer",
    comp_change: "Compensation change",
    schedule_change: "Schedule change",
    terms_change: "Terms change",
    other: "Other",
  },
  id: {
    promotion: "Promosi",
    transfer: "Mutasi",
    comp_change: "Perubahan kompensasi",
    schedule_change: "Perubahan jadwal",
    terms_change: "Perubahan ketentuan",
    other: "Lainnya",
  },
  uz: {
    promotion: "Ko‘tarilish",
    transfer: "O‘tkazish",
    comp_change: "To‘lov o‘zgarishi",
    schedule_change: "Jadval o‘zgarishi",
    terms_change: "Shartlar o‘zgarishi",
    other: "Boshqa",
  },
};

export function amendmentKindLabel(
  locale: Locale,
  kind: AmendmentKind | string
): string {
  return KIND_LABELS[locale][kind as AmendmentKind] ?? String(kind);
}

const STATUS_LABELS: Record<Locale, Record<AmendmentStatus, string>> = {
  ru: {
    draft: "Черновик",
    proposed: "Предложено",
    accepted: "Принято",
    declined: "Отклонено",
    withdrawn: "Отозвано",
  },
  en: {
    draft: "Draft",
    proposed: "Proposed",
    accepted: "Accepted",
    declined: "Declined",
    withdrawn: "Withdrawn",
  },
  id: {
    draft: "Draf",
    proposed: "Diajukan",
    accepted: "Diterima",
    declined: "Ditolak",
    withdrawn: "Ditarik",
  },
  uz: {
    draft: "Qoralama",
    proposed: "Taklif qilingan",
    accepted: "Qabul qilingan",
    declined: "Rad etilgan",
    withdrawn: "Qaytarib olingan",
  },
};

export function amendmentStatusLabel(
  locale: Locale,
  status: AmendmentStatus | string
): string {
  return STATUS_LABELS[locale][status as AmendmentStatus] ?? String(status);
}

// Дефолтный дисклеймер юр-статуса допсоглашения (локаль работодателя;
// хранимое значение — то, что видел сотрудник).
const DEFAULT_DISCLAIMER: Record<Locale, string> = {
  ru: "Допсоглашение фиксирует договорённость об изменении условий. Это не электронная подпись; юридическую силу имеет отдельно подписанный документ.",
  en: "This amendment records an agreement to change terms. It is not an electronic signature; only a separately signed document is legally binding.",
  id: "Adendum ini mencatat kesepakatan perubahan ketentuan. Ini bukan tanda tangan elektronik; hanya dokumen yang ditandatangani terpisah yang mengikat secara hukum.",
  uz: "Bu qo‘shimcha kelishuv shartlarni o‘zgartirishga rozilikni qayd etadi. Bu elektron imzo emas; faqat alohida imzolangan hujjat yuridik kuchga ega.",
};

export function defaultAmendmentDisclaimer(locale: Locale): string {
  return DEFAULT_DISCLAIMER[locale];
}

/** Есть ли у допсоглашения хоть одно фактическое изменение условий. */
export function hasChanges(a: {
  new_position: string | null;
  new_employment_type: string | null;
  new_compensation: string | null;
  terms: string | null;
}): boolean {
  return Boolean(
    a.new_position || a.new_employment_type || a.new_compensation || a.terms
  );
}

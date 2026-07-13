import type { Locale } from "./i18n";
import type { EmploymentType } from "./employment";

// ============================ Offer ===================================
// Оффер — предложение о работе (P2-2). НЕ трудовой договор и НЕ электронная
// подпись: юридическую силу имеет отдельно подписанный договор (дисклеймер).
// Здесь — типы, метки и чистые хелперы под юнит-тесты.

export type OfferStatus =
  | "draft"
  | "sent"
  | "accepted"
  | "declined"
  | "withdrawn";

export type Offer = {
  id: string;
  application_id: string;
  company_id: string;
  position: string;
  employment_type: EmploymentType;
  compensation: string | null;
  start_date: string | null;
  terms: string | null;
  disclaimer: string;
  status: OfferStatus;
  created_by: string | null;
  created_at: string;
  sent_at: string | null;
  responded_at: string | null;
  responded_actor: string | null;
};

/** Проекция оффера для кандидата (из get_application_status). */
export type CandidateOffer = {
  status: "sent" | "accepted" | "declined";
  position: string;
  employment_type: EmploymentType;
  compensation: string | null;
  start_date: string | null;
  terms: string | null;
  disclaimer: string;
  sent_at: string | null;
  responded_at: string | null;
};

/** Кандидат может ответить только на отправленный (но не отвеченный) оффер. */
export function canRespondToOffer(status: OfferStatus | string): boolean {
  return status === "sent";
}

/** Работодатель может редактировать только не-отправленный оффер. */
export function canEditOffer(status: OfferStatus | string): boolean {
  return status === "draft" || status === "declined" || status === "withdrawn";
}

const STATUS_LABELS: Record<Locale, Record<OfferStatus, string>> = {
  ru: {
    draft: "Черновик",
    sent: "Отправлен",
    accepted: "Принят",
    declined: "Отклонён",
    withdrawn: "Отозван",
  },
  en: {
    draft: "Draft",
    sent: "Sent",
    accepted: "Accepted",
    declined: "Declined",
    withdrawn: "Withdrawn",
  },
  id: {
    draft: "Draf",
    sent: "Terkirim",
    accepted: "Diterima",
    declined: "Ditolak",
    withdrawn: "Ditarik",
  },
  uz: {
    draft: "Qoralama",
    sent: "Yuborilgan",
    accepted: "Qabul qilingan",
    declined: "Rad etilgan",
    withdrawn: "Qaytarib olingan",
  },
};

export function offerStatusLabel(
  locale: Locale,
  status: OfferStatus | string
): string {
  const map = STATUS_LABELS[locale];
  return map[status as OfferStatus] ?? String(status);
}

// Дефолтный дисклеймер юр-статуса на локали работодателя (подставляется в
// форму, редактируем). Хранимое значение — то, что видел кандидат.
const DEFAULT_DISCLAIMER: Record<Locale, string> = {
  ru: "Это предложение о работе, а не трудовой договор и не электронная подпись. Юридическую силу имеет отдельно подписанный договор.",
  en: "This is a job offer, not an employment contract or an electronic signature. Only a separately signed contract is legally binding.",
  id: "Ini adalah penawaran kerja, bukan kontrak kerja atau tanda tangan elektronik. Hanya kontrak yang ditandatangani terpisah yang mengikat secara hukum.",
  uz: "Bu ish taklifi, mehnat shartnomasi yoki elektron imzo emas. Faqat alohida imzolangan shartnoma yuridik kuchga ega.",
};

export function defaultDisclaimer(locale: Locale): string {
  return DEFAULT_DISCLAIMER[locale];
}

import type { Locale } from "./i18n";

// ========================= Legal information ==========================
// Юридический информационный слой (P3-3, арх. §13/§14). ОДНА юрисдикция за
// запуск. Doki.help НЕ даёт универсальных юридических заключений: контент
// курируется (источник/версия/дата), сопровождается дисклеймером и маршрутом
// к специалисту. Здесь — типы, метки и константы-дисклеймеры под юнит-тесты.

// Юрисдикция запуска (одна). Индонезия.
export const LEGAL_JURISDICTION = "ID";

export type LegalCategory =
  | "employment"
  | "contract"
  | "work_permit"
  | "probation"
  | "termination"
  | "wages"
  | "general";

export const LEGAL_CATEGORIES: LegalCategory[] = [
  "employment",
  "contract",
  "work_permit",
  "probation",
  "termination",
  "wages",
  "general",
];

export type LegalTopic = {
  id: string;
  jurisdiction: string;
  category: LegalCategory;
  slug: string;
  title: string;
  body: string | null;
  source: string | null;
  source_version: string | null;
  source_url: string | null;
  reviewed_at: string | null;
  disclaimer: string | null;
  specialist_route: string | null;
  published: boolean;
  sort: number;
};

const CATEGORY_LABELS: Record<Locale, Record<LegalCategory, string>> = {
  ru: {
    employment: "Трудовые отношения",
    contract: "Договор",
    work_permit: "Разрешение на работу",
    probation: "Испытательный срок",
    termination: "Прекращение",
    wages: "Оплата труда",
    general: "Общее",
  },
  en: {
    employment: "Employment",
    contract: "Contract",
    work_permit: "Work permit",
    probation: "Probation",
    termination: "Termination",
    wages: "Wages",
    general: "General",
  },
  id: {
    employment: "Hubungan kerja",
    contract: "Kontrak",
    work_permit: "Izin kerja",
    probation: "Masa percobaan",
    termination: "Pemutusan",
    wages: "Upah",
    general: "Umum",
  },
  uz: {
    employment: "Mehnat munosabatlari",
    contract: "Shartnoma",
    work_permit: "Ishlash ruxsatnomasi",
    probation: "Sinov muddati",
    termination: "Tugatish",
    wages: "Ish haqi",
    general: "Umumiy",
  },
};

export function legalCategoryLabel(
  locale: Locale,
  category: LegalCategory | string
): string {
  return CATEGORY_LABELS[locale][category as LegalCategory] ?? String(category);
}

// Название юрисдикции для показа пользователю.
const JURISDICTION_NAME: Record<Locale, string> = {
  ru: "Индонезия",
  en: "Indonesia",
  id: "Indonesia",
  uz: "Indoneziya",
};

export function jurisdictionName(locale: Locale): string {
  return JURISDICTION_NAME[locale];
}

// Глобальный дисклеймер (арх. §13: не универсальное юр-заключение).
const DISCLAIMER: Record<Locale, string> = {
  ru: "Информация носит справочный характер и не является юридической консультацией. Материалы относятся к одной юрисдикции и могут устареть. По вашей ситуации обратитесь к квалифицированному специалисту.",
  en: "This information is for reference only and is not legal advice. Materials cover a single jurisdiction and may be outdated. For your situation, consult a qualified specialist.",
  id: "Informasi ini hanya untuk referensi dan bukan nasihat hukum. Materi mencakup satu yurisdiksi dan bisa usang. Untuk situasi Anda, konsultasikan dengan spesialis yang berkualifikasi.",
  uz: "Ma'lumot faqat ma'lumot uchun bo‘lib, yuridik maslahat emas. Materiallar bitta yurisdiksiyani qamrab oladi va eskirishi mumkin. O‘z holatingiz bo‘yicha malakali mutaxassisga murojaat qiling.",
};

export function legalDisclaimer(locale: Locale): string {
  return DISCLAIMER[locale];
}

// Текст маршрута к специалисту (CTA-подпись).
const SPECIALIST_ROUTE: Record<Locale, string> = {
  ru: "Нужна помощь по вашему случаю? Обратитесь к квалифицированному юристу.",
  en: "Need help with your case? Reach out to a qualified lawyer.",
  id: "Butuh bantuan untuk kasus Anda? Hubungi pengacara yang berkualifikasi.",
  uz: "Ishingiz bo‘yicha yordam kerakmi? Malakali yuristga murojaat qiling.",
};

export function specialistRouteText(locale: Locale): string {
  return SPECIALIST_ROUTE[locale];
}

import type { Locale } from "./i18n";

export type DocCategory =
  | "identity"
  | "education"
  | "career"
  | "medical"
  | "financial"
  | "tax"
  | "legal"
  | "other";

export type RecordKind =
  | "medical_analysis"
  | "prescription"
  | "nutrition"
  | "vaccination"
  | "note"
  | "other";

export type AssetType = "vehicle" | "real_estate" | "other";

type L<K extends string> = {
  key: K;
  emoji: string;
  ru: string;
  en: string;
  id: string;
  uz: string;
};

/* ── Данные (многоязычные) ───────────────────────────────────────── */

const CAT: L<DocCategory>[] = [
  { key: "identity", emoji: "🪪", ru: "Удостоверения", en: "ID documents", id: "Dokumen identitas", uz: "Shaxsiy hujjatlar" },
  { key: "education", emoji: "🎓", ru: "Образование", en: "Education", id: "Pendidikan", uz: "Ta'lim" },
  { key: "career", emoji: "💼", ru: "Работа и карьера", en: "Work & career", id: "Pekerjaan & karier", uz: "Ish va martaba" },
  { key: "medical", emoji: "🩺", ru: "Медицина", en: "Medical", id: "Medis", uz: "Tibbiyot" },
  { key: "financial", emoji: "💳", ru: "Финансы", en: "Finance", id: "Keuangan", uz: "Moliya" },
  { key: "tax", emoji: "🧾", ru: "Налоги", en: "Taxes", id: "Pajak", uz: "Soliqlar" },
  { key: "legal", emoji: "📜", ru: "Юридические", en: "Legal", id: "Hukum", uz: "Yuridik" },
  { key: "other", emoji: "🗂️", ru: "Прочее", en: "Other", id: "Lainnya", uz: "Boshqa" },
];

const REL: L<string>[] = [
  { key: "self", emoji: "", ru: "Я", en: "Me", id: "Saya", uz: "Men" },
  { key: "spouse", emoji: "", ru: "Супруг(а)", en: "Spouse", id: "Pasangan", uz: "Turmush o'rtoq" },
  { key: "child", emoji: "", ru: "Ребёнок", en: "Child", id: "Anak", uz: "Farzand" },
  { key: "parent", emoji: "", ru: "Родитель", en: "Parent", id: "Orang tua", uz: "Ota-ona" },
  { key: "grandparent", emoji: "", ru: "Бабушка/дедушка", en: "Grandparent", id: "Kakek/nenek", uz: "Buva/buvi" },
  { key: "ward", emoji: "", ru: "Подопечный", en: "Ward", id: "Anak asuh", uz: "Vasiylikdagi" },
  { key: "other", emoji: "", ru: "Другое", en: "Other", id: "Lainnya", uz: "Boshqa" },
];

const REC: L<RecordKind>[] = [
  { key: "medical_analysis", emoji: "🧪", ru: "Анализ", en: "Lab test", id: "Hasil lab", uz: "Tahlil" },
  { key: "prescription", emoji: "💊", ru: "Назначение", en: "Prescription", id: "Resep", uz: "Retsept" },
  { key: "vaccination", emoji: "💉", ru: "Прививка", en: "Vaccination", id: "Vaksinasi", uz: "Emlash" },
  { key: "nutrition", emoji: "🥗", ru: "Питание", en: "Nutrition", id: "Nutrisi", uz: "Ovqatlanish" },
  { key: "note", emoji: "📝", ru: "Заметка", en: "Note", id: "Catatan", uz: "Eslatma" },
  { key: "other", emoji: "•", ru: "Другое", en: "Other", id: "Lainnya", uz: "Boshqa" },
];

const AST: L<AssetType>[] = [
  { key: "vehicle", emoji: "🚗", ru: "Транспорт", en: "Vehicle", id: "Kendaraan", uz: "Transport" },
  { key: "real_estate", emoji: "🏠", ru: "Недвижимость", en: "Real estate", id: "Properti", uz: "Ko'chmas mulk" },
  { key: "other", emoji: "📦", ru: "Другое", en: "Other", id: "Lainnya", uz: "Boshqa" },
];

/* ── Локализованные аксессоры ────────────────────────────────────── */

export function categories(locale: Locale) {
  return CAT.map((c) => ({ key: c.key, label: c[locale], emoji: c.emoji }));
}
export function categoryLabel(locale: Locale, key: DocCategory): string {
  return CAT.find((c) => c.key === key)?.[locale] ?? key;
}

export function relations(locale: Locale) {
  return REL.map((r) => ({ key: r.key, label: r[locale] }));
}
export function relationLabel(locale: Locale, key: string): string {
  return REL.find((r) => r.key === key)?.[locale] ?? key;
}

export function recordKinds(locale: Locale) {
  return REC.map((r) => ({ key: r.key, label: r[locale], emoji: r.emoji }));
}
export function recordKindLabel(locale: Locale, key: RecordKind): string {
  return REC.find((r) => r.key === key)?.[locale] ?? key;
}

export function assetTypes(locale: Locale) {
  return AST.map((a) => ({ key: a.key, label: a[locale], emoji: a.emoji }));
}
export function assetTypeLabel(locale: Locale, key: AssetType): string {
  return AST.find((a) => a.key === key)?.[locale] ?? key;
}

/* ── Справочник типов документов под Россию (подсказки для поля «тип») ── */

const SUBTYPES_RU: Record<DocCategory, string[]> = {
  identity: [
    "Паспорт РФ",
    "Загранпаспорт",
    "Свидетельство о рождении",
    "СНИЛС",
    "Военный билет",
    "Водительское удостоверение",
    "Свидетельство о браке",
    "Свидетельство о разводе",
    "Вид на жительство",
    "РВП",
    "Виза",
    "Миграционная карта",
  ],
  medical: [
    "Полис ОМС",
    "Полис ДМС",
    "Прививочный сертификат",
    "Медицинская справка",
    "Справка 086/у",
    "Родовой сертификат",
  ],
  education: [
    "Аттестат (9 класс)",
    "Аттестат (11 класс)",
    "Диплом",
    "Приложение к диплому",
    "Диплом (иностранный)",
    "Ijazah (местный аттестат)",
    "Языковой сертификат (IELTS/TOEFL)",
    "Профессиональный сертификат / лицензия",
    "Сертификат онлайн-курса",
    "Сертификат ЕГЭ",
    "Сертификат ОГЭ",
    "Студенческий билет / зачётка",
    "Рекомендация из учебного заведения",
    "Документы детского сада",
    "Документы школы",
    "Грамота / сертификат",
  ],
  career: [
    "Трудовой договор",
    "Трудовая книжка",
    "Справка с места работы",
    "Резюме / CV",
    "Рекомендательное письмо",
    "Сертификат о повышении квалификации",
    "Должностная инструкция",
  ],
  financial: [
    "ОСАГО",
    "КАСКО",
    "ПТС",
    "СТС",
    "Договор купли-продажи авто",
    "Выписка ЕГРН",
    "Договор купли-продажи",
    "ДДУ",
    "Сертификат на материнский капитал",
    "Кредитный договор",
    "Ипотечный договор",
    "Квитанция ЖКХ",
  ],
  tax: [
    "ИНН",
    "Справка 2-НДФЛ",
    "Налоговое уведомление",
    "Декларация 3-НДФЛ",
    "Налоговый вычет",
    "Патент",
    "Квитанция по налогам",
  ],
  legal: [
    "Доверенность",
    "Согласие на выезд ребёнка",
    "Завещание",
    "Договор аренды",
    "Договор услуг",
    "Брачный договор",
    "Соглашение об алиментах",
  ],
  other: [],
};

/** Подсказки типов документа для категории. Пока — только для русского. */
export function docSubtypes(locale: Locale, category: DocCategory): string[] {
  if (locale !== "ru") return [];
  return SUBTYPES_RU[category] ?? [];
}

/* ── Обратная совместимость (RU) — для ещё не переведённых экранов ── */

export const CATEGORIES = CAT.map((c) => ({ key: c.key, label: c.ru, emoji: c.emoji }));
export const CATEGORY_LABEL = Object.fromEntries(CAT.map((c) => [c.key, c.ru])) as Record<DocCategory, string>;
export const RELATIONS = REL.map((r) => ({ key: r.key, label: r.ru }));
export const RELATION_LABEL = Object.fromEntries(REL.map((r) => [r.key, r.ru])) as Record<string, string>;
export const RECORD_KINDS = REC.map((r) => ({ key: r.key, label: r.ru, emoji: r.emoji }));
export const RECORD_KIND_LABEL = Object.fromEntries(REC.map((r) => [r.key, r.ru])) as Record<RecordKind, string>;
export const ASSET_TYPES = AST.map((a) => ({ key: a.key, label: a.ru, emoji: a.emoji }));
export const ASSET_TYPE_LABEL = Object.fromEntries(AST.map((a) => [a.key, a.ru])) as Record<AssetType, string>;

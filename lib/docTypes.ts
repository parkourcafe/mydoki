import type { Locale } from "./i18n";
import type { DocCategory } from "./categories";

/**
 * Канонические типы документов из ТЗ фазы 1 (§4.2) отображаются на пары
 * (category, subtype) существующей схемы. Enum doc_category не расширяем —
 * маппинг чисто прикладной. Это позволяет ТЗ-термины (passport, diploma,
 * visa…) сосуществовать с текущей моделью без миграций.
 */
export type CanonicalDocKind =
  | "passport"
  | "visa"
  | "diploma"
  | "certificate"
  | "resume"
  | "recommendation"
  | "employment_contract"
  | "insurance"
  | "medical"
  | "family"
  | "other";

type Mapping = {
  kind: CanonicalDocKind;
  category: DocCategory;
  /** Каноничный subtype-ключ; null — для категорий без уточнения. */
  subtype: string | null;
  ru: string;
  en: string;
  id: string;
  uz: string;
};

const MAP: Mapping[] = [
  { kind: "passport", category: "identity", subtype: "passport", ru: "Паспорт", en: "Passport", id: "Paspor", uz: "Pasport" },
  { kind: "visa", category: "identity", subtype: "visa", ru: "Виза", en: "Visa", id: "Visa", uz: "Viza" },
  { kind: "diploma", category: "education", subtype: "diploma", ru: "Диплом", en: "Diploma", id: "Ijazah", uz: "Diplom" },
  { kind: "certificate", category: "education", subtype: "certificate", ru: "Сертификат", en: "Certificate", id: "Sertifikat", uz: "Sertifikat" },
  { kind: "resume", category: "career", subtype: "resume", ru: "Резюме", en: "Resume", id: "Resume", uz: "Rezyume" },
  { kind: "recommendation", category: "career", subtype: "recommendation", ru: "Рекомендация", en: "Recommendation", id: "Rekomendasi", uz: "Tavsiyanoma" },
  { kind: "employment_contract", category: "career", subtype: "employment_contract", ru: "Трудовой договор", en: "Employment contract", id: "Kontrak kerja", uz: "Mehnat shartnomasi" },
  { kind: "insurance", category: "financial", subtype: "insurance", ru: "Страховка", en: "Insurance", id: "Asuransi", uz: "Sug'urta" },
  { kind: "medical", category: "medical", subtype: null, ru: "Медицинский документ", en: "Medical document", id: "Dokumen medis", uz: "Tibbiy hujjat" },
  { kind: "family", category: "legal", subtype: "family", ru: "Семейный документ", en: "Family document", id: "Dokumen keluarga", uz: "Oilaviy hujjat" },
  { kind: "other", category: "other", subtype: null, ru: "Прочее", en: "Other", id: "Lainnya", uz: "Boshqa" },
];

/** Канонический тип → пара (category, subtype) для записи в БД. */
export function fromCanonical(
  kind: CanonicalDocKind
): { category: DocCategory; subtype: string | null } {
  const m = MAP.find((x) => x.kind === kind) ?? MAP[MAP.length - 1];
  return { category: m.category, subtype: m.subtype };
}

/**
 * Пара (category, subtype) → канонический тип. Сопоставление по subtype в
 * приоритете; если subtype не распознан — по категории (первый тип с этой
 * категорией), иначе "other".
 */
export function toCanonical(
  category: DocCategory,
  subtype: string | null | undefined
): CanonicalDocKind {
  const s = (subtype ?? "").trim().toLowerCase();
  if (s) {
    const bySubtype = MAP.find(
      (x) => x.subtype === s || x.kind === s
    );
    if (bySubtype) return bySubtype.kind;
  }
  const byCategory = MAP.find((x) => x.category === category && x.subtype === null);
  return byCategory?.kind ?? "other";
}

/** Локализованное название канонического типа. */
export function canonicalLabel(locale: Locale, kind: CanonicalDocKind): string {
  const m = MAP.find((x) => x.kind === kind);
  return m ? m[locale] : kind;
}

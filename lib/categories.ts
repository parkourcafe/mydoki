import type { Locale } from "./i18n";

export type DocCategory =
  | "identity"
  | "education"
  | "medical"
  | "financial"
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

type L<K extends string> = { key: K; emoji: string; ru: string; en: string };

/* ── Данные (двуязычные) ─────────────────────────────────────────── */

const CAT: L<DocCategory>[] = [
  { key: "identity", emoji: "🪪", ru: "Удостоверения", en: "ID documents" },
  { key: "education", emoji: "🎓", ru: "Образование", en: "Education" },
  { key: "medical", emoji: "🩺", ru: "Медицина", en: "Medical" },
  { key: "financial", emoji: "💳", ru: "Финансы", en: "Finance" },
  { key: "legal", emoji: "📜", ru: "Юридические", en: "Legal" },
  { key: "other", emoji: "🗂️", ru: "Прочее", en: "Other" },
];

const REL: L<string>[] = [
  { key: "self", emoji: "", ru: "Я", en: "Me" },
  { key: "spouse", emoji: "", ru: "Супруг(а)", en: "Spouse" },
  { key: "child", emoji: "", ru: "Ребёнок", en: "Child" },
  { key: "parent", emoji: "", ru: "Родитель", en: "Parent" },
  { key: "other", emoji: "", ru: "Другое", en: "Other" },
];

const REC: L<RecordKind>[] = [
  { key: "medical_analysis", emoji: "🧪", ru: "Анализ", en: "Lab test" },
  { key: "prescription", emoji: "💊", ru: "Назначение", en: "Prescription" },
  { key: "vaccination", emoji: "💉", ru: "Прививка", en: "Vaccination" },
  { key: "nutrition", emoji: "🥗", ru: "Питание", en: "Nutrition" },
  { key: "note", emoji: "📝", ru: "Заметка", en: "Note" },
  { key: "other", emoji: "•", ru: "Другое", en: "Other" },
];

const AST: L<AssetType>[] = [
  { key: "vehicle", emoji: "🚗", ru: "Транспорт", en: "Vehicle" },
  { key: "real_estate", emoji: "🏠", ru: "Недвижимость", en: "Real estate" },
  { key: "other", emoji: "📦", ru: "Другое", en: "Other" },
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

/* ── Обратная совместимость (RU) — для ещё не переведённых экранов ── */

export const CATEGORIES = CAT.map((c) => ({ key: c.key, label: c.ru, emoji: c.emoji }));
export const CATEGORY_LABEL = Object.fromEntries(CAT.map((c) => [c.key, c.ru])) as Record<DocCategory, string>;
export const RELATIONS = REL.map((r) => ({ key: r.key, label: r.ru }));
export const RELATION_LABEL = Object.fromEntries(REL.map((r) => [r.key, r.ru])) as Record<string, string>;
export const RECORD_KINDS = REC.map((r) => ({ key: r.key, label: r.ru, emoji: r.emoji }));
export const RECORD_KIND_LABEL = Object.fromEntries(REC.map((r) => [r.key, r.ru])) as Record<RecordKind, string>;
export const ASSET_TYPES = AST.map((a) => ({ key: a.key, label: a.ru, emoji: a.emoji }));
export const ASSET_TYPE_LABEL = Object.fromEntries(AST.map((a) => [a.key, a.ru])) as Record<AssetType, string>;

export type DocCategory =
  | "identity"
  | "education"
  | "medical"
  | "financial"
  | "legal"
  | "other";

export const CATEGORIES: { key: DocCategory; label: string; emoji: string }[] = [
  { key: "identity", label: "Удостоверения", emoji: "🪪" },
  { key: "education", label: "Образование", emoji: "🎓" },
  { key: "medical", label: "Медицина", emoji: "🩺" },
  { key: "financial", label: "Финансы", emoji: "💳" },
  { key: "legal", label: "Юридические", emoji: "📜" },
  { key: "other", label: "Прочее", emoji: "🗂️" },
];

export const CATEGORY_LABEL: Record<DocCategory, string> = Object.fromEntries(
  CATEGORIES.map((c) => [c.key, c.label])
) as Record<DocCategory, string>;

export const RELATIONS: { key: string; label: string }[] = [
  { key: "self", label: "Я" },
  { key: "spouse", label: "Супруг(а)" },
  { key: "child", label: "Ребёнок" },
  { key: "parent", label: "Родитель" },
  { key: "other", label: "Другое" },
];

export const RELATION_LABEL: Record<string, string> = Object.fromEntries(
  RELATIONS.map((r) => [r.key, r.label])
);

export type RecordKind =
  | "medical_analysis"
  | "prescription"
  | "nutrition"
  | "vaccination"
  | "note"
  | "other";

export const RECORD_KINDS: { key: RecordKind; label: string; emoji: string }[] = [
  { key: "medical_analysis", label: "Анализ", emoji: "🧪" },
  { key: "prescription", label: "Назначение", emoji: "💊" },
  { key: "vaccination", label: "Прививка", emoji: "💉" },
  { key: "nutrition", label: "Питание", emoji: "🥗" },
  { key: "note", label: "Заметка", emoji: "📝" },
  { key: "other", label: "Другое", emoji: "•" },
];

export const RECORD_KIND_LABEL: Record<RecordKind, string> = Object.fromEntries(
  RECORD_KINDS.map((r) => [r.key, r.label])
) as Record<RecordKind, string>;

import {
  DOC_TYPES,
  docTypeLabel,
  isSensitiveApplicationDocument,
  type DocType,
  type RequiredDocument,
  type ScreeningQuestion,
  type ScorecardCriterion,
  type Urgency,
} from "./career";
import type { Locale } from "./i18n";

// =====================================================================
// T11 Layer 2 — контракт AI-черновика (DEV_TASK §6, §8).
//
// ИИ возвращает ТОЛЬКО JSON, мапящийся исключительно на поля D2 плюс спящий
// scorecard. Здесь — защитный парсинг: снять лишние ограждения/фенсы,
// провалидировать по схеме, ВЫКИНУТЬ неизвестные ключи. Модель НЕ должна
// эмитить interview questions, test tasks или candidate-profile prose; так как
// мы забираем только whitelisted-поля D2, любой такой мусор отбрасывается
// автоматически (AC §11.5). ИИ никогда не публикует (D6) — это лишь черновик
// в поля формы.
// =====================================================================

/** Поля, которые ИИ может заполнить (D2). Всё остальное отбрасывается. */
export type VacancyDraft = {
  title?: string;
  company_name?: string;
  location?: string;
  salary_range?: string | null;
  schedule?: string | null;
  urgency?: Urgency;
  description?: string;
  required_documents: RequiredDocument[];
  screening_questions: ScreeningQuestion[];
  /** Спящие метаданные уровня вакансии (§8) — не оценка кандидата. */
  scorecard: ScorecardCriterion[];
};

const AI_DOC_TYPES = new Set<DocType>(DOC_TYPES);
const MAX_DOCS = 8;
const MAX_QUESTIONS = 8;
const MAX_SCORECARD = 8;

/** Достаёт JSON-объект из ответа модели, снимая случайные ```-фенсы/префиксы. */
export function extractJsonObject(text: string): Record<string, unknown> {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1 || end < start) {
    throw new Error("NO_JSON");
  }
  return JSON.parse(text.slice(start, end + 1)) as Record<string, unknown>;
}

function str(v: unknown): string | undefined {
  return typeof v === "string" && v.trim() ? v.trim() : undefined;
}

function normDocs(v: unknown, locale: Locale): RequiredDocument[] {
  if (!Array.isArray(v)) return [];
  const out: RequiredDocument[] = [];
  for (const raw of v) {
    if (!raw || typeof raw !== "object") continue;
    const r = raw as Record<string, unknown>;
    const type = (typeof r.type === "string" && AI_DOC_TYPES.has(r.type as DocType)
      ? (r.type as DocType)
      : "other") as DocType;
    const label = str(r.label) ?? docTypeLabel(locale, type);
    const doc = { type, label, required: r.required !== false };
    if (isSensitiveApplicationDocument(doc)) continue;
    out.push(doc);
    if (out.length >= MAX_DOCS) break;
  }
  return out;
}

function normQuestions(v: unknown): ScreeningQuestion[] {
  if (!Array.isArray(v)) return [];
  const out: ScreeningQuestion[] = [];
  for (const raw of v) {
    if (!raw || typeof raw !== "object") continue;
    const r = raw as Record<string, unknown>;
    const question = str(r.question);
    if (!question) continue;
    // ИИ ограничен text|yes_no (§6); прочее приводим к text.
    const type = r.type === "yes_no" ? "yes_no" : "text";
    out.push({ question, type, required: true });
    if (out.length >= MAX_QUESTIONS) break;
  }
  return out;
}

function normScorecard(v: unknown): ScorecardCriterion[] {
  if (!Array.isArray(v)) return [];
  const out: ScorecardCriterion[] = [];
  for (const raw of v) {
    if (!raw || typeof raw !== "object") continue;
    const r = raw as Record<string, unknown>;
    const criterion = str(r.criterion);
    if (!criterion) continue;
    const w = Number(r.weight);
    const weight = Number.isFinite(w) ? Math.min(100, Math.max(0, Math.round(w))) : 0;
    out.push({ criterion, weight });
    if (out.length >= MAX_SCORECARD) break;
  }
  return out;
}

/**
 * Приводит сырой ответ модели к строго whitelisted-черновику. Неизвестные
 * ключи (в т.ч. interview_questions / test_tasks / candidate_profile)
 * отбрасываются самим фактом выборки только полей D2.
 * fieldsGenerated — сколько полей D2 реально заполнено (аналитика §10, событие 4).
 */
export function sanitizeDraft(
  raw: Record<string, unknown>,
  locale: Locale
): { draft: VacancyDraft; fieldsGenerated: number } {
  const draft: VacancyDraft = {
    title: str(raw.title),
    company_name: str(raw.company_name),
    location: str(raw.location),
    salary_range: str(raw.salary_range) ?? null,
    schedule: str(raw.schedule) ?? null,
    urgency: raw.urgency === "hiring_now" ? "hiring_now" : "normal",
    description: str(raw.description),
    required_documents: normDocs(raw.required_documents, locale),
    screening_questions: normQuestions(raw.screening_questions),
    scorecard: normScorecard(raw.scorecard),
  };

  let fieldsGenerated = 0;
  if (draft.title) fieldsGenerated++;
  if (draft.company_name) fieldsGenerated++;
  if (draft.location) fieldsGenerated++;
  if (draft.salary_range) fieldsGenerated++;
  if (draft.schedule) fieldsGenerated++;
  if (draft.description) fieldsGenerated++;
  if (draft.required_documents.length) fieldsGenerated++;
  if (draft.screening_questions.length) fieldsGenerated++;
  if (draft.scorecard.length) fieldsGenerated++;

  return { draft, fieldsGenerated };
}

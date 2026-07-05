import "server-only";
import type { Locale } from "./i18n";
import {
  extractJsonObject,
  sanitizeDraft,
  type VacancyDraft,
} from "./vacancyDraft";

/**
 * Клиент LLM для GLM (Zhipu / z.ai). API OpenAI-совместимый.
 * Переменные окружения:
 *  - GLM_API_KEY       — ключ (обязателен)
 *  - GLM_BASE_URL      — база API (по умолчанию z.ai international)
 *  - GLM_MODEL         — текстовая модель (чат-юрист)
 *  - GLM_VISION_MODEL  — модель с распознаванием изображений (документы)
 */

function apiKey(): string {
  const k = process.env.GLM_API_KEY;
  if (!k) throw new Error("NO_API_KEY");
  return k;
}

const BASE = process.env.GLM_BASE_URL || "https://api.z.ai/api/paas/v4";
const TEXT_MODEL = process.env.GLM_MODEL || "glm-4.6";
const VISION_MODEL = process.env.GLM_VISION_MODEL || "glm-4v";

type ChatMessage = { role: "system" | "user" | "assistant"; content: unknown };

async function chat(body: Record<string, unknown>): Promise<string> {
  const res = await fetch(`${BASE}/chat/completions`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      Authorization: `Bearer ${apiKey()}`,
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`GLM_${res.status}: ${detail.slice(0, 200)}`);
  }
  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  return data.choices?.[0]?.message?.content ?? "";
}

/* ── Распознавание документа (vision) ───────────────────────────── */

export type ClassifyResult = {
  category: string | null;
  subtype: string | null;
  title: string | null;
  issuer: string | null;
  doc_number: string | null;
  issued_at: string | null;
  expires_at: string | null;
  tags: string[];
};

const VALID_CATEGORIES = [
  "identity",
  "education",
  "career",
  "medical",
  "financial",
  "tax",
  "legal",
  "other",
];

const CLASSIFY_SYSTEM = `Ты извлекаешь метаданные из фото/скана личного документа человека.
Верни ТОЛЬКО JSON-объект (без пояснений, без markdown) со строго такими ключами:
- "category": одно из ["identity","education","career","medical","financial","tax","legal","other"] (career — трудовые/карьерные документы: трудовой договор, трудовая книжка, справка с работы; tax — налоговые: ИНН, 2-НДФЛ, налоговые уведомления, декларации)
- "subtype": короткий тип документа по-русски (например "паспорт", "диплом", "СНИЛС") или null
- "title": короткое человекочитаемое название по-русски или null
- "issuer": кем выдан или null
- "doc_number": номер документа или null
- "issued_at": дата выдачи в формате YYYY-MM-DD или null
- "expires_at": срок действия в формате YYYY-MM-DD или null
- "tags": массив коротких русских тегов (может быть [])
Если поле не удаётся определить — поставь null.`;

function pickJson(text: string): Record<string, unknown> {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("Модель не вернула JSON");
  return JSON.parse(text.slice(start, end + 1));
}

export async function classifyDocument(
  base64: string,
  mediaType: string
): Promise<ClassifyResult> {
  const dataUrl = `data:${mediaType};base64,${base64}`;
  const messages: ChatMessage[] = [
    { role: "system", content: CLASSIFY_SYSTEM },
    {
      role: "user",
      content: [
        { type: "text", text: "Извлеки метаданные этого документа. Ответ — только JSON." },
        { type: "image_url", image_url: { url: dataUrl } },
      ],
    },
  ];

  const text = await chat({
    model: VISION_MODEL,
    temperature: 0,
    max_tokens: 600,
    messages,
  });

  const raw = pickJson(text);
  const str = (v: unknown) =>
    typeof v === "string" && v.trim() ? v.trim() : null;

  const category =
    typeof raw.category === "string" && VALID_CATEGORIES.includes(raw.category)
      ? raw.category
      : null;

  return {
    category,
    subtype: str(raw.subtype),
    title: str(raw.title),
    issuer: str(raw.issuer),
    doc_number: str(raw.doc_number),
    issued_at: str(raw.issued_at),
    expires_at: str(raw.expires_at),
    tags: Array.isArray(raw.tags)
      ? raw.tags.filter((t): t is string => typeof t === "string").slice(0, 10)
      : [],
  };
}

/* ── AI-юрист (чат) ─────────────────────────────────────────────── */

const LAWYER_SYSTEM = `Ты — AI-помощник по бытовым юридическим вопросам для семьи (сервис doki.help).
Отвечай по российскому праву (если пользователь не указал другую страну), простым и дружелюбным языком.
Что делаешь:
- объясняешь документы и права понятным языком;
- даёшь конкретный порядок действий по шагам;
- помогаешь составлять заявления, претензии, доверенности, расписки как готовые шаблоны.
Правила:
- Не выдумывай номера статей и законов. Если не уверен в точной норме — так и скажи.
- Не помогай обходить закон.
- В сложных или спорных ситуациях кратко напоминай в конце: это справочная информация, а не юридическая консультация, и в важных случаях лучше обратиться к живому юристу.
- Пиши по делу, без воды.`;

export async function lawyerChat(
  history: { role: "user" | "assistant"; content: string }[]
): Promise<string> {
  const messages: ChatMessage[] = [
    { role: "system", content: LAWYER_SYSTEM },
    ...history.slice(-20).map((m) => ({ role: m.role, content: m.content })),
  ];

  const text = await chat({
    model: TEXT_MODEL,
    temperature: 0.4,
    max_tokens: 1200,
    messages,
  });
  return text.trim();
}

/* ── AI-черновик вакансии (T11 Layer 2, §6) ─────────────────────── */

// Язык вывода вакансии (D8): по умолчанию id, запасной — en. Текстовые поля
// генерируем на языке локали вакансии.
const OUTPUT_LANGUAGE: Record<Locale, string> = {
  id: "Bahasa Indonesia",
  en: "English",
  ru: "Russian",
  uz: "Uzbek",
};

export type VacancyDraftAnswer = { question: string; answer: string };

function draftSystemPrompt(locale: Locale): string {
  const lang = OUTPUT_LANGUAGE[locale] ?? OUTPUT_LANGUAGE.en;
  // Строгий контракт: ТОЛЬКО JSON, только поля D2 + спящий scorecard.
  return `You help an employer turn a rough description into a clean job vacancy draft.
Return ONLY a JSON object — no prose, no markdown, no code fences.
Write all human-readable text fields in ${lang}.

The JSON MUST have exactly these keys and nothing else:
{
  "title": string,
  "company_name": string,
  "location": string,
  "salary_range": string | null,
  "schedule": string | null,
  "urgency": "normal" | "hiring_now",
  "description": string,
  "required_documents": [{ "type": "cv|ktp|diploma|health_cert|certificate|other", "label": string, "required": boolean }],
  "screening_questions": [{ "question": string, "type": "text|yes_no" }],
  "scorecard": [{ "criterion": string, "weight": number }]
}

Rules:
- required_documents: 2–5 items. For Indonesian roles always include KTP.
- screening_questions: 1–4 short items; "type" is only "text" or "yes_no".
- scorecard: 3–5 hiring criteria FOR THE ROLE (skills/traits the ideal hire needs), NOT an evaluation of any specific candidate; integer weights that sum to ~100.
- Do NOT invent interview questions, test tasks, or any candidate profile/description. Do NOT add keys beyond the schema above.
- If a value is unknown, use null (for salary_range/schedule) or a sensible generic default. Never leave the JSON malformed.`;
}

function draftUserPrompt(
  freeform: string,
  answers: VacancyDraftAnswer[]
): string {
  const lines = [`Employer's description:\n${freeform.trim()}`];
  const qa = answers
    .map((a) => a.answer.trim() && `- ${a.question} ${a.answer.trim()}`)
    .filter(Boolean);
  if (qa.length) lines.push(`\nClarifying answers:\n${qa.join("\n")}`);
  lines.push("\nReturn only the JSON object.");
  return lines.join("\n");
}

/**
 * Генерирует и санитизирует AI-черновик вакансии. Бросает при отсутствии ключа
 * (NO_API_KEY) или если модель не вернула валидный JSON (NO_JSON). Никогда не
 * публикует — вызывающий кладёт результат в поля формы (D6).
 */
export async function generateVacancyDraft(
  freeform: string,
  answers: VacancyDraftAnswer[],
  locale: Locale
): Promise<{ draft: VacancyDraft; fieldsGenerated: number }> {
  const messages: ChatMessage[] = [
    { role: "system", content: draftSystemPrompt(locale) },
    { role: "user", content: draftUserPrompt(freeform, answers) },
  ];

  const text = await chat({
    model: TEXT_MODEL,
    temperature: 0.3,
    max_tokens: 900,
    messages,
  });

  const raw = extractJsonObject(text);
  return sanitizeDraft(raw, locale);
}

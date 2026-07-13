import "server-only";

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

// AI-юрист (lawyerChat) удалён: функциональность юридического помощника —
// фаза 3, в фазе 1 запрещена (ТЗ §11). Был мёртвым кодом (нигде не вызывался).

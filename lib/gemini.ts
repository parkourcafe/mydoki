import "server-only";

const ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models";

function apiKey(): string {
  const k = process.env.GEMINI_API_KEY;
  if (!k) throw new Error("NO_API_KEY");
  return k;
}

function modelName(): string {
  return process.env.GEMINI_MODEL || "gemini-2.0-flash";
}

type Part = { text?: string; inline_data?: { mime_type: string; data: string } };
type Content = { role: "user" | "model"; parts: Part[] };

async function generate(body: Record<string, unknown>): Promise<string> {
  const res = await fetch(
    `${ENDPOINT}/${modelName()}:generateContent?key=${apiKey()}`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    }
  );
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`GEMINI_${res.status}: ${detail.slice(0, 200)}`);
  }
  const data = (await res.json()) as {
    candidates?: { content?: { parts?: { text?: string }[] } }[];
  };
  return (data.candidates?.[0]?.content?.parts ?? [])
    .map((p) => p.text ?? "")
    .join("");
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
  "medical",
  "financial",
  "legal",
  "other",
];

const CLASSIFY_SYSTEM = `Ты извлекаешь метаданные из фото/скана личного документа человека.
Верни ТОЛЬКО JSON-объект (без пояснений, без markdown) со строго такими ключами:
- "category": одно из ["identity","education","medical","financial","legal","other"]
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
  const text = await generate({
    system_instruction: { parts: [{ text: CLASSIFY_SYSTEM }] },
    contents: [
      {
        role: "user",
        parts: [
          { text: "Извлеки метаданные этого документа." },
          { inline_data: { mime_type: mediaType, data: base64 } },
        ],
      },
    ],
    generationConfig: {
      temperature: 0,
      responseMimeType: "application/json",
      maxOutputTokens: 600,
    },
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
  const contents: Content[] = history.slice(-20).map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));

  const text = await generate({
    system_instruction: { parts: [{ text: LAWYER_SYSTEM }] },
    contents,
    generationConfig: { temperature: 0.4, maxOutputTokens: 1200 },
  });
  return text.trim();
}

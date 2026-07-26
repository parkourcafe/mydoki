import "server-only";

export type ClassifyResult = {
  category: string | null;
  category_alt: string | null;
  subtype: string | null;
  title: string | null;
  issuer: string | null;
  doc_number: string | null;
  issued_at: string | null;
  expires_at: string | null;
  holder_name: string | null;
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

const SYSTEM_PROMPT = `Ты извлекаешь метаданные из фото/скана личного документа человека.
Верни ТОЛЬКО JSON-объект (без пояснений, без markdown) со строго такими ключами:
- "category": одно из ["identity","education","career","medical","financial","tax","legal","other"] (career — трудовые/карьерные документы: трудовой договор, трудовая книжка, справка с работы; tax — налоговые: ИНН, 2-НДФЛ, налоговые уведомления, декларации)
- "category_alt": вторая по вероятности категория из того же списка, ТОЛЬКО если ты реально не уверен между двумя категориями (например справка может быть и medical, и career) — иначе null
- "subtype": короткий тип документа по-русски (например "паспорт", "диплом", "СНИЛС") или null
- "title": короткое человекочитаемое название по-русски или null
- "issuer": кем выдан или null
- "doc_number": номер документа или null
- "issued_at": дата выдачи в формате YYYY-MM-DD или null
- "expires_at": срок действия в формате YYYY-MM-DD или null
- "holder_name": полное имя человека, которому принадлежит документ, или null
- "tags": массив коротких русских тегов (может быть [])
Если поле не удаётся определить — поставь null. Никакого текста кроме JSON.`;

function pickJson(text: string): unknown {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("Модель не вернула JSON");
  return JSON.parse(text.slice(start, end + 1));
}

/** Вызывает Claude (vision) и нормализует результат под форму документа. */
export async function classifyDocument(
  base64: string,
  mediaType: string
): Promise<ClassifyResult> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("NO_API_KEY");

  const model = process.env.ANTHROPIC_MODEL || "claude-sonnet-4-6";
  const isPdf = mediaType === "application/pdf";

  const block = isPdf
    ? { type: "document", source: { type: "base64", media_type: mediaType, data: base64 } }
    : { type: "image", source: { type: "base64", media_type: mediaType, data: base64 } };

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model,
      max_tokens: 600,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: [
            block,
            { type: "text", text: "Извлеки метаданные этого документа." },
          ],
        },
      ],
    }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`ANTHROPIC_${res.status}: ${detail.slice(0, 200)}`);
  }

  const data = (await res.json()) as { content?: { type: string; text?: string }[] };
  const text = (data.content ?? [])
    .filter((c) => c.type === "text")
    .map((c) => c.text ?? "")
    .join("");

  const raw = pickJson(text) as Record<string, unknown>;
  const str = (v: unknown) =>
    typeof v === "string" && v.trim() ? v.trim() : null;

  const category =
    typeof raw.category === "string" &&
    VALID_CATEGORIES.includes(raw.category)
      ? raw.category
      : null;
  const categoryAlt =
    typeof raw.category_alt === "string" &&
    VALID_CATEGORIES.includes(raw.category_alt) &&
    raw.category_alt !== category
      ? raw.category_alt
      : null;

  return {
    category,
    category_alt: categoryAlt,
    subtype: str(raw.subtype),
    title: str(raw.title),
    issuer: str(raw.issuer),
    doc_number: str(raw.doc_number),
    issued_at: str(raw.issued_at),
    expires_at: str(raw.expires_at),
    holder_name: str(raw.holder_name),
    tags: Array.isArray(raw.tags)
      ? raw.tags.filter((t): t is string => typeof t === "string").slice(0, 10)
      : [],
  };
}

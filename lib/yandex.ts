import "server-only";
import type { ClassifyResult } from "./anthropic";

/*
 * Распознавание документов на российском провайдере — Yandex Cloud.
 *
 *  1) Yandex Vision OCR извлекает текст с фото/скана.
 *  2) Если задан YANDEX_FOLDER_ID — YandexGPT структурирует текст в JSON
 *     (как и Claude/GLM). При сбое GPT — откатываемся на локальный разбор.
 *  3) Локальный разбор (extractFromText) всегда вытащит даты и тип по
 *     ключевым словам — это и есть гарантированное «распознавание дат».
 *
 * Переменные окружения:
 *   YANDEX_API_KEY (или YANDEX_VISION_API_KEY) — API-ключ сервисного аккаунта
 *   YANDEX_FOLDER_ID — идентификатор каталога Yandex Cloud
 *   YANDEX_GPT_MODEL — необязательно, по умолчанию "yandexgpt-lite/latest"
 */

function apiKey(): string | undefined {
  return process.env.YANDEX_API_KEY || process.env.YANDEX_VISION_API_KEY;
}

export function yandexConfigured(): boolean {
  return Boolean(apiKey() && process.env.YANDEX_FOLDER_ID);
}

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

/* ── 1. Yandex Vision OCR ─────────────────────────────────────────── */

// Vision OCR принимает только эти типы; webp/gif не поддерживаются.
const OCR_MIME = new Set(["image/jpeg", "image/png", "application/pdf"]);

async function visionOcr(base64: string, mediaType: string): Promise<string> {
  const key = apiKey();
  const folder = process.env.YANDEX_FOLDER_ID;
  if (!key || !folder) throw new Error("NO_API_KEY");

  if (!OCR_MIME.has(mediaType)) {
    throw new Error("Yandex Vision распознаёт только JPG, PNG или PDF.");
  }
  const mimeType = mediaType;

  const res = await fetch(
    "https://ocr.api.cloud.yandex.net/ocr/v1/recognizeText",
    {
      method: "POST",
      headers: {
        Authorization: `Api-Key ${key}`,
        "x-folder-id": folder,
        "x-data-logging-enabled": "false",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        mimeType,
        languageCodes: ["ru", "en"],
        model: "page",
        content: base64,
      }),
    }
  );

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`YANDEX_OCR_${res.status}: ${detail.slice(0, 200)}`);
  }

  const data = (await res.json()) as {
    result?: { textAnnotation?: { fullText?: string } };
  };
  return data.result?.textAnnotation?.fullText ?? "";
}

/* ── 2. YandexGPT structuring (необязательно) ─────────────────────── */

const SYSTEM_PROMPT = `Ты извлекаешь метаданные из текста личного документа (распознанного с фото).
Верни ТОЛЬКО JSON-объект (без пояснений, без markdown) со строго такими ключами:
- "category": одно из ["identity","education","career","medical","financial","tax","legal","other"] (career — трудовые/карьерные документы; tax — налоговые: ИНН, 2-НДФЛ, уведомления, декларации)
- "subtype": короткий тип документа по-русски (например "Паспорт РФ", "Диплом", "СНИЛС") или null
- "title": короткое человекочитаемое название по-русски или null
- "issuer": кем выдан или null
- "doc_number": номер документа или null
- "issued_at": дата выдачи в формате YYYY-MM-DD или null
- "expires_at": срок действия в формате YYYY-MM-DD или null
- "holder_name": полное имя человека, которому принадлежит документ, или null
- "tags": массив коротких русских тегов (может быть [])
Если поле не удаётся определить — поставь null. Никакого текста кроме JSON.`;

function pickJson(text: string): Record<string, unknown> {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("Модель не вернула JSON");
  return JSON.parse(text.slice(start, end + 1)) as Record<string, unknown>;
}

async function gptStructure(fullText: string): Promise<ClassifyResult | null> {
  const key = apiKey();
  const folder = process.env.YANDEX_FOLDER_ID;
  if (!key || !folder) return null;

  const model = process.env.YANDEX_GPT_MODEL || "yandexgpt-lite/latest";
  try {
    const res = await fetch(
      "https://llm.api.cloud.yandex.net/foundationModels/v1/completion",
      {
        method: "POST",
        headers: {
          Authorization: `Api-Key ${key}`,
          "x-folder-id": folder,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          modelUri: `gpt://${folder}/${model}`,
          completionOptions: { stream: false, temperature: 0, maxTokens: 600 },
          messages: [
            { role: "system", text: SYSTEM_PROMPT },
            { role: "user", text: `Текст документа:\n${fullText.slice(0, 6000)}` },
          ],
        }),
      }
    );
    if (!res.ok) return null;
    const data = (await res.json()) as {
      result?: { alternatives?: { message?: { text?: string } }[] };
    };
    const text = data.result?.alternatives?.[0]?.message?.text ?? "";
    const raw = pickJson(text);
    return normalize(raw);
  } catch {
    return null;
  }
}

function normalize(raw: Record<string, unknown>): ClassifyResult {
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
    holder_name: str(raw.holder_name),
    tags: Array.isArray(raw.tags)
      ? raw.tags.filter((t): t is string => typeof t === "string").slice(0, 10)
      : [],
  };
}

/* ── 3. Локальный разбор текста (даты + тип по ключевым словам) ────── */

const MONTHS: Record<string, number> = {
  января: 1, февраля: 2, марта: 3, апреля: 4, мая: 5, июня: 6,
  июля: 7, августа: 8, сентября: 9, октября: 10, ноября: 11, декабря: 12,
};

const pad = (n: number) => String(n).padStart(2, "0");

function isoDate(y: number, m: number, d: number): string | null {
  if (m < 1 || m > 12 || d < 1 || d > 31 || y < 1900 || y > 2100) return null;
  return `${y}-${pad(m)}-${pad(d)}`;
}

type Found = { iso: string; idx: number };

function findDates(text: string): Found[] {
  const out: Found[] = [];
  // dd.mm.yyyy / dd-mm-yyyy / dd/mm/yyyy
  for (const m of text.matchAll(/\b(\d{1,2})[.\-/](\d{1,2})[.\-/](\d{4})\b/g)) {
    const iso = isoDate(+m[3], +m[2], +m[1]);
    if (iso) out.push({ iso, idx: m.index ?? 0 });
  }
  // yyyy-mm-dd
  for (const m of text.matchAll(/\b(\d{4})[.\-/](\d{1,2})[.\-/](\d{1,2})\b/g)) {
    const iso = isoDate(+m[1], +m[2], +m[3]);
    if (iso) out.push({ iso, idx: m.index ?? 0 });
  }
  // 12 мая 2027
  const monthRe = new RegExp(
    `\\b(\\d{1,2})\\s+(${Object.keys(MONTHS).join("|")})\\s+(\\d{4})\\b`,
    "gi"
  );
  for (const m of text.matchAll(monthRe)) {
    const iso = isoDate(+m[3], MONTHS[m[2].toLowerCase()], +m[1]);
    if (iso) out.push({ iso, idx: m.index ?? 0 });
  }
  return out;
}

const EXPIRY_KW = /(действ|годен|год\.?\s*до|срок|valid|expir|until|окончан|по\s+\d)/i;
const ISSUED_KW = /(выдан|дата выдачи|issued|оформлен|регистрац)/i;

// Категория → ключевые слова (порядок задаёт приоритет при совпадениях).
const CAT_KEYWORDS: { cat: string; subtype: string; re: RegExp }[] = [
  { cat: "identity", subtype: "Загранпаспорт", re: /загранпаспорт|заграничный паспорт|passport/i },
  { cat: "identity", subtype: "Паспорт РФ", re: /паспорт гражданина|паспорт рф|\bпаспорт\b/i },
  { cat: "identity", subtype: "Свидетельство о рождении", re: /о рождении/i },
  { cat: "identity", subtype: "СНИЛС", re: /снилс|страхов\w* свидетельств/i },
  { cat: "tax", subtype: "ИНН", re: /\bинн\b|идентификационн\w* номер/i },
  { cat: "identity", subtype: "Водительское удостоверение", re: /водительск\w* удостоверение|driver/i },
  { cat: "identity", subtype: "Военный билет", re: /военный билет/i },
  { cat: "identity", subtype: "Вид на жительство", re: /вид на жительство/i },
  { cat: "identity", subtype: "Виза", re: /\bвиза\b|\bvisa\b/i },
  { cat: "identity", subtype: "Свидетельство о браке", re: /о заключении брака|о браке/i },
  { cat: "medical", subtype: "Полис ОМС", re: /\bомс\b|обязательн\w* медицинск/i },
  { cat: "medical", subtype: "Полис ДМС", re: /\bдмс\b/i },
  { cat: "medical", subtype: "Прививочный сертификат", re: /прививочн|вакцинац|вакцин/i },
  { cat: "medical", subtype: "Медицинская справка", re: /медицинск\w* справк|справка \d{3}/i },
  { cat: "financial", subtype: "ОСАГО", re: /осаго/i },
  { cat: "financial", subtype: "КАСКО", re: /каско/i },
  { cat: "financial", subtype: "ПТС", re: /паспорт транспортн|\bптс\b/i },
  { cat: "financial", subtype: "СТС", re: /свидетельств\w* о регистрации тс|\bстс\b/i },
  { cat: "financial", subtype: "Выписка ЕГРН", re: /егрн|единого государственного реестра недвиж/i },
  { cat: "tax", subtype: "Справка 2-НДФЛ", re: /2-?ндфл/i },
  { cat: "tax", subtype: "Налоговое уведомление", re: /налогов\w* уведомлени/i },
  { cat: "career", subtype: "Трудовой договор", re: /трудов\w* договор/i },
  { cat: "career", subtype: "Трудовая книжка", re: /трудов\w* книжк/i },
  { cat: "education", subtype: "Диплом", re: /\bдиплом/i },
  { cat: "education", subtype: "Аттестат", re: /аттестат/i },
  { cat: "education", subtype: "Сертификат ЕГЭ", re: /\bегэ\b/i },
  { cat: "legal", subtype: "Доверенность", re: /доверенност/i },
  { cat: "legal", subtype: "Завещание", re: /завещан/i },
  { cat: "legal", subtype: "Договор", re: /\bдоговор/i },
];

function nearKeyword(text: string, idx: number, re: RegExp): boolean {
  return re.test(text.slice(Math.max(0, idx - 45), idx + 5));
}

function extractFromText(fullText: string): ClassifyResult {
  const text = fullText.replace(/ /g, " ");
  const lower = text.toLowerCase();
  const dates = findDates(text);

  // Срок действия: дата рядом с ключевым словом «действует/годен/до…»;
  // иначе — самая поздняя дата в будущем.
  const today = new Date().toISOString().slice(0, 10);
  let expires: string | null = null;
  const expiryCandidates = dates
    .filter((d) => nearKeyword(text, d.idx, EXPIRY_KW))
    .map((d) => d.iso)
    .sort();
  if (expiryCandidates.length) {
    expires = expiryCandidates[expiryCandidates.length - 1];
  } else {
    const future = dates.map((d) => d.iso).filter((d) => d > today).sort();
    if (future.length) expires = future[future.length - 1];
  }

  // Дата выдачи: рядом с «выдан/оформлен»; иначе — самая ранняя дата.
  let issued: string | null = null;
  const issuedCandidates = dates
    .filter((d) => nearKeyword(text, d.idx, ISSUED_KW))
    .map((d) => d.iso)
    .sort();
  if (issuedCandidates.length) {
    issued = issuedCandidates[0];
  } else if (dates.length) {
    const past = dates.map((d) => d.iso).filter((d) => d <= today).sort();
    if (past.length) issued = past[0];
  }
  if (issued && expires && issued === expires) issued = null;

  // Категория и тип по ключевым словам.
  let category: string | null = null;
  let subtype: string | null = null;
  for (const k of CAT_KEYWORDS) {
    if (k.re.test(lower)) {
      category = k.cat;
      subtype = k.subtype;
      break;
    }
  }

  // Номер документа.
  let docNumber: string | null = null;
  const numMatch = text.match(/(?:№|серия|номер|no\.?)\s*([0-9][0-9 \-]{3,})/i);
  if (numMatch) docNumber = numMatch[1].replace(/\s+/g, " ").trim();

  return {
    category,
    subtype,
    title: subtype,
    issuer: null,
    doc_number: docNumber,
    issued_at: issued,
    expires_at: expires,
    holder_name: null,
    tags: [],
  };
}

/* ── Точка входа провайдера ───────────────────────────────────────── */

export async function classifyDocument(
  base64: string,
  mediaType: string
): Promise<ClassifyResult> {
  const fullText = await visionOcr(base64, mediaType);

  // Пытаемся структурировать через YandexGPT; при неудаче — локальный разбор,
  // который дополняем датами на случай, если GPT их пропустил.
  const heuristic = extractFromText(fullText);
  const gpt = await gptStructure(fullText);
  if (!gpt) return heuristic;

  return {
    ...gpt,
    category: gpt.category ?? heuristic.category,
    subtype: gpt.subtype ?? heuristic.subtype,
    title: gpt.title ?? heuristic.title,
    issued_at: gpt.issued_at ?? heuristic.issued_at,
    expires_at: gpt.expires_at ?? heuristic.expires_at,
    doc_number: gpt.doc_number ?? heuristic.doc_number,
  };
}

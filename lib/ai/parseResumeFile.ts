import "server-only";
import { getPrompt } from "./prompts";
import { parseImportedResume, type ImportedResume } from "../resumeImport";

// =====================================================================
// Разбор загруженного файла CV в структурный профиль.
//
// Тот же приём, что уже работает для документов сейфа (lib/classify.ts):
// пользователь сам включает распознавание в настройках, вызов идёт через
// провайдера, ответ — строгий JSON. Отличие одно: Yandex Vision тут не
// участвует, он классифицирует документы, а не собирает резюме.
//
// Правила извлечения (ничего не додумывать, сохранять язык оригинала) живут
// в версионируемом промпте resume_import, разбор ответа — в lib/resumeImport.
// =====================================================================

/** Настроен ли провайдер, умеющий разобрать CV. */
export function resumeParsingConfigured(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY || process.env.GLM_API_KEY);
}

function pickJson(text: string): unknown {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("Модель не вернула JSON");
  return JSON.parse(text.slice(start, end + 1));
}

const USER_TEXT = "Извлеки данные этого резюме. Ответ — только JSON.";

/** Потолок текста, который отправляем в модель (символы). */
export const RESUME_TEXT_LIMIT = 20000;

async function viaAnthropic(base64: string, mediaType: string): Promise<unknown> {
  const apiKey = process.env.ANTHROPIC_API_KEY as string;
  // Ту же переменную читает классификатор документов; здесь свой запасной
  // вариант, потому что разбор резюме заметно сложнее вытаскивания полей.
  const model = resumeParsingModel();
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
      max_tokens: 4000,
      system: getPrompt("resume_import").system,
      messages: [
        { role: "user", content: [block, { type: "text", text: USER_TEXT }] },
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
  return pickJson(text);
}

/** Тот же разбор, но вход — обычный текст (старое поле «Опыт работы»). */
async function textViaAnthropic(text: string): Promise<unknown> {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": process.env.ANTHROPIC_API_KEY as string,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: resumeParsingModel(),
      max_tokens: 4000,
      system: getPrompt("resume_import").system,
      messages: [
        { role: "user", content: `${USER_TEXT}\n\n---\n${text}` },
      ],
    }),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`ANTHROPIC_${res.status}: ${detail.slice(0, 200)}`);
  }
  const data = (await res.json()) as { content?: { type: string; text?: string }[] };
  return pickJson(
    (data.content ?? [])
      .filter((c) => c.type === "text")
      .map((c) => c.text ?? "")
      .join("")
  );
}

async function textViaGlm(text: string): Promise<unknown> {
  const base = process.env.GLM_BASE_URL || "https://api.z.ai/api/paas/v4";
  const res = await fetch(`${base}/chat/completions`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      Authorization: `Bearer ${process.env.GLM_API_KEY as string}`,
    },
    body: JSON.stringify({
      // Текст разбирает обычная модель, зрение тут ни при чём.
      model: process.env.GLM_MODEL || "glm-4.6",
      temperature: 0,
      max_tokens: 4000,
      messages: [
        { role: "system", content: getPrompt("resume_import").system },
        { role: "user", content: `${USER_TEXT}\n\n---\n${text}` },
      ],
    }),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`GLM_${res.status}: ${detail.slice(0, 200)}`);
  }
  const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  return pickJson(data.choices?.[0]?.message?.content ?? "");
}

/**
 * Разбирает старое текстовое поле «Опыт работы» в структурные записи.
 * @throws NO_API_KEY | ошибка провайдера.
 */
export async function parseResumeText(text: string): Promise<ImportedResume> {
  const trimmed = text.trim().slice(0, RESUME_TEXT_LIMIT);
  if (!trimmed) return parseImportedResume(null);

  const raw = process.env.ANTHROPIC_API_KEY
    ? await textViaAnthropic(trimmed)
    : process.env.GLM_API_KEY
      ? await textViaGlm(trimmed)
      : (() => {
          throw new Error("NO_API_KEY");
        })();

  return parseImportedResume(raw);
}

async function viaGlm(base64: string, mediaType: string): Promise<unknown> {
  // У GLM в нашей обвязке только vision-модель: PDF она не принимает.
  if (mediaType === "application/pdf") throw new Error("PDF_UNSUPPORTED");

  const base = process.env.GLM_BASE_URL || "https://api.z.ai/api/paas/v4";
  const model = resumeParsingModel();

  const res = await fetch(`${base}/chat/completions`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      Authorization: `Bearer ${process.env.GLM_API_KEY as string}`,
    },
    body: JSON.stringify({
      model,
      temperature: 0,
      max_tokens: 4000,
      messages: [
        { role: "system", content: getPrompt("resume_import").system },
        {
          role: "user",
          content: [
            { type: "text", text: USER_TEXT },
            { type: "image_url", image_url: { url: `data:${mediaType};base64,${base64}` } },
          ],
        },
      ],
    }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`GLM_${res.status}: ${detail.slice(0, 200)}`);
  }

  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  return pickJson(data.choices?.[0]?.message?.content ?? "");
}

/** Какая модель отработала — уходит в журнал прогонов (ai_runs.model). */
export function resumeParsingModel(): string {
  if (process.env.ANTHROPIC_API_KEY) {
    return process.env.ANTHROPIC_MODEL || "claude-opus-5";
  }
  if (process.env.GLM_API_KEY) return process.env.GLM_VISION_MODEL || "glm-4v";
  return "";
}

/**
 * @param base64 — содержимое файла CV.
 * @param mediaType — image/* или application/pdf.
 * @throws NO_API_KEY | PDF_UNSUPPORTED | ошибка провайдера.
 */
export async function parseResumeFile(
  base64: string,
  mediaType: string
): Promise<ImportedResume> {
  const raw = process.env.ANTHROPIC_API_KEY
    ? await viaAnthropic(base64, mediaType)
    : process.env.GLM_API_KEY
      ? await viaGlm(base64, mediaType)
      : (() => {
          throw new Error("NO_API_KEY");
        })();

  return parseImportedResume(raw);
}

import "server-only";
import type { ClassifyResult } from "./anthropic";
import { yandexConfigured } from "./yandex";

/** Настроен ли хоть один ИИ-провайдер распознавания. */
export function aiConfigured(): boolean {
  return Boolean(
    yandexConfigured() ||
      process.env.GLM_API_KEY ||
      process.env.ANTHROPIC_API_KEY
  );
}

/** Человекочитаемое имя активного провайдера (для согласия пользователя). */
export function aiProviderName(): string | null {
  if (yandexConfigured()) return "Yandex";
  if (process.env.GLM_API_KEY) return "GLM (Zhipu)";
  if (process.env.ANTHROPIC_API_KEY) return "Anthropic";
  return null;
}

/** Включил ли пользователь распознавание ИИ в своих настройках. */
export function userWantsAi(
  user: { user_metadata?: Record<string, unknown> | null } | null
): boolean {
  return Boolean(user?.user_metadata?.ai_recognition);
}

/**
 * Распознаёт документ через доступного провайдера. Приоритет — российский
 * Yandex Vision (если задан YANDEX_API_KEY + YANDEX_FOLDER_ID), затем GLM (z.ai),
 * затем Anthropic (Claude). Финальный выбор — через переменные окружения.
 */
export async function classifyDocument(
  base64: string,
  mediaType: string
): Promise<ClassifyResult> {
  if (yandexConfigured()) {
    const { classifyDocument: yandex } = await import("./yandex");
    return yandex(base64, mediaType);
  }
  if (process.env.GLM_API_KEY) {
    const { classifyDocument: glm } = await import("./llm");
    return glm(base64, mediaType);
  }
  if (process.env.ANTHROPIC_API_KEY) {
    const { classifyDocument: claude } = await import("./anthropic");
    return claude(base64, mediaType);
  }
  throw new Error("NO_API_KEY");
}

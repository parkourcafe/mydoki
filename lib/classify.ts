import "server-only";
import type { ClassifyResult } from "./anthropic";

/** Настроен ли хоть один ИИ-провайдер распознавания. */
export function aiConfigured(): boolean {
  return Boolean(process.env.GLM_API_KEY || process.env.ANTHROPIC_API_KEY);
}

/**
 * Распознаёт документ через доступного провайдера:
 * сперва GLM (z.ai), если задан GLM_API_KEY; иначе Anthropic (Claude),
 * если задан ANTHROPIC_API_KEY. Финальный выбор — через переменные окружения.
 */
export async function classifyDocument(
  base64: string,
  mediaType: string
): Promise<ClassifyResult> {
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

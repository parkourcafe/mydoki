/**
 * LLM redaction policy (v1.1 §12.5). Перед отправкой документа в модель
 * решаем, что допустимо. Полные паспорта и медицинские документы не
 * отправляются без отдельно утверждённого сценария. Чистая функция.
 */

import type { DocCategory } from "../categories";

export type RedactionDecision = {
  allowed: boolean;
  reason: string;
};

// Категории, требующие отдельного утверждённого сценария для отправки в модель.
const RESTRICTED: DocCategory[] = ["identity", "medical"];

/**
 * Можно ли отправить документ этой категории в модель.
 * @param approvedScenario — сценарий явно утверждён (напр. пользователь
 *   включил распознавание именно этого типа с полным раскрытием).
 */
export function canSendDocumentToModel(
  category: DocCategory | string,
  approvedScenario = false
): RedactionDecision {
  if (RESTRICTED.includes(category as DocCategory) && !approvedScenario) {
    return {
      allowed: false,
      reason: `Категория «${category}» (спец. персональные данные) не отправляется в модель без утверждённого сценария (v1.1 §12.5).`,
    };
  }
  return { allowed: true, reason: "" };
}

/** Минимизация: список полей, которые точно нельзя слать без утверждения. */
export const NEVER_SEND_RAW = ["document_number", "full_passport_scan", "medical_details"];

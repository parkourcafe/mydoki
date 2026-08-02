/**
 * Completeness Checker (v1.1 §11.2) — детерминированный: сверяет комплект
 * документов отклика с required_documents вакансии. Без LLM. Чистая функция.
 */

import type { RequiredDocument } from "../career";

export type CompletenessItem = { type: string; label: string };
export type CompletenessResult = {
  missing: CompletenessItem[];
  provided: CompletenessItem[];
  complete: boolean;
};

/**
 * @param required — требуемые документы вакансии (учитываются только с
 *   required !== false).
 * @param providedTypes — типы документов, которые кандидат приложил.
 */
export function checkCompleteness(
  required: RequiredDocument[],
  providedTypes: string[]
): CompletenessResult {
  const have = new Set(providedTypes);
  const requiredOnly = (required ?? []).filter((d) => d.required !== false);
  const missing: CompletenessItem[] = [];
  const provided: CompletenessItem[] = [];
  for (const d of requiredOnly) {
    (have.has(d.type) ? provided : missing).push({ type: d.type, label: d.label });
  }
  return { missing, provided, complete: missing.length === 0 };
}

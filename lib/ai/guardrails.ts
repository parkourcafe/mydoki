/**
 * Guardrails — слой политики поверх AI-выводов (v1.1 §11.4). Чистые функции,
 * тестируются юнитами. Три задачи: (1) лексический фильтр запрещённых
 * формулировок; (2) отсечение выводов без grounding; (3) Human Review Gate
 * обеспечивается на уровне данных (ai_runs.reviewed_by).
 */

export type EvidenceItem = {
  category: string; // fact | mismatch | gap | missing_document | interview_question | risk
  text: string;
  source?: string | null; // документ/поле-источник
  quote?: string | null; // цитата/значение
  confidence?: number | null;
};

// Запрещено (v1.1 §10/§15): балл, ранжирование, рекомендация нанять/отказать,
// суждения о личности, вердикт о подлинности.
// Примечание: \b не работает с кириллицей в JS-regex, поэтому кириллические
// термины матчим по подстроке (safety-фильтр — лёгкое пере-срабатывание ок).
const FORBIDDEN = [
  /балл/i,
  /рейтинг/i,
  /рекомендуе?м?\s+(нанять|отказать|отклонить)/i,
  /\branking\b/i,
  /\bscore\b/i,
  /recommend(ed)?\s+to\s+(hire|reject)/i,
  /подделк/i,
  /фальшив/i,
  /поддельн/i,
  /фейк/i,
  /\bfake\b/i,
  /\bforged\b/i,
];

/** Содержит ли текст запрещённую формулировку. */
export function containsForbidden(text: string): boolean {
  return FORBIDDEN.some((re) => re.test(text));
}

/** Любой из пунктов нарушает лексику → вывод отклоняется (перегенерация). */
export function outputViolatesPolicy(items: EvidenceItem[]): boolean {
  return items.some((i) => containsForbidden(i.text) || containsForbidden(i.category));
}

/** Есть ли у пункта основание (источник + цитата/значение). */
export function hasGrounding(i: EvidenceItem): boolean {
  return Boolean((i.source ?? "").trim() && (i.quote ?? "").trim());
}

/**
 * Делит выводы на подтверждённые (с grounding) и неподтверждённые.
 * Неподтверждённые не показываются без явного «показать неподтверждённые».
 */
export function splitByGrounding(items: EvidenceItem[]): {
  supported: EvidenceItem[];
  unsupported: EvidenceItem[];
} {
  const supported: EvidenceItem[] = [];
  const unsupported: EvidenceItem[] = [];
  for (const i of items) (hasGrounding(i) ? supported : unsupported).push(i);
  return { supported, unsupported };
}

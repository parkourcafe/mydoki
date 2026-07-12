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
  /ранжир/i,
  // рекомендация нанять/отказать — с любыми словами между глаголом-рекоменд.
  // и «нанять/отказать/взять/отклонить» (до ~30 симв.), а также «стоит/лучше».
  /(рекоменд|совет|стоит|лучше|нужно)[^.]{0,30}(нанять|наня|отказать|отклон|взять|не бра)/i,
  /\branking\b/i,
  /\bscore\b/i,
  /(recommend|should|advise)[^.]{0,30}(hire|hiring|reject|not\s+hire|decline)/i,
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

/**
 * Любой из пунктов нарушает лексику → вывод отклоняется. Проверяем ВСЕ
 * отображаемые работодателю поля (text, category, source, quote), иначе
 * запрещённая формулировка могла бы просочиться через цитату-источник.
 */
export function outputViolatesPolicy(items: EvidenceItem[]): boolean {
  return items.some(
    (i) =>
      containsForbidden(i.text) ||
      containsForbidden(i.category) ||
      containsForbidden(i.source ?? "") ||
      containsForbidden(i.quote ?? "")
  );
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

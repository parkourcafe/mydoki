import type { RequiredDocument, ScreeningQuestion } from "./career";

// =====================================================================
// T11 Layer 3 — Проверка качества (детерминированная, client-side).
//
// ВАЖНО (DEV_TASK §7): проверка оценивает ТОЛЬКО полноту и ясность самой
// вакансии. Она НИКОГДА не использует данные кандидатов, отклики, CV,
// документы или историю найма. Это НЕ вызов ИИ. Флажит только то, что
// предсказывает плохую воронку (D4). clarity_score НИЧЕГО не гейтит —
// работодатель всегда может опубликовать.
// =====================================================================

export type QualityWarningId =
  | "no_application_docs" // нет безопасных документов первичного отклика
  | "no_questions" // нет скрининг-вопросов
  | "no_salary" // пустая зарплата
  | "role_conflict"; // описание смешивает ≥3 ролей

export type QualityWarning = {
  id: QualityWarningId;
  /** «missing» — незаполненное поле; «quality» — смысловое замечание. */
  kind: "missing" | "quality";
};

export type QualityInput = {
  salary_range?: string | null;
  description?: string | null;
  required_documents: RequiredDocument[];
  screening_questions: ScreeningQuestion[];
};

export type QualityResult = {
  warnings: QualityWarning[];
  /** 0–100: доля пройденных проверок. Аналитика; ничего не гейтит. */
  clarityScore: number;
  checksPassed: number;
  checksTotal: number;
  missingFieldsCount: number;
};

// Каждый «бакет» — отдельная роль. Если описание задевает ≥3 разных бакета,
// вероятно, вакансия смешивает несколько ролей. Мультиязычные корни (en/id/ru).
const ROLE_VERB_BUCKETS: Record<string, string[]> = {
  serve: ["waiter", "waitress", "serve", "server", "pelayan", "официант", "подава"],
  barista: ["barista", "coffee", "бариста", "кофе", "kopi"],
  cook: ["cook", "chef", "kitchen", "masak", "koki", "повар", "кухн", "готов"],
  clean: ["clean", "housekeep", "bersih", "cleaner", "убор", "горничн", "клинин"],
  drive: ["driver", "drive", "deliver", "sopir", "kurir", "водител", "достав", "курьер"],
  teach: ["teach", "tutor", "guru", "учител", "препода", "репетитор"],
  guard: ["guard", "security", "satpam", "охран", "сторож"],
  cashier: ["cashier", "kasir", "касс"],
  manage: ["manage", "supervis", "manajer", "управля", "руковод", "менеджер"],
  reception: ["reception", "resepsionis", "админист", "ресепшн", "front desk"],
  sales: ["sales", "promot", "penjual", "продав", "прода"],
};

function countRoleBuckets(description: string): number {
  const hay = description.toLowerCase();
  let n = 0;
  for (const words of Object.values(ROLE_VERB_BUCKETS)) {
    if (words.some((w) => hay.includes(w))) n += 1;
  }
  return n;
}

/**
 * Считает предупреждения и clarity_score по текущему состоянию формы.
 * Чистая функция — без сети, без данных кандидатов.
 */
export function runQualityCheck(input: QualityInput): QualityResult {
  const warnings: QualityWarning[] = [];

  const docsOk = input.required_documents.length > 0;
  if (!docsOk) warnings.push({ id: "no_application_docs", kind: "missing" });

  const questionsOk = input.screening_questions.some(
    (q) => q.question.trim().length > 0
  );
  if (!questionsOk) warnings.push({ id: "no_questions", kind: "missing" });

  const salaryOk = !!(input.salary_range && input.salary_range.trim());
  if (!salaryOk) warnings.push({ id: "no_salary", kind: "missing" });

  const roleOk = countRoleBuckets(input.description ?? "") < 3;
  if (!roleOk) warnings.push({ id: "role_conflict", kind: "quality" });

  const checks = [docsOk, questionsOk, salaryOk, roleOk];
  const checksPassed = checks.filter(Boolean).length;
  const checksTotal = checks.length;

  return {
    warnings,
    clarityScore: Math.round((checksPassed / checksTotal) * 100),
    checksPassed,
    checksTotal,
    missingFieldsCount: warnings.filter((w) => w.kind === "missing").length,
  };
}

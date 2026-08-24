// =====================================================================
// Проверка качества резюме кандидата — детерминированная, без ИИ.
//
// Тот же приём, что уже применён к вакансии (lib/vacancyQuality.ts) и к
// комплектности документов отклика (lib/ai/completeness.ts): чистая функция,
// список правил, у каждого — важность и понятное человеку действие (подписи
// живут в словаре экрана, здесь только коды).
//
// Ничего не гейтит: резюме можно сохранить и отправить с любыми замечаниями.
// =====================================================================

import type { ResumeSections } from "./resume";

export type ResumeWarningId =
  | "no_name" // не указано имя
  | "no_contact" // ни WhatsApp, ни email
  | "no_headline" // не сказано, кто человек по профессии
  | "no_location" // не указан город
  | "no_experience" // нет ни одной записи об опыте
  | "legacy_experience_text" // опыт есть, но одним текстом — не разбит на места работы
  | "no_period" // у места работы нет даты начала
  | "reversed_period" // конец периода раньше начала
  | "future_period" // период начинается в будущем
  | "no_role_description" // у места работы нет описания обязанностей
  | "no_skills"
  | "no_languages";

export type ResumeWarningSeverity = "error" | "warning" | "info";

export type ResumeWarning = {
  id: ResumeWarningId;
  severity: ResumeWarningSeverity;
  /** Для замечаний по конкретной записи опыта — её номер в списке. */
  index?: number;
};

export type ResumeQualityInput = {
  full_name?: string | null;
  headline?: string | null;
  location?: string | null;
  contact?: string | null;
  email?: string | null;
  /** Старое текстовое поле «Опыт работы». */
  legacyExperience?: string | null;
  sections: ResumeSections;
};

export type ResumeQualityResult = {
  warnings: ResumeWarning[];
  /** 0–100: доля пройденных проверок наполнения. Аналитика, ничего не гейтит. */
  completeness: number;
  checksPassed: number;
  checksTotal: number;
  /** Сколько замечаний уровня error — их стоит показать первыми. */
  errorCount: number;
};

const SEVERITY: Record<ResumeWarningId, ResumeWarningSeverity> = {
  no_name: "error",
  no_contact: "error",
  reversed_period: "error",
  no_headline: "warning",
  no_experience: "warning",
  no_period: "warning",
  future_period: "warning",
  no_role_description: "warning",
  no_location: "info",
  legacy_experience_text: "info",
  no_skills: "info",
  no_languages: "info",
};

const ORDER: Record<ResumeWarningSeverity, number> = { error: 0, warning: 1, info: 2 };

const filled = (v: string | null | undefined) => Boolean((v ?? "").trim());

function warn(id: ResumeWarningId, index?: number): ResumeWarning {
  return index === undefined
    ? { id, severity: SEVERITY[id] }
    : { id, severity: SEVERITY[id], index };
}

/**
 * @param input — текущее состояние резюме (в том числе несохранённое).
 * @param today — сегодняшняя дата YYYY-MM-DD; передаётся явно ради тестов.
 */
export function checkResume(
  input: ResumeQualityInput,
  today: string
): ResumeQualityResult {
  const { sections } = input;
  const warnings: ResumeWarning[] = [];
  const thisMonth = today.slice(0, 7);

  const hasName = filled(input.full_name);
  if (!hasName) warnings.push(warn("no_name"));

  const hasContact = filled(input.contact) || filled(input.email);
  if (!hasContact) warnings.push(warn("no_contact"));

  const hasHeadline = filled(input.headline);
  if (!hasHeadline) warnings.push(warn("no_headline"));

  const hasLocation = filled(input.location);
  if (!hasLocation) warnings.push(warn("no_location"));

  const structured = sections.experience;
  const hasLegacyText = filled(input.legacyExperience);
  const hasExperience = structured.length > 0 || hasLegacyText;
  if (!hasExperience) warnings.push(warn("no_experience"));
  if (structured.length === 0 && hasLegacyText) {
    warnings.push(warn("legacy_experience_text"));
  }

  // Проверки по каждому месту работы. Они не влияют на процент наполнения,
  // если записей нет вовсе — иначе пустое резюме выглядело бы «почти готовым».
  let everyPeriodFilled = structured.length > 0;
  let everyRoleDescribed = structured.length > 0;

  structured.forEach((e, index) => {
    if (!e.start) {
      warnings.push(warn("no_period", index));
      everyPeriodFilled = false;
    }
    if (e.start && e.end && !e.current && e.end < e.start) {
      warnings.push(warn("reversed_period", index));
    }
    if (e.start && e.start > thisMonth) {
      warnings.push(warn("future_period", index));
    }
    if (!e.description.trim()) {
      warnings.push(warn("no_role_description", index));
      everyRoleDescribed = false;
    }
  });

  const hasSkills = sections.skills.length > 0;
  if (!hasSkills) warnings.push(warn("no_skills"));

  const hasLanguages = sections.languages.length > 0;
  if (!hasLanguages) warnings.push(warn("no_languages"));

  // Наполнение считаем по постоянному набору проверок: пустое резюме должно
  // честно давать 0, а не «половину» из-за правил, которым не на чем сработать.
  const checks = [
    hasName,
    hasContact,
    hasHeadline,
    hasLocation,
    structured.length > 0,
    everyPeriodFilled,
    everyRoleDescribed,
    hasSkills,
    hasLanguages,
  ];
  const checksPassed = checks.filter(Boolean).length;
  const checksTotal = checks.length;

  warnings.sort((a, b) => ORDER[a.severity] - ORDER[b.severity]);

  return {
    warnings,
    completeness: Math.round((checksPassed / checksTotal) * 100),
    checksPassed,
    checksTotal,
    errorCount: warnings.filter((w) => w.severity === "error").length,
  };
}

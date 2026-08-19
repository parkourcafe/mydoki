import type { Locale } from "./i18n";
import type {
  CandidatePassport,
  FieldProvenance,
  LanguageLevel,
  LanguageSkill,
  PassportFieldKey,
  RelocationWillingness,
  SalaryExpectation,
  SalaryPeriod,
  Seniority,
  WorkFormat,
} from "./passport";
import {
  LANGUAGE_LEVEL_ORDER,
  fieldConfirmation,
  isFieldStale,
  isVerifiedProvenance,
  provenanceLabel,
} from "./passport.ts";

// ======================= Объяснимое сопоставление =====================
// v1.2 §8.6–§8.7, §9, §11.
//
// Жёсткие границы:
//   • НЕТ совокупного балла человека, процента совпадения и скрытых весов.
//   • Отсутствие или устаревание данных — это `unknown` / `unknown_stale`,
//     а не доказанное несоответствие.
//   • Soft signals не исключают человека автоматически и не сортируют выдачу.
//   • Оценка существует только для пары «версия профиля × версия вакансии»
//     и имеет срок действия.
//
// Модуль чистый: без БД и next/*.

// ---------------------------- Состояния критерия ----------------------

export type CriterionState =
  | "met"
  | "declared_conflict"
  | "unknown"
  | "unknown_stale"
  | "needs_verification"
  | "not_applicable";

/** Синонимы из брифа → канонические значения v1.2 §8.6. */
const STATE_ALIASES: Record<string, CriterionState> = {
  met: "met",
  conflict: "declared_conflict",
  declared_conflict: "declared_conflict",
  unknown: "unknown",
  stale: "unknown_stale",
  unknown_stale: "unknown_stale",
  needs_verification: "needs_verification",
  not_applicable: "not_applicable",
};

export function normalizeCriterionState(raw: string | null | undefined): CriterionState {
  if (!raw) return "unknown";
  return STATE_ALIASES[raw.trim().toLowerCase()] ?? "unknown";
}

// ---------------------------- Ключи критериев -------------------------

export type HardCriterionKey =
  | "location"
  | "work_format"
  | "work_eligibility"
  | "languages"
  | "salary"
  | "availability"
  | "profession"
  | "seniority"
  | "relocation";

export type SoftSignalKey =
  | "management_experience"
  | "achievements"
  | "preferred_environment"
  | "motivation"
  | "company_and_role_type"
  | "project_relevance";

export const HARD_CRITERIA: HardCriterionKey[] = [
  "location",
  "work_format",
  "work_eligibility",
  "languages",
  "salary",
  "availability",
  "profession",
  "seniority",
  "relocation",
];

export const SOFT_SIGNALS: SoftSignalKey[] = [
  "management_experience",
  "achievements",
  "preferred_environment",
  "motivation",
  "company_and_role_type",
  "project_relevance",
];

export type CriterionKey = HardCriterionKey | SoftSignalKey;

// ---------------------------- Требования вакансии ---------------------

/**
 * Обязательные условия роли (must-have hard filters, §9). Берутся из
 * конкретной `VacancyVersion` — в том числе draft/private для sourcing.
 * Отсутствующее требование = критерий `not_applicable`.
 */
export type HardCriteria = {
  location?: string | null;
  work_format?: WorkFormat | null;
  /** Страна, право на работу в которой требуется для роли. */
  work_eligibility_country?: string | null;
  languages?: { code: string; min_level: LanguageLevel }[];
  salary_budget?: SalaryExpectation | null;
  /** Через сколько дней максимум кандидат должен быть готов выйти. */
  start_within_days?: number | null;
  profession?: string | null;
  role_taxonomy_code?: string | null;
  seniority?: Seniority[];
  /** Роль требует переезда. */
  relocation_required?: boolean | null;
};

/**
 * Soft signals — контекст для человеческого решения (§8.6). Веса запрещены:
 * это перечень того, что работодателю важно обсудить, а не шкала.
 */
export type SoftCriteria = {
  management_experience?: boolean | null;
  achievements?: string | null;
  preferred_environment?: string | null;
  motivation?: string | null;
  company_and_role_type?: string | null;
  project_relevance?: string | null;
};

export type VacancyCriteria = {
  vacancy_version_id: string;
  hard: HardCriteria;
  soft: SoftCriteria;
};

// ---------------------------- Результат -------------------------------

export type CriterionValue =
  | { kind: "none" }
  | { kind: "text"; text: string }
  | { kind: "boolean"; value: boolean }
  | { kind: "days"; days: number }
  | {
      kind: "salary";
      min: number | null;
      max: number | null;
      currency: string;
      period: SalaryPeriod;
    }
  | { kind: "languages"; items: LanguageSkill[] };

/** Почему критерий получил своё состояние. Коды, а не свободный текст. */
export type CriterionReason =
  | "no_requirement"
  | "no_data"
  | "stale_data"
  | "declared_below_requirement"
  | "declared_outside_requirement"
  | "conditional_answer"
  | "needs_external_check"
  | "matches_requirement"
  | "remote_role"
  | "relocation_declared"
  | "not_comparable";

export type CriterionResult = {
  key: CriterionKey;
  kind: "hard" | "soft";
  state: CriterionState;
  reason: CriterionReason;
  /** Что требует роль (структурировано, для локализованного вывода). */
  requirement: CriterionValue;
  /** Что заявил кандидат. */
  value: CriterionValue;
  source: FieldProvenance;
  confirmed_at: string | null;
};

export type CoverageCounts = Record<CriterionState, number> & { total: number };

/**
 * Employer-facing объяснение для ОДНОЙ пары «версия профиля × версия
 * вакансии». Совокупного показателя человека здесь нет и быть не может.
 */
export type MatchExplanation = {
  vacancy_version_id: string;
  profile_version_id: string;
  evaluated_at: string;
  valid_until: string;
  criteria: CriterionResult[];
  /** Покрытие требований вакансии, НЕ рейтинг человека (§8.7). */
  coverage: { required: CoverageCounts; optional: CoverageCounts };
};

export const ASSESSMENT_TTL_DAYS = 30;

// ---------------------------- Вспомогательное -------------------------

const emptyCounts = (): CoverageCounts => ({
  met: 0,
  declared_conflict: 0,
  unknown: 0,
  unknown_stale: 0,
  needs_verification: 0,
  not_applicable: 0,
  total: 0,
});

function normText(value: string | null | undefined): string {
  return (value ?? "").trim().toLowerCase();
}

/** Мягкое сравнение географии: совпадение по любому сегменту («Bali», «Denpasar, Bali»). */
function locationMatches(required: string, candidate: string): boolean {
  const a = normText(required);
  const b = normText(candidate);
  if (!a || !b) return false;
  if (a === b) return true;
  const segments = (s: string) =>
    s
      .split(/[,/|]/)
      .map((x) => x.trim())
      .filter(Boolean);
  const as = segments(a);
  const bs = segments(b);
  return as.some((x) => bs.includes(x)) || a.includes(b) || b.includes(a);
}

function levelAtLeast(actual: LanguageLevel, required: LanguageLevel): boolean {
  return (
    LANGUAGE_LEVEL_ORDER.indexOf(actual) >= LANGUAGE_LEVEL_ORDER.indexOf(required)
  );
}

function addDays(iso: string, days: number): string {
  const ms = Date.parse(iso);
  if (Number.isNaN(ms)) return iso;
  return new Date(ms + days * 86_400_000).toISOString();
}

type Ctx = {
  passport: CandidatePassport;
  now: string;
};

function provenanceOf(
  ctx: Ctx,
  field: PassportFieldKey,
): { source: FieldProvenance; confirmed_at: string | null; stale: boolean } {
  const confirmation = fieldConfirmation(ctx.passport, field);
  return {
    source: confirmation.source,
    confirmed_at: confirmation.confirmed_at,
    stale: isFieldStale(field, confirmation.confirmed_at, ctx.now),
  };
}

/**
 * Общий каркас оценки одного критерия. Порядок состояний зафиксирован:
 *   1. нет требования            → not_applicable
 *   2. нет данных кандидата      → unknown
 *   3. данные устарели           → unknown_stale   (§8.4: не not_matched!)
 *   4. кандидат заявил обратное  → declared_conflict
 *   5. совпало, но нужна проверка → needs_verification
 *   6. иначе                     → met
 */
function buildResult(input: {
  key: CriterionKey;
  kind: "hard" | "soft";
  ctx: Ctx;
  field: PassportFieldKey;
  requirement: CriterionValue | null;
  value: CriterionValue | null;
  /** null → сравнение невозможно (например «conditional»). */
  matches: boolean | null;
  matchedReason?: CriterionReason;
  conflictReason?: CriterionReason;
  unknownReason?: CriterionReason;
  /** Совпадение требует внешнего подтверждения (право на работу). */
  requiresVerification?: boolean;
}): CriterionResult {
  const { key, kind, ctx, field, requirement, value, matches } = input;
  const provenance = provenanceOf(ctx, field);
  const base = {
    key,
    kind,
    requirement: requirement ?? { kind: "none" as const },
    value: value ?? { kind: "none" as const },
    source: provenance.source,
    confirmed_at: provenance.confirmed_at,
  };

  if (!requirement) {
    return { ...base, state: "not_applicable", reason: "no_requirement" };
  }
  if (!value) {
    return { ...base, state: "unknown", reason: "no_data" };
  }
  if (provenance.stale) {
    return { ...base, state: "unknown_stale", reason: "stale_data" };
  }
  if (matches === null) {
    return {
      ...base,
      state: "unknown",
      reason: input.unknownReason ?? "not_comparable",
    };
  }
  if (!matches) {
    return {
      ...base,
      state: "declared_conflict",
      reason: input.conflictReason ?? "declared_outside_requirement",
    };
  }
  if (input.requiresVerification && !isVerifiedProvenance(provenance.source)) {
    return { ...base, state: "needs_verification", reason: "needs_external_check" };
  }
  return {
    ...base,
    state: "met",
    reason: input.matchedReason ?? "matches_requirement",
  };
}

// ---------------------------- Hard criteria ---------------------------

function evalLocation(ctx: Ctx, hard: HardCriteria): CriterionResult {
  const required = hard.location ?? null;
  const current = ctx.passport.current_location;
  const preferred = ctx.passport.preferred_locations ?? [];
  const hasValue = !!current || preferred.length > 0;

  // Полностью удалённая роль: география не ограничивает.
  const remoteRole = hard.work_format === "remote";

  let matches: boolean | null = null;
  let matchedReason: CriterionReason = "matches_requirement";
  if (required && hasValue) {
    if (remoteRole) {
      matches = true;
      matchedReason = "remote_role";
    } else {
      const candidates = [current, ...preferred].filter(Boolean) as string[];
      if (candidates.some((c) => locationMatches(required, c))) {
        matches = true;
      } else if (ctx.passport.relocation_willingness === "yes") {
        matches = true;
        matchedReason = "relocation_declared";
      } else if (ctx.passport.relocation_willingness === "conditional") {
        matches = null; // требуется уточнение, но это не несоответствие
      } else {
        matches = false;
      }
    }
  }

  return buildResult({
    key: "location",
    kind: "hard",
    ctx,
    field: "current_location",
    requirement: required ? { kind: "text", text: required } : null,
    value: hasValue
      ? { kind: "text", text: current ?? preferred.join(", ") }
      : null,
    matches,
    matchedReason,
    unknownReason: "conditional_answer",
  });
}

function evalWorkFormat(ctx: Ctx, hard: HardCriteria): CriterionResult {
  const required = hard.work_format ?? null;
  const preference = ctx.passport.work_format_preference ?? [];
  return buildResult({
    key: "work_format",
    kind: "hard",
    ctx,
    field: "work_format_preference",
    requirement: required ? { kind: "text", text: required } : null,
    value: preference.length ? { kind: "text", text: preference.join(", ") } : null,
    matches: required && preference.length ? preference.includes(required) : null,
  });
}

function evalWorkEligibility(ctx: Ctx, hard: HardCriteria): CriterionResult {
  const country = (hard.work_eligibility_country ?? "").trim().toUpperCase();
  const list = ctx.passport.work_authorization ?? [];
  const entry = country
    ? list.find((a) => (a.country ?? "").trim().toUpperCase() === country)
    : undefined;

  let matches: boolean | null = null;
  if (country && entry) {
    if (entry.status === "unknown") matches = null;
    else matches = entry.status !== "needs_sponsorship";
  }

  return buildResult({
    key: "work_eligibility",
    kind: "hard",
    ctx,
    field: "work_authorization",
    requirement: country ? { kind: "text", text: country } : null,
    value: entry ? { kind: "text", text: `${entry.country}: ${entry.status}` } : null,
    matches,
    // Право на работу подтверждается документом/внешней проверкой, а не
    // заявлением — совпадение остаётся `needs_verification` (§8.7).
    requiresVerification: true,
  });
}

function evalLanguages(ctx: Ctx, hard: HardCriteria): CriterionResult {
  const required = hard.languages ?? [];
  const spoken = ctx.passport.languages ?? [];
  const requirement: CriterionValue | null = required.length
    ? {
        kind: "languages",
        items: required.map((r) => ({ code: r.code, level: r.min_level })),
      }
    : null;
  const value: CriterionValue | null = spoken.length
    ? { kind: "languages", items: spoken }
    : null;

  let matches: boolean | null = null;
  if (required.length && spoken.length) {
    const declared = required.map((r) => ({
      required: r,
      actual: spoken.find((s) => normText(s.code) === normText(r.code)),
    }));
    if (declared.some((d) => !d.actual)) {
      matches = null; // язык не заявлен — это пробел, а не несоответствие
    } else {
      matches = declared.every((d) => levelAtLeast(d.actual!.level, d.required.min_level));
    }
  }

  return buildResult({
    key: "languages",
    kind: "hard",
    ctx,
    field: "languages",
    requirement,
    value,
    matches,
    conflictReason: "declared_below_requirement",
    unknownReason: "no_data",
  });
}

function evalSalary(ctx: Ctx, hard: HardCriteria): CriterionResult {
  const budget = hard.salary_budget ?? null;
  const expectation = ctx.passport.salary_expectation ?? null;
  const requirement: CriterionValue | null = budget
    ? {
        kind: "salary",
        min: budget.min,
        max: budget.max,
        currency: budget.currency,
        period: budget.period,
      }
    : null;
  const value: CriterionValue | null = expectation
    ? {
        kind: "salary",
        min: expectation.min,
        max: expectation.max,
        currency: expectation.currency,
        period: expectation.period,
      }
    : null;

  let matches: boolean | null = null;
  if (budget && expectation) {
    const comparable =
      normText(budget.currency) === normText(expectation.currency) &&
      budget.period === expectation.period;
    if (!comparable) {
      // Курсы и пересчёт периодов не выдумываем — критерий не сравним.
      matches = null;
    } else {
      const wanted = expectation.min ?? expectation.max;
      const ceiling = budget.max ?? budget.min;
      matches = wanted === null || ceiling === null ? null : wanted <= ceiling;
    }
  }

  return buildResult({
    key: "salary",
    kind: "hard",
    ctx,
    field: "salary_expectation",
    requirement,
    value,
    matches,
    conflictReason: "declared_outside_requirement",
    unknownReason: "not_comparable",
  });
}

function evalAvailability(ctx: Ctx, hard: HardCriteria): CriterionResult {
  const within = hard.start_within_days ?? null;
  const notice = ctx.passport.notice_period_days;
  return buildResult({
    key: "availability",
    kind: "hard",
    ctx,
    field: "notice_period_days",
    requirement: within === null ? null : { kind: "days", days: within },
    value: notice === null || notice === undefined ? null : { kind: "days", days: notice },
    matches:
      within === null || notice === null || notice === undefined ? null : notice <= within,
  });
}

function evalProfession(ctx: Ctx, hard: HardCriteria): CriterionResult {
  const requiredCode = hard.role_taxonomy_code ?? null;
  const requiredText = hard.profession ?? null;
  const candidateCode = ctx.passport.role_taxonomy_code;
  const candidateText = ctx.passport.profession ?? ctx.passport.role_free_text;

  const requirement: CriterionValue | null =
    requiredCode || requiredText
      ? { kind: "text", text: requiredCode ?? requiredText! }
      : null;
  const value: CriterionValue | null =
    candidateCode || candidateText
      ? { kind: "text", text: candidateCode ?? candidateText! }
      : null;

  let matches: boolean | null = null;
  if (requirement && value) {
    if (requiredCode && candidateCode) {
      matches = normText(requiredCode) === normText(candidateCode);
    } else if (requiredCode && !candidateCode) {
      // Роль кандидата ещё не нормализована — это пробел, не конфликт.
      matches = null;
    } else if (requiredText && candidateText) {
      const a = normText(requiredText);
      const b = normText(candidateText);
      matches = a === b || a.includes(b) || b.includes(a);
    }
  }

  return buildResult({
    key: "profession",
    kind: "hard",
    ctx,
    field: "profession",
    requirement,
    value,
    matches,
    unknownReason: "no_data",
  });
}

function evalSeniority(ctx: Ctx, hard: HardCriteria): CriterionResult {
  const accepted = hard.seniority ?? [];
  const level = ctx.passport.seniority;
  return buildResult({
    key: "seniority",
    kind: "hard",
    ctx,
    field: "seniority",
    requirement: accepted.length ? { kind: "text", text: accepted.join(", ") } : null,
    value: level ? { kind: "text", text: level } : null,
    matches: accepted.length && level ? accepted.includes(level) : null,
  });
}

function evalRelocation(ctx: Ctx, hard: HardCriteria): CriterionResult {
  const required = hard.relocation_required ?? null;
  const willingness: RelocationWillingness | null = ctx.passport.relocation_willingness;
  let matches: boolean | null = null;
  if (required !== null && willingness) {
    if (!required) matches = true;
    else if (willingness === "yes") matches = true;
    else if (willingness === "conditional") matches = null;
    else matches = false;
  }
  return buildResult({
    key: "relocation",
    kind: "hard",
    ctx,
    field: "relocation_willingness",
    requirement: required === null ? null : { kind: "boolean", value: required },
    value: willingness ? { kind: "text", text: willingness } : null,
    matches,
    unknownReason: "conditional_answer",
  });
}

// ---------------------------- Soft signals ----------------------------
//
// Soft signal показывает, что кандидат заявил и где основание. Он НЕ
// исключает человека и не участвует в сортировке (§8.6, §8.8).

function evalSoft(
  ctx: Ctx,
  key: SoftSignalKey,
  field: PassportFieldKey,
  requirement: string | boolean | null | undefined,
  value: CriterionValue | null,
): CriterionResult {
  const req: CriterionValue | null =
    requirement === null || requirement === undefined || requirement === ""
      ? null
      : typeof requirement === "boolean"
        ? { kind: "boolean", value: requirement }
        : { kind: "text", text: requirement };

  const provenance = provenanceOf(ctx, field);
  const base = {
    key,
    kind: "soft" as const,
    requirement: req ?? { kind: "none" as const },
    value: value ?? { kind: "none" as const },
    source: provenance.source,
    confirmed_at: provenance.confirmed_at,
  };

  if (!req) return { ...base, state: "not_applicable", reason: "no_requirement" };
  if (!value) return { ...base, state: "unknown", reason: "no_data" };
  if (provenance.stale) return { ...base, state: "unknown_stale", reason: "stale_data" };
  // Заявленный soft signal фиксируется как «есть основание». Расхождение
  // предпочтений — тема для интервью, а не declared_conflict.
  return { ...base, state: "met", reason: "matches_requirement" };
}

function evalSoftSignals(ctx: Ctx, soft: SoftCriteria): CriterionResult[] {
  const p = ctx.passport;
  const text = (s: string | null | undefined): CriterionValue | null =>
    s && s.trim() ? { kind: "text", text: s.trim() } : null;

  return [
    evalSoft(
      ctx,
      "management_experience",
      "management_experience",
      soft.management_experience ?? null,
      p.management_experience === null || p.management_experience === undefined
        ? null
        : p.team_size
          ? { kind: "text", text: `${p.management_experience ? "yes" : "no"} (${p.team_size})` }
          : { kind: "boolean", value: p.management_experience },
    ),
    evalSoft(ctx, "achievements", "key_achievements", soft.achievements ?? null, text(p.key_achievements)),
    evalSoft(
      ctx,
      "preferred_environment",
      "preferred_environment",
      soft.preferred_environment ?? null,
      text(p.preferred_environment),
    ),
    evalSoft(ctx, "motivation", "motivation", soft.motivation ?? null, text(p.motivation)),
    evalSoft(
      ctx,
      "company_and_role_type",
      "company_type_preference",
      soft.company_and_role_type ?? null,
      p.company_type_preference?.length
        ? { kind: "text", text: p.company_type_preference.join(", ") }
        : text(p.role_preference),
    ),
    evalSoft(
      ctx,
      "project_relevance",
      "role_preference",
      soft.project_relevance ?? null,
      text(p.role_preference),
    ),
  ];
}

// ---------------------------- Публичный API ---------------------------

export function evaluateCriteria(input: {
  criteria: VacancyCriteria;
  passport: CandidatePassport;
  profile_version_id: string;
  now: string;
}): MatchExplanation {
  const ctx: Ctx = { passport: input.passport, now: input.now };
  const hard = input.criteria.hard ?? {};
  const soft = input.criteria.soft ?? {};

  const criteria: CriterionResult[] = [
    evalLocation(ctx, hard),
    evalWorkFormat(ctx, hard),
    evalWorkEligibility(ctx, hard),
    evalLanguages(ctx, hard),
    evalSalary(ctx, hard),
    evalAvailability(ctx, hard),
    evalProfession(ctx, hard),
    evalSeniority(ctx, hard),
    evalRelocation(ctx, hard),
    ...evalSoftSignals(ctx, soft),
  ];

  return {
    vacancy_version_id: input.criteria.vacancy_version_id,
    profile_version_id: input.profile_version_id,
    evaluated_at: input.now,
    valid_until: addDays(input.now, ASSESSMENT_TTL_DAYS),
    criteria,
    coverage: coverage(criteria),
  };
}

export function coverage(criteria: CriterionResult[]): {
  required: CoverageCounts;
  optional: CoverageCounts;
} {
  const required = emptyCounts();
  const optional = emptyCounts();
  for (const result of criteria) {
    const bucket = result.kind === "hard" ? required : optional;
    bucket[result.state] += 1;
    // `not_applicable` не входит в знаменатель покрытия: роль его не требует.
    if (result.state !== "not_applicable") bucket.total += 1;
  }
  return { required, optional };
}

/**
 * Единственный допустимый агрегат — покрытие требований конкретной вакансии.
 * Это НЕ рейтинг человека и не сравнение людей между собой (§8.7).
 */
export function coverageSentence(
  locale: Locale,
  explanation: MatchExplanation,
): string {
  const c = explanation.coverage.required;
  // Статусы печатаем каноническими кодами v1.2 §8.6 во всех локалях: это
  // технические состояния критерия, а не оценочные слова.
  const order: CriterionState[] = [
    "met",
    "declared_conflict",
    "unknown",
    "unknown_stale",
    "needs_verification",
  ];
  const parts = order.filter((s) => c[s] > 0).map((s) => `${c[s]} ${s}`);

  const prefix: Record<Locale, string> = {
    ru: "Обязательные критерии",
    en: "Required criteria",
    id: "Kriteria wajib",
    uz: "Majburiy mezonlar",
  };
  return `${prefix[locale]}: ${parts.join(", ")}.`;
}

/**
 * Кандидат исключается из выдачи ТОЛЬКО при заявленном несоответствии
 * обязательному критерию. Пробел и устаревание не исключают человека (§16).
 */
export function hasBlockingConflict(explanation: MatchExplanation): boolean {
  return explanation.criteria.some(
    (c) => c.kind === "hard" && c.state === "declared_conflict",
  );
}

/** Критерии, требующие вопроса или ручной проверки. */
export function openQuestions(explanation: MatchExplanation): CriterionResult[] {
  return explanation.criteria.filter(
    (c) =>
      c.state === "unknown" ||
      c.state === "unknown_stale" ||
      c.state === "needs_verification",
  );
}

/**
 * Детерминированный порядок показа. Сортировка по «качеству» человека
 * запрещена, поэтому упорядочиваем по времени оценки и идентификатору.
 */
export function orderForDisplay<T extends { evaluated_at: string; id: string }>(
  items: T[],
): T[] {
  return [...items].sort((a, b) => {
    if (a.evaluated_at !== b.evaluated_at) {
      return a.evaluated_at < b.evaluated_at ? 1 : -1;
    }
    return a.id < b.id ? -1 : a.id > b.id ? 1 : 0;
  });
}

/** Срок действия оценки (§7.3): истёкшая не используется для показа/приглашения. */
export function isAssessmentValid(
  explanation: MatchExplanation,
  now: string,
  invalidatedAt?: string | null,
): boolean {
  if (Date.parse(now) > Date.parse(explanation.valid_until)) return false;
  if (invalidatedAt && Date.parse(invalidatedAt) > Date.parse(explanation.evaluated_at)) {
    return false;
  }
  return true;
}

// ---------------------------- Защита от рейтинга ----------------------

const FORBIDDEN_KEYS = [
  "score",
  "match_score",
  "match_percent",
  "matchpercent",
  "fit_score",
  "overall_score",
  "rating",
  "rank",
  "ranking",
  "percentile",
  "weight",
  "weights",
];

/**
 * Guardrail: в employer-facing выводе не должно появиться ни одного поля,
 * из которого можно собрать совокупный балл или процент совпадения (§16).
 * Вызывается перед сохранением snapshot и в тестах.
 */
export function assertNoAggregateScore(value: unknown, path = "$"): void {
  if (value === null || typeof value !== "object") return;
  if (Array.isArray(value)) {
    value.forEach((item, i) => assertNoAggregateScore(item, `${path}[${i}]`));
    return;
  }
  for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
    if (FORBIDDEN_KEYS.includes(key.toLowerCase())) {
      throw new Error(
        `aggregate score forbidden: ${path}.${key} (v1.2 §8.7 — no percent match, no overall score)`,
      );
    }
    assertNoAggregateScore(child, `${path}.${key}`);
  }
}

// ---------------------------- Локализация -----------------------------

const CRITERION_LABELS: Record<Locale, Record<CriterionKey, string>> = {
  ru: {
    location: "Локация",
    work_format: "Формат работы",
    work_eligibility: "Право на работу",
    languages: "Языки",
    salary: "Зарплатные ожидания",
    availability: "Доступность",
    profession: "Профессия",
    seniority: "Уровень",
    relocation: "Готовность к переезду",
    management_experience: "Управленческий опыт",
    achievements: "Достижения",
    preferred_environment: "Предпочитаемая среда",
    motivation: "Мотивация",
    company_and_role_type: "Тип компании и роли",
    project_relevance: "Релевантность проектов",
  },
  en: {
    location: "Location",
    work_format: "Work format",
    work_eligibility: "Work authorization",
    languages: "Languages",
    salary: "Salary expectation",
    availability: "Availability",
    profession: "Profession",
    seniority: "Seniority",
    relocation: "Relocation",
    management_experience: "Management experience",
    achievements: "Achievements",
    preferred_environment: "Preferred environment",
    motivation: "Motivation",
    company_and_role_type: "Company and role type",
    project_relevance: "Project relevance",
  },
  id: {
    location: "Lokasi",
    work_format: "Format kerja",
    work_eligibility: "Izin kerja",
    languages: "Bahasa",
    salary: "Ekspektasi gaji",
    availability: "Ketersediaan",
    profession: "Profesi",
    seniority: "Tingkat senioritas",
    relocation: "Kesiapan pindah",
    management_experience: "Pengalaman memimpin",
    achievements: "Pencapaian",
    preferred_environment: "Lingkungan kerja pilihan",
    motivation: "Motivasi",
    company_and_role_type: "Tipe perusahaan dan peran",
    project_relevance: "Relevansi proyek",
  },
  uz: {
    location: "Joylashuv",
    work_format: "Ish formati",
    work_eligibility: "Ishlash huquqi",
    languages: "Tillar",
    salary: "Maosh kutilmasi",
    availability: "Ishga tayyorlik",
    profession: "Kasb",
    seniority: "Daraja",
    relocation: "Ko‘chishga tayyorlik",
    management_experience: "Boshqaruv tajribasi",
    achievements: "Yutuqlar",
    preferred_environment: "Afzal ko‘rilgan muhit",
    motivation: "Motivatsiya",
    company_and_role_type: "Kompaniya va rol turi",
    project_relevance: "Loyihalar mosligi",
  },
};

export function criterionLabel(locale: Locale, key: CriterionKey | string): string {
  return CRITERION_LABELS[locale]?.[key as CriterionKey] ?? String(key);
}

const DAYS_WORD: Record<Locale, string> = {
  ru: "дн.",
  en: "days",
  id: "hari",
  uz: "kun",
};

/** Человекочитаемое значение критерия без оценочных суждений. */
export function formatCriterionValue(locale: Locale, value: CriterionValue): string {
  switch (value.kind) {
    case "none":
      return "—";
    case "text":
      return value.text;
    case "boolean":
      return value.value
        ? { ru: "да", en: "yes", id: "ya", uz: "ha" }[locale]
        : { ru: "нет", en: "no", id: "tidak", uz: "yo‘q" }[locale];
    case "days":
      return `${value.days} ${DAYS_WORD[locale]}`;
    case "salary": {
      const range =
        value.min !== null && value.max !== null && value.min !== value.max
          ? `${value.min}–${value.max}`
          : String(value.min ?? value.max ?? "—");
      return `${range} ${value.currency}/${value.period}`;
    }
    case "languages":
      return value.items.map((i) => `${i.code.toUpperCase()} ${i.level}`).join(", ");
  }
}

const STATE_LABELS: Record<Locale, Record<CriterionState, string>> = {
  ru: {
    met: "подтверждено",
    declared_conflict: "заявлено несовпадение",
    unknown: "нет данных",
    unknown_stale: "данные устарели",
    needs_verification: "требует проверки",
    not_applicable: "не требуется",
  },
  en: {
    met: "met",
    declared_conflict: "declared conflict",
    unknown: "no data",
    unknown_stale: "data is stale",
    needs_verification: "needs verification",
    not_applicable: "not applicable",
  },
  id: {
    met: "terpenuhi",
    declared_conflict: "dinyatakan tidak cocok",
    unknown: "tidak ada data",
    unknown_stale: "data kedaluwarsa",
    needs_verification: "perlu verifikasi",
    not_applicable: "tidak berlaku",
  },
  uz: {
    met: "tasdiqlangan",
    declared_conflict: "mos emasligi bildirilgan",
    unknown: "ma’lumot yo‘q",
    unknown_stale: "ma’lumot eskirgan",
    needs_verification: "tekshirish kerak",
    not_applicable: "talab qilinmaydi",
  },
};

export function criterionStateLabel(
  locale: Locale,
  state: CriterionState | string,
): string {
  return STATE_LABELS[locale]?.[normalizeCriterionState(String(state))] ?? String(state);
}

/**
 * Строка объяснения по одному критерию, например:
 *   «Языки: EN C1 — подтверждено, заявлено кандидатом».
 * Никакого процента и никакого сравнения с другими людьми.
 */
export function criterionLine(locale: Locale, result: CriterionResult): string {
  const label = criterionLabel(locale, result.key);
  const state = criterionStateLabel(locale, result.state);
  if (result.state === "not_applicable" || result.state === "unknown") {
    return `${label}: ${state}`;
  }
  const value = formatCriterionValue(locale, result.value);
  return `${label}: ${value} — ${state}, ${provenanceLabel(locale, result.source)}`;
}

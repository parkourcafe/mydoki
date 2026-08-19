import type { Locale } from "./i18n";

// ============================ Candidate Passport ======================
// Переиспользуемый профессиональный профиль человека (v1.2 §8.2–§8.4).
//
// Канонические границы:
//   • Passport принадлежит человеку и НЕ создаётся заново под каждую вакансию.
//   • CV остаётся вложением и источником, но сопоставление строится по
//     структурированным полям, которые кандидат видит и подтверждает.
//   • Каждое поле хранит происхождение (provenance). Извлечённое из файла
//     значение не становится подтверждённым автоматически.
//   • Полнота профиля описывает ПРОФИЛЬ, а не человека, и не может
//     использоваться для ранжирования людей (§16).
//
// Модуль чистый (без БД и next/*), чтобы покрываться юнит-тестами.

// ---------------------------- Происхождение факта ---------------------

/** Происхождение значения поля (v1.2 §8.2). */
export type FieldProvenance =
  | "candidate_declared"
  | "extracted_from_candidate_file"
  | "employer_confirmed"
  | "externally_verified"
  | "unknown";

/**
 * Синонимы из брифа → канонические значения v1.2. Нужны, чтобы внешние
 * интеграции и старые записи не создавали второй словарь источников.
 */
const PROVENANCE_ALIASES: Record<string, FieldProvenance> = {
  candidate_stated: "candidate_declared",
  candidate_declared: "candidate_declared",
  document_extracted: "extracted_from_candidate_file",
  extracted_from_candidate_file: "extracted_from_candidate_file",
  cv_extracted: "extracted_from_candidate_file",
  employer_verified: "employer_confirmed",
  employer_confirmed: "employer_confirmed",
  platform_verified: "externally_verified",
  externally_verified: "externally_verified",
  unknown: "unknown",
};

export function normalizeProvenance(raw: string | null | undefined): FieldProvenance {
  if (!raw) return "unknown";
  return PROVENANCE_ALIASES[raw.trim().toLowerCase()] ?? "unknown";
}

/**
 * Источники, которые разрешено показывать как подтверждённые. Заявленное
 * кандидатом и извлечённое из файла подтверждением НЕ являются (§11 safety).
 */
export function isVerifiedProvenance(source: FieldProvenance): boolean {
  return source === "employer_confirmed" || source === "externally_verified";
}

/** Подтверждение поля кандидатом: источник + дата подтверждения. */
export type FieldConfirmation = {
  source: FieldProvenance;
  /** Когда человек в последний раз подтвердил значение (ISO). */
  confirmed_at: string | null;
};

export type FieldConfirmations = Record<string, FieldConfirmation>;

// ---------------------------- Состояния профиля -----------------------

/** Жизненный цикл профиля (§8.4). Не путать с намерением искать работу. */
export type ProfileLifecycle = "draft" | "ready" | "paused" | "archived";

/** Намерение кандидата (§8.4). Не путать с `Application.state`. */
export type SearchIntent = "active" | "open" | "unavailable";

export const SEARCH_INTENTS: SearchIntent[] = ["active", "open", "unavailable"];

export function normalizeSearchIntent(raw: string | null | undefined): SearchIntent {
  const v = (raw ?? "").trim().toLowerCase();
  return (SEARCH_INTENTS as string[]).includes(v) ? (v as SearchIntent) : "open";
}

/**
 * `unavailable` останавливает новые рекомендации и приглашения, но не
 * закрывает уже существующие отклики (§8.4).
 */
export function acceptsNewOpportunities(intent: SearchIntent): boolean {
  return intent === "active" || intent === "open";
}

// ---------------------------- Значения полей --------------------------

export type Seniority =
  | "intern"
  | "junior"
  | "middle"
  | "senior"
  | "lead"
  | "head"
  | "executive";

export const SENIORITY_ORDER: Seniority[] = [
  "intern",
  "junior",
  "middle",
  "senior",
  "lead",
  "head",
  "executive",
];

export type WorkFormat = "remote" | "on_site" | "hybrid";

export type RelocationWillingness = "no" | "conditional" | "yes";

export type EmploymentFormat =
  | "full_time"
  | "part_time"
  | "contract"
  | "freelance"
  | "internship";

/** CEFR + `native`. Свободные строки не используем: критерий должен сравниваться. */
export type LanguageLevel = "A1" | "A2" | "B1" | "B2" | "C1" | "C2" | "native";

export const LANGUAGE_LEVEL_ORDER: LanguageLevel[] = [
  "A1",
  "A2",
  "B1",
  "B2",
  "C1",
  "C2",
  "native",
];

export type LanguageSkill = {
  /** ISO 639-1, нижний регистр: en, id, ru, uz… */
  code: string;
  level: LanguageLevel;
};

export type SalaryPeriod = "month" | "year" | "hour" | "project";

export type SalaryExpectation = {
  min: number | null;
  max: number | null;
  currency: string;
  period: SalaryPeriod;
};

/**
 * Право на работу заявляется по стране. Национальность как proxy запрещена
 * (§8.6, §16) — поэтому храним именно статус разрешения, а не гражданство.
 */
export type WorkAuthorization = {
  /** ISO 3166-1 alpha-2, верхний регистр. */
  country: string;
  status: "citizen" | "permanent" | "work_permit" | "needs_sponsorship" | "unknown";
  valid_until: string | null;
};

// ---------------------------- Passport --------------------------------

export type CandidatePassport = {
  /** Как кандидат сам называет профессию. */
  profession: string | null;
  /** Нормализованный термин справочника ролей (подтверждается кандидатом). */
  role_taxonomy_code: string | null;
  /** `Other role / Open to opportunities`: свободное описание экспертизы. */
  role_free_text: string | null;
  seniority: Seniority | null;
  years_of_experience: number | null;
  key_achievements: string | null;
  management_experience: boolean | null;
  team_size: number | null;
  current_location: string | null;
  preferred_locations: string[];
  work_format_preference: WorkFormat[];
  relocation_willingness: RelocationWillingness | null;
  work_authorization: WorkAuthorization[];
  languages: LanguageSkill[];
  salary_expectation: SalaryExpectation | null;
  search_intent: SearchIntent;
  notice_period_days: number | null;
  preferred_employment_format: EmploymentFormat[];
  /** Мягкие сигналы — контекст для человека, не скрытый рейтинг (§8.6). */
  preferred_environment: string | null;
  motivation: string | null;
  company_type_preference: string[];
  role_preference: string | null;
  /** Ссылки и вложения, добровольно предоставленные человеком. */
  cv_document_id: string | null;
  cv_file_path: string | null;
  linkedin_url: string | null;
  portfolio_url: string | null;
  /** Служебное. */
  lifecycle: ProfileLifecycle;
  field_confirmations: FieldConfirmations;
  last_confirmed_at: string | null;
};

/** Пустой паспорт — единая точка дефолтов для формы и тестов. */
export function emptyPassport(): CandidatePassport {
  return {
    profession: null,
    role_taxonomy_code: null,
    role_free_text: null,
    seniority: null,
    years_of_experience: null,
    key_achievements: null,
    management_experience: null,
    team_size: null,
    current_location: null,
    preferred_locations: [],
    work_format_preference: [],
    relocation_willingness: null,
    work_authorization: [],
    languages: [],
    salary_expectation: null,
    search_intent: "open",
    notice_period_days: null,
    preferred_employment_format: [],
    preferred_environment: null,
    motivation: null,
    company_type_preference: [],
    role_preference: null,
    cv_document_id: null,
    cv_file_path: null,
    linkedin_url: null,
    portfolio_url: null,
    lifecycle: "draft",
    field_confirmations: {},
    last_confirmed_at: null,
  };
}

/**
 * Строка БД (`resumes` + структурированные колонки паспорта) → доменный тип.
 * Одна точка нормализации для кабинета кандидата и для employer-facing
 * проекции из `talent_pool_candidates`.
 */
export function passportFromRow(row: Record<string, unknown> | null): CandidatePassport {
  const base = emptyPassport();
  if (!row) return base;

  const str = (key: string): string | null => {
    const value = row[key];
    return typeof value === "string" && value.trim() ? value : null;
  };
  const num = (key: string): number | null => {
    const value = row[key];
    if (value === null || value === undefined || value === "") return null;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  };
  const bool = (key: string): boolean | null => {
    const value = row[key];
    return typeof value === "boolean" ? value : null;
  };
  const arr = <T,>(key: string): T[] => {
    const value = row[key];
    return Array.isArray(value) ? (value as T[]) : [];
  };

  return {
    ...base,
    profession: str("profession"),
    role_taxonomy_code: str("role_taxonomy_code"),
    role_free_text: str("role_free_text"),
    seniority: (str("seniority") as Seniority | null) ?? null,
    years_of_experience: num("years_of_experience"),
    key_achievements: str("key_achievements"),
    management_experience: bool("management_experience"),
    team_size: num("team_size"),
    current_location: str("current_location"),
    preferred_locations: arr<string>("preferred_locations"),
    work_format_preference: arr<WorkFormat>("work_format_preference"),
    relocation_willingness:
      (str("relocation_willingness") as RelocationWillingness | null) ?? null,
    work_authorization: arr<WorkAuthorization>("work_authorization"),
    languages: arr<LanguageSkill>("languages"),
    salary_expectation:
      (row.salary_expectation as SalaryExpectation | null) ?? null,
    search_intent: normalizeSearchIntent(str("search_intent")),
    notice_period_days: num("notice_period_days"),
    preferred_employment_format: arr<EmploymentFormat>("preferred_employment_format"),
    preferred_environment: str("preferred_environment"),
    motivation: str("motivation"),
    company_type_preference: arr<string>("company_type_preference"),
    role_preference: str("role_preference"),
    cv_document_id: str("cv_document_id"),
    cv_file_path: str("cv_file_path"),
    linkedin_url: str("linkedin_url"),
    portfolio_url: str("portfolio_url"),
    lifecycle: (str("lifecycle") as ProfileLifecycle | null) ?? "draft",
    field_confirmations:
      (row.field_confirmations as FieldConfirmations | null) ?? {},
    last_confirmed_at: str("last_confirmed_at"),
  };
}

// ---------------------------- Progressive profiling -------------------

export type PassportFieldKey = keyof CandidatePassport;

/**
 * Минимальный первый шаг (§8.3). Цель UX — 60–90 секунд; это продуктовая
 * цель, а не SLA. Длинная анкета на первом экране запрещена.
 */
export const QUICK_START_FIELDS: PassportFieldKey[] = [
  "profession",
  "current_location",
  "seniority",
  "languages",
  "salary_expectation",
  "search_intent",
  "work_format_preference",
];

function isFilled(passport: CandidatePassport, field: PassportFieldKey): boolean {
  const value = passport[field];
  if (value === null || value === undefined) return false;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === "string") return value.trim().length > 0;
  if (typeof value === "object") {
    // salary_expectation / прочие объекты: считаем заполненным, если есть
    // хотя бы одно значащее поле.
    return Object.values(value as Record<string, unknown>).some(
      (v) => v !== null && v !== undefined && v !== "",
    );
  }
  return true;
}

/** Профессия может быть заявлена и свободным текстом (`Other role`). */
function hasProfession(passport: CandidatePassport): boolean {
  return isFilled(passport, "profession") || isFilled(passport, "role_free_text");
}

export function missingQuickStartFields(
  passport: CandidatePassport,
): PassportFieldKey[] {
  return QUICK_START_FIELDS.filter((field) => {
    if (field === "profession") return !hasProfession(passport);
    if (field === "search_intent") return false; // всегда имеет значение по умолчанию
    return !isFilled(passport, field);
  });
}

/** Профиль можно сохранить и опубликовать только после минимального шага. */
export function isQuickStartComplete(passport: CandidatePassport): boolean {
  return missingQuickStartFields(passport).length === 0;
}

/**
 * Группы полей для «докручивания» профиля. Порядок = порядок подсказок в UI:
 * сначала то, что раскрывает объяснимость сопоставления.
 */
export const COMPLETION_GROUPS: {
  key: string;
  fields: PassportFieldKey[];
  /** Улучшает объяснимость обязательных критериев. */
  improves_hard_criteria: boolean;
}[] = [
  { key: "basics", fields: QUICK_START_FIELDS, improves_hard_criteria: true },
  {
    key: "eligibility",
    fields: ["work_authorization", "relocation_willingness", "notice_period_days"],
    improves_hard_criteria: true,
  },
  {
    key: "experience",
    fields: ["years_of_experience", "role_taxonomy_code", "preferred_locations"],
    improves_hard_criteria: true,
  },
  {
    key: "leadership",
    fields: ["management_experience", "team_size", "key_achievements"],
    improves_hard_criteria: false,
  },
  {
    key: "preferences",
    fields: [
      "preferred_employment_format",
      "preferred_environment",
      "motivation",
      "company_type_preference",
      "role_preference",
    ],
    improves_hard_criteria: false,
  },
  {
    key: "attachments",
    fields: ["cv_file_path", "linkedin_url", "portfolio_url"],
    improves_hard_criteria: false,
  },
];

export type CompletionGroupState = {
  key: string;
  filled: number;
  total: number;
  missing: PassportFieldKey[];
  improves_hard_criteria: boolean;
};

export type ProfileCompleteness = {
  /** 0–100. Свойство ПРОФИЛЯ, не человека. Не используется для сортировки людей. */
  percent: number;
  groups: CompletionGroupState[];
};

/**
 * Полнота профиля. Значение показывается только владельцу профиля и в
 * подсказках «что добавить»; для employer-facing ранжирования использовать
 * запрещено (§16 — совокупный рейтинг человека).
 */
export function profileCompleteness(passport: CandidatePassport): ProfileCompleteness {
  const groups: CompletionGroupState[] = COMPLETION_GROUPS.map((group) => {
    const missing = group.fields.filter((field) => {
      if (field === "profession") return !hasProfession(passport);
      if (field === "search_intent") return false;
      return !isFilled(passport, field);
    });
    return {
      key: group.key,
      filled: group.fields.length - missing.length,
      total: group.fields.length,
      missing,
      improves_hard_criteria: group.improves_hard_criteria,
    };
  });

  const total = groups.reduce((sum, g) => sum + g.total, 0);
  const filled = groups.reduce((sum, g) => sum + g.filled, 0);
  return { percent: total === 0 ? 0 : Math.round((filled / total) * 100), groups };
}

/**
 * Что предложить заполнить дальше. Сначала группы, улучшающие объяснимость
 * обязательных критериев, затем контекст для человеческого решения.
 */
export function nextCompletionSteps(
  passport: CandidatePassport,
  limit = 3,
): PassportFieldKey[] {
  const { groups } = profileCompleteness(passport);
  const ordered = [...groups].sort((a, b) => {
    if (a.improves_hard_criteria !== b.improves_hard_criteria) {
      return a.improves_hard_criteria ? -1 : 1;
    }
    return 0;
  });
  const out: PassportFieldKey[] = [];
  for (const group of ordered) {
    for (const field of group.missing) {
      if (out.length >= limit) return out;
      if (!out.includes(field)) out.push(field);
    }
  }
  return out;
}

// ---------------------------- Актуальность (freshness) ----------------

/**
 * Изменчивые поля с собственным сроком актуальности (§8.4). Просрочка даёт
 * `unknown_stale`, а НЕ «не соответствует».
 */
export const VOLATILE_FIELDS: PassportFieldKey[] = [
  "search_intent",
  "current_location",
  "notice_period_days",
  "salary_expectation",
  "work_authorization",
];

export const VOLATILE_FRESHNESS_DAYS = 90;
export const DEFAULT_FRESHNESS_DAYS = 180;

export function freshnessWindowDays(field: PassportFieldKey | string): number {
  return (VOLATILE_FIELDS as string[]).includes(field as string)
    ? VOLATILE_FRESHNESS_DAYS
    : DEFAULT_FRESHNESS_DAYS;
}

function daysBetween(from: string, to: string): number {
  const a = Date.parse(from);
  const b = Date.parse(to);
  if (Number.isNaN(a) || Number.isNaN(b)) return Number.POSITIVE_INFINITY;
  return (b - a) / 86_400_000;
}

/** Устарело ли значение поля на момент `now` (ISO). */
export function isFieldStale(
  field: PassportFieldKey | string,
  confirmedAt: string | null | undefined,
  now: string,
): boolean {
  if (!confirmedAt) return true;
  return daysBetween(confirmedAt, now) > freshnessWindowDays(field);
}

export function fieldConfirmation(
  passport: CandidatePassport,
  field: PassportFieldKey | string,
): FieldConfirmation {
  const raw = passport.field_confirmations?.[field as string];
  return {
    source: normalizeProvenance(raw?.source),
    confirmed_at: raw?.confirmed_at ?? null,
  };
}

/** Поля, которые пора переподтвердить (re-verification устаревшего профиля). */
export function fieldsNeedingReconfirmation(
  passport: CandidatePassport,
  now: string,
): PassportFieldKey[] {
  return VOLATILE_FIELDS.filter((field) => {
    if (field === "search_intent") {
      // Намерение подтверждается вместе с профилем целиком.
      return isFieldStale(field, passport.last_confirmed_at, now);
    }
    if (!isFilled(passport, field)) return false;
    return isFieldStale(field, fieldConfirmation(passport, field).confirmed_at, now);
  });
}

// ---------------------------- Prefill из CV/LinkedIn ------------------

/**
 * Предзаполнение допускается только из файлов/экспортов/ссылок, которые
 * человек законно предоставил сам (§8.3). Скрытый scraping запрещён (§16).
 * Любое извлечённое значение остаётся черновиком, пока человек его не принял.
 */
export type PrefillSuggestion = {
  field: PassportFieldKey;
  value: unknown;
  source: FieldProvenance;
  accepted: boolean;
};

export const ALLOWED_PREFILL_SOURCES: FieldProvenance[] = [
  "extracted_from_candidate_file",
  "candidate_declared",
];

export function isPrefillSourceAllowed(source: FieldProvenance): boolean {
  return ALLOWED_PREFILL_SOURCES.includes(source);
}

/**
 * Применяет ТОЛЬКО подтверждённые кандидатом подсказки. Непринятая подсказка
 * никогда не попадает в паспорт и не участвует в сопоставлении.
 */
export function applyAcceptedPrefill(
  passport: CandidatePassport,
  suggestions: PrefillSuggestion[],
  confirmedAt: string,
): CandidatePassport {
  const next: CandidatePassport = {
    ...passport,
    field_confirmations: { ...passport.field_confirmations },
  };
  for (const suggestion of suggestions) {
    if (!suggestion.accepted) continue;
    if (!isPrefillSourceAllowed(normalizeProvenance(suggestion.source))) continue;
    (next as Record<string, unknown>)[suggestion.field] = suggestion.value;
    next.field_confirmations[suggestion.field] = {
      // Кандидат проверил и принял значение — источником остаётся файл,
      // но дата подтверждения человеком фиксируется.
      source: normalizeProvenance(suggestion.source),
      confirmed_at: confirmedAt,
    };
  }
  return next;
}

/** Подсказки, ожидающие проверки человеком. */
export function pendingPrefill(suggestions: PrefillSuggestion[]): PrefillSuggestion[] {
  return suggestions.filter((s) => !s.accepted);
}

// ---------------------------- Метки ------------------------------------

const INTENT_LABELS: Record<Locale, Record<SearchIntent, string>> = {
  ru: {
    active: "Активно ищу работу",
    open: "Не ищу активно, но открыт к предложениям",
    unavailable: "Сейчас не рассматриваю предложения",
  },
  en: {
    active: "Actively looking for work",
    open: "Not actively looking, open to good offers",
    unavailable: "Not considering offers right now",
  },
  id: {
    active: "Sedang aktif mencari kerja",
    open: "Tidak aktif mencari, tapi terbuka untuk tawaran",
    unavailable: "Sedang tidak mempertimbangkan tawaran",
  },
  uz: {
    active: "Faol ish qidiryapman",
    open: "Faol qidirmayapman, lekin takliflarga ochiqman",
    unavailable: "Hozircha takliflarni ko‘rmayapman",
  },
};

export function searchIntentLabel(locale: Locale, intent: SearchIntent | string): string {
  return INTENT_LABELS[locale]?.[intent as SearchIntent] ?? String(intent);
}

const PROVENANCE_LABELS: Record<Locale, Record<FieldProvenance, string>> = {
  ru: {
    candidate_declared: "заявлено кандидатом",
    extracted_from_candidate_file: "извлечено из файла кандидата",
    employer_confirmed: "подтверждено работодателем",
    externally_verified: "подтверждено внешней проверкой",
    unknown: "источник неизвестен",
  },
  en: {
    candidate_declared: "candidate-stated",
    extracted_from_candidate_file: "extracted from candidate file",
    employer_confirmed: "employer-confirmed",
    externally_verified: "externally verified",
    unknown: "source unknown",
  },
  id: {
    candidate_declared: "dinyatakan kandidat",
    extracted_from_candidate_file: "diambil dari berkas kandidat",
    employer_confirmed: "dikonfirmasi perusahaan",
    externally_verified: "diverifikasi pihak eksternal",
    unknown: "sumber tidak diketahui",
  },
  uz: {
    candidate_declared: "nomzod tomonidan bildirilgan",
    extracted_from_candidate_file: "nomzod faylidan olingan",
    employer_confirmed: "ish beruvchi tasdiqlagan",
    externally_verified: "tashqi tekshiruvdan o‘tgan",
    unknown: "manba noma’lum",
  },
};

export function provenanceLabel(locale: Locale, source: FieldProvenance | string): string {
  const normalized = normalizeProvenance(String(source));
  return PROVENANCE_LABELS[locale]?.[normalized] ?? normalized;
}

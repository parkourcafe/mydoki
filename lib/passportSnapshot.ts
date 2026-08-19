import type { CandidatePassport } from "./passport";
import type { MatchExplanation, VacancyCriteria } from "./matching";
import { assertNoAggregateScore } from "./matching.ts";
import { assertNoInviteHistorySignal } from "./talentPool.ts";
import type { PassportView, VisibilityPolicy, RevealLevel } from "./passportVisibility";

// ==================== Неизменяемые снимки профиля =====================
// v1.2 §7.3, §7.4, §10, §17.13.
//
// Правила:
//   • Обновление Candidate Passport не переписывает snapshot уже поданного
//     отклика (§17.13).
//   • `ProfessionalProfileVersion` — неизменяемый снимок структурированных
//     полей; на него ссылаются MatchAssessment и ApplicationProfileSnapshot.
//   • Snapshot содержит только те поля, которые кандидат передал для этой
//     цели (field-level scope).
//   • В снимке не должно быть совокупного балла и следов «истории отказов».
//
// Модуль чистый: без БД и next/*.

export const SNAPSHOT_VERSION = 1;

// ---------------------------- Детерминированная сериализация ----------

/** JSON с отсортированными ключами: одинаковые данные → одинаковая строка. */
export function stableStringify(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value) ?? "null";
  if (Array.isArray(value)) {
    return `[${value.map((v) => stableStringify(v)).join(",")}]`;
  }
  const entries = Object.entries(value as Record<string, unknown>)
    .filter(([, v]) => v !== undefined)
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));
  return `{${entries
    .map(([k, v]) => `${JSON.stringify(k)}:${stableStringify(v)}`)
    .join(",")}}`;
}

/**
 * Контрольная сумма снимка (FNV-1a, 32 бита + длина). Не криптографическая
 * подпись: цель — обнаружить, что хранимый снимок отличается от исходного.
 */
export function checksum(value: unknown): string {
  const input = stableStringify(value);
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return `${hash.toString(16).padStart(8, "0")}-${input.length.toString(16)}`;
}

// ---------------------------- Версия профиля --------------------------

/** Поля, образующие неизменяемую версию профессионального профиля. */
const PROFILE_VERSION_FIELDS: (keyof CandidatePassport)[] = [
  "profession",
  "role_taxonomy_code",
  "role_free_text",
  "seniority",
  "years_of_experience",
  "key_achievements",
  "management_experience",
  "team_size",
  "current_location",
  "preferred_locations",
  "work_format_preference",
  "relocation_willingness",
  "work_authorization",
  "languages",
  "salary_expectation",
  "search_intent",
  "notice_period_days",
  "preferred_employment_format",
  "preferred_environment",
  "motivation",
  "company_type_preference",
  "role_preference",
  "field_confirmations",
  "last_confirmed_at",
];

export type ProfileVersion = {
  snapshot_version: number;
  created_at: string;
  fields: Partial<CandidatePassport>;
  checksum: string;
};

export function buildProfileVersion(
  passport: CandidatePassport,
  createdAt: string,
): ProfileVersion {
  const fields: Partial<CandidatePassport> = {};
  for (const key of PROFILE_VERSION_FIELDS) {
    (fields as Record<string, unknown>)[key] = passport[key];
  }
  // Версия профиля не содержит ни балла, ни истории реакций на приглашения.
  assertNoAggregateScore(fields);
  assertNoInviteHistorySignal(fields);

  const base = { snapshot_version: SNAPSHOT_VERSION, created_at: createdAt, fields };
  return { ...base, checksum: checksum(base) };
}

// ---------------------------- Снимок отклика --------------------------

/**
 * Состояние видимости на момент события: с каким режимом и каким уровнем
 * раскрытия работодатель получил данные.
 */
export type VisibilityStateSnapshot = {
  mode: VisibilityPolicy["mode"];
  reveal_level: RevealLevel;
  hide_current_employer: boolean;
  hidden_fields: string[];
  blocked_organization_ids: string[];
  shared_fields: string[];
};

export type ApplicationProfileSnapshot = {
  snapshot_version: number;
  /** Момент события (отклик или принятое приглашение). */
  timestamp: string;
  candidate_profile_snapshot: ProfileVersion;
  vacancy_requirements_snapshot: VacancyCriteria;
  match_explanation_snapshot: MatchExplanation | null;
  visibility_state_snapshot: VisibilityStateSnapshot;
  checksum: string;
};

export function visibilityStateSnapshot(
  policy: VisibilityPolicy,
  level: RevealLevel,
  sharedFields: string[],
): VisibilityStateSnapshot {
  return {
    mode: policy.mode,
    reveal_level: level,
    hide_current_employer: policy.hide_current_employer,
    hidden_fields: [...policy.hidden_fields].sort(),
    blocked_organization_ids: [...policy.blocked_organization_ids].sort(),
    shared_fields: [...sharedFields].sort(),
  };
}

/**
 * Неизменяемый снимок на момент отклика или приглашения. Последующие правки
 * паспорта его не переписывают: снимок хранится отдельно и только вставляется.
 *
 * `vacancy_requirements_snapshot` содержит hard/soft критерии конкретной
 * версии вакансии. Скрытые веса сюда попасть не могут: их отсекает
 * `assertNoAggregateScore` (§9 — вакансия не содержит скрытых весов).
 */
export function buildApplicationSnapshot(input: {
  passport: CandidatePassport;
  criteria: VacancyCriteria;
  explanation: MatchExplanation | null;
  policy: VisibilityPolicy;
  reveal_level: RevealLevel;
  shared_fields: string[];
  timestamp: string;
}): ApplicationProfileSnapshot {
  const profile = buildProfileVersion(input.passport, input.timestamp);

  // В снимок попадает только то, что кандидат передал для этой цели.
  const scoped: Partial<CandidatePassport> = {};
  const sharedSet = new Set(input.shared_fields);
  for (const [key, value] of Object.entries(profile.fields)) {
    if (input.shared_fields.length === 0 || sharedSet.has(key)) {
      (scoped as Record<string, unknown>)[key] = value;
    }
  }
  const scopedProfile: ProfileVersion = {
    snapshot_version: profile.snapshot_version,
    created_at: profile.created_at,
    fields: scoped,
    checksum: checksum({
      snapshot_version: profile.snapshot_version,
      created_at: profile.created_at,
      fields: scoped,
    }),
  };

  const body = {
    snapshot_version: SNAPSHOT_VERSION,
    timestamp: input.timestamp,
    candidate_profile_snapshot: scopedProfile,
    vacancy_requirements_snapshot: input.criteria,
    match_explanation_snapshot: input.explanation,
    visibility_state_snapshot: visibilityStateSnapshot(
      input.policy,
      input.reveal_level,
      input.shared_fields,
    ),
  };

  assertNoAggregateScore(body);
  assertNoInviteHistorySignal(body);

  return { ...body, checksum: checksum(body) };
}

/** Снимок не изменился, если контрольная сумма совпадает с пересчитанной. */
export function isSnapshotIntact(snapshot: ApplicationProfileSnapshot): boolean {
  const { checksum: stored, ...body } = snapshot;
  return checksum(body) === stored;
}

/**
 * Проекция снимка для показа работодателю: снимок хранит переданные поля,
 * но уровень раскрытия на момент события всё равно ограничивает вывод.
 */
export function snapshotIsWithinRevealLevel(
  snapshot: ApplicationProfileSnapshot,
  view: PassportView,
): boolean {
  return snapshot.visibility_state_snapshot.reveal_level === view.level;
}

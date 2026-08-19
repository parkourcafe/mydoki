import type { Locale } from "./i18n";
import type { CandidatePassport, SearchIntent } from "./passport";
import { acceptsNewOpportunities } from "./passport.ts";
import type { PurposeAuthorization, TalentPoolMembership } from "./talentPool";
import { authorizationCovers, isMembershipDiscoverable } from "./talentPool.ts";

// ==================== Видимость и confidential discovery ==============
// v1.2 §8.5, §8.8, §13.5, §16.
//
// Жёсткие границы:
//   • Профиль остаётся закрытым, пока человек явно не выбрал другой режим
//     видимости (§17.12). Дефолт — `private`.
//   • Личность, контакты, текущий работодатель и документы не раскрываются
//     до purpose-bound разрешения кандидата (§16).
//   • Блокировка организации абсолютна для discovery и приглашений.
//   • Абсолютная анонимность не обещается: UI обязан предупреждать о
//     косвенной идентификации (§8.5).
//
// Модуль чистый: без БД и next/*.

// ---------------------------- Режимы видимости ------------------------

export type VisibilityMode =
  | "private"
  | "recommendations_only"
  | "invited_only"
  | "confidential_pool"
  | "discoverable_pool";

export const DEFAULT_VISIBILITY_MODE: VisibilityMode = "private";

/** Синонимы из брифа → канонические режимы v1.2 §8.5. */
const VISIBILITY_ALIASES: Record<string, VisibilityMode> = {
  private: "private",
  hidden: "private",
  recommendations_only: "recommendations_only",
  invited_only: "invited_only",
  confidential: "confidential_pool",
  confidential_pool: "confidential_pool",
  public_to_verified_employers: "discoverable_pool",
  discoverable_pool: "discoverable_pool",
};

export function normalizeVisibilityMode(raw: string | null | undefined): VisibilityMode {
  if (!raw) return DEFAULT_VISIBILITY_MODE;
  return VISIBILITY_ALIASES[raw.trim().toLowerCase()] ?? DEFAULT_VISIBILITY_MODE;
}

export type VisibilityPolicy = {
  mode: VisibilityMode;
  /** Скрывать текущего работодателя и не показываться его сотрудникам. */
  hide_current_employer: boolean;
  /** Названия/домены текущего и прежних работодателей, которых надо скрыть. */
  current_employer_names: string[];
  /** Field-level видимость: перечень полей, скрытых даже внутри разрешённого уровня. */
  hidden_fields: string[];
  blocked_organization_ids: string[];
  blocked_domains: string[];
  /**
   * Раскрытие личности всегда требует явного действия кандидата (double
   * opt-in). Поле оставлено для читаемости политики и аудита; выключить
   * double opt-in нельзя (§16).
   */
  approval_required_before_reveal: true;
};

export function defaultVisibilityPolicy(): VisibilityPolicy {
  return {
    mode: DEFAULT_VISIBILITY_MODE,
    hide_current_employer: true,
    current_employer_names: [],
    hidden_fields: [],
    blocked_organization_ids: [],
    blocked_domains: [],
    approval_required_before_reveal: true,
  };
}

// ---------------------------- Уровни раскрытия ------------------------

export type RevealLevel =
  /** Профиль не участвует в этом сценарии вообще. */
  | "none"
  /** Doki может показать возможность самому кандидату; работодатель — нет. */
  | "recommendation_only"
  /** Обезличенная разрешённая часть профиля (confidential pool). */
  | "blind"
  /** Разрешённые поля профиля без прямых идентификаторов (discoverable pool). */
  | "pool_fields"
  /** Кандидат принял знакомство: ограниченный ProfileAccessGrant. */
  | "introduced"
  /** Кандидат выполнил `Share & apply`: поля, переданные для этой цели. */
  | "shared";

export type DiscoveryDenyReason =
  | "organization_not_verified"
  | "organization_blocked"
  | "current_employer_hidden"
  | "membership_inactive"
  | "authorization_inactive"
  | "candidate_unavailable"
  | "visibility_private"
  | "invited_only"
  /** Профиль доступен только для candidate-facing рекомендаций (§8.8.3). */
  | "recommendations_only";

export type EmployerContext = {
  organization_id: string;
  organization_name: string;
  /** Домены организации — для блокировки известных аффилированных доменов. */
  domains: string[];
  /** Действующая верификация организации (§16). */
  verified: boolean;
};

export type DiscoveryDecision = {
  level: RevealLevel;
  reason: DiscoveryDenyReason | null;
};

function norm(value: string): string {
  return value.trim().toLowerCase();
}

function organizationBlocked(
  policy: VisibilityPolicy,
  employer: EmployerContext,
): boolean {
  if (policy.blocked_organization_ids.includes(employer.organization_id)) return true;
  const blockedDomains = policy.blocked_domains.map(norm);
  return employer.domains.some((d) => blockedDomains.includes(norm(d)));
}

function isCurrentEmployer(policy: VisibilityPolicy, employer: EmployerContext): boolean {
  if (!policy.hide_current_employer) return false;
  const names = policy.current_employer_names.map(norm);
  if (names.includes(norm(employer.organization_name))) return true;
  return employer.domains.some((d) => names.includes(norm(d)));
}

/**
 * Может ли конкретная организация обнаружить профиль и на каком уровне.
 * Порядок проверок — от абсолютных запретов к режиму видимости.
 */
export function discoveryDecision(input: {
  policy: VisibilityPolicy;
  membership: TalentPoolMembership;
  authorization: PurposeAuthorization | null;
  search_intent: SearchIntent;
  employer: EmployerContext;
  /** Кандидат уже принял знакомство от этой организации. */
  has_access_grant?: boolean;
  now: string;
}): DiscoveryDecision {
  const { policy, employer } = input;

  if (organizationBlocked(policy, employer)) {
    return { level: "none", reason: "organization_blocked" };
  }
  if (isCurrentEmployer(policy, employer)) {
    return { level: "none", reason: "current_employer_hidden" };
  }
  if (!employer.verified) {
    return { level: "none", reason: "organization_not_verified" };
  }
  if (policy.mode === "private") {
    return { level: "none", reason: "visibility_private" };
  }
  if (!acceptsNewOpportunities(input.search_intent)) {
    return { level: "none", reason: "candidate_unavailable" };
  }
  if (!isMembershipDiscoverable(input.membership, input.now)) {
    return { level: "none", reason: "membership_inactive" };
  }
  if (!authorizationCovers(input.authorization, "talent_pool_discovery", input.now)) {
    return { level: "none", reason: "authorization_inactive" };
  }
  if (input.has_access_grant) {
    return { level: "introduced", reason: null };
  }
  if (policy.mode === "invited_only") {
    return { level: "none", reason: "invited_only" };
  }
  if (policy.mode === "recommendations_only") {
    // Doki сопоставляет профиль и показывает возможность ТОЛЬКО кандидату.
    return { level: "recommendation_only", reason: null };
  }
  if (policy.mode === "confidential_pool") {
    return { level: "blind", reason: null };
  }
  return { level: "pool_fields", reason: null };
}

/** Работодатель видит хоть что-то только начиная с blind-уровня. */
export function employerCanSeeProfile(level: RevealLevel): boolean {
  return level === "blind" || level === "pool_fields" || level === "introduced" || level === "shared";
}

// ---------------------------- Проекция профиля ------------------------

/** Прямые идентификаторы. Не раскрываются до purpose-bound разрешения (§8.5). */
export const IDENTIFYING_FIELDS = [
  "full_name",
  "email",
  "contact",
  "phone",
  "whatsapp",
  "photo_url",
  "linkedin_url",
  "portfolio_url",
  "cv_file_path",
  "cv_document_id",
  "current_employer",
] as const;

/**
 * Поля, которые часто идентифицируют человека косвенно: свободный текст о
 * достижениях и проектах. В blind-режиме не показываются.
 */
export const INDIRECTLY_IDENTIFYING_FIELDS = [
  "key_achievements",
  "motivation",
  "role_preference",
  "preferred_environment",
] as const;

export type IdentityBlock = {
  full_name: string | null;
  email: string | null;
  contact: string | null;
  current_employer: string | null;
  cv_file_path: string | null;
  cv_document_id: string | null;
  linkedin_url: string | null;
  portfolio_url: string | null;
};

export type PassportView = {
  level: RevealLevel;
  /** Структурированные поля, доступные на этом уровне. */
  fields: Partial<CandidatePassport>;
  identity: Partial<IdentityBlock>;
  /** Что скрыто и почему — показывается работодателю честно. */
  withheld: string[];
};

/** Поля, участвующие в обязательных критериях: нужны на любом видимом уровне. */
const MATCHING_FIELDS: (keyof CandidatePassport)[] = [
  "profession",
  "role_taxonomy_code",
  "role_free_text",
  "seniority",
  "years_of_experience",
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
  "field_confirmations",
  "last_confirmed_at",
];

/** Дополнительный контекст, допустимый начиная с `pool_fields`. */
const CONTEXT_FIELDS: (keyof CandidatePassport)[] = [
  "management_experience",
  "team_size",
  "company_type_preference",
];

/** Свободный текст — только после принятого знакомства. */
const NARRATIVE_FIELDS: (keyof CandidatePassport)[] = [
  "key_achievements",
  "motivation",
  "preferred_environment",
  "role_preference",
];

/**
 * Проекция паспорта под уровень раскрытия и field-level настройки.
 * Единственная функция, формирующая employer-facing данные профиля.
 */
export function projectPassport(input: {
  passport: CandidatePassport;
  identity: IdentityBlock;
  level: RevealLevel;
  policy: VisibilityPolicy;
  /** Поля, явно разрешённые кандидатом для этой цели (Share & apply). */
  shared_fields?: string[];
}): PassportView {
  const { passport, identity, level, policy } = input;
  const withheld: string[] = [];
  const hidden = new Set(policy.hidden_fields);

  if (level === "none" || level === "recommendation_only") {
    return {
      level,
      fields: {},
      identity: {},
      withheld: ["*"],
    };
  }

  let allowed: (keyof CandidatePassport)[] = [...MATCHING_FIELDS];
  if (level === "pool_fields" || level === "introduced" || level === "shared") {
    allowed = allowed.concat(CONTEXT_FIELDS);
  }
  if (level === "introduced" || level === "shared") {
    allowed = allowed.concat(NARRATIVE_FIELDS);
  } else {
    withheld.push(...NARRATIVE_FIELDS);
  }

  if (level === "shared" && input.shared_fields) {
    const sharedSet = new Set(input.shared_fields);
    const before = allowed;
    allowed = allowed.filter((f) => sharedSet.has(f as string));
    withheld.push(
      ...before.filter((f) => !sharedSet.has(f as string)).map((f) => f as string),
    );
  }

  const fields: Partial<CandidatePassport> = {};
  for (const key of allowed) {
    if (hidden.has(key as string)) {
      withheld.push(key as string);
      continue;
    }
    (fields as Record<string, unknown>)[key] = passport[key];
  }

  // Личность и контакты — только после явного действия кандидата.
  const identityOut: Partial<IdentityBlock> = {};
  if (level === "shared") {
    const sharedSet = input.shared_fields ? new Set(input.shared_fields) : null;
    for (const key of Object.keys(identity) as (keyof IdentityBlock)[]) {
      if (hidden.has(key)) {
        withheld.push(key);
        continue;
      }
      if (sharedSet && !sharedSet.has(key)) {
        withheld.push(key);
        continue;
      }
      identityOut[key] = identity[key];
    }
  } else {
    withheld.push(...IDENTIFYING_FIELDS);
  }

  return { level, fields, identity: identityOut, withheld: [...new Set(withheld)] };
}

/**
 * Guardrail: на уровнях до `shared` в employer-facing проекции не должно
 * быть ни одного прямого идентификатора. Вызывается перед отдачей данных.
 */
export function assertNoIdentityLeak(view: PassportView): void {
  if (view.level === "shared") return;
  for (const key of Object.keys(view.identity)) {
    throw new Error(
      `identity leak at level "${view.level}": ${key} (v1.2 §16 — no reveal before purpose-bound authorization)`,
    );
  }
  if (view.level === "blind") {
    for (const key of INDIRECTLY_IDENTIFYING_FIELDS) {
      if (key in view.fields) {
        throw new Error(
          `indirect identifier leak at blind level: ${key} (v1.2 §8.5)`,
        );
      }
    }
  }
}

// ---------------------------- Предупреждение о косвенной идентификации -

/**
 * Doki не обещает абсолютную анонимность (§8.5). Возвращаем поля, сочетание
 * которых на небольшом рынке позволяет узнать человека, — UI обязан
 * показать предупреждение и дать их скрыть.
 */
export function indirectIdentificationRisk(
  passport: CandidatePassport,
  policy: VisibilityPolicy,
): { at_risk: boolean; fields: string[] } {
  const hidden = new Set(policy.hidden_fields);
  const fields: string[] = [];
  if (passport.key_achievements && !hidden.has("key_achievements")) {
    fields.push("key_achievements");
  }
  if (passport.team_size && !hidden.has("team_size")) fields.push("team_size");
  if (
    passport.seniority &&
    (passport.seniority === "head" || passport.seniority === "executive") &&
    !hidden.has("seniority")
  ) {
    fields.push("seniority");
  }
  if (passport.role_taxonomy_code && passport.current_location && !hidden.has("current_location")) {
    fields.push("current_location");
  }
  return { at_risk: fields.length >= 2, fields };
}

const RISK_NOTICE: Record<Locale, string> = {
  ru: "Doki не обещает полную анонимность: на небольшом рынке человека можно узнать по сочетанию роли, достижений и опыта. Скройте поля, которые вас выдают.",
  en: "Doki does not promise full anonymity: in a small market you can be recognised by the combination of role, achievements and experience. Hide the fields that give you away.",
  id: "Doki tidak menjanjikan anonimitas penuh: di pasar kecil Anda bisa dikenali dari kombinasi peran, pencapaian, dan pengalaman. Sembunyikan kolom yang membuat Anda mudah dikenali.",
  uz: "Doki to‘liq anonimlikni va’da qilmaydi: kichik bozorda rol, yutuqlar va tajriba uyg‘unligi bo‘yicha sizni tanib olish mumkin. Sizni oshkor qiladigan maydonlarni yashiring.",
};

export function identifiabilityNotice(locale: Locale): string {
  return RISK_NOTICE[locale];
}

const DENY_LABELS: Record<Locale, Record<DiscoveryDenyReason, string>> = {
  ru: {
    organization_not_verified: "организация не подтверждена",
    organization_blocked: "организация заблокирована кандидатом",
    current_employer_hidden: "скрыто от текущего работодателя",
    membership_inactive: "нет активного членства в пуле",
    authorization_inactive: "нет действующего разрешения",
    candidate_unavailable: "кандидат не рассматривает предложения",
    visibility_private: "профиль приватный",
    invited_only: "только по приглашению",
    recommendations_only: "профиль доступен только для рекомендаций кандидату",
  },
  en: {
    organization_not_verified: "organization is not verified",
    organization_blocked: "organization blocked by the candidate",
    current_employer_hidden: "hidden from the current employer",
    membership_inactive: "no active talent pool membership",
    authorization_inactive: "no active authorization",
    candidate_unavailable: "candidate is not considering offers",
    visibility_private: "profile is private",
    invited_only: "invitation only",
    recommendations_only: "candidate-facing recommendations only",
  },
  id: {
    organization_not_verified: "organisasi belum terverifikasi",
    organization_blocked: "organisasi diblokir kandidat",
    current_employer_hidden: "disembunyikan dari perusahaan saat ini",
    membership_inactive: "tidak ada keanggotaan pool aktif",
    authorization_inactive: "tidak ada izin aktif",
    candidate_unavailable: "kandidat tidak mempertimbangkan tawaran",
    visibility_private: "profil bersifat privat",
    invited_only: "hanya lewat undangan",
    recommendations_only: "hanya untuk rekomendasi ke kandidat",
  },
  uz: {
    organization_not_verified: "tashkilot tasdiqlanmagan",
    organization_blocked: "tashkilot nomzod tomonidan bloklangan",
    current_employer_hidden: "joriy ish beruvchidan yashirilgan",
    membership_inactive: "pulda faol a’zolik yo‘q",
    authorization_inactive: "amaldagi ruxsat yo‘q",
    candidate_unavailable: "nomzod takliflarni ko‘rmayapti",
    visibility_private: "profil yopiq",
    invited_only: "faqat taklif bo‘yicha",
    recommendations_only: "faqat nomzodga tavsiya uchun",
  },
};

export function denyReasonLabel(
  locale: Locale,
  reason: DiscoveryDenyReason | string,
): string {
  return DENY_LABELS[locale]?.[reason as DiscoveryDenyReason] ?? String(reason);
}

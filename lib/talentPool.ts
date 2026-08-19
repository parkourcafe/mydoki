import type { Locale } from "./i18n";

// ============================ Talent Pool =============================
// Always-on пул кандидатов (v1.2 §8.4, §8.8, §13.5).
//
// Жёсткие границы:
//   • Профиль не попадает в пул автоматически: нужен отдельный opt-in с
//     собственной целью обработки (§16).
//   • Разрешение на Talent Pool и разрешение на конкретный отклик — разные
//     purpose/scope и не переиспользуются (§13.5).
//   • Приглашение не является откликом: до принятия работодатель не видит
//     личность, контакты и документы (§7.3).
//   • Отказ от приглашения не становится свойством профиля (§17.14).
//   • Bulk export пула запрещён (§16).
//
// Модуль чистый: без БД и next/*.

// ---------------------------- Членство --------------------------------

export type MembershipState = "not_joined" | "active" | "paused" | "left" | "expired";

/** Синонимы из брифа → канонические значения v1.2 §8.4. */
const MEMBERSHIP_ALIASES: Record<string, MembershipState> = {
  not_joined: "not_joined",
  joined: "active",
  active: "active",
  paused: "paused",
  removed: "left",
  left: "left",
  expired: "expired",
};

export function normalizeMembershipState(raw: string | null | undefined): MembershipState {
  if (!raw) return "not_joined";
  return MEMBERSHIP_ALIASES[raw.trim().toLowerCase()] ?? "not_joined";
}

const MEMBERSHIP_TRANSITIONS: Record<MembershipState, MembershipState[]> = {
  not_joined: ["active"],
  active: ["paused", "left", "expired"],
  paused: ["active", "left", "expired"],
  left: ["active"],
  expired: ["active", "left"],
};

export function canTransitionMembership(
  from: MembershipState,
  to: MembershipState,
): boolean {
  return MEMBERSHIP_TRANSITIONS[from]?.includes(to) ?? false;
}

export type TalentPoolMembership = {
  state: MembershipState;
  joined_at: string | null;
  /** Срок действия разрешения на discovery. */
  expires_at: string | null;
  last_confirmed_at: string | null;
};

/**
 * Просроченное членство автоматически ставится на паузу (`expired`), но
 * профиль не удаляется и search intent человека не меняется (§8.4).
 */
export function membershipAtTime(
  membership: TalentPoolMembership,
  now: string,
): MembershipState {
  if (membership.state !== "active") return membership.state;
  if (!membership.expires_at) return "active";
  return Date.parse(membership.expires_at) <= Date.parse(now) ? "expired" : "active";
}

export function isMembershipDiscoverable(
  membership: TalentPoolMembership,
  now: string,
): boolean {
  return membershipAtTime(membership, now) === "active";
}

// ---------------------------- PurposeAuthorization --------------------

export type AuthorizationPurpose =
  | "talent_pool_discovery"
  | "opportunity_introduction"
  | "application";

/**
 * Конкретный legal basis определяется юрисдикцией и сценарием; интерфейс не
 * должен называть любое основание «согласием» автоматически (§13.5).
 */
export type LegalBasis = "consent" | "legitimate_interest" | "contract";

export type PurposeAuthorization = {
  purpose: AuthorizationPurpose;
  /** Кому разрешён доступ: `verified_employers` или конкретная организация. */
  audience: "verified_employers" | "organization";
  audience_organization_id: string | null;
  /** Поля, разрешённые к раскрытию в рамках этой цели. */
  scope_fields: string[];
  legal_basis: LegalBasis;
  notice_version: string;
  granted_at: string;
  expires_at: string | null;
  revoked_at: string | null;
};

export function isAuthorizationActive(
  auth: PurposeAuthorization | null | undefined,
  now: string,
): boolean {
  if (!auth) return false;
  if (auth.revoked_at) return false;
  if (auth.expires_at && Date.parse(auth.expires_at) <= Date.parse(now)) return false;
  return Date.parse(auth.granted_at) <= Date.parse(now);
}

/** Consent receipt создаётся только когда применимое основание — consent (§7.3). */
export function requiresConsentReceipt(auth: PurposeAuthorization): boolean {
  return auth.legal_basis === "consent";
}

/**
 * Разрешение одной цели никогда не покрывает другую: вступление в пул не
 * включается вместе с обычным откликом и наоборот (§13.5).
 */
export function authorizationCovers(
  auth: PurposeAuthorization | null | undefined,
  purpose: AuthorizationPurpose,
  now: string,
): boolean {
  return isAuthorizationActive(auth, now) && auth!.purpose === purpose;
}

// ---------------------------- Anti-differencing -----------------------

/**
 * Минимальный размер когорты для любого агрегированного ответа работодателю
 * (§8.8.3). Меньше порога — результат подавляется целиком, а не округляется.
 */
export const MIN_COHORT_SIZE = 5;

/** Шаг округления, чтобы последовательные фильтры не выделяли человека. */
export const COHORT_BUCKET = 5;

export type CohortDisclosure =
  | { visible: false; reason: "below_min_cohort" }
  | { visible: true; bucket_from: number; bucket_to: number | null };

export function cohortDisclosure(count: number): CohortDisclosure {
  if (count < MIN_COHORT_SIZE) return { visible: false, reason: "below_min_cohort" };
  const from = Math.floor(count / COHORT_BUCKET) * COHORT_BUCKET;
  return { visible: true, bucket_from: from, bucket_to: from + COHORT_BUCKET };
}

/** Лимит приглашений на организацию в сутки — защита от массового обхода пула. */
export const INVITE_RATE_LIMIT_PER_DAY = 25;

// ---------------------------- Opportunity Invite ----------------------

export type InviteState =
  | "sent"
  | "viewed"
  | "accepted"
  | "declined"
  | "expired"
  | "withdrawn";

export type OpportunityInvite = {
  id: string;
  /** Организация обязана быть verified на момент отправки (§8.8.4). */
  organization_id: string;
  organization_name: string;
  vacancy_version_id: string;
  role_title: string;
  location: string | null;
  work_format: string | null;
  compensation_range: string | null;
  /** Цель доступа к данным — обязательная часть приглашения. */
  access_purpose: string;
  respond_by: string | null;
  /** Blind = работодатель не видит личность до принятия. */
  blind: boolean;
  state: InviteState;
  created_at: string;
  responded_at: string | null;
};

const INVITE_TRANSITIONS: Record<InviteState, InviteState[]> = {
  sent: ["viewed", "accepted", "declined", "expired", "withdrawn"],
  viewed: ["accepted", "declined", "expired", "withdrawn"],
  accepted: [],
  declined: [],
  expired: [],
  withdrawn: [],
};

export function canTransitionInvite(from: InviteState, to: InviteState): boolean {
  return INVITE_TRANSITIONS[from]?.includes(to) ?? false;
}

export function canRespondToInvite(state: InviteState): boolean {
  return state === "sent" || state === "viewed";
}

/**
 * Приглашение нельзя отправить, пока в нём не раскрыты организация, роль,
 * условия и цель обработки данных (§8.8.4).
 */
export function missingInviteDisclosures(
  invite: Pick<
    OpportunityInvite,
    | "organization_name"
    | "role_title"
    | "location"
    | "work_format"
    | "compensation_range"
    | "access_purpose"
    | "respond_by"
  >,
): string[] {
  const required: (keyof typeof invite)[] = [
    "organization_name",
    "role_title",
    "location",
    "work_format",
    "compensation_range",
    "access_purpose",
    "respond_by",
  ];
  return required.filter((key) => {
    const value = invite[key];
    return value === null || value === undefined || String(value).trim() === "";
  }) as string[];
}

/**
 * Реакция на приглашение — событие переписки, а не свойство человека.
 * Эти ключи не должны появляться в профиле или во входных данных matching
 * (§17.14: отказ не становится негативным сигналом).
 */
export const FORBIDDEN_PROFILE_SIGNAL_KEYS = [
  "declined_count",
  "decline_rate",
  "ignored_count",
  "response_rate",
  "invite_history",
  "reputation",
  "responsiveness",
];

export function assertNoInviteHistorySignal(value: unknown, path = "$"): void {
  if (value === null || typeof value !== "object") return;
  if (Array.isArray(value)) {
    value.forEach((item, i) => assertNoInviteHistorySignal(item, `${path}[${i}]`));
    return;
  }
  for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
    if (FORBIDDEN_PROFILE_SIGNAL_KEYS.includes(key.toLowerCase())) {
      throw new Error(
        `invite outcome must not become a profile signal: ${path}.${key} (v1.2 §17.14)`,
      );
    }
    assertNoInviteHistorySignal(child, `${path}.${key}`);
  }
}

// ---------------------------- Метки ------------------------------------

const MEMBERSHIP_LABELS: Record<Locale, Record<MembershipState, string>> = {
  ru: {
    not_joined: "Не в пуле",
    active: "В пуле",
    paused: "На паузе",
    left: "Вышел из пула",
    expired: "Разрешение истекло",
  },
  en: {
    not_joined: "Not in the pool",
    active: "In the pool",
    paused: "Paused",
    left: "Left the pool",
    expired: "Permission expired",
  },
  id: {
    not_joined: "Belum bergabung",
    active: "Bergabung",
    paused: "Dijeda",
    left: "Keluar dari pool",
    expired: "Izin kedaluwarsa",
  },
  uz: {
    not_joined: "Pulda emas",
    active: "Pulda",
    paused: "Pauzada",
    left: "Puldan chiqqan",
    expired: "Ruxsat muddati tugagan",
  },
};

export function membershipLabel(
  locale: Locale,
  state: MembershipState | string,
): string {
  return (
    MEMBERSHIP_LABELS[locale]?.[normalizeMembershipState(String(state))] ?? String(state)
  );
}

const INVITE_LABELS: Record<Locale, Record<InviteState, string>> = {
  ru: {
    sent: "Отправлено",
    viewed: "Просмотрено",
    accepted: "Принято знакомство",
    declined: "Отклонено",
    expired: "Истекло",
    withdrawn: "Отозвано",
  },
  en: {
    sent: "Sent",
    viewed: "Viewed",
    accepted: "Introduction accepted",
    declined: "Declined",
    expired: "Expired",
    withdrawn: "Withdrawn",
  },
  id: {
    sent: "Terkirim",
    viewed: "Dilihat",
    accepted: "Perkenalan diterima",
    declined: "Ditolak",
    expired: "Kedaluwarsa",
    withdrawn: "Ditarik",
  },
  uz: {
    sent: "Yuborilgan",
    viewed: "Ko‘rilgan",
    accepted: "Tanishuv qabul qilindi",
    declined: "Rad etilgan",
    expired: "Muddati tugagan",
    withdrawn: "Qaytarib olingan",
  },
};

export function inviteStateLabel(locale: Locale, state: InviteState | string): string {
  return INVITE_LABELS[locale]?.[state as InviteState] ?? String(state);
}

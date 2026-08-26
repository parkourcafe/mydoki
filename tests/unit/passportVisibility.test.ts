// Юнит-тесты видимости и confidential discovery (v1.2 §8.5, §8.8, §16).
// Запуск: npm run test:unit

import { test } from "node:test";
import assert from "node:assert/strict";

import { emptyPassport, type CandidatePassport } from "../../lib/passport.ts";
import {
  DEFAULT_VISIBILITY_MODE,
  IDENTIFYING_FIELDS,
  assertNoIdentityLeak,
  defaultVisibilityPolicy,
  denyReasonLabel,
  discoveryDecision,
  employerCanSeeProfile,
  identifiabilityNotice,
  indirectIdentificationRisk,
  normalizeVisibilityMode,
  projectPassport,
  type EmployerContext,
  type IdentityBlock,
  type VisibilityPolicy,
} from "../../lib/passportVisibility.ts";
import {
  MIN_COHORT_SIZE,
  assertNoInviteHistorySignal,
  canRespondToInvite,
  canTransitionInvite,
  canTransitionMembership,
  cohortDisclosure,
  isMembershipDiscoverable,
  membershipAtTime,
  missingInviteDisclosures,
  normalizeMembershipState,
  type PurposeAuthorization,
  type TalentPoolMembership,
} from "../../lib/talentPool.ts";

const NOW = "2026-08-19T00:00:00.000Z";

const passport: CandidatePassport = {
  ...emptyPassport(),
  profession: "Operations manager",
  role_taxonomy_code: "ops_manager",
  seniority: "head",
  years_of_experience: 12,
  current_location: "Bali, Indonesia",
  languages: [{ code: "en", level: "C1" }],
  salary_expectation: { min: 3000, max: 4000, currency: "USD", period: "month" },
  notice_period_days: 14,
  management_experience: true,
  team_size: 18,
  key_achievements: "Запустил операционный хаб PT Contoh Bali",
  motivation: "Хочу вырасти до COO",
  search_intent: "open",
};

const identity: IdentityBlock = {
  full_name: "Ivan Petrov",
  email: "ivan@example.test",
  contact: "+62 800 000 0000",
  current_employer: "PT Contoh Bali",
  cv_file_path: "u/1/cv.pdf",
  cv_document_id: "doc-1",
  linkedin_url: "https://example.test/in/ivan",
  portfolio_url: "https://example.test/ivan",
};

const membership: TalentPoolMembership = {
  state: "active",
  joined_at: "2026-08-01T00:00:00.000Z",
  expires_at: "2027-08-01T00:00:00.000Z",
  last_confirmed_at: "2026-08-01T00:00:00.000Z",
};

const authorization: PurposeAuthorization = {
  purpose: "talent_pool_discovery",
  audience: "verified_employers",
  audience_organization_id: null,
  scope_fields: ["profession", "seniority", "current_location"],
  legal_basis: "consent",
  notice_version: "2026-08-01",
  granted_at: "2026-08-01T00:00:00.000Z",
  expires_at: "2027-08-01T00:00:00.000Z",
  revoked_at: null,
};

const employer: EmployerContext = {
  organization_id: "org-1",
  organization_name: "PT Pencari Kerja",
  domains: ["pencari.example"],
  verified: true,
};

function policy(overrides: Partial<VisibilityPolicy> = {}): VisibilityPolicy {
  return { ...defaultVisibilityPolicy(), mode: "discoverable_pool", ...overrides };
}

function decide(overrides: {
  policy?: VisibilityPolicy;
  employer?: EmployerContext;
  membership?: TalentPoolMembership;
  authorization?: PurposeAuthorization | null;
  search_intent?: CandidatePassport["search_intent"];
  has_access_grant?: boolean;
} = {}) {
  return discoveryDecision({
    policy: overrides.policy ?? policy(),
    membership: overrides.membership ?? membership,
    authorization:
      overrides.authorization === undefined ? authorization : overrides.authorization,
    search_intent: overrides.search_intent ?? "open",
    employer: overrides.employer ?? employer,
    has_access_grant: overrides.has_access_grant,
    now: NOW,
  });
}

test("по умолчанию профиль приватный и не обнаруживается", () => {
  assert.equal(DEFAULT_VISIBILITY_MODE, "private");
  assert.equal(defaultVisibilityPolicy().mode, "private");
  const decision = decide({ policy: defaultVisibilityPolicy() });
  assert.equal(decision.level, "none");
  assert.equal(decision.reason, "visibility_private");
  assert.equal(employerCanSeeProfile(decision.level), false);
});

test("режимы видимости: синонимы брифа приводятся к канону v1.2 §8.5", () => {
  assert.equal(normalizeVisibilityMode("confidential"), "confidential_pool");
  assert.equal(
    normalizeVisibilityMode("public_to_verified_employers"),
    "discoverable_pool",
  );
  assert.equal(normalizeVisibilityMode(null), "private");
  assert.equal(normalizeVisibilityMode("нечто"), "private");
});

test("неподтверждённая организация не получает discovery", () => {
  const decision = decide({ employer: { ...employer, verified: false } });
  assert.equal(decision.level, "none");
  assert.equal(decision.reason, "organization_not_verified");
});

test("заблокированная организация не видит профиль ни при каких настройках", () => {
  const byId = decide({ policy: policy({ blocked_organization_ids: ["org-1"] }) });
  assert.equal(byId.level, "none");
  assert.equal(byId.reason, "organization_blocked");

  // Блокировка по известному домену аффилированного лица.
  const byDomain = decide({ policy: policy({ blocked_domains: ["PENCARI.example"] }) });
  assert.equal(byDomain.level, "none");
  assert.equal(byDomain.reason, "organization_blocked");

  // Даже если кандидат уже принял знакомство ранее — блокировка абсолютна.
  const withGrant = decide({
    policy: policy({ blocked_organization_ids: ["org-1"] }),
    has_access_grant: true,
  });
  assert.equal(withGrant.level, "none");
});

test("текущий работодатель не видит профиль", () => {
  const byName = decide({
    policy: policy({ current_employer_names: ["PT Contoh Bali"] }),
    employer: { ...employer, organization_name: "pt contoh bali" },
  });
  assert.equal(byName.reason, "current_employer_hidden");

  const byDomain = decide({
    policy: policy({ current_employer_names: ["contoh.example"] }),
    employer: { ...employer, domains: ["contoh.example"] },
  });
  assert.equal(byDomain.reason, "current_employer_hidden");

  // Кандидат может выключить это правило сам.
  const disabled = decide({
    policy: policy({
      hide_current_employer: false,
      current_employer_names: ["PT Contoh Bali"],
    }),
    employer: { ...employer, organization_name: "PT Contoh Bali" },
  });
  assert.equal(disabled.level, "pool_fields");
});

test("статус unavailable останавливает новые показы, членство остаётся", () => {
  const decision = decide({ search_intent: "unavailable" });
  assert.equal(decision.level, "none");
  assert.equal(decision.reason, "candidate_unavailable");
  assert.equal(membershipAtTime(membership, NOW), "active");
});

test("без активного членства и разрешения discovery невозможен", () => {
  assert.equal(
    decide({ membership: { ...membership, state: "paused" } }).reason,
    "membership_inactive",
  );
  assert.equal(decide({ authorization: null }).reason, "authorization_inactive");
  assert.equal(
    decide({ authorization: { ...authorization, revoked_at: NOW } }).reason,
    "authorization_inactive",
  );
  // Разрешение на отклик не покрывает discovery в пуле (§13.5).
  assert.equal(
    decide({ authorization: { ...authorization, purpose: "application" } }).reason,
    "authorization_inactive",
  );
});

test("истёкшее членство автоматически становится expired, профиль сохраняется", () => {
  const expired: TalentPoolMembership = {
    ...membership,
    expires_at: "2026-08-01T00:00:00.000Z",
  };
  assert.equal(membershipAtTime(expired, NOW), "expired");
  assert.equal(isMembershipDiscoverable(expired, NOW), false);
  assert.equal(normalizeMembershipState("joined"), "active");
  assert.equal(normalizeMembershipState("removed"), "left");
  assert.equal(canTransitionMembership("active", "paused"), true);
  assert.equal(canTransitionMembership("left", "paused"), false);
});

test("confidential profile: работодателю доступен только blind-уровень", () => {
  const decision = decide({ policy: policy({ mode: "confidential_pool" }) });
  assert.equal(decision.level, "blind");

  const view = projectPassport({
    passport,
    identity,
    level: decision.level,
    policy: policy({ mode: "confidential_pool" }),
  });
  assert.doesNotThrow(() => assertNoIdentityLeak(view));

  const serialized = JSON.stringify(view);
  for (const secret of [
    identity.full_name,
    identity.email,
    identity.contact,
    identity.current_employer,
    identity.cv_file_path,
    identity.linkedin_url,
    identity.portfolio_url,
  ]) {
    assert.ok(!serialized.includes(secret!), `утекло: ${secret}`);
  }
  // Косвенные идентификаторы (достижения, мотивация) в blind тоже скрыты.
  assert.ok(!("key_achievements" in view.fields));
  assert.ok(!("motivation" in view.fields));
  // Поля, нужные для обязательных критериев, остаются.
  assert.equal(view.fields.profession, "Operations manager");
  assert.equal(view.fields.current_location, "Bali, Indonesia");
  assert.ok(view.withheld.includes("key_achievements"));
});

test("recommendations_only: возможность видит только кандидат", () => {
  const decision = decide({ policy: policy({ mode: "recommendations_only" }) });
  assert.equal(decision.level, "recommendation_only");
  assert.equal(employerCanSeeProfile(decision.level), false);
  const view = projectPassport({
    passport,
    identity,
    level: decision.level,
    policy: policy({ mode: "recommendations_only" }),
  });
  assert.deepEqual(view.fields, {});
  assert.deepEqual(view.identity, {});
});

test("invited_only: без принятого знакомства профиль не показывается", () => {
  assert.equal(decide({ policy: policy({ mode: "invited_only" }) }).reason, "invited_only");
  const accepted = decide({
    policy: policy({ mode: "invited_only" }),
    has_access_grant: true,
  });
  assert.equal(accepted.level, "introduced");
});

test("double opt-in: личность раскрывается только на уровне shared", () => {
  const p = policy({ mode: "confidential_pool" });
  for (const level of ["blind", "pool_fields", "introduced"] as const) {
    const view = projectPassport({ passport, identity, level, policy: p });
    assert.deepEqual(view.identity, {}, `личность видна на уровне ${level}`);
    assert.doesNotThrow(() => assertNoIdentityLeak(view));
    for (const field of IDENTIFYING_FIELDS) {
      assert.ok(view.withheld.includes(field), `${field} не помечено как скрытое`);
    }
  }

  const shared = projectPassport({
    passport,
    identity,
    level: "shared",
    policy: p,
    shared_fields: [
      "full_name",
      "contact",
      "profession",
      "seniority",
      "current_location",
    ],
  });
  assert.equal(shared.identity.full_name, "Ivan Petrov");
  assert.equal(shared.identity.contact, "+62 800 000 0000");
  // Не переданные поля не раскрываются даже после `Share & apply`.
  assert.equal(shared.identity.email, undefined);
  assert.equal(shared.identity.cv_file_path, undefined);
  assert.equal(shared.fields.salary_expectation, undefined);
  assert.equal(shared.fields.profession, "Operations manager");
});

test("field-level видимость скрывает поле даже на разрешённом уровне", () => {
  const p = policy({ mode: "discoverable_pool", hidden_fields: ["salary_expectation"] });
  const view = projectPassport({ passport, identity, level: "pool_fields", policy: p });
  assert.equal(view.fields.salary_expectation, undefined);
  assert.ok(view.withheld.includes("salary_expectation"));
  assert.equal(view.fields.languages?.length, 1);
});

test("guardrail ловит попытку показать личность до разрешения", () => {
  const leaking = {
    level: "blind" as const,
    fields: {},
    identity: { full_name: "Ivan Petrov" },
    withheld: [],
  };
  assert.throws(() => assertNoIdentityLeak(leaking), /identity leak/);
  const indirect = {
    level: "blind" as const,
    fields: { key_achievements: "Запустил хаб PT Contoh Bali" },
    identity: {},
    withheld: [],
  };
  assert.throws(() => assertNoIdentityLeak(indirect), /indirect identifier leak/);
});

test("абсолютная анонимность не обещается: есть предупреждение и список рискованных полей", () => {
  const risk = indirectIdentificationRisk(passport, policy({ mode: "confidential_pool" }));
  assert.equal(risk.at_risk, true);
  assert.ok(risk.fields.includes("key_achievements"));
  assert.ok(risk.fields.includes("team_size"));
  for (const loc of ["ru", "en", "id", "uz"] as const) {
    assert.ok(identifiabilityNotice(loc).length > 40, `нет предупреждения для ${loc}`);
    assert.ok(denyReasonLabel(loc, "organization_blocked").length > 3);
  }
  // Скрытие полей снижает риск.
  const hidden = indirectIdentificationRisk(
    passport,
    policy({ hidden_fields: ["key_achievements", "team_size", "current_location"] }),
  );
  assert.equal(hidden.at_risk, false);
});

test("агрегаты подавляются ниже минимальной когорты и округляются выше", () => {
  assert.deepEqual(cohortDisclosure(MIN_COHORT_SIZE - 1), {
    visible: false,
    reason: "below_min_cohort",
  });
  assert.deepEqual(cohortDisclosure(0), { visible: false, reason: "below_min_cohort" });
  const disclosed = cohortDisclosure(12);
  assert.equal(disclosed.visible, true);
  assert.equal(disclosed.visible && disclosed.bucket_from, 10);
  assert.equal(disclosed.visible && disclosed.bucket_to, 15);
});

test("приглашение нельзя отправить без раскрытия условий и цели", () => {
  const incomplete = {
    organization_name: "PT Pencari Kerja",
    role_title: "Operations manager",
    location: "Bali",
    work_format: "hybrid",
    compensation_range: "",
    access_purpose: "",
    respond_by: null,
  };
  assert.deepEqual(missingInviteDisclosures(incomplete), [
    "compensation_range",
    "access_purpose",
    "respond_by",
  ]);
  assert.deepEqual(
    missingInviteDisclosures({
      ...incomplete,
      compensation_range: "2500–4000 USD",
      access_purpose: "Оценка соответствия роли Operations manager",
      respond_by: "2026-09-01T00:00:00.000Z",
    }),
    [],
  );
});

test("отказ от приглашения не становится свойством профиля", () => {
  assert.equal(canRespondToInvite("sent"), true);
  assert.equal(canRespondToInvite("declined"), false);
  assert.equal(canTransitionInvite("declined", "accepted"), false);
  assert.throws(
    () => assertNoInviteHistorySignal({ profile: { declined_count: 3 } }),
    /must not become a profile signal/,
  );
  assert.doesNotThrow(() => assertNoInviteHistorySignal({ profile: passport }));
});

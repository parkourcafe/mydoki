// Юнит-тесты неизменяемых снимков профиля (v1.2 §7.3, §10, §17.13).
// Запуск: npm run test:unit

import { test } from "node:test";
import assert from "node:assert/strict";

import { emptyPassport, type CandidatePassport } from "../../lib/passport.ts";
import { evaluateCriteria, type VacancyCriteria } from "../../lib/matching.ts";
import { defaultVisibilityPolicy } from "../../lib/passportVisibility.ts";
import {
  SNAPSHOT_VERSION,
  buildApplicationSnapshot,
  buildProfileVersion,
  checksum,
  isSnapshotIntact,
  stableStringify,
} from "../../lib/passportSnapshot.ts";

const NOW = "2026-08-19T00:00:00.000Z";
const LATER = "2026-09-19T00:00:00.000Z";

const passport: CandidatePassport = {
  ...emptyPassport(),
  profession: "Operations manager",
  role_taxonomy_code: "ops_manager",
  seniority: "senior",
  years_of_experience: 8,
  current_location: "Bali, Indonesia",
  work_format_preference: ["hybrid"],
  relocation_willingness: "no",
  work_authorization: [{ country: "ID", status: "work_permit", valid_until: null }],
  languages: [{ code: "en", level: "C1" }],
  salary_expectation: { min: 2500, max: 3500, currency: "USD", period: "month" },
  notice_period_days: 14,
  key_achievements: "Собрал операционную команду с нуля",
  search_intent: "open",
  last_confirmed_at: NOW,
  field_confirmations: {
    profession: { source: "candidate_declared", confirmed_at: NOW },
    current_location: { source: "candidate_declared", confirmed_at: NOW },
  },
};

const criteria: VacancyCriteria = {
  vacancy_version_id: "vv-7",
  hard: {
    location: "Bali",
    work_format: "hybrid",
    languages: [{ code: "en", min_level: "B2" }],
    salary_budget: { min: 2000, max: 4000, currency: "USD", period: "month" },
    start_within_days: 30,
    profession: "Operations manager",
    seniority: ["senior"],
  },
  soft: { achievements: "Опыт запуска операционной команды" },
};

function snapshot(overrides: Partial<Parameters<typeof buildApplicationSnapshot>[0]> = {}) {
  return buildApplicationSnapshot({
    passport,
    criteria,
    explanation: evaluateCriteria({
      criteria,
      passport,
      profile_version_id: "pv-1",
      now: NOW,
    }),
    policy: { ...defaultVisibilityPolicy(), mode: "confidential_pool" },
    reveal_level: "shared",
    shared_fields: [],
    timestamp: NOW,
    ...overrides,
  });
}

test("снимок содержит все четыре части и метку времени", () => {
  const s = snapshot();
  assert.equal(s.snapshot_version, SNAPSHOT_VERSION);
  assert.equal(s.timestamp, NOW);
  assert.ok(s.candidate_profile_snapshot);
  assert.ok(s.vacancy_requirements_snapshot);
  assert.ok(s.match_explanation_snapshot);
  assert.ok(s.visibility_state_snapshot);
  assert.equal(s.visibility_state_snapshot.mode, "confidential_pool");
  assert.equal(s.visibility_state_snapshot.reveal_level, "shared");
  assert.equal(s.candidate_profile_snapshot.fields.profession, "Operations manager");
  assert.equal(s.vacancy_requirements_snapshot.vacancy_version_id, "vv-7");
  assert.equal(s.match_explanation_snapshot?.vacancy_version_id, "vv-7");
});

test("правка паспорта после отклика не переписывает снимок", () => {
  const original = snapshot();
  const originalJson = JSON.stringify(original);

  // Кандидат передумал и изменил профиль.
  const changed: CandidatePassport = {
    ...passport,
    current_location: "Jakarta, Indonesia",
    salary_expectation: { min: 6000, max: 7000, currency: "USD", period: "month" },
    search_intent: "unavailable",
  };
  const newer = buildApplicationSnapshot({
    passport: changed,
    criteria,
    explanation: null,
    policy: defaultVisibilityPolicy(),
    reveal_level: "shared",
    shared_fields: [],
    timestamp: LATER,
  });

  // Старый снимок остался прежним, новый — отдельная запись.
  assert.equal(JSON.stringify(original), originalJson);
  assert.equal(original.candidate_profile_snapshot.fields.current_location, "Bali, Indonesia");
  assert.equal(newer.candidate_profile_snapshot.fields.current_location, "Jakarta, Indonesia");
  assert.notEqual(original.checksum, newer.checksum);
});

test("контрольная сумма ловит подмену сохранённого снимка", () => {
  const s = snapshot();
  assert.equal(isSnapshotIntact(s), true);
  const tampered = {
    ...s,
    candidate_profile_snapshot: {
      ...s.candidate_profile_snapshot,
      fields: { ...s.candidate_profile_snapshot.fields, seniority: "executive" as const },
    },
  };
  assert.equal(isSnapshotIntact(tampered), false);
});

test("сериализация детерминирована независимо от порядка ключей", () => {
  assert.equal(stableStringify({ b: 1, a: 2 }), stableStringify({ a: 2, b: 1 }));
  assert.equal(checksum({ b: 1, a: 2 }), checksum({ a: 2, b: 1 }));
  assert.notEqual(checksum({ a: 1 }), checksum({ a: 2 }));
  // undefined не участвует в снимке, null — участвует.
  assert.equal(stableStringify({ a: undefined, b: null }), '{"b":null}');
});

test("в снимок попадают только переданные для этой цели поля", () => {
  const s = snapshot({
    shared_fields: ["profession", "seniority", "languages"],
    reveal_level: "shared",
  });
  const fields = s.candidate_profile_snapshot.fields;
  assert.equal(fields.profession, "Operations manager");
  assert.equal(fields.seniority, "senior");
  assert.ok(fields.languages);
  assert.equal("salary_expectation" in fields, false);
  assert.equal("key_achievements" in fields, false);
  assert.deepEqual(s.visibility_state_snapshot.shared_fields, [
    "languages",
    "profession",
    "seniority",
  ]);
});

test("снимок не может содержать совокупный балл или скрытые веса", () => {
  assert.throws(
    () =>
      snapshot({
        criteria: {
          ...criteria,
          // Попытка протащить scorecard с весами в требования (§9 запрещает).
          soft: { ...criteria.soft, weight: 40 } as never,
        },
      }),
    /aggregate score forbidden/,
  );
  // Версия профиля собирается по белому списку полей: посторонний «рейтинг»
  // не попадает в снимок вообще.
  const version = buildProfileVersion({ ...passport, rating: 4.6 } as never, NOW);
  assert.equal("rating" in version.fields, false);
});

test("снимок не хранит историю реакций на приглашения", () => {
  const version = buildProfileVersion({ ...passport, declined_count: 2 } as never, NOW);
  assert.equal("declined_count" in version.fields, false);

  // Попытка занести реакции на приглашения через требования вакансии.
  assert.throws(
    () =>
      snapshot({
        criteria: { ...criteria, soft: { ...criteria.soft, response_rate: 0.2 } as never },
      }),
    /must not become a profile signal/,
  );
});

test("версия профиля стабильна: одинаковые данные — одинаковая контрольная сумма", () => {
  const a = buildProfileVersion(passport, NOW);
  const b = buildProfileVersion({ ...passport }, NOW);
  assert.equal(a.checksum, b.checksum);
  const c = buildProfileVersion(passport, LATER);
  assert.notEqual(a.checksum, c.checksum);
});

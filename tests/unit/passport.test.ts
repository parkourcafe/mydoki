// Юнит-тесты Candidate Passport (v1.2 §8.2–§8.4). Запуск: npm run test:unit

import { test } from "node:test";
import assert from "node:assert/strict";

import {
  QUICK_START_FIELDS,
  VOLATILE_FIELDS,
  acceptsNewOpportunities,
  applyAcceptedPrefill,
  emptyPassport,
  fieldsNeedingReconfirmation,
  isFieldStale,
  isPrefillSourceAllowed,
  isQuickStartComplete,
  isVerifiedProvenance,
  missingQuickStartFields,
  nextCompletionSteps,
  normalizeProvenance,
  normalizeSearchIntent,
  pendingPrefill,
  profileCompleteness,
  provenanceLabel,
  searchIntentLabel,
  type CandidatePassport,
  type PrefillSuggestion,
} from "../../lib/passport.ts";

const NOW = "2026-08-19T00:00:00.000Z";

/** Минимальный профиль первого шага (§8.3) — без вакансии и без CV. */
function quickStartPassport(): CandidatePassport {
  return {
    ...emptyPassport(),
    profession: "Operations manager",
    current_location: "Bali, Indonesia",
    seniority: "senior",
    languages: [{ code: "en", level: "C1" }],
    salary_expectation: { min: 2500, max: 3500, currency: "USD", period: "month" },
    search_intent: "open",
    work_format_preference: ["hybrid", "remote"],
    last_confirmed_at: NOW,
  };
}

test("минимальный профиль создаётся без вакансии и без CV", () => {
  const passport = quickStartPassport();
  assert.equal(isQuickStartComplete(passport), true);
  assert.deepEqual(missingQuickStartFields(passport), []);
  // CV не является условием создания профиля (§8.2 — matching не по CV).
  assert.equal(passport.cv_file_path, null);
});

test("первый шаг — ровно 7 полей и не длиннее", () => {
  assert.equal(QUICK_START_FIELDS.length, 7);
  const empty = emptyPassport();
  // search_intent всегда имеет значение по умолчанию, поэтому в пустом
  // профиле не хватает 6 полей.
  assert.deepEqual(missingQuickStartFields(empty), [
    "profession",
    "current_location",
    "seniority",
    "languages",
    "salary_expectation",
    "work_format_preference",
  ]);
  assert.equal(isQuickStartComplete(empty), false);
});

test("свободное описание роли (`Other role`) заменяет профессию", () => {
  const passport = { ...quickStartPassport(), profession: null, role_free_text: "Ops + community, ищу смежную роль" };
  assert.equal(isQuickStartComplete(passport), true);
});

test("search intent: active/open/unavailable и остановка новых предложений", () => {
  assert.equal(normalizeSearchIntent("active"), "active");
  assert.equal(normalizeSearchIntent("ACTIVE"), "active");
  assert.equal(normalizeSearchIntent("garbage"), "open");
  assert.equal(acceptsNewOpportunities("active"), true);
  assert.equal(acceptsNewOpportunities("open"), true);
  // `unavailable` останавливает новые рекомендации и приглашения (§8.4).
  assert.equal(acceptsNewOpportunities("unavailable"), false);
  for (const loc of ["ru", "en", "id", "uz"] as const) {
    for (const intent of ["active", "open", "unavailable"] as const) {
      const label = searchIntentLabel(loc, intent);
      assert.ok(label && label !== intent, `нет метки ${loc}/${intent}`);
    }
  }
});

test("полнота профиля растёт и подсказывает следующий шаг, но не ранжирует людей", () => {
  const short = profileCompleteness(quickStartPassport());
  const rich = profileCompleteness({
    ...quickStartPassport(),
    years_of_experience: 8,
    role_taxonomy_code: "ops_manager",
    preferred_locations: ["Jakarta"],
    management_experience: true,
    team_size: 18,
    key_achievements: "Собрал операционную команду с нуля",
    relocation_willingness: "yes",
    notice_period_days: 14,
    work_authorization: [{ country: "ID", status: "work_permit", valid_until: null }],
  });
  assert.ok(rich.percent > short.percent);
  assert.ok(rich.percent <= 100 && short.percent >= 0);

  // Сначала предлагаем то, что улучшает объяснимость обязательных критериев.
  const next = nextCompletionSteps(quickStartPassport(), 3);
  assert.ok(next.length > 0);
  const hardFirst = ["work_authorization", "relocation_willingness", "notice_period_days"];
  assert.ok(hardFirst.includes(next[0] as string), `первым предложено ${next[0]}`);
});

test("происхождение факта: синонимы брифа приводятся к канону v1.2", () => {
  assert.equal(normalizeProvenance("candidate_stated"), "candidate_declared");
  assert.equal(normalizeProvenance("document_extracted"), "extracted_from_candidate_file");
  assert.equal(normalizeProvenance("employer_verified"), "employer_confirmed");
  assert.equal(normalizeProvenance("platform_verified"), "externally_verified");
  assert.equal(normalizeProvenance(null), "unknown");
  assert.equal(normalizeProvenance("что-то своё"), "unknown");
});

test("заявленное и извлечённое не показывается как verified", () => {
  assert.equal(isVerifiedProvenance("candidate_declared"), false);
  assert.equal(isVerifiedProvenance("extracted_from_candidate_file"), false);
  assert.equal(isVerifiedProvenance("employer_confirmed"), true);
  assert.equal(isVerifiedProvenance("externally_verified"), true);
  for (const loc of ["ru", "en", "id", "uz"] as const) {
    assert.ok(provenanceLabel(loc, "candidate_stated").length > 3);
  }
});

test("устаревшие данные помечаются, а не превращаются в несоответствие", () => {
  // Изменчивые поля живут 90 дней, остальные — 180.
  assert.equal(isFieldStale("current_location", "2026-08-01T00:00:00.000Z", NOW), false);
  assert.equal(isFieldStale("current_location", "2026-01-01T00:00:00.000Z", NOW), true);
  assert.equal(isFieldStale("key_achievements", "2026-05-01T00:00:00.000Z", NOW), false);
  // Без даты подтверждения поле считается неактуальным.
  assert.equal(isFieldStale("salary_expectation", null, NOW), true);

  const stale: CandidatePassport = {
    ...quickStartPassport(),
    notice_period_days: 14,
    field_confirmations: {
      current_location: { source: "candidate_declared", confirmed_at: "2026-01-01T00:00:00.000Z" },
      notice_period_days: { source: "candidate_declared", confirmed_at: NOW },
    },
  };
  const needs = fieldsNeedingReconfirmation(stale, NOW);
  assert.ok(needs.includes("current_location"));
  assert.ok(!needs.includes("notice_period_days"));
  // Незаполненные изменчивые поля не требуют переподтверждения.
  assert.ok(!needs.includes("work_authorization"));
  assert.ok(VOLATILE_FIELDS.includes("salary_expectation"));
});

test("prefill: непринятая подсказка не попадает в паспорт", () => {
  const suggestions: PrefillSuggestion[] = [
    {
      field: "years_of_experience",
      value: 8,
      source: "extracted_from_candidate_file",
      accepted: true,
    },
    {
      field: "team_size",
      value: 18,
      source: "extracted_from_candidate_file",
      accepted: false,
    },
  ];
  const applied = applyAcceptedPrefill(quickStartPassport(), suggestions, NOW);
  assert.equal(applied.years_of_experience, 8);
  assert.equal(applied.team_size, null);
  assert.equal(
    applied.field_confirmations.years_of_experience.source,
    "extracted_from_candidate_file",
  );
  assert.equal(applied.field_confirmations.years_of_experience.confirmed_at, NOW);
  assert.equal(pendingPrefill(suggestions).length, 1);
});

test("prefill из непредоставленного кандидатом источника запрещён", () => {
  assert.equal(isPrefillSourceAllowed("extracted_from_candidate_file"), true);
  assert.equal(isPrefillSourceAllowed("candidate_declared"), true);
  // Внешняя «проверка» не может быть источником автозаполнения профиля.
  assert.equal(isPrefillSourceAllowed("externally_verified"), false);
  const applied = applyAcceptedPrefill(
    quickStartPassport(),
    [{ field: "team_size", value: 40, source: "externally_verified", accepted: true }],
    NOW,
  );
  assert.equal(applied.team_size, null);
});

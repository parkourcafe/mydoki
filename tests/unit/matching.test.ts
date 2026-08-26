// Юнит-тесты объяснимого сопоставления без совокупного балла
// (v1.2 §8.6–§8.7, §16). Запуск: npm run test:unit

import { test } from "node:test";
import assert from "node:assert/strict";

import { emptyPassport, type CandidatePassport } from "../../lib/passport.ts";
import {
  ASSESSMENT_TTL_DAYS,
  HARD_CRITERIA,
  SOFT_SIGNALS,
  assertNoAggregateScore,
  coverageSentence,
  criterionLine,
  criterionStateLabel,
  evaluateCriteria,
  hasBlockingConflict,
  isAssessmentValid,
  normalizeCriterionState,
  openQuestions,
  orderForDisplay,
  type CriterionResult,
  type VacancyCriteria,
} from "../../lib/matching.ts";

const NOW = "2026-08-19T00:00:00.000Z";

function passport(overrides: Partial<CandidatePassport> = {}): CandidatePassport {
  const base: CandidatePassport = {
    ...emptyPassport(),
    profession: "Operations manager",
    role_taxonomy_code: "ops_manager",
    seniority: "senior",
    years_of_experience: 8,
    current_location: "Bali, Indonesia",
    preferred_locations: ["Bali"],
    work_format_preference: ["hybrid", "on_site"],
    relocation_willingness: "no",
    work_authorization: [{ country: "ID", status: "work_permit", valid_until: null }],
    languages: [{ code: "en", level: "C1" }],
    salary_expectation: { min: 2500, max: 3500, currency: "USD", period: "month" },
    notice_period_days: 14,
    management_experience: true,
    team_size: 18,
    key_achievements: "Собрал операционную команду с нуля",
    last_confirmed_at: NOW,
  };
  const merged = { ...base, ...overrides };
  // По умолчанию все поля подтверждены сегодня — тесты про staleness задают
  // свои даты явно.
  if (!overrides.field_confirmations) {
    const confirmations: CandidatePassport["field_confirmations"] = {};
    for (const key of Object.keys(merged)) {
      confirmations[key] = { source: "candidate_declared", confirmed_at: NOW };
    }
    merged.field_confirmations = confirmations;
  }
  return merged;
}

function criteria(overrides: Partial<VacancyCriteria["hard"]> = {}): VacancyCriteria {
  return {
    vacancy_version_id: "vv-1",
    hard: {
      location: "Bali",
      work_format: "hybrid",
      work_eligibility_country: "ID",
      languages: [{ code: "en", min_level: "B2" }],
      salary_budget: { min: 2000, max: 4000, currency: "USD", period: "month" },
      start_within_days: 30,
      profession: "Operations manager",
      role_taxonomy_code: "ops_manager",
      seniority: ["senior", "lead"],
      relocation_required: false,
      ...overrides,
    },
    soft: {
      management_experience: true,
      achievements: "Опыт запуска операционной команды",
    },
  };
}

function byKey(results: CriterionResult[], key: string): CriterionResult {
  const found = results.find((r) => r.key === key);
  assert.ok(found, `нет критерия ${key}`);
  return found!;
}

test("вывод не содержит совокупного балла и процента совпадения", () => {
  const explanation = evaluateCriteria({
    criteria: criteria(),
    passport: passport(),
    profile_version_id: "pv-1",
    now: NOW,
  });
  assert.doesNotThrow(() => assertNoAggregateScore(explanation));
  const serialized = JSON.stringify(explanation);
  for (const forbidden of ["match_score", "\"score\"", "percent", "rank", "weight"]) {
    assert.ok(!serialized.includes(forbidden), `в выводе найдено «${forbidden}»`);
  }
  // Guardrail действительно срабатывает.
  assert.throws(() => assertNoAggregateScore({ candidate: { score: 87 } }), /aggregate score forbidden/);
  assert.throws(() => assertNoAggregateScore({ match_percent: 87 }), /aggregate score forbidden/);
});

test("покрытие требований считается по критериям, а не как рейтинг человека", () => {
  const explanation = evaluateCriteria({
    criteria: criteria(),
    passport: passport({ work_authorization: [{ country: "ID", status: "work_permit", valid_until: null }] }),
    profile_version_id: "pv-1",
    now: NOW,
  });
  const c = explanation.coverage.required;
  assert.equal(c.total, HARD_CRITERIA.length);
  assert.equal(c.met, 8);
  // Право на работу заявлено кандидатом → требует проверки, а не «met».
  assert.equal(c.needs_verification, 1);
  assert.equal(c.declared_conflict, 0);

  const sentence = coverageSentence("en", explanation);
  assert.equal(sentence, "Required criteria: 8 met, 1 needs_verification.");
  assert.ok(!sentence.includes("%"));
});

test("канонический пример §8.7: «семь из восьми», право на работу — needs_verification", () => {
  const explanation = evaluateCriteria({
    // Роль не требует переезда → критерий not_applicable, остаётся 8 обязательных.
    criteria: criteria({ relocation_required: null }),
    passport: passport(),
    profile_version_id: "pv-1",
    now: NOW,
  });
  const c = explanation.coverage.required;
  assert.equal(c.total, 8);
  assert.equal(c.met, 7);
  assert.equal(c.needs_verification, 1);
  assert.equal(c.not_applicable, 1);
  assert.equal(
    coverageSentence("en", explanation),
    "Required criteria: 7 met, 1 needs_verification.",
  );
});

test("пример из брифа: пропуск данных даёт unknown, без процента", () => {
  const explanation = evaluateCriteria({
    criteria: criteria({ relocation_required: null }),
    passport: passport({ notice_period_days: null }),
    profile_version_id: "pv-1",
    now: NOW,
  });
  const c = explanation.coverage.required;
  assert.equal(c.met, 6);
  assert.equal(c.unknown, 1);
  assert.equal(c.needs_verification, 1);
  assert.equal(c.not_applicable, 1);
  assert.equal(c.total, 8);
  const sentence = coverageSentence("ru", explanation);
  assert.equal(
    sentence,
    "Обязательные критерии: 6 met, 1 unknown, 1 needs_verification.",
  );
  assert.ok(!sentence.includes("%"));
});

test("нет данных → unknown, а не несоответствие", () => {
  const explanation = evaluateCriteria({
    criteria: criteria(),
    passport: passport({ languages: [], notice_period_days: null }),
    profile_version_id: "pv-1",
    now: NOW,
  });
  assert.equal(byKey(explanation.criteria, "languages").state, "unknown");
  assert.equal(byKey(explanation.criteria, "availability").state, "unknown");
  // Пробел не исключает человека из выдачи (§16).
  assert.equal(hasBlockingConflict(explanation), false);
  assert.equal(openQuestions(explanation).length >= 2, true);
});

test("устаревшее поле → unknown_stale, а не met и не конфликт", () => {
  const stale = passport({
    field_confirmations: {
      current_location: { source: "candidate_declared", confirmed_at: "2026-01-01T00:00:00.000Z" },
      languages: { source: "candidate_declared", confirmed_at: NOW },
      salary_expectation: { source: "candidate_declared", confirmed_at: NOW },
      notice_period_days: { source: "candidate_declared", confirmed_at: NOW },
      work_authorization: { source: "externally_verified", confirmed_at: NOW },
      work_format_preference: { source: "candidate_declared", confirmed_at: NOW },
      profession: { source: "candidate_declared", confirmed_at: NOW },
      seniority: { source: "candidate_declared", confirmed_at: NOW },
      relocation_willingness: { source: "candidate_declared", confirmed_at: NOW },
    },
  });
  const explanation = evaluateCriteria({
    criteria: criteria(),
    passport: stale,
    profile_version_id: "pv-1",
    now: NOW,
  });
  assert.equal(byKey(explanation.criteria, "location").state, "unknown_stale");
  assert.equal(hasBlockingConflict(explanation), false);
  // Внешне подтверждённое право на работу больше не требует проверки.
  assert.equal(byKey(explanation.criteria, "work_eligibility").state, "met");
});

test("заявленное несовпадение отмечается как declared_conflict и исключает из выдачи", () => {
  const explanation = evaluateCriteria({
    criteria: criteria(),
    passport: passport({
      languages: [{ code: "en", level: "A2" }],
      salary_expectation: { min: 6000, max: 7000, currency: "USD", period: "month" },
    }),
    profile_version_id: "pv-1",
    now: NOW,
  });
  assert.equal(byKey(explanation.criteria, "languages").state, "declared_conflict");
  assert.equal(byKey(explanation.criteria, "salary").state, "declared_conflict");
  assert.equal(hasBlockingConflict(explanation), true);
});

test("несравнимая валюта не выдумывает курс — критерий остаётся unknown", () => {
  const explanation = evaluateCriteria({
    criteria: criteria(),
    passport: passport({
      salary_expectation: { min: 40_000_000, max: 50_000_000, currency: "IDR", period: "month" },
    }),
    profile_version_id: "pv-1",
    now: NOW,
  });
  assert.equal(byKey(explanation.criteria, "salary").state, "unknown");
  assert.equal(byKey(explanation.criteria, "salary").reason, "not_comparable");
});

test("право на работу требует проверки, национальность как proxy не используется", () => {
  const declared = evaluateCriteria({
    criteria: criteria(),
    passport: passport(),
    profile_version_id: "pv-1",
    now: NOW,
  });
  const eligibility = byKey(declared.criteria, "work_eligibility");
  assert.equal(eligibility.state, "needs_verification");
  // Критерий строится на статусе разрешения, а не на гражданстве/национальности.
  assert.equal(eligibility.value.kind, "text");
  assert.match(JSON.stringify(eligibility.value), /work_permit/);

  const sponsorship = evaluateCriteria({
    criteria: criteria(),
    passport: passport({
      work_authorization: [{ country: "ID", status: "needs_sponsorship", valid_until: null }],
    }),
    profile_version_id: "pv-1",
    now: NOW,
  });
  assert.equal(byKey(sponsorship.criteria, "work_eligibility").state, "declared_conflict");
});

test("удалённая роль снимает географическое ограничение", () => {
  const explanation = evaluateCriteria({
    criteria: criteria({ location: "Jakarta", work_format: "remote" }),
    passport: passport({ work_format_preference: ["remote"] }),
    profile_version_id: "pv-1",
    now: NOW,
  });
  const location = byKey(explanation.criteria, "location");
  assert.equal(location.state, "met");
  assert.equal(location.reason, "remote_role");
});

test("готовность к переезду: `conditional` — это вопрос, а не отказ", () => {
  const explanation = evaluateCriteria({
    criteria: criteria({ location: "Jakarta", relocation_required: true }),
    passport: passport({ relocation_willingness: "conditional" }),
    profile_version_id: "pv-1",
    now: NOW,
  });
  assert.equal(byKey(explanation.criteria, "relocation").state, "unknown");
  assert.equal(byKey(explanation.criteria, "location").state, "unknown");
  assert.equal(hasBlockingConflict(explanation), false);
});

test("soft signals не создают конфликт и не исключают человека", () => {
  const explanation = evaluateCriteria({
    criteria: criteria(),
    passport: passport({ management_experience: false, team_size: null }),
    profile_version_id: "pv-1",
    now: NOW,
  });
  const soft = explanation.criteria.filter((c) => c.kind === "soft");
  assert.equal(soft.length, SOFT_SIGNALS.length);
  assert.ok(soft.every((c) => c.state !== "declared_conflict"));
  assert.equal(hasBlockingConflict(explanation), false);
});

test("CV не требуется для сопоставления: структурированные поля самодостаточны", () => {
  const withoutCv = passport({ cv_file_path: null, linkedin_url: null, portfolio_url: null });
  const withCv = passport({ cv_file_path: "u/1/cv.pdf", linkedin_url: "https://example.test/in/x" });
  const a = evaluateCriteria({ criteria: criteria(), passport: withoutCv, profile_version_id: "pv-1", now: NOW });
  const b = evaluateCriteria({ criteria: criteria(), passport: withCv, profile_version_id: "pv-1", now: NOW });
  assert.deepEqual(a.coverage, b.coverage);
  assert.deepEqual(
    a.criteria.map((c) => `${c.key}:${c.state}`),
    b.criteria.map((c) => `${c.key}:${c.state}`),
  );
});

test("оценка привязана к паре версий и имеет срок действия", () => {
  const explanation = evaluateCriteria({
    criteria: criteria(),
    passport: passport(),
    profile_version_id: "pv-42",
    now: NOW,
  });
  assert.equal(explanation.vacancy_version_id, "vv-1");
  assert.equal(explanation.profile_version_id, "pv-42");
  const beforeExpiry = new Date(Date.parse(NOW) + (ASSESSMENT_TTL_DAYS - 1) * 86_400_000).toISOString();
  const afterExpiry = new Date(Date.parse(NOW) + (ASSESSMENT_TTL_DAYS + 1) * 86_400_000).toISOString();
  assert.equal(isAssessmentValid(explanation, beforeExpiry), true);
  assert.equal(isAssessmentValid(explanation, afterExpiry), false);
  // Смена видимости/членства/блок-листа инвалидирует оценку.
  assert.equal(
    isAssessmentValid(explanation, beforeExpiry, "2026-08-19T10:00:00.000Z"),
    false,
  );
});

test("порядок показа детерминирован и не зависит от «качества» кандидата", () => {
  const items = [
    { id: "b", evaluated_at: "2026-08-01T00:00:00.000Z" },
    { id: "a", evaluated_at: "2026-08-19T00:00:00.000Z" },
    { id: "c", evaluated_at: "2026-08-19T00:00:00.000Z" },
  ];
  assert.deepEqual(
    orderForDisplay(items).map((i) => i.id),
    ["a", "c", "b"],
  );
  // Функция не принимает никаких весов и не читает содержимое критериев.
  assert.equal(orderForDisplay.length, 1);
});

test("состояния критерия локализованы и синонимы брифа нормализуются", () => {
  assert.equal(normalizeCriterionState("conflict"), "declared_conflict");
  assert.equal(normalizeCriterionState("stale"), "unknown_stale");
  assert.equal(normalizeCriterionState("met"), "met");
  assert.equal(normalizeCriterionState("странное"), "unknown");
  for (const loc of ["ru", "en", "id", "uz"] as const) {
    for (const state of [
      "met",
      "declared_conflict",
      "unknown",
      "unknown_stale",
      "needs_verification",
      "not_applicable",
    ] as const) {
      assert.ok(criterionStateLabel(loc, state).length > 2, `${loc}/${state}`);
    }
  }
});

test("строка объяснения показывает значение, статус и источник", () => {
  const explanation = evaluateCriteria({
    criteria: criteria(),
    passport: passport(),
    profile_version_id: "pv-1",
    now: NOW,
  });
  const line = criterionLine("en", byKey(explanation.criteria, "languages"));
  assert.match(line, /^Languages: EN C1 — met, candidate-stated$/);
  const availability = criterionLine("en", byKey(explanation.criteria, "availability"));
  assert.match(availability, /14 days/);
  assert.ok(!line.includes("%"));
});

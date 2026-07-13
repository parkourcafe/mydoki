// Юнит-тесты чистой логики vault (PR-1). Запуск:
//   node --test --experimental-strip-types tests/unit/
// Тестируем только функции без IO.

import { test } from "node:test";
import assert from "node:assert/strict";

import {
  evalExpiry,
  evalDateConsistency,
  evalNameMatch,
  normalizeName,
} from "../../lib/documentChecks.ts";
import { toCanonical, fromCanonical } from "../../lib/docTypes.ts";

const TODAY = "2026-07-12";

test("evalExpiry: нет даты → проверка не применима", () => {
  assert.equal(evalExpiry(null, TODAY), null);
  assert.equal(evalExpiry("", TODAY), null);
});

test("evalExpiry: дата в прошлом → mismatch, в будущем/сегодня → pass", () => {
  assert.equal(evalExpiry("2020-01-01", TODAY)?.result, "mismatch");
  assert.equal(evalExpiry("2999-01-01", TODAY)?.result, "pass");
  assert.equal(evalExpiry(TODAY, TODAY)?.result, "pass"); // сегодня ещё действует
});

test("evalDateConsistency: нет даты выдачи → не применимо", () => {
  assert.equal(evalDateConsistency(null, "2030-01-01", TODAY), null);
});

test("evalDateConsistency: выдан в будущем → mismatch", () => {
  assert.equal(
    evalDateConsistency("2999-01-01", null, TODAY)?.result,
    "mismatch"
  );
});

test("evalDateConsistency: выдан позже, чем истекает → mismatch", () => {
  assert.equal(
    evalDateConsistency("2025-05-01", "2024-05-01", TODAY)?.result,
    "mismatch"
  );
});

test("evalDateConsistency: нормальные даты → pass", () => {
  assert.equal(
    evalDateConsistency("2020-01-01", "2030-01-01", TODAY)?.result,
    "pass"
  );
});

test("normalizeName: регистр, порядок слов, ё→е", () => {
  assert.equal(normalizeName("Иванов Пётр"), normalizeName("пётр иванов"));
  assert.equal(normalizeName("Пётр"), normalizeName("Петр"));
  assert.equal(normalizeName("  John   DOE "), "doe john");
});

test("evalNameMatch: совпадение при разном порядке → pass", () => {
  assert.equal(
    evalNameMatch("Пётр Иванов", "Иванов Петр")?.result,
    "pass"
  );
});

test("evalNameMatch: разные имена → mismatch с обоими источниками", () => {
  const r = evalNameMatch("Иван Петров", "Пётр Иванов");
  assert.equal(r?.result, "mismatch");
  assert.equal(r?.details.holder_name, "Иван Петров");
  assert.equal(r?.details.member_name, "Пётр Иванов");
});

test("evalNameMatch: нет одного из имён → не применимо", () => {
  assert.equal(evalNameMatch(null, "Пётр"), null);
  assert.equal(evalNameMatch("Пётр", ""), null);
});

test("docTypes: fromCanonical даёт ожидаемые пары", () => {
  assert.deepEqual(fromCanonical("passport"), {
    category: "identity",
    subtype: "passport",
  });
  assert.deepEqual(fromCanonical("medical"), {
    category: "medical",
    subtype: null,
  });
});

test("docTypes: toCanonical по subtype и по категории", () => {
  assert.equal(toCanonical("identity", "passport"), "passport");
  assert.equal(toCanonical("education", "diploma"), "diploma");
  // subtype не распознан → падаем на тип категории без subtype или other
  assert.equal(toCanonical("medical", "нечто"), "medical");
  assert.equal(toCanonical("other", null), "other");
});

test("docTypes: round-trip canonical → пара → canonical", () => {
  for (const kind of [
    "passport",
    "visa",
    "diploma",
    "certificate",
    "resume",
    "employment_contract",
    "insurance",
  ] as const) {
    const { category, subtype } = fromCanonical(kind);
    assert.equal(toCanonical(category, subtype), kind);
  }
});

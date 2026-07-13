// Юнит-тесты логики напоминаний с фейковым «сегодня» (критерий приёмки ТЗ №1:
// автонапоминание за 30/7/1 день). Запуск: npm run test:unit

import { test } from "node:test";
import assert from "node:assert/strict";

import {
  parseOffsets,
  daysUntil,
  bucketKind,
  DEFAULT_OFFSETS,
} from "../../lib/reminders.ts";

test("parseOffsets: строка → отсортированный уникальный список", () => {
  assert.deepEqual(parseOffsets("30, 7, 1"), [30, 7, 1]);
  assert.deepEqual(parseOffsets("7 30 7"), [30, 7]);
  assert.deepEqual(parseOffsets("-5, 0, 10"), [10]);
});

test("parseOffsets: пусто/мусор → дефолт [30,7,1]", () => {
  assert.deepEqual(parseOffsets(""), DEFAULT_OFFSETS);
  assert.deepEqual(parseOffsets("abc"), DEFAULT_OFFSETS);
  assert.deepEqual(parseOffsets(null), DEFAULT_OFFSETS);
});

test("daysUntil: целые дни между датами", () => {
  assert.equal(daysUntil("2026-07-19", "2026-07-12"), 7);
  assert.equal(daysUntil("2026-07-12", "2026-07-12"), 0);
  assert.equal(daysUntil("2026-07-11", "2026-07-12"), -1);
});

// Паспорт с истечением ровно через 30 / 7 / 1 день от «сегодня».
const TODAY = "2026-07-12";

test("bucketKind: 30 дней до срока → d30", () => {
  assert.equal(bucketKind("2026-08-11", TODAY), "d30"); // +30
});

test("bucketKind: 7 дней до срока → d7", () => {
  assert.equal(bucketKind("2026-07-19", TODAY), "d7"); // +7
});

test("bucketKind: 1 день и день-в-день → d1", () => {
  assert.equal(bucketKind("2026-07-13", TODAY), "d1"); // +1
  assert.equal(bucketKind("2026-07-12", TODAY), "d1"); // 0
});

test("bucketKind: границы бакетов (8→d30, 2→d7)", () => {
  assert.equal(bucketKind("2026-07-20", TODAY), "d30"); // +8 > 7
  assert.equal(bucketKind("2026-07-14", TODAY), "d7"); // +2 > 1
});

test("bucketKind: дальше максимума и просрочка → null", () => {
  assert.equal(bucketKind("2026-08-12", TODAY), null); // +31
  assert.equal(bucketKind("2026-07-11", TODAY), null); // -1
});

test("bucketKind: свои offsets [14] → d14 в окне", () => {
  assert.equal(bucketKind("2026-07-20", TODAY, [14]), "d14"); // +8 <= 14
  assert.equal(bucketKind("2026-08-11", TODAY, [14]), null); // +30 > 14
});

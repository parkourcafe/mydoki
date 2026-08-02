// Юнит-тесты чистых хелперов Employment (P2-1). Запуск: npm run test:unit

import { test } from "node:test";
import assert from "node:assert/strict";

import {
  isEmploymentType,
  normalizeEmploymentType,
  employmentTypeLabel,
  employmentStatusLabel,
  formatPeriod,
  EMPLOYMENT_TYPES,
} from "../../lib/employment.ts";

test("isEmploymentType распознаёт допустимые типы и отсекает мусор", () => {
  for (const t of EMPLOYMENT_TYPES) assert.ok(isEmploymentType(t));
  assert.ok(!isEmploymentType("manager"));
  assert.ok(!isEmploymentType(""));
  assert.ok(!isEmploymentType(null));
  assert.ok(!isEmploymentType(42));
});

test("normalizeEmploymentType: невалидное → other, валидное сохраняется", () => {
  assert.equal(normalizeEmploymentType("part_time"), "part_time");
  assert.equal(normalizeEmploymentType("bogus"), "other");
  assert.equal(normalizeEmploymentType(undefined), "other");
  assert.equal(normalizeEmploymentType(null), "other");
});

test("employmentTypeLabel: все типы имеют метку во всех локалях", () => {
  for (const loc of ["ru", "en", "id", "uz"] as const) {
    for (const t of EMPLOYMENT_TYPES) {
      const label = employmentTypeLabel(loc, t);
      assert.ok(label && label !== t, `пустая/сырьевая метка для ${loc}/${t}`);
    }
  }
  // неизвестный тип — возвращаем как есть, без падения
  assert.equal(employmentTypeLabel("en", "weird"), "weird");
});

test("employmentStatusLabel: active/ended переведены", () => {
  assert.equal(employmentStatusLabel("en", "active"), "Active");
  assert.equal(employmentStatusLabel("en", "ended"), "Ended");
  assert.equal(employmentStatusLabel("ru", "active"), "Работает");
  assert.equal(employmentStatusLabel("en", "unknown"), "unknown");
});

test("formatPeriod: открытый период показывает 'present', иначе диапазон", () => {
  assert.equal(formatPeriod("en", null, null), "—");
  const open = formatPeriod("en", "2026-01-01", null);
  assert.ok(open.includes("present"), open);
  const ru = formatPeriod("ru", "2026-01-01", null);
  assert.ok(ru.includes("н. в."), ru);
  const closed = formatPeriod("en", "2026-01-01", "2026-06-01");
  assert.ok(!closed.includes("present"));
  assert.ok(closed.includes("—"));
});

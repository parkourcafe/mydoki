// Юнит-тесты карьерного таймлайна (P4-3). npm run test:unit

import { test } from "node:test";
import assert from "node:assert/strict";

import {
  employmentDurationMonths,
  splitCurrentArchive,
  sortByStartDesc,
  totalExperienceMonths,
  formatDuration,
} from "../../lib/careerTimeline.ts";
import type { Employment } from "../../lib/employment.ts";

const emp = (o: Partial<Employment>): Employment =>
  ({ status: "active", start_date: null, end_date: null, ...o } as Employment);

test("employmentDurationMonths: месяцы между датами; активная — до today", () => {
  assert.equal(employmentDurationMonths("2026-01-01", "2026-07-01", "2026-07-13"), 6);
  assert.equal(employmentDurationMonths("2026-01-15", "2026-07-01", "2026-07-13"), 5); // день меньше → -1
  assert.equal(employmentDurationMonths("2025-07-13", null, "2026-07-13"), 12); // активная до today
  assert.equal(employmentDurationMonths(null, null, "2026-07-13"), 0);
  assert.equal(employmentDurationMonths("2026-08-01", "2026-07-01", "2026-07-13"), 0); // не отрицательно
});

test("splitCurrentArchive: active → current, ended → archive", () => {
  const items = [emp({ status: "active" }), emp({ status: "ended" }), emp({ status: "active" })];
  const { current, archive } = splitCurrentArchive(items);
  assert.equal(current.length, 2);
  assert.equal(archive.length, 1);
});

test("sortByStartDesc: свежие сверху, без даты — в конец", () => {
  const items = [
    emp({ start_date: "2024-01-01" }),
    emp({ start_date: null }),
    emp({ start_date: "2026-01-01" }),
  ];
  const sorted = sortByStartDesc(items);
  assert.equal(sorted[0].start_date, "2026-01-01");
  assert.equal(sorted[1].start_date, "2024-01-01");
  assert.equal(sorted[2].start_date, null);
});

test("totalExperienceMonths: сумма длительностей", () => {
  const items = [
    emp({ start_date: "2026-01-01", end_date: "2026-07-01" }), // 6
    emp({ start_date: "2025-01-01", end_date: "2025-07-01" }), // 6
  ];
  assert.equal(totalExperienceMonths(items, "2026-07-13"), 12);
});

test("formatDuration: годы/месяцы + ноль", () => {
  assert.equal(formatDuration(27, "en"), "2 y 3 mo");
  assert.equal(formatDuration(12, "ru"), "1 г.");
  assert.equal(formatDuration(5, "ru"), "5 мес.");
  assert.match(formatDuration(0, "en"), /less than a month/);
});

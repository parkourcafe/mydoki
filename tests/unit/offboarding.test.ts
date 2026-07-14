// Юнит-тесты чистых хелперов Offboarding (P4-1). npm run test:unit

import { test } from "node:test";
import assert from "node:assert/strict";

import {
  defaultOffboardingChecklist,
  offboardingStatusLabel,
  offboardingProgress,
  type OffboardingTask,
} from "../../lib/offboarding.ts";

test("defaultOffboardingChecklist: непустой во всех локалях", () => {
  for (const loc of ["ru", "en", "id", "uz"] as const) {
    const list = defaultOffboardingChecklist(loc);
    assert.ok(list.length >= 3, `короткий чек-лист ${loc}`);
    assert.ok(list.every((s) => s.trim().length > 0));
  }
});

test("offboardingStatusLabel: переведены; неизвестный — как есть", () => {
  assert.equal(offboardingStatusLabel("en", "done"), "Done");
  assert.equal(offboardingStatusLabel("ru", "pending"), "В процессе");
  assert.equal(offboardingStatusLabel("en", "weird"), "weird");
});

test("offboardingProgress: доля завершённых", () => {
  const mk = (status: string): OffboardingTask => ({ status } as OffboardingTask);
  assert.equal(offboardingProgress([]), 0);
  assert.equal(
    offboardingProgress([mk("done"), mk("skipped"), mk("pending"), mk("pending")]),
    0.5
  );
  assert.equal(offboardingProgress([mk("done")]), 1);
});

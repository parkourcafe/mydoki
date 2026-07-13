// Юнит-тесты чистых хелперов Onboarding (P2-3). Запуск: npm run test:unit

import { test } from "node:test";
import assert from "node:assert/strict";

import {
  CHECKPOINT_OFFSETS,
  defaultChecklist,
  checkpointLabel,
  onboardingStatusLabel,
  dueDate,
  checkpointState,
  onboardingProgress,
  type OnboardingTask,
} from "../../lib/onboarding.ts";

test("CHECKPOINT_OFFSETS — 7/30/60/90", () => {
  assert.deepEqual([...CHECKPOINT_OFFSETS], [7, 30, 60, 90]);
});

test("defaultChecklist: непустой во всех локалях", () => {
  for (const loc of ["ru", "en", "id", "uz"] as const) {
    const list = defaultChecklist(loc);
    assert.ok(list.length >= 3, `короткий чек-лист ${loc}`);
    assert.ok(list.every((s) => s.trim().length > 0));
  }
});

test("checkpointLabel: содержит число дней во всех локалях", () => {
  for (const loc of ["ru", "en", "id", "uz"] as const) {
    for (const off of CHECKPOINT_OFFSETS) {
      assert.match(checkpointLabel(loc, off), new RegExp(String(off)));
    }
  }
});

test("onboardingStatusLabel: переведены, неизвестный — как есть", () => {
  assert.equal(onboardingStatusLabel("en", "done"), "Done");
  assert.equal(onboardingStatusLabel("ru", "pending"), "В процессе");
  assert.equal(onboardingStatusLabel("en", "weird"), "weird");
});

test("dueDate: прибавляет офсет в днях (UTC)", () => {
  assert.equal(dueDate("2026-07-01", 7), "2026-07-08");
  assert.equal(dueDate("2026-07-01", 30), "2026-07-31");
  assert.equal(dueDate("2026-07-01", 60), "2026-08-30");
  assert.equal(dueDate("2026-07-01", 90), "2026-09-29");
  assert.equal(dueDate(null, 7), null);
});

test("checkpointState: done/overdue/soon/upcoming/none", () => {
  // done вне зависимости от даты
  assert.equal(checkpointState("2026-07-08", "2026-07-01", "done"), "done");
  assert.equal(checkpointState("2026-07-08", "2026-07-01", "skipped"), "done");
  // ref после due → overdue
  assert.equal(checkpointState("2026-07-08", "2026-07-20"), "overdue");
  // в пределах 7 дней → soon
  assert.equal(checkpointState("2026-07-08", "2026-07-02"), "soon");
  assert.equal(checkpointState("2026-07-08", "2026-07-08"), "soon");
  // дальше 7 дней → upcoming
  assert.equal(checkpointState("2026-07-30", "2026-07-01"), "upcoming");
  // нет даты → none
  assert.equal(checkpointState(null, "2026-07-01"), "none");
});

test("onboardingProgress: доля завершённых", () => {
  const mk = (status: string): OnboardingTask =>
    ({ status } as OnboardingTask);
  assert.equal(onboardingProgress([]), 0);
  assert.equal(
    onboardingProgress([mk("done"), mk("skipped"), mk("pending"), mk("pending")]),
    0.5
  );
  assert.equal(onboardingProgress([mk("done"), mk("done")]), 1);
});

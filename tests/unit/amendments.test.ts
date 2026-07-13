// Юнит-тесты чистых хелперов Amendment (P3-1). npm run test:unit

import { test } from "node:test";
import assert from "node:assert/strict";

import {
  AMENDMENT_KINDS,
  canRespondToAmendment,
  canEditAmendment,
  amendmentKindLabel,
  amendmentStatusLabel,
  defaultAmendmentDisclaimer,
  hasChanges,
} from "../../lib/amendments.ts";

test("canRespondToAmendment: только 'proposed'", () => {
  assert.ok(canRespondToAmendment("proposed"));
  for (const s of ["draft", "accepted", "declined", "withdrawn"]) {
    assert.ok(!canRespondToAmendment(s), s);
  }
});

test("canEditAmendment: только 'draft'", () => {
  assert.ok(canEditAmendment("draft"));
  for (const s of ["proposed", "accepted", "declined", "withdrawn"]) {
    assert.ok(!canEditAmendment(s), s);
  }
});

test("amendmentKindLabel: все виды переведены во всех локалях", () => {
  for (const loc of ["ru", "en", "id", "uz"] as const) {
    for (const k of AMENDMENT_KINDS) {
      const label = amendmentKindLabel(loc, k);
      assert.ok(label && label !== k, `пустая/сырьевая метка ${loc}/${k}`);
    }
  }
  assert.equal(amendmentKindLabel("en", "weird"), "weird");
});

test("amendmentStatusLabel: статусы переведены; неизвестный — как есть", () => {
  assert.equal(amendmentStatusLabel("en", "proposed"), "Proposed");
  assert.equal(amendmentStatusLabel("ru", "accepted"), "Принято");
  assert.equal(amendmentStatusLabel("en", "weird"), "weird");
});

test("defaultAmendmentDisclaimer: непустой, подчёркивает не-подпись", () => {
  for (const loc of ["ru", "en", "id", "uz"] as const) {
    assert.ok(defaultAmendmentDisclaimer(loc).length > 20, loc);
  }
  assert.match(defaultAmendmentDisclaimer("en").toLowerCase(), /not an electronic signature/);
  assert.match(defaultAmendmentDisclaimer("ru").toLowerCase(), /не электронная подпись/);
});

test("hasChanges: true при любом изменённом поле, иначе false", () => {
  assert.ok(hasChanges({ new_position: "Head", new_employment_type: null, new_compensation: null, terms: null }));
  assert.ok(hasChanges({ new_position: null, new_employment_type: null, new_compensation: "9jt", terms: null }));
  assert.ok(hasChanges({ new_position: null, new_employment_type: null, new_compensation: null, terms: "remote" }));
  assert.ok(!hasChanges({ new_position: null, new_employment_type: null, new_compensation: null, terms: null }));
});

// Юнит-тесты чистых хелперов Legal (P3-3). npm run test:unit

import { test } from "node:test";
import assert from "node:assert/strict";

import {
  LEGAL_JURISDICTION,
  LEGAL_CATEGORIES,
  legalCategoryLabel,
  jurisdictionName,
  legalDisclaimer,
  specialistRouteText,
} from "../../lib/legal.ts";

test("LEGAL_JURISDICTION — одна юрисдикция запуска (ID)", () => {
  assert.equal(LEGAL_JURISDICTION, "ID");
});

test("legalCategoryLabel: все категории переведены во всех локалях", () => {
  for (const loc of ["ru", "en", "id", "uz"] as const) {
    for (const c of LEGAL_CATEGORIES) {
      const label = legalCategoryLabel(loc, c);
      assert.ok(label && label !== c, `пустая/сырьевая метка ${loc}/${c}`);
    }
  }
  assert.equal(legalCategoryLabel("en", "weird"), "weird");
});

test("jurisdictionName: непустое имя во всех локалях", () => {
  for (const loc of ["ru", "en", "id", "uz"] as const) {
    assert.ok(jurisdictionName(loc).length > 0, loc);
  }
});

test("legalDisclaimer: явно НЕ юр-консультация во всех локалях", () => {
  for (const loc of ["ru", "en", "id", "uz"] as const) {
    assert.ok(legalDisclaimer(loc).length > 40, loc);
  }
  assert.match(legalDisclaimer("en").toLowerCase(), /not legal advice/);
  assert.match(legalDisclaimer("ru").toLowerCase(), /не является юридической консультацией/);
});

test("specialistRouteText: маршрут к специалисту во всех локалях", () => {
  for (const loc of ["ru", "en", "id", "uz"] as const) {
    assert.ok(specialistRouteText(loc).length > 0, loc);
  }
});

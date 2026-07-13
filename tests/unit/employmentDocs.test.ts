// Юнит-тесты чистых хелперов employment documents (P2-4). npm run test:unit

import { test } from "node:test";
import assert from "node:assert/strict";

import {
  EMPLOYMENT_DOC_TYPES,
  docTypeLabel,
  expiryStatus,
} from "../../lib/employmentDocs.ts";

test("docTypeLabel: все типы переведены во всех локалях", () => {
  for (const loc of ["ru", "en", "id", "uz"] as const) {
    for (const type of EMPLOYMENT_DOC_TYPES) {
      const label = docTypeLabel(loc, type);
      assert.ok(label && label !== type, `пустая/сырьевая метка ${loc}/${type}`);
    }
  }
  assert.equal(docTypeLabel("en", "weird"), "weird");
});

test("expiryStatus: none/ok/soon/expired относительно today", () => {
  const today = "2026-07-13";
  assert.equal(expiryStatus(null, today), "none");
  assert.equal(expiryStatus("2026-07-01", today), "expired"); // прошло
  assert.equal(expiryStatus("2026-07-20", today), "soon"); // 7 дней
  assert.equal(expiryStatus("2026-08-12", today), "soon"); // 30 дней ровно
  assert.equal(expiryStatus("2026-08-13", today), "ok"); // 31 день
  assert.equal(expiryStatus("2027-01-01", today), "ok");
});

test("expiryStatus: сегодня — ещё не просрочено (soon)", () => {
  assert.equal(expiryStatus("2026-07-13", "2026-07-13"), "soon");
});

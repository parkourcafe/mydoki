// Юнит-тесты хелперов Verification (P4-4). npm run test:unit

import { test } from "node:test";
import assert from "node:assert/strict";

import {
  isVerificationActive,
  verifiedStatusLabel,
} from "../../lib/verification.ts";

test("isVerificationActive: активна если не отозвана и не истекла", () => {
  const now = "2026-07-13T00:00:00.000Z";
  assert.equal(isVerificationActive({ revoked_at: null, expires_at: null }, now), true);
  assert.equal(isVerificationActive({ revoked_at: "2026-07-01T00:00:00Z", expires_at: null }, now), false);
  assert.equal(isVerificationActive({ revoked_at: null, expires_at: "2026-07-20T00:00:00.000Z" }, now), true);
  assert.equal(isVerificationActive({ revoked_at: null, expires_at: "2026-07-01T00:00:00.000Z" }, now), false);
});

test("verifiedStatusLabel: только фактический статус, без оценок", () => {
  for (const loc of ["ru", "en", "id", "uz"] as const) {
    assert.ok(verifiedStatusLabel(loc, "active").length > 0);
    assert.ok(verifiedStatusLabel(loc, "ended").length > 0);
  }
  assert.equal(verifiedStatusLabel("en", "active"), "Currently employed");
  assert.equal(verifiedStatusLabel("en", "ended"), "Employment ended");
});

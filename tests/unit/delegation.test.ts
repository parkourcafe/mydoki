// Юнит-тесты чистых хелперов Delegation (F-2). npm run test:unit

import { test } from "node:test";
import assert from "node:assert/strict";

import {
  DELEGATION_SCOPES,
  VAULT_CATEGORIES,
  type Delegation,
  effectiveStatus,
  isActive,
  categoryLabel,
  scopeSummary,
  statusLabel,
  isFutureExpiry,
} from "../../lib/delegation.ts";

const NOW = new Date("2026-07-14T12:00:00Z");
const future = "2026-08-14T12:00:00Z";
const past = "2026-06-14T12:00:00Z";

const base: Delegation = {
  id: "d1",
  household_id: "h1",
  grantee_user_id: "g1",
  invite_email: null,
  token: "tok",
  scope: "all",
  scope_category: null,
  purpose: "Tax filing",
  expires_at: future,
  status: "active",
  created_at: past,
  accepted_at: past,
  revoked_at: null,
};

test("effectiveStatus: учитывает отзыв и истечение срока", () => {
  assert.equal(effectiveStatus({ status: "active", expires_at: future }, NOW), "active");
  assert.equal(effectiveStatus({ status: "active", expires_at: past }, NOW), "expired");
  assert.equal(effectiveStatus({ status: "revoked", expires_at: future }, NOW), "revoked");
  assert.equal(effectiveStatus({ status: "pending", expires_at: future }, NOW), "pending");
  // отзыв приоритетнее истечения
  assert.equal(effectiveStatus({ status: "revoked", expires_at: past }, NOW), "revoked");
});

test("isActive: только принятая, не отозванная, не истёкшая, с получателем", () => {
  assert.equal(isActive(base, NOW), true);
  assert.equal(isActive({ ...base, expires_at: past }, NOW), false); // истекла
  assert.equal(isActive({ ...base, revoked_at: past }, NOW), false); // отозвана
  assert.equal(isActive({ ...base, status: "pending" }, NOW), false); // не принята
  assert.equal(isActive({ ...base, grantee_user_id: null }, NOW), false); // нет получателя
});

test("scopeSummary: 'весь сейф' vs категория, во всех локалях", () => {
  for (const loc of ["ru", "en", "id", "uz"] as const) {
    const all = scopeSummary(loc, { scope: "all", scope_category: null });
    const cat = scopeSummary(loc, { scope: "category", scope_category: "financial" });
    assert.ok(all.length > 0, `all ${loc}`);
    assert.ok(cat.length > 0 && cat !== all, `cat ${loc}`);
  }
  assert.equal(scopeSummary("en", { scope: "category", scope_category: "financial" }), "Financial");
});

test("categoryLabel: все категории enum переведены; неизвестная — как есть", () => {
  for (const loc of ["ru", "en", "id", "uz"] as const) {
    for (const c of VAULT_CATEGORIES) {
      assert.ok(categoryLabel(loc, c).length > 0, `${loc}/${c}`);
    }
  }
  assert.equal(categoryLabel("en", "weird"), "weird");
});

test("statusLabel: все производные статусы переведены", () => {
  for (const loc of ["ru", "en", "id", "uz"] as const) {
    for (const s of ["pending", "active", "expired", "revoked"] as const) {
      assert.ok(statusLabel(loc, s).length > 0, `${loc}/${s}`);
    }
  }
});

test("isFutureExpiry: будущее true, прошлое/мусор false", () => {
  assert.equal(isFutureExpiry(future, NOW), true);
  assert.equal(isFutureExpiry(past, NOW), false);
  assert.equal(isFutureExpiry("not-a-date", NOW), false);
});

test("константы: 2 области, 6 категорий", () => {
  assert.deepEqual(DELEGATION_SCOPES, ["all", "category"]);
  assert.equal(VAULT_CATEGORIES.length, 6);
});

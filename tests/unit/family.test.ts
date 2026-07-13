// Юнит-тесты чистых хелперов Family access (F-1). npm run test:unit

import { test } from "node:test";
import assert from "node:assert/strict";

import {
  HOUSEHOLD_ROLES,
  type HouseholdMember,
  roleRank,
  roleLabel,
  roleDescription,
  canManageMembers,
  ownerCount,
  isLastOwner,
  wouldOrphanOwner,
  canRemoveMember,
} from "../../lib/family.ts";

const mk = (rows: Array<[string, HouseholdMember["role"]]>): HouseholdMember[] =>
  rows.map(([user_id, role]) => ({ user_id, role }));

test("roleRank: owner > editor > viewer, неизвестное = 0", () => {
  assert.ok(roleRank("owner") > roleRank("editor"));
  assert.ok(roleRank("editor") > roleRank("viewer"));
  assert.equal(roleRank("weird"), 0);
});

test("roleLabel/roleDescription: заполнены во всех локалях", () => {
  for (const loc of ["ru", "en", "id", "uz"] as const) {
    for (const r of HOUSEHOLD_ROLES) {
      assert.ok(roleLabel(loc, r) && roleLabel(loc, r) !== r, `label ${loc}/${r}`);
      assert.ok(roleDescription(loc, r).length > 0, `desc ${loc}/${r}`);
    }
  }
  // Неизвестная роль — отдаём как есть / пусто, без падения.
  assert.equal(roleLabel("en", "weird"), "weird");
  assert.equal(roleDescription("en", "weird"), "");
});

test("canManageMembers: только owner", () => {
  assert.equal(canManageMembers("owner"), true);
  assert.equal(canManageMembers("editor"), false);
  assert.equal(canManageMembers("viewer"), false);
  assert.equal(canManageMembers(null), false);
  assert.equal(canManageMembers(undefined), false);
});

test("ownerCount / isLastOwner", () => {
  const one = mk([["a", "owner"], ["b", "editor"], ["c", "viewer"]]);
  assert.equal(ownerCount(one), 1);
  assert.equal(isLastOwner(one, "a"), true); // единственный owner
  assert.equal(isLastOwner(one, "b"), false); // не owner
  assert.equal(isLastOwner(one, "zzz"), false); // не участник

  const two = mk([["a", "owner"], ["b", "owner"]]);
  assert.equal(ownerCount(two), 2);
  assert.equal(isLastOwner(two, "a"), false); // есть второй owner
});

test("wouldOrphanOwner: понижение последнего owner запрещено", () => {
  const one = mk([["a", "owner"], ["b", "editor"]]);
  assert.equal(wouldOrphanOwner(one, "a", "editor"), true);
  assert.equal(wouldOrphanOwner(one, "a", "viewer"), true);
  assert.equal(wouldOrphanOwner(one, "a", "owner"), false); // остаётся owner
  assert.equal(wouldOrphanOwner(one, "b", "owner"), false); // b не owner

  const two = mk([["a", "owner"], ["b", "owner"]]);
  assert.equal(wouldOrphanOwner(two, "a", "viewer"), false); // b остаётся owner
});

test("canRemoveMember: нельзя вывести последнего owner", () => {
  const one = mk([["a", "owner"], ["b", "editor"]]);
  assert.equal(canRemoveMember(one, "a"), false); // последний owner
  assert.equal(canRemoveMember(one, "b"), true);

  const two = mk([["a", "owner"], ["b", "owner"]]);
  assert.equal(canRemoveMember(two, "a"), true); // есть второй owner
});

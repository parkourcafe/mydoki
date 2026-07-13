// Юнит-тесты аллоу-листа кураторов (fail-closed). npm run test:unit

import { test } from "node:test";
import assert from "node:assert/strict";

import { parseAdminEmails, isAllowedAdmin } from "../../lib/admin.ts";

test("parseAdminEmails: разбор, нижний регистр, фильтр пустых", () => {
  assert.deepEqual(parseAdminEmails("A@x.com, b@Y.com"), ["a@x.com", "b@y.com"]);
  assert.deepEqual(parseAdminEmails("  a@x.com \n c@z.com "), ["a@x.com", "c@z.com"]);
  assert.deepEqual(parseAdminEmails(""), []);
  assert.deepEqual(parseAdminEmails(undefined), []);
});

test("isAllowedAdmin: fail-closed без списка, регистронезависимо", () => {
  assert.equal(isAllowedAdmin("a@x.com", ""), false); // список пуст → админов нет
  assert.equal(isAllowedAdmin("a@x.com", undefined), false);
  assert.equal(isAllowedAdmin("", "a@x.com"), false);
  assert.equal(isAllowedAdmin(null, "a@x.com"), false);
  assert.equal(isAllowedAdmin("A@X.com", "a@x.com,b@y.com"), true);
  assert.equal(isAllowedAdmin("nope@x.com", "a@x.com"), false);
});

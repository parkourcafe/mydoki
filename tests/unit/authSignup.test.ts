import { test } from "node:test";
import assert from "node:assert/strict";

import {
  isExistingSignupResponse,
  validateSignupInput,
} from "../../lib/authSignup.ts";

test("validateSignupInput requires an email and an eight-character password", () => {
  assert.equal(validateSignupInput("", "password", true), "credentials");
  assert.equal(validateSignupInput("person@example.com", "short", true), "credentials");
});

test("validateSignupInput requires terms but not a medical-data consent", () => {
  assert.equal(
    validateSignupInput("person@example.com", "password", false),
    "terms"
  );
  assert.equal(
    validateSignupInput("person@example.com", "password", true),
    null
  );
});

test("isExistingSignupResponse detects Supabase's empty-identity response", () => {
  assert.equal(isExistingSignupResponse({ identities: [] }), true);
  assert.equal(isExistingSignupResponse({ identities: [{}] }), false);
  assert.equal(isExistingSignupResponse(null), false);
});

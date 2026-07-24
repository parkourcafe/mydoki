import { test } from "node:test";
import assert from "node:assert/strict";

import { normalizeAppUrl } from "../../lib/appUrl.ts";

test("adds HTTPS and the canonical host to a bare production domain", () => {
  assert.equal(normalizeAppUrl("doki.help"), "https://www.doki.help");
});

test("canonicalizes the apex production URL", () => {
  assert.equal(normalizeAppUrl("http://doki.help/"), "https://www.doki.help");
});

test("preserves an explicit local development URL", () => {
  assert.equal(normalizeAppUrl("http://localhost:3000/"), "http://localhost:3000");
});

test("falls back safely when the configured URL is invalid", () => {
  assert.equal(normalizeAppUrl("http://["), "https://www.doki.help");
});

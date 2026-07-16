import { test } from "node:test";
import assert from "node:assert/strict";

import { isNativeUserAgent } from "../../lib/nativeUserAgent.ts";

test("recognizes the shipped SwiftUI App Store wrapper", () => {
  assert.equal(
    isNativeUserAgent(
      "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) DokiHelpIOS/1.0"
    ),
    true
  );
});

test("recognizes the Capacitor wrapper and ignores regular browsers", () => {
  assert.equal(isNativeUserAgent("Mozilla/5.0 dokiNativeApp"), true);
  assert.equal(isNativeUserAgent("Mozilla/5.0 Safari/605.1.15"), false);
});

import { test } from "node:test";
import assert from "node:assert/strict";

import {
  isGooglePlayUserAgent,
  isMedicalFeaturesDisabledUserAgent,
  isNativeUserAgent,
  isRuStoreUserAgent,
} from "../../lib/nativeUserAgent.ts";
import { isRuStoreRestrictedPath } from "../../lib/rustore.ts";

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

test("recognizes the dedicated RuStore Android wrapper", () => {
  const ua = "Mozilla/5.0 (Linux; Android 15) DokiHelpAndroid/RU/1.0";
  assert.equal(isRuStoreUserAgent(ua), true);
  assert.equal(isNativeUserAgent(ua), true);
  assert.equal(isRuStoreUserAgent("DokiHelpIOS/1.0"), false);
});

test("recognizes Google Play wrapper and disables medical features only in Android store builds", () => {
  const googlePlayUa =
    "Mozilla/5.0 (Linux; Android 15) DokiHelpAndroid/GP/1.0.2";
  assert.equal(isGooglePlayUserAgent(googlePlayUa), true);
  assert.equal(isNativeUserAgent(googlePlayUa), true);
  assert.equal(isMedicalFeaturesDisabledUserAgent(googlePlayUa), true);
  assert.equal(
    isMedicalFeaturesDisabledUserAgent(
      "Mozilla/5.0 (Linux; Android 15) DokiHelpAndroid/RU/1.0"
    ),
    true
  );
  assert.equal(isMedicalFeaturesDisabledUserAgent("DokiHelpIOS/1.0"), false);
  assert.equal(isGooglePlayUserAgent("dokiNativeApp"), false);
});

test("RuStore path gate excludes work and health modules", () => {
  assert.equal(isRuStoreRestrictedPath("/employer"), true);
  assert.equal(isRuStoreRestrictedPath("/my/work"), true);
  assert.equal(
    isRuStoreRestrictedPath("/my/members/abc-123/health"),
    true
  );
  assert.equal(
    isRuStoreRestrictedPath("/my/documents/category/medical"),
    true
  );
  assert.equal(isRuStoreRestrictedPath("/my/documents"), false);
  assert.equal(isRuStoreRestrictedPath("/my/reminders"), false);
});

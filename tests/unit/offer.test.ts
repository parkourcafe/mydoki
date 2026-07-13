// Юнит-тесты чистых хелперов Offer (P2-2). Запуск: npm run test:unit

import { test } from "node:test";
import assert from "node:assert/strict";

import {
  canRespondToOffer,
  canEditOffer,
  offerStatusLabel,
  defaultDisclaimer,
} from "../../lib/offer.ts";

test("canRespondToOffer: только 'sent' отвечаем", () => {
  assert.ok(canRespondToOffer("sent"));
  for (const s of ["draft", "accepted", "declined", "withdrawn"]) {
    assert.ok(!canRespondToOffer(s), s);
  }
});

test("canEditOffer: черновик/отклонён/отозван — редактируем; sent/accepted — нет", () => {
  assert.ok(canEditOffer("draft"));
  assert.ok(canEditOffer("declined"));
  assert.ok(canEditOffer("withdrawn"));
  assert.ok(!canEditOffer("sent"));
  assert.ok(!canEditOffer("accepted"));
});

test("offerStatusLabel: все статусы переведены во всех локалях", () => {
  const statuses = ["draft", "sent", "accepted", "declined", "withdrawn"] as const;
  for (const loc of ["ru", "en", "id", "uz"] as const) {
    for (const s of statuses) {
      const label = offerStatusLabel(loc, s);
      assert.ok(label && label !== s, `пустая/сырьевая метка ${loc}/${s}`);
    }
  }
  assert.equal(offerStatusLabel("en", "weird"), "weird");
});

test("defaultDisclaimer: непустой во всех локалях и подчёркивает не-договор", () => {
  for (const loc of ["ru", "en", "id", "uz"] as const) {
    const d = defaultDisclaimer(loc);
    assert.ok(d.length > 20, `слишком короткий дисклеймер ${loc}`);
  }
  // Явно фиксируем суть: это НЕ трудовой договор.
  assert.match(defaultDisclaimer("en").toLowerCase(), /not an employment contract/);
  assert.match(defaultDisclaimer("ru").toLowerCase(), /не трудовой договор/);
});

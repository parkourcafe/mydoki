// Юнит-тесты AI-guardrails и redaction policy. Запуск: npm run test:unit

import { test } from "node:test";
import assert from "node:assert/strict";

import {
  containsForbidden,
  outputViolatesPolicy,
  hasGrounding,
  splitByGrounding,
  type EvidenceItem,
} from "../../lib/ai/guardrails.ts";
import { canSendDocumentToModel } from "../../lib/ai/redaction.ts";

test("containsForbidden ловит балл/ранжирование/подделку/рекомендации", () => {
  assert.ok(containsForbidden("совокупный балл 92"));
  assert.ok(containsForbidden("ranking of candidates"));
  assert.ok(containsForbidden("рекомендуем отказать"));
  assert.ok(containsForbidden("документ поддельный"));
  assert.ok(containsForbidden("this looks fake"));
  assert.ok(!containsForbidden("опыт работы 3 года в кафе"));
});

test("outputViolatesPolicy — любой пункт с запрещённой лексикой", () => {
  const clean: EvidenceItem[] = [{ category: "fact", text: "работал в Acme" }];
  const bad: EvidenceItem[] = [{ category: "fact", text: "итоговый балл 80" }];
  assert.equal(outputViolatesPolicy(clean), false);
  assert.equal(outputViolatesPolicy(bad), true);
});

test("hasGrounding требует источник и цитату", () => {
  assert.ok(hasGrounding({ category: "fact", text: "x", source: "CV", quote: "Acme 2020-2022" }));
  assert.ok(!hasGrounding({ category: "fact", text: "x", source: "CV" }));
  assert.ok(!hasGrounding({ category: "fact", text: "x" }));
});

test("splitByGrounding делит на подтверждённые/неподтверждённые", () => {
  const items: EvidenceItem[] = [
    { category: "fact", text: "a", source: "CV", quote: "q" },
    { category: "gap", text: "b" },
  ];
  const { supported, unsupported } = splitByGrounding(items);
  assert.equal(supported.length, 1);
  assert.equal(unsupported.length, 1);
});

test("redaction: паспорт и медицина заблокированы без утверждённого сценария", () => {
  assert.equal(canSendDocumentToModel("identity").allowed, false);
  assert.equal(canSendDocumentToModel("medical").allowed, false);
  // с утверждённым сценарием — можно
  assert.equal(canSendDocumentToModel("identity", true).allowed, true);
  // прочие категории — можно
  assert.equal(canSendDocumentToModel("education").allowed, true);
  assert.equal(canSendDocumentToModel("career").allowed, true);
});

import { checkCompleteness } from "../../lib/ai/completeness.ts";

test("checkCompleteness: недостающие и предоставленные документы", () => {
  const required = [
    { type: "cv", label: "CV", required: true },
    { type: "ktp", label: "KTP", required: true },
    { type: "diploma", label: "Diploma", required: false },
  ];
  const r = checkCompleteness(required, ["cv"]);
  assert.equal(r.complete, false);
  assert.deepEqual(r.missing.map((m) => m.type), ["ktp"]); // diploma необязателен
  assert.deepEqual(r.provided.map((m) => m.type), ["cv"]);
});

test("checkCompleteness: всё на месте → complete", () => {
  const required = [{ type: "cv", label: "CV", required: true }];
  assert.equal(checkCompleteness(required, ["cv", "extra"]).complete, true);
});

test("outputViolatesPolicy сканирует quote и source, не только text", () => {
  assert.equal(
    outputViolatesPolicy([{ category: "fact", text: "ок", source: "CV", quote: "итоговый балл 90" }]),
    true
  );
  assert.equal(
    outputViolatesPolicy([{ category: "fact", text: "ок", source: "рейтинг кандидатов", quote: "q" }]),
    true
  );
});

test("containsForbidden ловит расширенные формулировки рекомендаций/подлинности", () => {
  assert.ok(containsForbidden("рекомендую срочно нанять этого кандидата"));
  assert.ok(containsForbidden("советую отказать"));
  assert.ok(containsForbidden("we should definitely hire them"));
  assert.ok(containsForbidden("ранжирование кандидатов"));
  assert.ok(!containsForbidden("кандидат работал барменом 3 года"));
});

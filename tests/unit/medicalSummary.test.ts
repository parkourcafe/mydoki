import { test } from "node:test";
import assert from "node:assert/strict";

import {
  canPublishMedicalSummaries,
  normalizeMedicalSummary,
} from "../../lib/medicalSummary.ts";

test("normalizes translated medical summary without inventing missing text", () => {
  const normalized = normalizeMedicalSummary(
    {
      translated_title: "  Hasil laboratorium  ",
      translated_summary: "  Hemoglobin: 13.4 g/dL  ",
      key_facts: [" Hemoglobin: 13.4 g/dL ", 42, ""],
      uncertainty_notes: "not-an-array",
    },
    "Анализ крови"
  );

  assert.deepEqual(normalized, {
    translated_title: "Hasil laboratorium",
    translated_summary: "Hemoglobin: 13.4 g/dL",
    key_facts: ["Hemoglobin: 13.4 g/dL"],
    uncertainty_notes: [],
  });
});

test("falls back only for the title and keeps a missing summary empty", () => {
  const normalized = normalizeMedicalSummary({}, "Рецепт");
  assert.equal(normalized.translated_title, "Рецепт");
  assert.equal(normalized.translated_summary, "");
});

test("publishes only when every expected summary is approved and non-empty", () => {
  const approved = {
    status: "approved",
    translated_title: "Resep",
    translated_summary: "Amoxicillin 500 mg",
  };

  assert.equal(canPublishMedicalSummaries([approved], 1), true);
  assert.equal(canPublishMedicalSummaries([{ ...approved, status: "draft" }], 1), false);
  assert.equal(canPublishMedicalSummaries([{ ...approved, translated_summary: "  " }], 1), false);
  assert.equal(canPublishMedicalSummaries([approved], 2), false);
  assert.equal(canPublishMedicalSummaries([], 0), false);
});

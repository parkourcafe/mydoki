// Юнит-тесты Process Guide (P3-4). npm run test:unit

import { test } from "node:test";
import assert from "node:assert/strict";

import {
  GUIDE_CONTEXTS,
  processGuideFor,
} from "../../lib/processGuide.ts";
import { LEGAL_CATEGORIES } from "../../lib/legal.ts";

test("processGuideFor: все контексты дают подсказку с валидной категорией во всех локалях", () => {
  for (const loc of ["ru", "en", "id", "uz"] as const) {
    for (const ctx of GUIDE_CONTEXTS) {
      const g = processGuideFor(ctx, loc);
      assert.ok(g, `нет подсказки для ${loc}/${ctx}`);
      assert.ok(g!.hint.length > 10, `короткая подсказка ${loc}/${ctx}`);
      assert.ok(
        (LEGAL_CATEGORIES as string[]).includes(g!.category),
        `невалидная категория ${g!.category}`
      );
    }
  }
});

test("processGuideFor: неизвестный контекст → null", () => {
  assert.equal(processGuideFor("nope", "en"), null);
});

test("Process Guide не содержит вердиктов/советов о найме (лексика)", () => {
  const banned = /(рекоменд|нанять|отказать|подделк|балл|ranking|score|hire|reject|fake)/i;
  for (const loc of ["ru", "en", "id", "uz"] as const) {
    for (const ctx of GUIDE_CONTEXTS) {
      const g = processGuideFor(ctx, loc)!;
      assert.ok(!banned.test(g.hint), `запрещённая лексика в ${loc}/${ctx}: ${g.hint}`);
    }
  }
});

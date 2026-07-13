// Проверка запрета: слова «подделка/фальшивый/fake/forged» не должны
// появляться в проверках документов и UI (ТЗ §11, Архитектура v1.1 §10/§15).
// Запуск: node tests/lexicon.mjs  (exit 1, если что-то найдено).
//
// Каталог docs/ исключён: там эти слова цитируются как сам запрет.
// В app/employer/EmployerVerification.tsx «фейковые работодатели» —
// другой контекст (защита кандидатов), к проверкам документов не относится.

import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, extname } from "node:path";

const ROOTS = ["app", "lib", "components", "supabase/migrations"];
const EXTS = new Set([".ts", ".tsx", ".sql", ".mjs", ".js"]);
const PATTERN = /подделк|фальшив|поддельн|фейк|\bfake\b|\bforged\b/i;
// Исключаемые файлы: другой контекст, не проверки документов.
// EmployerVerification — «fake employers» о верификации работодателя,
// защите кандидатов; к вердиктам о подлинности документов не относится.
// guardrails/prompts — здесь эти слова ОПРЕДЕЛЯЮТСЯ как запретные и модели
// запрещается их писать (сам механизм запрета, а не вердикт).
const IGNORE_FILES = [
  "EmployerVerification.tsx",
  "lib/ai/guardrails.ts",
  "lib/ai/prompts.ts",
];

const hits = [];

function walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    const s = statSync(p);
    if (s.isDirectory()) walk(p);
    else if (EXTS.has(extname(p)) && !IGNORE_FILES.some((f) => p.endsWith(f)))
      scan(p);
  }
}

function scan(file) {
  const lines = readFileSync(file, "utf8").split("\n");
  lines.forEach((line, i) => {
    if (PATTERN.test(line)) hits.push(`${file}:${i + 1}: ${line.trim()}`);
  });
}

for (const r of ROOTS) {
  try {
    walk(r);
  } catch {
    /* каталога может не быть */
  }
}

if (hits.length) {
  console.error("Запрещённая лексика найдена в проверках/UI:");
  for (const h of hits) console.error("  " + h);
  process.exit(1);
}
console.log("OK: запрещённой лексики нет.");

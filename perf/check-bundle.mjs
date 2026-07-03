// T7 — детерминированный бюджет First Load JS для критичных публичных роутов.
// Считает РЕАЛЬНЫЙ gzip-размер объединения first-load чанков из
// .next/app-build-manifest.json и падает (exit 1), если он превышает лимит.
// Запуск: `npm run build` затем `npm run perf:budget` (или в CI после build).
//
// Почему не только Lighthouse: LHCI требует поднятый сервер + сид данных +
// env для динамического /apply/[slug]. Этот чек детерминирован, без сети и
// инфраструктуры — ловит регрессию веса на каждом PR. LHCI (perf/LCP/CLS)
// остаётся для прогонов против preview-URL (см. perf/README.md).

import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";

// Бюджеты в КБ (gzip). Ключ — фрагмент имени роута в app-build-manifest.
const BUDGETS_KB = {
  "apply/[slug]": 150, // публичная страница отклика — главный вход кандидата
};

const MANIFEST = path.join(process.cwd(), ".next", "app-build-manifest.json");

if (!fs.existsSync(MANIFEST)) {
  console.error(
    `✗ ${MANIFEST} не найден. Сначала соберите проект: \`npm run build\`.`
  );
  process.exit(1);
}

const manifest = JSON.parse(fs.readFileSync(MANIFEST, "utf8"));
const pages = manifest.pages || {};

let failed = false;

for (const [needle, budgetKb] of Object.entries(BUDGETS_KB)) {
  const key = Object.keys(pages).find((k) => k.includes(needle));
  if (!key) {
    console.error(`✗ Роут «${needle}» не найден в манифесте — чек невалиден.`);
    failed = true;
    continue;
  }

  // Уникальные чанки (один файл может встречаться несколько раз).
  const files = [...new Set(pages[key])];
  let gzBytes = 0;
  for (const f of files) {
    const p = path.join(process.cwd(), ".next", f);
    if (!fs.existsSync(p)) continue;
    gzBytes += zlib.gzipSync(fs.readFileSync(p)).length;
  }
  const gzKb = gzBytes / 1024;
  const ok = gzKb <= budgetKb;
  const mark = ok ? "✓" : "✗";
  console.log(
    `${mark} ${needle}: First Load JS ${gzKb.toFixed(1)} KB gzip ` +
      `(бюджет ${budgetKb} KB)`
  );
  if (!ok) failed = true;
}

if (failed) {
  console.error(
    "\nБюджет производительности превышен. Уменьшите вес First Load " +
      "(ленивые импорты тяжёлых зависимостей) или обоснуйте новый лимит."
  );
  process.exit(1);
}

console.log("\nВсе бюджеты в пределах нормы.");

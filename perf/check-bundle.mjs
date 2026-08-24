// T7 — детерминированный бюджет First Load JS для критичных публичных роутов.
// Считает РЕАЛЬНЫЙ gzip-размер объединения first-load чанков и падает
// (exit 1), если он превышает лимит.
// Запуск: `npm run build` затем `npm run perf:budget` (или в CI после build).
//
// Почему не только Lighthouse: LHCI требует поднятый сервер + сид данных +
// env для динамического /apply/[slug]. Этот чек детерминирован, без сети и
// инфраструктуры — ловит регрессию веса на каждом PR. LHCI (perf/LCP/CLS)
// остаётся для прогонов против preview-URL (см. perf/README.md).
//
// Источник данных сменился в Next 16. Раньше читали
// .next/app-build-manifest.json — в 16 этого файла нет ни при сборке
// Turbopack (дефолт), ни при `next build --webpack`, и колонки размеров из
// вывода сборки тоже убрали. Взамен Next пишет
// .next/diagnostics/route-bundle-stats.json: массив записей
// { route, firstLoadUncompressedJsBytes, firstLoadChunkPaths }. Это точнее
// прежнего манифеста — список чанков сразу именно first-load, а не все
// чанки роута. Внимание на пути: здесь они уже включают префикс «.next/»
// (в старом манифесте были относительны .next/), поэтому join только с cwd.

import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";

// Бюджеты в КБ (gzip). Ключ — фрагмент имени роута в route-bundle-stats.
//
// Лимит подняли 150 → 175 при переходе на Next 16, потому что сменилась БАЗА
// ИЗМЕРЕНИЯ, а не потому, что страница потяжелела. Замеры на одном и том же
// коммите:
//   Next 15 + webpack:   141 чанк, 931.4 KB gzip всего клиентского JS,
//                        apply/[slug] = 118.4 KB по app-build-manifest;
//   Next 16 + Turbopack:  60 чанков, 864.2 KB gzip всего (−7%),
//                        apply/[slug] = 165.9 KB по route-bundle-stats.
// Суммарно приложение отдаёт МЕНЬШЕ JS, но Turbopack дробит вдвое крупнее,
// поэтому в first-load любого маршрута попадает больше общих чанков.
// Что это именно общий базис, а не вес самой страницы, видно по разбросу:
// из 78 маршрутов минимум 487 KB, медиана 496 KB, apply/[slug] 533 KB
// (несжатые) — собственного кода у страницы ~46 KB над полом приложения.
// Пол ≈ 152 KB gzip, поэтому 175 — это текущие 165.9 плюс небольшой запас;
// регрессию чек по-прежнему поймает.
//
// Вариант «остаться на webpack» отпадает: Next 16 при `next build --webpack`
// не пишет ни app-build-manifest.json, ни route-bundle-stats.json, то есть
// per-route вес там измерить нечем вообще.
const BUDGETS_KB = {
  "apply/[slug]": 175, // публичная страница отклика — главный вход кандидата
};

const STATS = path.join(
  process.cwd(),
  ".next",
  "diagnostics",
  "route-bundle-stats.json"
);

if (!fs.existsSync(STATS)) {
  console.error(
    `✗ ${STATS} не найден. Сначала соберите проект: \`npm run build\`.`
  );
  process.exit(1);
}

const stats = JSON.parse(fs.readFileSync(STATS, "utf8"));

let failed = false;

for (const [needle, budgetKb] of Object.entries(BUDGETS_KB)) {
  const entry = stats.find((r) => r.route.includes(needle));
  if (!entry) {
    console.error(`✗ Роут «${needle}» не найден в статистике — чек невалиден.`);
    failed = true;
    continue;
  }

  // Уникальные чанки (один файл может встречаться несколько раз).
  const files = [...new Set(entry.firstLoadChunkPaths)];
  let gzBytes = 0;
  const missing = [];
  for (const f of files) {
    const p = path.join(process.cwd(), f);
    if (!fs.existsSync(p)) {
      missing.push(f);
      continue;
    }
    gzBytes += zlib.gzipSync(fs.readFileSync(p)).length;
  }
  // Пропущенный чанк занизил бы результат и дал бы ложное «в пределах
  // нормы» — это сломанный чек, а не пройденный.
  if (missing.length) {
    console.error(
      `✗ ${needle}: ${missing.length} из ${files.length} чанков нет на диске ` +
        `(${missing[0]}…) — чек невалиден.`
    );
    failed = true;
    continue;
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

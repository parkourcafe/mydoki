// Юнит-тесты sitemap / hreflang / robots.txt. Запуск: npm run test:unit

import { test } from "node:test";
import assert from "node:assert/strict";

import { localizedAlternates } from "../../lib/seoAlternates.ts";
import { buildSitemap, type SitemapPage } from "../../lib/sitemapBuilder.ts";
import { COMPARISON_KEYS, comparisonLocales, getComparison } from "../../lib/comparisons.ts";
import { buildRobotsTxt } from "../../lib/robotsTxt.ts";

const APP = "https://www.doki.help";
const HR_COMPARISONS = ["google-form", "hr-whatsapp", "email-attachments", "spreadsheet-tracker"];

const pages: SitemapPage[] = [
  { path: "", lastModified: "2026-08-26", priority: 1, changeFrequency: "weekly" },
  { path: "/faq", lastModified: "2026-07-19", priority: 0.5, changeFrequency: "monthly" },
  { path: "/hiring", lastModified: "2026-08-26", priority: 0.5, changeFrequency: "monthly" },
  ...COMPARISON_KEYS.map(
    (k): SitemapPage => ({
      path: `/vs/${k}`,
      locales: comparisonLocales(k),
      lastModified: "2026-09-28",
      priority: 0.5,
      changeFrequency: "monthly",
    })
  ),
];
const sitemap = buildSitemap(pages, APP);
const urls = sitemap.map((e) => e.url);

test("comparisonLocales: HR-сравнения без uz, Госуслуги только ru", () => {
  for (const k of HR_COMPARISONS) assert.deepEqual(comparisonLocales(k), ["ru", "en", "id"], k);
  assert.deepEqual(comparisonLocales("gosuslugi"), ["ru"]);
  assert.deepEqual(comparisonLocales("paper"), ["ru", "en", "id", "uz"]);
  assert.deepEqual(comparisonLocales("nope"), []);
});

test("sitemap: только префиксные (self-canonical) URL, без дублей", () => {
  for (const u of urls) assert.match(u, /^https:\/\/www\.doki\.help\/(ru|en|id|uz)(\/|$)/, u);
  assert.equal(new Set(urls).size, urls.length);
  assert.ok(!urls.includes(`${APP}/`));
  assert.ok(urls.includes(`${APP}/en`));
});

test("sitemap: /faq и /hiring на всех языках", () => {
  for (const l of ["ru", "en", "id", "uz"]) {
    assert.ok(urls.includes(`${APP}/${l}/faq`), `${l}/faq`);
    assert.ok(urls.includes(`${APP}/${l}/hiring`), `${l}/hiring`);
  }
});

test("sitemap: нет /uz/vs/* для сравнений без узбекского текста", () => {
  for (const k of HR_COMPARISONS) {
    assert.ok(!urls.includes(`${APP}/uz/vs/${k}`), k);
    assert.ok(urls.includes(`${APP}/id/vs/${k}`), k);
    const entry = sitemap.find((e) => e.url === `${APP}/en/vs/${k}`)!;
    assert.equal(entry.alternates?.languages?.uz, undefined);
  }
  assert.deepEqual(
    urls.filter((u) => u.includes("/vs/gosuslugi")),
    [`${APP}/ru/vs/gosuslugi`]
  );
});

test("sitemap: у каждой записи lastModified (YYYY-MM-DD) и hreflang на саму себя", () => {
  for (const e of sitemap) {
    assert.match(String(e.lastModified), /^\d{4}-\d{2}-\d{2}$/, e.url);
    const langs = Object.values(e.alternates?.languages ?? {});
    assert.ok(langs.includes(e.url), `${e.url} нет в своём hreflang-кластере`);
  }
});

test("hreflang: x-default только у полностью переведённых страниц", () => {
  const full = sitemap.find((e) => e.url === `${APP}/en/faq`)!;
  assert.equal(full.alternates?.languages?.["x-default"], `${APP}/faq`);
  const home = sitemap.find((e) => e.url === `${APP}/en`)!;
  assert.equal(home.alternates?.languages?.["x-default"], `${APP}/`);
  const partial = sitemap.find((e) => e.url === `${APP}/en/vs/hr-whatsapp`)!;
  assert.equal(partial.alternates?.languages?.["x-default"], undefined);
});

test("canonical: язык без перевода ведёт на ru, а не на себя", () => {
  const uz = localizedAlternates("/vs/hr-whatsapp", comparisonLocales("hr-whatsapp"), "uz", "ru", APP);
  assert.equal(uz.canonical, `${APP}/ru/vs/hr-whatsapp`);
  const id = localizedAlternates("/vs/hr-whatsapp", comparisonLocales("hr-whatsapp"), "id", "ru", APP);
  assert.equal(id.canonical, `${APP}/id/vs/hr-whatsapp`);
  const full = localizedAlternates("/vs/paper", comparisonLocales("paper"), "uz", "ru", APP);
  assert.equal(full.canonical, `${APP}/uz/vs/paper`);
});

test("meta description сравнений ≤155 символов", () => {
  for (const k of COMPARISON_KEYS) {
    for (const [loc, c] of Object.entries(getComparison(k)!.locales)) {
      if (c?.metaDescription) assert.ok(c.metaDescription.length <= 155, `${k}/${loc}`);
    }
  }
});

const robots = buildRobotsTxt(APP);

/** Группа robots.txt, в которой перечислен агент. */
function groupFor(agent: string): string[] {
  const blocks = robots.split(/\n\s*\n/);
  const block = blocks.find((b) => b.split("\n").some((l) => l.trim() === `User-agent: ${agent}`));
  assert.ok(block, `нет группы для ${agent}`);
  return block.split("\n").map((l) => l.trim());
}

/** Упрощённый RFC 9309: самое длинное совпадение, при равенстве — Allow. */
function allowed(agent: string, path: string): boolean {
  let best = { len: -1, allow: true };
  for (const line of groupFor(agent)) {
    const m = line.match(/^(Allow|Disallow):\s*(\S*)$/);
    if (!m || !path.startsWith(m[2])) continue;
    const len = m[2].length;
    const allow = m[1] === "Allow";
    if (len > best.len || (len === best.len && allow)) best = { len, allow };
  }
  return best.allow;
}

test("robots: /api закрыт, но /api/md (из llms.txt) открыт для поиска и ассистентов", () => {
  for (const agent of ["*", "OAI-SearchBot", "Claude-SearchBot", "PerplexityBot"]) {
    assert.equal(allowed(agent, "/api/md"), true, agent);
    assert.equal(allowed(agent, "/api/classify"), false, agent);
    assert.equal(allowed(agent, "/my"), false, agent);
    assert.equal(allowed(agent, "/en/vs/hr-whatsapp"), true, agent);
  }
});

test("robots: краулеры обучения закрыты полностью, Content-Signal ai-train=no", () => {
  for (const agent of ["GPTBot", "Google-Extended", "CCBot"]) {
    assert.equal(allowed(agent, "/api/md"), false, agent);
    assert.equal(allowed(agent, "/en"), false, agent);
  }
  assert.match(robots, /^Content-Signal: search=yes, ai-input=yes, ai-train=no$/m);
  assert.match(robots, new RegExp(`^Sitemap: ${APP}/sitemap\\.xml$`, "m"));
});

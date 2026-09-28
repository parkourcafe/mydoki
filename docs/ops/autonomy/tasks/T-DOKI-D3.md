# T-DOKI-D3 — SEO существующих страниц (Индонезия, HR) + техника sitemap/robots

- **task_id:** T-DOKI-D3
- **repo / base:** parkourcafe/mydoki, ветка `claude/autonomy-doki-01` от 52d9de5 (PR #116 → `claude/cool-volta-pdpl4t`)
- **статус:** TESTED_LOCAL (unit + локальная сборка `next build` / `next start`). Прод не проверен: BLOCKED_EXTERNAL
- **коммиты:** ff7fd71 (техника), 6168929 (meta descriptions)
- **скиллы:** `doki-id-seo-optimizer`, `doki-seo-optimizer`, `doki-id-brand-voice`

## Пробелы из задачи оркестратора: проверка и исправление

| Пробел | Подтвердился? | Что сделано |
|---|---|---|
| robots закрывает `/api`, а llms.txt ведёт на `/api/md` | да: `app/robots.txt/route.ts` (PRIVATE включал `/api`), `app/llms.txt/route.ts` → `/api/md` | `Allow: /api/md` для `*` и ИИ-поиска (RFC 9309, побеждает более длинное правило). Краулеры обучения закрыты полностью, `Content-Signal ai-train=no` без изменений. Правила вынесены в `lib/robotsTxt.ts` |
| 4 HR-сравнения без `uz`, а `/uz/vs/*` стоят в sitemap и hreflang | да: `lib/comparisons.ts`, у `google-form`, `hr-whatsapp`, `email-attachments`, `spreadsheet-tracker` есть только ru/en/id; страница отдавала ru с canonical на себя | `comparisonLocales()`; hreflang и sitemap строятся только по языкам с текстом; `/uz/vs/<hr>` получает canonical на `/ru/vs/<hr>`. Госуслуги (только ru) идут через тот же хелпер. Перевод на uz не добавлял: в плане `ru` обязателен, id/en добавляем (`docs/seo/indonesia-content-plan.md` §4), а uz-аудитория — семейный сейф |
| в sitemap нет `lastModified` | да | дата последней правки контента по источникам (`git log -1 --format=%cs`), таблица `LASTMOD` в `app/sitemap.ts` |
| `/faq` и `/hiring` индексируются, но их нет в sitemap | да: у обеих robots index от layout, словари на 4 языка | добавлены на 4 языках |
| в sitemap URL без префикса локали, которые не self-canonical | да: `lib/seo.ts` ставит canonical на `/{locale}…`, а sitemap отдавал ещё и `/path` | в sitemap только префиксные URL; без-префиксный остаётся x-default в hreflang |
| (найдено попутно) llms.txt ссылался на без-префиксные URL | да | ссылки заменены на `/en/…` и `/ru/…` (self-canonical) |
| (найдено попутно) og:url и breadcrumb у `/vs/*` без префикса | да | og:url равен canonical, breadcrumb с языком |

## Контент (реестры)
Проверил скриптом длины title (≤60) и meta (≤155, <70 — слишком коротко) для en/id во всех реестрах. Исправлено в HR-области:
- `hr-whatsapp`, `email-attachments` (en/id): meta было 56–67 символов → 148–151. Добавлено поле `metaDescription`, видимый subtitle не менялся.
- сегменты `employers` (en 167), `recruitment-agencies` (en 173, id 164) → 148–153.
- Не трогал (вне HR-области, семейный B2C): 8 гайдов `lib/guides.ts` (meta 156–170), `bali-relocation-checklist` en (166), сравнения `notary` id (title 62), `google-drive`/`telegram` id (meta 156–162). Это задача для следующего запуска.

## Проверки
- `npm run test:unit` → 187/187 pass (новый `tests/unit/seo.test.ts`: 10 тестов — sitemap, hreflang, canonical, robots)
- мутация: если убрать `Allow: /api/md`, тест robots падает (pass 9 / fail 1)
- `npm run typecheck` → ok; `npm run lint` → 0 ошибок, 18 предупреждений (столько же на базе)
- `npm run test:lexicon` → OK
- `next build` (заглушки env Supabase) → ok; `next start` + curl:
  - `/sitemap.xml`: 319 URL, у всех 319 есть `<lastmod>`, без-префиксных нет, `/uz/vs/hr-whatsapp` нет, есть `/{ru,en,id,uz}/faq` и `/hiring`
  - `/uz/vs/hr-whatsapp` → canonical `/ru/vs/hr-whatsapp`, hreflang ru/en/id
  - `/id/vs/hr-whatsapp` → новая meta description; `/uz/vs/paper` → self-canonical + x-default
  - `/robots.txt` → `Allow: /api/md`; `/api/md` → 200

## Не проверено
- Продакшен: сайт закрыт сетевой политикой → BLOCKED_EXTERNAL.
- Вычитка BI носителем (новые meta) — BLOCKED_DECISION (давний блокер из `docs/gtm-dashboard.md` §1).

## Чек-лист владельцу на 5 минут (после деплоя ветки)
1. `https://www.doki.help/sitemap.xml`: есть `<lastmod>`, нет `https://www.doki.help/vs/...` без языка, нет `/uz/vs/hr-whatsapp`.
2. `https://www.doki.help/robots.txt`: в группе `User-agent: *` есть `Allow: /api/md`, у GPTBot по-прежнему `Disallow: /`.
3. Исходный код `https://www.doki.help/uz/vs/hr-whatsapp`: `<link rel="canonical" href=".../ru/vs/hr-whatsapp">`.
4. Search Console → Sitemaps → повторно отправить `sitemap.xml`.

## next_step
Привести meta семейных гайдов к ≤155 (отдельная задача); дальше — GSC-driven цикл, когда появятся данные.

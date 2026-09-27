# T-DOKI-01 — проверка найма, RLS, узких мест и SEO-проводки

- **task_id:** T-DOKI-01
- **repo:** parkourcafe/mydoki (DOKI.help)
- **base branch:** `claude/cool-volta-pdpl4t` @ `68844b46ed2c2f9b77c5ea90efe9df6ebb539d8a`
- **branch:** `claude/autonomy-doki-01`
- **дата прогона:** 2026-09-27, локально, синтетические данные, одноразовая PostgreSQL 16 (`localhost`, база `doki01`)

Метки статуса: `DONE_CODE` (код написан), `TESTED_LOCAL` (проверено локальным прогоном),
`BLOCKED_EXTERNAL` (нужен внешний доступ), `BLOCKED_DECISION` (нужно решение владельца),
`NOT_VERIFIED` (не проверено).

## 1. Выбор ветки найма — TESTED_LOCAL

Использована `claude/cool-volta-pdpl4t` @ 68844b4.

Почему:
- `git ls-remote --heads` + `git for-each-ref --sort=-committerdate`: самая свежая ветка — именно она
  (2026-09-18, merge PR #115). Следующие по дате — `chore/disable-vercel-auto-runs-20260918`,
  `claude/candidate-passport-talent-pool-ppq5b2` (PR #111), `claude/reactive-resume-analysis-7ond6f`
  (PR #114) — все три уже являются предками базы (`git merge-base --is-ancestor` → да).
- GitHub `list_pull_requests` (state=all, sort=updated): открытых PR нет; последние PR (#115, #111, #114,
  #113, #112, #108, #110) смёржены в `claude/cool-volta-pdpl4t`.
- `main` опережает базу на 3 коммита — только `app/agents.md/route.ts` (PR #109, описание продукта для
  AI-агентов), кода найма там нет.
- `claude/registration-google-auth-errors-9yn1hc` опережает на 1 коммит — это PR #110, влитый в базу
  squash-коммитом `ac848de`; содержимое уже в базе.

Интерпретация: «ветка найма» = ветка, куда мёржатся PR найма (#107–#115); более новой нет.

## 2. Сквозной сценарий найма — TESTED_LOCAL (уровень БД), NOT_VERIFIED (браузер)

Добавлен самопроверяющийся тест `tests/rls/hiring_flow.sql` и подключён в `tests/rls/run.sh:48`.
Шаги повторяют реальные вызовы приложения:

| Шаг | Что вызывает приложение | Проверка в тесте |
|---|---|---|
| Работодатель без подтверждения | `create_vacancy` (`app/employer/actions.ts:338`) | ожидается `EMPLOYER_NOT_VERIFIED` (`hiring_flow.sql:25`) |
| Создание вакансии | `create_vacancy` + update + `vacancy_versions` (`actions.ts:338–373`) | slug/id получены, версия записана |
| Кандидат (anon) | `precheck_application`, `submit_application` (`app/apply/actions.ts`) | вакансия видна анониму, первый отклик не дубликат, повтор возвращает тот же токен (`:61–87`) |
| Аноним читает `applications` | — | отказ (`:94`) |
| Доска работодателя | загрузчик `app/employer/vacancies/[id]/page.tsx:55–89` | 1 отклик, 1 документ, 1 ответ (`:111–118`); `mark_application_viewed` → `viewed` (`:125`) |
| Чужой подтверждённый работодатель | — | не видит отклик/документы/ответы и не меняет статус (`:140`, `:150`) |

Мутационная проверка: если внутри транзакции отключить RLS на `applications`, тест падает с
`FAIL: чужой работодатель видит отклик` — то есть тест умеет краснеть.

Не проверено (NOT_VERIFIED): сквозной прогон через браузер/Next.js с настоящим Supabase Auth,
PostgREST и Storage — локально их нет, а удалённые базы использовать запрещено.
Серверные действия (Turnstile, письма, push, снимок паспорта) в SQL-тесте не исполняются.

## 3. Passport и Talent Pool — TESTED_LOCAL

- Юнит-тесты паспорта/сопоставления/видимости/снимка (`tests/unit/passport*.test.ts`,
  `matching.test.ts`) входят в `npm run test:unit`: 177/177 pass.
- RLS-файлы из PR #111 прогнаны на `doki01` вручную (`psql -f`), exit 0; вывод сверен с
  ожидаемыми значениями в комментариях файлов:
  - `talent_pool_visibility.sql`: employer_sees_resumes=0, pool_default=0,
    pool_confidential=1 / blind / has_ref=t / остальные поля f, pool_blocked=0,
    pool_current_employer=0, pool_unavailable=0, membership_kept=active,
    `verified employer required`, pool_revoked=0, снимок неизменяем (update и delete).
  - `opportunity_invite_flow.sql`: has_ref=t/has_user_id=f, `invite disclosures incomplete`,
    employer_direct_table_reads=0, `sent|true|null|f|f|f`, после accept
    `accepted|Operations manager|f|f|f|f`, share&apply `1|1|1|1`, повтор `1|1|checksum-1`.
- Эти два файла печатают значения, а не падают при нарушении, поэтому `run.sh` их не
  запускает (так и было до этой задачи; отмечено в `tests/rls/README.md`).

## 4. RLS-тесты PR #114 — TESTED_LOCAL

`npm run test:rls` на свежей `doki01`: применено 70 миграций, пройдены `isolation`,
`document_versions`, `invitations`, `claim_application`, `write_roles` и новый `hiring_flow`.

## 5. Узкое место — NOT PROVEN, код не менялся

Замер (`EXPLAIN ANALYZE` под ролью `authenticated`, RLS включён; 51 работодатель,
251 вакансия, 8300 откликов, у целевой вакансии 300 откликов × 3 документа × 3 ответа):

| Запрос доски | Execution time |
|---|---|
| `applications` по вакансии | 4.6 ms |
| `application_documents` `in (…)` | 16.6 ms |
| `application_answers` `in (…)` | 19.3 ms |
| 300 × `mark_application_viewed` (сторона БД) | 28 ms суммарно |

Наблюдения:
- N+1 по данным нет: документы и ответы грузятся двумя пакетными `in(...)` параллельно
  (`page.tsx:80–89`).
- `markApplicationsViewed` (`app/employer/actions.ts:1060`) делает по одному RPC на каждый
  новый отклик (N запросов, но параллельно через `Promise.all`). Стоимость сетевых
  round trip к PostgREST локально измерить нельзя; на стороне БД это 28 ms на 300 откликов.
- Политика `vacancies member read` даёт Seq Scan по `vacancies` с вызовом
  `private.can_access_employer` на каждую строку (~4 ms на 251 вакансию); растёт линейно
  с числом вакансий всех арендаторов. При текущем объёме не узкое место.

Вывод: узкое место не доказано; по правилу задачи ничего не менялось. Если на проде доска
станет медленной — начать с пакетного RPC вместо N вызовов `mark_application_viewed`
(нужна миграция → решение владельца).

## 6. SEO по `docs/seo/indonesia-content-plan.md` — TESTED_LOCAL, пробелов нет

- Все 21 URL плана (§2, §3, §3a: 3 сегмента, 10 чек-листов, 4 сравнения, 3 лендинга + дозаливка
  в `document-expiry-reminder`) есть в типизированных реестрах (`lib/checklists.ts`,
  `lib/segments.ts`, `lib/comparisons.ts`, `lib/landings.ts`) и у каждого лендинга есть
  `app/<slug>/page.tsx`.
- Собранное приложение (`next build --webpack` + `next start`): каждый URL есть в
  `/sitemap.xml` с `/id/` вариантом (`app/sitemap.ts:22–27`), `/id/…` и `/en/…` отвечают 200.
  Все 392 URL sitemap отвечают 200 (главная — после подстановки фиктивных
  `NEXT_PUBLIC_SUPABASE_*`; без них 500 из-за отсутствия env, это не проводка).
- `/id/checklists/ijazah-transkrip-checklist`: canonical на `/id/…`, hreflang ru/en/id/uz/x-default,
  8 блоков JSON-LD.
- Новых статей нет: план не помечает следующую запись; дальше только GSC-driven (§3 «21–30», §7),
  а данных GSC у агента нет → BLOCKED_EXTERNAL. Вычитка BI носителем и юр-ревью (итог плана) —
  BLOCKED_DECISION владельца.

## 7. Находка безопасности — BLOCKED_DECISION

Работодатель может сам поставить себе подтверждение и поднять лимит вакансий прямым
`UPDATE employer_profiles` через PostgREST:
- политика `employers manage own profile` — `FOR ALL` с проверкой только `user_id = auth.uid()`
  (`supabase/migrations/20260701000000_career_mvp.sql:110`);
- `grant select, insert, update on employer_profiles to authenticated`
  (`supabase/migrations/20260717030000_restore_release_privileges.sql:59`);
- триггеров и column-level ограничений на `verified_at`, `verification_*`, `vacancy_limit` нет.

Локальная проба (синтетика, откат): под `authenticated` `update employer_profiles set
verified_at = now(), vacancy_limit = 1000` прошёл, после чего `create_vacancy` создал
вакансию. Это обходит проверки `EMPLOYER_NOT_VERIFIED`
(`20260704000000_t4_verification_reports.sql:109`) и `verified employer required` в Talent Pool
(`20260819110000_talent_pool_confidential_discovery.sql:593`).

Оговорка: схема собрана только из миграций репозитория; живой проект мог получить
column-level гранты вне миграций — проверить без доступа к нему нельзя.
Нужно решение: миграция (триггер или column grants), запрещающая клиенту менять эти поля,
и проверка на живом проекте. Код не менялся.

## Изменённые файлы

- `tests/rls/hiring_flow.sql` — новый сквозной тест (DONE_CODE, TESTED_LOCAL)
- `tests/rls/run.sh` — `hiring_flow` добавлен в прогон
- `tests/rls/README.md` — строка о новом файле и о том, почему два файла PR #111 не в прогоне
- `docs/ops/autonomy/tasks/T-DOKI-01.md` — этот отчёт

CI/cron/Vercel не трогались: `vercel.json` (`git.deploymentEnabled: false`, без `crons`)
остаётся как после PR #115. `.github/workflows/ci.yml` не изменялся (он уже запускается
на `pull_request`; новый тест попадает в существующую job `RLS policies`).

## Команды и результаты

| Команда | Результат |
|---|---|
| `npm ci` | ok, 622 пакета (lockfile не менялся) |
| `npm run typecheck` | exit 0 |
| `npm run lint` | exit 0, 0 errors, 18 warnings (существовавшие) |
| `npm run test:unit` | 177 pass, 0 fail |
| `npm run test:lexicon` | `OK: запрещённой лексики нет.` |
| `PGHOST=localhost PGUSER=postgres PGDATABASE=doki01 npm run test:rls` | 70 миграций, 6/6 тестов ✓ |
| `psql -f tests/rls/talent_pool_visibility.sql` / `opportunity_invite_flow.sql` | exit 0, значения совпали с ожидаемыми |
| `npm run build` (Turbopack), 2 попытки (вторая с `NODE_USE_ENV_PROXY=1`, `NODE_EXTRA_CA_CERTS`) | exit 1: `Can't resolve '@vercel/turbopack-next/internal/font/google/font'` — загрузка Google Fonts в песочнице; NOT_VERIFIED |
| `next build --webpack` (тот же прокси-env) | exit 0, 103 страницы |
| `next start` + curl по 392 URL sitemap | все 200 (см. §6) |

## Блокеры

- **BLOCKED_EXTERNAL:** браузерный e2e найма нужен с настоящим Supabase (Auth/PostgREST/Storage)
  тестового проекта — доступа нет и использовать удалённые базы запрещено.
- **BLOCKED_EXTERNAL:** данные Google Search Console для GSC-driven этапа плана.
- **NOT_VERIFIED:** `npm run build` на Turbopack в песочнице (сеть к Google Fonts); проверить в CI или
  на машине с прямым доступом.
- **BLOCKED_DECISION:** закрытие самоподтверждения работодателя (§7).
- **BLOCKED_DECISION:** вычитка BI носителем и юр-ревью формулировок (итог контент-плана).

## next_step

1. Владельцу: решить по §7 (миграция, запрещающая клиенту менять `verified_at`,
   `verification_*`, `vacancy_limit`, с RLS-тестом) и проверить column grants на живом проекте.
2. Переписать `talent_pool_visibility.sql` и `opportunity_invite_flow.sql` на `raise` при
   нарушении и добавить их в `run.sh`.
3. Прогнать `npm run build` (Turbopack) в CI; при медленной доске на проде — замерить и
   рассмотреть пакетный `mark_application_viewed`.

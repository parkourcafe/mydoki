# T-DOKI-03 — вопрос №37 (триггер `employer_profiles` и Doki.id) и Talent Pool «текущий работодатель»

- **task_id:** T-DOKI-03 (T-DOKI-03a, T-DOKI-03b)
- **repo:** parkourcafe/mydoki (DOKI.help)
- **base:** `claude/autonomy-doki-01` @ `2bb04a7` (head draft PR #116; база #116 — `claude/cool-volta-pdpl4t`)
- **branch / PR:** `claude/doki-talent-pool-employer-match` → draft PR #117 (база `claude/autonomy-doki-01`, сливать после #116); ответ на №37 — комментарий в #117
- **Doki.id (только чтение):** `parkourcafe/Doki.id` @ `18438f627b75a793b099f2b5e3b239c8ee52a1be`, клон в scratchpad, ничего не менялось и не пушилось
- **дата прогона:** 2026-09-28, локально, синтетические данные, одноразовая PostgreSQL 16 (базы `postgres`, `t2`, с нуля)
- **статус:** 03a — DONE (анализ + локальная симуляция); 03b — TESTED_LOCAL (частично), остаток — BLOCKED_DECISION

---

## T-DOKI-03a. Сломает ли триггер из #116 Doki.id — **нет** (по коду Doki.id @ 18438f6)

Триггер `private.employer_profiles_guard_protected` (`supabase/migrations/20260928120000_employer_verification_guard.sql`)
запрещает ролям `authenticated`/`anon` задавать при INSERT и менять при UPDATE: `verified_at`,
`verification_*`, `vacancy_limit`, `domains`, `user_id`.

### Все обращения Doki.id к `employer_profiles`

| Поле(я) | Кто | Операция | Роль БД | Файл:строка (Doki.id) |
|---|---|---|---|---|
| `user_id`, `company_name`, `contact_whatsapp`, `contact_email`, `updated_at` | server action `saveEmployerProfile` | upsert `onConflict: user_id` (PostgREST: INSERT … ON CONFLICT DO UPDATE SET эти 5 колонок) | `authenticated` (серверный клиент на anon-ключе + cookie сессии, `lib/supabase/server.ts:8-14`) | `app/employer/actions.ts:27-36` |
| `id` | страница кабинета | select | `authenticated` | `app/employer/page.tsx:68-72` |
| `*` | форма новой вакансии | select | `authenticated` | `app/employer/vacancies/new/page.tsx:61-65` |
| `id` | карточка вакансии | select | `authenticated` | `app/employer/vacancies/[id]/page.tsx:32-36` |
| `id` (по `user_id = auth.uid()`) | RPC `create_vacancy` (вызов `app/employer/actions.ts:65`) | select внутри функции | SECURITY DEFINER | в общей БД действует версия mydoki `20260704000000_t4_verification_reports.sql:84` (исходник Doki.id: `supabase/migrations/20260701000000_career_mvp.sql:219`) |
| `contact_email` | RPC `submit_application` | select | SECURITY DEFINER | Doki.id `supabase/migrations/20260703000000_career_profile.sql:37`, `20260702000000_career_mvp_v2.sql:108` |
| `company_name` и др. через join | RPC `update_application_status`, `mark_application_viewed`, `get_application_status` | select | SECURITY DEFINER | Doki.id `supabase/migrations/20260701000000_career_mvp.sql:322,357,392,425` |
| — | service role (`lib/supabase/admin.ts`) | к `employer_profiles` **не обращается**: только `application_documents` и storage `applications` | service_role | `app/apply/actions.ts:235-285` |

Записей `verified_at`, `verification_*`, `vacancy_limit`, `domains` в Doki.id нет ни в TS, ни в SQL
(поиск `grep -rn employer_profiles app lib components supabase` по клону). Единственная запись —
upsert выше; `user_id` в нём = `auth.uid()`, при конфликте значение не меняется.

### Проверка на локальной БД

Скрипт-симуляция (scratchpad, в репозиторий не входит) воспроизводит ровно тот SQL, который
PostgREST строит для upsert из `app/employer/actions.ts:27`, под ролью `authenticated`:
1. первая вставка профиля — проходит (служебные поля берут дефолты: `vacancy_limit=3`, `domains='[]'`, `verification_attempts=0`);
2. владелец схемы ставит `verified_at`, `vacancy_limit=10`, `domains`;
3. повторный upsert того же пользователя — проходит, `company_name` обновился, `verified_at`/`vacancy_limit`/`domains` сохранились.
Результат одинаковый на схеме #116 и на схеме #116 + миграция этой ветки.

**Вывод:** по текущему коду Doki.id триггер его не ломает.
**Интерпретация / оговорки:**
- Общая ли БД на самом деле — в репозитории это следует только из комментариев mydoki
  (`20260705000000_vacancy_composer.sql:15`, `20260712210000_rls_hardening.sql:1-23`); на живых проектах не проверялось.
- Проверен код Doki.id на коммите `18438f6` (main). Если у Doki.id есть неслитые ветки или ручные
  SQL/админки вне репозитория, которые ставят `verified_at` или `vacancy_limit` под пользователем, — они упадут с `EMPLOYER_PROTECTED_FIELDS`.
- Не из-за триггера, но важно для Doki.id: `create_vacancy` в общей БД (mydoki `20260704000000`) требует
  подтверждённого работодателя, а в Doki.id нет UI подтверждения. Это было до #116.

---

## T-DOKI-03b. Talent Pool: «скрыть от текущего работодателя»

### Где решается
- Единственное место: `private.discovery_denied_reason` (`20260819110000_talent_pool_confidential_discovery.sql:285-366`).
  Через него идут `talent_pool_candidates` (там же, `:606`) и отправка приглашения (`:694`).
- Сверка была: список кандидата `profile_visibility_policies.current_employer_names` против
  `employer_profiles.company_name` **или** `employer_profiles.domains`.
- `company_name` работодатель меняет сам (`app/employer/actions.ts` saveEmployerProfile / saveCompanySettings; прямой update в PostgREST разрешён политикой "employers manage own profile").
- `domains` после #116 клиенту закрыт, **но его никто не заполняет**: ни код, ни миграции, кроме добавления колонки
  (`grep -rn domains app lib supabase/migrations`). Практически сверка шла только по названию.
- TS-зеркало `lib/passportVisibility.ts::isCurrentEmployer` — используется только в unit-тестах.

### Выбор сопоставления (по коду)
- **Подтверждённый домен — не выбран.** Подтверждение идёт кодом на `contact_email`
  (`app/employer/actions.ts` requestEmployerVerification), но домен адреса нигде не сохраняется, а `contact_email`
  работодатель потом меняет. Чтобы опираться на домен, нужно решить, что считать доменом организации
  (сохранять ли домен почты при подтверждении, что делать с gmail и т. п.) — это продуктовое решение (см. ниже).
- **id профиля — выбран, через `employments.company_id`.** Запись с `company_id` создаёт только
  `create_employment_from_application` (SECURITY DEFINER, по нанятому отклику, `20260712230000_employments.sql`);
  кандидат `company_id` не задаёт (политики "employments person insert/update manual").
- **Плюс снимок названия при подтверждении** (`employer_profiles.verified_company_name`) — закрывает
  переименование после подтверждения для кандидатов, нанятых не через Doki.

### Что сделано — `supabase/migrations/20260928130000_talent_pool_current_employer_match.sql`
1. Колонка `employer_profiles.verified_company_name` (nullable, аддитивно; Doki.id её не пишет).
2. Триггер `employer_profiles_verified_name`: при первом появлении `verified_at` (любой путь — RPC,
   service role, владелец) фиксирует `company_name`; ролям `authenticated`/`anon` задавать и менять колонку нельзя
   (`EMPLOYER_PROTECTED_FIELDS`, как в #116). Отдельный триггер — функцию из #116 не трогаем.
3. Бэкфилл: у уже подтверждённых снимок = текущее название.
4. `discovery_denied_reason`: «текущий работодатель» = действующее `employments` (status `active`, `company_id` = организация)
   **или** совпадение списка кандидата с `company_name` / `verified_company_name` / `domains`. Под тем же флагом
   `hide_current_employer`. Остальная функция без изменений (diff с `20260819110000` — только этот блок).
5. TS-зеркало `lib/passportVisibility.ts` — необязательные `verified_name`, `employs_candidate`.

### Проверки (реальные, локально)
- `tests/rls/talent_pool_current_employer.sql` (новый, в `run.sh`): контроль видимости посторонней организации;
  работодатель из списка не видит; переименование после подтверждения не открывает; снимок нельзя изменить/стереть;
  действующее трудоустройство скрывает без ввода названия; `hide_current_employer=false` отключает оба пути.
- **Без миграции тест падает:** на схеме #116 — `FAIL: работодатель переименовался и увидел кандидата, который скрыл его`;
  вариант без шагов 3–4 — `FAIL: организация, где кандидат работает сейчас, видит его профиль`.
- **С миграцией:** `bash tests/rls/run.sh` на пустой PostgreSQL 16 — применено 72 миграции, 10/10 файлов ✓.
  Повторное применение миграции — без ошибок.
- `node --test --experimental-strip-types tests/unit/passportVisibility.test.ts` — 20/20; без правки `lib/passportVisibility.ts` — 2 новых теста красные.
- Не запускалось локально: typecheck/lint/e2e (нет `node_modules`) — смотреть CI draft PR.

### BLOCKED_DECISION (владелец)
1. **Название до подтверждения никто не проверяет.** Работодатель может подтвердиться под любым названием
   («PT Samaran» вместо «PT Nyata») — тогда сверка по имени не сработает с самого начала. Варианты:
   (a) модерация названия при подтверждении; (b) подтверждение домена (см. п. 2); (c) оставить как есть и
   прямо сказать кандидату в UI, что скрытие по названию — «по возможности», а надёжно — блокировка организации.
2. **Домены организации не заполняются.** Варианты: (a) при подтверждении кодом сохранять домен `contact_email`
   в `domains`, кроме бесплатных почтовых (нужен список: gmail.com, yahoo.com, …); (b) ручное заполнение
   владельцем после проверки; (c) не использовать домены. От ответа зависит и блокировка по домену.
3. **Работодатель сам может перевести `employments.status` в `ended`** (политика "employments company update")
   и после этого увидеть бывшего сотрудника. Варианты: (a) скрывать и от прошлых работодателей N месяцев после `end_date`;
   (b) скрывать от любой организации, где было трудоустройство (жёстче, но меняет смысл «текущего»); (c) оставить
   (кандидат видит смену статуса у себя в «Мои трудовые отношения»).
4. Несколько отдельных профилей одной компании (`employer_profiles` 1:1 с пользователем): путь через `employments`
   ловит только профиль, который нанимал; остальные — только по названию.

### Изменённые файлы
- `supabase/migrations/20260928130000_talent_pool_current_employer_match.sql` (новый)
- `tests/rls/talent_pool_current_employer.sql` (новый), `tests/rls/run.sh`, `tests/rls/README.md`
- `lib/passportVisibility.ts`, `tests/unit/passportVisibility.test.ts`
- `docs/ops/autonomy/tasks/T-DOKI-03.md`

### Порядок слияния
После #116: миграция `20260928130000` опирается на триггер и колонки `20260928120000` (тот же код ошибки
`EMPLOYER_PROTECTED_FIELDS`, `verified_at` ставит только сервер). Применять к Supabase (preview/production) —
только владельцу; в этом прогоне к живым БД ничего не применялось.

### SQL-проверка для владельца (только чтение, запускать самому)
```sql
-- сколько подтверждённых работодателей и у скольких заполнены domains
select count(*) filter (where verified_at is not null)                   as verified,
       count(*) filter (where jsonb_array_length(domains) > 0)          as with_domains
  from public.employer_profiles;
-- сколько кандидатов прячутся от текущего работодателя по названию
select count(*) from public.profile_visibility_policies
 where hide_current_employer and jsonb_array_length(current_employer_names) > 0;
```

### Не проверено
- Живые Supabase-проекты, реальная общность БД с Doki.id — BLOCKED_EXTERNAL (запрет на запросы к production).
- CI #117 на `a7396e0`: `Typecheck + lint`, `Unit tests + lexicon`, `RLS policies`, `E2E (Playwright)`, `First Load JS budget` — success; `Lighthouse CI (preview)`, `Supabase Preview` — skipped (GitHub check runs).

### next_step
- CI зелёный; PR ждёт слияния #116 и решения владельца.
- Решения владельца по пп. 1–3 BLOCKED_DECISION; после п. 2 — заполнение `domains` отдельной задачей.

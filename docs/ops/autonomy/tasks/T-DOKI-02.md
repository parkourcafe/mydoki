# T-DOKI-02 — D1 (draft PR, CI) и D2 (найм: права доступа тестами)

- **task_id:** T-DOKI-02 (продолжение `T-DOKI-01.md`, его next_step п.1–2)
- **repo:** parkourcafe/mydoki (DOKI.help)
- **base:** `claude/cool-volta-pdpl4t` @ `68844b46ed2c2f9b77c5ea90efe9df6ebb539d8a`
- **branch / PR:** `claude/autonomy-doki-01` → draft PR #116
- **дата прогона:** 2026-09-28, локально, синтетические данные, одноразовая PostgreSQL 16
  (`localhost`, базы `doki02`–`doki05`, пересоздавались с нуля)

## D1. Draft PR и CI — DONE (CI зелёный на коммите 52d9de5)

PR #116 уже существовал (draft, база `claude/cool-volta-pdpl4t`). Check runs на `52d9de5`
(GitHub `get_check_runs`): `Typecheck + lint`, `Unit tests + lexicon`, `RLS policies`,
`E2E (Playwright)`, `First Load JS budget` — success; `Lighthouse CI (preview)`,
`Supabase Preview` — skipped. Результат CI на новых коммитах этого прогона — см. PR #116
после push (здесь не утверждается).

## D2.1. RLS-тесты PR #111 теперь падают при нарушении — TESTED_LOCAL

`tests/rls/talent_pool_visibility.sql` и `tests/rls/opportunity_invite_flow.sql` печатали
значения для ручной сверки и не входили в `run.sh`. Каждая проверка переписана в `do`-блок с
`raise exception 'FAIL: …'`; оба файла добавлены в `tests/rls/run.sh`.
Дополнительно к прежним проверкам: выдача Talent Pool и приглашения проверяются на утечку
значений (имя, телефон, email, путь CV, user_id) в любом ключе, а повторный `share_and_apply`
должен вернуть тот же `application_id`.

Мутационная проверка (копии файлов в scratchpad, по одной поломке) — все 5 красные:

| Поломка | Ошибка теста |
|---|---|
| убран `block_organization` | `FAIL: заблокированная организация видит профиль` |
| кандидат не скрывает текущего работодателя | `FAIL: текущий работодатель видит профиль` |
| не ставится `verification_revoked_at` | `FAIL: выдача без действующей верификации` |
| кандидат передаёт `key_achievements` при принятии | `FAIL: выдано поле вне scope разрешения` |
| приглашение с заполненными условиями | `FAIL: приглашение без раскрытия условий отправлено` |

Не покрыто: п.9 шапки `opportunity_invite_flow.sql` (объяснение по критериям в снимке пишет БД
из `match_assessments`) — в файле этой проверки не было и нет; отмечено в `tests/rls/README.md`.

## D2.2. Подтверждение работодателя — DONE_CODE, TESTED_LOCAL; применение — BLOCKED_DECISION

Миграция `supabase/migrations/20260928120000_employer_verification_guard.sql` + тест
`tests/rls/employer_verification.sql` (в `run.sh`).

**Находка A (из T-DOKI-01 §7) — самоподтверждение.** Работодатель мог прямым update через
PostgREST поставить себе `verified_at`, поднять `vacancy_limit`, сбросить
`verification_attempts`. Исправление: триггер `employer_profiles_guard_protected` запрещает
ролям `authenticated`/`anon` менять `verified_at`, `verification_*`, `vacancy_limit`, `domains`,
`user_id` (и вставлять профиль с не-дефолтными значениями этих полей). SECURITY DEFINER-функции
и service role не ограничены. Приложение пишет только `company_name`, `contact_*`, `country`,
`default_consent_text`, `retention_months`, `updated_at` (`app/employer/actions.ts:176`, `:220`) —
тест повторяет этот upsert и проходит.

**Находка B (новая) — Talent Pool отключается через 15 минут после подтверждения.**
`verification_expires_at` — это и срок 6-значного кода (`set_employer_verification`,
`app/employer/actions.ts:116`, 15 минут), и срок подтверждения организации в Talent Pool
(`20260819110000_talent_pool_confidential_discovery.sql:279`, `:324`,
`app/employer/talent/page.tsx:54`). `confirm_employer_verification` срок кода не сбрасывал.
Воспроизведено локально: после успешного `confirm_employer_verification` при истёкшем сроке
кода `talent_pool_candidates` → `verified employer required`,
`private.verified_employer_for_uid()` → null.
Интерпретация: работодатель, подтверждённый реальным путём (код на почту), не может
пользоваться Talent Pool уже через 15 минут. На живой базе не проверялось.
Исправление: `confirm_employer_verification` обнуляет `verification_expires_at`; бэкфилл
обнуляет его у уже подтверждённых работодателей без активного кода (проверено: у
неподтверждённого с живым кодом значение не трогается).

Проверки: тест красный на схеме без миграции (`FAIL: профиль вставлен сразу подтверждённым`),
зелёный с ней; миграция повторно применяется без ошибок.

Побочное: фикстуры `talent_pool_visibility.sql`/`opportunity_invite_flow.sql` ставили
`verified_at` и `domains` от имени работодателя (то есть опирались на находку A); теперь это
делается под владельцем схемы, как в `hiring_flow.sql`.

**Почему BLOCKED_DECISION.** Миграция меняет права и данные в общей базе. Шапка
`20260705120000_vacancy_limit.sql` говорит о совместимости с Doki.id — эта же таблица может
использоваться другим приложением, код которого здесь не виден. Если Doki.id пишет
`verified_at`/`vacancy_limit`/`domains` клиентской ролью, триггер его сломает.
Решение владельца:
1. подтвердить, что Doki.id не пишет эти поля ролью `authenticated`
   (или что таблица не общая);
2. решить, мёржить ли миграцию вместе с PR #116 или вынести в отдельный PR;
3. после применения — проверить на живом проекте запросом
   `select count(*) from employer_profiles where verified_at is not null and verification_expires_at is not null`
   (ожидается 0) и что работодатель с кодом видит `/employer/talent`.

Не исправлено (интерпретация, для решения): «текущий работодатель» в Talent Pool скрывается
по `company_name`, а `company_name` работодатель меняет сам — переименовавшись, он может снова
увидеть сотрудника, который его скрыл. `domains` теперь защищены, название — нет.

## Изменённые файлы

- `tests/rls/talent_pool_visibility.sql`, `tests/rls/opportunity_invite_flow.sql` — assert-проверки
- `tests/rls/employer_verification.sql` — новый тест
- `tests/rls/run.sh` — +3 файла в прогоне
- `tests/rls/README.md` — описание
- `supabase/migrations/20260928120000_employer_verification_guard.sql` — новая миграция
- `docs/ops/autonomy/tasks/T-DOKI-02.md` — этот журнал

## Команды и результаты

| Команда | Результат |
|---|---|
| `bash tests/rls/run.sh` на пустой `doki02` (до изменений) | 70 миграций, 6/6 ✓ |
| `bash tests/rls/run.sh` на пустой `doki03` (после D2.1) | 70 миграций, 8/8 ✓ |
| 5 мутаций D2.1 | 5/5 красные (таблица выше) |
| `employer_verification.sql` на `doki03` без миграции | красный, как ожидалось |
| `bash tests/rls/run.sh` на пустой `doki05` (после D2.2) | 71 миграция, 9/9 ✓ |
| повторное применение миграции | exit 0 |
| бэкфилл на синтетике | подтверждённый: срок обнулён; ожидающий код: не тронут |

Не запускалось локально: `npm ci`, typecheck, lint, unit, e2e, build — `node_modules` в этой
сессии нет, TS/TSX-файлы не менялись. Проверка — CI PR #116.

## Блокеры

- **BLOCKED_DECISION:** применение миграции `20260928120000` (см. D2.2, три пункта).
- **BLOCKED_EXTERNAL:** браузерный e2e найма с настоящим Supabase — без изменений с T-DOKI-01.

## next_step

1. Дождаться CI PR #116 на новых коммитах; при красном — чинить.
2. D3: SEO по `docs/seo/indonesia-content-plan.md` — доработка существующих страниц
   (T-DOKI-01 §6: все 21 URL на месте, нужен конкретный список правок существующих страниц).
3. D4: посевы HR/агентства Индонезии.

# Тесты Family Vault

## Unit (чистая логика) — `tests/unit/`

Node-раннер, без внешних зависимостей (нужен Node ≥ 22):

```bash
npm run test:unit
```

`passport.test.ts` — Candidate Passport: минимальный профиль без вакансии,
происхождение полей, freshness, prefill с обязательным подтверждением
(`lib/passport.ts`).

`matching.test.ts` — объяснимое сопоставление: состояния критериев,
покрытие требований и запрет совокупного балла/процента (`lib/matching.ts`).

`passportVisibility.test.ts` — видимость и confidential discovery: дефолт
`private`, блокировка организаций, скрытие текущего работодателя, blind-уровень
и double opt-in (`lib/passportVisibility.ts`, `lib/talentPool.ts`).

`passportSnapshot.test.ts` — неизменяемые снимки: правка профиля не
переписывает историю отклика (`lib/passportSnapshot.ts`).

`vault.test.ts` — логика автопроверок документов (срок, согласованность
дат, совпадение имени) и маппинг канонических категорий (`lib/docTypes.ts`).

## Запрещённая лексика — `tests/lexicon.mjs`

Гарантирует, что в проверках документов и UI нет вердиктов о подлинности
(«подделка/фейк/fake/forged») — требование ТЗ §11 / Архитектуры v1.1 §10:

```bash
npm run test:lexicon
```

## RLS (база данных) — `tests/rls/`

Проверяют, что доступ изолирован на уровне БД. Каждый скрипт работает в
транзакции и **откатывается** (данные не остаются).

Запуск — в **Supabase SQL Editor** (вставить файл и Run) или через psql:

```bash
psql "$DATABASE_URL" -f tests/rls/isolation.sql
psql "$DATABASE_URL" -f tests/rls/invitations.sql
psql "$DATABASE_URL" -f tests/rls/talent_pool_visibility.sql
psql "$DATABASE_URL" -f tests/rls/opportunity_invite_flow.sql
```

Ожидаемые результаты указаны в комментариях:
- `isolation.sql` → `a_sees_members=1`, `b_sees_members=0` (чужой не видит данные).
- `invitations.sql` → `b_before_accept=0`, `b_after_accept_and_write=2`, `b_role=editor`.
- `talent_pool_visibility.sql` → `pool_default=0` (профиль приватен по
  умолчанию), `level=blind` без имени/контактов/CV/ссылок, `pool_blocked=0`,
  `pool_current_employer=0`, `pool_unavailable=0`, снимок неизменяем.
- `opportunity_invite_flow.sql` → приглашение без раскрытия условий не
  отправляется; до принятия знакомства `profile=null`; после принятия видны
  разрешённые поля без контактов; `Share & apply` создаёт один отклик, одно
  разрешение и один неизменяемый снимок (повтор ничего не переписывает).

## E2E (Playwright) — `tests/e2e/`

Дымовые проверки публичных страниц. Нужен запущенный инстанс приложения.

```bash
npm install
npx playwright install chromium     # один раз
npm run dev                         # в отдельном терминале
BASE_URL=http://localhost:3000 npm run test:e2e
```

Для проверки авторизованных сценариев заведите тестового пользователя
(или отключите подтверждение email в Supabase Auth для тест-окружения) и
добавьте storage-state с сессией.

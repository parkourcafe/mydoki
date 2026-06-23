# Тесты Family Vault

## RLS (база данных) — `tests/rls/`

Проверяют, что доступ изолирован на уровне БД. Каждый скрипт работает в
транзакции и **откатывается** (данные не остаются).

Запуск — в **Supabase SQL Editor** (вставить файл и Run) или через psql:

```bash
psql "$DATABASE_URL" -f tests/rls/isolation.sql
psql "$DATABASE_URL" -f tests/rls/invitations.sql
```

Ожидаемые результаты указаны в комментариях:
- `isolation.sql` → `a_sees_members=1`, `b_sees_members=0` (чужой не видит данные).
- `invitations.sql` → `b_before_accept=0`, `b_after_accept_and_write=2`, `b_role=editor`.

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

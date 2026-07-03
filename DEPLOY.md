# Деплой Family Vault

Стек: Next.js (App Router) + Supabase + Vercel. БД проекта Supabase
`uuopxzlcmzdtwebottar` уже содержит всю схему.

## 1. Vercel

1. Импортировать репозиторий `parkourcafe/mydoki` в Vercel (Framework: Next.js —
   определится автоматически; регион задан в `vercel.json` = `fra1`).
2. Указать переменные окружения (Project → Settings → Environment Variables):

| Переменная | Где взять | Видимость |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Settings → API → Project URL | публичная |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → API → publishable/anon key | публичная |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → API → service_role | **секрет (server)** |
| `ANTHROPIC_API_KEY` | console.anthropic.com (опц., для AI) | секрет |
| `ANTHROPIC_MODEL` | напр. `claude-sonnet-4-6` (опц.) | — |

3. Deploy.

## 1a. Свой домен — doki.help

Выбранный домен проекта: **doki.help**. Привязка к деплою:

1. Vercel → Project → **Settings → Domains → Add** → ввести `doki.help`
   (и при желании `www.doki.help`).
2. Vercel покажет DNS-записи — добавить их у регистратора домена:
   - `A` запись `@` → IP от Vercel (обычно `76.76.21.21`), **или**
   - `CNAME` `@`/`www` → `cname.vercel-dns.com` (как покажет Vercel).
3. Дождаться проверки (от пары минут до часа) — SSL-сертификат Vercel выпустит сам.
4. В Supabase → Auth → URL Configuration выставить Site URL = `https://doki.help`.

Пока DNS не настроен (или до деплоя) приложение доступно по `<проект>.vercel.app`.

## 2. Supabase Auth

- **Site URL / Redirect URLs**: указать рабочий адрес (`https://doki.help`, а до
  привязки домена — `https://<проект>.vercel.app`) в Authentication → URL
  Configuration — иначе письма подтверждения и редиректы будут вести на localhost.
- **2FA (MFA)**: Authentication → включить TOTP (приложение умеет enroll на
  `/my/security`).
- **Leaked password protection**: Authentication → Password security — включить.
- (Опц.) выключить email-подтверждение для тест-окружения.

## 3. База данных на свежем проекте

БД уже развёрнута в `uuopxzlcmzdtwebottar`. Для нового проекта Supabase:

```bash
supabase link --project-ref <NEW_REF>
supabase db push          # применит все миграции из supabase/migrations/
```

Либо выполнить SQL-файлы из `supabase/migrations/` по порядку (по возрастанию имени) в SQL Editor.

## 4. Пост-деплой проверки

- [ ] Регистрация → вход работает, редирект на `/my`.
- [ ] Загрузка документа + файла; файл открывается по signed URL.
- [ ] AI «Распознать» заполняет поля (если задан `ANTHROPIC_API_KEY`).
- [ ] Share-ссылка открывается на `/s/[token]` и показывает файл (нужен
      `SUPABASE_SERVICE_ROLE_KEY`); отзыв ссылки работает.
- [ ] Приглашение `/invite/[token]` добавляет второго пользователя.
- [ ] RLS-скрипты из `tests/rls/` зелёные (см. `tests/README.md`).
- [ ] Supabase Advisors (Security) без новых ошибок.

## 5. Career MVP (модуль вакансий)

Отдельный модуль «apply-layer»: работодатель создаёт вакансию и получает
ссылку/QR, кандидат откликается без регистрации, работодатель ведёт отклики.

1. **Миграция.** `supabase/migrations/20260701000000_career_mvp.sql` создаёт
   таблицы (`employer_profiles`, `vacancies`, `applications`,
   `application_documents`, `application_answers`, `application_status_log`),
   RLS-политики и RPC (`create_vacancy`, `submit_application`,
   `update_application_status`, `mark_application_viewed`,
   `get_application_status`). Применяется через `supabase db push` или SQL Editor.
2. **Storage.** Та же миграция создаёт приватный bucket `applications`
   (лимит 10MB, MIME: pdf/jpg/png). Отдельная ручная настройка не нужна.
   Политики: аноним может загружать только в папку активной вакансии
   (`{vacancy_id}/…`), читать/подписывать файлы может только владелец вакансии.
3. **Service role не требуется** — публичные потоки (отклик, страница статуса)
   идут через `SECURITY DEFINER` RPC, как `get_shared_document`.
4. **Переменная окружения.** `NEXT_PUBLIC_APP_URL` (напр. `https://doki.help`)
   используется для apply-ссылок и QR. Middleware обновляет сессию Supabase и
   на маршрутах `/employer` (как и на `/my`).

Проверки после деплоя:

- [ ] Работодатель создаёт профиль и вакансию на `/employer/vacancies/new`.
- [ ] Apply-ссылка `/apply/{slug}` открывается без входа; QR/копирование работают.
- [ ] Отклик с загрузкой документа проходит; появляется страница статуса.
- [ ] Дашборд `/employer/vacancies/{id}` показывает карточку, чек-лист, ответы.
- [ ] Shortlist/Reject меняют статус; WhatsApp и signed-URL документа работают.

## Замечания по безопасности

- `vault-files` — приватный bucket; файлы наружу только короткими signed URL.
- RLS включена на всех таблицах; хелперы доступа — в схеме `private` вне REST.
- Security-заголовки (HSTS, X-Frame-Options DENY и т.п.) заданы в `next.config.mjs`.

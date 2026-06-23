# 08 · Открытые вопросы и решения

## Источники — сведены ✅

Авторитетные документы из `parkourcafe/dog.uslugi` получены и учтены:

- `docs/family-vault/product-brief.md` — отражён в [01](01-concept.md) / [06](06-features.md);
- `docs/family-vault/schema.sql` — перенесён в [schema.sql](schema.sql), на него
  опираются [02](02-domain-model.md) и [05](05-database-schema.md).

## Уже зафиксировано

- **Название:** рабочее — **Family Vault**; репозиторий — `mydoki`.
- **Household обязателен** (не опционален): корневая единица доступа, есть всегда.
- **Роли:** `owner` / `editor` / `viewer` (чтение — член, запись — editor/owner).
- **Категории/виды записей** — enum, не таблицы.
- **Обмен** — RPC `get_shared_document` (TTL + отзыв + лимит просмотров + аудит).
- **Storage** — приватный bucket `vault-files`, доступ по сегменту `household_id`.

## Расхождения «бриф vs схема» — решено ✅

- [x] **Теги документов** — добавлено поле `tags text[]` + GIN-индекс.
- [x] **Водяной знак / запрет скачивания** — добавлены `watermark` /
      `allow_download` у `shares`; `get_shared_document` отдаёт флаги клиенту.
- [x] **Таблица согласий** — добавлена `consents` (+ enum `consent_kind`:
      `privacy_policy` / `medical` / `marketing`).

## Продуктовые решения

- [ ] **Household в MVP.** Реализуем совместный доступ (приглашения/роли) сразу
      или сначала «семья из одного владельца», а приглашения — позже?
- [ ] **Платформа.** Web (Next.js) подтверждён. Нужна ли PWA/мобильный клиент в MVP?
- [ ] **AI-категоризация.** Какие поля `doc-classify` заполняет автоматически
      (`category`, `subtype`, `doc_number`, `issued_at`, `expires_at`)?

## Безопасность и юридический контур

- [ ] **Резидентность данных.** Регион Supabase-проекта.
- [ ] **Envelope-шифрование** топ-чувствительных файлов: в MVP или позже? Где
      живёт пользовательский ключ?
- [ ] **TTL** для signed URL и значения `expires_at`/`max_views` по умолчанию.
- [ ] **2FA-метод** в Supabase Auth: TOTP / email / SMS.

## Техническое

- [ ] Слой запросов и `getSupabaseServer()` — перенести из PET ID или написать заново?
- [ ] Генерация коротких signed URL после `get_shared_document` — на сервере приложения.
- [ ] Стратегия бэкапов БД и storage + проверка восстановления.

## Статус реализации

- [x] Схема **применена** к Supabase-проекту `uuopxzlcmzdtwebottar`
      (миграции `init_family_vault_schema`, `harden_function_grants`).
      10 таблиц, RLS на всех; приватный bucket `vault-files`.
- [x] Security-advisors просмотрены; оставшиеся WARN — by-design
      (`SECURITY DEFINER` + `authenticated`, нужны RLS-политикам).
- [x] **MVP-приложение** (Next.js + Supabase): auth + 2FA, члены семьи,
      документы + загрузка файлов, signed URL, напоминания, share-ссылки + `/s/[token]`.
- [x] Сборка и типы зелёные; **RLS-изоляция проверена** реальным тестом двух
      пользователей (второй не видит данные первого).

### Следующие шаги (по твоей команде)

1. Каркас приложения (Next.js + Supabase Auth + загрузка в `vault-files`) по
   [MVP-этапам](07-mvp-roadmap.md).
2. Доп. hardening: вынести хелперы доступа в схему вне PostgREST; включить 2FA и
   защиту от утёкших паролей в Supabase Auth.
3. Проверка RLS на тестовых данных (создать семью через `create_household`).

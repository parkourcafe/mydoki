# 05 · Схема БД

> **Статус: черновик-реконструкция.** Восстановлен по брифу. Должен быть сверён
> с авторитетным `docs/family-vault/schema.sql` из `parkourcafe/dog.uslugi`,
> который в этой сессии недоступен (см. [08-open-questions.md](08-open-questions.md)).
> Это иллюстрация структуры, **не готовая миграция**.

## Таблицы (обзор)

`users` · `households` · `household_members` · `members` · `categories` ·
`documents` · `document_files` · `records` · `shares` · `reminders` ·
`audit_log` · `consents`

## Принцип доступа

- Каждая строка с данными привязана к `owner_user_id`.
- Базовое правило RLS: `owner_user_id = auth.uid()`.
- Совместный доступ — через членство в household (роли owner / viewer).
- Доступ по share-ссылке — **не** через RLS, а через приватную RPC, которая
  проверяет токен, `expires_at`, `revoked_at` и отдаёт один документ.

## Эскиз схемы (иллюстративный)

```sql
-- Профиль владельца (auth.users — управляется Supabase)
create table profiles (
  id           uuid primary key references auth.users(id),
  display_name text,
  created_at   timestamptz not null default now()
);

-- Семья (опционально)
create table households (
  id            uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users(id),
  name          text not null,
  created_at    timestamptz not null default now()
);

create table household_members (
  household_id uuid not null references households(id) on delete cascade,
  user_id      uuid not null references auth.users(id),
  role         text not null check (role in ('owner','viewer')),
  primary key (household_id, user_id)
);

-- Член семьи (главная сущность)
create table members (
  id            uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users(id),
  household_id  uuid references households(id),
  full_name     text not null,
  birth_date    date,
  relation      text check (relation in ('self','spouse','child','parent','other')),
  avatar_path   text,                       -- в приватном bucket
  created_at    timestamptz not null default now()
);

-- Справочник категорий (системные + пользовательские)
create table categories (
  id            uuid primary key default gen_random_uuid(),
  owner_user_id uuid references auth.users(id),  -- null = системная
  key           text not null,                   -- identity/education/medical/...
  label         text not null
);

-- Документ (логический), у него может быть несколько файлов
create table documents (
  id            uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users(id),
  member_id     uuid not null references members(id) on delete cascade,
  category_key  text not null,
  type          text,                  -- паспорт, диплом, анализ…
  issued_by     text,
  number        text,
  issued_at     date,
  expires_at    date,                  -- источник для напоминаний
  tags          text[] default '{}',
  notes         text,
  created_at    timestamptz not null default now()
);

-- Физические файлы документа
create table document_files (
  id            uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users(id),
  document_id   uuid not null references documents(id) on delete cascade,
  storage_path  text not null,         -- приватный bucket
  mime_type     text,
  size_bytes    bigint,
  original_name text,
  position      int default 0,
  created_at    timestamptz not null default now()
);

-- Структурная запись без файла
create table records (
  id            uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users(id),
  member_id     uuid not null references members(id) on delete cascade,
  kind          text not null,         -- analysis/prescription/nutrition_plan/vaccination
  data          jsonb not null default '{}',
  document_id   uuid references documents(id),  -- опц. источник
  occurred_on   date,
  created_at    timestamptz not null default now()
);

-- Временная ссылка на ОДИН документ
create table shares (
  id            uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users(id),
  document_id   uuid not null references documents(id) on delete cascade,
  token         text not null unique,
  expires_at    timestamptz not null,
  revoked_at    timestamptz,
  allow_download boolean not null default false,
  watermark     boolean not null default true,
  created_at    timestamptz not null default now()
);

-- Напоминания о сроках
create table reminders (
  id            uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users(id),
  member_id     uuid references members(id) on delete cascade,
  document_id   uuid references documents(id) on delete cascade,
  due_date      date not null,
  lead_days     int not null default 30,
  channel       text not null default 'email',  -- email/push
  status        text not null default 'pending',-- pending/sent/dismissed
  created_at    timestamptz not null default now()
);

-- Журнал доступа
create table audit_log (
  id            uuid primary key default gen_random_uuid(),
  owner_user_id uuid,                  -- владелец затронутых данных
  actor_user_id uuid,                  -- кто действовал (null = аноним по ссылке)
  action        text not null,         -- view/download/share_create/share_open/share_revoke
  target_type   text,                  -- document/file/share
  target_id     uuid,
  ip            inet,
  user_agent    text,
  created_at    timestamptz not null default now()
);

-- Согласия (PII + спец-категория «медицина»)
create table consents (
  id            uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users(id),
  kind          text not null,         -- privacy/medical/...
  version       text not null,
  granted_at    timestamptz not null default now(),
  revoked_at    timestamptz
);
```

## RLS (набросок)

```sql
alter table documents enable row level security;

-- Владелец видит свои документы
create policy documents_owner on documents
  for all
  using (owner_user_id = auth.uid())
  with check (owner_user_id = auth.uid());

-- Доступ участникам household (только чтение) — пример расширения
create policy documents_household_read on documents
  for select
  using (exists (
    select 1
    from members m
    join household_members hm on hm.household_id = m.household_id
    where m.id = documents.member_id
      and hm.user_id = auth.uid()
  ));
```

Аналогичные политики — на каждую таблицу с данными. Таблица `audit_log`
доступна владельцу только на чтение; запись — через серверный код / RPC.

## Storage

- Один **приватный** bucket (напр. `vault`).
- Путь файла включает `owner_user_id` и `member_id` для изоляции.
- Доступ к файлам — только `createSignedUrl(s)` с коротким TTL.
- Превью с водяным знаком для share — генерируются на сервере.

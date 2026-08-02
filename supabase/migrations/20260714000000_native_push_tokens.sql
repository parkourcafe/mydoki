-- =====================================================================
-- Нативные push-токены (iOS App Store обёртка на Capacitor).
-- APNs-токен устройства хранится под пользователем; серверная рассылка
-- (напоминания о сроках, новые отклики) шлёт пуш по этим токенам.
-- Отделено от web-push (push_subscriptions): у APNs другой формат токена.
-- Общая БД с Doki.id — таблица additive, совместима с обоими приложениями.
-- =====================================================================

create table if not exists native_push_tokens (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  token      text not null unique,
  platform   text not null default 'ios' check (platform in ('ios', 'android')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists native_push_tokens_user_idx on native_push_tokens(user_id);

alter table native_push_tokens enable row level security;

do $$ begin
  create policy "native_push read own" on native_push_tokens
    for select using (user_id = (select auth.uid()));
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "native_push insert own" on native_push_tokens
    for insert with check (user_id = (select auth.uid()));
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "native_push update own" on native_push_tokens
    for update using (user_id = (select auth.uid()))
    with check (user_id = (select auth.uid()));
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "native_push delete own" on native_push_tokens
    for delete using (user_id = (select auth.uid()));
exception when duplicate_object then null; end $$;

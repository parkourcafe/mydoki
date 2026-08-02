-- =====================================================================
-- T9 — Web Push subscriptions. Additive/idempotent.
-- =====================================================================
create table if not exists push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  locale text not null default 'en',
  user_agent text,
  failed_count int not null default 0,
  last_success_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists idx_push_subscriptions_user on push_subscriptions(user_id);
alter table push_subscriptions enable row level security;

do $$ begin
  create policy "own_subscriptions" on push_subscriptions
    for all using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
exception when duplicate_object then null; end $$;

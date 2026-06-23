-- Rate limit для ИИ-функций (защита от перерасхода)
create table if not exists ai_usage (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
create index if not exists ai_usage_user_created_idx on ai_usage(user_id, created_at desc);
alter table ai_usage enable row level security;
create policy "ai_usage read own" on ai_usage
  for select using (user_id = auth.uid());
create policy "ai_usage insert own" on ai_usage
  for insert with check (user_id = auth.uid());

-- Индексы под внешние ключи (perf advisor)
create index if not exists document_files_household_idx on document_files(household_id);
create index if not exists consents_member_idx on consents(member_id);
create index if not exists records_household_idx on records(household_id);

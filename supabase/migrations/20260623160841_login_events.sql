create table login_events (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  ip            text,
  user_agent    text,
  is_new_device boolean not null default false,
  created_at    timestamptz not null default now()
);
create index on login_events(user_id, created_at desc);

alter table login_events enable row level security;
create policy "login_events read own" on login_events
  for select using (user_id = auth.uid());
create policy "login_events insert own" on login_events
  for insert with check (user_id = auth.uid());
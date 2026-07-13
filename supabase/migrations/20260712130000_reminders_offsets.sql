-- PR-2 (фаза 1A): напоминания на настраиваемых offsets + ручные напоминания.
-- Аддитивно — БД общая с Doki.id. Старый due_reminders() НЕ трогаем.
--
-- План отката (rollback):
--   drop function if exists due_manual_reminder_candidates();
--   drop function if exists due_reminder_candidates();
--   drop table if exists reminder_sent_manual;
--   alter table reminders drop column if exists title,
--     drop column if exists offsets, drop column if exists channel;

-- ── Ручные напоминания: доп. поля на существующей таблице ────────────
-- offsets — положительные «дней до срока», напр. [30,7,1].
alter table reminders
  add column if not exists title text,
  add column if not exists offsets jsonb not null default '[30,7,1]'::jsonb,
  add column if not exists channel text not null default 'email';

-- ── Дедуп отправленных ручных напоминаний (только service_role) ─────
create table if not exists reminder_sent_manual (
  reminder_id uuid not null references reminders(id) on delete cascade,
  due_on      date not null,
  kind        text not null,   -- 'd30' | 'd7' | 'd1' и т.п.
  email       text not null,
  sent_at     timestamptz not null default now(),
  primary key (reminder_id, due_on, kind, email)
);
alter table reminder_sent_manual enable row level security;
-- политик нет: пользователи доступа не имеют; пишет только cron (service_role).

-- ── Кандидаты авто-напоминаний по документам ────────────────────────
-- Возвращает документы с expires_at в ближайшие 30 дней + email членов
-- семьи. Порог (kind) и дедуп вычисляет cron в TS (тестируемо).
create or replace function due_reminder_candidates()
returns table (
  document_id uuid,
  title text,
  category text,
  expires_on date,
  household_id uuid,
  email text
)
language sql security definer set search_path = public, auth as $$
  select d.id, d.title, d.category::text, d.expires_at::date, d.household_id, u.email
  from documents d
  join household_members hm on hm.household_id = d.household_id
  join auth.users u on u.id = hm.user_id
  where d.expires_at is not null
    and coalesce(d.status, 'active') = 'active'
    and d.expires_at::date >= current_date
    and d.expires_at::date <= (current_date + 30)
    and u.email is not null;
$$;
revoke all on function due_reminder_candidates() from public, anon, authenticated;
grant execute on function due_reminder_candidates() to service_role;

-- ── Кандидаты ручных напоминаний ────────────────────────────────────
create or replace function due_manual_reminder_candidates()
returns table (
  reminder_id uuid,
  title text,
  due_on date,
  offsets jsonb,
  household_id uuid,
  email text
)
language sql security definer set search_path = public, auth as $$
  select r.id, coalesce(r.title, r.message, 'Напоминание'), r.due_at, r.offsets, r.household_id, u.email
  from reminders r
  join household_members hm on hm.household_id = r.household_id
  join auth.users u on u.id = hm.user_id
  where r.done = false
    and r.due_at >= current_date
    and r.due_at <= (current_date + 30)
    and u.email is not null;
$$;
revoke all on function due_manual_reminder_candidates() from public, anon, authenticated;
grant execute on function due_manual_reminder_candidates() to service_role;

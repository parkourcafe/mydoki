-- Дедуп отправленных напоминаний: одно письмо на (документ, дата истечения, порог, email)
create table if not exists public.reminder_sent (
  document_id uuid not null references public.documents(id) on delete cascade,
  expires_on date not null,
  kind text not null,            -- 'd30' (за 30 дней) | 'd7' (за 7 дней)
  email text not null,
  sent_at timestamptz not null default now(),
  primary key (document_id, expires_on, kind, email)
);

alter table public.reminder_sent enable row level security;
-- политик нет: обычные пользователи не имеют доступа; пишет только service_role (cron), он обходит RLS.

-- Документы, по которым пора слать напоминание, с email членов семьи.
create or replace function public.due_reminders()
returns table (
  document_id uuid,
  title text,
  category text,
  expires_on date,
  kind text,
  household_id uuid,
  email text
)
language sql
security definer
set search_path = public, auth
as $$
  select
    d.id,
    d.title,
    d.category::text,
    d.expires_at::date as expires_on,
    case when d.expires_at::date <= (current_date + 7) then 'd7' else 'd30' end as kind,
    d.household_id,
    u.email
  from public.documents d
  join public.household_members hm on hm.household_id = d.household_id
  join auth.users u on u.id = hm.user_id
  where d.expires_at is not null
    and d.expires_at::date >= current_date
    and d.expires_at::date <= (current_date + 30)
    and u.email is not null
    and not exists (
      select 1 from public.reminder_sent rs
      where rs.document_id = d.id
        and rs.expires_on = d.expires_at::date
        and rs.email = u.email
        and rs.kind = case when d.expires_at::date <= (current_date + 7) then 'd7' else 'd30' end
    );
$$;

revoke all on function public.due_reminders() from public, anon, authenticated;
grant execute on function public.due_reminders() to service_role;
-- =====================================================================
-- P3-2 (фаза 3): Напоминания работодателя о пересмотрах — плановая дата
-- пересмотра условий (employments.next_review_date) и приближающаяся дата
-- вступления предложенного, но ещё не принятого допсоглашения. Поверх модели
-- напоминаний фаз 1/2 (пороги/дедуп считает TS-крон).
--
-- Аддитивно и совместимо с Doki.id: новая колонка + функция кандидатов +
-- таблица дедупа; общих таблиц не трогаем.
--
-- План отката (rollback):
--   drop function if exists due_employment_review_candidates();
--   drop table if exists employment_review_reminder_sent;
--   alter table employments drop column if exists next_review_date;

-- ── Плановая дата пересмотра условий на employment ──────────────────
alter table employments add column if not exists next_review_date date;

-- ── Дедуп отправленных писем (пишет только cron/service_role) ────────
create table if not exists employment_review_reminder_sent (
  source_id  uuid not null,           -- employment_id (review) или amendment_id
  due_on     date not null,
  kind       text not null,           -- 'review' | 'amendment'
  email      text not null,
  sent_at    timestamptz not null default now(),
  primary key (source_id, due_on, kind, email)
);
alter table employment_review_reminder_sent enable row level security;
-- политик нет: доступ только у service_role (bypass RLS).

-- ── Кандидаты напоминаний работодателя (≤30 дней) ───────────────────
create or replace function due_employment_review_candidates()
returns table (
  source_id     uuid,
  kind          text,
  title         text,
  due_on        date,
  employment_id uuid,
  company_name  text,
  email         text
)
language sql security definer set search_path = public, auth as $$
  -- (1) Плановые пересмотры условий.
  select e.id, 'review'::text, e.position, e.next_review_date, e.id,
         e.company_name, coalesce(ep.contact_email, u.email)
  from employments e
  join employer_profiles ep on ep.id = e.company_id
  join auth.users u on u.id = ep.user_id
  where e.next_review_date is not null
    and e.status = 'active'
    and e.next_review_date >= current_date
    and e.next_review_date <= (current_date + 30)
    and coalesce(ep.contact_email, u.email) is not null
  union all
  -- (2) Предложенные допсоглашения с приближающейся датой вступления
  -- (ещё не приняты — работодателю стоит проследить/напомнить сотруднику).
  select a.id, 'amendment'::text, e.position, a.effective_date, e.id,
         e.company_name, coalesce(ep.contact_email, u.email)
  from employment_amendments a
  join employments e on e.id = a.employment_id
  join employer_profiles ep on ep.id = e.company_id
  join auth.users u on u.id = ep.user_id
  where a.status = 'proposed'
    and a.effective_date is not null
    and e.status = 'active'
    and a.effective_date >= current_date
    and a.effective_date <= (current_date + 30)
    and coalesce(ep.contact_email, u.email) is not null;
$$;
revoke all on function due_employment_review_candidates() from public, anon, authenticated;
grant execute on function due_employment_review_candidates() to service_role;

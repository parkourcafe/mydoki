-- PR-4 (фаза 1B): настройки компании + участники. Аддитивно и совместимо
-- с Doki.id (по образцу vacancy_limit). Отдельную таблицу companies НЕ
-- заводим — employer_profiles и есть компания (v1.1 §15).
--
-- План отката (rollback):
--   drop table if exists company_members;
--   alter table employer_profiles
--     drop column if exists retention_months,
--     drop column if exists default_consent_text,
--     drop column if exists country;

-- ── Настройки компании на существующей таблице ──────────────────────
alter table employer_profiles
  add column if not exists retention_months integer not null default 12,
  add column if not exists default_consent_text text,
  add column if not exists country text;

-- ── Участники компании (задел под мультидоступ) ─────────────────────
-- Реальный доступ рекрутёров к вакансиям/откликам через RLS — отдельная
-- правка общих таблиц (отложено). Здесь только членство + бэкофилл owner.
create table if not exists company_members (
  employer_profile_id uuid not null references employer_profiles(id) on delete cascade,
  user_id             uuid not null references auth.users(id) on delete cascade,
  role                text not null default 'recruiter' check (role in ('owner','recruiter')),
  created_at          timestamptz not null default now(),
  primary key (employer_profile_id, user_id)
);

alter table company_members enable row level security;

-- Владелец профиля управляет участниками; участник видит свою строку.
create policy "company_members owner manage" on company_members for all
  using (
    employer_profile_id in (
      select id from employer_profiles where user_id = (select auth.uid())
    )
  )
  with check (
    employer_profile_id in (
      select id from employer_profiles where user_id = (select auth.uid())
    )
  );
create policy "company_members read self" on company_members for select
  using (user_id = (select auth.uid()));

-- Бэкофилл: владелец каждого существующего профиля.
insert into company_members (employer_profile_id, user_id, role)
select id, user_id, 'owner' from employer_profiles
on conflict (employer_profile_id, user_id) do nothing;

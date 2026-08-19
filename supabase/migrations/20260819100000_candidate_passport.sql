-- =====================================================================
-- Candidate Passport foundation (архитектура v1.2, фаза 1B §15).
--
-- Принцип v1.2 §7.3: «Запрещено создавать отдельную копию Candidate
-- Passport, если существующий профиль может быть безопасно расширен».
-- В репозитории уже есть 1:1-профиль кандидата — таблица `resumes`
-- (20260703140000_resumes.sql). Поэтому структурированные поля паспорта
-- добавляются В НЕЁ, а не в параллельную сущность.
--
-- Что добавляется:
--   • структурированные поля Candidate Passport + происхождение каждого поля;
--   • profile lifecycle и search_intent (active/open/unavailable);
--   • неизменяемые версии профиля (`professional_profile_versions`);
--   • `purpose_authorizations` — каноническая модель разрешённой обработки;
--   • `application_profile_snapshots` — неизменяемый снимок на момент отклика;
--   • hard_criteria / soft_signals у вакансии (structured matching).
--
-- Что НЕ добавляется в этой миграции (фаза 1E, отдельный файл):
--   Talent Pool membership, видимость, блокировки организаций, приглашения.
--   Профиль здесь недоступен работодателю никак: RLS `resumes` остаётся
--   owner-only, employer-facing чтения нет вообще.
--
-- План отката (rollback):
--   drop function if exists record_application_profile_snapshot(uuid,text,jsonb,jsonb,jsonb);
--   drop function if exists publish_profile_version();
--   drop function if exists set_search_intent(text);
--   drop function if exists grant_purpose_authorization(text,text,uuid,jsonb,text,text,timestamptz);
--   drop function if exists revoke_purpose_authorization(uuid);
--   drop table if exists application_profile_snapshots;
--   drop table if exists purpose_authorizations;
--   drop table if exists professional_profile_versions;
--   alter table vacancies drop column if exists hard_criteria,
--     drop column if exists soft_signals;
--   alter table resumes
--     drop column if exists profession, drop column if exists role_taxonomy_code,
--     drop column if exists role_free_text, drop column if exists seniority,
--     drop column if exists years_of_experience, drop column if exists key_achievements,
--     drop column if exists management_experience, drop column if exists team_size,
--     drop column if exists current_location, drop column if exists preferred_locations,
--     drop column if exists work_format_preference, drop column if exists relocation_willingness,
--     drop column if exists work_authorization, drop column if exists languages,
--     drop column if exists salary_expectation, drop column if exists search_intent,
--     drop column if exists notice_period_days, drop column if exists preferred_employment_format,
--     drop column if exists preferred_environment, drop column if exists motivation,
--     drop column if exists company_type_preference, drop column if exists role_preference,
--     drop column if exists cv_document_id, drop column if exists cv_file_path,
--     drop column if exists linkedin_url, drop column if exists portfolio_url,
--     drop column if exists lifecycle, drop column if exists field_confirmations,
--     drop column if exists last_confirmed_at, drop column if exists profile_completeness;
-- =====================================================================

-- ── 1. Структурированные поля Candidate Passport (§8.2) ──────────────
alter table resumes
  add column if not exists profession                 text,
  add column if not exists role_taxonomy_code         text,
  add column if not exists role_free_text             text,
  add column if not exists seniority                  text,
  add column if not exists years_of_experience        numeric(4,1),
  add column if not exists key_achievements           text,
  add column if not exists management_experience      boolean,
  add column if not exists team_size                  integer,
  add column if not exists current_location           text,
  add column if not exists preferred_locations        jsonb not null default '[]'::jsonb,
  add column if not exists work_format_preference     jsonb not null default '[]'::jsonb,
  add column if not exists relocation_willingness     text,
  add column if not exists work_authorization         jsonb not null default '[]'::jsonb,
  add column if not exists languages                  jsonb not null default '[]'::jsonb,
  add column if not exists salary_expectation         jsonb,
  add column if not exists search_intent              text not null default 'open',
  add column if not exists notice_period_days         integer,
  add column if not exists preferred_employment_format jsonb not null default '[]'::jsonb,
  add column if not exists preferred_environment      text,
  add column if not exists motivation                 text,
  add column if not exists company_type_preference    jsonb not null default '[]'::jsonb,
  add column if not exists role_preference            text,
  add column if not exists cv_document_id             uuid,
  add column if not exists cv_file_path               text,
  add column if not exists linkedin_url               text,
  add column if not exists portfolio_url              text,
  add column if not exists lifecycle                  text not null default 'draft',
  -- Происхождение каждого поля: { "<field>": { "source": ..., "confirmed_at": ... } }
  add column if not exists field_confirmations        jsonb not null default '{}'::jsonb,
  add column if not exists last_confirmed_at          timestamptz,
  -- Свойство ПРОФИЛЯ, не человека: показывается только владельцу и никогда
  -- не используется для сортировки людей (§16).
  add column if not exists profile_completeness       integer not null default 0;

do $$ begin
  alter table resumes add constraint resumes_search_intent_check
    check (search_intent in ('active','open','unavailable'));
exception when duplicate_object then null; end $$;

do $$ begin
  alter table resumes add constraint resumes_lifecycle_check
    check (lifecycle in ('draft','ready','paused','archived'));
exception when duplicate_object then null; end $$;

do $$ begin
  alter table resumes add constraint resumes_seniority_check
    check (seniority is null or seniority in
      ('intern','junior','middle','senior','lead','head','executive'));
exception when duplicate_object then null; end $$;

do $$ begin
  alter table resumes add constraint resumes_relocation_check
    check (relocation_willingness is null or relocation_willingness in
      ('no','conditional','yes'));
exception when duplicate_object then null; end $$;

do $$ begin
  alter table resumes add constraint resumes_completeness_check
    check (profile_completeness between 0 and 100);
exception when duplicate_object then null; end $$;

-- Бэкофилл: свободная `location` из старой анкеты становится стартовым
-- значением структурированной `current_location` (кандидат подтверждает её
-- при первом открытии паспорта — источник остаётся candidate_declared).
update resumes
   set current_location = location
 where current_location is null and location is not null;

-- ── 2. Неизменяемые версии профессионального профиля (§7.3) ──────────
create table if not exists professional_profile_versions (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  version_no   integer not null,
  -- Снимок структурированных полей, собранный lib/passportSnapshot.ts.
  snapshot     jsonb not null,
  checksum     text not null,
  created_at   timestamptz not null default now(),
  unique (user_id, version_no)
);
create index if not exists ppv_user_idx
  on professional_profile_versions(user_id, version_no desc);

alter table professional_profile_versions enable row level security;

-- Владелец читает свои версии. Работодателю прямого чтения нет: он видит
-- только тот снимок, который кандидат передал вместе с откликом.
do $$ begin
  create policy "own profile versions read" on professional_profile_versions
    for select using (user_id = (select auth.uid()));
exception when duplicate_object then null; end $$;
-- Пишет только SECURITY DEFINER RPC; update/delete нет (снимки неизменяемы).

-- ── 3. PurposeAuthorization (§7.3, §13.4) ───────────────────────────
-- Каноническая модель разрешённой обработки. Consent receipt создаётся
-- только когда применимое основание действительно consent.
create table if not exists purpose_authorizations (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references auth.users(id) on delete cascade,
  purpose           text not null
                      check (purpose in ('talent_pool_discovery',
                                         'opportunity_introduction',
                                         'application')),
  audience          text not null default 'verified_employers'
                      check (audience in ('verified_employers','organization')),
  audience_employer_id uuid references employer_profiles(id) on delete cascade,
  scope_fields      jsonb not null default '[]'::jsonb,
  legal_basis       text not null
                      check (legal_basis in ('consent','legitimate_interest','contract')),
  notice_version    text not null,
  consent_text      text,
  granted_at        timestamptz not null default now(),
  expires_at        timestamptz,
  revoked_at        timestamptz,
  created_at        timestamptz not null default now()
);
create index if not exists purpose_auth_user_idx
  on purpose_authorizations(user_id, purpose, revoked_at);

alter table purpose_authorizations enable row level security;

do $$ begin
  create policy "own authorizations read" on purpose_authorizations
    for select using (user_id = (select auth.uid()));
exception when duplicate_object then null; end $$;

-- ── 4. Неизменяемый снимок профиля при отклике (§10, §17.13) ────────
create table if not exists application_profile_snapshots (
  id             uuid primary key default gen_random_uuid(),
  application_id uuid references applications(id) on delete cascade,
  user_id        uuid references auth.users(id) on delete set null,
  -- Четыре части снимка (бриф §8 / v1.2 §10).
  candidate_profile_snapshot   jsonb not null,
  vacancy_requirements_snapshot jsonb not null,
  match_explanation_snapshot   jsonb,
  visibility_state_snapshot    jsonb not null,
  checksum       text not null,
  created_at     timestamptz not null default now()
);
create index if not exists aps_application_idx
  on application_profile_snapshots(application_id);

alter table application_profile_snapshots enable row level security;

-- Кандидат читает свои снимки; работодатель — снимки откликов на свои вакансии.
do $$ begin
  create policy "aps candidate read" on application_profile_snapshots for select
    using (user_id = (select auth.uid()));
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "aps employer read" on application_profile_snapshots for select
    using (
      application_id in (
        select a.id from applications a
        join vacancies v on v.id = a.vacancy_id
        join employer_profiles ep on ep.id = v.employer_id
        where ep.user_id = (select auth.uid())
      )
    );
exception when duplicate_object then null; end $$;

-- Неизменяемость обеспечивается не только отсутствием политик: триггер
-- блокирует update/delete даже из SECURITY DEFINER-кода.
create or replace function private.forbid_snapshot_mutation()
returns trigger language plpgsql as $$
begin
  raise exception 'snapshot is immutable (architecture v1.2 §17.13)';
end; $$;

drop trigger if exists aps_immutable on application_profile_snapshots;
create trigger aps_immutable
  before update or delete on application_profile_snapshots
  for each row execute function private.forbid_snapshot_mutation();

drop trigger if exists ppv_immutable on professional_profile_versions;
create trigger ppv_immutable
  before update or delete on professional_profile_versions
  for each row execute function private.forbid_snapshot_mutation();

-- Явные привилегии объектов (RLS остаётся построчной властью).
grant select on table public.professional_profile_versions to authenticated;
grant select on table public.purpose_authorizations to authenticated;
grant select on table public.application_profile_snapshots to authenticated;

-- ── 5. Структурированные критерии вакансии (§9) ─────────────────────
-- must-have hard filters и nice-to-have soft signals БЕЗ весов.
alter table vacancies
  add column if not exists hard_criteria jsonb not null default '{}'::jsonb,
  add column if not exists soft_signals  jsonb not null default '{}'::jsonb;

-- ── 6. RPC ──────────────────────────────────────────────────────────

-- Смена намерения искать работу. Не путать со статусом отклика: отдельная
-- state machine (§8.4). Меняет только сам человек.
create or replace function set_search_intent(p_intent text)
returns text language plpgsql volatile security definer set search_path = public as $$
begin
  if auth.uid() is null then raise exception 'not authenticated'; end if;
  if p_intent not in ('active','open','unavailable') then
    raise exception 'invalid search intent';
  end if;

  insert into resumes(user_id, search_intent, last_confirmed_at, updated_at)
  values (auth.uid(), p_intent, now(), now())
  on conflict (user_id) do update
    set search_intent = excluded.search_intent,
        last_confirmed_at = now(),
        updated_at = now();

  return p_intent;
end; $$;
grant execute on function set_search_intent(text) to authenticated;

-- Зафиксировать неизменяемую версию профиля. Снимок и контрольную сумму
-- собирает приложение (lib/passportSnapshot.ts) — здесь только нумерация.
create or replace function publish_profile_version(p_snapshot jsonb, p_checksum text)
returns jsonb language plpgsql volatile security definer set search_path = public as $$
declare v_no integer; v_id uuid;
begin
  if auth.uid() is null then raise exception 'not authenticated'; end if;
  if p_snapshot is null or coalesce(trim(p_checksum),'') = '' then
    raise exception 'snapshot and checksum required';
  end if;

  select coalesce(max(version_no), 0) + 1 into v_no
  from professional_profile_versions where user_id = auth.uid();

  insert into professional_profile_versions(user_id, version_no, snapshot, checksum)
  values (auth.uid(), v_no, p_snapshot, p_checksum)
  returning id into v_id;

  return jsonb_build_object('id', v_id, 'version_no', v_no);
end; $$;
grant execute on function publish_profile_version(jsonb,text) to authenticated;

-- Выдать purpose-bound разрешение. Разные цели — разные записи; одна не
-- переиспользуется вместо другой (§13.5).
create or replace function grant_purpose_authorization(
  p_purpose text,
  p_legal_basis text,
  p_notice_version text,
  p_scope_fields jsonb default '[]'::jsonb,
  p_audience text default 'verified_employers',
  p_employer_id uuid default null,
  p_consent_text text default null,
  p_expires_at timestamptz default null
) returns uuid language plpgsql volatile security definer set search_path = public as $$
declare v_id uuid;
begin
  if auth.uid() is null then raise exception 'not authenticated'; end if;
  if p_purpose not in ('talent_pool_discovery','opportunity_introduction','application') then
    raise exception 'invalid purpose';
  end if;
  if p_legal_basis not in ('consent','legitimate_interest','contract') then
    raise exception 'invalid legal basis';
  end if;
  -- Текст согласия обязателен ровно тогда, когда основание — consent.
  if p_legal_basis = 'consent' and coalesce(trim(p_consent_text),'') = '' then
    raise exception 'consent text required for consent basis';
  end if;

  -- Новое разрешение той же цели заменяет предыдущее действующее.
  update purpose_authorizations
     set revoked_at = now()
   where user_id = auth.uid() and purpose = p_purpose and revoked_at is null;

  insert into purpose_authorizations(
    user_id, purpose, audience, audience_employer_id, scope_fields,
    legal_basis, notice_version, consent_text, expires_at
  ) values (
    auth.uid(), p_purpose,
    case when p_audience = 'organization' then 'organization' else 'verified_employers' end,
    p_employer_id, coalesce(p_scope_fields,'[]'::jsonb),
    p_legal_basis, p_notice_version, nullif(trim(coalesce(p_consent_text,'')),''),
    p_expires_at
  ) returning id into v_id;

  return v_id;
end; $$;
grant execute on function grant_purpose_authorization(text,text,text,jsonb,text,uuid,text,timestamptz)
  to authenticated;

-- Отзыв разрешения прекращает новые показы и обработку, но не переписывает
-- уже созданный законный снимок конкретного отклика (§13.5).
create or replace function revoke_purpose_authorization(p_purpose text)
returns boolean language plpgsql volatile security definer set search_path = public as $$
declare v_count integer;
begin
  if auth.uid() is null then raise exception 'not authenticated'; end if;
  update purpose_authorizations
     set revoked_at = now()
   where user_id = auth.uid() and purpose = p_purpose and revoked_at is null;
  get diagnostics v_count = row_count;
  return v_count > 0;
end; $$;
grant execute on function revoke_purpose_authorization(text) to authenticated;

-- Записать неизменяемый снимок профиля к отклику. Доступно владельцу
-- отклика (по auth.uid()) или анонимному кандидату по секретному токену —
-- обычный отклик подаётся без аккаунта (career MVP).
create or replace function record_application_profile_snapshot(
  p_application_id uuid,
  p_access_token text,
  p_profile jsonb,
  p_requirements jsonb,
  p_match_explanation jsonb,
  p_visibility_state jsonb,
  p_checksum text
) returns uuid language plpgsql volatile security definer set search_path = public as $$
declare v_user uuid; v_token text; v_id uuid;
begin
  select user_id, access_token into v_user, v_token
  from applications where id = p_application_id;
  if not found then raise exception 'application not found'; end if;

  if not (
    (auth.uid() is not null and v_user = auth.uid())
    or (p_access_token is not null and p_access_token = v_token)
  ) then
    raise exception 'not authorized';
  end if;

  -- Снимок создаётся один раз на отклик: история не переписывается.
  select id into v_id from application_profile_snapshots
  where application_id = p_application_id limit 1;
  if v_id is not null then return v_id; end if;

  insert into application_profile_snapshots(
    application_id, user_id, candidate_profile_snapshot,
    vacancy_requirements_snapshot, match_explanation_snapshot,
    visibility_state_snapshot, checksum
  ) values (
    p_application_id, v_user, p_profile, p_requirements,
    p_match_explanation, p_visibility_state, p_checksum
  ) returning id into v_id;

  return v_id;
end; $$;
grant execute on function
  record_application_profile_snapshot(uuid,text,jsonb,jsonb,jsonb,jsonb,text)
  to anon, authenticated;

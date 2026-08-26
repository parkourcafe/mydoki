-- =====================================================================
-- Talent Pool и confidential discovery (архитектура v1.2, фаза 1E §15).
--
-- Что добавляется:
--   • `talent_pool_memberships` — отдельный opt-in со сроком действия;
--   • `profile_visibility_policies` — 5 режимов видимости, дефолт private;
--   • `organization_discovery_blocks` — блокировка организаций и доменов;
--   • `talent_pool_pseudonyms` — псевдоним кандидата для организации:
--     работодатель НИКОГДА не получает user_id из пула;
--   • `opportunity_invites` — blind-приглашения (не отклик!);
--   • `profile_access_grants` — ограниченный доступ после принятия знакомства;
--   • `match_assessments` — оценка только для пары «версия профиля × версия
--     вакансии», со сроком действия;
--   • `profile_access_log` — кто и на каком основании видел профиль;
--   • действующая верификация организации (домены, срок, отзыв).
--
-- Ключевые запреты (v1.2 §16), реализованные здесь:
--   • профиль не попадает в пул автоматически — нужен активный
--     `purpose_authorizations.purpose = 'talent_pool_discovery'`;
--   • discovery без действующей верификации организации невозможен;
--   • заблокированная организация и текущий работодатель не видят профиль;
--   • имя, контакты, CV, ссылки и свободный текст не выдаются до
--     явного `Share & apply` кандидата (double opt-in);
--   • bulk export пула невозможен: выдача ограничена лимитом и логируется.
--
-- План отката (rollback):
--   drop function if exists share_and_apply(uuid,jsonb,text,text,jsonb,jsonb,jsonb,text);
--   drop function if exists private.invite_profile(uuid);
--   drop function if exists get_employer_invites();
--   drop function if exists get_my_opportunity_invites();
--   drop function if exists respond_to_opportunity_invite(uuid,text,jsonb);
--   drop function if exists send_opportunity_invite(uuid,uuid,uuid,text,text,text,text,text,timestamptz,text,jsonb,uuid);
--   drop function if exists talent_pool_candidates(integer);
--   drop function if exists unblock_organization(uuid);
--   drop function if exists block_organization(uuid,text);
--   drop function if exists set_talent_pool_membership(text,timestamptz);
--   drop function if exists set_profile_visibility(text,boolean,jsonb,jsonb);
--   drop function if exists private.discovery_denied_reason(uuid,uuid);
--   drop function if exists private.verified_employer_for_uid();
--   drop function if exists private.pseudonym_for(uuid,uuid);
--   drop table if exists profile_access_log, match_assessments,
--     profile_access_grants, opportunity_invites, talent_pool_pseudonyms,
--     organization_discovery_blocks, profile_visibility_policies,
--     talent_pool_memberships;
--   alter table employer_profiles drop column if exists domains,
--     drop column if exists verification_expires_at,
--     drop column if exists verification_revoked_at;
-- =====================================================================

-- ── 0. Действующая верификация организации (§16) ─────────────────────
alter table employer_profiles
  add column if not exists domains jsonb not null default '[]'::jsonb,
  add column if not exists verification_expires_at timestamptz,
  add column if not exists verification_revoked_at timestamptz;

-- ── 1. Членство в пуле (§8.4) ────────────────────────────────────────
create table if not exists talent_pool_memberships (
  user_id           uuid primary key references auth.users(id) on delete cascade,
  state             text not null default 'not_joined'
                      check (state in ('not_joined','active','paused','left','expired')),
  joined_at         timestamptz,
  paused_at         timestamptz,
  left_at           timestamptz,
  expires_at        timestamptz,
  last_confirmed_at timestamptz,
  updated_at        timestamptz not null default now()
);

alter table talent_pool_memberships enable row level security;

do $$ begin
  create policy "own membership read" on talent_pool_memberships for select
    using (user_id = (select auth.uid()));
exception when duplicate_object then null; end $$;

-- ── 2. Политика видимости (§8.5) ─────────────────────────────────────
create table if not exists profile_visibility_policies (
  user_id                 uuid primary key references auth.users(id) on delete cascade,
  -- Дефолт private: профиль закрыт, пока человек явно не выбрал иное (§17.12).
  mode                    text not null default 'private'
                            check (mode in ('private','recommendations_only',
                                            'invited_only','confidential_pool',
                                            'discoverable_pool')),
  hide_current_employer   boolean not null default true,
  current_employer_names  jsonb not null default '[]'::jsonb,
  hidden_fields           jsonb not null default '[]'::jsonb,
  updated_at              timestamptz not null default now()
);

alter table profile_visibility_policies enable row level security;

do $$ begin
  create policy "own visibility read" on profile_visibility_policies for select
    using (user_id = (select auth.uid()));
exception when duplicate_object then null; end $$;

-- ── 3. Блокировка организаций и доменов (§8.5) ───────────────────────
create table if not exists organization_discovery_blocks (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  employer_id uuid references employer_profiles(id) on delete cascade,
  domain      text,
  created_at  timestamptz not null default now(),
  check (employer_id is not null or coalesce(trim(domain),'') <> '')
);
create unique index if not exists odb_user_employer_uidx
  on organization_discovery_blocks(user_id, employer_id)
  where employer_id is not null;
create unique index if not exists odb_user_domain_uidx
  on organization_discovery_blocks(user_id, lower(domain))
  where domain is not null;

alter table organization_discovery_blocks enable row level security;

do $$ begin
  create policy "own blocks read" on organization_discovery_blocks for select
    using (user_id = (select auth.uid()));
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "own blocks write" on organization_discovery_blocks for insert
    with check (user_id = (select auth.uid()));
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "own blocks delete" on organization_discovery_blocks for delete
    using (user_id = (select auth.uid()));
exception when duplicate_object then null; end $$;

grant select, insert, delete on organization_discovery_blocks to authenticated;

-- ── 4. Псевдоним кандидата для организации ──────────────────────────
-- Работодатель оперирует только `ref`. Обратное сопоставление живёт в БД,
-- поэтому bulk-выгрузка идентификаторов невозможна даже при ошибке в UI.
create table if not exists talent_pool_pseudonyms (
  user_id     uuid not null references auth.users(id) on delete cascade,
  employer_id uuid not null references employer_profiles(id) on delete cascade,
  ref         uuid not null default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  primary key (user_id, employer_id),
  unique (ref)
);
alter table talent_pool_pseudonyms enable row level security;
-- Ни кандидат, ни работодатель не читают таблицу напрямую: только RPC.

-- ── 5. Opportunity Invite (§8.8) ────────────────────────────────────
create table if not exists opportunity_invites (
  id                 uuid primary key default gen_random_uuid(),
  employer_id        uuid not null references employer_profiles(id) on delete cascade,
  user_id            uuid not null references auth.users(id) on delete cascade,
  vacancy_id         uuid references vacancies(id) on delete set null,
  vacancy_version_id uuid references vacancy_versions(id) on delete set null,
  role_title         text not null,
  location           text,
  work_format        text,
  compensation_range text,
  access_purpose     text not null,
  message            text,
  respond_by         timestamptz,
  -- blind = работодатель не видит личность до принятия знакомства.
  blind              boolean not null default true,
  state              text not null default 'sent'
                       check (state in ('sent','viewed','accepted','declined',
                                        'expired','withdrawn')),
  created_at         timestamptz not null default now(),
  viewed_at          timestamptz,
  responded_at       timestamptz
);
create index if not exists oi_user_idx on opportunity_invites(user_id, created_at desc);
create index if not exists oi_employer_idx on opportunity_invites(employer_id, created_at desc);
-- Одно приглашение на пару «организация × версия вакансии × кандидат».
create unique index if not exists oi_unique_per_role
  on opportunity_invites(employer_id, user_id, vacancy_id);

alter table opportunity_invites enable row level security;

do $$ begin
  create policy "invites candidate read" on opportunity_invites for select
    using (user_id = (select auth.uid()));
exception when duplicate_object then null; end $$;

-- Работодателю прямое чтение таблицы НЕ выдаётся: строка содержит
-- `user_id` кандидата, и SELECT-политика открыла бы его через PostgREST
-- ещё до принятия знакомства — это сломало бы blind-модель (§8.8.3) и
-- позволило бы связать кандидата с его прошлыми откликами по user_id.
-- Работодатель читает свои приглашения только через get_employer_invites(),
-- которая user_id не возвращает.
drop policy if exists "invites employer read" on opportunity_invites;

-- ── 6. ProfileAccessGrant (§8.8.6) ──────────────────────────────────
create table if not exists profile_access_grants (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  employer_id uuid not null references employer_profiles(id) on delete cascade,
  invite_id   uuid references opportunity_invites(id) on delete cascade,
  level       text not null default 'introduced'
                check (level in ('introduced','shared')),
  scope_fields jsonb not null default '[]'::jsonb,
  granted_at  timestamptz not null default now(),
  expires_at  timestamptz,
  revoked_at  timestamptz
);
create index if not exists pag_user_idx on profile_access_grants(user_id);
create index if not exists pag_employer_idx on profile_access_grants(employer_id);

alter table profile_access_grants enable row level security;

do $$ begin
  create policy "grants candidate read" on profile_access_grants for select
    using (user_id = (select auth.uid()));
exception when duplicate_object then null; end $$;

-- ── 7. MatchAssessment (§7.3) ───────────────────────────────────────
create table if not exists match_assessments (
  id                 uuid primary key default gen_random_uuid(),
  employer_id        uuid not null references employer_profiles(id) on delete cascade,
  user_id            uuid not null references auth.users(id) on delete cascade,
  vacancy_version_id uuid references vacancy_versions(id) on delete cascade,
  profile_version_id uuid references professional_profile_versions(id) on delete set null,
  -- criterion-by-criterion объяснение из lib/matching.ts. Совокупного балла
  -- в нём нет: guardrail assertNoAggregateScore проверяет это до записи.
  explanation        jsonb not null,
  evaluated_at       timestamptz not null default now(),
  valid_until        timestamptz not null,
  invalidated_at     timestamptz
);
create index if not exists ma_pair_idx
  on match_assessments(employer_id, user_id, vacancy_version_id);

alter table match_assessments enable row level security;

do $$ begin
  create policy "assessment candidate read" on match_assessments for select
    using (user_id = (select auth.uid()));
exception when duplicate_object then null; end $$;

-- ── 8. Журнал доступа к профилю (§8.5) ──────────────────────────────
create table if not exists profile_access_log (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  employer_id uuid references employer_profiles(id) on delete set null,
  basis       text not null,   -- talent_pool_search / invite / access_grant / application
  level       text not null,   -- blind / pool_fields / introduced / shared
  context     jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now()
);
create index if not exists pal_user_idx on profile_access_log(user_id, created_at desc);
create index if not exists pal_employer_time_idx on profile_access_log(employer_id, created_at desc);

alter table profile_access_log enable row level security;

-- Кандидат видит, кто и на каком основании смотрел его профиль.
do $$ begin
  create policy "access log candidate read" on profile_access_log for select
    using (user_id = (select auth.uid()));
exception when duplicate_object then null; end $$;

-- Явные привилегии объектов (RLS остаётся построчной властью).
grant select on table
  public.talent_pool_memberships,
  public.profile_visibility_policies,
  public.opportunity_invites,
  public.profile_access_grants,
  public.match_assessments,
  public.profile_access_log
to authenticated;
-- `talent_pool_pseudonyms` намеренно без grant: связь «ref → user_id»
-- доступна только SECURITY DEFINER-функциям.

-- ── 9. Приватные хелперы ────────────────────────────────────────────

-- Организация текущего пользователя, если её верификация ДЕЙСТВУЕТ.
create or replace function private.verified_employer_for_uid()
returns uuid language sql stable security definer set search_path = public as $$
  select ep.id from employer_profiles ep
  where ep.user_id = auth.uid()
    and ep.verified_at is not null
    and ep.verification_revoked_at is null
    and (ep.verification_expires_at is null or ep.verification_expires_at > now())
  limit 1;
$$;

-- Причина отказа в discovery или null, если профиль доступен организации.
-- Порядок проверок повторяет lib/passportVisibility.ts::discoveryDecision.
create or replace function private.discovery_denied_reason(
  p_user uuid, p_employer uuid
) returns text language plpgsql stable security definer set search_path = public as $$
declare
  v_policy profile_visibility_policies;
  v_member talent_pool_memberships;
  v_intent text;
  v_org employer_profiles;
begin
  select * into v_org from employer_profiles where id = p_employer;
  if not found then return 'organization_not_verified'; end if;

  select * into v_policy from profile_visibility_policies where user_id = p_user;
  if not found then return 'visibility_private'; end if;

  -- Блокировка организации или её известного домена — абсолютна.
  if exists (
    select 1 from organization_discovery_blocks b
    where b.user_id = p_user
      and (b.employer_id = p_employer
        or (b.domain is not null and exists (
              select 1 from jsonb_array_elements_text(v_org.domains) d
              where lower(d) = lower(b.domain))))
  ) then
    return 'organization_blocked';
  end if;

  -- Текущий работодатель (по названию или домену).
  if v_policy.hide_current_employer and exists (
    select 1 from jsonb_array_elements_text(v_policy.current_employer_names) n
    where lower(n) = lower(coalesce(v_org.company_name,''))
       or exists (select 1 from jsonb_array_elements_text(v_org.domains) d
                  where lower(d) = lower(n))
  ) then
    return 'current_employer_hidden';
  end if;

  if v_org.verified_at is null
     or v_org.verification_revoked_at is not null
     or (v_org.verification_expires_at is not null and v_org.verification_expires_at <= now())
  then
    return 'organization_not_verified';
  end if;

  if v_policy.mode = 'private' then return 'visibility_private'; end if;

  select coalesce(search_intent,'open') into v_intent from resumes where user_id = p_user;
  if v_intent is null or v_intent = 'unavailable' then return 'candidate_unavailable'; end if;

  select * into v_member from talent_pool_memberships where user_id = p_user;
  if v_member is null or v_member.state <> 'active'
     or (v_member.expires_at is not null and v_member.expires_at <= now())
  then
    return 'membership_inactive';
  end if;

  if not exists (
    select 1 from purpose_authorizations a
    where a.user_id = p_user
      and a.purpose = 'talent_pool_discovery'
      and a.revoked_at is null
      and (a.expires_at is null or a.expires_at > now())
      and a.granted_at <= now()
  ) then
    return 'authorization_inactive';
  end if;

  -- `invited_only` и `recommendations_only` не дают работодателю поиск.
  if v_policy.mode in ('invited_only','recommendations_only')
     and not exists (
       select 1 from profile_access_grants g
       where g.user_id = p_user and g.employer_id = p_employer
         and g.revoked_at is null
         and (g.expires_at is null or g.expires_at > now())
     )
  then
    return case v_policy.mode when 'invited_only' then 'invited_only'
                              else 'recommendations_only' end;
  end if;

  return null;
end; $$;

-- Проекция профиля по принятому знакомству. Единственное место, где
-- employer-facing данные собираются из `resumes`:
--   • только поля разрешённого уровня (прямых идентификаторов нет вообще);
--   • только то, что кандидат передал в scope гранта (если он не пуст);
--   • минус field-level `hidden_fields` кандидата — вычитаются всегда.
create or replace function private.invite_profile(p_invite uuid)
returns jsonb language plpgsql stable security definer set search_path = public as $$
declare
  g profile_access_grants;
  r resumes;
  v_scope text[];
  v_hidden text[];
  v_payload jsonb;
begin
  select * into g from profile_access_grants
   where invite_id = p_invite and revoked_at is null
     and (expires_at is null or expires_at > now())
   order by granted_at desc limit 1;
  if not found then return null; end if;

  select * into r from resumes where user_id = g.user_id;
  if not found then return null; end if;

  v_payload := jsonb_build_object(
    'level', g.level,
    'profession', r.profession,
    'role_taxonomy_code', r.role_taxonomy_code,
    'seniority', r.seniority,
    'years_of_experience', r.years_of_experience,
    'current_location', r.current_location,
    'languages', r.languages,
    'salary_expectation', r.salary_expectation,
    'notice_period_days', r.notice_period_days,
    'work_format_preference', r.work_format_preference,
    'work_authorization', r.work_authorization,
    'key_achievements', r.key_achievements,
    'management_experience', r.management_experience,
    'team_size', r.team_size
  );

  select coalesce(array_agg(t.val), '{}') into v_scope
    from jsonb_array_elements_text(coalesce(g.scope_fields, '[]'::jsonb)) as t(val);
  if array_length(v_scope, 1) is not null then
    select coalesce(jsonb_object_agg(e.key, e.value), '{}'::jsonb) into v_payload
      from jsonb_each(v_payload) as e
     where e.key = 'level' or e.key = any(v_scope);
  end if;

  select coalesce(array_agg(t.val), '{}') into v_hidden
    from jsonb_array_elements_text(
      coalesce((select hidden_fields from profile_visibility_policies
                 where user_id = g.user_id), '[]'::jsonb)) as t(val);
  if array_length(v_hidden, 1) is not null then
    v_payload := v_payload - v_hidden;
  end if;

  return v_payload;
end; $$;

-- Псевдоним «кандидат × организация» (создаётся лениво).
create or replace function private.pseudonym_for(p_user uuid, p_employer uuid)
returns uuid language plpgsql volatile security definer set search_path = public as $$
declare v_ref uuid;
begin
  insert into talent_pool_pseudonyms(user_id, employer_id)
  values (p_user, p_employer)
  on conflict (user_id, employer_id) do nothing;
  select ref into v_ref from talent_pool_pseudonyms
  where user_id = p_user and employer_id = p_employer;
  return v_ref;
end; $$;

-- ── 10. RPC кандидата ───────────────────────────────────────────────

create or replace function set_profile_visibility(
  p_mode text,
  p_hide_current_employer boolean default true,
  p_current_employer_names jsonb default '[]'::jsonb,
  p_hidden_fields jsonb default '[]'::jsonb
) returns text language plpgsql volatile security definer set search_path = public as $$
begin
  if auth.uid() is null then raise exception 'not authenticated'; end if;
  if p_mode not in ('private','recommendations_only','invited_only',
                    'confidential_pool','discoverable_pool') then
    raise exception 'invalid visibility mode';
  end if;

  insert into profile_visibility_policies(
    user_id, mode, hide_current_employer, current_employer_names, hidden_fields, updated_at
  ) values (
    auth.uid(), p_mode, coalesce(p_hide_current_employer, true),
    coalesce(p_current_employer_names,'[]'::jsonb), coalesce(p_hidden_fields,'[]'::jsonb), now()
  )
  on conflict (user_id) do update set
    mode = excluded.mode,
    hide_current_employer = excluded.hide_current_employer,
    current_employer_names = excluded.current_employer_names,
    hidden_fields = excluded.hidden_fields,
    updated_at = now();

  -- Смена видимости инвалидирует ранее посчитанные оценки (§7.3).
  update match_assessments set invalidated_at = now()
   where user_id = auth.uid() and invalidated_at is null;

  return p_mode;
end; $$;
grant execute on function set_profile_visibility(text,boolean,jsonb,jsonb) to authenticated;

-- Вступление/пауза/выход. Вступить можно только при действующем
-- purpose-разрешении на discovery (§16 — автоматическое включение запрещено).
create or replace function set_talent_pool_membership(
  p_state text,
  p_expires_at timestamptz default null
) returns text language plpgsql volatile security definer set search_path = public as $$
declare v_current text;
begin
  if auth.uid() is null then raise exception 'not authenticated'; end if;
  if p_state not in ('active','paused','left') then
    raise exception 'invalid membership state';
  end if;

  if p_state = 'active' and not exists (
    select 1 from purpose_authorizations a
    where a.user_id = auth.uid() and a.purpose = 'talent_pool_discovery'
      and a.revoked_at is null
      and (a.expires_at is null or a.expires_at > now())
  ) then
    raise exception 'talent pool authorization required';
  end if;

  select state into v_current from talent_pool_memberships where user_id = auth.uid();

  insert into talent_pool_memberships(
    user_id, state, joined_at, paused_at, left_at, expires_at, last_confirmed_at, updated_at
  ) values (
    auth.uid(), p_state,
    case when p_state = 'active' then now() end,
    case when p_state = 'paused' then now() end,
    case when p_state = 'left'   then now() end,
    p_expires_at, now(), now()
  )
  on conflict (user_id) do update set
    state = excluded.state,
    joined_at = case when excluded.state = 'active'
                     then coalesce(talent_pool_memberships.joined_at, now())
                     else talent_pool_memberships.joined_at end,
    paused_at = case when excluded.state = 'paused' then now()
                     else talent_pool_memberships.paused_at end,
    left_at   = case when excluded.state = 'left' then now()
                     else talent_pool_memberships.left_at end,
    expires_at = coalesce(excluded.expires_at, talent_pool_memberships.expires_at),
    last_confirmed_at = now(),
    updated_at = now();

  -- Выход и пауза прекращают новые показы: старые оценки больше не валидны.
  if p_state <> 'active' then
    update match_assessments set invalidated_at = now()
     where user_id = auth.uid() and invalidated_at is null;
  end if;

  return p_state;
end; $$;
grant execute on function set_talent_pool_membership(text,timestamptz) to authenticated;

create or replace function block_organization(
  p_employer_id uuid default null,
  p_domain text default null
) returns uuid language plpgsql volatile security definer set search_path = public as $$
declare v_id uuid;
begin
  if auth.uid() is null then raise exception 'not authenticated'; end if;
  if p_employer_id is null and coalesce(trim(p_domain),'') = '' then
    raise exception 'employer or domain required';
  end if;

  insert into organization_discovery_blocks(user_id, employer_id, domain)
  values (auth.uid(), p_employer_id, nullif(trim(lower(coalesce(p_domain,''))),''))
  on conflict do nothing
  returning id into v_id;

  -- Блокировка немедленно закрывает уже выданный доступ и оценки.
  if p_employer_id is not null then
    update profile_access_grants set revoked_at = now()
     where user_id = auth.uid() and employer_id = p_employer_id and revoked_at is null;
    update match_assessments set invalidated_at = now()
     where user_id = auth.uid() and employer_id = p_employer_id and invalidated_at is null;
    update opportunity_invites set state = 'withdrawn', responded_at = now()
     where user_id = auth.uid() and employer_id = p_employer_id
       and state in ('sent','viewed');
  end if;

  return v_id;
end; $$;
grant execute on function block_organization(uuid,text) to authenticated;

create or replace function unblock_organization(p_block_id uuid)
returns boolean language plpgsql volatile security definer set search_path = public as $$
declare v_count integer;
begin
  if auth.uid() is null then raise exception 'not authenticated'; end if;
  delete from organization_discovery_blocks
   where id = p_block_id and user_id = auth.uid();
  get diagnostics v_count = row_count;
  return v_count > 0;
end; $$;
grant execute on function unblock_organization(uuid) to authenticated;

-- ── 11. RPC работодателя ────────────────────────────────────────────

-- Анонимная выдача пула. Работодатель получает `ref`, а не user_id, и
-- только те поля, которые разрешает режим видимости кандидата.
-- Обязательные критерии оцениваются в lib/matching.ts на сервере Doki:
-- эта функция отвечает за право доступа, а не за «лучшесть» кандидатов.
create or replace function talent_pool_candidates(p_limit integer default 50)
returns jsonb language plpgsql volatile security definer set search_path = public as $$
declare
  v_employer uuid;
  v_limit integer := least(greatest(coalesce(p_limit, 50), 1), 100);
  v_recent integer;
  v_result jsonb := '[]'::jsonb;
  rec record;
  v_payload jsonb;
  v_hidden text[];
begin
  v_employer := private.verified_employer_for_uid();
  if v_employer is null then raise exception 'verified employer required'; end if;

  -- Анти-differencing: ограничиваем частоту последовательных выборок.
  select count(*) into v_recent from profile_access_log
   where employer_id = v_employer and basis = 'talent_pool_search'
     and created_at > now() - interval '1 hour';
  if v_recent >= 600 then raise exception 'search rate limit reached'; end if;

  for rec in
    select r.*, p.mode, p.hidden_fields
      from resumes r
      join profile_visibility_policies p on p.user_id = r.user_id
     where r.lifecycle = 'ready'
       and private.discovery_denied_reason(r.user_id, v_employer) is null
     -- Детерминированный порядок, не связанный с «качеством» человека.
     order by r.last_confirmed_at desc nulls last, r.user_id
     limit v_limit
  loop
    v_payload := jsonb_build_object(
      'ref', private.pseudonym_for(rec.user_id, v_employer),
      -- Оценка существует только для пары «версия профиля × версия вакансии».
      'profile_version_id', (
        select v.id from professional_profile_versions v
        where v.user_id = rec.user_id
        order by v.version_no desc limit 1
      ),
      'reveal_level', case rec.mode when 'discoverable_pool' then 'pool_fields' else 'blind' end,
      'profession', rec.profession,
      'role_taxonomy_code', rec.role_taxonomy_code,
      'role_free_text', rec.role_free_text,
      'seniority', rec.seniority,
      'years_of_experience', rec.years_of_experience,
      'current_location', rec.current_location,
      'preferred_locations', rec.preferred_locations,
      'work_format_preference', rec.work_format_preference,
      'relocation_willingness', rec.relocation_willingness,
      'work_authorization', rec.work_authorization,
      'languages', rec.languages,
      'salary_expectation', rec.salary_expectation,
      'search_intent', rec.search_intent,
      'notice_period_days', rec.notice_period_days,
      'preferred_employment_format', rec.preferred_employment_format,
      'field_confirmations', rec.field_confirmations,
      'last_confirmed_at', rec.last_confirmed_at
    );

    -- Контекстные поля — только в открытом режиме пула. Имя, контакты, CV,
    -- ссылки и свободный текст не отдаются ни на одном уровне до `Share & apply`.
    if rec.mode = 'discoverable_pool' then
      v_payload := v_payload || jsonb_build_object(
        'management_experience', rec.management_experience,
        'team_size', rec.team_size,
        'company_type_preference', rec.company_type_preference
      );
    end if;

    -- Field-level видимость кандидата.
    select coalesce(array_agg(t.val), '{}') into v_hidden
      from jsonb_array_elements_text(coalesce(rec.hidden_fields,'[]'::jsonb)) as t(val);
    if array_length(v_hidden, 1) is not null then
      v_payload := v_payload - v_hidden;
    end if;

    insert into profile_access_log(user_id, employer_id, basis, level, context)
    values (rec.user_id, v_employer, 'talent_pool_search',
            case rec.mode when 'discoverable_pool' then 'pool_fields' else 'blind' end,
            jsonb_build_object('mode', rec.mode));

    v_result := v_result || jsonb_build_array(v_payload);
  end loop;

  return v_result;
end; $$;
grant execute on function talent_pool_candidates(integer) to authenticated;

-- Отправить blind-приглашение по псевдониму. Работодатель не знает, кому
-- именно оно ушло, пока кандидат не примет знакомство.
create or replace function send_opportunity_invite(
  p_ref uuid,
  p_vacancy_id uuid,
  p_vacancy_version_id uuid,
  p_role_title text,
  p_location text,
  p_work_format text,
  p_compensation_range text,
  p_access_purpose text,
  p_respond_by timestamptz,
  p_message text default null,
  p_match_explanation jsonb default null,
  p_profile_version_id uuid default null
) returns jsonb language plpgsql volatile security definer set search_path = public as $$
declare
  v_employer uuid; v_user uuid; v_mode text; v_sent integer; v_invite uuid; v_blind boolean;
begin
  v_employer := private.verified_employer_for_uid();
  if v_employer is null then raise exception 'verified employer required'; end if;

  select user_id into v_user from talent_pool_pseudonyms
   where ref = p_ref and employer_id = v_employer;
  if v_user is null then raise exception 'unknown candidate reference'; end if;

  if private.discovery_denied_reason(v_user, v_employer) is not null then
    raise exception 'candidate is not discoverable';
  end if;

  -- Приглашение обязано раскрывать организацию, роль, условия и цель (§8.8.4).
  if coalesce(trim(p_role_title),'') = ''
     or coalesce(trim(p_access_purpose),'') = ''
     or coalesce(trim(p_compensation_range),'') = ''
     or p_respond_by is null then
    raise exception 'invite disclosures incomplete';
  end if;

  -- Вакансия должна принадлежать этой организации.
  if p_vacancy_id is not null and not exists (
    select 1 from vacancies where id = p_vacancy_id and employer_id = v_employer
  ) then
    raise exception 'not authorized for vacancy';
  end if;

  select count(*) into v_sent from opportunity_invites
   where employer_id = v_employer and created_at > now() - interval '1 day';
  if v_sent >= 25 then raise exception 'invite rate limit reached'; end if;

  select mode into v_mode from profile_visibility_policies where user_id = v_user;
  v_blind := v_mode <> 'discoverable_pool';

  insert into opportunity_invites(
    employer_id, user_id, vacancy_id, vacancy_version_id, role_title, location,
    work_format, compensation_range, access_purpose, message, respond_by, blind
  ) values (
    v_employer, v_user, p_vacancy_id, p_vacancy_version_id, trim(p_role_title),
    p_location, p_work_format, p_compensation_range, trim(p_access_purpose),
    nullif(trim(coalesce(p_message,'')),''), p_respond_by, v_blind
  )
  on conflict (employer_id, user_id, vacancy_id) do nothing
  returning id into v_invite;

  if v_invite is null then
    return jsonb_build_object('duplicate', true);
  end if;

  if p_match_explanation is not null and p_vacancy_version_id is not null then
    insert into match_assessments(
      employer_id, user_id, vacancy_version_id, profile_version_id,
      explanation, valid_until
    ) values (
      v_employer, v_user, p_vacancy_version_id, p_profile_version_id,
      p_match_explanation, now() + interval '30 days'
    );
  end if;

  insert into profile_access_log(user_id, employer_id, basis, level, context)
  values (v_user, v_employer, 'invite', case when v_blind then 'blind' else 'pool_fields' end,
          jsonb_build_object('invite_id', v_invite));

  return jsonb_build_object('invite_id', v_invite, 'blind', v_blind);
end; $$;
grant execute on function send_opportunity_invite(
  uuid,uuid,uuid,text,text,text,text,text,timestamptz,text,jsonb,uuid) to authenticated;

-- Список приглашений организации. user_id наружу не отдаётся: до принятия
-- знакомства работодатель видит только собственную сторону переписки.
create or replace function get_employer_invites()
returns jsonb language plpgsql stable security definer set search_path = public as $$
declare v_employer uuid; v_result jsonb;
begin
  v_employer := private.verified_employer_for_uid();
  if v_employer is null then raise exception 'verified employer required'; end if;

  select coalesce(jsonb_agg(jsonb_build_object(
    'invite_id', i.id,
    'role_title', i.role_title,
    'location', i.location,
    'work_format', i.work_format,
    'compensation_range', i.compensation_range,
    'access_purpose', i.access_purpose,
    'respond_by', i.respond_by,
    'blind', i.blind,
    'state', i.state,
    'created_at', i.created_at,
    'responded_at', i.responded_at,
    'vacancy_id', i.vacancy_id,
    -- Профиль появляется только после принятого знакомства и строго в
    -- объёме гранта минус поля, скрытые кандидатом (§8.5).
    'profile', case when i.state = 'accepted'
                    then private.invite_profile(i.id) else null end,
    'match_explanation', (
      select m.explanation from match_assessments m
      where m.employer_id = i.employer_id and m.user_id = i.user_id
        and m.vacancy_version_id = i.vacancy_version_id
        and m.invalidated_at is null and m.valid_until > now()
      order by m.evaluated_at desc limit 1
    )
  ) order by i.created_at desc), '[]'::jsonb)
  into v_result
  from opportunity_invites i
  where i.employer_id = v_employer;

  return v_result;
end; $$;
grant execute on function get_employer_invites() to authenticated;

-- ── 12. RPC кандидата по приглашениям ───────────────────────────────

create or replace function get_my_opportunity_invites()
returns jsonb language plpgsql stable security definer set search_path = public as $$
declare v_result jsonb;
begin
  if auth.uid() is null then return '[]'::jsonb; end if;

  select coalesce(jsonb_agg(jsonb_build_object(
    'invite_id', i.id,
    'organization_id', ep.id,
    'organization_name', ep.company_name,
    'organization_verified', (ep.verified_at is not null
                              and ep.verification_revoked_at is null),
    'role_title', i.role_title,
    'location', i.location,
    'work_format', i.work_format,
    'compensation_range', i.compensation_range,
    'access_purpose', i.access_purpose,
    'message', i.message,
    'respond_by', i.respond_by,
    'state', i.state,
    'created_at', i.created_at,
    'vacancy_id', i.vacancy_id,
    'vacancy_slug', v.slug,
    'match_explanation', (
      select m.explanation from match_assessments m
      where m.user_id = i.user_id and m.employer_id = i.employer_id
        and m.vacancy_version_id = i.vacancy_version_id
        and m.invalidated_at is null
      order by m.evaluated_at desc limit 1
    )
  ) order by i.created_at desc), '[]'::jsonb)
  into v_result
  from opportunity_invites i
  join employer_profiles ep on ep.id = i.employer_id
  left join vacancies v on v.id = i.vacancy_id
  where i.user_id = auth.uid();

  return v_result;
end; $$;
grant execute on function get_my_opportunity_invites() to authenticated;

-- Принять знакомство (ограниченный доступ) или отклонить. Отклонение НЕ
-- записывается в профиль и не влияет на будущее сопоставление (§17.14).
create or replace function respond_to_opportunity_invite(
  p_invite_id uuid,
  p_action text,
  p_scope_fields jsonb default '[]'::jsonb
) returns text language plpgsql volatile security definer set search_path = public as $$
declare v_invite opportunity_invites;
begin
  if auth.uid() is null then raise exception 'not authenticated'; end if;
  if p_action not in ('view','accept','decline') then raise exception 'invalid action'; end if;

  select * into v_invite from opportunity_invites
   where id = p_invite_id and user_id = auth.uid();
  if not found then raise exception 'invite not found'; end if;

  if p_action = 'view' then
    if v_invite.state = 'sent' then
      update opportunity_invites set state = 'viewed', viewed_at = now()
       where id = p_invite_id;
      return 'viewed';
    end if;
    return v_invite.state;
  end if;

  if v_invite.state not in ('sent','viewed') then
    raise exception 'invite is not answerable';
  end if;

  if p_action = 'decline' then
    update opportunity_invites set state = 'declined', responded_at = now()
     where id = p_invite_id;
    return 'declined';
  end if;

  -- accept: ограниченный ProfileAccessGrant. Это ещё НЕ отклик (§8.8.6).
  update opportunity_invites set state = 'accepted', responded_at = now()
   where id = p_invite_id;

  insert into profile_access_grants(
    user_id, employer_id, invite_id, level, scope_fields, expires_at
  ) values (
    auth.uid(), v_invite.employer_id, p_invite_id, 'introduced',
    coalesce(p_scope_fields,'[]'::jsonb), now() + interval '30 days'
  );

  insert into profile_access_log(user_id, employer_id, basis, level, context)
  values (auth.uid(), v_invite.employer_id, 'access_grant', 'introduced',
          jsonb_build_object('invite_id', p_invite_id));

  return 'accepted';
end; $$;
grant execute on function respond_to_opportunity_invite(uuid,text,jsonb) to authenticated;

-- Отдельное явное действие: `Share & apply`. Создаёт application-purpose
-- authorization, Application и неизменяемый снимок профиля (§8.8.6).
-- ВАЖНО: объяснение по критериям НЕ принимается от кандидата. Оно
-- копируется из `match_assessments`, куда его записал серверный код Doki
-- при отправке приглашения. Иначе кандидат мог бы вызвать RPC напрямую и
-- подсунуть работодателю выдуманное «покрытие требований».
create or replace function share_and_apply(
  p_invite_id uuid,
  p_shared_fields jsonb,
  p_consent_text text,
  p_notice_version text,
  p_profile jsonb,
  p_requirements jsonb,
  p_visibility_state jsonb,
  p_checksum text
) returns jsonb language plpgsql volatile security definer set search_path = public as $$
declare
  v_invite opportunity_invites;
  v_app uuid;
  v_name text; v_contact text; v_email text;
  v_explanation jsonb;
begin
  if auth.uid() is null then raise exception 'not authenticated'; end if;

  select * into v_invite from opportunity_invites
   where id = p_invite_id and user_id = auth.uid();
  if not found then raise exception 'invite not found'; end if;
  if v_invite.state <> 'accepted' then raise exception 'introduction not accepted'; end if;
  if v_invite.vacancy_id is null then raise exception 'invite has no vacancy'; end if;
  if coalesce(trim(p_consent_text),'') = '' then raise exception 'consent required'; end if;

  select full_name, contact, email into v_name, v_contact, v_email
    from resumes where user_id = auth.uid();
  if coalesce(trim(coalesce(v_name,'')),'') = '' or coalesce(trim(coalesce(v_contact,'')),'') = '' then
    raise exception 'name and contact required';
  end if;

  -- Разрешение на отклик — отдельная цель, а не переиспользование пула.
  insert into purpose_authorizations(
    user_id, purpose, audience, audience_employer_id, scope_fields,
    legal_basis, notice_version, consent_text
  ) values (
    auth.uid(), 'application', 'organization', v_invite.employer_id,
    coalesce(p_shared_fields,'[]'::jsonb), 'consent', p_notice_version, p_consent_text
  );

  insert into applications(
    vacancy_id, user_id, full_name, whatsapp, email, consent_text, source
  ) values (
    v_invite.vacancy_id, auth.uid(), v_name, v_contact, v_email, p_consent_text, 'direct'
  )
  on conflict (vacancy_id, whatsapp) do nothing
  returning id into v_app;

  if v_app is null then
    select id into v_app from applications
     where vacancy_id = v_invite.vacancy_id and whatsapp = v_contact;
  else
    insert into application_status_log(application_id, old_status, new_status)
    values (v_app, null, 'new');
    insert into application_events(application_id, actor, actor_kind, type, payload)
    values (v_app, auth.uid(), 'user', 'consent',
            jsonb_build_object('action','share_and_apply','invite_id', p_invite_id));
  end if;

  -- Полное раскрытие в объёме переданных полей.
  insert into profile_access_grants(
    user_id, employer_id, invite_id, level, scope_fields, expires_at
  ) values (
    auth.uid(), v_invite.employer_id, p_invite_id, 'shared',
    coalesce(p_shared_fields,'[]'::jsonb), null
  );

  select m.explanation into v_explanation
    from match_assessments m
   where m.employer_id = v_invite.employer_id and m.user_id = auth.uid()
     and m.vacancy_version_id is not distinct from v_invite.vacancy_version_id
   order by m.evaluated_at desc limit 1;

  insert into application_profile_snapshots(
    application_id, user_id, candidate_profile_snapshot,
    vacancy_requirements_snapshot, match_explanation_snapshot,
    visibility_state_snapshot, checksum
  )
  select v_app, auth.uid(), p_profile, p_requirements, v_explanation,
         p_visibility_state, p_checksum
  where not exists (
    select 1 from application_profile_snapshots where application_id = v_app
  );

  insert into profile_access_log(user_id, employer_id, basis, level, context)
  values (auth.uid(), v_invite.employer_id, 'application', 'shared',
          jsonb_build_object('application_id', v_app, 'invite_id', p_invite_id));

  return jsonb_build_object('application_id', v_app);
end; $$;
grant execute on function share_and_apply(uuid,jsonb,text,text,jsonb,jsonb,jsonb,text)
  to authenticated;

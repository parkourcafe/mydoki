-- PR-6 (фаза 1B): stage×state отклика + единая лента событий + отзыв
-- согласия + отзыв отклика кандидатом. Аддитивно и совместимо с Doki.id:
-- новые колонки/таблица/RPC; существующий status и его переходы сохранены.
-- update_application_status расширен ТОЛЬКО добавлением записей в новые
-- колонки и в application_events (наблюдаемое поведение для Doki.id не
-- меняется — оно этих колонок не читает).
--
-- План отката (rollback):
--   drop function if exists revoke_application_consent(text);
--   drop function if exists request_application_documents(uuid,text);
--   drop function if exists add_application_note(uuid,text);
--   drop function if exists withdraw_application(uuid);
--   drop table if exists application_events;
--   alter table applications drop column if exists stage,
--     drop column if exists state, drop column if exists rejected_reason,
--     drop column if exists consent_revoked_at;
--   (update_application_status / get_my_applications вернуть к версии из
--    20260704000000 / 20260703120000)

-- ── Новые поля отклика ──────────────────────────────────────────────
-- stage — положение в воронке (из vacancy.stages); state — жизненный
-- статус. status сохраняется как есть (Doki.id + обратная совместимость).
-- Дефолты гарантируют консистентность новых откликов (в т.ч. созданных
-- старым submit_application / Doki.id, которые эти колонки не задают).
alter table applications
  add column if not exists stage text default 'new',
  add column if not exists state text default 'active',
  add column if not exists rejected_reason text,
  add column if not exists consent_revoked_at timestamptz;

-- Бэкофилл stage/state из status для всех существующих откликов
-- (перекрывает дефолт там, где status уже терминальный).
update applications set
  state = case status when 'rejected' then 'rejected' when 'hired' then 'hired' else 'active' end,
  stage = case status
    when 'new' then 'new' when 'viewed' then 'review'
    when 'shortlisted' then 'interview' when 'rejected' then 'decision'
    when 'hired' then 'decision' else 'new' end;

-- ── Единая лента событий ────────────────────────────────────────────
create table if not exists application_events (
  id             uuid primary key default gen_random_uuid(),
  application_id uuid not null references applications(id) on delete cascade,
  actor          uuid,                      -- user_id или null (система)
  actor_kind     text not null default 'user'
                   check (actor_kind in ('user','system','ai')),
  type           text not null,             -- stage_change, note, document_request, consent, withdraw, ai_analysis
  payload        jsonb not null default '{}'::jsonb,
  created_at     timestamptz not null default now()
);
create index if not exists application_events_app_idx
  on application_events(application_id, created_at);

alter table application_events enable row level security;

-- Читают: работодатель (свои вакансии) и кандидат (свои отклики).
-- Пишут — только SECURITY DEFINER RPC (insert-политик нет).
create policy "app_events employer read" on application_events for select
  using (
    application_id in (
      select a.id from applications a
      join vacancies v on v.id = a.vacancy_id
      join employer_profiles ep on ep.id = v.employer_id
      where ep.user_id = (select auth.uid())
    )
  );
create policy "app_events candidate read" on application_events for select
  using (
    application_id in (
      select id from applications where user_id = (select auth.uid())
    )
  );

-- Бэкофилл ленты из журнала статусов.
insert into application_events(application_id, actor, actor_kind, type, payload, created_at)
select l.application_id, l.changed_by,
       case when l.changed_by is null then 'system' else 'user' end,
       'stage_change',
       jsonb_build_object('old_status', l.old_status, 'new_status', l.new_status),
       l.created_at
from application_status_log l
where not exists (
  select 1 from application_events e
  where e.application_id = l.application_id and e.created_at = l.created_at
    and e.type = 'stage_change'
);

-- ── update_application_status: +stage/state +событие (аддитивно) ────
-- Тело переходов идентично живой версии (20260704000000); добавлены
-- обновление stage/state и запись в application_events.
create or replace function public.update_application_status(
  p_application_id uuid, p_new_status text
) returns text language plpgsql security definer set search_path to 'public' as $$
declare v_owner uuid; v_old text;
begin
  if auth.uid() is null then raise exception 'not authenticated'; end if;
  if p_new_status not in ('new','viewed','shortlisted','rejected','hired') then
    raise exception 'invalid status';
  end if;

  select ep.user_id, a.status into v_owner, v_old
  from applications a
  join vacancies v on v.id = a.vacancy_id
  join employer_profiles ep on ep.id = v.employer_id
  where a.id = p_application_id;

  if v_owner is null or v_owner <> auth.uid() then raise exception 'not authorized'; end if;
  if v_old = p_new_status then return v_old; end if;

  if not (
    (v_old = 'new'         and p_new_status in ('viewed','shortlisted','rejected')) or
    (v_old = 'viewed'      and p_new_status in ('shortlisted','rejected')) or
    (v_old = 'shortlisted' and p_new_status in ('rejected','hired'))
  ) then
    raise exception 'transition not allowed: % -> %', v_old, p_new_status;
  end if;

  update applications set
    status = p_new_status,
    state = case p_new_status when 'rejected' then 'rejected' when 'hired' then 'hired' else 'active' end,
    stage = case p_new_status
      when 'new' then 'new' when 'viewed' then 'review'
      when 'shortlisted' then 'interview' else 'decision' end,
    updated_at = now()
  where id = p_application_id;

  insert into application_status_log(application_id, old_status, new_status, changed_by)
  values (p_application_id, v_old, p_new_status, auth.uid());
  insert into application_events(application_id, actor, actor_kind, type, payload)
  values (p_application_id, auth.uid(), 'user', 'stage_change',
          jsonb_build_object('old_status', v_old, 'new_status', p_new_status));

  return p_new_status;
end; $$;
grant execute on function update_application_status(uuid,text) to authenticated;

-- ── Отзыв отклика кандидатом ────────────────────────────────────────
create or replace function withdraw_application(p_application_id uuid)
returns text language plpgsql volatile security definer set search_path = public as $$
declare v_uid uuid; v_state text;
begin
  if auth.uid() is null then raise exception 'not authenticated'; end if;
  select user_id, coalesce(state,'active') into v_uid, v_state
  from applications where id = p_application_id;
  if v_uid is null or v_uid <> auth.uid() then raise exception 'not authorized'; end if;
  if v_state in ('hired','withdrawn') then return v_state; end if;
  update applications set state = 'withdrawn', updated_at = now() where id = p_application_id;
  insert into application_events(application_id, actor, actor_kind, type)
  values (p_application_id, auth.uid(), 'user', 'withdraw');
  return 'withdrawn';
end; $$;
grant execute on function withdraw_application(uuid) to authenticated;

-- ── Заметка работодателя ────────────────────────────────────────────
create or replace function add_application_note(p_application_id uuid, p_note text)
returns void language plpgsql volatile security definer set search_path = public as $$
declare v_owner uuid;
begin
  if auth.uid() is null then raise exception 'not authenticated'; end if;
  select ep.user_id into v_owner
  from applications a join vacancies v on v.id = a.vacancy_id
  join employer_profiles ep on ep.id = v.employer_id
  where a.id = p_application_id;
  if v_owner is null or v_owner <> auth.uid() then raise exception 'not authorized'; end if;
  if coalesce(trim(p_note),'') = '' then return; end if;
  insert into application_events(application_id, actor, actor_kind, type, payload)
  values (p_application_id, auth.uid(), 'user', 'note', jsonb_build_object('note', p_note));
end; $$;
grant execute on function add_application_note(uuid,text) to authenticated;

-- ── Запрос недостающих документов у кандидата ───────────────────────
create or replace function request_application_documents(p_application_id uuid, p_note text)
returns void language plpgsql volatile security definer set search_path = public as $$
declare v_owner uuid;
begin
  if auth.uid() is null then raise exception 'not authenticated'; end if;
  select ep.user_id into v_owner
  from applications a join vacancies v on v.id = a.vacancy_id
  join employer_profiles ep on ep.id = v.employer_id
  where a.id = p_application_id;
  if v_owner is null or v_owner <> auth.uid() then raise exception 'not authorized'; end if;
  insert into application_events(application_id, actor, actor_kind, type, payload)
  values (p_application_id, auth.uid(), 'user', 'document_request',
          jsonb_build_object('note', coalesce(p_note,'')));
end; $$;
grant execute on function request_application_documents(uuid,text) to authenticated;

-- ── Перемещение по этапам воронки (в пределах stages вакансии) ──────
create or replace function set_application_stage(p_application_id uuid, p_stage text)
returns text language plpgsql volatile security definer set search_path = public as $$
declare v_owner uuid; v_old_stage text; v_stages jsonb;
begin
  if auth.uid() is null then raise exception 'not authenticated'; end if;
  select ep.user_id, a.stage, coalesce(v.stages,'[]'::jsonb)
    into v_owner, v_old_stage, v_stages
  from applications a join vacancies v on v.id = a.vacancy_id
  join employer_profiles ep on ep.id = v.employer_id
  where a.id = p_application_id;
  if v_owner is null or v_owner <> auth.uid() then raise exception 'not authorized'; end if;
  if not (v_stages ? p_stage) then raise exception 'invalid stage'; end if;
  if v_old_stage is not distinct from p_stage then return p_stage; end if;

  update applications set stage = p_stage, updated_at = now() where id = p_application_id;
  insert into application_events(application_id, actor, actor_kind, type, payload)
  values (p_application_id, auth.uid(), 'user', 'stage_change',
          jsonb_build_object('old_stage', v_old_stage, 'new_stage', p_stage));
  return p_stage;
end; $$;
grant execute on function set_application_stage(uuid,text) to authenticated;

-- ── Отказ с обязательной причиной ───────────────────────────────────
create or replace function reject_application(p_application_id uuid, p_reason text)
returns void language plpgsql volatile security definer set search_path = public as $$
declare v_owner uuid; v_old text;
begin
  if auth.uid() is null then raise exception 'not authenticated'; end if;
  if coalesce(trim(p_reason),'') = '' then raise exception 'reason required'; end if;
  select ep.user_id, a.status into v_owner, v_old
  from applications a join vacancies v on v.id = a.vacancy_id
  join employer_profiles ep on ep.id = v.employer_id
  where a.id = p_application_id;
  if v_owner is null or v_owner <> auth.uid() then raise exception 'not authorized'; end if;

  update applications set
    status = 'rejected', state = 'rejected', stage = 'decision',
    rejected_reason = trim(p_reason), updated_at = now()
  where id = p_application_id;
  insert into application_status_log(application_id, old_status, new_status, changed_by)
  values (p_application_id, v_old, 'rejected', auth.uid());
  insert into application_events(application_id, actor, actor_kind, type, payload)
  values (p_application_id, auth.uid(), 'user', 'stage_change',
          jsonb_build_object('old_status', v_old, 'new_status', 'rejected', 'reason', trim(p_reason)));
end; $$;
grant execute on function reject_application(uuid,text) to authenticated;

-- ── Отзыв согласия на обработку (по секретному токену) ──────────────
-- Прекращает дальнейшую обработку. Закрытие доступа работодателя к
-- документам обеспечивается на уровне приложения (см. карточку кандидата);
-- ужесточение RLS application_documents — отдельная правка (отложено).
create or replace function revoke_application_consent(p_token text)
returns boolean language plpgsql volatile security definer set search_path = public as $$
declare v_id uuid;
begin
  select id into v_id from applications
  where access_token = p_token and consent_revoked_at is null;
  if v_id is null then return false; end if;
  update applications set consent_revoked_at = now(), updated_at = now() where id = v_id;
  insert into application_events(application_id, actor, actor_kind, type, payload)
  values (v_id, null, 'system', 'consent', jsonb_build_object('action','revoked'));
  return true;
end; $$;
grant execute on function revoke_application_consent(text) to anon, authenticated;

-- ── get_my_applications: +stage/state/consent (аддитивно) ───────────
create or replace function get_my_applications()
returns jsonb language plpgsql stable security definer set search_path = public as $$
declare result jsonb;
begin
  if auth.uid() is null then return '[]'::jsonb; end if;
  select coalesce(jsonb_agg(jsonb_build_object(
    'id', a.id,
    'status', a.status,
    'stage', a.stage,
    'state', coalesce(a.state,'active'),
    'consent_revoked_at', a.consent_revoked_at,
    'created_at', a.created_at,
    'access_token', a.access_token,
    'vacancy_title', v.title,
    'company_name', v.company_name,
    'location', v.location
  ) order by a.created_at desc), '[]'::jsonb)
  into result
  from applications a
  join vacancies v on v.id = a.vacancy_id
  where a.user_id = auth.uid();
  return result;
end; $$;
grant execute on function get_my_applications() to authenticated;

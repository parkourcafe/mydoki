-- PR-14: правки по итогам adversarial code-review. Аддитивно (пересоздание
-- RPC поверх живых версий; сигнатуры не меняются). Исправляет:
--  1) update_application_status затирал stage, выставленный set_application_stage;
--  2) отсутствие терминальных гардов: отклик withdrawn/hired можно было
--     «оживить» сменой статуса / отклонить уже нанятого;
--  3) причина отказа утекала кандидату через событие stage_change;
--  4) retention не чистил withdrawn-кандидатов;
--  5) ручные напоминания с offset > 30 дней не срабатывали (окно кандидатов
--     было ограничено 30 днями).

-- ── 1+2: update_application_status — state без затирания stage + гард ──
create or replace function public.update_application_status(
  p_application_id uuid, p_new_status text
) returns text language plpgsql security definer set search_path to 'public' as $$
declare v_owner uuid; v_old text; v_state text;
begin
  if auth.uid() is null then raise exception 'not authenticated'; end if;
  if p_new_status not in ('new','viewed','shortlisted','rejected','hired') then
    raise exception 'invalid status';
  end if;

  select ep.user_id, a.status, coalesce(a.state,'active')
    into v_owner, v_old, v_state
  from applications a
  join vacancies v on v.id = a.vacancy_id
  join employer_profiles ep on ep.id = v.employer_id
  where a.id = p_application_id;

  if v_owner is null or v_owner <> auth.uid() then raise exception 'not authorized'; end if;
  if v_state in ('withdrawn') then raise exception 'application withdrawn'; end if;
  if v_old = p_new_status then return v_old; end if;

  if not (
    (v_old = 'new'         and p_new_status in ('viewed','shortlisted','rejected')) or
    (v_old = 'viewed'      and p_new_status in ('shortlisted','rejected')) or
    (v_old = 'shortlisted' and p_new_status in ('rejected','hired'))
  ) then
    raise exception 'transition not allowed: % -> %', v_old, p_new_status;
  end if;

  -- Обновляем status и state; stage НЕ трогаем — им владеет set_application_stage.
  update applications set
    status = p_new_status,
    state = case p_new_status when 'rejected' then 'rejected' when 'hired' then 'hired' else 'active' end,
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

-- ── set_application_stage — гард терминальных состояний ─────────────
create or replace function set_application_stage(p_application_id uuid, p_stage text)
returns text language plpgsql volatile security definer set search_path = public as $$
declare v_owner uuid; v_old_stage text; v_stages jsonb; v_state text;
begin
  if auth.uid() is null then raise exception 'not authenticated'; end if;
  select ep.user_id, a.stage, coalesce(v.stages,'[]'::jsonb), coalesce(a.state,'active')
    into v_owner, v_old_stage, v_stages, v_state
  from applications a join vacancies v on v.id = a.vacancy_id
  join employer_profiles ep on ep.id = v.employer_id
  where a.id = p_application_id;
  if v_owner is null or v_owner <> auth.uid() then raise exception 'not authorized'; end if;
  if v_state in ('withdrawn','hired','rejected') then raise exception 'application is in a terminal state'; end if;
  if not (v_stages ? p_stage) then raise exception 'invalid stage'; end if;
  if v_old_stage is not distinct from p_stage then return p_stage; end if;

  update applications set stage = p_stage, updated_at = now() where id = p_application_id;
  insert into application_events(application_id, actor, actor_kind, type, payload)
  values (p_application_id, auth.uid(), 'user', 'stage_change',
          jsonb_build_object('old_stage', v_old_stage, 'new_stage', p_stage));
  return p_stage;
end; $$;
grant execute on function set_application_stage(uuid,text) to authenticated;

-- ── 2+3: reject_application — гард + причина НЕ в событие кандидата ──
create or replace function reject_application(p_application_id uuid, p_reason text)
returns void language plpgsql volatile security definer set search_path = public as $$
declare v_owner uuid; v_old text; v_state text;
begin
  if auth.uid() is null then raise exception 'not authenticated'; end if;
  if coalesce(trim(p_reason),'') = '' then raise exception 'reason required'; end if;
  select ep.user_id, a.status, coalesce(a.state,'active') into v_owner, v_old, v_state
  from applications a join vacancies v on v.id = a.vacancy_id
  join employer_profiles ep on ep.id = v.employer_id
  where a.id = p_application_id;
  if v_owner is null or v_owner <> auth.uid() then raise exception 'not authorized'; end if;
  if v_state in ('withdrawn','hired') then raise exception 'application is in a terminal state'; end if;

  update applications set
    status = 'rejected', state = 'rejected', rejected_reason = trim(p_reason), updated_at = now()
  where id = p_application_id;
  insert into application_status_log(application_id, old_status, new_status, changed_by)
  values (p_application_id, v_old, 'rejected', auth.uid());
  -- Причина хранится в applications.rejected_reason (видит работодатель), но
  -- НЕ кладётся в событие, читаемое кандидатом.
  insert into application_events(application_id, actor, actor_kind, type, payload)
  values (p_application_id, auth.uid(), 'user', 'stage_change',
          jsonb_build_object('old_status', v_old, 'new_status', 'rejected'));
end; $$;
grant execute on function reject_application(uuid,text) to authenticated;

-- ── 4: retention чистит и withdrawn ────────────────────────────────
create or replace function run_application_retention()
returns jsonb language plpgsql volatile security definer set search_path = public as $$
declare v_ids uuid[]; v_files jsonb;
begin
  select array_agg(a.id) into v_ids
  from applications a
  join vacancies v on v.id = a.vacancy_id
  join employer_profiles ep on ep.id = v.employer_id
  where a.state in ('rejected','withdrawn')
    and a.anonymized_at is null
    and a.updated_at < now() - make_interval(months => coalesce(ep.retention_months, 12));
  if v_ids is null then return jsonb_build_object('count', 0, 'files', '[]'::jsonb); end if;

  select coalesce(jsonb_agg(file_path), '[]'::jsonb) into v_files
  from application_documents where application_id = any(v_ids);

  delete from application_answers where application_id = any(v_ids);
  delete from application_documents where application_id = any(v_ids);
  update applications
    set full_name = '—', whatsapp = '', email = null, anonymized_at = now()
    where id = any(v_ids);

  return jsonb_build_object('count', array_length(v_ids, 1), 'files', v_files);
end; $$;
revoke all on function run_application_retention() from public, anon, authenticated;
grant execute on function run_application_retention() to service_role;

-- ── 5: ручные напоминания — окно кандидатов до 90 дней ─────────────
create or replace function due_manual_reminder_candidates()
returns table (
  reminder_id uuid, title text, due_on date, offsets jsonb, household_id uuid, email text
)
language sql security definer set search_path = public, auth as $$
  select r.id, coalesce(r.title, r.message, 'Напоминание'), r.due_at, r.offsets, r.household_id, u.email
  from reminders r
  join household_members hm on hm.household_id = r.household_id
  join auth.users u on u.id = hm.user_id
  where r.done = false
    and r.due_at >= current_date
    and r.due_at <= (current_date + 90)
    and u.email is not null;
$$;
revoke all on function due_manual_reminder_candidates() from public, anon, authenticated;
grant execute on function due_manual_reminder_candidates() to service_role;

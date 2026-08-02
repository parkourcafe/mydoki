-- =====================================================================
-- T2 — Reject with Undo. Additive on top of career MVP.
-- 1) revert_last_rejection: работодатель откатывает ПОСЛЕДНЕЕ отклонение в
--    течение 10 минут.
-- 2) get_application_status: маскирует от кандидата свежее (в окне отмены)
--    и отменённое отклонение — «Not selected» не мелькает во время окна.
-- Обе функции — CREATE OR REPLACE (идемпотентно).
-- =====================================================================

-- ---------------------- revert_last_rejection -------------------------
create or replace function revert_last_rejection(p_application_id uuid)
returns text
language plpgsql security definer set search_path = public
as $$
declare
  v_last application_status_log%rowtype;
  v_owner boolean;
begin
  select exists (
    select 1 from applications a
    join vacancies v on v.id = a.vacancy_id
    join employer_profiles ep on ep.id = v.employer_id
    where a.id = p_application_id and ep.user_id = auth.uid()
  ) into v_owner;
  if not v_owner then raise exception 'NOT_OWNER'; end if;

  select * into v_last from application_status_log
   where application_id = p_application_id
   order by created_at desc limit 1;

  if v_last.new_status is distinct from 'rejected' then raise exception 'NOT_REJECTED'; end if;
  if v_last.created_at < now() - interval '10 minutes' then raise exception 'UNDO_EXPIRED'; end if;

  update applications
     set status = coalesce(v_last.old_status, 'new'), updated_at = now()
   where id = p_application_id;

  insert into application_status_log (application_id, old_status, new_status, changed_by)
  values (p_application_id, 'rejected', coalesce(v_last.old_status, 'new'), auth.uid());

  return coalesce(v_last.old_status, 'new');
end $$;
grant execute on function revert_last_rejection(uuid) to authenticated;

-- ---------------------- get_application_status ------------------------
-- Отличие от v1: маскировка отклонения (эффективный статус + фильтр таймлайна).
create or replace function get_application_status(p_token text)
returns jsonb language plpgsql volatile security definer set search_path = public as $$
declare
  a applications;
  v vacancies;
  timeline jsonb;
  v_eff text;
  v_last application_status_log%rowtype;
begin
  select * into a from applications where access_token = p_token;
  if not found then return null; end if;
  select * into v from vacancies where id = a.vacancy_id;

  -- Эффективный статус: свежее отклонение (в окне отмены 10 мин) показываем
  -- как прежний статус, чтобы кандидат не видел мелькающий «отклонён».
  v_eff := a.status;
  if a.status = 'rejected' then
    select * into v_last from application_status_log
      where application_id = a.id order by created_at desc limit 1;
    if v_last.new_status = 'rejected' and v_last.created_at > now() - interval '10 minutes' then
      v_eff := coalesce(v_last.old_status, 'new');
    end if;
  end if;

  -- Таймлайн для кандидата: скрываем отклонения, которые в окне отмены или
  -- были отменены (есть более поздняя revert-запись old_status='rejected'),
  -- и сами revert-записи.
  select coalesce(jsonb_agg(jsonb_build_object(
           'old_status', l.old_status, 'new_status', l.new_status,
           'created_at', l.created_at) order by l.created_at), '[]'::jsonb)
    into timeline
  from application_status_log l
  where l.application_id = a.id
    and l.old_status is distinct from 'rejected'
    and not (
      l.new_status = 'rejected' and (
        l.created_at > now() - interval '10 minutes'
        or exists (
          select 1 from application_status_log r
          where r.application_id = a.id
            and r.old_status = 'rejected'
            and r.created_at > l.created_at
        )
      )
    );

  return jsonb_build_object(
    'status', v_eff,
    'full_name', a.full_name,
    'created_at', a.created_at,
    'vacancy', jsonb_build_object(
      'title', v.title, 'company_name', v.company_name,
      'location', v.location, 'slug', v.slug),
    'employer_contact', case when v_eff = 'shortlisted'
      then (select jsonb_build_object('whatsapp', ep.contact_whatsapp, 'email', ep.contact_email)
            from employer_profiles ep where ep.id = v.employer_id)
      else null end,
    'timeline', timeline
  );
end; $$;
grant execute on function get_application_status(text) to anon, authenticated;

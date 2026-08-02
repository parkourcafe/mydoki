-- =====================================================================
-- §2.3 «hired» — терминальный статус «Принят на работу».
-- Аддитивно: расширяет допустимый набор статусов и добавляет переход
-- shortlisted → hired. Общая БД с Doki.id — правка совместима с обоими.
-- time_to_hire выводится из application_status_log (отдельная колонка не
-- нужна: время перехода = created_at записи лога с new_status='hired').
-- =====================================================================

alter table applications drop constraint if exists applications_status_check;
alter table applications add constraint applications_status_check
  check (status in ('new','viewed','shortlisted','rejected','hired'));

-- Пересоздаём функцию поверх ЖИВОЙ версии (сверено с продом): добавлен
-- 'hired' в допустимые статусы и переход shortlisted → hired.
create or replace function public.update_application_status(
  p_application_id uuid, p_new_status text
) returns text language plpgsql security definer set search_path to 'public' as $$
declare
  v_owner uuid;
  v_old text;
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

  -- Разрешённые переходы: new→viewed/shortlisted/rejected,
  -- viewed→shortlisted/rejected, shortlisted→rejected/hired. Обратного нет.
  if not (
    (v_old = 'new'         and p_new_status in ('viewed','shortlisted','rejected')) or
    (v_old = 'viewed'      and p_new_status in ('shortlisted','rejected')) or
    (v_old = 'shortlisted' and p_new_status in ('rejected','hired'))
  ) then
    raise exception 'transition not allowed: % -> %', v_old, p_new_status;
  end if;

  update applications set status = p_new_status, updated_at = now()
  where id = p_application_id;

  insert into application_status_log(application_id, old_status, new_status, changed_by)
  values (p_application_id, v_old, p_new_status, auth.uid());

  return p_new_status;
end; $$;
grant execute on function update_application_status(uuid,text) to authenticated;

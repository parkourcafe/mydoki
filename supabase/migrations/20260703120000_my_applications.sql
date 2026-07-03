-- =====================================================================
-- Кабинет кандидата «Мои отклики»: залогиненный кандидат видит список
-- своих откликов (что Я отправил) со статусами. Аддитивно, ничего не ломает.
-- =====================================================================

-- Кандидат видит свои отклики (прямое чтение таблицы).
do $$ begin
  create policy "candidates see own applications" on applications for select
    using (user_id = (select auth.uid()));
exception when duplicate_object then null; end $$;

-- Список моих откликов + данные вакансии (SECURITY DEFINER — чтобы отдать
-- заголовок даже если вакансия уже не active). Возвращает только безопасные поля.
create or replace function get_my_applications()
returns jsonb language plpgsql stable security definer set search_path = public as $$
declare result jsonb;
begin
  if auth.uid() is null then return '[]'::jsonb; end if;
  select coalesce(jsonb_agg(jsonb_build_object(
    'id', a.id,
    'status', a.status,
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

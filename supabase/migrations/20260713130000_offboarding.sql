-- =====================================================================
-- P4-1 (фаза 4): Оффбординг — процесс завершения трудовых отношений. Это
-- ЗАВЕРШЕНИЕ жизненного цикла одной канонической записи Employment (v1.1
-- §7.4), не отдельная сущность. По завершении employment.status='ended',
-- фиксируется дата последнего рабочего дня; история сохраняется (архив — P4-3).
--
-- Аддитивно и совместимо с Doki.id: новая колонка + таблица + RPC; общих
-- таблиц не трогаем.
--
-- План отката (rollback):
--   drop function if exists complete_offboarding(uuid);
--   drop function if exists start_offboarding(uuid,date,text[]);
--   drop table if exists offboarding_tasks;
--   alter table employments drop column if exists last_working_day;

-- ── Дата последнего рабочего дня ────────────────────────────────────
alter table employments add column if not exists last_working_day date;

-- ── Чек-лист выхода (по образцу onboarding_tasks) ───────────────────
create table if not exists offboarding_tasks (
  id            uuid primary key default gen_random_uuid(),
  employment_id uuid not null references employments(id) on delete cascade,
  title         text not null,
  status        text not null default 'pending'
                  check (status in ('pending','done','skipped')),
  note          text,
  sort          integer not null default 0,
  created_by    uuid references auth.users(id),
  created_at    timestamptz not null default now(),
  done_at       timestamptz,
  updated_at    timestamptz not null default now()
);
create index if not exists offboarding_tasks_employment_idx
  on offboarding_tasks(employment_id, sort);

alter table offboarding_tasks enable row level security;

-- Чтение: через видимость employment (сотрудник + компания).
do $$ begin
  create policy "offboarding read via employment" on offboarding_tasks for select
    using (employment_id in (select id from employments));
exception when duplicate_object then null; end $$;

-- Запись: только компания (сотрудник read-only).
do $$ begin
  create policy "offboarding company manage" on offboarding_tasks for all
    using (employment_id in (
      select id from employments
      where company_id is not null and private.can_access_employer(company_id)
    ))
    with check (employment_id in (
      select id from employments
      where company_id is not null and private.can_access_employer(company_id)
    ));
exception when duplicate_object then null; end $$;

grant select, insert, update, delete on offboarding_tasks to authenticated;

-- ── RPC: старт оффбординга (сид чек-листа + дата последнего дня) ─────
create or replace function public.start_offboarding(
  p_employment_id uuid,
  p_last_working_day date default null,
  p_task_titles text[] default null
) returns integer
language plpgsql volatile security definer set search_path = public as $$
declare v_company uuid; v_status text; v_count int; v_title text; v_sort int := 0;
        v_default text[] := array[
          'Вернуть имущество компании',
          'Отключить доступы и учётные записи',
          'Выдать финальные документы',
          'Провести exit-интервью'];
begin
  if auth.uid() is null then raise exception 'not authenticated'; end if;

  select company_id, status into v_company, v_status from employments where id = p_employment_id;
  if v_company is null then raise exception 'employment not found or manual'; end if;
  if not private.can_access_employer(v_company) then raise exception 'not authorized'; end if;
  if v_status = 'ended' then raise exception 'employment already ended'; end if;

  if p_last_working_day is not null then
    update employments set last_working_day = p_last_working_day, updated_at = now()
    where id = p_employment_id;
  end if;

  select count(*) into v_count from offboarding_tasks where employment_id = p_employment_id;
  if v_count > 0 then return 0; end if;   -- уже начат — идемпотентно

  foreach v_title in array coalesce(p_task_titles, v_default) loop
    v_sort := v_sort + 1;
    insert into offboarding_tasks(employment_id, title, sort, created_by)
    values (p_employment_id, v_title, v_sort, auth.uid());
  end loop;

  return v_sort;
end; $$;
grant execute on function public.start_offboarding(uuid,date,text[]) to authenticated;

-- ── RPC: завершить оффбординг → employment ended ────────────────────
create or replace function public.complete_offboarding(p_employment_id uuid)
returns text language plpgsql volatile security definer set search_path = public as $$
declare v_company uuid; v_status text; v_lwd date;
begin
  if auth.uid() is null then raise exception 'not authenticated'; end if;
  select company_id, status, last_working_day into v_company, v_status, v_lwd
  from employments where id = p_employment_id;
  if v_company is null then raise exception 'employment not found or manual'; end if;
  if not private.can_access_employer(v_company) then raise exception 'not authorized'; end if;
  if v_status = 'ended' then return 'ended'; end if;

  update employments set
    status = 'ended',
    end_date = coalesce(v_lwd, current_date),
    updated_at = now()
  where id = p_employment_id;
  return 'ended';
end; $$;
grant execute on function public.complete_offboarding(uuid) to authenticated;

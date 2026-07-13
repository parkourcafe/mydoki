-- =====================================================================
-- P2-3 (фаза 2): Онбординг сотрудника. Чек-лист задач оформления + контрольные
-- точки испытательного периода (7/30/60/90 дней от даты выхода). Привязан к
-- канонической записи employment (P2-1). Обе проекции: работодатель ведёт
-- чек-лист, человек видит прогресс (read-only).
--
-- Аддитивно и совместимо с Doki.id: новая таблица (только doki.help) + RPC;
-- общих таблиц не трогаем.
--
-- План отката (rollback):
--   drop function if exists start_onboarding(uuid);
--   drop table if exists onboarding_tasks;

-- ── Таблица onboarding_tasks ────────────────────────────────────────
-- Один тип строки для двух сущностей: задачи чек-листа (day_offset = null) и
-- контрольные точки испытательного срока (day_offset ∈ {7,30,60,90}). Срок
-- точки вычисляется как employment.start_date + day_offset (в приложении).
create table if not exists onboarding_tasks (
  id             uuid primary key default gen_random_uuid(),
  employment_id  uuid not null references employments(id) on delete cascade,
  title          text not null,
  kind           text not null default 'task' check (kind in ('task','checkpoint')),
  day_offset     integer,            -- null для задач; 7/30/60/90 для точек
  status         text not null default 'pending'
                   check (status in ('pending','done','skipped')),
  note           text,
  sort           integer not null default 0,
  created_by     uuid references auth.users(id),
  created_at     timestamptz not null default now(),
  done_at        timestamptz,
  updated_at     timestamptz not null default now()
);
create index if not exists onboarding_tasks_employment_idx
  on onboarding_tasks(employment_id, sort);

alter table onboarding_tasks enable row level security;

-- ── RLS ─────────────────────────────────────────────────────────────
-- Чтение: любой, кто видит employment (сотрудник — свою; компания — свои).
-- Подзапрос к employments уже отфильтрован его RLS, поэтому явной проверки
-- ролей здесь не нужно.
do $$ begin
  create policy "onboarding read via employment" on onboarding_tasks for select
    using (employment_id in (select id from employments));
exception when duplicate_object then null; end $$;

-- Запись — только компания (владелец/рекрутёр), для employment своей
-- компании. Человек-сотрудник онбординг не редактирует (видит прогресс).
do $$ begin
  create policy "onboarding company manage" on onboarding_tasks for all
    using (employment_id in (
      select id from employments
      where company_id is not null and private.can_access_employer(company_id)
    ))
    with check (employment_id in (
      select id from employments
      where company_id is not null and private.can_access_employer(company_id)
    ));
exception when duplicate_object then null; end $$;

grant select, insert, update, delete on onboarding_tasks to authenticated;

-- ── RPC: старт онбординга (сид чек-листа + контрольных точек) ────────
-- Идемпотентно: если для employment уже есть задачи — ничего не делает.
-- Гейт: вызывающий имеет доступ к компании employment. Тексты задач
-- передаёт приложение (локализованные шаблоны из lib/onboarding).
create or replace function public.start_onboarding(
  p_employment_id uuid,
  p_task_titles text[] default null
) returns integer
language plpgsql volatile security definer set search_path = public as $$
declare v_company uuid; v_count int; v_title text; v_sort int := 0; v_off int;
        v_default text[] := array[
          'Собрать документы для оформления',
          'Подписать трудовой договор',
          'Выдать доступы и оборудование',
          'Провести вводный инструктаж'];
begin
  if auth.uid() is null then raise exception 'not authenticated'; end if;

  select company_id into v_company from employments where id = p_employment_id;
  if v_company is null then raise exception 'employment not found or manual'; end if;
  if not private.can_access_employer(v_company) then raise exception 'not authorized'; end if;

  select count(*) into v_count from onboarding_tasks where employment_id = p_employment_id;
  if v_count > 0 then return 0; end if;   -- уже начат — идемпотентно

  -- Задачи чек-листа (из переданных шаблонов или дефолтных).
  foreach v_title in array coalesce(p_task_titles, v_default) loop
    v_sort := v_sort + 1;
    insert into onboarding_tasks(employment_id, title, kind, sort, created_by)
    values (p_employment_id, v_title, 'task', v_sort, auth.uid());
  end loop;

  -- Контрольные точки испытательного периода.
  foreach v_off in array array[7,30,60,90] loop
    v_sort := v_sort + 1;
    insert into onboarding_tasks(employment_id, title, kind, day_offset, sort, created_by)
    values (p_employment_id, format('Контрольная точка: %s дней', v_off),
            'checkpoint', v_off, v_sort, auth.uid());
  end loop;

  return v_sort;
end; $$;
grant execute on function public.start_onboarding(uuid, text[]) to authenticated;

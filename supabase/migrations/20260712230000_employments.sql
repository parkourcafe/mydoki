-- =====================================================================
-- P2-1 (фаза 2): Employment core — ОДНА каноническая запись о трудовых
-- отношениях с ДВУМЯ интерфейсными проекциями (v1.1 §7.4):
--   1) карточка сотрудника у работодателя — /employer/employees/[id];
--   2) «Мои трудовые отношения» у человека — /my/employment.
-- Это НЕ две копии данных (v1.1 §15 запрещает дублирующие сущности).
--
-- Аддитивно и совместимо с Doki.id: новая таблица (только doki.help) + RPC;
-- общих таблиц (applications/vacancies/employer_profiles) не трогаем.
--
-- План отката (rollback):
--   drop function if exists create_employment_from_application(uuid,text,text,date);
--   drop table if exists employments;

-- ── Таблица employments ─────────────────────────────────────────────
-- company_id NULLABLE — ручной режим (работодателя нет в Doki); company_name
-- денормализуем всегда (и для ручных, и как снимок названия компании).
create table if not exists employments (
  id               uuid primary key default gen_random_uuid(),
  company_id       uuid references employer_profiles(id) on delete set null,
  company_name     text not null,
  employee_user_id uuid not null references auth.users(id) on delete cascade,
  application_id   uuid references applications(id) on delete set null,
  position         text not null,
  employment_type  text not null default 'full_time'
                     check (employment_type in ('full_time','part_time','contract','intern','other')),
  start_date       date,
  end_date         date,
  status           text not null default 'active' check (status in ('active','ended')),
  manual           boolean not null default true,   -- добавлено человеком vs из hired
  created_by       uuid references auth.users(id),
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);
create index if not exists employments_employee_idx on employments(employee_user_id);
create index if not exists employments_company_idx  on employments(company_id);
-- Идемпотентность оформления из отклика: ≤1 запись на application_id.
create unique index if not exists employments_application_uidx
  on employments(application_id) where application_id is not null;

alter table employments enable row level security;

-- ── RLS ─────────────────────────────────────────────────────────────
-- Чтение: сотрудник видит свою запись; владелец/рекрутёр компании — записи
-- своей компании (private.can_access_employer, из PR-13).
do $$ begin
  create policy "employments read self or company" on employments for select
    using (
      employee_user_id = (select auth.uid())
      or (company_id is not null and private.can_access_employer(company_id))
    );
exception when duplicate_object then null; end $$;

-- Человек управляет только своими РУЧНЫМИ записями (без привязки к компании
-- Doki): нельзя приписать себя к чужому company_id или подделать «от
-- работодателя» (manual=false).
do $$ begin
  create policy "employments person insert manual" on employments for insert
    with check (
      employee_user_id = (select auth.uid()) and manual = true and company_id is null
    );
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "employments person update manual" on employments for update
    using (
      employee_user_id = (select auth.uid()) and manual = true and company_id is null
    )
    with check (
      employee_user_id = (select auth.uid()) and manual = true and company_id is null
    );
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "employments person delete manual" on employments for delete
    using (
      employee_user_id = (select auth.uid()) and manual = true and company_id is null
    );
exception when duplicate_object then null; end $$;

-- Работодатель правит записи своей компании (должность/тип/даты/статус).
-- Создание из hired идёт через SECURITY DEFINER RPC (bypass RLS), поэтому
-- отдельной insert-политики для работодателя нет. WITH CHECK не даёт
-- «увести» запись в чужую компанию.
do $$ begin
  create policy "employments company update" on employments for update
    using (company_id is not null and private.can_access_employer(company_id))
    with check (company_id is not null and private.can_access_employer(company_id));
exception when duplicate_object then null; end $$;

grant select, insert, update, delete on employments to authenticated;

-- ── RPC: оформление сотрудника из hired-отклика ─────────────────────
-- Проверяет, что вызывающий владеет вакансией (can_access_employer) и отклик
-- нанят (status/state = 'hired'); создаёт employment (company_id = employer,
-- employee_user_id = application.user_id, manual=false). Идемпотентно: если
-- по этому application_id запись уже есть — возвращает её id.
create or replace function public.create_employment_from_application(
  p_application_id uuid,
  p_position text,
  p_type text default 'full_time',
  p_start_date date default null
) returns uuid
language plpgsql volatile security definer set search_path = public as $$
declare
  v_owner uuid; v_company uuid; v_company_name text;
  v_employee uuid; v_status text; v_state text;
  v_existing uuid; v_id uuid;
begin
  if auth.uid() is null then raise exception 'not authenticated'; end if;
  if coalesce(trim(p_position),'') = '' then raise exception 'position required'; end if;
  if p_type not in ('full_time','part_time','contract','intern','other') then
    raise exception 'invalid employment_type';
  end if;

  select ep.user_id, ep.id, ep.company_name, a.user_id, a.status, coalesce(a.state,'active')
    into v_owner, v_company, v_company_name, v_employee, v_status, v_state
  from applications a
  join vacancies v on v.id = a.vacancy_id
  join employer_profiles ep on ep.id = v.employer_id
  where a.id = p_application_id;

  if v_owner is null then raise exception 'application not found'; end if;
  if not private.can_access_employer(v_company) then raise exception 'not authorized'; end if;
  if v_status <> 'hired' and v_state <> 'hired' then raise exception 'application not hired'; end if;
  -- Кандидат без аккаунта Doki не может стать сотрудником с проекцией
  -- «Мои трудовые отношения» (нужен user). Более полный флоу (приглашение
  -- создать аккаунт) — за рамками P2-1.
  if v_employee is null then raise exception 'candidate has no account'; end if;

  select id into v_existing from employments where application_id = p_application_id;
  if v_existing is not null then return v_existing; end if;

  insert into employments(
    company_id, company_name, employee_user_id, application_id,
    position, employment_type, start_date, status, manual, created_by
  ) values (
    v_company, v_company_name, v_employee, p_application_id,
    trim(p_position), p_type, p_start_date, 'active', false, auth.uid()
  ) returning id into v_id;

  return v_id;
end; $$;
grant execute on function public.create_employment_from_application(uuid,text,text,date)
  to authenticated;

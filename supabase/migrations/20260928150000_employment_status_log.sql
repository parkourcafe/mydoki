-- =====================================================================
-- Employments: журнал смены статуса и неизменяемые поля записи.
-- (вопрос владельца 54, docs/ops/autonomy/tasks/T-DOKI-04.md)
--
-- Что было. Политика "employments company update" (20260712230000) пускает
-- владельца/рекрутёра компании к ЛЮБОЙ колонке записи своей компании, а
-- WITH CHECK проверяет только company_id. Поэтому работодатель мог прямым
-- update через PostgREST:
--   • перевести status в 'ended' и поставить end_date (так и делает
--     updateEmployment в app/employer/actions.ts) — без следа, кто и когда;
--     complete_offboarding делает то же через RPC, тоже без журнала;
--   • переписать employee_user_id / application_id / manual / created_by /
--     company_name — то есть «переназначить» запись другому человеку или
--     сменить название компании в его трудовой истории.
-- Сотрудник видел только итог (status в «Мои трудовые отношения»), а
-- публичная ссылка-подтверждение (get_employment_verification) сразу
-- показывала третьим лицам «Employment ended».
--
-- Что НЕ происходит при status='ended' (проверено тестом
-- tests/rls/employment_status_log.sql): аккаунт кандидата, его отклик и
-- application_documents, сама запись employments и её документы не
-- удаляются. Каскады на employments срабатывают только при DELETE строки,
-- а удалять записи «от работодателя» не может никто из клиентских ролей.
--
-- Выбор: журнал + уведомление, а не подтверждение кандидатом. По коду
-- завершение — процесс работодателя (offboarding, §7.4: «экран человека
-- read-only»), а изменения условий с согласием сотрудника уже есть отдельно
-- (employment_amendments, respond_to_amendment). Требовать согласия на
-- «ended» значило бы, что ушедший сотрудник может бессрочно оставаться
-- «active» у компании; это продуктовое решение владельца, а не патч.
--
-- 1. employment_status_log — по образцу application_status_log: кто
--    (changed_by, actor_role), когда, что было и что стало (status,
--    end_date). Пишется триггером (SECURITY DEFINER) на любую смену
--    status/end_date у записей с company_id — и при прямом update, и через
--    RPC. Читают сотрудник и компания через видимость employments; прямой
--    записи у клиентов нет.
-- 2. Триггер employments_guard_identity: клиентские роли не меняют
--    employee_user_id, application_id, manual, company_id, created_by,
--    created_at; у записей с company_id — и company_name (снимок названия
--    в истории человека). Ручные записи (company_id null) человек правит
--    как раньше, включая company_name. Ошибка — EMPLOYMENT_PROTECTED_FIELDS
--    (42501), как EMPLOYER_PROTECTED_FIELDS в 20260928120000.
--
-- Не меняется здесь (решение владельца): после 'ended' путь «действующее
-- трудоустройство» в discovery_denied_reason (20260928130000) перестаёт
-- скрывать кандидата от этой организации сразу; скрытие по названию/домену
-- из списка кандидата продолжает действовать.
--
-- Совместимость с Doki.id: employments — таблица только doki.help
-- (20260712230000); Doki.id к ней не обращается.
--
-- Откат:
--   drop trigger if exists employments_guard_identity on public.employments;
--   drop trigger if exists employments_status_log on public.employments;
--   drop function if exists private.employments_guard_identity();
--   drop function if exists private.employments_status_log();
--   drop table if exists public.employment_status_log;
-- =====================================================================

-- ── Журнал ──────────────────────────────────────────────────────────
create table if not exists public.employment_status_log (
  id            uuid primary key default gen_random_uuid(),
  employment_id uuid not null references public.employments(id) on delete cascade,
  old_status    text,
  new_status    text not null,
  old_end_date  date,
  new_end_date  date,
  changed_by    uuid references auth.users(id) on delete set null,
  -- company — владелец/рекрутёр компании (в т. ч. через RPC оффбординга);
  -- employee — сам человек; system — без сессии (service role, миграции).
  actor_role    text not null check (actor_role in ('company','employee','system')),
  created_at    timestamptz not null default now()
);
create index if not exists employment_status_log_employment_idx
  on public.employment_status_log(employment_id, created_at);
create index if not exists employment_status_log_changed_by_idx
  on public.employment_status_log(changed_by);

alter table public.employment_status_log enable row level security;

-- Чтение — через видимость employments (сотрудник + компания), как у
-- employment_amendments. Записи у клиентов нет: ни политик, ни грантов.
do $$ begin
  create policy "employment status log read via employment"
    on public.employment_status_log for select
    using (employment_id in (select id from public.employments));
exception when duplicate_object then null; end $$;

grant select on public.employment_status_log to authenticated;

-- ── Триггер журнала ─────────────────────────────────────────────────
-- SECURITY DEFINER: вставка в журнал идёт от владельца схемы, поэтому
-- клиенту не нужен insert-грант (и он его не получает).
create or replace function private.employments_status_log()
returns trigger language plpgsql security definer set search_path = public as $$
declare v_actor uuid; v_role text;
begin
  if new.company_id is null then return new; end if;
  if new.status is not distinct from old.status
     and new.end_date is not distinct from old.end_date then
    return new;
  end if;

  v_actor := auth.uid();
  v_role := case
    when v_actor is null then 'system'
    when v_actor = new.employee_user_id then 'employee'
    else 'company'
  end;

  insert into employment_status_log(
    employment_id, old_status, new_status, old_end_date, new_end_date,
    changed_by, actor_role
  ) values (
    new.id, old.status, new.status, old.end_date, new.end_date,
    v_actor, v_role
  );
  return new;
end; $$;

drop trigger if exists employments_status_log on public.employments;
create trigger employments_status_log
  after update on public.employments
  for each row execute function private.employments_status_log();

-- ── Неизменяемые поля записи для клиентских ролей ───────────────────
create or replace function private.employments_guard_identity()
returns trigger language plpgsql set search_path = public as $$
begin
  if current_user not in ('authenticated', 'anon') then
    return new;
  end if;

  if new.employee_user_id is distinct from old.employee_user_id
     or new.application_id is distinct from old.application_id
     or new.manual         is distinct from old.manual
     or new.company_id     is distinct from old.company_id
     or new.created_by     is distinct from old.created_by
     or new.created_at     is distinct from old.created_at
     or (old.company_id is not null
         and new.company_name is distinct from old.company_name)
  then
    raise exception 'EMPLOYMENT_PROTECTED_FIELDS' using errcode = '42501';
  end if;
  return new;
end; $$;

drop trigger if exists employments_guard_identity on public.employments;
create trigger employments_guard_identity
  before update on public.employments
  for each row execute function private.employments_guard_identity();

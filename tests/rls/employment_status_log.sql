-- Отметка об увольнении работодателем
-- (миграция 20260928150000_employment_status_log):
--   1. работодатель по-прежнему может перевести запись своей компании в
--      'ended' (как updateEmployment) — но в журнале employment_status_log
--      появляется строка: кто, когда, что было и что стало;
--   2. журнал читают сотрудник и компания; посторонняя организация — нет;
--      клиент не пишет в журнал напрямую;
--   3. отметка ничего не удаляет: аккаунт кандидата, отклик и его
--      application_documents, сама запись — на месте;
--   4. работодатель не может переписать, чья это запись (employee_user_id,
--      application_id, manual, company_id, created_by) и название компании
--      в истории человека — EMPLOYMENT_PROTECTED_FIELDS;
--   5. путь через RPC complete_offboarding тоже попадает в журнал;
--   6. ручные записи человека (company_id null) журнал не ведёт, и человек
--      правит их как раньше, включая company_name.
-- Всё в одной транзакции с откатом; нарушение → исключение.

begin;

insert into auth.users(id, email) values
  ('e5e5e5e5-c0c0-4000-8000-000000000001', 'karyawan@status.test'),
  ('e5e5e5e5-e0e0-4000-8000-000000000001', 'hr@majikan.test'),
  ('e5e5e5e5-e0e0-4000-8000-000000000002', 'hr@asing.test')
on conflict (id) do nothing;

-- ── Фикстура (владелец схемы): работодатели, вакансия, отклик, запись ─
insert into employer_profiles(id, user_id, company_name, contact_email, verified_at) values
  ('e5e5e5e5-0000-4000-8000-0000000000a1', 'e5e5e5e5-e0e0-4000-8000-000000000001',
   'PT Majikan', 'hr@majikan.test', now()),
  ('e5e5e5e5-0000-4000-8000-0000000000a2', 'e5e5e5e5-e0e0-4000-8000-000000000002',
   'PT Asing', 'hr@asing.test', now());

insert into vacancies(id, employer_id, title, slug, company_name)
values ('e5e5e5e5-0000-4000-8000-0000000000b1', 'e5e5e5e5-0000-4000-8000-0000000000a1',
        'Kasir', 'kasir-pt-majikan-status-test', 'PT Majikan');

insert into applications(id, vacancy_id, user_id, full_name, whatsapp, consent_text, status)
values ('e5e5e5e5-0000-4000-8000-0000000000c1', 'e5e5e5e5-0000-4000-8000-0000000000b1',
        'e5e5e5e5-c0c0-4000-8000-000000000001', 'Karyawan Sintetis', '+6281200000009',
        'Согласие', 'shortlisted');

insert into application_documents(application_id, document_type, document_label, file_path, file_name)
values ('e5e5e5e5-0000-4000-8000-0000000000c1', 'ktp', 'KTP', 'v/s/ktp.jpg', 'ktp.jpg');

-- Запись «от работодателя» — как её создаёт create_employment_from_application.
insert into employments(id, company_id, company_name, employee_user_id, application_id,
                        position, status, manual, created_by)
values ('e5e5e5e5-0000-4000-8000-0000000000d1', 'e5e5e5e5-0000-4000-8000-0000000000a1',
        'PT Majikan', 'e5e5e5e5-c0c0-4000-8000-000000000001',
        'e5e5e5e5-0000-4000-8000-0000000000c1', 'Kasir', 'active', false,
        'e5e5e5e5-e0e0-4000-8000-000000000001');

-- ── 1. Работодатель отмечает увольнение (как updateEmployment) ──────
select set_config('request.jwt.claims',
  '{"sub":"e5e5e5e5-e0e0-4000-8000-000000000001"}', true);
set local role authenticated;

update employments
   set status = 'ended', end_date = date '2026-09-30', updated_at = now()
 where id = 'e5e5e5e5-0000-4000-8000-0000000000d1' and manual = false;

do $$
declare r employment_status_log;
begin
  if (select status from employments where id = 'e5e5e5e5-0000-4000-8000-0000000000d1')
     <> 'ended' then
    raise exception 'FAIL: работодатель не смог отметить увольнение — проверки ниже ничего не доказывают';
  end if;
  select * into r from employment_status_log
   where employment_id = 'e5e5e5e5-0000-4000-8000-0000000000d1';
  if r.id is null then
    raise exception 'FAIL: увольнение не записано в журнал';
  end if;
  if r.old_status <> 'active' or r.new_status <> 'ended'
     or r.new_end_date <> date '2026-09-30'
     or r.changed_by <> 'e5e5e5e5-e0e0-4000-8000-000000000001'
     or r.actor_role <> 'company' then
    raise exception 'FAIL: в журнале не то: % → %, end %, by %, role %',
      r.old_status, r.new_status, r.new_end_date, r.changed_by, r.actor_role;
  end if;
end $$;

-- ── 2a. Клиент не пишет в журнал ───────────────────────────────────
do $$ begin
  begin
    insert into employment_status_log(employment_id, new_status, actor_role)
    values ('e5e5e5e5-0000-4000-8000-0000000000d1', 'active', 'employee');
  exception when others then null;  -- отказ в правах или в политике — оба отказ
  end;
  begin
    delete from employment_status_log
     where employment_id = 'e5e5e5e5-0000-4000-8000-0000000000d1';
  exception when others then null;
  end;
  if (select count(*) from employment_status_log
       where employment_id = 'e5e5e5e5-0000-4000-8000-0000000000d1') <> 1 then
    raise exception 'FAIL: клиент изменил журнал напрямую';
  end if;
end $$;

-- ── 4. Чья это запись — работодатель не переписывает ───────────────
do $$
declare stmt text;
begin
  foreach stmt in array array[
    $q$update employments set employee_user_id = 'e5e5e5e5-e0e0-4000-8000-000000000002'$q$,
    $q$update employments set application_id = null$q$,
    $q$update employments set manual = true$q$,
    $q$update employments set created_by = 'e5e5e5e5-e0e0-4000-8000-000000000002'$q$,
    $q$update employments set company_name = 'PT Lain Sama Sekali'$q$
  ] loop
    begin
      execute stmt || $q$ where id = 'e5e5e5e5-0000-4000-8000-0000000000d1'$q$;
    exception when others then
      if sqlerrm <> 'EMPLOYMENT_PROTECTED_FIELDS' then raise; end if;
      continue;
    end;
    raise exception 'FAIL: работодатель выполнил «%»', stmt;
  end loop;
end $$;

-- ── 2b. Посторонняя организация журнал не видит ─────────────────────
select set_config('request.jwt.claims',
  '{"sub":"e5e5e5e5-e0e0-4000-8000-000000000002"}', true);
do $$ begin
  if (select count(*) from employment_status_log) <> 0 then
    raise exception 'FAIL: чужая организация читает журнал статуса';
  end if;
end $$;

-- ── 2c. Сотрудник видит запись журнала ──────────────────────────────
select set_config('request.jwt.claims',
  '{"sub":"e5e5e5e5-c0c0-4000-8000-000000000001"}', true);
do $$ begin
  if (select count(*) from employment_status_log
       where employment_id = 'e5e5e5e5-0000-4000-8000-0000000000d1'
         and new_status = 'ended' and actor_role = 'company') <> 1 then
    raise exception 'FAIL: сотрудник не видит, что работодатель отметил увольнение';
  end if;
end $$;

-- ── 3. Ничего не удалено ────────────────────────────────────────────
reset role;
do $$ begin
  if not exists (select 1 from auth.users where id = 'e5e5e5e5-c0c0-4000-8000-000000000001') then
    raise exception 'FAIL: аккаунт кандидата исчез';
  end if;
  if not exists (select 1 from applications where id = 'e5e5e5e5-0000-4000-8000-0000000000c1'
                    and user_id = 'e5e5e5e5-c0c0-4000-8000-000000000001') then
    raise exception 'FAIL: отклик кандидата исчез или отвязан';
  end if;
  if (select count(*) from application_documents
       where application_id = 'e5e5e5e5-0000-4000-8000-0000000000c1') <> 1 then
    raise exception 'FAIL: документы отклика исчезли';
  end if;
  if not exists (select 1 from employments where id = 'e5e5e5e5-0000-4000-8000-0000000000d1'
                    and status = 'ended'
                    and employee_user_id = 'e5e5e5e5-c0c0-4000-8000-000000000001') then
    raise exception 'FAIL: запись employments исчезла или переназначена';
  end if;
end $$;

-- ── 5. Путь через оффбординг тоже в журнале ─────────────────────────
-- Возврат в active — владельцем схемы без сессии: строка 'system'.
select set_config('request.jwt.claims', '{}', true);
update employments set status = 'active', end_date = null
 where id = 'e5e5e5e5-0000-4000-8000-0000000000d1';

select set_config('request.jwt.claims',
  '{"sub":"e5e5e5e5-e0e0-4000-8000-000000000001"}', true);
set local role authenticated;
do $$ begin
  perform start_offboarding('e5e5e5e5-0000-4000-8000-0000000000d1', date '2026-10-15', null);
  if complete_offboarding('e5e5e5e5-0000-4000-8000-0000000000d1') <> 'ended' then
    raise exception 'FAIL: complete_offboarding не завершил запись';
  end if;
  if (select count(*) from employment_status_log
       where employment_id = 'e5e5e5e5-0000-4000-8000-0000000000d1'
         and new_status = 'ended' and new_end_date = date '2026-10-15'
         and actor_role = 'company'
         and changed_by = 'e5e5e5e5-e0e0-4000-8000-000000000001') <> 1 then
    raise exception 'FAIL: завершение через complete_offboarding не попало в журнал';
  end if;
  if (select count(*) from employment_status_log
       where employment_id = 'e5e5e5e5-0000-4000-8000-0000000000d1') <> 3 then
    raise exception 'FAIL: в журнале % строк вместо 3 (ended, system active, ended)',
      (select count(*) from employment_status_log
        where employment_id = 'e5e5e5e5-0000-4000-8000-0000000000d1');
  end if;
end $$;

-- ── 6. Ручные записи человека — без журнала, правятся как раньше ────
select set_config('request.jwt.claims',
  '{"sub":"e5e5e5e5-c0c0-4000-8000-000000000001"}', true);
insert into employments(id, company_name, position, employment_type, status, manual,
                        employee_user_id, created_by)
values ('e5e5e5e5-0000-4000-8000-0000000000d2', 'Warung Lama', 'Kasir', 'part_time',
        'active', true, 'e5e5e5e5-c0c0-4000-8000-000000000001',
        'e5e5e5e5-c0c0-4000-8000-000000000001');
update employments
   set company_name = 'Warung Lama Sekali', end_date = date '2026-01-31', status = 'ended',
       updated_at = now()
 where id = 'e5e5e5e5-0000-4000-8000-0000000000d2' and manual = true;
do $$ begin
  if (select company_name from employments where id = 'e5e5e5e5-0000-4000-8000-0000000000d2')
     <> 'Warung Lama Sekali' then
    raise exception 'FAIL: человек не смог поправить свою ручную запись';
  end if;
  if exists (select 1 from employment_status_log
              where employment_id = 'e5e5e5e5-0000-4000-8000-0000000000d2') then
    raise exception 'FAIL: журнал ведётся для ручной записи без работодателя';
  end if;
  -- Приписать себя к компании через ручную запись по-прежнему нельзя.
  begin
    update employments set company_id = 'e5e5e5e5-0000-4000-8000-0000000000a1'
     where id = 'e5e5e5e5-0000-4000-8000-0000000000d2';
    raise exception 'FAIL: человек привязал ручную запись к компании';
  exception when others then
    if sqlerrm like 'FAIL:%' then raise; end if;
  end;
end $$;

rollback;

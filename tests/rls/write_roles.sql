-- RLS-тест: право ЗАПИСИ по ролям. Запуск в Supabase SQL Editor или psql.
-- Всё в одной транзакции с ROLLBACK — данных после себя не оставляет.
--
-- Зачем: миграция 20260824140000_dedupe_rls_policies разбила политики
-- `FOR ALL` на отдельные `FOR INSERT/UPDATE/DELETE` на 18 таблицах. Разбор
-- сохраняет предикат дословно, но ошибка в нём проявилась бы не как «видно
-- лишнее», а как «пишет тот, кому нельзя» — а этого не проверял ни один
-- существующий тест: isolation.sql смотрит только на SELECT, invitations.sql
-- проверяет, что editor писать МОЖЕТ, но не что viewer НЕ может.
--
-- Проверяется три границы:
--   1. viewer читает, но не пишет (private.is_household_editor)
--   2. editor пишет в данные, но не управляет составом семьи
--      (private.is_household_owner)
--   3. employment-кластер: сотрудник видит свою запись, посторонний — ничего
--
-- Ожидаемый результат: все строки true/0, иначе транзакция падает с ошибкой.
begin;

insert into auth.users(id, email) values
  ('a0000000-0000-0000-0000-00000000000a', 'owner@example.com'),
  ('b0000000-0000-0000-0000-00000000000b', 'viewer@example.com'),
  ('c0000000-0000-0000-0000-00000000000c', 'editor@example.com'),
  ('d0000000-0000-0000-0000-00000000000d', 'employee@example.com'),
  ('e0000000-0000-0000-0000-00000000000e', 'outsider@example.com');

-- ── A (owner) создаёт семью и раздаёт роли ─────────────────────────
select set_config('request.jwt.claims',
  '{"sub":"a0000000-0000-0000-0000-00000000000a"}', true);
set local role authenticated;

select set_config('test.hid', create_household('Write roles test')::text, true);

insert into household_members(household_id, user_id, role) values
  (current_setting('test.hid')::uuid, 'b0000000-0000-0000-0000-00000000000b', 'viewer'),
  (current_setting('test.hid')::uuid, 'c0000000-0000-0000-0000-00000000000c', 'editor');

with m as (
  insert into members(household_id, full_name, relation)
  values (current_setting('test.hid')::uuid, 'Существующий', 'self')
  returning id
) select set_config('test.mid', (select id from m)::text, true);

-- ── 1. viewer: читать можно, писать нельзя ─────────────────────────
select set_config('request.jwt.claims',
  '{"sub":"b0000000-0000-0000-0000-00000000000b"}', true);

do $$
declare
  n int;
begin
  -- Чтение разрешено (is_household_member).
  select count(*) into n from members
    where household_id = current_setting('test.hid')::uuid;
  perform set_config('test.viewer_reads', n::text, true);

  -- INSERT под RLS не «ничего не делает», а падает с 42501 — ловим.
  begin
    insert into members(household_id, full_name, relation)
      values (current_setting('test.hid')::uuid, 'Протащено viewer-ом', 'other');
    perform set_config('test.viewer_insert_blocked', 'false', true);
  exception when insufficient_privilege then
    perform set_config('test.viewer_insert_blocked', 'true', true);
  end;

  -- UPDATE/DELETE отсекаются через USING — молча, 0 строк.
  with upd as (
    update members set full_name = 'ПЕРЕПИСАНО'
    where id = current_setting('test.mid')::uuid returning 1
  ) select count(*) into n from upd;
  perform set_config('test.viewer_updated', n::text, true);

  with del as (
    delete from members where id = current_setting('test.mid')::uuid returning 1
  ) select count(*) into n from del;
  perform set_config('test.viewer_deleted', n::text, true);
end $$;

-- ── 2. editor: пишет данные, но не управляет составом семьи ────────
select set_config('request.jwt.claims',
  '{"sub":"c0000000-0000-0000-0000-00000000000c"}', true);

do $$
begin
  begin
    insert into members(household_id, full_name, relation)
      values (current_setting('test.hid')::uuid, 'Добавлено editor-ом', 'other');
    perform set_config('test.editor_insert_ok', 'true', true);
  exception when insufficient_privilege then
    perform set_config('test.editor_insert_ok', 'false', true);
  end;

  -- Состав семьи — только owner (private.is_household_owner).
  begin
    insert into household_members(household_id, user_id, role)
      values (current_setting('test.hid')::uuid,
              'e0000000-0000-0000-0000-00000000000e', 'editor');
    perform set_config('test.editor_adds_member_blocked', 'false', true);
  exception when insufficient_privilege then
    perform set_config('test.editor_adds_member_blocked', 'true', true);
  end;
end $$;

-- ── 3. employment-кластер: сотрудник видит своё, посторонний — нет ─
reset role;
insert into employer_profiles(id, user_id, company_name)
  values ('f0000000-0000-0000-0000-00000000000f',
          'a0000000-0000-0000-0000-00000000000a', 'ACME');
insert into employments(id, company_id, company_name, employee_user_id, position, manual)
  values ('11110000-0000-0000-0000-000000000011',
          'f0000000-0000-0000-0000-00000000000f', 'ACME',
          'd0000000-0000-0000-0000-00000000000d', 'Barista', false);
insert into employment_documents(employment_id, doc_type, label, file_path, file_name)
  values ('11110000-0000-0000-0000-000000000011', 'contract', 'Договор', 'x/1.pdf', '1.pdf');
insert into onboarding_tasks(employment_id, title)
  values ('11110000-0000-0000-0000-000000000011', 'Подписать NDA');
insert into offboarding_tasks(employment_id, title)
  values ('11110000-0000-0000-0000-000000000011', 'Сдать ноутбук');

select set_config('request.jwt.claims',
  '{"sub":"d0000000-0000-0000-0000-00000000000d"}', true);
set local role authenticated;
select set_config('test.employee_docs',      (select count(*) from employment_documents)::text, true);
select set_config('test.employee_onboard',   (select count(*) from onboarding_tasks)::text, true);
select set_config('test.employee_offboard',  (select count(*) from offboarding_tasks)::text, true);

select set_config('request.jwt.claims',
  '{"sub":"e0000000-0000-0000-0000-00000000000e"}', true);
select set_config('test.outsider_docs',     (select count(*) from employment_documents)::text, true);
select set_config('test.outsider_onboard',  (select count(*) from onboarding_tasks)::text, true);
select set_config('test.outsider_offboard', (select count(*) from offboarding_tasks)::text, true);

-- Читаемый вывод.
select
  current_setting('test.viewer_reads')             as viewer_reads,              -- 1
  current_setting('test.viewer_insert_blocked')    as viewer_insert_blocked,     -- true
  current_setting('test.viewer_updated')           as viewer_updated,            -- 0
  current_setting('test.viewer_deleted')           as viewer_deleted,            -- 0
  current_setting('test.editor_insert_ok')         as editor_insert_ok,          -- true
  current_setting('test.editor_adds_member_blocked') as editor_adds_member_blocked, -- true
  current_setting('test.employee_docs')            as employee_docs,             -- 1
  current_setting('test.outsider_docs')            as outsider_docs;             -- 0

do $$
begin
  if current_setting('test.viewer_reads')::int <> 1 then
    raise exception 'viewer не видит данные семьи (%), а должен — читать ему можно',
      current_setting('test.viewer_reads');
  end if;
  if current_setting('test.viewer_insert_blocked') <> 'true' then
    raise exception 'ЗАПИСЬ БЕЗ ПРАВ: viewer добавил члена семьи — политика INSERT пускает не того';
  end if;
  if current_setting('test.viewer_updated')::int <> 0 then
    raise exception 'ЗАПИСЬ БЕЗ ПРАВ: viewer изменил % строк, ожидалось 0',
      current_setting('test.viewer_updated');
  end if;
  if current_setting('test.viewer_deleted')::int <> 0 then
    raise exception 'ЗАПИСЬ БЕЗ ПРАВ: viewer удалил % строк, ожидалось 0',
      current_setting('test.viewer_deleted');
  end if;

  if current_setting('test.editor_insert_ok') <> 'true' then
    raise exception 'РАЗБОР ПОЛИТИК СЛОМАЛ ЗАПИСЬ: editor не может добавить члена семьи, а должен';
  end if;
  if current_setting('test.editor_adds_member_blocked') <> 'true' then
    raise exception 'ЗАПИСЬ БЕЗ ПРАВ: editor изменил состав семьи — это право только owner';
  end if;

  if current_setting('test.employee_docs')::int <> 1
     or current_setting('test.employee_onboard')::int <> 1
     or current_setting('test.employee_offboard')::int <> 1 then
    raise exception 'сотрудник не видит свои документы/задачи (%/%/%), ожидалось 1/1/1',
      current_setting('test.employee_docs'),
      current_setting('test.employee_onboard'),
      current_setting('test.employee_offboard');
  end if;
  if current_setting('test.outsider_docs')::int <> 0
     or current_setting('test.outsider_onboard')::int <> 0
     or current_setting('test.outsider_offboard')::int <> 0 then
    raise exception 'ИЗОЛЯЦИЯ НАРУШЕНА: посторонний видит документы/задачи чужого трудоустройства (%/%/%)',
      current_setting('test.outsider_docs'),
      current_setting('test.outsider_onboard'),
      current_setting('test.outsider_offboard');
  end if;

  raise notice 'PASS write_roles';
end $$;

rollback;

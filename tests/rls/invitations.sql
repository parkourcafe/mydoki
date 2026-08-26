-- RLS-тест: приглашения и роли. Запуск в Supabase SQL Editor или psql.
-- Ожидаемый результат: b_before_accept=0, b_after_accept_and_write=2, b_role=editor.
begin;

-- A: семья + человек + приглашение (editor)
select set_config('request.jwt.claims', '{"sub":"aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"}', true);
set local role authenticated;
select set_config('test.hid', create_household('Invite test')::text, true);
insert into members(household_id, full_name) values (current_setting('test.hid')::uuid, 'A-человек');
insert into invitations(household_id, role) values (current_setting('test.hid')::uuid, 'editor');
select set_config('test.token',
  (select token from invitations where household_id = current_setting('test.hid')::uuid limit 1), true);

-- B: до принятия не видит ничего; принимает; как editor может писать
select set_config('request.jwt.claims', '{"sub":"bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb"}', true);
select set_config('test.b_before', (select count(*) from members)::text, true);
select accept_invitation(current_setting('test.token'));
insert into members(household_id, full_name) values (current_setting('test.hid')::uuid, 'B-человек');

select
  current_setting('test.b_before')   as b_before_accept,          -- ожидается 0
  (select count(*) from members)     as b_after_accept_and_write, -- ожидается 2
  (select role from household_members
     where household_id = current_setting('test.hid')::uuid
       and user_id = auth.uid())      as b_role;                   -- ожидается editor

-- Те же ожидания, но как проверка: при нарушении транзакция падает, psql
-- возвращает ненулевой код, и тест годится для CI без сверки глазами.
do $$
declare
  b_before int := current_setting('test.b_before')::int;
  b_after  int;
  b_role   text;
begin
  select count(*) into b_after from members;
  select role into b_role from household_members
    where household_id = current_setting('test.hid')::uuid
      and user_id = auth.uid();

  if b_before <> 0 then
    raise exception 'ИЗОЛЯЦИЯ НАРУШЕНА: B видел % членов семьи ДО принятия приглашения, ожидалось 0', b_before;
  end if;
  if b_after <> 2 then
    raise exception 'invitations: после принятия и записи B видит % членов семьи, ожидалось 2', b_after;
  end if;
  if b_role is distinct from 'editor' then
    raise exception 'invitations: роль B = %, ожидалась editor', coalesce(b_role, 'NULL');
  end if;

  raise notice 'PASS invitations';
end $$;

rollback;

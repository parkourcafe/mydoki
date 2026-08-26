-- RLS-тест: изоляция семей. Запуск в Supabase SQL Editor или psql.
-- Создаёт данные двух пользователей в одной транзакции и ОТКАТЫВАЕТ их.
-- Ожидаемый результат: a_sees_members=1, b_sees_members=0 (изоляция).
begin;

-- Пользователь A
select set_config('request.jwt.claims', '{"sub":"11111111-1111-1111-1111-111111111111"}', true);
set local role authenticated;
select set_config('test.hid', create_household('RLS isolation test')::text, true);
insert into members(household_id, full_name, relation)
  values (current_setting('test.hid')::uuid, 'Иван', 'self');
select set_config('test.a_members',    (select count(*) from members)::text, true);
select set_config('test.a_households', (select count(*) from households)::text, true);

-- Пользователь B (другой sub) — не должен видеть данные A
select set_config('request.jwt.claims', '{"sub":"22222222-2222-2222-2222-222222222222"}', true);

select
  current_setting('test.a_members')    as a_sees_members,    -- ожидается 1
  current_setting('test.a_households') as a_sees_households,  -- ожидается 1
  (select count(*) from members)       as b_sees_members,    -- ожидается 0
  (select count(*) from households)    as b_sees_households;  -- ожидается 0

-- Тот же результат, но как проверка: при нарушении транзакция падает с
-- ошибкой. Нужно, чтобы тест давал вердикт сам, а не требовал сверки глазами,
-- и чтобы psql вернул ненулевой код для CI. В Supabase SQL Editor нарушение
-- тоже видно — красной ошибкой вместо таблицы.
do $$
declare
  a_members    int := current_setting('test.a_members')::int;
  a_households int := current_setting('test.a_households')::int;
  b_members    int;
  b_households int;
begin
  select count(*) into b_members    from members;
  select count(*) into b_households from households;

  if a_members <> 1 then
    raise exception 'RLS isolation: A видит % своих членов семьи, ожидалась 1', a_members;
  end if;
  if a_households <> 1 then
    raise exception 'RLS isolation: A видит % своих семей, ожидалась 1', a_households;
  end if;
  if b_members <> 0 then
    raise exception 'RLS ISOLATION НАРУШЕНА: B видит % членов семьи A, ожидалось 0', b_members;
  end if;
  if b_households <> 0 then
    raise exception 'RLS ISOLATION НАРУШЕНА: B видит % семей A, ожидалось 0', b_households;
  end if;

  raise notice 'PASS isolation';
end $$;

rollback;

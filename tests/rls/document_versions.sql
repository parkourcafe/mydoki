-- RLS-тест: неизменяемость версий документов и изоляция проверок (PR-1).
-- Запуск в Supabase SQL Editor или psql. Всё в одной транзакции с ROLLBACK.
-- Без psql-мета-команд — совместимо с обоими способами запуска.
--
-- Ожидаемый результат:
--   owner_sees_version = 1   (владелец видит свою версию)
--   updated_rows       = 0   (UPDATE версии запрещён — нет политики)
--   deleted_rows       = 0   (DELETE версии запрещён — нет политики)
--   other_sees_version = 0   (чужой не видит версию)
--   other_sees_check   = 0   (чужой не видит проверку)
begin;

-- ── Пользователь A: документ → версия → проверка ───────────────────
select set_config('request.jwt.claims', '{"sub":"11111111-1111-1111-1111-111111111111"}', true);
set local role authenticated;

select set_config('test.hid', create_household('RLS versions test')::text, true);

with m as (
  insert into members(household_id, full_name, relation)
  values (current_setting('test.hid')::uuid, 'Иван', 'self')
  returning id
) select set_config('test.mid', (select id from m)::text, true);

with d as (
  insert into documents(household_id, member_id, title, category)
  values (current_setting('test.hid')::uuid, current_setting('test.mid')::uuid, 'Паспорт', 'identity')
  returning id
) select set_config('test.did', (select id from d)::text, true);

with v as (
  insert into document_versions(document_id, household_id, storage_path, file_hash, mime, size_bytes)
  values (
    current_setting('test.did')::uuid, current_setting('test.hid')::uuid,
    current_setting('test.hid') || '/' || current_setting('test.did') || '/f1',
    'abc123', 'application/pdf', 100
  )
  returning id
) select set_config('test.vid', (select id from v)::text, true);

insert into document_checks(document_version_id, household_id, check_type, result)
  values (current_setting('test.vid')::uuid, current_setting('test.hid')::uuid, 'expiry', 'pass');

select set_config('test.owner_sees_version',
  (select count(*) from document_versions where id = current_setting('test.vid')::uuid)::text, true);

-- ── Неизменяемость: update/delete не проходят RLS (0 строк) ─────────
with upd as (
  update document_versions set file_hash = 'HACKED'
  where id = current_setting('test.vid')::uuid returning 1
) select set_config('test.updated_rows', (select count(*) from upd)::text, true);

with del as (
  delete from document_versions
  where id = current_setting('test.vid')::uuid returning 1
) select set_config('test.deleted_rows', (select count(*) from del)::text, true);

-- ── Пользователь B: чужой, ничего не видит ─────────────────────────
select set_config('request.jwt.claims', '{"sub":"22222222-2222-2222-2222-222222222222"}', true);

select
  current_setting('test.owner_sees_version') as owner_sees_version, -- 1
  current_setting('test.updated_rows')       as updated_rows,       -- 0
  current_setting('test.deleted_rows')       as deleted_rows,       -- 0
  (select count(*) from document_versions
     where id = current_setting('test.vid')::uuid) as other_sees_version, -- 0
  (select count(*) from document_checks
     where document_version_id = current_setting('test.vid')::uuid) as other_sees_check; -- 0

-- Те же ожидания, но как проверка: при нарушении транзакция падает, psql
-- возвращает ненулевой код, и тест годится для CI без сверки глазами.
do $$
declare
  owner_sees   int := current_setting('test.owner_sees_version')::int;
  updated_rows int := current_setting('test.updated_rows')::int;
  deleted_rows int := current_setting('test.deleted_rows')::int;
  other_ver    int;
  other_chk    int;
begin
  select count(*) into other_ver from document_versions
    where id = current_setting('test.vid')::uuid;
  select count(*) into other_chk from document_checks
    where document_version_id = current_setting('test.vid')::uuid;

  if owner_sees <> 1 then
    raise exception 'document_versions: владелец видит % своих версий, ожидалась 1', owner_sees;
  end if;
  if updated_rows <> 0 then
    raise exception 'НЕИЗМЕНЯЕМОСТЬ НАРУШЕНА: UPDATE версии затронул % строк, ожидалось 0', updated_rows;
  end if;
  if deleted_rows <> 0 then
    raise exception 'НЕИЗМЕНЯЕМОСТЬ НАРУШЕНА: DELETE версии затронул % строк, ожидалось 0', deleted_rows;
  end if;
  if other_ver <> 0 then
    raise exception 'ИЗОЛЯЦИЯ НАРУШЕНА: чужой видит % версий, ожидалось 0', other_ver;
  end if;
  if other_chk <> 0 then
    raise exception 'ИЗОЛЯЦИЯ НАРУШЕНА: чужой видит % проверок, ожидалось 0', other_chk;
  end if;

  raise notice 'PASS document_versions';
end $$;

rollback;

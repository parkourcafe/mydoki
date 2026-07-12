-- PR-1 (фаза 1A, vault): неизменяемые версии документов, автопроверки,
-- статус archived. Всё аддитивно — БД общая с Doki.id, существующие
-- таблицы/колонки/RPC не меняем. document_files продолжает работать;
-- новые загрузки пишутся И в document_files, И в document_versions.
--
-- План отката (rollback):
--   drop function if exists set_document_version_hash(uuid,text);
--   alter table documents
--     drop column if exists status,
--     drop column if exists current_version_id,
--     drop column if exists holder_name;
--   drop table if exists document_checks;
--   drop table if exists document_versions;
-- (данные document_files при откате не теряются — версии лишь дублировали их)

-- ---------------------------- Версии документов ----------------------
-- Неизменяемы: политик update/delete нет вовсе. Обновление документа =
-- новая версия; удаление версии запрещено, только архивация документа.
create table if not exists document_versions (
  id            uuid primary key default gen_random_uuid(),
  document_id   uuid not null references documents(id) on delete cascade,
  household_id  uuid not null references households(id) on delete cascade,
  storage_path  text not null,
  file_hash     text not null default '',   -- sha256 hex; '' у legacy до первой проверки целостности
  mime          text not null default 'application/octet-stream',
  size_bytes    bigint not null default 0,
  note          text,
  uploaded_by   uuid,
  created_at    timestamptz not null default now()
);
create index if not exists document_versions_doc_idx
  on document_versions(document_id, created_at desc);

-- ---------------------------- Документы: новые колонки ----------------
alter table documents
  add column if not exists status text not null default 'active'
    check (status in ('active','archived')),
  add column if not exists current_version_id uuid references document_versions(id),
  add column if not exists holder_name text;   -- имя владельца в документе (для name_match)

-- ---------------------------- Автопроверки ----------------------------
-- Только статусы pass/mismatch/unreadable и машинные основания в details.
-- Никаких вердиктов о подлинности — ни здесь, ни в UI.
create table if not exists document_checks (
  id                   uuid primary key default gen_random_uuid(),
  document_version_id  uuid not null references document_versions(id) on delete cascade,
  household_id         uuid not null references households(id) on delete cascade,
  check_type           text not null
    check (check_type in ('expiry','name_match','date_consistency','file_integrity')),
  result               text not null
    check (result in ('pass','mismatch','unreadable')),
  details              jsonb not null default '{}'::jsonb,
  checked_at           timestamptz not null default now()
);
create index if not exists document_checks_version_idx
  on document_checks(document_version_id);

-- ---------------------------- Бэкофилл --------------------------------
-- Каждой строке document_files — версия (hash '' досчитается лениво при
-- первой проверке целостности). Затем current_version_id = последняя.
insert into document_versions
  (document_id, household_id, storage_path, file_hash, mime, size_bytes, note, uploaded_by, created_at)
select
  df.document_id, df.household_id, df.storage_path, '',
  coalesce(df.mime_type, 'application/octet-stream'),
  coalesce(df.size_bytes, 0), null, df.uploaded_by, df.created_at
from document_files df
where not exists (
  select 1 from document_versions v where v.storage_path = df.storage_path
);

update documents d
set current_version_id = v.id
from (
  select distinct on (document_id) id, document_id
  from document_versions
  order by document_id, created_at desc, id desc
) v
where v.document_id = d.id and d.current_version_id is null;

-- ---------------------------- RLS -------------------------------------
alter table document_versions enable row level security;
alter table document_checks   enable row level security;

-- Чтение — любой член семьи; запись — редактор. Update/delete политик нет:
-- версии и проверки неизменяемы на уровне RLS.
create policy "docver read" on document_versions
  for select using (private.is_household_member(household_id));
create policy "docver insert" on document_versions
  for insert with check (private.is_household_editor(household_id));

create policy "doccheck read" on document_checks
  for select using (private.is_household_member(household_id));
create policy "doccheck insert" on document_checks
  for insert with check (private.is_household_editor(household_id));

-- ---------------------------- Write-once хэш --------------------------
-- Позволяет проставить sha256 legacy-версии ровно один раз (пока file_hash
-- пуст). Непустой хэш изменить нельзя — неизменяемость сохраняется.
create or replace function set_document_version_hash(p_version_id uuid, p_hash text)
returns void language sql volatile security definer set search_path = public as $$
  update document_versions
    set file_hash = p_hash
    where id = p_version_id
      and file_hash = ''
      and private.is_household_editor(household_id);
$$;
grant execute on function set_document_version_hash(uuid, text) to authenticated;

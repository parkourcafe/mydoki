-- =====================================================================
-- Пакетные ссылки: одна ссылка → несколько документов сразу. Кандидат
-- отмечает документы галочками и отправляет работодателю ОДНУ ссылку.
-- Зеркалит существующий механизм shares/get_shared_document/s/[token],
-- ничего старого не трогает (только новые таблицы + RPC).
-- =====================================================================

create table share_packages (
  id             uuid primary key default gen_random_uuid(),
  household_id   uuid not null references households(id) on delete cascade,
  token          text not null unique default replace(gen_random_uuid()::text,'-',''),
  title          text,
  created_by     uuid not null default auth.uid(),
  expires_at     timestamptz not null,
  revoked_at     timestamptz,
  allow_download boolean not null default true,
  created_at     timestamptz not null default now()
);
create index on share_packages(token);
create index on share_packages(household_id);

create table share_package_documents (
  package_id  uuid not null references share_packages(id) on delete cascade,
  document_id uuid not null references documents(id) on delete cascade,
  primary key (package_id, document_id)
);
create index on share_package_documents(document_id);

alter table share_packages          enable row level security;
alter table share_package_documents enable row level security;

create policy "pkg read"  on share_packages for select using (private.is_household_member(household_id));
create policy "pkg write" on share_packages for all
  using (private.is_household_editor(household_id))
  with check (private.is_household_editor(household_id));

create policy "pkg docs read" on share_package_documents for select
  using (package_id in (select id from share_packages where private.is_household_member(household_id)));
create policy "pkg docs write" on share_package_documents for all
  using (package_id in (select id from share_packages where private.is_household_editor(household_id)))
  with check (package_id in (select id from share_packages where private.is_household_editor(household_id)));

-- Публичное чтение пакета по токену (как get_shared_document): отдаёт список
-- документов с их файлами. Логирование просмотра — как в аудите документов.
create or replace function get_shared_package(p_token text)
returns jsonb language plpgsql volatile security definer set search_path = public as $$
declare p share_packages; docs jsonb;
begin
  select * into p from share_packages where token = p_token;
  if not found or p.revoked_at is not null or p.expires_at < now() then
    return null;
  end if;

  select coalesce(jsonb_agg(
           jsonb_build_object(
             'title', d.title,
             'category', d.category,
             'issuer', d.issuer,
             'expires_at', d.expires_at,
             'files', (
               select coalesce(jsonb_agg(jsonb_build_object(
                        'storage_path', f.storage_path,
                        'file_name', f.file_name,
                        'mime_type', f.mime_type)), '[]'::jsonb)
               from document_files f where f.document_id = d.id
             )
           ) order by d.title), '[]'::jsonb)
    into docs
    from share_package_documents spd
    join documents d on d.id = spd.document_id
    where spd.package_id = p.id;

  insert into audit_log(household_id, actor_user_id, action, entity_type, entity_id, metadata)
    values (p.household_id, auth.uid(), 'package.share_view', 'share_package', p.id::text,
            jsonb_build_object('token', p_token));

  return jsonb_build_object(
    'title', p.title,
    'allow_download', p.allow_download,
    'documents', docs
  );
end; $$;
grant execute on function get_shared_package(text) to anon, authenticated;

-- Отозвать пакетную ссылку.
create or replace function revoke_share_package(p_id uuid)
returns void language sql volatile security definer set search_path = public as $$
  update share_packages set revoked_at = now()
  where id = p_id and private.is_household_editor(household_id);
$$;
grant execute on function revoke_share_package(uuid) to authenticated;

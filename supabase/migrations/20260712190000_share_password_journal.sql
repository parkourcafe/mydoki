-- PR-10 (фаза 1D): пароль на share-ссылки, паритет пакетов
-- (max_views/watermark/view_count) и обогащение журнала (ip-хэш, user-agent).
-- Аддитивно: новые колонки; RPC пересоздаются с параметрами-дефолтами,
-- поэтому старые вызовы Doki.id (только p_token) продолжают работать —
-- пароль требуется лишь у ссылок, где password_hash задан.
--
-- План отката: вернуть get_shared_document/get_shared_package к 1-арговым
-- версиям (20260623013327 / 20260702100000) и снять новые колонки.

alter table shares add column if not exists password_hash text;
alter table share_packages
  add column if not exists password_hash text,
  add column if not exists max_views int,
  add column if not exists view_count int not null default 0,
  add column if not exists watermark boolean not null default true;

-- ── get_shared_document: +пароль +ip/ua (аддитивно) ────────────────
drop function if exists get_shared_document(text);
create or replace function get_shared_document(
  p_token text,
  p_password_hash text default null,
  p_ip_hash text default null,
  p_user_agent text default null
)
returns jsonb language plpgsql volatile security definer set search_path = public as $$
declare s shares; doc documents; files jsonb;
begin
  select * into s from shares where token = p_token;
  if not found
     or s.revoked_at is not null
     or s.expires_at < now()
     or (s.max_views is not null and s.view_count >= s.max_views)
  then return null; end if;

  -- Пароль: если задан, требуем совпадения хэша (locked до ввода).
  if s.password_hash is not null
     and (p_password_hash is null or p_password_hash <> s.password_hash)
  then return jsonb_build_object('locked', true); end if;

  update shares set view_count = view_count + 1 where id = s.id;
  select * into doc from documents where id = s.document_id;

  select coalesce(jsonb_agg(jsonb_build_object(
           'storage_path', f.storage_path, 'file_name', f.file_name, 'mime_type', f.mime_type)),
         '[]'::jsonb)
    into files from document_files f where f.document_id = doc.id;

  insert into audit_log(household_id, actor_user_id, action, entity_type, entity_id, metadata)
    values (doc.household_id, auth.uid(), 'document.share_view', 'document', doc.id::text,
            jsonb_build_object('token', p_token, 'ip_hash', p_ip_hash, 'user_agent', p_user_agent));

  return jsonb_build_object(
    'document', jsonb_build_object(
      'title', doc.title, 'category', doc.category, 'subtype', doc.subtype,
      'issuer', doc.issuer, 'issued_at', doc.issued_at, 'expires_at', doc.expires_at),
    'share', jsonb_build_object('watermark', s.watermark, 'allow_download', s.allow_download),
    'files', files
  );
end; $$;
grant execute on function get_shared_document(text,text,text,text) to anon, authenticated;

-- ── get_shared_package: +max_views +watermark +пароль +ip/ua ───────
drop function if exists get_shared_package(text);
create or replace function get_shared_package(
  p_token text,
  p_password_hash text default null,
  p_ip_hash text default null,
  p_user_agent text default null
)
returns jsonb language plpgsql volatile security definer set search_path = public as $$
declare p share_packages; docs jsonb;
begin
  select * into p from share_packages where token = p_token;
  if not found or p.revoked_at is not null or p.expires_at < now()
     or (p.max_views is not null and p.view_count >= p.max_views)
  then return null; end if;

  if p.password_hash is not null
     and (p_password_hash is null or p_password_hash <> p.password_hash)
  then return jsonb_build_object('locked', true); end if;

  update share_packages set view_count = view_count + 1 where id = p.id;

  select coalesce(jsonb_agg(
           jsonb_build_object(
             'title', d.title, 'category', d.category, 'issuer', d.issuer,
             'expires_at', d.expires_at,
             'files', (
               select coalesce(jsonb_agg(jsonb_build_object(
                        'storage_path', f.storage_path,
                        'file_name', f.file_name, 'mime_type', f.mime_type)), '[]'::jsonb)
               from document_files f where f.document_id = d.id
             )
           ) order by d.title), '[]'::jsonb)
    into docs
    from share_package_documents spd
    join documents d on d.id = spd.document_id
    where spd.package_id = p.id;

  insert into audit_log(household_id, actor_user_id, action, entity_type, entity_id, metadata)
    values (p.household_id, auth.uid(), 'package.share_view', 'share_package', p.id::text,
            jsonb_build_object('token', p_token, 'ip_hash', p_ip_hash, 'user_agent', p_user_agent));

  return jsonb_build_object(
    'title', p.title,
    'allow_download', p.allow_download,
    'watermark', p.watermark,
    'documents', docs
  );
end; $$;
grant execute on function get_shared_package(text,text,text,text) to anon, authenticated;

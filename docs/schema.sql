-- =====================================================================
-- Family Vault — консолидированная схема (актуальное состояние БД)
--
-- Это читаемый снимок «как есть» после всех миграций. Тот же SQL лежит как
-- воспроизводимая миграция: supabase/migrations/0001_init_family_vault.sql.
--
-- Принципы:
--   • всё приватно: доступ только у семьи (RLS на каждой таблице);
--   • файлы — в приватном bucket, наружу только через signed URL;
--   • обмен — только через истекающие/отзываемые share-ссылки (RPC, не RLS);
--   • RLS-хелперы вынесены в схему private (не экспонируются PostgREST);
--   • публичный REST-RPC ровно один: get_shared_document (share-ссылки).
-- =====================================================================

create extension if not exists pgcrypto;

create schema if not exists private;
grant usage on schema private to authenticated;

-- ---------------------------- Перечисления ----------------------------
do $$ begin create type household_role as enum ('owner','editor','viewer');
exception when duplicate_object then null; end $$;

do $$ begin create type doc_category as enum
  ('identity','education','medical','financial','legal','other');
exception when duplicate_object then null; end $$;

do $$ begin create type record_kind as enum
  ('medical_analysis','prescription','nutrition','vaccination','note','other');
exception when duplicate_object then null; end $$;

do $$ begin create type consent_kind as enum ('privacy_policy','medical','marketing');
exception when duplicate_object then null; end $$;

-- ---------------------------- Таблицы ---------------------------------
create table households (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  created_by  uuid not null default auth.uid(),
  created_at  timestamptz not null default now()
);

create table household_members (
  household_id uuid not null references households(id) on delete cascade,
  user_id      uuid not null,
  role         household_role not null default 'viewer',
  created_at   timestamptz not null default now(),
  primary key (household_id, user_id)
);

create table members (
  id           uuid primary key default gen_random_uuid(),
  household_id uuid not null references households(id) on delete cascade,
  full_name    text not null,
  birth_date   date,
  relation     text,
  photo_url    text,
  created_by   uuid not null default auth.uid(),
  created_at   timestamptz not null default now()
);
create index on members(household_id);

create table documents (
  id           uuid primary key default gen_random_uuid(),
  household_id uuid not null references households(id) on delete cascade,
  member_id    uuid not null references members(id) on delete cascade,
  category     doc_category not null default 'other',
  subtype      text,
  title        text not null,
  issuer       text,
  doc_number   text,
  issued_at    date,
  expires_at   date,
  notes        text,
  tags         text[] not null default '{}',
  created_by   uuid not null default auth.uid(),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create index on documents(household_id);
create index on documents(member_id);
create index on documents(expires_at);
create index on documents using gin(tags);

create table document_files (
  id           uuid primary key default gen_random_uuid(),
  document_id  uuid not null references documents(id) on delete cascade,
  household_id uuid not null references households(id) on delete cascade,
  storage_path text not null,
  file_name    text,
  mime_type    text,
  size_bytes   bigint,
  uploaded_by  uuid not null default auth.uid(),
  created_at   timestamptz not null default now()
);
create index on document_files(document_id);

create table records (
  id           uuid primary key default gen_random_uuid(),
  household_id uuid not null references households(id) on delete cascade,
  member_id    uuid not null references members(id) on delete cascade,
  kind         record_kind not null default 'note',
  title        text not null,
  data         jsonb not null default '{}'::jsonb,
  recorded_at  date,
  created_by   uuid not null default auth.uid(),
  created_at   timestamptz not null default now()
);
create index on records(member_id);

create table reminders (
  id           uuid primary key default gen_random_uuid(),
  household_id uuid not null references households(id) on delete cascade,
  document_id  uuid references documents(id) on delete cascade,
  member_id    uuid references members(id) on delete cascade,
  due_at       date not null,
  message      text,
  done         boolean not null default false,
  created_at   timestamptz not null default now()
);

create table shares (
  id             uuid primary key default gen_random_uuid(),
  household_id   uuid not null references households(id) on delete cascade,
  document_id    uuid not null references documents(id) on delete cascade,
  token          text not null unique default replace(gen_random_uuid()::text, '-', ''),
  created_by     uuid not null default auth.uid(),
  expires_at     timestamptz not null,
  revoked_at     timestamptz,
  max_views      int,
  view_count     int not null default 0,
  watermark      boolean not null default true,
  allow_download boolean not null default false,
  created_at     timestamptz not null default now()
);
create index on shares(token);

create table audit_log (
  id            uuid primary key default gen_random_uuid(),
  household_id  uuid,
  actor_user_id uuid,
  action        text not null,
  entity_type   text,
  entity_id     text,
  metadata      jsonb not null default '{}'::jsonb,
  created_at    timestamptz not null default now()
);
create index on audit_log(household_id, created_at desc);

create table consents (
  id           uuid primary key default gen_random_uuid(),
  household_id uuid not null references households(id) on delete cascade,
  member_id    uuid references members(id) on delete cascade,
  user_id      uuid not null default auth.uid(),
  kind         consent_kind not null,
  version      text not null,
  granted_at   timestamptz not null default now(),
  revoked_at   timestamptz
);
create index on consents(household_id);

create table invitations (
  id           uuid primary key default gen_random_uuid(),
  household_id uuid not null references households(id) on delete cascade,
  role         household_role not null default 'viewer',
  token        text not null unique default replace(gen_random_uuid()::text, '-', ''),
  email        text,
  created_by   uuid not null default auth.uid(),
  expires_at   timestamptz not null default now() + interval '14 days',
  accepted_at  timestamptz,
  accepted_by  uuid,
  created_at   timestamptz not null default now()
);
create index on invitations(household_id);
create index on invitations(token);

-- ---------------------------- RLS-хелперы (private) -------------------
-- SECURITY DEFINER + private-схема: не экспонируются PostgREST, спасают
-- household_members от рекурсии RLS.
create or replace function private.current_user_household_ids()
returns setof uuid language sql stable security definer set search_path = public as $$
  select household_id from household_members where user_id = auth.uid();
$$;
create or replace function private.is_household_member(hid uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from household_members
                 where household_id = hid and user_id = auth.uid());
$$;
create or replace function private.is_household_editor(hid uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from household_members
                 where household_id = hid and user_id = auth.uid()
                   and role in ('owner','editor'));
$$;
create or replace function private.is_household_owner(hid uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from household_members
                 where household_id = hid and user_id = auth.uid() and role = 'owner');
$$;
revoke execute on function
  private.current_user_household_ids(), private.is_household_member(uuid),
  private.is_household_editor(uuid), private.is_household_owner(uuid)
from public;
grant execute on function
  private.current_user_household_ids(), private.is_household_member(uuid),
  private.is_household_editor(uuid), private.is_household_owner(uuid)
to authenticated;

-- ---------------------------- RLS -------------------------------------
alter table households        enable row level security;
alter table household_members enable row level security;
alter table members           enable row level security;
alter table documents         enable row level security;
alter table document_files    enable row level security;
alter table records           enable row level security;
alter table reminders         enable row level security;
alter table shares            enable row level security;
alter table audit_log         enable row level security;
alter table consents          enable row level security;
alter table invitations       enable row level security;

create policy "household read"   on households for select using (private.is_household_member(id));
create policy "household manage" on households for update using (private.is_household_owner(id));

create policy "hm read"   on household_members for select using (private.is_household_member(household_id));
create policy "hm manage" on household_members for all
  using (private.is_household_owner(household_id)) with check (private.is_household_owner(household_id));

create policy "members read"  on members for select using (private.is_household_member(household_id));
create policy "members write" on members for all
  using (private.is_household_editor(household_id)) with check (private.is_household_editor(household_id));

create policy "documents read"  on documents for select using (private.is_household_member(household_id));
create policy "documents write" on documents for all
  using (private.is_household_editor(household_id)) with check (private.is_household_editor(household_id));

create policy "files read"  on document_files for select using (private.is_household_member(household_id));
create policy "files write" on document_files for all
  using (private.is_household_editor(household_id)) with check (private.is_household_editor(household_id));

create policy "records read"  on records for select using (private.is_household_member(household_id));
create policy "records write" on records for all
  using (private.is_household_editor(household_id)) with check (private.is_household_editor(household_id));

create policy "reminders read"  on reminders for select using (private.is_household_member(household_id));
create policy "reminders write" on reminders for all
  using (private.is_household_editor(household_id)) with check (private.is_household_editor(household_id));

create policy "shares read"  on shares for select using (private.is_household_member(household_id));
create policy "shares write" on shares for all
  using (private.is_household_editor(household_id)) with check (private.is_household_editor(household_id));

create policy "audit read" on audit_log for select using (private.is_household_member(household_id));

create policy "consents read"  on consents for select using (private.is_household_member(household_id));
create policy "consents write" on consents for all
  using (private.is_household_editor(household_id)) with check (private.is_household_editor(household_id));

create policy "inv read" on invitations for select using (private.is_household_member(household_id));
create policy "inv manage" on invitations for all
  using (private.is_household_owner(household_id)) with check (private.is_household_owner(household_id));

-- ---------------------------- RPC -------------------------------------
create or replace function create_household(p_name text)
returns uuid language plpgsql volatile security definer set search_path = public as $$
declare hid uuid;
begin
  if auth.uid() is null then raise exception 'not authenticated'; end if;
  insert into households(name, created_by) values (p_name, auth.uid()) returning id into hid;
  insert into household_members(household_id, user_id, role) values (hid, auth.uid(), 'owner');
  return hid;
end; $$;
revoke execute on function create_household(text) from public, anon;
grant execute on function create_household(text) to authenticated;

create or replace function log_audit(
  p_household uuid, p_action text,
  p_entity_type text default null, p_entity_id text default null,
  p_metadata jsonb default '{}'::jsonb)
returns void language sql security definer set search_path = public as $$
  insert into audit_log(household_id, actor_user_id, action, entity_type, entity_id, metadata)
  values (p_household, auth.uid(), p_action, p_entity_type, p_entity_id, coalesce(p_metadata,'{}'::jsonb));
$$;
revoke execute on function log_audit(uuid,text,text,text,jsonb) from public, anon;
grant execute on function log_audit(uuid,text,text,text,jsonb) to authenticated;

-- Публичный доступ по share-ссылке (единственный anon-RPC).
create or replace function get_shared_document(p_token text)
returns jsonb language plpgsql volatile security definer set search_path = public as $$
declare s shares; doc documents; files jsonb;
begin
  select * into s from shares where token = p_token;
  if not found
     or s.revoked_at is not null
     or s.expires_at < now()
     or (s.max_views is not null and s.view_count >= s.max_views)
  then return null; end if;

  update shares set view_count = view_count + 1 where id = s.id;
  select * into doc from documents where id = s.document_id;

  select coalesce(jsonb_agg(jsonb_build_object(
           'storage_path', f.storage_path, 'file_name', f.file_name, 'mime_type', f.mime_type)),
         '[]'::jsonb)
    into files from document_files f where f.document_id = doc.id;

  insert into audit_log(household_id, actor_user_id, action, entity_type, entity_id, metadata)
    values (doc.household_id, auth.uid(), 'document.share_view', 'document', doc.id::text,
            jsonb_build_object('token', p_token));

  return jsonb_build_object(
    'document', jsonb_build_object(
      'title', doc.title, 'category', doc.category, 'subtype', doc.subtype,
      'issuer', doc.issuer, 'issued_at', doc.issued_at, 'expires_at', doc.expires_at),
    'share', jsonb_build_object('watermark', s.watermark, 'allow_download', s.allow_download),
    'files', files
  );
end; $$;
grant execute on function get_shared_document(text) to anon, authenticated;

create or replace function revoke_share(p_share_id uuid)
returns void language sql volatile security definer set search_path = public as $$
  update shares set revoked_at = now()
  where id = p_share_id and private.is_household_editor(household_id);
$$;
revoke execute on function revoke_share(uuid) from public, anon;
grant execute on function revoke_share(uuid) to authenticated;

-- Приглашения в семью (link-based).
create or replace function get_invitation(p_token text)
returns jsonb language plpgsql stable security definer set search_path = public as $$
declare inv invitations; hname text;
begin
  select * into inv from invitations where token = p_token;
  if not found or inv.accepted_at is not null or inv.expires_at < now() then
    return null;
  end if;
  select name into hname from households where id = inv.household_id;
  return jsonb_build_object('household', hname, 'role', inv.role);
end; $$;
revoke execute on function get_invitation(text) from public, anon;
grant execute on function get_invitation(text) to authenticated;

create or replace function accept_invitation(p_token text)
returns uuid language plpgsql volatile security definer set search_path = public as $$
declare inv invitations;
begin
  if auth.uid() is null then raise exception 'not authenticated'; end if;
  select * into inv from invitations where token = p_token;
  if not found or inv.accepted_at is not null or inv.expires_at < now() then
    return null;
  end if;
  insert into household_members(household_id, user_id, role)
    values (inv.household_id, auth.uid(), inv.role)
    on conflict (household_id, user_id) do update set role = excluded.role;
  update invitations set accepted_at = now(), accepted_by = auth.uid() where id = inv.id;
  return inv.household_id;
end; $$;
revoke execute on function accept_invitation(text) from public, anon;
grant execute on function accept_invitation(text) to authenticated;

-- ---------------------------- Storage ---------------------------------
insert into storage.buckets (id, name, public)
values ('vault-files','vault-files', false)
on conflict (id) do nothing;

create policy "vault read files" on storage.objects for select
  using (bucket_id = 'vault-files'
         and (storage.foldername(name))[1]::uuid in (select private.current_user_household_ids()));
create policy "vault write files" on storage.objects for insert
  with check (bucket_id = 'vault-files'
         and (storage.foldername(name))[1]::uuid in (select private.current_user_household_ids()));
create policy "vault delete files" on storage.objects for delete
  using (bucket_id = 'vault-files'
         and (storage.foldername(name))[1]::uuid in (select private.current_user_household_ids()));

-- ПРИМЕЧАНИЯ:
--  • Получатель share-ссылки: сервер приложения вызывает get_shared_document,
--    затем service_role-клиентом подписывает короткий signed URL к файлу.
--  • Медицина (category='medical', record_kind analysis/prescription) — спец-
--    категория ПДн: таблица consents + при необходимости более строгий доступ.
--  • Топ-чувствительные файлы — кандидат на envelope-шифрование на клиенте.
--  • В Supabase Auth: включить 2FA и защиту от утёкших паролей (Auth → Password).

-- =====================================================================
-- Имущество (объекты: авто, недвижимость, прочее) + привязка документов
-- =====================================================================
do $$ begin create type asset_type as enum ('vehicle','real_estate','other');
exception when duplicate_object then null; end $$;

create table assets (
  id           uuid primary key default gen_random_uuid(),
  household_id uuid not null references households(id) on delete cascade,
  type         asset_type not null default 'other',
  title        text not null,
  details      text,
  created_by   uuid not null default auth.uid(),
  created_at   timestamptz not null default now()
);
create index on assets(household_id);

alter table assets enable row level security;
create policy "assets read" on assets for select using (private.is_household_member(household_id));
create policy "assets write" on assets for all
  using (private.is_household_editor(household_id)) with check (private.is_household_editor(household_id));

-- Документ принадлежит человеку ИЛИ объекту (ровно одному владельцу).
alter table documents alter column member_id drop not null;
alter table documents add column asset_id uuid references assets(id) on delete cascade;
create index on documents(asset_id);
alter table documents add constraint documents_owner_chk
  check (num_nonnulls(member_id, asset_id) = 1);

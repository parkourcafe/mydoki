-- =====================================================================
-- ЧЕРНОВИК СХЕМЫ: «Семейный цифровой сейф документов» (Family Document Vault)
--
-- ВНИМАНИЕ: design-черновик для ОТДЕЛЬНОГО продукта / отдельного проекта
-- Supabase. Это НЕ миграция для базы PET ID — не применять к проекту PET ID.
--
-- Принципы:
--   • всё приватно: доступ только у владельца/семьи (RLS на каждой таблице);
--   • файлы — в приватном bucket, наружу только через signed URL;
--   • обмен — только через истекающие/отзываемые share-ссылки (RPC, не RLS);
--   • спец-категория «медицина» — повышенные требования к согласиям/доступу;
--   • опционально — клиентское (envelope) шифрование топ-чувствительных файлов.
-- =====================================================================

create extension if not exists pgcrypto;

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

-- ---------------------------- Семья / доступ --------------------------
create table households (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  created_by  uuid not null default auth.uid(),
  created_at  timestamptz not null default now()
);

create table household_members (
  household_id uuid not null references households(id) on delete cascade,
  user_id      uuid not null,                  -- auth.users.id
  role         household_role not null default 'viewer',
  created_at   timestamptz not null default now(),
  primary key (household_id, user_id)
);

-- Хелперы доступа (SECURITY DEFINER — чтобы проверки не упирались в RLS
-- самой таблицы household_members и не давали рекурсию).
create or replace function current_user_household_ids()
returns setof uuid language sql stable security definer set search_path = public as $$
  select household_id from household_members where user_id = auth.uid();
$$;

create or replace function is_household_member(hid uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from household_members
                 where household_id = hid and user_id = auth.uid());
$$;

create or replace function is_household_editor(hid uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from household_members
                 where household_id = hid and user_id = auth.uid()
                   and role in ('owner','editor'));
$$;

create or replace function is_household_owner(hid uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from household_members
                 where household_id = hid and user_id = auth.uid() and role = 'owner');
$$;

-- ---------------------------- Люди и документы ------------------------
create table members (                          -- член семьи: «я», «сын»…
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
  subtype      text,                            -- «паспорт», «диплом», «грамота»
  title        text not null,
  issuer       text,                            -- кем выдан
  doc_number   text,
  issued_at    date,
  expires_at   date,                            -- для напоминаний о сроке
  notes        text,
  tags         text[] not null default '{}',     -- свободные метки для поиска
  created_by   uuid not null default auth.uid(),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create index on documents(household_id);
create index on documents(member_id);
create index on documents(expires_at);
create index on documents using gin(tags);

create table document_files (                   -- файл(ы) документа (скан фронт/оборот)
  id           uuid primary key default gen_random_uuid(),
  document_id  uuid not null references documents(id) on delete cascade,
  household_id uuid not null references households(id) on delete cascade, -- денорм. для RLS/storage
  storage_path text not null,                   -- '<household_id>/<document_id>/<file>'
  file_name    text,
  mime_type    text,
  size_bytes   bigint,
  uploaded_by  uuid not null default auth.uid(),
  created_at   timestamptz not null default now()
);
create index on document_files(document_id);

create table records (                          -- структурные записи без файла
  id           uuid primary key default gen_random_uuid(),
  household_id uuid not null references households(id) on delete cascade,
  member_id    uuid not null references members(id) on delete cascade,
  kind         record_kind not null default 'note',
  title        text not null,
  data         jsonb not null default '{}'::jsonb, -- результат анализа / назначение / план питания
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

-- ---------------------------- Обмен (share) ---------------------------
create table shares (                           -- защищённая ссылка на ОДИН документ
  id           uuid primary key default gen_random_uuid(),
  household_id uuid not null references households(id) on delete cascade,
  document_id  uuid not null references documents(id) on delete cascade,
  token        text not null unique default replace(gen_random_uuid()::text,'-',''),
  created_by   uuid not null default auth.uid(),
  expires_at   timestamptz not null,            -- ссылка истекает
  revoked_at   timestamptz,                      -- можно отозвать
  max_views      int,                            -- лимит просмотров (опц.)
  view_count     int not null default 0,
  watermark      boolean not null default true,  -- водяной знак на превью
  allow_download boolean not null default false, -- разрешить скачивание оригинала
  created_at     timestamptz not null default now()
);
create index on shares(token);

-- ---------------------------- Аудит -----------------------------------
create table audit_log (
  id            uuid primary key default gen_random_uuid(),
  household_id  uuid,
  actor_user_id uuid,
  action        text not null,                  -- 'document.view','file.download','document.share'
  entity_type   text,
  entity_id     text,
  metadata      jsonb not null default '{}'::jsonb,
  created_at    timestamptz not null default now()
);
create index on audit_log(household_id, created_at desc);

-- ---------------------------- Согласия (ПДн/медицина) -----------------
create table consents (
  id           uuid primary key default gen_random_uuid(),
  household_id uuid not null references households(id) on delete cascade,
  member_id    uuid references members(id) on delete cascade,  -- опц.: по конкретному человеку
  user_id      uuid not null default auth.uid(),               -- кто дал согласие
  kind         consent_kind not null,
  version      text not null,                                   -- версия политики/формы
  granted_at   timestamptz not null default now(),
  revoked_at   timestamptz
);
create index on consents(household_id);

-- =====================================================================
-- RLS
-- =====================================================================
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

-- households: видят члены; управляет владелец. Создание — через create_household().
create policy "household read"   on households for select using (is_household_member(id));
create policy "household manage" on households for update using (is_household_owner(id));

-- household_members: видят все члены; управляет только owner.
create policy "hm read"   on household_members for select using (is_household_member(household_id));
create policy "hm manage" on household_members for all
  using (is_household_owner(household_id)) with check (is_household_owner(household_id));

-- Унифицированный паттерн: чтение — член семьи; запись — editor/owner.
-- members
create policy "members read"  on members for select using (is_household_member(household_id));
create policy "members write" on members for all
  using (is_household_editor(household_id)) with check (is_household_editor(household_id));
-- documents
create policy "documents read"  on documents for select using (is_household_member(household_id));
create policy "documents write" on documents for all
  using (is_household_editor(household_id)) with check (is_household_editor(household_id));
-- document_files
create policy "files read"  on document_files for select using (is_household_member(household_id));
create policy "files write" on document_files for all
  using (is_household_editor(household_id)) with check (is_household_editor(household_id));
-- records
create policy "records read"  on records for select using (is_household_member(household_id));
create policy "records write" on records for all
  using (is_household_editor(household_id)) with check (is_household_editor(household_id));
-- reminders
create policy "reminders read"  on reminders for select using (is_household_member(household_id));
create policy "reminders write" on reminders for all
  using (is_household_editor(household_id)) with check (is_household_editor(household_id));
-- shares (создаёт/видит семья; ПУБЛИЧНЫЙ доступ — только через RPC ниже)
create policy "shares read"  on shares for select using (is_household_member(household_id));
create policy "shares write" on shares for all
  using (is_household_editor(household_id)) with check (is_household_editor(household_id));
-- audit_log: читают члены; пишет только функция log_audit (прямой insert закрыт).
create policy "audit read" on audit_log for select using (is_household_member(household_id));
-- consents: читают члены; создаёт/отзывает editor/owner (user_id фиксирует, кто дал).
create policy "consents read"  on consents for select using (is_household_member(household_id));
create policy "consents write" on consents for all
  using (is_household_editor(household_id)) with check (is_household_editor(household_id));

-- =====================================================================
-- RPC
-- =====================================================================

-- Создать семью и сразу записать создателя владельцем (атомарно).
create or replace function create_household(p_name text)
returns uuid language plpgsql volatile security definer set search_path = public as $$
declare hid uuid;
begin
  if auth.uid() is null then raise exception 'not authenticated'; end if;
  insert into households(name, created_by) values (p_name, auth.uid()) returning id into hid;
  insert into household_members(household_id, user_id, role) values (hid, auth.uid(), 'owner');
  return hid;
end; $$;
grant execute on function create_household(text) to authenticated;

-- Единая точка записи аудита (actor = auth.uid()).
create or replace function log_audit(
  p_household uuid, p_action text,
  p_entity_type text default null, p_entity_id text default null,
  p_metadata jsonb default '{}'::jsonb)
returns void language sql security definer set search_path = public as $$
  insert into audit_log(household_id, actor_user_id, action, entity_type, entity_id, metadata)
  values (p_household, auth.uid(), p_action, p_entity_type, p_entity_id, coalesce(p_metadata,'{}'::jsonb));
$$;
grant execute on function log_audit(uuid,text,text,text,jsonb) to authenticated;

-- Публичный доступ по share-ссылке: валидирует срок/отзыв/лимит, инкрементит
-- счётчик, пишет аудит и отдаёт МИНИМУМ (allowlist) + пути файлов. Подписанные
-- URL генерит сервер приложения после успешного вызова (storage остаётся приватным).
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

-- Отозвать ссылку (только editor/owner семьи).
create or replace function revoke_share(p_share_id uuid)
returns void language sql volatile security definer set search_path = public as $$
  update shares set revoked_at = now()
  where id = p_share_id and is_household_editor(household_id);
$$;
grant execute on function revoke_share(uuid) to authenticated;

-- ---------------------------- Hardening (права на функции) ------------
-- Внутренние хелперы и пишущие RPC недоступны анонимам через PostgREST.
-- Публичной остаётся только get_shared_document (share-ссылки).
revoke execute on function
  current_user_household_ids(),
  is_household_member(uuid), is_household_editor(uuid), is_household_owner(uuid),
  create_household(text),
  log_audit(uuid, text, text, text, jsonb),
  revoke_share(uuid)
from public, anon;
grant execute on function
  current_user_household_ids(),
  is_household_member(uuid), is_household_editor(uuid), is_household_owner(uuid),
  create_household(text),
  log_audit(uuid, text, text, text, jsonb),
  revoke_share(uuid)
to authenticated;

-- =====================================================================
-- Storage (приватный bucket; signed URL генерит сервер)
-- =====================================================================
insert into storage.buckets (id, name, public)
values ('vault-files','vault-files', false)
on conflict (id) do nothing;

-- Файлы лежат по пути '<household_id>/...'; доступ — только членам этой семьи.
create policy "vault read files" on storage.objects for select
  using (bucket_id = 'vault-files'
         and (storage.foldername(name))[1]::uuid in (select current_user_household_ids()));
create policy "vault write files" on storage.objects for insert
  with check (bucket_id = 'vault-files'
         and (storage.foldername(name))[1]::uuid in (select current_user_household_ids()));
create policy "vault delete files" on storage.objects for delete
  using (bucket_id = 'vault-files'
         and (storage.foldername(name))[1]::uuid in (select current_user_household_ids()));

-- ПРИМЕЧАНИЯ ДЛЯ РЕАЛИЗАЦИИ:
--  • Доступ получателя по share-ссылке: сервер вызывает get_shared_document(token),
--    и для каждого storage_path создаёт КОРОТКИЙ signed URL (TTL минуты). Bucket
--    остаётся приватным; токен в URL — единственный «ключ».
--  • Медицина (record_kind='medical_analysis'/'prescription', category='medical') —
--    спец-категория ПДн: отдельное согласие, можно вынести в отдельную таблицу с
--    более строгим доступом и обязательным аудитом.
--  • Топ-чувствительные файлы (паспорт, св-во о рождении) — рассмотреть envelope-
--    шифрование на клиенте (ключ у пользователя), тогда сервер хранит только шифртекст.
--  • Включить 2FA в Supabase Auth; ограничить время жизни сессии.

-- =====================================================================
-- Приглашения в семью (link-based, без рассылки писем сервером)
-- =====================================================================
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

alter table invitations enable row level security;
create policy "inv read" on invitations for select using (is_household_member(household_id));
create policy "inv manage" on invitations for all
  using (is_household_owner(household_id)) with check (is_household_owner(household_id));

-- Инфо о приглашении по токену (приглашаемый ещё не член семьи → SECURITY DEFINER).
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

-- Принять приглашение: добавляет текущего пользователя в household_members.
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
  update invitations set accepted_at = now(), accepted_by = auth.uid()
    where id = inv.id;
  return inv.household_id;
end; $$;
revoke execute on function accept_invitation(text) from public, anon;
grant execute on function accept_invitation(text) to authenticated;

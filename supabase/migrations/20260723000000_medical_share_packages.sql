-- Медицинский пакет для врача: переводное резюме + неизменённые оригиналы.
-- Публичный доступ закрыт, пока владелец не проверил все резюме и не
-- опубликовал пакет (published_at). Существующие generic-пакеты сохраняют
-- прежнее поведение благодаря default now().

alter table share_packages
  add column if not exists package_type text not null default 'generic'
    check (package_type in ('generic', 'medical_doctor')),
  add column if not exists target_locale text
    check (target_locale is null or target_locale in ('ru', 'en', 'id', 'uz')),
  add column if not exists published_at timestamptz default now();

create table if not exists share_package_summaries (
  package_id          uuid not null references share_packages(id) on delete cascade,
  document_id         uuid not null references documents(id) on delete cascade,
  source_language     text not null default 'ru',
  target_locale       text not null default 'id',
  source_snapshot     jsonb not null default '{}'::jsonb,
  translated_title    text not null,
  translated_summary  text not null,
  key_facts           jsonb not null default '[]'::jsonb,
  uncertainty_notes   jsonb not null default '[]'::jsonb,
  model               text,
  status              text not null default 'draft'
    check (status in ('draft', 'approved')),
  reviewed_by         uuid,
  reviewed_at         timestamptz,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  primary key (package_id, document_id)
);

alter table share_package_summaries enable row level security;
grant select, insert, update, delete on table share_package_summaries
  to authenticated;

create policy "pkg summaries read" on share_package_summaries for select
  using (package_id in (
    select id from share_packages where private.is_household_member(household_id)
  ));
create policy "pkg summaries write" on share_package_summaries for all
  using (package_id in (
    select id from share_packages where private.is_household_editor(household_id)
  ))
  with check (package_id in (
    select id from share_packages where private.is_household_editor(household_id)
  ));

drop function if exists get_shared_package(text,text,text,text);
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
     or (p.package_type = 'medical_doctor' and p.published_at is null)
     or (p.package_type = 'medical_doctor' and not exists (
       select 1 from share_package_documents where package_id = p.id
     ))
     or (p.package_type = 'medical_doctor' and exists (
       select 1
       from share_package_documents spd
       left join share_package_summaries s
         on s.package_id = spd.package_id and s.document_id = spd.document_id
        and s.status = 'approved'
        and length(trim(s.translated_title)) > 0
        and length(trim(s.translated_summary)) > 0
       where spd.package_id = p.id and s.document_id is null
     ))
  then return null; end if;

  if p.password_hash is not null
     and (p_password_hash is null or p_password_hash <> p.password_hash)
  then return jsonb_build_object('locked', true); end if;

  update share_packages set view_count = view_count + 1 where id = p.id;

  select coalesce(jsonb_agg(
           jsonb_build_object(
             'id', d.id,
             'title', d.title,
             'category', d.category,
             'issuer', d.issuer,
             'issued_at', d.issued_at,
             'expires_at', d.expires_at,
             'summary', (
               select jsonb_build_object(
                 'translated_title', s.translated_title,
                 'translated_summary', s.translated_summary,
                 'key_facts', s.key_facts,
                 'uncertainty_notes', s.uncertainty_notes,
                 'source_language', s.source_language,
                 'target_locale', s.target_locale
               )
               from share_package_summaries s
               where s.package_id = p.id and s.document_id = d.id
                 and s.status = 'approved'
             ),
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
            jsonb_build_object('token', p_token, 'ip_hash', p_ip_hash,
                               'user_agent', p_user_agent, 'package_type', p.package_type));

  return jsonb_build_object(
    'title', p.title,
    'allow_download', p.allow_download,
    'watermark', p.watermark,
    'package_type', p.package_type,
    'target_locale', p.target_locale,
    'documents', docs
  );
end; $$;
revoke all on function get_shared_package(text,text,text,text) from public;
grant execute on function get_shared_package(text,text,text,text) to anon, authenticated;

-- =====================================================================
-- P2-4 (фаза 2): Документы сотрудника (трудовой договор, виза, разрешение,
-- сертификация) + напоминания работодателя об истекающих сроках — поверх
-- модели напоминаний фазы 1 (bucketKind/дедуп в TS-кроне). Привязаны к
-- канонической записи employment (P2-1).
--
-- Аддитивно и совместимо с Doki.id: новая таблица + bucket + RPC/функция
-- кандидатов; общих таблиц не трогаем.
--
-- План отката (rollback):
--   drop function if exists due_employment_document_candidates();
--   drop table if exists employment_reminder_sent;
--   drop table if exists employment_documents;
--   delete from storage.buckets where id = 'employment-docs';
--   (storage-политики empdocs_* удалить)

-- ── Таблица employment_documents ────────────────────────────────────
create table if not exists employment_documents (
  id             uuid primary key default gen_random_uuid(),
  employment_id  uuid not null references employments(id) on delete cascade,
  doc_type       text not null default 'other'
                   check (doc_type in ('contract','visa','permit','certification','other')),
  label          text not null,
  file_path      text not null,
  file_name      text not null,
  file_size      integer,
  expires_at     date,               -- срок действия (виза/сертификация/разрешение)
  uploaded_by    uuid references auth.users(id),
  uploaded_at    timestamptz not null default now()
);
create index if not exists employment_documents_employment_idx
  on employment_documents(employment_id);
create index if not exists employment_documents_expiry_idx
  on employment_documents(expires_at) where expires_at is not null;

alter table employment_documents enable row level security;

-- Чтение: сотрудник (своя запись) и компания — через видимость employment.
do $$ begin
  create policy "empdocs read via employment" on employment_documents for select
    using (employment_id in (select id from employments));
exception when duplicate_object then null; end $$;

-- Запись: только компания (владелец/рекрутёр). Сотрудник read-only.
do $$ begin
  create policy "empdocs company manage" on employment_documents for all
    using (employment_id in (
      select id from employments
      where company_id is not null and private.can_access_employer(company_id)
    ))
    with check (employment_id in (
      select id from employments
      where company_id is not null and private.can_access_employer(company_id)
    ));
exception when duplicate_object then null; end $$;

grant select, insert, update, delete on employment_documents to authenticated;

-- ── Storage: приватный bucket employment-docs (10MB, pdf/jpg/png) ────
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'employment-docs', 'employment-docs', false, 10485760,
  array['application/pdf','image/jpeg','image/png']
)
on conflict (id) do update set
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Путь файла: {employment_id}/{файл}. Загружает/удаляет — только компания
-- сотрудника; читают (подписывают) — компания и сам сотрудник (через RLS
-- employments в подзапросе).
do $$ begin
  create policy "empdocs upload" on storage.objects for insert
    with check (
      bucket_id = 'employment-docs'
      and (storage.foldername(name))[1]::uuid in (
        select id from employments
        where company_id is not null and private.can_access_employer(company_id)
      )
    );
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "empdocs read" on storage.objects for select
    using (
      bucket_id = 'employment-docs'
      and (storage.foldername(name))[1]::uuid in (select id from employments)
    );
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "empdocs delete" on storage.objects for delete
    using (
      bucket_id = 'employment-docs'
      and (storage.foldername(name))[1]::uuid in (
        select id from employments
        where company_id is not null and private.can_access_employer(company_id)
      )
    );
exception when duplicate_object then null; end $$;

-- ── Напоминания работодателя (поверх модели фазы 1) ─────────────────
-- Дедуп отправленных писем (пишет только cron/service_role).
create table if not exists employment_reminder_sent (
  document_id uuid not null references employment_documents(id) on delete cascade,
  expires_on  date not null,
  kind        text not null,   -- 'd30' | 'd7' | 'd1'
  email       text not null,
  sent_at     timestamptz not null default now(),
  primary key (document_id, expires_on, kind, email)
);
alter table employment_reminder_sent enable row level security;
-- политик нет: доступ только у service_role (bypass RLS).

-- Кандидаты авто-напоминаний: документы сотрудников с expires_at в ближайшие
-- 30 дней + email работодателя. Порог/дедуп считает cron в TS (тестируемо).
create or replace function due_employment_document_candidates()
returns table (
  document_id   uuid,
  title         text,
  doc_type      text,
  expires_on    date,
  employment_id uuid,
  company_name  text,
  email         text
)
language sql security definer set search_path = public, auth as $$
  select ed.id, ed.label, ed.doc_type, ed.expires_at::date, ed.employment_id,
         e.company_name, coalesce(ep.contact_email, u.email)
  from employment_documents ed
  join employments e on e.id = ed.employment_id
  join employer_profiles ep on ep.id = e.company_id
  join auth.users u on u.id = ep.user_id
  where ed.expires_at is not null
    and e.status = 'active'
    and ed.expires_at::date >= current_date
    and ed.expires_at::date <= (current_date + 30)
    and coalesce(ep.contact_email, u.email) is not null;
$$;
revoke all on function due_employment_document_candidates() from public, anon, authenticated;
grant execute on function due_employment_document_candidates() to service_role;

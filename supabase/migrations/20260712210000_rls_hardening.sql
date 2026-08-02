-- PR-13 (hardening общих с Doki.id таблиц — по явной санкции владельца).
-- Проверено: в коде doki.help НЕТ прямых insert/update/delete в applications/
-- application_documents/application_answers — все записи идут через SECURITY
-- DEFINER RPC (submit_application, update_application_status, reject_application,
-- withdraw_application, add_application_note, request_application_documents,
-- run_application_retention). Поэтому отзыв табличных грантов безопасен для
-- приложения: RPC работают от владельца (bypass RLS/grants).
--
-- ПРЕДПОСЫЛКА про Doki.id: предполагается, что Doki.id тоже пишет эти таблицы
-- ТОЛЬКО через те же RPC. Если Doki.id делает прямые insert/update — откатить
-- блок «grants» (см. план отката).
--
-- План отката:
--   grant insert, update, delete on applications, application_documents,
--     application_answers to anon;
--   (политики member-read и атомарность view_count безопасно оставить)

-- ── 1. Анти-абьюз: анонимная запись только через RPC ────────────────
-- Закрывает главный вектор — прямой POST ботом в /rest/v1/applications под
-- ключом anon, мимо rate-limit/Turnstile (submit_application). Отзываем
-- ТОЛЬКО у anon: публичная подача Doki.id тоже идёт через тот же SECURITY
-- DEFINER RPC (bypass grants), поэтому риск поломки Doki.id ~ нулевой.
-- authenticated-гранты НЕ трогаем (там мог бы быть прямой доступ Doki.id);
-- прямая запись авторизованного — меньший вектор (нужен аккаунт), а
-- cross-tenant блокирует WITH CHECK ниже. select сохранён для RLS-чтения.
revoke insert, update, delete on applications          from anon;
revoke insert, update, delete on application_documents from anon;
revoke insert, update, delete on application_answers   from anon;

-- Defense-in-depth: даже если грант вернут, UPDATE-политике добавляем
-- WITH CHECK (нельзя переназначить отклик на чужую вакансию).
drop policy if exists "employers update application status" on applications;
create policy "employers update application status" on applications for update
  using (vacancy_id in (
    select id from vacancies where employer_id in (
      select id from employer_profiles where user_id = (select auth.uid())
    )
  ))
  with check (vacancy_id in (
    select id from vacancies where employer_id in (
      select id from employer_profiles where user_id = (select auth.uid())
    )
  ));

-- ── 2. Доступ рекрутёров (company_members) на ЧТЕНИЕ — аддитивно ─────
-- Политики permissive (OR), поэтому новые policy только РАСШИРЯЮТ доступ,
-- не затрагивая существующие owner-политики. Управление (создание/статусы)
-- остаётся у владельца (RPC гейтят на employer_profiles.user_id).
create or replace function private.can_access_employer(p_employer_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from employer_profiles ep
    where ep.id = p_employer_id and ep.user_id = auth.uid()
  ) or exists (
    select 1 from company_members cm
    where cm.employer_profile_id = p_employer_id and cm.user_id = auth.uid()
  );
$$;
grant execute on function private.can_access_employer(uuid) to authenticated;

create policy "vacancies member read" on vacancies for select
  using (private.can_access_employer(employer_id));

create policy "applications member read" on applications for select
  using (vacancy_id in (
    select v.id from vacancies v where private.can_access_employer(v.employer_id)
  ));

create policy "app_docs member read" on application_documents for select
  using (application_id in (
    select a.id from applications a
    join vacancies v on v.id = a.vacancy_id
    where private.can_access_employer(v.employer_id)
  ));

create policy "app_answers member read" on application_answers for select
  using (application_id in (
    select a.id from applications a
    join vacancies v on v.id = a.vacancy_id
    where private.can_access_employer(v.employer_id)
  ));

create policy "app_status_log member read" on application_status_log for select
  using (application_id in (
    select a.id from applications a
    join vacancies v on v.id = a.vacancy_id
    where private.can_access_employer(v.employer_id)
  ));

create policy "app_events member read" on application_events for select
  using (application_id in (
    select a.id from applications a
    join vacancies v on v.id = a.vacancy_id
    where private.can_access_employer(v.employer_id)
  ));

-- ── 3. Атомарный view_count (устраняет TOCTOU превышения max_views) ──
drop function if exists get_shared_document(text,text,text,text);
create function get_shared_document(
  p_token text,
  p_password_hash text default null,
  p_ip_hash text default null,
  p_user_agent text default null
)
returns jsonb language plpgsql volatile security definer set search_path = public as $$
declare s shares; doc documents; files jsonb; v_new int;
begin
  select * into s from shares where token = p_token;
  if not found or s.revoked_at is not null or s.expires_at < now() then return null; end if;
  if s.password_hash is not null
     and (p_password_hash is null or p_password_hash <> s.password_hash)
  then return jsonb_build_object('locked', true); end if;

  -- Атомарно: инкремент только если лимит не достигнут.
  update shares set view_count = view_count + 1
    where id = s.id and (s.max_views is null or view_count < s.max_views)
    returning view_count into v_new;
  if not found then return null; end if;

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

drop function if exists get_shared_package(text,text,text,text);
create function get_shared_package(
  p_token text,
  p_password_hash text default null,
  p_ip_hash text default null,
  p_user_agent text default null
)
returns jsonb language plpgsql volatile security definer set search_path = public as $$
declare p share_packages; docs jsonb; v_new int;
begin
  select * into p from share_packages where token = p_token;
  if not found or p.revoked_at is not null or p.expires_at < now() then return null; end if;
  if p.password_hash is not null
     and (p_password_hash is null or p_password_hash <> p.password_hash)
  then return jsonb_build_object('locked', true); end if;

  update share_packages set view_count = view_count + 1
    where id = p.id and (p.max_views is null or view_count < p.max_views)
    returning view_count into v_new;
  if not found then return null; end if;

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
    'title', p.title, 'allow_download', p.allow_download, 'watermark', p.watermark,
    'documents', docs
  );
end; $$;
grant execute on function get_shared_package(text,text,text,text) to anon, authenticated;

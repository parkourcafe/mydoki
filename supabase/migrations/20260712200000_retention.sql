-- PR-11 (фаза 1D): автообезличивание отклонённых откликов по сроку хранения
-- компании (employer_profiles.retention_months, дефолт 12). Личные документы
-- кандидата в его vault не трогаются — обезличивается только сторона отклика.
-- Аддитивно и совместимо с Doki.id.
--
-- План отката: drop function run_application_retention();
--   alter table applications drop column if exists anonymized_at;

alter table applications add column if not exists anonymized_at timestamptz;

-- Возвращает {count, files:[...]} и обезличивает отклонённые отклики старше
-- срока хранения: чистит PII-поля, удаляет ответы и метаданные документов.
-- Пути файлов возвращаются, чтобы cron удалил их из storage.
create or replace function run_application_retention()
returns jsonb language plpgsql volatile security definer set search_path = public as $$
declare v_ids uuid[]; v_files jsonb;
begin
  select array_agg(a.id) into v_ids
  from applications a
  join vacancies v on v.id = a.vacancy_id
  join employer_profiles ep on ep.id = v.employer_id
  where a.state = 'rejected'
    and a.anonymized_at is null
    and a.updated_at < now() - make_interval(months => coalesce(ep.retention_months, 12));

  if v_ids is null then return jsonb_build_object('count', 0, 'files', '[]'::jsonb); end if;

  select coalesce(jsonb_agg(file_path), '[]'::jsonb) into v_files
  from application_documents where application_id = any(v_ids);

  delete from application_answers where application_id = any(v_ids);
  delete from application_documents where application_id = any(v_ids);
  update applications
    set full_name = '—', whatsapp = '', email = null, anonymized_at = now()
    where id = any(v_ids);

  return jsonb_build_object('count', array_length(v_ids, 1), 'files', v_files);
end; $$;
revoke all on function run_application_retention() from public, anon, authenticated;
grant execute on function run_application_retention() to service_role;

-- =====================================================================
-- §2.2 Лимит по телефону: не более 3 откликов с одного номера за 24 часа
-- (кросс-вакансийно). Дополняет существующий IP-лимит (5/час) и анти-дубли
-- (UNIQUE vacancy_id, whatsapp). Функция пересобрана ПОВЕРХ живой версии из
-- прода — добавлена только проверка телефона; остальное без изменений.
-- Общая БД с Doki.id — правка совместима с обоими приложениями.
-- =====================================================================

create index if not exists idx_applications_whatsapp_created
  on applications (whatsapp, created_at desc);

create or replace function public.submit_application(
  p_application_id uuid, p_slug text, p_full_name text, p_whatsapp text,
  p_email text, p_consent_text text,
  p_answers jsonb default '[]'::jsonb, p_documents jsonb default '[]'::jsonb,
  p_source text default 'direct'::text, p_ip_hash text default null::text,
  p_user_id uuid default null::uuid
) returns jsonb language plpgsql security definer set search_path to 'public'
as $function$
declare v_vac vacancies; v_token text; v_recent int; v_emp_email text; rec jsonb;
begin
  select * into v_vac from vacancies where slug = p_slug and status = 'active';
  if not found then raise exception 'vacancy not found'; end if;
  select contact_email into v_emp_email from employer_profiles where id = v_vac.employer_id;
  if coalesce(trim(p_full_name),'') = '' then raise exception 'full_name required'; end if;
  if coalesce(trim(p_whatsapp),'') = '' then raise exception 'whatsapp required'; end if;
  if coalesce(trim(p_consent_text),'') = '' then raise exception 'consent required'; end if;

  -- IP-лимит: не более 5 откликов с одного IP за час.
  if p_ip_hash is not null then
    select count(*) into v_recent from applications
    where ip_hash = p_ip_hash and created_at > now() - interval '1 hour';
    if v_recent >= 5 then raise exception 'rate_limited'; end if;
  end if;

  -- Дубликат: если этот номер уже откликался на эту вакансию — вернуть его токен.
  select access_token into v_token from applications
  where vacancy_id = v_vac.id and whatsapp = trim(p_whatsapp) limit 1;
  if v_token is not null then
    return jsonb_build_object('duplicate', true, 'access_token', v_token);
  end if;

  -- §2.2 Телефон-лимит: не более 3 откликов с одного номера за 24 часа.
  -- Дубликаты уже отсеяны выше, поэтому считаем только новые отклики.
  select count(*) into v_recent from applications
  where whatsapp = trim(p_whatsapp) and created_at > now() - interval '24 hours';
  if v_recent >= 3 then raise exception 'rate_limit_phone'; end if;

  insert into applications(
    id, vacancy_id, full_name, whatsapp, email, consent_text, user_id, source, ip_hash
  ) values (
    p_application_id, v_vac.id, trim(p_full_name), trim(p_whatsapp),
    nullif(trim(coalesce(p_email,'')),''), p_consent_text, coalesce(p_user_id, auth.uid()),
    case when p_source in ('wa','ig','qr','direct','other') then p_source else 'direct' end, p_ip_hash
  ) returning access_token into v_token;

  for rec in select * from jsonb_array_elements(coalesce(p_documents,'[]'::jsonb)) loop
    insert into application_documents(application_id, document_type, document_label, file_path, file_name, file_size)
    values (p_application_id, coalesce(rec->>'type','other'),
      coalesce(rec->>'label', rec->>'type', 'Document'), rec->>'path',
      coalesce(rec->>'name','file'), nullif(rec->>'size','')::int);
  end loop;

  for rec in select * from jsonb_array_elements(coalesce(p_answers,'[]'::jsonb)) loop
    insert into application_answers(application_id, question, question_type, answer)
    values (p_application_id, coalesce(rec->>'question',''),
      coalesce(rec->>'type','text'), coalesce(rec->>'answer',''));
  end loop;

  insert into application_status_log(application_id, old_status, new_status)
  values (p_application_id, null, 'new');

  return jsonb_build_object('duplicate', false, 'application_id', p_application_id,
    'access_token', v_token, 'vacancy_id', v_vac.id, 'employer_email', v_emp_email,
    'vacancy_title', v_vac.title, 'company_name', v_vac.company_name);
end; $function$;

grant execute on function submit_application(uuid,text,text,text,text,text,jsonb,jsonb,text,text,uuid) to anon, authenticated;

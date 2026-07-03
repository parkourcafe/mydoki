-- =====================================================================
-- T4 — Employer verification + vacancy reports.
-- Additive/idempotent. Код верификации генерится и хэшируется на сервере
-- (Node sha256), в БД хранится/сверяется только hex-хэш — pgcrypto не нужен.
-- =====================================================================

-- ---------------------- employer_profiles columns ---------------------
alter table employer_profiles
  add column if not exists verified_at timestamptz,
  add column if not exists verification_channel text,
  add column if not exists verification_code_hash text,
  add column if not exists verification_expires_at timestamptz,
  add column if not exists verification_attempts int not null default 0;

do $$ begin
  alter table employer_profiles add constraint employer_verification_channel_check
    check (verification_channel in ('email','whatsapp'));
exception when duplicate_object then null; end $$;

-- ---------------------------- vacancy_reports -------------------------
create table if not exists vacancy_reports (
  id uuid primary key default gen_random_uuid(),
  vacancy_id uuid not null references vacancies(id) on delete cascade,
  reason text not null check (reason in ('scam','data_collection','fake','other')),
  comment text,
  reporter_contact text,
  ip_hash text not null,
  created_at timestamptz not null default now()
);
create index if not exists idx_vacancy_reports_vacancy on vacancy_reports(vacancy_id);
create index if not exists idx_vacancy_reports_ip_created on vacancy_reports(ip_hash, created_at);
alter table vacancy_reports enable row level security;
-- Намеренно НЕТ публичных политик: запись — через RPC ниже, чтение — service role.

-- ---------------------- verification RPCs -----------------------------
-- Сохранить хэш кода + срок (сбрасывает попытки). Код/хэш готовит сервер.
create or replace function set_employer_verification(
  p_code_hash text, p_expires_at timestamptz
) returns void language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then raise exception 'not authenticated'; end if;
  update employer_profiles
     set verification_code_hash = p_code_hash,
         verification_expires_at = p_expires_at,
         verification_attempts = 0,
         updated_at = now()
   where user_id = auth.uid();
  if not found then raise exception 'no employer profile'; end if;
end; $$;
grant execute on function set_employer_verification(text,timestamptz) to authenticated;

-- Подтвердить код по хэшу. attempts<5, не истёк, совпал → verified.
create or replace function confirm_employer_verification(p_code_hash text)
returns boolean language plpgsql security definer set search_path = public as $$
declare ep employer_profiles;
begin
  if auth.uid() is null then raise exception 'not authenticated'; end if;
  select * into ep from employer_profiles where user_id = auth.uid();
  if not found then raise exception 'no employer profile'; end if;
  if ep.verified_at is not null then return true; end if;

  if coalesce(ep.verification_attempts,0) >= 5 then raise exception 'TOO_MANY_ATTEMPTS'; end if;
  if ep.verification_expires_at is null or ep.verification_expires_at < now() then
    raise exception 'CODE_EXPIRED';
  end if;

  if ep.verification_code_hash is not null and ep.verification_code_hash = p_code_hash then
    update employer_profiles
       set verified_at = now(), verification_channel = 'email',
           verification_code_hash = null, updated_at = now()
     where user_id = auth.uid();
    return true;
  end if;

  update employer_profiles
     set verification_attempts = coalesce(verification_attempts,0) + 1, updated_at = now()
   where user_id = auth.uid();
  return false;
end; $$;
grant execute on function confirm_employer_verification(text) to authenticated;

-- ---------------------- create_vacancy gate ---------------------------
-- Тот же интерфейс + первая проверка: работодатель должен быть verified.
create or replace function create_vacancy(
  p_title text,
  p_company_name text,
  p_location text default null,
  p_salary_range text default null,
  p_schedule text default null,
  p_description text default null,
  p_urgency text default 'normal',
  p_closes_at timestamptz default null,
  p_required_documents jsonb default '[]',
  p_screening_questions jsonb default '[]'
) returns jsonb language plpgsql volatile security definer set search_path = public as $$
declare
  v_employer uuid;
  v_base text;
  v_slug text;
  v_n int := 1;
  v_id uuid;
begin
  if auth.uid() is null then raise exception 'not authenticated'; end if;

  select id into v_employer from employer_profiles where user_id = auth.uid();
  if v_employer is null then raise exception 'no employer profile'; end if;

  if (select verified_at from employer_profiles where user_id = auth.uid()) is null then
    raise exception 'EMPLOYER_NOT_VERIFIED';
  end if;

  v_base := private.career_slugify(p_title || '-' || p_company_name);
  if v_base is null or v_base = '' then v_base := 'vacancy'; end if;
  v_slug := v_base;
  while exists (select 1 from vacancies where slug = v_slug) loop
    v_n := v_n + 1;
    v_slug := v_base || '-' || v_n;
  end loop;

  insert into vacancies(
    employer_id, title, slug, company_name, location, salary_range, schedule,
    description, urgency, closes_at, required_documents, screening_questions
  ) values (
    v_employer, p_title, v_slug, p_company_name, p_location, p_salary_range,
    p_schedule, p_description,
    case when p_urgency in ('normal','hiring_now') then p_urgency else 'normal' end,
    p_closes_at, coalesce(p_required_documents,'[]'::jsonb),
    coalesce(p_screening_questions,'[]'::jsonb)
  ) returning id into v_id;

  return jsonb_build_object('id', v_id, 'slug', v_slug);
end; $$;
grant execute on function create_vacancy(text,text,text,text,text,text,text,timestamptz,jsonb,jsonb) to authenticated;

-- Grandfathering: у кого уже есть вакансии — считаем подтверждёнными.
update employer_profiles set verified_at = now(), verification_channel = 'email'
where verified_at is null and id in (select distinct employer_id from vacancies);

-- ---------------------- report_vacancy RPC ----------------------------
create or replace function report_vacancy(
  p_slug text, p_reason text, p_comment text, p_contact text, p_ip_hash text
) returns jsonb language plpgsql security definer set search_path = public as $$
declare v_vac vacancies; v_recent int; v_distinct int;
begin
  select * into v_vac from vacancies where slug = p_slug;
  if not found then return jsonb_build_object('not_found', true); end if;
  if p_reason not in ('scam','data_collection','fake','other') then p_reason := 'other'; end if;

  -- Лимит: не более 3 жалоб в сутки с одного ip_hash.
  select count(*) into v_recent from vacancy_reports
   where ip_hash = p_ip_hash and created_at > now() - interval '1 day';
  if v_recent >= 3 then return jsonb_build_object('rate_limited', true); end if;

  insert into vacancy_reports(vacancy_id, reason, comment, reporter_contact, ip_hash)
  values (v_vac.id, p_reason, nullif(trim(coalesce(p_comment,'')),''),
          nullif(trim(coalesce(p_contact,'')),''), p_ip_hash);

  -- Порог: ≥3 разных ip_hash → авто-пауза активной вакансии.
  select count(distinct ip_hash) into v_distinct from vacancy_reports where vacancy_id = v_vac.id;
  if v_distinct >= 3 and v_vac.status = 'active' then
    update vacancies set status = 'paused' where id = v_vac.id;
    return jsonb_build_object('ok', true, 'paused', true);
  end if;

  return jsonb_build_object('ok', true, 'paused', false);
end; $$;
grant execute on function report_vacancy(text,text,text,text,text) to anon, authenticated;

-- ---------------------- apply_vacancy_meta RPC ------------------------
-- Публичная мета для apply-страницы: статус (виден даже для paused) +
-- boolean verified. Никаких таймстемпов наружу.
create or replace function apply_vacancy_meta(p_slug text)
returns jsonb language sql security definer set search_path = public stable as $$
  select case when v.id is null then null else jsonb_build_object(
    'status', v.status,
    'verified', (ep.verified_at is not null)
  ) end
  from vacancies v
  left join employer_profiles ep on ep.id = v.employer_id
  where v.slug = p_slug;
$$;
grant execute on function apply_vacancy_meta(text) to anon, authenticated;

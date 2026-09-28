-- Домен подтверждённой почты и бейдж на странице отклика
-- (миграция 20260928140000_employer_verified_domain):
--   1. после ввода кода домен адреса, на который он ушёл, попадает в
--      employer_profiles.domains — и кандидат, скрывший этот домен, не виден
--      организации в Talent Pool; блокировка по домену тоже срабатывает;
--   2. публичная почта (gmail) домена не даёт, но работодатель остаётся
--      подтверждённым: публикует вакансию и видит Talent Pool;
--   3. без contact_email домен берётся из email аккаунта (auth.email());
--   4. смена contact_email между запросом кода и его вводом не подменяет
--      подтверждённый адрес;
--   5. verification_email клиент не задаёт и не меняет; повторный запрос кода
--      подтверждённым профилем ничего не меняет;
--   6. apply_vacancy_meta: verified только при действующем подтверждении и
--      совпадении названия вакансии с названием профиля; verified_domain —
--      домен организации или null.
-- Всё в одной транзакции с откатом; нарушение → исключение.

begin;

insert into auth.users(id, email) values
  ('d0d0d0d0-c0c0-4000-8000-000000000001', 'candidate@domain.test'),
  ('d0d0d0d0-e0e0-4000-8000-000000000001', 'owner@nyata.co.id'),
  ('d0d0d0d0-e0e0-4000-8000-000000000002', 'owner2@gmail.com'),
  ('d0d0d0d0-e0e0-4000-8000-000000000003', 'owner@kerja.co.id'),
  ('d0d0d0d0-e0e0-4000-8000-000000000004', 'owner@lama.co.id')
on conflict (id) do nothing;

set local role authenticated;

-- ── Кандидат скрывается от домена nyata.co.id ───────────────────────
select set_config('request.jwt.claims',
  '{"sub":"d0d0d0d0-c0c0-4000-8000-000000000001"}', true);
insert into resumes(user_id, full_name, profession, current_location, seniority,
                    search_intent, lifecycle, last_confirmed_at)
values ('d0d0d0d0-c0c0-4000-8000-000000000001', 'Dewi Test', 'Accountant',
        'Jakarta, Indonesia', 'middle', 'open', 'ready', now());
select set_profile_visibility('confidential_pool', true,
  '["nyata.co.id"]'::jsonb, '[]'::jsonb);
select grant_purpose_authorization(
  'talent_pool_discovery', 'consent', 'talent-pool-2026-08',
  '["profession","seniority","current_location"]'::jsonb,
  'verified_employers', null,
  'Разрешаю проверенным работодателям находить мой обезличенный профиль.',
  now() + interval '180 days');
select set_talent_pool_membership('active', now() + interval '180 days');

-- ── 5a. verification_email клиенту недоступен ───────────────────────
select set_config('request.jwt.claims',
  '{"sub":"d0d0d0d0-e0e0-4000-8000-000000000001","email":"owner@nyata.co.id"}', true);
do $$ begin
  begin
    insert into employer_profiles(user_id, company_name, contact_email, verification_email)
    values ('d0d0d0d0-e0e0-4000-8000-000000000001', 'PT Nyata', 'hr@nyata.co.id',
            'hr@nyata.co.id');
  exception when others then
    if sqlerrm <> 'EMPLOYER_PROTECTED_FIELDS' then raise; end if;
    return;
  end;
  raise exception 'FAIL: клиент вставил профиль с verification_email';
end $$;

-- ── 1. Корпоративная почта → домен в domains ────────────────────────
insert into employer_profiles(user_id, company_name, contact_email)
values ('d0d0d0d0-e0e0-4000-8000-000000000001', 'PT Nyata', 'hr@nyata.co.id');
select set_employer_verification('hash-e1', now() + interval '15 minutes');

do $$ begin
  begin
    update employer_profiles set verification_email = 'x@nyata.co.id'
     where user_id = auth.uid();
  exception when others then
    if sqlerrm <> 'EMPLOYER_PROTECTED_FIELDS' then raise; end if;
    return;
  end;
  raise exception 'FAIL: клиент изменил verification_email';
end $$;

do $$
declare ep employer_profiles;
begin
  if not confirm_employer_verification('hash-e1') then
    raise exception 'FAIL: верный код не принят';
  end if;
  select * into ep from employer_profiles where user_id = auth.uid();
  if ep.verified_at is null then raise exception 'FAIL: verified_at не поставлен'; end if;
  if ep.domains <> '["nyata.co.id"]'::jsonb then
    raise exception 'FAIL: домен подтверждённой почты не попал в domains: %', ep.domains;
  end if;
  if ep.verification_email <> 'hr@nyata.co.id' then
    raise exception 'FAIL: verification_email = %', ep.verification_email;
  end if;
  -- Кандидат скрыл домен, а не название — раньше такой список не срабатывал.
  if jsonb_array_length(talent_pool_candidates(50)) <> 0 then
    raise exception 'FAIL: организация с подтверждённым доменом видит кандидата, который скрыл этот домен';
  end if;
end $$;

-- ── 5b. Повторный запрос кода подтверждённым профилем — no-op ──────
select set_employer_verification('hash-again', now() + interval '1 hour');
do $$ begin
  if exists (select 1 from employer_profiles
              where user_id = auth.uid()
                and (verification_expires_at is not null
                     or verification_code_hash is not null
                     or verification_email <> 'hr@nyata.co.id')) then
    raise exception 'FAIL: подтверждённому профилю выдан новый код (срок/хеш/адрес изменились)';
  end if;
end $$;

-- ── 2. Публичная почта: подтверждение действует, домена нет ─────────
select set_config('request.jwt.claims',
  '{"sub":"d0d0d0d0-e0e0-4000-8000-000000000002","email":"owner2@gmail.com"}', true);
insert into employer_profiles(user_id, company_name, contact_email)
values ('d0d0d0d0-e0e0-4000-8000-000000000002', 'PT Surel Umum', 'hr.surel@gmail.com');
select set_employer_verification('hash-e2', now() + interval '15 minutes');
do $$
declare ep employer_profiles;
begin
  perform confirm_employer_verification('hash-e2');
  select * into ep from employer_profiles where user_id = auth.uid();
  if ep.verified_at is null then
    raise exception 'FAIL: работодатель с публичной почтой не подтверждён';
  end if;
  if ep.domains <> '[]'::jsonb then
    raise exception 'FAIL: публичный почтовый домен записан как домен организации: %', ep.domains;
  end if;
  -- Отсутствие домена не делает работодателя недействительным.
  perform create_vacancy('Kasir', 'PT Surel Umum');
  if jsonb_array_length(talent_pool_candidates(50)) <> 1 then
    raise exception 'FAIL: подтверждённый работодатель без домена не видит Talent Pool';
  end if;
end $$;

-- ── 3. Без contact_email — домен из email аккаунта ──────────────────
select set_config('request.jwt.claims',
  '{"sub":"d0d0d0d0-e0e0-4000-8000-000000000003","email":"owner@kerja.co.id"}', true);
insert into employer_profiles(user_id, company_name)
values ('d0d0d0d0-e0e0-4000-8000-000000000003', 'PT Kerja Sama');
select set_employer_verification('hash-e3', now() + interval '15 minutes');
do $$ begin
  perform confirm_employer_verification('hash-e3');
  if (select domains from employer_profiles where user_id = auth.uid())
     <> '["kerja.co.id"]'::jsonb then
    raise exception 'FAIL: без contact_email домен из auth.email() не записан';
  end if;
end $$;

-- ── 4. Смена contact_email между запросом и вводом кода ─────────────
select set_config('request.jwt.claims',
  '{"sub":"d0d0d0d0-e0e0-4000-8000-000000000004","email":"owner@lama.co.id"}', true);
insert into employer_profiles(user_id, company_name, contact_email)
values ('d0d0d0d0-e0e0-4000-8000-000000000004', 'PT Ganti', 'hr@lama.co.id');
select set_employer_verification('hash-e4', now() + interval '15 minutes');
-- Как saveCompanySettings: прямой update contact_email разрешён.
update employer_profiles set contact_email = 'hr@baru.co.id', updated_at = now()
 where user_id = auth.uid();
do $$ begin
  perform confirm_employer_verification('hash-e4');
  if (select domains from employer_profiles where user_id = auth.uid())
     <> '["lama.co.id"]'::jsonb then
    raise exception 'FAIL: домен взят из адреса, на который код не отправлялся: %',
      (select domains from employer_profiles where user_id = auth.uid());
  end if;
end $$;

-- ── 1b. Блокировка по домену теперь срабатывает ─────────────────────
select set_config('request.jwt.claims',
  '{"sub":"d0d0d0d0-c0c0-4000-8000-000000000001"}', true);
select set_profile_visibility('confidential_pool', false, '[]'::jsonb, '[]'::jsonb);
select block_organization(null, 'NYATA.co.id');

select set_config('request.jwt.claims',
  '{"sub":"d0d0d0d0-e0e0-4000-8000-000000000001","email":"owner@nyata.co.id"}', true);
do $$ begin
  if jsonb_array_length(talent_pool_candidates(50)) <> 0 then
    raise exception 'FAIL: организация с заблокированным доменом видит кандидата';
  end if;
end $$;
select set_config('request.jwt.claims',
  '{"sub":"d0d0d0d0-e0e0-4000-8000-000000000003","email":"owner@kerja.co.id"}', true);
do $$ begin
  if jsonb_array_length(talent_pool_candidates(50)) <> 1 then
    raise exception 'FAIL: блокировка домена задела другую организацию';
  end if;
end $$;

-- ── 6. apply_vacancy_meta ───────────────────────────────────────────
select set_config('request.jwt.claims',
  '{"sub":"d0d0d0d0-e0e0-4000-8000-000000000001","email":"owner@nyata.co.id"}', true);
select set_config('test.slug_same',
  create_vacancy('Akuntan', 'PT Nyata') ->> 'slug', true);
select set_config('test.slug_other',
  create_vacancy('Akuntan', 'Perusahaan Lain') ->> 'slug', true);

select set_config('request.jwt.claims',
  '{"sub":"d0d0d0d0-e0e0-4000-8000-000000000002","email":"owner2@gmail.com"}', true);
select set_config('test.slug_gmail',
  create_vacancy('Kasir', 'PT Surel Umum') ->> 'slug', true);

-- Страница отклика читает мету анонимно.
select set_config('request.jwt.claims', '{}', true);
set local role anon;
do $$
declare m jsonb;
begin
  m := apply_vacancy_meta(current_setting('test.slug_same'));
  if (m ->> 'verified')::boolean is distinct from true
     or m ->> 'verified_domain' is distinct from 'nyata.co.id' then
    raise exception 'FAIL: вакансия под названием профиля без бейджа/домена: %', m;
  end if;

  m := apply_vacancy_meta(current_setting('test.slug_other'));
  if (m ->> 'verified')::boolean is distinct from false then
    raise exception 'FAIL: бейдж стоит рядом с названием, которого нет в профиле: %', m;
  end if;

  m := apply_vacancy_meta(current_setting('test.slug_gmail'));
  if (m ->> 'verified')::boolean is distinct from true
     or m ->> 'verified_domain' is not null then
    raise exception 'FAIL: работодатель с публичной почтой: %', m;
  end if;
end $$;

-- Отзыв подтверждения снимает бейдж (раньше apply_vacancy_meta его не видела).
reset role;
update employer_profiles set verification_revoked_at = now()
 where user_id = 'd0d0d0d0-e0e0-4000-8000-000000000001';
set local role anon;
do $$
declare m jsonb;
begin
  m := apply_vacancy_meta(current_setting('test.slug_same'));
  if (m ->> 'verified')::boolean is distinct from false
     or m ->> 'verified_domain' is not null then
    raise exception 'FAIL: у отозванного работодателя остался бейдж: %', m;
  end if;
end $$;

rollback;

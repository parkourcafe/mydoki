-- «Скрыть от текущего работодателя» не должно зависеть от полей, которые
-- работодатель правит сам (миграция 20260928130000_talent_pool_current_employer_match):
--   1. контроль: посторонняя подтверждённая организация кандидата видит —
--      иначе проверки «не видит» ниже прошли бы впустую;
--   2. работодатель из списка кандидата не видит его (как и раньше);
--   3. переименование после подтверждения не открывает профиль: сверка
--      идёт и по названию, зафиксированному при подтверждении;
--   4. этот снимок названия работодатель не может ни задать, ни изменить;
--   5. организация, где кандидат числится сотрудником (employments.company_id,
--      status = active), не видит его, даже если он не вписал её название;
--   6. флаг hide_current_employer = false по-прежнему отключает скрытие.
-- Всё в одной транзакции с откатом; нарушение → исключение.

begin;

insert into auth.users(id, email) values
  ('c1c1c1c1-c1c1-c1c1-c1c1-c1c1c1c1c1c1', 'candidate@current.test'),
  ('e1e1e1e1-e1e1-e1e1-e1e1-e1e1e1e1e1e1', 'hr@nyata.test'),
  ('e2e2e2e2-e2e2-e2e2-e2e2-e2e2e2e2e2e2', 'hr@kerja.test'),
  ('e3e3e3e3-e3e3-e3e3-e3e3-e3e3e3e3e3e3', 'hr@lain.test')
on conflict (id) do nothing;

set local role authenticated;

-- ── Кандидат ────────────────────────────────────────────────────────
select set_config('request.jwt.claims',
  '{"sub":"c1c1c1c1-c1c1-c1c1-c1c1-c1c1c1c1c1c1"}', true);
insert into resumes(user_id, full_name, profession, current_location, seniority,
                    search_intent, lifecycle, last_confirmed_at)
values ('c1c1c1c1-c1c1-c1c1-c1c1-c1c1c1c1c1c1', 'Sari Test', 'Accountant',
        'Jakarta, Indonesia', 'middle', 'open', 'ready', now());
select set_profile_visibility('confidential_pool', true,
  '["PT Nyata"]'::jsonb, '[]'::jsonb);
select grant_purpose_authorization(
  'talent_pool_discovery', 'consent', 'talent-pool-2026-08',
  '["profession","seniority","current_location"]'::jsonb,
  'verified_employers', null,
  'Разрешаю проверенным работодателям находить мой обезличенный профиль.',
  now() + interval '180 days');
select set_talent_pool_membership('active', now() + interval '180 days');

-- ── Работодатели проходят подтверждение кодом, как в продукте ───────
-- set_/confirm_employer_verification вызываются от имени работодателя;
-- хеш кода в тесте — произвольная строка.

select set_config('request.jwt.claims',
  '{"sub":"e1e1e1e1-e1e1-e1e1-e1e1-e1e1e1e1e1e1"}', true);
insert into employer_profiles(user_id, company_name, contact_email)
values ('e1e1e1e1-e1e1-e1e1-e1e1-e1e1e1e1e1e1', 'PT Nyata', 'hr@nyata.test');
select set_employer_verification('hash-e1', now() + interval '15 minutes');
select confirm_employer_verification('hash-e1');

select set_config('request.jwt.claims',
  '{"sub":"e2e2e2e2-e2e2-e2e2-e2e2-e2e2e2e2e2e2"}', true);
insert into employer_profiles(user_id, company_name, contact_email)
values ('e2e2e2e2-e2e2-e2e2-e2e2-e2e2e2e2e2e2', 'PT Kerja Sama', 'hr@kerja.test');
select set_employer_verification('hash-e2', now() + interval '15 minutes');
select confirm_employer_verification('hash-e2');

select set_config('request.jwt.claims',
  '{"sub":"e3e3e3e3-e3e3-e3e3-e3e3-e3e3e3e3e3e3"}', true);
insert into employer_profiles(user_id, company_name, contact_email)
values ('e3e3e3e3-e3e3-e3e3-e3e3-e3e3e3e3e3e3', 'PT Lain', 'hr@lain.test');
select set_employer_verification('hash-e3', now() + interval '15 minutes');
select confirm_employer_verification('hash-e3');

-- ── 1. Контроль: посторонняя организация кандидата видит ────────────
do $$ begin
  if jsonb_array_length(talent_pool_candidates(50)) <> 1 then
    raise exception 'FAIL: кандидат не виден посторонней организации — тест ничего не проверяет';
  end if;
end $$;

-- ── 2. Работодатель из списка кандидата не видит ────────────────────
select set_config('request.jwt.claims',
  '{"sub":"e1e1e1e1-e1e1-e1e1-e1e1-e1e1e1e1e1e1"}', true);
do $$ begin
  if jsonb_array_length(talent_pool_candidates(50)) <> 0 then
    raise exception 'FAIL: текущий работодатель видит профиль';
  end if;
end $$;

-- ── 3. Переименование после подтверждения не помогает ──────────────
-- Так же, как saveCompanySettings: прямой update через PostgREST.
update employer_profiles set company_name = 'PT Samaran', updated_at = now()
 where user_id = 'e1e1e1e1-e1e1-e1e1-e1e1-e1e1e1e1e1e1';
do $$ begin
  if (select company_name from employer_profiles
       where user_id = 'e1e1e1e1-e1e1-e1e1-e1e1-e1e1e1e1e1e1') <> 'PT Samaran' then
    raise exception 'FAIL: переименование не применилось — проверка ниже ничего не доказывает';
  end if;
  if jsonb_array_length(talent_pool_candidates(50)) <> 0 then
    raise exception 'FAIL: работодатель переименовался и увидел кандидата, который скрыл его';
  end if;
end $$;

-- ── 4. Снимок названия нельзя подменить ────────────────────────────
do $$ begin
  begin
    execute $q$update employer_profiles set verified_company_name = 'PT Samaran'
                where user_id = 'e1e1e1e1-e1e1-e1e1-e1e1-e1e1e1e1e1e1'$q$;
  exception when others then
    if sqlerrm <> 'EMPLOYER_PROTECTED_FIELDS' then raise; end if;
    return;
  end;
  raise exception 'FAIL: работодатель изменил verified_company_name';
end $$;

do $$ begin
  begin
    execute $q$update employer_profiles set verified_company_name = null
                where user_id = 'e1e1e1e1-e1e1-e1e1-e1e1-e1e1e1e1e1e1'$q$;
  exception when others then
    if sqlerrm <> 'EMPLOYER_PROTECTED_FIELDS' then raise; end if;
    return;
  end;
  raise exception 'FAIL: работодатель стёр verified_company_name';
end $$;

-- ── 5. Действующее трудоустройство скрывает без ввода названия ─────
-- Запись с company_id создаёт только create_employment_from_application
-- (SECURITY DEFINER), поэтому фикстура — под владельцем схемы.
reset role;
insert into employments(company_id, company_name, employee_user_id, position,
                        status, manual)
select id, company_name, 'c1c1c1c1-c1c1-c1c1-c1c1-c1c1c1c1c1c1', 'Accountant',
       'active', false
  from employer_profiles where user_id = 'e2e2e2e2-e2e2-e2e2-e2e2-e2e2e2e2e2e2';
set local role authenticated;

select set_config('request.jwt.claims',
  '{"sub":"e2e2e2e2-e2e2-e2e2-e2e2-e2e2e2e2e2e2"}', true);
do $$ begin
  if jsonb_array_length(talent_pool_candidates(50)) <> 0 then
    raise exception 'FAIL: организация, где кандидат работает сейчас, видит его профиль';
  end if;
end $$;

-- ── 6. hide_current_employer = false отключает скрытие ─────────────
select set_config('request.jwt.claims',
  '{"sub":"c1c1c1c1-c1c1-c1c1-c1c1-c1c1c1c1c1c1"}', true);
select set_profile_visibility('confidential_pool', false,
  '["PT Nyata"]'::jsonb, '[]'::jsonb);

select set_config('request.jwt.claims',
  '{"sub":"e1e1e1e1-e1e1-e1e1-e1e1-e1e1e1e1e1e1"}', true);
do $$ begin
  if jsonb_array_length(talent_pool_candidates(50)) <> 1 then
    raise exception 'FAIL: скрытие сработало при hide_current_employer = false (по названию)';
  end if;
end $$;

select set_config('request.jwt.claims',
  '{"sub":"e2e2e2e2-e2e2-e2e2-e2e2-e2e2e2e2e2e2"}', true);
do $$ begin
  if jsonb_array_length(talent_pool_candidates(50)) <> 1 then
    raise exception 'FAIL: скрытие сработало при hide_current_employer = false (по трудоустройству)';
  end if;
end $$;

rollback;

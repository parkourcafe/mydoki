-- RLS-тест: confidential-видимость и Talent Pool (архитектура v1.2 §8.5, §8.8).
-- Запуск в Supabase SQL Editor или psql. Всё выполняется в одной транзакции
-- и ОТКАТЫВАЕТСЯ: тестовые данные в базе не остаются.
--
-- Проверяем:
--   1. работодатель не читает `resumes` напрямую;
--   2. приватный профиль (дефолт) не обнаруживается;
--   3. confidential-профиль отдаётся без имени, контактов, CV и ссылок;
--   4. заблокированная организация не видит профиль;
--   5. текущий работодатель не видит профиль;
--   6. `unavailable` останавливает показы;
--   7. неподтверждённая организация не получает выдачу;
--   8. работодатель не получает user_id — только псевдоним `ref`;
--   9. снимок отклика неизменяем.
--
-- Каждая проверка — do-блок, который бросает исключение при нарушении,
-- поэтому файл входит в tests/rls/run.sh.

begin;

-- ── Фикстуры ────────────────────────────────────────────────────────
-- Тестовые пользователи. Блок выполняется под ролью запуска скрипта
-- (в Supabase SQL Editor — postgres) до переключения на `authenticated`.
insert into auth.users(id, email) values
  ('33333333-3333-3333-3333-333333333333', 'candidate@test.local'),
  ('44444444-4444-4444-4444-444444444444', 'employer@test.local')
on conflict (id) do nothing;

-- Кандидат
select set_config('request.jwt.claims',
  '{"sub":"33333333-3333-3333-3333-333333333333"}', true);
set local role authenticated;

insert into resumes(user_id, full_name, contact, email, profession, current_location,
                    seniority, languages, salary_expectation, search_intent,
                    notice_period_days, work_format_preference, lifecycle,
                    cv_file_path, linkedin_url, last_confirmed_at)
values ('33333333-3333-3333-3333-333333333333', 'Ivan Petrov', '+62800000000',
        'ivan@example.test', 'Operations manager', 'Bali, Indonesia', 'senior',
        '[{"code":"en","level":"C1"}]'::jsonb,
        '{"min":2500,"max":3500,"currency":"USD","period":"month"}'::jsonb,
        'open', 14, '["hybrid"]'::jsonb, 'ready',
        'u/3/cv.pdf', 'https://example.test/in/ivan', now());

-- Работодатель (verified) заводится под своим пользователем.
select set_config('request.jwt.claims',
  '{"sub":"44444444-4444-4444-4444-444444444444"}', true);
insert into employer_profiles(user_id, company_name, contact_email)
values ('44444444-4444-4444-4444-444444444444', 'PT Pencari Kerja',
        'hr@pencari.example');
-- Подтверждение в продукте ставит сервер (confirm_employer_verification),
-- не сам работодатель, поэтому отметка — под ролью владельца схемы.
reset role;
update employer_profiles
   set verified_at = now(), domains = '["pencari.example"]'::jsonb
 where user_id = '44444444-4444-4444-4444-444444444444';
set local role authenticated;
select set_config('test.employer',
  (select id from employer_profiles
    where user_id = '44444444-4444-4444-4444-444444444444')::text, true);

-- 1. Работодатель не читает чужие `resumes` напрямую (RLS owner-only).
do $$ begin
  if (select count(*) from resumes) <> 0 then
    raise exception 'FAIL: работодатель читает resumes напрямую';
  end if;
end $$;

-- 2. Дефолт: политики видимости нет → профиль приватен, выдача пустая.
do $$ begin
  if jsonb_array_length(talent_pool_candidates(50)) <> 0 then
    raise exception 'FAIL: приватный профиль (дефолт) виден в Talent Pool';
  end if;
end $$;

-- ── Кандидат включает confidential-пул ──────────────────────────────
select set_config('request.jwt.claims',
  '{"sub":"33333333-3333-3333-3333-333333333333"}', true);

select set_profile_visibility('confidential_pool', true,
  '["PT Contoh Bali"]'::jsonb, '[]'::jsonb);
select grant_purpose_authorization(
  'talent_pool_discovery', 'consent', 'talent-pool-2026-08',
  '["profession","seniority","current_location"]'::jsonb,
  'verified_employers', null,
  'Разрешаю проверенным работодателям находить мой обезличенный профиль.',
  now() + interval '180 days');
select set_talent_pool_membership('active', now() + interval '180 days');

-- 3. Confidential: профиль отдаётся, но без прямых идентификаторов.
select set_config('request.jwt.claims',
  '{"sub":"44444444-4444-4444-4444-444444444444"}', true);

do $$
declare
  pool jsonb := talent_pool_candidates(50);
  k text;
begin
  if jsonb_array_length(pool) <> 1 then
    raise exception 'FAIL: confidential-профиль не найден (%)', jsonb_array_length(pool);
  end if;
  if pool -> 0 ->> 'reveal_level' is distinct from 'blind' then
    raise exception 'FAIL: reveal_level = %, ожидался blind', pool -> 0 ->> 'reveal_level';
  end if;
  if not (pool -> 0 ? 'ref') then
    raise exception 'FAIL: нет псевдонима ref';
  end if;
  foreach k in array array['user_id','full_name','contact','email',
                           'cv_file_path','linkedin_url','key_achievements'] loop
    if pool -> 0 ? k then
      raise exception 'FAIL: выдача Talent Pool содержит %', k;
    end if;
  end loop;
  -- Значения тоже не должны просачиваться под другими ключами.
  if pool::text like '%Ivan Petrov%' or pool::text like '%+62800000000%'
     or pool::text like '%ivan@example.test%' or pool::text like '%u/3/cv.pdf%'
     or pool::text like '%33333333-3333-3333-3333-333333333333%' then
    raise exception 'FAIL: идентификатор кандидата утёк в выдачу Talent Pool';
  end if;
end $$;

-- 4. Блокировка организации закрывает обнаружение.
select set_config('request.jwt.claims',
  '{"sub":"33333333-3333-3333-3333-333333333333"}', true);
select block_organization(current_setting('test.employer')::uuid, null);

select set_config('request.jwt.claims',
  '{"sub":"44444444-4444-4444-4444-444444444444"}', true);
do $$ begin
  if jsonb_array_length(talent_pool_candidates(50)) <> 0 then
    raise exception 'FAIL: заблокированная организация видит профиль';
  end if;
end $$;

-- Снимаем блокировку для следующих проверок.
select set_config('request.jwt.claims',
  '{"sub":"33333333-3333-3333-3333-333333333333"}', true);
select unblock_organization(
  (select id from organization_discovery_blocks
    where user_id = '33333333-3333-3333-3333-333333333333' limit 1));

-- 5. Текущий работодатель не видит профиль (совпадение по названию).
select set_profile_visibility('confidential_pool', true,
  '["PT Pencari Kerja"]'::jsonb, '[]'::jsonb);

select set_config('request.jwt.claims',
  '{"sub":"44444444-4444-4444-4444-444444444444"}', true);
do $$ begin
  if jsonb_array_length(talent_pool_candidates(50)) <> 0 then
    raise exception 'FAIL: текущий работодатель видит профиль';
  end if;
end $$;

-- 6. `unavailable` останавливает новые показы, членство сохраняется.
select set_config('request.jwt.claims',
  '{"sub":"33333333-3333-3333-3333-333333333333"}', true);
select set_profile_visibility('confidential_pool', true, '[]'::jsonb, '[]'::jsonb);
select set_search_intent('unavailable');

select set_config('request.jwt.claims',
  '{"sub":"44444444-4444-4444-4444-444444444444"}', true);
do $$ begin
  if jsonb_array_length(talent_pool_candidates(50)) <> 0 then
    raise exception 'FAIL: профиль со статусом unavailable показывается';
  end if;
end $$;

select set_config('request.jwt.claims',
  '{"sub":"33333333-3333-3333-3333-333333333333"}', true);
select set_search_intent('open');
do $$ begin
  if (select state from talent_pool_memberships
       where user_id = '33333333-3333-3333-3333-333333333333')
     is distinct from 'active' then
    raise exception 'FAIL: unavailable сбросил членство в Talent Pool';
  end if;
end $$;

-- 7. Организация без действующей верификации не получает выдачу.
select set_config('request.jwt.claims',
  '{"sub":"44444444-4444-4444-4444-444444444444"}', true);
reset role;
update employer_profiles set verification_revoked_at = now()
 where id = current_setting('test.employer')::uuid;
set local role authenticated;
do $$ begin
  begin
    perform talent_pool_candidates(50);
  exception when others then
    if sqlerrm <> 'verified employer required' then raise; end if;
    return;
  end;
  raise exception 'FAIL: выдача без действующей верификации';
end $$;
reset role;
update employer_profiles set verification_revoked_at = null
 where id = current_setting('test.employer')::uuid;
set local role authenticated;

-- 8. Отзыв разрешения прекращает новые показы.
select set_config('request.jwt.claims',
  '{"sub":"33333333-3333-3333-3333-333333333333"}', true);
select revoke_purpose_authorization('talent_pool_discovery');

select set_config('request.jwt.claims',
  '{"sub":"44444444-4444-4444-4444-444444444444"}', true);
do $$ begin
  if jsonb_array_length(talent_pool_candidates(50)) <> 0 then
    raise exception 'FAIL: профиль виден после отзыва разрешения';
  end if;
end $$;

-- 9. Снимок отклика неизменяем: update и delete запрещены триггером.
select set_config('request.jwt.claims',
  '{"sub":"33333333-3333-3333-3333-333333333333"}', true);
set local role postgres;
insert into application_profile_snapshots(
  application_id, user_id, candidate_profile_snapshot,
  vacancy_requirements_snapshot, visibility_state_snapshot, checksum)
values (null, '33333333-3333-3333-3333-333333333333',
        '{"fields":{"profession":"Operations manager"}}'::jsonb,
        '{"hard":{}}'::jsonb, '{"mode":"confidential_pool"}'::jsonb, 'test');

-- Проверка под владельцем схемы: RLS его не ограничивает, остаётся только
-- триггер, то есть проверяется именно он.
do $$ begin
  begin
    update application_profile_snapshots set checksum = 'tampered'
     where checksum = 'test';
  exception when others then
    if sqlerrm not like 'snapshot is immutable%' then raise; end if;
    return;
  end;
  raise exception 'FAIL: снимок изменился';
end $$;

do $$ begin
  begin
    delete from application_profile_snapshots where checksum = 'test';
  exception when others then
    if sqlerrm not like 'snapshot is immutable%' then raise; end if;
    return;
  end;
  raise exception 'FAIL: снимок удалён';
end $$;

rollback;

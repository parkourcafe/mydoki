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
-- Ожидаемые значения указаны в комментариях к каждому SELECT.

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
insert into employer_profiles(user_id, company_name, contact_email, domains)
values ('44444444-4444-4444-4444-444444444444', 'PT Pencari Kerja',
        'hr@pencari.example', '["pencari.example"]'::jsonb);
update employer_profiles set verified_at = now()
 where user_id = '44444444-4444-4444-4444-444444444444';
select set_config('test.employer',
  (select id from employer_profiles
    where user_id = '44444444-4444-4444-4444-444444444444')::text, true);

-- 1. Работодатель не читает чужие `resumes` напрямую (RLS owner-only).
select count(*) as employer_sees_resumes   -- ожидается 0
from resumes;

-- 2. Дефолт: политики видимости нет → профиль приватен, выдача пустая.
select jsonb_array_length(talent_pool_candidates(50)) as pool_default; -- ожидается 0

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

select
  jsonb_array_length(talent_pool_candidates(50)) as pool_confidential,   -- ожидается 1
  (talent_pool_candidates(50) -> 0 ->> 'reveal_level')  as level,        -- ожидается blind
  (talent_pool_candidates(50) -> 0 ? 'ref')             as has_ref,      -- ожидается t
  (talent_pool_candidates(50) -> 0 ? 'user_id')         as has_user_id,  -- ожидается f
  (talent_pool_candidates(50) -> 0 ? 'full_name')       as has_name,     -- ожидается f
  (talent_pool_candidates(50) -> 0 ? 'contact')         as has_contact,  -- ожидается f
  (talent_pool_candidates(50) -> 0 ? 'email')           as has_email,    -- ожидается f
  (talent_pool_candidates(50) -> 0 ? 'cv_file_path')    as has_cv,       -- ожидается f
  (talent_pool_candidates(50) -> 0 ? 'linkedin_url')    as has_linkedin, -- ожидается f
  (talent_pool_candidates(50) -> 0 ? 'key_achievements') as has_achievements; -- ожидается f

-- 4. Блокировка организации закрывает обнаружение.
select set_config('request.jwt.claims',
  '{"sub":"33333333-3333-3333-3333-333333333333"}', true);
select block_organization(current_setting('test.employer')::uuid, null);

select set_config('request.jwt.claims',
  '{"sub":"44444444-4444-4444-4444-444444444444"}', true);
select jsonb_array_length(talent_pool_candidates(50)) as pool_blocked; -- ожидается 0

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
select jsonb_array_length(talent_pool_candidates(50)) as pool_current_employer; -- ожидается 0

-- 6. `unavailable` останавливает новые показы, членство сохраняется.
select set_config('request.jwt.claims',
  '{"sub":"33333333-3333-3333-3333-333333333333"}', true);
select set_profile_visibility('confidential_pool', true, '[]'::jsonb, '[]'::jsonb);
select set_search_intent('unavailable');

select set_config('request.jwt.claims',
  '{"sub":"44444444-4444-4444-4444-444444444444"}', true);
select jsonb_array_length(talent_pool_candidates(50)) as pool_unavailable; -- ожидается 0

select set_config('request.jwt.claims',
  '{"sub":"33333333-3333-3333-3333-333333333333"}', true);
select set_search_intent('open');
select
  (select state from talent_pool_memberships
    where user_id = '33333333-3333-3333-3333-333333333333') as membership_kept; -- ожидается active

-- 7. Организация без действующей верификации не получает выдачу.
select set_config('request.jwt.claims',
  '{"sub":"44444444-4444-4444-4444-444444444444"}', true);
update employer_profiles set verification_revoked_at = now()
 where id = current_setting('test.employer')::uuid;
-- ожидается исключение 'verified employer required'
do $$ begin
  perform talent_pool_candidates(50);
  raise notice 'FAIL: выдача без действующей верификации';
exception when others then
  raise notice 'OK: %', sqlerrm;
end $$;
update employer_profiles set verification_revoked_at = null
 where id = current_setting('test.employer')::uuid;

-- 8. Отзыв разрешения прекращает новые показы.
select set_config('request.jwt.claims',
  '{"sub":"33333333-3333-3333-3333-333333333333"}', true);
select revoke_purpose_authorization('talent_pool_discovery');

select set_config('request.jwt.claims',
  '{"sub":"44444444-4444-4444-4444-444444444444"}', true);
select jsonb_array_length(talent_pool_candidates(50)) as pool_revoked; -- ожидается 0

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

do $$ begin
  update application_profile_snapshots set checksum = 'tampered'
   where checksum = 'test';
  raise notice 'FAIL: снимок изменился';
exception when others then
  raise notice 'OK: %', sqlerrm;   -- ожидается 'snapshot is immutable'
end $$;

do $$ begin
  delete from application_profile_snapshots where checksum = 'test';
  raise notice 'FAIL: снимок удалён';
exception when others then
  raise notice 'OK: %', sqlerrm;
end $$;

rollback;

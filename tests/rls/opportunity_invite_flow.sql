-- Сценарный тест: blind Opportunity Invite → знакомство → Share & apply
-- (архитектура v1.2 §8.8, §10). Запуск в Supabase SQL Editor или psql.
-- Всё в одной транзакции с ROLLBACK.
--
-- Проверяем:
--   1. приглашение без раскрытия условий и цели не отправляется;
--   2. приглашение отправляется по псевдониму `ref`, а не по user_id;
--   3. до принятия знакомства работодатель не видит профиль;
--   4. работодателю не возвращается ни user_id, ни имя, ни контакты;
--   5. после принятия появляется ограниченный профиль без контактов;
--   6. `Share & apply` создаёт отклик, разрешение и неизменяемый снимок;
--   7. повторный `Share & apply` не плодит отклики и не переписывает снимок;
--   8. отказ не оставляет следа в профиле кандидата.

begin;

-- ── Фикстуры ────────────────────────────────────────────────────────
insert into auth.users(id, email) values
  ('55555555-5555-5555-5555-555555555555', 'candidate2@test.local'),
  ('66666666-6666-6666-6666-666666666666', 'employer2@test.local')
on conflict (id) do nothing;

-- Кандидат: паспорт, видимость, разрешение, членство.
select set_config('request.jwt.claims',
  '{"sub":"55555555-5555-5555-5555-555555555555"}', true);
set local role authenticated;

insert into resumes(user_id, full_name, contact, email, profession, current_location,
                    seniority, languages, salary_expectation, search_intent,
                    notice_period_days, work_format_preference, key_achievements,
                    lifecycle, last_confirmed_at)
values ('55555555-5555-5555-5555-555555555555', 'Sari Dewi', '+62811111111',
        'sari@example.test', 'Operations manager', 'Bali, Indonesia', 'senior',
        '[{"code":"en","level":"C1"}]'::jsonb,
        '{"min":2500,"max":3500,"currency":"USD","period":"month"}'::jsonb,
        'open', 14, '["hybrid"]'::jsonb, 'Собрала операционную команду с нуля',
        'ready', now());

select set_profile_visibility('confidential_pool', true, '[]'::jsonb, '[]'::jsonb);
select grant_purpose_authorization(
  'talent_pool_discovery', 'consent', 'talent-pool-2026-08',
  '["profession","seniority","current_location"]'::jsonb,
  'verified_employers', null, 'Разрешаю discovery.', now() + interval '180 days');
select set_talent_pool_membership('active', now() + interval '180 days');

-- Работодатель: verified-профиль и вакансия.
select set_config('request.jwt.claims',
  '{"sub":"66666666-6666-6666-6666-666666666666"}', true);
insert into employer_profiles(user_id, company_name, contact_email, domains)
values ('66666666-6666-6666-6666-666666666666', 'PT Pencari Dua',
        'hr@pencari2.example', '["pencari2.example"]'::jsonb);
update employer_profiles set verified_at = now()
 where user_id = '66666666-6666-6666-6666-666666666666';

select set_config('test.vacancy',
  (create_vacancy('Operations manager', 'PT Pencari Dua', 'Bali',
                  '2500-4000 USD', 'full time', 'Роль про операции') ->> 'id'), true);

-- Псевдоним кандидата для этой организации.
select set_config('test.ref',
  (talent_pool_candidates(50) -> 0 ->> 'ref'), true);

select
  (talent_pool_candidates(50) -> 0 ? 'ref') as has_ref,          -- ожидается t
  (talent_pool_candidates(50) -> 0 ? 'user_id') as has_user_id;  -- ожидается f

-- 1. Приглашение без компенсации и цели отправить нельзя.
do $$ begin
  perform send_opportunity_invite(
    current_setting('test.ref')::uuid, current_setting('test.vacancy')::uuid, null,
    'Operations manager', 'Bali', 'hybrid', '', '', now() + interval '14 days',
    null, null, null);
  raise notice 'FAIL: приглашение без раскрытия условий отправлено';
exception when others then
  raise notice 'OK: %', sqlerrm;   -- ожидается 'invite disclosures incomplete'
end $$;

-- 2. Полное приглашение отправляется по псевдониму.
select set_config('test.invite',
  (send_opportunity_invite(
    current_setting('test.ref')::uuid, current_setting('test.vacancy')::uuid, null,
    'Operations manager', 'Bali', 'hybrid', '2500-4000 USD',
    'Оценка соответствия роли Operations manager', now() + interval '14 days',
    'Расскажем про роль', null, null) ->> 'invite_id'), true);

-- 3–4. До принятия знакомства профиля нет, идентификаторов нет.
select
  (get_employer_invites() -> 0 ->> 'state')        as state,        -- ожидается sent
  (get_employer_invites() -> 0 ->> 'blind')        as blind,        -- ожидается true
  (get_employer_invites() -> 0 -> 'profile')       as profile,      -- ожидается null
  (get_employer_invites() -> 0 ? 'user_id')        as has_user_id,  -- ожидается f
  (get_employer_invites()::text like '%Sari Dewi%')   as leaks_name, -- ожидается f
  (get_employer_invites()::text like '%+62811111111%') as leaks_contact; -- ожидается f

-- 5. Кандидат принимает знакомство: появляется ограниченный профиль.
select set_config('request.jwt.claims',
  '{"sub":"55555555-5555-5555-5555-555555555555"}', true);
select respond_to_opportunity_invite(
  current_setting('test.invite')::uuid, 'accept',
  '["profession","seniority","current_location","languages"]'::jsonb);

select set_config('request.jwt.claims',
  '{"sub":"66666666-6666-6666-6666-666666666666"}', true);
select
  (get_employer_invites() -> 0 ->> 'state')                    as state_after,  -- accepted
  (get_employer_invites() -> 0 -> 'profile' ->> 'profession')  as sees_role,    -- Operations manager
  (get_employer_invites() -> 0 -> 'profile' ? 'contact')       as sees_contact, -- ожидается f
  (get_employer_invites()::text like '%Sari Dewi%')            as leaks_name;   -- ожидается f

-- 6. `Share & apply` создаёт отклик, разрешение и снимок.
select set_config('request.jwt.claims',
  '{"sub":"55555555-5555-5555-5555-555555555555"}', true);
select set_config('test.app',
  (share_and_apply(
     current_setting('test.invite')::uuid,
     '["profession","seniority","current_location","languages"]'::jsonb,
     'Передаю выбранные поля профиля и контакты для рассмотрения на роль.',
     'application-2026-08',
     '{"fields":{"profession":"Operations manager"}}'::jsonb,
     '{"hard":{"location":"Bali"}}'::jsonb,
     '{"criteria":[],"coverage":{}}'::jsonb,
     '{"mode":"confidential_pool","reveal_level":"shared"}'::jsonb,
     'checksum-1') ->> 'application_id'), true);

select
  (select count(*) from applications
    where id = current_setting('test.app')::uuid)              as application_created, -- 1
  (select count(*) from application_profile_snapshots
    where application_id = current_setting('test.app')::uuid)  as snapshot_created,    -- 1
  (select count(*) from purpose_authorizations
    where user_id = '55555555-5555-5555-5555-555555555555'
      and purpose = 'application')                             as app_authorization,   -- 1
  (select count(*) from profile_access_grants
    where user_id = '55555555-5555-5555-5555-555555555555'
      and level = 'shared')                                    as shared_grant;        -- 1

-- 7. Повторный вызов не плодит отклики и не переписывает снимок.
select share_and_apply(
  current_setting('test.invite')::uuid,
  '["profession"]'::jsonb,
  'Повторная попытка.', 'application-2026-08',
  '{"fields":{"profession":"ДРУГОЕ"}}'::jsonb, '{}'::jsonb, null,
  '{"mode":"confidential_pool"}'::jsonb, 'checksum-2');

select
  (select count(*) from applications
    where vacancy_id = current_setting('test.vacancy')::uuid)  as applications_total, -- 1
  (select count(*) from application_profile_snapshots
    where application_id = current_setting('test.app')::uuid)  as snapshots_total,    -- 1
  (select checksum from application_profile_snapshots
    where application_id = current_setting('test.app')::uuid)  as checksum_kept;      -- checksum-1

-- 8. Отказ не оставляет следа в профиле кандидата.
select jsonb_object_keys(to_jsonb(r.*)) as resume_keys
from resumes r
where r.user_id = '55555555-5555-5555-5555-555555555555'
  and to_jsonb(r.*) ?| array['declined_count','decline_rate','response_rate','reputation'];
-- ожидается 0 строк

rollback;

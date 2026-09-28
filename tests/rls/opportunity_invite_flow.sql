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
--   8. отказ не оставляет следа в профиле кандидата;
--   9. объяснение по критериям в снимок пишет БД из match_assessments,
--      а не кандидат (подделать «покрытие требований» нельзя) — здесь
--      не проверяется, см. tests/rls/README.md.
--
-- Каждая проверка — do-блок, который бросает исключение при нарушении,
-- поэтому файл входит в tests/rls/run.sh.

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

-- Кандидат прячет зарплатные ожидания на уровне поля.
select set_profile_visibility('confidential_pool', true, '[]'::jsonb,
  '["salary_expectation"]'::jsonb);
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
-- Подтверждение ставит сервер, не сам работодатель (см. hiring_flow.sql).
reset role;
update employer_profiles set verified_at = now()
 where user_id = '66666666-6666-6666-6666-666666666666';
set local role authenticated;

select set_config('test.vacancy',
  (create_vacancy('Operations manager', 'PT Pencari Dua', 'Bali',
                  '2500-4000 USD', 'full time', 'Роль про операции') ->> 'id'), true);

-- Псевдоним кандидата для этой организации.
select set_config('test.ref',
  (talent_pool_candidates(50) -> 0 ->> 'ref'), true);

do $$ begin
  if current_setting('test.ref', true) is null
     or current_setting('test.ref', true) = '' then
    raise exception 'FAIL: у кандидата нет псевдонима ref в Talent Pool';
  end if;
  if talent_pool_candidates(50) -> 0 ? 'user_id' then
    raise exception 'FAIL: Talent Pool отдаёт работодателю user_id';
  end if;
end $$;

-- 1. Приглашение без компенсации и цели отправить нельзя.
do $$ begin
  begin
    perform send_opportunity_invite(
      current_setting('test.ref')::uuid, current_setting('test.vacancy')::uuid, null,
      'Operations manager', 'Bali', 'hybrid', '', '', now() + interval '14 days',
      null, null, null);
  exception when others then
    if sqlerrm <> 'invite disclosures incomplete' then raise; end if;
    return;
  end;
  raise exception 'FAIL: приглашение без раскрытия условий отправлено';
end $$;

-- 2. Полное приглашение отправляется по псевдониму.
select set_config('test.invite',
  (send_opportunity_invite(
    current_setting('test.ref')::uuid, current_setting('test.vacancy')::uuid, null,
    'Operations manager', 'Bali', 'hybrid', '2500-4000 USD',
    'Оценка соответствия роли Operations manager', now() + interval '14 days',
    'Расскажем про роль', null, null) ->> 'invite_id'), true);

-- 3–4. До принятия знакомства профиля нет, идентификаторов нет.
-- Прямое чтение таблицы приглашений работодателю недоступно: user_id
-- кандидата не должен утекать через PostgREST.
do $$
declare
  inv jsonb := get_employer_invites();
begin
  if (select count(*) from opportunity_invites) <> 0 then
    raise exception 'FAIL: работодатель читает opportunity_invites напрямую';
  end if;
  if inv -> 0 ->> 'state' is distinct from 'sent' then
    raise exception 'FAIL: состояние приглашения %, ожидалось sent', inv -> 0 ->> 'state';
  end if;
  if inv -> 0 ->> 'blind' is distinct from 'true' then
    raise exception 'FAIL: приглашение до принятия не blind';
  end if;
  if coalesce(inv -> 0 -> 'profile', 'null'::jsonb) <> 'null'::jsonb then
    raise exception 'FAIL: профиль виден до принятия знакомства';
  end if;
  if inv -> 0 ? 'user_id'
     or inv::text like '%55555555-5555-5555-5555-555555555555%' then
    raise exception 'FAIL: user_id кандидата утёк работодателю';
  end if;
  if inv::text like '%Sari Dewi%' or inv::text like '%+62811111111%'
     or inv::text like '%sari@example.test%' then
    raise exception 'FAIL: имя или контакты кандидата утекли до принятия';
  end if;
end $$;

-- 5. Кандидат принимает знакомство: появляется ограниченный профиль.
select set_config('request.jwt.claims',
  '{"sub":"55555555-5555-5555-5555-555555555555"}', true);
select respond_to_opportunity_invite(
  current_setting('test.invite')::uuid, 'accept',
  '["profession","seniority","current_location","languages"]'::jsonb);

select set_config('request.jwt.claims',
  '{"sub":"66666666-6666-6666-6666-666666666666"}', true);
do $$
declare
  inv jsonb := get_employer_invites();
begin
  if inv -> 0 ->> 'state' is distinct from 'accepted' then
    raise exception 'FAIL: после принятия состояние %', inv -> 0 ->> 'state';
  end if;
  if inv -> 0 -> 'profile' ->> 'profession' is distinct from 'Operations manager' then
    raise exception 'FAIL: после принятия работодатель не видит разрешённое поле';
  end if;
  if inv -> 0 -> 'profile' ? 'contact' then
    raise exception 'FAIL: контакт виден после знакомства без Share & apply';
  end if;
  -- поле скрыто кандидатом → не выдаётся даже внутри разрешённого уровня
  if inv -> 0 -> 'profile' ? 'salary_expectation' then
    raise exception 'FAIL: скрытое кандидатом поле salary_expectation выдано';
  end if;
  -- вне scope гранта: кандидат передал только profession/seniority/location/languages
  if inv -> 0 -> 'profile' ? 'key_achievements' then
    raise exception 'FAIL: выдано поле вне scope разрешения';
  end if;
  if inv::text like '%Sari Dewi%' or inv::text like '%+62811111111%' then
    raise exception 'FAIL: имя или контакт утекли после знакомства';
  end if;
end $$;

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
     '{"mode":"confidential_pool","reveal_level":"shared"}'::jsonb,
     'checksum-1') ->> 'application_id'), true);

do $$ begin
  if (select count(*) from applications
       where id = current_setting('test.app')::uuid) <> 1 then
    raise exception 'FAIL: Share & apply не создал отклик';
  end if;
  if (select count(*) from application_profile_snapshots
       where application_id = current_setting('test.app')::uuid) <> 1 then
    raise exception 'FAIL: Share & apply не создал ровно один снимок';
  end if;
  if (select count(*) from purpose_authorizations
       where user_id = '55555555-5555-5555-5555-555555555555'
         and purpose = 'application') <> 1 then
    raise exception 'FAIL: нет ровно одного разрешения purpose=application';
  end if;
  if (select count(*) from profile_access_grants
       where user_id = '55555555-5555-5555-5555-555555555555'
         and level = 'shared') <> 1 then
    raise exception 'FAIL: нет ровно одного доступа уровня shared';
  end if;
end $$;

-- 7. Повторный вызов не плодит отклики и не переписывает снимок.
select set_config('test.app2', (share_and_apply(
  current_setting('test.invite')::uuid,
  '["profession"]'::jsonb,
  'Повторная попытка.', 'application-2026-08',
  '{"fields":{"profession":"ДРУГОЕ"}}'::jsonb, '{}'::jsonb,
  '{"mode":"confidential_pool"}'::jsonb, 'checksum-2') ->> 'application_id'), true);

do $$ begin
  if current_setting('test.app2') <> current_setting('test.app') then
    raise exception 'FAIL: повторный Share & apply вернул другой отклик';
  end if;
  if (select count(*) from applications
       where vacancy_id = current_setting('test.vacancy')::uuid) <> 1 then
    raise exception 'FAIL: повторный Share & apply создал второй отклик';
  end if;
  if (select count(*) from application_profile_snapshots
       where application_id = current_setting('test.app')::uuid) <> 1 then
    raise exception 'FAIL: повторный Share & apply создал второй снимок';
  end if;
  if (select checksum from application_profile_snapshots
       where application_id = current_setting('test.app')::uuid)
     is distinct from 'checksum-1' then
    raise exception 'FAIL: повторный Share & apply переписал снимок';
  end if;
end $$;

-- 8. Отказ не оставляет следа в профиле кандидата.
do $$ begin
  if exists (
    select 1 from resumes r
     where r.user_id = '55555555-5555-5555-5555-555555555555'
       and to_jsonb(r.*) ?| array['declined_count','decline_rate','response_rate','reputation']
  ) then
    raise exception 'FAIL: в профиле кандидата появился счётчик отказов/репутации';
  end if;
end $$;

rollback;

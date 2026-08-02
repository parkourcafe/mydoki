-- RLS/безопасность: привязка отклика к аккаунту (claim_application).
-- Запуск в Supabase SQL Editor или psql. Всё в одной транзакции с ROLLBACK.
--
-- Регрессия, которую закрывает 20260802120000_claim_application_identity_check:
-- раньше функция проверяла только факт аутентификации, поэтому ЛЮБОЙ
-- залогиненный пользователь, узнавший access_token, привязывал чужой отклик к
-- себе — а прикладной claimApplication следом копировал документы кандидата
-- (KTP, справки) в его сейф.
--
-- Ожидаемый результат (все строки должны совпасть):
--   t1_attacker_blocked   = identity_mismatch
--   t1_owner_after_attack = null
--   t2_candidate_email    = true
--   t2_owner_after_claim  = candidate
--   t3_candidate_phone    = true
--   t4_repeat_idempotent  = true
--   t5_foreign_claimed    = already_claimed
--   t6_bad_token          = not_found
begin;

insert into auth.users(id, email, phone) values
  ('aaaaaaaa-0000-0000-0000-000000000001', 'candidate@example.com', null),
  ('bbbbbbbb-0000-0000-0000-000000000002', 'attacker@example.com',  null),
  ('cccccccc-0000-0000-0000-000000000003', 'phoneonly@example.com', '+62 811-2222-3333');

insert into employer_profiles(id, user_id, company_name)
  values ('dddddddd-0000-0000-0000-000000000004',
          'aaaaaaaa-0000-0000-0000-000000000001', 'ACME');
insert into vacancies(id, employer_id, slug, title, company_name)
  values ('eeeeeeee-0000-0000-0000-000000000005',
          'dddddddd-0000-0000-0000-000000000004', 'rls-claim-v1', 'Barista', 'ACME');

-- Отклик с email кандидата
insert into applications(id, vacancy_id, full_name, whatsapp, email,
                         consent_text, access_token, user_id)
  values ('11111111-0000-0000-0000-000000000011',
          'eeeeeeee-0000-0000-0000-000000000005',
          'Budi', '628111000111', 'candidate@example.com',
          'ok', 'TOKEN-EMAIL', null);

-- Отклик без email, только номер (частый случай в Индонезии)
insert into applications(id, vacancy_id, full_name, whatsapp, email,
                         consent_text, access_token, user_id)
  values ('22222222-0000-0000-0000-000000000022',
          'eeeeeeee-0000-0000-0000-000000000005',
          'Sri', '0811 2222 3333', null,
          'ok', 'TOKEN-PHONE', null);

-- ── T1. Посторонний с валидным токеном не должен пройти ────────────
select set_config('request.jwt.claims',
  '{"sub":"bbbbbbbb-0000-0000-0000-000000000002","email":"attacker@example.com"}', true);
set local role authenticated;
select 't1_attacker_blocked = ' || (claim_application('TOKEN-EMAIL') ->> 'reason');
reset role;
select 't1_owner_after_attack = ' || coalesce(user_id::text, 'null')
  from applications where id = '11111111-0000-0000-0000-000000000011';

-- ── T2. Кандидат по совпадению email ───────────────────────────────
select set_config('request.jwt.claims',
  '{"sub":"aaaaaaaa-0000-0000-0000-000000000001","email":"candidate@example.com"}', true);
set local role authenticated;
select 't2_candidate_email = ' || (claim_application('TOKEN-EMAIL') ->> 'ok');
reset role;
select 't2_owner_after_claim = ' || case
  when user_id = 'aaaaaaaa-0000-0000-0000-000000000001' then 'candidate' else 'WRONG' end
  from applications where id = '11111111-0000-0000-0000-000000000011';

-- ── T3. Кандидат по совпадению телефона (email в отклике нет) ──────
select set_config('request.jwt.claims',
  '{"sub":"cccccccc-0000-0000-0000-000000000003","email":"phoneonly@example.com"}', true);
set local role authenticated;
select 't3_candidate_phone = ' || (claim_application('TOKEN-PHONE') ->> 'ok');

-- ── T4. Повторный вызов тем же пользователем — идемпотентен ────────
select 't4_repeat_idempotent = ' || (claim_application('TOKEN-PHONE') ->> 'ok');
reset role;

-- ── T5. Чужой отклик, уже привязанный, не перехватывается ──────────
select set_config('request.jwt.claims',
  '{"sub":"bbbbbbbb-0000-0000-0000-000000000002","email":"attacker@example.com"}', true);
set local role authenticated;
select 't5_foreign_claimed = ' || (claim_application('TOKEN-EMAIL') ->> 'reason');

-- ── T6. Несуществующий токен не раскрывает наличие отклика ─────────
select 't6_bad_token = ' || (claim_application('NO-SUCH-TOKEN') ->> 'reason');
reset role;

rollback;

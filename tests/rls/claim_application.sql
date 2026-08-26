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

-- Значения складываются в transaction-local настройки, чтобы в конце их можно
-- было и показать человеку, и проверить машинно. Настройки переживают смену
-- роли, поэтому reset role между шагами (он нужен для чтения applications в
-- обход RLS) ничего не теряет.

-- ── T1. Посторонний с валидным токеном не должен пройти ────────────
select set_config('request.jwt.claims',
  '{"sub":"bbbbbbbb-0000-0000-0000-000000000002","email":"attacker@example.com"}', true);
set local role authenticated;
select set_config('test.t1',
  coalesce(claim_application('TOKEN-EMAIL') ->> 'reason', 'NULL'), true);
reset role;
select set_config('test.t1_owner', coalesce(user_id::text, 'null'), true)
  from applications where id = '11111111-0000-0000-0000-000000000011';

-- ── T2. Кандидат по совпадению email ───────────────────────────────
select set_config('request.jwt.claims',
  '{"sub":"aaaaaaaa-0000-0000-0000-000000000001","email":"candidate@example.com"}', true);
set local role authenticated;
select set_config('test.t2',
  coalesce(claim_application('TOKEN-EMAIL') ->> 'ok', 'NULL'), true);
reset role;
select set_config('test.t2_owner', case
  when user_id = 'aaaaaaaa-0000-0000-0000-000000000001' then 'candidate' else 'WRONG' end, true)
  from applications where id = '11111111-0000-0000-0000-000000000011';

-- ── T3. Кандидат по совпадению телефона (email в отклике нет) ──────
select set_config('request.jwt.claims',
  '{"sub":"cccccccc-0000-0000-0000-000000000003","email":"phoneonly@example.com"}', true);
set local role authenticated;
select set_config('test.t3',
  coalesce(claim_application('TOKEN-PHONE') ->> 'ok', 'NULL'), true);

-- ── T4. Повторный вызов тем же пользователем — идемпотентен ────────
select set_config('test.t4',
  coalesce(claim_application('TOKEN-PHONE') ->> 'ok', 'NULL'), true);
reset role;

-- ── T5. Чужой отклик, уже привязанный, не перехватывается ──────────
select set_config('request.jwt.claims',
  '{"sub":"bbbbbbbb-0000-0000-0000-000000000002","email":"attacker@example.com"}', true);
set local role authenticated;
select set_config('test.t5',
  coalesce(claim_application('TOKEN-EMAIL') ->> 'reason', 'NULL'), true);

-- ── T6. Несуществующий токен не раскрывает наличие отклика ─────────
select set_config('test.t6',
  coalesce(claim_application('NO-SUCH-TOKEN') ->> 'reason', 'NULL'), true);
reset role;

-- Читаемый вывод — как было раньше.
select
  current_setting('test.t1')       as t1_attacker_blocked,   -- identity_mismatch
  current_setting('test.t1_owner') as t1_owner_after_attack, -- null
  current_setting('test.t2')       as t2_candidate_email,    -- true
  current_setting('test.t2_owner') as t2_owner_after_claim,  -- candidate
  current_setting('test.t3')       as t3_candidate_phone,    -- true
  current_setting('test.t4')       as t4_repeat_idempotent,  -- true
  current_setting('test.t5')       as t5_foreign_claimed,    -- already_claimed
  current_setting('test.t6')       as t6_bad_token;          -- not_found

-- Те же ожидания как проверка. T1 и T5 — про перехват чужого отклика, то есть
-- про копирование чужих KTP и справок в свой сейф; их формулировки нарочно
-- громкие, чтобы провал нельзя было пролистать.
do $$
declare
  t1 text := current_setting('test.t1');
  t1_owner text := current_setting('test.t1_owner');
  t2 text := current_setting('test.t2');
  t2_owner text := current_setting('test.t2_owner');
  t3 text := current_setting('test.t3');
  t4 text := current_setting('test.t4');
  t5 text := current_setting('test.t5');
  t6 text := current_setting('test.t6');
begin
  if t1 <> 'identity_mismatch' then
    raise exception 'ЗАХВАТ ЧУЖОГО ОТКЛИКА: посторонний с токеном получил «%», ожидалось identity_mismatch', t1;
  end if;
  if t1_owner <> 'null' then
    raise exception 'ЗАХВАТ ЧУЖОГО ОТКЛИКА: после атаки владелец отклика = %, ожидался null', t1_owner;
  end if;
  if t2 <> 'true' then
    raise exception 'claim по email не сработал: ok = %, ожидалось true', t2;
  end if;
  if t2_owner <> 'candidate' then
    raise exception 'claim по email привязал отклик не тому: %', t2_owner;
  end if;
  if t3 <> 'true' then
    raise exception 'claim по телефону не сработал: ok = %, ожидалось true', t3;
  end if;
  if t4 <> 'true' then
    raise exception 'повторный claim не идемпотентен: ok = %, ожидалось true', t4;
  end if;
  if t5 <> 'already_claimed' then
    raise exception 'ПЕРЕХВАТ ПРИВЯЗАННОГО ОТКЛИКА: получено «%», ожидалось already_claimed', t5;
  end if;
  if t6 <> 'not_found' then
    raise exception 'несуществующий токен даёт «%», ожидалось not_found', t6;
  end if;

  raise notice 'PASS claim_application';
end $$;

rollback;

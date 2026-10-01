-- Сквозной сценарий найма на синтетических данных: работодатель создаёт
-- вакансию → анонимный кандидат откликается → отклик появляется на доске
-- работодателя, и только у него. Шаги повторяют вызовы app/employer/actions.ts
-- (createVacancy), app/apply/actions.ts (precheckApplication,
-- submitApplication) и загрузчик app/employer/vacancies/[id]/page.tsx.
-- Всё в одной транзакции с откатом; нарушение → исключение.

begin;

insert into auth.users(id, email) values
  ('77777777-7777-7777-7777-777777777777', 'owner@hiring.test'),
  ('99999999-9999-9999-9999-999999999999', 'other@hiring.test')
on conflict (id) do nothing;

-- ── 1. Работодатель заводит профиль ────────────────────────────────
select set_config('request.jwt.claims',
  '{"sub":"77777777-7777-7777-7777-777777777777"}', true);
set local role authenticated;
insert into employer_profiles(user_id, company_name, contact_email)
values ('77777777-7777-7777-7777-777777777777', 'PT Uji Coba', 'hr@uji.test');

-- Неподтверждённая организация не публикует вакансию.
do $$ begin
  perform create_vacancy('Barista', 'PT Uji Coba');
  raise exception 'FAIL: вакансия создана без подтверждения работодателя';
exception when others then
  if sqlerrm <> 'EMPLOYER_NOT_VERIFIED' then raise; end if;
end $$;
reset role;

-- Подтверждение в продукте идёт через код (confirm_employer_verification);
-- здесь проверяется не оно, а путь вакансия → отклик, поэтому отметка
-- ставится напрямую.
update employer_profiles set verified_at = now()
 where user_id in ('77777777-7777-7777-7777-777777777777',
                   '99999999-9999-9999-9999-999999999999');

-- ── 2. Создание вакансии (createVacancy) ───────────────────────────
set local role authenticated;
select set_config('test.vac', create_vacancy(
  'Barista', 'PT Uji Coba', 'Canggu', null, null, 'Синтетическая вакансия',
  'normal', null,
  '[{"type":"ktp","label":"KTP"}]'::jsonb,
  '[{"question":"Опыт с кофемашиной?","type":"text"}]'::jsonb)::text, true);
select set_config('test.vac_id', current_setting('test.vac')::jsonb ->> 'id', true);
select set_config('test.slug', current_setting('test.vac')::jsonb ->> 'slug', true);

update vacancies set published_at = now(), created_via = 'manual'
 where id = current_setting('test.vac_id')::uuid;
insert into vacancy_versions(vacancy_id, version_no, snapshot)
select id, 1, to_jsonb(v.*) from vacancies v
 where id = current_setting('test.vac_id')::uuid;
reset role;

-- ── 3. Анонимный кандидат видит вакансию и откликается ─────────────
select set_config('request.jwt.claims', '{}', true);
set local role anon;
do $$ begin
  if (select count(*) from vacancies
       where slug = current_setting('test.slug')) <> 1 then
    raise exception 'FAIL: активная вакансия не видна анониму';
  end if;
  if not coalesce((precheck_application(current_setting('test.slug'),
                    '+6281200000001', 'ip-test') ->> 'ok')::boolean, false) then
    raise exception 'FAIL: precheck не пропустил первый отклик';
  end if;
end $$;

select set_config('test.submit', submit_application(
  'abababab-0000-0000-0000-000000000001', current_setting('test.slug'),
  'Kandidat Sintetis', '+6281200000001', 'kandidat@hiring.test',
  'Согласие на обработку',
  '[{"question":"Опыт с кофемашиной?","type":"text","answer":"2 года"}]'::jsonb,
  '[{"type":"ktp","label":"KTP","path":"v/a/ktp.jpg","name":"ktp.jpg","size":1000}]'::jsonb,
  'wa', 'ip-test', null)::text, true);

do $$ begin
  if (current_setting('test.submit')::jsonb ->> 'duplicate')::boolean then
    raise exception 'FAIL: первый отклик помечен дубликатом';
  end if;
  -- Повторная отправка с того же номера возвращает тот же токен, а не второй отклик.
  if (submit_application(
        'abababab-0000-0000-0000-000000000002', current_setting('test.slug'),
        'Kandidat Sintetis', '+6281200000001', null, 'Согласие', '[]'::jsonb,
        '[]'::jsonb, 'wa', 'ip-test', null) ->> 'access_token')
     <> current_setting('test.submit')::jsonb ->> 'access_token' then
    raise exception 'FAIL: дубликат выдал другой токен';
  end if;
end $$;

-- Аноним не читает отклики. Отказ в правах на хелпер политики — тоже отказ.
do $$ begin
  if (select count(*) from applications) <> 0 then
    raise exception 'FAIL: аноним читает applications';
  end if;
exception when insufficient_privilege then null;
end $$;
reset role;

-- ── 4. Доска работодателя (vacancies/[id]/page.tsx) ────────────────
select set_config('request.jwt.claims',
  '{"sub":"77777777-7777-7777-7777-777777777777"}', true);
set local role authenticated;
do $$
declare v_apps int; v_docs int; v_answers int; v_status text;
begin
  select count(*) into v_apps from applications
   where vacancy_id = current_setting('test.vac_id')::uuid
     and full_name = 'Kandidat Sintetis' and status = 'new';
  if v_apps <> 1 then
    raise exception 'FAIL: на доске % откликов вместо 1', v_apps;
  end if;
  select count(*) into v_docs from application_documents
   where application_id = 'abababab-0000-0000-0000-000000000001';
  select count(*) into v_answers from application_answers
   where application_id = 'abababab-0000-0000-0000-000000000001';
  if v_docs <> 1 or v_answers <> 1 then
    raise exception 'FAIL: документы/ответы на доске: % / %', v_docs, v_answers;
  end if;

  perform mark_application_viewed('abababab-0000-0000-0000-000000000001');
  select status into v_status from applications
   where id = 'abababab-0000-0000-0000-000000000001';
  if v_status <> 'viewed' then
    raise exception 'FAIL: статус после открытия доски: %', v_status;
  end if;
end $$;

-- ── 5. Другой подтверждённый работодатель отклик не видит ──────────
reset role;
insert into employer_profiles(user_id, company_name, verified_at)
values ('99999999-9999-9999-9999-999999999999', 'PT Lain', now());
select set_config('request.jwt.claims',
  '{"sub":"99999999-9999-9999-9999-999999999999"}', true);
set local role authenticated;
do $$ begin
  if (select count(*) from applications) <> 0
     or (select count(*) from application_documents) <> 0
     or (select count(*) from application_answers) <> 0 then
    raise exception 'FAIL: чужой работодатель видит отклик';
  end if;
  perform mark_application_viewed('abababab-0000-0000-0000-000000000001');
end $$;
reset role;

do $$ begin
  if (select count(*) from application_status_log
       where application_id = 'abababab-0000-0000-0000-000000000001'
         and new_status = 'viewed') <> 1 then
    raise exception 'FAIL: чужой работодатель изменил статус отклика';
  end if;
end $$;

rollback;

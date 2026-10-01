-- Подтверждение работодателя (миграция 20260928120000_employer_verification_guard):
--   1. работодатель не ставит себе подтверждение и не поднимает лимит
--      вакансий ни вставкой, ни прямым update через PostgREST;
--   2. обычные поля профиля (как в saveEmployerProfile / saveCompanySettings)
--      он менять может, в том числе upsert'ом;
--   3. подтверждение кодом (set_/confirm_employer_verification) проходит,
--      неверный код считается попыткой;
--   4. после подтверждения кодом доступ к Talent Pool не зависит от срока
--      кода (раньше пропадал через 15 минут).
-- Всё в одной транзакции с откатом; нарушение → исключение.

begin;

insert into auth.users(id, email) values
  ('acacacac-acac-acac-acac-acacacacacac', 'owner@verify.test')
on conflict (id) do nothing;

select set_config('request.jwt.claims',
  '{"sub":"acacacac-acac-acac-acac-acacacacacac"}', true);
set local role authenticated;

-- ── 1. Вставка с подтверждением сразу ───────────────────────────────
do $$ begin
  begin
    insert into employer_profiles(user_id, company_name, verified_at)
    values ('acacacac-acac-acac-acac-acacacacacac', 'PT Verifikasi', now());
  exception when others then
    if sqlerrm <> 'EMPLOYER_PROTECTED_FIELDS' then raise; end if;
    return;
  end;
  raise exception 'FAIL: профиль вставлен сразу подтверждённым';
end $$;

-- ── 2. Обычный профиль: вставка и upsert как в приложении ───────────
insert into employer_profiles(user_id, company_name, contact_email)
values ('acacacac-acac-acac-acac-acacacacacac', 'PT Verifikasi', 'hr@verify.test');

insert into employer_profiles(user_id, company_name, contact_email, country,
                              default_consent_text, retention_months, updated_at)
values ('acacacac-acac-acac-acac-acacacacacac', 'PT Verifikasi Baru', 'hr@verify.test',
        'ID', 'Согласие', 24, now())
on conflict (user_id) do update
  set company_name = excluded.company_name, contact_email = excluded.contact_email,
      country = excluded.country, default_consent_text = excluded.default_consent_text,
      retention_months = excluded.retention_months, updated_at = excluded.updated_at;

do $$ begin
  if (select company_name from employer_profiles
       where user_id = 'acacacac-acac-acac-acac-acacacacacac')
     is distinct from 'PT Verifikasi Baru' then
    raise exception 'FAIL: работодатель не смог обновить свой профиль';
  end if;
end $$;

-- ── 3. Прямой update служебных полей запрещён ───────────────────────
do $$
declare
  stmt text;
begin
  foreach stmt in array array[
    'update employer_profiles set verified_at = now()',
    'update employer_profiles set vacancy_limit = 1000',
    'update employer_profiles set verification_attempts = verification_attempts + 1',
    'update employer_profiles set verification_revoked_at = now()',
    'update employer_profiles set verification_expires_at = now() + interval ''1 year''',
    'update employer_profiles set verification_code_hash = ''x''',
    'update employer_profiles set verification_channel = ''email''',
    'update employer_profiles set domains = ''["other.example"]''::jsonb'
  ] loop
    begin
      execute stmt || ' where user_id = auth.uid()';
    exception when others then
      if sqlerrm <> 'EMPLOYER_PROTECTED_FIELDS' then raise; end if;
      continue;
    end;
    raise exception 'FAIL: клиент выполнил «%»', stmt;
  end loop;
end $$;

-- Неподтверждённый — всё ещё не публикует.
do $$ begin
  begin
    perform create_vacancy('Barista', 'PT Verifikasi Baru');
  exception when others then
    if sqlerrm <> 'EMPLOYER_NOT_VERIFIED' then raise; end if;
    return;
  end;
  raise exception 'FAIL: вакансия создана без подтверждения';
end $$;

-- ── 4. Подтверждение кодом ──────────────────────────────────────────
-- now() внутри транзакции постоянен: срок кода = now() — это граница, при
-- которой код ещё принимается (CODE_EXPIRED при < now()), а старая
-- проверка Talent Pool (<= now()) уже считала подтверждение истёкшим.
select set_employer_verification('hash-ok', now());

do $$ begin
  if confirm_employer_verification('hash-wrong') then
    raise exception 'FAIL: неверный код принят';
  end if;
  if (select verification_attempts from employer_profiles
       where user_id = auth.uid()) <> 1 then
    raise exception 'FAIL: неверный код не засчитан как попытка';
  end if;
  -- сбросить счётчик попыток после неудачи клиент не может
  begin
    update employer_profiles set verification_attempts = 0 where user_id = auth.uid();
    raise exception 'FAIL: клиент сбросил счётчик попыток';
  exception when others then
    if sqlerrm <> 'EMPLOYER_PROTECTED_FIELDS' then raise; end if;
  end;
  if not confirm_employer_verification('hash-ok') then
    raise exception 'FAIL: верный код не принят';
  end if;
  if exists (select 1 from employer_profiles
              where user_id = auth.uid()
                and (verified_at is null or verification_expires_at is not null
                     or verification_code_hash is not null)) then
    raise exception 'FAIL: после подтверждения остались код или его срок';
  end if;
end $$;

-- Подтверждённый публикует и получает Talent Pool.
do $$ begin
  perform create_vacancy('Barista', 'PT Verifikasi Baru');
  perform talent_pool_candidates(5);
end $$;

-- Отзыв и лимит по-прежнему может поставить только сервер.
do $$ begin
  begin
    update employer_profiles set verified_at = null where user_id = auth.uid();
  exception when others then
    if sqlerrm <> 'EMPLOYER_PROTECTED_FIELDS' then raise; end if;
    return;
  end;
  raise exception 'FAIL: клиент изменил verified_at у подтверждённого профиля';
end $$;

reset role;
update employer_profiles set vacancy_limit = 10, verification_revoked_at = now()
 where user_id = 'acacacac-acac-acac-acac-acacacacacac';

rollback;

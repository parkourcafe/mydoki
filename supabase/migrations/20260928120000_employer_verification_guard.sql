-- =====================================================================
-- Подтверждение работодателя: две правки.
--
-- 1. Самоподтверждение. Политика "employers manage own profile" — FOR ALL
--    с проверкой только user_id = auth.uid(), а authenticated имеет
--    update на всю таблицу (20260717030000_restore_release_privileges).
--    Поэтому работодатель мог прямым PATCH через PostgREST поставить себе
--    verified_at, снять verification_revoked_at, обнулить попытки ввода
--    кода или поднять платный vacancy_limit — и обойти EMPLOYER_NOT_VERIFIED
--    в create_vacancy и 'verified employer required' в Talent Pool.
--    Триггер ниже запрещает клиентским ролям (authenticated, anon) менять
--    эти поля. SECURITY DEFINER-функции (set_/confirm_employer_verification)
--    исполняются от владельца схемы, service role — от своей роли, их
--    триггер не ограничивает. Приложение пишет в employer_profiles только
--    company_name, contact_*, country, default_consent_text,
--    retention_months, updated_at (app/employer/actions.ts) — их триггер
--    не трогает.
--
-- 2. Истекающая верификация. verification_expires_at используется дважды:
--    как срок 6-значного кода (set_employer_verification, 15 минут) и как
--    срок действия подтверждения организации в Talent Pool
--    (private.verified_employer_for_uid, discovery_denied_reason,
--    app/employer/talent/page.tsx). confirm_employer_verification срок
--    кода не сбрасывал, поэтому работодатель, подтвердивший почту кодом,
--    через 15 минут терял доступ к Talent Pool. Теперь срок кода
--    сбрасывается при успешном подтверждении, а у уже подтверждённых
--    работодателей оставшийся срок кода обнуляется.
--
-- Откат:
--   drop trigger if exists employer_profiles_guard_protected
--     on public.employer_profiles;
--   drop function if exists private.employer_profiles_guard_protected();
--   (confirm_employer_verification — вернуть версию из
--   20260704000000_t4_verification_reports.sql; обнулённые сроки кода не
--   восстанавливаются — они и так истекли.)
-- =====================================================================

-- ── 2a. Сброс срока кода при подтверждении ───────────────────────────
create or replace function public.confirm_employer_verification(p_code_hash text)
returns boolean language plpgsql security definer set search_path = public as $$
declare ep employer_profiles;
begin
  if auth.uid() is null then raise exception 'not authenticated'; end if;
  select * into ep from employer_profiles where user_id = auth.uid();
  if not found then raise exception 'no employer profile'; end if;
  if ep.verified_at is not null then return true; end if;

  if coalesce(ep.verification_attempts,0) >= 5 then raise exception 'TOO_MANY_ATTEMPTS'; end if;
  if ep.verification_expires_at is null or ep.verification_expires_at < now() then
    raise exception 'CODE_EXPIRED';
  end if;

  if ep.verification_code_hash is not null and ep.verification_code_hash = p_code_hash then
    update employer_profiles
       set verified_at = now(), verification_channel = 'email',
           verification_code_hash = null, verification_expires_at = null,
           updated_at = now()
     where user_id = auth.uid();
    return true;
  end if;

  update employer_profiles
     set verification_attempts = coalesce(verification_attempts,0) + 1, updated_at = now()
   where user_id = auth.uid();
  return false;
end; $$;
grant execute on function public.confirm_employer_verification(text) to authenticated;

-- ── 2b. Уже подтверждённые: убрать оставшийся срок кода ─────────────
-- Никакой код в репозитории не пишет в verification_expires_at ничего,
-- кроме срока кода, поэтому у подтверждённого работодателя это значение —
-- всегда остаток от ввода кода, а не срок подтверждения.
update public.employer_profiles
   set verification_expires_at = null
 where verified_at is not null
   and verification_code_hash is null
   and verification_expires_at is not null;

-- ── 1. Запрет клиенту менять служебные поля ──────────────────────────
create or replace function private.employer_profiles_guard_protected()
returns trigger language plpgsql set search_path = public as $$
begin
  if current_user not in ('authenticated', 'anon') then
    return new;
  end if;

  if tg_op = 'INSERT' then
    if new.verified_at is not null
       or new.verification_channel is not null
       or new.verification_code_hash is not null
       or new.verification_expires_at is not null
       or coalesce(new.verification_attempts, 0) <> 0
       or new.verification_revoked_at is not null
       or new.vacancy_limit is distinct from 3
       or coalesce(new.domains, '[]'::jsonb) <> '[]'::jsonb
    then
      raise exception 'EMPLOYER_PROTECTED_FIELDS' using errcode = '42501';
    end if;
    return new;
  end if;

  if new.verified_at             is distinct from old.verified_at
     or new.verification_channel    is distinct from old.verification_channel
     or new.verification_code_hash  is distinct from old.verification_code_hash
     or new.verification_expires_at is distinct from old.verification_expires_at
     or new.verification_attempts   is distinct from old.verification_attempts
     or new.verification_revoked_at is distinct from old.verification_revoked_at
     or new.vacancy_limit           is distinct from old.vacancy_limit
     or new.domains                 is distinct from old.domains
     or new.user_id                 is distinct from old.user_id
  then
    raise exception 'EMPLOYER_PROTECTED_FIELDS' using errcode = '42501';
  end if;
  return new;
end; $$;

drop trigger if exists employer_profiles_guard_protected on public.employer_profiles;
create trigger employer_profiles_guard_protected
  before insert or update on public.employer_profiles
  for each row execute function private.employer_profiles_guard_protected();

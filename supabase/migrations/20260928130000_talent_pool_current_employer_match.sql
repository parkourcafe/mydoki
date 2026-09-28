-- =====================================================================
-- Talent Pool: «скрыть от текущего работодателя» без опоры на поля,
-- которые работодатель правит сам.
--
-- Было (20260819110000, private.discovery_denied_reason): кандидат
-- перечисляет названия/домены текущего работодателя, а сверка идёт с
-- employer_profiles.company_name и employer_profiles.domains. company_name
-- работодатель меняет сам (saveEmployerProfile / saveCompanySettings в
-- app/employer/actions.ts, прямой update через PostgREST), поэтому
-- достаточно переименоваться — и скрытый кандидат снова виден.
--
-- Стало — «текущий работодатель» совпадает, если выполнено любое из:
--   1. название из списка кандидата = текущее company_name (как раньше;
--      переименование «в сторону» списка только сильнее скрывает);
--   2. название из списка = verified_company_name — названию на момент
--      подтверждения организации. Колонку ставит триггер при появлении
--      verified_at; клиентские роли (authenticated, anon) её не задают и
--      не меняют. Переименование после подтверждения больше не помогает;
--   3. значение из списка = один из employer_profiles.domains (как раньше;
--      после 20260928120000 домены клиент не меняет);
--   4. у кандидата есть действующая запись employments с
--      company_id = эта организация (status = 'active'). company_id ставит
--      только create_employment_from_application (SECURITY DEFINER, по
--      нанятому отклику); сам кандидат company_id не задаёт (RLS
--      "employments person insert/update manual"). Срабатывает, даже если
--      кандидат не вписал название.
-- Всё — под тем же флагом hide_current_employer.
--
-- Совместимость с Doki.id: колонка аддитивная, nullable. Doki.id пишет в
-- employer_profiles только user_id, company_name, contact_whatsapp,
-- contact_email, updated_at (Doki.id app/employer/actions.ts:27) —
-- verified_company_name не трогает, verified_at не ставит.
--
-- Не закрыто здесь (нужно решение владельца, см.
-- docs/ops/autonomy/tasks/T-DOKI-03.md): название до подтверждения никто
-- не проверяет; домены организации нигде не заполняются; работодатель
-- может сам перевести employments.status в 'ended'.
--
-- Откат:
--   drop trigger if exists employer_profiles_verified_name
--     on public.employer_profiles;
--   drop function if exists private.employer_profiles_verified_name();
--   private.discovery_denied_reason — вернуть версию из
--   20260819110000_talent_pool_confidential_discovery.sql;
--   alter table public.employer_profiles drop column if exists verified_company_name;
-- =====================================================================

alter table public.employer_profiles
  add column if not exists verified_company_name text;

-- ── Снимок названия при подтверждении + запрет клиенту ──────────────
create or replace function private.employer_profiles_verified_name()
returns trigger language plpgsql set search_path = public as $$
begin
  if current_user in ('authenticated', 'anon') then
    if tg_op = 'INSERT' then
      if new.verified_company_name is not null then
        raise exception 'EMPLOYER_PROTECTED_FIELDS' using errcode = '42501';
      end if;
    elsif new.verified_company_name is distinct from old.verified_company_name then
      raise exception 'EMPLOYER_PROTECTED_FIELDS' using errcode = '42501';
    end if;
  end if;

  -- Первое подтверждение фиксирует название. Повторное (после ручного
  -- снятия verified_at) снимок не перезаписывает: лишнее совпадение
  -- только сильнее скрывает кандидата.
  if new.verified_at is not null
     and new.verified_company_name is null
     and (tg_op = 'INSERT' or old.verified_at is null)
  then
    new.verified_company_name := new.company_name;
  end if;
  return new;
end; $$;

drop trigger if exists employer_profiles_verified_name on public.employer_profiles;
create trigger employer_profiles_verified_name
  before insert or update on public.employer_profiles
  for each row execute function private.employer_profiles_verified_name();

-- Уже подтверждённые: снимок = текущее название. Если работодатель успел
-- переименоваться до этой миграции, прежнее название не восстановить.
update public.employer_profiles
   set verified_company_name = company_name
 where verified_at is not null
   and verified_company_name is null;

-- ── Сверка «текущего работодателя» ─────────────────────────────────
-- Остальная функция без изменений относительно 20260819110000.
-- Порядок проверок повторяет lib/passportVisibility.ts::discoveryDecision.
create or replace function private.discovery_denied_reason(
  p_user uuid, p_employer uuid
) returns text language plpgsql stable security definer set search_path = public as $$
declare
  v_policy profile_visibility_policies;
  v_member talent_pool_memberships;
  v_intent text;
  v_org employer_profiles;
begin
  select * into v_org from employer_profiles where id = p_employer;
  if not found then return 'organization_not_verified'; end if;

  select * into v_policy from profile_visibility_policies where user_id = p_user;
  if not found then return 'visibility_private'; end if;

  -- Блокировка организации или её известного домена — абсолютна.
  if exists (
    select 1 from organization_discovery_blocks b
    where b.user_id = p_user
      and (b.employer_id = p_employer
        or (b.domain is not null and exists (
              select 1 from jsonb_array_elements_text(v_org.domains) d
              where lower(d) = lower(b.domain))))
  ) then
    return 'organization_blocked';
  end if;

  -- Текущий работодатель: действующее трудоустройство в этой организации
  -- или совпадение с названием (текущим либо на момент подтверждения)
  -- или доменом.
  if v_policy.hide_current_employer and (
    exists (
      select 1 from employments e
      where e.employee_user_id = p_user
        and e.company_id = p_employer
        and e.status = 'active'
    )
    or exists (
      select 1 from jsonb_array_elements_text(v_policy.current_employer_names) n
      where lower(trim(n)) = lower(trim(coalesce(v_org.company_name,'')))
         or lower(trim(n)) = lower(trim(coalesce(v_org.verified_company_name,'')))
         or exists (select 1 from jsonb_array_elements_text(v_org.domains) d
                    where lower(d) = lower(trim(n)))
    )
  ) then
    return 'current_employer_hidden';
  end if;

  if v_org.verified_at is null
     or v_org.verification_revoked_at is not null
     or (v_org.verification_expires_at is not null and v_org.verification_expires_at <= now())
  then
    return 'organization_not_verified';
  end if;

  if v_policy.mode = 'private' then return 'visibility_private'; end if;

  select coalesce(search_intent,'open') into v_intent from resumes where user_id = p_user;
  if v_intent is null or v_intent = 'unavailable' then return 'candidate_unavailable'; end if;

  select * into v_member from talent_pool_memberships where user_id = p_user;
  if v_member is null or v_member.state <> 'active'
     or (v_member.expires_at is not null and v_member.expires_at <= now())
  then
    return 'membership_inactive';
  end if;

  if not exists (
    select 1 from purpose_authorizations a
    where a.user_id = p_user
      and a.purpose = 'talent_pool_discovery'
      and a.revoked_at is null
      and (a.expires_at is null or a.expires_at > now())
      and a.granted_at <= now()
  ) then
    return 'authorization_inactive';
  end if;

  -- `invited_only` и `recommendations_only` не дают работодателю поиск.
  if v_policy.mode in ('invited_only','recommendations_only')
     and not exists (
       select 1 from profile_access_grants g
       where g.user_id = p_user and g.employer_id = p_employer
         and g.revoked_at is null
         and (g.expires_at is null or g.expires_at > now())
     )
  then
    return case v_policy.mode when 'invited_only' then 'invited_only'
                              else 'recommendations_only' end;
  end if;

  return null;
end; $$;

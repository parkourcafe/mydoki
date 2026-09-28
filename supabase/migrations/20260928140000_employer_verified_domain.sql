-- =====================================================================
-- Подтверждение работодателя: домен подтверждённой почты и честный бейдж.
-- (вопросы владельца 52–53, docs/ops/autonomy/tasks/T-DOKI-04.md)
--
-- Что подтверждает Doki сегодня: только контроль над почтовым ящиком —
-- 6-значный код уходит на contact_email (или email аккаунта, если
-- contact_email пуст; app/employer/actions.ts requestEmployerVerification).
-- Название компании никто не проверяет, а employer_profiles.domains
-- (20260819110000) никогда и ничем не заполнялись — поэтому сверка
-- «текущий работодатель» и блокировка по домену в Talent Pool работали
-- только по названию.
--
-- 1. verification_email — адрес, на который ушёл код. Ставится в
--    set_employer_verification по тому же правилу, что и в приложении
--    (contact_email, иначе email аккаунта), поэтому смена contact_email
--    между запросом и вводом кода не подменяет подтверждённый адрес.
--    Клиентским ролям колонка недоступна (EMPLOYER_PROTECTED_FIELDS).
-- 2. confirm_employer_verification при успехе добавляет домен этого
--    адреса в domains — кроме публичных почтовых сервисов (gmail и т. п.):
--    их домен не принадлежит организации. Отсутствие домена ничего не
--    ломает: verified_at ставится как раньше, вакансии и Talent Pool
--    доступны. Домен — только для скрытия/блокировки в Talent Pool.
-- 3. apply_vacancy_meta: бейдж на странице отклика показывается, только
--    если подтверждение действует (не отозвано) и название в вакансии
--    совпадает с названием профиля (текущим или на момент подтверждения):
--    company_name вакансии — свободный текст (create_vacancy p_company_name),
--    и раньше «✓» стоял рядом с любым названием, которое работодатель вписал
--    в конкретную вакансию. Дополнительно отдаётся verified_domain —
--    UI показывает, что именно подтверждено.
-- 4. set_employer_verification для уже подтверждённого профиля ничего не
--    делает: приложение его в этом случае не вызывает, а прямой вызов RPC
--    ставил бы verification_expires_at и через 15 минут отключал Talent
--    Pool (то, что чинил 20260928120000).
--
-- Уже подтверждённые работодатели домен НЕ получают: их contact_email на
-- сегодня не доказан (мог смениться после ввода кода). Решение о разовом
-- заполнении — за владельцем (SQL в журнале задачи).
--
-- Совместимость с Doki.id: колонка аддитивная, nullable; Doki.id пишет в
-- employer_profiles только user_id, company_name, contact_whatsapp,
-- contact_email, updated_at и не вызывает set_/confirm_employer_verification.
--
-- Откат:
--   drop trigger if exists employer_profiles_verification_email
--     on public.employer_profiles;
--   drop function if exists private.employer_profiles_verification_email();
--   drop function if exists private.is_public_email_domain(text);
--   drop function if exists private.email_domain(text);
--   set_/confirm_employer_verification и apply_vacancy_meta — вернуть версии
--   из 20260928120000 (confirm) и 20260704000000 (set, apply_vacancy_meta);
--   alter table public.employer_profiles drop column if exists verification_email;
--   (добавленные домены остаются — это подтверждённые данные.)
-- =====================================================================

alter table public.employer_profiles
  add column if not exists verification_email text;

-- ── Хелперы: домен адреса и публичные почтовые сервисы ──────────────
create or replace function private.email_domain(p_email text)
returns text language sql immutable as $$
  select case
    when p_email is null then null
    when position('@' in p_email) = 0 then null
    else nullif(lower(trim(split_part(p_email, '@', 2))), '')
  end;
$$;

-- Публичные почтовые сервисы: их домен не идентифицирует организацию.
-- Список расширяется миграцией; неизвестный сервис попадёт в domains, что
-- может только сильнее скрыть работодателя от кандидатов (не наоборот).
create or replace function private.is_public_email_domain(p_domain text)
returns boolean language sql immutable as $$
  select lower(coalesce(p_domain, '')) = any (array[
    'gmail.com', 'googlemail.com', 'yahoo.com', 'yahoo.co.id', 'yahoo.co.uk',
    'ymail.com', 'rocketmail.com', 'hotmail.com', 'hotmail.co.id', 'outlook.com',
    'outlook.co.id', 'live.com', 'msn.com', 'icloud.com', 'me.com', 'mac.com',
    'aol.com', 'protonmail.com', 'proton.me', 'pm.me', 'mail.com', 'gmx.com',
    'gmx.net', 'zoho.com', 'yandex.ru', 'yandex.com', 'ya.ru', 'mail.ru',
    'inbox.ru', 'list.ru', 'bk.ru', 'rambler.ru', 'qq.com', '163.com', '126.com',
    'naver.com', 'daum.net', 'telkom.net', 'plasa.com'
  ]);
$$;

-- ── Клиент не задаёт и не меняет verification_email ─────────────────
create or replace function private.employer_profiles_verification_email()
returns trigger language plpgsql set search_path = public as $$
begin
  if current_user in ('authenticated', 'anon') then
    if tg_op = 'INSERT' then
      if new.verification_email is not null then
        raise exception 'EMPLOYER_PROTECTED_FIELDS' using errcode = '42501';
      end if;
    elsif new.verification_email is distinct from old.verification_email then
      raise exception 'EMPLOYER_PROTECTED_FIELDS' using errcode = '42501';
    end if;
  end if;
  return new;
end; $$;

drop trigger if exists employer_profiles_verification_email on public.employer_profiles;
create trigger employer_profiles_verification_email
  before insert or update on public.employer_profiles
  for each row execute function private.employer_profiles_verification_email();

-- ── Запрос кода: запоминаем адрес получателя ────────────────────────
create or replace function public.set_employer_verification(
  p_code_hash text, p_expires_at timestamptz
) returns void language plpgsql security definer set search_path = public as $$
declare ep employer_profiles;
begin
  if auth.uid() is null then raise exception 'not authenticated'; end if;
  select * into ep from employer_profiles where user_id = auth.uid();
  if not found then raise exception 'no employer profile'; end if;
  -- Подтверждённому профилю код не нужен (см. шапку, п. 4).
  if ep.verified_at is not null then return; end if;

  update employer_profiles
     set verification_code_hash = p_code_hash,
         verification_expires_at = p_expires_at,
         verification_attempts = 0,
         -- То же правило, что в requestEmployerVerification:
         -- contact_email, иначе email аккаунта.
         verification_email = coalesce(nullif(trim(ep.contact_email), ''), auth.email()),
         updated_at = now()
   where user_id = auth.uid();
end; $$;
grant execute on function public.set_employer_verification(text,timestamptz) to authenticated;

-- ── Ввод кода: verified_at + домен подтверждённой почты ─────────────
create or replace function public.confirm_employer_verification(p_code_hash text)
returns boolean language plpgsql security definer set search_path = public as $$
declare ep employer_profiles; v_email text; v_domain text;
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
    -- Код, запрошенный до этой миграции, verification_email не имеет —
    -- тогда берём то, куда приложение его отправило бы сейчас.
    v_email  := coalesce(ep.verification_email,
                         nullif(trim(ep.contact_email), ''), auth.email());
    v_domain := private.email_domain(v_email);

    update employer_profiles
       set verified_at = now(), verification_channel = 'email',
           verification_code_hash = null, verification_expires_at = null,
           verification_email = v_email,
           domains = case
             when v_domain is null or private.is_public_email_domain(v_domain)
               then domains
             when exists (select 1 from jsonb_array_elements_text(domains) d
                           where lower(d) = v_domain)
               then domains
             else domains || to_jsonb(v_domain)
           end,
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

-- ── Публичная мета для страницы отклика ─────────────────────────────
-- verified: подтверждение действует и название в вакансии — это название
-- профиля (текущее или на момент подтверждения). verified_domain: домен
-- организации из подтверждённой почты (null, если почта публичная или
-- подтверждение прошло до заполнения доменов). Никаких таймстемпов наружу.
create or replace function public.apply_vacancy_meta(p_slug text)
returns jsonb language sql security definer set search_path = public stable as $$
  select case when v.id is null then null else jsonb_build_object(
    'status', v.status,
    'verified', (
      ep.verified_at is not null
      and ep.verification_revoked_at is null
      and lower(trim(coalesce(v.company_name, ''))) in (
        lower(trim(coalesce(ep.company_name, ''))),
        lower(trim(coalesce(ep.verified_company_name, ep.company_name, '')))
      )
    ),
    'verified_domain', case
      when ep.verified_at is not null and ep.verification_revoked_at is null
        then (select d from jsonb_array_elements_text(ep.domains) with ordinality as t(d, n)
               where not private.is_public_email_domain(d)
               order by n limit 1)
      else null
    end
  ) end
  from vacancies v
  left join employer_profiles ep on ep.id = v.employer_id
  where v.slug = p_slug;
$$;
grant execute on function public.apply_vacancy_meta(text) to anon, authenticated;

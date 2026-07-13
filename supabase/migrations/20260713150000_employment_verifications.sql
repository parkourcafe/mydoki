-- =====================================================================
-- P4-4 (фаза 4): Внешние подтверждения занятости. По СОГЛАСИЮ человека
-- (человек сам создаёт секретную ссылку) третья сторона может проверить
-- ФАКТ и ПЕРИОД работы. Данные — из записи работодателя (manual=false).
--
-- Показываются ТОЛЬКО факты: компания, должность, тип, период, статус.
-- НЕ показываются: оплата, причины, любые оценки/характеристики (§10/§15 —
-- без вердиктов). Человек может отозвать ссылку в любой момент.
--
-- Аддитивно и совместимо с Doki.id: новая таблица + RPC; общих таблиц не
-- трогаем.
--
-- План отката (rollback):
--   drop function if exists get_employment_verification(text);
--   drop function if exists revoke_employment_verification(uuid);
--   drop function if exists create_employment_verification(uuid);
--   drop table if exists employment_verifications;

create table if not exists employment_verifications (
  id            uuid primary key default gen_random_uuid(),
  employment_id uuid not null references employments(id) on delete cascade,
  token         text not null unique,
  created_by    uuid references auth.users(id),
  created_at    timestamptz not null default now(),
  revoked_at    timestamptz,
  expires_at    timestamptz,
  view_count    integer not null default 0
);
create index if not exists employment_verifications_employment_idx
  on employment_verifications(employment_id);

alter table employment_verifications enable row level security;

-- Человек видит свои ссылки (по своей employment-записи). Запись — только
-- через SECURITY DEFINER RPC (публичное чтение — тоже RPC по токену).
do $$ begin
  create policy "verif person read" on employment_verifications for select
    using (employment_id in (
      select id from employments where employee_user_id = (select auth.uid())
    ));
exception when duplicate_object then null; end $$;

grant select on employment_verifications to authenticated;

-- ── RPC: человек создаёт ссылку-подтверждение ───────────────────────
-- Только для записей ОТ РАБОТОДАТЕЛЯ (manual=false): ручные (самодобавленные)
-- нельзя выдавать за подтверждённые работодателем. Один активный линк на
-- employment (повторный вызов возвращает существующий токен).
create or replace function public.create_employment_verification(p_employment_id uuid)
returns text language plpgsql volatile security definer set search_path = public as $$
declare v_employee uuid; v_manual boolean; v_existing text; v_token text;
begin
  if auth.uid() is null then raise exception 'not authenticated'; end if;
  select employee_user_id, manual into v_employee, v_manual
  from employments where id = p_employment_id;
  if v_employee is null then raise exception 'employment not found'; end if;
  if v_employee <> auth.uid() then raise exception 'not authorized'; end if;
  if v_manual then raise exception 'manual employment cannot be verified'; end if;

  select token into v_existing from employment_verifications
  where employment_id = p_employment_id and revoked_at is null;
  if v_existing is not null then return v_existing; end if;

  v_token := replace(gen_random_uuid()::text, '-', '')
          || replace(gen_random_uuid()::text, '-', '');
  insert into employment_verifications(employment_id, token, created_by)
  values (p_employment_id, v_token, auth.uid());
  return v_token;
end; $$;
grant execute on function public.create_employment_verification(uuid) to authenticated;

-- ── RPC: человек отзывает ссылку ────────────────────────────────────
create or replace function public.revoke_employment_verification(p_employment_id uuid)
returns boolean language plpgsql volatile security definer set search_path = public as $$
declare v_employee uuid;
begin
  if auth.uid() is null then raise exception 'not authenticated'; end if;
  select employee_user_id into v_employee from employments where id = p_employment_id;
  if v_employee is null or v_employee <> auth.uid() then raise exception 'not authorized'; end if;
  update employment_verifications set revoked_at = now()
  where employment_id = p_employment_id and revoked_at is null;
  return true;
end; $$;
grant execute on function public.revoke_employment_verification(uuid) to authenticated;

-- ── RPC: публичная проверка по токену (только факты) ────────────────
create or replace function public.get_employment_verification(p_token text)
returns jsonb language plpgsql volatile security definer set search_path = public as $$
declare v employment_verifications; e employments;
begin
  select * into v from employment_verifications where token = p_token;
  if v.id is null or v.revoked_at is not null
     or (v.expires_at is not null and v.expires_at < now()) then
    return null;
  end if;
  select * into e from employments where id = v.employment_id;
  if e.id is null then return null; end if;

  update employment_verifications set view_count = view_count + 1 where id = v.id;

  -- ТОЛЬКО факты. Никакой оплаты/причин/оценок.
  return jsonb_build_object(
    'company_name', e.company_name,
    'position', e.position,
    'employment_type', e.employment_type,
    'start_date', e.start_date,
    'end_date', e.end_date,
    'status', e.status,
    'verified_at', now()
  );
end; $$;
grant execute on function public.get_employment_verification(text) to anon, authenticated;

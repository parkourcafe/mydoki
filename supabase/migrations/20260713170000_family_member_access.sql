-- =====================================================================
-- Семейные роли и доступ (арх. §3.3/§7.2/§14 Фаза 4) — управление участниками.
--
-- Модель семьи уже существует (households / household_members с ролями
-- owner|editor|viewer / members-субъекты / invitations). Не хватало
-- УПРАВЛЕНИЯ доступом: сменить роль участника, удалить участника, выйти из
-- семьи — с инвариантом «в семье всегда есть хотя бы один owner».
--
-- Инвариант нельзя держать только в UI (§12.1: серверная проверка каждого
-- действия, без ad-hoc проверок в UI). Поэтому изменения идут через
-- SECURITY DEFINER RPC с гардами и записью в audit_log.
--
-- Аддитивно: НЕ трогаем существующие политики/гранты (общая БД с Doki.id).
-- Политика "hm manage" по-прежнему разрешает owner прямые записи; эти RPC —
-- безопасный путь с гардом инварианта, которым пользуется UI doki.help.
--
-- План отката (rollback):
--   drop function if exists public.set_household_member_role(uuid, uuid, household_role);
--   drop function if exists public.remove_household_member(uuid, uuid);

-- ---------------------------------------------------------------------
-- Сменить роль участника семьи. Только owner. Нельзя понизить последнего
-- owner (иначе семья остаётся без владельца).
-- ---------------------------------------------------------------------
create or replace function public.set_household_member_role(
  p_household uuid, p_user uuid, p_role household_role)
returns void language plpgsql volatile security definer set search_path = public as $$
declare
  v_current household_role;
  v_owner_count int;
begin
  if auth.uid() is null then raise exception 'not authenticated'; end if;
  if not private.is_household_owner(p_household) then
    raise exception 'only the household owner can change roles';
  end if;

  select role into v_current
    from household_members
    where household_id = p_household and user_id = p_user;
  if not found then
    raise exception 'user is not a member of this household';
  end if;

  -- Нечего менять — идемпотентный выход.
  if v_current = p_role then
    return;
  end if;

  -- Инвариант: понижение последнего owner запрещено.
  if v_current = 'owner' and p_role <> 'owner' then
    select count(*) into v_owner_count
      from household_members
      where household_id = p_household and role = 'owner';
    if v_owner_count <= 1 then
      raise exception 'household must keep at least one owner';
    end if;
  end if;

  update household_members set role = p_role
    where household_id = p_household and user_id = p_user;

  perform log_audit(p_household, 'household.member_role_changed', 'household_member',
    p_user::text, jsonb_build_object('from', v_current, 'to', p_role));
end; $$;
revoke execute on function public.set_household_member_role(uuid, uuid, household_role) from public, anon;
grant execute on function public.set_household_member_role(uuid, uuid, household_role) to authenticated;

-- ---------------------------------------------------------------------
-- Удалить участника из семьи. Owner может удалить любого; любой участник
-- может удалить себя (выход из семьи). Нельзя удалить последнего owner —
-- сначала передайте роль владельца другому участнику.
-- ---------------------------------------------------------------------
create or replace function public.remove_household_member(
  p_household uuid, p_user uuid)
returns void language plpgsql volatile security definer set search_path = public as $$
declare
  v_current household_role;
  v_owner_count int;
  v_is_self boolean := (p_user = auth.uid());
begin
  if auth.uid() is null then raise exception 'not authenticated'; end if;
  -- Право: owner (удаляет кого угодно) ИЛИ сам участник (выходит).
  if not (private.is_household_owner(p_household) or v_is_self) then
    raise exception 'only the household owner can remove other members';
  end if;

  select role into v_current
    from household_members
    where household_id = p_household and user_id = p_user;
  if not found then
    -- Уже не участник — идемпотентный выход.
    return;
  end if;

  -- Инвариант: нельзя удалить последнего owner.
  if v_current = 'owner' then
    select count(*) into v_owner_count
      from household_members
      where household_id = p_household and role = 'owner';
    if v_owner_count <= 1 then
      raise exception 'cannot remove the last owner; transfer ownership first';
    end if;
  end if;

  delete from household_members
    where household_id = p_household and user_id = p_user;

  perform log_audit(p_household, 'household.member_removed', 'household_member',
    p_user::text, jsonb_build_object('role', v_current, 'self', v_is_self));
end; $$;
revoke execute on function public.remove_household_member(uuid, uuid) from public, anon;
grant execute on function public.remove_household_member(uuid, uuid) to authenticated;

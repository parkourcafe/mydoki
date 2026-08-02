-- =====================================================================
-- F-2 · Делегированный доступ по ЦЕЛИ и СРОКУ (арх. §7.2/§3.3/§14 Семья).
--
-- §7.2: «доступ выдаётся на конкретную цель и срок», «делегированный доступ».
-- Это granular-слой МЕЖДУ бланковым членством в семье (household_members —
-- полный доступ, бессрочно) и анонимными share-ссылками (shares — без
-- аккаунта, конкретные документы): владелец выдаёт ИМЕНОВАННОМУ пользователю
-- read-доступ к области (весь vault ИЛИ одна категория) с указанием ЦЕЛИ и
-- обязательным СРОКОМ; доступ автоматически истекает и отзывается.
--
-- Первый юнит — доступ к МЕТАДАННЫМ документов (список/детали: название,
-- категория, номер, даты, эмитент), без скачивания файлов. Скачивание
-- требует правки storage-политик общего бакета — отдельный следующий шаг.
--
-- Инварианты: аддитивно (общая БД с Doki.id); RLS — граница; изменения
-- состояния только через SECURITY DEFINER RPC с гардами; permissive
-- read-политика на documents ТОЛЬКО РАСШИРЯЕТ доступ (и только когда есть
-- активная не-истёкшая делегация); аудит каждого действия.
--
-- План отката (rollback):
--   drop policy if exists "documents delegated read" on documents;
--   drop function if exists private.can_delegate_read_document(uuid);
--   drop function if exists create_vault_delegation(uuid,text,text,text,timestamptz);
--   drop function if exists get_vault_delegation(text);
--   drop function if exists accept_vault_delegation(text);
--   drop function if exists revoke_vault_delegation(uuid);
--   drop table if exists vault_delegations;

-- ---------------------------------------------------------------------
create table if not exists vault_delegations (
  id              uuid primary key default gen_random_uuid(),
  household_id    uuid not null references households(id) on delete cascade,
  grantee_user_id uuid,                        -- заполняется при принятии
  invite_email    text,                        -- необязательная подсказка кому
  token           text not null unique default replace(gen_random_uuid()::text, '-', ''),
  scope           text not null check (scope in ('all','category')),
  scope_category  text,                         -- обязателен при scope='category'
  purpose         text not null,                -- ЦЕЛЬ (§7.2)
  expires_at      timestamptz not null,         -- СРОК (§7.2)
  status          text not null default 'pending' check (status in ('pending','active','revoked')),
  created_by      uuid not null default auth.uid(),
  created_at      timestamptz not null default now(),
  accepted_at     timestamptz,
  revoked_at      timestamptz
);
create index if not exists vault_delegations_household_idx on vault_delegations(household_id, created_at desc);
create index if not exists vault_delegations_token_idx on vault_delegations(token);
create index if not exists vault_delegations_grantee_idx on vault_delegations(grantee_user_id) where grantee_user_id is not null;

alter table vault_delegations enable row level security;

-- Читают: члены семьи (владелец видит выданные) и получатель (свои).
-- Пишут — только через RPC ниже (прямых write-политик нет).
create policy "delegation household read" on vault_delegations for select
  using (private.is_household_member(household_id));
create policy "delegation grantee read" on vault_delegations for select
  using (grantee_user_id = (select auth.uid()));

revoke all on vault_delegations from anon;
grant select on vault_delegations to authenticated;

-- ---------------------------------------------------------------------
-- Активна ли делегация для текущего пользователя, покрывающая документ.
-- SECURITY DEFINER (owner обходит RLS documents — рекурсии нет).
-- ---------------------------------------------------------------------
create or replace function private.can_delegate_read_document(p_document_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1
    from documents d
    join vault_delegations vd on vd.household_id = d.household_id
    where d.id = p_document_id
      and vd.grantee_user_id = auth.uid()
      and vd.status = 'active'
      and vd.revoked_at is null
      and vd.expires_at > now()
      and (vd.scope = 'all'
           or (vd.scope = 'category' and vd.scope_category = d.category::text))
  );
$$;
grant execute on function private.can_delegate_read_document(uuid) to authenticated;

-- Permissive (OR) read-политика: расширяет доступ к МЕТАДАННЫМ документа
-- для активного получателя делегации. Не влияет на членов семьи/владельца.
create policy "documents delegated read" on documents for select
  using (private.can_delegate_read_document(id));

-- ---------------------------------------------------------------------
-- Выдать делегацию. Только владелец/редактор семьи. Возвращает токен.
-- ---------------------------------------------------------------------
create or replace function create_vault_delegation(
  p_household uuid, p_scope text, p_category text, p_purpose text, p_expires_at timestamptz)
returns text language plpgsql volatile security definer set search_path = public as $$
declare v_token text;
begin
  if auth.uid() is null then raise exception 'not authenticated'; end if;
  if not private.is_household_editor(p_household) then
    raise exception 'only a family owner or editor can grant delegated access';
  end if;
  if p_scope not in ('all','category') then raise exception 'invalid scope'; end if;
  if p_scope = 'category' and coalesce(trim(p_category),'') = '' then
    raise exception 'category is required for a category-scoped delegation';
  end if;
  if coalesce(trim(p_purpose),'') = '' then raise exception 'purpose is required'; end if;
  if p_expires_at is null or p_expires_at <= now() then
    raise exception 'expiry must be in the future';
  end if;

  insert into vault_delegations(household_id, scope, scope_category, purpose, expires_at)
  values (p_household, p_scope,
          case when p_scope = 'category' then trim(p_category) else null end,
          trim(p_purpose), p_expires_at)
  returning token into v_token;

  perform log_audit(p_household, 'delegation.created', 'vault_delegation', v_token,
    jsonb_build_object('scope', p_scope, 'category', p_category, 'expires_at', p_expires_at));
  return v_token;
end; $$;
revoke execute on function create_vault_delegation(uuid,text,text,text,timestamptz) from public, anon;
grant execute on function create_vault_delegation(uuid,text,text,text,timestamptz) to authenticated;

-- ---------------------------------------------------------------------
-- Инфо по токену для страницы принятия (минимум данных; получатель ещё не
-- член семьи и не привязан). Возвращает null если недоступно.
-- ---------------------------------------------------------------------
create or replace function get_vault_delegation(p_token text)
returns jsonb language plpgsql stable security definer set search_path = public as $$
declare d vault_delegations; hname text;
begin
  select * into d from vault_delegations where token = p_token;
  if not found or d.status <> 'pending' or d.expires_at <= now() or d.revoked_at is not null then
    return null;
  end if;
  select name into hname from households where id = d.household_id;
  return jsonb_build_object(
    'household', hname, 'scope', d.scope, 'category', d.scope_category,
    'purpose', d.purpose, 'expires_at', d.expires_at);
end; $$;
revoke execute on function get_vault_delegation(text) from public, anon;
grant execute on function get_vault_delegation(text) to authenticated;

-- ---------------------------------------------------------------------
-- Принять делегацию: привязывает текущего пользователя как получателя.
-- ---------------------------------------------------------------------
create or replace function accept_vault_delegation(p_token text)
returns uuid language plpgsql volatile security definer set search_path = public as $$
declare d vault_delegations;
begin
  if auth.uid() is null then raise exception 'not authenticated'; end if;
  select * into d from vault_delegations where token = p_token;
  if not found or d.status <> 'pending' or d.expires_at <= now() or d.revoked_at is not null then
    return null;
  end if;
  update vault_delegations
    set grantee_user_id = auth.uid(), status = 'active', accepted_at = now()
    where id = d.id;
  -- Пишем напрямую: получатель НЕ член семьи, membership-гард log_audit
  -- отбросил бы запись о принятии (§12.1 — журнал каждого действия).
  insert into audit_log(household_id, actor_user_id, action, entity_type, entity_id, metadata)
  values (d.household_id, auth.uid(), 'delegation.accepted', 'vault_delegation', d.token,
          jsonb_build_object('grantee', auth.uid()));
  return d.household_id;
end; $$;
revoke execute on function accept_vault_delegation(text) from public, anon;
grant execute on function accept_vault_delegation(text) to authenticated;

-- ---------------------------------------------------------------------
-- Отозвать делегацию. Владелец/редактор семьи ИЛИ сам получатель.
-- ---------------------------------------------------------------------
create or replace function revoke_vault_delegation(p_id uuid)
returns void language plpgsql volatile security definer set search_path = public as $$
declare d vault_delegations;
begin
  if auth.uid() is null then raise exception 'not authenticated'; end if;
  select * into d from vault_delegations where id = p_id;
  if not found then return; end if;
  if not (private.is_household_editor(d.household_id) or d.grantee_user_id = auth.uid()) then
    raise exception 'not authorized to revoke this delegation';
  end if;
  if d.status = 'revoked' then return; end if;   -- идемпотентно
  update vault_delegations set status = 'revoked', revoked_at = now() where id = d.id;
  -- Напрямую: отзывать может и получатель (не член семьи) — log_audit отбросил бы.
  insert into audit_log(household_id, actor_user_id, action, entity_type, entity_id, metadata)
  values (d.household_id, auth.uid(), 'delegation.revoked', 'vault_delegation', d.token,
          jsonb_build_object('by', auth.uid()));
end; $$;
revoke execute on function revoke_vault_delegation(uuid) from public, anon;
grant execute on function revoke_vault_delegation(uuid) to authenticated;

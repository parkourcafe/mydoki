-- Приглашения в семью (link-based, без рассылки писем сервером).
create table invitations (
  id           uuid primary key default gen_random_uuid(),
  household_id uuid not null references households(id) on delete cascade,
  role         household_role not null default 'viewer',
  token        text not null unique default replace(gen_random_uuid()::text, '-', ''),
  email        text,
  created_by   uuid not null default auth.uid(),
  expires_at   timestamptz not null default now() + interval '14 days',
  accepted_at  timestamptz,
  accepted_by  uuid,
  created_at   timestamptz not null default now()
);
create index on invitations(household_id);
create index on invitations(token);

alter table invitations enable row level security;

-- Видят члены семьи; создаёт/отзывает только owner.
create policy "inv read" on invitations for select using (is_household_member(household_id));
create policy "inv manage" on invitations for all
  using (is_household_owner(household_id)) with check (is_household_owner(household_id));

-- Инфо о приглашении по токену (для страницы принятия). Приглашаемый ещё не
-- член семьи, поэтому SECURITY DEFINER (минимум данных, токен — секрет).
create or replace function get_invitation(p_token text)
returns jsonb language plpgsql stable security definer set search_path = public as $$
declare inv invitations; hname text;
begin
  select * into inv from invitations where token = p_token;
  if not found or inv.accepted_at is not null or inv.expires_at < now() then
    return null;
  end if;
  select name into hname from households where id = inv.household_id;
  return jsonb_build_object('household', hname, 'role', inv.role);
end; $$;
revoke execute on function get_invitation(text) from public, anon;
grant execute on function get_invitation(text) to authenticated;

-- Принять приглашение: добавляет текущего пользователя в household_members.
create or replace function accept_invitation(p_token text)
returns uuid language plpgsql volatile security definer set search_path = public as $$
declare inv invitations;
begin
  if auth.uid() is null then raise exception 'not authenticated'; end if;
  select * into inv from invitations where token = p_token;
  if not found or inv.accepted_at is not null or inv.expires_at < now() then
    return null;
  end if;
  insert into household_members(household_id, user_id, role)
    values (inv.household_id, auth.uid(), inv.role)
    on conflict (household_id, user_id) do update set role = excluded.role;
  update invitations set accepted_at = now(), accepted_by = auth.uid()
    where id = inv.id;
  return inv.household_id;
end; $$;
revoke execute on function accept_invitation(text) from public, anon;
grant execute on function accept_invitation(text) to authenticated;
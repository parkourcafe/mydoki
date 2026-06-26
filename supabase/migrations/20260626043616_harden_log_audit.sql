-- Security: log_audit is SECURITY DEFINER and granted to authenticated so the
-- app can record audit entries. Guard the write so a caller can only log for a
-- household they belong to — prevents forging audit_log rows for an arbitrary
-- household_id. create or replace preserves the existing execute grants.
create or replace function public.log_audit(
  p_household uuid, p_action text,
  p_entity_type text default null, p_entity_id text default null,
  p_metadata jsonb default '{}'::jsonb)
returns void language sql security definer set search_path = public as $$
  insert into audit_log(household_id, actor_user_id, action, entity_type, entity_id, metadata)
  select p_household, auth.uid(), p_action, p_entity_type, p_entity_id, coalesce(p_metadata, '{}'::jsonb)
  where private.is_household_member(p_household);
$$;

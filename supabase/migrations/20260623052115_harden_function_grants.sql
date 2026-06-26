-- Внутренние хелперы и пишущие RPC не должны быть доступны анонимам через
-- PostgREST. Публичной остаётся только get_shared_document (share-ссылки).
revoke execute on function
  public.current_user_household_ids(),
  public.is_household_member(uuid),
  public.is_household_editor(uuid),
  public.is_household_owner(uuid),
  public.create_household(text),
  public.log_audit(uuid, text, text, text, jsonb),
  public.revoke_share(uuid)
from public, anon;

-- authenticated нужен этим функциям (их вызывают RLS-политики и кабинет).
grant execute on function
  public.current_user_household_ids(),
  public.is_household_member(uuid),
  public.is_household_editor(uuid),
  public.is_household_owner(uuid),
  public.create_household(text),
  public.log_audit(uuid, text, text, text, jsonb),
  public.revoke_share(uuid)
to authenticated;
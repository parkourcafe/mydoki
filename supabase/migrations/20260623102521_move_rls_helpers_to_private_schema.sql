-- Схема private не экспонируется PostgREST → хелперы перестанут быть REST-RPC.
create schema if not exists private;
grant usage on schema private to authenticated;

create or replace function private.current_user_household_ids()
returns setof uuid language sql stable security definer set search_path = public as $$
  select household_id from household_members where user_id = auth.uid();
$$;
create or replace function private.is_household_member(hid uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from household_members
                 where household_id = hid and user_id = auth.uid());
$$;
create or replace function private.is_household_editor(hid uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from household_members
                 where household_id = hid and user_id = auth.uid()
                   and role in ('owner','editor'));
$$;
create or replace function private.is_household_owner(hid uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from household_members
                 where household_id = hid and user_id = auth.uid() and role = 'owner');
$$;

revoke execute on function
  private.current_user_household_ids(), private.is_household_member(uuid),
  private.is_household_editor(uuid), private.is_household_owner(uuid)
from public;
grant execute on function
  private.current_user_household_ids(), private.is_household_member(uuid),
  private.is_household_editor(uuid), private.is_household_owner(uuid)
to authenticated;

-- revoke_share переводим на private-хелпер
create or replace function revoke_share(p_share_id uuid)
returns void language sql volatile security definer set search_path = public as $$
  update shares set revoked_at = now()
  where id = p_share_id and private.is_household_editor(household_id);
$$;

-- Пересоздаём все политики со ссылкой на private.*
drop policy "household read" on households;
create policy "household read" on households for select using (private.is_household_member(id));
drop policy "household manage" on households;
create policy "household manage" on households for update using (private.is_household_owner(id));

drop policy "hm read" on household_members;
create policy "hm read" on household_members for select using (private.is_household_member(household_id));
drop policy "hm manage" on household_members;
create policy "hm manage" on household_members for all
  using (private.is_household_owner(household_id)) with check (private.is_household_owner(household_id));

drop policy "members read" on members;
create policy "members read" on members for select using (private.is_household_member(household_id));
drop policy "members write" on members;
create policy "members write" on members for all
  using (private.is_household_editor(household_id)) with check (private.is_household_editor(household_id));

drop policy "documents read" on documents;
create policy "documents read" on documents for select using (private.is_household_member(household_id));
drop policy "documents write" on documents;
create policy "documents write" on documents for all
  using (private.is_household_editor(household_id)) with check (private.is_household_editor(household_id));

drop policy "files read" on document_files;
create policy "files read" on document_files for select using (private.is_household_member(household_id));
drop policy "files write" on document_files;
create policy "files write" on document_files for all
  using (private.is_household_editor(household_id)) with check (private.is_household_editor(household_id));

drop policy "records read" on records;
create policy "records read" on records for select using (private.is_household_member(household_id));
drop policy "records write" on records;
create policy "records write" on records for all
  using (private.is_household_editor(household_id)) with check (private.is_household_editor(household_id));

drop policy "reminders read" on reminders;
create policy "reminders read" on reminders for select using (private.is_household_member(household_id));
drop policy "reminders write" on reminders;
create policy "reminders write" on reminders for all
  using (private.is_household_editor(household_id)) with check (private.is_household_editor(household_id));

drop policy "shares read" on shares;
create policy "shares read" on shares for select using (private.is_household_member(household_id));
drop policy "shares write" on shares;
create policy "shares write" on shares for all
  using (private.is_household_editor(household_id)) with check (private.is_household_editor(household_id));

drop policy "audit read" on audit_log;
create policy "audit read" on audit_log for select using (private.is_household_member(household_id));

drop policy "consents read" on consents;
create policy "consents read" on consents for select using (private.is_household_member(household_id));
drop policy "consents write" on consents;
create policy "consents write" on consents for all
  using (private.is_household_editor(household_id)) with check (private.is_household_editor(household_id));

drop policy "inv read" on invitations;
create policy "inv read" on invitations for select using (private.is_household_member(household_id));
drop policy "inv manage" on invitations;
create policy "inv manage" on invitations for all
  using (private.is_household_owner(household_id)) with check (private.is_household_owner(household_id));

drop policy "vault read files" on storage.objects;
create policy "vault read files" on storage.objects for select
  using (bucket_id = 'vault-files'
         and (storage.foldername(name))[1]::uuid in (select private.current_user_household_ids()));
drop policy "vault write files" on storage.objects;
create policy "vault write files" on storage.objects for insert
  with check (bucket_id = 'vault-files'
         and (storage.foldername(name))[1]::uuid in (select private.current_user_household_ids()));
drop policy "vault delete files" on storage.objects;
create policy "vault delete files" on storage.objects for delete
  using (bucket_id = 'vault-files'
         and (storage.foldername(name))[1]::uuid in (select private.current_user_household_ids()));

-- Удаляем публичные хелперы (зависимостей больше нет)
drop function public.current_user_household_ids();
drop function public.is_household_member(uuid);
drop function public.is_household_editor(uuid);
drop function public.is_household_owner(uuid);
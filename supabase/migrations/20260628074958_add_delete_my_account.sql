-- Самоудаление аккаунта: пользователь может удалить себя и все свои данные.
-- SECURITY DEFINER, но действует строго над auth.uid() — удалить можно только себя.
create or replace function delete_my_account()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  hid uuid;
begin
  if uid is null then
    raise exception 'not authenticated';
  end if;

  -- Пространства, где пользователь — владелец: удаляем целиком. Каскад уносит
  -- members, documents, document_files, records, reminders, shares, assets,
  -- custom_doc_categories, consents, invitations, reminder_sent.
  for hid in
    select household_id from household_members
    where user_id = uid and role = 'owner'
  loop
    -- Файлы из приватного бакета (метаданные уйдут по каскаду). Не блокируем
    -- удаление аккаунта, если со storage что-то пошло не так.
    begin
      delete from storage.objects
        where bucket_id = 'vault-files'
          and (storage.foldername(name))[1] = hid::text;
    exception when others then
      null;
    end;
    delete from households where id = hid;
  end loop;

  -- Из остальных пространств (где он просто участник) — убираем членство.
  delete from household_members where user_id = uid;

  -- Подчищаем согласия, оставшиеся вне удалённых пространств.
  delete from consents where user_id = uid;

  -- Сам аккаунт. login_events и ai_usage уйдут по on delete cascade.
  delete from auth.users where id = uid;
end;
$$;

revoke all on function delete_my_account() from public, anon;
grant execute on function delete_my_account() to authenticated;

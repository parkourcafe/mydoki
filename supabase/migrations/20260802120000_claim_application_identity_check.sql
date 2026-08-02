-- Усиление claim_application: привязать отклик к аккаунту может только сам
-- кандидат, а не любой залогиненный пользователь, узнавший access_token.
--
-- Проблема исходной версии (20260702000000_career_mvp_v2.sql): функция
-- проверяла только факт аутентификации. Кто угодно с токеном становился
-- владельцем отклика, а прикладной код (claimApplication) следом копировал
-- документы кандидата — KTP, справки — в сейф этого пользователя.
-- Токен при этом живёт в ссылке статуса и не одноразовый.
--
-- Новая логика: требуем совпадения личности с данными отклика —
--   * email аккаунта = applications.email (без учёта регистра), либо
--   * телефон аккаунта = applications.whatsapp (сравниваем только цифры).
-- Если сопоставить не с чем (у отклика нет email, а у аккаунта нет телефона) —
-- отказываем: лучше попросить человека войти под тем контактом, который он
-- указывал, чем отдать чужие документы.
--
-- Возвращаемые коды:
--   {ok:true,  application_id, already}      — привязано (или уже было)
--   {ok:false, reason:'not_found'}           — токен не найден
--   {ok:false, reason:'identity_mismatch'}   — контакты не совпали
--   {ok:false, reason:'already_claimed'}     — отклик уже за другим аккаунтом
create or replace function claim_application(p_token text)
returns jsonb language plpgsql volatile security definer set search_path = public as $$
declare
  a           applications;
  u           auth.users;
  app_digits  text;
  usr_digits  text;
  matches     boolean := false;
begin
  if auth.uid() is null then raise exception 'not authenticated'; end if;

  select * into a from applications where access_token = p_token;
  if not found then
    return jsonb_build_object('ok', false, 'reason', 'not_found');
  end if;

  -- Уже привязан к другому аккаунту — не перепривязываем.
  if a.user_id is not null and a.user_id <> auth.uid() then
    return jsonb_build_object('ok', false, 'reason', 'already_claimed');
  end if;

  -- Повторный вызов тем же пользователем идемпотентен.
  if a.user_id = auth.uid() then
    return jsonb_build_object(
      'ok', true, 'application_id', a.id, 'already', true);
  end if;

  select * into u from auth.users where id = auth.uid();

  -- Совпадение по email (регистр не важен).
  if a.email is not null and a.email <> ''
     and u.email is not null and lower(u.email) = lower(a.email) then
    matches := true;
  end if;

  -- Либо совпадение по телефону: сравниваем только цифры, чтобы формат
  -- (+62 / 0812 / пробелы) не мешал.
  if not matches and a.whatsapp is not null and u.phone is not null then
    app_digits := regexp_replace(a.whatsapp, '\D', '', 'g');
    usr_digits := regexp_replace(u.phone,   '\D', '', 'g');
    -- Индонезийские номера пишут и как 0812…, и как 62812… — сравниваем хвост.
    if length(app_digits) >= 8 and length(usr_digits) >= 8
       and (right(app_digits, 8) = right(usr_digits, 8)) then
      matches := true;
    end if;
  end if;

  if not matches then
    return jsonb_build_object('ok', false, 'reason', 'identity_mismatch');
  end if;

  update applications set user_id = auth.uid(), updated_at = now()
  where id = a.id;

  return jsonb_build_object(
    'ok', true, 'application_id', a.id, 'already', false);
end; $$;

grant execute on function claim_application(text) to authenticated;

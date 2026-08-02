-- =====================================================================
-- P2-2 (фаза 2): Оффер. Работодатель формирует предложение из отклика,
-- кандидат подтверждает согласием (фиксируем время/actor/дисклеймер), после
-- чего отклик переходит в hired — далее оформление в employment (P2-1).
-- Цепочка offer → hired → employment.
--
-- Дисклеймер юр-статуса: оффер — это предложение, НЕ трудовой договор и НЕ
-- электронная подпись. Юридическую силу имеет отдельно подписанный договор.
-- Мы не создаём своей криптографии/подписи (v1.1 §16 — интеграцией при
-- необходимости).
--
-- Аддитивно и совместимо с Doki.id: новая таблица (только doki.help) + RPC;
-- get_application_status пересоздаётся с той же сигнатурой (обратно
-- совместимо — добавлен ключ 'offer').
--
-- План отката (rollback):
--   drop function if exists respond_to_offer(text,boolean,boolean);
--   drop function if exists withdraw_offer(uuid);
--   drop function if exists send_offer(uuid);
--   drop function if exists upsert_offer(uuid,text,text,text,date,text,text);
--   drop table if exists offers;
--   (get_application_status вернуть к версии из 20260701000000)

-- ── Таблица offers (одна на отклик) ─────────────────────────────────
create table if not exists offers (
  id               uuid primary key default gen_random_uuid(),
  application_id   uuid not null references applications(id) on delete cascade,
  company_id       uuid not null references employer_profiles(id) on delete cascade,
  position         text not null,
  employment_type  text not null default 'full_time'
                     check (employment_type in ('full_time','part_time','contract','intern','other')),
  compensation     text,            -- свободный текст (не считаем/не парсим)
  start_date       date,
  terms            text,            -- условия свободным текстом
  disclaimer       text not null,   -- дисклеймер юр-статуса (что видел кандидат)
  status           text not null default 'draft'
                     check (status in ('draft','sent','accepted','declined','withdrawn')),
  created_by       uuid references auth.users(id),
  created_at       timestamptz not null default now(),
  sent_at          timestamptz,
  responded_at     timestamptz,
  responded_actor  uuid,            -- кто ответил (user_id или null для анонима по токену)
  updated_at       timestamptz not null default now()
);
-- Одна оферта на отклик (пере-черновик обновляет ту же строку).
create unique index if not exists offers_application_uidx on offers(application_id);
create index if not exists offers_company_idx on offers(company_id);

alter table offers enable row level security;

-- ── RLS ─────────────────────────────────────────────────────────────
-- Чтение: кандидат (владелец отклика) и компания. Публичная статус-страница
-- читает оффер через SECURITY DEFINER get_application_status по токену.
do $$ begin
  create policy "offers read candidate or company" on offers for select
    using (
      application_id in (select id from applications where user_id = (select auth.uid()))
      or private.can_access_employer(company_id)
    );
exception when duplicate_object then null; end $$;

-- Запись — ТОЛЬКО через SECURITY DEFINER RPC (upsert/send/withdraw/respond),
-- как в PR-13: RPC гейтят доступ и жизненный цикл (draft→sent→…). Прямых
-- insert/update/delete-политик нет — под RLS это запрещает прямую запись в
-- обход гардов состояния (грантим только select для чтения работодателем).
grant select on offers to authenticated;

-- ── RPC: создать/обновить черновик оффера (работодатель) ────────────
create or replace function public.upsert_offer(
  p_application_id uuid,
  p_position text,
  p_type text default 'full_time',
  p_compensation text default null,
  p_start_date date default null,
  p_terms text default null,
  p_disclaimer text default null
) returns uuid
language plpgsql volatile security definer set search_path = public as $$
declare v_company uuid; v_state text; v_existing offers; v_id uuid;
        v_disc text;
begin
  if auth.uid() is null then raise exception 'not authenticated'; end if;
  if coalesce(trim(p_position),'') = '' then raise exception 'position required'; end if;
  if p_type not in ('full_time','part_time','contract','intern','other') then
    raise exception 'invalid employment_type';
  end if;

  select v.employer_id, coalesce(a.state,'active') into v_company, v_state
  from applications a join vacancies v on v.id = a.vacancy_id
  where a.id = p_application_id;
  if v_company is null then raise exception 'application not found'; end if;
  if not private.can_access_employer(v_company) then raise exception 'not authorized'; end if;
  if v_state in ('rejected','withdrawn') then raise exception 'application not active'; end if;

  v_disc := coalesce(nullif(trim(p_disclaimer),''),
    'Это предложение о работе, а не трудовой договор и не электронная подпись. '
    || 'Юридическую силу имеет отдельно подписанный договор.');

  select * into v_existing from offers where application_id = p_application_id;
  if v_existing.id is not null then
    -- Редактировать можно только не-отправленный/отклонённый/отозванный оффер.
    if v_existing.status not in ('draft','declined','withdrawn') then
      raise exception 'offer already %', v_existing.status;
    end if;
    update offers set
      company_id = v_company, position = trim(p_position), employment_type = p_type,
      compensation = nullif(trim(p_compensation),''), start_date = p_start_date,
      terms = nullif(trim(p_terms),''), disclaimer = v_disc,
      status = 'draft', sent_at = null, responded_at = null, responded_actor = null,
      updated_at = now()
    where id = v_existing.id
    returning id into v_id;
    return v_id;
  end if;

  insert into offers(application_id, company_id, position, employment_type,
    compensation, start_date, terms, disclaimer, status, created_by)
  values (p_application_id, v_company, trim(p_position), p_type,
    nullif(trim(p_compensation),''), p_start_date, nullif(trim(p_terms),''), v_disc,
    'draft', auth.uid())
  returning id into v_id;
  return v_id;
end; $$;
grant execute on function public.upsert_offer(uuid,text,text,text,date,text,text) to authenticated;

-- ── RPC: отправить оффер кандидату ──────────────────────────────────
create or replace function public.send_offer(p_application_id uuid)
returns text language plpgsql volatile security definer set search_path = public as $$
declare v_company uuid; v_status text;
begin
  if auth.uid() is null then raise exception 'not authenticated'; end if;
  select o.status, o.company_id into v_status, v_company
  from offers o where o.application_id = p_application_id;
  if v_company is null then raise exception 'offer not found'; end if;
  if not private.can_access_employer(v_company) then raise exception 'not authorized'; end if;
  if v_status <> 'draft' then raise exception 'offer not draft'; end if;

  update offers set status = 'sent', sent_at = now(), updated_at = now()
  where application_id = p_application_id;
  insert into application_events(application_id, actor, actor_kind, type, payload)
  values (p_application_id, auth.uid(), 'user', 'offer', jsonb_build_object('action','sent'));
  return 'sent';
end; $$;
grant execute on function public.send_offer(uuid) to authenticated;

-- ── RPC: отозвать оффер (работодатель) ──────────────────────────────
create or replace function public.withdraw_offer(p_application_id uuid)
returns text language plpgsql volatile security definer set search_path = public as $$
declare v_company uuid; v_status text;
begin
  if auth.uid() is null then raise exception 'not authenticated'; end if;
  select o.status, o.company_id into v_status, v_company
  from offers o where o.application_id = p_application_id;
  if v_company is null then raise exception 'offer not found'; end if;
  if not private.can_access_employer(v_company) then raise exception 'not authorized'; end if;
  if v_status not in ('draft','sent') then raise exception 'offer not withdrawable'; end if;

  update offers set status = 'withdrawn', updated_at = now()
  where application_id = p_application_id;
  insert into application_events(application_id, actor, actor_kind, type, payload)
  values (p_application_id, auth.uid(), 'user', 'offer', jsonb_build_object('action','withdrawn'));
  return 'withdrawn';
end; $$;
grant execute on function public.withdraw_offer(uuid) to authenticated;

-- ── RPC: ответ кандидата по токену (принять/отклонить) ──────────────
-- Публичный флоу по секретному access_token (как revoke_application_consent).
-- Принятие требует явного согласия (p_consent=true). При принятии фиксируем
-- время/actor и переводим отклик в hired (переход offer → hired). Дисклеймер,
-- который видел кандидат, сохраняется в событии (аудит).
create or replace function public.respond_to_offer(
  p_token text, p_accept boolean, p_consent boolean default false
) returns jsonb language plpgsql volatile security definer set search_path = public as $$
declare a applications; o offers;
begin
  select * into a from applications where access_token = p_token;
  if a.id is null then return jsonb_build_object('ok', false, 'error', 'not_found'); end if;
  select * into o from offers where application_id = a.id;
  if o.id is null or o.status <> 'sent' then
    return jsonb_build_object('ok', false, 'error', 'no_active_offer');
  end if;
  if coalesce(a.state,'active') in ('rejected','withdrawn') then
    return jsonb_build_object('ok', false, 'error', 'application_closed');
  end if;

  if p_accept then
    if not coalesce(p_consent,false) then
      return jsonb_build_object('ok', false, 'error', 'consent_required');
    end if;
    update offers set status = 'accepted', responded_at = now(), responded_actor = auth.uid(),
      updated_at = now() where id = o.id;
    -- Переход отклика в hired (offer → hired). Идемпотентно, если уже hired.
    if coalesce(a.state,'active') <> 'hired' then
      update applications set status = 'hired', state = 'hired', stage = 'decision',
        updated_at = now() where id = a.id;
      insert into application_status_log(application_id, old_status, new_status, changed_by)
      values (a.id, a.status, 'hired', auth.uid());
    end if;
    insert into application_events(application_id, actor, actor_kind, type, payload)
    values (a.id, auth.uid(),
      case when auth.uid() is null then 'system' else 'user' end, 'offer',
      jsonb_build_object('action','accepted','disclaimer', o.disclaimer));
    return jsonb_build_object('ok', true, 'status', 'accepted');
  else
    update offers set status = 'declined', responded_at = now(), responded_actor = auth.uid(),
      updated_at = now() where id = o.id;
    insert into application_events(application_id, actor, actor_kind, type, payload)
    values (a.id, auth.uid(),
      case when auth.uid() is null then 'system' else 'user' end, 'offer',
      jsonb_build_object('action','declined'));
    return jsonb_build_object('ok', true, 'status', 'declined');
  end if;
end; $$;
grant execute on function public.respond_to_offer(text,boolean,boolean) to anon, authenticated;

-- ── get_application_status: + ключ 'offer' (обратно совместимо) ─────
-- Тело идентично версии из career_mvp; добавлен показ оффера кандидату
-- (только когда он отправлен/отвечен — draft/withdrawn кандидату не видны).
create or replace function get_application_status(p_token text)
returns jsonb language plpgsql volatile security definer set search_path = public as $$
declare a applications; v vacancies; timeline jsonb; offer jsonb;
begin
  select * into a from applications where access_token = p_token;
  if not found then return null; end if;
  select * into v from vacancies where id = a.vacancy_id;

  select coalesce(jsonb_agg(jsonb_build_object(
           'old_status', l.old_status, 'new_status', l.new_status,
           'created_at', l.created_at) order by l.created_at), '[]'::jsonb)
    into timeline
  from application_status_log l where l.application_id = a.id;

  select case when o.status in ('sent','accepted','declined') then
           jsonb_build_object(
             'status', o.status, 'position', o.position,
             'employment_type', o.employment_type, 'compensation', o.compensation,
             'start_date', o.start_date, 'terms', o.terms, 'disclaimer', o.disclaimer,
             'sent_at', o.sent_at, 'responded_at', o.responded_at)
         else null end
    into offer
  from offers o where o.application_id = a.id;

  return jsonb_build_object(
    'status', a.status,
    'full_name', a.full_name,
    'created_at', a.created_at,
    'vacancy', jsonb_build_object(
      'title', v.title, 'company_name', v.company_name,
      'location', v.location, 'slug', v.slug),
    'employer_contact', case when a.status = 'shortlisted'
      then (select jsonb_build_object('whatsapp', ep.contact_whatsapp, 'email', ep.contact_email)
            from employer_profiles ep where ep.id = v.employer_id)
      else null end,
    'offer', offer,
    'timeline', timeline
  );
end; $$;
grant execute on function get_application_status(text) to anon, authenticated;

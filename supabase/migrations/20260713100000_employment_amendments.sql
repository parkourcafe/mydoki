-- =====================================================================
-- P3-1 (фаза 3): Изменения условий трудовых отношений (допсоглашения).
-- Employment — ОДНА каноническая запись (v1.1 §7.4). Изменение условий —
-- допсоглашение (amendment): предложение работодателя, подтверждённое
-- согласием человека (как оффер в фазе 2), после чего применяется к текущим
-- условиям employment. История изменений неизменяема.
--
-- Дисклеймер юр-статуса: допсоглашение фиксирует договорённость, но НЕ
-- является электронной подписью; юридическую силу имеет подписанный документ.
--
-- Аддитивно и совместимо с Doki.id: новая колонка + таблица + RPC; общих
-- таблиц не трогаем.
--
-- План отката (rollback):
--   drop function if exists respond_to_amendment(uuid,boolean,boolean);
--   drop function if exists withdraw_employment_amendment(uuid);
--   drop function if exists propose_employment_amendment(uuid);
--   drop function if exists upsert_employment_amendment(uuid,text,date,text,text,text,text,text,text,uuid);
--   drop table if exists employment_amendments;
--   alter table employments drop column if exists compensation;

-- ── Текущая оплата на employment (обновляется принятыми изменениями) ─
alter table employments add column if not exists compensation text;

-- ── Таблица допсоглашений ───────────────────────────────────────────
create table if not exists employment_amendments (
  id                  uuid primary key default gen_random_uuid(),
  employment_id       uuid not null references employments(id) on delete cascade,
  kind                text not null default 'terms_change'
                        check (kind in ('promotion','transfer','comp_change','schedule_change','terms_change','other')),
  effective_date      date,
  new_position        text,
  new_employment_type text
                        check (new_employment_type is null or
                               new_employment_type in ('full_time','part_time','contract','intern','other')),
  new_compensation    text,
  terms               text,
  note                text,
  disclaimer          text not null,
  status              text not null default 'draft'
                        check (status in ('draft','proposed','accepted','declined','withdrawn')),
  created_by          uuid references auth.users(id),
  created_at          timestamptz not null default now(),
  proposed_at         timestamptz,
  responded_at        timestamptz,
  responded_actor     uuid,
  updated_at          timestamptz not null default now()
);
create index if not exists employment_amendments_employment_idx
  on employment_amendments(employment_id, created_at);

alter table employment_amendments enable row level security;

-- Чтение: через видимость employment (сотрудник + компания).
do $$ begin
  create policy "amendments read via employment" on employment_amendments for select
    using (employment_id in (select id from employments));
exception when duplicate_object then null; end $$;

-- Запись — ТОЛЬКО через SECURITY DEFINER RPC (как offers): гейт доступа и
-- жизненный цикл draft→proposed→accepted/declined/withdrawn. Прямых
-- insert/update/delete-политик нет; грантим только select для чтения.
grant select on employment_amendments to authenticated;

-- ── RPC: создать/обновить черновик (работодатель) ───────────────────
create or replace function public.upsert_employment_amendment(
  p_employment_id uuid,
  p_kind text,
  p_effective_date date default null,
  p_new_position text default null,
  p_new_type text default null,
  p_new_compensation text default null,
  p_terms text default null,
  p_note text default null,
  p_disclaimer text default null,
  p_id uuid default null
) returns uuid
language plpgsql volatile security definer set search_path = public as $$
declare v_company uuid; v_state text; v_status text; v_id uuid; v_disc text;
begin
  if auth.uid() is null then raise exception 'not authenticated'; end if;
  if p_kind not in ('promotion','transfer','comp_change','schedule_change','terms_change','other') then
    raise exception 'invalid kind';
  end if;
  if p_new_type is not null and p_new_type not in ('full_time','part_time','contract','intern','other') then
    raise exception 'invalid employment_type';
  end if;

  select company_id, status into v_company, v_state from employments where id = p_employment_id;
  if v_company is null then raise exception 'employment not found or manual'; end if;
  if not private.can_access_employer(v_company) then raise exception 'not authorized'; end if;

  v_disc := coalesce(nullif(trim(p_disclaimer),''),
    'Допсоглашение фиксирует договорённость об изменении условий. Это не электронная '
    || 'подпись; юридическую силу имеет отдельно подписанный документ.');

  if p_id is not null then
    select status into v_status from employment_amendments
      where id = p_id and employment_id = p_employment_id;
    if v_status is null then raise exception 'amendment not found'; end if;
    if v_status <> 'draft' then raise exception 'amendment not draft'; end if;
    update employment_amendments set
      kind = p_kind, effective_date = p_effective_date,
      new_position = nullif(trim(p_new_position),''), new_employment_type = p_new_type,
      new_compensation = nullif(trim(p_new_compensation),''), terms = nullif(trim(p_terms),''),
      note = nullif(trim(p_note),''), disclaimer = v_disc, updated_at = now()
    where id = p_id
    returning id into v_id;
    return v_id;
  end if;

  insert into employment_amendments(employment_id, kind, effective_date, new_position,
    new_employment_type, new_compensation, terms, note, disclaimer, status, created_by)
  values (p_employment_id, p_kind, p_effective_date, nullif(trim(p_new_position),''),
    p_new_type, nullif(trim(p_new_compensation),''), nullif(trim(p_terms),''),
    nullif(trim(p_note),''), v_disc, 'draft', auth.uid())
  returning id into v_id;
  return v_id;
end; $$;
grant execute on function public.upsert_employment_amendment(uuid,text,date,text,text,text,text,text,text,uuid)
  to authenticated;

-- ── RPC: предложить допсоглашение сотруднику ────────────────────────
create or replace function public.propose_employment_amendment(p_id uuid)
returns text language plpgsql volatile security definer set search_path = public as $$
declare v_company uuid; v_status text;
begin
  if auth.uid() is null then raise exception 'not authenticated'; end if;
  select e.company_id, a.status into v_company, v_status
  from employment_amendments a join employments e on e.id = a.employment_id
  where a.id = p_id;
  if v_status is null then raise exception 'amendment not found'; end if;
  if not private.can_access_employer(v_company) then raise exception 'not authorized'; end if;
  if v_status <> 'draft' then raise exception 'amendment not draft'; end if;

  update employment_amendments set status = 'proposed', proposed_at = now(), updated_at = now()
  where id = p_id;
  return 'proposed';
end; $$;
grant execute on function public.propose_employment_amendment(uuid) to authenticated;

-- ── RPC: отозвать допсоглашение (работодатель) ──────────────────────
create or replace function public.withdraw_employment_amendment(p_id uuid)
returns text language plpgsql volatile security definer set search_path = public as $$
declare v_company uuid; v_status text;
begin
  if auth.uid() is null then raise exception 'not authenticated'; end if;
  select e.company_id, a.status into v_company, v_status
  from employment_amendments a join employments e on e.id = a.employment_id
  where a.id = p_id;
  if v_status is null then raise exception 'amendment not found'; end if;
  if not private.can_access_employer(v_company) then raise exception 'not authorized'; end if;
  if v_status not in ('draft','proposed') then raise exception 'amendment not withdrawable'; end if;

  update employment_amendments set status = 'withdrawn', updated_at = now() where id = p_id;
  return 'withdrawn';
end; $$;
grant execute on function public.withdraw_employment_amendment(uuid) to authenticated;

-- ── RPC: ответ сотрудника (принять/отклонить) ───────────────────────
-- Сотрудник авторизован (в отличие от оффера по токену). Принятие требует
-- явного согласия и ПРИМЕНЯЕТ новые условия к employment.
create or replace function public.respond_to_amendment(
  p_id uuid, p_accept boolean, p_consent boolean default false
) returns jsonb language plpgsql volatile security definer set search_path = public as $$
declare a employment_amendments; v_employee uuid;
begin
  if auth.uid() is null then raise exception 'not authenticated'; end if;
  select * into a from employment_amendments where id = p_id;
  if a.id is null then return jsonb_build_object('ok', false, 'error', 'not_found'); end if;

  select employee_user_id into v_employee from employments where id = a.employment_id;
  if v_employee is null or v_employee <> auth.uid() then raise exception 'not authorized'; end if;
  if a.status <> 'proposed' then
    return jsonb_build_object('ok', false, 'error', 'not_pending');
  end if;

  if p_accept then
    if not coalesce(p_consent,false) then
      return jsonb_build_object('ok', false, 'error', 'consent_required');
    end if;
    update employment_amendments set status = 'accepted', responded_at = now(),
      responded_actor = auth.uid(), updated_at = now() where id = a.id;
    -- Применяем изменения к текущим условиям employment.
    update employments set
      position = coalesce(nullif(a.new_position,''), position),
      employment_type = coalesce(a.new_employment_type, employment_type),
      compensation = coalesce(nullif(a.new_compensation,''), compensation),
      updated_at = now()
    where id = a.employment_id;
    return jsonb_build_object('ok', true, 'status', 'accepted');
  else
    update employment_amendments set status = 'declined', responded_at = now(),
      responded_actor = auth.uid(), updated_at = now() where id = a.id;
    return jsonb_build_object('ok', true, 'status', 'declined');
  end if;
end; $$;
grant execute on function public.respond_to_amendment(uuid,boolean,boolean) to authenticated;

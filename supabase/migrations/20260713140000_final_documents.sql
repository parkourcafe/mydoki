-- =====================================================================
-- P4-2 (фаза 4): Расчёт и финальные документы сотрудника. Поверх модели
-- employment_documents (P2-4): новые типы `settlement` (расчёт) и `reference`
-- (рекомендация/справка) + подтверждение получения сотрудником.
--
-- «Расчёт» здесь — это ДОКУМЕНТ (расчётный лист/итоговые выплаты), который
-- готовит работодатель. Doki.help не считает суммы за работодателя.
--
-- Аддитивно и совместимо с Doki.id: расширение check-констрейнта + новые
-- колонки + RPC; общих таблиц не трогаем.
--
-- План отката (rollback):
--   drop function if exists acknowledge_employment_document(uuid);
--   alter table employment_documents
--     drop column if exists acknowledged_at, drop column if exists acknowledged_by;
--   alter table employment_documents drop constraint if exists employment_documents_doc_type_check;
--   alter table employment_documents add constraint employment_documents_doc_type_check
--     check (doc_type in ('contract','visa','permit','certification','other'));

-- ── Расширяем набор типов документов (аддитивно) ────────────────────
alter table employment_documents drop constraint if exists employment_documents_doc_type_check;
alter table employment_documents add constraint employment_documents_doc_type_check
  check (doc_type in ('contract','visa','permit','certification','settlement','reference','other'));

-- ── Подтверждение получения сотрудником ─────────────────────────────
alter table employment_documents
  add column if not exists acknowledged_at timestamptz,
  add column if not exists acknowledged_by uuid references auth.users(id);

-- RPC: сотрудник подтверждает получение документа своей записи. Сотрудник
-- read-only на таблице (RLS), поэтому подтверждение — через SECURITY DEFINER.
-- Идемпотентно: повторное подтверждение не меняет исходное время.
create or replace function public.acknowledge_employment_document(p_id uuid)
returns text language plpgsql volatile security definer set search_path = public as $$
declare v_employee uuid; v_ack timestamptz;
begin
  if auth.uid() is null then raise exception 'not authenticated'; end if;
  select e.employee_user_id, ed.acknowledged_at into v_employee, v_ack
  from employment_documents ed
  join employments e on e.id = ed.employment_id
  where ed.id = p_id;
  if v_employee is null then raise exception 'document not found'; end if;
  if v_employee <> auth.uid() then raise exception 'not authorized'; end if;
  if v_ack is not null then return 'acknowledged'; end if;

  update employment_documents
    set acknowledged_at = now(), acknowledged_by = auth.uid()
  where id = p_id;
  return 'acknowledged';
end; $$;
grant execute on function public.acknowledge_employment_document(uuid) to authenticated;

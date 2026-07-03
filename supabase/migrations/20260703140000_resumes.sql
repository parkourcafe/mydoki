-- =====================================================================
-- Резюме кандидата (роль «Ищу работу»). Одна анкета на пользователя:
-- стандартные поля + произвольные «свои поля» (custom_fields jsonb).
-- Владелец видит и правит только своё (RLS по auth.uid()). Аддитивно.
-- =====================================================================

create table if not exists resumes (
  user_id       uuid primary key references auth.users(id) on delete cascade,
  full_name     text,
  headline      text,           -- «Няня, 5 лет опыта»
  location      text,
  contact       text,           -- WhatsApp / телефон
  email         text,
  about         text,
  experience    text,
  custom_fields jsonb not null default '[]'::jsonb,  -- [{ "label": "...", "value": "..." }]
  updated_at    timestamptz not null default now()
);

alter table resumes enable row level security;

-- Владелец видит своё резюме.
do $$ begin
  create policy "own resume select" on resumes for select
    using (user_id = (select auth.uid()));
exception when duplicate_object then null; end $$;

-- Владелец создаёт своё резюме (строго на себя).
do $$ begin
  create policy "own resume insert" on resumes for insert
    with check (user_id = (select auth.uid()));
exception when duplicate_object then null; end $$;

-- Владелец правит своё резюме.
do $$ begin
  create policy "own resume update" on resumes for update
    using (user_id = (select auth.uid()))
    with check (user_id = (select auth.uid()));
exception when duplicate_object then null; end $$;

-- Владелец может удалить своё резюме.
do $$ begin
  create policy "own resume delete" on resumes for delete
    using (user_id = (select auth.uid()));
exception when duplicate_object then null; end $$;

grant select, insert, update, delete on resumes to authenticated;

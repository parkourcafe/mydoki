-- Пользовательские разделы документов: семья может завести свой раздел
-- помимо встроенных категорий (enum doc_category в свои значения не расширить
-- на уровне одной семьи, поэтому храним отдельной таблицей).
create table custom_doc_categories (
  id           uuid primary key default gen_random_uuid(),
  household_id uuid not null references households(id) on delete cascade,
  label        text not null,
  emoji        text,
  created_by   uuid not null default auth.uid(),
  created_at   timestamptz not null default now()
);
create index on custom_doc_categories(household_id);

alter table custom_doc_categories enable row level security;
create policy "custom_doc_categories read" on custom_doc_categories
  for select using (private.is_household_member(household_id));
create policy "custom_doc_categories write" on custom_doc_categories
  for all using (private.is_household_editor(household_id))
  with check (private.is_household_editor(household_id));

-- Документ может быть отнесён к пользовательскому разделу вместо встроенной
-- категории. Если раздел удалят — документ не теряется, просто вернётся
-- к встроенной категории (custom_category_id обнуляется).
alter table documents
  add column custom_category_id uuid references custom_doc_categories(id) on delete set null;
create index on documents(custom_category_id);

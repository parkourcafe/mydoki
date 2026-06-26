-- Объекты имущества (авто, недвижимость, прочее) — карточки рядом с людьми.
do $$ begin create type asset_type as enum ('vehicle','real_estate','other');
exception when duplicate_object then null; end $$;

create table assets (
  id           uuid primary key default gen_random_uuid(),
  household_id uuid not null references households(id) on delete cascade,
  type         asset_type not null default 'other',
  title        text not null,
  details      text,
  created_by   uuid not null default auth.uid(),
  created_at   timestamptz not null default now()
);
create index on assets(household_id);

alter table assets enable row level security;
create policy "assets read" on assets for select using (private.is_household_member(household_id));
create policy "assets write" on assets for all
  using (private.is_household_editor(household_id)) with check (private.is_household_editor(household_id));

-- Документ может принадлежать человеку ИЛИ объекту (ровно одному владельцу).
alter table documents alter column member_id drop not null;
alter table documents add column asset_id uuid references assets(id) on delete cascade;
create index on documents(asset_id);
alter table documents add constraint documents_owner_chk
  check (num_nonnulls(member_id, asset_id) = 1);
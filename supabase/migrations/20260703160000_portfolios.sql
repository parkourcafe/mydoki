-- =====================================================================
-- Роль «Фрилансер»: витрина работ (портфолио) + публичная ссылка для
-- клиента. Владелец правит только своё (RLS по auth.uid()). Публичный
-- просмотр — через SECURITY DEFINER RPC по токену (как get_shared_package),
-- поэтому таблицы не открыты анониму напрямую. Аддитивно.
-- =====================================================================

create table if not exists portfolios (
  user_id          uuid primary key references auth.users(id) on delete cascade,
  display_name     text,
  tagline          text,           -- «Фотограф · Бали»
  about            text,
  contact_whatsapp text,
  contact_email    text,
  token            text not null unique default replace(gen_random_uuid()::text, '-', ''),
  is_public        boolean not null default false,
  updated_at       timestamptz not null default now()
);

create table if not exists portfolio_items (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  title       text not null,
  description text,
  link        text,
  sort        int not null default 0,
  created_at  timestamptz not null default now()
);
create index if not exists portfolio_items_user_idx on portfolio_items(user_id);

alter table portfolios      enable row level security;
alter table portfolio_items enable row level security;

-- Владелец управляет своим портфолио.
do $$ begin
  create policy "own portfolio" on portfolios for all
    using (user_id = (select auth.uid()))
    with check (user_id = (select auth.uid()));
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "own portfolio items" on portfolio_items for all
    using (user_id = (select auth.uid()))
    with check (user_id = (select auth.uid()));
exception when duplicate_object then null; end $$;

grant select, insert, update, delete on portfolios      to authenticated;
grant select, insert, update, delete on portfolio_items to authenticated;

-- Публичное чтение портфолио по токену — только если владелец опубликовал.
create or replace function get_public_portfolio(p_token text)
returns jsonb language plpgsql stable security definer set search_path = public as $$
declare p portfolios; items jsonb;
begin
  select * into p from portfolios where token = p_token and is_public = true;
  if not found then return null; end if;

  select coalesce(jsonb_agg(jsonb_build_object(
           'title', i.title,
           'description', i.description,
           'link', i.link
         ) order by i.sort, i.created_at), '[]'::jsonb)
    into items
  from portfolio_items i where i.user_id = p.user_id;

  return jsonb_build_object(
    'display_name', p.display_name,
    'tagline', p.tagline,
    'about', p.about,
    'contact_whatsapp', p.contact_whatsapp,
    'contact_email', p.contact_email,
    'items', items
  );
end; $$;
grant execute on function get_public_portfolio(text) to anon, authenticated;

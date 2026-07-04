-- =====================================================================
-- Картинки к работам портфолио фрилансера. Отдельный ПУБЛИЧНЫЙ bucket
-- (работы показываются клиенту по публичной ссылке), запись — только в
-- свою папку {user_id}/... Документы сейфа это не затрагивает. Аддитивно.
-- =====================================================================

alter table portfolio_items add column if not exists image_path text;

-- Публичный bucket только под превью работ (5 МБ, картинки).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'portfolio-images', 'portfolio-images', true, 5242880,
  array['image/jpeg','image/png','image/webp']
)
on conflict (id) do update set
  public = true,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Загружать/менять/удалять может только владелец в своей папке ({uid}/...).
do $$ begin
  create policy "portfolio images owner insert" on storage.objects for insert
    with check (
      bucket_id = 'portfolio-images'
      and (storage.foldername(name))[1]::uuid = (select auth.uid())
    );
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "portfolio images owner update" on storage.objects for update
    using (
      bucket_id = 'portfolio-images'
      and (storage.foldername(name))[1]::uuid = (select auth.uid())
    );
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "portfolio images owner delete" on storage.objects for delete
    using (
      bucket_id = 'portfolio-images'
      and (storage.foldername(name))[1]::uuid = (select auth.uid())
    );
exception when duplicate_object then null; end $$;

-- Чтение — публичное (bucket public, плюс явная политика на всякий случай).
do $$ begin
  create policy "portfolio images public read" on storage.objects for select
    using (bucket_id = 'portfolio-images');
exception when duplicate_object then null; end $$;

-- Публичное чтение портфолио теперь отдаёт и путь к картинке работы.
create or replace function get_public_portfolio(p_token text)
returns jsonb language plpgsql stable security definer set search_path = public as $$
declare p portfolios; items jsonb;
begin
  select * into p from portfolios where token = p_token and is_public = true;
  if not found then return null; end if;

  select coalesce(jsonb_agg(jsonb_build_object(
           'title', i.title,
           'description', i.description,
           'link', i.link,
           'image_path', i.image_path
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

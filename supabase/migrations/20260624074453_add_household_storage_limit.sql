alter table public.households
  add column if not exists storage_limit_bytes bigint not null default 524288000;

comment on column public.households.storage_limit_bytes is
  'Лимит хранилища файлов на пространство (байты). По умолчанию 500 МБ; можно поднять индивидуально.';
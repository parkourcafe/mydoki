alter table public.households
  alter column storage_limit_bytes set default 2147483648;

-- поднять уже созданные пространства, которые сидят на старом дефолте 500 МБ
update public.households
  set storage_limit_bytes = 2147483648
  where storage_limit_bytes = 524288000;
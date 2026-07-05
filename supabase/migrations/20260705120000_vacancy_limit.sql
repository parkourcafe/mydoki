-- Лимит бесплатного тарифа: сколько АКТИВНЫХ вакансий может держать работодатель.
-- Бесплатно — 3. Ручной апгрейд после оплаты: поднять vacancy_limit нужному
-- работодателю (напр. UPDATE ... SET vacancy_limit = 10 WHERE ...).
-- Проверка лимита живёт в коде doki.help (не в общей RPC create_vacancy),
-- поэтому эта колонка — единственное, что нужно в общей БД. Аддитивно и
-- совместимо с Doki.id.
alter table public.employer_profiles
  add column if not exists vacancy_limit integer not null default 3;

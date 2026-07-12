-- PR-5 (фаза 1B): структурированные поля вакансии + неизменяемые снимки
-- версий. Аддитивно и совместимо с Doki.id. Снимок создаёт код doki.help
-- (не триггер), чтобы записи Doki.id в vacancies не порождали версий.
-- Статус 'draft' НЕ добавляем: это правка общего CHECK-constraint (отложено).
--
-- План отката (rollback):
--   drop table if exists vacancy_versions;
--   alter table vacancies
--     drop column if exists problem_statement, drop column if exists must_have,
--     drop column if exists trainable, drop column if exists scorecard,
--     drop column if exists stages, drop column if exists success_criteria_probation,
--     drop column if exists published_at;

-- ── Структурные поля вакансии (§8 v1.1) ─────────────────────────────
alter table vacancies
  add column if not exists problem_statement text,
  add column if not exists must_have jsonb not null default '[]'::jsonb,
  add column if not exists trainable jsonb not null default '[]'::jsonb,
  add column if not exists scorecard jsonb not null default '[]'::jsonb,
  add column if not exists stages jsonb not null default
    '["new","review","interview","assignment","decision"]'::jsonb,
  add column if not exists success_criteria_probation text,
  add column if not exists published_at timestamptz;

-- Бэкофилл published_at для уже активных вакансий.
update vacancies set published_at = created_at
  where status = 'active' and published_at is null;

-- ── Неизменяемые снимки версий вакансии ─────────────────────────────
-- Каждая публикация/правка фиксирует полный снимок условий, чтобы уже
-- поданные отклики ссылались на конкретную версию (v1.1 §8).
create table if not exists vacancy_versions (
  id          uuid primary key default gen_random_uuid(),
  vacancy_id  uuid not null references vacancies(id) on delete cascade,
  version_no  integer not null,
  snapshot    jsonb not null,
  created_by  uuid,
  created_at  timestamptz not null default now(),
  unique (vacancy_id, version_no)
);
create index if not exists vacancy_versions_vac_idx
  on vacancy_versions(vacancy_id, version_no desc);

alter table vacancy_versions enable row level security;

-- Владелец вакансии читает и добавляет версии; update/delete нет
-- (снимки неизменяемы).
create policy "vacancy_versions owner read" on vacancy_versions for select
  using (
    vacancy_id in (
      select v.id from vacancies v
      join employer_profiles ep on ep.id = v.employer_id
      where ep.user_id = (select auth.uid())
    )
  );
create policy "vacancy_versions owner insert" on vacancy_versions for insert
  with check (
    vacancy_id in (
      select v.id from vacancies v
      join employer_profiles ep on ep.id = v.employer_id
      where ep.user_id = (select auth.uid())
    )
  );

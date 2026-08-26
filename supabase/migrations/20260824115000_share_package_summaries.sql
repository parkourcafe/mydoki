-- =====================================================================
-- ВОССТАНОВЛЕНИЕ ПРОПУЩЕННОЙ МИГРАЦИИ: share_package_summaries.
--
-- Таблица существует в боевом проекте, но её не создаёт ни одна миграция в
-- репозитории — она появилась мимо истории миграций. Обнаружено при попытке
-- прогнать RLS-тесты на чистой базе: применение схемы обрывалось на
-- 20260824130000_unindexed_foreign_keys.sql с «relation
-- share_package_summaries does not exist».
--
-- Это делало миграции нерабочими на любой новой базе: staging, локальный
-- стенд, восстановление, CI. Проверено, что случай единичный — из 50 таблиц
-- прода только эта не создавалась миграциями, остальные воспроизводятся.
--
-- Файл датирован ПЕРЕД 20260824120000 намеренно: миграции применяются в
-- порядке имён, а две последующие (индексы и дедупликация политик) ссылаются
-- на эту таблицу. Содержимое восстановлено с боевой схемы дословно —
-- колонки, типы, умолчания, ключи, CHECK, политики и гранты сняты запросами
-- к information_schema и pg_policies, а не написаны по памяти.
--
-- На проде миграция — no-op: всё создаётся через `if not exists` и
-- exception-обёртки, поэтому повторное применение ничего не меняет.
-- =====================================================================

create table if not exists share_package_summaries (
  package_id         uuid not null references share_packages(id) on delete cascade,
  document_id        uuid not null references documents(id)      on delete cascade,
  source_language    text not null default 'ru',
  target_locale      text not null default 'id',
  source_snapshot    jsonb not null default '{}'::jsonb,
  translated_title   text not null,
  translated_summary text not null,
  key_facts          jsonb not null default '[]'::jsonb,
  uncertainty_notes  jsonb not null default '[]'::jsonb,
  model              text,
  status             text not null default 'draft'
                       check (status in ('draft', 'approved')),
  reviewed_by        uuid,
  reviewed_at        timestamptz,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),
  primary key (package_id, document_id)
);

alter table share_package_summaries enable row level security;

-- Доступ — через родительский пакет: читает участник семьи, пишет редактор.
-- Ровно тот же приём, что у share_package_documents в 20260702100000.
do $$ begin
  create policy "pkg summaries read" on share_package_summaries for select
    using (package_id in (
      select id from share_packages where private.is_household_member(household_id)
    ));
exception when duplicate_object then null; end $$;

-- Политика FOR ALL здесь сознательно: следующая миграция
-- 20260824140000_dedupe_rls_policies.sql разбивает её на отдельные
-- INSERT/UPDATE/DELETE. Чтобы цепочка на чистой базе повторяла историю
-- боевого проекта, здесь должно быть исходное состояние, а не итоговое.
do $$ begin
  create policy "pkg summaries write" on share_package_summaries for all
    using (package_id in (
      select id from share_packages where private.is_household_editor(household_id)
    ))
    with check (package_id in (
      select id from share_packages where private.is_household_editor(household_id)
    ));
exception when duplicate_object then null; end $$;

grant select, insert, update, delete on share_package_summaries to anon, authenticated;

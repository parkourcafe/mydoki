-- =====================================================================
-- STANDALONE-копия миграции 20260824140000_dedupe_rls_policies.sql,
-- пригодная для РУЧНОГО запуска в Supabase SQL Editor.
--
-- Это НЕ миграция. Файл лежит вне supabase/migrations/ намеренно: CLI
-- (`supabase db push`) применяет всё из migrations/, и вторая копия того же
-- изменения там сломала бы историю. Источник истины — сама миграция;
-- этот файл собран из неё скриптом, предикаты идентичны посимвольно.
--
-- Чем отличается от миграции:
--   1. Всё обёрнуто в BEGIN/COMMIT. При любой ошибке Postgres откатит
--      транзакцию целиком, поэтому недостижимо состояние «старые политики
--      снесены, новые не созданы» — при включённом RLS оно означало бы, что
--      приложение перестало сохранять данные.
--   2. Каждый CREATE POLICY обёрнут в do-блок с перехватом duplicate_object
--      (у CREATE POLICY нет IF NOT EXISTS). Файл идемпотентен: повторный
--      запуск не падает и ничего не портит.
--
-- ГДЕ ЭТО УЖЕ ПРИМЕНЕНО: только проект uuopxzlcmzdtwebottar (прод). Там
-- состояние проверено запросом к pg_policies — 0 старых политик, 0 FOR ALL,
-- 54 новых INSERT/UPDATE/DELETE. Запускать повторно там не нужно. Для любого
-- другого проекта (staging, копия, восстановление) утверждение «применено»
-- неверно, и файл нужно прогнать с нуля.
--
-- Смысл изменения и доказательства безопасности каждой пары политик —
-- в заголовке исходной миграции, здесь не дублируются.
-- =====================================================================

begin;

-- ── КАТЕГОРИЯ A ────────────────────────────────────────────────────────

-- application_answers: owner-only — подмножество "app_answers member read"
-- (private.can_access_employer, тот же join-путь applications→vacancies).
drop policy if exists "employers read answers for own vacancy applications" on application_answers;

-- application_documents: то же самое, подмножество "app_docs member read".
drop policy if exists "employers read documents for own vacancy applications" on application_documents;

-- application_status_log: то же самое, подмножество "app_status_log member read".
drop policy if exists "employers read status log for own vacancy applications" on application_status_log;

-- application_events: "app_events employer read" (owner-only) — подмножество
-- "app_events member read". "app_events candidate read" (persona кандидата,
-- applications.user_id=auth.uid() и type<>'note') не трогаем.
drop policy if exists "app_events employer read" on application_events;

-- applications: "employers read applications for own vacancies" (owner-only)
-- — подмножество "applications member read". "candidates see own
-- applications" (persona кандидата) не трогаем.
drop policy if exists "employers read applications for own vacancies" on applications;

-- ── КАТЕГОРИЯ B1 ── household_id напрямую в таблице, ALL vs member-read ──
-- Предикат ALL был private.is_household_editor(household_id); сиблинг
-- SELECT (не трогаем) — private.is_household_member(household_id).

drop policy if exists "assets write" on assets;
do $$ begin
  create policy "assets insert" on assets for insert
    with check (private.is_household_editor(household_id));
exception when duplicate_object then null;
end $$;
do $$ begin
  create policy "assets update" on assets for update
    using (private.is_household_editor(household_id))
    with check (private.is_household_editor(household_id));
exception when duplicate_object then null;
end $$;
do $$ begin
  create policy "assets delete" on assets for delete
    using (private.is_household_editor(household_id));
exception when duplicate_object then null;
end $$;

drop policy if exists "consents write" on consents;
do $$ begin
  create policy "consents insert" on consents for insert
    with check (private.is_household_editor(household_id));
exception when duplicate_object then null;
end $$;
do $$ begin
  create policy "consents update" on consents for update
    using (private.is_household_editor(household_id))
    with check (private.is_household_editor(household_id));
exception when duplicate_object then null;
end $$;
do $$ begin
  create policy "consents delete" on consents for delete
    using (private.is_household_editor(household_id));
exception when duplicate_object then null;
end $$;

drop policy if exists "custom_doc_categories write" on custom_doc_categories;
do $$ begin
  create policy "custom_doc_categories insert" on custom_doc_categories for insert
    with check (private.is_household_editor(household_id));
exception when duplicate_object then null;
end $$;
do $$ begin
  create policy "custom_doc_categories update" on custom_doc_categories for update
    using (private.is_household_editor(household_id))
    with check (private.is_household_editor(household_id));
exception when duplicate_object then null;
end $$;
do $$ begin
  create policy "custom_doc_categories delete" on custom_doc_categories for delete
    using (private.is_household_editor(household_id));
exception when duplicate_object then null;
end $$;

drop policy if exists "files write" on document_files;
do $$ begin
  create policy "files insert" on document_files for insert
    with check (private.is_household_editor(household_id));
exception when duplicate_object then null;
end $$;
do $$ begin
  create policy "files update" on document_files for update
    using (private.is_household_editor(household_id))
    with check (private.is_household_editor(household_id));
exception when duplicate_object then null;
end $$;
do $$ begin
  create policy "files delete" on document_files for delete
    using (private.is_household_editor(household_id));
exception when duplicate_object then null;
end $$;

-- documents: третья SELECT-политика "documents delegated read" (delegated
-- reader, private.can_delegate_read_document) — отдельная persona, не
-- трогаем и не пытаемся слить; разбор "documents write" от неё не зависит.
drop policy if exists "documents write" on documents;
do $$ begin
  create policy "documents insert" on documents for insert
    with check (private.is_household_editor(household_id));
exception when duplicate_object then null;
end $$;
do $$ begin
  create policy "documents update" on documents for update
    using (private.is_household_editor(household_id))
    with check (private.is_household_editor(household_id));
exception when duplicate_object then null;
end $$;
do $$ begin
  create policy "documents delete" on documents for delete
    using (private.is_household_editor(household_id));
exception when duplicate_object then null;
end $$;

drop policy if exists "members write" on members;
do $$ begin
  create policy "members insert" on members for insert
    with check (private.is_household_editor(household_id));
exception when duplicate_object then null;
end $$;
do $$ begin
  create policy "members update" on members for update
    using (private.is_household_editor(household_id))
    with check (private.is_household_editor(household_id));
exception when duplicate_object then null;
end $$;
do $$ begin
  create policy "members delete" on members for delete
    using (private.is_household_editor(household_id));
exception when duplicate_object then null;
end $$;

drop policy if exists "records write" on records;
do $$ begin
  create policy "records insert" on records for insert
    with check (private.is_household_editor(household_id));
exception when duplicate_object then null;
end $$;
do $$ begin
  create policy "records update" on records for update
    using (private.is_household_editor(household_id))
    with check (private.is_household_editor(household_id));
exception when duplicate_object then null;
end $$;
do $$ begin
  create policy "records delete" on records for delete
    using (private.is_household_editor(household_id));
exception when duplicate_object then null;
end $$;

drop policy if exists "reminders write" on reminders;
do $$ begin
  create policy "reminders insert" on reminders for insert
    with check (private.is_household_editor(household_id));
exception when duplicate_object then null;
end $$;
do $$ begin
  create policy "reminders update" on reminders for update
    using (private.is_household_editor(household_id))
    with check (private.is_household_editor(household_id));
exception when duplicate_object then null;
end $$;
do $$ begin
  create policy "reminders delete" on reminders for delete
    using (private.is_household_editor(household_id));
exception when duplicate_object then null;
end $$;

drop policy if exists "pkg write" on share_packages;
do $$ begin
  create policy "pkg insert" on share_packages for insert
    with check (private.is_household_editor(household_id));
exception when duplicate_object then null;
end $$;
do $$ begin
  create policy "pkg update" on share_packages for update
    using (private.is_household_editor(household_id))
    with check (private.is_household_editor(household_id));
exception when duplicate_object then null;
end $$;
do $$ begin
  create policy "pkg delete" on share_packages for delete
    using (private.is_household_editor(household_id));
exception when duplicate_object then null;
end $$;

drop policy if exists "shares write" on shares;
do $$ begin
  create policy "shares insert" on shares for insert
    with check (private.is_household_editor(household_id));
exception when duplicate_object then null;
end $$;
do $$ begin
  create policy "shares update" on shares for update
    using (private.is_household_editor(household_id))
    with check (private.is_household_editor(household_id));
exception when duplicate_object then null;
end $$;
do $$ begin
  create policy "shares delete" on shares for delete
    using (private.is_household_editor(household_id));
exception when duplicate_object then null;
end $$;

-- ── КАТЕГОРИЯ B2 ── household_id через родителя share_packages ─────────
-- Предикат ALL: package_id in (select id from share_packages where
-- private.is_household_editor(household_id)); сиблинг SELECT (не
-- трогаем) — тот же join через private.is_household_member.

drop policy if exists "pkg docs write" on share_package_documents;
do $$ begin
  create policy "pkg docs insert" on share_package_documents for insert
    with check (package_id in (
      select id from share_packages where private.is_household_editor(household_id)
    ));
exception when duplicate_object then null;
end $$;
do $$ begin
  create policy "pkg docs update" on share_package_documents for update
    using (package_id in (
      select id from share_packages where private.is_household_editor(household_id)
    ))
    with check (package_id in (
      select id from share_packages where private.is_household_editor(household_id)
    ));
exception when duplicate_object then null;
end $$;
do $$ begin
  create policy "pkg docs delete" on share_package_documents for delete
    using (package_id in (
      select id from share_packages where private.is_household_editor(household_id)
    ));
exception when duplicate_object then null;
end $$;

drop policy if exists "pkg summaries write" on share_package_summaries;
do $$ begin
  create policy "pkg summaries insert" on share_package_summaries for insert
    with check (package_id in (
      select id from share_packages where private.is_household_editor(household_id)
    ));
exception when duplicate_object then null;
end $$;
do $$ begin
  create policy "pkg summaries update" on share_package_summaries for update
    using (package_id in (
      select id from share_packages where private.is_household_editor(household_id)
    ))
    with check (package_id in (
      select id from share_packages where private.is_household_editor(household_id)
    ));
exception when duplicate_object then null;
end $$;
do $$ begin
  create policy "pkg summaries delete" on share_package_summaries for delete
    using (package_id in (
      select id from share_packages where private.is_household_editor(household_id)
    ));
exception when duplicate_object then null;
end $$;

-- ── КАТЕГОРИЯ B3 ── household_id напрямую, ALL требует owner (не editor) ─
-- Предикат ALL: private.is_household_owner(household_id); сиблинг SELECT
-- (не трогаем) — private.is_household_member(household_id).

drop policy if exists "hm manage" on household_members;
do $$ begin
  create policy "hm insert" on household_members for insert
    with check (private.is_household_owner(household_id));
exception when duplicate_object then null;
end $$;
do $$ begin
  create policy "hm update" on household_members for update
    using (private.is_household_owner(household_id))
    with check (private.is_household_owner(household_id));
exception when duplicate_object then null;
end $$;
do $$ begin
  create policy "hm delete" on household_members for delete
    using (private.is_household_owner(household_id));
exception when duplicate_object then null;
end $$;

drop policy if exists "inv manage" on invitations;
do $$ begin
  create policy "inv insert" on invitations for insert
    with check (private.is_household_owner(household_id));
exception when duplicate_object then null;
end $$;
do $$ begin
  create policy "inv update" on invitations for update
    using (private.is_household_owner(household_id))
    with check (private.is_household_owner(household_id));
exception when duplicate_object then null;
end $$;
do $$ begin
  create policy "inv delete" on invitations for delete
    using (private.is_household_owner(household_id));
exception when duplicate_object then null;
end $$;

-- ── КАТЕГОРИЯ B4 ── employment-кластер, ALL требует компанию ────────────
-- Предикат ALL: employment_id in (select id from employments where
-- company_id is not null and private.can_access_employer(company_id));
-- сиблинг SELECT (не трогаем) — "employment_id in (select id from
-- employments)", безопасно шире по результату эмпирической проверки
-- (см. заголовок файла).

drop policy if exists "empdocs company manage" on employment_documents;
do $$ begin
  create policy "empdocs company insert" on employment_documents for insert
    with check (employment_id in (
      select id from employments
      where company_id is not null and private.can_access_employer(company_id)
    ));
exception when duplicate_object then null;
end $$;
do $$ begin
  create policy "empdocs company update" on employment_documents for update
    using (employment_id in (
      select id from employments
      where company_id is not null and private.can_access_employer(company_id)
    ))
    with check (employment_id in (
      select id from employments
      where company_id is not null and private.can_access_employer(company_id)
    ));
exception when duplicate_object then null;
end $$;
do $$ begin
  create policy "empdocs company delete" on employment_documents for delete
    using (employment_id in (
      select id from employments
      where company_id is not null and private.can_access_employer(company_id)
    ));
exception when duplicate_object then null;
end $$;

drop policy if exists "onboarding company manage" on onboarding_tasks;
do $$ begin
  create policy "onboarding company insert" on onboarding_tasks for insert
    with check (employment_id in (
      select id from employments
      where company_id is not null and private.can_access_employer(company_id)
    ));
exception when duplicate_object then null;
end $$;
do $$ begin
  create policy "onboarding company update" on onboarding_tasks for update
    using (employment_id in (
      select id from employments
      where company_id is not null and private.can_access_employer(company_id)
    ))
    with check (employment_id in (
      select id from employments
      where company_id is not null and private.can_access_employer(company_id)
    ));
exception when duplicate_object then null;
end $$;
do $$ begin
  create policy "onboarding company delete" on onboarding_tasks for delete
    using (employment_id in (
      select id from employments
      where company_id is not null and private.can_access_employer(company_id)
    ));
exception when duplicate_object then null;
end $$;

drop policy if exists "offboarding company manage" on offboarding_tasks;
do $$ begin
  create policy "offboarding company insert" on offboarding_tasks for insert
    with check (employment_id in (
      select id from employments
      where company_id is not null and private.can_access_employer(company_id)
    ));
exception when duplicate_object then null;
end $$;
do $$ begin
  create policy "offboarding company update" on offboarding_tasks for update
    using (employment_id in (
      select id from employments
      where company_id is not null and private.can_access_employer(company_id)
    ))
    with check (employment_id in (
      select id from employments
      where company_id is not null and private.can_access_employer(company_id)
    ));
exception when duplicate_object then null;
end $$;
do $$ begin
  create policy "offboarding company delete" on offboarding_tasks for delete
    using (employment_id in (
      select id from employments
      where company_id is not null and private.can_access_employer(company_id)
    ));
exception when duplicate_object then null;
end $$;

-- ── КАТЕГОРИЯ B5 ── vacancies, роль явно authenticated (не public) ─────
-- Предикат ALL: employer_id in (select id from employer_profiles where
-- user_id = (select auth.uid())); сиблинг SELECT (не трогаем) —
-- "vacancies member read" (private.can_access_employer). Третья
-- SELECT-политика "anyone reads active vacancies" (anon+authenticated,
-- status='active') — отдельная persona, не трогаем. TO authenticated
-- сохраняем явно на всех трёх новых политиках — расширять на anon/public
-- нельзя, в отличие от household-таблиц выше.

drop policy if exists "employers manage own vacancies" on vacancies;
do $$ begin
  create policy "employers insert own vacancies" on vacancies for insert
    to authenticated
    with check (employer_id in (
      select id from employer_profiles where user_id = (select auth.uid())
    ));
exception when duplicate_object then null;
end $$;
do $$ begin
  create policy "employers update own vacancies" on vacancies for update
    to authenticated
    using (employer_id in (
      select id from employer_profiles where user_id = (select auth.uid())
    ))
    with check (employer_id in (
      select id from employer_profiles where user_id = (select auth.uid())
    ));
exception when duplicate_object then null;
end $$;
do $$ begin
  create policy "employers delete own vacancies" on vacancies for delete
    to authenticated
    using (employer_id in (
      select id from employer_profiles where user_id = (select auth.uid())
    ));
exception when duplicate_object then null;
end $$;

commit;

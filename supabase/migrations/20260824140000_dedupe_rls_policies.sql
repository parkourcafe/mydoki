-- =====================================================================
-- Схлопнуть дублирующиеся PERMISSIVE RLS-политики (Supabase performance
-- advisor, multiple_permissive_policies: ~131 находок = ~26-27 реальных
-- пар политик × до 5 ролей, т.к. advisor репортит отдельно на каждую
-- комбинацию {table, role, command}). Обе категории ниже — чистая
-- консолидация: ни один реальный доступ не меняется, только убирается
-- избыточное вычисление второго permissive-quals (Postgres OR'ит все
-- permissive-политики, применимые к команде/роли — лишняя политика это
-- лишний planner-node, не лишний доступ).
--
-- КАТЕГОРИЯ A — DROP узкой SELECT-политики, доказанной строгим
-- подмножеством уже существующей на той же таблице SELECT-политики.
-- Основание: private.can_access_employer(employer_id) = "owner ИЛИ
-- company member" (см. 20260712210000_rls_hardening.sql), т.е. строго
-- шире чем "owner-only" через employer_profiles.user_id = auth.uid().
-- Проверено чтением обоих qual-выражений в pg_policies, не только по
-- именам. Кандидат application_resumes НЕ включён: там нет второй,
-- более широкой SELECT-политики — не дубликат, не трогаем.
--
-- КАТЕГОРИЯ B — для таблицы с FOR ALL "write/manage" (предикат P_narrow)
-- и отдельной FOR SELECT "read" (предикат P_broad), где доказано
-- P_narrow ⟹ P_broad, разбиваем FOR ALL на явные FOR INSERT/UPDATE/DELETE
-- с тем же предикатом на обеих сторонах (using == with check, как и в
-- оригинальных ALL-политиках) — SELECT-применимость этой политики просто
-- убирается, т.к. её полностью покрывает уже существующая read-политика.
-- Основания подмножеств:
--   B1/B2/B3: is_household_owner(h) ⟹ is_household_editor(h) ⟹
--     is_household_member(h) — прямое следствие того, что все три
--     функции (private, STABLE SECURITY DEFINER) читают одну и ту же
--     строку household_members и отличаются только фильтром по role.
--   B4: employments сама под RLS (не SECURITY DEFINER) — эмпирически
--     проверено реальной ROLLBACK'нутой транзакцией (SET LOCAL ROLE
--     authenticated + подмена auth.uid() под outsider/employee), что
--     подзапрос "employment_id in (select id from employments)" на
--     вызывающую роль сужается ровно до "employee-self OR
--     company-accessible" — строгое надмножество "company-accessible"
--     в узкой ALL-политике. Это НЕ уязвимость, а штатное поведение RLS
--     для не-DEFINER функций/подзапросов (проверялись outsider=0 строк,
--     employee=своя строка на employment_documents/onboarding_tasks/
--     offboarding_tasks).
--   B5 (vacancies): owner-only (employer_profiles.user_id=auth.uid())
--     ⊆ can_access_employer (owner OR company member), обе политики
--     TO authenticated — роль сохраняем явно на всех трёх новых
--     политиках, чтобы не расширить на anon/public как у household-таблиц.
--
-- Сознательно НЕ включено (проверено по pg_policies, не тронуто):
--   company_members — "owner manage" даёт владельцу видимость ЧУЖИХ
--     строк, которой "read self" не покрывает — не подмножество, разбор
--     сломал бы владельцу видимость команды.
--   document_checks, document_versions — только INSERT+SELECT, ALL нет.
--   employment_amendments, employment_verifications — только SELECT,
--     ALL-политики в pg_policies нет (нет клиентского write-пути).
--   households — только UPDATE ("household manage"), не ALL, дублей нет.
--   offers, vacancy_versions — уже минимальны, дублирующихся пар нет.
--
-- Откат: пересоздать 5 политик категории A их исходным CREATE POLICY
-- (см. 20260712210000_rls_hardening.sql для "employers update application
-- status" стиля и исходные тексты); для категории B — drop 3
-- insert/update/delete политики и create policy "<исходное имя>" ...
-- for all using (<предикат из соответствующего B-блока ниже>)
-- with check (<тот же предикат>).
-- =====================================================================

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
create policy "assets insert" on assets for insert
  with check (private.is_household_editor(household_id));
create policy "assets update" on assets for update
  using (private.is_household_editor(household_id))
  with check (private.is_household_editor(household_id));
create policy "assets delete" on assets for delete
  using (private.is_household_editor(household_id));

drop policy if exists "consents write" on consents;
create policy "consents insert" on consents for insert
  with check (private.is_household_editor(household_id));
create policy "consents update" on consents for update
  using (private.is_household_editor(household_id))
  with check (private.is_household_editor(household_id));
create policy "consents delete" on consents for delete
  using (private.is_household_editor(household_id));

drop policy if exists "custom_doc_categories write" on custom_doc_categories;
create policy "custom_doc_categories insert" on custom_doc_categories for insert
  with check (private.is_household_editor(household_id));
create policy "custom_doc_categories update" on custom_doc_categories for update
  using (private.is_household_editor(household_id))
  with check (private.is_household_editor(household_id));
create policy "custom_doc_categories delete" on custom_doc_categories for delete
  using (private.is_household_editor(household_id));

drop policy if exists "files write" on document_files;
create policy "files insert" on document_files for insert
  with check (private.is_household_editor(household_id));
create policy "files update" on document_files for update
  using (private.is_household_editor(household_id))
  with check (private.is_household_editor(household_id));
create policy "files delete" on document_files for delete
  using (private.is_household_editor(household_id));

-- documents: третья SELECT-политика "documents delegated read" (delegated
-- reader, private.can_delegate_read_document) — отдельная persona, не
-- трогаем и не пытаемся слить; разбор "documents write" от неё не зависит.
drop policy if exists "documents write" on documents;
create policy "documents insert" on documents for insert
  with check (private.is_household_editor(household_id));
create policy "documents update" on documents for update
  using (private.is_household_editor(household_id))
  with check (private.is_household_editor(household_id));
create policy "documents delete" on documents for delete
  using (private.is_household_editor(household_id));

drop policy if exists "members write" on members;
create policy "members insert" on members for insert
  with check (private.is_household_editor(household_id));
create policy "members update" on members for update
  using (private.is_household_editor(household_id))
  with check (private.is_household_editor(household_id));
create policy "members delete" on members for delete
  using (private.is_household_editor(household_id));

drop policy if exists "records write" on records;
create policy "records insert" on records for insert
  with check (private.is_household_editor(household_id));
create policy "records update" on records for update
  using (private.is_household_editor(household_id))
  with check (private.is_household_editor(household_id));
create policy "records delete" on records for delete
  using (private.is_household_editor(household_id));

drop policy if exists "reminders write" on reminders;
create policy "reminders insert" on reminders for insert
  with check (private.is_household_editor(household_id));
create policy "reminders update" on reminders for update
  using (private.is_household_editor(household_id))
  with check (private.is_household_editor(household_id));
create policy "reminders delete" on reminders for delete
  using (private.is_household_editor(household_id));

drop policy if exists "pkg write" on share_packages;
create policy "pkg insert" on share_packages for insert
  with check (private.is_household_editor(household_id));
create policy "pkg update" on share_packages for update
  using (private.is_household_editor(household_id))
  with check (private.is_household_editor(household_id));
create policy "pkg delete" on share_packages for delete
  using (private.is_household_editor(household_id));

drop policy if exists "shares write" on shares;
create policy "shares insert" on shares for insert
  with check (private.is_household_editor(household_id));
create policy "shares update" on shares for update
  using (private.is_household_editor(household_id))
  with check (private.is_household_editor(household_id));
create policy "shares delete" on shares for delete
  using (private.is_household_editor(household_id));

-- ── КАТЕГОРИЯ B2 ── household_id через родителя share_packages ─────────
-- Предикат ALL: package_id in (select id from share_packages where
-- private.is_household_editor(household_id)); сиблинг SELECT (не
-- трогаем) — тот же join через private.is_household_member.

drop policy if exists "pkg docs write" on share_package_documents;
create policy "pkg docs insert" on share_package_documents for insert
  with check (package_id in (
    select id from share_packages where private.is_household_editor(household_id)
  ));
create policy "pkg docs update" on share_package_documents for update
  using (package_id in (
    select id from share_packages where private.is_household_editor(household_id)
  ))
  with check (package_id in (
    select id from share_packages where private.is_household_editor(household_id)
  ));
create policy "pkg docs delete" on share_package_documents for delete
  using (package_id in (
    select id from share_packages where private.is_household_editor(household_id)
  ));

drop policy if exists "pkg summaries write" on share_package_summaries;
create policy "pkg summaries insert" on share_package_summaries for insert
  with check (package_id in (
    select id from share_packages where private.is_household_editor(household_id)
  ));
create policy "pkg summaries update" on share_package_summaries for update
  using (package_id in (
    select id from share_packages where private.is_household_editor(household_id)
  ))
  with check (package_id in (
    select id from share_packages where private.is_household_editor(household_id)
  ));
create policy "pkg summaries delete" on share_package_summaries for delete
  using (package_id in (
    select id from share_packages where private.is_household_editor(household_id)
  ));

-- ── КАТЕГОРИЯ B3 ── household_id напрямую, ALL требует owner (не editor) ─
-- Предикат ALL: private.is_household_owner(household_id); сиблинг SELECT
-- (не трогаем) — private.is_household_member(household_id).

drop policy if exists "hm manage" on household_members;
create policy "hm insert" on household_members for insert
  with check (private.is_household_owner(household_id));
create policy "hm update" on household_members for update
  using (private.is_household_owner(household_id))
  with check (private.is_household_owner(household_id));
create policy "hm delete" on household_members for delete
  using (private.is_household_owner(household_id));

drop policy if exists "inv manage" on invitations;
create policy "inv insert" on invitations for insert
  with check (private.is_household_owner(household_id));
create policy "inv update" on invitations for update
  using (private.is_household_owner(household_id))
  with check (private.is_household_owner(household_id));
create policy "inv delete" on invitations for delete
  using (private.is_household_owner(household_id));

-- ── КАТЕГОРИЯ B4 ── employment-кластер, ALL требует компанию ────────────
-- Предикат ALL: employment_id in (select id from employments where
-- company_id is not null and private.can_access_employer(company_id));
-- сиблинг SELECT (не трогаем) — "employment_id in (select id from
-- employments)", безопасно шире по результату эмпирической проверки
-- (см. заголовок файла).

drop policy if exists "empdocs company manage" on employment_documents;
create policy "empdocs company insert" on employment_documents for insert
  with check (employment_id in (
    select id from employments
    where company_id is not null and private.can_access_employer(company_id)
  ));
create policy "empdocs company update" on employment_documents for update
  using (employment_id in (
    select id from employments
    where company_id is not null and private.can_access_employer(company_id)
  ))
  with check (employment_id in (
    select id from employments
    where company_id is not null and private.can_access_employer(company_id)
  ));
create policy "empdocs company delete" on employment_documents for delete
  using (employment_id in (
    select id from employments
    where company_id is not null and private.can_access_employer(company_id)
  ));

drop policy if exists "onboarding company manage" on onboarding_tasks;
create policy "onboarding company insert" on onboarding_tasks for insert
  with check (employment_id in (
    select id from employments
    where company_id is not null and private.can_access_employer(company_id)
  ));
create policy "onboarding company update" on onboarding_tasks for update
  using (employment_id in (
    select id from employments
    where company_id is not null and private.can_access_employer(company_id)
  ))
  with check (employment_id in (
    select id from employments
    where company_id is not null and private.can_access_employer(company_id)
  ));
create policy "onboarding company delete" on onboarding_tasks for delete
  using (employment_id in (
    select id from employments
    where company_id is not null and private.can_access_employer(company_id)
  ));

drop policy if exists "offboarding company manage" on offboarding_tasks;
create policy "offboarding company insert" on offboarding_tasks for insert
  with check (employment_id in (
    select id from employments
    where company_id is not null and private.can_access_employer(company_id)
  ));
create policy "offboarding company update" on offboarding_tasks for update
  using (employment_id in (
    select id from employments
    where company_id is not null and private.can_access_employer(company_id)
  ))
  with check (employment_id in (
    select id from employments
    where company_id is not null and private.can_access_employer(company_id)
  ));
create policy "offboarding company delete" on offboarding_tasks for delete
  using (employment_id in (
    select id from employments
    where company_id is not null and private.can_access_employer(company_id)
  ));

-- ── КАТЕГОРИЯ B5 ── vacancies, роль явно authenticated (не public) ─────
-- Предикат ALL: employer_id in (select id from employer_profiles where
-- user_id = (select auth.uid())); сиблинг SELECT (не трогаем) —
-- "vacancies member read" (private.can_access_employer). Третья
-- SELECT-политика "anyone reads active vacancies" (anon+authenticated,
-- status='active') — отдельная persona, не трогаем. TO authenticated
-- сохраняем явно на всех трёх новых политиках — расширять на anon/public
-- нельзя, в отличие от household-таблиц выше.

drop policy if exists "employers manage own vacancies" on vacancies;
create policy "employers insert own vacancies" on vacancies for insert
  to authenticated
  with check (employer_id in (
    select id from employer_profiles where user_id = (select auth.uid())
  ));
create policy "employers update own vacancies" on vacancies for update
  to authenticated
  using (employer_id in (
    select id from employer_profiles where user_id = (select auth.uid())
  ))
  with check (employer_id in (
    select id from employer_profiles where user_id = (select auth.uid())
  ));
create policy "employers delete own vacancies" on vacancies for delete
  to authenticated
  using (employer_id in (
    select id from employer_profiles where user_id = (select auth.uid())
  ));

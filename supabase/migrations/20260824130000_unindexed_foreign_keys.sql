-- =====================================================================
-- Индексы на внешние ключи без покрывающего индекса.
--
-- Supabase performance advisor (unindexed_foreign_keys, 15 находок):
-- каждый JOIN и каждое ON DELETE по такому FK сейчас идёт последовательным
-- сканированием таблицы. На 4 откликах и 1 записи найма это незаметно —
-- на реальном объёме станет узким местом на самых частых путях (applications
-- по user_id — «мои отклики», company_members по user_id — «моя роль в
-- компании»).
--
-- CREATE INDEX без CONCURRENTLY: таблицы сейчас пустые или почти пустые,
-- блокировка на доли секунды не заметна. На выросшей таблице такую миграцию
-- уже нужно будет делать CONCURRENTLY вне транзакции.
--
-- Сознательно НЕ включено в эту миграцию: 23 находки unused_index из того
-- же отчёта. Это метрика по факту использования, а не по структуре, и при
-- 9 пользователях почти любой индекс окажется «неиспользуемым» просто по
-- нехватке трафика — удаление сейчас рискует снести то, что понадобится
-- при первом же росте нагрузки. Пересмотреть отдельно, когда появится
-- реальная статистика запросов.
-- =====================================================================

create index if not exists application_status_log_changed_by_idx
  on application_status_log(changed_by);

create index if not exists applications_user_id_idx
  on applications(user_id);

create index if not exists company_members_user_id_idx
  on company_members(user_id);

create index if not exists document_checks_household_id_idx
  on document_checks(household_id);

create index if not exists document_versions_household_id_idx
  on document_versions(household_id);

create index if not exists documents_current_version_id_idx
  on documents(current_version_id);

create index if not exists employment_amendments_created_by_idx
  on employment_amendments(created_by);

create index if not exists employment_documents_acknowledged_by_idx
  on employment_documents(acknowledged_by);

create index if not exists employment_documents_uploaded_by_idx
  on employment_documents(uploaded_by);

create index if not exists employment_verifications_created_by_idx
  on employment_verifications(created_by);

create index if not exists employments_created_by_idx
  on employments(created_by);

create index if not exists offboarding_tasks_created_by_idx
  on offboarding_tasks(created_by);

create index if not exists offers_created_by_idx
  on offers(created_by);

create index if not exists onboarding_tasks_created_by_idx
  on onboarding_tasks(created_by);

create index if not exists share_package_summaries_document_id_idx
  on share_package_summaries(document_id);

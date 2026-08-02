-- Restore the explicit object privileges required by the authenticated web
-- and native clients. RLS remains the row-level authority for every table.
-- This migration is intentionally explicit because production privileges had
-- drifted: employer profile upserts and private RLS helpers returned 42501.

begin;

-- Private RLS helpers are callable only while evaluating authenticated flows.
grant usage on schema private to authenticated;

revoke all on function
  private.current_user_household_ids(),
  private.is_household_member(uuid),
  private.is_household_editor(uuid),
  private.is_household_owner(uuid),
  private.can_access_employer(uuid),
  private.can_delegate_read_document(uuid)
from public, anon;

grant execute on function
  private.current_user_household_ids(),
  private.is_household_member(uuid),
  private.is_household_editor(uuid),
  private.is_household_owner(uuid),
  private.can_access_employer(uuid),
  private.can_delegate_read_document(uuid)
to authenticated;

-- Personal vault. Policies still restrict every row to the user's household.
grant select, update on table public.households to authenticated;
grant select on table public.household_members to authenticated;
grant select, insert, update, delete on table
  public.members,
  public.assets,
  public.custom_doc_categories,
  public.documents,
  public.records,
  public.reminders,
  public.consents
to authenticated;
grant select, insert, delete on table public.document_files to authenticated;
grant select, insert on table
  public.document_versions,
  public.document_checks,
  public.shares,
  public.share_packages,
  public.share_package_documents,
  public.login_events,
  public.ai_usage
to authenticated;
grant select on table public.audit_log to authenticated;
grant select, insert, delete on table public.invitations to authenticated;
grant select, insert, update, delete on table public.native_push_tokens
  to authenticated;

-- Employer and hiring workspace. Creation/status transitions that use
-- SECURITY DEFINER RPCs remain RPC-only; direct grants cover app queries and
-- the documented owner-managed updates protected by RLS.
grant select, insert, update on table public.employer_profiles to authenticated;
grant select, insert, update, delete on table public.company_members
  to authenticated;
grant select, update on table public.vacancies to authenticated;
grant select on table public.vacancies to anon;
grant select, insert on table public.vacancy_versions to authenticated;
grant select on table
  public.applications,
  public.application_documents,
  public.application_answers,
  public.application_status_log,
  public.application_events
to authenticated;
grant select, insert, update on table public.ai_runs to authenticated;

commit;

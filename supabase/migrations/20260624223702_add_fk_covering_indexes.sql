-- Covering indexes for foreign keys flagged by the performance advisor.
create index if not exists idx_reminders_document_id on public.reminders (document_id);
create index if not exists idx_reminders_household_id on public.reminders (household_id);
create index if not exists idx_reminders_member_id   on public.reminders (member_id);
create index if not exists idx_shares_document_id     on public.shares (document_id);
create index if not exists idx_shares_household_id    on public.shares (household_id);
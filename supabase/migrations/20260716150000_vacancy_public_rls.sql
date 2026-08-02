-- Public apply links must be readable without an authenticated session.
-- Owner/member policies referenced protected employer tables/functions and
-- were also evaluated for anon, causing a permission error before the public
-- active-vacancy policy could return a row.

drop policy if exists "anyone reads active vacancies" on vacancies;
create policy "anyone reads active vacancies" on vacancies for select
  to anon, authenticated
  using (status = 'active');

drop policy if exists "employers manage own vacancies" on vacancies;
create policy "employers manage own vacancies" on vacancies for all
  to authenticated
  using (employer_id in (
    select id from employer_profiles where user_id = (select auth.uid())
  ))
  with check (employer_id in (
    select id from employer_profiles where user_id = (select auth.uid())
  ));

drop policy if exists "vacancies member read" on vacancies;
create policy "vacancies member read" on vacancies for select
  to authenticated
  using (private.can_access_employer(employer_id));

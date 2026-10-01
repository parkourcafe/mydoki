# RLS / security tests

SQL tests that check row-level security and privilege boundaries. They need a
Postgres instance with the schema applied, so they are a separate CI job
(`RLS policies`) rather than part of `npm test`. Each file wraps everything in
`begin … rollback`, so running them leaves no data behind.

Every file ends with a `do $$ … $$` block that **raises on a violation**, so a
run either exits 0 or fails loudly. Earlier these files only printed values and
a human had to compare them against the header — which is why they never ran
anywhere.

## Files

| File | What it protects |
|---|---|
| `isolation.sql` | One household cannot see another's members or households |
| `document_versions.sql` | Versions are immutable and not visible across accounts |
| `invitations.sql` | Invitations grant access only after acceptance, with the right role |
| `claim_application.sql` | Only the candidate can attach an application to an account |
| `write_roles.sql` | A viewer cannot write; an editor cannot change household membership; employment records stay private |
| `talent_pool_visibility.sql` | A confidential profile is not discoverable by a blocked or current employer, and never leaks identity |
| `talent_pool_current_employer.sql` | "Hide from current employer" does not depend on fields the employer edits: renaming after verification does not reveal the candidate, the name snapshot taken at verification cannot be changed by the employer, and an active `employments` record with that organization hides the candidate even without a typed name |
| `opportunity_invite_flow.sql` | A blind invitation reveals nothing until the candidate accepts, and `Share & apply` writes exactly one immutable snapshot |
| `hiring_flow.sql` | An unverified employer cannot publish; a verified one publishes, an anonymous candidate applies once, and the application reaches that employer's board and no one else's |
| `employer_verification.sql` | An employer cannot verify themselves, raise `vacancy_limit` or reset code attempts through PostgREST; the email-code flow still verifies, and Talent Pool access does not expire with the 15-minute code |
| `employer_verified_domain.sql` | Confirming the email code records the domain of the address the code went to (public mail providers excluded) so "hide from" and "block" by domain work in Talent Pool; a public-mail employer stays verified without a domain; the apply-page badge is not shown for a revoked employer or next to a company name that is not the profile's |
| `employment_status_log.sql` | An employer marking an employment `ended` leaves a journal row (who, when, from → to) that the employee can read and a third organization cannot; the mark deletes neither the candidate's account nor their application documents; the employer cannot reassign the record (`employee_user_id`, `application_id`, `manual`, `company_name`); `complete_offboarding` is journaled too; manual records are untouched |

`talent_pool_visibility.sql` and `opportunity_invite_flow.sql` used to print
values for a human to compare; they now raise like the rest and run in
`run.sh`. Not covered yet: item 9 of `opportunity_invite_flow.sql` (the
criteria explanation in a snapshot comes from `match_assessments`, not from
the candidate).

Employer verification in these tests is set as the schema owner, not as the
employer: in the product it is the server that confirms an employer, so the
tests must not depend on an employer being able to verify themselves.

`write_roles.sql` exists because `20260824140000_dedupe_rls_policies` split
`FOR ALL` policies into separate `INSERT`/`UPDATE`/`DELETE` ones on 18 tables.
A mistake there would not show up as "sees too much" but as "writes without the
right", and nothing covered that.

## Running them

```bash
# any empty database, addressed through the standard PG* variables
PGHOST=localhost PGPORT=5432 PGUSER=postgres PGPASSWORD=postgres \
PGDATABASE=postgres npm run test:rls
```

The script applies `_local_shim.sql`, then every migration in order, then the
grants PostgREST would normally issue, then each test. It stops at the first
failed migration: an incomplete schema would make the tests answer the wrong
question.

**Never point it at the live project** — it applies the schema to whatever
`PG*` resolves to.

**Against Supabase**, one file at a time: paste it into the SQL Editor. A
violation shows up as a red error instead of a result table.

**A throwaway local cluster**, if you have no Postgres to hand:

```bash
initdb -D /var/tmp/pgtest -U postgres --auth=trust     # run as a non-root user
pg_ctl -D /var/tmp/pgtest -o '-p 55432 -k /var/tmp' -l /var/tmp/pg.log start
PGHOST=/var/tmp PGPORT=55432 PGUSER=postgres PGDATABASE=postgres npm run test:rls
```

The shim only approximates Supabase (`auth.uid()`, `auth.email()`, the
`authenticated`/`anon` roles, `storage.foldername`). It is close enough to
verify policy logic, but a green local run is **not** a substitute for
checking the real project when a policy changes.

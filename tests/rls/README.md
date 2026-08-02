# RLS / security tests

SQL tests that check row-level security and privilege boundaries. They cannot
run under `npm test` — they need a Postgres instance with the schema applied.
Each file wraps everything in `begin … rollback`, so running them leaves no
data behind.

## Files

| File | What it protects |
|---|---|
| `isolation.sql` | One household cannot see another's members or households |
| `document_versions.sql` | Versions are immutable and not visible across accounts |
| `invitations.sql` | Invitations grant access only after acceptance, with the right role |
| `claim_application.sql` | Only the candidate can attach an application to an account |

## Running them

**Against Supabase:** paste a file into the SQL Editor and compare the output
with the expected values in that file's header.

**Locally**, without touching any real data:

```bash
# 1. a throwaway cluster
initdb -D /var/tmp/pgtest -U postgres --auth=trust     # run as a non-root user
pg_ctl -D /var/tmp/pgtest -o '-p 55432 -k /var/tmp' -l /var/tmp/pg.log start

# 2. Supabase shims (auth.uid/email, roles, storage helpers) + schema
psql -h /var/tmp -p 55432 -U postgres -f tests/rls/_local_shim.sql
for f in supabase/migrations/*.sql; do
  psql -h /var/tmp -p 55432 -U postgres -q -f "$f"
done
psql -h /var/tmp -p 55432 -U postgres \
  -c "grant select,insert,update,delete on all tables in schema public to authenticated, anon;"

# 3. the tests
for t in isolation document_versions invitations claim_application; do
  echo "== $t"; psql -h /var/tmp -p 55432 -U postgres -tAq -f "tests/rls/$t.sql"
done
```

A few migrations fail with "already exists" on a clean run — they are
superseded by later ones and it does not affect these tests.

The shim only approximates Supabase (`auth.uid()`, `auth.email()`, the
`authenticated`/`anon` roles, `storage.foldername`). It is close enough to
verify policy logic, but a green local run is **not** a substitute for
checking the real project when a policy changes.

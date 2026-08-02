# Sprint 0 — Audit ("data room")

**Date:** 2026-07-04
**Method:** live production Supabase (project `uuopxzlcmzdtwebottar`) + `doki.help` (this repo) code grep.
**Scope note:** `doki.help` and `Doki.id` share ONE Supabase project, so every DB-level fact below is true for **both** apps. The only real split is app **code/UI**. GitHub access here is scoped to `parkourcafe/mydoki`, so the `Doki.id` code column is inferred (shared DB + session history), not a direct repo diff.

## State matrix

| Roadmap item | Shared DB (prod) | doki.help code | Verdict |
|---|---|---|---|
| `applications.user_id` (Manus 2) | ✅ present | ✅ used | **done** |
| `applications.access_token` | ✅ present | ✅ used | **done** |
| Claim RPC (Manus 7 / §5.1) | ✅ `claim_application(p_token)` — matches on `access_token`, sets `user_id` if null | ✅ used | **done, secure** — no `auth.users` trigger, no unverified matching (matches §8) |
| Anti-spam: IP limit (Manus 4) | ✅ `submit_application` counts by `ip_hash` over an interval, raises `rate_limit`; index `idx_applications_ip_hash_created` | — | **done** (in submit) |
| Anti-duplicate by phone | ✅ `UNIQUE (vacancy_id, whatsapp)` | — | **done** (1 application per phone per vacancy) |
| Turnstile (Manus 4) | n/a (env keys) | ❌ absent | in `Doki.id` only |
| Funnel `?src` + views (Manus 5-adj) | ✅ `applications.source`, `applications.ip_hash`, `vacancies.views_count`, `increment_vacancy_views` | ❌ `?src` not captured | DB done; capture UI in `Doki.id` |
| Employer verification | ✅ `set_employer_verification`, `confirm_employer_verification` | — | present (`Doki.id` feature) |
| Vacancy reports (spam) | ✅ `vacancy_reports` + `report_vacancy` | — | present |
| **`hired` status (§2.3)** | ❌ status check = `new/viewed/shortlisted/rejected` | ❌ | **TO BUILD** (Sprint 1) |
| **PostHog (§2.1)** | n/a | ❌ absent (only Yandex Metrica) | **TO BUILD** (needs account/key) |
| **Phone limit 3/24h (§2.2)** | ⚠️ only per-vacancy unique | — | small refinement |
| Video screening (§3.1) | ❌ no columns / no bucket | ❌ | to build |
| Subscriptions / billing (§6) | ❌ no `subscriptions` | ❌ | Month 3 |
| `candidate_profiles` (§7) | ❌ absent | ❌ | triggered |
| Status notifications (§3.2) | ❌ no `notify_status_change` | email infra (Resend) exists | to build |

## Sprint 0 questions — answered
- **`user_id` / `access_token`:** both exist.
- **Claim RPC:** `claim_application`, matches on `access_token`, sets `user_id`. Manus steps 2 & 7 effectively closed.
- **Rate limiting:** IP limit inside `submit_application` + per-vacancy phone uniqueness. Cross-vacancy "3/24h" (§2.2) is NOT present — a refinement.
- **Repo split:** `Doki.id` is a separate repo. Not directly readable from here.

## Storage buckets
`vault-files` (private), `applications` (private). No `video-screenings` yet. `portfolio-images` (public) pending PR #50.

## Implications for the roadmap
- Sprint 0 **closes Manus 2 and most of Manus 4/7** — do not rebuild.
- Genuinely net-new in Sprint 1: **PostHog**, **`hired` status**, **phone-limit refinement**.
- **Merge (§4):** the split is only in UI code — the DB is already unified. "Merge" = port `Doki.id`'s UI features (Turnstile, `?src` capture, doc-reuse) into `doki.help`, not "merge databases".

## `submit_application` deployed signature
`(p_application_id, p_slug, p_full_name, p_whatsapp, p_email, p_consent_text, p_answers, p_documents, p_source, p_ip_hash, p_user_id)` — the v2 (funnel + ip_hash + user_id) version is live.

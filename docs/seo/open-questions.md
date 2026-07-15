# SEO content — open questions & TODO tracker

The new SEO pages were written **verified-facts-only**; anything unconfirmed was
left as an inline `(TODO: …)` placeholder (×4 languages). This file consolidates
all of them so they can be resolved in one pass.

52 `TODO:` markers in code → **8 distinct questions**. Each question's
placeholder text repeats across 4 languages (ru/en/id/uz) and sometimes several
pages, so **one answer resolves all of its occurrences**.

> Resolution flow: fill the **Answer** below → the placeholder sentence on the
> listed page(s) is replaced with the confirmed fact in all 4 languages.

---

## ✅ Already answerable from the repo (no need to ask the team)

These TODOs can be closed using the base's own `/security` page copy and the
merged account-deletion work — pending a yes/no confirmation.

### A. Access log — what it shows  (audit: product detail)
- **Pages:** `/secure-document-sharing` (×4)
- **Placeholder:** "…each open logged. (TODO: confirm exactly what the log shows…)"
- **Repo says:** base `/security` → "Every link-based document view is written to
  a log — you can see what was opened and when."
- **Proposed resolution:** state "every open is logged with what document and when."
- **Confirm:** is that the full extent (no IP/device captured to advertise)? ☐

### B. Data storage region  (audit Q3)
- **Pages:** `/expat-document-organizer` (×4), `/medical-document-organizer` (×4, combined with at-rest)
- **Placeholder:** "(TODO: confirm data storage region…)"
- **Repo says:** base `/security` → "Servers may be located outside Russia — details
  in the Privacy Policy."
- **Proposed resolution:** "data is stored in secure cloud (Supabase); servers may be
  outside Russia — see the Privacy Policy" and link `/privacy`.
- **Confirm:** exact region (e.g. Supabase project region) if you want it stated? ☐

### C. Self-serve account deletion  (audit Q7)
- **Pages:** `/data-deletion` (×4)
- **Placeholder:** "To delete your account… contact support. (TODO: confirm whether
  self-service account deletion exists in-app…)"
- **Repo says:** PR #24 "self-serve account deletion" merged — `app/my/security/DeleteAccount.tsx`
  + migration `add_delete_my_account`. So **self-serve deletion now exists** at `/my/security`.
- **Proposed resolution:** "you can delete your account and data yourself from
  Settings → Security" (+ link), instead of "contact support".
- **Confirm:** point users to `/my/security`? (base `/security` page text still says
  "contact support" — likely stale, worth aligning too.) ☐

### D. AI recognition framing  (audit Q6, framing)
- **Pages:** `/ai-processing` (×4), and the "auto-fill with AI on upload" lines in
  several landings.
- **Mismatch to fix:** base `/security` says **AI recognition is opt-in, off by
  default** — "a document image is sent to an AI provider only if you turn
  recognition on yourself in settings." My pages imply AI runs automatically on
  upload. **This should be corrected to opt-in** regardless of the provider answer.
- **Confirm:** opt-in/off-by-default is correct? ☐  *(still need provider+retention — see Q5 below)*

---

## ❓ Need the team (genuinely unknown in the repo)

### Q1. Reminder lead time & configurable intervals  ⭐ (biggest — audit Q1)
- **Pages:** `/passport-expiry-reminder`, `/document-expiry-reminder`,
  `/visa-expiry-reminder`, `/travel-documents`, `/checklists/travel-documents-checklist`,
  `/checklists/child-documents-checklist` — ~24 occurrences (×4 langs).
- **Placeholder:** "a reminder arrives by email before it expires. (TODO: confirm
  exact lead time / whether intervals are configurable…)"
- **Answer:** ✅ **30 / 15 / 7 / 1 day before** the "valid until" date. Applied to all pages + guides. (Configurability not confirmed → not claimed.)

### Q2. Reminder channels beyond email (push / SMS)  (audit Q1)
- **Pages:** `/document-expiry-reminder` (×4)
- **Placeholder:** "By email… (TODO: confirm any additional channels such as push…)"
- **Answer:** ⚠️ push/SMS "maybe" — not firmly confirmed. Copy states **email only**; will add push/SMS once confirmed.

### Q3. At-rest encryption  (audit Q2)
- **Pages:** `/medical-document-organizer` (×4)
- **Placeholder:** "(TODO: confirm at-rest encryption and data region…)"
- **Answer:** ❓ Unknown, team to investigate. Speculative at-rest claim removed; copy keeps only confirmed (private bucket, HTTPS, RLS, 2FA).

### Q5. AI provider — name, what's retained, for how long  (audit Q6)
- **Pages:** `/ai-processing` (×4)
- **Placeholder:** "processed by a third-party AI provider. (TODO: confirm which
  provider, what is retained and for how long…)"
- **Repo hint:** `.env.example` has `ANTHROPIC_API_KEY` (+ `GLM_*`) — likely Anthropic
  and/or GLM, but **do not state publicly without confirmation**.
- **Answer:** Provider is **GLM (Zhipu), not Anthropic**. Retention unknown, team to investigate. Copy stays generic ("third-party AI provider") — no name disclosed publicly. Note: `.env.example` still lists `ANTHROPIC_API_KEY` — a code question for the team, not user-facing.

### Q8. Offline access — what's cached and any limits  (audit, offline mechanics)
- **Pages:** `/travel-documents` (×4)
- **Placeholder:** "open them offline. (TODO: confirm exactly what is cached and any
  limits…)"
- **Answer:** ❓ Unknown, team to investigate. Copy keeps general "documents saved in advance are available offline (PWA)"; specific cache scope/limits claim removed.

---

## ⚠️ Confirm even though there's no TODO

- **Google Drive import** — `/vs/google-drive` states *"there's no automatic import
  yet"* (manual download → upload). Confirm that's accurate. ☐
- **Free-tier "2 GB"** — stated as fact across pages (matches the homepage copy).
  Confirm still current. ☐

---

## Summary

| # | Question | Pages | Status |
|---|----------|-------|--------|
| A | Access log shows what/when | secure-document-sharing | repo-answerable — **not yet applied** |
| B | Data storage region | expat, medical | repo-answerable — **not yet applied** |
| C | Self-serve account deletion exists | data-deletion | **✅ applied** (PR #24 → points to /my/security) |
| D | AI is opt-in / off by default | ai-processing | **✅ applied** (off-by-default wording) |
| Q1 | Reminder lead time / intervals | 6 pages + guides | **✅ answered & applied** — 30 / 15 / 7 / 1 day before |
| Q2 | Reminder channels (push/SMS) | document-expiry-reminder | **partial** — push/SMS only "maybe"; copy states **email only** until confirmed |
| Q3 | At-rest encryption | medical | **still open** — unknown; speculative claim removed, only confirmed facts kept |
| Q5 | AI provider name + retention | ai-processing | **partial** — provider is **GLM (not Anthropic)**; retention unknown; copy stays generic ("third-party AI provider"), no name disclosed |
| Q8 | Offline cache scope/limits | travel-documents | **still open** — unknown; kept general "saved-in-advance works offline (PWA)", limits claim removed |
| — | Google Drive import accurate? | vs/google-drive | confirm |
| — | Free-tier 2 GB current? | many | confirm |

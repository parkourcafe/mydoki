# Variant A — owner happy-path smoke test (doki — "Family vault")

**Goal:** in ~15–20 minutes, walk the main owner journey on production
**https://doki.help** with your own account and confirm nothing is broken.
The button/field labels below are the real ones (en locale).

> Sign in to doki with the **parkourcafe@gmail.com** account + your password.
> (The `booberid@gmail.com` login is PET ID, not doki.)
> `doki.help` redirects to `www.doki.help` — that's expected.

## Before you start
- Open the site in a normal browser window.
- Open the console: **F12 → Console** — watch for red errors as you go.
- Test **both desktop and mobile**: in DevTools use the device toolbar → pick an
  iPhone and walk the key screens again.
- On every step, watch for: an endless spinner, unclear error texts, broken layout.

## Steps

**1. Open the site**
Action: open `https://doki.help` (it redirects to `www.doki.help`).
✅ Landing loads: badge "🔐 Family vault", heading "All your family's documents —
in one secure place", footer line "Private by default · RLS · private storage".
No red errors in the console.

**2. Go to sign-in**
Action: click the sign-in button on the landing (or open `/login` directly).
✅ Sign-in page: badge "🔐 Family vault", "Sign in with Google" button, then an
**Email / Password** form, a "Forgot password?" link, and a "No account? Sign up"
toggle.

**3. ⚠️ Environment check (mini-negative)**
Action: enter your email and a **deliberately wrong password**, click "Sign in".
✅ A red error message appears — the form does **not** hang (so Supabase is
connected and responding).
❌ If you get an endless spinner or a blank screen instead — record it and report.

**4. Sign in**
Action: enter `parkourcafe@gmail.com` and the correct password → "Sign in".
✅ You land in the cabinet `/my`. Left sidebar "Family vault" with: **👪 Family,
📄 Documents, 🚗 Assets, 🔍 Search, ⏰ Deadlines, 🔑 Access, 🛡️ Security,
📥 Offline**. On a phone the menu hides behind "☰".

**5. Add a family member**
Action: on **"Family"**, expand "**+ Add family member**". Fill in: **Name**
(required, e.g. "Test Smith"), **Relation** (pick from the list), **Date of birth**
(optional). Click "**Add**".
✅ A person card appears in the grid.
Validation check: try to save with an empty **Name** → the browser blocks
submission (field is required).

**6. Open the person card**
Action: click the card you created.
✅ Opens `/my/members/<id>`: name, relation, a "🩺 Health card →" link, a documents
block, and a "Records" block.

**7. Add a document WITH NO typing** (new feature)
Action: expand "**+ Add document**". In the file zone click "**📎 Choose file**"
(or "**📷 Take a photo**" on a phone) and pick a test image/PDF. The "**Title**"
field is marked "(optional)" — **leave it blank**. Click "**Save document**".
✅ The document saves and its page opens. Since you left the title blank, it's
auto-named **from the file name**.
❌ If it complains about storage space — that's the quota message; check the text
is clear.
(The "✨ Recognize dates (AI)" button only shows when AI recognition is enabled —
it may be absent, that's fine.)

**8. Documents by section + your own section**
Action: open "**📄 Documents**".
✅ A list of **all categories** with counts (🪪 ID documents, 🎓 Education,
💼 Work & career, 🩺 Medical, 💳 Finance, 🧾 Taxes, 📜 Legal, 🗂️ Other). The
category your doc went into shows a count ≥ 1.
Action: open that category → you see the document and "+ Add document".
Action: back on "Documents", expand "**+ Your own section**", fill "**Icon**"
(emoji) and "**Section name**" → "**Create section**".
✅ The new section appears in the list. Open it → you can add documents; there's a
"Delete section".

**9. Document card + sharing (the key part)**
Action: open the document (`/my/documents/<id>`). Sections: "Details", "Files",
"Share". Under "Share" set "**Valid, days**" (default 7), "**View limit**"
(0 = no limit), the "**Watermark**" / "**Download**" checkboxes → "**Create link**".
✅ A row appears: "**Active · until <date> · views 0**" with a copy button and
"**Revoke**".
Action: copy the link (looks like `/s/<token>`) and open it in a **private window**
(no login).
✅ The document opens **without signing in** — exactly what a doctor/clerk sees via
the link. No extra/other people's data should appear.
Action: go back and click "**Revoke**".
✅ Status changes to "Revoked", and the link stops working in the private window
(refresh it).

**10. Deadlines (reminders)**
Action (setup): give some document a "Valid until" date within 60 days (via adding
a new document with that date). Then open "**⏰ Deadlines**".
✅ The document shows in the list with days remaining; on the "Family" home there's
a yellow "⏰ Expiring soon" banner. If nothing is due — "Nothing expires anytime
soon 🎉".

**11. Search**
Action: open "**🔍 Search**", type part of the document title.
✅ The document shows in the results.

**12. Records and persistence after refresh**
Action: on the person card expand "**+ Add record**", pick a "Type" (e.g. "Lab
test"), enter a "Title" → "**Save record**". Then refresh the page (**F5**).
✅ The record persists after the refresh. There's a "delete" next to it.

**13. Security / 2FA**
Action: open "**🛡️ Security**".
✅ Your account email is shown; a "**Two-factor authentication (2FA)**" block (you
can start setup — QR for an authenticator app + code entry); "**Login alerts**"
with email/SMS chips; "**Recent logins**" (your current session listed, maybe
tagged "new device"); "**Sign out of all devices**". Just confirm it all loads;
you don't have to finish 2FA.

**14. Assets and Offline (quick)**
Action: "**🚗 Assets**" → add an item (e.g. a car) → in its card you can also
attach a document.
Action: on a document page save it for offline, then open "**📥 Offline**".
✅ The document is available in the offline section.

**15. Mobile view + cleanup**
Action: switch to iPhone view and repeat steps 4–9.
✅ The menu opens via "☰" and closes on navigation; forms are comfortable; layout
doesn't break.
**Cleanup:** test document → "Delete document"; section → "Delete section"; record
→ "delete". There is **no delete button for a family member** in the cabinet —
that's normal, don't look for it. **Do NOT delete real data.**

## Where to log findings

| # | What you did | Expected | Got | Screen/browser |
|---|--------------|----------|-----|----------------|
| 1 |              |          |     | desktop/mobile |
| 2 |              |          |     |                |

If anything goes wrong on a step — record it (what you clicked, expected, got,
screenshot + browser/device) and **keep going, don't stop at the first bug**.

---

Main difference from PET ID: doki has **no public QR passport** — here sharing is
private, via **expiring, revocable links** (step 9), which is the key thing to test.

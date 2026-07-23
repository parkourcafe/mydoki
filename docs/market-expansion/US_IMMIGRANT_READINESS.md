# DOKI HELP: US immigrant market readiness

Audit date: 2026-07-17

Status: corrected legal/product plan. This document is a risk review and
implementation brief, not a legal opinion. US counsel must approve the final
notices, employment flow, entity structure and state-law coverage before launch.

## Executive decision

DOKI can use one app and backend for Indonesia and the United States, but it
must separate these concepts in data, UI and legal records:

1. `market_country`: the product/document pack selected by the user.
2. `employer_state`: the US state relevant to employer-facing rules, when known.
3. `locale`: the language the user reads.
4. `role`: individual/candidate or employer/agency.
5. `processing_role`: whether DOKI acts for its own consumer service or processes
   candidate/employee data for an employer.

Do not infer a legal jurisdiction only from IP, device language or App Store
country. Ask the user, allow correction, and version every consent and notice.
If no approved legal pack exists, legal content and regulated employer features
must fail closed rather than fall back to Indonesian or Russian law.

## Corrections to the original plan

### 1. Separate the personal vault from employer collection

The US immigration pack belongs in the individual's private vault. It must not
become a vacancy checklist or an employer request menu.

- Before a job offer, permit only role-relevant, non-sensitive application
  materials such as a resume, diploma or professional certificate.
- Do not ask an applicant for a passport, visa, Green Card, EAD, I-94, Social
  Security card, health record or other proof of work authorization.
- Do not use E-Verify or MyE-Verify to pre-screen applicants.
- After hire, do not represent DOKI as an I-9 system. An employee must choose
  which acceptable Form I-9 document or document combination to present.
- A future I-9/E-Verify module requires separate US counsel review, prescribed
  timing, document-choice safeguards, auditability and retention rules.
- Post-offer medical collection is not automatically permitted. It requires a
  real conditional offer, consistent treatment of entrants in the same job
  category, a lawful purpose and confidential storage separate from ordinary
  personnel records.

The existing application-stage filter is a useful control, but its English label
filter must also cover `visa`, `green card`, `permanent resident`, `EAD`,
`I-766`, `I-94`, `I-797`, `I-20`, `DS-2019`, `social security`, `SSN` and
common spelling variants. A denylist alone is not sufficient; the vacancy form
should use an allowlist of approved application-stage document types.

### 2. Exclude Social Security data from the US MVP

"Not requested by default" is insufficient because the generic vault currently
accepts arbitrary uploads. For the controlled US MVP:

- do not provide an SSN or Social Security card template;
- do not extract, index, display in notifications or send such data to AI;
- show a clear warning and block files/metadata that the user identifies as an
  SSN or Social Security card;
- exclude tax returns and other templates that predictably contain SSNs.

Supporting SSNs later requires a separate legal basis, privacy disclosure,
security design, incident-response assessment and App Privacy recheck.

### 3. Do not treat every date as a legal status expiry

The field `expires_at` and label "Valid until" are not legally accurate for all
US immigration records:

- a visa expiration date controls when the visa may be used to seek entry; it
  does not determine the authorized period of stay;
- Form I-94 may contain an `admit until` date or `D/S` (duration of status);
- expiration of a standard Green Card does not by itself terminate lawful
  permanent resident status, while conditional residence has separate rules;
- an EAD may remain acceptable under a category-specific automatic extension;
- I-20 and DS-2019 program dates do not independently prove immigration or work
  authorization status;
- I-797 is a family of notices, not one document with one legal meaning.

Store typed date facts rather than one universal expiry:

```ts
type DateMeaning =
  | "document_expiry"
  | "visa_valid_until"
  | "admit_until"
  | "duration_of_status"
  | "program_end"
  | "employment_authorization_card_expiry"
  | "notice_date"
  | "user_defined";

type DocumentDate = {
  meaning: DateMeaning;
  value: string | null;
  textValue: "D/S" | null;
  source: "user" | "ai_suggestion";
  userConfirmed: boolean;
};
```

Reminders are user planning aids, not legal determinations. Copy must say
"reminder for the date on your document" and never "your status expires" or
"renew by". AI may suggest a date only after just-in-time disclosure and must
require human confirmation. Offsets such as 180/90/30/7 days are configurable;
the current automatic query only looks 30 days ahead and cannot deliver the
earlier reminders.

## Controlled US individual MVP

### Include in the personal vault

- Passport, with issuing country.
- US visa, with visa class, entries and visa-valid-until date.
- Form I-94, with admit-until date or `D/S`.
- Employment Authorization Document (Form I-766/EAD).
- Permanent Resident Card (Form I-551/Green Card).
- USCIS notices, including the specific I-797 notice type.
- Form I-20 and Form DS-2019, with program dates described accurately.
- State ID or driver's license, optionally.
- Resume, contracts, diplomas, professional licenses and certificates.
- Translations and supporting correspondence.
- User-controlled, expiring sharing to a lawyer or other chosen recipient.

Use official form names without government seals or branding and state clearly
that DOKI is not affiliated with USCIS, CBP, DHS or the Department of State and
does not verify immigration status or employment eligibility.

### Exclude until separately approved

- SSNs, Social Security cards and SSN-bearing tax records.
- Medical and health records in the US market until the Washington/FTC health
  data workstream below is complete or the feature is gated off for US users.
- Form I-9 completion, storage or reverification workflows.
- E-Verify integrations or work-authorization decisions.
- Individualized immigration/legal advice and any feature named "AI lawyer".
- Automated candidate ranking, eligibility or rejection based on documents,
  citizenship, immigration status, nationality, disability or health.

## Market-pack contract

```ts
type MarketCountry = "ID" | "US";

type MarketPack = {
  code: MarketCountry;
  version: string;
  supportedLocales: Array<"id" | "en" | "es" | "ru" | "uz">;
  documentTemplates: string[];
  legalNoticeVersion: string;
  privacyNoticeUrl: string;
  healthPrivacyNoticeUrl?: string;
  supportEmail: string;
  features: {
    hiring: boolean;
    healthDocuments: boolean;
    immigrationVault: boolean;
    employerVerification: boolean;
  };
};
```

Do not put one `defaultRetentionMonths` in this market pack. Retention depends
on the record and legal relationship. Store the selected country and, for US
employers, state plus the source and date of that selection. Keep consent text,
notice version, locale, timestamp and withdrawal status.

## Privacy and data-governance gates

### Controller, processor and notices

1. Identify the real legal entity/controller by full legal name, physical or
   registered address and working privacy contact. A TIN alone is insufficient
   for a clear US-facing notice.
2. Distinguish the consumer vault relationship from employer processing. For
   employer candidate/employee data, define the employer's instructions and
   responsibilities in a DPA/service agreement and provide an applicant notice.
3. Inventory government identifiers, immigration records, health data, child
   profiles, application data, authentication, analytics and support data.
4. Publish purposes, sources, recipients/subprocessors, retention schedule,
   cross-border locations, rights, verification and appeal routes.
5. Name the active AI provider, data sent, model-training position, retention
   and deletion terms. Obtain separate, just-in-time opt-in before sending a
   document to AI; a generic Terms checkbox is not enough.
6. Google OAuth must not bypass acceptance/version logging for Terms and the
   applicable privacy notice. Health-data consent, where required, must remain
   separate from general Terms.

### Washington health-data gate

Because DOKI can store medical and vaccination records and is available to US
consumers, a breach runbook alone is not enough. Before enabling health records
for Washington consumers, implement or obtain counsel approval for:

- a conspicuous, separate consumer health data privacy policy linked from the
  homepage;
- disclosed categories, sources, purposes, shared categories, third-party
  categories and specific affiliates;
- consent before collection or sharing when an exception does not apply, with
  collection and sharing consents separated;
- access, withdrawal, deletion and appeal workflows, including notification to
  processors and deletion from backups within the statutory outer limit;
- processor contracts and access limited to personnel who need the data;
- reasonable administrative, technical and physical safeguards;
- a documented FTC Health Breach Notification Rule applicability assessment
  and federal/state incident workflow.

The safest MVP choice is to gate US health-document templates and health-card
navigation off until this work is complete. The FTC rule is not assumed to apply
solely because a file is medical; counsel must analyze whether DOKI is a vendor
of personal health records, a related entity or a service provider under the
rule. FTC Act accuracy and security obligations still remain.

### California and other states

Do not state that CCPA automatically applies. Confirm the legal entity, for-
profit status, revenue and data-volume thresholds. As of 2025 the adjusted gross
revenue threshold is $26,625,000; other statutory tests also exist. Design the
product to support access, correction, deletion, limitation and non-
discrimination even if DOKI is currently below the threshold. Perform a state-
by-state launch assessment for sensitive data, breach notice, biometrics and
employment privacy rather than treating `US` as one complete legal jurisdiction.

### Children

Make DOKI a general-audience, adult-account service:

- require the account holder to be 18 or older;
- allow an adult to create a dependent profile and upload a child's records as
  parent/legal guardian;
- do not market the service to children or allow independent child accounts;
- document how a parent requests access/deletion for a dependent profile.

An adult uploading a child's record does not by itself make the child the user,
but actual knowledge of an under-13 account holder changes COPPA obligations.

## Employment and retention gates

- Use an allowlist for application-stage files and counsel-approved screening
  questions. Do not publish discriminatory citizenship/nationality preferences
  or requests for a particular work-authorization document.
- Keep medical information inaccessible from ordinary candidate/personnel
  records and enforce a separate authorization model.
- Personal-vault files: retain until user deletion, subject to a disclosed
  backup-deletion period and legal holds.
- Applicant records: employer-configurable policy with a lawful minimum and
  legal hold. Covered employers generally have federal recordkeeping duties;
  certain institutions, government employers and federal contractors have
  longer periods. A universal 12-month promise is not sufficient.
- Form I-9: not in MVP. If later added, apply the statutory formula (three years
  after hire or one year after employment ends, whichever is later) and the
  electronic storage/audit requirements.
- Washington consumer health deletion: include processors and backups as
  required; do not reuse the ordinary account-deletion schedule blindly.

## App Store gates

1. App Privacy answers are app-level and must describe the most inclusive data
   behavior across countries and roles. Adding US document features requires a
   fresh comparison against Health, Sensitive Info, Photos/Videos, Other User
   Content and other relevant types.
2. Apple states that apps requiring sensitive user information should be
   submitted by a legal entity rather than an individual developer. Confirm
   whether the account must be converted to an Organization before relying on
   document storage as the core product.
3. Because Google Sign-In creates the primary account, the iOS app needs an
   equivalent privacy-preserving login option meeting Guideline 4.8 (normally
   Sign in with Apple) unless a documented exception applies.
4. The WebView shell must provide adequate native/app-like utility beyond a
   repackaged website. Keep Face ID/app lock, secure file/camera integration,
   push/reminder behavior and other native value working and documented for
   review.
5. The privacy policy must be accessible in-app and disclose collection, use,
   recipients, retention/deletion and consent withdrawal. App Review metadata
   and screenshots must match real functionality.
6. Availability in all 175 storefronts creates a much broader legal/compliance
   scope. For a controlled launch, use only approved countries unless the owner
   formally accepts and counsels the wider scope.

## Security release gate

Government identifiers and health documents require a documented security
review before US marketing. At minimum verify and test:

- private storage, RLS and least-privilege service-role access;
- encryption in transit and at rest, key ownership and backup protection;
- MFA and native app lock availability;
- short-lived, revocable share links, access logs and recipient warnings;
- secure deletion, backup expiry and deletion propagation;
- malware/file validation, secret management, audit logging and alerting;
- subprocessor contracts, incident ownership and federal/state breach runbooks;
- no sensitive document content in analytics, email subjects, push payloads or
  ordinary server logs.

Avoid absolute marketing claims such as "completely secure". Describe only
controls that have been verified in production.

## Localization and legal-language plan

- English (US) first; Spanish next for the US product.
- Indonesian for Indonesia; Russian and Uzbek remain user languages, not legal
  jurisdictions.
- Legal notices must be accurately translated and delivered in the language
  ordinarily used with the consumer where required. Product translation alone
  does not localize the legal relationship.
- Native iOS must stop forcing English before marketing multilingual support.

## Corrected priority plan

### P0 before US marketing or enabling the US pack

- Freeze US employer requests for identity, immigration and health documents;
  replace denylist-only filtering with an application-stage allowlist.
- Exclude SSN/Social Security card and US health templates.
- Implement typed US document dates and non-legal reminder copy.
- Replace global Russian/Indonesian legal fallbacks with versioned market-aware
  Terms, privacy and legal content that fail closed.
- Identify the legal entity and sign/verify processor and subprocessor terms.
- Fix Google OAuth consent/version logging and add the iOS equivalent login
  option required by Guideline 4.8.
- Decide whether the Apple developer membership must be an Organization.
- Complete the security gate and production incident contacts.
- Limit storefronts to approved markets or document the explicit risk decision.

### P1 for a credible US immigrant vault

- Add the approved personal-vault templates and typed date UX.
- Add English/Spanish onboarding, vault, sharing, deletion and support.
- Add country/state selection and immutable notice/consent records.
- Add role-specific retention, rights and deletion workflows.
- Run end-to-end privacy, security and language QA for individual, candidate and
  employer roles.

### P2 only after specialized legal validation

- Enable US health records after Washington/FTC/state readiness.
- Build Form I-9/E-Verify as a dedicated module, not a generic checklist.
- Add sourced, versioned state employer content with review dates.
- Consider individualized legal assistance only through licensed counsel and a
  separately approved service model; do not revive the "AI lawyer" label.

## Release control while iOS 1.0 is in review

The iOS app loads the live website, so a production web change can change the
submitted build's behavior without a new binary. Develop US work additively and
behind a server-side flag that is disabled for the review account and production
1.0. Do not deploy new data collection, login or legal flows into the reviewer
path while the build is awaiting review. Prepare the complete change set for
version 1.1 and recheck App Privacy before enabling it.

The submitted build nevertheless has a known Guideline 4.8 risk if it displays
Google Sign-In without an equivalent qualifying login option. If its status is
still `Waiting for Review`, withdrawing and submitting a corrected binary is the
lowest-rejection-risk route; if Apple is already reviewing it, do not change the
live reviewer flow and respond to the review result with the prepared fix.

## Ownership

### AI/engineering

- Implement the market/state/role model, typed dates and document allowlists.
- Implement consent evidence, deletion/export, retention and audit controls.
- Add feature flags, tests, security controls and App Store metadata drafts.
- Draft notices, data maps, processor inventory and incident runbooks for
  counsel review; do not make final legal conclusions.

### Selena/business and licensed counsel

- Confirm the operating legal entity, Apple Organization status and launch
  states/countries.
- Approve Terms, privacy notices, DPA, retention and support/rights process.
- Review Washington health data, FTC HBNR applicability, employment/ADA,
  immigration/I-9/E-Verify and state privacy/breach requirements.
- Approve final English/Spanish positioning and screenshots.

## Official references

- Apple App Review Guidelines:
  https://developer.apple.com/app-store/review/guidelines/
- Apple App Privacy management:
  https://developer.apple.com/help/app-store-connect/manage-app-information/manage-app-privacy/
- Apple App Privacy data types:
  https://developer.apple.com/app-store/app-privacy-details/
- Apple App Store availability:
  https://developer.apple.com/help/app-store-connect/manage-your-apps-availability/manage-availability-for-your-app-on-the-app-store
- USCIS Form I-9 instructions:
  https://www.uscis.gov/sites/default/files/document/forms/i-9instr.pdf
- DOJ Form I-9 and E-Verify anti-discrimination guidance:
  https://www.justice.gov/crt/form-i-9-and-e-verify
- E-Verify Self Check and pre-screening warning:
  https://www.e-verify.gov/employees/mye-verify/self-check
- Department of State: visa expiration versus authorized stay:
  https://travel.state.gov/content/travel/en/us-visas/visa-information-resources/visa-expiration-date.html
- USCIS permanent-resident-card policy:
  https://www.uscis.gov/node/80393
- ICE SEVIS student guidance:
  https://www.ice.gov/sevis/travel
- BridgeUSA exchange visitor lifecycle:
  https://j1visa.state.gov/exchange-visitor-lifecycle/
- EEOC medical inquiries and examinations:
  https://www.eeoc.gov/pre-employment-inquiries-and-medical-questions-examinations
- EEOC employment recordkeeping:
  https://www.eeoc.gov/employers/recordkeeping-requirements
- Washington My Health My Data Act:
  https://app.leg.wa.gov/RCW/default.aspx?cite=19.373&full=true
- FTC Health Breach Notification Rule guidance:
  https://www.ftc.gov/business-guidance/resources/complying-ftcs-health-breach-notification-rule-0
- FTC COPPA guidance:
  https://www.ftc.gov/business-guidance/resources/complying-coppa-frequently-asked-questions
- California CCPA overview:
  https://www.oag.ca.gov/privacy/ccpa
- California 2025 adjusted monetary thresholds:
  https://cppa.ca.gov/regulations/cpi_adjustment.html

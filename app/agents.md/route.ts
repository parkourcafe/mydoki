// agents.md — служебное описание сайта для ИИ-агентов (service-doc).
// Отдаём как text/markdown, ссылку на него кладём в Link-заголовок главной.
// Сайт ведёт два продукта на разных рынках: RU/UZ — «семейный сейф»,
// EN/ID — сбор документов кандидатов и сотрудников (Индонезия), поэтому
// описание выбираем по локали запроса (x-locale → cookie → Accept-Language).

import { getLocale } from "@/lib/i18n";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://www.doki.help";

const FAMILY_DOC = `# doki — Family Vault

> doki (${APP_URL}) is a private, multilingual vault where families keep their
> important documents in one place: IDs, education and medical records,
> finances, taxes, legal papers, plus cars and property.

## What it is

A web app for storing, organizing and sharing a family's documents securely.
Documents are grouped by person (and by asset, such as a car or apartment) and
by category. Families can also create their own custom sections.

## Who it's for

Parents and families who want one calm, private place for every important
paper — and to find it fast when it is needed: renewals, travel, school,
doctors, government offices. A large RU-audience segment is Russian-speaking
expats living abroad long-term (for example in Indonesia/Bali): visas and
stay permits, insurance, rental contracts and children's documents in one
place, with renewal reminders.

## Key features

- Per-person and per-asset document folders, grouped by category
- Custom sections families define themselves
- Expiry reminders for documents with a validity date
- Secure sharing via expiring links (optional watermark, view limits)
- Multiple family "spaces" with role-based access
- Two-factor authentication (TOTP)

## Privacy

Documents live in private, per-family storage protected by row-level security;
files are served only through short-lived signed links. We do not permit AI
model training on this site's content (see ${APP_URL}/robots.txt, the
Content-Signal directive).

## Languages

Russian (ru), English (en), Indonesian (id), Uzbek (uz). The interface follows
the visitor's language.

## Public pages

- Home: ${APP_URL}/
- Privacy: ${APP_URL}/privacy
- Terms: ${APP_URL}/terms

## Getting started

Create a free account at ${APP_URL}/login, add your first family member, then
upload or photograph a document.

## Note for agents

This is a private application. There is no public API, OAuth server, or
agentic-commerce endpoint. A family's documents are accessible only to its
authenticated members. A reusable skill describing how to organize family
documents is published at ${APP_URL}/.well-known/agent-skills/index.json
`;

const HIRING_DOC = `# doki.help — candidate & employee document collection (Indonesia)

> doki.help (${APP_URL}) turns hiring and onboarding paperwork into one link:
> the company defines a document checklist, the candidate uploads files
> through a WhatsApp-ready link without an account, and HR tracks who is
> complete — instead of collecting KTPs, CVs and contracts across chats and
> spreadsheets.

## What it is

A web app for collecting and reviewing candidate/employee documents during
hiring and onboarding. Not a job board: it is used after there is a hiring
or onboarding process.

## Key features

- Document checklists per role, application stage or onboarding step
- One shareable WhatsApp-ready link; candidates upload from any phone
  without creating an account
- Per-candidate completion status: complete / missing / needs update
- Controlled access and secure links; AI/OCR recognition only when enabled

## Who uses it

HR teams, business owners and admins, recruitment agencies, visa agents,
candidates and new employees in Indonesia — hospitality, villas, F&B,
retail, drivers, domestic staff.

## Public pages

- Home: ${APP_URL}/en (English) · ${APP_URL}/id (Indonesian)
- Candidate document collection: ${APP_URL}/en/candidate-document-collection
- HR document checklist tool: ${APP_URL}/en/hr-document-checklist
- Segments: ${APP_URL}/en/for/employers · /en/for/hospitality ·
  /en/for/recruitment-agencies · /en/for/visa-agents · /en/for/job-seekers
- Ready-made checklists: SKCK (${APP_URL}/en/checklists/skck-checklist),
  KITAS & work permit, villa staff, driver, domestic worker,
  ijazah & transcript, employee onboarding
- Comparisons: vs WhatsApp chats (${APP_URL}/en/vs/hr-whatsapp),
  Google Drive, email attachments, spreadsheets, Google Forms
- Pricing: ${APP_URL}/en/pricing · Security: ${APP_URL}/en/security ·
  Privacy: ${APP_URL}/privacy

## Privacy

Files open only through controlled links; access is restricted to authorized
team members. We do not sell data or share it for advertising, and we do not
allow AI model training on this site's content (see ${APP_URL}/robots.txt,
the Content-Signal directive).

## Note for agents

This is an application, not a public API: there is no OAuth server or
agentic-commerce endpoint. Candidates upload through scoped links; employer
data is accessible only to authenticated team members. A markdown overview
is served at ${APP_URL}/api/md (Accept: text/markdown) and an LLM-oriented
page index at ${APP_URL}/llms.txt.
`;

export async function GET() {
  const locale = await getLocale();
  const doc = locale === "ru" || locale === "uz" ? FAMILY_DOC : HIRING_DOC;
  return new Response(doc, {
    headers: {
      "content-type": "text/markdown; charset=utf-8",
      "cache-control": "public, max-age=86400",
      vary: "Accept-Language, Cookie",
    },
  });
}

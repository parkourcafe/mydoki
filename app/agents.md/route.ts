// agents.md — служебное описание сайта для ИИ-агентов (service-doc).
// Отдаём как text/markdown, ссылку на него кладём в Link-заголовок главной.

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://doki.help";

const DOC = `# doki — Family Vault

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
doctors, government offices.

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

export function GET() {
  return new Response(DOC, {
    headers: {
      "content-type": "text/markdown; charset=utf-8",
      "cache-control": "public, max-age=86400",
    },
  });
}

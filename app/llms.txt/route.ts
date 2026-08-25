// llms.txt — LLM-ориентированный индекс публичных страниц (llmstxt.org).
// Держим ссылки вручную: это кураторский список ~25 ключевых URL для
// агентов и LLM, а не полная карта сайта (для этого есть /sitemap.xml).

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://www.doki.help";

const u = (path: string) => `${APP_URL}${path}`;

const DOC = `# doki.help

> doki.help is one platform with two products for different markets.
> Indonesia (English/Indonesian): collect candidate and employee documents
> through one WhatsApp-ready checklist link, with per-person completion
> status — instead of messy chats and spreadsheets. Family Vault
> (Russian/Uzbek): a private place where families keep important documents
> organized by person and category, with expiry reminders and secure
> expiring share links. Free to start. No AI model training on site content
> (see /robots.txt Content-Signal).

## Hiring document collection (Indonesia)

- [Home](${u("/en")}): collect candidate and employee documents with one link
- [Candidate document collection](${u("/en/candidate-document-collection")}): KTP, CV and certificates via one link; candidates upload without an account
- [HR document checklist tool](${u("/en/hr-document-checklist")}): build a checklist per role or onboarding stage
- [Candidate document privacy](${u("/en/candidate-document-privacy")}): collecting KTP and sensitive documents responsibly
- [For employers](${u("/en/for/employers")}): send one checklist, get the full document package back
- [For hospitality](${u("/en/for/hospitality")}): villa, F&B and hotel staff hiring without document chaos
- [For recruitment agencies](${u("/en/for/recruitment-agencies")}): candidate document management per vacancy
- [SKCK checklist](${u("/en/checklists/skck-checklist")}): police clearance certificate requirements for hiring
- [KITAS & work permit checklist](${u("/en/checklists/kitas-work-permit-checklist")}): documents for foreign employees in Indonesia
- [vs WhatsApp chats](${u("/en/vs/hr-whatsapp")}): why a checklist link beats collecting files in chat
- [Indonesian version](${u("/id")}): kumpulkan dokumen kandidat & karyawan lewat satu link

## Family vault (RU/UZ)

- [Семейный сейф](${u("/ru")}): все документы семьи в одном месте с напоминаниями о сроках
- [Passport expiry reminder](${u("/passport-expiry-reminder")}): never miss a passport renewal date
- [Document expiry reminder](${u("/document-expiry-reminder")}): track validity dates for any document
- [Secure document sharing](${u("/secure-document-sharing")}): expiring links with view limits and watermark
- [Family document organizer](${u("/family-document-organizer")}): organize papers by person, asset and category
- [Travel documents](${u("/travel-documents")}): what to prepare before a family trip abroad

## Trust & legal

- [Pricing](${u("/pricing")}): free tier, no credit card to start
- [Security](${u("/security")}): encryption in transit, database-level access rules, 2FA
- [Privacy policy](${u("/privacy")})
- [Terms](${u("/terms")})
- [About](${u("/about")})

## For AI agents

- [agents.md](${u("/agents.md")}): service description for agents (locale-aware)
- [Markdown overview](${u("/api/md")}): homepage summary as text/markdown
- [Agent skills index](${u("/.well-known/agent-skills/index.json")}): reusable skill catalog
`;

export function GET() {
  return new Response(DOC, {
    headers: {
      "content-type": "text/markdown; charset=utf-8",
      "cache-control": "public, max-age=86400",
    },
  });
}

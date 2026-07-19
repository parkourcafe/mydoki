import { Fragment } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getLocale, type Locale } from "@/lib/i18n";
import { altLangs } from "@/lib/seo";
import LangSwitcher from "@/components/LangSwitcher";
import { getComparison } from "@/lib/comparisons";
import { segmentLinks } from "@/lib/segments";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://www.doki.help";

const UI = {
  ru: {
    start: "Начать бесплатно",
    startShort: "Начать",
    back: "← На главную",
    table: "Сравнение по пунктам",
    verdict: "Коротко",
    faq: "Частые вопросы",
    seeAlso: "Кому подходит",
    ctaHeading: "Наведите порядок в документах",
    ctaSub: "Меньше 15 минут — и всё под рукой.",
    privacy: "Конфиденциальность",
    terms: "Условия",
  },
  en: {
    start: "Start for free",
    startShort: "Start",
    back: "← Home",
    table: "Side by side",
    verdict: "Bottom line",
    faq: "FAQ",
    seeAlso: "Who it's for",
    ctaHeading: "Get your documents in order",
    ctaSub: "Less than 15 minutes — and everything at hand.",
    privacy: "Privacy",
    terms: "Terms",
  },
  id: {
    start: "Mulai gratis",
    startShort: "Mulai",
    back: "← Beranda",
    table: "Perbandingan",
    verdict: "Kesimpulan",
    faq: "Pertanyaan umum",
    seeAlso: "Untuk siapa",
    ctaHeading: "Rapikan dokumen Anda",
    ctaSub: "Kurang dari 15 menit — dan semua siap pakai.",
    privacy: "Privasi",
    terms: "Ketentuan",
  },
  uz: {
    start: "Bepul boshlash",
    startShort: "Boshlash",
    back: "← Bosh sahifa",
    table: "Taqqoslash",
    verdict: "Qisqacha",
    faq: "Tez-tez beriladigan savollar",
    seeAlso: "Kimga mos",
    ctaHeading: "Hujjatlaringizni tartibga soling",
    ctaSub: "15 daqiqadan kam — va hammasi qoʻl ostida.",
    privacy: "Maxfiylik",
    terms: "Shartlar",
  },
} as const;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const cmp = getComparison(slug);
  if (!cmp) return {};
  const loc = await getLocale();
  const c = cmp.locales[loc] ?? cmp.locales.ru;
  const ruOnly = slug === "gosuslugi";
  return {
    title: c.title,
    description: c.subtitle,
    alternates: ruOnly
      ? {
          canonical: `${APP_URL}/ru/vs/${slug}`,
          languages: { ru: `${APP_URL}/ru/vs/${slug}` },
        }
      : await altLangs(),
    openGraph: {
      title: c.title,
      description: c.subtitle,
      url: ruOnly ? `${APP_URL}/ru/vs/${slug}` : `${APP_URL}/vs/${slug}`,
    },
  };
}

function Check() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="mt-0.5 shrink-0" aria-hidden="true">
      <path d="M20 6 9 17l-5-5" stroke="#b85c38" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default async function ComparisonPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const cmp = getComparison(slug);
  if (!cmp) notFound();

  const locale: Locale = await getLocale();
  // RU-only сравнения (например, Госуслуги) показываем на русском при любом языке.
  const contentLocale: Locale = cmp.locales[locale] ? locale : "ru";
  const c = cmp.locales[contentLocale]!;
  const t = UI[contentLocale];

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "doki.help", item: APP_URL },
      { "@type": "ListItem", position: 2, name: c.title, item: `${APP_URL}/vs/${slug}` },
    ],
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: c.faq.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <div lang={contentLocale} className="min-h-screen bg-[#f9f5f0] text-[#2c2522]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* NAV */}
      <nav className="sticky top-0 z-50 border-b border-[#e8e0d5] bg-[#fdfaf5]">
        <div className="mx-auto max-w-screen-xl px-5">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center gap-x-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[#b85c38] text-white">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M10 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z" />
                </svg>
              </div>
              <div>
                <span className="text-2xl font-semibold tracking-tighter">doki</span>
                <span className="text-2xl font-semibold tracking-tighter text-[#c17a5e]">.help</span>
              </div>
            </Link>
            <div className="flex shrink-0 items-center gap-x-2 sm:gap-x-4">
              <LangSwitcher locale={locale} />
              <Link href="/login" className="accent-btn shrink-0 rounded-3xl px-4 py-2.5 text-sm font-semibold sm:px-6">
                <span className="sm:hidden">{t.startShort}</span>
                <span className="hidden sm:inline">{t.start}</span>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="mx-auto max-w-screen-xl px-5 pb-8 pt-12">
        <div className="mb-5 inline-flex items-center gap-x-2 rounded-full border border-[#e8e0d5] bg-white px-4 py-1.5 text-sm">
          <span>{cmp.emoji}</span>
          <span className="font-medium text-[#5c5248]">doki.help vs {c.altName}</span>
        </div>
        <h1 className="heading-font max-w-3xl text-[2.4rem] leading-[1.08] tracking-[-1.2px] text-[#2c2522] lg:text-[3.1rem]">
          {c.title}
        </h1>
        <p className="mt-5 max-w-2xl text-[19px] leading-snug text-[#5c5248]">{c.subtitle}</p>
        <p className="mt-4 max-w-2xl text-[16px] leading-relaxed text-[#6b6055]">{c.intro}</p>
        <div className="mt-7">
          <Link
            href="/login"
            className="accent-btn inline-flex items-center justify-center rounded-3xl px-8 py-[15px] text-[17px] font-semibold active:scale-[0.985]"
          >
            {t.start}
          </Link>
        </div>
      </section>

      {/* COMPARISON TABLE */}
      <section className="mx-auto max-w-screen-xl px-5 py-6">
        <h2 className="section-header mb-5">{t.table}</h2>
        <div className="overflow-hidden rounded-3xl border border-[#e8e0d5] bg-white">
          <div className="grid grid-cols-[1.1fr_1fr_1fr] gap-px bg-[#e8e0d5] text-[15px]">
            {/* header row */}
            <div className="bg-[#fdfaf5] px-4 py-3" />
            <div className="bg-[#fdfaf5] px-4 py-3 text-center font-semibold text-[#8a7c6d]">
              {c.altName}
            </div>
            <div className="bg-[#fbf2ec] px-4 py-3 text-center font-semibold text-[#b85c38]">
              doki.help
            </div>
            {/* body rows */}
            {c.rows.map((r) => (
              <Fragment key={r.aspect}>
                <div className="bg-white px-4 py-3.5 font-medium text-[#2c2522]">{r.aspect}</div>
                <div className="flex items-start gap-x-2 bg-white px-4 py-3.5 text-[#8a7c6d]">
                  <span className="mt-0.5 shrink-0">·</span>
                  <span>{r.alt}</span>
                </div>
                <div className="flex items-start gap-x-2 bg-[#fdfaf5] px-4 py-3.5 text-[#5c5248]">
                  <Check />
                  <span>{r.doki}</span>
                </div>
              </Fragment>
            ))}
          </div>
        </div>
      </section>

      {/* VERDICT */}
      <section className="mx-auto max-w-screen-xl px-5 py-6">
        <div className="warm-card rounded-3xl border border-[#e8e0d5] p-7">
          <h2 className="section-header mb-3">{t.verdict}</h2>
          <p className="max-w-3xl text-[17px] leading-relaxed text-[#5c5248]">{c.verdict}</p>
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-screen-xl px-5 py-8">
        <h2 className="section-header mb-5">{t.faq}</h2>
        <div className="grid gap-3">
          {c.faq.map((f) => (
            <details key={f.q} className="group rounded-2xl border border-[#e8e0d5] bg-white p-5">
              <summary className="flex cursor-pointer list-none items-center justify-between font-medium text-[#2c2522]">
                <span>{f.q}</span>
                <span className="ml-3 shrink-0 text-[#b85c38] transition-transform group-open:rotate-45">+</span>
              </summary>
              <p className="mt-3 text-[#5c5248]">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* SEE ALSO — internal links to segment pages */}
      <section className="mx-auto max-w-screen-xl px-5 py-6">
        <h2 className="section-header mb-4">{t.seeAlso}</h2>
        <div className="flex flex-wrap gap-2.5">
          {segmentLinks(contentLocale).map((s) => (
            <Link
              key={s.key}
              href={`/for/${s.key}`}
              className="inline-flex items-center gap-1.5 rounded-2xl border border-[#e8e0d5] bg-white px-3.5 py-1.5 text-sm text-[#5c5248] transition-colors hover:border-[#d4a373]"
            >
              <span>{s.emoji}</span> {s.label}
            </Link>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-screen-xl px-5 py-12">
        <div className="rounded-3xl bg-[#2c2522] px-8 py-10 text-center text-[#f9f5f0]">
          <h2 className="mb-3 text-3xl font-semibold tracking-tight">{t.ctaHeading}</h2>
          <p className="mx-auto mb-7 max-w-sm text-[#d4c9b8]">{t.ctaSub}</p>
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-3xl bg-[#b85c38] px-10 py-4 text-lg font-semibold transition-all hover:bg-[#9f4a2e] active:scale-[0.985]"
          >
            {t.start}
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-[#e8e0d5] bg-[#fdfaf5] px-5 py-8 text-sm text-[#8a7c6d]">
        <div className="mx-auto flex max-w-screen-xl flex-col items-center justify-between gap-y-3 text-center md:flex-row md:text-left">
          <Link href="/" className="hover:text-[#2c2522]">{t.back}</Link>
          <div className="flex gap-x-6">
            <Link href="/privacy" className="hover:text-[#2c2522]">{t.privacy}</Link>
            <Link href="/terms" className="hover:text-[#2c2522]">{t.terms}</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

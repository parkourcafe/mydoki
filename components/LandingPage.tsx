import Link from "next/link";
import { notFound } from "next/navigation";
import { getLocale, type Locale } from "@/lib/i18n";
import LangSwitcher from "@/components/LangSwitcher";
import { getLanding } from "@/lib/landings";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://www.doki.help";

// Локализованные UI-подписи (как в /for/[segment]).
const UI: Record<Locale, { start: string; startShort: string; home: string; seeAlso: string; privacy: string; terms: string; ctaSub: string }> = {
  ru: { start: "Начать бесплатно", startShort: "Начать", home: "← На главную", seeAlso: "Смотрите также", privacy: "Конфиденциальность", terms: "Условия", ctaSub: "Меньше 15 минут — и порядок надолго." },
  en: { start: "Start for free", startShort: "Start", home: "← Home", seeAlso: "See also", privacy: "Privacy", terms: "Terms", ctaSub: "Less than 15 minutes — and order that lasts." },
  id: { start: "Mulai gratis", startShort: "Mulai", home: "← Beranda", seeAlso: "Lihat juga", privacy: "Privasi", terms: "Ketentuan", ctaSub: "Kurang dari 15 menit — dan tertata rapi untuk seterusnya." },
  uz: { start: "Bepul boshlash", startShort: "Boshlash", home: "← Bosh sahifa", seeAlso: "Shuningdek", privacy: "Maxfiylik", terms: "Shartlar", ctaSub: "15 daqiqadan kam — va uzoq saqlanadigan tartib." },
};

function Dot() {
  return <span className="mt-0.5 shrink-0 text-[#b85c38]">•</span>;
}

export default async function LandingPage({ slug }: { slug: string }) {
  const l = getLanding(slug);
  if (!l) notFound();

  const localeRaw = await getLocale();
  const pageLocales = l.pageLocales ?? (["ru", "en", "id", "uz"] as Locale[]);
  const locale: Locale = pageLocales.includes(localeRaw) ? localeRaw : pageLocales[0];
  const c = l.locales[locale];
  const t = UI[locale];
  const base = `/${locale}/${slug}`;

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "doki.help", item: `${APP_URL}/${locale}` },
      { "@type": "ListItem", position: 2, name: c.h1, item: `${APP_URL}${base}` },
    ],
  };
  const softwareApp = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "doki.help",
    applicationCategory: "ProductivityApplication",
    operatingSystem: "Web",
    description: c.metaDescription,
    url: `${APP_URL}${base}`,
    offers: { "@type": "Offer", price: "0", priceCurrency: locale === "ru" ? "RUB" : "USD" },
  };
  // FAQPage — FAQ виден на странице ниже, поэтому разметка допустима.
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
    <div lang={locale} className="min-h-screen bg-[#f9f5f0] text-[#2c2522]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareApp) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      {/* NAV */}
      <nav className="sticky top-0 z-50 border-b border-[#e8e0d5] bg-[#fdfaf5]">
        <div className="mx-auto max-w-screen-xl px-5">
          <div className="flex h-16 items-center justify-between">
            <Link href={`/${locale}`} className="flex shrink-0 items-center gap-x-2 sm:gap-x-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-[#b85c38] text-white">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M10 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z" />
                </svg>
              </div>
              <div className="whitespace-nowrap">
                <span className="text-xl font-semibold tracking-tighter sm:text-2xl">doki</span>
                <span className="text-xl font-semibold tracking-tighter text-[#c17a5e] sm:text-2xl">.help</span>
              </div>
            </Link>
            <div className="flex shrink-0 items-center gap-x-2 sm:gap-x-4">
              <LangSwitcher locale={locale} />
              <Link
                href="/login"
                className="accent-btn shrink-0 whitespace-nowrap rounded-3xl px-4 py-2 text-sm font-semibold sm:px-6 sm:py-2.5"
              >
                {/* Короткий CTA на мобильном, полный — на ≥sm: длинные метки
                    (напр. RU «Начать бесплатно») не влезают рядом с
                    переключателем языков на узких экранах. */}
                <span className="sm:hidden">{t.startShort}</span>
                <span className="hidden sm:inline">{t.start}</span>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="mx-auto max-w-screen-xl px-5 pb-10 pt-12">
        <div className="mb-5 inline-flex items-center gap-x-2 rounded-full border border-[#e8e0d5] bg-white px-4 py-1.5 text-sm">
          <span>{l.emoji}</span>
          <span className="font-medium text-[#5c5248]">{c.navLabel}</span>
        </div>
        <h1 className="heading-font max-w-3xl text-[2.4rem] leading-[1.08] tracking-[-1.2px] text-[#2c2522] lg:text-[3.1rem]">
          {c.h1}
        </h1>
        <p className="mt-5 max-w-2xl text-[19px] leading-snug text-[#5c5248]">{c.intro}</p>
        <div className="mt-7">
          <Link
            href="/login"
            className="accent-btn inline-flex items-center justify-center rounded-3xl px-8 py-[15px] text-[17px] font-semibold active:scale-[0.985]"
          >
            {c.ctaPrimary}
          </Link>
        </div>
      </section>

      {/* SECTIONS */}
      {c.sections.map((s) => (
        <section key={s.h2} className="mx-auto max-w-screen-xl px-5 py-6">
          <h2 className="section-header mb-4">{s.h2}</h2>
          {s.body && <p className="max-w-3xl text-[16px] leading-relaxed text-[#5c5248]">{s.body}</p>}
          {s.bullets && (
            <ul className="mt-3 grid gap-3 md:grid-cols-2">
              {s.bullets.map((b) => (
                <li key={b} className="flex items-start gap-x-3 rounded-2xl border border-[#e8e0d5] bg-white p-4 text-[#5c5248]">
                  <Dot />
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      ))}

      {/* TRUST */}
      <section className="mx-auto max-w-screen-xl px-5 py-6">
        <h2 className="section-header mb-4">{c.trustHeading}</h2>
        <ul className="grid gap-3 md:grid-cols-3">
          {c.trust.map((item) => (
            <li key={item} className="warm-card flex items-start gap-x-3 rounded-3xl border border-[#e8e0d5] p-5 text-[#5c5248]">
              <span className="mt-0.5 shrink-0 text-[#b85c38]">🔒</span>
              <span className="text-[15px] leading-relaxed">{item}</span>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-[14px] text-[#8a7c6d]">
          <Link href={`/${locale}/privacy`} className="underline hover:text-[#2c2522]">
            {t.privacy}
          </Link>
        </p>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-screen-xl px-5 py-6">
        <h2 className="section-header mb-5">{c.faqHeading}</h2>
        <div className="grid gap-3">
          {c.faq.map((f) => (
            <div key={f.q} className="rounded-3xl border border-[#e8e0d5] bg-white p-5">
              <h3 className="font-semibold text-[#2c2522]">{f.q}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-[#5c5248]">{f.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-screen-xl px-5 py-10">
        <div className="warm-card rounded-3xl border border-[#e8e0d5] p-8 text-center">
          <p className="mb-5 text-[#5c5248]">{t.ctaSub}</p>
          <Link
            href="/login"
            className="accent-btn inline-flex items-center justify-center rounded-3xl px-8 py-[15px] text-[17px] font-semibold active:scale-[0.985]"
          >
            {c.ctaPrimary}
          </Link>
        </div>
      </section>

      {/* SEE ALSO + FOOTER */}
      <footer className="mx-auto max-w-screen-xl px-5 py-10 text-sm text-[#8a7c6d]">
        <div className="mb-4">
          <span className="mr-3 font-medium text-[#5c5248]">{t.seeAlso}:</span>
          {l.related[locale].map((r, i) => (
            <span key={r.href}>
              {i > 0 && <span className="mx-2 text-[#d4c9b8]">·</span>}
              <Link href={`/${locale}${r.href}`} className="underline hover:text-[#2c2522]">
                {r.label}
              </Link>
            </span>
          ))}
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-1">
          <Link href={`/${locale}`} className="hover:text-[#2c2522]">{t.home}</Link>
          <Link href={`/${locale}/privacy`} className="hover:text-[#2c2522]">{t.privacy}</Link>
          <Link href={`/${locale}/terms`} className="hover:text-[#2c2522]">{t.terms}</Link>
          <Link href="/login" className="hover:text-[#2c2522]">{t.start}</Link>
        </div>
      </footer>
    </div>
  );
}

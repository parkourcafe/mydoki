import Link from "next/link";
import { notFound } from "next/navigation";
import { getLocale, type Locale } from "@/lib/i18n";
import LangSwitcher from "@/components/LangSwitcher";
import { getGuide } from "@/lib/guides";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://www.doki.help";

const UI: Record<Locale, { start: string; home: string; seeAlso: string; privacy: string; terms: string; ctaSub: string }> = {
  ru: { start: "Начать бесплатно", home: "← На главную", seeAlso: "Смотрите также", privacy: "Конфиденциальность", terms: "Условия", ctaSub: "Меньше 15 минут — и порядок надолго." },
  en: { start: "Start for free", home: "← Home", seeAlso: "See also", privacy: "Privacy", terms: "Terms", ctaSub: "Less than 15 minutes — and order that lasts." },
  id: { start: "Mulai gratis", home: "← Beranda", seeAlso: "Lihat juga", privacy: "Privasi", terms: "Ketentuan", ctaSub: "Kurang dari 15 menit — dan tertata rapi untuk seterusnya." },
  uz: { start: "Bepul boshlash", home: "← Bosh sahifa", seeAlso: "Shuningdek", privacy: "Maxfiylik", terms: "Shartlar", ctaSub: "15 daqiqadan kam — va uzoq saqlanadigan tartib." },
};

export default async function GuidePage({ slug }: { slug: string }) {
  const g = getGuide(slug);
  if (!g) notFound();

  const locale = await getLocale();
  const c = g.locales[locale];
  const u = UI[locale];
  const base = `/${locale}/blog/${slug}`;

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "doki.help", item: `${APP_URL}/${locale}` },
      { "@type": "ListItem", position: 2, name: c.h1, item: `${APP_URL}${base}` },
    ],
  };
  const article = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: c.h1,
    description: c.metaDescription,
    inLanguage: locale,
    mainEntityOfPage: `${APP_URL}${base}`,
    publisher: { "@type": "Organization", name: "doki.help", url: APP_URL },
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
    <div lang={locale} className="min-h-screen bg-[#f9f5f0] text-[#2c2522]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(article) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      {/* NAV */}
      <nav className="sticky top-0 z-50 border-b border-[#e8e0d5] bg-[#fdfaf5]">
        <div className="mx-auto max-w-screen-xl px-5">
          <div className="flex h-16 items-center justify-between">
            <Link href={`/${locale}`} className="flex items-center gap-x-3">
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
            <div className="flex items-center gap-x-4">
              <LangSwitcher locale={locale} />
              <Link href="/login" className="accent-btn rounded-3xl px-6 py-2.5 text-sm font-semibold">
                {u.start}
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* ARTICLE */}
      <article className="mx-auto max-w-3xl px-5 py-12">
        <div className="mb-4 inline-flex items-center gap-x-2 rounded-full border border-[#e8e0d5] bg-white px-4 py-1.5 text-sm">
          <span>{g.emoji}</span>
          <span className="font-medium text-[#5c5248]">{c.navLabel}</span>
        </div>
        <h1 className="heading-font text-[2.2rem] leading-[1.1] tracking-[-1px] text-[#2c2522] lg:text-[2.7rem]">
          {c.h1}
        </h1>
        <p className="mt-5 text-[18px] leading-relaxed text-[#5c5248]">{c.intro}</p>
        <div className="mt-6">
          <Link href="/login" className="accent-btn inline-flex items-center justify-center rounded-3xl px-7 py-3 text-[16px] font-semibold active:scale-[0.985]">
            {c.ctaPrimary}
          </Link>
        </div>

        {c.sections.map((s) => (
          <section key={s.h2} className="mt-9">
            <h2 className="text-xl font-semibold text-[#2c2522]">{s.h2}</h2>
            {s.body && <p className="mt-3 text-[16px] leading-relaxed text-[#5c5248]">{s.body}</p>}
            {s.bullets && (
              <ul className="mt-3 space-y-2">
                {s.bullets.map((b) => (
                  <li key={b} className="flex items-start gap-x-3 text-[16px] leading-relaxed text-[#5c5248]">
                    <span className="mt-0.5 shrink-0 text-[#b85c38]">•</span>
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))}

        {/* FAQ */}
        <section className="mt-10">
          <h2 className="text-xl font-semibold text-[#2c2522]">{c.faqHeading}</h2>
          <div className="mt-4 grid gap-3">
            {c.faq.map((f) => (
              <div key={f.q} className="rounded-3xl border border-[#e8e0d5] bg-white p-5">
                <h3 className="font-semibold text-[#2c2522]">{f.q}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-[#5c5248]">{f.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <div className="warm-card mt-10 rounded-3xl border border-[#e8e0d5] p-8 text-center">
          <p className="mb-5 text-[#5c5248]">{u.ctaSub}</p>
          <Link href="/login" className="accent-btn inline-flex items-center justify-center rounded-3xl px-8 py-[15px] text-[17px] font-semibold active:scale-[0.985]">
            {c.ctaPrimary}
          </Link>
        </div>

        {/* SEE ALSO + FOOTER */}
        <div className="mt-10 border-t border-[#e8e0d5] pt-6 text-sm text-[#8a7c6d]">
          <div className="mb-4">
            <span className="mr-3 font-medium text-[#5c5248]">{u.seeAlso}:</span>
            {g.related[locale].map((r, i) => (
              <span key={r.href}>
                {i > 0 && <span className="mx-2 text-[#d4c9b8]">·</span>}
                <Link href={`/${locale}${r.href}`} className="underline hover:text-[#2c2522]">
                  {r.label}
                </Link>
              </span>
            ))}
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            <Link href={`/${locale}`} className="hover:text-[#2c2522]">{u.home}</Link>
            <Link href={`/${locale}/privacy`} className="hover:text-[#2c2522]">{u.privacy}</Link>
            <Link href={`/${locale}/terms`} className="hover:text-[#2c2522]">{u.terms}</Link>
          </div>
        </div>
      </article>
    </div>
  );
}

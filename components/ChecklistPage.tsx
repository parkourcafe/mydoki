import Link from "next/link";
import { notFound } from "next/navigation";
import { getLocale, type Locale } from "@/lib/i18n";
import LangSwitcher from "@/components/LangSwitcher";
import { getChecklist } from "@/lib/checklists";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://doki.help";

const UI: Record<Locale, { start: string; home: string; seeAlso: string; privacy: string; terms: string; ctaSub: string }> = {
  ru: { start: "Начать бесплатно", home: "← На главную", seeAlso: "Смотрите также", privacy: "Конфиденциальность", terms: "Условия", ctaSub: "Сохраните эти документы и поставьте напоминания." },
  en: { start: "Start for free", home: "← Home", seeAlso: "See also", privacy: "Privacy", terms: "Terms", ctaSub: "Save these documents and set reminders." },
  id: { start: "Mulai gratis", home: "← Beranda", seeAlso: "Lihat juga", privacy: "Privasi", terms: "Ketentuan", ctaSub: "Simpan dokumen ini dan pasang pengingat." },
  uz: { start: "Bepul boshlash", home: "← Bosh sahifa", seeAlso: "Shuningdek", privacy: "Maxfiylik", terms: "Shartlar", ctaSub: "Bu hujjatlarni saqlang va eslatmalar qoʻying." },
};

export default async function ChecklistPage({ slug }: { slug: string }) {
  const c = getChecklist(slug);
  if (!c) notFound();

  const locale = await getLocale();
  const t = c.locales[locale];
  const u = UI[locale];
  const base = `/${locale}/checklists/${slug}`;

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "doki.help", item: `${APP_URL}/${locale}` },
      { "@type": "ListItem", position: 2, name: t.h1, item: `${APP_URL}${base}` },
    ],
  };
  const article = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: t.h1,
    description: t.metaDescription,
    inLanguage: locale,
    mainEntityOfPage: `${APP_URL}${base}`,
    publisher: { "@type": "Organization", name: "doki.help", url: APP_URL },
  };
  const itemList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: t.h1,
    itemListElement: t.groups
      .flatMap((g) => g.items)
      .map((item, i) => ({ "@type": "ListItem", position: i + 1, name: item })),
  };
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: t.faq.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <div lang={locale} className="min-h-screen bg-[#f9f5f0] text-[#2c2522]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(article) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemList) }} />
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

      {/* HERO */}
      <section className="mx-auto max-w-screen-xl px-5 pb-8 pt-12">
        <div className="mb-5 inline-flex items-center gap-x-2 rounded-full border border-[#e8e0d5] bg-white px-4 py-1.5 text-sm">
          <span>{c.emoji}</span>
          <span className="font-medium text-[#5c5248]">{t.navLabel}</span>
        </div>
        <h1 className="heading-font max-w-3xl text-[2.4rem] leading-[1.08] tracking-[-1.2px] text-[#2c2522] lg:text-[3.1rem]">
          {t.h1}
        </h1>
        <p className="mt-5 max-w-2xl text-[19px] leading-snug text-[#5c5248]">{t.intro}</p>
        <div className="mt-7">
          <Link href="/login" className="accent-btn inline-flex items-center justify-center rounded-3xl px-8 py-[15px] text-[17px] font-semibold active:scale-[0.985]">
            {t.ctaPrimary}
          </Link>
        </div>
      </section>

      {/* CHECKLIST GROUPS */}
      {t.groups.map((g) => (
        <section key={g.h2} className="mx-auto max-w-screen-xl px-5 py-5">
          <h2 className="section-header mb-4">{g.h2}</h2>
          <ul className="grid gap-2.5 md:grid-cols-2">
            {g.items.map((item) => (
              <li key={item} className="flex items-start gap-x-3 rounded-2xl border border-[#e8e0d5] bg-white p-4 text-[#5c5248]">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="mt-0.5 shrink-0" aria-hidden="true">
                  <path d="M20 6 9 17l-5-5" stroke="#b85c38" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>
      ))}

      {/* FAQ */}
      <section className="mx-auto max-w-screen-xl px-5 py-6">
        <h2 className="section-header mb-5">{t.faqHeading}</h2>
        <div className="grid gap-3">
          {t.faq.map((f) => (
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
          <p className="mb-5 text-[#5c5248]">{u.ctaSub}</p>
          <Link href="/login" className="accent-btn inline-flex items-center justify-center rounded-3xl px-8 py-[15px] text-[17px] font-semibold active:scale-[0.985]">
            {t.ctaPrimary}
          </Link>
        </div>
      </section>

      {/* SEE ALSO + FOOTER */}
      <footer className="mx-auto max-w-screen-xl px-5 py-10 text-sm text-[#8a7c6d]">
        <div className="mb-4">
          <span className="mr-3 font-medium text-[#5c5248]">{u.seeAlso}:</span>
          {c.related[locale].map((r, i) => (
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
          <Link href="/login" className="hover:text-[#2c2522]">{u.start}</Link>
        </div>
      </footer>
    </div>
  );
}

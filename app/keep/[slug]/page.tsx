import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import LangSwitcher from "@/components/LangSwitcher";
import { getUsecase } from "@/lib/usecases";
import { comparisonLinks } from "@/lib/comparisons";
import { segmentLinks } from "@/lib/segments";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://doki.help";

// Контент use-case страниц — только на русском (российские документы),
// поэтому интерфейс тоже фиксированно русский.
const T = {
  start: "Начать бесплатно",
  back: "← На главную",
  docs: "Что сюда сложить",
  pains: "Знакомо?",
  solutions: "Как помогает doki.help",
  faq: "Частые вопросы",
  seeAlso: "Смотрите также",
  ctaHeading: "Соберите эти документы в одном месте",
  ctaSub: "Меньше 15 минут — и порядок надолго.",
  privacy: "Конфиденциальность",
  terms: "Условия",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const u = getUsecase(slug);
  if (!u) return {};
  return {
    title: u.title,
    description: u.subtitle,
    openGraph: { title: u.title, description: u.subtitle, url: `${APP_URL}/keep/${slug}` },
  };
}

function Check() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="mt-0.5 shrink-0" aria-hidden="true">
      <path d="M20 6 9 17l-5-5" stroke="#b85c38" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default async function UsecasePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const u = getUsecase(slug);
  if (!u) notFound();

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "doki.help", item: APP_URL },
      { "@type": "ListItem", position: 2, name: u.title, item: `${APP_URL}/keep/${slug}` },
    ],
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: u.faq.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <div lang="ru" className="min-h-screen bg-[#f9f5f0] text-[#2c2522]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

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
            <div className="flex items-center gap-x-4">
              <LangSwitcher locale="ru" />
              <Link href="/login" className="accent-btn rounded-3xl px-6 py-2.5 text-sm font-semibold">
                {T.start}
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="mx-auto max-w-screen-xl px-5 pb-8 pt-12">
        <div className="mb-5 inline-flex items-center gap-x-2 rounded-full border border-[#e8e0d5] bg-white px-4 py-1.5 text-sm">
          <span>{u.emoji}</span>
          <span className="font-medium text-[#5c5248]">{u.navLabel}</span>
        </div>
        <h1 className="heading-font max-w-3xl text-[2.4rem] leading-[1.08] tracking-[-1.2px] text-[#2c2522] lg:text-[3.1rem]">
          {u.title}
        </h1>
        <p className="mt-5 max-w-2xl text-[19px] leading-snug text-[#5c5248]">{u.subtitle}</p>
        <p className="mt-4 max-w-2xl text-[16px] leading-relaxed text-[#6b6055]">{u.intro}</p>
        <div className="mt-7">
          <Link
            href="/login"
            className="accent-btn inline-flex items-center justify-center rounded-3xl px-8 py-[15px] text-[17px] font-semibold active:scale-[0.985]"
          >
            {T.start}
          </Link>
        </div>
      </section>

      {/* DOCS */}
      <section className="mx-auto max-w-screen-xl px-5 py-6">
        <h2 className="section-header mb-5">{T.docs}</h2>
        <div className="flex flex-wrap gap-2.5">
          {u.docs.map((d) => (
            <span key={d} className="rounded-2xl border border-[#e8e0d5] bg-white px-4 py-2 text-[15px] text-[#5c5248]">
              {d}
            </span>
          ))}
        </div>
      </section>

      {/* PAINS */}
      <section className="mx-auto max-w-screen-xl px-5 py-6">
        <h2 className="section-header mb-5">{T.pains}</h2>
        <ul className="grid gap-3 md:grid-cols-2">
          {u.pains.map((p) => (
            <li key={p} className="flex items-start gap-x-3 rounded-2xl border border-[#e8e0d5] bg-white p-4 text-[#5c5248]">
              <span className="mt-0.5 shrink-0 text-[#b85c38]">•</span>
              <span>{p}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* SOLUTIONS */}
      <section className="mx-auto max-w-screen-xl px-5 py-8">
        <h2 className="section-header mb-5">{T.solutions}</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {u.solutions.map((s) => (
            <div key={s} className="warm-card flex items-start gap-x-3 rounded-3xl border border-[#e8e0d5] p-6">
              <Check />
              <p className="text-[#5c5248]">{s}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-screen-xl px-5 py-8">
        <h2 className="section-header mb-5">{T.faq}</h2>
        <div className="grid gap-3">
          {u.faq.map((f) => (
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

      {/* SEE ALSO — internal links to comparisons and segments */}
      <section className="mx-auto max-w-screen-xl px-5 py-6">
        <h2 className="section-header mb-4">{T.seeAlso}</h2>
        <div className="flex flex-wrap gap-2.5">
          {comparisonLinks("ru").map((cmp) => (
            <Link
              key={cmp.key}
              href={`/vs/${cmp.key}`}
              className="inline-flex items-center gap-1.5 rounded-2xl border border-[#e8e0d5] bg-white px-3.5 py-1.5 text-sm text-[#5c5248] transition-colors hover:border-[#d4a373]"
            >
              <span>{cmp.emoji}</span> {cmp.label}
            </Link>
          ))}
          {segmentLinks("ru").map((s) => (
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
          <h2 className="mb-3 text-3xl font-semibold tracking-tight">{T.ctaHeading}</h2>
          <p className="mx-auto mb-7 max-w-sm text-[#d4c9b8]">{T.ctaSub}</p>
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-3xl bg-[#b85c38] px-10 py-4 text-lg font-semibold transition-all hover:bg-[#9f4a2e] active:scale-[0.985]"
          >
            {T.start}
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-[#e8e0d5] bg-[#fdfaf5] px-5 py-8 text-sm text-[#8a7c6d]">
        <div className="mx-auto flex max-w-screen-xl flex-col items-center justify-between gap-y-3 text-center md:flex-row md:text-left">
          <Link href="/" className="hover:text-[#2c2522]">{T.back}</Link>
          <div className="flex gap-x-6">
            <Link href="/privacy" className="hover:text-[#2c2522]">{T.privacy}</Link>
            <Link href="/terms" className="hover:text-[#2c2522]">{T.terms}</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

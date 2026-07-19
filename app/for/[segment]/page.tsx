import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getLocale, type Locale } from "@/lib/i18n";
import LangSwitcher from "@/components/LangSwitcher";
import { getSegment } from "@/lib/segments";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://doki.help";

const UI = {
  ru: {
    start: "Начать бесплатно",
    startShort: "Начать",
    back: "← На главную",
    pains: "Знакомо?",
    solutions: "Как помогает doki.help",
    docs: "Что здесь хранят",
    ctaHeading: "Соберите эти документы в одном месте",
    ctaSub: "Меньше 15 минут — и порядок надолго.",
    privacy: "Конфиденциальность",
    terms: "Условия",
  },
  en: {
    start: "Start for free",
    startShort: "Start",
    back: "← Home",
    pains: "Sound familiar?",
    solutions: "How doki.help helps",
    docs: "What people keep here",
    ctaHeading: "Gather these documents in one place",
    ctaSub: "Less than 15 minutes — and order that lasts.",
    privacy: "Privacy",
    terms: "Terms",
  },
  id: {
    start: "Mulai gratis",
    startShort: "Mulai",
    back: "← Beranda",
    pains: "Terdengar familier?",
    solutions: "Bagaimana doki.help membantu",
    docs: "Apa yang disimpan di sini",
    ctaHeading: "Kumpulkan dokumen ini di satu tempat",
    ctaSub: "Kurang dari 15 menit — dan tertata rapi untuk seterusnya.",
    privacy: "Privasi",
    terms: "Ketentuan",
  },
  uz: {
    start: "Bepul boshlash",
    startShort: "Boshlash",
    back: "← Bosh sahifa",
    pains: "Tanishmi?",
    solutions: "doki.help qanday yordam beradi",
    docs: "Bu yerda nima saqlanadi",
    ctaHeading: "Bu hujjatlarni bitta joyga yigʻing",
    ctaSub: "15 daqiqadan kam — va uzoq saqlanadigan tartib.",
    privacy: "Maxfiylik",
    terms: "Shartlar",
  },
} as const;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ segment: string }>;
}): Promise<Metadata> {
  const { segment } = await params;
  const seg = getSegment(segment);
  if (!seg) return {};
  const c = seg.locales[await getLocale()];
  return {
    title: c.title,
    description: c.subtitle,
    openGraph: {
      title: c.title,
      description: c.subtitle,
      url: `${APP_URL}/for/${segment}`,
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

export default async function SegmentPage({
  params,
}: {
  params: Promise<{ segment: string }>;
}) {
  const { segment } = await params;
  const seg = getSegment(segment);
  if (!seg) notFound();

  const locale = await getLocale();
  const c = seg.locales[locale];
  const t = UI[locale];
  const ctaHref = seg.ctaHref ?? "/login";
  const ctaLabel = c.ctaLabel ?? t.start;

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "doki.help", item: APP_URL },
      { "@type": "ListItem", position: 2, name: c.title, item: `${APP_URL}/for/${segment}` },
    ],
  };

  return (
    <div lang={locale} className="min-h-screen bg-[#f9f5f0] text-[#2c2522]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
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
      <section className="mx-auto max-w-screen-xl px-5 pb-10 pt-12">
        <div className="mb-5 inline-flex items-center gap-x-2 rounded-full border border-[#e8e0d5] bg-white px-4 py-1.5 text-sm">
          <span>{seg.emoji}</span>
          <span className="font-medium text-[#5c5248]">{c.navLabel}</span>
        </div>
        <h1 className="heading-font max-w-3xl text-[2.4rem] leading-[1.08] tracking-[-1.2px] text-[#2c2522] lg:text-[3.1rem]">
          {c.title}
        </h1>
        <p className="mt-5 max-w-2xl text-[19px] leading-snug text-[#5c5248]">{c.subtitle}</p>
        <div className="mt-7">
          <Link
            href={ctaHref}
            className="accent-btn inline-flex items-center justify-center rounded-3xl px-8 py-[15px] text-[17px] font-semibold active:scale-[0.985]"
          >
            {ctaLabel}
          </Link>
        </div>
      </section>

      {/* PAINS */}
      <section className="mx-auto max-w-screen-xl px-5 py-6">
        <h2 className="section-header mb-5">{t.pains}</h2>
        <ul className="grid gap-3 md:grid-cols-2">
          {c.pains.map((p) => (
            <li key={p} className="flex items-start gap-x-3 rounded-2xl border border-[#e8e0d5] bg-white p-4 text-[#5c5248]">
              <span className="mt-0.5 shrink-0 text-[#b85c38]">•</span>
              <span>{p}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* SOLUTIONS */}
      <section className="mx-auto max-w-screen-xl px-5 py-10">
        <h2 className="section-header mb-5">{t.solutions}</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {c.solutions.map((s) => (
            <div key={s} className="warm-card flex items-start gap-x-3 rounded-3xl border border-[#e8e0d5] p-6">
              <Check />
              <p className="text-[#5c5248]">{s}</p>
            </div>
          ))}
        </div>
      </section>

      {/* DOCS */}
      <section className="mx-auto max-w-screen-xl px-5 py-6">
        <h2 className="section-header mb-5">{t.docs}</h2>
        <div className="flex flex-wrap gap-2.5">
          {c.docs.map((d) => (
            <span key={d} className="rounded-2xl border border-[#e8e0d5] bg-white px-4 py-2 text-[15px] text-[#5c5248]">
              {d}
            </span>
          ))}
        </div>
      </section>

      {/* CASE STUDY — иллюстративный сценарий (не реальный отзыв клиента) */}
      {c.caseStudy && (
        <section className="mx-auto max-w-screen-xl px-5 py-6">
          <div className="mx-auto max-w-2xl rounded-3xl border border-[#e8e0d5] bg-[#fdfaf5] p-7">
            <p className="text-[17px] italic leading-relaxed text-[#3d3530]">
              “{c.caseStudy.quote}”
            </p>
            <p className="mt-3 text-sm font-medium text-[#8a7c6d]">{c.caseStudy.role}</p>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="mx-auto max-w-screen-xl px-5 py-12">
        <div className="rounded-3xl bg-[#2c2522] px-8 py-10 text-center text-[#f9f5f0]">
          <h2 className="mb-3 text-3xl font-semibold tracking-tight">{t.ctaHeading}</h2>
          <p className="mx-auto mb-7 max-w-sm text-[#d4c9b8]">{t.ctaSub}</p>
          <Link
            href={ctaHref}
            className="inline-flex items-center justify-center rounded-3xl bg-[#b85c38] px-10 py-4 text-lg font-semibold transition-all hover:bg-[#9f4a2e] active:scale-[0.985]"
          >
            {ctaLabel}
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-[#e8e0d5] bg-[#fdfaf5] px-5 py-8 text-sm text-[#8a7c6d]">
        <div className="mx-auto flex max-w-screen-xl flex-col items-center justify-between gap-y-3 text-center md:flex-row md:text-left">
          <Link href="/" className="hover:text-[#2c2522]">{t.back}</Link>
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-1">
            {segment === "employers" && (
              <>
                <Link href="/faq#hr" className="hover:text-[#2c2522]">FAQ</Link>
                <Link href="/dpa" className="hover:text-[#2c2522]">DPA</Link>
              </>
            )}
            <Link href="/privacy" className="hover:text-[#2c2522]">{t.privacy}</Link>
            <Link href="/terms" className="hover:text-[#2c2522]">{t.terms}</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

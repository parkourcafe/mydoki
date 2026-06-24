import Link from "next/link";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/queries";
import { getLocale, type Locale } from "@/lib/i18n";
import LangSwitcher from "@/components/LangSwitcher";

type Cat = { icon: string; title: string; items: string[] };
type Step = { n: string; title: string; text: string };
type Sec = { icon: string; title: string; text: string };

type Dict = {
  nav: { login: string; start: string };
  hero: {
    badge: string;
    title: string[];
    subtitle: string;
    cta1: string;
    cta2: string;
    trust: string[];
    imgAlt: string;
  };
  store: {
    heading: string;
    sub: string;
    medTitle: string;
    medBadge: string;
    medCol1: string[];
    medCol2: string[];
    medNote: string;
    cats: Cat[];
  };
  how: { heading: string; sub: string; steps: Step[] };
  security: { heading: string; sub: string; items: Sec[] };
  cta: { heading: string; sub: string; button: string };
  footer: { copyright: string; security: string; privacy: string; login: string };
};

const M: Record<Locale, Dict> = {
  ru: {
    nav: { login: "Войти", start: "Начать бесплатно" },
    hero: {
      badge: "Личный сейф для документов всей семьи",
      title: ["Все важные документы", "вашей семьи —", "всегда под рукой"],
      subtitle:
        "Паспорта, анализы, визы, дипломы, справки и путёвки. Доступ с любого устройства. Напоминания работают сами.",
      cta1: "Начать бесплатно",
      cta2: "Как это работает",
      trust: ["С любого устройства", "Бесплатно", "Вход через Google"],
      imgAlt: "Документы семьи — под рукой и в порядке",
    },
    store: {
      heading: "Что можно хранить в архиве",
      sub: "Всё самое важное для семьи — в одном защищённом месте.",
      medTitle: "Анализы и медицинские исследования",
      medBadge: "Распознавание дат — бесплатно",
      medCol1: ["Результаты лабораторных анализов", "Биохимия, ОАК, гормоны, ОАМ", "УЗИ, МРТ, КТ, рентген"],
      medCol2: ["Заключения врачей", "Прививочные сертификаты", "Медицинские справки"],
      medNote: "Распознавание дат и умные напоминания — бесплатно.",
      cats: [
        { icon: "📄", title: "Личные и миграционные документы", items: ["Паспорта и загранпаспорта", "Визы и визовые документы", "Документы на гражданство", "СНИЛС, ИНН, военный билет", "Дипломы, аттестаты, сертификаты"] },
        { icon: "✈️", title: "Поездки и путешествия", items: ["Путёвки и ваучеры", "Билеты и бронирования", "Страховки для поездок", "Документы для въезда/выезда", "Согласия на выезд ребёнка"] },
        { icon: "🚗", title: "Авто и недвижимость", items: ["ОСАГО и КАСКО", "ПТС и СТС", "Выписки ЕГРН и договоры"] },
        { icon: "🧾", title: "Квитанции и справки", items: ["Квитанции и чеки об оплате", "Справки с работы / учёбы", "Доверенности"] },
      ],
    },
    how: {
      heading: "Как это работает",
      sub: "Загрузи документ — остальное система сделает сама",
      steps: [
        { n: "1", title: "Загрузи фото или скан", text: "Паспорт, виза, анализ, путёвка — любой документ." },
        { n: "2", title: "ИИ распознаёт дату сам", text: "Система сама находит дату истечения и предлагает её сохранить — бесплатно." },
        { n: "3", title: "Получай напоминания", text: "Система заранее предупредит об истечении визы, анализа или ОСАГО." },
        { n: "4", title: "Управляй доступом", text: "Отправляй временные ссылки врачам, в банк или родственникам." },
      ],
    },
    security: {
      heading: "Ваши документы в безопасности",
      sub: "Мы понимаем, насколько важны эти документы — и сделали всё, чтобы вы были спокойны.",
      items: [
        { icon: "👨‍👩‍👧", title: "Только ваша семья видит документы", text: "Доступ изолирован на уровне базы (RLS). Никто посторонний, включая нас, не открывает ваши файлы." },
        { icon: "🛡️", title: "Шифрование и контроль входов", text: "Файлы в приватном хранилище, двухфакторный вход и уведомления о входе с нового устройства." },
        { icon: "🎚️", title: "Вы управляете доступом", text: "Делитесь документом по временной ссылке и отзываете её в любой момент." },
        { icon: "🙅", title: "Не продаём ваши данные", text: "Мы не передаём и не продаём ваши данные третьим лицам." },
      ],
    },
    cta: {
      heading: "Готовы собрать все документы семьи?",
      sub: "Меньше 15 минут — и порядок надолго.",
      button: "Начать пользоваться бесплатно",
    },
    footer: { copyright: "© 2026 doki.help — Семейный архив документов", security: "Безопасность", privacy: "Конфиденциальность", login: "Войти" },
  },
  en: {
    nav: { login: "Sign in", start: "Get started free" },
    hero: {
      badge: "A private vault for your whole family's documents",
      title: ["All your family's", "important documents —", "always at hand"],
      subtitle:
        "Passports, medical results, visas, diplomas, certificates and travel docs. Access from any device. Reminders run on their own.",
      cta1: "Get started free",
      cta2: "How it works",
      trust: ["Any device", "Free", "Sign in with Google"],
      imgAlt: "A family's documents — organized and at hand",
    },
    store: {
      heading: "What you can keep in your vault",
      sub: "Everything important for your family — in one secure place.",
      medTitle: "Medical results and tests",
      medBadge: "Date recognition — free",
      medCol1: ["Lab test results", "Blood panels, CBC, hormones, urinalysis", "Ultrasound, MRI, CT, X-ray"],
      medCol2: ["Doctor's reports", "Vaccination certificates", "Medical certificates"],
      medNote: "Date recognition and smart reminders — free.",
      cats: [
        { icon: "📄", title: "Personal & immigration documents", items: ["Passports & international passports", "Visas and visa paperwork", "Citizenship documents", "Tax & social security IDs", "Diplomas and certificates"] },
        { icon: "✈️", title: "Trips & travel", items: ["Tour packages & vouchers", "Tickets and bookings", "Travel insurance", "Entry/exit documents", "Child travel consents"] },
        { icon: "🚗", title: "Vehicles & property", items: ["Car insurance", "Vehicle titles & registration", "Property records & contracts"] },
        { icon: "🧾", title: "Receipts & certificates", items: ["Payment receipts", "Work / study certificates", "Powers of attorney"] },
      ],
    },
    how: {
      heading: "How it works",
      sub: "Upload a document — the app does the rest",
      steps: [
        { n: "1", title: "Upload a photo or scan", text: "Passport, visa, medical result, travel doc — any document." },
        { n: "2", title: "AI reads the date for you", text: "It finds the expiry date and offers to save it — for free." },
        { n: "3", title: "Get reminders", text: "You'll be warned before a visa, test or insurance expires." },
        { n: "4", title: "Control access", text: "Send expiring links to doctors, banks or relatives." },
      ],
    },
    security: {
      heading: "Your documents are safe",
      sub: "We know how important these documents are — and built everything so you can feel at ease.",
      items: [
        { icon: "👨‍👩‍👧", title: "Only your family sees the documents", text: "Access is isolated at the database level (RLS). No outsider, including us, can open your files." },
        { icon: "🛡️", title: "Encryption and login alerts", text: "Files in private storage, two-factor sign-in and alerts on new-device logins." },
        { icon: "🎚️", title: "You control access", text: "Share a document via an expiring link and revoke it anytime." },
        { icon: "🙅", title: "We don't sell your data", text: "We never share or sell your data to third parties." },
      ],
    },
    cta: {
      heading: "Ready to gather all your family's documents?",
      sub: "Less than 15 minutes — and order that lasts.",
      button: "Start for free",
    },
    footer: { copyright: "© 2026 doki.help — Family document vault", security: "Security", privacy: "Privacy", login: "Sign in" },
  },
};

function Check() {
  return <span className="font-semibold text-[#b85c38]">✓</span>;
}

export default async function Home() {
  if (await getUser()) redirect("/my");
  const locale = await getLocale();
  const t = M[locale];

  return (
    <div lang={locale} className="min-h-screen bg-[#f9f5f0] text-[#2c2522]">
      {/* NAV */}
      <nav className="sticky top-0 z-50 border-b border-[#e8e0d5] bg-[#fdfaf5]">
        <div className="mx-auto max-w-screen-xl px-5">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-x-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[#b85c38] text-white">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M10 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z" />
                </svg>
              </div>
              <div>
                <span className="text-2xl font-semibold tracking-tighter">doki</span>
                <span className="text-2xl font-semibold tracking-tighter text-[#c17a5e]">.help</span>
              </div>
            </div>
            <div className="flex items-center gap-x-4">
              <LangSwitcher locale={locale} />
              <Link href="/login" className="hidden rounded-3xl border border-[#d4c9b8] px-5 py-2.5 text-sm font-medium transition-colors hover:bg-white md:block">
                {t.nav.login}
              </Link>
              <Link href="/login" className="accent-btn rounded-3xl px-6 py-2.5 text-sm font-semibold">
                {t.nav.start}
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="mx-auto max-w-screen-xl px-5 pb-8 pt-10">
        <div className="grid items-center gap-x-8 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <div className="mb-6 inline-flex items-center gap-x-2 rounded-full border border-[#e8e0d5] bg-white px-4 py-1.5 text-sm">
              <span className="h-2 w-2 rounded-full bg-[#b85c38]" />
              <span className="font-medium text-[#5c5248]">{t.hero.badge}</span>
            </div>

            <h1 className="heading-font mb-5 text-[2.65rem] leading-[1.05] tracking-[-1.4px] text-[#2c2522] lg:text-[3.5rem]">
              {t.hero.title.map((line, i) => (
                <span key={i}>
                  {line}
                  {i < t.hero.title.length - 1 && <br />}
                </span>
              ))}
            </h1>

            <p className="mb-8 max-w-md text-[19px] leading-snug text-[#5c5248]">{t.hero.subtitle}</p>

            <div className="mb-8 flex max-w-lg flex-col gap-3 sm:flex-row">
              <Link href="/login" className="accent-btn flex flex-1 items-center justify-center rounded-3xl px-8 py-[17px] text-[17px] font-semibold active:scale-[0.985]">
                {t.hero.cta1}
              </Link>
              <a href="#how" className="flex flex-1 items-center justify-center rounded-3xl border border-[#d4c9b8] px-8 py-[17px] text-[17px] font-semibold transition-colors hover:bg-white">
                {t.hero.cta2}
              </a>
            </div>

            <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-[#5c5248]">
              {t.hero.trust.map((tr) => (
                <span key={tr} className="flex items-center gap-x-2"><Check /> {tr}</span>
              ))}
            </div>
          </div>

          <div className="mt-8 lg:col-span-5 lg:mt-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://d8j0ntlcm91z4.cloudfront.net/user_3EKntK4EDjG8nay4H1dy1TK30mB/hf_20260624_011709_6438e496-ffee-421a-a01a-41cca1abd28f_min.webp"
              alt={t.hero.imgAlt}
              width={928}
              height={1152}
              loading="eager"
              className="h-auto w-full rounded-3xl border border-[#e8e0d5] object-cover shadow-2xl"
            />
          </div>
        </div>
      </section>

      {/* WHAT TO STORE */}
      <section id="what-to-store" className="mx-auto max-w-screen-xl px-5 py-12">
        <div className="mb-8">
          <h2 className="section-header mb-2">{t.store.heading}</h2>
          <p className="text-xl text-[#5c5248]">{t.store.sub}</p>
        </div>

        <div className="grid gap-4">
          <div className="warm-card rounded-3xl border border-[#e8e0d5] p-7">
            <div className="flex items-start gap-x-5">
              <div className="mt-1 text-5xl">🩺</div>
              <div className="flex-1">
                <div className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-1">
                  <div className="text-2xl font-semibold">{t.store.medTitle}</div>
                  <span className="rounded-full bg-gradient-to-r from-[#b85c38] to-[#d4a373] px-3 py-0.5 text-xs font-semibold text-white">
                    {t.store.medBadge}
                  </span>
                </div>
                <div className="grid grid-cols-1 gap-x-8 text-[#5c5248] md:grid-cols-2">
                  <ul className="space-y-1.5 text-[15px]">
                    {t.store.medCol1.map((it) => <li key={it}>• {it}</li>)}
                  </ul>
                  <ul className="mt-3 space-y-1.5 text-[15px] md:mt-0">
                    {t.store.medCol2.map((it) => <li key={it}>• {it}</li>)}
                  </ul>
                </div>
                <div className="mt-4 text-sm font-medium text-[#b85c38]">{t.store.medNote}</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {t.store.cats.map((c) => (
              <div key={c.title} className="warm-card rounded-3xl border border-[#e8e0d5] p-6">
                <div className="mb-3 flex items-center gap-x-2 text-xl font-semibold">
                  <span>{c.icon}</span>
                  <span>{c.title}</span>
                </div>
                <ul className="space-y-1.5 text-[15px] text-[#5c5248]">
                  {c.items.map((it) => <li key={it}>{it}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="mx-auto max-w-screen-xl rounded-3xl border border-[#e8e0d5] bg-[#fdfaf5] px-5 py-12">
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <h2 className="section-header mb-3">{t.how.heading}</h2>
          <p className="text-xl text-[#5c5248]">{t.how.sub}</p>
        </div>
        <div className="mx-auto grid max-w-3xl gap-x-8 gap-y-8 md:grid-cols-2">
          {t.how.steps.map((s) => (
            <div key={s.n} className="flex gap-5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-[#e8e0d5] bg-white text-2xl font-semibold text-[#b85c38]">
                {s.n}
              </div>
              <div>
                <div className="mb-1.5 text-xl font-semibold">{s.title}</div>
                <p className="text-[#5c5248]">{s.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SECURITY */}
      <section id="security" className="mx-auto max-w-screen-xl px-5 py-14">
        <div className="mx-auto mb-10 max-w-3xl text-center">
          <h2 className="section-header mb-3">{t.security.heading}</h2>
          <p className="text-xl text-[#5c5248]">{t.security.sub}</p>
        </div>
        <div className="mx-auto grid max-w-4xl gap-5 md:grid-cols-2">
          {t.security.items.map((s) => (
            <div key={s.title} className="warm-card rounded-3xl border border-[#e8e0d5] p-7">
              <div className="flex gap-x-4">
                <div className="text-3xl">{s.icon}</div>
                <div>
                  <div className="mb-2 text-xl font-semibold">{s.title}</div>
                  <p className="text-[#5c5248]">{s.text}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="mx-auto max-w-screen-xl px-5 py-10">
        <div className="rounded-3xl bg-[#2c2522] px-8 py-10 text-center text-[#f9f5f0]">
          <h2 className="mb-4 text-3xl font-semibold tracking-tight">{t.cta.heading}</h2>
          <p className="mx-auto mb-7 max-w-sm text-[#d4c9b8]">{t.cta.sub}</p>
          <Link href="/login" className="inline-flex items-center justify-center rounded-3xl bg-[#b85c38] px-10 py-4 text-lg font-semibold transition-all hover:bg-[#9f4a2e] active:scale-[0.985]">
            {t.cta.button}
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-[#e8e0d5] bg-[#fdfaf5] px-5 py-8 text-sm text-[#8a7c6d]">
        <div className="mx-auto flex max-w-screen-xl flex-col items-center justify-between gap-y-3 text-center md:flex-row md:text-left">
          <div>{t.footer.copyright}</div>
          <div className="flex gap-x-6">
            <a href="#security" className="hover:text-[#2c2522]">{t.footer.security}</a>
            <Link href="/privacy" className="hover:text-[#2c2522]">{t.footer.privacy}</Link>
            <Link href="/login" className="hover:text-[#2c2522]">{t.footer.login}</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

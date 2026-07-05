import type { Metadata } from "next";
import Link from "next/link";
import { categories, relationLabel, type DocCategory } from "@/lib/categories";
import { getLocale, type Locale } from "@/lib/i18n";

// Превью продукта без регистрации. Все данные — выдуманные, реальная БД не
// используется. Категории и связи берём из тех же справочников, что и
// настоящий кабинет, чтобы пример выглядел как сам продукт.

const COUNTS: Record<DocCategory, number> = {
  identity: 4,
  education: 2,
  career: 1,
  medical: 5,
  financial: 3,
  tax: 2,
  legal: 1,
  other: 0,
};

const M = {
  ru: {
    metaTitle: "Демо — как выглядит семейный сейф doki",
    metaDesc:
      "Посмотрите продукт без регистрации: документы по членам семьи и категориям, напоминания о сроках и временные ссылки.",
    back: "← На главную",
    badge: "Демо",
    title: "Загляните внутрь — без регистрации",
    sub: "Это пример с выдуманными данными. В реальном сейфе документы видите только вы и те, кому вы открыли доступ.",
    familyTitle: "Семья",
    members: [
      { name: "Анна", rel: "self", docs: 7 },
      { name: "Пётр", rel: "spouse", docs: 5 },
      { name: "Лиза", rel: "child", docs: 4 },
    ],
    docsTitle: "Документы по разделам",
    docsSub: "Всё разложено по категориям — видно, где сколько.",
    docCardOwner: "Анна",
    docCardTitle: "Загранпаспорт",
    docCardType: "Удостоверения",
    valid: "Действует до 14 марта 2027",
    reminder: "⏰ Напомним за 30 дней",
    shareTitle: "Поделиться",
    shareRow: "Активна · до 12.07 · 0/3 просмотра",
    shareNote: "Врач или банк откроет только этот документ по временной ссылке — а не весь архив. Ссылку можно отозвать в любой момент.",
    deadlinesTitle: "Ближайшие сроки",
    deadlines: [
      { t: "Виза — Пётр", d: "через 12 дней" },
      { t: "ОСАГО", d: "через 26 дней" },
      { t: "Загранпаспорт — Анна", d: "через 30 дней" },
    ],
    cta: "Создать свой сейф бесплатно",
    ctaSub: "2 ГБ бесплатно · вход через Google или email",
    docsWord: (n: number) =>
      n === 0
        ? "пусто"
        : `${n} ${n % 10 === 1 && n % 100 !== 11 ? "документ" : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? "документа" : "документов"}`,
  },
  en: {
    metaTitle: "Demo — what the doki family vault looks like",
    metaDesc:
      "See the product without signing up: documents by family member and category, deadline reminders and expiring share links.",
    back: "← Home",
    badge: "Demo",
    title: "Take a look inside — no sign-up",
    sub: "This is a sample with made-up data. In a real vault, only you and the people you grant access see the documents.",
    familyTitle: "Family",
    members: [
      { name: "Anna", rel: "self", docs: 7 },
      { name: "Peter", rel: "spouse", docs: 5 },
      { name: "Lisa", rel: "child", docs: 4 },
    ],
    docsTitle: "Documents by section",
    docsSub: "Everything sorted by category — see what's where.",
    docCardOwner: "Anna",
    docCardTitle: "Passport",
    docCardType: "ID documents",
    valid: "Valid until 14 March 2027",
    reminder: "⏰ We'll remind you 30 days ahead",
    shareTitle: "Share",
    shareRow: "Active · until Jul 12 · 0/3 views",
    shareNote: "A doctor or bank opens only this one document via a temporary link — not your whole archive. You can revoke the link anytime.",
    deadlinesTitle: "Upcoming deadlines",
    deadlines: [
      { t: "Visa — Peter", d: "in 12 days" },
      { t: "Car insurance", d: "in 26 days" },
      { t: "Passport — Anna", d: "in 30 days" },
    ],
    cta: "Create your own vault for free",
    ctaSub: "2 GB free · sign in with Google or email",
    docsWord: (n: number) => (n === 0 ? "empty" : `${n} ${n === 1 ? "document" : "documents"}`),
  },
  id: {
    metaTitle: "Demo — seperti apa brankas keluarga doki",
    metaDesc:
      "Lihat produknya tanpa mendaftar: dokumen per anggota keluarga dan kategori, pengingat tenggat, dan tautan berbagi berbatas waktu.",
    back: "← Beranda",
    badge: "Demo",
    title: "Lihat ke dalam — tanpa daftar",
    sub: "Ini contoh dengan data fiktif. Di brankas sungguhan, hanya Anda dan orang yang Anda beri akses yang melihat dokumen.",
    familyTitle: "Keluarga",
    members: [
      { name: "Anna", rel: "self", docs: 7 },
      { name: "Budi", rel: "spouse", docs: 5 },
      { name: "Lisa", rel: "child", docs: 4 },
    ],
    docsTitle: "Dokumen per bagian",
    docsSub: "Semua tertata per kategori — lihat apa yang di mana.",
    docCardOwner: "Anna",
    docCardTitle: "Paspor",
    docCardType: "Dokumen identitas",
    valid: "Berlaku sampai 14 Maret 2027",
    reminder: "⏰ Kami ingatkan 30 hari sebelumnya",
    shareTitle: "Bagikan",
    shareRow: "Aktif · sampai 12 Jul · 0/3 tampilan",
    shareNote: "Dokter atau bank hanya membuka satu dokumen ini lewat tautan sementara — bukan seluruh arsip. Tautan bisa dicabut kapan saja.",
    deadlinesTitle: "Tenggat mendatang",
    deadlines: [
      { t: "Visa — Budi", d: "dalam 12 hari" },
      { t: "Asuransi mobil", d: "dalam 26 hari" },
      { t: "Paspor — Anna", d: "dalam 30 hari" },
    ],
    cta: "Buat brankas Anda gratis",
    ctaSub: "2 GB gratis · masuk dengan Google atau email",
    docsWord: (n: number) => (n === 0 ? "kosong" : `${n} dokumen`),
  },
  uz: {
    metaTitle: "Demo — doki oilaviy seyfi qanday koʻrinadi",
    metaDesc:
      "Mahsulotni roʻyxatdan oʻtmasdan koʻring: hujjatlar oila aʼzolari va toifalar boʻyicha, muddat eslatmalari va muddatli havolalar.",
    back: "← Bosh sahifa",
    badge: "Demo",
    title: "Ichiga nazar tashlang — roʻyxatsiz",
    sub: "Bu — toʻqima maʼlumotli namuna. Haqiqiy seyfda hujjatlarni faqat siz va siz ruxsat bergan odamlar koʻradi.",
    familyTitle: "Oila",
    members: [
      { name: "Anna", rel: "self", docs: 7 },
      { name: "Aziz", rel: "spouse", docs: 5 },
      { name: "Laylo", rel: "child", docs: 4 },
    ],
    docsTitle: "Hujjatlar boʻlimlar boʻyicha",
    docsSub: "Hammasi toifalarga ajratilgan — qayerda nima borligini koʻrasiz.",
    docCardOwner: "Anna",
    docCardTitle: "Xalqaro pasport",
    docCardType: "Shaxsiy hujjatlar",
    valid: "2027-yil 14-martgacha amal qiladi",
    reminder: "⏰ 30 kun oldin eslatamiz",
    shareTitle: "Ulashish",
    shareRow: "Faol · 12.07 gacha · 0/3 koʻrish",
    shareNote: "Shifokor yoki bank faqat shu bitta hujjatni muddatli havola orqali ochadi — butun arxivni emas. Havolani istalgan vaqtda bekor qilish mumkin.",
    deadlinesTitle: "Yaqin muddatlar",
    deadlines: [
      { t: "Viza — Aziz", d: "12 kundan keyin" },
      { t: "Avto sugʻurta", d: "26 kundan keyin" },
      { t: "Pasport — Anna", d: "30 kundan keyin" },
    ],
    cta: "Oʻz seyfingizni bepul yarating",
    ctaSub: "2 GB bepul · Google yoki email orqali kirish",
    docsWord: (n: number) => (n === 0 ? "boʻsh" : `${n} ta hujjat`),
  },
} as const;

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const t = M[locale];
  return {
    title: t.metaTitle,
    description: t.metaDesc,
  };
}

function Frame({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-3xl border border-[#e8e0d5] bg-[#fdfaf5] shadow-sm">
      <div className="flex items-center gap-2 border-b border-[#e8e0d5] bg-white/60 px-4 py-2.5 text-sm">
        <span className="text-base">🔐</span>
        <span className="font-semibold">doki</span>
        <span className="ml-auto flex gap-1.5 text-[#b85c38]">
          <span className="h-2.5 w-2.5 rounded-full bg-[#e8e0d5]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#e8e0d5]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#d4a373]" />
        </span>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

export default async function DemoPage() {
  const locale: Locale = await getLocale();
  const t = M[locale];
  const cats = categories(locale);

  return (
    <main className="mx-auto max-w-4xl px-4 py-12 sm:px-5">
      <Link href="/" className="text-sm text-[#8a7c6d] hover:underline">
        {t.back}
      </Link>

      <div className="mt-3">
        <span className="inline-block rounded-full bg-[#b85c38] px-3 py-0.5 text-xs font-semibold uppercase tracking-wide text-white">
          {t.badge}
        </span>
        <h1 className="heading-font mt-3 text-3xl text-[#2c2522] sm:text-4xl">
          {t.title}
        </h1>
        <p className="mt-3 max-w-2xl text-[#5c5248]">{t.sub}</p>
      </div>

      <div className="mt-8 space-y-6">
        {/* Семья */}
        <Frame>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
            👪 {t.familyTitle}
          </h2>
          <div className="grid gap-3 sm:grid-cols-3">
            {t.members.map((m) => (
              <div
                key={m.name}
                className="flex items-center gap-3 rounded-xl border border-[#e8e0d5] bg-white px-3 py-2.5"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-50 text-lg">
                  {m.name.slice(0, 1)}
                </div>
                <div className="min-w-0">
                  <div className="truncate font-medium">{m.name}</div>
                  <div className="text-xs text-slate-500">
                    {relationLabel(locale, m.rel)} · {t.docsWord(m.docs)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Frame>

        {/* Документы по разделам */}
        <Frame>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            📄 {t.docsTitle}
          </h2>
          <p className="mb-3 mt-1 text-xs text-slate-500">{t.docsSub}</p>
          <div className="grid gap-3 sm:grid-cols-2">
            {cats.map((c) => {
              const n = COUNTS[c.key as DocCategory];
              return (
                <div
                  key={c.key}
                  className="flex items-center gap-4 rounded-xl border border-[#e8e0d5] bg-white px-4 py-3"
                >
                  <span className="text-2xl">{c.emoji}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-medium">{c.label}</span>
                    <span className="block text-xs text-slate-500">{t.docsWord(n)}</span>
                  </span>
                  <span
                    className={
                      "flex h-7 min-w-7 items-center justify-center rounded-full px-2 text-sm font-semibold " +
                      (n > 0 ? "bg-brand-100 text-brand-700" : "bg-slate-100 text-slate-400")
                    }
                  >
                    {n}
                  </span>
                </div>
              );
            })}
          </div>
        </Frame>

        {/* Карточка документа + срок + ссылка */}
        <Frame>
          <div className="text-xs text-slate-500">
            {t.docCardOwner} · {t.docCardType}
          </div>
          <div className="mt-1 text-xl font-semibold">{t.docCardTitle}</div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-sm text-slate-600">
              {t.valid}
            </span>
            <span className="rounded-lg bg-amber-50 px-2.5 py-1 text-sm font-medium text-amber-700">
              {t.reminder}
            </span>
          </div>

          <div className="mt-5 border-t border-[#e8e0d5] pt-4">
            <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
              🔗 {t.shareTitle}
            </h3>
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm">
              <span className="font-medium text-emerald-600">{t.shareRow}</span>
              <span className="text-xs text-slate-400">doki.help/s/•••••</span>
            </div>
            <p className="mt-2 text-xs text-slate-500">{t.shareNote}</p>
          </div>
        </Frame>

        {/* Сроки */}
        <Frame>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
            ⏰ {t.deadlinesTitle}
          </h2>
          <ul className="space-y-2">
            {t.deadlines.map((d) => (
              <li
                key={d.t}
                className="flex items-center justify-between rounded-lg border border-[#e8e0d5] bg-white px-3 py-2 text-sm"
              >
                <span className="font-medium">{d.t}</span>
                <span className="text-amber-700">{d.d}</span>
              </li>
            ))}
          </ul>
        </Frame>
      </div>

      {/* CTA */}
      <div className="mt-10 rounded-3xl bg-[#2c2522] px-6 py-8 text-center text-[#f9f5f0]">
        <Link
          href="/login"
          className="inline-flex items-center justify-center rounded-3xl bg-[#b85c38] px-8 py-3.5 text-base font-semibold transition-all hover:bg-[#9f4a2e]"
        >
          {t.cta}
        </Link>
        <p className="mt-3 text-sm text-[#d4c9b8]">{t.ctaSub}</p>
      </div>
    </main>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { getLocale, type Locale } from "@/lib/i18n";

const M = {
  ru: {
    metaTitle: "Цены",
    metaDesc:
      "Сейчас бесплатно: 2 ГБ, напоминания о сроках, семейный доступ, офлайн и временные ссылки. Платные тарифы для большего объёма появятся позже.",
    back: "← На главную",
    title: "Цены",
    subtitle: "Понятно и без сюрпризов.",
    planName: "Бесплатно",
    planNote: "сейчас",
    features: [
      "2 ГБ хранилища",
      "Напоминания о сроках",
      "Документы по членам семьи и категориям",
      "Семейный доступ — несколько человек",
      "Офлайн-доступ к нужным документам",
      "Временные ссылки с отзывом, лимитом просмотров и водяным знаком",
      "Двухфакторная защита (2FA)",
      "Экспорт всех данных в любой момент",
    ],
    cta: "Создать сейф бесплатно",
    laterTitle: "А что потом?",
    later: "Позже появятся платные тарифы для большего объёма. Никаких скрытых платежей: пока тариф один и он бесплатный.",
  },
  en: {
    metaTitle: "Pricing",
    metaDesc:
      "Free right now: 2 GB, deadline reminders, family access, offline and expiring links. Paid plans for more storage will come later.",
    back: "← Home",
    title: "Pricing",
    subtitle: "Clear, with no surprises.",
    planName: "Free",
    planNote: "for now",
    features: [
      "2 GB of storage",
      "Deadline reminders",
      "Documents by candidate, employee, and category",
      "Team access for authorized people",
      "Offline access to the documents you need",
      "Expiring links with revoke, view limits and watermark",
      "Two-factor authentication (2FA)",
      "Export all your data at any time",
    ],
    cta: "Create a free checklist",
    laterTitle: "And later?",
    later: "Paid plans for more storage will come later. No hidden charges: for now there's one plan and it's free.",
  },
  id: {
    metaTitle: "Harga",
    metaDesc:
      "Gratis sekarang: 2 GB, pengingat tenggat, akses keluarga, offline, dan tautan berbatas waktu. Paket berbayar untuk ruang lebih besar hadir nanti.",
    back: "← Beranda",
    title: "Harga",
    subtitle: "Jelas, tanpa kejutan.",
    planName: "Gratis",
    planNote: "untuk saat ini",
    features: [
      "Penyimpanan 2 GB",
      "Pengingat tenggat",
      "Dokumen per kandidat, karyawan, dan kategori",
      "Akses tim untuk pihak yang berwenang",
      "Akses offline ke dokumen yang Anda butuhkan",
      "Tautan berbatas waktu dengan cabut, batas tampilan, dan tanda air",
      "Autentikasi dua faktor (2FA)",
      "Ekspor semua data Anda kapan saja",
    ],
    cta: "Buat checklist gratis",
    laterTitle: "Lalu nanti?",
    later: "Paket berbayar untuk ruang lebih besar akan hadir nanti. Tanpa biaya tersembunyi: untuk sekarang ada satu paket dan itu gratis.",
  },
  uz: {
    metaTitle: "Narxlar",
    metaDesc:
      "Hozir bepul: 2 GB, muddat eslatmalari, oilaviy kirish, oflayn va muddatli havolalar. Koʻproq joy uchun pullik tariflar keyinroq paydo boʻladi.",
    back: "← Bosh sahifa",
    title: "Narxlar",
    subtitle: "Aniq, kutilmagan holatlarsiz.",
    planName: "Bepul",
    planNote: "hozircha",
    features: [
      "2 GB xotira",
      "Muddat eslatmalari",
      "Hujjatlar oila aʼzolari va toifalar boʻyicha",
      "Oilaviy kirish — bir nechta odam",
      "Kerakli hujjatlarga oflayn kirish",
      "Bekor qilinadigan, koʻrish cheklovi va suv belgili muddatli havolalar",
      "Ikki bosqichli himoya (2FA)",
      "Barcha maʼlumotlarni istalgan vaqtda eksport qilish",
    ],
    cta: "Seyf yaratish — bepul",
    laterTitle: "Keyin-chi?",
    later: "Koʻproq joy uchun pullik tariflar keyinroq paydo boʻladi. Yashirin toʻlovlar yoʻq: hozircha bitta tarif bor va u bepul.",
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

export default async function PricingPage() {
  const locale: Locale = await getLocale();
  const t = M[locale];

  return (
    <main className="mx-auto max-w-2xl px-4 py-12 sm:px-5">
      <Link href="/" className="text-sm text-[#8a7c6d] hover:underline">
        {t.back}
      </Link>
      <h1 className="heading-font mt-3 text-3xl text-[#2c2522] sm:text-4xl">
        {t.title}
      </h1>
      <p className="mt-3 text-[#5c5248]">{t.subtitle}</p>

      <div className="mt-8 rounded-3xl border border-[#e8e0d5] bg-[#fdfaf5] p-6 sm:p-8">
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-semibold">{t.planName}</span>
          <span className="text-sm text-slate-500">· {t.planNote}</span>
        </div>
        <ul className="mt-5 space-y-2.5 text-[#5c5248]">
          {t.features.map((f) => (
            <li key={f} className="flex items-start gap-x-2">
              <span className="mt-0.5 shrink-0 font-semibold text-[#b85c38]">✓</span>
              <span>{f}</span>
            </li>
          ))}
        </ul>
        <Link
          href="/login"
          className="accent-btn mt-7 inline-flex rounded-3xl px-8 py-3 text-base font-semibold"
        >
          {t.cta}
        </Link>
      </div>

      <div className="mt-6 rounded-3xl border border-[#e8e0d5] bg-white p-6">
        <div className="mb-1.5 font-semibold text-[#2c2522]">{t.laterTitle}</div>
        <p className="text-sm text-[#5c5248]">{t.later}</p>
      </div>
    </main>
  );
}

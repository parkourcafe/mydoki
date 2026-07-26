import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import SwRegister from "@/components/SwRegister";
import YandexMetrika from "@/components/YandexMetrika";
import { getLocale } from "@/lib/i18n";
import { altLangs } from "@/lib/seo";
import "./globals.css";

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-inter",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin", "cyrillic"],
  weight: ["700", "800"],
  variable: "--font-playfair",
  display: "swap",
});

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://www.doki.help";

const META = {
  ru: {
    title: "Семейный сейф — все документы семьи в одном месте",
    description:
      "Все документы вашей семьи в одном защищённом месте: удостоверения, образование, медицина, имущество. Напоминания о сроках (паспорт, ОСАГО, виза) и безопасная отправка по истекающей ссылке.",
    keywords: [
      "семейный архив документов",
      "хранение документов онлайн",
      "напоминания о сроках документов",
      "загранпаспорт ОСАГО виза напоминание",
      "документы семьи в одном месте",
      "сейф для документов",
    ],
    ogLocale: "ru_RU",
  },
  en: {
    title: "Family Vault — all your family's documents in one place",
    description:
      "All your family's documents in one secure place: IDs, education, medical, property. Expiry reminders (passport, insurance, visa) and safe sharing via expiring links.",
    keywords: [
      "family document archive",
      "store documents online",
      "document expiry reminders",
      "passport visa insurance reminder",
      "family documents in one place",
      "document vault",
    ],
    ogLocale: "en_US",
  },
  id: {
    title: "Dokumen Kandidat & Karyawan — kumpulkan lewat satu link",
    description:
      "Buat checklist dokumen untuk kandidat dan karyawan, kirim tautan lewat WhatsApp, dan pantau kelengkapan tanpa spreadsheet atau chat berantakan.",
    keywords: [
      "dokumen kandidat",
      "dokumen karyawan",
      "checklist onboarding",
      "pengumpulan dokumen HR",
      "dokumen kerja Bali",
      "tautan dokumen kandidat",
    ],
    ogLocale: "id_ID",
  },
  uz: {
    title: "Oilaviy seyf — oila hujjatlari bitta joyda",
    description:
      "Oilangizning barcha hujjatlari bitta xavfsiz joyda: shaxsiy, taʼlim, tibbiy, mulk. Muddat eslatmalari (pasport, sugʻurta, viza) va muddatli havola orqali xavfsiz ulashish.",
    keywords: [
      "oila hujjatlari arxivi",
      "hujjatlarni onlayn saqlash",
      "hujjat muddati eslatmalari",
      "pasport viza sugʻurta eslatma",
      "oila hujjatlari bitta joyda",
      "hujjatlar seyfi",
    ],
    ogLocale: "uz_UZ",
  },
} as const;

export async function generateMetadata(): Promise<Metadata> {
  const m = META[await getLocale()];
  return {
    metadataBase: new URL(APP_URL),
    title: { default: m.title, template: "%s · doki.help" },
    description: m.description,
    applicationName: "doki.help",
    keywords: [...m.keywords],
    // canonical + hreflang считаются из заголовков пути (см. lib/seo.ts),
    // поэтому корректны для каждой страницы и языковой версии.
    alternates: await altLangs(),
    openGraph: {
      type: "website",
      locale: m.ogLocale,
      url: APP_URL,
      siteName: "doki.help",
      title: m.title,
      description: m.description,
    },
    twitter: {
      card: "summary_large_image",
      title: m.title,
      description: m.description,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true },
    },
    verification: {
      google: "WjIJcU6oZE269vmJf6pKuQb5nJLExIUEClLb6IPgCBg",
      yandex: ["782bfe115bbb718d", "7410d439c2d113a4"],
    },
    formatDetection: { telephone: false },
    appleWebApp: {
      capable: true,
      title: "doki.help",
      statusBarStyle: "default",
    },
  };
}

export const viewport: Viewport = {
  themeColor: "#b85c38",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  return (
    <html lang={locale} className={`${inter.variable} ${playfair.variable}`}>
      <body>
        {children}
        <SwRegister />
        <Analytics />
        <YandexMetrika />
      </body>
    </html>
  );
}

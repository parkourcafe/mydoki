import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import SwRegister from "@/components/SwRegister";
import NativeGate from "@/components/NativeGate";
import YandexMetrika from "@/components/YandexMetrika";
import PostHogProvider from "@/components/PostHogProvider";
import { getLocale } from "@/lib/i18n";
import { altLangs } from "@/lib/seo";
import { isNativeRequest } from "@/lib/isNativeRequest";
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
    title: "Candidate & Employee Documents — collect them with one link",
    description:
      "Create document checklists for candidates and employees in Indonesia, send one WhatsApp-ready link, and track completion without messy chats or spreadsheets.",
    keywords: [
      "candidate documents Indonesia",
      "employee documents Indonesia",
      "onboarding checklist Indonesia",
      "HR document collection Bali",
      "work documents Bali",
      "candidate document link",
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
    formatDetection: { telephone: false, date: false, address: false, email: false },
    appleWebApp: {
      capable: true,
      title: "doki.help",
      // Установленная из Safari PWA: обычный статус-бар (без ухода контента под
      // него). В нативной обёртке статус-бар отдельно ведёт Capacitor-плагин.
      statusBarStyle: "default",
    },
    icons: {
      icon: [
        { url: "/icon-192", sizes: "192x192", type: "image/png" },
        { url: "/icon-512", sizes: "512x512", type: "image/png" },
      ],
      apple: [{ url: "/apple-icon", sizes: "180x180", type: "image/png" }],
    },
  };
}

export const viewport: Viewport = {
  themeColor: "#b85c38",
  // Контент под вырез/динамический остров; отступы даёт env(safe-area-inset-*).
  viewportFit: "cover",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  // Внутри нативной обёртки НЕ грузим сторонние аналитики (Яндекс.Метрика,
  // PostHog) — так в App Privacy честно «not used to track». Vercel Analytics
  // (first-party, без cookies) оставляем. В браузере/PWA — всё как раньше.
  const native = await isNativeRequest();
  return (
    <html lang={locale} className={`${inter.variable} ${playfair.variable}`}>
      <body>
        {children}
        <NativeGate />
        <SwRegister />
        <Analytics />
        {!native && <YandexMetrika />}
        {!native && <PostHogProvider />}
      </body>
    </html>
  );
}

import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import SwRegister from "@/components/SwRegister";
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

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://doki.help";

const TITLE = "Семейный сейф — все документы семьи в одном месте";
const DESCRIPTION =
  "Все документы вашей семьи в одном защищённом месте: удостоверения, образование, медицина, имущество. Напоминания о сроках (паспорт, ОСАГО, виза) и безопасная отправка по истекающей ссылке.";

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: { default: TITLE, template: "%s · doki.help" },
  description: DESCRIPTION,
  applicationName: "doki.help",
  keywords: [
    "семейный архив документов",
    "хранение документов онлайн",
    "напоминания о сроках документов",
    "загранпаспорт ОСАГО виза напоминание",
    "документы семьи в одном месте",
    "сейф для документов",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "ru_RU",
    url: APP_URL,
    siteName: "doki.help",
    title: TITLE,
    description: DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  formatDetection: { telephone: false },
  appleWebApp: {
    capable: true,
    title: "doki.help",
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  themeColor: "#b85c38",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru" className={`${inter.variable} ${playfair.variable}`}>
      <body>
        {children}
        <SwRegister />
        <Analytics />
      </body>
    </html>
  );
}

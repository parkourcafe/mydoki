import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Семейный сейф — все документы семьи в одном месте",
  description:
    "Все документы вашей семьи в одном защищённом месте: удостоверения, образование, медицина. Напоминания о сроках и безопасная отправка по истекающей ссылке.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}

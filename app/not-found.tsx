import Link from "next/link";
import { getLocale } from "@/lib/i18n";

// Ссылка по устаревшему адресу не должна упираться в англоязычную заглушку
// Next без выхода: даём локализованный текст и путь назад.
const M = {
  id: {
    title: "Halaman tidak ditemukan",
    text: "Tautan mungkin sudah kedaluwarsa, atau halamannya sudah dipindahkan.",
    home: "Ke halaman utama",
    cabinet: "Ke dasbor",
  },
  en: {
    title: "Page not found",
    text: "The link may have expired, or the page has moved.",
    home: "Go to the homepage",
    cabinet: "Go to your dashboard",
  },
  ru: {
    title: "Страница не найдена",
    text: "Возможно, ссылка устарела или страница переехала.",
    home: "На главную",
    cabinet: "В кабинет",
  },
  uz: {
    title: "Sahifa topilmadi",
    text: "Havola eskirgan yoki sahifa ko‘chirilgan bo‘lishi mumkin.",
    home: "Bosh sahifaga",
    cabinet: "Kabinetga",
  },
} as const;

export default async function NotFound() {
  const t = M[await getLocale()];
  return (
    <main className="min-h-screen px-4 py-16">
      <div className="mx-auto w-full max-w-md text-center">
        <div className="mb-3 text-4xl">🔍</div>
        <h1 className="text-xl font-semibold">{t.title}</h1>
        <p className="mt-2 text-sm text-slate-500">{t.text}</p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <Link href="/" className="btn-primary">
            {t.home}
          </Link>
          <Link href="/my" className="btn-ghost">
            {t.cabinet}
          </Link>
        </div>
      </div>
    </main>
  );
}

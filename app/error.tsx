"use client";

import { useEffect } from "react";
import Link from "next/link";

// Границы ошибок в Next — только клиентские, поэтому локаль читаем из
// <html lang>, выставленного в корневом layout, а не через getLocale().
const M = {
  id: {
    title: "Terjadi kesalahan",
    text: "Kami tidak dapat memuat halaman ini. Coba lagi — jika tetap gagal, hubungi kami.",
    retry: "Coba lagi",
    home: "Ke halaman utama",
  },
  en: {
    title: "Something went wrong",
    text: "We couldn't load this page. Try again — if it keeps failing, contact us.",
    retry: "Try again",
    home: "Go to the homepage",
  },
  ru: {
    title: "Что-то пошло не так",
    text: "Не удалось загрузить страницу. Попробуйте ещё раз — если не помогает, напишите нам.",
    retry: "Попробовать снова",
    home: "На главную",
  },
  uz: {
    title: "Xatolik yuz berdi",
    text: "Sahifani yuklab bo‘lmadi. Qayta urinib ko‘ring — yordam bermasa, bizga yozing.",
    retry: "Qayta urinish",
    home: "Bosh sahifaga",
  },
} as const;

type Loc = keyof typeof M;

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Сообщение не показываем пользователю (может содержать детали БД) —
    // только в консоль для диагностики.
    console.error(error);
  }, [error]);

  const lang =
    typeof document !== "undefined" ? document.documentElement.lang : "id";
  const t = M[(lang as Loc) in M ? (lang as Loc) : "id"];

  return (
    <main className="min-h-screen px-4 py-16">
      <div className="mx-auto w-full max-w-md text-center">
        <div className="mb-3 text-4xl">⚠️</div>
        <h1 className="text-xl font-semibold">{t.title}</h1>
        <p className="mt-2 text-sm text-slate-500">{t.text}</p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button type="button" onClick={reset} className="btn-primary">
            {t.retry}
          </button>
          <Link href="/" className="btn-ghost">
            {t.home}
          </Link>
        </div>
        {error.digest && (
          <p className="mt-4 text-xs text-slate-400">ID: {error.digest}</p>
        )}
      </div>
    </main>
  );
}

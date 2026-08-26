"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import type { Locale } from "@/lib/i18n";

// Подписка не нужна: локаль не меняется без перезагрузки страницы.
const emptySubscribe = () => () => {};

const M: Record<Locale, { title: string; body: string; cta: string }> = {
  ru: {
    title: "Нет соединения",
    body: "Сейчас нет интернета. Документы, сохранённые офлайн, доступны без сети.",
    cta: "📥 Открыть сохранённое офлайн",
  },
  en: {
    title: "No connection",
    body: "You're offline right now. Documents you saved offline are available without a network.",
    cta: "📥 Open saved offline",
  },
  id: {
    title: "Tidak ada koneksi",
    body: "Anda sedang offline. Dokumen yang Anda simpan offline tetap bisa diakses tanpa jaringan.",
    cta: "📥 Buka simpanan offline",
  },
  uz: {
    title: "Aloqa yoʻq",
    body: "Hozir internet yoʻq. Oflayn saqlangan hujjatlar tarmoqsiz ham mavjud.",
    cta: "📥 Saqlangan oflaynni ochish",
  },
};

function detectLocale(): Locale {
  if (typeof document !== "undefined") {
    const m = document.cookie.match(/(?:^|;\s*)locale=(ru|en|id|uz)/);
    if (m) return m[1] as Locale;
    const lang = (navigator.language || "en").slice(0, 2);
    if (lang === "ru" || lang === "id" || lang === "uz") return lang as Locale;
  }
  return "en";
}

export default function OfflineMessage() {
  // Локаль известна только на клиенте (cookie/navigator). Читаем её через
  // useSyncExternalStore: серверный снапшот «en» гарантирует совпадение
  // гидратации, клиентский уточняет локаль сразу после — без setState
  // в эффекте (react-hooks/set-state-in-effect).
  const locale = useSyncExternalStore(emptySubscribe, detectLocale, () => "en" as Locale);
  const t = M[locale];

  return (
    <div className="max-w-sm">
      <div className="mb-3 text-5xl">🔌</div>
      <h1 className="text-xl font-semibold">{t.title}</h1>
      <p className="mt-2 text-sm text-[#5c5248]">{t.body}</p>
      <Link
        href="/saved"
        prefetch
        className="mt-4 inline-block rounded-lg bg-[#b85c38] px-4 py-2 text-sm font-medium text-white"
      >
        {t.cta}
      </Link>
      <p className="mt-4 text-xs text-[#8a7c6d]">
        No connection · Tidak ada koneksi · Aloqa yoʻq · Нет соединения
      </p>
    </div>
  );
}

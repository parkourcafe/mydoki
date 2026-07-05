"use client";

import { useEffect } from "react";
import Link from "next/link";
import type { Locale } from "@/lib/i18n";
import { waLink } from "@/lib/career";
import { track } from "@/lib/analytics";

// Контакты поддержки для ручного апгрейда (пилот: оплата переводом в переписке).
const SUPPORT_WHATSAPP = "+6281943286395";
const SUPPORT_EMAIL = "doki.help@gmail.com";

const M = {
  ru: {
    title: "Достигнут лимит бесплатных вакансий",
    body: (n: number) =>
      `На бесплатном тарифе можно ${n} активных вакансий. Хотите разместить ещё — напишите нам, включим за пару минут.`,
    wa: "Написать в WhatsApp",
    email: "Написать на email",
    waText: "Здравствуйте! Хочу разместить больше вакансий на doki.help.",
    back: "← Назад к вакансиям",
  },
  en: {
    title: "Free vacancy limit reached",
    body: (n: number) =>
      `Your free plan includes ${n} active vacancies. Want to post more — message us and we'll enable it in a couple of minutes.`,
    wa: "Message on WhatsApp",
    email: "Email us",
    waText: "Hi! I'd like to post more vacancies on doki.help.",
    back: "← Back to vacancies",
  },
  id: {
    title: "Batas lowongan gratis tercapai",
    body: (n: number) =>
      `Paket gratis mencakup ${n} lowongan aktif. Ingin memasang lebih — hubungi kami, kami aktifkan dalam beberapa menit.`,
    wa: "Chat WhatsApp",
    email: "Email kami",
    waText: "Halo! Saya ingin memasang lebih banyak lowongan di doki.help.",
    back: "← Kembali ke lowongan",
  },
  uz: {
    title: "Bepul vakansiya limiti tugadi",
    body: (n: number) =>
      `Bepul tarifda ${n} ta faol vakansiya mumkin. Ko‘proq joylashtirmoqchimisiz — bizga yozing, bir necha daqiqada yoqamiz.`,
    wa: "WhatsApp orqali yozish",
    email: "Email yuborish",
    waText: "Salom! doki.help’da ko‘proq vakansiya joylashtirmoqchiman.",
    back: "← Vakansiyalarga qaytish",
  },
} as const;

export default function VacancyLimitReached({
  locale,
  limit,
}: {
  locale: Locale;
  limit: number;
}) {
  const t = M[locale];

  // Спрос: сколько работодателей упёрлись в бесплатный лимит.
  useEffect(() => {
    track("vacancy_limit_reached", { limit });
  }, [limit]);

  return (
    <div className="mx-auto max-w-lg">
      <div className="card space-y-4 text-center">
        <div className="text-4xl">🚀</div>
        <div>
          <h1 className="text-xl font-semibold">{t.title}</h1>
          <p className="mt-2 text-sm text-slate-500">{t.body(limit)}</p>
        </div>
        <div className="space-y-2">
          <a
            href={waLink(SUPPORT_WHATSAPP, t.waText)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => track("upsell_contact_clicked", { channel: "whatsapp" })}
            className="btn-primary w-full"
          >
            💬 {t.wa}
          </a>
          <a
            href={`mailto:${SUPPORT_EMAIL}`}
            onClick={() => track("upsell_contact_clicked", { channel: "email" })}
            className="block w-full rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            ✉️ {t.email}
          </a>
        </div>
        <Link
          href="/employer"
          className="block text-sm text-brand-600 hover:underline"
        >
          {t.back}
        </Link>
      </div>
    </div>
  );
}

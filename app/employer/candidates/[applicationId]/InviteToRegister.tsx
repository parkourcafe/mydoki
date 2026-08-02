"use client";

import type { Locale } from "@/lib/i18n";
import { waLink } from "@/lib/career";

/**
 * Приглашение принятого кандидата завести аккаунт, чтобы трудовые отношения
 * можно было оформить (запись двусторонняя — см. EmployeeOnboard).
 *
 * ⚠️ Сообщение НЕ содержит access_token отклика. claim_application не
 * проверяет, кто его вызывает: любой залогиненный с токеном привязал бы отклик
 * к себе. Поэтому привязку кандидат делает сам со своей страницы статуса —
 * ссылку на неё он получил при отправке отклика.
 */
const M = {
  id: {
    title: "Undang kandidat membuat akun",
    hint: "Hubungan kerja tercatat di dua sisi, jadi kandidat perlu akun. Kirim ajakan singkat — kandidat menyimpan lamarannya lewat tautan status yang sudah ia terima.",
    cta: "Kirim ajakan via WhatsApp",
    msg: (name: string) =>
      `Halo ${name}! Selamat, Anda diterima 🎉 Untuk melanjutkan proses, buat akun gratis di doki.help, lalu buka tautan status lamaran yang Anda terima dan pilih “Simpan ke akun saya”.`,
  },
  en: {
    title: "Invite the candidate to create an account",
    hint: "An employment record is two-sided, so the candidate needs an account. Send a short invitation — they save the application from the status link they already received.",
    cta: "Send invitation via WhatsApp",
    msg: (name: string) =>
      `Hi ${name}! Congratulations, you've been hired 🎉 To continue, create a free account at doki.help, then open the application status link you received and choose “Save to my account”.`,
  },
  ru: {
    title: "Пригласить кандидата завести аккаунт",
    hint: "Запись о трудовых отношениях двусторонняя, поэтому кандидату нужен аккаунт. Отправьте короткое приглашение — он сохранит отклик по ссылке статуса, которую уже получил.",
    cta: "Отправить приглашение в WhatsApp",
    msg: (name: string) =>
      `Здравствуйте, ${name}! Поздравляем, вы приняты 🎉 Чтобы продолжить оформление, заведите бесплатный аккаунт на doki.help, откройте ссылку статуса отклика и нажмите «Сохранить в свой аккаунт».`,
  },
  uz: {
    title: "Nomzodni hisob ochishga taklif qiling",
    hint: "Mehnat munosabatlari yozuvi ikki tomonlama, shuning uchun nomzodga hisob kerak. Qisqa taklif yuboring — u arizani o‘zi olgan holat havolasi orqali saqlaydi.",
    cta: "WhatsApp orqali taklif yuborish",
    msg: (name: string) =>
      `Assalomu alaykum, ${name}! Tabriklaymiz, siz qabul qilindingiz 🎉 Davom etish uchun doki.help’da bepul hisob oching, so‘ng olgan ariza holati havolasini ochib, “Hisobimga saqlash”ni tanlang.`,
  },
} as const;

export default function InviteToRegister({
  locale,
  fullName,
  whatsapp,
}: {
  locale: Locale;
  fullName: string;
  whatsapp: string;
}) {
  const t = M[locale];
  if (!whatsapp) return null;

  return (
    <div className="mt-3 border-t border-slate-100 pt-3">
      <p className="text-sm font-medium text-slate-700">{t.title}</p>
      <p className="mt-1 text-sm text-slate-500">{t.hint}</p>
      <a
        href={waLink(whatsapp, t.msg(fullName.split(" ")[0] || fullName))}
        target="_blank"
        rel="noreferrer"
        className="btn border border-green-200 bg-green-50 text-green-700 hover:bg-green-100 mt-2 inline-flex"
      >
        💬 {t.cta}
      </a>
    </div>
  );
}

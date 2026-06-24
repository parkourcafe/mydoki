import { redirect } from "next/navigation";
import { getUser } from "@/lib/queries";
import { getLocale } from "@/lib/i18n";
import LoginForm from "./LoginForm";

const M = {
  ru: {
    badge: "Семейный сейф",
    headingLead: "Все документы вашей семьи —",
    headingAccent: "в одном защищённом месте",
    subtitle:
      "Паспорта, дипломы, медкарта и имущество — под рукой и под защитой.",
    security: "Приватно по умолчанию · RLS · приватный storage",
    privacy: "Конфиденциальность",
    terms: "Условия",
  },
  en: {
    badge: "Family vault",
    headingLead: "All your family's documents —",
    headingAccent: "in one secure place",
    subtitle:
      "Passports, diplomas, medical records and property — at hand and protected.",
    security: "Private by default · RLS · private storage",
    privacy: "Privacy",
    terms: "Terms",
  },
  id: {
    badge: "Brankas keluarga",
    headingLead: "Semua dokumen keluarga Anda —",
    headingAccent: "di satu tempat yang aman",
    subtitle:
      "Paspor, ijazah, rekam medis, dan properti — selalu di tangan dan terlindungi.",
    security: "Privat secara bawaan · RLS · penyimpanan privat",
    privacy: "Privasi",
    terms: "Ketentuan",
  },
  uz: {
    badge: "Oilaviy seyf",
    headingLead: "Oilangizning barcha hujjatlari —",
    headingAccent: "bitta xavfsiz joyda",
    subtitle:
      "Pasportlar, diplomlar, tibbiy kartalar va mulk — qoʻl ostida va himoyalangan.",
    security: "Standart boʻyicha maxfiy · RLS · maxfiy saqlash",
    privacy: "Maxfiylik",
    terms: "Shartlar",
  },
} as const;

export default async function LoginPage() {
  if (await getUser()) redirect("/my");

  const locale = await getLocale();
  const t = M[locale];

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mb-5 inline-flex items-center gap-1.5 rounded-full border border-brand-100 bg-brand-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-brand-600">
            <span>🔐</span> {t.badge}
          </div>
          <h1 className="text-balance text-3xl font-extrabold leading-[1.15] tracking-tight text-slate-900 sm:text-[2.6rem]">
            {t.headingLead}{" "}
            <span className="bg-gradient-to-r from-brand-600 via-brand-500 to-[#d4a373] bg-clip-text text-transparent">
              {t.headingAccent}
            </span>
          </h1>
          <p className="mx-auto mt-4 max-w-xs text-sm text-slate-500">
            {t.subtitle}
          </p>
        </div>

        <div className="card shadow-md">
          <LoginForm locale={locale} />
        </div>

        <p className="mt-6 text-center text-xs text-slate-400">
          {t.security}
        </p>
        <p className="mt-2 text-center text-xs text-slate-400">
          <a href="/privacy" className="hover:underline">{t.privacy}</a>
          {" · "}
          <a href="/terms" className="hover:underline">{t.terms}</a>
        </p>
      </div>
    </main>
  );
}

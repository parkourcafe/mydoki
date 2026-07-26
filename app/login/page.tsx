import { redirect } from "next/navigation";
import { getUser } from "@/lib/queries";
import { getLocale } from "@/lib/i18n";
import { safeNextPath } from "@/lib/nextPath";
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
    oauthError: "Не удалось войти через Google. Попробуйте ещё раз.",
  },
  en: {
    badge: "Work documents",
    headingLead: "Candidate and employee documents —",
    headingAccent: "complete with one link",
    subtitle:
      "Sign in to create a checklist, send a link, or complete a work-document package.",
    security: "Controlled access · secure links · clear document status",
    privacy: "Privacy",
    terms: "Terms",
    oauthError: "Couldn't sign in with Google. Please try again.",
  },
  id: {
    badge: "Dokumen kerja",
    headingLead: "Dokumen kandidat dan karyawan —",
    headingAccent: "lengkap lewat satu link",
    subtitle:
      "Masuk untuk membuat checklist, mengirim tautan, atau melengkapi paket dokumen kerja.",
    security: "Akses terkontrol · tautan aman · status dokumen jelas",
    privacy: "Privasi",
    terms: "Ketentuan",
    oauthError: "Gagal masuk dengan Google. Silakan coba lagi.",
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
    oauthError: "Google orqali kirib boʻlmadi. Qayta urinib koʻring.",
  },
} as const;

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string; mode?: string }>;
}) {
  const sp = await searchParams;
  const next = safeNextPath(sp.next);
  if (await getUser()) redirect(next);

  const locale = await getLocale();
  const t = M[locale];
  const oauthFailed = sp.error === "google";
  const initialMode = sp.mode === "signup" ? "signup" : "login";

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

        {oauthFailed && (
          <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-center text-sm text-red-700">
            {t.oauthError}
          </p>
        )}

        <div className="card shadow-md">
          <LoginForm locale={locale} next={next} initialMode={initialMode} />
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

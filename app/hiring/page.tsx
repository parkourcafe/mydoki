import type { Metadata } from "next";
import Link from "next/link";
import { getLocale, type Locale } from "@/lib/i18n";

// Корень домена doki.id переписывается сюда (см. proxy), поэтому
// метаданные должны идти по локали, а не быть русскими для всех.
const META: Record<Locale, { title: string; description: string }> = {
  id: {
    title: "Doki Hiring — lowongan dan lamaran",
    description:
      "Buat lowongan, bagikan tautan, dan terima lamaran yang tertata. Kandidat melamar tanpa perlu mendaftar.",
  },
  en: {
    title: "Doki Hiring — vacancies and applications",
    description:
      "Create a vacancy, share the link, and receive structured applications. Candidates apply without registering.",
  },
  ru: {
    title: "Doki Hiring — вакансии и отклики",
    description:
      "Создайте вакансию, поделитесь ссылкой и получайте структурированные отклики. Кандидаты откликаются без регистрации.",
  },
  uz: {
    title: "Doki Hiring — vakansiya va arizalar",
    description:
      "Vakansiya yarating, havolani ulashing va tuzilgan arizalarni oling. Nomzodlar ro‘yxatdan o‘tmasdan ariza beradi.",
  },
};

export async function generateMetadata(): Promise<Metadata> {
  return META[await getLocale()];
}

const M = {
  en: {
    badge: "Doki · Hiring",
    h1: "Vacancies and applications — in one place",
    sub: "Create a vacancy, share a link or QR, and receive structured applications. Candidates apply without signing up.",
    cta: "Create a vacancy",
    b1: "No candidate signup",
    b2: "Link + QR to share anywhere",
    b3: "All applications in one dashboard",
    login: "I already have an account",
  },
  id: {
    badge: "Doki · Rekrutmen",
    h1: "Lowongan dan lamaran — di satu tempat",
    sub: "Buat lowongan, bagikan tautan atau QR, dan terima lamaran yang terstruktur. Kandidat melamar tanpa daftar akun.",
    cta: "Buat lowongan",
    b1: "Tanpa daftar akun kandidat",
    b2: "Tautan + QR untuk dibagikan",
    b3: "Semua lamaran dalam satu dasbor",
    login: "Saya sudah punya akun",
  },
  ru: {
    badge: "Doki · Найм",
    h1: "Вакансии и отклики — в одном месте",
    sub: "Создайте вакансию, поделитесь ссылкой или QR и получайте структурированные отклики. Кандидаты откликаются без регистрации.",
    cta: "Создать вакансию",
    b1: "Кандидату не нужна регистрация",
    b2: "Ссылка + QR для любых каналов",
    b3: "Все отклики в одном дашборде",
    login: "У меня уже есть аккаунт",
  },
  uz: {
    badge: "Doki · Yollash",
    h1: "Vakansiya va arizalar — bitta joyda",
    sub: "Vakansiya yarating, havola yoki QR ulashing va tuzilgan arizalarni oling. Nomzodlar ro‘yxatdan o‘tmasdan ariza beradi.",
    cta: "Vakansiya yaratish",
    b1: "Nomzodga ro‘yxatdan o‘tish shart emas",
    b2: "Ulashish uchun havola + QR",
    b3: "Barcha arizalar bitta dasbordda",
    login: "Menda allaqachon akkaunt bor",
  },
} as const;

export default async function HiringLanding() {
  const locale = await getLocale();
  const t = M[locale];

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg text-center">
        <div className="mb-5 inline-flex items-center gap-1.5 rounded-full border border-brand-100 bg-brand-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-brand-600">
          <span>💼</span> {t.badge}
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">{t.h1}</h1>
        <p className="mx-auto mt-3 max-w-md text-slate-600">{t.sub}</p>

        <ul className="mx-auto mt-6 max-w-sm space-y-2 text-left text-sm text-slate-700">
          {[t.b1, t.b2, t.b3].map((b) => (
            <li key={b} className="flex items-center gap-2">
              <span className="text-brand-600">✓</span> {b}
            </li>
          ))}
        </ul>

        <Link href="/employer/vacancies/new" className="btn-primary mt-8 inline-block w-full max-w-xs">
          {t.cta}
        </Link>
        <p className="mt-3">
          <Link href="/employer" className="text-sm text-brand-600 hover:underline">
            {t.login}
          </Link>
        </p>
      </div>
    </main>
  );
}

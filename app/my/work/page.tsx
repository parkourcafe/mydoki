import Link from "next/link";
import { getLocale, type Locale } from "@/lib/i18n";

const M = {
  ru: {
    title: "Работа",
    subtitle: "Три роли — выберите, что вам сейчас нужно. Роли можно совмещать.",
    employerTitle: "Я нанимаю",
    employerRole: "Работодатель",
    employerText:
      "Создавайте вакансии, получайте отклики с документами и задавайте свои вопросы кандидатам.",
    employerCta: "Мои вакансии",
    candidateTitle: "Я ищу работу",
    candidateRole: "Кандидат",
    candidateText:
      "Резюме со своими полями и отслеживание откликов — куда вы подались и что ответили.",
    resumeCta: "Моё резюме",
    applicationsCta: "Мои отклики",
    freelancerTitle: "Я беру заказы",
    freelancerRole: "Фрилансер",
    freelancerText:
      "Витрина работ с фото и одна публичная ссылка, которой делитесь с клиентом.",
    freelancerCta: "Моё портфолио",
  },
  en: {
    title: "Work",
    subtitle: "Three roles — pick what you need now. You can combine them.",
    employerTitle: "I'm hiring",
    employerRole: "Employer",
    employerText:
      "Post vacancies, receive applications with documents, and ask candidates your own questions.",
    employerCta: "My vacancies",
    candidateTitle: "I'm job hunting",
    candidateRole: "Candidate",
    candidateText:
      "A resume with your own fields and tracking of where you applied and what you answered.",
    resumeCta: "My resume",
    applicationsCta: "My applications",
    freelancerTitle: "I take orders",
    freelancerRole: "Freelancer",
    freelancerText:
      "A showcase of your work with photos and one public link to share with a client.",
    freelancerCta: "My portfolio",
  },
  id: {
    title: "Kerja",
    subtitle: "Tiga peran — pilih yang Anda butuhkan sekarang. Bisa digabung.",
    employerTitle: "Saya merekrut",
    employerRole: "Perusahaan",
    employerText:
      "Buat lowongan, terima lamaran dengan dokumen, dan ajukan pertanyaan Anda ke kandidat.",
    employerCta: "Lowongan saya",
    candidateTitle: "Saya cari kerja",
    candidateRole: "Kandidat",
    candidateText:
      "Resume dengan kolom sendiri dan pelacakan ke mana Anda melamar dan jawaban Anda.",
    resumeCta: "Resume saya",
    applicationsCta: "Lamaran saya",
    freelancerTitle: "Saya terima order",
    freelancerRole: "Freelancer",
    freelancerText:
      "Etalase karya dengan foto dan satu tautan publik untuk dibagikan ke klien.",
    freelancerCta: "Portofolio saya",
  },
  uz: {
    title: "Ish",
    subtitle: "Uchta rol — hozir kerakligini tanlang. Ularni birlashtirsa bo‘ladi.",
    employerTitle: "Men yollayman",
    employerRole: "Ish beruvchi",
    employerText:
      "Vakansiyalar joylang, hujjatli arizalar oling va nomzodlarga o‘z savollaringizni bering.",
    employerCta: "Mening vakansiyalarim",
    candidateTitle: "Men ish qidiryapman",
    candidateRole: "Nomzod",
    candidateText:
      "O‘z maydonlaringiz bilan rezyume va qayerga ariza berganingiz hamda javoblaringizni kuzatish.",
    resumeCta: "Mening rezyumem",
    applicationsCta: "Mening arizalarim",
    freelancerTitle: "Men buyurtma olaman",
    freelancerRole: "Frilanser",
    freelancerText:
      "Fotoli ishlar vitrinasi va mijozga ulashadigan bitta ochiq havola.",
    freelancerCta: "Mening portfoliom",
  },
} as const;

function Cta({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center rounded-lg bg-[#f0e6d9] px-3 py-2 text-sm font-medium text-[#2c2522] transition-colors hover:bg-[#e8dcc9]"
    >
      {children} →
    </Link>
  );
}

export default async function WorkHubPage() {
  const locale: Locale = await getLocale();
  const t = M[locale];

  const roles = [
    {
      emoji: "🧑‍💼",
      title: t.employerTitle,
      role: t.employerRole,
      text: t.employerText,
      ctas: [{ href: "/employer", label: t.employerCta }],
    },
    {
      emoji: "🙋",
      title: t.candidateTitle,
      role: t.candidateRole,
      text: t.candidateText,
      ctas: [
        { href: "/my/resume", label: t.resumeCta },
        { href: "/my/applications", label: t.applicationsCta },
      ],
    },
    {
      emoji: "🎨",
      title: t.freelancerTitle,
      role: t.freelancerRole,
      text: t.freelancerText,
      ctas: [{ href: "/my/freelance", label: t.freelancerCta }],
    },
  ];

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">{t.title}</h1>
        <p className="mt-1 text-sm text-slate-500">{t.subtitle}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {roles.map((r) => (
          <div key={r.role} className="card flex flex-col">
            <div className="text-3xl">{r.emoji}</div>
            <h2 className="mt-2 text-lg font-semibold">{r.title}</h2>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              {r.role}
            </p>
            <p className="mt-2 flex-1 text-sm text-slate-600">{r.text}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {r.ctas.map((c) => (
                <Cta key={c.href} href={c.href}>
                  {c.label}
                </Cta>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

import Link from "next/link";
import { getSupabaseServer } from "@/lib/supabase/server";
import { getLocale } from "@/lib/i18n";
import { docTypeLabel, type Vacancy } from "@/lib/career";
import VacancyDescription from "@/components/VacancyDescription";

// Публичная страница вакансии по прямой ссылке (не доска вакансий) — noindex.
export const metadata = {
  robots: { index: false, follow: true },
};

const M = {
  ru: {
    notFoundTitle: "Вакансия недоступна",
    notFoundText: "Ссылка недействительна или приём откликов закрыт.",
    hiringNow: "Срочный набор",
    problem: "Задача роли",
    mustHave: "Обязательно",
    trainable: "Научим",
    docs: "Нужные документы",
    questions: "Вопросы при отклике",
    stages: "Этапы отбора",
    probation: "Успешный испытательный срок",
    apply: "Откликнуться",
    poweredBy: "Работает на",
  },
  en: {
    notFoundTitle: "Vacancy not available",
    notFoundText: "This link is invalid, or applications are closed.",
    hiringNow: "Hiring now",
    problem: "Role's task",
    mustHave: "Must have",
    trainable: "Can be trained",
    docs: "Required documents",
    questions: "Application questions",
    stages: "Selection stages",
    probation: "Successful probation looks like",
    apply: "Apply",
    poweredBy: "Powered by",
  },
  uz: {
    notFoundTitle: "Vakansiya mavjud emas",
    notFoundText: "Havola yaroqsiz yoki arizalar yopiq.",
    hiringNow: "Shoshilinch",
    problem: "Rol vazifasi",
    mustHave: "Majburiy",
    trainable: "Oʻrgatamiz",
    docs: "Kerakli hujjatlar",
    questions: "Ariza savollari",
    stages: "Tanlov bosqichlari",
    probation: "Muvaffaqiyatli sinov muddati",
    apply: "Ariza berish",
    poweredBy: "Ishlaydi",
  },
  id: {
    notFoundTitle: "Lowongan tidak tersedia",
    notFoundText: "Tautan tidak valid, atau lamaran ditutup.",
    hiringNow: "Butuh cepat",
    problem: "Tugas peran",
    mustHave: "Wajib",
    trainable: "Bisa dilatih",
    docs: "Dokumen yang diperlukan",
    questions: "Pertanyaan lamaran",
    stages: "Tahap seleksi",
    probation: "Masa percobaan yang berhasil",
    apply: "Lamar",
    poweredBy: "Didukung oleh",
  },
} as const;

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen px-4 py-8 sm:py-12">
      <div className="mx-auto w-full max-w-xl">{children}</div>
    </main>
  );
}

function List({ title, items }: { title: string; items?: string[] }) {
  if (!items || items.length === 0) return null;
  return (
    <div className="mt-4">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
        {title}
      </h2>
      <ul className="mt-1 list-disc pl-5 text-sm text-slate-700">
        {items.map((x, i) => (
          <li key={i}>{x}</li>
        ))}
      </ul>
    </div>
  );
}

export default async function PublicVacancyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const locale = await getLocale();
  const t = M[locale];
  const { slug } = await params;

  const supabase = await getSupabaseServer();
  const { data } = await supabase
    .from("vacancies")
    .select("*")
    .eq("slug", slug)
    .eq("status", "active")
    .maybeSingle();
  const vacancy = data as Vacancy | null;

  if (!vacancy) {
    return (
      <Shell>
        <div className="card text-center">
          <div className="mb-2 text-3xl">🔍</div>
          <h1 className="text-lg font-semibold">{t.notFoundTitle}</h1>
          <p className="mt-1 text-sm text-slate-500">{t.notFoundText}</p>
        </div>
      </Shell>
    );
  }

  const reqDocs = (vacancy.required_documents ?? []).map((d) =>
    d.label?.trim() ? d.label : docTypeLabel(locale, d.type)
  );
  const questions = (vacancy.screening_questions ?? []).map((q) => q.question);

  return (
    <Shell>
      <div className="card">
        <div className="flex items-start gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-100 text-base font-semibold text-brand-700">
            {initials(vacancy.company_name)}
          </div>
          <div className="min-w-0">
            <p className="text-sm text-slate-500">{vacancy.company_name}</p>
            <h1 className="text-xl font-semibold leading-tight">{vacancy.title}</h1>
            {vacancy.location && (
              <p className="mt-0.5 text-sm text-slate-500">📍 {vacancy.location}</p>
            )}
          </div>
        </div>

        {(vacancy.salary_range || vacancy.schedule || vacancy.urgency === "hiring_now") && (
          <div className="mt-3 flex flex-wrap gap-2">
            {vacancy.urgency === "hiring_now" && (
              <span className="rounded-full bg-brand-500 px-2.5 py-1 text-xs font-medium text-white">
                🔥 {t.hiringNow}
              </span>
            )}
            {vacancy.salary_range && (
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-700">
                💰 {vacancy.salary_range}
              </span>
            )}
            {vacancy.schedule && (
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-700">
                {vacancy.schedule}
              </span>
            )}
          </div>
        )}

        <VacancyDescription description={vacancy.description} className="mt-4 space-y-3" />

        {vacancy.problem_statement && (
          <div className="mt-4">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              {t.problem}
            </h2>
            <p className="mt-1 whitespace-pre-wrap text-sm text-slate-700">
              {vacancy.problem_statement}
            </p>
          </div>
        )}
        <List title={t.mustHave} items={vacancy.must_have} />
        <List title={t.trainable} items={vacancy.trainable} />
        <List title={t.docs} items={reqDocs} />
        <List title={t.questions} items={questions} />
        {vacancy.success_criteria_probation && (
          <div className="mt-4">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              {t.probation}
            </h2>
            <p className="mt-1 whitespace-pre-wrap text-sm text-slate-700">
              {vacancy.success_criteria_probation}
            </p>
          </div>
        )}
      </div>

      <div className="mt-4">
        <Link href={`/apply/${vacancy.slug}`} className="btn-primary block text-center">
          {t.apply}
        </Link>
      </div>

      <footer className="mt-6 text-center text-xs text-slate-400">
        {t.poweredBy}{" "}
        <Link href="/" className="font-medium text-brand-600 hover:underline">
          doki.help
        </Link>
      </footer>
    </Shell>
  );
}

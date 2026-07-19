import type { Metadata } from "next";
import Link from "next/link";
import { getSupabaseServer } from "@/lib/supabase/server";
import { getPublicHiringLocale } from "@/lib/i18n";
import {
  filterApplicationStageDocuments,
  type Vacancy,
} from "@/lib/career";
import VacancyDescription from "@/components/VacancyDescription";
import ApplyForm from "./ApplyForm";

// Apply-страница раздаётся прямой ссылкой (WhatsApp/QR), не через поиск — но
// нужен корректный OG-превью, когда ссылку кидают в WhatsApp (ТЗ F1).
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const noindex = { robots: { index: false, follow: false } } as const;
  const { slug } = await params;
  const locale = await getPublicHiringLocale();
  const supabase = await getSupabaseServer();
  const { data } = await supabase
    .from("vacancies")
    .select("title, company_name")
    .eq("slug", slug)
    .eq("status", "active")
    .maybeSingle();
  const v = data as { title?: string; company_name?: string } | null;
  if (!v) return noindex;
  const company = v.company_name || "doki.help";
  const og = {
    en: { t: `${v.title} — ${company}`, d: `${company} is hiring. Apply and send your documents in one link.` },
    id: { t: `${v.title} — ${company}`, d: `${company} sedang merekrut. Lamar dan kirim dokumen Anda dalam satu tautan.` },
  }[locale];
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://doki.help";
  return {
    title: og.t,
    description: og.d,
    ...noindex,
    openGraph: { title: og.t, description: og.d, url: `${appUrl}/apply/${slug}` },
  };
}

const M = {
  en: {
    notFoundTitle: "Vacancy not available",
    notFoundText:
      "This vacancy link is invalid, or the position is no longer accepting applications.",
    hiringNow: "Hiring now",
    salary: "Salary",
    poweredBy: "Powered by",
    home: "doki.help",
  },
  id: {
    notFoundTitle: "Lowongan tidak tersedia",
    notFoundText:
      "Tautan lowongan ini tidak valid, atau posisi ini sudah tidak menerima lamaran.",
    hiringNow: "Butuh cepat",
    salary: "Gaji",
    poweredBy: "Didukung oleh",
    home: "doki.help",
  },
  ru: {
    notFoundTitle: "Вакансия недоступна",
    notFoundText:
      "Ссылка на вакансию недействительна или приём откликов закрыт.",
    hiringNow: "Срочный набор",
    salary: "Зарплата",
    poweredBy: "Работает на",
    home: "doki.help",
  },
  uz: {
    notFoundTitle: "Vakansiya mavjud emas",
    notFoundText:
      "Vakansiya havolasi yaroqsiz yoki arizalar qabul qilinmayapti.",
    hiringNow: "Shoshilinch",
    salary: "Maosh",
    poweredBy: "Ishlaydi",
    home: "doki.help",
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

export default async function ApplyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const locale = await getPublicHiringLocale();
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

  // Doc-reuse: если кандидат залогинен на doki.help — предзаполним данные из
  // резюме и предложим прикрепить документы из его сейфа (RLS отдаёт только
  // его собственные).
  const {
    data: { user },
  } = await supabase.auth.getUser();
  let vaultDocs: { id: string; title: string; category: string }[] = [];
  let prefill: { fullName: string; whatsapp: string; email: string } | null = null;
  if (user) {
    const [{ data: docs }, { data: resume }] = await Promise.all([
      supabase.from("documents").select("id, title, category, document_files(id)"),
      supabase
        .from("resumes")
        .select("full_name, contact, email")
        .eq("user_id", user.id)
        .maybeSingle(),
    ]);
    vaultDocs = ((docs ?? []) as { id: string; title: string; category: string; document_files: unknown[] }[])
      .filter((d) => (d.document_files?.length ?? 0) > 0)
      .map((d) => ({ id: d.id, title: d.title, category: d.category }));
    prefill = {
      fullName: resume?.full_name ?? "",
      whatsapp: resume?.contact ?? "",
      email: resume?.email ?? user.email ?? "",
    };
  }

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

  const tags: string[] = [];
  if (vacancy.schedule) tags.push(vacancy.schedule);

  return (
    <Shell>
      {/* Read-only vacancy header */}
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

        {(vacancy.salary_range || tags.length || vacancy.urgency === "hiring_now") && (
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
            {tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-700"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        <VacancyDescription description={vacancy.description} className="mt-4 space-y-3" />
      </div>

      {/* Application form */}
      <div className="mt-4">
        <ApplyForm
          locale={locale}
          vacancyId={vacancy.id}
          slug={vacancy.slug}
          companyName={vacancy.company_name}
          requiredDocuments={filterApplicationStageDocuments(vacancy.required_documents)}
          screeningQuestions={vacancy.screening_questions ?? []}
          videoScreening={vacancy.video_screening ?? "off"}
          videoQuestion={vacancy.video_question ?? null}
          vaultDocs={vaultDocs}
          prefill={prefill}
        />
      </div>

      <footer className="mt-6 text-center text-xs text-slate-400">
        {t.poweredBy}{" "}
        <Link href="/" className="font-medium text-brand-600 hover:underline">
          {t.home}
        </Link>
      </footer>
    </Shell>
  );
}

import Link from "next/link";
import { notFound } from "next/navigation";
import { getSupabaseServer } from "@/lib/supabase/server";
import { getUser } from "@/lib/queries";
import { getLocale } from "@/lib/i18n";
import {
  type Employment,
  employmentTypeLabel,
  employmentStatusLabel,
  formatPeriod,
} from "@/lib/employment";
import type { OnboardingTask } from "@/lib/onboarding";
import EditEmploymentForm from "./EditEmploymentForm";
import OnboardingProgress from "./OnboardingProgress";

const M = {
  ru: {
    back: "← К трудовым отношениям",
    company: "Компания",
    position: "Должность",
    type: "Тип занятости",
    period: "Период",
    status: "Статус",
    source: "Источник",
    fromEmployer: "Оформлено работодателем",
    manual: "Добавлено вами",
    readonly: "Эту запись оформил работодатель — она недоступна для правки здесь.",
  },
  en: {
    back: "← Back to employment",
    company: "Company",
    position: "Position",
    type: "Employment type",
    period: "Period",
    status: "Status",
    source: "Source",
    fromEmployer: "Onboarded by employer",
    manual: "Added by you",
    readonly: "This record was created by the employer — it can't be edited here.",
  },
  id: {
    back: "← Kembali",
    company: "Perusahaan",
    position: "Posisi",
    type: "Jenis kerja",
    period: "Periode",
    status: "Status",
    source: "Sumber",
    fromEmployer: "Diproses perusahaan",
    manual: "Ditambahkan oleh Anda",
    readonly: "Catatan ini dibuat perusahaan — tidak bisa diubah di sini.",
  },
  uz: {
    back: "← Ortga",
    company: "Kompaniya",
    position: "Lavozim",
    type: "Bandlik turi",
    period: "Davr",
    status: "Holat",
    source: "Manba",
    fromEmployer: "Ish beruvchi rasmiylashtirgan",
    manual: "Siz qoʻshgansiz",
    readonly: "Bu yozuvni ish beruvchi yaratgan — bu yerda tahrirlab boʻlmaydi.",
  },
} as const;

export default async function EmploymentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const locale = await getLocale();
  const t = M[locale];
  const { id } = await params;
  const user = await getUser();
  const supabase = await getSupabaseServer();

  const { data } = await supabase
    .from("employments")
    .select("*")
    .eq("id", id)
    .eq("employee_user_id", user!.id)
    .maybeSingle();
  const emp = data as Employment | null;
  if (!emp) notFound();

  // Онбординг (read-only проекция для человека) — только для записей от
  // работодателя (у ручных онбординга нет).
  let onboardingTasks: OnboardingTask[] = [];
  if (!emp.manual) {
    const { data: onbData } = await supabase
      .from("onboarding_tasks")
      .select("*")
      .eq("employment_id", emp.id)
      .order("sort", { ascending: true });
    onboardingTasks = (onbData ?? []) as OnboardingTask[];
  }
  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <Link href="/my/employment" className="text-sm text-slate-500 hover:underline">
          {t.back}
        </Link>
        <h1 className="mt-2 text-2xl font-semibold">{emp.position}</h1>
        <p className="text-sm text-slate-500">{emp.company_name}</p>
      </div>

      <section className="card">
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between gap-3">
            <dt className="text-slate-400">{t.type}</dt>
            <dd>{employmentTypeLabel(locale, emp.employment_type)}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-slate-400">{t.period}</dt>
            <dd>{formatPeriod(locale, emp.start_date, emp.end_date)}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-slate-400">{t.status}</dt>
            <dd>{employmentStatusLabel(locale, emp.status)}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-slate-400">{t.source}</dt>
            <dd>{emp.manual ? t.manual : t.fromEmployer}</dd>
          </div>
        </dl>
      </section>

      {emp.manual ? (
        <EditEmploymentForm locale={locale} employment={emp} />
      ) : (
        <p className="rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-500">
          {t.readonly}
        </p>
      )}

      {!emp.manual && (
        <OnboardingProgress
          locale={locale}
          startDate={emp.start_date}
          today={today}
          tasks={onboardingTasks}
        />
      )}
    </div>
  );
}

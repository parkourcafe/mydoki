import Link from "next/link";
import { notFound, redirect } from "next/navigation";
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
import { type EmploymentDocument, expiryStatus } from "@/lib/employmentDocs";
import type { Amendment } from "@/lib/amendments";
import EmployeeEditForm from "./EmployeeEditForm";
import OnboardingManager from "./OnboardingManager";
import EmploymentDocs from "./EmploymentDocs";
import AmendmentsManager from "./AmendmentsManager";
import ProcessGuideHint from "@/components/ProcessGuideHint";

const M = {
  ru: {
    back: "← К сотрудникам",
    type: "Тип занятости",
    period: "Период",
    status: "Статус",
    source: "Источник",
    fromApplication: "Из отклика",
    openApplication: "Открыть отклик →",
    manual: "Добавлено человеком",
    compensation: "Оплата",
    review: "Плановый пересмотр",
    reviewSoon: "скоро",
  },
  en: {
    back: "← Back to employees",
    type: "Employment type",
    period: "Period",
    status: "Status",
    source: "Source",
    fromApplication: "From application",
    openApplication: "Open application →",
    manual: "Added by the person",
    compensation: "Compensation",
    review: "Next review",
    reviewSoon: "soon",
  },
  id: {
    back: "← Kembali ke karyawan",
    type: "Jenis kerja",
    period: "Periode",
    status: "Status",
    source: "Sumber",
    fromApplication: "Dari lamaran",
    openApplication: "Buka lamaran →",
    manual: "Ditambahkan oleh orangnya",
    compensation: "Kompensasi",
    review: "Tinjauan berikutnya",
    reviewSoon: "segera",
  },
  uz: {
    back: "← Xodimlarga",
    type: "Bandlik turi",
    period: "Davr",
    status: "Holat",
    source: "Manba",
    fromApplication: "Arizadan",
    openApplication: "Arizani ochish →",
    manual: "Shaxs qoʻshgan",
    compensation: "To‘lov",
    review: "Keyingi ko‘rib chiqish",
    reviewSoon: "tez orada",
  },
} as const;

export default async function EmployeeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const locale = await getLocale();
  const t = M[locale];
  const { id } = await params;
  const user = await getUser();
  const supabase = await getSupabaseServer();

  const { data: profile } = await supabase
    .from("employer_profiles")
    .select("id")
    .eq("user_id", user!.id)
    .maybeSingle();
  if (!profile) redirect("/employer");

  const { data } = await supabase
    .from("employments")
    .select("*")
    .eq("id", id)
    .eq("company_id", profile.id)
    .maybeSingle();
  const emp = data as Employment | null;
  if (!emp) notFound();

  // Имя сотрудника из отклика (RLS пускает работодателя к своим откликам).
  let name = "";
  if (emp.application_id) {
    const { data: appRow } = await supabase
      .from("applications")
      .select("full_name")
      .eq("id", emp.application_id)
      .maybeSingle();
    name = (appRow?.full_name as string) ?? "";
  }

  const [{ data: onbData }, { data: edData }, { data: amData }] = await Promise.all([
    supabase
      .from("onboarding_tasks")
      .select("*")
      .eq("employment_id", emp.id)
      .order("sort", { ascending: true }),
    supabase
      .from("employment_documents")
      .select("*")
      .eq("employment_id", emp.id)
      .order("uploaded_at", { ascending: false }),
    supabase
      .from("employment_amendments")
      .select("*")
      .eq("employment_id", emp.id)
      .order("created_at", { ascending: false }),
  ]);
  const onboardingTasks = (onbData ?? []) as OnboardingTask[];
  const employmentDocs = (edData ?? []) as EmploymentDocument[];
  const amendments = (amData ?? []) as Amendment[];
  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="space-y-6">
      <div>
        <Link href="/employer/employees" className="text-sm text-slate-500 hover:underline">
          {t.back}
        </Link>
        <h1 className="mt-2 text-2xl font-semibold">{name || emp.position}</h1>
        {name && <p className="text-sm text-slate-500">{emp.position}</p>}
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
          {emp.compensation && (
            <div className="flex justify-between gap-3">
              <dt className="text-slate-400">{t.compensation}</dt>
              <dd>{emp.compensation}</dd>
            </div>
          )}
          {emp.next_review_date && (
            <div className="flex justify-between gap-3">
              <dt className="text-slate-400">{t.review}</dt>
              <dd className="flex items-center gap-2">
                {emp.next_review_date}
                {(() => {
                  const st = expiryStatus(emp.next_review_date, today);
                  return st === "soon" || st === "expired" ? (
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                      {t.reviewSoon}
                    </span>
                  ) : null;
                })()}
              </dd>
            </div>
          )}
          <div className="flex justify-between gap-3">
            <dt className="text-slate-400">{t.status}</dt>
            <dd>{employmentStatusLabel(locale, emp.status)}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-slate-400">{t.source}</dt>
            <dd>{emp.manual ? t.manual : t.fromApplication}</dd>
          </div>
        </dl>
        {emp.application_id && (
          <Link
            href={`/employer/candidates/${emp.application_id}`}
            className="mt-3 inline-block text-sm text-brand-600 hover:underline"
          >
            {t.openApplication}
          </Link>
        )}
      </section>

      <EmployeeEditForm locale={locale} employment={emp} />

      <OnboardingManager
        locale={locale}
        employmentId={emp.id}
        startDate={emp.start_date}
        today={today}
        tasks={onboardingTasks}
      />

      <AmendmentsManager
        locale={locale}
        employmentId={emp.id}
        amendments={amendments}
      />

      <ProcessGuideHint locale={locale} context="amendment" />


      <EmploymentDocs
        locale={locale}
        employmentId={emp.id}
        today={today}
        docs={employmentDocs}
        canManage
      />
    </div>
  );
}

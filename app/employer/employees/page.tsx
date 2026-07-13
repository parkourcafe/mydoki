import Link from "next/link";
import { getSupabaseServer } from "@/lib/supabase/server";
import { getUser } from "@/lib/queries";
import { getLocale, type Locale } from "@/lib/i18n";
import {
  type Employment,
  employmentTypeLabel,
  employmentStatusLabel,
  formatPeriod,
} from "@/lib/employment";

const M = {
  ru: {
    title: "Сотрудники",
    subtitle: "Оформленные сотрудники компании. Оформление доступно на карточке нанятого кандидата.",
    noProfile: "Сначала настроим вашу компанию.",
    setup: "Настроить компанию",
    empty: "Пока нет оформленных сотрудников. Оформите нанятого кандидата на его карточке.",
    open: "Открыть →",
  },
  en: {
    title: "Employees",
    subtitle: "People onboarded at your company. Onboard from a hired candidate's card.",
    noProfile: "Let's set up your company first.",
    setup: "Set up company",
    empty: "No employees yet. Onboard a hired candidate from their card.",
    open: "Open →",
  },
  id: {
    title: "Karyawan",
    subtitle: "Orang yang diproses di perusahaan Anda. Proses dari kartu kandidat yang diterima.",
    noProfile: "Siapkan perusahaan Anda dulu.",
    setup: "Siapkan perusahaan",
    empty: "Belum ada karyawan. Proses kandidat yang diterima dari kartunya.",
    open: "Buka →",
  },
  uz: {
    title: "Xodimlar",
    subtitle: "Kompaniyangizda rasmiylashtirilgan xodimlar. Qabul qilingan nomzod kartasidan rasmiylashtiring.",
    noProfile: "Avval kompaniyangizni sozlaymiz.",
    setup: "Kompaniyani sozlash",
    empty: "Hozircha xodim yoʻq. Qabul qilingan nomzodni kartasidan rasmiylashtiring.",
    open: "Ochish →",
  },
} as const;

export default async function EmployeesPage() {
  const locale: Locale = await getLocale();
  const t = M[locale];
  const user = await getUser();
  const supabase = await getSupabaseServer();

  const { data: profile } = await supabase
    .from("employer_profiles")
    .select("id")
    .eq("user_id", user!.id)
    .maybeSingle();

  if (!profile) {
    return (
      <div className="card text-center">
        <div className="mb-2 text-3xl">🏢</div>
        <p className="text-sm text-slate-600">{t.noProfile}</p>
        <Link href="/employer/vacancies/new" className="btn-primary mt-4">
          {t.setup}
        </Link>
      </div>
    );
  }

  const { data } = await supabase
    .from("employments")
    .select("*")
    .eq("company_id", profile.id)
    .order("status", { ascending: true })
    .order("start_date", { ascending: false, nullsFirst: false });
  const items = (data ?? []) as Employment[];

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-2xl font-semibold">{t.title}</h1>
        <p className="mt-1 text-sm text-slate-500">{t.subtitle}</p>
      </div>

      {items.length === 0 ? (
        <div className="card text-center">
          <p className="text-sm text-slate-600">{t.empty}</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {items.map((e) => (
            <li key={e.id}>
              <Link
                href={`/employer/employees/${e.id}`}
                className="card flex items-center justify-between gap-3 hover:shadow-md"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium">{e.position}</p>
                  <p className="mt-1 text-xs text-slate-400">
                    {employmentTypeLabel(locale, e.employment_type)} ·{" "}
                    {formatPeriod(locale, e.start_date, e.end_date)}
                  </p>
                </div>
                <span
                  className={
                    "shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium " +
                    (e.status === "active"
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-slate-100 text-slate-500")
                  }
                >
                  {employmentStatusLabel(locale, e.status)}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

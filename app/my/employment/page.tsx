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
import AddEmploymentForm from "./AddEmploymentForm";

const M = {
  ru: {
    title: "Мои трудовые отношения",
    subtitle:
      "Где вы работаете и работали. Записи от работодателей на Doki появляются автоматически; остальное можно добавить самому.",
    empty: "Пока нет записей. Добавьте своё место работы вручную или дождитесь оформления от работодателя.",
    fromEmployer: "От работодателя",
    manual: "Ручная",
    open: "Открыть →",
  },
  en: {
    title: "My employment",
    subtitle:
      "Where you work and worked. Records from employers on Doki appear automatically; add the rest yourself.",
    empty: "No records yet. Add a workplace manually or wait to be onboarded by an employer.",
    fromEmployer: "From employer",
    manual: "Manual",
    open: "Open →",
  },
  id: {
    title: "Hubungan kerja saya",
    subtitle:
      "Di mana Anda bekerja dan pernah bekerja. Catatan dari perusahaan di Doki muncul otomatis; sisanya tambahkan sendiri.",
    empty: "Belum ada catatan. Tambahkan tempat kerja manual atau tunggu diproses perusahaan.",
    fromEmployer: "Dari perusahaan",
    manual: "Manual",
    open: "Buka →",
  },
  uz: {
    title: "Mening mehnat munosabatlarim",
    subtitle:
      "Qayerda ishlaysiz va ishlagansiz. Doki'dagi ish beruvchilar yozuvi avtomatik chiqadi; qolganini oʻzingiz qoʻshing.",
    empty: "Hozircha yozuv yoʻq. Ish joyini qoʻlda qoʻshing yoki ish beruvchi rasmiylashtirishini kuting.",
    fromEmployer: "Ish beruvchidan",
    manual: "Qoʻlda",
    open: "Ochish →",
  },
} as const;

export default async function MyEmploymentPage() {
  const locale: Locale = await getLocale();
  const t = M[locale];
  const user = await getUser();
  const supabase = await getSupabaseServer();

  const { data } = await supabase
    .from("employments")
    .select("*")
    .eq("employee_user_id", user!.id)
    .order("start_date", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });
  const items = (data ?? []) as Employment[];

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-5">
        <h1 className="text-2xl font-semibold">{t.title}</h1>
        <p className="mt-1 text-sm text-slate-500">{t.subtitle}</p>
      </div>

      <div className="mb-4">
        <AddEmploymentForm locale={locale} />
      </div>

      {items.length === 0 ? (
        <p className="rounded-lg border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-500">
          {t.empty}
        </p>
      ) : (
        <ul className="space-y-3">
          {items.map((e) => (
            <li key={e.id}>
              <Link
                href={`/my/employment/${e.id}`}
                className="card flex items-center justify-between gap-3 hover:shadow-md"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium">{e.position}</p>
                  <p className="truncate text-sm text-slate-500">{e.company_name}</p>
                  <p className="mt-1 text-xs text-slate-400">
                    {employmentTypeLabel(locale, e.employment_type)} ·{" "}
                    {formatPeriod(locale, e.start_date, e.end_date)}
                  </p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <span
                    className={
                      "rounded-full px-2.5 py-0.5 text-xs font-medium " +
                      (e.status === "active"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-slate-100 text-slate-500")
                    }
                  >
                    {employmentStatusLabel(locale, e.status)}
                  </span>
                  <span className="text-xs text-slate-400">
                    {e.manual ? t.manual : t.fromEmployer}
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

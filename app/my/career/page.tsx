import Link from "next/link";
import { redirect } from "next/navigation";
import { getSupabaseServer } from "@/lib/supabase/server";
import { getUser } from "@/lib/queries";
import { getLocale, type Locale } from "@/lib/i18n";
import {
  type Employment,
  employmentTypeLabel,
  formatPeriod,
} from "@/lib/employment";
import { linkedEmploymentIds, parseSections } from "@/lib/resume";
import AddToResume from "./AddToResume";
import {
  splitCurrentArchive,
  sortByStartDesc,
  totalExperienceMonths,
  employmentDurationMonths,
  formatDuration,
} from "@/lib/careerTimeline";

const M = {
  ru: {
    title: "Карьерный таймлайн",
    subtitle: "Ваша профессиональная история из всех трудовых отношений — от работодателей и добавленных вами. Она принадлежит вам.",
    total: "Суммарный опыт",
    current: "Текущие",
    archive: "Архив",
    empty: "Пока нет записей. Они появятся из оформлений и добавленных вами мест работы.",
    emptyCta: "Добавить место работы →",
    fromEmployer: "От работодателя",
    manual: "Ручная",
    open: "Открыть →",
    approx: "ориентировочно",
    resumeHint: "Записи от работодателя можно добавить в резюме — там они получат отметку «подтверждено».",
  },
  en: {
    title: "Career timeline",
    subtitle: "Your professional history across all employment — from employers and self-added. It belongs to you.",
    total: "Total experience",
    current: "Current",
    archive: "Archive",
    empty: "No records yet. They appear from onboarding and workplaces you add.",
    emptyCta: "Add a workplace →",
    fromEmployer: "From employer",
    manual: "Manual",
    open: "Open →",
    approx: "approx.",
    resumeHint: "Employer records can be added to your resume, where they carry a \u00abverified\u00bb mark.",
  },
  id: {
    title: "Linimasa karier",
    subtitle: "Riwayat profesional Anda dari semua hubungan kerja — dari perusahaan dan yang Anda tambahkan. Milik Anda.",
    total: "Total pengalaman",
    current: "Saat ini",
    archive: "Arsip",
    empty: "Belum ada catatan. Muncul dari proses dan tempat kerja yang Anda tambahkan.",
    emptyCta: "Tambah tempat kerja →",
    fromEmployer: "Dari perusahaan",
    manual: "Manual",
    open: "Buka →",
    approx: "perkiraan",
    resumeHint: "Catatan dari perusahaan bisa ditambahkan ke resume dan mendapat tanda \u00abterverifikasi\u00bb.",
  },
  uz: {
    title: "Karyera tarixi",
    subtitle: "Barcha mehnat munosabatlaridan professional tarixingiz — ish beruvchilardan va o‘zingiz qo‘shganlardan. U sizniki.",
    total: "Umumiy tajriba",
    current: "Joriy",
    archive: "Arxiv",
    empty: "Hozircha yozuv yo‘q. Rasmiylashtirish va qo‘shgan ish joylaringizdan paydo bo‘ladi.",
    emptyCta: "Ish joyi qo‘shish →",
    fromEmployer: "Ish beruvchidan",
    manual: "Qo‘lda",
    open: "Ochish →",
    approx: "taxminan",
    resumeHint: "Ish beruvchi yozuvlarini rezyumega qo‘shsangiz bo‘ladi — u yerda «tasdiqlangan» belgisi bo‘ladi.",
  },
} as const;

function Entry({
  e,
  locale,
  today,
  labels,
  linked,
}: {
  e: Employment;
  locale: Locale;
  today: string;
  labels: (typeof M)[Locale];
  linked: boolean;
}) {
  const months = employmentDurationMonths(e.start_date, e.end_date, today);
  return (
    <li className="card flex items-center justify-between gap-3">
      <Link href={`/my/employment/${e.id}`} className="min-w-0 flex-1">
        <p className="truncate font-medium">{e.position}</p>
        <p className="truncate text-sm text-slate-500">{e.company_name}</p>
        <p className="mt-1 text-xs text-slate-400">
          {employmentTypeLabel(locale, e.employment_type)} ·{" "}
          {formatPeriod(locale, e.start_date, e.end_date)} · {formatDuration(months, locale)}
        </p>
      </Link>
      <div className="flex shrink-0 flex-col items-end gap-1.5">
        <span className="text-xs text-slate-400">
          {e.manual ? labels.manual : labels.fromEmployer}
        </span>
        <AddToResume locale={locale} employmentId={e.id} linked={linked} />
      </div>
    </li>
  );
}

export default async function CareerTimelinePage() {
  const locale: Locale = await getLocale();
  const t = M[locale];
  const user = await getUser();
  if (!user) redirect("/login");
  const supabase = await getSupabaseServer();
  const today = new Date().toISOString().slice(0, 10);

  const [{ data }, { data: resumeRow }] = await Promise.all([
    supabase.from("employments").select("*").eq("employee_user_id", user.id),
    supabase.from("resumes").select("sections").eq("user_id", user.id).maybeSingle(),
  ]);
  const items = sortByStartDesc((data ?? []) as Employment[]);
  // Что уже перенесено в резюме — чтобы не предлагать добавить повторно.
  const linkedIds = new Set(
    linkedEmploymentIds(parseSections((resumeRow as { sections?: unknown } | null)?.sections))
  );
  const { current, archive } = splitCurrentArchive(items);
  const totalMonths = totalExperienceMonths(items, today);

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-4">
        <h1 className="text-2xl font-semibold">{t.title}</h1>
        <p className="mt-1 text-sm text-slate-500">{t.subtitle}</p>
        <p className="mt-1 text-xs text-slate-400">{t.resumeHint}</p>
      </div>

      {items.length === 0 ? (
        <Link
          href="/my/employment"
          className="block rounded-2xl border border-brand-200 bg-brand-50/60 p-6 text-center transition hover:bg-brand-50"
        >
          <p className="text-sm text-slate-600">{t.empty}</p>
          <span className="mt-2 inline-block text-sm font-medium text-brand-700">
            {t.emptyCta}
          </span>
        </Link>
      ) : (
        <>
          <div className="mb-5 rounded-lg bg-[#f0e6d9] px-4 py-3 text-sm text-[#2c2522]">
            <span className="text-slate-500">{t.total}:</span>{" "}
            <span className="font-semibold">{formatDuration(totalMonths, locale)}</span>{" "}
            <span className="text-xs text-slate-500">({t.approx})</span>
          </div>

          {current.length > 0 && (
            <div className="mb-6">
              <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
                {t.current}
              </h2>
              <ul className="space-y-3">
                {current.map((e) => (
                  <Entry
                    key={e.id}
                    e={e}
                    locale={locale}
                    today={today}
                    labels={t}
                    linked={linkedIds.has(e.id)}
                  />
                ))}
              </ul>
            </div>
          )}

          {archive.length > 0 && (
            <div>
              <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
                {t.archive}
              </h2>
              <ul className="space-y-3">
                {archive.map((e) => (
                  <Entry
                    key={e.id}
                    e={e}
                    locale={locale}
                    today={today}
                    labels={t}
                    linked={linkedIds.has(e.id)}
                  />
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  );
}

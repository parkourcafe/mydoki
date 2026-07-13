import Link from "next/link";
import { getSupabaseServer } from "@/lib/supabase/server";
import { getUser } from "@/lib/queries";
import { getLocale, type Locale } from "@/lib/i18n";
import {
  type Employment,
  employmentTypeLabel,
  formatPeriod,
} from "@/lib/employment";
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
    fromEmployer: "От работодателя",
    manual: "Ручная",
    open: "Открыть →",
    approx: "ориентировочно",
  },
  en: {
    title: "Career timeline",
    subtitle: "Your professional history across all employment — from employers and self-added. It belongs to you.",
    total: "Total experience",
    current: "Current",
    archive: "Archive",
    empty: "No records yet. They appear from onboarding and workplaces you add.",
    fromEmployer: "From employer",
    manual: "Manual",
    open: "Open →",
    approx: "approx.",
  },
  id: {
    title: "Linimasa karier",
    subtitle: "Riwayat profesional Anda dari semua hubungan kerja — dari perusahaan dan yang Anda tambahkan. Milik Anda.",
    total: "Total pengalaman",
    current: "Saat ini",
    archive: "Arsip",
    empty: "Belum ada catatan. Muncul dari proses dan tempat kerja yang Anda tambahkan.",
    fromEmployer: "Dari perusahaan",
    manual: "Manual",
    open: "Buka →",
    approx: "perkiraan",
  },
  uz: {
    title: "Karyera tarixi",
    subtitle: "Barcha mehnat munosabatlaridan professional tarixingiz — ish beruvchilardan va o‘zingiz qo‘shganlardan. U sizniki.",
    total: "Umumiy tajriba",
    current: "Joriy",
    archive: "Arxiv",
    empty: "Hozircha yozuv yo‘q. Rasmiylashtirish va qo‘shgan ish joylaringizdan paydo bo‘ladi.",
    fromEmployer: "Ish beruvchidan",
    manual: "Qo‘lda",
    open: "Ochish →",
    approx: "taxminan",
  },
} as const;

function Entry({
  e,
  locale,
  today,
  labels,
}: {
  e: Employment;
  locale: Locale;
  today: string;
  labels: (typeof M)[Locale];
}) {
  const months = employmentDurationMonths(e.start_date, e.end_date, today);
  return (
    <li>
      <Link
        href={`/my/employment/${e.id}`}
        className="card flex items-center justify-between gap-3 hover:shadow-md"
      >
        <div className="min-w-0">
          <p className="truncate font-medium">{e.position}</p>
          <p className="truncate text-sm text-slate-500">{e.company_name}</p>
          <p className="mt-1 text-xs text-slate-400">
            {employmentTypeLabel(locale, e.employment_type)} ·{" "}
            {formatPeriod(locale, e.start_date, e.end_date)} · {formatDuration(months, locale)}
          </p>
        </div>
        <span className="shrink-0 text-xs text-slate-400">
          {e.manual ? labels.manual : labels.fromEmployer}
        </span>
      </Link>
    </li>
  );
}

export default async function CareerTimelinePage() {
  const locale: Locale = await getLocale();
  const t = M[locale];
  const user = await getUser();
  const supabase = await getSupabaseServer();
  const today = new Date().toISOString().slice(0, 10);

  const { data } = await supabase
    .from("employments")
    .select("*")
    .eq("employee_user_id", user!.id);
  const items = sortByStartDesc((data ?? []) as Employment[]);
  const { current, archive } = splitCurrentArchive(items);
  const totalMonths = totalExperienceMonths(items, today);

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-4">
        <h1 className="text-2xl font-semibold">{t.title}</h1>
        <p className="mt-1 text-sm text-slate-500">{t.subtitle}</p>
      </div>

      {items.length === 0 ? (
        <p className="rounded-lg border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-500">
          {t.empty}
        </p>
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
                  <Entry key={e.id} e={e} locale={locale} today={today} labels={t} />
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
                  <Entry key={e.id} e={e} locale={locale} today={today} labels={t} />
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  );
}

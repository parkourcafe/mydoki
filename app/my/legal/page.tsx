import { getSupabaseServer } from "@/lib/supabase/server";
import { getLocale, type Locale } from "@/lib/i18n";
import {
  type LegalTopic,
  LEGAL_JURISDICTION,
  HOW_TO_USE_SLUG,
  legalCategoryLabel,
  jurisdictionName,
  legalDisclaimer,
  specialistRouteText,
  howToUseText,
} from "@/lib/legal";

const M = {
  ru: {
    title: "Правовая информация",
    subtitle: "Справочные материалы по трудовым отношениям. Одна юрисдикция:",
    empty: "Материалы готовятся. Раздел наполняется курируемым контентом с указанием источника и даты.",
    source: "Источник", version: "Редакция", reviewed: "Сверено", specialist: "Помощь специалиста",
    disclaimerTitle: "Дисклеймер",
  },
  en: {
    title: "Legal information",
    subtitle: "Reference materials on employment. Single jurisdiction:",
    empty: "Materials are being prepared. This section is filled with curated content citing source and date.",
    source: "Source", version: "Version", reviewed: "Reviewed", specialist: "Specialist help",
    disclaimerTitle: "Disclaimer",
  },
  id: {
    title: "Informasi hukum",
    subtitle: "Materi rujukan tentang hubungan kerja. Satu yurisdiksi:",
    empty: "Materi sedang disiapkan. Bagian ini diisi konten kurasi dengan sumber dan tanggal.",
    source: "Sumber", version: "Versi", reviewed: "Ditinjau", specialist: "Bantuan spesialis",
    disclaimerTitle: "Disclaimer",
  },
  uz: {
    title: "Huquqiy ma'lumot",
    subtitle: "Mehnat munosabatlari bo‘yicha ma'lumot materiallari. Bitta yurisdiksiya:",
    empty: "Materiallar tayyorlanmoqda. Bo‘lim manba va sana ko‘rsatilgan kuratsiya kontenti bilan to‘ldiriladi.",
    source: "Manba", version: "Versiya", reviewed: "Tekshirilgan", specialist: "Mutaxassis yordami",
    disclaimerTitle: "Diskleymer",
  },
} as const;

export default async function LegalInfoPage() {
  const locale: Locale = await getLocale();
  const t = M[locale];
  const supabase = await getSupabaseServer();

  // RLS отдаёт только published; фильтруем по юрисдикции запуска.
  const { data } = await supabase
    .from("legal_topics")
    .select("*")
    .eq("jurisdiction", LEGAL_JURISDICTION)
    .order("sort", { ascending: true });
  const topics = (data ?? []) as LegalTopic[];

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-4">
        <h1 className="text-2xl font-semibold">{t.title}</h1>
        <p className="mt-1 text-sm text-slate-500">
          {t.subtitle} <span className="font-medium">{jurisdictionName(locale)}</span>
        </p>
      </div>

      {/* Глобальный дисклеймер — всегда виден. */}
      <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
        <p className="font-medium">{t.disclaimerTitle}</p>
        <p className="mt-1">{legalDisclaimer(locale)}</p>
      </div>

      {topics.length === 0 ? (
        <p className="rounded-lg border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-500">
          {t.empty}
        </p>
      ) : (
        <ul className="space-y-3">
          {topics.map((topic) => (
            <li key={topic.id} className="card">
              <div className="flex items-start justify-between gap-3">
                <h2 className="font-medium">{topic.title}</h2>
                <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs text-slate-500">
                  {legalCategoryLabel(locale, topic.category)}
                </span>
              </div>
              {topic.slug === HOW_TO_USE_SLUG ? (
                <p className="mt-2 text-sm text-slate-700">{howToUseText(locale)}</p>
              ) : (
                topic.body && (
                  <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">{topic.body}</p>
                )
              )}
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-400">
                {topic.source && <span>{t.source}: {topic.source}</span>}
                {topic.source_version && <span>{t.version}: {topic.source_version}</span>}
                {topic.reviewed_at && <span>{t.reviewed}: {topic.reviewed_at}</span>}
              </div>
              {topic.disclaimer && (
                <p className="mt-2 text-xs text-slate-500">{topic.disclaimer}</p>
              )}
            </li>
          ))}
        </ul>
      )}

      {/* Маршрут к специалисту — всегда. */}
      <div className="mt-4 rounded-lg bg-[#f0e6d9] p-3 text-sm text-[#2c2522]">
        {specialistRouteText(locale)}
      </div>
    </div>
  );
}

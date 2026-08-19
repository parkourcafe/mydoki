"use client";

import type { Locale } from "@/lib/i18n";
import {
  coverageSentence,
  criterionLabel,
  criterionStateLabel,
  formatCriterionValue,
  type CriterionResult,
  type MatchExplanation,
} from "@/lib/matching";
import { provenanceLabel } from "@/lib/passport";

/**
 * Criterion-by-criterion объяснение (v1.2 §8.7).
 *
 * Здесь нет и не может быть процента совпадения, совокупного балла и
 * сортировки людей: показывается покрытие требований конкретной вакансии,
 * источник каждого факта и то, чего не хватает.
 */

const M = {
  ru: {
    required: "Обязательные критерии",
    optional: "Soft signals — контекст для решения, не рейтинг",
    empty: "Объяснение появится, когда будут заданы критерии вакансии.",
    notEvidence: "Это покрытие требований, а не внешняя проверка фактов.",
    source: "источник",
  },
  en: {
    required: "Required criteria",
    optional: "Soft signals — context for the decision, not a rating",
    empty: "The explanation appears once the vacancy criteria are set.",
    notEvidence: "This is requirement coverage, not external verification of facts.",
    source: "source",
  },
  id: {
    required: "Kriteria wajib",
    optional: "Soft signal — konteks untuk keputusan, bukan peringkat",
    empty: "Penjelasan muncul setelah kriteria lowongan diisi.",
    notEvidence: "Ini cakupan persyaratan, bukan verifikasi fakta oleh pihak luar.",
    source: "sumber",
  },
  uz: {
    required: "Majburiy mezonlar",
    optional: "Soft signal — qaror uchun kontekst, reyting emas",
    empty: "Tushuntirish vakansiya mezonlari kiritilgach paydo bo‘ladi.",
    notEvidence: "Bu talablar qamrovi, faktlarning tashqi tekshiruvi emas.",
    source: "manba",
  },
} as const;

const STATE_STYLE: Record<string, string> = {
  met: "bg-green-50 text-green-700",
  declared_conflict: "bg-red-50 text-red-700",
  unknown: "bg-slate-100 text-slate-600",
  unknown_stale: "bg-amber-50 text-amber-700",
  needs_verification: "bg-blue-50 text-blue-700",
  not_applicable: "bg-slate-50 text-slate-400",
};

function CriterionRow({ locale, result }: { locale: Locale; result: CriterionResult }) {
  const t = M[locale];
  const value =
    result.value.kind === "none" ? "—" : formatCriterionValue(locale, result.value);
  return (
    <li className="flex flex-wrap items-baseline gap-x-2 gap-y-1 border-b border-slate-100 py-2 last:border-0">
      <span className="min-w-40 text-sm font-medium text-slate-700">
        {criterionLabel(locale, result.key)}
      </span>
      <span className="text-sm text-slate-900">{value}</span>
      <span
        className={`rounded px-2 py-0.5 text-xs ${STATE_STYLE[result.state] ?? "bg-slate-100"}`}
      >
        {criterionStateLabel(locale, result.state)}
      </span>
      {result.state !== "unknown" && result.state !== "not_applicable" && (
        <span className="text-xs text-slate-500">
          {t.source}: {provenanceLabel(locale, result.source)}
        </span>
      )}
    </li>
  );
}

export default function MatchExplanationView({
  locale,
  explanation,
}: {
  locale: Locale;
  explanation: MatchExplanation | null;
}) {
  const t = M[locale];
  if (!explanation || explanation.criteria.length === 0) {
    return <p className="text-sm text-slate-500">{t.empty}</p>;
  }

  const hard = explanation.criteria.filter((c) => c.kind === "hard");
  const soft = explanation.criteria.filter(
    (c) => c.kind === "soft" && c.state !== "not_applicable",
  );

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium">{coverageSentence(locale, explanation)}</p>
      <ul className="rounded-lg border border-slate-200 px-3">
        {hard.map((result) => (
          <CriterionRow key={result.key} locale={locale} result={result} />
        ))}
      </ul>
      {soft.length > 0 && (
        <>
          <p className="text-sm text-slate-500">{t.optional}</p>
          <ul className="rounded-lg border border-slate-200 px-3">
            {soft.map((result) => (
              <CriterionRow key={result.key} locale={locale} result={result} />
            ))}
          </ul>
        </>
      )}
      <p className="text-xs text-slate-500">{t.notEvidence}</p>
    </div>
  );
}

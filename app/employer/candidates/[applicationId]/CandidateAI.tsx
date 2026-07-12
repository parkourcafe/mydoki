"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Locale } from "@/lib/i18n";
import { analyzeCandidate, reviewAiRun } from "@/app/employer/actions";

export type AiRunView = {
  id: string;
  kind: string;
  output: { missing?: { label: string }[]; provided?: { label: string }[]; complete?: boolean };
  groundings: { claim: string; source?: string | null; quote?: string | null }[];
  state: string;
  review_action: string | null;
  created_at: string;
};

const M = {
  ru: {
    title: "AI-анализ",
    hint: "AI-анализ требует проверки человеком и не влияет на решение автоматически.",
    analyze: "Проанализировать",
    running: "Анализ…",
    needsReview: "требует проверки",
    reviewed: "проверено",
    accept: "Принять",
    edit: "Редактировать",
    reject: "Отклонить",
    none: "Анализ ещё не запускался.",
    missing: "Не хватает документов",
    allComplete: "Комплект документов полный.",
    kinds: {
      completeness: "Комплектность",
      evidence_extraction: "Факты",
      consistency_check: "Несоответствия",
    } as Record<string, string>,
    empty: "Нет подтверждённых пунктов.",
  },
  en: {
    title: "AI analysis",
    hint: "AI analysis requires human review and does not affect the decision automatically.",
    analyze: "Analyze",
    running: "Analyzing…",
    needsReview: "needs review",
    reviewed: "reviewed",
    accept: "Accept",
    edit: "Edit",
    reject: "Reject",
    none: "Analysis has not been run yet.",
    missing: "Missing documents",
    allComplete: "Document set is complete.",
    kinds: {
      completeness: "Completeness",
      evidence_extraction: "Facts",
      consistency_check: "Mismatches",
    } as Record<string, string>,
    empty: "No supported items.",
  },
  uz: {
    title: "AI tahlil",
    hint: "AI tahlil inson tekshiruvini talab qiladi va qarorga avtomatik taʼsir qilmaydi.",
    analyze: "Tahlil qilish",
    running: "Tahlil…",
    needsReview: "tekshiruv kerak",
    reviewed: "tekshirildi",
    accept: "Qabul qilish",
    edit: "Tahrirlash",
    reject: "Rad etish",
    none: "Tahlil hali oʻtkazilmagan.",
    missing: "Yetishmayotgan hujjatlar",
    allComplete: "Hujjatlar toʻliq.",
    kinds: {
      completeness: "Toʻliqlik",
      evidence_extraction: "Faktlar",
      consistency_check: "Nomuvofiqliklar",
    } as Record<string, string>,
    empty: "Tasdiqlangan bandlar yoʻq.",
  },
  id: {
    title: "Analisis AI",
    hint: "Analisis AI memerlukan tinjauan manusia dan tidak memengaruhi keputusan secara otomatis.",
    analyze: "Analisis",
    running: "Menganalisis…",
    needsReview: "perlu ditinjau",
    reviewed: "ditinjau",
    accept: "Terima",
    edit: "Edit",
    reject: "Tolak",
    none: "Analisis belum dijalankan.",
    missing: "Dokumen yang kurang",
    allComplete: "Set dokumen lengkap.",
    kinds: {
      completeness: "Kelengkapan",
      evidence_extraction: "Fakta",
      consistency_check: "Ketidaksesuaian",
    } as Record<string, string>,
    empty: "Tidak ada item yang didukung.",
  },
} as const;

export default function CandidateAI({
  locale,
  applicationId,
  vacancyId,
  runs,
}: {
  locale: Locale;
  applicationId: string;
  vacancyId: string;
  runs: AiRunView[];
}) {
  const t = M[locale];
  const router = useRouter();
  const [pending, start] = useTransition();

  function run(fn: () => Promise<unknown>) {
    start(async () => {
      await fn();
      router.refresh();
    });
  }

  return (
    <section className="card space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          {t.title}
        </h2>
        <button
          type="button"
          disabled={pending}
          onClick={() => run(() => analyzeCandidate(applicationId, vacancyId))}
          className="btn-ghost text-xs disabled:opacity-50"
        >
          {pending ? t.running : t.analyze}
        </button>
      </div>
      <p className="text-xs text-slate-400">{t.hint}</p>

      {runs.length === 0 ? (
        <p className="text-sm text-slate-400">{t.none}</p>
      ) : (
        <ul className="space-y-3">
          {runs.map((r) => {
            const reviewed = r.state === "reviewed";
            return (
              <li key={r.id} className="rounded-lg border border-slate-200 p-3">
                <div className="mb-1 flex items-center justify-between gap-2">
                  <span className="text-sm font-medium">
                    {t.kinds[r.kind] ?? r.kind}
                  </span>
                  <span
                    className={
                      "rounded-full px-2 py-0.5 text-xs " +
                      (reviewed
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-amber-100 text-amber-700")
                    }
                  >
                    {reviewed ? `${t.reviewed}: ${r.review_action}` : t.needsReview}
                  </span>
                </div>

                {/* Комплектность */}
                {r.kind === "completeness" && (
                  <div className="text-sm">
                    {r.output.complete ? (
                      <p className="text-emerald-600">{t.allComplete}</p>
                    ) : (
                      <>
                        <p className="text-slate-500">{t.missing}:</p>
                        <ul className="list-disc pl-5 text-amber-700">
                          {(r.output.missing ?? []).map((m, i) => (
                            <li key={i}>{m.label}</li>
                          ))}
                        </ul>
                      </>
                    )}
                  </div>
                )}

                {/* Факты / несоответствия (с основаниями) */}
                {r.kind !== "completeness" && (
                  <ul className="space-y-1 text-sm">
                    {r.groundings.length === 0 ? (
                      <li className="text-slate-400">{t.empty}</li>
                    ) : (
                      r.groundings.map((g, i) => (
                        <li key={i}>
                          <span className="text-slate-700">{g.claim}</span>
                          {g.quote && (
                            <span className="ml-1 text-xs text-slate-400">
                              — «{g.quote}»{g.source ? ` (${g.source})` : ""}
                            </span>
                          )}
                        </li>
                      ))
                    )}
                  </ul>
                )}

                {!reviewed && (
                  <div className="mt-2 flex gap-2">
                    {(["accepted", "edited", "rejected"] as const).map((a) => (
                      <button
                        key={a}
                        type="button"
                        disabled={pending}
                        onClick={() => run(() => reviewAiRun(r.id, applicationId, a))}
                        className="text-xs text-brand-600 hover:underline disabled:opacity-50"
                      >
                        {a === "accepted" ? t.accept : a === "edited" ? t.edit : t.reject}
                      </button>
                    ))}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

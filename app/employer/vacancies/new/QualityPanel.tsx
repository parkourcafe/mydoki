"use client";

import type { Locale } from "@/lib/i18n";
import type { QualityResult, QualityWarningId } from "@/lib/vacancyQuality";

const M = {
  en: {
    title: "Quality check",
    hint: "Suggestions only — you can always publish.",
    score: "Clarity score",
    allGood: "Looks good. Nothing blocking.",
    warn: {
      no_application_docs: "Add a role-relevant document such as a CV or certificate.",
      no_questions: "No screening questions — less signal per candidate.",
      no_salary: "Vacancies without a salary attract fewer good candidates.",
      role_conflict: "This may combine too many roles. Consider narrowing.",
    },
  },
  id: {
    title: "Pemeriksaan kualitas",
    hint: "Hanya saran — Anda selalu bisa mempublikasikan.",
    score: "Skor kejelasan",
    allGood: "Sudah bagus. Tidak ada yang menghalangi.",
    warn: {
      no_application_docs: "Tambahkan dokumen yang relevan, seperti CV atau sertifikat.",
      no_questions: "Tidak ada pertanyaan seleksi — sinyal per kandidat lebih sedikit.",
      no_salary: "Lowongan tanpa gaji menarik lebih sedikit kandidat baik.",
      role_conflict: "Ini mungkin menggabungkan terlalu banyak peran. Persempit?",
    },
  },
  ru: {
    title: "Проверка качества",
    hint: "Только подсказки — опубликовать можно всегда.",
    score: "Балл ясности",
    allGood: "Всё хорошо. Ничего не мешает.",
    warn: {
      no_application_docs: "Добавьте подходящий документ, например CV или сертификат.",
      no_questions: "Нет скрининг-вопросов — меньше сигнала о кандидате.",
      no_salary: "Вакансии без зарплаты привлекают меньше хороших кандидатов.",
      role_conflict: "Похоже, смешано слишком много ролей. Сузьте.",
    },
  },
  uz: {
    title: "Sifat tekshiruvi",
    hint: "Faqat maslahat — istalgan vaqt e’lon qilishingiz mumkin.",
    score: "Aniqlik bali",
    allGood: "Yaxshi ko‘rinadi. Hech narsa to‘smaydi.",
    warn: {
      no_application_docs: "Rezyume yoki sertifikat kabi mos hujjat qo‘shing.",
      no_questions: "Saralash savollari yo‘q — nomzod haqida signal kamroq.",
      no_salary: "Maoshsiz vakansiyalar yaxshi nomzodlarni kamroq jalb qiladi.",
      role_conflict: "Bu juda ko‘p rolni birlashtirishi mumkin. Toraytiring.",
    },
  },
} as const;

function scoreColor(score: number): string {
  if (score >= 75) return "text-green-600";
  if (score >= 50) return "text-amber-600";
  return "text-red-600";
}

export default function QualityPanel({
  locale,
  result,
}: {
  locale: Locale;
  result: QualityResult;
}) {
  const t = M[locale];
  return (
    <div className="card space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="label">{t.title}</p>
          <p className="text-xs text-slate-500">{t.hint}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-500">{t.score}</p>
          <p className={"text-2xl font-semibold " + scoreColor(result.clarityScore)}>
            {result.clarityScore}
          </p>
        </div>
      </div>

      {result.warnings.length === 0 ? (
        <p className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">
          ✓ {t.allGood}
        </p>
      ) : (
        <ul className="space-y-2">
          {result.warnings.map((w) => (
            <li
              key={w.id}
              className="flex items-start gap-2 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800"
            >
              <span aria-hidden="true">⚠️</span>
              <span>{t.warn[w.id as QualityWarningId]}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

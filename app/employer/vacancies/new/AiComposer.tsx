"use client";

import { useState } from "react";
import type { Locale } from "@/lib/i18n";
import type { VacancyDraft } from "@/lib/vacancyDraft";
import { detectRoleCategory } from "@/lib/vacancyTemplates";
import { track } from "@/lib/analytics";

// D5/§6: 1 freeform + до 6 статических уточняющих (не адаптивных). Всего ≤7.
const CLARIFYING: Record<Locale, string[]> = {
  en: [
    "What problem should this hire solve?",
    "Top 3 recurring tasks?",
    "What must they know from day one vs. can learn?",
    "Where and how do they work?",
    "Salary / payment?",
    "Languages required?",
  ],
  id: [
    "Masalah apa yang harus diselesaikan karyawan ini?",
    "3 tugas rutin utama?",
    "Apa yang wajib dikuasai dari hari pertama vs. bisa dipelajari?",
    "Di mana dan bagaimana mereka bekerja?",
    "Gaji / pembayaran?",
    "Bahasa yang diperlukan?",
  ],
  ru: [
    "Какую задачу должен решить этот сотрудник?",
    "Топ-3 повторяющихся задачи?",
    "Что нужно с первого дня, а что можно освоить?",
    "Где и как он работает?",
    "Зарплата / оплата?",
    "Какие языки нужны?",
  ],
  uz: [
    "Bu xodim qanday muammoni hal qilishi kerak?",
    "Eng ko‘p takrorlanadigan 3 vazifa?",
    "Birinchi kundan nima shart, nimani o‘rganish mumkin?",
    "Qayerda va qanday ishlaydi?",
    "Maosh / to‘lov?",
    "Qaysi tillar kerak?",
  ],
};

const M = {
  en: {
    heading: "Help me write this vacancy",
    freeform: "Describe who you need, in your own words.",
    freeformPh: "e.g. I need someone to run the morning coffee bar and keep it clean…",
    more: "Add details (optional)",
    disclaimer: "AI only fills the form — nothing is published until you review and click Publish.",
    generate: "Generate draft",
    generating: "Generating…",
    close: "Close",
    empty: "Describe who you need first.",
  },
  id: {
    heading: "Bantu saya menulis lowongan ini",
    freeform: "Jelaskan siapa yang Anda butuhkan, dengan kata-kata Anda sendiri.",
    freeformPh: "mis. Saya butuh orang untuk menjalankan bar kopi pagi dan menjaganya bersih…",
    more: "Tambah detail (opsional)",
    disclaimer: "AI hanya mengisi formulir — tidak ada yang dipublikasikan sampai Anda meninjau dan klik Publikasikan.",
    generate: "Buat draf",
    generating: "Membuat…",
    close: "Tutup",
    empty: "Jelaskan dulu siapa yang Anda butuhkan.",
  },
  ru: {
    heading: "Помочь составить вакансию",
    freeform: "Опишите, кто вам нужен, своими словами.",
    freeformPh: "напр. Нужен человек вести утренний кофе-бар и держать его в чистоте…",
    more: "Добавить детали (необязательно)",
    disclaimer: "ИИ только заполняет форму — ничего не публикуется, пока вы не проверите и не нажмёте «Опубликовать».",
    generate: "Сгенерировать черновик",
    generating: "Генерация…",
    close: "Закрыть",
    empty: "Сначала опишите, кто вам нужен.",
  },
  uz: {
    heading: "Vakansiya tuzishga yordam bering",
    freeform: "Kim kerakligini o‘z so‘zlaringiz bilan yozing.",
    freeformPh: "mas. Ertalabki kofe-barni yuritadigan va toza saqlaydigan odam kerak…",
    more: "Tafsilot qo‘shish (ixtiyoriy)",
    disclaimer: "AI faqat shaklni to‘ldiradi — siz ko‘rib chiqib «E’lon qilish»ni bosmaguningizcha hech narsa e’lon qilinmaydi.",
    generate: "Draft yaratish",
    generating: "Yaratilmoqda…",
    close: "Yopish",
    empty: "Avval kim kerakligini yozing.",
  },
} as const;

export default function AiComposer({
  locale,
  onApply,
  onClose,
}: {
  locale: Locale;
  onApply: (draft: VacancyDraft, fieldsGenerated: number) => void;
  onClose: () => void;
}) {
  const t = M[locale];
  const questions = CLARIFYING[locale] ?? CLARIFYING.en;
  const [freeform, setFreeform] = useState("");
  const [showMore, setShowMore] = useState(false);
  const [answers, setAnswers] = useState<string[]>(questions.map(() => ""));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGenerate() {
    setError(null);
    const input = freeform.trim();
    if (!input) return setError(t.empty);

    track("vacancy_ai_prompt_submitted", {
      input_length: input.length,
      role_category_detected: detectRoleCategory(input) ?? "unknown",
    });

    setBusy(true);
    try {
      const payload = {
        freeform: input,
        answers: questions
          .map((q, i) => ({ question: q, answer: answers[i]?.trim() ?? "" }))
          .filter((a) => a.answer),
      };
      const res = await fetch("/api/vacancy-draft", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        track("vacancy_ai_draft_generated", {
          fields_generated_count: 0,
          generation_success: false,
          error_type: (data?.error_type as string) ?? `http_${res.status}`,
        });
        setError((data?.error as string) || t.generating);
        setBusy(false);
        return;
      }

      const draft = data.draft as VacancyDraft;
      const fieldsGenerated = Number(data.fields_generated ?? 0);
      track("vacancy_ai_draft_generated", {
        fields_generated_count: fieldsGenerated,
        generation_success: true,
      });
      onApply(draft, fieldsGenerated);
    } catch {
      track("vacancy_ai_draft_generated", {
        fields_generated_count: 0,
        generation_success: false,
        error_type: "network",
      });
      setError(t.generating);
      setBusy(false);
    }
  }

  return (
    <div className="card space-y-4 border-brand-200">
      <div className="flex items-start justify-between gap-3">
        <p className="label">✨ {t.heading}</p>
        <button
          type="button"
          onClick={onClose}
          className="text-xs text-slate-500 hover:underline"
        >
          {t.close}
        </button>
      </div>

      <div>
        <label className="label">{t.freeform}</label>
        <textarea
          rows={4}
          className="input"
          value={freeform}
          onChange={(e) => setFreeform(e.target.value)}
          placeholder={t.freeformPh}
        />
      </div>

      <div>
        <button
          type="button"
          onClick={() => setShowMore((s) => !s)}
          className="text-sm font-medium text-brand-600 hover:underline"
        >
          {showMore ? "▾ " : "▸ "}
          {t.more}
        </button>
        {showMore && (
          <div className="mt-3 space-y-3">
            {questions.map((q, i) => (
              <div key={i}>
                <label className="mb-1 block text-xs text-slate-500">{q}</label>
                <input
                  className="input"
                  value={answers[i] ?? ""}
                  onChange={(e) =>
                    setAnswers((p) =>
                      p.map((a, idx) => (idx === i ? e.target.value : a))
                    )
                  }
                />
              </div>
            ))}
          </div>
        )}
      </div>

      <p className="rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-500">
        {t.disclaimer}
      </p>

      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      )}

      <button
        type="button"
        onClick={handleGenerate}
        disabled={busy}
        className="btn-primary w-full"
      >
        {busy ? t.generating : t.generate}
      </button>
    </div>
  );
}

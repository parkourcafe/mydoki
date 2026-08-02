"use client";

import type { Locale } from "@/lib/i18n";
import { VACANCY_TEMPLATES, type VacancyTemplate } from "@/lib/vacancyTemplates";

const M = {
  en: {
    title: "Start from a role",
    hint: "One tap prefills documents and questions. You can edit everything.",
  },
  id: {
    title: "Mulai dari sebuah peran",
    hint: "Satu ketuk mengisi dokumen dan pertanyaan. Semua bisa diedit.",
  },
  ru: {
    title: "Начните с роли",
    hint: "Один тап заполнит документы и вопросы. Всё можно изменить.",
  },
  uz: {
    title: "Rol’dan boshlang",
    hint: "Bir teginish hujjat va savollarni to‘ldiradi. Hammasini tahrirlash mumkin.",
  },
} as const;

export default function TemplateChips({
  locale,
  activeId,
  onSelect,
}: {
  locale: Locale;
  activeId: string | null;
  onSelect: (template: VacancyTemplate) => void;
}) {
  const t = M[locale];
  return (
    <div className="card space-y-3">
      <div>
        <p className="label">{t.title}</p>
        <p className="text-xs text-slate-500">{t.hint}</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {VACANCY_TEMPLATES.map((tpl) => {
          const active = tpl.id === activeId;
          return (
            <button
              key={tpl.id}
              type="button"
              onClick={() => onSelect(tpl)}
              aria-pressed={active}
              className={
                "inline-flex min-h-[44px] items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition sm:min-h-0 " +
                (active
                  ? "border-brand-500 bg-brand-500 text-white"
                  : "border-slate-300 bg-white text-slate-700 hover:bg-slate-100")
              }
            >
              <span aria-hidden="true">{tpl.emoji}</span>
              {tpl.label[locale] ?? tpl.label.en}
            </button>
          );
        })}
      </div>
    </div>
  );
}

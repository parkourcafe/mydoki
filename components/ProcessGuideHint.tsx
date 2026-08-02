import Link from "next/link";
import type { Locale } from "@/lib/i18n";
import { processGuideFor, type GuideContext } from "@/lib/processGuide";

// Компактная информационная подсказка Process Guide (P3-4). Без вердиктов и
// автодействий — только ссылка на курируемые материалы /my/legal. Серверный
// компонент (без интерактивности).

const M = {
  ru: { title: "Подсказка", open: "Правовая информация →", note: "Не юридическая консультация." },
  en: { title: "Guide", open: "Legal information →", note: "Not legal advice." },
  id: { title: "Panduan", open: "Informasi hukum →", note: "Bukan nasihat hukum." },
  uz: { title: "Maslahat", open: "Huquqiy ma’lumot →", note: "Yuridik maslahat emas." },
} as const;

export default function ProcessGuideHint({
  locale,
  context,
}: {
  locale: Locale;
  context: GuideContext;
}) {
  const t = M[locale];
  const guide = processGuideFor(context, locale);
  if (!guide) return null;

  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm">
      <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-slate-400">
        <span>💡</span>
        <span>{t.title}</span>
      </div>
      <p className="mt-1 text-slate-600">{guide.hint}</p>
      <div className="mt-2 flex items-center justify-between gap-2">
        <Link href="/my/legal" className="text-xs font-medium text-brand-600 hover:underline">
          {t.open}
        </Link>
        <span className="text-xs text-slate-400">{t.note}</span>
      </div>
    </div>
  );
}

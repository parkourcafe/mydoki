import type { Locale } from "@/lib/i18n";

const M = {
  ru: { title: "Хранилище", of: "из", full: "Хранилище почти заполнено" },
  en: { title: "Storage", of: "of", full: "Storage is almost full" },
  uz: { title: "Xotira", of: "/", full: "Xotira deyarli toʻldi" },
  id: { title: "Penyimpanan", of: "dari", full: "Penyimpanan hampir penuh" },
} as const;

function fmt(n: number): string {
  if (n >= 1024 * 1024 * 1024) return `${(n / 1024 / 1024 / 1024).toFixed(1)} GB`;
  if (n >= 1024 * 1024) return `${(n / 1024 / 1024).toFixed(0)} MB`;
  if (n >= 1024) return `${(n / 1024).toFixed(0)} KB`;
  return `${n} B`;
}

/** Полоса использования хранилища пространства. */
export default function StorageBar({
  used,
  limit,
  locale,
}: {
  used: number;
  limit: number;
  locale: Locale;
}) {
  const t = M[locale];
  const pct = limit > 0 ? Math.min(100, Math.round((used / limit) * 100)) : 0;
  const warn = pct >= 90;
  const mid = pct >= 70 && pct < 90;
  const color = warn ? "#dc2626" : mid ? "#d97706" : "#b85c38";

  return (
    <div className="rounded-xl border border-[#e8e0d5] bg-[#fdfaf5] px-4 py-3">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-[#2c2522]">📦 {t.title}</span>
        <span className="text-slate-500">
          {fmt(used)} {t.of} {fmt(limit)}
        </span>
      </div>
      <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-[#ece3d6]">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
      {warn && <p className="mt-1.5 text-xs text-red-600">{t.full}</p>}
    </div>
  );
}

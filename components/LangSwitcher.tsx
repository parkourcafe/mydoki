"use client";

import type { Locale } from "@/lib/i18n";

const LABELS: Record<Locale, string> = {
  ru: "RU",
  en: "EN",
  id: "ID",
  uz: "UZ",
};

// Only offer languages relevant to the current audience. For the Indonesia
// launch, an ID/EN visitor must never be shown RU/UZ (ТЗ B2.1/B2.2); the active
// locale is always included so RU/UZ users can still switch away.
const VISIBLE: Record<Locale, Locale[]> = {
  id: ["en", "id"],
  en: ["en", "id"],
  ru: ["ru", "en"],
  uz: ["uz", "ru", "en"],
};

function set(locale: Locale) {
  document.cookie = `locale=${locale}; path=/; max-age=31536000; samesite=lax`;
  location.reload();
}

export default function LangSwitcher({ locale }: { locale: Locale }) {
  const codes = VISIBLE[locale] ?? ["en", "id"];
  return (
    <div className="flex items-center gap-0.5 text-sm sm:gap-1">
      {codes.map((code, i) => {
        const l = { code, label: LABELS[code] };
        return (
        <span key={l.code} className="flex items-center gap-0.5 sm:gap-1">
          {i > 0 && <span className="text-[#d4c9b8]">·</span>}
          <button
            type="button"
            onClick={() => set(l.code)}
            className={
              locale === l.code
                ? "font-semibold text-[#2c2522]"
                : "text-[#8a7c6d] hover:text-[#2c2522]"
            }
          >
            {l.label}
          </button>
        </span>
        );
      })}
    </div>
  );
}

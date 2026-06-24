"use client";

import type { Locale } from "@/lib/i18n";

const LOCALES: { code: Locale; label: string }[] = [
  { code: "ru", label: "RU" },
  { code: "en", label: "EN" },
  { code: "id", label: "ID" },
  { code: "uz", label: "UZ" },
];

function set(locale: Locale) {
  document.cookie = `locale=${locale}; path=/; max-age=31536000; samesite=lax`;
  location.reload();
}

export default function LangSwitcher({ locale }: { locale: Locale }) {
  return (
    <div className="flex items-center gap-1 text-sm">
      {LOCALES.map((l, i) => (
        <span key={l.code} className="flex items-center gap-1">
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
      ))}
    </div>
  );
}

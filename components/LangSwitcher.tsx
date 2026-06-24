"use client";

import type { Locale } from "@/lib/i18n";

function set(locale: Locale) {
  document.cookie = `locale=${locale}; path=/; max-age=31536000; samesite=lax`;
  location.reload();
}

export default function LangSwitcher({ locale }: { locale: Locale }) {
  return (
    <div className="flex items-center gap-1 text-sm">
      <button
        type="button"
        onClick={() => set("ru")}
        className={locale === "ru" ? "font-semibold text-[#2c2522]" : "text-[#8a7c6d] hover:text-[#2c2522]"}
      >
        RU
      </button>
      <span className="text-[#d4c9b8]">·</span>
      <button
        type="button"
        onClick={() => set("en")}
        className={locale === "en" ? "font-semibold text-[#2c2522]" : "text-[#8a7c6d] hover:text-[#2c2522]"}
      >
        EN
      </button>
    </div>
  );
}

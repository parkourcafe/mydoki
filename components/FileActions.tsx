"use client";

import { useState } from "react";
import type { Locale } from "@/lib/i18n";

const M = {
  ru: { open: "Открыть", download: "Скачать", share: "Поделиться" },
  en: { open: "Open", download: "Download", share: "Share" },
} as const;

/** Открыть / Скачать / Поделиться файлом по временной signed-ссылке. */
export default function FileActions({
  url,
  name,
  locale,
}: {
  url: string;
  name: string;
  locale: Locale;
}) {
  const t = M[locale];
  const [busy, setBusy] = useState(false);
  const downloadUrl =
    url + (url.includes("?") ? "&" : "?") + "download=" + encodeURIComponent(name);

  async function share() {
    const nav = navigator as Navigator & {
      canShare?: (data?: ShareData) => boolean;
      share?: (data?: ShareData) => Promise<void>;
    };
    try {
      setBusy(true);
      const res = await fetch(url);
      const blob = await res.blob();
      const file = new File([blob], name, {
        type: blob.type || "application/octet-stream",
      });
      if (nav.share && nav.canShare && nav.canShare({ files: [file] })) {
        await nav.share({ files: [file], title: name });
      } else {
        // на десктопе без шаринга файлов — просто скачиваем
        const a = document.createElement("a");
        a.href = downloadUrl;
        a.download = name;
        a.click();
      }
    } catch {
      // пользователь отменил шаринг — ничего не делаем
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex gap-1">
      <a href={url} target="_blank" rel="noreferrer" className="btn-ghost">
        {t.open}
      </a>
      <a href={downloadUrl} className="btn-ghost">
        {t.download}
      </a>
      <button type="button" onClick={share} disabled={busy} className="btn-ghost">
        {busy ? "…" : t.share}
      </button>
    </div>
  );
}

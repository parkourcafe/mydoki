"use client";

import { useState } from "react";

/** Открыть / Скачать / Поделиться файлом по временной signed-ссылке. */
export default function FileActions({ url, name }: { url: string; name: string }) {
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
        Открыть
      </a>
      <a href={downloadUrl} className="btn-ghost">
        Скачать
      </a>
      <button type="button" onClick={share} disabled={busy} className="btn-ghost">
        {busy ? "…" : "Поделиться"}
      </button>
    </div>
  );
}

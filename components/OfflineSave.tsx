"use client";

import { useEffect, useState } from "react";
import type { Locale } from "@/lib/i18n";
import {
  isSaved,
  removeDoc,
  saveDoc,
  type OfflineFileInput,
  type OfflineMeta,
} from "@/lib/offlineDb";

const M = {
  ru: {
    save: "Сохранить офлайн",
    saving: "Сохраняю…",
    saved: "Сохранено офлайн",
    remove: "Убрать из офлайна",
    hint: "Документ будет доступен без интернета — копия хранится на этом устройстве.",
    err: "Не удалось сохранить. Обновите страницу и попробуйте снова.",
    noFiles: "Нет файлов для офлайна — сохранятся только данные документа.",
  },
  en: {
    save: "Save offline",
    saving: "Saving…",
    saved: "Saved offline",
    remove: "Remove from offline",
    hint: "This document will be available without internet — a copy is kept on this device.",
    err: "Could not save. Refresh the page and try again.",
    noFiles: "No files to save offline — only the document details will be kept.",
  },
  uz: {
    save: "Oflayn saqlash",
    saving: "Saqlanmoqda…",
    saved: "Oflayn saqlandi",
    remove: "Oflayndan olib tashlash",
    hint: "Hujjat internetsiz ham mavjud boʻladi — nusxa shu qurilmada saqlanadi.",
    err: "Saqlab boʻlmadi. Sahifani yangilab, qayta urinib koʻring.",
    noFiles: "Oflayn uchun fayl yoʻq — faqat hujjat maʼlumotlari saqlanadi.",
  },
  id: {
    save: "Simpan offline",
    saving: "Menyimpan…",
    saved: "Tersimpan offline",
    remove: "Hapus dari offline",
    hint: "Dokumen ini akan tersedia tanpa internet — salinan disimpan di perangkat ini.",
    err: "Gagal menyimpan. Muat ulang halaman lalu coba lagi.",
    noFiles: "Tidak ada berkas untuk offline — hanya detail dokumen yang disimpan.",
  },
} as const;

type FileInput = { id: string; name: string; mime: string; size: number; url: string };

export default function OfflineSave({
  locale,
  meta,
  files,
}: {
  locale: Locale;
  meta: Omit<OfflineMeta, "savedAt" | "files"> & { files: { id: string; name: string; mime: string; size: number }[] };
  files: FileInput[];
}) {
  const t = M[locale];
  const [state, setState] = useState<"unknown" | "no" | "saving" | "yes">(
    "unknown"
  );
  const [error, setError] = useState(false);

  useEffect(() => {
    isSaved(meta.id)
      .then((s) => setState(s ? "yes" : "no"))
      .catch(() => setState("no"));
  }, [meta.id]);

  async function onSave() {
    setError(false);
    setState("saving");
    try {
      const blobs: OfflineFileInput[] = await Promise.all(
        files.map(async (f) => {
          const res = await fetch(f.url);
          if (!res.ok) throw new Error("fetch");
          const blob = await res.blob();
          return { id: f.id, name: f.name, mime: f.mime, size: f.size, blob };
        })
      );
      await saveDoc(meta, blobs);
      setState("yes");
    } catch {
      setError(true);
      setState("no");
    }
  }

  async function onRemove() {
    await removeDoc(meta.id);
    setState("no");
  }

  if (state === "unknown") return null;

  return (
    <div className="text-sm">
      {state === "yes" ? (
        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-1 font-medium text-emerald-600">
            ✓ {t.saved}
          </span>
          <button onClick={onRemove} className="text-slate-400 hover:underline">
            {t.remove}
          </button>
        </div>
      ) : (
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={onSave}
            disabled={state === "saving"}
            className="rounded-lg border border-[#e8e0d5] bg-white px-3 py-1.5 font-medium text-[#2c2522] hover:bg-[#f0e6d9] disabled:opacity-60"
          >
            {state === "saving" ? t.saving : `⬇ ${t.save}`}
          </button>
          <span className="text-xs text-slate-400">
            {files.length === 0 ? t.noFiles : t.hint}
          </span>
        </div>
      )}
      {error && <p className="mt-2 text-xs text-red-500">{t.err}</p>}
    </div>
  );
}

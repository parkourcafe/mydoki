"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { Locale } from "@/lib/i18n";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import { attachDocumentFile, runDocumentChecks } from "@/app/my/actions";

const M = {
  ru: {
    add: "Загрузить новую версию",
    note: "Что изменилось (необязательно)",
    pick: "📎 Выбрать файл",
    uploading: "Загружаю…",
    fail: "Не удалось загрузить.",
  },
  en: {
    add: "Upload new version",
    note: "What changed (optional)",
    pick: "📎 Choose file",
    uploading: "Uploading…",
    fail: "Upload failed.",
  },
  uz: {
    add: "Yangi versiyani yuklash",
    note: "Nima oʻzgardi (ixtiyoriy)",
    pick: "📎 Fayl tanlash",
    uploading: "Yuklanmoqda…",
    fail: "Yuklab boʻlmadi.",
  },
  id: {
    add: "Unggah versi baru",
    note: "Apa yang berubah (opsional)",
    pick: "📎 Pilih berkas",
    uploading: "Mengunggah…",
    fail: "Gagal mengunggah.",
  },
} as const;

async function sha256Hex(file: File): Promise<string> {
  try {
    const buf = await file.arrayBuffer();
    const digest = await crypto.subtle.digest("SHA-256", buf);
    return Array.from(new Uint8Array(digest))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  } catch {
    return "";
  }
}

export default function VersionUpload({
  documentId,
  householdId,
  locale,
}: {
  documentId: string;
  householdId: string;
  locale: Locale;
}) {
  const t = M[locale];
  const router = useRouter();
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function onFile(list: FileList | null) {
    const file = list?.[0];
    if (!file) return;
    setBusy(true);
    setErr(null);
    try {
      const supabase = getSupabaseBrowser();
      const safe = file.name.replace(/[^\w.\-]+/g, "_") || "file";
      const path = `${householdId}/${documentId}/${Date.now()}-${safe}`;
      const { error } = await supabase.storage
        .from("vault-files")
        .upload(path, file, {
          contentType: file.type || "application/octet-stream",
          upsert: false,
        });
      if (error) throw error;
      const fileHash = await sha256Hex(file);
      await attachDocumentFile({
        documentId,
        householdId,
        storagePath: path,
        fileName: note.trim() || file.name,
        mimeType: file.type || null,
        sizeBytes: file.size,
        fileHash,
      });
      try {
        await runDocumentChecks(documentId);
      } catch {
        /* проверки можно перезапустить кнопкой */
      }
      setNote("");
      if (fileRef.current) fileRef.current.value = "";
      router.refresh();
    } catch (e) {
      setErr(e instanceof Error ? e.message : t.fail);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-4 border-t border-slate-100 pt-4">
      <label className="label">{t.add}</label>
      <input
        value={note}
        onChange={(e) => setNote(e.target.value)}
        className="input mb-2"
        placeholder={t.note}
      />
      <input
        ref={fileRef}
        type="file"
        accept="image/*,application/pdf"
        className="hidden"
        onChange={(e) => onFile(e.target.files)}
      />
      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        disabled={busy}
        className="btn-ghost"
      >
        {busy ? t.uploading : t.pick}
      </button>
      {err && <p className="mt-1 text-xs text-red-600">{err}</p>}
    </div>
  );
}

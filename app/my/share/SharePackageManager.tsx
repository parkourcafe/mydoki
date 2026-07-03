"use client";

import { useState } from "react";
import type { Locale } from "@/lib/i18n";
import { createSharePackage } from "./actions";

const M = {
  ru: {
    intro: "Отметьте документы, которые войдут в одну ссылку для работодателя.",
    title: "Название пакета", titlePh: "напр. Документы для Sunset Cafe", optional: "необязательно",
    days: "Срок действия (дней)", download: "Разрешить скачивание",
    noDocs: "В сейфе пока нет документов. Сначала загрузите их в разделе «Документы».",
    create: "Создать ссылку", creating: "Создаю…", selectFirst: "Отметьте хотя бы один документ.",
    ready: "Ссылка готова — отправьте её работодателю:", copy: "Копировать", copied: "Скопировано ✓",
    another: "Создать ещё одну", failed: "Не удалось создать ссылку.",
  },
  en: {
    intro: "Tick the documents to include in a single link for the employer.",
    title: "Package name", titlePh: "e.g. Documents for Sunset Cafe", optional: "optional",
    days: "Valid for (days)", download: "Allow download",
    noDocs: "No documents in your vault yet. Upload them in the Documents section first.",
    create: "Create link", creating: "Creating…", selectFirst: "Tick at least one document.",
    ready: "Your link is ready — send it to the employer:", copy: "Copy", copied: "Copied ✓",
    another: "Create another", failed: "Could not create the link.",
  },
  id: {
    intro: "Centang dokumen yang akan digabung dalam satu tautan untuk perusahaan.",
    title: "Nama paket", titlePh: "mis. Dokumen untuk Sunset Cafe", optional: "opsional",
    days: "Berlaku (hari)", download: "Izinkan unduh",
    noDocs: "Belum ada dokumen di brankas. Unggah dulu di bagian Dokumen.",
    create: "Buat tautan", creating: "Membuat…", selectFirst: "Centang minimal satu dokumen.",
    ready: "Tautan siap — kirim ke perusahaan:", copy: "Salin", copied: "Tersalin ✓",
    another: "Buat lagi", failed: "Gagal membuat tautan.",
  },
  uz: {
    intro: "Ish beruvchi uchun bitta havolaga kiradigan hujjatlarni belgilang.",
    title: "Paket nomi", titlePh: "mas. Sunset Cafe uchun hujjatlar", optional: "ixtiyoriy",
    days: "Amal muddati (kun)", download: "Yuklab olishga ruxsat",
    noDocs: "Xotirada hali hujjat yo‘q. Avval «Hujjatlar» bo‘limida yuklang.",
    create: "Havola yaratish", creating: "Yaratilmoqda…", selectFirst: "Kamida bitta hujjatni belgilang.",
    ready: "Havola tayyor — ish beruvchiga yuboring:", copy: "Nusxa olish", copied: "Nusxalandi ✓",
    another: "Yana yaratish", failed: "Havola yaratilmadi.",
  },
} as const;

export default function SharePackageManager({
  locale,
  documents,
}: {
  locale: Locale;
  documents: { id: string; title: string; sub: string }[];
}) {
  const t = M[locale];
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [title, setTitle] = useState("");
  const [days, setDays] = useState(7);
  const [download, setDownload] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [link, setLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  function toggle(id: string) {
    setSelected((p) => ({ ...p, [id]: !p[id] }));
  }

  async function create() {
    setError(null);
    const ids = Object.keys(selected).filter((k) => selected[k]);
    if (!ids.length) return setError(t.selectFirst);
    setBusy(true);
    const res = await createSharePackage({ documentIds: ids, days, allowDownload: download, title });
    setBusy(false);
    if ("error" in res) return setError(t.failed);
    setLink(`${window.location.origin}/pkg/${res.token}`);
  }

  function reset() {
    setLink(null);
    setSelected({});
    setTitle("");
    setCopied(false);
  }

  if (documents.length === 0) {
    return <p className="text-sm text-slate-500">{t.noDocs}</p>;
  }

  if (link) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-slate-600">{t.ready}</p>
        <code className="block truncate rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-700">{link}</code>
        <div className="flex gap-2">
          <button
            type="button"
            className="btn-primary"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(link);
                setCopied(true);
                setTimeout(() => setCopied(false), 1500);
              } catch { /* noop */ }
            }}
          >
            {copied ? t.copied : t.copy}
          </button>
          <button type="button" className="btn-ghost" onClick={reset}>
            {t.another}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-500">{t.intro}</p>

      <ul className="space-y-1">
        {documents.map((d) => (
          <li key={d.id}>
            <label className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm">
              <input type="checkbox" checked={!!selected[d.id]} onChange={() => toggle(d.id)} className="h-4 w-4" />
              <span className="min-w-0 flex-1 truncate">
                {d.title} <span className="text-xs text-slate-400">· {d.sub}</span>
              </span>
            </label>
          </li>
        ))}
      </ul>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="label">
            {t.title} <span className="font-normal text-slate-400">({t.optional})</span>
          </label>
          <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t.titlePh} />
        </div>
        <div>
          <label className="label">{t.days}</label>
          <input type="number" min={1} max={90} className="input" value={days}
            onChange={(e) => setDays(Number(e.target.value))} />
        </div>
        <label className="flex items-center gap-2 self-end pb-2 text-sm text-slate-700">
          <input type="checkbox" checked={download} onChange={(e) => setDownload(e.target.checked)} className="h-4 w-4" />
          {t.download}
        </label>
      </div>

      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      <button type="button" disabled={busy} className="btn-primary" onClick={create}>
        {busy ? t.creating : t.create}
      </button>
    </div>
  );
}

"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  clearAll,
  estimateUsage,
  getFileBlob,
  listDocs,
  removeDoc,
  type OfflineFileMeta,
  type OfflineMeta,
} from "@/lib/offlineDb";

type Locale = "ru" | "en" | "id" | "uz";

const M = {
  ru: {
    title: "Сохранённое офлайн",
    back: "← В кабинет",
    empty:
      "Здесь пока пусто. Откройте документ и нажмите «Сохранить офлайн» — он станет доступен без интернета.",
    note: "Эти копии хранятся на этом устройстве и доступны без интернета. Любой, у кого есть доступ к устройству, сможет их открыть.",
    files: (n: number) => `${n} файл.`,
    savedAt: "сохранено",
    open: "Открыть",
    download: "Скачать",
    remove: "Убрать",
    clearAll: "Очистить всё офлайн-хранилище",
    confirmClear: "Удалить все офлайн-копии с этого устройства?",
    used: "Занято на устройстве",
    noFiles: "Без файлов (только данные).",
    category: "Категория",
    issuer: "Кем выдан",
    number: "Номер",
    validUntil: "Действует до",
    notes: "Заметки",
    loc: "ru-RU",
  },
  en: {
    title: "Saved offline",
    back: "← To app",
    empty:
      "Nothing here yet. Open a document and tap “Save offline” — it will be available without internet.",
    note: "These copies are stored on this device and work without internet. Anyone with access to the device can open them.",
    files: (n: number) => `${n} file(s)`,
    savedAt: "saved",
    open: "Open",
    download: "Download",
    remove: "Remove",
    clearAll: "Clear all offline storage",
    confirmClear: "Delete all offline copies from this device?",
    used: "Used on device",
    noFiles: "No files (details only).",
    category: "Category",
    issuer: "Issued by",
    number: "Number",
    validUntil: "Valid until",
    notes: "Notes",
    loc: "en-US",
  },
  uz: {
    title: "Oflayn saqlangan",
    back: "← Kabinetga",
    empty:
      "Hozircha boʻsh. Hujjatni oching va «Oflayn saqlash» tugmasini bosing — u internetsiz ham ochiladi.",
    note: "Bu nusxalar shu qurilmada saqlanadi va internetsiz ishlaydi. Qurilmaga kira oladigan har kim ularni ocha oladi.",
    files: (n: number) => `${n} ta fayl`,
    savedAt: "saqlangan",
    open: "Ochish",
    download: "Yuklab olish",
    remove: "Olib tashlash",
    clearAll: "Barcha oflayn maʼlumotlarni tozalash",
    confirmClear: "Bu qurilmadagi barcha oflayn nusxalar oʻchirilsinmi?",
    used: "Qurilmada band",
    noFiles: "Faylsiz (faqat maʼlumot).",
    category: "Toifa",
    issuer: "Kim bergan",
    number: "Raqami",
    validUntil: "Amal qiladi",
    notes: "Izohlar",
    loc: "uz-UZ",
  },
  id: {
    title: "Tersimpan offline",
    back: "← Ke aplikasi",
    empty:
      "Belum ada apa-apa. Buka dokumen dan ketuk “Simpan offline” — akan tersedia tanpa internet.",
    note: "Salinan ini disimpan di perangkat ini dan bekerja tanpa internet. Siapa pun yang punya akses ke perangkat bisa membukanya.",
    files: (n: number) => `${n} berkas`,
    savedAt: "disimpan",
    open: "Buka",
    download: "Unduh",
    remove: "Hapus",
    clearAll: "Bersihkan semua penyimpanan offline",
    confirmClear: "Hapus semua salinan offline dari perangkat ini?",
    used: "Terpakai di perangkat",
    noFiles: "Tanpa berkas (hanya detail).",
    category: "Kategori",
    issuer: "Diterbitkan oleh",
    number: "Nomor",
    validUntil: "Berlaku sampai",
    notes: "Catatan",
    loc: "id-ID",
  },
} as const;

function readLocale(): Locale {
  if (typeof document !== "undefined") {
    const m = document.cookie.match(/(?:^|; )locale=([^;]+)/);
    const v = m?.[1] as Locale | undefined;
    if (v && (["ru", "en", "id", "uz"] as const).includes(v)) return v;
  }
  if (typeof navigator !== "undefined") {
    const l = navigator.language.toLowerCase();
    if (l.startsWith("ru")) return "ru";
    if (l.startsWith("id")) return "id";
    if (l.startsWith("uz")) return "uz";
  }
  return "en";
}

function fmtBytes(n: number | null): string {
  if (!n) return "";
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
}

/** Один файл: грузит blob из IndexedDB и показывает (картинка/PDF/скачать). */
function FileView({
  file,
  t,
}: {
  file: OfflineFileMeta;
  t: { open: string; download: string };
}) {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    let revoke: string | null = null;
    let alive = true;
    getFileBlob(file.id).then((blob) => {
      if (!blob || !alive) return;
      const u = URL.createObjectURL(blob);
      revoke = u;
      setUrl(u);
    });
    return () => {
      alive = false;
      if (revoke) URL.revokeObjectURL(revoke);
    };
  }, [file.id]);

  const isImage = file.mime?.startsWith("image/");
  const isPdf = file.mime === "application/pdf";

  return (
    <div className="rounded-lg border border-[#e8e0d5] bg-white p-3">
      <div className="mb-2 flex items-center justify-between gap-2">
        <div className="min-w-0 text-sm">
          <div className="truncate font-medium">{file.name}</div>
          <div className="text-xs text-slate-400">
            {file.mime} {fmtBytes(file.size)}
          </div>
        </div>
        {url && (
          <div className="flex shrink-0 gap-1">
            <a
              href={url}
              target="_blank"
              rel="noreferrer"
              className="rounded-lg px-2 py-1 text-xs text-[#b85c38] hover:bg-[#f0e6d9]"
            >
              {t.open}
            </a>
            <a
              href={url}
              download={file.name}
              className="rounded-lg px-2 py-1 text-xs text-[#b85c38] hover:bg-[#f0e6d9]"
            >
              {t.download}
            </a>
          </div>
        )}
      </div>
      {url && isImage && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={url}
          alt={file.name}
          className="max-h-[70vh] w-full rounded-md object-contain"
        />
      )}
      {url && isPdf && (
        <embed
          src={url}
          type="application/pdf"
          className="h-[70vh] w-full rounded-md"
        />
      )}
    </div>
  );
}

export default function SavedPage() {
  const [mounted, setMounted] = useState(false);
  const [locale, setLocale] = useState<Locale>("ru");
  const [docs, setDocs] = useState<OfflineMeta[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);
  const [used, setUsed] = useState<number | null>(null);

  const reload = useCallback(async () => {
    setDocs(await listDocs());
    setUsed(await estimateUsage());
  }, []);

  useEffect(() => {
    setMounted(true);
    setLocale(readLocale());
    reload();
  }, [reload]);

  if (!mounted) return null;
  const t = M[locale];

  async function onRemove(id: string) {
    await removeDoc(id);
    if (openId === id) setOpenId(null);
    await reload();
  }

  async function onClear() {
    if (!window.confirm(t.confirmClear)) return;
    await clearAll();
    setOpenId(null);
    await reload();
  }

  const open = docs.find((d) => d.id === openId) ?? null;

  return (
    <main className="min-h-screen bg-[#f9f5f0] text-[#2c2522]">
      <div className="mx-auto max-w-3xl px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-semibold">📥 {t.title}</h1>
          <Link
            href="/my"
            prefetch
            className="text-sm text-slate-500 hover:underline"
          >
            {t.back}
          </Link>
        </div>

        <p className="mb-6 rounded-lg border border-[#e8e0d5] bg-[#fdfaf5] px-3 py-2 text-xs text-slate-500">
          🔒 {t.note}
        </p>

        {open ? (
          <div className="space-y-4">
            <button
              onClick={() => setOpenId(null)}
              className="text-sm text-slate-500 hover:underline"
            >
              ← {t.title}
            </button>
            <div>
              <h2 className="text-xl font-semibold">{open.title}</h2>
              {open.ownerName && (
                <p className="text-sm text-slate-500">{open.ownerName}</p>
              )}
            </div>

            <dl className="grid grid-cols-2 gap-x-6 gap-y-2 rounded-lg border border-[#e8e0d5] bg-white p-4 text-sm sm:grid-cols-3">
              {(
                [
                  [t.category, open.category],
                  [t.issuer, open.issuer],
                  [t.number, open.docNumber],
                  [t.validUntil, open.expiresAt],
                ] as [string, string | null][]
              )
                .filter(([, v]) => v)
                .map(([k, v]) => (
                  <div key={k}>
                    <dt className="text-slate-400">{k}</dt>
                    <dd className="font-medium">{v}</dd>
                  </div>
                ))}
            </dl>
            {open.notes && (
              <p className="whitespace-pre-wrap rounded-lg border border-[#e8e0d5] bg-white p-4 text-sm text-slate-600">
                {open.notes}
              </p>
            )}

            {open.files.length === 0 ? (
              <p className="text-sm text-slate-400">{t.noFiles}</p>
            ) : (
              <div className="space-y-3">
                {open.files.map((f) => (
                  <FileView key={f.id} file={f} t={t} />
                ))}
              </div>
            )}

            <button
              onClick={() => onRemove(open.id)}
              className="text-sm text-red-500 hover:underline"
            >
              {t.remove}
            </button>
          </div>
        ) : docs.length === 0 ? (
          <p className="rounded-lg border border-dashed border-[#e8e0d5] bg-white px-4 py-10 text-center text-sm text-slate-500">
            {t.empty}
          </p>
        ) : (
          <>
            <ul className="space-y-2">
              {docs.map((d) => (
                <li
                  key={d.id}
                  className="flex items-center justify-between gap-3 rounded-lg border border-[#e8e0d5] bg-white px-4 py-3"
                >
                  <button
                    onClick={() => setOpenId(d.id)}
                    className="min-w-0 flex-1 text-left"
                  >
                    <div className="truncate font-medium">{d.title}</div>
                    <div className="text-xs text-slate-400">
                      {d.ownerName ? `${d.ownerName} · ` : ""}
                      {t.files(d.files.length)} · {t.savedAt}{" "}
                      {new Date(d.savedAt).toLocaleDateString(t.loc)}
                    </div>
                  </button>
                  <button
                    onClick={() => onRemove(d.id)}
                    className="shrink-0 text-xs text-slate-400 hover:text-red-500 hover:underline"
                  >
                    {t.remove}
                  </button>
                </li>
              ))}
            </ul>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
              {used != null && (
                <span>
                  {t.used}: {fmtBytes(used)}
                </span>
              )}
              <button onClick={onClear} className="hover:text-red-500 hover:underline">
                {t.clearAll}
              </button>
            </div>
          </>
        )}
      </div>
    </main>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Locale } from "@/lib/i18n";
import CopyButton from "@/components/CopyButton";
import { createDocumentShare } from "@/app/my/actions";

const M = {
  ru: {
    days: "Действует, дней", views: "Лимит просмотров", noLimit: "0 — без лимита",
    password: "Пароль (необязательно)", watermark: "Водяной знак", download: "Скачивание",
    create: "Создать ссылку", creating: "Создаю…", ready: "Ссылка создана",
    expires: (days: number) => `Действует ${days} дн.`, downloadsOff: "Скачивание выключено",
    downloadsOn: "Скачивание разрешено", failed: "Не удалось создать ссылку. Попробуйте ещё раз.",
    another: "Создать ещё одну",
  },
  en: {
    days: "Valid for, days", views: "View limit", noLimit: "0 — no limit",
    password: "Password (optional)", watermark: "Watermark", download: "Download",
    create: "Create link", creating: "Creating…", ready: "Link created",
    expires: (days: number) => `Expires in ${days} days`, downloadsOff: "Downloads disabled",
    downloadsOn: "Downloads allowed", failed: "Could not create the link. Please try again.",
    another: "Create another",
  },
  id: {
    days: "Berlaku, hari", views: "Batas tampilan", noLimit: "0 — tanpa batas",
    password: "Kata sandi (opsional)", watermark: "Tanda air", download: "Unduh",
    create: "Buat tautan", creating: "Membuat…", ready: "Tautan dibuat",
    expires: (days: number) => `Berlaku ${days} hari`, downloadsOff: "Unduhan dinonaktifkan",
    downloadsOn: "Unduhan diizinkan", failed: "Gagal membuat tautan. Coba lagi.",
    another: "Buat lagi",
  },
  uz: {
    days: "Amal qiladi, kun", views: "Ko‘rishlar limiti", noLimit: "0 — limitsiz",
    password: "Parol (ixtiyoriy)", watermark: "Suv belgisi", download: "Yuklab olish",
    create: "Havola yaratish", creating: "Yaratilmoqda…", ready: "Havola yaratildi",
    expires: (days: number) => `${days} kun amal qiladi`, downloadsOff: "Yuklab olish o‘chirilgan",
    downloadsOn: "Yuklab olishga ruxsat", failed: "Havola yaratilmadi. Qayta urinib ko‘ring.",
    another: "Yana yaratish",
  },
} as const;

export default function DocumentShareForm({
  documentId,
  locale,
}: {
  documentId: string;
  locale: Locale;
}) {
  const t = M[locale];
  const router = useRouter();
  const [days, setDays] = useState(7);
  const [maxViews, setMaxViews] = useState(0);
  const [password, setPassword] = useState("");
  const [watermark, setWatermark] = useState(true);
  const [allowDownload, setAllowDownload] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [link, setLink] = useState<string | null>(null);

  async function create() {
    setBusy(true);
    setError(null);
    try {
      const result = await createDocumentShare({
        documentId,
        days,
        maxViews,
        watermark,
        allowDownload,
        password,
      });
      if ("error" in result) {
        setError(t.failed);
        return;
      }
      setLink(`${window.location.origin}/s/${result.token}`);
      router.refresh();
    } catch {
      setError(t.failed);
    } finally {
      setBusy(false);
    }
  }

  if (link) {
    return (
      <div className="space-y-3 rounded-lg border border-emerald-200 bg-emerald-50 p-3" role="status">
        <div>
          <p className="font-medium text-emerald-800">✓ {t.ready}</p>
          <p className="mt-1 text-xs text-emerald-700">
            {t.expires(days)} · {allowDownload ? t.downloadsOn : t.downloadsOff}
          </p>
        </div>
        <code className="block overflow-x-auto rounded bg-white px-3 py-2 text-sm text-slate-700">
          {link}
        </code>
        <div className="flex flex-wrap gap-2">
          <CopyButton text={link} locale={locale} className="btn-primary" />
          <button type="button" className="btn-ghost" onClick={() => setLink(null)}>
            {t.another}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-4">
      <div>
        <label className="label">{t.days}</label>
        <input type="number" min={1} max={90} value={days} onChange={(e) => setDays(Number(e.target.value))} className="input" />
      </div>
      <div>
        <label className="label">{t.views}</label>
        <input type="number" min={0} value={maxViews} onChange={(e) => setMaxViews(Number(e.target.value))} className="input" placeholder={t.noLimit} />
      </div>
      <label className="flex items-end gap-2 pb-2 text-sm">
        <input type="checkbox" checked={watermark} onChange={(e) => setWatermark(e.target.checked)} /> {t.watermark}
      </label>
      <label className="flex items-end gap-2 pb-2 text-sm">
        <input type="checkbox" checked={allowDownload} onChange={(e) => setAllowDownload(e.target.checked)} /> {t.download}
      </label>
      <div className="sm:col-span-2">
        <label className="label">{t.password}</label>
        <input type="text" value={password} onChange={(e) => setPassword(e.target.value)} className="input" autoComplete="off" />
      </div>
      {error && <p className="sm:col-span-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">{error}</p>}
      <div className="sm:col-span-4">
        <button type="button" disabled={busy} onClick={create} className="btn-primary">
          {busy ? t.creating : t.create}
        </button>
      </div>
    </div>
  );
}

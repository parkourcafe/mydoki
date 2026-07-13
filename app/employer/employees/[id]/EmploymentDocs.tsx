"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Locale } from "@/lib/i18n";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import {
  type EmploymentDocument,
  type ExpiryStatus,
  EMPLOYMENT_DOC_TYPES,
  docTypeLabel,
  expiryStatus,
} from "@/lib/employmentDocs";
import {
  attachEmploymentDocument,
  deleteEmploymentDocument,
  signEmploymentDoc,
} from "@/app/employer/actions";

const M = {
  ru: {
    title: "Документы сотрудника",
    intro: "Договор, виза, разрешение, сертификация. Срок действия — для напоминаний.",
    type: "Тип",
    label: "Название",
    labelPh: "Например: Виза C312",
    expires: "Действует до",
    pick: "📎 Выбрать файл",
    uploading: "Загружаю…",
    fail: "Не удалось загрузить.",
    empty: "Документов пока нет.",
    remove: "Удалить",
    confirmDel: "Удалить документ?",
    open: "Открыть",
    noExpiry: "без срока",
    st: { ok: "", soon: "истекает", expired: "просрочен", none: "" } as Record<ExpiryStatus, string>,
  },
  en: {
    title: "Employee documents",
    intro: "Contract, visa, permit, certification. Expiry powers reminders.",
    type: "Type",
    label: "Label",
    labelPh: "e.g. Visa C312",
    expires: "Expires",
    pick: "📎 Choose file",
    uploading: "Uploading…",
    fail: "Upload failed.",
    empty: "No documents yet.",
    remove: "Delete",
    confirmDel: "Delete document?",
    open: "Open",
    noExpiry: "no expiry",
    st: { ok: "", soon: "expiring", expired: "expired", none: "" } as Record<ExpiryStatus, string>,
  },
  id: {
    title: "Dokumen karyawan",
    intro: "Kontrak, visa, izin, sertifikasi. Masa berlaku untuk pengingat.",
    type: "Jenis",
    label: "Nama",
    labelPh: "mis. Visa C312",
    expires: "Berlaku sampai",
    pick: "📎 Pilih berkas",
    uploading: "Mengunggah…",
    fail: "Gagal mengunggah.",
    empty: "Belum ada dokumen.",
    remove: "Hapus",
    confirmDel: "Hapus dokumen?",
    open: "Buka",
    noExpiry: "tanpa masa berlaku",
    st: { ok: "", soon: "segera habis", expired: "kedaluwarsa", none: "" } as Record<ExpiryStatus, string>,
  },
  uz: {
    title: "Xodim hujjatlari",
    intro: "Shartnoma, viza, ruxsat, sertifikatsiya. Amal muddati — eslatmalar uchun.",
    type: "Turi",
    label: "Nomi",
    labelPh: "masalan: Viza C312",
    expires: "Amal qiladi",
    pick: "📎 Fayl tanlash",
    uploading: "Yuklanmoqda…",
    fail: "Yuklab boʻlmadi.",
    empty: "Hozircha hujjat yoʻq.",
    remove: "Oʻchirish",
    confirmDel: "Hujjat oʻchirilsinmi?",
    open: "Ochish",
    noExpiry: "muddatsiz",
    st: { ok: "", soon: "muddati tugayapti", expired: "muddati oʻtgan", none: "" } as Record<ExpiryStatus, string>,
  },
} as const;

const stCls: Record<ExpiryStatus, string> = {
  ok: "bg-slate-100 text-slate-500",
  soon: "bg-amber-100 text-amber-700",
  expired: "bg-red-100 text-red-700",
  none: "",
};

async function openDoc(path: string) {
  const w = window.open("", "_blank");
  const url = await signEmploymentDoc(path);
  if (url && w) w.location.href = url;
  else if (w) w.close();
}

export default function EmploymentDocs({
  locale,
  employmentId,
  today,
  docs,
  canManage,
}: {
  locale: Locale;
  employmentId: string;
  today: string;
  docs: EmploymentDocument[];
  canManage: boolean;
}) {
  const t = M[locale];
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [pending, startT] = useTransition();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [docType, setDocType] = useState("contract");
  const [label, setLabel] = useState("");
  const [expires, setExpires] = useState("");

  async function onFile(list: FileList | null) {
    const file = list?.[0];
    if (!file) return;
    setBusy(true);
    setErr(null);
    try {
      const supabase = getSupabaseBrowser();
      const safe = file.name.replace(/[^\w.\-]+/g, "_") || "file";
      const path = `${employmentId}/${Date.now()}-${safe}`;
      const { error } = await supabase.storage
        .from("employment-docs")
        .upload(path, file, {
          contentType: file.type || "application/octet-stream",
          upsert: false,
        });
      if (error) throw error;
      await attachEmploymentDocument({
        employmentId,
        docType,
        label: label.trim(),
        storagePath: path,
        fileName: file.name,
        sizeBytes: file.size,
        expiresAt: expires || null,
      });
      setLabel("");
      setExpires("");
      if (fileRef.current) fileRef.current.value = "";
      router.refresh();
    } catch (e) {
      setErr(e instanceof Error ? e.message : t.fail);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="card space-y-3">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
        {t.title}
      </h2>

      {canManage && (
        <div className="space-y-2 rounded-lg bg-slate-50 p-3">
          <p className="text-xs text-slate-400">{t.intro}</p>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="label">{t.type}</label>
              <select value={docType} onChange={(e) => setDocType(e.target.value)} className="input">
                {EMPLOYMENT_DOC_TYPES.map((v) => (
                  <option key={v} value={v}>
                    {docTypeLabel(locale, v)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">{t.expires}</label>
              <input type="date" value={expires} onChange={(e) => setExpires(e.target.value)} className="input" />
            </div>
          </div>
          <div>
            <label className="label">{t.label}</label>
            <input value={label} onChange={(e) => setLabel(e.target.value)} className="input" placeholder={t.labelPh} />
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="application/pdf,image/jpeg,image/png"
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
          {err && <p className="text-xs text-red-600">{err}</p>}
        </div>
      )}

      {docs.length === 0 ? (
        <p className="text-sm text-slate-400">{t.empty}</p>
      ) : (
        <ul className="space-y-1.5 text-sm">
          {docs.map((d) => {
            const st = expiryStatus(d.expires_at, today);
            return (
              <li key={d.id} className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <button
                    type="button"
                    onClick={() => openDoc(d.file_path)}
                    className="text-brand-600 hover:underline"
                  >
                    📄 {d.label}
                  </button>
                  <p className="text-xs text-slate-400">
                    {docTypeLabel(locale, d.doc_type)}
                    {d.expires_at ? ` · ${t.expires} ${d.expires_at}` : ` · ${t.noExpiry}`}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {st !== "ok" && st !== "none" && (
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${stCls[st]}`}>
                      {t.st[st]}
                    </span>
                  )}
                  {canManage && (
                    <button
                      type="button"
                      disabled={pending}
                      onClick={() => {
                        if (!confirm(t.confirmDel)) return;
                        startT(async () => {
                          await deleteEmploymentDocument(d.id, employmentId, d.file_path);
                          router.refresh();
                        });
                      }}
                      className="text-xs text-red-400 hover:underline"
                    >
                      {t.remove}
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

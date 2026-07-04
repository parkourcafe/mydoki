"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { categories, docSubtypes, type DocCategory } from "@/lib/categories";
import type { Locale } from "@/lib/i18n";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import { attachDocumentFile, createDocumentMeta } from "@/app/my/actions";

const M = {
  ru: {
    pickFile: "📎 Выбрать файл",
    photo: "📷 Сфотографировать",
    recognizing: "Распознаю…",
    recognize: "✨ Распознать даты (AI)",
    filesLabel: "Файлы документа",
    remove: "убрать",
    filesHint:
      "На телефоне «Сфотографировать» откроет камеру. Файлы хранятся в приватном хранилище семьи.",
    free: "Свободно",
    gb: "ГБ",
    quotaExceeded:
      "Не хватает места в хранилище семьи. Удалите ненужные файлы — или напишите нам, чтобы поднять лимит.",
    owner: "Чей документ",
    title: "Название",
    optional: "необязательно",
    untitled: "Документ",
    titleAutoHint:
      "Можно не заполнять — назовём по файлу или поставим дату. Переименуешь потом.",
    titlePh: "Паспорт РФ",
    category: "Категория",
    subtype: "Тип / подтип",
    subtypePh: "паспорт, диплом…",
    issuer: "Кем выдан",
    docNumber: "Номер",
    issuedAt: "Дата выдачи",
    expiresAt: "Действует до",
    tags: "Теги (через запятую)",
    tagsPh: "срочно, оригинал",
    notes: "Заметки",
    saving: "Сохраняю…",
    save: "Сохранить документ",
    pickFirst: "Сначала выберите файл или сфотографируйте документ.",
    recognizeFail: "Не удалось распознать.",
    autofilled: "Поля заполнены автоматически — проверьте и сохраните.",
    networkFail: "Сеть недоступна — попробуйте ещё раз.",
    enterTitle: "Введите название документа.",
    fileErr: (name: string, m: string) => `Файл «${name}»: ${m}`,
    saveFail: "Не удалось сохранить.",
    notVerified: "Подтвердите email, чтобы загружать документы (баннер выше).",
    kb: "КБ",
    mb: "МБ",
  },
  en: {
    pickFile: "📎 Choose file",
    photo: "📷 Take a photo",
    recognizing: "Recognizing…",
    recognize: "✨ Recognize dates (AI)",
    filesLabel: "Document files",
    remove: "remove",
    filesHint:
      "On a phone, “Take a photo” opens the camera. Files are kept in your family's private storage.",
    free: "Free",
    gb: "GB",
    quotaExceeded:
      "Not enough space in your family's storage. Delete files you don't need — or contact us to raise the limit.",
    owner: "Whose document",
    title: "Title",
    optional: "optional",
    untitled: "Document",
    titleAutoHint:
      "Leave it blank — we'll name it from the file or use the date. Rename later.",
    titlePh: "Passport",
    category: "Category",
    subtype: "Type / subtype",
    subtypePh: "passport, diploma…",
    issuer: "Issued by",
    docNumber: "Number",
    issuedAt: "Issue date",
    expiresAt: "Valid until",
    tags: "Tags (comma-separated)",
    tagsPh: "urgent, original",
    notes: "Notes",
    saving: "Saving…",
    save: "Save document",
    pickFirst: "First choose a file or take a photo of the document.",
    recognizeFail: "Could not recognize.",
    autofilled: "Fields filled in automatically — review and save.",
    networkFail: "Network unavailable — please try again.",
    enterTitle: "Enter the document title.",
    fileErr: (name: string, m: string) => `File “${name}”: ${m}`,
    saveFail: "Could not save.",
    notVerified: "Verify your email to upload documents (see the banner above).",
    kb: "KB",
    mb: "MB",
  },
  uz: {
    pickFile: "📎 Fayl tanlash",
    photo: "📷 Suratga olish",
    recognizing: "Aniqlanmoqda…",
    recognize: "✨ Sanalarni aniqlash (AI)",
    filesLabel: "Hujjat fayllari",
    remove: "olib tashlash",
    filesHint:
      "Telefonda “Suratga olish” kamerani ochadi. Fayllar oilaning shaxsiy xotirasida saqlanadi.",
    free: "Boʻsh",
    gb: "GB",
    quotaExceeded:
      "Oila xotirasida joy yetarli emas. Keraksiz fayllarni oʻchiring — yoki limitni oshirish uchun bizga yozing.",
    owner: "Kimning hujjati",
    title: "Nomi",
    optional: "ixtiyoriy",
    untitled: "Hujjat",
    titleAutoHint:
      "Toʻldirmasangiz ham boʻladi — fayl nomi yoki sana boʻyicha nomlaymiz. Keyin oʻzgartirasiz.",
    titlePh: "Pasport",
    category: "Toifa",
    subtype: "Turi / kichik turi",
    subtypePh: "pasport, diplom…",
    issuer: "Kim tomonidan berilgan",
    docNumber: "Raqami",
    issuedAt: "Berilgan sana",
    expiresAt: "Amal qilish muddati",
    tags: "Teglar (vergul bilan)",
    tagsPh: "shoshilinch, asl nusxa",
    notes: "Izohlar",
    saving: "Saqlanmoqda…",
    save: "Hujjatni saqlash",
    pickFirst: "Avval fayl tanlang yoki hujjatni suratga oling.",
    recognizeFail: "Aniqlab boʻlmadi.",
    autofilled: "Maydonlar avtomatik toʻldirildi — tekshiring va saqlang.",
    networkFail: "Tarmoq mavjud emas — qaytadan urinib koʻring.",
    enterTitle: "Hujjat nomini kiriting.",
    fileErr: (name: string, m: string) => `“${name}” fayli: ${m}`,
    saveFail: "Saqlab boʻlmadi.",
    notVerified: "Hujjat yuklash uchun emailni tasdiqlang (yuqoridagi banner).",
    kb: "KB",
    mb: "MB",
  },
  id: {
    pickFile: "📎 Pilih berkas",
    photo: "📷 Ambil foto",
    recognizing: "Mengenali…",
    recognize: "✨ Kenali tanggal (AI)",
    filesLabel: "Berkas dokumen",
    remove: "hapus",
    filesHint:
      "Di ponsel, “Ambil foto” membuka kamera. Berkas disimpan di penyimpanan pribadi keluarga.",
    free: "Tersisa",
    gb: "GB",
    quotaExceeded:
      "Ruang penyimpanan keluarga tidak cukup. Hapus berkas yang tidak perlu — atau hubungi kami untuk menaikkan batas.",
    owner: "Dokumen milik siapa",
    title: "Judul",
    optional: "opsional",
    untitled: "Dokumen",
    titleAutoHint:
      "Boleh dikosongkan — kami beri nama dari berkas atau tanggal. Ganti nanti.",
    titlePh: "Paspor",
    category: "Kategori",
    subtype: "Tipe / subtipe",
    subtypePh: "paspor, ijazah…",
    issuer: "Diterbitkan oleh",
    docNumber: "Nomor",
    issuedAt: "Tanggal terbit",
    expiresAt: "Berlaku sampai",
    tags: "Tag (dipisahkan koma)",
    tagsPh: "mendesak, asli",
    notes: "Catatan",
    saving: "Menyimpan…",
    save: "Simpan dokumen",
    pickFirst: "Pilih berkas atau ambil foto dokumen terlebih dahulu.",
    recognizeFail: "Tidak dapat mengenali.",
    autofilled: "Kolom terisi otomatis — periksa dan simpan.",
    networkFail: "Jaringan tidak tersedia — silakan coba lagi.",
    enterTitle: "Masukkan judul dokumen.",
    fileErr: (name: string, m: string) => `Berkas “${name}”: ${m}`,
    saveFail: "Tidak dapat menyimpan.",
    notVerified: "Verifikasi email untuk mengunggah dokumen (lihat banner di atas).",
    kb: "KB",
    mb: "MB",
  },
} as const;

type Fields = {
  title: string;
  category: string;
  subtype: string;
  issuer: string;
  doc_number: string;
  issued_at: string;
  expires_at: string;
  tags: string;
  notes: string;
};

const EMPTY: Fields = {
  title: "",
  category: "identity",
  subtype: "",
  issuer: "",
  doc_number: "",
  issued_at: "",
  expires_at: "",
  tags: "",
  notes: "",
};

/** Имя файла без расширения — как авто-название документа. */
function baseName(name: string): string {
  const dot = name.lastIndexOf(".");
  return (dot > 0 ? name.slice(0, dot) : name).trim();
}

function fmtSize(n: number, t: (typeof M)[Locale]) {
  if (n >= 1024 * 1024 * 1024)
    return `${(n / 1024 / 1024 / 1024).toFixed(1)} ${t.gb}`;
  if (n < 1024 * 1024) return `${Math.round(n / 1024)} ${t.kb}`;
  return `${(n / 1024 / 1024).toFixed(1)} ${t.mb}`;
}

export default function DocumentForm({
  memberId,
  assetId,
  locale,
  storageUsed = 0,
  storageLimit,
  aiEnabled = false,
  owners,
  defaultCategory,
  customCategoryId,
}: {
  memberId?: string;
  assetId?: string;
  locale: Locale;
  storageUsed?: number;
  storageLimit?: number;
  aiEnabled?: boolean;
  owners?: { id: string; name: string; kind: "member" | "asset" }[];
  defaultCategory?: string;
  // Если документ кладут в пользовательский раздел — встроенную категорию
  // не показываем, а помечаем документ этим разделом.
  customCategoryId?: string;
}) {
  const t = M[locale];
  const remaining =
    storageLimit != null ? Math.max(0, storageLimit - storageUsed) : null;
  const router = useRouter();
  // Когда форма открыта не у конкретного человека/имущества (например, из
  // категории документов) — даём выбрать владельца из списка семьи.
  const pickOwner = !memberId && !assetId && !!owners?.length;
  const [owner, setOwner] = useState(
    pickOwner ? `${owners![0].kind}:${owners![0].id}` : ""
  );
  const [f, setF] = useState<Fields>(() => ({
    ...EMPTY,
    category: defaultCategory || EMPTY.category,
  }));
  const [files, setFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveErr, setSaveErr] = useState<string | null>(null);
  const pickRef = useRef<HTMLInputElement>(null);
  const camRef = useRef<HTMLInputElement>(null);

  const set = (k: keyof Fields, v: string) => setF((p) => ({ ...p, [k]: v }));

  function addFiles(list: FileList | null) {
    if (!list || !list.length) return;
    const incoming = Array.from(list);
    setFiles((prev) => {
      const seen = new Set(prev.map((x) => x.name + x.size));
      return [...prev, ...incoming.filter((x) => !seen.has(x.name + x.size))];
    });
    // Распознавание — только по явному нажатию кнопки (приватность: фото
    // документа уходит ИИ-провайдеру лишь когда пользователь сам это попросил).
  }

  function removeFile(i: number) {
    setFiles((prev) => prev.filter((_, idx) => idx !== i));
  }

  async function classify(picked?: File, silent = false) {
    const file = picked ?? files[0];
    if (!file) {
      if (!silent) setMsg(t.pickFirst);
      return;
    }
    if (!silent) setMsg(null);
    setBusy(true);
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/classify", { method: "POST", body });
      const data = await res.json();
      if (!res.ok) {
        if (!silent) setMsg(data.error ?? t.recognizeFail);
      } else {
        setF((p) => ({
          ...p,
          category: data.category ?? p.category,
          subtype: data.subtype ?? p.subtype,
          title: data.title ?? p.title,
          issuer: data.issuer ?? p.issuer,
          doc_number: data.doc_number ?? p.doc_number,
          issued_at: data.issued_at ?? p.issued_at,
          expires_at: data.expires_at ?? p.expires_at,
          tags:
            Array.isArray(data.tags) && data.tags.length
              ? data.tags.join(", ")
              : p.tags,
        }));
        setMsg(t.autofilled);
      }
    } catch {
      if (!silent) setMsg(t.networkFail);
    } finally {
      setBusy(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaveErr(null);
    // «Без писанины»: название необязательно. Пусто — берём имя файла, иначе
    // «Документ + дата». Документ всё равно получит осмысленный заголовок.
    const today = new Date().toISOString().slice(0, 10);
    let title = f.title.trim();
    if (!title)
      title = files.length ? baseName(files[0].name) : "";
    if (!title) title = `${t.untitled} ${today}`;
    // Предпроверка лимита хранилища — не грузим файлы, если места не хватит.
    if (files.length && storageLimit != null) {
      const addBytes = files.reduce((s, file) => s + file.size, 0);
      if (storageUsed + addBytes > storageLimit) {
        setSaveErr(t.quotaExceeded);
        return;
      }
    }
    setSaving(true);
    try {
      const tags = f.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      let member_id = memberId ?? null;
      let asset_id = assetId ?? null;
      if (pickOwner && owner) {
        const [kind, oid] = owner.split(":");
        if (kind === "member") member_id = oid;
        else if (kind === "asset") asset_id = oid;
      }

      const { id, householdId } = await createDocumentMeta({
        member_id,
        asset_id,
        title,
        category: f.category,
        custom_category_id: customCategoryId ?? null,
        subtype: f.subtype,
        issuer: f.issuer,
        doc_number: f.doc_number,
        issued_at: f.issued_at,
        expires_at: f.expires_at,
        notes: f.notes,
        tags,
      });

      if (files.length) {
        const supabase = getSupabaseBrowser();
        for (const file of files) {
          const safe = file.name.replace(/[^\w.\-]+/g, "_") || "file";
          const path = `${householdId}/${id}/${Date.now()}-${safe}`;
          const { error } = await supabase.storage
            .from("vault-files")
            .upload(path, file, {
              contentType: file.type || "application/octet-stream",
              upsert: false,
            });
          if (error) throw new Error(t.fileErr(file.name, error.message));
          await attachDocumentFile({
            documentId: id,
            householdId,
            storagePath: path,
            fileName: file.name,
            mimeType: file.type || null,
            sizeBytes: file.size,
          });
        }
      }

      router.push(`/my/documents/${id}`);
    } catch (err) {
      const m = err instanceof Error ? err.message : "";
      setSaveErr(
        m === "QUOTA_EXCEEDED"
          ? t.quotaExceeded
          : m === "EMAIL_NOT_VERIFIED"
            ? t.notVerified
            : m || t.saveFail
      );
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 grid gap-4 sm:grid-cols-2">
      <div className="sm:col-span-2 rounded-lg border border-dashed border-brand-300 bg-brand-50/40 p-3">
        <label className="label">{t.filesLabel}</label>

        <input
          ref={pickRef}
          type="file"
          multiple
          accept="image/*,application/pdf"
          className="hidden"
          onChange={(e) => addFiles(e.target.files)}
        />
        <input
          ref={camRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(e) => addFiles(e.target.files)}
        />

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => pickRef.current?.click()}
            className="btn-ghost"
          >
            {t.pickFile}
          </button>
          <button
            type="button"
            onClick={() => camRef.current?.click()}
            className="btn-ghost"
          >
            {t.photo}
          </button>
          {aiEnabled && (
            <button
              type="button"
              onClick={() => classify()}
              disabled={busy || !files.length}
              className="btn-ghost"
            >
              {busy ? t.recognizing : t.recognize}
            </button>
          )}
        </div>

        {files.length > 0 && (
          <ul className="mt-3 space-y-1">
            {files.map((file, i) => (
              <li
                key={file.name + file.size + i}
                className="flex items-center justify-between rounded-md bg-white px-2 py-1 text-sm"
              >
                <span className="truncate">
                  {file.name}{" "}
                  <span className="text-xs text-slate-400">
                    {fmtSize(file.size, t)}
                  </span>
                </span>
                <button
                  type="button"
                  onClick={() => removeFile(i)}
                  className="ml-2 text-xs text-red-500 hover:underline"
                >
                  {t.remove}
                </button>
              </li>
            ))}
          </ul>
        )}

        <p className="mt-2 text-xs text-slate-500">{t.filesHint}</p>
        {remaining != null && storageLimit != null && (
          <p className="mt-1 text-xs text-slate-400">
            {t.free}: {fmtSize(remaining, t)} / {fmtSize(storageLimit, t)}
          </p>
        )}
        {msg && <p className="mt-1 text-xs text-slate-600">{msg}</p>}
      </div>

      {pickOwner && (
        <div className="sm:col-span-2">
          <label className="label">{t.owner}</label>
          <select
            value={owner}
            onChange={(e) => setOwner(e.target.value)}
            className="input"
          >
            {owners!.map((o) => (
              <option key={`${o.kind}:${o.id}`} value={`${o.kind}:${o.id}`}>
                {o.name}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="sm:col-span-2">
        <label className="label">
          {t.title}{" "}
          <span className="font-normal text-slate-400">({t.optional})</span>
        </label>
        <input
          value={f.title}
          onChange={(e) => set("title", e.target.value)}
          className="input"
          placeholder={t.titlePh}
        />
        <p className="mt-1 text-xs text-slate-400">{t.titleAutoHint}</p>
      </div>
      {!customCategoryId && (
        <div>
          <label className="label">{t.category}</label>
          <select
            value={f.category}
            onChange={(e) => set("category", e.target.value)}
            className="input"
          >
            {categories(locale).map((c) => (
              <option key={c.key} value={c.key}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
      )}
      <div>
        <label className="label">{t.subtype}</label>
        <input
          list="doc-subtypes"
          value={f.subtype}
          onChange={(e) => set("subtype", e.target.value)}
          className="input"
          placeholder={t.subtypePh}
        />
        <datalist id="doc-subtypes">
          {docSubtypes(locale, f.category as DocCategory).map((s) => (
            <option key={s} value={s} />
          ))}
        </datalist>
      </div>
      <div>
        <label className="label">{t.issuer}</label>
        <input
          value={f.issuer}
          onChange={(e) => set("issuer", e.target.value)}
          className="input"
        />
      </div>
      <div>
        <label className="label">{t.docNumber}</label>
        <input
          value={f.doc_number}
          onChange={(e) => set("doc_number", e.target.value)}
          className="input"
        />
      </div>
      <div>
        <label className="label">{t.issuedAt}</label>
        <input
          type="date"
          value={f.issued_at}
          onChange={(e) => set("issued_at", e.target.value)}
          className="input"
        />
      </div>
      <div>
        <label className="label">{t.expiresAt}</label>
        <input
          type="date"
          value={f.expires_at}
          onChange={(e) => set("expires_at", e.target.value)}
          className="input"
        />
      </div>
      <div className="sm:col-span-2">
        <label className="label">{t.tags}</label>
        <input
          value={f.tags}
          onChange={(e) => set("tags", e.target.value)}
          className="input"
          placeholder={t.tagsPh}
        />
      </div>
      <div className="sm:col-span-2">
        <label className="label">{t.notes}</label>
        <textarea
          rows={2}
          value={f.notes}
          onChange={(e) => set("notes", e.target.value)}
          className="input"
        />
      </div>

      {saveErr && (
        <p className="sm:col-span-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {saveErr}
        </p>
      )}

      <div className="sm:col-span-2">
        <button type="submit" disabled={saving} className="btn-primary">
          {saving ? t.saving : t.save}
        </button>
      </div>
    </form>
  );
}

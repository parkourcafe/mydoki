"use client";

import { useRef, useState } from "react";
import type { Locale } from "@/lib/i18n";
import { attachDocumentFile, createDocumentMeta, runDocumentChecks } from "@/app/my/actions";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import { createMedicalSharePackage, createSharePackage } from "./actions";
import { trackEvent } from "@/lib/events";

const M = {
  ru: {
    intro: "Отметьте документы, которые войдут в одну ссылку для работодателя.",
    title: "Название пакета", titlePh: "напр. Документы для Sunset Cafe", medicalTitlePh: "напр. Медицинские документы Анны", optional: "необязательно",
    days: "Срок действия (дней)", download: "Разрешить скачивание",
    noDocs: "В сейфе пока нет документов. Сначала загрузите их в разделе «Документы».",
    create: "Создать ссылку", creating: "Создаю…", selectFirst: "Отметьте хотя бы один документ.",
    ready: "Ссылка готова — отправьте её работодателю:", copy: "Копировать", copied: "Скопировано ✓",
    another: "Создать ещё одну", failed: "Не удалось создать ссылку.",
    packageKind: "Тип пакета", generic: "Обычный пакет", medical: "Медицинский пакет для врача",
    medicalHint: "Создадим черновики резюме на Bahasa Indonesia. Ссылка откроется только после вашей проверки.",
    password: "Пароль", passwordPh: "необязательно", maxViews: "Лимит просмотров", unlimited: "0 — без лимита",
    consent: "Я разрешаю передать выбранные медицинские файлы AI-провайдеру для распознавания, а извлечённые метаданные — для перевода на Bahasa Indonesia.",
    consentRequired: "Для автоматического перевода нужно явное согласие.", reviewing: "Готовлю перевод…",
    medicalIntro: "Выберите медицинские документы для врача. После создания вы проверите перевод перед публикацией.",
    dropTitle: "Перетащите медицинские файлы сюда", dropHint: "PDF, JPG, PNG — каждый файл сохранится в сейфе и сразу добавится в пакет.",
    browse: "или выбрать файлы", owner: "Чьи это документы", noOwner: "Сначала добавьте человека в семейный сейф.",
    uploading: "Загружаю файлы…", uploadFailed: "Не удалось загрузить файл", invalidFiles: "Можно загрузить изображения или PDF.",
    tooMany: "В одном медицинском пакете может быть не более 20 документов.",
  },
  en: {
    intro: "Tick the documents to include in a single link for the employer.",
    title: "Package name", titlePh: "e.g. Documents for Sunset Cafe", medicalTitlePh: "e.g. Anna's medical documents", optional: "optional",
    days: "Valid for (days)", download: "Allow download",
    noDocs: "No documents in your vault yet. Upload them in the Documents section first.",
    create: "Create link", creating: "Creating…", selectFirst: "Tick at least one document.",
    ready: "Your link is ready — send it to the employer:", copy: "Copy", copied: "Copied ✓",
    another: "Create another", failed: "Could not create the link.",
    packageKind: "Package type", generic: "Regular package", medical: "Medical package for a doctor",
    medicalHint: "We create Bahasa Indonesia summary drafts. The link stays closed until you review them.",
    password: "Password", passwordPh: "optional", maxViews: "View limit", unlimited: "0 — unlimited",
    consent: "I allow selected medical files to be sent to the AI provider for recognition and extracted metadata for Bahasa Indonesia translation.",
    consentRequired: "Explicit consent is required for automatic translation.", reviewing: "Preparing translation…",
    medicalIntro: "Select medical documents for the doctor. You will review the translation before publishing.",
    dropTitle: "Drop medical files here", dropHint: "PDF, JPG, PNG — each file is saved to the vault and added to the package.",
    browse: "or choose files", owner: "Whose documents are these", noOwner: "Add a person to the family vault first.",
    uploading: "Uploading files…", uploadFailed: "Could not upload file", invalidFiles: "Only images and PDF files are supported.",
    tooMany: "A medical package can contain no more than 20 documents.",
  },
  id: {
    intro: "Centang dokumen yang akan digabung dalam satu tautan untuk perusahaan.",
    title: "Nama paket", titlePh: "mis. Dokumen untuk Sunset Cafe", medicalTitlePh: "mis. Dokumen medis Anna", optional: "opsional",
    days: "Berlaku (hari)", download: "Izinkan unduh",
    noDocs: "Belum ada dokumen di brankas. Unggah dulu di bagian Dokumen.",
    create: "Buat tautan", creating: "Membuat…", selectFirst: "Centang minimal satu dokumen.",
    ready: "Tautan siap — kirim ke perusahaan:", copy: "Salin", copied: "Tersalin ✓",
    another: "Buat lagi", failed: "Gagal membuat tautan.",
    packageKind: "Jenis paket", generic: "Paket biasa", medical: "Paket medis untuk dokter",
    medicalHint: "Kami membuat draf ringkasan Bahasa Indonesia. Tautan tetap tertutup sampai Anda memeriksanya.",
    password: "Kata sandi", passwordPh: "opsional", maxViews: "Batas tampilan", unlimited: "0 — tanpa batas",
    consent: "Saya mengizinkan berkas medis terpilih dikirim ke penyedia AI untuk dikenali dan metadata hasil ekstraksi diterjemahkan ke Bahasa Indonesia.",
    consentRequired: "Persetujuan diperlukan untuk terjemahan otomatis.", reviewing: "Menyiapkan terjemahan…",
    medicalIntro: "Pilih dokumen medis untuk dokter. Anda akan meninjau terjemahan sebelum menerbitkannya.",
    dropTitle: "Tarik berkas medis ke sini", dropHint: "PDF, JPG, PNG — setiap berkas disimpan di brankas dan ditambahkan ke paket.",
    browse: "atau pilih berkas", owner: "Dokumen milik siapa", noOwner: "Tambahkan orang ke brankas keluarga terlebih dahulu.",
    uploading: "Mengunggah berkas…", uploadFailed: "Berkas tidak dapat diunggah", invalidFiles: "Hanya gambar dan PDF yang didukung.",
    tooMany: "Paket medis dapat berisi maksimal 20 dokumen.",
  },
  uz: {
    intro: "Ish beruvchi uchun bitta havolaga kiradigan hujjatlarni belgilang.",
    title: "Paket nomi", titlePh: "mas. Sunset Cafe uchun hujjatlar", medicalTitlePh: "mas. Annaning tibbiy hujjatlari", optional: "ixtiyoriy",
    days: "Amal muddati (kun)", download: "Yuklab olishga ruxsat",
    noDocs: "Xotirada hali hujjat yo‘q. Avval «Hujjatlar» bo‘limida yuklang.",
    create: "Havola yaratish", creating: "Yaratilmoqda…", selectFirst: "Kamida bitta hujjatni belgilang.",
    ready: "Havola tayyor — ish beruvchiga yuboring:", copy: "Nusxa olish", copied: "Nusxalandi ✓",
    another: "Yana yaratish", failed: "Havola yaratilmadi.",
    packageKind: "Paket turi", generic: "Oddiy paket", medical: "Shifokor uchun tibbiy paket",
    medicalHint: "Bahasa Indonesia tilida xulosa qoralamalari yaratiladi. Siz tekshirmaguningizcha havola yopiq qoladi.",
    password: "Parol", passwordPh: "ixtiyoriy", maxViews: "Ko‘rishlar limiti", unlimited: "0 — limitsiz",
    consent: "Tanlangan tibbiy fayllarni aniqlash uchun AI provayderiga, ajratilgan metama’lumotlarni esa Bahasa Indonesia tarjimasi uchun yuborishga roziman.",
    consentRequired: "Avtomatik tarjima uchun aniq rozilik kerak.", reviewing: "Tarjima tayyorlanmoqda…",
    medicalIntro: "Shifokor uchun tibbiy hujjatlarni tanlang. E’lon qilishdan oldin tarjimani tekshirasiz.",
    dropTitle: "Tibbiy fayllarni shu yerga tashlang", dropHint: "PDF, JPG, PNG — har bir fayl seyfga saqlanadi va paketga qo‘shiladi.",
    browse: "yoki fayllarni tanlang", owner: "Bu kimning hujjatlari", noOwner: "Avval oilaviy seyfga odam qo‘shing.",
    uploading: "Fayllar yuklanmoqda…", uploadFailed: "Faylni yuklab bo‘lmadi", invalidFiles: "Faqat rasm va PDF fayllari qo‘llanadi.",
    tooMany: "Bitta tibbiy paketda 20 tadan ko‘p hujjat bo‘lishi mumkin emas.",
  },
} as const;

export default function SharePackageManager({
  locale,
  documents,
  owners,
  medicalEnabled,
}: {
  locale: Locale;
  documents: { id: string; title: string; sub: string }[];
  owners: { id: string; name: string }[];
  medicalEnabled: boolean;
}) {
  const t = M[locale];
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [availableDocuments, setAvailableDocuments] = useState(documents);
  const [title, setTitle] = useState("");
  const [days, setDays] = useState(7);
  const [download, setDownload] = useState(true);
  const [kind, setKind] = useState<"generic" | "medical_doctor">("generic");
  const [password, setPassword] = useState("");
  const [maxViews, setMaxViews] = useState(0);
  const [translationConsent, setTranslationConsent] = useState(false);
  const [ownerId, setOwnerId] = useState(owners[0]?.id ?? "");
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [link, setLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  function baseName(name: string): string {
    const dot = name.lastIndexOf(".");
    return (dot > 0 ? name.slice(0, dot) : name).trim() || "Medical document";
  }

  async function sha256Hex(file: File): Promise<string> {
    try {
      const digest = await crypto.subtle.digest("SHA-256", await file.arrayBuffer());
      return Array.from(new Uint8Array(digest))
        .map((byte) => byte.toString(16).padStart(2, "0"))
        .join("");
    } catch {
      return "";
    }
  }

  function acceptedFile(file: File): boolean {
    return file.type === "application/pdf" || file.type.startsWith("image/") || /\.(pdf|jpe?g|png|webp|heic)$/i.test(file.name);
  }

  async function importFiles(incoming: File[]) {
    setError(null);
    if (!ownerId) return setError(t.noOwner);
    if (!translationConsent) return setError(t.consentRequired);
    const files = incoming.filter(acceptedFile);
    if (!files.length) return setError(t.invalidFiles);
    const alreadySelected = Object.values(selected).filter(Boolean).length;
    if (alreadySelected + files.length > 20) return setError(t.tooMany);

    setUploading(true);
    const added: { id: string; title: string; sub: string }[] = [];
    const supabase = getSupabaseBrowser();
    try {
      for (const file of files) {
        let documentId = "";
        let storagePath = "";
        try {
          let recognized: Record<string, unknown> = {};
          try {
            const recognitionBody = new FormData();
            recognitionBody.append("file", file);
            recognitionBody.append("medical_share_consent", "true");
            const recognitionResponse = await fetch("/api/classify", {
              method: "POST",
              body: recognitionBody,
            });
            if (recognitionResponse.ok) recognized = await recognitionResponse.json();
          } catch {
            // Распознавание помогает, но его недоступность не блокирует загрузку.
          }
          const text = (value: unknown) => typeof value === "string" ? value : "";
          const title = text(recognized.title) || baseName(file.name);
          const created = await createDocumentMeta({
            member_id: ownerId,
            title,
            category: "medical",
            subtype: text(recognized.subtype) || "medical document",
            issuer: text(recognized.issuer),
            doc_number: text(recognized.doc_number),
            issued_at: text(recognized.issued_at),
            expires_at: text(recognized.expires_at),
            holder_name: text(recognized.holder_name),
            tags: Array.isArray(recognized.tags)
              ? recognized.tags.filter((tag): tag is string => typeof tag === "string")
              : [],
          });
          documentId = created.id;
          const safeName = file.name.replace(/[^\w.\-]+/g, "_") || "file";
          storagePath = `${created.householdId}/${documentId}/${Date.now()}-${safeName}`;
          const { error: uploadError } = await supabase.storage
            .from("vault-files")
            .upload(storagePath, file, {
              contentType: file.type || "application/octet-stream",
              upsert: false,
            });
          if (uploadError) throw uploadError;
          await attachDocumentFile({
            documentId,
            householdId: created.householdId,
            storagePath,
            fileName: file.name,
            mimeType: file.type || null,
            sizeBytes: file.size,
            fileHash: await sha256Hex(file),
          });
          try {
            await runDocumentChecks(documentId);
          } catch {
            // Подсказки владельца можно перезапустить из карточки документа.
          }
          added.push({ id: documentId, title, sub: t.medical });
          trackEvent("document_added", { category: "medical", via: "share_drop" });
        } catch (fileError) {
          try {
            if (storagePath) await supabase.storage.from("vault-files").remove([storagePath]);
            if (documentId) await supabase.from("documents").delete().eq("id", documentId);
          } catch {
            // Основная ошибка загрузки важнее best-effort очистки незавершённой записи.
          }
          const detail = fileError instanceof Error ? fileError.message : "";
          throw new Error(`${t.uploadFailed}: ${file.name}${detail ? ` — ${detail}` : ""}`);
        }
      }
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : t.uploadFailed);
    } finally {
      if (added.length > 0) {
        setAvailableDocuments((current) => [...added, ...current]);
        setSelected((current) => {
          const next = { ...current };
          for (const document of added) next[document.id] = true;
          return next;
        });
      }
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  function toggle(id: string) {
    setSelected((p) => ({ ...p, [id]: !p[id] }));
  }

  async function create() {
    setError(null);
    const ids = Object.keys(selected).filter((k) => selected[k]);
    if (!ids.length) return setError(t.selectFirst);
    if (kind === "medical_doctor" && ids.length > 20) return setError(t.tooMany);
    if (uploading) return;
    setBusy(true);
    if (kind === "medical_doctor" && !translationConsent) {
      setBusy(false);
      return setError(t.consentRequired);
    }
    const res = kind === "medical_doctor"
      ? await createMedicalSharePackage({
          documentIds: ids, days, allowDownload: download, title, password,
          maxViews, translationConsent,
        })
      : await createSharePackage({
          documentIds: ids, days, allowDownload: download, title, password, maxViews,
        });
    setBusy(false);
    if ("error" in res) return setError(t.failed);
    if ("reviewId" in res) {
      window.location.href = `/my/share/${res.reviewId}`;
      return;
    }
    // UBA: пакет документов расшарен по истекающей ссылке.
    trackEvent("document_shared", { kind: "package", expires_days: days });
    setLink(`${window.location.origin}/pkg/${res.token}`);
  }

  function reset() {
    setLink(null);
    setSelected({});
    setTitle("");
    setCopied(false);
    setPassword("");
    setMaxViews(0);
    setTranslationConsent(false);
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
      <p className="text-sm text-slate-500">{kind === "medical_doctor" ? t.medicalIntro : t.intro}</p>

      <div>
        <label className="label">{t.packageKind}</label>
        <select className="input" value={kind} onChange={(e) => setKind(e.target.value as typeof kind)}>
          <option value="generic">{t.generic}</option>
          {medicalEnabled && <option value="medical_doctor">{t.medical}</option>}
        </select>
        {kind === "medical_doctor" && <p className="mt-1 text-xs text-slate-500">{t.medicalHint}</p>}
      </div>

      {kind === "medical_doctor" && (
        <div className="space-y-2">
          {owners.length > 0 ? (
            <>
              <div>
                <label className="label" htmlFor="medical-owner">{t.owner}</label>
                <select id="medical-owner" className="input" value={ownerId} onChange={(event) => setOwnerId(event.target.value)}>
                  {owners.map((owner) => <option key={owner.id} value={owner.id}>{owner.name}</option>)}
                </select>
              </div>
              <label className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
                <input type="checkbox" checked={translationConsent}
                  onChange={(event) => setTranslationConsent(event.target.checked)} className="mt-0.5 h-4 w-4" />
                <span>{t.consent}</span>
              </label>
              <input ref={fileRef} type="file" multiple accept="image/*,application/pdf" className="hidden"
                onChange={(event) => void importFiles(Array.from(event.target.files ?? []))} />
              <button
                type="button"
                disabled={uploading}
                onClick={() => fileRef.current?.click()}
                onDragEnter={(event) => { event.preventDefault(); setDragging(true); }}
                onDragOver={(event) => { event.preventDefault(); setDragging(true); }}
                onDragLeave={(event) => { event.preventDefault(); setDragging(false); }}
                onDrop={(event) => {
                  event.preventDefault();
                  setDragging(false);
                  void importFiles(Array.from(event.dataTransfer.files));
                }}
                className={`w-full rounded-xl border-2 border-dashed px-4 py-6 text-center transition ${
                  dragging ? "border-brand-500 bg-brand-50" : "border-brand-200 bg-brand-50/40 hover:border-brand-400"
                }`}
              >
                <span className="block text-2xl">📄</span>
                <span className="mt-1 block text-sm font-medium text-slate-800">{uploading ? t.uploading : t.dropTitle}</span>
                <span className="mt-1 block text-xs text-slate-500">{t.dropHint}</span>
                <span className="mt-2 block text-sm text-brand-600">{t.browse}</span>
              </button>
            </>
          ) : (
            <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">{t.noOwner}</p>
          )}
        </div>
      )}

      <ul className="space-y-1">
        {availableDocuments.length === 0 && kind !== "medical_doctor" && (
          <li className="text-sm text-slate-500">{t.noDocs}</li>
        )}
        {availableDocuments.map((d) => (
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
          <input className="input" value={title} onChange={(e) => setTitle(e.target.value)}
            placeholder={kind === "medical_doctor" ? t.medicalTitlePh : t.titlePh} />
        </div>
        <div>
          <label className="label">{t.days}</label>
          <input type="number" min={1} max={90} className="input" value={days}
            onChange={(e) => setDays(Number(e.target.value))} />
        </div>
        <div>
          <label className="label">{t.password}</label>
          <input type="password" className="input" value={password}
            onChange={(e) => setPassword(e.target.value)} placeholder={t.passwordPh} />
        </div>
        <div>
          <label className="label">{t.maxViews}</label>
          <input type="number" min={0} className="input" value={maxViews}
            onChange={(e) => setMaxViews(Number(e.target.value))} />
          <p className="mt-1 text-xs text-slate-400">{t.unlimited}</p>
        </div>
        <label className="flex items-center gap-2 self-end pb-2 text-sm text-slate-700">
          <input type="checkbox" checked={download} onChange={(e) => setDownload(e.target.checked)} className="h-4 w-4" />
          {t.download}
        </label>
      </div>

      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      <button type="button" disabled={busy || uploading} className="btn-primary" onClick={create}>
        {busy ? (kind === "medical_doctor" ? t.reviewing : t.creating) : t.create}
      </button>
    </div>
  );
}

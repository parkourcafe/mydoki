import Link from "next/link";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import {
  getAsset,
  getDocument,
  getMember,
  listChecksByVersion,
  listFiles,
  listSharesByDocument,
  listVersions,
  signFiles,
} from "@/lib/queries";
import { categoryLabel } from "@/lib/categories";
import { getLocale } from "@/lib/i18n";
import { logAudit, listDocumentAudit } from "@/lib/audit";
import type { AuditEntry, DocumentCheck } from "@/lib/types";
import CopyButton from "@/components/CopyButton";
import FileActions from "@/components/FileActions";
import OfflineSave from "@/components/OfflineSave";
import VersionUpload from "./VersionUpload";
import {
  archiveDocument,
  createShare,
  deleteDocument,
  revokeShare,
  runChecks,
  unarchiveDocument,
} from "@/app/my/actions";

const M = {
  ru: {
    data: "Данные",
    category: "Категория",
    type: "Тип",
    issuer: "Кем выдан",
    number: "Номер",
    issued: "Выдан",
    validUntil: "Действует до",
    files: "Файлы",
    noFiles: "Файлы не прикреплены.",
    file: "файл",
    noAccess: "нет доступа",
    signedHint: "Ссылки на файлы временные (signed URL, ~2 мин).",
    share: "Поделиться",
    active: "Активна",
    revoked: "Отозвана",
    expired: "Истекла",
    until: "до",
    views: "просмотров",
    download: "скачивание",
    revoke: "Отозвать",
    days: "Действует, дней",
    viewsLimit: "Лимит просмотров",
    noLimit: "0 — без лимита",
    watermark: "Водяной знак",
    downloadLabel: "Скачивание",
    createLink: "Создать ссылку",
    deleteDoc: "Удалить документ",
    versions: "Версии",
    noVersions: "Версий пока нет.",
    current: "текущая",
    checks: "Проверки",
    runCheck: "Проверить сейчас",
    noChecks: "Проверки ещё не запускались.",
    lastChecked: "Проверено",
    archiveSection: "Архив",
    archiveBtn: "Архивировать",
    unarchiveBtn: "Вернуть из архива",
    archivedBadge: "В архиве",
    archivedNote: "Документ в архиве — скрыт из списков. Файлы и история сохранены.",
    rExpiry: "Срок действия",
    rNameMatch: "Совпадение имени",
    rDateConsistency: "Согласованность дат",
    rFileIntegrity: "Целостность файла",
    rPass: "в порядке",
    rMismatchExpiry: "срок истёк",
    rMismatch: "не совпадает — нужна ручная проверка",
    rUnreadable: "не удалось проверить",
    accessLog: "История доступов",
    noAccessLog: "Доступов пока не зафиксировано.",
    aView: "Просмотр",
    aShareView: "Просмотр по ссылке",
    dateLocale: "ru-RU",
  },
  en: {
    data: "Details",
    category: "Category",
    type: "Type",
    issuer: "Issued by",
    number: "Number",
    issued: "Issued",
    validUntil: "Valid until",
    files: "Files",
    noFiles: "No files attached.",
    file: "file",
    noAccess: "no access",
    signedHint: "File links are temporary (signed URL, ~2 min).",
    share: "Share",
    active: "Active",
    revoked: "Revoked",
    expired: "Expired",
    until: "until",
    views: "views",
    download: "download",
    revoke: "Revoke",
    days: "Valid, days",
    viewsLimit: "View limit",
    noLimit: "0 — no limit",
    watermark: "Watermark",
    downloadLabel: "Download",
    createLink: "Create link",
    deleteDoc: "Delete document",
    versions: "Versions",
    noVersions: "No versions yet.",
    current: "current",
    checks: "Checks",
    runCheck: "Check now",
    noChecks: "No checks have run yet.",
    lastChecked: "Checked",
    archiveSection: "Archive",
    archiveBtn: "Archive",
    unarchiveBtn: "Restore from archive",
    archivedBadge: "Archived",
    archivedNote: "This document is archived — hidden from lists. Files and history are kept.",
    rExpiry: "Expiry",
    rNameMatch: "Name match",
    rDateConsistency: "Date consistency",
    rFileIntegrity: "File integrity",
    rPass: "OK",
    rMismatchExpiry: "expired",
    rMismatch: "does not match — manual review needed",
    rUnreadable: "could not check",
    accessLog: "Access history",
    noAccessLog: "No access recorded yet.",
    aView: "View",
    aShareView: "View via link",
    dateLocale: "en-US",
  },
  uz: {
    data: "Maʼlumotlar",
    category: "Toifa",
    type: "Turi",
    issuer: "Kim tomonidan berilgan",
    number: "Raqami",
    issued: "Berilgan",
    validUntil: "Amal qilish muddati",
    files: "Fayllar",
    noFiles: "Fayllar biriktirilmagan.",
    file: "fayl",
    noAccess: "ruxsat yoʻq",
    signedHint: "Fayl havolalari vaqtinchalik (signed URL, ~2 daq).",
    share: "Ulashish",
    active: "Faol",
    revoked: "Bekor qilingan",
    expired: "Muddati tugagan",
    until: "gacha",
    views: "koʻrishlar",
    download: "yuklab olish",
    revoke: "Bekor qilish",
    days: "Amal qiladi, kun",
    viewsLimit: "Koʻrishlar limiti",
    noLimit: "0 — limitsiz",
    watermark: "Suv belgisi",
    downloadLabel: "Yuklab olish",
    createLink: "Havola yaratish",
    deleteDoc: "Hujjatni oʻchirish",
    versions: "Versiyalar",
    noVersions: "Hozircha versiyalar yoʻq.",
    current: "joriy",
    checks: "Tekshiruvlar",
    runCheck: "Hozir tekshirish",
    noChecks: "Tekshiruvlar hali oʻtkazilmagan.",
    lastChecked: "Tekshirilgan",
    archiveSection: "Arxiv",
    archiveBtn: "Arxivlash",
    unarchiveBtn: "Arxivdan qaytarish",
    archivedBadge: "Arxivda",
    archivedNote: "Hujjat arxivda — roʻyxatlardan yashirilgan. Fayllar va tarix saqlanadi.",
    rExpiry: "Amal muddati",
    rNameMatch: "Ism mosligi",
    rDateConsistency: "Sanalar muvofiqligi",
    rFileIntegrity: "Fayl yaxlitligi",
    rPass: "joyida",
    rMismatchExpiry: "muddati tugagan",
    rMismatch: "mos emas — qoʻlda tekshirish kerak",
    rUnreadable: "tekshirib boʻlmadi",
    accessLog: "Kirishlar tarixi",
    noAccessLog: "Hozircha kirishlar qayd etilmagan.",
    aView: "Koʻrish",
    aShareView: "Havola orqali koʻrish",
    dateLocale: "uz-UZ",
  },
  id: {
    data: "Detail",
    category: "Kategori",
    type: "Tipe",
    issuer: "Diterbitkan oleh",
    number: "Nomor",
    issued: "Diterbitkan",
    validUntil: "Berlaku sampai",
    files: "Berkas",
    noFiles: "Tidak ada berkas terlampir.",
    file: "berkas",
    noAccess: "tidak ada akses",
    signedHint: "Tautan berkas bersifat sementara (signed URL, ~2 mnt).",
    share: "Bagikan",
    active: "Aktif",
    revoked: "Dicabut",
    expired: "Kedaluwarsa",
    until: "sampai",
    views: "tampilan",
    download: "unduhan",
    revoke: "Cabut",
    days: "Berlaku, hari",
    viewsLimit: "Batas tampilan",
    noLimit: "0 — tanpa batas",
    watermark: "Tanda air",
    downloadLabel: "Unduhan",
    createLink: "Buat tautan",
    deleteDoc: "Hapus dokumen",
    versions: "Versi",
    noVersions: "Belum ada versi.",
    current: "saat ini",
    checks: "Pemeriksaan",
    runCheck: "Periksa sekarang",
    noChecks: "Belum ada pemeriksaan yang dijalankan.",
    lastChecked: "Diperiksa",
    archiveSection: "Arsip",
    archiveBtn: "Arsipkan",
    unarchiveBtn: "Kembalikan dari arsip",
    archivedBadge: "Diarsipkan",
    archivedNote: "Dokumen diarsipkan — disembunyikan dari daftar. Berkas dan riwayat tetap tersimpan.",
    rExpiry: "Masa berlaku",
    rNameMatch: "Kecocokan nama",
    rDateConsistency: "Konsistensi tanggal",
    rFileIntegrity: "Integritas berkas",
    rPass: "oke",
    rMismatchExpiry: "kedaluwarsa",
    rMismatch: "tidak cocok — perlu pemeriksaan manual",
    rUnreadable: "tidak dapat diperiksa",
    accessLog: "Riwayat akses",
    noAccessLog: "Belum ada akses yang tercatat.",
    aView: "Dilihat",
    aShareView: "Dilihat via tautan",
    dateLocale: "id-ID",
  },
} as const;

function fmtBytes(n: number | null) {
  if (!n) return "";
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
}

type Dict = (typeof M)[keyof typeof M];

function checkTypeLabel(t: Dict, type: DocumentCheck["check_type"]): string {
  return {
    expiry: t.rExpiry,
    name_match: t.rNameMatch,
    date_consistency: t.rDateConsistency,
    file_integrity: t.rFileIntegrity,
  }[type];
}

/** Текст и цвет результата проверки. mismatch = «нужна ручная проверка». */
function checkResult(
  t: Dict,
  c: DocumentCheck
): { text: string; className: string } {
  if (c.result === "pass")
    return { text: t.rPass, className: "text-emerald-600" };
  if (c.result === "unreadable")
    return { text: t.rUnreadable, className: "text-slate-400" };
  const text = c.check_type === "expiry" ? t.rMismatchExpiry : t.rMismatch;
  return { text, className: "text-amber-600" };
}

function auditActionLabel(t: Dict, a: AuditEntry): string {
  return a.action === "document.share_view" ? t.aShareView : t.aView;
}

export default async function DocumentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const locale = await getLocale();
  const t = M[locale];
  const { id } = await params;
  const doc = await getDocument(id);
  if (!doc) notFound();

  const [files, shares, versions, auditLog] = await Promise.all([
    listFiles(id),
    listSharesByDocument(id),
    listVersions(id),
    listDocumentAudit(id),
  ]);
  // Фиксируем просмотр документа владельцем/членом семьи (best-effort).
  await logAudit(doc.household_id, "document.view", "document", doc.id);
  const checks = doc.current_version_id
    ? await listChecksByVersion(doc.current_version_id)
    : [];
  // Последняя по времени проверка каждого типа — актуальный статус.
  const latestChecks = Object.values(
    checks.reduce<Record<string, DocumentCheck>>((acc, c) => {
      if (!acc[c.check_type]) acc[c.check_type] = c;
      return acc;
    }, {})
  );
  const lastCheckedAt = checks.length ? checks[0].checked_at : null;
  const member = doc.member_id ? await getMember(doc.member_id) : null;
  const asset = doc.asset_id ? await getAsset(doc.asset_id) : null;
  const signed = await signFiles(files);
  // Более длинные ссылки (10 мин) — для скачивания копии в офлайн-хранилище.
  const offlineSigned = await signFiles(files, 600);

  const ownerName = member?.full_name ?? asset?.title ?? null;
  const offlineFiles = files
    .filter((f) => offlineSigned[f.id])
    .map((f) => ({
      id: f.id,
      name: f.file_name ?? t.file,
      mime: f.mime_type ?? "application/octet-stream",
      size: f.size_bytes ?? 0,
      url: offlineSigned[f.id],
    }));
  const offlineMeta = {
    id: doc.id,
    title: doc.title,
    category: categoryLabel(locale, doc.category),
    subtype: doc.subtype,
    issuer: doc.issuer,
    docNumber: doc.doc_number,
    issuedAt: doc.issued_at,
    expiresAt: doc.expires_at,
    notes: doc.notes,
    ownerName,
    files: offlineFiles.map(({ url: _url, ...rest }) => rest),
  };

  const h = await headers();
  const origin = `https://${h.get("host") ?? ""}`;

  const meta: [string, string | null][] = [
    [t.category, categoryLabel(locale, doc.category)],
    [t.type, doc.subtype],
    [t.issuer, doc.issuer],
    [t.number, doc.doc_number],
    [t.issued, doc.issued_at],
    [t.validUntil, doc.expires_at],
  ];

  const now = Date.now();
  const isActive = (s: (typeof shares)[number]) =>
    !s.revoked_at &&
    new Date(s.expires_at).getTime() > now &&
    (s.max_views == null || s.view_count < s.max_views);

  return (
    <div className="space-y-8">
      <div>
        {member && (
          <Link
            href={`/my/members/${member.id}`}
            className="text-sm text-slate-500 hover:underline"
          >
            ← {member.full_name}
          </Link>
        )}
        {asset && (
          <Link
            href={`/my/assets/${asset.id}`}
            className="text-sm text-slate-500 hover:underline"
          >
            ← {asset.title}
          </Link>
        )}
        <h1 className="mt-2 flex items-center gap-2 text-2xl font-semibold">
          {doc.title}
          {doc.status === "archived" && (
            <span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs font-medium text-slate-600">
              {t.archivedBadge}
            </span>
          )}
        </h1>
      </div>

      <section className="card">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
          {t.data}
        </h2>
        <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm sm:grid-cols-3">
          {meta
            .filter(([, v]) => v)
            .map(([k, v]) => (
              <div key={k}>
                <dt className="text-slate-400">{k}</dt>
                <dd className="font-medium">{v}</dd>
              </div>
            ))}
        </dl>
        {doc.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {doc.tags.map((t) => (
              <span
                key={t}
                className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600"
              >
                #{t}
              </span>
            ))}
          </div>
        )}
        {doc.notes && (
          <p className="mt-3 whitespace-pre-wrap text-sm text-slate-600">
            {doc.notes}
          </p>
        )}
      </section>

      <section className="card">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
          {t.files}
        </h2>
        {files.length === 0 ? (
          <p className="text-sm text-slate-400">{t.noFiles}</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {files.map((f) => (
              <li key={f.id} className="flex items-center justify-between gap-3 py-2">
                <div className="min-w-0 text-sm">
                  <div className="truncate font-medium">{f.file_name ?? t.file}</div>
                  <div className="truncate text-xs text-slate-400">
                    {f.mime_type} {fmtBytes(f.size_bytes)}
                  </div>
                </div>
                {signed[f.id] ? (
                  <FileActions url={signed[f.id]} name={f.file_name ?? t.file} locale={locale} />
                ) : (
                  <span className="shrink-0 text-xs text-slate-400">{t.noAccess}</span>
                )}
              </li>
            ))}
          </ul>
        )}
        <p className="mt-2 text-xs text-slate-400">{t.signedHint}</p>
        <div className="mt-4 border-t border-slate-100 pt-4">
          <OfflineSave locale={locale} meta={offlineMeta} files={offlineFiles} />
        </div>
      </section>

      <section className="card">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
          {t.versions}
        </h2>
        {versions.length === 0 ? (
          <p className="text-sm text-slate-400">{t.noVersions}</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {versions.map((v, i) => (
              <li key={v.id} className="flex items-center justify-between gap-3 py-2">
                <div className="min-w-0 text-sm">
                  <div className="truncate font-medium">
                    {v.note ?? t.file}
                    {(v.id === doc.current_version_id || (!doc.current_version_id && i === 0)) && (
                      <span className="ml-2 rounded-full bg-emerald-100 px-2 py-0.5 text-xs text-emerald-700">
                        {t.current}
                      </span>
                    )}
                  </div>
                  <div className="truncate text-xs text-slate-400">
                    {new Date(v.created_at).toLocaleDateString(t.dateLocale)} · {v.mime}{" "}
                    {fmtBytes(v.size_bytes)}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
        <VersionUpload
          documentId={doc.id}
          householdId={doc.household_id}
          locale={locale}
        />
      </section>

      <section className="card">
        <div className="mb-3 flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            {t.checks}
          </h2>
          <form action={runChecks}>
            <input type="hidden" name="id" value={doc.id} />
            <button className="btn-ghost text-xs">{t.runCheck}</button>
          </form>
        </div>
        {latestChecks.length === 0 ? (
          <p className="text-sm text-slate-400">{t.noChecks}</p>
        ) : (
          <ul className="space-y-2">
            {latestChecks.map((c) => {
              const r = checkResult(t, c);
              return (
                <li
                  key={c.id}
                  className="flex items-center justify-between gap-3 text-sm"
                >
                  <span className="text-slate-600">{checkTypeLabel(t, c.check_type)}</span>
                  <span className={`font-medium ${r.className}`}>{r.text}</span>
                </li>
              );
            })}
          </ul>
        )}
        {lastCheckedAt && (
          <p className="mt-3 text-xs text-slate-400">
            {t.lastChecked}: {new Date(lastCheckedAt).toLocaleString(t.dateLocale)}
          </p>
        )}
      </section>

      <section className="card">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
          {t.share}
        </h2>

        {shares.length > 0 && (
          <ul className="mb-4 space-y-2">
            {shares.map((s) => {
              const active = isActive(s);
              const url = `${origin}/s/${s.token}`;
              return (
                <li
                  key={s.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm"
                >
                  <div>
                    <span
                      className={
                        active
                          ? "font-medium text-emerald-600"
                          : "font-medium text-slate-400"
                      }
                    >
                      {active ? t.active : s.revoked_at ? t.revoked : t.expired}
                    </span>
                    <span className="ml-2 text-slate-500">
                      {t.until} {new Date(s.expires_at).toLocaleDateString(t.dateLocale)} ·{" "}
                      {t.views} {s.view_count}
                      {s.max_views ? `/${s.max_views}` : ""}
                      {s.allow_download ? ` · ${t.download}` : ""}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    {active && <CopyButton text={url} locale={locale} />}
                    {active && (
                      <form action={revokeShare}>
                        <input type="hidden" name="id" value={s.id} />
                        <input type="hidden" name="document_id" value={doc.id} />
                        <button className="btn-danger">{t.revoke}</button>
                      </form>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        <form action={createShare} className="grid gap-3 sm:grid-cols-4">
          <input type="hidden" name="document_id" value={doc.id} />
          <div>
            <label className="label">{t.days}</label>
            <input
              name="days"
              type="number"
              min={1}
              max={90}
              defaultValue={7}
              className="input"
            />
          </div>
          <div>
            <label className="label">{t.viewsLimit}</label>
            <input
              name="max_views"
              type="number"
              min={0}
              defaultValue={0}
              className="input"
              placeholder={t.noLimit}
            />
          </div>
          <label className="flex items-end gap-2 pb-2 text-sm">
            <input type="checkbox" name="watermark" defaultChecked /> {t.watermark}
          </label>
          <label className="flex items-end gap-2 pb-2 text-sm">
            <input type="checkbox" name="allow_download" /> {t.downloadLabel}
          </label>
          <div className="sm:col-span-4">
            <button className="btn-primary">{t.createLink}</button>
          </div>
        </form>
      </section>

      <section className="card">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
          {t.accessLog}
        </h2>
        {auditLog.length === 0 ? (
          <p className="text-sm text-slate-400">{t.noAccessLog}</p>
        ) : (
          <ul className="divide-y divide-slate-100 text-sm">
            {auditLog.map((a) => (
              <li key={a.id} className="flex items-center justify-between gap-3 py-2">
                <span className="text-slate-600">{auditActionLabel(t, a)}</span>
                <span className="text-xs text-slate-400">
                  {new Date(a.created_at).toLocaleString(t.dateLocale)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="card">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
          {t.archiveSection}
        </h2>
        {doc.status === "archived" ? (
          <div className="flex flex-wrap items-center gap-3">
            <form action={unarchiveDocument}>
              <input type="hidden" name="id" value={doc.id} />
              <button className="btn-ghost">{t.unarchiveBtn}</button>
            </form>
            <p className="text-xs text-slate-400">{t.archivedNote}</p>
          </div>
        ) : (
          <form action={archiveDocument}>
            <input type="hidden" name="id" value={doc.id} />
            <button className="btn-ghost">{t.archiveBtn}</button>
          </form>
        )}
      </section>

      <section>
        <form action={deleteDocument}>
          <input type="hidden" name="id" value={doc.id} />
          <input type="hidden" name="member_id" value={doc.member_id ?? ""} />
          <input type="hidden" name="asset_id" value={doc.asset_id ?? ""} />
          <button className="btn-danger">{t.deleteDoc}</button>
        </form>
      </section>
    </div>
  );
}

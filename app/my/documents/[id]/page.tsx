import Link from "next/link";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import {
  getAsset,
  getDocument,
  getMember,
  listFiles,
  listSharesByDocument,
  signFiles,
} from "@/lib/queries";
import { categoryLabel } from "@/lib/categories";
import { getLocale } from "@/lib/i18n";
import CopyButton from "@/components/CopyButton";
import FileActions from "@/components/FileActions";
import {
  createShare,
  deleteDocument,
  revokeShare,
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
    dateLocale: "id-ID",
  },
} as const;

function fmtBytes(n: number | null) {
  if (!n) return "";
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
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

  const [files, shares] = await Promise.all([
    listFiles(id),
    listSharesByDocument(id),
  ]);
  const member = doc.member_id ? await getMember(doc.member_id) : null;
  const asset = doc.asset_id ? await getAsset(doc.asset_id) : null;
  const signed = await signFiles(files);

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
        <h1 className="mt-2 text-2xl font-semibold">{doc.title}</h1>
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
              <li key={f.id} className="flex items-center justify-between py-2">
                <div className="text-sm">
                  <div className="font-medium">{f.file_name ?? t.file}</div>
                  <div className="text-xs text-slate-400">
                    {f.mime_type} {fmtBytes(f.size_bytes)}
                  </div>
                </div>
                {signed[f.id] ? (
                  <FileActions url={signed[f.id]} name={f.file_name ?? t.file} locale={locale} />
                ) : (
                  <span className="text-xs text-slate-400">{t.noAccess}</span>
                )}
              </li>
            ))}
          </ul>
        )}
        <p className="mt-2 text-xs text-slate-400">{t.signedHint}</p>
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

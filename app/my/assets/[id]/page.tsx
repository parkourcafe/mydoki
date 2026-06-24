import Link from "next/link";
import { notFound } from "next/navigation";
import { getAsset, getStorageInfo, listDocumentsByAsset } from "@/lib/queries";
import {
  assetTypeLabel,
  categories,
  type DocCategory,
} from "@/lib/categories";
import { getLocale } from "@/lib/i18n";
import { aiConfigured } from "@/lib/classify";
import { deleteAsset } from "@/app/my/actions";
import DocumentForm from "@/app/my/members/[id]/DocumentForm";

const M = {
  ru: {
    back: "← Имущество",
    empty: "Документов по объекту пока нет. Добавьте первый ниже.",
    validUntil: "действует до",
    noExpiry: "без срока",
    addDocument: "+ Добавить документ",
    deleteObject: "Удалить объект",
  },
  en: {
    back: "← Assets",
    empty: "No documents for this item yet. Add the first one below.",
    validUntil: "valid until",
    noExpiry: "no expiry",
    addDocument: "+ Add document",
    deleteObject: "Delete item",
  },
  id: {
    back: "← Aset",
    empty: "Belum ada dokumen untuk barang ini. Tambahkan yang pertama di bawah.",
    validUntil: "berlaku hingga",
    noExpiry: "tanpa masa berlaku",
    addDocument: "+ Tambah dokumen",
    deleteObject: "Hapus barang",
  },
  uz: {
    back: "← Mol-mulk",
    empty: "Bu obʼyekt boʻyicha hozircha hujjatlar yoʻq. Quyida birinchisini qoʻshing.",
    validUntil: "amal qiladi",
    noExpiry: "muddatsiz",
    addDocument: "+ Hujjat qoʻshish",
    deleteObject: "Obʼyektni oʻchirish",
  },
} as const;

export default async function AssetPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const locale = await getLocale();
  const t = M[locale];
  const cats = categories(locale);
  const { id } = await params;
  const asset = await getAsset(id);
  if (!asset) notFound();

  const [docs, storage] = await Promise.all([
    listDocumentsByAsset(id),
    getStorageInfo(asset.household_id),
  ]);
  const byCategory = new Map<DocCategory, typeof docs>();
  for (const d of docs) {
    const arr = byCategory.get(d.category) ?? [];
    arr.push(d);
    byCategory.set(d.category, arr);
  }

  return (
    <div className="space-y-8">
      <div>
        <Link href="/my/assets" className="text-sm text-slate-500 hover:underline">
          {t.back}
        </Link>
        <h1 className="mt-2 text-2xl font-semibold">{asset.title}</h1>
        <p className="text-sm text-slate-500">
          {assetTypeLabel(locale, asset.type)}
          {asset.details ? ` · ${asset.details}` : ""}
        </p>
      </div>

      {docs.length === 0 ? (
        <div className="card text-center text-slate-500">{t.empty}</div>
      ) : (
        <div className="space-y-6">
          {cats.filter((c) => byCategory.has(c.key)).map((c) => (
            <section key={c.key}>
              <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
                {c.emoji} {c.label}
              </h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {byCategory.get(c.key)!.map((d) => (
                  <Link
                    key={d.id}
                    href={`/my/documents/${d.id}`}
                    className="card transition hover:border-brand-300 hover:shadow"
                  >
                    <div className="font-medium">{d.title}</div>
                    <div className="mt-1 text-xs text-slate-500">
                      {d.subtype ? `${d.subtype} · ` : ""}
                      {d.expires_at
                        ? `${t.validUntil} ${d.expires_at}`
                        : t.noExpiry}
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      <details className="card">
        <summary className="cursor-pointer font-medium">{t.addDocument}</summary>
        <DocumentForm
          assetId={asset.id}
          locale={locale}
          storageUsed={storage.used}
          storageLimit={storage.limit}
          aiEnabled={aiConfigured()}
        />
      </details>

      <section>
        <form action={deleteAsset}>
          <input type="hidden" name="id" value={asset.id} />
          <button className="btn-danger">{t.deleteObject}</button>
        </form>
      </section>
    </div>
  );
}

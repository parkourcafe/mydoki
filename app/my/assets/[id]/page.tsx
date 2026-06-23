import Link from "next/link";
import { notFound } from "next/navigation";
import { getAsset, listDocumentsByAsset } from "@/lib/queries";
import {
  ASSET_TYPE_LABEL,
  CATEGORIES,
  type DocCategory,
} from "@/lib/categories";
import { deleteAsset } from "@/app/my/actions";
import DocumentForm from "@/app/my/members/[id]/DocumentForm";

export default async function AssetPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const asset = await getAsset(id);
  if (!asset) notFound();

  const docs = await listDocumentsByAsset(id);
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
          ← Имущество
        </Link>
        <h1 className="mt-2 text-2xl font-semibold">{asset.title}</h1>
        <p className="text-sm text-slate-500">
          {ASSET_TYPE_LABEL[asset.type]}
          {asset.details ? ` · ${asset.details}` : ""}
        </p>
      </div>

      {docs.length === 0 ? (
        <div className="card text-center text-slate-500">
          Документов по объекту пока нет. Добавьте первый ниже.
        </div>
      ) : (
        <div className="space-y-6">
          {CATEGORIES.filter((c) => byCategory.has(c.key)).map((c) => (
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
                      {d.expires_at ? `действует до ${d.expires_at}` : "без срока"}
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      <details className="card">
        <summary className="cursor-pointer font-medium">+ Добавить документ</summary>
        <DocumentForm assetId={asset.id} />
      </details>

      <section>
        <form action={deleteAsset}>
          <input type="hidden" name="id" value={asset.id} />
          <button className="btn-danger">Удалить объект</button>
        </form>
      </section>
    </div>
  );
}

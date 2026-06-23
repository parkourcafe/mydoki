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
import { CATEGORY_LABEL } from "@/lib/categories";
import CopyButton from "@/components/CopyButton";
import {
  createShare,
  deleteDocument,
  revokeShare,
} from "@/app/my/actions";

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
    ["Категория", CATEGORY_LABEL[doc.category]],
    ["Тип", doc.subtype],
    ["Кем выдан", doc.issuer],
    ["Номер", doc.doc_number],
    ["Выдан", doc.issued_at],
    ["Действует до", doc.expires_at],
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
          Данные
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
          Файлы
        </h2>
        {files.length === 0 ? (
          <p className="text-sm text-slate-400">Файлы не прикреплены.</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {files.map((f) => (
              <li key={f.id} className="flex items-center justify-between py-2">
                <div className="text-sm">
                  <div className="font-medium">{f.file_name ?? "файл"}</div>
                  <div className="text-xs text-slate-400">
                    {f.mime_type} {fmtBytes(f.size_bytes)}
                  </div>
                </div>
                {signed[f.id] ? (
                  <a
                    href={signed[f.id]}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-ghost"
                  >
                    Открыть
                  </a>
                ) : (
                  <span className="text-xs text-slate-400">нет доступа</span>
                )}
              </li>
            ))}
          </ul>
        )}
        <p className="mt-2 text-xs text-slate-400">
          Ссылки на файлы временные (signed URL, ~2 мин).
        </p>
      </section>

      <section className="card">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
          Поделиться
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
                      {active ? "Активна" : s.revoked_at ? "Отозвана" : "Истекла"}
                    </span>
                    <span className="ml-2 text-slate-500">
                      до {new Date(s.expires_at).toLocaleDateString("ru-RU")} ·{" "}
                      просмотров {s.view_count}
                      {s.max_views ? `/${s.max_views}` : ""}
                      {s.allow_download ? " · скачивание" : ""}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    {active && <CopyButton text={url} />}
                    {active && (
                      <form action={revokeShare}>
                        <input type="hidden" name="id" value={s.id} />
                        <input type="hidden" name="document_id" value={doc.id} />
                        <button className="btn-danger">Отозвать</button>
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
            <label className="label">Действует, дней</label>
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
            <label className="label">Лимит просмотров</label>
            <input
              name="max_views"
              type="number"
              min={0}
              defaultValue={0}
              className="input"
              placeholder="0 — без лимита"
            />
          </div>
          <label className="flex items-end gap-2 pb-2 text-sm">
            <input type="checkbox" name="watermark" defaultChecked /> Водяной знак
          </label>
          <label className="flex items-end gap-2 pb-2 text-sm">
            <input type="checkbox" name="allow_download" /> Скачивание
          </label>
          <div className="sm:col-span-4">
            <button className="btn-primary">Создать ссылку</button>
          </div>
        </form>
      </section>

      <section>
        <form action={deleteDocument}>
          <input type="hidden" name="id" value={doc.id} />
          <input type="hidden" name="member_id" value={doc.member_id ?? ""} />
          <input type="hidden" name="asset_id" value={doc.asset_id ?? ""} />
          <button className="btn-danger">Удалить документ</button>
        </form>
      </section>
    </div>
  );
}

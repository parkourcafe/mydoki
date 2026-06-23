import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getMember,
  listDocumentsByMember,
  listRecordsByMember,
} from "@/lib/queries";
import {
  CATEGORIES,
  RECORD_KINDS,
  RECORD_KIND_LABEL,
  RELATION_LABEL,
  type DocCategory,
} from "@/lib/categories";
import { createRecord, deleteRecord } from "@/app/my/actions";
import DocumentForm from "./DocumentForm";

export default async function MemberPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const member = await getMember(id);
  if (!member) notFound();

  const [docs, records] = await Promise.all([
    listDocumentsByMember(id),
    listRecordsByMember(id),
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
        <Link href="/my" className="text-sm text-slate-500 hover:underline">
          ← Семья
        </Link>
        <h1 className="mt-2 text-2xl font-semibold">{member.full_name}</h1>
        <p className="text-sm text-slate-500">
          {member.relation ? RELATION_LABEL[member.relation] ?? member.relation : "—"}
          {member.birth_date ? ` · ${member.birth_date}` : ""}
        </p>
        <Link
          href={`/my/members/${member.id}/health`}
          className="mt-2 inline-block text-sm font-medium text-brand-600 hover:underline"
        >
          🩺 Медкарта →
        </Link>
      </div>

      {/* Документы */}
      {docs.length === 0 ? (
        <div className="card text-center text-slate-500">
          Документов пока нет. Добавьте первый ниже.
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
        <DocumentForm memberId={member.id} />
      </details>

      {/* Записи (медкарта/заметки без файла) */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Записи
        </h2>
        {records.length === 0 ? (
          <p className="text-sm text-slate-400">
            Структурные записи без файла: анализы, назначения, прививки, питание.
          </p>
        ) : (
          <ul className="space-y-2">
            {records.map((r) => (
              <li
                key={r.id}
                className="flex items-start justify-between gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2"
              >
                <div className="text-sm">
                  <div className="font-medium">
                    {RECORD_KIND_LABEL[r.kind] ?? r.kind}: {r.title}
                  </div>
                  <div className="text-xs text-slate-500">
                    {r.recorded_at ?? "без даты"}
                    {typeof r.data?.note === "string" && r.data.note
                      ? ` · ${r.data.note}`
                      : ""}
                  </div>
                </div>
                <form action={deleteRecord}>
                  <input type="hidden" name="id" value={r.id} />
                  <input type="hidden" name="member_id" value={member.id} />
                  <button className="text-xs text-red-500 hover:underline">
                    удалить
                  </button>
                </form>
              </li>
            ))}
          </ul>
        )}

        <details className="card">
          <summary className="cursor-pointer font-medium">+ Добавить запись</summary>
          <form action={createRecord} className="mt-4 grid gap-4 sm:grid-cols-2">
            <input type="hidden" name="member_id" value={member.id} />
            <div>
              <label className="label">Тип</label>
              <select name="kind" className="input" defaultValue="medical_analysis">
                {RECORD_KINDS.map((k) => (
                  <option key={k.key} value={k.key}>
                    {k.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Дата</label>
              <input name="recorded_at" type="date" className="input" />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Название</label>
              <input
                name="title"
                required
                className="input"
                placeholder="Общий анализ крови"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Заметка</label>
              <textarea name="note" rows={2} className="input" />
            </div>
            <div className="sm:col-span-2">
              <button className="btn-primary">Сохранить запись</button>
            </div>
          </form>
        </details>
      </section>
    </div>
  );
}

import Link from "next/link";
import {
  getOrCreateHouseholdId,
  listMembers,
  searchDocuments,
} from "@/lib/queries";
import { CATEGORIES, CATEGORY_LABEL } from "@/lib/categories";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string }>;
}) {
  const { q = "", category = "" } = await searchParams;
  const householdId = await getOrCreateHouseholdId();
  const members = await listMembers(householdId);
  const nameOf = new Map(members.map((m) => [m.id, m.full_name]));

  const results =
    q || category
      ? await searchDocuments(householdId, q, category || undefined)
      : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Поиск</h1>
        <p className="mt-1 text-sm text-slate-500">
          По названию, типу, кем выдан — в пределах вашей семьи.
        </p>
      </div>

      <form method="get" className="flex flex-wrap items-end gap-3">
        <div className="grow">
          <label className="label">Запрос</label>
          <input
            name="q"
            defaultValue={q}
            className="input"
            placeholder="паспорт, диплом, страховка…"
          />
        </div>
        <div>
          <label className="label">Категория</label>
          <select name="category" defaultValue={category} className="input">
            <option value="">Все</option>
            {CATEGORIES.map((c) => (
              <option key={c.key} value={c.key}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
        <button className="btn-primary">Искать</button>
      </form>

      {q || category ? (
        results.length === 0 ? (
          <div className="card text-center text-slate-500">Ничего не найдено.</div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {results.map((d) => (
              <Link
                key={d.id}
                href={`/my/documents/${d.id}`}
                className="card transition hover:border-brand-300 hover:shadow"
              >
                <div className="font-medium">{d.title}</div>
                <div className="mt-1 text-xs text-slate-500">
                  {CATEGORY_LABEL[d.category]} · {nameOf.get(d.member_id) ?? "—"}
                  {d.expires_at ? ` · до ${d.expires_at}` : ""}
                </div>
              </Link>
            ))}
          </div>
        )
      ) : (
        <p className="text-sm text-slate-400">Введите запрос или выберите категорию.</p>
      )}
    </div>
  );
}

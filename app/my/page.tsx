import Link from "next/link";
import { getOrCreateHouseholdId, listMembers } from "@/lib/queries";
import { RELATIONS, RELATION_LABEL } from "@/lib/categories";
import { createMember } from "./actions";

export default async function MyHome() {
  const householdId = await getOrCreateHouseholdId();
  const members = await listMembers(householdId);

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Семья</h1>
          <p className="mt-1 text-sm text-slate-500">
            Для каждого человека — его документы и записи в одном месте.
          </p>
        </div>
        <a href="/my/export" className="btn-ghost shrink-0">
          ↓ Экспорт
        </a>
      </div>

      {members.length === 0 ? (
        <div className="card text-center text-slate-500">
          Пока никого нет. Добавьте первого члена семьи ниже.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {members.map((m) => (
            <Link
              key={m.id}
              href={`/my/members/${m.id}`}
              className="card transition hover:border-brand-300 hover:shadow"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-50 text-lg">
                  {m.full_name.slice(0, 1).toUpperCase()}
                </div>
                <div>
                  <div className="font-medium">{m.full_name}</div>
                  <div className="text-xs text-slate-500">
                    {m.relation ? RELATION_LABEL[m.relation] ?? m.relation : "—"}
                    {m.birth_date ? ` · ${m.birth_date}` : ""}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      <details className="card">
        <summary className="cursor-pointer font-medium">
          + Добавить члена семьи
        </summary>
        <form action={createMember} className="mt-4 grid gap-4 sm:grid-cols-3">
          <div className="sm:col-span-1">
            <label className="label">Имя</label>
            <input name="full_name" required className="input" placeholder="Иван Иванов" />
          </div>
          <div>
            <label className="label">Связь</label>
            <select name="relation" className="input" defaultValue="">
              <option value="">—</option>
              {RELATIONS.map((r) => (
                <option key={r.key} value={r.key}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Дата рождения</label>
            <input name="birth_date" type="date" className="input" />
          </div>
          <div className="sm:col-span-3">
            <button className="btn-primary">Добавить</button>
          </div>
        </form>
      </details>
    </div>
  );
}

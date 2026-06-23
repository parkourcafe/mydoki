import Link from "next/link";
import {
  getOrCreateHouseholdId,
  listExpiring,
  listMembers,
} from "@/lib/queries";

function daysLeft(date: string) {
  const ms = new Date(date).getTime() - Date.now();
  return Math.ceil(ms / 86400_000);
}

export default async function RemindersPage() {
  const householdId = await getOrCreateHouseholdId();
  const [docs, members] = await Promise.all([
    listExpiring(householdId, 60),
    listMembers(householdId),
  ]);
  const nameOf = new Map(members.map((m) => [m.id, m.full_name]));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Сроки</h1>
        <p className="mt-1 text-sm text-slate-500">
          Документы, срок действия которых истекает в ближайшие 60 дней.
        </p>
      </div>

      {docs.length === 0 ? (
        <div className="card text-center text-slate-500">
          Ничего не истекает в ближайшее время 🎉
        </div>
      ) : (
        <ul className="space-y-2">
          {docs.map((d) => {
            const left = daysLeft(d.expires_at!);
            const overdue = left < 0;
            return (
              <li key={d.id}>
                <Link
                  href={`/my/documents/${d.id}`}
                  className="card flex items-center justify-between transition hover:border-brand-300"
                >
                  <div>
                    <div className="font-medium">{d.title}</div>
                    <div className="text-xs text-slate-500">
                      {nameOf.get(d.member_id ?? "") ?? "—"} · до {d.expires_at}
                    </div>
                  </div>
                  <span
                    className={
                      overdue
                        ? "rounded-full bg-red-50 px-3 py-1 text-sm font-medium text-red-600"
                        : left <= 14
                          ? "rounded-full bg-amber-50 px-3 py-1 text-sm font-medium text-amber-700"
                          : "rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-600"
                    }
                  >
                    {overdue ? `просрочен на ${-left} дн.` : `${left} дн.`}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

import Link from "next/link";
import {
  getOrCreateHouseholdId,
  listExpiring,
  listMembers,
} from "@/lib/queries";
import { getLocale } from "@/lib/i18n";

const M = {
  ru: {
    title: "Сроки",
    subtitle: "Документы, срок действия которых истекает в ближайшие 60 дней.",
    empty: "Ничего не истекает в ближайшее время 🎉",
    until: "до",
    overdue: (n: number) => `просрочен на ${n} дн.`,
    daysLeft: (n: number) => `${n} дн.`,
  },
  en: {
    title: "Deadlines",
    subtitle: "Documents expiring within the next 60 days.",
    empty: "Nothing expires anytime soon 🎉",
    until: "until",
    overdue: (n: number) => `overdue by ${n} d.`,
    daysLeft: (n: number) => `${n} d.`,
  },
  uz: {
    title: "Muddatlar",
    subtitle: "Keyingi 60 kun ichida amal qilish muddati tugaydigan hujjatlar.",
    empty: "Yaqin orada hech narsaning muddati tugamaydi 🎉",
    until: "gacha",
    overdue: (n: number) => `${n} kunga kechikkan`,
    daysLeft: (n: number) => `${n} kun`,
  },
  id: {
    title: "Tenggat waktu",
    subtitle: "Dokumen yang masa berlakunya habis dalam 60 hari ke depan.",
    empty: "Tidak ada yang akan habis masa berlakunya dalam waktu dekat 🎉",
    until: "hingga",
    overdue: (n: number) => `terlambat ${n} hr`,
    daysLeft: (n: number) => `${n} hr`,
  },
} as const;

function daysLeft(date: string) {
  const ms = new Date(date).getTime() - Date.now();
  return Math.ceil(ms / 86400_000);
}

export default async function RemindersPage() {
  const locale = await getLocale();
  const t = M[locale];

  const householdId = await getOrCreateHouseholdId();
  const [docs, members] = await Promise.all([
    listExpiring(householdId, 60),
    listMembers(householdId),
  ]);
  const nameOf = new Map(members.map((m) => [m.id, m.full_name]));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">{t.title}</h1>
        <p className="mt-1 text-sm text-slate-500">
          {t.subtitle}
        </p>
      </div>

      {docs.length === 0 ? (
        <div className="card text-center text-slate-500">
          {t.empty}
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
                      {nameOf.get(d.member_id ?? "") ?? "—"} · {t.until} {d.expires_at}
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
                    {overdue ? t.overdue(-left) : t.daysLeft(left)}
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

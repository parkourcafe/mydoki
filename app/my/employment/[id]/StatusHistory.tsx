import type { Locale } from "@/lib/i18n";
import {
  type EmploymentStatusEvent,
  describeStatusEvent,
} from "@/lib/employment";

// Журнал смены статуса записи «от работодателя» (T-DOKI-04, в. 54): человек
// видит, кто и когда отметил завершение или сдвинул дату окончания. Только
// чтение — строки пишет триггер БД.

const M = {
  ru: { title: "История статуса", empty: "Изменений статуса пока не было." },
  en: { title: "Status history", empty: "No status changes yet." },
  id: { title: "Riwayat status", empty: "Belum ada perubahan status." },
  uz: { title: "Holat tarixi", empty: "Holat o‘zgarishlari hali yo‘q." },
} as const;

export default function StatusHistory({
  locale,
  events,
}: {
  locale: Locale;
  events: EmploymentStatusEvent[];
}) {
  const t = M[locale];
  const sorted = events
    .slice()
    .sort((a, b) => (a.created_at < b.created_at ? 1 : a.created_at > b.created_at ? -1 : 0));

  return (
    <section className="card space-y-2">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">{t.title}</h2>
      {sorted.length === 0 ? (
        <p className="text-sm text-slate-400">{t.empty}</p>
      ) : (
        <ul className="space-y-1 text-sm">
          {sorted.map((e) => (
            <li key={e.id} className="flex items-start justify-between gap-3">
              <span>{describeStatusEvent(locale, e)}</span>
              <time className="shrink-0 text-xs text-slate-400" dateTime={e.created_at}>
                {new Date(e.created_at).toLocaleDateString()}
              </time>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

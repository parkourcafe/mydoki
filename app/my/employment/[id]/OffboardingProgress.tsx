import type { Locale } from "@/lib/i18n";
import {
  type OffboardingTask,
  offboardingProgress,
} from "@/lib/offboarding";

// Read-only проекция оффбординга для человека. Управление — у работодателя.

const M = {
  ru: { title: "Завершение", lastDay: "Последний рабочий день", progress: "Прогресс", done: "готово", skipped: "пропущено", pending: "в процессе" },
  en: { title: "Offboarding", lastDay: "Last working day", progress: "Progress", done: "done", skipped: "skipped", pending: "pending" },
  id: { title: "Offboarding", lastDay: "Hari kerja terakhir", progress: "Progres", done: "selesai", skipped: "dilewati", pending: "berjalan" },
  uz: { title: "Yakunlash", lastDay: "Oxirgi ish kuni", progress: "Jarayon", done: "bajarildi", skipped: "o‘tkazildi", pending: "jarayonda" },
} as const;

export default function OffboardingProgress({
  locale,
  lastWorkingDay,
  tasks,
}: {
  locale: Locale;
  lastWorkingDay: string | null;
  tasks: OffboardingTask[];
}) {
  const t = M[locale];
  if (tasks.length === 0) return null;

  const sorted = tasks.slice().sort((a, b) => a.sort - b.sort);
  const progress = Math.round(offboardingProgress(tasks) * 100);
  const statusText = (s: string) =>
    s === "done" ? t.done : s === "skipped" ? t.skipped : t.pending;

  return (
    <section className="card space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">{t.title}</h2>
        <span className="text-xs text-slate-400">{t.progress}: {progress}%</span>
      </div>
      {lastWorkingDay && (
        <p className="text-xs text-slate-500">{t.lastDay}: {lastWorkingDay}</p>
      )}
      <ul className="space-y-1 text-sm">
        {sorted.map((task) => {
          const closed = task.status === "done" || task.status === "skipped";
          return (
            <li key={task.id} className="flex items-center justify-between gap-2">
              <span className={closed ? "text-slate-400 line-through" : ""}>{task.title}</span>
              <span className="shrink-0 text-xs text-slate-400">{statusText(task.status)}</span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

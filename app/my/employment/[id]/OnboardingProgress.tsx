import type { Locale } from "@/lib/i18n";
import {
  type OnboardingTask,
  checkpointLabel,
  dueDate,
  checkpointState,
  onboardingProgress,
  type CheckpointState,
} from "@/lib/onboarding";

// Read-only проекция онбординга для человека (сотрудника). Управление —
// у работодателя; здесь только прогресс и статусы.

const M = {
  ru: {
    title: "Оформление",
    checklist: "Чек-лист",
    checkpoints: "Контрольные точки",
    due: "Срок",
    progress: "Прогресс",
    done: "готово",
    skipped: "пропущено",
    pending: "в процессе",
    st: { done: "готово", overdue: "просрочено", soon: "скоро", upcoming: "впереди", none: "" } as Record<CheckpointState, string>,
  },
  en: {
    title: "Onboarding",
    checklist: "Checklist",
    checkpoints: "Check-ins",
    due: "Due",
    progress: "Progress",
    done: "done",
    skipped: "skipped",
    pending: "pending",
    st: { done: "done", overdue: "overdue", soon: "soon", upcoming: "upcoming", none: "" } as Record<CheckpointState, string>,
  },
  id: {
    title: "Onboarding",
    checklist: "Daftar tugas",
    checkpoints: "Tinjauan",
    due: "Tenggat",
    progress: "Progres",
    done: "selesai",
    skipped: "dilewati",
    pending: "berjalan",
    st: { done: "selesai", overdue: "terlambat", soon: "segera", upcoming: "mendatang", none: "" } as Record<CheckpointState, string>,
  },
  uz: {
    title: "Rasmiylashtirish",
    checklist: "Roʻyxat",
    checkpoints: "Nazoratlar",
    due: "Muddat",
    progress: "Jarayon",
    done: "bajarildi",
    skipped: "oʻtkazildi",
    pending: "jarayonda",
    st: { done: "bajarildi", overdue: "kechikkan", soon: "tez orada", upcoming: "kelgusi", none: "" } as Record<CheckpointState, string>,
  },
} as const;

const stateCls: Record<CheckpointState, string> = {
  done: "bg-emerald-100 text-emerald-700",
  overdue: "bg-red-100 text-red-700",
  soon: "bg-amber-100 text-amber-700",
  upcoming: "bg-slate-100 text-slate-500",
  none: "bg-slate-100 text-slate-400",
};

export default function OnboardingProgress({
  locale,
  startDate,
  today,
  tasks,
}: {
  locale: Locale;
  startDate: string | null;
  today: string;
  tasks: OnboardingTask[];
}) {
  const t = M[locale];
  if (tasks.length === 0) return null;

  const checklist = tasks.filter((x) => x.kind === "task").sort((a, b) => a.sort - b.sort);
  const checkpoints = tasks
    .filter((x) => x.kind === "checkpoint")
    .sort((a, b) => (a.day_offset ?? 0) - (b.day_offset ?? 0));
  const progress = Math.round(onboardingProgress(tasks) * 100);

  const statusText = (s: string) =>
    s === "done" ? t.done : s === "skipped" ? t.skipped : t.pending;

  return (
    <section className="card space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          {t.title}
        </h2>
        <span className="text-xs text-slate-400">
          {t.progress}: {progress}%
        </span>
      </div>

      {checklist.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-medium text-slate-400">{t.checklist}</p>
          <ul className="space-y-1 text-sm">
            {checklist.map((task) => {
              const closed = task.status === "done" || task.status === "skipped";
              return (
                <li key={task.id} className="flex items-center justify-between gap-2">
                  <span className={closed ? "text-slate-400 line-through" : ""}>
                    {task.title}
                  </span>
                  <span className="shrink-0 text-xs text-slate-400">{statusText(task.status)}</span>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {checkpoints.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-medium text-slate-400">{t.checkpoints}</p>
          <ul className="space-y-1.5 text-sm">
            {checkpoints.map((cp) => {
              const due = dueDate(startDate, cp.day_offset ?? 0);
              const state = checkpointState(due, today, cp.status);
              return (
                <li key={cp.id} className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <span>{checkpointLabel(locale, cp.day_offset ?? 0)}</span>
                    {due && <span className="ml-2 text-xs text-slate-400">{t.due}: {due}</span>}
                    {cp.note && <p className="text-xs text-slate-500">{cp.note}</p>}
                  </div>
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${stateCls[state]}`}>
                    {t.st[state]}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </section>
  );
}

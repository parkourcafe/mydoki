"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Locale } from "@/lib/i18n";
import {
  type OnboardingTask,
  defaultChecklist,
  checkpointLabel,
  onboardingStatusLabel,
  dueDate,
  checkpointState,
  onboardingProgress,
  type CheckpointState,
} from "@/lib/onboarding";
import {
  startOnboarding,
  setOnboardingTaskStatus,
  addOnboardingTask,
  setOnboardingNote,
  deleteOnboardingTask,
} from "@/app/employer/actions";

const M = {
  ru: {
    err: "Не удалось выполнить. Попробуйте ещё раз.",
    title: "Онбординг",
    intro: "Чек-лист оформления и контрольные точки испытательного периода (7/30/60/90 дней).",
    start: "Начать онбординг",
    checklist: "Чек-лист",
    checkpoints: "Контрольные точки",
    addPh: "Новая задача",
    add: "Добавить",
    done: "Готово",
    skip: "Пропустить",
    reopen: "Вернуть",
    remove: "Удалить",
    markDone: "Отметить выполненной",
    due: "Срок",
    noDate: "укажите дату выхода",
    notePh: "Итог чек-ина (виден и сотруднику)",
    save: "Сохранить",
    progress: "Прогресс",
    st: { done: "готово", overdue: "просрочено", soon: "скоро", upcoming: "впереди", none: "" } as Record<CheckpointState, string>,
  },
  en: {
    err: "That didn't go through. Please try again.",
    title: "Onboarding",
    intro: "Onboarding checklist and probation check-ins (7/30/60/90 days).",
    start: "Start onboarding",
    checklist: "Checklist",
    checkpoints: "Check-ins",
    addPh: "New task",
    add: "Add",
    done: "Done",
    skip: "Skip",
    reopen: "Reopen",
    remove: "Delete",
    markDone: "Mark done",
    due: "Due",
    noDate: "set a start date",
    notePh: "Check-in summary (visible to the employee too)",
    save: "Save",
    progress: "Progress",
    st: { done: "done", overdue: "overdue", soon: "soon", upcoming: "upcoming", none: "" } as Record<CheckpointState, string>,
  },
  id: {
    err: "Tidak berhasil. Silakan coba lagi.",
    title: "Onboarding",
    intro: "Daftar onboarding dan tinjauan masa percobaan (7/30/60/90 hari).",
    start: "Mulai onboarding",
    checklist: "Daftar tugas",
    checkpoints: "Tinjauan",
    addPh: "Tugas baru",
    add: "Tambah",
    done: "Selesai",
    skip: "Lewati",
    reopen: "Buka lagi",
    remove: "Hapus",
    markDone: "Tandai selesai",
    due: "Tenggat",
    noDate: "atur tanggal mulai",
    notePh: "Ringkasan tinjauan (dilihat karyawan juga)",
    save: "Simpan",
    progress: "Progres",
    st: { done: "selesai", overdue: "terlambat", soon: "segera", upcoming: "mendatang", none: "" } as Record<CheckpointState, string>,
  },
  uz: {
    err: "Bajarilmadi. Qayta urinib ko‘ring.",
    title: "Onboarding",
    intro: "Rasmiylashtirish roʻyxati va sinov davri nazoratlari (7/30/60/90 kun).",
    start: "Onboardingni boshlash",
    checklist: "Roʻyxat",
    checkpoints: "Nazoratlar",
    addPh: "Yangi vazifa",
    add: "Qoʻshish",
    done: "Bajarildi",
    skip: "Oʻtkazish",
    reopen: "Qaytarish",
    remove: "Oʻchirish",
    markDone: "Bajarildi deb belgilash",
    due: "Muddat",
    noDate: "chiqish sanasini kiriting",
    notePh: "Nazorat xulosasi (xodim ham koʻradi)",
    save: "Saqlash",
    progress: "Jarayon",
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

export default function OnboardingManager({
  locale,
  employmentId,
  startDate,
  today,
  tasks,
}: {
  locale: Locale;
  employmentId: string;
  startDate: string | null;
  today: string;
  tasks: OnboardingTask[];
}) {
  const t = M[locale];
  const router = useRouter();
  const [pending, start] = useTransition();
  const [newTask, setNewTask] = useState("");
  const [notes, setNotes] = useState<Record<string, string>>({});

  const [err, setErr] = useState(false);

  // Действия могут и бросить, и вернуть { error } — раньше оба случая
  // проглатывались, и кнопка выглядела сработавшей.
  function run(fn: () => Promise<unknown>) {
    start(async () => {
      setErr(false);
      try {
        const res = await fn();
        if (res && typeof res === "object" && "error" in res && res.error) {
          setErr(true);
          return;
        }
      } catch {
        setErr(true);
        return;
      }
      router.refresh();
    });
  }

  if (tasks.length === 0) {
    return (
      <section className="card space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          {t.title}
        </h2>
        <p className="text-sm text-slate-500">{t.intro}</p>
        <button
          type="button"
          disabled={pending}
          onClick={() => run(() => startOnboarding(employmentId, defaultChecklist(locale)))}
          className="btn-primary"
        >
          {t.start}
        </button>
      </section>
    );
  }

  const checklist = tasks.filter((x) => x.kind === "task").sort((a, b) => a.sort - b.sort);
  const checkpoints = tasks
    .filter((x) => x.kind === "checkpoint")
    .sort((a, b) => (a.day_offset ?? 0) - (b.day_offset ?? 0));
  const progress = Math.round(onboardingProgress(tasks) * 100);
  const nextSort = Math.max(0, ...tasks.map((x) => x.sort)) + 1;

  return (
    <section className="card space-y-4">
      {err && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{t.err}</p>
      )}
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          {t.title}
        </h2>
        <span className="text-xs text-slate-400">
          {t.progress}: {progress}%
        </span>
      </div>

      {/* Чек-лист */}
      <div>
        <p className="mb-2 text-xs font-medium text-slate-400">{t.checklist}</p>
        <ul className="space-y-1.5">
          {checklist.map((task) => {
            const closed = task.status === "done" || task.status === "skipped";
            return (
              <li key={task.id} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={task.status === "done"}
                  disabled={pending}
                  onChange={() =>
                    run(() =>
                      setOnboardingTaskStatus(
                        task.id,
                        employmentId,
                        task.status === "done" ? "pending" : "done"
                      )
                    )
                  }
                />
                <span className={closed ? "flex-1 text-slate-400 line-through" : "flex-1"}>
                  {task.title}
                </span>
                {task.status !== "skipped" ? (
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => run(() => setOnboardingTaskStatus(task.id, employmentId, "skipped"))}
                    className="text-xs text-slate-400 hover:underline"
                  >
                    {t.skip}
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => run(() => setOnboardingTaskStatus(task.id, employmentId, "pending"))}
                    className="text-xs text-slate-400 hover:underline"
                  >
                    {t.reopen}
                  </button>
                )}
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => run(() => deleteOnboardingTask(task.id, employmentId))}
                  className="text-xs text-red-400 hover:underline"
                >
                  ×
                </button>
              </li>
            );
          })}
        </ul>
        <div className="mt-2 flex gap-2">
          <input
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            className="input"
            placeholder={t.addPh}
          />
          <button
            type="button"
            disabled={pending || !newTask.trim()}
            onClick={() =>
              run(async () => {
                await addOnboardingTask(employmentId, newTask, nextSort);
                setNewTask("");
              })
            }
            className="btn-ghost shrink-0"
          >
            {t.add}
          </button>
        </div>
      </div>

      {/* Контрольные точки */}
      <div>
        <p className="mb-2 text-xs font-medium text-slate-400">{t.checkpoints}</p>
        <ul className="space-y-2">
          {checkpoints.map((cp) => {
            const due = dueDate(startDate, cp.day_offset ?? 0);
            const state = checkpointState(due, today, cp.status);
            return (
              <li key={cp.id} className="rounded-lg border border-slate-100 p-2.5">
                <div className="flex items-center justify-between gap-2 text-sm">
                  <span className="font-medium">{checkpointLabel(locale, cp.day_offset ?? 0)}</span>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${stateCls[state]}`}>
                    {t.st[state]}
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-slate-400">
                  {t.due}: {due ?? t.noDate}
                </p>
                <div className="mt-2 flex items-start gap-2">
                  <input
                    type="checkbox"
                    checked={cp.status === "done"}
                    disabled={pending}
                    className="mt-1"
                    onChange={() =>
                      run(() =>
                        setOnboardingTaskStatus(
                          cp.id,
                          employmentId,
                          cp.status === "done" ? "pending" : "done"
                        )
                      )
                    }
                  />
                  <div className="flex-1">
                    <textarea
                      defaultValue={cp.note ?? ""}
                      onChange={(e) => setNotes((n) => ({ ...n, [cp.id]: e.target.value }))}
                      rows={1}
                      className="input"
                      placeholder={t.notePh}
                    />
                    {notes[cp.id] !== undefined && notes[cp.id] !== (cp.note ?? "") && (
                      <button
                        type="button"
                        disabled={pending}
                        onClick={() => run(() => setOnboardingNote(cp.id, employmentId, notes[cp.id]))}
                        className="btn-ghost mt-1"
                      >
                        {t.save}
                      </button>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

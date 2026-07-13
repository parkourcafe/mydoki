"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Locale } from "@/lib/i18n";
import {
  type OffboardingTask,
  defaultOffboardingChecklist,
  offboardingProgress,
} from "@/lib/offboarding";
import {
  startOffboarding,
  setOffboardingTaskStatus,
  completeOffboarding,
} from "@/app/employer/actions";

const M = {
  ru: {
    title: "Оффбординг",
    intro: "Процесс завершения трудовых отношений: чек-лист выхода и дата последнего рабочего дня.",
    lastDay: "Последний рабочий день",
    start: "Начать оффбординг",
    checklist: "Чек-лист выхода",
    skip: "Пропустить", reopen: "Вернуть",
    complete: "Завершить оформление",
    confirmComplete: "Завершить трудовые отношения? Запись перейдёт в статус «Завершено».",
    progress: "Прогресс", err: "Не удалось. Проверьте статус записи.",
    doneHint: "Отметьте выполнение шагов, затем завершите оформление.",
  },
  en: {
    title: "Offboarding",
    intro: "Ending the employment: exit checklist and the last working day.",
    lastDay: "Last working day",
    start: "Start offboarding",
    checklist: "Exit checklist",
    skip: "Skip", reopen: "Reopen",
    complete: "Complete offboarding",
    confirmComplete: "End the employment? The record moves to “Ended”.",
    progress: "Progress", err: "Failed. Check the record status.",
    doneHint: "Mark the steps done, then complete offboarding.",
  },
  id: {
    title: "Offboarding",
    intro: "Mengakhiri hubungan kerja: daftar keluar dan hari kerja terakhir.",
    lastDay: "Hari kerja terakhir",
    start: "Mulai offboarding",
    checklist: "Daftar keluar",
    skip: "Lewati", reopen: "Buka lagi",
    complete: "Selesaikan offboarding",
    confirmComplete: "Akhiri hubungan kerja? Catatan menjadi “Selesai”.",
    progress: "Progres", err: "Gagal. Periksa status catatan.",
    doneHint: "Tandai langkah selesai, lalu selesaikan offboarding.",
  },
  uz: {
    title: "Offboarding",
    intro: "Mehnat munosabatlarini yakunlash: chiqish ro‘yxati va oxirgi ish kuni.",
    lastDay: "Oxirgi ish kuni",
    start: "Offboardingni boshlash",
    checklist: "Chiqish ro‘yxati",
    skip: "O‘tkazish", reopen: "Qaytarish",
    complete: "Offboardingni yakunlash",
    confirmComplete: "Mehnat munosabatlari tugatilsinmi? Yozuv «Yakunlangan» bo‘ladi.",
    progress: "Jarayon", err: "Bo‘lmadi. Yozuv holatini tekshiring.",
    doneHint: "Qadamlarni belgilang, so‘ng offboardingni yakunlang.",
  },
} as const;

export default function OffboardingManager({
  locale,
  employmentId,
  lastWorkingDay,
  tasks,
}: {
  locale: Locale;
  employmentId: string;
  lastWorkingDay: string | null;
  tasks: OffboardingTask[];
}) {
  const t = M[locale];
  const router = useRouter();
  const [pending, start] = useTransition();
  const [lastDay, setLastDay] = useState(lastWorkingDay ?? "");
  const [err, setErr] = useState(false);

  function run(fn: () => Promise<{ error?: string } | unknown>) {
    setErr(false);
    start(async () => {
      const res = (await fn()) as { error?: string } | undefined;
      if (res && "error" in res && res.error) { setErr(true); return; }
      router.refresh();
    });
  }

  if (tasks.length === 0) {
    return (
      <section className="card space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">{t.title}</h2>
        <p className="text-sm text-slate-500">{t.intro}</p>
        {err && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{t.err}</p>}
        <div>
          <label className="label">{t.lastDay}</label>
          <input type="date" value={lastDay} onChange={(e) => setLastDay(e.target.value)} className="input" />
        </div>
        <button
          type="button"
          disabled={pending}
          onClick={() => run(() => startOffboarding(employmentId, lastDay || null, defaultOffboardingChecklist(locale)))}
          className="btn-danger"
        >
          {t.start}
        </button>
      </section>
    );
  }

  const progress = Math.round(offboardingProgress(tasks) * 100);
  const sorted = tasks.slice().sort((a, b) => a.sort - b.sort);

  return (
    <section className="card space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">{t.title}</h2>
        <span className="text-xs text-slate-400">{t.progress}: {progress}%</span>
      </div>
      {err && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{t.err}</p>}
      {lastWorkingDay && (
        <p className="text-xs text-slate-500">{t.lastDay}: {lastWorkingDay}</p>
      )}

      <div>
        <p className="mb-2 text-xs font-medium text-slate-400">{t.checklist}</p>
        <ul className="space-y-1.5 text-sm">
          {sorted.map((task) => {
            const closed = task.status === "done" || task.status === "skipped";
            return (
              <li key={task.id} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={task.status === "done"}
                  disabled={pending}
                  onChange={() =>
                    run(() =>
                      setOffboardingTaskStatus(task.id, employmentId, task.status === "done" ? "pending" : "done")
                    )
                  }
                />
                <span className={closed ? "flex-1 text-slate-400 line-through" : "flex-1"}>{task.title}</span>
                {task.status !== "skipped" ? (
                  <button type="button" disabled={pending} onClick={() => run(() => setOffboardingTaskStatus(task.id, employmentId, "skipped"))} className="text-xs text-slate-400 hover:underline">
                    {t.skip}
                  </button>
                ) : (
                  <button type="button" disabled={pending} onClick={() => run(() => setOffboardingTaskStatus(task.id, employmentId, "pending"))} className="text-xs text-slate-400 hover:underline">
                    {t.reopen}
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      </div>

      <p className="text-xs text-slate-400">{t.doneHint}</p>
      <button
        type="button"
        disabled={pending}
        onClick={() => {
          if (!confirm(t.confirmComplete)) return;
          run(() => completeOffboarding(employmentId));
        }}
        className="btn-danger"
      >
        {t.complete}
      </button>
    </section>
  );
}

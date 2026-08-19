"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Locale } from "@/lib/i18n";
import { setVacancyStatus } from "@/app/employer/actions";

const M = {
  id: {
    pause: "Jeda",
    resume: "Aktifkan lagi",
    close: "Tutup lowongan",
    confirmClose:
      "Tutup lowongan ini? Kandidat tidak bisa melamar lagi, tapi lamaran yang sudah masuk tetap tersimpan.",
    pausedNote: "Dijeda — kandidat tidak bisa melamar untuk sementara.",
    closedNote: "Ditutup — tidak menerima lamaran baru.",
    err: "Tidak berhasil. Coba lagi.",
  },
  en: {
    pause: "Pause",
    resume: "Reopen",
    close: "Close vacancy",
    confirmClose:
      "Close this vacancy? Candidates can no longer apply, but applications already received are kept.",
    pausedNote: "Paused — candidates can't apply for now.",
    closedNote: "Closed — not accepting new applications.",
    err: "That didn't go through. Please try again.",
  },
  ru: {
    pause: "На паузу",
    resume: "Вернуть в работу",
    close: "Закрыть вакансию",
    confirmClose:
      "Закрыть вакансию? Откликнуться будет нельзя, но уже полученные отклики сохранятся.",
    pausedNote: "На паузе — откликнуться сейчас нельзя.",
    closedNote: "Закрыта — новые отклики не принимаются.",
    err: "Не удалось выполнить. Попробуйте ещё раз.",
  },
  uz: {
    pause: "Pauza",
    resume: "Qayta faollashtirish",
    close: "Vakansiyani yopish",
    confirmClose:
      "Vakansiya yopilsinmi? Yangi ariza berib bo‘lmaydi, kelgan arizalar saqlanadi.",
    pausedNote: "Pauzada — nomzodlar hozircha ariza bera olmaydi.",
    closedNote: "Yopilgan — yangi arizalar qabul qilinmaydi.",
    err: "Bajarilmadi. Qayta urinib ko‘ring.",
  },
} as const;

export default function VacancyStatusActions({
  locale,
  vacancyId,
  status,
}: {
  locale: Locale;
  vacancyId: string;
  status: "active" | "paused" | "closed";
}) {
  const t = M[locale];
  const router = useRouter();
  const [pending, start] = useTransition();
  const [err, setErr] = useState(false);

  function change(next: "active" | "paused" | "closed") {
    if (next === "closed" && !window.confirm(t.confirmClose)) return;
    start(async () => {
      setErr(false);
      const res = await setVacancyStatus(vacancyId, next);
      if ("error" in res) {
        setErr(true);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="mb-4 space-y-2">
      <div className="flex flex-wrap gap-2">
        {status === "active" && (
          <button
            type="button"
            disabled={pending}
            onClick={() => change("paused")}
            className="btn-ghost disabled:opacity-50"
          >
            ⏸ {t.pause}
          </button>
        )}
        {status !== "active" && (
          <button
            type="button"
            disabled={pending}
            onClick={() => change("active")}
            className="btn-ghost disabled:opacity-50"
          >
            ▶ {t.resume}
          </button>
        )}
        {status !== "closed" && (
          <button
            type="button"
            disabled={pending}
            onClick={() => change("closed")}
            className="btn-ghost disabled:opacity-50"
          >
            ✕ {t.close}
          </button>
        )}
      </div>
      {status === "paused" && (
        <p className="text-xs text-amber-700">{t.pausedNote}</p>
      )}
      {status === "closed" && (
        <p className="text-xs text-slate-500">{t.closedNote}</p>
      )}
      {err && <p className="text-sm text-red-600">{t.err}</p>}
    </div>
  );
}

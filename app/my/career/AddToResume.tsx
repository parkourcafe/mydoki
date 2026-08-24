"use client";

import { useState } from "react";
import type { Locale } from "@/lib/i18n";
import { addEmploymentToResume } from "./actions";

const M = {
  ru: {
    add: "＋ В резюме",
    busy: "Добавляю…",
    added: "В резюме ✓",
    already: "Уже в резюме",
    failed: "Не вышло",
    full: "Список опыта полон",
  },
  en: {
    add: "＋ To resume",
    busy: "Adding…",
    added: "In the resume ✓",
    already: "Already there",
    failed: "Didn't work",
    full: "Experience list is full",
  },
  id: {
    add: "＋ Ke resume",
    busy: "Menambahkan…",
    added: "Ada di resume ✓",
    already: "Sudah ada",
    failed: "Gagal",
    full: "Daftar pengalaman penuh",
  },
  uz: {
    add: "＋ Rezyumega",
    busy: "Qo‘shilmoqda…",
    added: "Rezyumeda ✓",
    already: "Allaqachon bor",
    failed: "Bo‘lmadi",
    full: "Tajriba ro‘yxati to‘lgan",
  },
} as const;

/**
 * Кнопка «добавить место работы в резюме». Уже добавленные показываем меткой,
 * а не кнопкой: повторное нажатие всё равно ничего не продублирует.
 */
export default function AddToResume({
  locale,
  employmentId,
  linked,
}: {
  locale: Locale;
  employmentId: string;
  /** Строка резюме с этой ссылкой уже есть. */
  linked: boolean;
}) {
  const t = M[locale];
  const [state, setState] = useState<"idle" | "busy" | "done" | "already" | "full" | "failed">(
    linked ? "already" : "idle"
  );

  if (state === "already" || state === "done") {
    return (
      <span className="shrink-0 text-xs font-medium text-green-700">
        {state === "done" ? t.added : t.already}
      </span>
    );
  }

  return (
    <button
      type="button"
      disabled={state === "busy"}
      onClick={async () => {
        setState("busy");
        const res = await addEmploymentToResume(employmentId);
        if ("ok" in res) setState(res.already ? "already" : "done");
        else setState(res.error === "full" ? "full" : "failed");
      }}
      className="shrink-0 rounded-lg border border-slate-200 px-2.5 py-1 text-xs text-slate-600 hover:bg-slate-50 disabled:opacity-60"
    >
      {state === "busy"
        ? t.busy
        : state === "full"
          ? t.full
          : state === "failed"
            ? t.failed
            : t.add}
    </button>
  );
}

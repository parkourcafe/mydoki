"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Locale } from "@/lib/i18n";
import { saveEmploymentLetter } from "./actions";

const M = {
  ru: {
    save: "Сохранить в документы",
    busy: "Сохраняю…",
    done: "Сохранено ✓",
    failed: "Не удалось сохранить",
  },
  en: {
    save: "Save to documents",
    busy: "Saving…",
    done: "Saved ✓",
    failed: "Couldn't save",
  },
  id: {
    save: "Simpan ke dokumen",
    busy: "Menyimpan…",
    done: "Tersimpan ✓",
    failed: "Gagal menyimpan",
  },
  uz: {
    save: "Hujjatlarga saqlash",
    busy: "Saqlanmoqda…",
    done: "Saqlandi ✓",
    failed: "Saqlab bo‘lmadi",
  },
} as const;

/**
 * Кладёт справку о работе в документы сотрудника. Скачивание остаётся рядом:
 * иногда бумагу просто отдают на руки, а не хранят в системе.
 */
export default function SaveLetter({
  locale,
  employmentId,
}: {
  locale: Locale;
  employmentId: string;
}) {
  const t = M[locale];
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [state, setState] = useState<"idle" | "done" | "failed">("idle");

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          const res = await saveEmploymentLetter(employmentId);
          setState("ok" in res ? "done" : "failed");
          if ("ok" in res) router.refresh();
        })
      }
      className="btn-ghost disabled:opacity-60"
    >
      {pending ? t.busy : state === "done" ? t.done : state === "failed" ? t.failed : t.save}
    </button>
  );
}

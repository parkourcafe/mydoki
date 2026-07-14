import type { Locale } from "./i18n";

// ========================= Offboarding ================================
// Завершение трудовых отношений (P4-1). Чек-лист выхода привязан к employment;
// по завершении процесса employment.status='ended'. Здесь — шаблоны, метки и
// чистый хелпер прогресса под юнит-тесты.

export type OffboardingStatus = "pending" | "done" | "skipped";

export type OffboardingTask = {
  id: string;
  employment_id: string;
  title: string;
  status: OffboardingStatus;
  note: string | null;
  sort: number;
  created_at: string;
  done_at: string | null;
};

const CHECKLIST: Record<Locale, string[]> = {
  ru: [
    "Вернуть имущество компании",
    "Отключить доступы и учётные записи",
    "Выдать финальные документы",
    "Провести exit-интервью",
  ],
  en: [
    "Return company property",
    "Revoke access and accounts",
    "Issue final documents",
    "Run the exit interview",
  ],
  id: [
    "Kembalikan properti perusahaan",
    "Cabut akses dan akun",
    "Terbitkan dokumen final",
    "Lakukan wawancara keluar",
  ],
  uz: [
    "Kompaniya mulkini qaytarish",
    "Kirish va hisoblarni o‘chirish",
    "Yakuniy hujjatlarni berish",
    "Chiqish suhbatini o‘tkazish",
  ],
};

/** Дефолтный чек-лист выхода на локали работодателя (в start_offboarding). */
export function defaultOffboardingChecklist(locale: Locale): string[] {
  return CHECKLIST[locale];
}

const STATUS_LABELS: Record<Locale, Record<OffboardingStatus, string>> = {
  ru: { pending: "В процессе", done: "Готово", skipped: "Пропущено" },
  en: { pending: "Pending", done: "Done", skipped: "Skipped" },
  id: { pending: "Berjalan", done: "Selesai", skipped: "Dilewati" },
  uz: { pending: "Jarayonda", done: "Bajarildi", skipped: "O‘tkazildi" },
};

export function offboardingStatusLabel(
  locale: Locale,
  status: OffboardingStatus | string
): string {
  return STATUS_LABELS[locale][status as OffboardingStatus] ?? String(status);
}

/** Прогресс чек-листа выхода: доля завершённых (done или skipped) [0..1]. */
export function offboardingProgress(tasks: OffboardingTask[]): number {
  if (tasks.length === 0) return 0;
  const closed = tasks.filter(
    (t) => t.status === "done" || t.status === "skipped"
  ).length;
  return closed / tasks.length;
}

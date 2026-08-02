import type { Locale } from "./i18n";

// ============================ Onboarding ==============================
// Чек-лист оформления + контрольные точки испытательного периода (P2-3).
// Привязан к employment. Здесь — шаблоны, офсеты и чистые хелперы (дедлайны,
// состояние точки) под юнит-тесты.

export type OnboardingKind = "task" | "checkpoint";
export type OnboardingStatus = "pending" | "done" | "skipped";

export type OnboardingTask = {
  id: string;
  employment_id: string;
  title: string;
  kind: OnboardingKind;
  day_offset: number | null;
  status: OnboardingStatus;
  note: string | null;
  sort: number;
  created_at: string;
  done_at: string | null;
};

/** Контрольные точки испытательного периода (дни от даты выхода). */
export const CHECKPOINT_OFFSETS = [7, 30, 60, 90] as const;

const CHECKLIST: Record<Locale, string[]> = {
  ru: [
    "Собрать документы для оформления",
    "Подписать трудовой договор",
    "Выдать доступы и оборудование",
    "Провести вводный инструктаж",
  ],
  en: [
    "Collect onboarding documents",
    "Sign the employment contract",
    "Grant access and equipment",
    "Run the intro orientation",
  ],
  id: [
    "Kumpulkan dokumen onboarding",
    "Tanda tangani kontrak kerja",
    "Berikan akses dan perlengkapan",
    "Lakukan orientasi awal",
  ],
  uz: [
    "Rasmiylashtirish uchun hujjatlarni yigʻish",
    "Mehnat shartnomasini imzolash",
    "Kirish va jihozlarni berish",
    "Kirish yoʻriqnomasini oʻtkazish",
  ],
};

/** Дефолтный чек-лист на локали работодателя (передаётся в start_onboarding). */
export function defaultChecklist(locale: Locale): string[] {
  return CHECKLIST[locale];
}

/** Локализованная подпись контрольной точки по офсету. */
export function checkpointLabel(locale: Locale, offset: number): string {
  const tpl: Record<Locale, string> = {
    ru: `Контрольная точка: ${offset} дней`,
    en: `Check-in: ${offset} days`,
    id: `Tinjauan: ${offset} hari`,
    uz: `Nazorat: ${offset} kun`,
  };
  return tpl[locale];
}

const STATUS_LABELS: Record<Locale, Record<OnboardingStatus, string>> = {
  ru: { pending: "В процессе", done: "Готово", skipped: "Пропущено" },
  en: { pending: "Pending", done: "Done", skipped: "Skipped" },
  id: { pending: "Berjalan", done: "Selesai", skipped: "Dilewati" },
  uz: { pending: "Jarayonda", done: "Bajarildi", skipped: "Oʻtkazildi" },
};

export function onboardingStatusLabel(
  locale: Locale,
  status: OnboardingStatus | string
): string {
  return STATUS_LABELS[locale][status as OnboardingStatus] ?? String(status);
}

/** Дата контрольной точки = дата выхода + офсет (UTC, YYYY-MM-DD). */
export function dueDate(start: string | null, offset: number): string | null {
  if (!start) return null;
  const d = new Date(`${start}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return null;
  d.setUTCDate(d.getUTCDate() + offset);
  return d.toISOString().slice(0, 10);
}

export type CheckpointState = "done" | "overdue" | "soon" | "upcoming" | "none";

/**
 * Состояние контрольной точки относительно опорной даты (ref, YYYY-MM-DD).
 * done — уже отмечена; overdue — срок прошёл; soon — в пределах 7 дней;
 * upcoming — позже; none — нет даты выхода.
 */
export function checkpointState(
  due: string | null,
  ref: string,
  status: OnboardingStatus | string = "pending"
): CheckpointState {
  if (status === "done" || status === "skipped") return "done";
  if (!due) return "none";
  const d = Date.parse(`${due}T00:00:00Z`);
  const r = Date.parse(`${ref}T00:00:00Z`);
  if (Number.isNaN(d) || Number.isNaN(r)) return "none";
  const days = Math.round((d - r) / 86_400_000);
  if (days < 0) return "overdue";
  if (days <= 7) return "soon";
  return "upcoming";
}

/** Прогресс чек-листа: доля завершённых (done или skipped) задач [0..1]. */
export function onboardingProgress(tasks: OnboardingTask[]): number {
  if (tasks.length === 0) return 0;
  const closed = tasks.filter(
    (t) => t.status === "done" || t.status === "skipped"
  ).length;
  return closed / tasks.length;
}

import type { Locale } from "./i18n";
import type { Employment } from "./employment";

// ======================== Career timeline ============================
// P4-3: карьерный таймлайн — консолидированная профессиональная история
// человека из всех его трудовых отношений (от работодателя + ручные),
// включая завершённые (архив). Чистые хелперы под юнит-тесты.

function ymd(d: string): { y: number; m: number; day: number } {
  const [y, m, day] = d.split("-").map(Number);
  return { y, m, day };
}

/** Целых месяцев между start и (end|today). Обе даты YYYY-MM-DD. */
export function employmentDurationMonths(
  start: string | null,
  end: string | null,
  today: string
): number {
  if (!start) return 0;
  const s = ymd(start);
  const e = ymd(end || today);
  let m = (e.y - s.y) * 12 + (e.m - s.m);
  if (e.day < s.day) m -= 1;
  return Math.max(0, m);
}

/** Разбивка на текущие (active) и архив (ended). */
export function splitCurrentArchive(items: Employment[]): {
  current: Employment[];
  archive: Employment[];
} {
  const current: Employment[] = [];
  const archive: Employment[] = [];
  for (const e of items) (e.status === "ended" ? archive : current).push(e);
  return { current, archive };
}

/** Хронологически по дате начала (свежие сверху); без даты — в конец. */
export function sortByStartDesc(items: Employment[]): Employment[] {
  return items.slice().sort((a, b) => {
    if (!a.start_date && !b.start_date) return 0;
    if (!a.start_date) return 1;
    if (!b.start_date) return -1;
    return a.start_date < b.start_date ? 1 : a.start_date > b.start_date ? -1 : 0;
  });
}

/**
 * Суммарный опыт в месяцах (сумма длительностей записей). Может завышать при
 * пересечении периодов — это осознанное упрощение (показываем как ориентир).
 */
export function totalExperienceMonths(items: Employment[], today: string): number {
  return items.reduce(
    (sum, e) => sum + employmentDurationMonths(e.start_date, e.end_date, today),
    0
  );
}

const UNITS: Record<Locale, { y: string; m: string; zero: string }> = {
  ru: { y: "г.", m: "мес.", zero: "меньше месяца" },
  en: { y: "y", m: "mo", zero: "less than a month" },
  id: { y: "thn", m: "bln", zero: "kurang dari sebulan" },
  uz: { y: "yil", m: "oy", zero: "bir oydan kam" },
};

/** «2 г. 3 мес.» / «2y 3mo». Ноль месяцев → локализованное «меньше месяца». */
export function formatDuration(months: number, locale: Locale): string {
  const u = UNITS[locale];
  if (months <= 0) return u.zero;
  const y = Math.floor(months / 12);
  const m = months % 12;
  const parts: string[] = [];
  if (y > 0) parts.push(`${y} ${u.y}`);
  if (m > 0) parts.push(`${m} ${u.m}`);
  return parts.join(" ");
}

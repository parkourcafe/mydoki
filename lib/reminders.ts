/**
 * Чистая логика напоминаний (без IO — юнит-тесты подставляют фиксированное «сегодня»).
 * offsets — положительные «дней до срока», напр. [30, 7, 1].
 */

export const DEFAULT_OFFSETS = [30, 7, 1];

/** «30, 7, 1» → [30,7,1]; мусор/пусто → дефолт. Убыв. порядок, уникальные. */
export function parseOffsets(input: string | null | undefined): number[] {
  const nums = (input ?? "")
    .split(/[,\s]+/)
    .map((s) => parseInt(s, 10))
    .filter((n) => Number.isFinite(n) && n > 0);
  const uniq = Array.from(new Set(nums)).sort((a, b) => b - a);
  return uniq.length ? uniq : [...DEFAULT_OFFSETS];
}

/** Целых дней от today до targetDate (обе — YYYY-MM-DD). Может быть < 0. */
export function daysUntil(targetDate: string, today: string): number {
  const t = Date.parse(targetDate + "T00:00:00Z");
  const n = Date.parse(today + "T00:00:00Z");
  return Math.round((t - n) / 86400000);
}

/**
 * Метка самого срочного достигнутого порога на сегодня или null.
 * Для offsets [30,7,1]: (7;30]→d30, (1;7]→d7, [0;1]→d1, иначе null
 * (до цели дальше макс. offset либо дата прошла). Обобщает прежний
 * SQL-case (<=7 → d7, иначе d30) добавлением порога d1.
 */
export function bucketKind(
  targetDate: string,
  today: string,
  offsets: number[] = DEFAULT_OFFSETS
): string | null {
  const left = daysUntil(targetDate, today);
  if (left < 0) return null;
  const asc = Array.from(new Set(offsets.filter((o) => o > 0))).sort(
    (a, b) => a - b
  );
  for (const o of asc) {
    if (left <= o) return `d${o}`;
  }
  return null; // до цели дальше максимального порога
}

/** Сегодня в UTC как YYYY-MM-DD. */
export function todayUTC(now: Date): string {
  return now.toISOString().slice(0, 10);
}

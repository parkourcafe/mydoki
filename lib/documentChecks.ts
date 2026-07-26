/**
 * Чистая логика автопроверок документов (без IO — тестируется юнитами).
 * IO-оркестрация (скачивание файла, sha256, запись строк) — в server action
 * runDocumentChecks. Никаких вердиктов о подлинности документа: только
 * нейтральные результаты pass / mismatch / unreadable.
 */

export type CheckType =
  | "expiry"
  | "name_match"
  | "date_consistency"
  | "file_integrity";
export type CheckResult = "pass" | "mismatch" | "unreadable";

export type CheckOutcome = {
  check_type: CheckType;
  result: CheckResult;
  details: Record<string, unknown>;
};

/** Сегодня в формате YYYY-MM-DD (ISO-даты сравнимы лексикографически). */
export function todayISO(now: Date): string {
  return now.toISOString().slice(0, 10);
}

/**
 * Срок действия. Нет даты — проверка не применима (null). Дата в прошлом —
 * mismatch (истёк), сегодня/будущее — pass.
 */
export function evalExpiry(
  expiresAt: string | null | undefined,
  today: string
): CheckOutcome | null {
  const d = (expiresAt ?? "").slice(0, 10);
  if (!d) return null;
  const result: CheckResult = d < today ? "mismatch" : "pass";
  return { check_type: "expiry", result, details: { expires_at: d } };
}

/**
 * Согласованность дат. Проверяется при наличии даты выдачи: дата выдачи в
 * будущем → mismatch; выдан позже, чем истекает → mismatch; иначе pass.
 */
export function evalDateConsistency(
  issuedAt: string | null | undefined,
  expiresAt: string | null | undefined,
  today: string
): CheckOutcome | null {
  const issued = (issuedAt ?? "").slice(0, 10);
  if (!issued) return null;
  const expires = (expiresAt ?? "").slice(0, 10);
  const details: Record<string, unknown> = { issued_at: issued };
  if (expires) details.expires_at = expires;

  let result: CheckResult = "pass";
  if (issued > today) result = "mismatch"; // выдан в будущем
  else if (expires && issued > expires) result = "mismatch"; // выдан после окончания
  return { check_type: "date_consistency", result, details };
}

/** Нормализация имени для сравнения: регистр, пробелы, порядок слов, ё→е. */
export function normalizeName(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/ё/g, "е")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .sort()
    .join(" ");
}

/**
 * Совпадение имени владельца в документе с именем члена семьи. Применимо
 * только при наличии обоих имён. Формулировка результата — нейтральная:
 * mismatch = «требует ручной проверки», а не вердикт о подлинности.
 */
export function evalNameMatch(
  holderName: string | null | undefined,
  memberName: string | null | undefined
): CheckOutcome | null {
  const holder = (holderName ?? "").trim();
  const member = (memberName ?? "").trim();
  if (!holder || !member) return null;
  const result: CheckResult =
    normalizeName(holder) === normalizeName(member) ? "pass" : "mismatch";
  return {
    check_type: "name_match",
    result,
    details: { holder_name: holder, member_name: member },
  };
}

export type OwnerCandidate = {
  id: string;
  full_name: string;
};

export type OwnerSuggestion = {
  member_id: string;
  member_name: string;
  reason: "exact_name";
};

/**
 * Ищет однозначного владельца документа среди всех профилей семьи.
 * Возвращает предложение только для единственного точного совпадения ФИО и
 * только если документ сейчас лежит у другого человека. Нечёткие и
 * неоднозначные случаи намеренно остаются на ручной выбор.
 */
export function suggestDocumentOwner(
  holderName: string | null | undefined,
  currentMemberId: string | null | undefined,
  members: OwnerCandidate[]
): OwnerSuggestion | null {
  const holder = normalizeName(holderName ?? "");
  if (!holder) return null;

  const matches = members.filter(
    (member) => normalizeName(member.full_name) === holder
  );
  if (matches.length !== 1 || matches[0].id === currentMemberId) return null;

  return {
    member_id: matches[0].id,
    member_name: matches[0].full_name,
    reason: "exact_name",
  };
}

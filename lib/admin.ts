// Аллоу-лист кураторов (админов) из env ADMIN_EMAILS. Чистые функции —
// покрываются юнит-тестами; серверная проверка (requireAdmin) — в actions.
// Fail-closed: пустой список → админов нет.

export function parseAdminEmails(raw: string | undefined | null): string[] {
  return (raw ?? "")
    .split(/[,\s]+/)
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

export function isAllowedAdmin(
  email: string | null | undefined,
  raw: string | undefined | null
): boolean {
  const e = (email ?? "").trim().toLowerCase();
  if (!e) return false;
  return parseAdminEmails(raw).includes(e);
}

import "server-only";
import { createHash } from "node:crypto";

/** Хэш пароля share-ссылки (соль из env). Пусто → null (без пароля). */
export function hashSharePassword(pw: string | null | undefined): string | null {
  const clean = (pw ?? "").trim();
  if (!clean) return null;
  const salt = process.env.SHARE_PW_SALT || "doki-share-pw-v1";
  return createHash("sha256").update(salt + clean).digest("hex");
}

/** Обезличенный хэш IP для журнала доступов (не храним сам IP). */
export function hashIp(ip: string | null): string | null {
  if (!ip) return null;
  const salt = process.env.IP_HASH_SALT || "doki-apply-v1";
  return createHash("sha256").update(salt + ip).digest("hex").slice(0, 32);
}

/** Имя cookie с хэшем введённого пароля для конкретного токена. */
export function shareCookieName(token: string): string {
  return `spw_${token.slice(0, 24)}`;
}

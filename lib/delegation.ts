import type { Locale } from "./i18n";

// ======================= Vault delegated access =======================
// F-2 · Делегированный доступ по ЦЕЛИ и СРОКУ (арх. §7.2). Владелец выдаёт
// именованному пользователю read-доступ к области (весь сейф / одна
// категория) с целью и обязательным сроком; доступ авто-истекает и
// отзывается. Здесь — типы, метки и чистая логика статуса под юнит-тесты.
// Никаких вердиктов/оценок — только детерминированная логика доступа.

export type DelegationScope = "all" | "category";

export const DELEGATION_SCOPES: DelegationScope[] = ["all", "category"];

// Категории сейфа (совпадают с enum doc_category в БД).
export type VaultCategory =
  | "identity"
  | "education"
  | "medical"
  | "financial"
  | "legal"
  | "other";

export const VAULT_CATEGORIES: VaultCategory[] = [
  "identity",
  "education",
  "medical",
  "financial",
  "legal",
  "other",
];

export type Delegation = {
  id: string;
  household_id: string;
  grantee_user_id: string | null;
  invite_email: string | null;
  token: string;
  scope: DelegationScope;
  scope_category: string | null;
  purpose: string;
  expires_at: string; // ISO
  status: "pending" | "active" | "revoked";
  created_at: string;
  accepted_at: string | null;
  revoked_at: string | null;
};

// Производный статус с учётом СРОКА (истечение не хранится — вычисляется).
export type EffectiveStatus = "pending" | "active" | "expired" | "revoked";

export function effectiveStatus(
  d: Pick<Delegation, "status" | "expires_at">,
  now: Date
): EffectiveStatus {
  if (d.status === "revoked") return "revoked";
  if (new Date(d.expires_at).getTime() <= now.getTime()) return "expired";
  return d.status; // 'pending' | 'active'
}

// Действует ли делегация прямо сейчас (доступ реально открыт).
export function isActive(
  d: Pick<Delegation, "status" | "expires_at" | "revoked_at" | "grantee_user_id">,
  now: Date
): boolean {
  return (
    d.status === "active" &&
    d.revoked_at == null &&
    d.grantee_user_id != null &&
    new Date(d.expires_at).getTime() > now.getTime()
  );
}

const SCOPE_ALL: Record<Locale, string> = {
  ru: "Весь сейф",
  en: "Entire vault",
  id: "Seluruh brankas",
  uz: "Butun seyf",
};

const CATEGORY_LABELS: Record<Locale, Record<VaultCategory, string>> = {
  ru: { identity: "Личность", education: "Образование", medical: "Медицина", financial: "Финансы", legal: "Право", other: "Другое" },
  en: { identity: "Identity", education: "Education", medical: "Medical", financial: "Financial", legal: "Legal", other: "Other" },
  id: { identity: "Identitas", education: "Pendidikan", medical: "Medis", financial: "Keuangan", legal: "Hukum", other: "Lainnya" },
  uz: { identity: "Shaxsiyat", education: "Ta'lim", medical: "Tibbiyot", financial: "Moliya", legal: "Huquq", other: "Boshqa" },
};

export function categoryLabel(locale: Locale, category: string): string {
  return CATEGORY_LABELS[locale][category as VaultCategory] ?? category;
}

// Человекочитаемое описание области доступа.
export function scopeSummary(
  locale: Locale,
  d: Pick<Delegation, "scope" | "scope_category">
): string {
  if (d.scope === "category" && d.scope_category) {
    return categoryLabel(locale, d.scope_category);
  }
  return SCOPE_ALL[locale];
}

const STATUS_LABELS: Record<Locale, Record<EffectiveStatus, string>> = {
  ru: { pending: "Ожидает принятия", active: "Действует", expired: "Истёк", revoked: "Отозван" },
  en: { pending: "Awaiting acceptance", active: "Active", expired: "Expired", revoked: "Revoked" },
  id: { pending: "Menunggu penerimaan", active: "Aktif", expired: "Kedaluwarsa", revoked: "Dicabut" },
  uz: { pending: "Qabul kutilmoqda", active: "Amal qilmoqda", expired: "Muddati tugagan", revoked: "Bekor qilingan" },
};

export function statusLabel(locale: Locale, status: EffectiveStatus): string {
  return STATUS_LABELS[locale][status];
}

// Клиентская валидация срока (авторитетная — в RPC). Возвращает true, если
// дата в будущем и разбираема.
export function isFutureExpiry(expiresAt: string, now: Date): boolean {
  const t = new Date(expiresAt).getTime();
  return Number.isFinite(t) && t > now.getTime();
}

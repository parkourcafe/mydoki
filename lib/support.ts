// Support channels. The WhatsApp number is configured via the
// NEXT_PUBLIC_SUPPORT_WHATSAPP env var (digits only, international format, no "+"),
// e.g. NEXT_PUBLIC_SUPPORT_WHATSAPP=6281234567890.
//
// ⚠ Reactive (inbound) support only — this is not for cold outreach
// (prohibited by WhatsApp policy). Leave the env var unset to hide the
// WhatsApp channel entirely until a WhatsApp Business number is ready.

export const SUPPORT_EMAIL = "support@doki.help";
export const SECURITY_EMAIL = "security@doki.help";

/** Raw digits of the support WhatsApp number, or null if not configured. */
export function supportWhatsappNumber(): string | null {
  const raw = (process.env.NEXT_PUBLIC_SUPPORT_WHATSAPP || "").replace(/\D/g, "");
  return raw.length >= 8 ? raw : null;
}

/**
 * wa.me link to the support WhatsApp, or null if not configured.
 * @param prefill optional pre-filled message text.
 */
export function supportWhatsappUrl(prefill?: string): string | null {
  const num = supportWhatsappNumber();
  if (!num) return null;
  const base = `https://wa.me/${num}`;
  return prefill ? `${base}?text=${encodeURIComponent(prefill)}` : base;
}

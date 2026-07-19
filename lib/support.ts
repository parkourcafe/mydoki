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

// Local representative / point of contact in Indonesia — required for a foreign
// PSE registration. Configure via env; leave unset to hide the block until the
// representative details are ready to publish.
//   NEXT_PUBLIC_ID_REP_NAME=Name (person or company)
//   NEXT_PUBLIC_ID_REP_CONTACT=email or +62 phone (optional)
export function indonesiaRep(): { name: string; contact: string } | null {
  const name = (process.env.NEXT_PUBLIC_ID_REP_NAME || "").trim();
  if (!name) return null;
  return { name, contact: (process.env.NEXT_PUBLIC_ID_REP_CONTACT || "").trim() };
}

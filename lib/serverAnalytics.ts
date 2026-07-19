import { createHash } from "crypto";

// Server-side PostHog capture via the HTTP API (no posthog-node dependency).
// Used for events that only happen off the browser — e.g. reminder emails sent
// by the cron. Never pass PII in `properties`; hash any user identifier.

const KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const HOST =
  process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com";

type Props = Record<string, string | number | boolean | null | undefined>;

/** Stable, non-reversible id for a person (so PostHog can dedupe without PII). */
export function anonId(seed: string): string {
  return createHash("sha256").update(seed).digest("hex").slice(0, 32);
}

export async function serverCapture(
  event: string,
  distinctId: string,
  properties?: Props,
): Promise<void> {
  if (!KEY) return;
  try {
    await fetch(`${HOST}/capture/`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        api_key: KEY,
        event,
        distinct_id: distinctId,
        properties: properties ?? {},
      }),
    });
  } catch {
    /* analytics must never break the cron */
  }
}

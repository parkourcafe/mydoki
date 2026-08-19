"use client";

import { useState } from "react";
import type { Locale } from "@/lib/i18n";
import { SEARCH_INTENTS, searchIntentLabel, type SearchIntent } from "@/lib/passport";

/**
 * Статус поиска (v1.2 §8.4) — отдельная state machine. Он не связан со
 * статусом отклика: `unavailable` останавливает новые рекомендации и
 * приглашения, но не закрывает уже поданные отклики.
 */
export default function IntentPicker({
  locale,
  value,
  onChange,
}: {
  locale: Locale;
  value: SearchIntent;
  onChange: (intent: SearchIntent) => void | Promise<void>;
}) {
  const [busy, setBusy] = useState(false);

  return (
    <div className="flex flex-wrap gap-2">
      {SEARCH_INTENTS.map((intent) => (
        <button
          key={intent}
          type="button"
          disabled={busy}
          className={intent === value ? "btn-primary" : "btn-ghost"}
          onClick={async () => {
            setBusy(true);
            await onChange(intent);
            setBusy(false);
          }}
        >
          {searchIntentLabel(locale, intent)}
        </button>
      ))}
    </div>
  );
}

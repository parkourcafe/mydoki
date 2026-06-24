"use client";

import { useState } from "react";
import { clearAll } from "@/lib/offlineDb";

/**
 * Кнопка выхода: перед отправкой формы (серверный action signOut /
 * signOutEverywhere) стирает офлайн-копии документов с этого устройства,
 * чтобы после выхода на чужом/общем устройстве ничего не осталось.
 */
export default function SignOutButton({
  label,
  className,
}: {
  label: string;
  className?: string;
}) {
  const [busy, setBusy] = useState(false);
  return (
    <button
      type="submit"
      disabled={busy}
      className={className}
      onClick={async (e) => {
        e.preventDefault();
        const form = e.currentTarget.form;
        setBusy(true);
        try {
          await clearAll();
        } catch {
          // даже если очистка не удалась — всё равно выходим
        }
        form?.requestSubmit();
      }}
    >
      {label}
    </button>
  );
}

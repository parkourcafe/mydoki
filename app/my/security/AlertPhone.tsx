"use client";

import { useState } from "react";
import { getSupabaseBrowser } from "@/lib/supabase/client";

/** Телефон для SMS-оповещений — хранится в метаданных пользователя. */
export default function AlertPhone({ initial }: { initial: string }) {
  const [phone, setPhone] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    const supabase = getSupabaseBrowser();
    const { error } = await supabase.auth.updateUser({
      data: { alert_phone: phone.trim() },
    });
    setBusy(false);
    setMsg(error ? error.message : "Сохранено.");
  }

  return (
    <form onSubmit={save} className="flex flex-wrap items-end gap-2">
      <div className="min-w-[200px] flex-1">
        <label className="label">Телефон для SMS-оповещений</label>
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="input"
          placeholder="+7 900 000-00-00"
        />
      </div>
      <button disabled={busy} className="btn-primary">
        {busy ? "…" : "Сохранить"}
      </button>
      {msg && <span className="pb-2 text-xs text-slate-500">{msg}</span>}
    </form>
  );
}

"use client";

import { useState } from "react";
import { createSpace, switchSpace } from "@/app/my/actions";

type Space = { id: string; name: string };

export default function SpaceSwitcher({
  spaces,
  activeId,
}: {
  spaces: Space[];
  activeId: string;
}) {
  const [open, setOpen] = useState(false);
  const active = spaces.find((s) => s.id === activeId);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 rounded-lg border border-[#e8e0d5] bg-white px-3 py-1.5 text-sm font-medium hover:bg-[#f0e6d9]"
      >
        <span className="max-w-[140px] truncate">{active?.name ?? "Пространство"}</span>
        <span className="text-xs text-slate-400">▾</span>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute left-0 z-20 mt-1 w-64 rounded-xl border border-[#e8e0d5] bg-white p-2 shadow-lg">
            <div className="px-2 py-1 text-xs uppercase tracking-wide text-slate-400">
              Пространства
            </div>
            {spaces.map((s) => (
              <form key={s.id} action={switchSpace}>
                <input type="hidden" name="household_id" value={s.id} />
                <button
                  className={
                    "flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-left text-sm hover:bg-[#f0e6d9] " +
                    (s.id === activeId ? "font-semibold" : "")
                  }
                >
                  <span className="truncate">{s.name}</span>
                  {s.id === activeId && <span className="text-[#b85c38]">✓</span>}
                </button>
              </form>
            ))}

            <div className="my-1 border-t border-slate-100" />
            <form action={createSpace} className="flex gap-1 p-1">
              <input
                name="name"
                required
                placeholder="Новое пространство"
                className="w-full rounded-lg border border-slate-200 px-2 py-1 text-sm outline-none focus:border-[#b85c38]"
              />
              <button
                className="shrink-0 rounded-lg bg-[#b85c38] px-2.5 py-1 text-sm font-semibold text-white hover:bg-[#9f4a2e]"
                title="Создать пространство"
              >
                +
              </button>
            </form>
            <p className="px-2 pb-1 pt-0.5 text-[11px] text-slate-400">
              Например: «Личное», «Моя компания».
            </p>
          </div>
        </>
      )}
    </div>
  );
}

"use client";

import type { Locale } from "@/lib/i18n";
import {
  ROLE_GROUPS,
  ROLE_TEMPLATES,
  type RoleTemplate,
} from "@/lib/roleTemplates";

const M = {
  ru: {
    title: "Не знаешь, кого искать?",
    hint: "Выбери близкую роль — подставим задачи, «идеальный профиль» и документы. Останется поправить под себя.",
    hide: "Скрыть",
    show: "Помочь составить",
  },
  en: {
    title: "Not sure who to hire?",
    hint: "Pick a role — we'll fill in the tasks, the ideal profile and documents. You just tweak it.",
    hide: "Hide",
    show: "Help me draft",
  },
  id: {
    title: "Belum yakin mau merekrut siapa?",
    hint: "Pilih peran — kami isikan tugas, profil ideal, dan dokumen. Tinggal sesuaikan.",
    hide: "Sembunyikan",
    show: "Bantu buat draf",
  },
  uz: {
    title: "Kimni izlashni bilmayapsizmi?",
    hint: "Rol tanlang — vazifalar, ideal profil va hujjatlarni to‘ldiramiz. Faqat moslashtirasiz.",
    hide: "Yashirish",
    show: "Tuzishga yordam",
  },
} as const;

export default function RolePicker({
  locale,
  open,
  onToggle,
  onPick,
}: {
  locale: Locale;
  open: boolean;
  onToggle: () => void;
  onPick: (role: RoleTemplate) => void;
}) {
  const t = M[locale];

  return (
    <div className="card border-brand-200 bg-brand-50/40">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold">✨ {t.title}</p>
          {open && <p className="mt-1 text-sm text-slate-500">{t.hint}</p>}
        </div>
        <button
          type="button"
          onClick={onToggle}
          className="shrink-0 text-sm font-medium text-brand-600 hover:underline"
        >
          {open ? t.hide : t.show}
        </button>
      </div>

      {open && (
        <div className="mt-4 space-y-4">
          {ROLE_GROUPS.map((g) => {
            const roles = ROLE_TEMPLATES.filter((r) => r.group === g.key);
            if (!roles.length) return null;
            return (
              <div key={g.key}>
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-400">
                  {g.emoji} {g.title}
                </p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {roles.map((r) => (
                    <button
                      key={r.key}
                      type="button"
                      onClick={() => onPick(r)}
                      className="flex items-start gap-2 rounded-lg border border-slate-200 bg-white p-2.5 text-left transition hover:border-brand-400 hover:bg-brand-50"
                    >
                      <span className="text-lg leading-none">{r.emoji}</span>
                      <span className="min-w-0">
                        <span className="block text-sm font-medium">{r.title}</span>
                        <span className="block text-xs text-slate-500">{r.solves}</span>
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

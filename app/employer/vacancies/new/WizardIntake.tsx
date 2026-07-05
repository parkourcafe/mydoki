"use client";

import { useMemo, useState } from "react";
import type { Locale } from "@/lib/i18n";
import { track } from "@/lib/analytics";
import { ROLE_GROUPS, ROLE_TEMPLATES } from "@/lib/roleTemplates";
import {
  STEPS,
  visibleSteps,
  buildDraft,
  isCustom,
  customText,
  mkCustom,
  type Answers,
  type Step,
} from "@/lib/vacancyWizard";
import type { VacancyInitial } from "./VacancyForm";

const M = {
  ru: { step: "Шаг", of: "из", back: "← Назад", skip: "Пропустить", custom: "Свой вариант", customPh: "Впиши свой вариант", next: "Далее", enough: "Уже хватает — собрать черновик →", summary: "Проверь ответы", refine: "← Уточнить ещё", build: "✨ Собрать вакансию", manual: "Заполнить форму вручную", add: "+ добавить" },
  en: { step: "Step", of: "of", back: "← Back", skip: "Skip", custom: "Custom", customPh: "Type your own", next: "Next", enough: "Enough — build a draft →", summary: "Check your answers", refine: "← Add more", build: "✨ Build the vacancy", manual: "Fill the form manually", add: "+ add" },
  id: { step: "Langkah", of: "dari", back: "← Kembali", skip: "Lewati", custom: "Lainnya", customPh: "Tulis sendiri", next: "Lanjut", enough: "Cukup — buat draf →", summary: "Periksa jawaban", refine: "← Tambah lagi", build: "✨ Buat lowongan", manual: "Isi formulir manual", add: "+ tambah" },
  uz: { step: "Qadam", of: "dan", back: "← Orqaga", skip: "O‘tkazish", custom: "Boshqa", customPh: "O‘zingiznikini yozing", next: "Keyingi", enough: "Yetarli — qoralama →", summary: "Javoblarni tekshiring", refine: "← Yana qo‘shish", build: "✨ Vakansiya tuzish", manual: "Formani qo‘lda to‘ldirish", add: "+ qo‘shish" },
} as const;

export default function WizardIntake({
  locale,
  defaultCompany,
  onComplete,
  onSkip,
}: {
  locale: Locale;
  defaultCompany: string;
  onComplete: (draft: VacancyInitial) => void;
  onSkip: () => void;
}) {
  const t = M[locale];
  const [answers, setAnswers] = useState<Answers>({});
  const [idx, setIdx] = useState(0);
  const [phase, setPhase] = useState<"q" | "summary">("q");
  const [customVal, setCustomVal] = useState("");

  const steps = useMemo(() => visibleSteps(answers), [answers]);
  const step = steps[Math.min(idx, steps.length - 1)];

  function set(id: string, value: string | string[]) {
    setAnswers((p) => ({ ...p, [id]: value }));
  }
  function goNext() {
    setCustomVal("");
    if (idx + 1 >= steps.length) setPhase("summary");
    else setIdx(idx + 1);
  }
  function goBack() {
    setCustomVal("");
    if (idx > 0) setIdx(idx - 1);
  }
  function chooseSingle(id: string, value: string) {
    set(id, value);
    goNext();
  }
  function toggleMulti(id: string, value: string) {
    const cur = (answers[id] as string[] | undefined) ?? [];
    set(id, cur.includes(value) ? cur.filter((v) => v !== value) : [...cur, value]);
  }
  function addCustomMulti(id: string) {
    if (!customVal.trim()) return;
    const cur = (answers[id] as string[] | undefined) ?? [];
    set(id, [...cur, mkCustom(customVal)]);
    setCustomVal("");
  }
  function finish() {
    track("wizard_completed", { answered: Object.keys(answers).length });
    onComplete(buildDraft(answers, defaultCompany));
  }

  // ── Summary ────────────────────────────────────────────────────────
  if (phase === "summary") {
    const rows = steps
      .map((s) => ({ s, disp: answerDisplay(s, answers) }))
      .filter((r) => r.disp);
    return (
      <div className="mx-auto max-w-lg space-y-4">
        <div className="card space-y-3">
          <h2 className="text-lg font-semibold">{t.summary}</h2>
          <dl className="space-y-2">
            {rows.map(({ s, disp }) => (
              <div key={s.id} className="flex gap-2 text-sm">
                <dt className="w-2/5 shrink-0 text-slate-500">{s.title}</dt>
                <dd className="font-medium">{disp}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={() => { setPhase("q"); setIdx(0); }} className="btn-ghost">
            {t.refine}
          </button>
          <button type="button" onClick={finish} className="btn-primary flex-1">
            {t.build}
          </button>
        </div>
      </div>
    );
  }

  // ── Question ───────────────────────────────────────────────────────
  const multiSel = (answers[step.id] as string[] | undefined) ?? [];
  return (
    <div className="mx-auto max-w-lg space-y-4">
      <div className="flex items-center justify-between text-xs text-slate-400">
        <span>{t.step} {idx + 1} {t.of} {steps.length}</span>
        <button type="button" onClick={onSkip} className="hover:underline">{t.manual}</button>
      </div>
      <div className="h-1 w-full overflow-hidden rounded bg-slate-100">
        <div className="h-full bg-brand-500 transition-all" style={{ width: `${((idx + 1) / steps.length) * 100}%` }} />
      </div>

      <div className="card space-y-4">
        <div>
          <h2 className="text-lg font-semibold">{step.title}</h2>
          {step.hint && <p className="mt-1 text-sm text-slate-500">{step.hint}</p>}
        </div>

        {step.kind === "role" && (
          <div className="space-y-4">
            {ROLE_GROUPS.map((g) => {
              const roles = ROLE_TEMPLATES.filter((r) => r.group === g.key);
              if (!roles.length) return null;
              return (
                <div key={g.key}>
                  <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-400">{g.emoji} {g.title}</p>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {roles.map((r) => (
                      <button key={r.key} type="button" onClick={() => chooseSingle("role", r.key)}
                        className="flex items-start gap-2 rounded-lg border border-slate-200 bg-white p-2.5 text-left transition hover:border-brand-400 hover:bg-brand-50">
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
            <CustomRow t={t} value={customVal} onChange={setCustomVal}
              onSubmit={() => { if (customVal.trim()) chooseSingle("role", mkCustom(customVal)); }} />
          </div>
        )}

        {step.kind === "single" && (
          <div className="space-y-2">
            {step.options?.map((o) => (
              <button key={o.value} type="button" onClick={() => chooseSingle(step.id, o.value)}
                className="block w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-left text-sm font-medium transition hover:border-brand-400 hover:bg-brand-50">
                {o.label}
              </button>
            ))}
            {step.allowCustom && (
              <CustomRow t={t} value={customVal} onChange={setCustomVal}
                onSubmit={() => { if (customVal.trim()) chooseSingle(step.id, mkCustom(customVal)); }} />
            )}
          </div>
        )}

        {step.kind === "multi" && (
          <div className="space-y-2">
            {step.options?.map((o) => {
              const on = multiSel.includes(o.value);
              return (
                <button key={o.value} type="button" onClick={() => toggleMulti(step.id, o.value)}
                  className={`flex w-full items-center gap-2 rounded-lg border px-3 py-2.5 text-left text-sm transition ${on ? "border-brand-500 bg-brand-50 font-medium" : "border-slate-200 bg-white hover:border-brand-400"}`}>
                  <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${on ? "border-brand-500 bg-brand-500 text-white" : "border-slate-300"}`}>{on ? "✓" : ""}</span>
                  {o.label}
                </button>
              );
            })}
            {multiSel.filter(isCustom).map((v) => (
              <div key={v} className="flex items-center gap-2 rounded-lg border border-brand-500 bg-brand-50 px-3 py-2 text-sm">
                <span className="flex h-4 w-4 items-center justify-center rounded border border-brand-500 bg-brand-500 text-white">✓</span>
                {customText(v)}
                <button type="button" onClick={() => toggleMulti(step.id, v)} className="ml-auto text-xs text-slate-400 hover:text-red-500">✕</button>
              </div>
            ))}
            {step.allowCustom && (
              <CustomRow t={t} value={customVal} onChange={setCustomVal} onSubmit={() => addCustomMulti(step.id)} add />
            )}
          </div>
        )}

        {step.kind === "text" && (
          <input className="input" value={typeof answers[step.id] === "string" ? (answers[step.id] as string) : ""}
            onChange={(e) => set(step.id, e.target.value)} placeholder={step.placeholder}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); goNext(); } }} />
        )}
      </div>

      <div className="flex items-center justify-between gap-2">
        <button type="button" onClick={goBack} disabled={idx === 0} className="btn-ghost disabled:opacity-40">{t.back}</button>
        <div className="flex gap-2">
          {step.kind !== "role" && (
            <button type="button" onClick={goNext} className="btn-ghost">{t.skip}</button>
          )}
          {(step.kind === "multi" || step.kind === "text") && (
            <button type="button" onClick={goNext} className="btn-primary">{t.next}</button>
          )}
        </div>
      </div>

      {idx >= 4 && (
        <button type="button" onClick={() => setPhase("summary")} className="w-full text-center text-sm font-medium text-brand-600 hover:underline">
          {t.enough}
        </button>
      )}
    </div>
  );
}

function CustomRow({
  t, value, onChange, onSubmit, add,
}: {
  t: (typeof M)[Locale];
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  add?: boolean;
}) {
  return (
    <div className="flex gap-2 pt-1">
      <input className="input flex-1" value={value} onChange={(e) => onChange(e.target.value)}
        placeholder={t.customPh}
        onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); onSubmit(); } }} />
      <button type="button" onClick={onSubmit} className="btn-ghost shrink-0">{add ? t.add : t.custom}</button>
    </div>
  );
}

function answerDisplay(step: Step, answers: Answers): string {
  const v = answers[step.id];
  if (v === undefined || (Array.isArray(v) && v.length === 0)) return "";
  if (step.kind === "role") {
    const val = v as string;
    if (isCustom(val)) return customText(val);
    return ROLE_TEMPLATES.find((r) => r.key === val)?.title ?? val;
  }
  if (Array.isArray(v)) {
    return v
      .map((x) => (isCustom(x) ? customText(x) : step.options?.find((o) => o.value === x)?.label ?? x))
      .join(", ");
  }
  return isCustom(v) ? customText(v) : v;
}

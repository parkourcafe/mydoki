"use client";

import { useActionState } from "react";
import SubmitButton from "@/components/SubmitButton";
import {
  saveEmployerProfile,
  type EmployerProfileState,
} from "@/app/employer/actions";

const initialState: EmployerProfileState = {};

type Copy = {
  setupTitle: string;
  setupText: string;
  company: string;
  companyPh: string;
  whatsapp: string;
  email: string;
  optional: string;
  save: string;
  companyRequired: string;
  saveError: string;
};

export default function EmployerSetupForm({ copy: t }: { copy: Copy }) {
  const [state, formAction] = useActionState(saveEmployerProfile, initialState);
  const error =
    state.error === "company_required"
      ? t.companyRequired
      : state.error === "save_failed"
        ? t.saveError
        : null;

  return (
    <form action={formAction} className="card space-y-4">
      <div>
        <h1 className="text-xl font-semibold">{t.setupTitle}</h1>
        <p className="mt-1 text-sm text-slate-500">{t.setupText}</p>
      </div>
      <div>
        <label className="label" htmlFor="company_name">
          {t.company} *
        </label>
        <input
          id="company_name"
          name="company_name"
          required
          className="input"
          placeholder={t.companyPh}
        />
      </div>
      <div>
        <label className="label" htmlFor="contact_whatsapp">
          {t.whatsapp}{" "}
          <span className="font-normal text-slate-400">({t.optional})</span>
        </label>
        <input
          id="contact_whatsapp"
          name="contact_whatsapp"
          className="input"
          inputMode="tel"
          placeholder="08123456789"
        />
      </div>
      <div>
        <label className="label" htmlFor="contact_email">
          {t.email}{" "}
          <span className="font-normal text-slate-400">({t.optional})</span>
        </label>
        <input
          id="contact_email"
          name="contact_email"
          type="email"
          className="input"
        />
      </div>
      {error && (
        <p
          role="alert"
          className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700"
        >
          {error}
        </p>
      )}
      <SubmitButton className="btn-primary w-full">{t.save}</SubmitButton>
    </form>
  );
}

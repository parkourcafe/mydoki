"use client";

import { useState } from "react";
import type { Locale } from "@/lib/i18n";
import VacancyForm, { type VacancyInitial } from "./VacancyForm";
import WizardIntake from "./WizardIntake";

// Гид-флоу создания вакансии: сначала диалог-визард (Quick), затем — та же
// форма, уже заполненная черновиком. «Заполнить вручную» пропускает визард.
export default function NewVacancyFlow({
  locale,
  defaultCompany,
  aiEnabled,
}: {
  locale: Locale;
  defaultCompany: string;
  aiEnabled: boolean;
}) {
  const [mode, setMode] = useState<"wizard" | "form">("wizard");
  const [draft, setDraft] = useState<VacancyInitial | undefined>();

  if (mode === "wizard") {
    return (
      <WizardIntake
        locale={locale}
        defaultCompany={defaultCompany}
        aiEnabled={aiEnabled}
        onComplete={(d) => {
          setDraft(d);
          setMode("form");
        }}
        onSkip={() => setMode("form")}
      />
    );
  }

  return (
    <VacancyForm
      locale={locale}
      defaultCompany={defaultCompany}
      initial={draft}
      fromWizard={!!draft}
    />
  );
}

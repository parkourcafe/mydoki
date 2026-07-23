export type MedicalSummaryDraft = {
  translated_title: string;
  translated_summary: string;
  key_facts: string[];
  uncertainty_notes: string[];
};

function strings(value: unknown, max = 12): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, max);
}

/** Fail-closed normalization of an AI/manual medical summary. */
export function normalizeMedicalSummary(
  raw: Record<string, unknown>,
  fallbackTitle: string
): MedicalSummaryDraft {
  const title =
    typeof raw.translated_title === "string" && raw.translated_title.trim()
      ? raw.translated_title.trim()
      : fallbackTitle;
  const summary =
    typeof raw.translated_summary === "string"
      ? raw.translated_summary.trim()
      : "";
  return {
    translated_title: title.slice(0, 300),
    translated_summary: summary.slice(0, 5000),
    key_facts: strings(raw.key_facts),
    uncertainty_notes: strings(raw.uncertainty_notes),
  };
}

export function canPublishMedicalSummaries(
  summaries: { status: string; translated_title: string; translated_summary: string }[],
  expectedCount: number
): boolean {
  return (
    expectedCount > 0 &&
    summaries.length === expectedCount &&
    summaries.every(
      (summary) =>
        summary.status === "approved" &&
        summary.translated_title.trim().length > 0 &&
        summary.translated_summary.trim().length > 0
    )
  );
}

import "server-only";

import { activeTextModel, callLLM, extractJson } from "./ai/provider";
import { normalizeMedicalSummary, type MedicalSummaryDraft } from "./medicalSummary";

export type MedicalTranslationInput = {
  title: string;
  issuer: string | null;
  issued_at: string | null;
  expires_at: string | null;
  notes: string | null;
  holder_name: string | null;
};

const SYSTEM = `You translate a user-reviewed medical document summary from Russian into Bahasa Indonesia.
Return JSON only with keys: translated_title (string), translated_summary (string), key_facts (string[]), uncertainty_notes (string[]).
Rules:
- Translate only the supplied facts. Never diagnose, interpret, recommend treatment, or add facts.
- Preserve medicine names, dosages, laboratory values, units, dates, names, and identifiers exactly.
- If a fragment is ambiguous, do not guess; add a short Indonesian note to uncertainty_notes.
- translated_summary must be concise, neutral Bahasa Indonesia suitable for a doctor.
- Do not claim the translation is certified.`;

export async function translateMedicalSummary(
  input: MedicalTranslationInput
): Promise<{ draft: MedicalSummaryDraft; model: string | null }> {
  const source = JSON.stringify({
    title: input.title,
    issuer: input.issuer,
    issued_at: input.issued_at,
    expires_at: input.expires_at,
    notes: input.notes,
    holder_name: input.holder_name,
  });

  try {
    const text = await callLLM(SYSTEM, `Source metadata:\n${source}`, {
      temperature: 0,
      maxTokens: 1200,
    });
    return {
      draft: normalizeMedicalSummary(extractJson(text), input.title),
      model: activeTextModel(),
    };
  } catch {
    // Не публикуем сырой текст автоматически. Пользователь сможет заполнить
    // и подтвердить перевод вручную на review-экране.
    return {
      draft: normalizeMedicalSummary(
        {
          translated_title: input.title,
          translated_summary: "",
          key_facts: [],
          uncertainty_notes: ["Terjemahan otomatis tidak tersedia. Periksa dan isi ringkasan secara manual."],
        },
        input.title
      ),
      model: null,
    };
  }
}

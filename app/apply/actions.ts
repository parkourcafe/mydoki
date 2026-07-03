"use server";

import { getSupabaseServer } from "@/lib/supabase/server";
import { normalizeWhatsapp } from "@/lib/career";

export type SubmitApplicationInput = {
  applicationId: string; // UUID, сгенерирован клиентом (совпадает с путём файлов)
  slug: string;
  fullName: string;
  whatsapp: string;
  email?: string;
  consentText: string;
  answers: { question: string; type: string; answer: string }[];
  documents: {
    type: string;
    label: string;
    path: string;
    name: string;
    size: number;
  }[];
};

/**
 * Публичная подача отклика (без авторизации). Файлы уже загружены браузером
 * в bucket applications под {vacancy_id}/{applicationId}/… . RPC пишет всё
 * атомарно и возвращает access_token для страницы статуса.
 */
export async function submitApplication(
  input: SubmitApplicationInput
): Promise<{ accessToken: string }> {
  const supabase = await getSupabaseServer();

  const { data, error } = await supabase.rpc("submit_application", {
    p_application_id: input.applicationId,
    p_slug: input.slug,
    p_full_name: input.fullName,
    p_whatsapp: normalizeWhatsapp(input.whatsapp),
    p_email: input.email || null,
    p_consent_text: input.consentText,
    p_answers: input.answers ?? [],
    p_documents: input.documents ?? [],
  });
  if (error) throw error;
  const res = data as { application_id: string; access_token: string };
  return { accessToken: res.access_token };
}

"use server";

import { headers } from "next/headers";
import { createHash } from "crypto";
import { getSupabaseServer } from "@/lib/supabase/server";
import { normalizeWhatsapp } from "@/lib/career";

const SRC_ALLOWED = ["wa", "ig", "qr", "direct", "other"] as const;

export type SubmitApplicationInput = {
  applicationId: string; // UUID, сгенерирован клиентом (совпадает с путём файлов)
  slug: string;
  fullName: string;
  whatsapp: string;
  email?: string;
  consentText: string;
  source?: string; // метка воронки из ?src (wa/ig/qr/direct/other)
  answers: { question: string; type: string; answer: string }[];
  documents: {
    type: string;
    label: string;
    path: string;
    name: string;
    size: number;
  }[];
};

// Обезличенный хеш IP для анти-спама (не храним сам IP; §2.1). Соль — из env,
// с запасным значением, чтобы IPv4 нельзя было тривиально перебрать.
async function ipHash(): Promise<string | null> {
  const h = await headers();
  const ip = (h.get("x-forwarded-for") ?? "").split(",")[0].trim();
  if (!ip) return null;
  const salt = process.env.IP_HASH_SALT || "doki-apply-v1";
  return createHash("sha256").update(salt + ip).digest("hex").slice(0, 32);
}

/**
 * Публичная подача отклика (без авторизации). Файлы уже загружены браузером
 * в bucket applications под {vacancy_id}/{applicationId}/… . RPC пишет всё
 * атомарно и возвращает access_token для страницы статуса.
 */
export async function submitApplication(
  input: SubmitApplicationInput
): Promise<{ accessToken: string }> {
  const supabase = await getSupabaseServer();
  const source = SRC_ALLOWED.includes(
    (input.source ?? "") as (typeof SRC_ALLOWED)[number],
  )
    ? input.source
    : "direct";

  const { data, error } = await supabase.rpc("submit_application", {
    p_application_id: input.applicationId,
    p_slug: input.slug,
    p_full_name: input.fullName,
    p_whatsapp: normalizeWhatsapp(input.whatsapp),
    p_email: input.email || null,
    p_consent_text: input.consentText,
    p_answers: input.answers ?? [],
    p_documents: input.documents ?? [],
    p_source: source,
    p_ip_hash: await ipHash(),
  });
  if (error) throw error;
  const res = data as { application_id: string; access_token: string };
  return { accessToken: res.access_token };
}

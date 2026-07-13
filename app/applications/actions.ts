"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseServer } from "@/lib/supabase/server";

/**
 * Ответ кандидата на оффер по секретному токену статус-страницы (публичный
 * флоу — как revoke_application_consent). Принятие требует явного согласия;
 * RPC respond_to_offer фиксирует время/actor/дисклеймер и переводит отклик
 * в hired. Возвращает результат для показа на странице.
 */
export async function respondToOffer(
  token: string,
  accept: boolean,
  consent: boolean
): Promise<{ ok: boolean; status?: string; error?: string }> {
  if (!token) return { ok: false, error: "not_found" };
  const supabase = await getSupabaseServer();
  const { data, error } = await supabase.rpc("respond_to_offer", {
    p_token: token,
    p_accept: accept,
    p_consent: consent,
  });
  if (error) return { ok: false, error: error.message };
  const res = (data ?? {}) as { ok?: boolean; status?: string; error?: string };
  revalidatePath(`/applications/status/${token}`);
  return { ok: res.ok === true, status: res.status, error: res.error };
}

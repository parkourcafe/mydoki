import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Дневной лимит ИИ-запросов на пользователя (защита от перерасхода).
 * Считает строки в ai_usage за последние 24 часа; при превышении — false.
 * Лимит настраивается переменной AI_DAILY_LIMIT (по умолчанию 50).
 */
export async function allowAiCall(
  supabase: SupabaseClient,
  userId: string
): Promise<boolean> {
  const limit = Number(process.env.AI_DAILY_LIMIT || 50);
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  const { count } = await supabase
    .from("ai_usage")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .gte("created_at", since);

  if ((count ?? 0) >= limit) return false;
  await supabase.from("ai_usage").insert({ user_id: userId });
  return true;
}

"use server";

import { headers } from "next/headers";
import { getSupabaseServer } from "@/lib/supabase/server";

/** Сохранить подписку текущего пользователя (RLS: own_subscriptions). */
export async function savePushSubscription(
  sub: { endpoint: string; p256dh: string; auth: string },
  locale: string
): Promise<{ ok: boolean }> {
  const supabase = await getSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false };
  const ua = (await headers()).get("user-agent") ?? null;
  const { error } = await supabase.from("push_subscriptions").upsert(
    {
      user_id: user.id,
      endpoint: sub.endpoint,
      p256dh: sub.p256dh,
      auth: sub.auth,
      locale,
      user_agent: ua,
    },
    { onConflict: "endpoint" }
  );
  return { ok: !error };
}

/** Удалить подписку по endpoint. */
export async function removePushSubscription(endpoint: string): Promise<{ ok: boolean }> {
  const supabase = await getSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false };
  await supabase.from("push_subscriptions").delete().eq("endpoint", endpoint);
  return { ok: true };
}

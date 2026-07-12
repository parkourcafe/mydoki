"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseServer } from "@/lib/supabase/server";
import { getOrCreateHouseholdId } from "@/lib/queries";
import { hashSharePassword } from "@/lib/shareAccess";

/** Создать пакетную ссылку на несколько документов. Возвращает токен. */
export async function createSharePackage(input: {
  documentIds: string[];
  days: number;
  allowDownload: boolean;
  title?: string;
  password?: string;
  maxViews?: number;
}): Promise<{ token: string } | { error: string }> {
  if (!input.documentIds.length) return { error: "empty" };
  const supabase = await getSupabaseServer();
  const householdId = await getOrCreateHouseholdId();

  const days = Math.max(1, Math.min(90, Number(input.days) || 7));
  const expires_at = new Date(Date.now() + days * 86400_000).toISOString();
  const max_views =
    input.maxViews && input.maxViews > 0 ? Math.round(input.maxViews) : null;

  const { data, error } = await supabase
    .from("share_packages")
    .insert({
      household_id: householdId,
      title: input.title?.trim() || null,
      expires_at,
      allow_download: input.allowDownload,
      max_views,
      password_hash: hashSharePassword(input.password),
    })
    .select("id, token")
    .single();
  if (error || !data) return { error: error?.message ?? "failed" };

  const pkg = data as { id: string; token: string };
  const rows = input.documentIds.map((id) => ({ package_id: pkg.id, document_id: id }));
  const { error: e2 } = await supabase.from("share_package_documents").insert(rows);
  if (e2) return { error: e2.message };

  revalidatePath("/my/share");
  return { token: pkg.token };
}

/** Отозвать пакетную ссылку. */
export async function revokeSharePackage(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const supabase = await getSupabaseServer();
  const { error } = await supabase.rpc("revoke_share_package", { p_id: id });
  if (error) throw error;
  revalidatePath("/my/share");
}

"use server";

import { revalidatePath } from "next/cache";
import { getUser } from "@/lib/queries";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { isAllowedAdmin } from "@/lib/admin";
import { LEGAL_CATEGORIES, LEGAL_JURISDICTION } from "@/lib/legal";

// Кураторский путь для legal_topics (P3-3). Гейт — аллоу-лист ADMIN_EMAILS
// (fail-closed). Пишем через service_role (обходит RLS: у legal_topics нет
// пользовательских write-политик — наполнение только кураторами).

async function requireAdmin() {
  const user = await getUser();
  if (!isAllowedAdmin(user?.email, process.env.ADMIN_EMAILS)) {
    throw new Error("forbidden");
  }
  return user!;
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 80);
}

/** Создать/обновить тему (curator). id → обновление, иначе вставка. */
export async function saveLegalTopic(formData: FormData) {
  await requireAdmin();
  const admin = getSupabaseAdmin();
  if (!admin) throw new Error("service role key not set");

  const id = String(formData.get("id") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  if (!title) return;
  const category = String(formData.get("category") ?? "general");
  const safeCategory = (LEGAL_CATEGORIES as string[]).includes(category)
    ? category
    : "general";
  const slug = String(formData.get("slug") ?? "").trim() || slugify(title);

  const row = {
    jurisdiction: String(formData.get("jurisdiction") ?? LEGAL_JURISDICTION).trim() || LEGAL_JURISDICTION,
    category: safeCategory,
    slug,
    title,
    body: String(formData.get("body") ?? "").trim() || null,
    source: String(formData.get("source") ?? "").trim() || null,
    source_version: String(formData.get("source_version") ?? "").trim() || null,
    source_url: String(formData.get("source_url") ?? "").trim() || null,
    reviewed_at: String(formData.get("reviewed_at") ?? "").trim() || null,
    disclaimer: String(formData.get("disclaimer") ?? "").trim() || null,
    specialist_route: String(formData.get("specialist_route") ?? "").trim() || null,
    sort: Number(formData.get("sort") ?? 0) || 0,
    updated_at: new Date().toISOString(),
  };

  const { error } = id
    ? await admin.from("legal_topics").update(row).eq("id", id)
    : await admin.from("legal_topics").insert(row);
  if (error) throw error;
  revalidatePath("/admin/legal");
  revalidatePath("/my/legal");
}

/** Опубликовать/снять с публикации. */
export async function setLegalTopicPublished(id: string, published: boolean) {
  await requireAdmin();
  const admin = getSupabaseAdmin();
  if (!admin) throw new Error("service role key not set");
  const { error } = await admin
    .from("legal_topics")
    .update({ published, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;
  revalidatePath("/admin/legal");
  revalidatePath("/my/legal");
}

/** Удалить тему. */
export async function deleteLegalTopic(id: string) {
  await requireAdmin();
  const admin = getSupabaseAdmin();
  if (!admin) throw new Error("service role key not set");
  const { error } = await admin.from("legal_topics").delete().eq("id", id);
  if (error) throw error;
  revalidatePath("/admin/legal");
  revalidatePath("/my/legal");
}

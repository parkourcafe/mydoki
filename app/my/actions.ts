"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getSupabaseServer } from "@/lib/supabase/server";
import { getDocument, getOrCreateHouseholdId } from "@/lib/queries";

export async function signOut() {
  const supabase = await getSupabaseServer();
  await supabase.auth.signOut();
  redirect("/login");
}

/** Завершить сессии на всех устройствах (отзыв всех refresh-токенов). */
export async function signOutEverywhere() {
  const supabase = await getSupabaseServer();
  await supabase.auth.signOut({ scope: "global" });
  redirect("/login");
}

export async function createMember(formData: FormData) {
  const supabase = await getSupabaseServer();
  const householdId = await getOrCreateHouseholdId();

  const full_name = String(formData.get("full_name") ?? "").trim();
  if (!full_name) return;
  const relation = String(formData.get("relation") ?? "") || null;
  const birth_date = String(formData.get("birth_date") ?? "") || null;

  const { error } = await supabase.from("members").insert({
    household_id: householdId,
    full_name,
    relation,
    birth_date,
  });
  if (error) throw error;
  revalidatePath("/my");
}

export async function createAsset(formData: FormData) {
  const supabase = await getSupabaseServer();
  const householdId = await getOrCreateHouseholdId();
  const title = String(formData.get("title") ?? "").trim();
  if (!title) return;
  const { error } = await supabase.from("assets").insert({
    household_id: householdId,
    type: String(formData.get("type") ?? "other"),
    title,
    details: emptyToNull(formData.get("details")),
  });
  if (error) throw error;
  revalidatePath("/my/assets");
}

export async function deleteAsset(formData: FormData) {
  const supabase = await getSupabaseServer();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const { error } = await supabase.from("assets").delete().eq("id", id);
  if (error) throw error;
  redirect("/my/assets");
}

function emptyToNull(v: FormDataEntryValue | null): string | null {
  const s = String(v ?? "").trim();
  return s.length ? s : null;
}

export async function createDocumentMeta(input: {
  member_id?: string | null;
  asset_id?: string | null;
  title: string;
  category: string;
  subtype?: string;
  issuer?: string;
  doc_number?: string;
  issued_at?: string;
  expires_at?: string;
  notes?: string;
  tags?: string[];
}): Promise<{ id: string; householdId: string }> {
  const supabase = await getSupabaseServer();
  const householdId = await getOrCreateHouseholdId();

  const member_id = input.member_id || null;
  const asset_id = input.asset_id || null;
  const title = (input.title ?? "").trim();
  if ((!member_id && !asset_id) || !title)
    throw new Error("Нужен владелец (человек или объект) и название");

  const clean = (v?: string) => {
    const s = (v ?? "").trim();
    return s.length ? s : null;
  };

  const { data: doc, error } = await supabase
    .from("documents")
    .insert({
      household_id: householdId,
      member_id,
      asset_id,
      title,
      category: input.category || "other",
      subtype: clean(input.subtype),
      issuer: clean(input.issuer),
      doc_number: clean(input.doc_number),
      issued_at: clean(input.issued_at),
      expires_at: clean(input.expires_at),
      notes: clean(input.notes),
      tags: input.tags ?? [],
    })
    .select("id")
    .single();
  if (error) throw error;

  if (member_id) revalidatePath(`/my/members/${member_id}`);
  if (asset_id) revalidatePath(`/my/assets/${asset_id}`);
  return { id: doc.id as string, householdId };
}

// Файл уже загружен браузером в storage — здесь только запись метаданных.
export async function attachDocumentFile(input: {
  documentId: string;
  householdId: string;
  storagePath: string;
  fileName: string;
  mimeType: string | null;
  sizeBytes: number;
}) {
  const supabase = await getSupabaseServer();
  const { error } = await supabase.from("document_files").insert({
    document_id: input.documentId,
    household_id: input.householdId,
    storage_path: input.storagePath,
    file_name: input.fileName,
    mime_type: input.mimeType,
    size_bytes: input.sizeBytes,
  });
  if (error) throw error;
  revalidatePath(`/my/documents/${input.documentId}`);
}

export async function deleteDocument(formData: FormData) {
  const supabase = await getSupabaseServer();
  const id = String(formData.get("id") ?? "");
  const member_id = String(formData.get("member_id") ?? "");
  const asset_id = String(formData.get("asset_id") ?? "");
  if (!id) return;

  // удалить файлы из storage, затем строку (document_files уйдут по cascade)
  const { data: files } = await supabase
    .from("document_files")
    .select("storage_path")
    .eq("document_id", id);
  const paths = (files ?? []).map((f) => f.storage_path as string);
  if (paths.length) await supabase.storage.from("vault-files").remove(paths);

  const { error } = await supabase.from("documents").delete().eq("id", id);
  if (error) throw error;
  redirect(member_id ? `/my/members/${member_id}` : `/my/assets/${asset_id}`);
}

export async function createRecord(formData: FormData) {
  const supabase = await getSupabaseServer();
  const householdId = await getOrCreateHouseholdId();

  const member_id = String(formData.get("member_id") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  if (!member_id || !title) return;

  const note = String(formData.get("note") ?? "").trim();
  const { error } = await supabase.from("records").insert({
    household_id: householdId,
    member_id,
    kind: String(formData.get("kind") ?? "note"),
    title,
    recorded_at: emptyToNull(formData.get("recorded_at")),
    data: note ? { note } : {},
  });
  if (error) throw error;
  revalidatePath(`/my/members/${member_id}`);
}

export async function deleteRecord(formData: FormData) {
  const supabase = await getSupabaseServer();
  const id = String(formData.get("id") ?? "");
  const member_id = String(formData.get("member_id") ?? "");
  if (!id) return;
  const { error } = await supabase.from("records").delete().eq("id", id);
  if (error) throw error;
  revalidatePath(`/my/members/${member_id}`);
}

export async function createShare(formData: FormData) {
  const supabase = await getSupabaseServer();
  const document_id = String(formData.get("document_id") ?? "");
  const doc = await getDocument(document_id);
  if (!doc) throw new Error("Документ не найден");

  const days = Math.max(1, Math.min(90, Number(formData.get("days") ?? 7)));
  const expires_at = new Date(Date.now() + days * 86400_000).toISOString();
  const maxViewsRaw = Number(formData.get("max_views") ?? 0);
  const max_views = maxViewsRaw > 0 ? maxViewsRaw : null;

  const { error } = await supabase.from("shares").insert({
    household_id: doc.household_id,
    document_id,
    expires_at,
    max_views,
    watermark: formData.get("watermark") != null,
    allow_download: formData.get("allow_download") != null,
  });
  if (error) throw error;
  revalidatePath(`/my/documents/${document_id}`);
}

export async function revokeShare(formData: FormData) {
  const supabase = await getSupabaseServer();
  const id = String(formData.get("id") ?? "");
  const document_id = String(formData.get("document_id") ?? "");
  const { error } = await supabase.rpc("revoke_share", { p_share_id: id });
  if (error) throw error;
  revalidatePath(`/my/documents/${document_id}`);
}

export async function createInvitation(formData: FormData) {
  const supabase = await getSupabaseServer();
  const householdId = await getOrCreateHouseholdId();
  const role = String(formData.get("role") ?? "viewer");
  const { error } = await supabase
    .from("invitations")
    .insert({ household_id: householdId, role });
  if (error) throw error;
  revalidatePath("/my/family");
}

export async function deleteInvitation(formData: FormData) {
  const supabase = await getSupabaseServer();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const { error } = await supabase.from("invitations").delete().eq("id", id);
  if (error) throw error;
  revalidatePath("/my/family");
}

export async function acceptInvitation(formData: FormData) {
  const supabase = await getSupabaseServer();
  const token = String(formData.get("token") ?? "");
  const { error } = await supabase.rpc("accept_invitation", { p_token: token });
  if (error) throw error;
  redirect("/my");
}

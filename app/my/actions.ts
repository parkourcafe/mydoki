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

function emptyToNull(v: FormDataEntryValue | null): string | null {
  const s = String(v ?? "").trim();
  return s.length ? s : null;
}

export async function createDocument(formData: FormData) {
  const supabase = await getSupabaseServer();
  const householdId = await getOrCreateHouseholdId();

  const member_id = String(formData.get("member_id") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  if (!member_id || !title) throw new Error("member_id и title обязательны");

  const tags = String(formData.get("tags") ?? "")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

  const { data: doc, error } = await supabase
    .from("documents")
    .insert({
      household_id: householdId,
      member_id,
      title,
      category: String(formData.get("category") ?? "other"),
      subtype: emptyToNull(formData.get("subtype")),
      issuer: emptyToNull(formData.get("issuer")),
      doc_number: emptyToNull(formData.get("doc_number")),
      issued_at: emptyToNull(formData.get("issued_at")),
      expires_at: emptyToNull(formData.get("expires_at")),
      notes: emptyToNull(formData.get("notes")),
      tags,
    })
    .select("id")
    .single();
  if (error) throw error;

  const docId = doc.id as string;
  const files = formData.getAll("files").filter((f): f is File => f instanceof File && f.size > 0);

  for (const file of files) {
    const safeName = file.name.replace(/[^\w.\-]+/g, "_");
    const path = `${householdId}/${docId}/${Date.now()}-${safeName}`;
    const bytes = await file.arrayBuffer();
    const { error: upErr } = await supabase.storage
      .from("vault-files")
      .upload(path, bytes, {
        contentType: file.type || "application/octet-stream",
        upsert: false,
      });
    if (upErr) throw upErr;

    const { error: fErr } = await supabase.from("document_files").insert({
      document_id: docId,
      household_id: householdId,
      storage_path: path,
      file_name: file.name,
      mime_type: file.type || null,
      size_bytes: file.size,
    });
    if (fErr) throw fErr;
  }

  revalidatePath(`/my/members/${member_id}`);
  redirect(`/my/documents/${docId}`);
}

export async function deleteDocument(formData: FormData) {
  const supabase = await getSupabaseServer();
  const id = String(formData.get("id") ?? "");
  const memberId = String(formData.get("member_id") ?? "");
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
  redirect(`/my/members/${memberId}`);
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

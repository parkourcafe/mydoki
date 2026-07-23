"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseServer } from "@/lib/supabase/server";
import { getOrCreateHouseholdId } from "@/lib/queries";
import { hashSharePassword } from "@/lib/shareAccess";
import { translateMedicalSummary } from "@/lib/medicalTranslation";
import { canPublishMedicalSummaries } from "@/lib/medicalSummary";
import { isRuStoreRequest } from "@/lib/isRuStoreRequest";

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

/** Создать НЕОПУБЛИКОВАННЫЙ медицинский пакет с черновиками перевода. */
export async function createMedicalSharePackage(input: {
  documentIds: string[];
  days: number;
  allowDownload: boolean;
  title?: string;
  password?: string;
  maxViews?: number;
  translationConsent: boolean;
}): Promise<{ reviewId: string } | { error: string }> {
  if (await isRuStoreRequest()) return { error: "not_available" };
  const ids = [...new Set(input.documentIds.filter(Boolean))];
  if (!ids.length) return { error: "empty" };
  if (ids.length > 20) return { error: "too_many_documents" };
  if (!input.translationConsent) return { error: "consent_required" };

  const supabase = await getSupabaseServer();
  const householdId = await getOrCreateHouseholdId();
  const { data: docs, error: docsError } = await supabase
    .from("documents")
    .select("id, title, issuer, issued_at, expires_at, notes, holder_name")
    .eq("household_id", householdId)
    .in("id", ids);
  if (docsError) return { error: docsError.message };
  if (!docs || docs.length !== ids.length) return { error: "document_scope" };

  const days = Math.max(1, Math.min(90, Number(input.days) || 7));
  const expires_at = new Date(Date.now() + days * 86400_000).toISOString();
  const max_views =
    input.maxViews && input.maxViews > 0 ? Math.round(input.maxViews) : null;

  const { data: pkg, error } = await supabase
    .from("share_packages")
    .insert({
      household_id: householdId,
      title: input.title?.trim() || "Paket medis",
      expires_at,
      allow_download: input.allowDownload,
      max_views,
      password_hash: hashSharePassword(input.password),
      package_type: "medical_doctor",
      target_locale: "id",
      published_at: null,
    })
    .select("id")
    .single();
  if (error || !pkg) return { error: error?.message ?? "failed" };

  const packageId = pkg.id as string;
  const { error: linkError } = await supabase
    .from("share_package_documents")
    .insert(ids.map((documentId) => ({ package_id: packageId, document_id: documentId })));
  if (linkError) {
    await supabase.from("share_packages").delete().eq("id", packageId);
    return { error: linkError.message };
  }

  const translations = await Promise.all(
    docs.map(async (doc) => {
      const source = {
        title: doc.title as string,
        issuer: doc.issuer as string | null,
        issued_at: doc.issued_at as string | null,
        expires_at: doc.expires_at as string | null,
        notes: doc.notes as string | null,
        holder_name: doc.holder_name as string | null,
      };
      const { draft, model } = await translateMedicalSummary(source);
      return {
        package_id: packageId,
        document_id: doc.id,
        source_language: "ru",
        target_locale: "id",
        source_snapshot: source,
        translated_title: draft.translated_title,
        translated_summary: draft.translated_summary,
        key_facts: draft.key_facts,
        uncertainty_notes: draft.uncertainty_notes,
        model,
        status: "draft",
      };
    })
  );
  const { error: summariesError } = await supabase
    .from("share_package_summaries")
    .insert(translations);
  if (summariesError) {
    await supabase.from("share_packages").delete().eq("id", packageId);
    return { error: summariesError.message };
  }

  // Фиксируем факт явного согласия без содержимого медицинских документов.
  await supabase.rpc("log_audit", {
    p_household: householdId,
    p_action: "medical_share.translation_consent",
    p_entity_type: "share_package",
    p_entity_id: packageId,
    p_metadata: { target_locale: "id", document_count: ids.length },
  });

  revalidatePath("/my/share");
  return { reviewId: packageId };
}

/** Сохранить и явно подтвердить одно переводное резюме. */
export async function approveMedicalSummary(formData: FormData) {
  const packageId = String(formData.get("package_id") ?? "");
  const documentId = String(formData.get("document_id") ?? "");
  const translatedTitle = String(formData.get("translated_title") ?? "").trim();
  const translatedSummary = String(formData.get("translated_summary") ?? "").trim();
  const confirmed = formData.get("confirmed") === "on";
  if (!packageId || !documentId || !translatedTitle || !translatedSummary || !confirmed) return;

  const supabase = await getSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("UNAUTHORIZED");
  const keyFacts = String(formData.get("key_facts") ?? "")
    .split("\n").map((item) => item.trim()).filter(Boolean).slice(0, 12);
  const uncertaintyNotes = String(formData.get("uncertainty_notes") ?? "")
    .split("\n").map((item) => item.trim()).filter(Boolean).slice(0, 12);

  const { data: updated, error } = await supabase
    .from("share_package_summaries")
    .update({
      translated_title: translatedTitle.slice(0, 300),
      translated_summary: translatedSummary.slice(0, 5000),
      key_facts: keyFacts,
      uncertainty_notes: uncertaintyNotes,
      status: "approved",
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("package_id", packageId)
    .eq("document_id", documentId)
    .select("package_id")
    .maybeSingle();
  if (error) throw error;
  if (!updated) throw new Error("NOT_FOUND");
  revalidatePath(`/my/share/${packageId}`);
}

/** Публикует ссылку только когда владелец подтвердил каждое резюме. */
export async function publishMedicalPackage(formData: FormData) {
  const packageId = String(formData.get("package_id") ?? "");
  if (!packageId) return;
  const supabase = await getSupabaseServer();
  const [{ count }, { data: summaries }, { data: pkg }] = await Promise.all([
    supabase
      .from("share_package_documents")
      .select("document_id", { count: "exact", head: true })
      .eq("package_id", packageId),
    supabase
      .from("share_package_summaries")
      .select("status, translated_title, translated_summary")
      .eq("package_id", packageId),
    supabase
      .from("share_packages")
      .select("id, expires_at, revoked_at")
      .eq("id", packageId)
      .eq("package_type", "medical_doctor")
      .maybeSingle(),
  ]);
  if (!pkg || pkg.revoked_at || new Date(pkg.expires_at).getTime() <= Date.now()) {
    throw new Error("PACKAGE_INACTIVE");
  }
  if (!canPublishMedicalSummaries(summaries ?? [], count ?? 0)) {
    throw new Error("REVIEW_REQUIRED");
  }
  const { data: updated, error } = await supabase
    .from("share_packages")
    .update({ published_at: new Date().toISOString() })
    .eq("id", packageId)
    .eq("package_type", "medical_doctor")
    .select("id")
    .maybeSingle();
  if (error) throw error;
  if (!updated) throw new Error("NOT_FOUND");
  revalidatePath(`/my/share/${packageId}`);
  revalidatePath("/my/share");
}

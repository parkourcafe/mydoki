"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { getSupabaseServer } from "@/lib/supabase/server";
import { getLocale } from "@/lib/i18n";
import {
  getDocument,
  getOrCreateHouseholdId,
  getStorageInfo,
  getUser,
} from "@/lib/queries";
import {
  evalDateConsistency,
  evalExpiry,
  evalNameMatch,
} from "@/lib/documentChecks";
import { parseOffsets } from "@/lib/reminders";
import { hashSharePassword } from "@/lib/shareAccess";
import { normalizeEmploymentType } from "@/lib/employment";

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

/**
 * Удалить свой аккаунт и все данные. RPC delete_my_account() (SECURITY
 * DEFINER) удаляет пространства-владельца со всем содержимым, файлы из
 * хранилища, членство в чужих пространствах и сам аккаунт. Операция
 * необратима.
 */
export async function deleteAccount() {
  const supabase = await getSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase.rpc("delete_my_account");
  if (error) throw error;

  // Сессия уже недействительна (пользователя нет) — чистим cookie и уходим.
  await supabase.auth.signOut().catch(() => {});
  redirect("/?deleted=1");
}

const SPACE_COOKIE = "active_household";
const SPACE_MAX_AGE = 60 * 60 * 24 * 365;

/** Переключить активное пространство (если пользователь в нём состоит). */
export async function switchSpace(formData: FormData) {
  const id = String(formData.get("household_id") ?? "");
  const supabase = await getSupabaseServer();
  // RLS вернёт строку только если пользователь — член этого household
  const { data } = await supabase
    .from("households")
    .select("id")
    .eq("id", id)
    .maybeSingle();
  if (data) {
    const cookieStore = await cookies();
    cookieStore.set(SPACE_COOKIE, id, {
      path: "/",
      maxAge: SPACE_MAX_AGE,
      sameSite: "lax",
    });
  }
  redirect("/my");
}

/** Создать новое пространство и сделать его активным. */
export async function createSpace(formData: FormData) {
  const locale = await getLocale();
  const fallbackName = {
    ru: "Новое пространство",
    en: "New space",
    id: "Ruang baru",
    uz: "Yangi makon",
  }[locale];
  const name = String(formData.get("name") ?? "").trim() || fallbackName;
  const supabase = await getSupabaseServer();
  const { data: hid, error } = await supabase.rpc("create_household", {
    p_name: name,
  });
  if (error) throw error;
  const cookieStore = await cookies();
  cookieStore.set(SPACE_COOKIE, hid as string, {
    path: "/",
    maxAge: SPACE_MAX_AGE,
    sameSite: "lax",
  });
  redirect("/my");
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

/** Создать свой раздел документов (помимо встроенных категорий). */
export async function createDocSection(formData: FormData) {
  const supabase = await getSupabaseServer();
  const householdId = await getOrCreateHouseholdId();
  const label = String(formData.get("label") ?? "").trim();
  if (!label) return;
  const emoji = String(formData.get("emoji") ?? "").trim() || null;
  const { error } = await supabase.from("custom_doc_categories").insert({
    household_id: householdId,
    label,
    emoji,
  });
  if (error) throw error;
  revalidatePath("/my/documents");
}

/** Удалить пользовательский раздел. Документы не пропадают: их
 *  custom_category_id обнуляется (on delete set null), они вернутся
 *  во встроенную категорию. */
export async function deleteDocSection(formData: FormData) {
  const supabase = await getSupabaseServer();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const { error } = await supabase
    .from("custom_doc_categories")
    .delete()
    .eq("id", id);
  if (error) throw error;
  redirect("/my/documents");
}

export async function createDocumentMeta(input: {
  member_id?: string | null;
  asset_id?: string | null;
  title: string;
  category: string;
  custom_category_id?: string | null;
  subtype?: string;
  issuer?: string;
  doc_number?: string;
  issued_at?: string;
  expires_at?: string;
  holder_name?: string;
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
      custom_category_id: input.custom_category_id || null,
      subtype: clean(input.subtype),
      issuer: clean(input.issuer),
      doc_number: clean(input.doc_number),
      issued_at: clean(input.issued_at),
      expires_at: clean(input.expires_at),
      holder_name: clean(input.holder_name),
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
// Пишем И в document_files (совместимость), И в document_versions (новая
// неизменяемая история), затем обновляем current_version_id документа.
// fileHash — sha256 hex, посчитанный браузером (базовая точка для будущей
// проверки целостности); пустая строка допустима (досчитается при проверке).
export async function attachDocumentFile(input: {
  documentId: string;
  householdId: string;
  storagePath: string;
  fileName: string;
  mimeType: string | null;
  sizeBytes: number;
  fileHash?: string;
}) {
  const supabase = await getSupabaseServer();

  // Лимит хранилища пространства: не даём превысить.
  const { used, limit } = await getStorageInfo(input.householdId);
  if (used + input.sizeBytes > limit) {
    // файл уже залит браузером — убираем «сироту», чтобы не копить мусор
    await supabase.storage.from("vault-files").remove([input.storagePath]);
    throw new Error("QUOTA_EXCEEDED");
  }

  const { error } = await supabase.from("document_files").insert({
    document_id: input.documentId,
    household_id: input.householdId,
    storage_path: input.storagePath,
    file_name: input.fileName,
    mime_type: input.mimeType,
    size_bytes: input.sizeBytes,
  });
  if (error) throw error;

  const { data: version, error: vErr } = await supabase
    .from("document_versions")
    .insert({
      document_id: input.documentId,
      household_id: input.householdId,
      storage_path: input.storagePath,
      file_hash: (input.fileHash ?? "").trim(),
      mime: input.mimeType ?? "application/octet-stream",
      size_bytes: input.sizeBytes,
      note: input.fileName,
    })
    .select("id")
    .single();
  if (vErr) throw vErr;

  const { error: curErr } = await supabase
    .from("documents")
    .update({ current_version_id: version.id })
    .eq("id", input.documentId);
  if (curErr) throw curErr;

  revalidatePath(`/my/documents/${input.documentId}`);
}

/** Обёртка для кнопки «Проверить сейчас» (форма → runDocumentChecks). */
export async function runChecks(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await runDocumentChecks(id);
}

/** Архивировать документ (скрывается из списков; файлы и история остаются). */
export async function archiveDocument(formData: FormData) {
  const supabase = await getSupabaseServer();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const { error } = await supabase
    .from("documents")
    .update({ status: "archived" })
    .eq("id", id);
  if (error) throw error;
  revalidatePath(`/my/documents/${id}`);
}

/** Вернуть документ из архива. */
export async function unarchiveDocument(formData: FormData) {
  const supabase = await getSupabaseServer();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const { error } = await supabase
    .from("documents")
    .update({ status: "active" })
    .eq("id", id);
  if (error) throw error;
  revalidatePath(`/my/documents/${id}`);
}

/**
 * Запустить автопроверки по текущей версии документа. Идемпотентно: каждый
 * запуск создаёт новые строки document_checks (история сохраняется).
 * Результаты — только pass/mismatch/unreadable; вердиктов о подлинности нет.
 */
export async function runDocumentChecks(documentId: string): Promise<void> {
  const { createHash } = await import("node:crypto");
  const supabase = await getSupabaseServer();

  const { data: doc } = await supabase
    .from("documents")
    .select(
      "id, household_id, member_id, issued_at, expires_at, holder_name, current_version_id"
    )
    .eq("id", documentId)
    .maybeSingle();
  if (!doc?.current_version_id) return;

  const { data: version } = await supabase
    .from("document_versions")
    .select("id, storage_path, file_hash")
    .eq("id", doc.current_version_id)
    .maybeSingle();
  if (!version) return;

  const today = new Date().toISOString().slice(0, 10);
  const outcomes: {
    check_type: string;
    result: string;
    details: Record<string, unknown>;
  }[] = [];

  const expiry = evalExpiry(doc.expires_at as string | null, today);
  if (expiry) outcomes.push(expiry);

  const dateConsistency = evalDateConsistency(
    doc.issued_at as string | null,
    doc.expires_at as string | null,
    today
  );
  if (dateConsistency) outcomes.push(dateConsistency);

  if (doc.member_id) {
    const { data: member } = await supabase
      .from("members")
      .select("full_name")
      .eq("id", doc.member_id)
      .maybeSingle();
    const nameMatch = evalNameMatch(
      doc.holder_name as string | null,
      (member?.full_name as string | null) ?? null
    );
    if (nameMatch) outcomes.push(nameMatch);
  }

  // Целостность файла: сервер скачивает текущую версию и считает sha256.
  const integrity = await (async () => {
    try {
      const { data: blob, error } = await supabase.storage
        .from("vault-files")
        .download(version.storage_path);
      if (error || !blob) {
        return { check_type: "file_integrity", result: "unreadable", details: {} };
      }
      const buf = Buffer.from(await blob.arrayBuffer());
      const hash = createHash("sha256").update(buf).digest("hex");
      const stored = (version.file_hash as string) ?? "";
      if (!stored) {
        // legacy-версия без эталона — фиксируем текущий хэш (write-once).
        await supabase.rpc("set_document_version_hash", {
          p_version_id: version.id,
          p_hash: hash,
        });
        return {
          check_type: "file_integrity",
          result: "pass",
          details: { legacy_hash_set: true },
        };
      }
      return {
        check_type: "file_integrity",
        result: hash === stored ? "pass" : "mismatch",
        details: {},
      };
    } catch {
      return { check_type: "file_integrity", result: "unreadable", details: {} };
    }
  })();
  outcomes.push(integrity);

  if (outcomes.length) {
    await supabase.from("document_checks").insert(
      outcomes.map((o) => ({
        document_version_id: version.id,
        household_id: doc.household_id,
        check_type: o.check_type,
        result: o.result,
        details: o.details,
      }))
    );
  }
  revalidatePath(`/my/documents/${documentId}`);
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
    password_hash: hashSharePassword(String(formData.get("password") ?? "")),
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

/** Создать ручное напоминание (заголовок, дата, offsets, опц. документ). */
export async function createReminder(formData: FormData) {
  const supabase = await getSupabaseServer();
  const householdId = await getOrCreateHouseholdId();
  const title = String(formData.get("title") ?? "").trim();
  const due_at = String(formData.get("due_at") ?? "").trim();
  if (!title || !due_at) return;
  const document_id = String(formData.get("document_id") ?? "") || null;
  const offsets = parseOffsets(String(formData.get("offsets") ?? ""));
  const { error } = await supabase.from("reminders").insert({
    household_id: householdId,
    document_id,
    due_at,
    title,
    offsets,
  });
  if (error) throw error;
  revalidatePath("/my/reminders");
}

/** Переключить «выполнено» у ручного напоминания. */
export async function toggleReminder(formData: FormData) {
  const supabase = await getSupabaseServer();
  const id = String(formData.get("id") ?? "");
  const done = String(formData.get("done") ?? "") === "true";
  if (!id) return;
  const { error } = await supabase
    .from("reminders")
    .update({ done: !done })
    .eq("id", id);
  if (error) throw error;
  revalidatePath("/my/reminders");
}

/** Удалить ручное напоминание. */
export async function deleteReminderItem(formData: FormData) {
  const supabase = await getSupabaseServer();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const { error } = await supabase.from("reminders").delete().eq("id", id);
  if (error) throw error;
  revalidatePath("/my/reminders");
}

/** Кандидат отзывает свой отклик (state → withdrawn). */
export async function withdrawApplication(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const supabase = await getSupabaseServer();
  const { error } = await supabase.rpc("withdraw_application", {
    p_application_id: id,
  });
  if (error) throw error;
  revalidatePath("/my/applications");
}

/** Кандидат отзывает согласие на обработку (по секретному токену). */
export async function revokeApplicationConsent(formData: FormData) {
  const token = String(formData.get("token") ?? "");
  if (!token) return;
  const supabase = await getSupabaseServer();
  const { error } = await supabase.rpc("revoke_application_consent", {
    p_token: token,
  });
  if (error) throw error;
  revalidatePath("/my/applications");
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

// ── Семейные роли и доступ (F-1) ─────────────────────────────────────
// Изменения идут через SECURITY DEFINER RPC с гардом инварианта «хотя бы
// один owner» (см. миграцию 20260713170000). UI-проверки — только подсказка;
// авторитетный гейт — в БД.

export async function setMemberRole(formData: FormData) {
  const supabase = await getSupabaseServer();
  const householdId = await getOrCreateHouseholdId();
  const userId = String(formData.get("user_id") ?? "");
  const role = String(formData.get("role") ?? "");
  if (!userId || !role) return;
  const { error } = await supabase.rpc("set_household_member_role", {
    p_household: householdId,
    p_user: userId,
    p_role: role,
  });
  if (error) throw error;
  revalidatePath("/my/family");
}

export async function removeMember(formData: FormData) {
  const supabase = await getSupabaseServer();
  const householdId = await getOrCreateHouseholdId();
  const userId = String(formData.get("user_id") ?? "");
  if (!userId) return;
  const { error } = await supabase.rpc("remove_household_member", {
    p_household: householdId,
    p_user: userId,
  });
  if (error) throw error;
  revalidatePath("/my/family");
}

export async function leaveHousehold() {
  const supabase = await getSupabaseServer();
  const householdId = await getOrCreateHouseholdId();
  const user = await getUser();
  if (!user) return;
  // Выход = удаление себя. Гард последнего owner — в RPC.
  const { error } = await supabase.rpc("remove_household_member", {
    p_household: householdId,
    p_user: user.id,
  });
  if (error) throw error;
  // Сбрасываем активное пространство — getOrCreateHouseholdId переизберёт другое.
  const cookieStore = await cookies();
  cookieStore.delete(SPACE_COOKIE);
  redirect("/my");
}

// ── Трудовые отношения (Employment, проекция человека) ───────────────
// Ручной режим: человек ведёт свою трудовую историю сам (работодателя может
// не быть в Doki). RLS разрешает такие записи только владельцу и только с
// manual=true / company_id=null (см. миграцию employments).

/** Добавить своё место работы (ручной режим). */
export async function addManualEmployment(formData: FormData) {
  const supabase = await getSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const company_name = String(formData.get("company_name") ?? "").trim();
  const position = String(formData.get("position") ?? "").trim();
  if (!company_name || !position) return;

  const employment_type = normalizeEmploymentType(formData.get("employment_type"));
  const start_date = String(formData.get("start_date") ?? "").trim() || null;
  const end_date = String(formData.get("end_date") ?? "").trim() || null;
  const status = end_date ? "ended" : "active";

  const { error } = await supabase.from("employments").insert({
    company_name,
    position,
    employment_type,
    start_date,
    end_date,
    status,
    manual: true,
    employee_user_id: user.id,
    created_by: user.id,
  });
  if (error) throw error;
  revalidatePath("/my/employment");
}

/** Изменить своё ручное место работы. */
export async function updateManualEmployment(formData: FormData) {
  const supabase = await getSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const id = String(formData.get("id") ?? "");
  const company_name = String(formData.get("company_name") ?? "").trim();
  const position = String(formData.get("position") ?? "").trim();
  if (!id || !company_name || !position) return;

  const employment_type = normalizeEmploymentType(formData.get("employment_type"));
  const start_date = String(formData.get("start_date") ?? "").trim() || null;
  const end_date = String(formData.get("end_date") ?? "").trim() || null;
  const status = end_date ? "ended" : "active";

  // RLS гейтит: обновится только своя ручная запись (manual=true, company_id=null).
  const { error } = await supabase
    .from("employments")
    .update({
      company_name,
      position,
      employment_type,
      start_date,
      end_date,
      status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("manual", true);
  if (error) throw error;
  revalidatePath("/my/employment");
  revalidatePath(`/my/employment/${id}`);
}

/**
 * Ответ сотрудника на допсоглашение (P3-1). Принятие требует согласия; RPC
 * respond_to_amendment проверяет, что вызывающий — сотрудник этой записи,
 * фиксирует дисклеймер/время/actor и применяет изменения к employment.
 */
export async function respondToAmendment(
  amendmentId: string,
  employmentId: string,
  accept: boolean,
  consent: boolean
): Promise<{ ok: boolean; status?: string; error?: string }> {
  const supabase = await getSupabaseServer();
  const { data, error } = await supabase.rpc("respond_to_amendment", {
    p_id: amendmentId,
    p_accept: accept,
    p_consent: consent,
  });
  if (error) return { ok: false, error: error.message };
  const res = (data ?? {}) as { ok?: boolean; status?: string; error?: string };
  revalidatePath(`/my/employment/${employmentId}`);
  return { ok: res.ok === true, status: res.status, error: res.error };
}

/**
 * Сотрудник подтверждает получение документа (расчёт/рекомендация и др., P4-2).
 * RPC acknowledge_employment_document проверяет, что вызывающий — сотрудник
 * этой записи, и идемпотентно фиксирует время/actor получения.
 */
export async function acknowledgeEmploymentDocument(
  docId: string,
  employmentId: string
): Promise<{ ok: boolean; error?: string }> {
  const supabase = await getSupabaseServer();
  const { error } = await supabase.rpc("acknowledge_employment_document", {
    p_id: docId,
  });
  if (error) return { ok: false, error: error.message };
  revalidatePath(`/my/employment/${employmentId}`);
  return { ok: true };
}

/**
 * Внешнее подтверждение занятости (P4-4). Человек создаёт секретную ссылку
 * для своей записи ОТ РАБОТОДАТЕЛЯ (RPC проверяет employee=auth.uid() и
 * manual=false). Возвращает токен (один активный на запись).
 */
export async function createEmploymentVerification(
  employmentId: string
): Promise<{ token: string } | { error: string }> {
  const supabase = await getSupabaseServer();
  const { data, error } = await supabase.rpc("create_employment_verification", {
    p_employment_id: employmentId,
  });
  if (error) return { error: error.message };
  revalidatePath(`/my/employment/${employmentId}`);
  return { token: data as string };
}

/** Отозвать ссылку-подтверждение занятости. */
export async function revokeEmploymentVerification(
  employmentId: string
): Promise<{ ok: boolean }> {
  const supabase = await getSupabaseServer();
  const { error } = await supabase.rpc("revoke_employment_verification", {
    p_employment_id: employmentId,
  });
  if (error) return { ok: false };
  revalidatePath(`/my/employment/${employmentId}`);
  return { ok: true };
}

/** Удалить своё ручное место работы. */
export async function deleteManualEmployment(formData: FormData) {
  const supabase = await getSupabaseServer();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  // RLS не даст удалить запись «от работодателя» (manual=false, company_id≠null).
  const { error } = await supabase
    .from("employments")
    .delete()
    .eq("id", id)
    .eq("manual", true);
  if (error) throw error;
  revalidatePath("/my/employment");
  redirect("/my/employment");
}

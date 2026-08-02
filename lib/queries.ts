import "server-only";
import { cookies } from "next/headers";
import { getSupabaseServer } from "./supabase/server";
import { getLocale } from "./i18n";
import type {
  Asset,
  CustomCategory,
  DocumentCheck,
  DocumentFile,
  DocumentRow,
  DocumentVersion,
  LoginEvent,
  Member,
  RecordRow,
  Reminder,
  Share,
} from "./types";

export async function getUser() {
  const supabase = await getSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

/**
 * Подтверждён ли email текущего пользователя. При «мягком» входе (Confirm email
 * выключен в Supabase) сессия есть и у неподтверждённых — этот флаг решает,
 * показывать ли баннер и пускать ли к загрузке/шерингу. OAuth-пользователи
 * (Google) всегда подтверждены. Аноним → false.
 */
export async function isEmailVerified(): Promise<boolean> {
  const user = await getUser();
  return Boolean(user?.email_confirmed_at);
}

/**
 * Гейт для чувствительных действий (загрузка, шеринг документов). Бросает
 * EMAIL_NOT_VERIFIED, если email не подтверждён — вызывающий экшен показывает
 * понятное сообщение и предлагает переслать письмо.
 */
export async function assertEmailVerified(): Promise<void> {
  if (!(await isEmailVerified())) throw new Error("EMAIL_NOT_VERIFIED");
}

/**
 * Возвращает household текущего пользователя; если его нет — создаёт через
 * RPC create_household (атомарно делает пользователя owner).
 */
/**
 * Возвращает активное пространство (household) пользователя.
 * Если в cookie выбрано конкретное и пользователь в нём состоит — оно;
 * иначе первое по дате; если пространств нет — создаёт «Моя семья».
 */
export async function getOrCreateHouseholdId(): Promise<string> {
  const supabase = await getSupabaseServer();
  const cookieStore = await cookies();
  const active = cookieStore.get("active_household")?.value;

  const { data: spaces, error } = await supabase
    .from("households")
    .select("id")
    .order("created_at", { ascending: true });
  if (error) throw error;

  const ids = (spaces ?? []).map((s) => s.id as string);
  if (ids.length > 0) {
    if (active && ids.includes(active)) return active;
    return ids[0];
  }

  const locale = await getLocale();
  const defaultName = {
    ru: "Моя семья",
    en: "My family",
    id: "Keluarga saya",
    uz: "Mening oilam",
  }[locale];
  const { data: hid, error: rpcError } = await supabase.rpc("create_household", {
    p_name: defaultName,
  });
  if (rpcError) throw rpcError;
  return hid as string;
}

/** Все пространства (households), где пользователь состоит. */
export async function listSpaces(): Promise<{ id: string; name: string }[]> {
  const supabase = await getSupabaseServer();
  const { data, error } = await supabase
    .from("households")
    .select("id, name")
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []) as { id: string; name: string }[];
}

/** Лимит хранилища по умолчанию, если в households не задан (2 ГБ). */
export const DEFAULT_STORAGE_LIMIT = 2_147_483_648;

/**
 * Сколько места занято файлами пространства и каков лимит (в байтах).
 * Сумма считается по document_files; RLS отдаёт только доступные строки.
 */
export async function getStorageInfo(
  householdId: string
): Promise<{ used: number; limit: number }> {
  const supabase = await getSupabaseServer();
  const [filesRes, hhRes] = await Promise.all([
    supabase
      .from("document_files")
      .select("size_bytes")
      .eq("household_id", householdId),
    supabase
      .from("households")
      .select("storage_limit_bytes")
      .eq("id", householdId)
      .maybeSingle(),
  ]);
  if (filesRes.error) throw filesRes.error;
  const used = (filesRes.data ?? []).reduce(
    (sum, r) => sum + (Number(r.size_bytes) || 0),
    0
  );
  const limit = Number(hhRes.data?.storage_limit_bytes) || DEFAULT_STORAGE_LIMIT;
  return { used, limit };
}

export async function getMyRole(householdId: string): Promise<string | null> {
  const supabase = await getSupabaseServer();
  const user = await getUser();
  if (!user) return null;
  const { data } = await supabase
    .from("household_members")
    .select("role")
    .eq("household_id", householdId)
    .eq("user_id", user.id)
    .maybeSingle();
  return (data?.role as string) ?? null;
}

export async function listMembers(householdId: string): Promise<Member[]> {
  const supabase = await getSupabaseServer();
  const { data, error } = await supabase
    .from("members")
    .select("*")
    .eq("household_id", householdId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []) as Member[];
}

export async function getMember(id: string): Promise<Member | null> {
  const supabase = await getSupabaseServer();
  const { data } = await supabase
    .from("members")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  return (data as Member) ?? null;
}

export async function listDocumentsByMember(
  memberId: string,
  includeArchived = false
): Promise<DocumentRow[]> {
  const supabase = await getSupabaseServer();
  let query = supabase.from("documents").select("*").eq("member_id", memberId);
  if (!includeArchived) query = query.eq("status", "active");
  const { data, error } = await query.order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as DocumentRow[];
}

export async function listAssets(householdId: string): Promise<Asset[]> {
  const supabase = await getSupabaseServer();
  const { data, error } = await supabase
    .from("assets")
    .select("*")
    .eq("household_id", householdId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []) as Asset[];
}

export async function getAsset(id: string): Promise<Asset | null> {
  const supabase = await getSupabaseServer();
  const { data } = await supabase
    .from("assets")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  return (data as Asset) ?? null;
}

export async function listDocumentsByAsset(
  assetId: string,
  includeArchived = false
): Promise<DocumentRow[]> {
  const supabase = await getSupabaseServer();
  let query = supabase.from("documents").select("*").eq("asset_id", assetId);
  if (!includeArchived) query = query.eq("status", "active");
  const { data, error } = await query.order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as DocumentRow[];
}

export async function getDocument(id: string): Promise<DocumentRow | null> {
  const supabase = await getSupabaseServer();
  const { data } = await supabase
    .from("documents")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  return (data as DocumentRow) ?? null;
}

/** Пользовательские разделы документов, заведённые этой семьёй. */
export async function listCustomCategories(
  householdId: string
): Promise<CustomCategory[]> {
  const supabase = await getSupabaseServer();
  const { data, error } = await supabase
    .from("custom_doc_categories")
    .select("*")
    .eq("household_id", householdId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []) as CustomCategory[];
}

export async function getCustomCategory(
  id: string
): Promise<CustomCategory | null> {
  const supabase = await getSupabaseServer();
  const { data } = await supabase
    .from("custom_doc_categories")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  return (data as CustomCategory) ?? null;
}

/** Все документы пространства (для обзора «Документы» по категориям). */
export async function listAllDocuments(
  householdId: string,
  includeArchived = false
): Promise<DocumentRow[]> {
  const supabase = await getSupabaseServer();
  let query = supabase
    .from("documents")
    .select("*")
    .eq("household_id", householdId);
  if (!includeArchived) query = query.eq("status", "active");
  const { data, error } = await query.order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as DocumentRow[];
}

export async function listFiles(documentId: string): Promise<DocumentFile[]> {
  const supabase = await getSupabaseServer();
  const { data, error } = await supabase
    .from("document_files")
    .select("*")
    .eq("document_id", documentId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []) as DocumentFile[];
}

/** Короткие signed URL (для владельца — через его сессию, RLS пускает). */
export async function signFiles(
  files: DocumentFile[],
  expiresIn = 120
): Promise<Record<string, string>> {
  const supabase = await getSupabaseServer();
  const out: Record<string, string> = {};
  await Promise.all(
    files.map(async (f) => {
      const { data } = await supabase.storage
        .from("vault-files")
        .createSignedUrl(f.storage_path, expiresIn);
      if (data?.signedUrl) out[f.id] = data.signedUrl;
    })
  );
  return out;
}

export async function listExpiring(
  householdId: string,
  days = 60
): Promise<DocumentRow[]> {
  const supabase = await getSupabaseServer();
  const until = new Date();
  until.setDate(until.getDate() + days);
  const { data, error } = await supabase
    .from("documents")
    .select("*")
    .eq("household_id", householdId)
    .eq("status", "active")
    .not("expires_at", "is", null)
    .lte("expires_at", until.toISOString().slice(0, 10))
    .order("expires_at", { ascending: true });
  if (error) throw error;
  return (data ?? []) as DocumentRow[];
}

export async function listRecordsByMember(
  memberId: string
): Promise<RecordRow[]> {
  const supabase = await getSupabaseServer();
  const { data, error } = await supabase
    .from("records")
    .select("*")
    .eq("member_id", memberId)
    .order("recorded_at", { ascending: false, nullsFirst: false });
  if (error) throw error;
  return (data ?? []) as RecordRow[];
}

export async function searchDocuments(
  householdId: string,
  q: string,
  category?: string
): Promise<DocumentRow[]> {
  const supabase = await getSupabaseServer();
  let query = supabase
    .from("documents")
    .select("*")
    .eq("household_id", householdId)
    .eq("status", "active");

  const term = q.trim();
  if (term) {
    const safe = term.replace(/[%,()]/g, " ");
    query = query.or(
      `title.ilike.%${safe}%,subtype.ilike.%${safe}%,issuer.ilike.%${safe}%`
    );
  }
  if (category) query = query.eq("category", category);

  const { data, error } = await query
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) throw error;
  return (data ?? []) as DocumentRow[];
}

/** Ручные напоминания пространства (активные сверху, свежие первыми). */
export async function listReminders(householdId: string): Promise<Reminder[]> {
  const supabase = await getSupabaseServer();
  const { data, error } = await supabase
    .from("reminders")
    .select("*")
    .eq("household_id", householdId)
    .order("done", { ascending: true })
    .order("due_at", { ascending: true });
  if (error) throw error;
  return (data ?? []) as Reminder[];
}

export async function listLoginEvents(limit = 10): Promise<LoginEvent[]> {
  const supabase = await getSupabaseServer();
  const { data, error } = await supabase
    .from("login_events")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as LoginEvent[];
}

/** Версии документа (новые сверху). Неизменяемая история файлов. */
export async function listVersions(
  documentId: string
): Promise<DocumentVersion[]> {
  const supabase = await getSupabaseServer();
  const { data, error } = await supabase
    .from("document_versions")
    .select("*")
    .eq("document_id", documentId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as DocumentVersion[];
}

/** Автопроверки по конкретной версии (новые сверху). */
export async function listChecksByVersion(
  versionId: string
): Promise<DocumentCheck[]> {
  const supabase = await getSupabaseServer();
  const { data, error } = await supabase
    .from("document_checks")
    .select("*")
    .eq("document_version_id", versionId)
    .order("checked_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as DocumentCheck[];
}

/** Подписать одну версию (короткий signed URL). */
export async function signVersion(
  storagePath: string,
  expiresIn = 120
): Promise<string | null> {
  const supabase = await getSupabaseServer();
  const { data } = await supabase.storage
    .from("vault-files")
    .createSignedUrl(storagePath, expiresIn);
  return data?.signedUrl ?? null;
}

export async function listSharesByDocument(
  documentId: string
): Promise<Share[]> {
  const supabase = await getSupabaseServer();
  const { data, error } = await supabase
    .from("shares")
    .select("*")
    .eq("document_id", documentId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Share[];
}

import "server-only";
import { getSupabaseServer } from "./supabase/server";
import type { DocumentFile, DocumentRow, Member, Share } from "./types";

export async function getUser() {
  const supabase = await getSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

/**
 * Возвращает household текущего пользователя; если его нет — создаёт через
 * RPC create_household (атомарно делает пользователя owner).
 */
export async function getOrCreateHouseholdId(): Promise<string> {
  const supabase = await getSupabaseServer();

  const { data: memberships, error } = await supabase
    .from("household_members")
    .select("household_id")
    .limit(1);
  if (error) throw error;

  if (memberships && memberships.length > 0) {
    return memberships[0].household_id as string;
  }

  const { data: hid, error: rpcError } = await supabase.rpc("create_household", {
    p_name: "Моя семья",
  });
  if (rpcError) throw rpcError;
  return hid as string;
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
  memberId: string
): Promise<DocumentRow[]> {
  const supabase = await getSupabaseServer();
  const { data, error } = await supabase
    .from("documents")
    .select("*")
    .eq("member_id", memberId)
    .order("created_at", { ascending: false });
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
    .not("expires_at", "is", null)
    .lte("expires_at", until.toISOString().slice(0, 10))
    .order("expires_at", { ascending: true });
  if (error) throw error;
  return (data ?? []) as DocumentRow[];
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

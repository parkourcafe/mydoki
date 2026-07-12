import "server-only";
import { getSupabaseServer } from "./supabase/server";
import type { AuditEntry } from "./types";

/**
 * Пишет строку в audit_log через hardened-RPC log_audit (SECURITY DEFINER,
 * проверяет членство в household). Best-effort: сбой логирования не должен
 * ронять пользовательский сценарий.
 */
export async function logAudit(
  householdId: string,
  action: string,
  entityType?: string,
  entityId?: string,
  metadata?: Record<string, unknown>
): Promise<void> {
  try {
    const supabase = await getSupabaseServer();
    await supabase.rpc("log_audit", {
      p_household: householdId,
      p_action: action,
      p_entity_type: entityType ?? null,
      p_entity_id: entityId ?? null,
      p_metadata: metadata ?? {},
    });
  } catch {
    /* журналирование не критично для основного действия */
  }
}

/** Журнал доступов к конкретному документу (свежие сверху). */
export async function listDocumentAudit(
  documentId: string,
  limit = 50
): Promise<AuditEntry[]> {
  const supabase = await getSupabaseServer();
  const { data, error } = await supabase
    .from("audit_log")
    .select("*")
    .eq("entity_type", "document")
    .eq("entity_id", documentId)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as AuditEntry[];
}

import "server-only";
import { getSupabaseServer } from "./supabase/server";
import { linkedEmploymentIds, markVerifiedExperience, type ResumeSections } from "./resume";

// =====================================================================
// Связь строк резюме с трудовыми отношениями.
//
// Строка опыта может ссылаться на запись employments. Отметку «подтверждено»
// получают только те записи, которые оформил работодатель внутри doki
// (manual = false): самодобавленную запись нельзя выдавать за подтверждённую.
//
// Проверка всегда серверная и всегда от лица владельца резюме — RLS отдаёт
// только его собственные трудовые отношения.
// =====================================================================

type ServerClient = Awaited<ReturnType<typeof getSupabaseServer>>;

/**
 * Из списка id оставляет те, что принадлежат этому человеку. Второе значение —
 * подмножество, оформленное работодателем (именно оно даёт отметку).
 */
export async function checkEmploymentLinks(
  supabase: ServerClient,
  userId: string,
  ids: string[]
): Promise<{ own: Set<string>; verified: Set<string> }> {
  if (ids.length === 0) return { own: new Set(), verified: new Set() };

  const { data } = await supabase
    .from("employments")
    .select("id, manual")
    .eq("employee_user_id", userId)
    .in("id", ids);

  const rows = (data ?? []) as { id: string; manual: boolean }[];
  return {
    own: new Set(rows.map((r) => r.id)),
    verified: new Set(rows.filter((r) => r.manual === false).map((r) => r.id)),
  };
}

/** Секции с честно проставленной отметкой подтверждения — для показа и PDF. */
export async function withVerifiedExperience(
  supabase: ServerClient,
  userId: string,
  sections: ResumeSections
): Promise<ResumeSections> {
  const ids = linkedEmploymentIds(sections);
  if (ids.length === 0) return markVerifiedExperience(sections, []);
  const { verified } = await checkEmploymentLinks(supabase, userId, ids);
  return markVerifiedExperience(sections, verified);
}

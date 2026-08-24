"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseServer } from "@/lib/supabase/server";
import { getUser } from "@/lib/queries";
import {
  clearVerified,
  experienceFromEmployment,
  parseSections,
  RESUME_LIMITS,
} from "@/lib/resume";

export type AddToResumeResult =
  | { ok: true; already?: boolean }
  | { error: "auth" | "not_found" | "full" | "save" };

/**
 * Добавляет место работы из карьерного таймлайна в резюме.
 *
 * Запись берём из employments, а не из того, что прислал клиент: должность,
 * компания и период приходят от источника. Ссылку employment_id сохраняем —
 * по ней потом считается отметка «подтверждено работодателем».
 */
export async function addEmploymentToResume(
  employmentId: string
): Promise<AddToResumeResult> {
  const user = await getUser();
  if (!user) return { error: "auth" };

  const supabase = await getSupabaseServer();

  // RLS отдаёт только собственные трудовые отношения — этого достаточно.
  const { data: employmentRow } = await supabase
    .from("employments")
    .select("id, position, company_name, start_date, end_date, status")
    .eq("id", employmentId)
    .eq("employee_user_id", user.id)
    .maybeSingle();
  if (!employmentRow) return { error: "not_found" };

  const { data: resumeRow } = await supabase
    .from("resumes")
    .select("sections")
    .eq("user_id", user.id)
    .maybeSingle();

  const sections = parseSections((resumeRow as { sections?: unknown } | null)?.sections);

  // Повторное нажатие ничего не дублирует.
  if (sections.experience.some((e) => e.employment_id === employmentId)) {
    return { ok: true, already: true };
  }
  if (sections.experience.length >= RESUME_LIMITS.experience) return { error: "full" };

  const next = clearVerified({
    ...sections,
    experience: [
      ...sections.experience,
      experienceFromEmployment(
        employmentRow as {
          id: string;
          position: string;
          company_name: string;
          start_date: string | null;
          end_date: string | null;
          status: string;
        }
      ),
    ],
  });

  const { error } = await supabase.from("resumes").upsert(
    { user_id: user.id, sections: next, updated_at: new Date().toISOString() },
    { onConflict: "user_id" }
  );
  if (error) return { error: "save" };

  revalidatePath("/my/career");
  revalidatePath("/my/resume");
  return { ok: true };
}

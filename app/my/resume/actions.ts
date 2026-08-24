"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseServer } from "@/lib/supabase/server";
import { getUser } from "@/lib/queries";
import { parseSections, type ResumeSections } from "@/lib/resume";

export type ResumeCustomField = { label: string; value: string };

export type ResumeInput = {
  full_name: string;
  headline: string;
  location: string;
  contact: string;
  email: string;
  about: string;
  experience: string;
  custom_fields: ResumeCustomField[];
  sections: ResumeSections;
};

/** Сохранить (создать или обновить) резюме текущего пользователя. */
export async function saveResume(
  input: ResumeInput,
): Promise<{ ok: true } | { error: string }> {
  const user = await getUser();
  if (!user) return { error: "auth" };

  const clean = (s: string) => {
    const v = (s ?? "").trim();
    return v.length ? v : null;
  };

  // Оставляем только непустые «свои поля», подрезаем разумным лимитом.
  const custom = (input.custom_fields ?? [])
    .map((f) => ({
      label: (f.label ?? "").trim().slice(0, 60),
      value: (f.value ?? "").trim().slice(0, 500),
    }))
    .filter((f) => f.label || f.value)
    .slice(0, 30);

  // Секции приводим к канону на сервере: клиенту тут не доверяем. parseSections
  // терпим к мусору и к отсутствию поля (старая вкладка со старым бандлом).
  const sections = parseSections(input.sections);

  const supabase = await getSupabaseServer();
  const { error } = await supabase.from("resumes").upsert(
    {
      user_id: user.id,
      full_name: clean(input.full_name),
      headline: clean(input.headline),
      location: clean(input.location),
      contact: clean(input.contact),
      email: clean(input.email),
      about: clean(input.about),
      experience: clean(input.experience),
      custom_fields: custom,
      sections,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" },
  );
  if (error) return { error: error.message };

  revalidatePath("/my/resume");
  return { ok: true };
}

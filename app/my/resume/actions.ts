"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseServer } from "@/lib/supabase/server";
import { getOrCreateHouseholdId, getUser } from "@/lib/queries";
import { attachDocumentFile, createDocumentMeta } from "@/app/my/actions";
import { hasStructuredContent } from "@/lib/resume";
import { withVerifiedExperience } from "@/lib/resumeLinks";
import { ResumePdf } from "@/lib/pdf/ResumePdf";
import { renderPdf } from "@/lib/pdf/render";
import { getLocale } from "@/lib/i18n";
import {
  clearVerified,
  linkedEmploymentIds,
  parseSections,
  type ResumeSections,
} from "@/lib/resume";
import { checkEmploymentLinks } from "@/lib/resumeLinks";

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
  const parsed = parseSections(input.sections);

  const supabase = await getSupabaseServer();

  // Ссылку на трудовые отношения оставляем, только если запись действительно
  // принадлежит этому человеку. Отметку «подтверждено» не храним вовсе: она
  // вычисляется при чтении, иначе её можно было бы себе приписать.
  const { own } = await checkEmploymentLinks(
    supabase,
    user.id,
    linkedEmploymentIds(parsed)
  );
  const sections: ResumeSections = clearVerified({
    ...parsed,
    experience: parsed.experience.map((e) => ({
      ...e,
      employment_id: e.employment_id && own.has(e.employment_id) ? e.employment_id : null,
    })),
  });
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


// ── CV в семейный сейф ───────────────────────────────────────────────

export type SaveToVaultResult =
  | { ok: true; documentId: string }
  | { error: "auth" | "empty" | "email" | "quota" | "save" };

/**
 * Кладёт сгенерированное CV в сейф обычным документом. Смысл не в файле:
 * попав в `documents`, CV получает весь существующий контур обмена —
 * ссылку с TTL, отзыв, лимит просмотров и аудит открытий.
 *
 * Документ привязывается к записи «себя» в семье. Если её нет (create_household
 * заводит только доступ, но не человека), заводим её здесь по имени из резюме:
 * иначе владелец сейфа — единственный, для кого в нём нет карточки.
 */
export async function saveResumeToVault(): Promise<SaveToVaultResult> {
  const user = await getUser();
  if (!user) return { error: "auth" };

  const locale = await getLocale();
  const supabase = await getSupabaseServer();

  const { data } = await supabase
    .from("resumes")
    .select(
      "full_name, headline, location, contact, email, about, experience, custom_fields, sections",
    )
    .eq("user_id", user.id)
    .maybeSingle();
  if (!data) return { error: "empty" };

  const row = data as {
    full_name: string | null;
    headline: string | null;
    location: string | null;
    contact: string | null;
    email: string | null;
    about: string | null;
    experience: string | null;
    custom_fields: ResumeCustomField[] | null;
    sections: unknown;
  };

  const sections = await withVerifiedExperience(
    supabase,
    user.id,
    parseSections(row.sections),
  );
  // Пустое резюме класть в сейф незачем.
  if (!hasStructuredContent(sections) && !(row.experience ?? "").trim()) {
    return { error: "empty" };
  }

  const householdId = await getOrCreateHouseholdId();

  // Запись «себя» — одна на семью, ищем по relation.
  const { data: selfRow } = await supabase
    .from("members")
    .select("id")
    .eq("household_id", householdId)
    .eq("relation", "self")
    .limit(1)
    .maybeSingle();

  let memberId = (selfRow?.id as string) ?? null;
  if (!memberId) {
    const { data: created, error: memberError } = await supabase
      .from("members")
      .insert({
        household_id: householdId,
        full_name: (row.full_name ?? "").trim() || user.email || "—",
        relation: "self",
      })
      .select("id")
      .single();
    if (memberError || !created) return { error: "save" };
    memberId = created.id as string;
  }

  const issuedOn = new Date().toISOString().slice(0, 10);
  const bytes = await renderPdf(
    ResumePdf({
      locale,
      data: {
        fullName: row.full_name ?? "",
        headline: row.headline ?? "",
        location: row.location ?? "",
        contact: row.contact ?? "",
        email: row.email ?? user.email ?? "",
        about: row.about ?? "",
        legacyExperience: row.experience ?? "",
        sections,
        customFields: row.custom_fields ?? [],
      },
    }),
  );

  let documentId: string;
  try {
    const doc = await createDocumentMeta({
      member_id: memberId,
      title: `CV · ${issuedOn}`,
      category: "career",
      subtype: "CV",
      issued_at: issuedOn,
      tags: ["cv"],
    });
    documentId = doc.id;
  } catch (e) {
    return {
      error: (e instanceof Error ? e.message : "") === "EMAIL_NOT_VERIFIED" ? "email" : "save",
    };
  }

  const fileName = `cv-${issuedOn}.pdf`;
  const path = `${householdId}/${documentId}/${Date.now()}-${fileName}`;
  const { error: uploadError } = await supabase.storage
    .from("vault-files")
    .upload(path, bytes, { contentType: "application/pdf", upsert: false });
  if (uploadError) {
    await supabase.from("documents").delete().eq("id", documentId);
    return { error: "save" };
  }

  try {
    await attachDocumentFile({
      documentId,
      householdId,
      storagePath: path,
      fileName,
      mimeType: "application/pdf",
      sizeBytes: bytes.byteLength,
    });
  } catch (e) {
    // Файл уже удалён внутри attachDocumentFile при превышении квоты —
    // убираем и пустую карточку документа, чтобы не оставлять её висеть.
    await supabase.from("documents").delete().eq("id", documentId);
    const msg = e instanceof Error ? e.message : "";
    return { error: msg === "QUOTA_EXCEEDED" ? "quota" : "save" };
  }

  revalidatePath("/my/resume");
  revalidatePath(`/my/members/${memberId}`);
  return { ok: true, documentId };
}

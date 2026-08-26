"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseServer } from "@/lib/supabase/server";
import { getUser } from "@/lib/queries";
import { getLocale, type Locale } from "@/lib/i18n";
import type { Employment } from "@/lib/employment";
import { EmploymentLetterPdf } from "@/lib/pdf/EmploymentLetterPdf";
import { renderPdf } from "@/lib/pdf/render";

export type SaveLetterResult = { ok: true } | { error: "auth" | "not_found" | "save" };

const LABEL: Record<Locale, string> = {
  ru: "Справка о работе",
  en: "Employment letter",
  id: "Surat keterangan kerja",
  uz: "Ish haqida ma’lumotnoma",
};

/**
 * Сохраняет справку о работе в документы сотрудника (тип `reference`).
 *
 * Тот же PDF, что отдаётся по ссылке, но кладётся в employment-docs — тогда
 * он виден и сотруднику: документы этой записи по RLS читают обе стороны.
 * Файл каждый раз новый: справка датируется днём составления, и перезаписывать
 * ранее выданную неправильно.
 */
export async function saveEmploymentLetter(
  employmentId: string
): Promise<SaveLetterResult> {
  const user = await getUser();
  if (!user) return { error: "auth" };

  const locale = await getLocale();
  const supabase = await getSupabaseServer();

  const { data: profile } = await supabase
    .from("employer_profiles")
    .select("id, company_name")
    .eq("user_id", user.id)
    .maybeSingle();
  if (!profile) return { error: "auth" };
  const company = profile as { id: string; company_name: string };

  const { data } = await supabase
    .from("employments")
    .select("*")
    .eq("id", employmentId)
    .eq("company_id", company.id)
    .maybeSingle();
  const employment = data as Employment | null;
  if (!employment) return { error: "not_found" };

  let employeeName = "";
  if (employment.application_id) {
    const { data: appRow } = await supabase
      .from("applications")
      .select("full_name")
      .eq("id", employment.application_id)
      .maybeSingle();
    employeeName = (appRow?.full_name as string) ?? "";
  }

  const issuedOn = new Date().toISOString().slice(0, 10);
  const bytes = await renderPdf(
    EmploymentLetterPdf({
      locale,
      data: {
        companyName: employment.company_name || company.company_name,
        employeeName,
        position: employment.position,
        employmentType: employment.employment_type,
        startDate: employment.start_date,
        endDate: employment.end_date,
        status: employment.status,
        issuedOn,
        // Ссылку-подтверждение видит только сам работник (RLS), поэтому в
        // копии, которую выдаёт работодатель, её нет.
        verifyUrl: null,
      },
    })
  );

  const fileName = `employment-letter-${issuedOn}.pdf`;
  const path = `${employmentId}/${Date.now()}-${fileName}`;
  const { error: uploadError } = await supabase.storage
    .from("employment-docs")
    .upload(path, bytes, { contentType: "application/pdf", upsert: false });
  if (uploadError) return { error: "save" };

  const { error } = await supabase.from("employment_documents").insert({
    employment_id: employmentId,
    doc_type: "reference",
    label: `${LABEL[locale]} · ${issuedOn}`,
    file_path: path,
    file_name: fileName,
    file_size: bytes.byteLength,
  });
  if (error) {
    // Строка не записалась — не оставляем осиротевший файл в bucket.
    await supabase.storage.from("employment-docs").remove([path]);
    return { error: "save" };
  }

  revalidatePath(`/employer/employees/${employmentId}`);
  return { ok: true };
}

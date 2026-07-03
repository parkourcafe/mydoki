"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createHash, randomInt } from "crypto";
import { getSupabaseServer } from "@/lib/supabase/server";
import { getLocale } from "@/lib/i18n";
import { sendVerificationCode } from "@/lib/email";
import { normalizeWhatsapp } from "@/lib/career";
import type {
  RequiredDocument,
  ScreeningQuestion,
  ApplicationStatus,
} from "@/lib/career";

// ---------------------- Employer verification -------------------------

/** Сгенерировать 6-значный код, сохранить его хэш, отправить письмом. */
export async function requestEmployerVerification(): Promise<{ ok: boolean }> {
  const supabase = await getSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false };

  const { data: profile } = await supabase
    .from("employer_profiles")
    .select("contact_email")
    .eq("user_id", user.id)
    .maybeSingle();
  const email = (profile as { contact_email?: string | null } | null)?.contact_email || user.email;
  if (!email) return { ok: false };

  const code = String(randomInt(0, 1_000_000)).padStart(6, "0");
  const hash = createHash("sha256").update(code).digest("hex");
  const expires = new Date(Date.now() + 15 * 60 * 1000).toISOString();

  const { error } = await supabase.rpc("set_employer_verification", {
    p_code_hash: hash,
    p_expires_at: expires,
  });
  if (error) return { ok: false };

  const locale = await getLocale();
  await sendVerificationCode("email", email, code, locale);
  return { ok: true };
}

/** Подтвердить код. Возвращает ok или код ошибки (expired/too_many/wrong). */
export async function confirmEmployerVerification(
  code: string
): Promise<{ ok: boolean; error?: "expired" | "too_many" | "wrong" }> {
  const supabase = await getSupabaseServer();
  const hash = createHash("sha256").update(code.trim()).digest("hex");
  const { data, error } = await supabase.rpc("confirm_employer_verification", {
    p_code_hash: hash,
  });
  if (error) {
    const m = error.message || "";
    return {
      ok: false,
      error: /CODE_EXPIRED/.test(m) ? "expired" : /TOO_MANY/.test(m) ? "too_many" : undefined,
    };
  }
  return data === true ? { ok: true } : { ok: false, error: "wrong" };
}

/** Создать/обновить профиль работодателя для текущего пользователя. */
export async function saveEmployerProfile(formData: FormData) {
  const supabase = await getSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const company_name = String(formData.get("company_name") ?? "").trim();
  if (!company_name) return;
  const contact_whatsapp = String(formData.get("contact_whatsapp") ?? "").trim();
  const contact_email = String(formData.get("contact_email") ?? "").trim();

  const { error } = await supabase.from("employer_profiles").upsert(
    {
      user_id: user.id,
      company_name,
      contact_whatsapp: contact_whatsapp ? normalizeWhatsapp(contact_whatsapp) : null,
      contact_email: contact_email || null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" }
  );
  if (error) throw error;
  revalidatePath("/employer/vacancies/new");
  redirect("/employer/vacancies/new");
}

export type CreateVacancyInput = {
  title: string;
  company_name: string;
  location?: string;
  salary_range?: string;
  schedule?: string;
  description?: string;
  urgency?: "normal" | "hiring_now";
  closes_at?: string | null;
  required_documents: RequiredDocument[];
  screening_questions: ScreeningQuestion[];
};

/** Создать вакансию через RPC (генерит уникальный slug). Возвращает id/slug. */
export async function createVacancy(
  input: CreateVacancyInput
): Promise<{ id: string; slug: string }> {
  const supabase = await getSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data, error } = await supabase.rpc("create_vacancy", {
    p_title: input.title,
    p_company_name: input.company_name,
    p_location: input.location || null,
    p_salary_range: input.salary_range || null,
    p_schedule: input.schedule || null,
    p_description: input.description || null,
    p_urgency: input.urgency || "normal",
    p_closes_at: input.closes_at || null,
    p_required_documents: input.required_documents ?? [],
    p_screening_questions: input.screening_questions ?? [],
  });
  if (error) throw error;
  const res = data as { id: string; slug: string };
  revalidatePath("/employer");
  return res;
}

/** Работодатель меняет статус отклика (shortlist/reject/…). */
export async function setApplicationStatus(
  applicationId: string,
  vacancyId: string,
  status: ApplicationStatus
) {
  const supabase = await getSupabaseServer();
  const { error } = await supabase.rpc("update_application_status", {
    p_application_id: applicationId,
    p_new_status: status,
  });
  if (error) throw error;
  revalidatePath(`/employer/vacancies/${vacancyId}`);
}

/**
 * Откат ПОСЛЕДНЕГО отклонения (окно 10 мин). Возвращает восстановленный
 * статус либо код ошибки (expired/not_rejected/not_owner/generic).
 */
export async function revertRejection(
  applicationId: string,
  vacancyId: string
): Promise<
  | { ok: true; status: ApplicationStatus }
  | { ok: false; error: "expired" | "not_rejected" | "not_owner" | "generic" }
> {
  const supabase = await getSupabaseServer();
  const { data, error } = await supabase.rpc("revert_last_rejection", {
    p_application_id: applicationId,
  });
  if (error) {
    const msg = error.message || "";
    const code = /UNDO_EXPIRED/.test(msg)
      ? "expired"
      : /NOT_REJECTED/.test(msg)
        ? "not_rejected"
        : /NOT_OWNER/.test(msg)
          ? "not_owner"
          : "generic";
    return { ok: false, error: code };
  }
  revalidatePath(`/employer/vacancies/${vacancyId}`);
  return { ok: true, status: (data as ApplicationStatus) ?? "new" };
}

/** Автопометка «просмотрено» при открытии дашборда (new→viewed). */
export async function markApplicationsViewed(applicationIds: string[]) {
  if (!applicationIds.length) return;
  const supabase = await getSupabaseServer();
  await Promise.all(
    applicationIds.map((id) =>
      supabase.rpc("mark_application_viewed", { p_application_id: id })
    )
  );
}

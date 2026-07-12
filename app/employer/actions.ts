"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createHash, randomInt } from "crypto";
import { getSupabaseServer } from "@/lib/supabase/server";
import { normalizeWhatsapp } from "@/lib/career";
import type {
  RequiredDocument,
  ScreeningQuestion,
  ApplicationStatus,
} from "@/lib/career";

// ── Верификация работодателя (код на email) ──────────────────────────
// Функции set/confirm_employer_verification хранят и сверяют ХЕШ кода —
// хешируем на сервере, сам код шлём на email. Соль — из env.
const VERIFY_SALT = process.env.VERIFY_CODE_SALT || "doki-empl-verify-v1";
function hashCode(code: string): string {
  return createHash("sha256").update(VERIFY_SALT + code).digest("hex");
}

async function sendCodeEmail(
  to: string,
  code: string,
): Promise<{ ok: boolean; detail?: string }> {
  const key = process.env.RESEND_API_KEY;
  if (!key || !to) return { ok: false, detail: "no RESEND_API_KEY" };
  const from =
    process.env.ALERT_EMAIL_FROM || "Doki <noreply@doki.help>";
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to,
        subject: `Doki — код подтверждения: ${code}`,
        html: `<p>Код подтверждения работодателя:</p>
<p style="font-size:26px;font-weight:700;letter-spacing:4px">${code}</p>
<p>Код действует 15 минут. Если вы его не запрашивали — просто проигнорируйте письмо.</p>`,
      }),
    });
    if (res.ok) return { ok: true };
    // Пробрасываем ответ Resend (напр. «домен не подтверждён» / «можно слать
    // только на свой email») — это помогает точно понять, что чинить.
    const body = await res.text().catch(() => "");
    return { ok: false, detail: `${res.status} ${body}`.trim().slice(0, 300) };
  } catch (e) {
    return { ok: false, detail: e instanceof Error ? e.message : "network error" };
  }
}

/** Сгенерировать код, сохранить его хеш и отправить работодателю на email. */
export async function requestEmployerVerification(): Promise<
  { ok: true; sentTo: string } | { error: string; detail?: string }
> {
  const supabase = await getSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "auth" };

  const { data: prof } = await supabase
    .from("employer_profiles")
    .select("contact_email, verified_at")
    .eq("user_id", user.id)
    .maybeSingle();
  if (!prof) return { error: "no_profile" };
  if (prof.verified_at) return { ok: true, sentTo: "" };

  const to = (prof.contact_email || user.email || "").trim();
  if (!to) return { error: "no_email" };
  if (!process.env.RESEND_API_KEY) return { error: "email_off" };

  const code = String(randomInt(0, 1_000_000)).padStart(6, "0");
  const expires = new Date(Date.now() + 15 * 60 * 1000).toISOString();
  const { error } = await supabase.rpc("set_employer_verification", {
    p_code_hash: hashCode(code),
    p_expires_at: expires,
  });
  if (error) return { error: error.message };

  const sent = await sendCodeEmail(to, code);
  if (!sent.ok) return { error: "send_failed", detail: sent.detail };
  return { ok: true, sentTo: to };
}

/** Проверить введённый код. Возвращает ok=true при успешной верификации. */
export async function confirmEmployerVerification(
  code: string
): Promise<{ ok: boolean } | { error: string }> {
  const clean = (code || "").replace(/\D/g, "").slice(0, 6);
  if (clean.length !== 6) return { ok: false };

  const supabase = await getSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "auth" };

  const { data, error } = await supabase.rpc("confirm_employer_verification", {
    p_code_hash: hashCode(clean),
  });
  if (error) {
    if (error.message.includes("TOO_MANY_ATTEMPTS")) return { error: "too_many" };
    if (error.message.includes("CODE_EXPIRED")) return { error: "expired" };
    return { error: error.message };
  }
  if (data === true) {
    revalidatePath("/employer/vacancies/new");
    revalidatePath("/employer");
  }
  return { ok: data === true };
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

/** Сохранить настройки компании (данные, срок хранения, текст согласия). */
export async function saveCompanySettings(formData: FormData) {
  const supabase = await getSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const company_name = String(formData.get("company_name") ?? "").trim();
  if (!company_name) return;
  const contact_whatsapp = String(formData.get("contact_whatsapp") ?? "").trim();
  const contact_email = String(formData.get("contact_email") ?? "").trim();
  const country = String(formData.get("country") ?? "").trim();
  const default_consent_text = String(
    formData.get("default_consent_text") ?? ""
  ).trim();
  const retentionRaw = Number(formData.get("retention_months") ?? 12);
  const retention_months =
    Number.isFinite(retentionRaw) && retentionRaw > 0
      ? Math.min(120, Math.round(retentionRaw))
      : 12;

  const { error } = await supabase.from("employer_profiles").upsert(
    {
      user_id: user.id,
      company_name,
      contact_whatsapp: contact_whatsapp
        ? normalizeWhatsapp(contact_whatsapp)
        : null,
      contact_email: contact_email || null,
      country: country || null,
      default_consent_text: default_consent_text || null,
      retention_months,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" }
  );
  if (error) throw error;
  revalidatePath("/employer/settings");
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
  video_screening?: "off" | "optional" | "required";
  video_question?: string | null;
  // Структурированные блоки (§8 v1.1) — необязательны.
  problem_statement?: string | null;
  must_have?: string[];
  trainable?: string[];
  scorecard?: string[];
  stages?: string[];
  success_criteria_probation?: string | null;
};

/** Поля структуры вакансии для прямого RLS-обновления (владелец). */
function structuredFields(input: CreateVacancyInput) {
  const fields: Record<string, unknown> = {};
  if (input.problem_statement !== undefined)
    fields.problem_statement = input.problem_statement?.trim() || null;
  if (input.must_have !== undefined) fields.must_have = input.must_have;
  if (input.trainable !== undefined) fields.trainable = input.trainable;
  if (input.scorecard !== undefined) fields.scorecard = input.scorecard;
  if (input.stages !== undefined && input.stages.length)
    fields.stages = input.stages;
  if (input.success_criteria_probation !== undefined)
    fields.success_criteria_probation =
      input.success_criteria_probation?.trim() || null;
  return fields;
}

/**
 * Снимок текущего состояния вакансии в vacancy_versions (неизменяемая
 * история условий). Делается кодом doki.help — не триггером, чтобы записи
 * Doki.id в общую таблицу vacancies не порождали версий.
 */
async function snapshotVacancy(
  supabase: Awaited<ReturnType<typeof getSupabaseServer>>,
  vacancyId: string
): Promise<void> {
  const { data: vac } = await supabase
    .from("vacancies")
    .select("*")
    .eq("id", vacancyId)
    .maybeSingle();
  if (!vac) return;
  const { count } = await supabase
    .from("vacancy_versions")
    .select("id", { count: "exact", head: true })
    .eq("vacancy_id", vacancyId);
  const { error } = await supabase.from("vacancy_versions").insert({
    vacancy_id: vacancyId,
    version_no: (count ?? 0) + 1,
    snapshot: vac,
  });
  if (error) throw error;
}

/** Создать вакансию через RPC (генерит уникальный slug). Возвращает id/slug. */
export async function createVacancy(
  input: CreateVacancyInput
): Promise<{ id: string; slug: string }> {
  const supabase = await getSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Backstop лимита бесплатного тарифа (основная проверка — на странице /new).
  // Считаем активные вакансии работодателя; при достижении лимита не создаём.
  const { data: prof } = await supabase
    .from("employer_profiles")
    .select("id, vacancy_limit")
    .eq("user_id", user.id)
    .maybeSingle();
  if (prof) {
    const limit = (prof.vacancy_limit as number | null) ?? 3;
    const { count } = await supabase
      .from("vacancies")
      .select("id", { count: "exact", head: true })
      .eq("employer_id", prof.id)
      .eq("status", "active");
    if ((count ?? 0) >= limit) throw new Error("VACANCY_LIMIT_REACHED");
  }

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

  // Видео-скрининг и структурные поля не входят в RPC create_vacancy —
  // дописываем прямым RLS-обновлением (владелец) сразу после создания.
  const mode = input.video_screening ?? "off";
  const extra: Record<string, unknown> = { ...structuredFields(input) };
  if (mode !== "off") {
    extra.video_screening = mode;
    extra.video_question = input.video_question?.trim() || null;
  }
  extra.published_at = new Date().toISOString();
  if (Object.keys(extra).length) {
    await supabase.from("vacancies").update(extra).eq("id", res.id);
  }

  await snapshotVacancy(supabase, res.id);
  revalidatePath("/employer");
  return res;
}

export type UpdateVacancyInput = CreateVacancyInput & { id: string };

/**
 * Обновить существующую вакансию. Slug не трогаем — ссылка остаётся рабочей.
 * Правки применяются к вакансии (для будущих откликов); уже полученные
 * отклики и их ответы не изменяются (ответы хранятся снимком в
 * application_answers). Доступ ограничен владельцем на уровне RLS.
 */
export async function updateVacancy(
  input: UpdateVacancyInput
): Promise<{ id: string }> {
  const supabase = await getSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase
    .from("vacancies")
    .update({
      title: input.title,
      company_name: input.company_name,
      location: input.location || null,
      salary_range: input.salary_range || null,
      schedule: input.schedule || null,
      description: input.description || null,
      urgency: input.urgency || "normal",
      closes_at: input.closes_at || null,
      required_documents: input.required_documents ?? [],
      screening_questions: input.screening_questions ?? [],
      video_screening: input.video_screening ?? "off",
      video_question: input.video_question?.trim() || null,
      ...structuredFields(input),
      updated_at: new Date().toISOString(),
    })
    .eq("id", input.id);
  if (error) throw error;

  // Правка опубликованной вакансии фиксирует новый снимок — условия уже
  // поданных откликов не меняются задним числом (v1.1 §8).
  await snapshotVacancy(supabase, input.id);
  revalidatePath(`/employer/vacancies/${input.id}`);
  revalidatePath("/employer");
  return { id: input.id };
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

/** Свежий signed URL (2 мин) на файл отклика. RLS пускает только владельца. */
export async function signApplicationDoc(path: string): Promise<string | null> {
  const supabase = await getSupabaseServer();
  const { data } = await supabase.storage
    .from("applications")
    .createSignedUrl(path, 120);
  return data?.signedUrl ?? null;
}

/** Signed URL (5 мин) на видео-ответ кандидата из приватного bucket. */
export async function signApplicationVideo(path: string): Promise<string | null> {
  const supabase = await getSupabaseServer();
  const { data } = await supabase.storage
    .from("video-screenings")
    .createSignedUrl(path, 300);
  return data?.signedUrl ?? null;
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

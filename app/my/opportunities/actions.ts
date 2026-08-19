"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseServer } from "@/lib/supabase/server";
import { getUser } from "@/lib/queries";
import { passportFromRow } from "@/lib/passport";
import { evaluateCriteria, type VacancyCriteria } from "@/lib/matching";
import {
  defaultVisibilityPolicy,
  normalizeVisibilityMode,
  type VisibilityPolicy,
} from "@/lib/passportVisibility";
import { buildApplicationSnapshot } from "@/lib/passportSnapshot";

// ===== Кабинет кандидата: Opportunity Invites (v1.2 §8.8, §10) ========
// Приглашение не является откликом. `Accept introduction` создаёт только
// ограниченный доступ, а отдельное `Share & apply` — разрешение на отклик,
// сам отклик и неизменяемый снимок профиля.

export type ActionResult = { ok: true } | { error: string };

export async function markInviteViewed(inviteId: string): Promise<ActionResult> {
  const supabase = await getSupabaseServer();
  const { error } = await supabase.rpc("respond_to_opportunity_invite", {
    p_invite_id: inviteId,
    p_action: "view",
    p_scope_fields: [],
  });
  if (error) return { error: error.message };
  revalidatePath("/my/opportunities");
  return { ok: true };
}

/** Принять знакомство: ограниченный доступ, но ещё НЕ отклик (§8.8.6). */
export async function acceptIntroduction(
  inviteId: string,
  scopeFields: string[],
): Promise<ActionResult> {
  const supabase = await getSupabaseServer();
  const { error } = await supabase.rpc("respond_to_opportunity_invite", {
    p_invite_id: inviteId,
    p_action: "accept",
    p_scope_fields: scopeFields ?? [],
  });
  if (error) return { error: error.message };
  revalidatePath("/my/opportunities");
  return { ok: true };
}

/** Отклонение не становится негативным сигналом для будущего matching (§17.14). */
export async function declineInvite(inviteId: string): Promise<ActionResult> {
  const supabase = await getSupabaseServer();
  const { error } = await supabase.rpc("respond_to_opportunity_invite", {
    p_invite_id: inviteId,
    p_action: "decline",
    p_scope_fields: [],
  });
  if (error) return { error: error.message };
  revalidatePath("/my/opportunities");
  return { ok: true };
}

/**
 * `Share & apply` — отдельное явное действие: создаёт application-purpose
 * authorization, Application и неизменяемый снимок переданных полей.
 */
export async function shareAndApply(input: {
  invite_id: string;
  vacancy_id: string;
  shared_fields: string[];
  consent_text: string;
  notice_version: string;
}): Promise<{ ok: true; application_id: string } | { error: string }> {
  const user = await getUser();
  if (!user) return { error: "auth" };
  const supabase = await getSupabaseServer();

  const [resume, visibility, vacancy] = await Promise.all([
    supabase.from("resumes").select("*").eq("user_id", user.id).maybeSingle(),
    supabase
      .from("profile_visibility_policies")
      .select("mode, hide_current_employer, current_employer_names, hidden_fields")
      .eq("user_id", user.id)
      .maybeSingle(),
    supabase
      .from("vacancies")
      .select("id, hard_criteria, soft_signals")
      .eq("id", input.vacancy_id)
      .maybeSingle(),
  ]);

  const passport = passportFromRow(
    (resume.data ?? null) as Record<string, unknown> | null,
  );

  const policyRow = visibility.data as {
    mode: string;
    hide_current_employer: boolean;
    current_employer_names: string[] | null;
    hidden_fields: string[] | null;
  } | null;

  const policy: VisibilityPolicy = policyRow
    ? {
        ...defaultVisibilityPolicy(),
        mode: normalizeVisibilityMode(policyRow.mode),
        hide_current_employer: policyRow.hide_current_employer,
        current_employer_names: policyRow.current_employer_names ?? [],
        hidden_fields: policyRow.hidden_fields ?? [],
      }
    : defaultVisibilityPolicy();

  const now = new Date().toISOString();
  const criteria: VacancyCriteria = {
    // Отклик ссылается на условия конкретной вакансии; при отсутствии
    // структурированных критериев снимок фиксирует пустой набор, а не выдумку.
    vacancy_version_id: input.vacancy_id,
    hard: ((vacancy.data as { hard_criteria?: unknown })?.hard_criteria ?? {}) as never,
    soft: ((vacancy.data as { soft_signals?: unknown })?.soft_signals ?? {}) as never,
  };

  const explanation = evaluateCriteria({
    criteria,
    passport,
    profile_version_id: user.id,
    now,
  });

  const snapshot = buildApplicationSnapshot({
    passport,
    criteria,
    explanation,
    policy,
    reveal_level: "shared",
    shared_fields: input.shared_fields ?? [],
    timestamp: now,
  });

  const { data, error } = await supabase.rpc("share_and_apply", {
    p_invite_id: input.invite_id,
    p_shared_fields: input.shared_fields ?? [],
    p_consent_text: input.consent_text,
    p_notice_version: input.notice_version,
    p_profile: snapshot.candidate_profile_snapshot,
    p_requirements: snapshot.vacancy_requirements_snapshot,
    p_match_explanation: snapshot.match_explanation_snapshot,
    p_visibility_state: snapshot.visibility_state_snapshot,
    p_checksum: snapshot.checksum,
  });
  if (error) return { error: error.message };

  revalidatePath("/my/opportunities");
  revalidatePath("/my/applications");
  return {
    ok: true,
    application_id: (data as { application_id: string })?.application_id ?? "",
  };
}

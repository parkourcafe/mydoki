"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseServer } from "@/lib/supabase/server";
import { getUser } from "@/lib/queries";
import {
  QUICK_START_FIELDS,
  applyAcceptedPrefill,
  isQuickStartComplete,
  normalizeSearchIntent,
  passportFromRow,
  profileCompleteness,
  type CandidatePassport,
  type FieldConfirmations,
  type PrefillSuggestion,
  type SearchIntent,
} from "@/lib/passport";
import { buildProfileVersion } from "@/lib/passportSnapshot";
import type { VisibilityMode } from "@/lib/passportVisibility";
import { normalizeVisibilityMode } from "@/lib/passportVisibility";

// ============ Кабинет кандидата: Candidate Passport (v1.2 §8.2–§8.5) ==
// Все действия выполняются только над собственным профилем. Работодатель
// не имеет прямого доступа к `resumes`: employer-facing чтение идёт через
// SECURITY DEFINER RPC с проверкой видимости.

export type ActionResult = { ok: true } | { error: string };

/** Колонки паспорта, которые кандидат правит из формы. */
const EDITABLE_COLUMNS = [
  "profession",
  "role_taxonomy_code",
  "role_free_text",
  "seniority",
  "years_of_experience",
  "key_achievements",
  "management_experience",
  "team_size",
  "current_location",
  "preferred_locations",
  "work_format_preference",
  "relocation_willingness",
  "work_authorization",
  "languages",
  "salary_expectation",
  "notice_period_days",
  "preferred_employment_format",
  "preferred_environment",
  "motivation",
  "company_type_preference",
  "role_preference",
  "cv_file_path",
  "linkedin_url",
  "portfolio_url",
] as const;

export type PassportInput = Partial<
  Pick<CandidatePassport, (typeof EDITABLE_COLUMNS)[number]>
> & { search_intent?: SearchIntent };

async function loadRow() {
  const user = await getUser();
  if (!user) return { user: null, supabase: null, row: null } as const;
  const supabase = await getSupabaseServer();
  const { data } = await supabase
    .from("resumes")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();
  return { user, supabase, row: (data ?? null) as Record<string, unknown> | null } as const;
}

/**
 * Сохранить паспорт. Каждое изменённое поле получает происхождение
 * `candidate_declared` и дату подтверждения человеком (§8.2).
 * Профиль становится `ready` только после минимального набора (§8.3).
 */
export async function savePassport(input: PassportInput): Promise<ActionResult> {
  const { user, supabase, row } = await loadRow();
  if (!user || !supabase) return { error: "auth" };

  const current = passportFromRow(row);
  const now = new Date().toISOString();
  const confirmations: FieldConfirmations = { ...current.field_confirmations };

  const patch: Record<string, unknown> = {};
  for (const column of EDITABLE_COLUMNS) {
    if (!(column in input)) continue;
    const value = (input as Record<string, unknown>)[column];
    patch[column] = value ?? null;
    confirmations[column] = { source: "candidate_declared", confirmed_at: now };
  }

  if (input.search_intent) {
    patch.search_intent = normalizeSearchIntent(input.search_intent);
    confirmations.search_intent = { source: "candidate_declared", confirmed_at: now };
  }

  const next: CandidatePassport = {
    ...current,
    ...(patch as Partial<CandidatePassport>),
    field_confirmations: confirmations,
  };
  const completeness = profileCompleteness(next);
  const ready = isQuickStartComplete(next);

  const { error } = await supabase.from("resumes").upsert(
    {
      user_id: user.id,
      ...patch,
      field_confirmations: confirmations,
      profile_completeness: completeness.percent,
      last_confirmed_at: now,
      // Пока минимальный набор не собран, профиль остаётся черновиком и не
      // может быть обнаружен работодателем.
      lifecycle: ready ? (current.lifecycle === "draft" ? "ready" : current.lifecycle) : "draft",
      updated_at: now,
    },
    { onConflict: "user_id" },
  );
  if (error) return { error: error.message };

  revalidatePath("/my/passport");
  return { ok: true };
}

/** Отдельная state machine: намерение искать работу (§8.4). */
export async function setSearchIntent(intent: SearchIntent): Promise<ActionResult> {
  const supabase = await getSupabaseServer();
  const { error } = await supabase.rpc("set_search_intent", {
    p_intent: normalizeSearchIntent(intent),
  });
  if (error) return { error: error.message };
  revalidatePath("/my/passport");
  return { ok: true };
}

/**
 * Зафиксировать неизменяемую версию профиля. На неё ссылаются снимок
 * отклика и оценка соответствия (§7.3).
 */
export async function publishProfileVersion(): Promise<
  { ok: true; version_no: number } | { error: string }
> {
  const { user, supabase, row } = await loadRow();
  if (!user || !supabase) return { error: "auth" };

  const passport = passportFromRow(row);
  if (!isQuickStartComplete(passport)) return { error: "incomplete" };

  const version = buildProfileVersion(passport, new Date().toISOString());
  const { data, error } = await supabase.rpc("publish_profile_version", {
    p_snapshot: version,
    p_checksum: version.checksum,
  });
  if (error) return { error: error.message };

  revalidatePath("/my/passport");
  return { ok: true, version_no: (data as { version_no: number })?.version_no ?? 1 };
}

/** Подтвердить актуальность изменчивых полей (re-verification, §8.4). */
export async function confirmFreshness(): Promise<ActionResult> {
  const { user, supabase, row } = await loadRow();
  if (!user || !supabase) return { error: "auth" };

  const passport = passportFromRow(row);
  const now = new Date().toISOString();
  const confirmations: FieldConfirmations = { ...passport.field_confirmations };
  for (const field of QUICK_START_FIELDS) {
    confirmations[field] = {
      source: confirmations[field]?.source ?? "candidate_declared",
      confirmed_at: now,
    };
  }

  const { error } = await supabase
    .from("resumes")
    .update({ field_confirmations: confirmations, last_confirmed_at: now, updated_at: now })
    .eq("user_id", user.id);
  if (error) return { error: error.message };

  revalidatePath("/my/passport");
  return { ok: true };
}

/**
 * Применить проверенные человеком подсказки из CV/экспорта (§8.3).
 * Непринятая подсказка не попадает в профиль вообще.
 */
export async function acceptPrefill(
  suggestions: PrefillSuggestion[],
): Promise<ActionResult> {
  const { user, supabase, row } = await loadRow();
  if (!user || !supabase) return { error: "auth" };

  const now = new Date().toISOString();
  const current = passportFromRow(row);
  const next = applyAcceptedPrefill(current, suggestions ?? [], now);

  const patch: Record<string, unknown> = {};
  for (const suggestion of suggestions ?? []) {
    if (!suggestion.accepted) continue;
    if (!(EDITABLE_COLUMNS as readonly string[]).includes(suggestion.field)) continue;
    patch[suggestion.field] = (next as Record<string, unknown>)[suggestion.field] ?? null;
  }
  if (Object.keys(patch).length === 0) return { ok: true };

  const { error } = await supabase.from("resumes").upsert(
    {
      user_id: user.id,
      ...patch,
      field_confirmations: next.field_confirmations,
      profile_completeness: profileCompleteness(next).percent,
      updated_at: now,
    },
    { onConflict: "user_id" },
  );
  if (error) return { error: error.message };

  revalidatePath("/my/passport");
  return { ok: true };
}

// ---------------------------- Видимость и Talent Pool -----------------

export type VisibilityInput = {
  mode: VisibilityMode | string;
  hide_current_employer: boolean;
  current_employer_names: string[];
  hidden_fields: string[];
};

export async function saveVisibility(input: VisibilityInput): Promise<ActionResult> {
  const supabase = await getSupabaseServer();
  const { error } = await supabase.rpc("set_profile_visibility", {
    p_mode: normalizeVisibilityMode(String(input.mode)),
    p_hide_current_employer: !!input.hide_current_employer,
    p_current_employer_names: (input.current_employer_names ?? [])
      .map((n) => n.trim())
      .filter(Boolean)
      .slice(0, 20),
    p_hidden_fields: (input.hidden_fields ?? []).slice(0, 40),
  });
  if (error) return { error: error.message };
  revalidatePath("/my/passport");
  return { ok: true };
}

/**
 * Вступление в Talent Pool — отдельное действие с собственной целью
 * обработки. Разрешение на отклик его не заменяет (§13.5), автоматическое
 * включение запрещено (§16).
 */
export async function joinTalentPool(input: {
  consent_text: string;
  notice_version: string;
  scope_fields: string[];
  months: number;
}): Promise<ActionResult> {
  const supabase = await getSupabaseServer();
  const months = Math.min(Math.max(Math.round(input.months || 6), 1), 12);
  const expires = new Date(Date.now() + months * 30 * 86_400_000).toISOString();

  const { error: authError } = await supabase.rpc("grant_purpose_authorization", {
    p_purpose: "talent_pool_discovery",
    p_legal_basis: "consent",
    p_notice_version: input.notice_version,
    p_scope_fields: input.scope_fields ?? [],
    p_audience: "verified_employers",
    p_employer_id: null,
    p_consent_text: input.consent_text,
    p_expires_at: expires,
  });
  if (authError) return { error: authError.message };

  const { error } = await supabase.rpc("set_talent_pool_membership", {
    p_state: "active",
    p_expires_at: expires,
  });
  if (error) return { error: error.message };

  revalidatePath("/my/passport");
  return { ok: true };
}

export async function setMembership(state: "active" | "paused" | "left"): Promise<ActionResult> {
  const supabase = await getSupabaseServer();
  const { error } = await supabase.rpc("set_talent_pool_membership", {
    p_state: state,
    p_expires_at: null,
  });
  if (error) return { error: error.message };
  revalidatePath("/my/passport");
  return { ok: true };
}

/** Полный выход: членство прекращается и разрешение отзывается. */
export async function leaveTalentPool(): Promise<ActionResult> {
  const supabase = await getSupabaseServer();
  const { error } = await supabase.rpc("set_talent_pool_membership", {
    p_state: "left",
    p_expires_at: null,
  });
  if (error) return { error: error.message };
  const { error: revokeError } = await supabase.rpc("revoke_purpose_authorization", {
    p_purpose: "talent_pool_discovery",
  });
  if (revokeError) return { error: revokeError.message };
  revalidatePath("/my/passport");
  return { ok: true };
}

export async function blockOrganization(input: {
  employer_id?: string | null;
  domain?: string | null;
}): Promise<ActionResult> {
  const supabase = await getSupabaseServer();
  const { error } = await supabase.rpc("block_organization", {
    p_employer_id: input.employer_id ?? null,
    p_domain: (input.domain ?? "").trim() || null,
  });
  if (error) return { error: error.message };
  revalidatePath("/my/passport");
  return { ok: true };
}

export async function unblockOrganization(blockId: string): Promise<ActionResult> {
  const supabase = await getSupabaseServer();
  const { error } = await supabase.rpc("unblock_organization", { p_block_id: blockId });
  if (error) return { error: error.message };
  revalidatePath("/my/passport");
  return { ok: true };
}

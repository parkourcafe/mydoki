"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseServer } from "@/lib/supabase/server";
import { passportFromRow } from "@/lib/passport";
import {
  assertNoAggregateScore,
  evaluateCriteria,
  hasBlockingConflict,
  type MatchExplanation,
  type VacancyCriteria,
} from "@/lib/matching";
import { MIN_COHORT_SIZE, cohortDisclosure, type CohortDisclosure } from "@/lib/talentPool";

// ===== Employer sourcing (v1.2 §8.8) ==================================
// В первой безопасной версии работодатель НЕ видит профили и не получает
// список людей. Он видит только размер когорты выше порога и может
// отправить blind-приглашения. Личность раскрывается только после
// принятия знакомства и явного `Share & apply` кандидата.

const CANDIDATE_FETCH_LIMIT = 100;

type PoolRow = Record<string, unknown> & {
  ref: string;
  profile_version_id: string | null;
  reveal_level: string;
};

type Eligible = {
  ref: string;
  profile_version_id: string | null;
  explanation: MatchExplanation;
};

async function vacancyCriteria(
  vacancyId: string,
): Promise<{ criteria: VacancyCriteria; vacancy: Record<string, unknown> } | null> {
  const supabase = await getSupabaseServer();
  const { data } = await supabase
    .from("vacancies")
    .select("id, title, location, salary_range, hard_criteria, soft_signals")
    .eq("id", vacancyId)
    .maybeSingle();
  if (!data) return null;

  const vacancy = data as Record<string, unknown>;
  const { data: version } = await supabase
    .from("vacancy_versions")
    .select("id")
    .eq("vacancy_id", vacancyId)
    .order("version_no", { ascending: false })
    .limit(1)
    .maybeSingle();

  return {
    vacancy,
    criteria: {
      // Sourcing ведётся от конкретной версии вакансии; при её отсутствии
      // ссылаемся на саму вакансию, а не на параллельный «role brief».
      vacancy_version_id: ((version as { id?: string } | null)?.id ?? vacancyId) as string,
      hard: (vacancy.hard_criteria ?? {}) as never,
      soft: (vacancy.soft_signals ?? {}) as never,
    },
  };
}

/**
 * Кандидаты пула, у которых нет заявленного несоответствия обязательным
 * критериям. Пробел и устаревание НЕ исключают человека (§16).
 * Возвращается только на сервер: наружу уходит агрегат.
 */
async function eligibleCandidates(criteria: VacancyCriteria): Promise<Eligible[]> {
  const supabase = await getSupabaseServer();
  const { data, error } = await supabase.rpc("talent_pool_candidates", {
    p_limit: CANDIDATE_FETCH_LIMIT,
  });
  if (error) throw new Error(error.message);

  const now = new Date().toISOString();
  const rows = (data ?? []) as PoolRow[];
  const out: Eligible[] = [];
  for (const row of rows) {
    const explanation = evaluateCriteria({
      criteria,
      passport: passportFromRow(row),
      profile_version_id: (row.profile_version_id ?? row.ref) as string,
      now,
    });
    if (hasBlockingConflict(explanation)) continue;
    out.push({
      ref: row.ref,
      profile_version_id: row.profile_version_id ?? null,
      explanation,
    });
  }
  return out;
}

export type CohortPreview =
  | { ok: true; disclosure: CohortDisclosure; min_cohort: number }
  | { error: string };

/**
 * Размер когорты — единственный агрегат, доступный работодателю, и только
 * выше минимального порога, с округлением до корзины (§8.8.3).
 */
export async function previewCohort(vacancyId: string): Promise<CohortPreview> {
  try {
    const loaded = await vacancyCriteria(vacancyId);
    if (!loaded) return { error: "vacancy_not_found" };
    const eligible = await eligibleCandidates(loaded.criteria);
    return {
      ok: true,
      disclosure: cohortDisclosure(eligible.length),
      min_cohort: MIN_COHORT_SIZE,
    };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "failed" };
  }
}

export type SendInvitesInput = {
  vacancy_id: string;
  role_title: string;
  location: string;
  work_format: string;
  compensation_range: string;
  access_purpose: string;
  respond_within_days: number;
  message: string;
};

/**
 * Blind-приглашения когорте. Работодатель не выбирает конкретных людей и
 * не узнаёт, кому ушло приглашение, пока кандидат не примет знакомство.
 */
export async function sendBlindInvites(
  input: SendInvitesInput,
): Promise<{ ok: true; sent: number } | { error: string }> {
  try {
    const loaded = await vacancyCriteria(input.vacancy_id);
    if (!loaded) return { error: "vacancy_not_found" };

    const eligible = await eligibleCandidates(loaded.criteria);
    // Ниже минимальной когорты кампания не запускается: иначе размер
    // аудитории восстанавливается по числу отправленных приглашений.
    if (eligible.length < MIN_COHORT_SIZE) return { error: "below_min_cohort" };

    const supabase = await getSupabaseServer();
    const respondBy = new Date(
      Date.now() + Math.min(Math.max(input.respond_within_days || 14, 1), 60) * 86_400_000,
    ).toISOString();

    let sent = 0;
    for (const candidate of eligible) {
      // Guardrail: в employer-facing объяснении не должно быть агрегата.
      assertNoAggregateScore(candidate.explanation);
      const { data, error } = await supabase.rpc("send_opportunity_invite", {
        p_ref: candidate.ref,
        p_vacancy_id: input.vacancy_id,
        p_vacancy_version_id: loaded.criteria.vacancy_version_id,
        p_role_title: input.role_title,
        p_location: input.location,
        p_work_format: input.work_format,
        p_compensation_range: input.compensation_range,
        p_access_purpose: input.access_purpose,
        p_respond_by: respondBy,
        p_message: input.message || null,
        p_match_explanation: candidate.explanation,
        p_profile_version_id: candidate.profile_version_id,
      });
      if (error) {
        // Лимит отправки — не ошибка кампании: останавливаемся и сообщаем.
        if (error.message.includes("rate limit")) break;
        continue;
      }
      if ((data as { invite_id?: string })?.invite_id) sent += 1;
    }

    revalidatePath("/employer/talent");
    return { ok: true, sent };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "failed" };
  }
}

import { getSupabaseServer } from "@/lib/supabase/server";
import { getUser } from "@/lib/queries";
import { getLocale } from "@/lib/i18n";
import { passportFromRow } from "@/lib/passport";
import {
  defaultVisibilityPolicy,
  normalizeVisibilityMode,
  type VisibilityPolicy,
} from "@/lib/passportVisibility";
import { normalizeMembershipState } from "@/lib/talentPool";
import PassportForm from "./PassportForm";
import TalentPoolPanel, { type BlockedOrganization } from "./TalentPoolPanel";

/**
 * Candidate Passport (v1.2 §8.2–§8.5). Профиль создаётся без привязки к
 * вакансии и по умолчанию приватен: ни один работодатель не видит его,
 * пока человек явно не выбрал другой режим видимости.
 */
export default async function PassportPage() {
  const locale = await getLocale();
  const user = await getUser();
  const supabase = await getSupabaseServer();
  const userId = user?.id ?? "";

  const [resume, visibility, membership, blocks] = await Promise.all([
    supabase.from("resumes").select("*").eq("user_id", userId).maybeSingle(),
    supabase
      .from("profile_visibility_policies")
      .select("mode, hide_current_employer, current_employer_names, hidden_fields")
      .eq("user_id", userId)
      .maybeSingle(),
    supabase
      .from("talent_pool_memberships")
      .select("state, expires_at")
      .eq("user_id", userId)
      .maybeSingle(),
    supabase
      .from("organization_discovery_blocks")
      .select("id, employer_id, domain")
      .eq("user_id", userId),
  ]);

  const passport = passportFromRow(
    (resume.data ?? null) as Record<string, unknown> | null,
  );

  const policyRow = visibility.data as
    | {
        mode: string;
        hide_current_employer: boolean;
        current_employer_names: string[] | null;
        hidden_fields: string[] | null;
      }
    | null;

  const policy: VisibilityPolicy = policyRow
    ? {
        ...defaultVisibilityPolicy(),
        mode: normalizeVisibilityMode(policyRow.mode),
        hide_current_employer: policyRow.hide_current_employer,
        current_employer_names: policyRow.current_employer_names ?? [],
        hidden_fields: policyRow.hidden_fields ?? [],
      }
    : defaultVisibilityPolicy();

  const membershipRow = membership.data as
    | { state: string; expires_at: string | null }
    | null;
  const membershipState = normalizeMembershipState(membershipRow?.state ?? null);
  const expired =
    membershipState === "active" &&
    membershipRow?.expires_at !== null &&
    membershipRow?.expires_at !== undefined &&
    // Серверный компонент: рендер один раз на запрос, свежее время нужно
    // именно здесь для проверки срока членства в talent pool.
    // eslint-disable-next-line react-hooks/purity
    Date.parse(membershipRow.expires_at) <= Date.now();

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <PassportForm locale={locale} initial={passport} />
      <TalentPoolPanel
        locale={locale}
        passport={passport}
        policy={policy}
        membership={expired ? "expired" : membershipState}
        blocks={(blocks.data ?? []) as BlockedOrganization[]}
      />
    </div>
  );
}

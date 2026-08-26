import { getSupabaseServer } from "@/lib/supabase/server";
import { getLocale } from "@/lib/i18n";
import OpportunityList, { type Opportunity } from "./OpportunityList";

/**
 * Opportunity Invites кандидата (v1.2 §8.8). Приглашение — не отклик:
 * до `Accept introduction` работодатель не видит профиль, а личность и
 * контакты передаются только отдельным действием `Share & apply`.
 */
export default async function OpportunitiesPage() {
  const locale = await getLocale();
  const supabase = await getSupabaseServer();

  const { data } = await supabase.rpc("get_my_opportunity_invites");
  const opportunities = (data ?? []) as Opportunity[];

  return (
    <div className="mx-auto max-w-2xl">
      <OpportunityList locale={locale} opportunities={opportunities} />
    </div>
  );
}

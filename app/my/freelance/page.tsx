import { getSupabaseServer } from "@/lib/supabase/server";
import { getUser } from "@/lib/queries";
import { getLocale, type Locale } from "@/lib/i18n";
import { appBaseUrl } from "@/lib/career";
import PortfolioEditor, { type PortfolioData } from "./PortfolioEditor";

export default async function FreelancePage() {
  const locale: Locale = await getLocale();
  const user = await getUser();
  const supabase = await getSupabaseServer();

  const [{ data: pRow }, { data: itemRows }] = await Promise.all([
    supabase
      .from("portfolios")
      .select("display_name, tagline, about, contact_whatsapp, contact_email, token, is_public")
      .eq("user_id", user?.id ?? "")
      .maybeSingle(),
    supabase
      .from("portfolio_items")
      .select("title, description, link")
      .eq("user_id", user?.id ?? "")
      .order("sort", { ascending: true }),
  ]);

  const initial: PortfolioData = {
    display_name: pRow?.display_name ?? "",
    tagline: pRow?.tagline ?? "",
    about: pRow?.about ?? "",
    contact_whatsapp: pRow?.contact_whatsapp ?? "",
    contact_email: pRow?.contact_email ?? "",
    is_public: pRow?.is_public ?? false,
    items: (itemRows ?? []).map((it) => ({
      title: it.title ?? "",
      description: it.description ?? "",
      link: it.link ?? "",
    })),
  };

  const publicUrl = pRow?.token ? `${appBaseUrl()}/portfolio/${pRow.token}` : null;

  return (
    <PortfolioEditor
      locale={locale}
      initial={initial}
      publicUrl={publicUrl}
      defaultName={user?.email?.split("@")[0] ?? ""}
    />
  );
}

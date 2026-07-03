import { getSupabaseServer } from "@/lib/supabase/server";
import { getUser } from "@/lib/queries";
import { getLocale, type Locale } from "@/lib/i18n";
import ResumeForm, { type ResumeData } from "./ResumeForm";

export default async function ResumePage() {
  const locale: Locale = await getLocale();
  const user = await getUser();
  const supabase = await getSupabaseServer();

  const { data } = await supabase
    .from("resumes")
    .select(
      "full_name, headline, location, contact, email, about, experience, custom_fields",
    )
    .eq("user_id", user?.id ?? "")
    .maybeSingle();

  const initial = (data ?? null) as ResumeData | null;

  return (
    <ResumeForm
      locale={locale}
      initial={initial}
      defaultEmail={user?.email ?? ""}
    />
  );
}

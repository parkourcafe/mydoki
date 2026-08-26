import { getSupabaseServer } from "@/lib/supabase/server";
import { getUser } from "@/lib/queries";
import { getLocale, type Locale } from "@/lib/i18n";
import { parseSections } from "@/lib/resume";
import { withVerifiedExperience } from "@/lib/resumeLinks";
import ResumeForm, { type ResumeData } from "./ResumeForm";

export default async function ResumePage() {
  const locale: Locale = await getLocale();
  const user = await getUser();
  const supabase = await getSupabaseServer();

  const { data } = await supabase
    .from("resumes")
    .select(
      "full_name, headline, location, contact, email, about, experience, custom_fields, sections",
    )
    .eq("user_id", user?.id ?? "")
    .maybeSingle();

  // Секции разбираем на сервере: в форму приходит уже нормализованная
  // структура с честной отметкой «подтверждено» (её считает сервер по
  // employments, клиент такую отметку выставить не может).
  const initial: ResumeData | null = data
    ? {
        ...(data as Omit<ResumeData, "sections">),
        sections: await withVerifiedExperience(
          supabase,
          user?.id ?? "",
          parseSections((data as { sections?: unknown }).sections)
        ),
      }
    : null;

  return (
    <ResumeForm
      locale={locale}
      initial={initial}
      defaultEmail={user?.email ?? ""}
    />
  );
}

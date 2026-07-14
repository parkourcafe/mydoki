import { notFound, redirect } from "next/navigation";
import { getSupabaseServer } from "@/lib/supabase/server";
import { getLocale } from "@/lib/i18n";
import type { Vacancy } from "@/lib/career";
import VacancyForm from "../../new/VacancyForm";

export default async function EditVacancyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const locale = await getLocale();
  const supabase = await getSupabaseServer();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data } = await supabase
    .from("vacancies")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  const vacancy = data as Vacancy | null;
  if (!vacancy) notFound();

  // Форму редактирования открываем только владельцу вакансии (активные
  // вакансии по RLS видны всем на чтение, поэтому проверяем владение явно).
  const { data: profile } = await supabase
    .from("employer_profiles")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();
  if (!profile || vacancy.employer_id !== profile.id) notFound();

  return (
    <VacancyForm
      locale={locale}
      defaultCompany={vacancy.company_name}
      mode="edit"
      vacancyId={vacancy.id}
      initial={{
        title: vacancy.title,
        company_name: vacancy.company_name,
        location: vacancy.location,
        salary_range: vacancy.salary_range,
        schedule: vacancy.schedule,
        description: vacancy.description,
        urgency: vacancy.urgency,
        closes_at: vacancy.closes_at,
        required_documents: vacancy.required_documents ?? [],
        screening_questions: vacancy.screening_questions ?? [],
      }}
    />
  );
}

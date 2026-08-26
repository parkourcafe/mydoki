import { getSupabaseServer } from "@/lib/supabase/server";
import { getUser } from "@/lib/queries";
import { getLocale } from "@/lib/i18n";
import type { Employment } from "@/lib/employment";
import { EmploymentLetterPdf } from "@/lib/pdf/EmploymentLetterPdf";
import { pdfFileName, pdfHeaders, renderPdf } from "@/lib/pdf/render";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Справка о работе: GET /employer/employees/<id>/letter.
 *
 * Собирается из записи employments самого работодателя. Проверяем владение
 * так же, как страница сотрудника: запись должна принадлежать компании
 * текущего пользователя.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  const { id } = await params;
  const locale = await getLocale();
  const supabase = await getSupabaseServer();

  const { data: profile } = await supabase
    .from("employer_profiles")
    .select("id, company_name")
    .eq("user_id", user.id)
    .maybeSingle();
  if (!profile) return new Response("Forbidden", { status: 403 });

  const company = profile as { id: string; company_name: string };

  const { data } = await supabase
    .from("employments")
    .select("*")
    .eq("id", id)
    .eq("company_id", company.id)
    .maybeSingle();
  const employment = data as Employment | null;
  if (!employment) return new Response("Not found", { status: 404 });

  // Имя сотрудника живёт в отклике — как и на странице сотрудника.
  let employeeName = "";
  if (employment.application_id) {
    const { data: appRow } = await supabase
      .from("applications")
      .select("full_name")
      .eq("id", employment.application_id)
      .maybeSingle();
    employeeName = (appRow?.full_name as string) ?? "";
  }

  // Ссылка-подтверждение принадлежит работнику: только он её создаёт и
  // только он её видит (RLS на employment_verifications). Поэтому в копии
  // работодателя её нет — она есть в справке, которую скачивает сам работник.

  const bytes = await renderPdf(
    EmploymentLetterPdf({
      locale,
      data: {
        companyName: employment.company_name || company.company_name,
        employeeName,
        position: employment.position,
        employmentType: employment.employment_type,
        startDate: employment.start_date,
        endDate: employment.end_date,
        status: employment.status,
        issuedOn: new Date().toISOString().slice(0, 10),
        verifyUrl: null,
      },
    })
  );

  return new Response(bytes, {
    headers: pdfHeaders(pdfFileName(employeeName || employment.position, "letter")),
  });
}

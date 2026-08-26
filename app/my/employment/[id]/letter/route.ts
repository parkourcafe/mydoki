import { getSupabaseServer } from "@/lib/supabase/server";
import { getUser } from "@/lib/queries";
import { getLocale } from "@/lib/i18n";
import { appBaseUrl } from "@/lib/career";
import type { Employment } from "@/lib/employment";
import { EmploymentLetterPdf } from "@/lib/pdf/EmploymentLetterPdf";
import { pdfFileName, pdfHeaders, renderPdf } from "@/lib/pdf/render";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Справка о работе для самого работника: GET /my/employment/<id>/letter.
 *
 * Та же выписка, что скачивает работодатель, но с личной ссылкой-подтверждением,
 * если работник её уже создал: читать эти ссылки по RLS может только он.
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

  const { data } = await supabase
    .from("employments")
    .select("*")
    .eq("id", id)
    .eq("employee_user_id", user.id)
    .maybeSingle();
  const employment = data as Employment | null;
  if (!employment) return new Response("Not found", { status: 404 });

  const { data: verification } = await supabase
    .from("employment_verifications")
    .select("token")
    .eq("employment_id", employment.id)
    .is("revoked_at", null)
    .maybeSingle();
  const token = (verification?.token as string) ?? null;

  // Имя берём из резюме, если оно заполнено: в employments его нет.
  const { data: resumeRow } = await supabase
    .from("resumes")
    .select("full_name")
    .eq("user_id", user.id)
    .maybeSingle();
  const employeeName = (resumeRow?.full_name as string) ?? "";

  const bytes = await renderPdf(
    EmploymentLetterPdf({
      locale,
      data: {
        companyName: employment.company_name,
        employeeName,
        position: employment.position,
        employmentType: employment.employment_type,
        startDate: employment.start_date,
        endDate: employment.end_date,
        status: employment.status,
        issuedOn: new Date().toISOString().slice(0, 10),
        verifyUrl: token ? `${appBaseUrl()}/verify/${token}` : null,
      },
    })
  );

  return new Response(bytes, {
    headers: pdfHeaders(pdfFileName(employment.company_name, "letter")),
  });
}

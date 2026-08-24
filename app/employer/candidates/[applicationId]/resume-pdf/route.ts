import { getSupabaseServer } from "@/lib/supabase/server";
import { getUser } from "@/lib/queries";
import { getLocale } from "@/lib/i18n";
import { parseSections } from "@/lib/resume";
import { ResumePdf } from "@/lib/pdf/ResumePdf";
import { pdfFileName, pdfHeaders, renderPdf } from "@/lib/pdf/render";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * CV кандидата для работодателя: GET /employer/candidates/<id>/resume-pdf.
 *
 * Данные берём из снимка, приложенного к отклику, а не из живого резюме —
 * работодатель получает ровно то, что ему отправили. Доступ ограничивает
 * RLS таблицы application_resumes, отдельной проверки владения не нужно;
 * отозванное согласие прячет снимок так же, как документы отклика.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ applicationId: string }> }
) {
  const user = await getUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  const { applicationId } = await params;
  const locale = await getLocale();
  const supabase = await getSupabaseServer();

  const { data: appRow } = await supabase
    .from("applications")
    .select("full_name, whatsapp, email, consent_revoked_at")
    .eq("id", applicationId)
    .maybeSingle();
  if (!appRow) return new Response("Not found", { status: 404 });

  const application = appRow as {
    full_name: string;
    whatsapp: string | null;
    email: string | null;
    consent_revoked_at: string | null;
  };
  if (application.consent_revoked_at) return new Response("Not found", { status: 404 });

  const { data } = await supabase
    .from("application_resumes")
    .select("headline, location, about, sections")
    .eq("application_id", applicationId)
    .maybeSingle();
  if (!data) return new Response("Not found", { status: 404 });

  const row = data as {
    headline: string | null;
    location: string | null;
    about: string | null;
    sections: unknown;
  };

  const bytes = await renderPdf(
    ResumePdf({
      locale,
      data: {
        fullName: application.full_name,
        headline: row.headline ?? "",
        location: row.location ?? "",
        // Контакты работодатель и так видит в карточке отклика — с ними
        // скачанное CV самодостаточно.
        contact: application.whatsapp ?? "",
        email: application.email ?? "",
        about: row.about ?? "",
        legacyExperience: "",
        sections: parseSections(row.sections),
        customFields: [],
      },
    })
  );

  return new Response(bytes, {
    headers: pdfHeaders(pdfFileName(application.full_name, "resume")),
  });
}

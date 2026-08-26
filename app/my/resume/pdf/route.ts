import { getSupabaseServer } from "@/lib/supabase/server";
import { getUser } from "@/lib/queries";
import { getLocale } from "@/lib/i18n";
import { parseSections } from "@/lib/resume";
import { withVerifiedExperience } from "@/lib/resumeLinks";
import { ResumePdf } from "@/lib/pdf/ResumePdf";
import { pdfFileName, pdfHeaders, renderPdf } from "@/lib/pdf/render";

// react-pdf читает файл шрифта с диска — только Node-рантайм.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** CV кандидата одной страницей: GET /my/resume/pdf. */
export async function GET() {
  const user = await getUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  const locale = await getLocale();
  const supabase = await getSupabaseServer();

  const { data } = await supabase
    .from("resumes")
    .select(
      "full_name, headline, location, contact, email, about, experience, custom_fields, sections",
    )
    .eq("user_id", user.id)
    .maybeSingle();

  if (!data) return new Response("Not found", { status: 404 });

  const row = data as {
    full_name: string | null;
    headline: string | null;
    location: string | null;
    contact: string | null;
    email: string | null;
    about: string | null;
    experience: string | null;
    custom_fields: { label: string; value: string }[] | null;
    sections: unknown;
  };

  const bytes = await renderPdf(
    ResumePdf({
      locale,
      data: {
        fullName: row.full_name ?? "",
        headline: row.headline ?? "",
        location: row.location ?? "",
        contact: row.contact ?? "",
        email: row.email ?? user.email ?? "",
        about: row.about ?? "",
        legacyExperience: row.experience ?? "",
        sections: await withVerifiedExperience(supabase, user.id, parseSections(row.sections)),
        customFields: row.custom_fields ?? [],
      },
    }),
  );

  return new Response(bytes, {
    headers: pdfHeaders(pdfFileName(row.full_name ?? "", "resume")),
  });
}

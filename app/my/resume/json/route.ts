import { getSupabaseServer } from "@/lib/supabase/server";
import { getUser } from "@/lib/queries";
import { parseSections } from "@/lib/resume";
import { toJsonResume } from "@/lib/jsonResume";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Выгрузка резюме в открытом формате JSON Resume: GET /my/resume/json.
 * Забрать своё и открыть в другом сервисе можно без нашего участия.
 */
export async function GET() {
  const user = await getUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  const supabase = await getSupabaseServer();
  const { data } = await supabase
    .from("resumes")
    .select("full_name, headline, location, contact, email, about, sections")
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
    sections: unknown;
  };

  const doc = toJsonResume({
    full_name: row.full_name ?? "",
    headline: row.headline ?? "",
    location: row.location ?? "",
    contact: row.contact ?? "",
    email: row.email ?? user.email ?? "",
    about: row.about ?? "",
    sections: parseSections(row.sections),
  });

  return new Response(JSON.stringify(doc, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": 'attachment; filename="resume.json"',
      "Cache-Control": "no-store",
      "X-Robots-Tag": "noindex, nofollow",
    },
  });
}

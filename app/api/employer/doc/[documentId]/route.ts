import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";

/**
 * Редирект-эндпоинт к документу отклика. Свежий signed URL генерится в момент
 * доступа (TTL 120 c без изменений), поэтому F5 всегда даёт рабочую ссылку —
 * «link expired» исчезает by design (T6 / D7).
 *
 * Владение проверяется RLS: под сессией работодателя select по
 * application_documents вернёт строку только для его вакансий. Любой промах →
 * 404 (не раскрываем существование).
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ documentId: string }> }
) {
  const { documentId } = await params;
  const supabase = await getSupabaseServer();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return new NextResponse("Not found", { status: 404 });

  const { data: doc } = await supabase
    .from("application_documents")
    .select("file_path")
    .eq("id", documentId)
    .maybeSingle();
  if (!doc) return new NextResponse("Not found", { status: 404 });

  const { data: signed } = await supabase.storage
    .from("applications")
    .createSignedUrl((doc as { file_path: string }).file_path, 120);
  if (!signed?.signedUrl) return new NextResponse("Not found", { status: 404 });

  // Аудит просмотра (best-effort; карьерный контекст — household null).
  await supabase.rpc("log_audit", {
    p_household: null,
    p_action: "doc_view",
    p_entity_type: "application_document",
    p_entity_id: documentId,
    p_metadata: {},
  });

  return NextResponse.redirect(signed.signedUrl, {
    status: 302,
    headers: { "Cache-Control": "no-store" },
  });
}

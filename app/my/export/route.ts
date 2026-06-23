import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";
import { getOrCreateHouseholdId } from "@/lib/queries";

/** Экспорт всего архива семьи (метаданные) в JSON. Файлы — по signed URL отдельно. */
export async function GET() {
  const supabase = await getSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return new NextResponse("Unauthorized", { status: 401 });

  const householdId = await getOrCreateHouseholdId();

  const [members, documents, records, files] = await Promise.all([
    supabase.from("members").select("*").eq("household_id", householdId),
    supabase.from("documents").select("*").eq("household_id", householdId),
    supabase.from("records").select("*").eq("household_id", householdId),
    supabase
      .from("document_files")
      .select("id, document_id, file_name, mime_type, size_bytes, storage_path")
      .eq("household_id", householdId),
  ]);

  const payload = {
    exported_at: new Date().toISOString(),
    household_id: householdId,
    members: members.data ?? [],
    documents: documents.data ?? [],
    records: records.data ?? [],
    files: files.data ?? [],
  };

  return new NextResponse(JSON.stringify(payload, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="family-vault-export-${new Date()
        .toISOString()
        .slice(0, 10)}.json"`,
    },
  });
}

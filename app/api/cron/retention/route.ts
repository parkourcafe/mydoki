import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

// Ежедневный крон: обезличивает отклонённые отклики старше срока хранения
// компании (RPC run_application_retention) и удаляет их файлы из storage.
// Fail-closed по CRON_SECRET. Личные документы кандидата в vault не трогаются.
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const admin = getSupabaseAdmin();
  if (!admin)
    return NextResponse.json(
      { error: "SUPABASE_SERVICE_ROLE_KEY не задан" },
      { status: 500 }
    );

  const { data, error } = await admin.rpc("run_application_retention");
  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });

  const result = (data ?? { count: 0, files: [] }) as {
    count: number;
    files: string[];
  };

  // Удаляем осиротевшие файлы из приватного bucket applications.
  if (result.files?.length) {
    await admin.storage.from("applications").remove(result.files).catch(() => {});
  }

  return NextResponse.json({ anonymized: result.count, filesRemoved: result.files?.length ?? 0 });
}

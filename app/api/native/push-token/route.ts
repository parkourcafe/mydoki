import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";

// Приём APNs/FCM-токена из нативной обёртки (Capacitor). Сохраняем токен под
// текущего пользователя, чтобы серверная рассылка (напоминания о сроках,
// новые отклики) могла слать пуш на устройство. Токен уникален: upsert по нему
// переносит устройство на актуального пользователя.
export async function POST(request: Request) {
  const supabase = await getSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: { token?: unknown; platform?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  const token = typeof body.token === "string" ? body.token.trim() : "";
  if (!token || token.length > 512) {
    return NextResponse.json({ error: "bad_token" }, { status: 400 });
  }
  const platform = body.platform === "android" ? "android" : "ios";

  const { error } = await supabase.from("native_push_tokens").upsert(
    {
      user_id: user.id,
      token,
      platform,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "token" }
  );
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}

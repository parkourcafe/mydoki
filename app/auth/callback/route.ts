import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";
import { recordLogin } from "@/lib/loginEvents";
import { safeNextPath } from "@/lib/nextPath";

export const dynamic = "force-dynamic";

/**
 * Возврат после Google OAuth. Обмен кода на сессию делаем здесь, на сервере:
 * @supabase/ssr хранит PKCE code-verifier в cookie, поэтому серверный клиент
 * может завершить обмен. Это убирает гонку с detectSessionInUrl, из-за которой
 * клиентский обмен падал ("Не удалось завершить вход через Google").
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = safeNextPath(url.searchParams.get("next"));

  // За прокси Vercel реальный хост — в x-forwarded-host (origin запроса может
  // указывать на внутренний адрес балансировщика).
  const forwardedHost = request.headers.get("x-forwarded-host");
  const forwardedProto = request.headers.get("x-forwarded-proto") ?? "https";
  const base =
    process.env.NODE_ENV !== "development" && forwardedHost
      ? `${forwardedProto}://${forwardedHost}`
      : url.origin;

  if (!code) {
    return NextResponse.redirect(`${base}/login?error=google`);
  }

  const supabase = await getSupabaseServer();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return NextResponse.redirect(`${base}/login?error=google`);
  }

  try {
    await recordLogin(supabase);
  } catch {
    // журнал входа не должен мешать самому входу
  }

  return NextResponse.redirect(`${base}${next}`);
}

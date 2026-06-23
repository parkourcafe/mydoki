import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";
import { recordLogin } from "@/lib/loginEvents";

/**
 * Возврат после OAuth (Google): меняем код на сессию, пишем вход, уводим в кабинет.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/my";

  if (code) {
    const supabase = await getSupabaseServer();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      await recordLogin(supabase);
      return NextResponse.redirect(`${origin}${next}`);
    }
  }
  return NextResponse.redirect(`${origin}/login?error=oauth`);
}

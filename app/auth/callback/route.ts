import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { recordLogin } from "@/lib/loginEvents";

/**
 * Возврат после OAuth (Google): меняем код на сессию и пишем cookie сессии
 * напрямую в redirect-ответ (иначе они не доезжают до браузера), затем — в кабинет.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/my";

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=oauth`);
  }

  const cookieStore = await cookies();
  const response = NextResponse.redirect(`${origin}${next}`);

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(
          cookiesToSet: { name: string; value: string; options?: any }[]
        ) {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return NextResponse.redirect(`${origin}/login?error=oauth`);
  }

  await recordLogin(supabase);
  return response;
}

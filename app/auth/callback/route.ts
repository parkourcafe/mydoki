import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { recordLogin } from "@/lib/loginEvents";
import { safeNextPath } from "@/lib/nextPath";

export const dynamic = "force-dynamic";

/**
 * Возврат после Google OAuth. Обмен кода на сессию делаем здесь, на сервере:
 * @supabase/ssr хранит PKCE code-verifier в cookie, поэтому серверный клиент
 * может завершить обмен.
 *
 * ВАЖНО: redirect-ответ создаём заранее и пишем cookie сессии ПРЯМО в него.
 * Если выставлять cookie через next/headers и возвращать NextResponse.redirect,
 * на Vercel заголовки Set-Cookie не всегда попадают в redirect-ответ — сессия
 * теряется, и пользователя выкидывает обратно как гостя.
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

  const response = NextResponse.redirect(`${base}${next}`);
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options?: any }[]) {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return NextResponse.redirect(`${base}/login?error=google`);
  }

  try {
    await recordLogin(supabase);
  } catch {
    // журнал входа не должен мешать самому входу
  }

  return response;
}

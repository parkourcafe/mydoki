import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Публичные страницы, у которых есть markdown-версия для ИИ-агентов.
const MD_PATHS = new Set(["/"]);

/** Обновляет сессию Supabase в кабинете; гостям лендинга — markdown по запросу. */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Markdown negotiation: агент просит text/markdown — отдаём markdown-версию
  // публичной страницы вместо HTML (внутренний rewrite, URL не меняется).
  if (
    request.method === "GET" &&
    MD_PATHS.has(pathname) &&
    (request.headers.get("accept") || "").includes("text/markdown")
  ) {
    const url = request.nextUrl.clone();
    url.pathname = "/api/md";
    return NextResponse.rewrite(url);
  }

  // Сессию Supabase обновляем только в кабинете; публичные страницы (включая
  // главную из matcher ниже) сюда доходят только для markdown-проверки выше.
  if (!pathname.startsWith("/my")) {
    return NextResponse.next({ request });
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(
          cookiesToSet: { name: string; value: string; options?: any }[]
        ) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  await supabase.auth.getUser();
  return response;
}

export const config = {
  // Кабинет — для обновления сессии; "/" — чтобы перехватить запрос агента на
  // markdown-версию главной (обычные запросы выходят сразу, без Supabase).
  matcher: ["/my/:path*", "/"],
};

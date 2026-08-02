import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Публичные страницы, у которых есть markdown-версия для ИИ-агентов.
const MD_PATHS = new Set(["/"]);

// Языковой префикс в URL: /ru, /en/security, /id/for/medical …
const LOCALE_RE = /^\/(ru|en|id|uz)(\/.*)?$/;

/**
 * Делает три вещи:
 *  1) Локализованные URL: /ru, /en/… → внутренний rewrite на без-префиксный путь,
 *     язык кладём в заголовок x-locale и cookie (для hreflang/SEO);
 *  2) кладёт x-pathname/x-orig-path для метаданных (canonical + hreflang);
 *  3) обновляет сессию Supabase в кабинете и отдаёт markdown агентам.
 */
// Пути карьерного модуля, которые обслуживает домен doki.id.
const CAREER_PREFIXES = ["/apply", "/applications", "/employer", "/login", "/auth", "/hiring"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 0) Домен doki.id — второй домен на том же деплое, отдаёт только карьерные
  //    маршруты. Корень → лендинг /hiring; всё остальное не-карьерное → 308 на
  //    канонический хост (D1/D2).
  const host = request.headers.get("host") ?? "";
  if (host.endsWith("doki.id")) {
    if (pathname === "/") {
      const url = request.nextUrl.clone();
      url.pathname = "/hiring";
      return NextResponse.rewrite(url);
    }
    // Учитываем возможный языковой префикс (/id/apply → /apply).
    const lm = pathname.match(LOCALE_RE);
    const bare = lm ? (lm[2] && lm[2].length > 0 ? lm[2] : "/") : pathname;
    const isCareer = CAREER_PREFIXES.some(
      (p) => bare.startsWith(p) || pathname.startsWith(p)
    );
    if (!isCareer) {
      // Сразу на www — иначе цепочка редиректов через apex ниже.
      return NextResponse.redirect(
        `https://www.doki.help${pathname}${request.nextUrl.search}`,
        308
      );
    }
    // Карьерный путь на doki.id — падаем в обычную обработку ниже.
  }

  const requestHost = host.split(":")[0].toLowerCase();
  if (requestHost === "doki.help") {
    const url = request.nextUrl.clone();
    url.hostname = "www.doki.help";
    url.protocol = "https";
    return NextResponse.redirect(url, 308);
  }

  const localeMatch = pathname.match(LOCALE_RE);
  const effectivePath = localeMatch
    ? localeMatch[2] && localeMatch[2].length > 0
      ? localeMatch[2]
      : "/"
    : pathname;

  const isRuOnlyPublicPage =
    effectivePath.startsWith("/keep/") || effectivePath === "/vs/gosuslugi";
  if (isRuOnlyPublicPage && localeMatch?.[1] !== "ru") {
    const url = request.nextUrl.clone();
    url.pathname = `/ru${effectivePath}`;
    return NextResponse.redirect(url, 308);
  }

  // 1) Языковой префикс — переписываем на без-префиксный путь.
  const m = localeMatch;
  if (m) {
    const locale = m[1];
    const rest = m[2] && m[2].length > 0 ? m[2] : "/";
    const url = request.nextUrl.clone();
    url.pathname = rest;

    const headers = new Headers(request.headers);
    headers.set("x-locale", locale);
    headers.set("x-pathname", rest);
    headers.set("x-orig-path", pathname);

    const res = NextResponse.rewrite(url, { request: { headers } });
    // Чтобы дальнейшая навигация без префикса осталась на том же языке.
    res.cookies.set("locale", locale, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      sameSite: "lax",
    });
    return res;
  }

  // 2) Markdown negotiation: агент просит text/markdown — отдаём markdown-версию.
  if (
    request.method === "GET" &&
    MD_PATHS.has(pathname) &&
    (request.headers.get("accept") || "").includes("text/markdown")
  ) {
    const url = request.nextUrl.clone();
    url.pathname = "/api/md";
    return NextResponse.rewrite(url);
  }

  // Заголовки пути для метаданных (canonical/hreflang) на публичных страницах.
  const headers = new Headers(request.headers);
  headers.set("x-pathname", pathname);
  headers.set("x-orig-path", pathname);

  // 3) Сессию Supabase обновляем в кабинете и разделе работодателя.
  if (!pathname.startsWith("/my") && !pathname.startsWith("/employer")) {
    return NextResponse.next({ request: { headers } });
  }

  let response = NextResponse.next({ request: { headers } });

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
          response = NextResponse.next({ request: { headers } });
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
  // Все «страничные» пути (кроме _next, api и файлов с расширением).
  matcher: ["/((?!_next/|api/|.*\\.[a-zA-Z0-9]+$).*)"],
};

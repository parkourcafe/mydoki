"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import { recordCurrentLogin } from "@/app/login/actions";
import type { Locale } from "@/lib/i18n";

const M = {
  ru: { signing: "Входим…", fail: "Не удалось завершить вход через Google.", back: "Вернуться ко входу" },
  en: { signing: "Signing in…", fail: "Couldn't complete Google sign-in.", back: "Back to sign in" },
  id: { signing: "Masuk…", fail: "Gagal menyelesaikan masuk dengan Google.", back: "Kembali ke halaman masuk" },
  uz: { signing: "Kirilmoqda…", fail: "Google orqali kirishni yakunlab boʻlmadi.", back: "Kirish sahifasiga qaytish" },
} as const;

/** Язык интерфейса на клиенте: из cookie `locale`, иначе по языку браузера. */
function detectLocale(): Locale {
  const m =
    typeof document !== "undefined" &&
    document.cookie.match(/(?:^|;\s*)locale=([^;]+)/);
  const fromCookie = m ? (decodeURIComponent(m[1]) as Locale) : undefined;
  if (fromCookie && ["ru", "en", "id", "uz"].includes(fromCookie)) return fromCookie;
  const lang =
    typeof navigator !== "undefined" ? navigator.language.toLowerCase() : "";
  if (lang.startsWith("ru")) return "ru";
  if (lang.startsWith("id")) return "id";
  if (lang.startsWith("uz")) return "uz";
  return "en";
}

/**
 * Возврат после OAuth (Google). Обмен кода на сессию делаем в браузере:
 * PKCE code-verifier хранится у браузерного клиента, поэтому только он может
 * завершить обмен. После успеха клиент сам пишет cookie сессии → уходим в кабинет.
 */
export default function AuthCallbackPage() {
  const router = useRouter();
  const ran = useRef(false);
  const [error, setError] = useState(false);
  const [locale, setLocale] = useState<Locale>("ru");
  const t = M[locale];

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    setLocale(detectLocale());

    (async () => {
      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");
      if (!code) {
        setError(true);
        return;
      }
      const supabase = getSupabaseBrowser();
      const { error: exErr } = await supabase.auth.exchangeCodeForSession(code);
      if (exErr) {
        setError(true);
        return;
      }
      // сессия установлена (cookie записаны браузерным клиентом)
      try {
        await recordCurrentLogin();
      } catch {
        // журнал входа не должен мешать
      }
      // Куда вернуться (например, к принятию приглашения) — из sessionStorage.
      let dest = "/my";
      try {
        const stored = sessionStorage.getItem("postLoginNext");
        sessionStorage.removeItem("postLoginNext");
        if (stored && stored.startsWith("/") && !stored.startsWith("//")) {
          dest = stored;
        }
      } catch {
        // storage недоступен — уходим в кабинет
      }
      router.replace(dest);
    })();
  }, [router]);

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="text-center">
        {error ? (
          <>
            <div className="mb-2 text-4xl">😕</div>
            <p className="text-slate-600">{t.fail}</p>
            <button
              onClick={() => router.replace("/login")}
              className="btn-primary mt-4"
            >
              {t.back}
            </button>
          </>
        ) : (
          <>
            <div className="mb-2 text-4xl">🔐</div>
            <p className="text-slate-600">{t.signing}</p>
          </>
        )}
      </div>
    </main>
  );
}

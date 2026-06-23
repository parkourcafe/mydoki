"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import { recordCurrentLogin } from "@/app/login/actions";

/**
 * Возврат после OAuth (Google). Обмен кода на сессию делаем в браузере:
 * PKCE code-verifier хранится у браузерного клиента, поэтому только он может
 * завершить обмен. После успеха клиент сам пишет cookie сессии → уходим в кабинет.
 */
export default function AuthCallbackPage() {
  const router = useRouter();
  const ran = useRef(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

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
      router.replace("/my");
    })();
  }, [router]);

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="text-center">
        {error ? (
          <>
            <div className="mb-2 text-4xl">😕</div>
            <p className="text-slate-600">
              Не удалось завершить вход через Google.
            </p>
            <button
              onClick={() => router.replace("/login")}
              className="btn-primary mt-4"
            >
              Вернуться ко входу
            </button>
          </>
        ) : (
          <>
            <div className="mb-2 text-4xl">🔐</div>
            <p className="text-slate-600">Входим…</p>
          </>
        )}
      </div>
    </main>
  );
}

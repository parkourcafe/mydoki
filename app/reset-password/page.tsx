"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowser } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [supabase] = useState(() => getSupabaseBrowser());
  const [ready, setReady] = useState(false);
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    // Ссылка из письма содержит recovery-токен — клиент сам обменяет его на сессию.
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (session || event === "PASSWORD_RECOVERY") setReady(true);
    });
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
    });
    return () => sub.subscription.unsubscribe();
  }, [supabase]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    if (pw.length < 8) {
      setErr("Пароль должен быть от 8 символов.");
      return;
    }
    if (pw !== pw2) {
      setErr("Пароли не совпадают.");
      return;
    }
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password: pw });
    if (error) {
      setErr(error.message);
      setBusy(false);
      return;
    }
    setDone(true);
    setTimeout(() => router.push("/my"), 1200);
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mb-2 text-4xl">🔐</div>
          <h1 className="text-2xl font-semibold text-slate-900">Новый пароль</h1>
        </div>
        <div className="card">
          {done ? (
            <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
              Пароль обновлён. Перенаправляем в кабинет…
            </p>
          ) : !ready ? (
            <p className="text-sm text-slate-500">
              Открыли эту страницу не по ссылке из письма? Запросите сброс пароля
              заново на странице входа. Ссылка действует ограниченное время.
            </p>
          ) : (
            <form onSubmit={submit} className="space-y-4">
              <div>
                <label className="label" htmlFor="pw">
                  Новый пароль
                </label>
                <input
                  id="pw"
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={8}
                  value={pw}
                  onChange={(e) => setPw(e.target.value)}
                  className="input"
                  placeholder="••••••••"
                />
              </div>
              <div>
                <label className="label" htmlFor="pw2">
                  Повторите пароль
                </label>
                <input
                  id="pw2"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={pw2}
                  onChange={(e) => setPw2(e.target.value)}
                  className="input"
                  placeholder="••••••••"
                />
              </div>
              {err && (
                <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                  {err}
                </p>
              )}
              <button type="submit" disabled={busy} className="btn-primary w-full">
                {busy ? "Сохраняю…" : "Сохранить пароль"}
              </button>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}

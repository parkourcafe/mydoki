"use client";

import { useActionState, useState } from "react";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import { login, signup, type AuthState } from "./actions";

const initial: AuthState = {};

function GoogleButton() {
  async function google() {
    const supabase = getSupabaseBrowser();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  }
  return (
    <button
      type="button"
      onClick={google}
      className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
    >
      <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
        <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62z" />
        <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 0 0 9 18z" />
        <path fill="#FBBC05" d="M3.97 10.72a5.4 5.4 0 0 1 0-3.44V4.95H.96a9 9 0 0 0 0 8.1l3.01-2.33z" />
        <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58A9 9 0 0 0 .96 4.95l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58z" />
      </svg>
      Войти через Google
    </button>
  );
}

function ResetRequest({ onBack }: { onBack: () => void }) {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    if (!email.trim()) {
      setErr("Введите email.");
      return;
    }
    setBusy(true);
    const supabase = getSupabaseBrowser();
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setBusy(false);
    if (error) setErr(error.message);
    else setSent(true);
  }

  if (sent) {
    return (
      <div className="space-y-4 text-sm">
        <p className="rounded-lg bg-emerald-50 px-3 py-2 text-emerald-700">
          Если такой email есть — мы отправили ссылку для сброса пароля.
          Проверьте почту (и папку «Спам»).
        </p>
        <button onClick={onBack} className="font-medium text-brand-600 hover:underline">
          ← Вернуться ко входу
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <p className="text-sm text-slate-500">
        Укажите email — пришлём ссылку, чтобы задать новый пароль.
      </p>
      <div>
        <label className="label" htmlFor="reset-email">
          Email
        </label>
        <input
          id="reset-email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="input"
          placeholder="you@example.com"
        />
      </div>
      {err && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{err}</p>
      )}
      <button type="submit" disabled={busy} className="btn-primary w-full">
        {busy ? "Отправляю…" : "Прислать ссылку"}
      </button>
      <p className="text-center text-sm">
        <button
          type="button"
          onClick={onBack}
          className="font-medium text-brand-600 hover:underline"
        >
          ← Вернуться ко входу
        </button>
      </p>
    </form>
  );
}

export default function LoginForm() {
  const [mode, setMode] = useState<"login" | "signup" | "reset">("login");
  const action = mode === "signup" ? signup : login;
  const [state, formAction, pending] = useActionState(action, initial);

  if (mode === "reset") return <ResetRequest onBack={() => setMode("login")} />;

  return (
    <div className="space-y-4">
      <GoogleButton />

      <div className="flex items-center gap-3 text-xs text-slate-400">
        <span className="h-px flex-1 bg-slate-200" /> или{" "}
        <span className="h-px flex-1 bg-slate-200" />
      </div>

      <form action={formAction} className="space-y-4">
        <div>
          <label className="label" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className="input"
            placeholder="you@example.com"
          />
        </div>
        <div>
          <div className="flex items-center justify-between">
            <label className="label" htmlFor="password">
              Пароль
            </label>
            {mode === "login" && (
              <button
                type="button"
                onClick={() => setMode("reset")}
                className="text-xs font-medium text-brand-600 hover:underline"
              >
                Забыли пароль?
              </button>
            )}
          </div>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            required
            minLength={mode === "signup" ? 8 : undefined}
            className="input"
            placeholder="••••••••"
          />
        </div>

        {mode === "signup" && (
          <label className="flex items-start gap-2 text-xs text-slate-500">
            <input type="checkbox" required className="mt-0.5" />
            <span>
              Я принимаю{" "}
              <a href="/terms" target="_blank" className="text-brand-600 hover:underline">
                Условия
              </a>{" "}
              и{" "}
              <a href="/privacy" target="_blank" className="text-brand-600 hover:underline">
                Политику конфиденциальности
              </a>{" "}
              и даю согласие на обработку персональных данных.
            </span>
          </label>
        )}

        {state.error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {state.error}
          </p>
        )}
        {state.message && (
          <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
            {state.message}
          </p>
        )}

        <button type="submit" disabled={pending} className="btn-primary w-full">
          {pending
            ? "Минутку…"
            : mode === "login"
              ? "Войти"
              : "Создать аккаунт"}
        </button>

        <p className="text-center text-sm text-slate-500">
          {mode === "login" ? "Нет аккаунта? " : "Уже есть аккаунт? "}
          <button
            type="button"
            onClick={() => setMode(mode === "login" ? "signup" : "login")}
            className="font-medium text-brand-600 hover:underline"
          >
            {mode === "login" ? "Зарегистрироваться" : "Войти"}
          </button>
        </p>
      </form>
    </div>
  );
}

"use client";

import { useActionState, useState } from "react";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import { login, signup, type AuthState } from "./actions";

const initial: AuthState = {};

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
  );
}

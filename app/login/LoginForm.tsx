"use client";

import { useActionState, useState } from "react";
import { login, signup, type AuthState } from "./actions";

const initial: AuthState = {};

export default function LoginForm() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const action = mode === "login" ? login : signup;
  const [state, formAction, pending] = useActionState(action, initial);

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
        <label className="label" htmlFor="password">
          Пароль
        </label>
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

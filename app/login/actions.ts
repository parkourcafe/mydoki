"use server";

import { redirect } from "next/navigation";
import { getSupabaseServer } from "@/lib/supabase/server";
import { recordLogin } from "@/lib/loginEvents";
import { getLocale } from "@/lib/i18n";

export type AuthState = { error?: string; message?: string };

const M = {
  ru: {
    missingCredentials: "Введите email и пароль.",
    signupRequirements: "Email и пароль (от 8 символов) обязательны.",
    confirmEmail:
      "Аккаунт создан. Подтвердите email по ссылке из письма, затем войдите.",
  },
  en: {
    missingCredentials: "Enter your email and password.",
    signupRequirements: "Email and password (at least 8 characters) are required.",
    confirmEmail:
      "Account created. Confirm your email via the link we sent, then sign in.",
  },
  id: {
    missingCredentials: "Masukkan email dan kata sandi Anda.",
    signupRequirements: "Email dan kata sandi (minimal 8 karakter) wajib diisi.",
    confirmEmail:
      "Akun berhasil dibuat. Konfirmasikan email Anda melalui tautan yang kami kirim, lalu masuk.",
  },
} as const;

/** Записать текущий вход в журнал (вызывается после клиентского OAuth-обмена). */
export async function recordCurrentLogin() {
  const supabase = await getSupabaseServer();
  await recordLogin(supabase);
}

export async function login(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  const t = M[await getLocale()];
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) return { error: t.missingCredentials };

  const supabase = await getSupabaseServer();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: error.message };
  await recordLogin(supabase);
  redirect("/my");
}

export async function signup(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  const t = M[await getLocale()];
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!email || password.length < 8)
    return { error: t.signupRequirements };

  const supabase = await getSupabaseServer();
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) return { error: error.message };

  if (!data.session) {
    return {
      message: t.confirmEmail,
    };
  }
  await recordLogin(supabase);
  redirect("/my");
}

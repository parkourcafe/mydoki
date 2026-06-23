"use server";

import { redirect } from "next/navigation";
import { getSupabaseServer } from "@/lib/supabase/server";
import { recordLogin } from "@/lib/loginEvents";

export type AuthState = { error?: string; message?: string };

export async function login(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) return { error: "Введите email и пароль." };

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
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!email || password.length < 8)
    return { error: "Email и пароль (от 8 символов) обязательны." };

  const supabase = await getSupabaseServer();
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) return { error: error.message };

  if (!data.session) {
    return {
      message:
        "Аккаунт создан. Подтвердите email по ссылке из письма, затем войдите.",
    };
  }
  await recordLogin(supabase);
  redirect("/my");
}

"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { hashSharePassword, shareCookieName } from "@/lib/shareAccess";

/** Ввод пароля share-ссылки: хэшируем, кладём в cookie, перезагружаем. */
export async function unlockShare(formData: FormData) {
  const token = String(formData.get("token") ?? "");
  const password = String(formData.get("password") ?? "");
  const scope = String(formData.get("scope") ?? "s"); // s | pkg
  if (!token) return;
  const hash = hashSharePassword(password);
  if (hash) {
    const store = await cookies();
    store.set(shareCookieName(token), hash, {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 60 * 30,
      path: "/",
    });
  }
  redirect(`/${scope === "pkg" ? "pkg" : "s"}/${token}`);
}

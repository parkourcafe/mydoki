"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import type { Locale } from "@/lib/i18n";

const M = {
  ru: {
    heading: "Новый пароль",
    pwTooShort: "Пароль должен быть от 8 символов.",
    pwMismatch: "Пароли не совпадают.",
    updated: "Пароль обновлён. Перенаправляем в кабинет…",
    notFromLink:
      "Открыли эту страницу не по ссылке из письма? Запросите сброс пароля заново на странице входа. Ссылка действует ограниченное время.",
    newPassword: "Новый пароль",
    repeatPassword: "Повторите пароль",
    saving: "Сохраняю…",
    savePassword: "Сохранить пароль",
  },
  en: {
    heading: "New password",
    pwTooShort: "Password must be at least 8 characters.",
    pwMismatch: "Passwords don't match.",
    updated: "Password updated. Redirecting to your account…",
    notFromLink:
      "Opened this page without the link from the email? Request a password reset again on the sign-in page. The link is valid for a limited time.",
    newPassword: "New password",
    repeatPassword: "Repeat password",
    saving: "Saving…",
    savePassword: "Save password",
  },
  id: {
    heading: "Kata sandi baru",
    pwTooShort: "Kata sandi harus terdiri dari minimal 8 karakter.",
    pwMismatch: "Kata sandi tidak cocok.",
    updated: "Kata sandi diperbarui. Mengalihkan ke akun Anda…",
    notFromLink:
      "Membuka halaman ini tanpa tautan dari email? Minta pengaturan ulang kata sandi lagi di halaman masuk. Tautan ini berlaku untuk waktu terbatas.",
    newPassword: "Kata sandi baru",
    repeatPassword: "Ulangi kata sandi",
    saving: "Menyimpan…",
    savePassword: "Simpan kata sandi",
  },
  uz: {
    heading: "Yangi parol",
    pwTooShort: "Parol kamida 8 ta belgidan iborat boʻlishi kerak.",
    pwMismatch: "Parollar mos kelmaydi.",
    updated: "Parol yangilandi. Hisobingizga yoʻnaltirilmoqda…",
    notFromLink:
      "Bu sahifani emaildagi havolasiz ochdingizmi? Kirish sahifasida parolni tiklashni qaytadan soʻrang. Havola cheklangan vaqt davomida amal qiladi.",
    newPassword: "Yangi parol",
    repeatPassword: "Parolni takrorlang",
    saving: "Saqlanmoqda…",
    savePassword: "Parolni saqlash",
  },
} as const;

export default function ResetPasswordPage() {
  const router = useRouter();
  const [supabase] = useState(() => getSupabaseBrowser());
  const [locale, setLocale] = useState<Locale>("en");
  const t = M[locale];
  const [ready, setReady] = useState(false);
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const fromCookie = /(?:^|;\s*)locale=(ru|en)/.exec(document.cookie)?.[1];
    if (fromCookie === "ru" || fromCookie === "en") setLocale(fromCookie);
    else setLocale(navigator.language.startsWith("ru") ? "ru" : "en");
  }, []);

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
      setErr(t.pwTooShort);
      return;
    }
    if (pw !== pw2) {
      setErr(t.pwMismatch);
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
          <h1 className="text-2xl font-semibold text-slate-900">{t.heading}</h1>
        </div>
        <div className="card">
          {done ? (
            <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
              {t.updated}
            </p>
          ) : !ready ? (
            <p className="text-sm text-slate-500">
              {t.notFromLink}
            </p>
          ) : (
            <form onSubmit={submit} className="space-y-4">
              <div>
                <label className="label" htmlFor="pw">
                  {t.newPassword}
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
                  {t.repeatPassword}
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
                {busy ? t.saving : t.savePassword}
              </button>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}

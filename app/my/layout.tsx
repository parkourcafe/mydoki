import Link from "next/link";
import { redirect } from "next/navigation";
import { getSupabaseServer } from "@/lib/supabase/server";
import { getUser } from "@/lib/queries";
import { signOut } from "./actions";

export default async function MyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUser();
  if (!user) redirect("/login");

  // Статус 2FA: есть ли подтверждённый TOTP-фактор
  const supabase = await getSupabaseServer();
  const { data: factors } = await supabase.auth.mfa.listFactors();
  const hasMfa = (factors?.totp ?? []).some((f) => f.status === "verified");

  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <Link href="/my" className="flex items-center gap-2 font-semibold">
            <span className="text-xl">🔐</span> Family Vault
          </Link>
          <nav className="flex items-center gap-1 text-sm">
            <Link href="/my" className="rounded-lg px-3 py-1.5 hover:bg-slate-100">
              Семья
            </Link>
            <Link
              href="/my/search"
              className="rounded-lg px-3 py-1.5 hover:bg-slate-100"
            >
              Поиск
            </Link>
            <Link
              href="/my/reminders"
              className="rounded-lg px-3 py-1.5 hover:bg-slate-100"
            >
              Сроки
            </Link>
            <Link
              href="/my/family"
              className="rounded-lg px-3 py-1.5 hover:bg-slate-100"
            >
              Доступ
            </Link>
            <Link
              href="/my/security"
              className="rounded-lg px-3 py-1.5 hover:bg-slate-100"
            >
              Безопасность
            </Link>
            <form action={signOut}>
              <button className="rounded-lg px-3 py-1.5 text-slate-500 hover:bg-slate-100">
                Выйти
              </button>
            </form>
          </nav>
        </div>
      </header>

      {!hasMfa && (
        <div className="border-b border-amber-200 bg-amber-50">
          <div className="mx-auto max-w-5xl px-4 py-2 text-sm text-amber-800">
            ⚠️ Двухфакторная защита не настроена.{" "}
            <Link href="/my/security" className="font-medium underline">
              Включить 2FA
            </Link>{" "}
            — это рекомендуется для документов.
          </div>
        </div>
      )}

      <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
    </div>
  );
}

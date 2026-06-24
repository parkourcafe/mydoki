import Link from "next/link";
import { redirect } from "next/navigation";
import { getSupabaseServer } from "@/lib/supabase/server";
import { getUser, getOrCreateHouseholdId, listSpaces } from "@/lib/queries";
import { signOut } from "./actions";
import SpaceSwitcher from "@/components/SpaceSwitcher";

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

  const [spaces, activeId] = await Promise.all([
    listSpaces(),
    getOrCreateHouseholdId(),
  ]);

  return (
    <div className="min-h-screen">
      <header className="border-b border-[#e8e0d5] bg-[#fdfaf5]">
        <div className="mx-auto max-w-5xl px-4">
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
              <Link href="/my" className="flex items-center gap-2 font-semibold">
                <span className="text-xl">🔐</span>
                <span className="hidden sm:inline">Семейный сейф</span>
              </Link>
              <SpaceSwitcher spaces={spaces} activeId={activeId} />
            </div>
            <div className="flex items-center gap-3">
              <span className="hidden text-xs text-slate-500 sm:inline">
                {user.email}
              </span>
              <form action={signOut}>
                <button className="rounded-lg px-3 py-1.5 text-sm text-slate-500 hover:bg-[#f0e6d9]">
                  Выйти
                </button>
              </form>
            </div>
          </div>
          <nav className="-mx-4 flex gap-1 overflow-x-auto whitespace-nowrap px-4 pb-2 text-sm">
            <Link href="/my" className="shrink-0 rounded-lg px-3 py-1.5 hover:bg-[#f0e6d9]">
              Семья
            </Link>
            <Link href="/my/assets" className="shrink-0 rounded-lg px-3 py-1.5 hover:bg-[#f0e6d9]">
              Имущество
            </Link>
            <Link href="/my/search" className="shrink-0 rounded-lg px-3 py-1.5 hover:bg-[#f0e6d9]">
              Поиск
            </Link>
            <Link href="/my/reminders" className="shrink-0 rounded-lg px-3 py-1.5 hover:bg-[#f0e6d9]">
              Сроки
            </Link>
            <Link href="/my/family" className="shrink-0 rounded-lg px-3 py-1.5 hover:bg-[#f0e6d9]">
              Доступ
            </Link>
            <Link href="/my/security" className="shrink-0 rounded-lg px-3 py-1.5 hover:bg-[#f0e6d9]">
              Безопасность
            </Link>
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

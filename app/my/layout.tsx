import Link from "next/link";
import { redirect } from "next/navigation";
import { getSupabaseServer } from "@/lib/supabase/server";
import { getUser, getOrCreateHouseholdId, listSpaces } from "@/lib/queries";
import { getLocale } from "@/lib/i18n";
import { signOut } from "./actions";
import SpaceSwitcher from "@/components/SpaceSwitcher";
import SignOutButton from "@/components/SignOutButton";

const M = {
  ru: {
    brand: "Семейный сейф",
    signOut: "Выйти",
    family: "Семья",
    assets: "Имущество",
    search: "Поиск",
    reminders: "Сроки",
    access: "Доступ",
    security: "Безопасность",
    offline: "Офлайн",
    mfaWarning: "⚠️ Двухфакторная защита не настроена.",
    enable2fa: "Включить 2FA",
    mfaRecommend: "— это рекомендуется для документов.",
  },
  en: {
    brand: "Family vault",
    signOut: "Sign out",
    family: "Family",
    assets: "Assets",
    search: "Search",
    reminders: "Deadlines",
    access: "Access",
    security: "Security",
    offline: "Offline",
    mfaWarning: "⚠️ Two-factor protection is not set up.",
    enable2fa: "Enable 2FA",
    mfaRecommend: "— recommended for your documents.",
  },
  uz: {
    brand: "Oilaviy seyf",
    signOut: "Chiqish",
    family: "Oila",
    assets: "Mulk",
    search: "Qidiruv",
    reminders: "Muddatlar",
    access: "Kirish huquqi",
    security: "Xavfsizlik",
    offline: "Oflayn",
    mfaWarning: "⚠️ Ikki bosqichli himoya sozlanmagan.",
    enable2fa: "2FA ni yoqish",
    mfaRecommend: "— hujjatlaringiz uchun tavsiya etiladi.",
  },
  id: {
    brand: "Brankas keluarga",
    signOut: "Keluar",
    family: "Keluarga",
    assets: "Aset",
    search: "Cari",
    reminders: "Tenggat waktu",
    access: "Akses",
    security: "Keamanan",
    offline: "Offline",
    mfaWarning: "⚠️ Proteksi dua faktor belum diatur.",
    enable2fa: "Aktifkan 2FA",
    mfaRecommend: "— direkomendasikan untuk dokumen Anda.",
  },
} as const;

export default async function MyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const t = M[locale];

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
                <span className="hidden sm:inline">{t.brand}</span>
              </Link>
              <SpaceSwitcher spaces={spaces} activeId={activeId} locale={locale} />
            </div>
            <div className="flex items-center gap-3">
              <span className="hidden text-xs text-slate-500 sm:inline">
                {user.email}
              </span>
              <form action={signOut}>
                <SignOutButton
                  label={t.signOut}
                  className="rounded-lg px-3 py-1.5 text-sm text-slate-500 hover:bg-[#f0e6d9] disabled:opacity-60"
                />
              </form>
            </div>
          </div>
          <nav className="-mx-4 flex gap-1 overflow-x-auto whitespace-nowrap px-4 pb-2 text-sm">
            <Link href="/my" className="shrink-0 rounded-lg px-3 py-1.5 hover:bg-[#f0e6d9]">
              {t.family}
            </Link>
            <Link href="/my/assets" className="shrink-0 rounded-lg px-3 py-1.5 hover:bg-[#f0e6d9]">
              {t.assets}
            </Link>
            <Link href="/my/search" className="shrink-0 rounded-lg px-3 py-1.5 hover:bg-[#f0e6d9]">
              {t.search}
            </Link>
            <Link href="/my/reminders" className="shrink-0 rounded-lg px-3 py-1.5 hover:bg-[#f0e6d9]">
              {t.reminders}
            </Link>
            <Link href="/my/family" className="shrink-0 rounded-lg px-3 py-1.5 hover:bg-[#f0e6d9]">
              {t.access}
            </Link>
            <Link href="/my/security" className="shrink-0 rounded-lg px-3 py-1.5 hover:bg-[#f0e6d9]">
              {t.security}
            </Link>
            <Link
              href="/saved"
              prefetch
              className="shrink-0 rounded-lg px-3 py-1.5 hover:bg-[#f0e6d9]"
            >
              {t.offline}
            </Link>
          </nav>
        </div>
      </header>

      {!hasMfa && (
        <div className="border-b border-amber-200 bg-amber-50">
          <div className="mx-auto max-w-5xl px-4 py-2 text-sm text-amber-800">
            {t.mfaWarning}{" "}
            <Link href="/my/security" className="font-medium underline">
              {t.enable2fa}
            </Link>{" "}
            {t.mfaRecommend}
          </div>
        </div>
      )}

      <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
    </div>
  );
}

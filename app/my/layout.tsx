import { redirect } from "next/navigation";
import { getSupabaseServer } from "@/lib/supabase/server";
import { getUser, getOrCreateHouseholdId, listSpaces } from "@/lib/queries";
import { getLocale } from "@/lib/i18n";
import AppNav from "@/components/AppNav";

const M = {
  ru: {
    brand: "Семейный сейф",
    signOut: "Выйти",
    menu: "Меню",
    family: "Семья",
    documents: "Документы",
    assets: "Имущество",
    search: "Поиск",
    reminders: "Сроки",
    access: "Доступ",
    security: "Безопасность",
    offline: "Офлайн",
    mfaWarning: "🔒 Хотите усилить защиту?",
    enable2fa: "Включить 2FA",
    mfaRecommend: "— дополнительная защита для ваших документов.",
  },
  en: {
    brand: "Family vault",
    signOut: "Sign out",
    menu: "Menu",
    family: "Family",
    documents: "Documents",
    assets: "Assets",
    search: "Search",
    reminders: "Deadlines",
    access: "Access",
    security: "Security",
    offline: "Offline",
    mfaWarning: "🔒 Want extra protection?",
    enable2fa: "Enable 2FA",
    mfaRecommend: "— an extra layer of security for your documents.",
  },
  uz: {
    brand: "Oilaviy seyf",
    signOut: "Chiqish",
    menu: "Menyu",
    family: "Oila",
    documents: "Hujjatlar",
    assets: "Mulk",
    search: "Qidiruv",
    reminders: "Muddatlar",
    access: "Kirish huquqi",
    security: "Xavfsizlik",
    offline: "Oflayn",
    mfaWarning: "🔒 Himoyani kuchaytirasizmi?",
    enable2fa: "2FA ni yoqish",
    mfaRecommend: "— hujjatlaringiz uchun qoʻshimcha himoya.",
  },
  id: {
    brand: "Brankas keluarga",
    signOut: "Keluar",
    menu: "Menu",
    family: "Keluarga",
    documents: "Dokumen",
    assets: "Aset",
    search: "Cari",
    reminders: "Tenggat waktu",
    access: "Akses",
    security: "Keamanan",
    offline: "Offline",
    mfaWarning: "🔒 Mau proteksi ekstra?",
    enable2fa: "Aktifkan 2FA",
    mfaRecommend: "— lapisan keamanan tambahan untuk dokumen Anda.",
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

  // 2FA-подсказку показываем мягко и только когда уже есть что защищать
  // (хотя бы один документ) — чтобы не пугать нового пользователя на пустом экране.
  const { count: docCount } = await supabase
    .from("documents")
    .select("id", { count: "exact", head: true })
    .eq("household_id", activeId);
  const showMfaNudge = !hasMfa && (docCount ?? 0) > 0;

  const nav = [
    { href: "/my", emoji: "👪", label: t.family },
    { href: "/my/documents", emoji: "📄", label: t.documents },
    { href: "/my/assets", emoji: "🚗", label: t.assets },
    { href: "/my/search", emoji: "🔍", label: t.search },
    { href: "/my/reminders", emoji: "⏰", label: t.reminders },
    { href: "/my/family", emoji: "🔑", label: t.access },
    { href: "/my/security", emoji: "🛡️", label: t.security },
    { href: "/saved", emoji: "📥", label: t.offline },
  ];

  return (
    <AppNav
      locale={locale}
      brand={t.brand}
      menuLabel={t.menu}
      signOutLabel={t.signOut}
      userEmail={user.email ?? ""}
      spaces={spaces}
      activeId={activeId}
      nav={nav}
      mfa={
        showMfaNudge
          ? {
              warning: t.mfaWarning,
              enable2fa: t.enable2fa,
              recommend: t.mfaRecommend,
            }
          : null
      }
    >
      {children}
    </AppNav>
  );
}

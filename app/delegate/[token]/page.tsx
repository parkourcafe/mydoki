import { redirect } from "next/navigation";
import { getSupabaseServer } from "@/lib/supabase/server";
import { getUser } from "@/lib/queries";
import { getLocale, type Locale } from "@/lib/i18n";
import { categoryLabel } from "@/lib/delegation";
import { acceptDelegation } from "@/app/my/actions";

// Приём делегированного доступа: токен даёт доступ, поэтому вне индекса.
export const metadata = {
  robots: { index: false, follow: false },
};

const M = {
  ru: {
    invalidTitle: "Ссылка недействительна",
    invalidIntro: "Доступ истёк, отозван или уже принят.",
    toDashboard: "В кабинет",
    grantTo: (h: string) => `Доступ к документам «${h}»`,
    scopeAll: "Область: весь сейф",
    scopeCat: (c: string) => `Область: ${c}`,
    purpose: "Цель",
    until: "Действует до",
    asYou: (email: string) => `Вы примете как ${email}.`,
    accept: "Принять доступ",
    dateLocale: "ru-RU",
  },
  en: {
    invalidTitle: "Link is invalid",
    invalidIntro: "Access has expired, been revoked, or was already accepted.",
    toDashboard: "To dashboard",
    grantTo: (h: string) => `Access to “${h}” documents`,
    scopeAll: "Scope: entire vault",
    scopeCat: (c: string) => `Scope: ${c}`,
    purpose: "Purpose",
    until: "Valid until",
    asYou: (email: string) => `You'll accept as ${email}.`,
    accept: "Accept access",
    dateLocale: "en-US",
  },
  id: {
    invalidTitle: "Tautan tidak valid",
    invalidIntro: "Akses kedaluwarsa, dicabut, atau sudah diterima.",
    toDashboard: "Ke dasbor",
    grantTo: (h: string) => `Akses ke dokumen “${h}”`,
    scopeAll: "Cakupan: seluruh brankas",
    scopeCat: (c: string) => `Cakupan: ${c}`,
    purpose: "Tujuan",
    until: "Berlaku hingga",
    asYou: (email: string) => `Anda menerima sebagai ${email}.`,
    accept: "Terima akses",
    dateLocale: "id-ID",
  },
  uz: {
    invalidTitle: "Havola yaroqsiz",
    invalidIntro: "Kirish muddati tugagan, bekor qilingan yoki allaqachon qabul qilingan.",
    toDashboard: "Boshqaruv paneliga",
    grantTo: (h: string) => `«${h}» hujjatlariga kirish`,
    scopeAll: "Soha: butun seyf",
    scopeCat: (c: string) => `Soha: ${c}`,
    purpose: "Maqsad",
    until: "Amal qiladi",
    asYou: (email: string) => `Siz ${email} sifatida qabul qilasiz.`,
    accept: "Kirishni qabul qilish",
    dateLocale: "uz-UZ",
  },
} as const;

type DelegationInfo = {
  household: string;
  scope: string;
  category: string | null;
  purpose: string;
  expires_at: string;
};

export default async function DelegateAcceptPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const locale: Locale = await getLocale();
  const t = M[locale];
  const { token } = await params;

  const user = await getUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(`/delegate/${token}`)}`);

  const supabase = await getSupabaseServer();
  const { data } = await supabase.rpc("get_vault_delegation", { p_token: token });
  const info = data as DelegationInfo | null;

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="card text-center">
          {!info ? (
            <>
              <div className="mb-2 text-3xl">⛔</div>
              <h1 className="text-lg font-semibold">{t.invalidTitle}</h1>
              <p className="mt-1 text-sm text-slate-500">{t.invalidIntro}</p>
              <a href="/my" className="btn-ghost mt-4">
                {t.toDashboard}
              </a>
            </>
          ) : (
            <>
              <div className="mb-2 text-3xl">🔑</div>
              <h1 className="text-lg font-semibold">{t.grantTo(info.household)}</h1>
              <p className="mt-1 text-sm text-slate-500">
                {info.scope === "category" && info.category
                  ? t.scopeCat(categoryLabel(locale, info.category))
                  : t.scopeAll}
              </p>
              <p className="mt-1 text-sm text-slate-500">
                {t.purpose}: {info.purpose}
              </p>
              <p className="mt-1 text-xs text-slate-400">
                {t.until}{" "}
                {new Date(info.expires_at).toLocaleDateString(t.dateLocale)}
              </p>
              <p className="mt-1 text-xs text-slate-400">{t.asYou(user.email ?? "")}</p>
              <form action={acceptDelegation} className="mt-4">
                <input type="hidden" name="token" value={token} />
                <button className="btn-primary w-full">{t.accept}</button>
              </form>
            </>
          )}
        </div>
      </div>
    </main>
  );
}

import { redirect } from "next/navigation";
import { getSupabaseServer } from "@/lib/supabase/server";
import { getUser } from "@/lib/queries";
import { getLocale, type Locale } from "@/lib/i18n";
import { acceptInvitation } from "@/app/my/actions";

// Страница приёма приглашения в семью: токен даёт доступ, поэтому вне индекса.
export const metadata = {
  robots: { index: false, follow: false },
};

const ROLE_LABEL: Record<Locale, Record<string, string>> = {
  ru: {
    owner: "Владелец",
    editor: "Редактор",
    viewer: "Просмотр",
  },
  en: {
    owner: "Owner",
    editor: "Editor",
    viewer: "Viewer",
  },
  id: {
    owner: "Pemilik",
    editor: "Editor",
    viewer: "Peninjau",
  },
  uz: {
    owner: "Egasi",
    editor: "Muharrir",
    viewer: "Koʻruvchi",
  },
};

const M = {
  ru: {
    invalidTitle: "Приглашение недействительно",
    invalidIntro: "Ссылка истекла или уже использована.",
    toDashboard: "В кабинет",
    inviteTo: (h: string) => `Приглашение в «${h}»`,
    roleLine: (role: string, email: string) =>
      `Роль: ${role}. Вы войдёте как ${email}.`,
    accept: "Принять приглашение",
  },
  en: {
    invalidTitle: "Invitation is invalid",
    invalidIntro: "The link has expired or has already been used.",
    toDashboard: "To dashboard",
    inviteTo: (h: string) => `Invitation to “${h}”`,
    roleLine: (role: string, email: string) =>
      `Role: ${role}. You'll join as ${email}.`,
    accept: "Accept invitation",
  },
  id: {
    invalidTitle: "Undangan tidak valid",
    invalidIntro: "Tautan sudah kedaluwarsa atau telah digunakan.",
    toDashboard: "Ke dasbor",
    inviteTo: (h: string) => `Undangan ke “${h}”`,
    roleLine: (role: string, email: string) =>
      `Peran: ${role}. Anda akan bergabung sebagai ${email}.`,
    accept: "Terima undangan",
  },
  uz: {
    invalidTitle: "Taklifnoma yaroqsiz",
    invalidIntro: "Havolaning muddati oʻtgan yoki allaqachon ishlatilgan.",
    toDashboard: "Boshqaruv paneliga",
    inviteTo: (h: string) => `«${h}»ga taklifnoma`,
    roleLine: (role: string, email: string) =>
      `Rol: ${role}. Siz ${email} sifatida qoʻshilasiz.`,
    accept: "Taklifnomani qabul qilish",
  },
} as const;

export default async function InvitePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const locale = await getLocale();
  const t = M[locale];
  const { token } = await params;

  const user = await getUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(`/invite/${token}`)}`);

  const supabase = await getSupabaseServer();
  const { data } = await supabase.rpc("get_invitation", { p_token: token });
  const inv = data as { household: string; role: string } | null;

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="card text-center">
          {!inv ? (
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
              <div className="mb-2 text-3xl">👪</div>
              <h1 className="text-lg font-semibold">{t.inviteTo(inv.household)}</h1>
              <p className="mt-1 text-sm text-slate-500">
                {t.roleLine(
                  ROLE_LABEL[locale][inv.role] ?? inv.role,
                  user.email ?? ""
                )}
              </p>
              <form action={acceptInvitation} className="mt-4">
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

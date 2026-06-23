import { redirect } from "next/navigation";
import { getSupabaseServer } from "@/lib/supabase/server";
import { getUser } from "@/lib/queries";
import { acceptInvitation } from "@/app/my/actions";

const ROLE_LABEL: Record<string, string> = {
  owner: "Владелец",
  editor: "Редактор",
  viewer: "Просмотр",
};

export default async function InvitePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  const user = await getUser();
  if (!user) redirect("/login");

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
              <h1 className="text-lg font-semibold">Приглашение недействительно</h1>
              <p className="mt-1 text-sm text-slate-500">
                Ссылка истекла или уже использована.
              </p>
              <a href="/my" className="btn-ghost mt-4">
                В кабинет
              </a>
            </>
          ) : (
            <>
              <div className="mb-2 text-3xl">👪</div>
              <h1 className="text-lg font-semibold">
                Приглашение в «{inv.household}»
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Роль: {ROLE_LABEL[inv.role] ?? inv.role}. Вы войдёте как{" "}
                {user.email}.
              </p>
              <form action={acceptInvitation} className="mt-4">
                <input type="hidden" name="token" value={token} />
                <button className="btn-primary w-full">Принять приглашение</button>
              </form>
            </>
          )}
        </div>
      </div>
    </main>
  );
}

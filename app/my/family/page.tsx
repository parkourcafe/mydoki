import { headers } from "next/headers";
import { getSupabaseServer } from "@/lib/supabase/server";
import { getOrCreateHouseholdId, getMyRole, getUser } from "@/lib/queries";
import { RELATIONS } from "@/lib/categories";
import CopyButton from "@/components/CopyButton";
import { createInvitation, deleteInvitation } from "../actions";

const ROLE_LABEL: Record<string, string> = {
  owner: "Владелец",
  editor: "Редактор",
  viewer: "Просмотр",
};

export default async function FamilyAccessPage() {
  const supabase = await getSupabaseServer();
  const householdId = await getOrCreateHouseholdId();
  const user = await getUser();
  const myRole = await getMyRole(householdId);
  const isOwner = myRole === "owner";

  const [{ data: hmembers }, { data: invites }] = await Promise.all([
    supabase
      .from("household_members")
      .select("user_id, role, created_at")
      .eq("household_id", householdId)
      .order("created_at", { ascending: true }),
    supabase
      .from("invitations")
      .select("*")
      .eq("household_id", householdId)
      .is("accepted_at", null)
      .order("created_at", { ascending: false }),
  ]);

  const h = await headers();
  const origin = `https://${h.get("host") ?? ""}`;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Доступ к семье</h1>
        <p className="mt-1 text-sm text-slate-500">
          Пригласите близких. Роли: владелец (всё), редактор (чтение + правка),
          просмотр (только чтение).
        </p>
      </div>

      <section className="card">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
          Участники
        </h2>
        <ul className="divide-y divide-slate-100">
          {(hmembers ?? []).map((m) => (
            <li
              key={m.user_id}
              className="flex items-center justify-between py-2 text-sm"
            >
              <span>
                {m.user_id === user?.id ? (
                  <span className="font-medium">Вы</span>
                ) : (
                  <span className="text-slate-500">
                    {String(m.user_id).slice(0, 8)}…
                  </span>
                )}
              </span>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs">
                {ROLE_LABEL[m.role] ?? m.role}
              </span>
            </li>
          ))}
        </ul>
      </section>

      {!isOwner ? (
        <p className="text-sm text-slate-400">
          Приглашать участников может только владелец семьи.
        </p>
      ) : (
        <>
          <section className="card">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
              Приглашения
            </h2>
            {(invites ?? []).length === 0 ? (
              <p className="text-sm text-slate-400">Активных приглашений нет.</p>
            ) : (
              <ul className="space-y-2">
                {(invites ?? []).map((inv) => {
                  const url = `${origin}/invite/${inv.token}`;
                  return (
                    <li
                      key={inv.id}
                      className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    >
                      <span>
                        {ROLE_LABEL[inv.role] ?? inv.role} · до{" "}
                        {new Date(inv.expires_at).toLocaleDateString("ru-RU")}
                      </span>
                      <span className="flex gap-2">
                        <CopyButton text={url} />
                        <form action={deleteInvitation}>
                          <input type="hidden" name="id" value={inv.id} />
                          <button className="btn-danger">Удалить</button>
                        </form>
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}

            <form action={createInvitation} className="mt-4 flex items-end gap-3">
              <div>
                <label className="label">Роль</label>
                <select name="role" defaultValue="viewer" className="input">
                  <option value="viewer">Просмотр</option>
                  <option value="editor">Редактор</option>
                </select>
              </div>
              <button className="btn-primary">Создать приглашение</button>
            </form>
            <p className="mt-2 text-xs text-slate-400">
              Скопируйте ссылку и передайте человеку любым способом. Ссылка
              действует 14 дней.
            </p>
          </section>
        </>
      )}

      {/* Подсказка по людям (members) vs участникам (users) */}
      <p className="text-xs text-slate-400">
        «Участники» — это люди с доступом к аккаунту семьи. «Члены семьи» (с их
        документами) добавляются на странице{" "}
        <a href="/my" className="underline">
          Семья
        </a>
        . Доступные связи: {RELATIONS.map((r) => r.label).join(", ")}.
      </p>
    </div>
  );
}

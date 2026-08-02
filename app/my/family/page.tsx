import { headers } from "next/headers";
import { getSupabaseServer } from "@/lib/supabase/server";
import { getOrCreateHouseholdId, getMyRole, getUser } from "@/lib/queries";
import { relations } from "@/lib/categories";
import { getLocale } from "@/lib/i18n";
import CopyButton from "@/components/CopyButton";
import SubmitButton from "@/components/SubmitButton";
import {
  type HouseholdMember,
  HOUSEHOLD_ROLES,
  roleLabel,
  isLastOwner,
} from "@/lib/family";
import {
  type Delegation,
  DELEGATION_SCOPES,
  VAULT_CATEGORIES,
  effectiveStatus,
  statusLabel,
  scopeSummary,
  categoryLabel,
} from "@/lib/delegation";
import {
  createInvitation,
  deleteInvitation,
  setMemberRole,
  removeMember,
  leaveHousehold,
  createDelegation,
  revokeDelegation,
} from "../actions";

const ROLE_LABEL: Record<"ru" | "en" | "id" | "uz", Record<string, string>> = {
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
  uz: {
    owner: "Egasi",
    editor: "Muharrir",
    viewer: "Koʻruvchi",
  },
  id: {
    owner: "Pemilik",
    editor: "Editor",
    viewer: "Penampil",
  },
};

const M = {
  ru: {
    title: "Доступ к семье",
    subtitle:
      "Пригласите близких. Роли: владелец (всё), редактор (чтение + правка), просмотр (только чтение).",
    members: "Участники",
    you: "Вы",
    notOwner: "Приглашать участников может только владелец семьи.",
    invitations: "Приглашения",
    noInvitations: "Активных приглашений нет.",
    until: "до",
    delete: "Удалить",
    role: "Роль",
    viewer: "Просмотр",
    editor: "Редактор",
    createInvite: "Создать приглашение",
    inviteHint:
      "Скопируйте ссылку и передайте человеку любым способом. Ссылка действует 14 дней.",
    footerA: "«Участники» — это люди с доступом к аккаунту семьи. «Члены семьи» (с их документами) добавляются на странице",
    footerLink: "Семья",
    footerRelations: "Доступные связи:",
    dateLocale: "ru-RU",
    manageRoles: "Роль участника меняет только владелец. В семье всегда остаётся хотя бы один владелец.",
    save: "Сохранить",
    remove: "Убрать",
    leave: "Выйти из семьи",
    leaveHint: "Вы единственный владелец. Чтобы выйти, сначала назначьте владельцем другого участника.",
    delegTitle: "Делегированный доступ",
    delegHint: "Выдайте близкому или специалисту доступ к документам на время и с целью. Доступ автоматически истечёт; можно отозвать в любой момент. Пока — просмотр сведений о документах (без скачивания файлов).",
    delegScope: "Область", delegScopeAll: "Весь сейф", delegScopeCategory: "Одна категория",
    delegCategory: "Категория", delegPurpose: "Цель", delegPurposePh: "Напр.: налоговая декларация",
    delegExpires: "Действует до", delegCreate: "Выдать доступ", delegNone: "Активных делегаций нет.",
    delegRevoke: "Отозвать", delegLink: "Ссылка",
  },
  en: {
    title: "Family access",
    subtitle:
      "Invite your loved ones. Roles: owner (everything), editor (read + edit), viewer (read only).",
    members: "Members",
    you: "You",
    notOwner: "Only the family owner can invite members.",
    invitations: "Invitations",
    noInvitations: "No active invitations.",
    until: "until",
    delete: "Delete",
    role: "Role",
    viewer: "Viewer",
    editor: "Editor",
    createInvite: "Create invitation",
    inviteHint:
      "Copy the link and share it with the person any way you like. The link is valid for 14 days.",
    footerA: "“Members” are people with access to the family account. “Family members” (with their documents) are added on the",
    footerLink: "Family",
    footerRelations: "Available relations:",
    dateLocale: "en-US",
    manageRoles: "Only the owner can change a member's role. The family always keeps at least one owner.",
    save: "Save",
    remove: "Remove",
    leave: "Leave family",
    leaveHint: "You are the only owner. To leave, first make another member the owner.",
    delegTitle: "Delegated access",
    delegHint: "Grant a loved one or specialist access to documents for a purpose and a limited time. Access expires automatically and can be revoked anytime. For now — viewing document details (no file downloads).",
    delegScope: "Scope", delegScopeAll: "Entire vault", delegScopeCategory: "One category",
    delegCategory: "Category", delegPurpose: "Purpose", delegPurposePh: "e.g. tax filing",
    delegExpires: "Valid until", delegCreate: "Grant access", delegNone: "No active delegations.",
    delegRevoke: "Revoke", delegLink: "Link",
  },
  uz: {
    title: "Oilaga kirish huquqi",
    subtitle:
      "Yaqinlaringizni taklif qiling. Rollar: egasi (hammasi), muharrir (oʻqish + tahrirlash), koʻruvchi (faqat oʻqish).",
    members: "Ishtirokchilar",
    you: "Siz",
    notOwner: "Ishtirokchilarni faqat oila egasi taklif qila oladi.",
    invitations: "Takliflar",
    noInvitations: "Faol takliflar yoʻq.",
    until: "gacha",
    delete: "Oʻchirish",
    role: "Rol",
    viewer: "Koʻruvchi",
    editor: "Muharrir",
    createInvite: "Taklif yaratish",
    inviteHint:
      "Havolani nusxalab, odamga istalgan usulda yuboring. Havola 14 kun amal qiladi.",
    footerA: "«Ishtirokchilar» — bu oila hisobiga kirish huquqiga ega odamlar. «Oila aʼzolari» (hujjatlari bilan) sahifada qoʻshiladi",
    footerLink: "Oila",
    footerRelations: "Mavjud qarindoshlik turlari:",
    dateLocale: "uz-UZ",
    manageRoles: "Ishtirokchi rolini faqat egasi o‘zgartira oladi. Oilada doim kamida bitta egasi qoladi.",
    save: "Saqlash",
    remove: "Chiqarish",
    leave: "Oiladan chiqish",
    leaveHint: "Siz yagona egasisiz. Chiqish uchun avval boshqa ishtirokchini egasi qilib tayinlang.",
    delegTitle: "Delegatsiya qilingan kirish",
    delegHint: "Yaqiningiz yoki mutaxassisga hujjatlarga maqsad va muddat bilan kirish bering. Kirish avtomatik tugaydi va istalgan vaqtda bekor qilinadi. Hozircha — hujjat ma'lumotlarini ko‘rish (fayllarni yuklamasdan).",
    delegScope: "Soha", delegScopeAll: "Butun seyf", delegScopeCategory: "Bitta turkum",
    delegCategory: "Turkum", delegPurpose: "Maqsad", delegPurposePh: "Masalan: soliq deklaratsiyasi",
    delegExpires: "Amal qiladi", delegCreate: "Kirish berish", delegNone: "Faol delegatsiyalar yo‘q.",
    delegRevoke: "Bekor qilish", delegLink: "Havola",
  },
  id: {
    title: "Akses keluarga",
    subtitle:
      "Undang orang terkasih Anda. Peran: pemilik (semua), editor (baca + ubah), penampil (hanya baca).",
    members: "Anggota",
    you: "Anda",
    notOwner: "Hanya pemilik keluarga yang dapat mengundang anggota.",
    invitations: "Undangan",
    noInvitations: "Tidak ada undangan aktif.",
    until: "hingga",
    delete: "Hapus",
    role: "Peran",
    viewer: "Penampil",
    editor: "Editor",
    createInvite: "Buat undangan",
    inviteHint:
      "Salin tautan dan bagikan kepada orang tersebut dengan cara apa pun yang Anda suka. Tautan berlaku selama 14 hari.",
    footerA: "“Anggota” adalah orang yang memiliki akses ke akun keluarga. “Anggota keluarga” (beserta dokumennya) ditambahkan di halaman",
    footerLink: "Keluarga",
    footerRelations: "Hubungan yang tersedia:",
    dateLocale: "id-ID",
    manageRoles: "Hanya pemilik yang dapat mengubah peran anggota. Keluarga selalu memiliki setidaknya satu pemilik.",
    save: "Simpan",
    remove: "Keluarkan",
    leave: "Keluar dari keluarga",
    leaveHint: "Anda satu-satunya pemilik. Untuk keluar, jadikan anggota lain sebagai pemilik terlebih dahulu.",
    delegTitle: "Akses delegasi",
    delegHint: "Beri orang terkasih atau spesialis akses ke dokumen untuk tujuan dan waktu terbatas. Akses kedaluwarsa otomatis dan bisa dicabut kapan saja. Untuk saat ini — melihat detail dokumen (tanpa unduh berkas).",
    delegScope: "Cakupan", delegScopeAll: "Seluruh brankas", delegScopeCategory: "Satu kategori",
    delegCategory: "Kategori", delegPurpose: "Tujuan", delegPurposePh: "mis. pelaporan pajak",
    delegExpires: "Berlaku hingga", delegCreate: "Beri akses", delegNone: "Tidak ada delegasi aktif.",
    delegRevoke: "Cabut", delegLink: "Tautan",
  },
} as const;

export default async function FamilyAccessPage() {
  const locale = await getLocale();
  const t = M[locale];

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

  const { data: delegs } = await supabase
    .from("vault_delegations")
    .select("*")
    .eq("household_id", householdId)
    .order("created_at", { ascending: false });
  const delegations = (delegs ?? []) as Delegation[];

  const h = await headers();
  const origin = `https://${h.get("host") ?? ""}`;
  const now = new Date();

  const members = (hmembers ?? []) as HouseholdMember[];
  const meLastOwner = user ? isLastOwner(members, user.id) : false;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">{t.title}</h1>
        <p className="mt-1 text-sm text-slate-500">
          {t.subtitle}
        </p>
      </div>

      <section className="card">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
          {t.members}
        </h2>
        <ul className="divide-y divide-slate-100">
          {members.map((m) => {
            const isMe = m.user_id === user?.id;
            const lastOwner = isLastOwner(members, m.user_id);
            return (
              <li
                key={m.user_id}
                className="flex flex-wrap items-center justify-between gap-2 py-2 text-sm"
              >
                <span>
                  {isMe ? (
                    <span className="font-medium">{t.you}</span>
                  ) : (
                    <span className="text-slate-500">
                      {String(m.user_id).slice(0, 8)}…
                    </span>
                  )}
                </span>
                {isOwner ? (
                  <span className="flex items-center gap-2">
                    <form action={setMemberRole} className="flex items-center gap-1">
                      <input type="hidden" name="user_id" value={m.user_id} />
                      <select
                        name="role"
                        defaultValue={m.role}
                        className="input py-1 text-xs"
                      >
                        {HOUSEHOLD_ROLES.map((r) => (
                          <option key={r} value={r}>
                            {roleLabel(locale, r)}
                          </option>
                        ))}
                      </select>
                      <SubmitButton className="btn text-xs">{t.save}</SubmitButton>
                    </form>
                    {!lastOwner && (
                      <form action={removeMember}>
                        <input type="hidden" name="user_id" value={m.user_id} />
                        <button className="btn-danger text-xs">{t.remove}</button>
                      </form>
                    )}
                  </span>
                ) : (
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs">
                    {roleLabel(locale, m.role)}
                  </span>
                )}
              </li>
            );
          })}
        </ul>
        {isOwner && (
          <p className="mt-3 text-xs text-slate-400">{t.manageRoles}</p>
        )}

        {/* Выход из семьи — доступен текущему участнику (кроме последнего владельца). */}
        <div className="mt-4 border-t border-slate-100 pt-3">
          {meLastOwner ? (
            <p className="text-xs text-slate-400">{t.leaveHint}</p>
          ) : (
            <form action={leaveHousehold}>
              <button className="btn-danger text-xs">{t.leave}</button>
            </form>
          )}
        </div>
      </section>

      {!isOwner ? (
        <p className="text-sm text-slate-400">
          {t.notOwner}
        </p>
      ) : (
        <>
          <section className="card">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
              {t.invitations}
            </h2>
            {(invites ?? []).length === 0 ? (
              <p className="text-sm text-slate-400">{t.noInvitations}</p>
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
                        {ROLE_LABEL[locale][inv.role] ?? inv.role} · {t.until}{" "}
                        {new Date(inv.expires_at).toLocaleDateString(t.dateLocale)}
                      </span>
                      <span className="flex gap-2">
                        <CopyButton text={url} locale={locale} />
                        <form action={deleteInvitation}>
                          <input type="hidden" name="id" value={inv.id} />
                          <button className="btn-danger">{t.delete}</button>
                        </form>
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}

            <form action={createInvitation} className="mt-4 flex items-end gap-3">
              <div>
                <label className="label">{t.role}</label>
                <select name="role" defaultValue="viewer" className="input">
                  <option value="viewer">{t.viewer}</option>
                  <option value="editor">{t.editor}</option>
                </select>
              </div>
              <SubmitButton>{t.createInvite}</SubmitButton>
            </form>
            <p className="mt-2 text-xs text-slate-400">
              {t.inviteHint}
            </p>
          </section>

          <section className="card">
            <h2 className="mb-1 text-sm font-semibold uppercase tracking-wide text-slate-500">
              {t.delegTitle}
            </h2>
            <p className="mb-3 text-xs text-slate-400">{t.delegHint}</p>

            {delegations.length === 0 ? (
              <p className="text-sm text-slate-400">{t.delegNone}</p>
            ) : (
              <ul className="space-y-2">
                {delegations.map((d) => {
                  const st = effectiveStatus(d, now);
                  const url = `${origin}/delegate/${d.token}`;
                  return (
                    <li
                      key={d.id}
                      className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    >
                      <span className="min-w-0">
                        <span className="font-medium">{scopeSummary(locale, d)}</span>
                        <span className="text-slate-500"> · {d.purpose}</span>
                        <span className="block text-xs text-slate-400">
                          {statusLabel(locale, st)} · {t.until}{" "}
                          {new Date(d.expires_at).toLocaleDateString(t.dateLocale)}
                        </span>
                      </span>
                      <span className="flex gap-2">
                        {st === "pending" && <CopyButton text={url} locale={locale} />}
                        {(st === "pending" || st === "active") && (
                          <form action={revokeDelegation}>
                            <input type="hidden" name="id" value={d.id} />
                            <button className="btn-danger text-xs">{t.delegRevoke}</button>
                          </form>
                        )}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}

            <form action={createDelegation} className="mt-4 grid gap-3 sm:grid-cols-2">
              <div>
                <label className="label">{t.delegScope}</label>
                <select name="scope" defaultValue="all" className="input">
                  {DELEGATION_SCOPES.map((s) => (
                    <option key={s} value={s}>
                      {s === "all" ? t.delegScopeAll : t.delegScopeCategory}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">{t.delegCategory}</label>
                <select name="category" defaultValue="financial" className="input">
                  {VAULT_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {categoryLabel(locale, c)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">{t.delegPurpose}</label>
                <input
                  name="purpose"
                  required
                  placeholder={t.delegPurposePh}
                  className="input"
                />
              </div>
              <div>
                <label className="label">{t.delegExpires}</label>
                <input name="expires_on" type="date" required className="input" />
              </div>
              <div className="sm:col-span-2">
                <SubmitButton>{t.delegCreate}</SubmitButton>
              </div>
            </form>
          </section>
        </>
      )}

      {/* Подсказка по людям (members) vs участникам (users) */}
      <p className="text-xs text-slate-400">
        {t.footerA}{" "}
        <a href="/my" className="underline">
          {t.footerLink}
        </a>
        {locale === "ru" ? "" : " page"}. {t.footerRelations}{" "}
        {relations(locale).map((r) => r.label).join(", ")}.
      </p>
    </div>
  );
}

import type { Locale } from "./i18n";

// ============================ Family access ===========================
// Семейные роли и доступ (арх. §3.3/§7.2/§14 Фаза 4). Модель — household с
// участниками (household_members) и ролями owner|editor|viewer. Здесь —
// чистые хелперы под UI и юнит-тесты: метки/описания ролей, ранги, проверки
// прав и инварианта «в семье всегда есть хотя бы один owner». Никаких
// вердиктов/оценок — только детерминированная логика доступа.

export type HouseholdRole = "owner" | "editor" | "viewer";

// Роли, которые owner может назначить участнику (owner передаётся отдельно —
// повышение до owner тоже разрешено, но в UI это осознанное действие).
export const HOUSEHOLD_ROLES: HouseholdRole[] = ["owner", "editor", "viewer"];

export type HouseholdMember = {
  user_id: string;
  role: HouseholdRole;
};

// Ранг роли: выше — больше прав. Для сортировки и сравнения.
export function roleRank(role: HouseholdRole | string): number {
  switch (role) {
    case "owner":
      return 3;
    case "editor":
      return 2;
    case "viewer":
      return 1;
    default:
      return 0;
  }
}

const ROLE_LABEL: Record<Locale, Record<HouseholdRole, string>> = {
  ru: { owner: "Владелец", editor: "Редактор", viewer: "Просмотр" },
  en: { owner: "Owner", editor: "Editor", viewer: "Viewer" },
  id: { owner: "Pemilik", editor: "Editor", viewer: "Penampil" },
  uz: { owner: "Egasi", editor: "Muharrir", viewer: "Ko‘ruvchi" },
};

export function roleLabel(locale: Locale, role: HouseholdRole | string): string {
  return ROLE_LABEL[locale][role as HouseholdRole] ?? String(role);
}

const ROLE_DESC: Record<Locale, Record<HouseholdRole, string>> = {
  ru: {
    owner: "Полный доступ: документы, участники, приглашения.",
    editor: "Чтение и правка документов; без управления участниками.",
    viewer: "Только чтение документов.",
  },
  en: {
    owner: "Full access: documents, members, invitations.",
    editor: "Read and edit documents; no member management.",
    viewer: "Read-only access to documents.",
  },
  id: {
    owner: "Akses penuh: dokumen, anggota, undangan.",
    editor: "Baca dan ubah dokumen; tanpa kelola anggota.",
    viewer: "Akses baca-saja ke dokumen.",
  },
  uz: {
    owner: "To‘liq kirish: hujjatlar, a'zolar, takliflar.",
    editor: "Hujjatlarni o‘qish va tahrirlash; a'zolarni boshqarmaydi.",
    viewer: "Hujjatlarni faqat o‘qish.",
  },
};

export function roleDescription(locale: Locale, role: HouseholdRole | string): string {
  return ROLE_DESC[locale][role as HouseholdRole] ?? "";
}

// Управлять участниками (менять роли, удалять, приглашать) может только owner.
export function canManageMembers(myRole: HouseholdRole | string | null | undefined): boolean {
  return myRole === "owner";
}

// Сколько owner-ов в семье.
export function ownerCount(members: HouseholdMember[]): number {
  return members.filter((m) => m.role === "owner").length;
}

// Является ли пользователь ЕДИНСТВЕННЫМ owner-ом семьи.
export function isLastOwner(members: HouseholdMember[], userId: string): boolean {
  const target = members.find((m) => m.user_id === userId);
  if (!target || target.role !== "owner") return false;
  return ownerCount(members) <= 1;
}

// Осиротит ли семью смена роли участника (останется 0 owner-ов).
// Понижение последнего owner до editor/viewer — запрещено.
export function wouldOrphanOwner(
  members: HouseholdMember[],
  userId: string,
  newRole: HouseholdRole
): boolean {
  if (newRole === "owner") return false;
  return isLastOwner(members, userId);
}

// Можно ли удалить/вывести участника из семьи (не оставив её без owner).
export function canRemoveMember(members: HouseholdMember[], userId: string): boolean {
  return !isLastOwner(members, userId);
}

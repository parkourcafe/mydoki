import Link from "next/link";
import { getOrCreateHouseholdId, listMembers } from "@/lib/queries";
import { relations, relationLabel } from "@/lib/categories";
import { getLocale } from "@/lib/i18n";
import { createMember } from "./actions";

const M = {
  ru: {
    title: "Семья",
    subtitle: "Для каждого человека — его документы и записи в одном месте.",
    export: "↓ Экспорт",
    empty: "Пока никого нет. Добавьте первого члена семьи ниже.",
    addMember: "+ Добавить члена семьи",
    name: "Имя",
    namePlaceholder: "Иван Иванов",
    relation: "Связь",
    birthDate: "Дата рождения",
    add: "Добавить",
  },
  en: {
    title: "Family",
    subtitle: "Each person's documents and records in one place.",
    export: "↓ Export",
    empty: "No one here yet. Add your first family member below.",
    addMember: "+ Add family member",
    name: "Name",
    namePlaceholder: "John Smith",
    relation: "Relation",
    birthDate: "Date of birth",
    add: "Add",
  },
  id: {
    title: "Keluarga",
    subtitle: "Dokumen dan catatan setiap orang di satu tempat.",
    export: "↓ Ekspor",
    empty: "Belum ada siapa pun di sini. Tambahkan anggota keluarga pertama Anda di bawah.",
    addMember: "+ Tambah anggota keluarga",
    name: "Nama",
    namePlaceholder: "Budi Santoso",
    relation: "Hubungan",
    birthDate: "Tanggal lahir",
    add: "Tambah",
  },
} as const;

export default async function MyHome() {
  const locale = await getLocale();
  const t = M[locale];

  const householdId = await getOrCreateHouseholdId();
  const members = await listMembers(householdId);

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">{t.title}</h1>
          <p className="mt-1 text-sm text-slate-500">
            {t.subtitle}
          </p>
        </div>
        <a href="/my/export" className="btn-ghost shrink-0">
          {t.export}
        </a>
      </div>

      {members.length === 0 ? (
        <div className="card text-center text-slate-500">
          {t.empty}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {members.map((m) => (
            <Link
              key={m.id}
              href={`/my/members/${m.id}`}
              className="card transition hover:border-brand-300 hover:shadow"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-50 text-lg">
                  {m.full_name.slice(0, 1).toUpperCase()}
                </div>
                <div>
                  <div className="font-medium">{m.full_name}</div>
                  <div className="text-xs text-slate-500">
                    {m.relation ? relationLabel(locale, m.relation) : "—"}
                    {m.birth_date ? ` · ${m.birth_date}` : ""}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      <details className="card">
        <summary className="cursor-pointer font-medium">
          {t.addMember}
        </summary>
        <form action={createMember} className="mt-4 grid gap-4 sm:grid-cols-3">
          <div className="sm:col-span-1">
            <label className="label">{t.name}</label>
            <input name="full_name" required className="input" placeholder={t.namePlaceholder} />
          </div>
          <div>
            <label className="label">{t.relation}</label>
            <select name="relation" className="input" defaultValue="">
              <option value="">—</option>
              {relations(locale).map((r) => (
                <option key={r.key} value={r.key}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">{t.birthDate}</label>
            <input name="birth_date" type="date" className="input" />
          </div>
          <div className="sm:col-span-3">
            <button className="btn-primary">{t.add}</button>
          </div>
        </form>
      </details>
    </div>
  );
}

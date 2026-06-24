import Link from "next/link";
import {
  getOrCreateHouseholdId,
  getStorageInfo,
  listExpiring,
  listMembers,
} from "@/lib/queries";
import { relations, relationLabel } from "@/lib/categories";
import { getLocale } from "@/lib/i18n";
import StorageBar from "@/components/StorageBar";
import SubmitButton from "@/components/SubmitButton";
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
    soon: "Скоро истекают сроки",
    allDates: "Все сроки →",
    until: "до",
    welcomeTitle: "Добро пожаловать! 👋",
    welcomeText: "Наведём порядок за пару шагов:",
    step1: "Добавьте члена семьи — можно начать с себя",
    step2: "Загрузите первый документ: фото или скан",
    step3: "Укажите срок действия — и мы напомним заранее",
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
    soon: "Expiring soon",
    allDates: "All deadlines →",
    until: "until",
    welcomeTitle: "Welcome! 👋",
    welcomeText: "Let's get organized in a couple of steps:",
    step1: "Add a family member — you can start with yourself",
    step2: "Upload the first document: a photo or scan",
    step3: "Set the expiry date — and we'll remind you in advance",
  },
  uz: {
    title: "Oila",
    subtitle: "Har bir insonning hujjatlari va yozuvlari bir joyda.",
    export: "↓ Eksport",
    empty: "Hozircha hech kim yoʻq. Quyida birinchi oila aʼzosini qoʻshing.",
    addMember: "+ Oila aʼzosini qoʻshish",
    name: "Ism",
    namePlaceholder: "Ali Valiyev",
    relation: "Qarindoshlik",
    birthDate: "Tugʻilgan sana",
    add: "Qoʻshish",
    soon: "Muddati tugayapti",
    allDates: "Barcha muddatlar →",
    until: "gacha",
    welcomeTitle: "Xush kelibsiz! 👋",
    welcomeText: "Bir necha qadamda tartibga solamiz:",
    step1: "Oila aʼzosini qoʻshing — oʻzingizdan boshlashingiz mumkin",
    step2: "Birinchi hujjatni yuklang: rasm yoki skan",
    step3: "Amal qilish muddatini koʻrsating — oldindan eslatamiz",
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
    soon: "Segera kedaluwarsa",
    allDates: "Semua tenggat →",
    until: "sampai",
    welcomeTitle: "Selamat datang! 👋",
    welcomeText: "Mari berbenah dalam beberapa langkah:",
    step1: "Tambahkan anggota keluarga — bisa mulai dari diri sendiri",
    step2: "Unggah dokumen pertama: foto atau pindaian",
    step3: "Tetapkan tanggal berlaku — kami akan ingatkan lebih awal",
  },
} as const;

export default async function MyHome() {
  const locale = await getLocale();
  const t = M[locale];

  const householdId = await getOrCreateHouseholdId();
  const [members, storage, expiring] = await Promise.all([
    listMembers(householdId),
    getStorageInfo(householdId),
    listExpiring(householdId, 30),
  ]);

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

      {expiring.length > 0 && (
        <Link
          href="/my/reminders"
          className="block rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 transition hover:bg-amber-100"
        >
          <div className="flex items-center justify-between gap-3">
            <div className="font-medium text-amber-800">
              ⏰ {t.soon} · {expiring.length}
            </div>
            <span className="shrink-0 text-sm text-amber-700">{t.allDates}</span>
          </div>
          <div className="mt-1 truncate text-sm text-amber-700">
            {expiring
              .slice(0, 3)
              .map((d) => `${d.title} (${t.until} ${d.expires_at})`)
              .join(" · ")}
            {expiring.length > 3 ? " …" : ""}
          </div>
        </Link>
      )}

      <StorageBar used={storage.used} limit={storage.limit} locale={locale} />

      {members.length === 0 ? (
        <div className="card space-y-3">
          <div className="text-lg font-semibold">{t.welcomeTitle}</div>
          <p className="text-sm text-slate-600">{t.welcomeText}</p>
          <ol className="ml-5 list-decimal space-y-1 text-sm text-slate-600">
            <li>{t.step1}</li>
            <li>{t.step2}</li>
            <li>{t.step3}</li>
          </ol>
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

      <details className="card" open={members.length === 0}>
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
            <SubmitButton>{t.add}</SubmitButton>
          </div>
        </form>
      </details>
    </div>
  );
}

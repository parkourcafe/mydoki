import Link from "next/link";
import { getSupabaseServer } from "@/lib/supabase/server";
import { getUser } from "@/lib/queries";
import { getLocale } from "@/lib/i18n";
import { saveCompanySettings } from "@/app/employer/actions";
import SubmitButton from "@/components/SubmitButton";

const M = {
  ru: {
    savedOk: "Настройки сохранены.", savedName: "Укажите название компании — без него настройки не сохранены.",
    title: "Настройки компании",
    subtitle: "Данные компании, срок хранения данных кандидатов и текст согласия.",
    company: "Компания",
    name: "Название",
    country: "Страна",
    whatsapp: "WhatsApp для связи",
    email: "Email для связи",
    retentionTitle: "Хранение данных отклонённых кандидатов",
    retentionHint:
      "Через сколько месяцев обезличивать данные отклонённых откликов (документы кандидата остаются у него).",
    months: "месяцев",
    consentTitle: "Текст согласия на обработку данных",
    consentHint:
      "Показывается кандидату при отклике. Оставьте пустым — будет стандартный.",
    save: "Сохранить",
    members: "Участники",
    membersHint:
      "Совместный доступ рекрутёров появится позже. Сейчас управляет владелец.",
    you: "вы",
    owner: "владелец",
    recruiter: "рекрутёр",
    back: "← К вакансиям",
    noProfile: "Сначала создайте компанию при добавлении первой вакансии.",
    setup: "Создать вакансию",
  },
  en: {
    savedOk: "Settings saved.", savedName: "Enter a company name — settings weren't saved without it.",
    title: "Company settings",
    subtitle: "Company details, candidate data retention and consent text.",
    company: "Company",
    name: "Name",
    country: "Country",
    whatsapp: "Contact WhatsApp",
    email: "Contact email",
    retentionTitle: "Rejected candidate data retention",
    retentionHint:
      "After how many months to anonymize rejected applications (candidate documents stay with them).",
    months: "months",
    consentTitle: "Data processing consent text",
    consentHint: "Shown to candidates when applying. Leave empty for the default.",
    save: "Save",
    members: "Members",
    membersHint: "Shared recruiter access comes later. For now the owner manages.",
    you: "you",
    owner: "owner",
    recruiter: "recruiter",
    back: "← Back to vacancies",
    noProfile: "Create your company first when adding your first vacancy.",
    setup: "Create a vacancy",
  },
  uz: {
    savedOk: "Sozlamalar saqlandi.", savedName: "Kompaniya nomini kiriting — usiz sozlamalar saqlanmadi.",
    title: "Kompaniya sozlamalari",
    subtitle: "Kompaniya maʼlumotlari, nomzod maʼlumotlarini saqlash va rozilik matni.",
    company: "Kompaniya",
    name: "Nomi",
    country: "Davlat",
    whatsapp: "Aloqa uchun WhatsApp",
    email: "Aloqa uchun email",
    retentionTitle: "Rad etilgan nomzodlar maʼlumotini saqlash",
    retentionHint:
      "Rad etilgan arizalar necha oydan soʻng anonimlashtirilsin (nomzod hujjatlari oʻzida qoladi).",
    months: "oy",
    consentTitle: "Maʼlumotlarni qayta ishlashga rozilik matni",
    consentHint: "Ariza berishda nomzodga koʻrsatiladi. Boʻsh qoldirsangiz — standart.",
    save: "Saqlash",
    members: "Ishtirokchilar",
    membersHint: "Rekruterlar uchun umumiy kirish keyinroq. Hozircha egasi boshqaradi.",
    you: "siz",
    owner: "egasi",
    recruiter: "rekruter",
    back: "← Vakansiyalarga",
    noProfile: "Avval birinchi vakansiya qoʻshishda kompaniyani yarating.",
    setup: "Vakansiya yaratish",
  },
  id: {
    savedOk: "Pengaturan tersimpan.", savedName: "Isi nama perusahaan — tanpa itu pengaturan tidak tersimpan.",
    title: "Pengaturan perusahaan",
    subtitle: "Detail perusahaan, retensi data kandidat, dan teks persetujuan.",
    company: "Perusahaan",
    name: "Nama",
    country: "Negara",
    whatsapp: "WhatsApp kontak",
    email: "Email kontak",
    retentionTitle: "Retensi data kandidat yang ditolak",
    retentionHint:
      "Setelah berapa bulan data lamaran yang ditolak dianonimkan (dokumen kandidat tetap miliknya).",
    months: "bulan",
    consentTitle: "Teks persetujuan pemrosesan data",
    consentHint: "Ditampilkan ke kandidat saat melamar. Kosongkan untuk default.",
    save: "Simpan",
    members: "Anggota",
    membersHint: "Akses rekruter bersama menyusul. Untuk saat ini pemilik mengelola.",
    you: "Anda",
    owner: "pemilik",
    recruiter: "rekruter",
    back: "← Kembali ke lowongan",
    noProfile: "Buat perusahaan Anda dulu saat menambah lowongan pertama.",
    setup: "Buat lowongan",
  },
} as const;

type Profile = {
  id: string;
  company_name: string | null;
  country: string | null;
  contact_whatsapp: string | null;
  contact_email: string | null;
  retention_months: number | null;
  default_consent_text: string | null;
};

export default async function EmployerSettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  const saved = (await searchParams).saved;
  const locale = await getLocale();
  const t = M[locale];
  const user = await getUser();
  const supabase = await getSupabaseServer();

  const { data: prof } = await supabase
    .from("employer_profiles")
    .select(
      "id, company_name, country, contact_whatsapp, contact_email, retention_months, default_consent_text"
    )
    .eq("user_id", user!.id)
    .maybeSingle();
  const profile = prof as Profile | null;

  if (!profile) {
    return (
      <div className="card text-center">
        <p className="text-sm text-slate-600">{t.noProfile}</p>
        <Link href="/employer/vacancies/new" className="btn-primary mt-4">
          {t.setup}
        </Link>
      </div>
    );
  }

  const { data: memberData } = await supabase
    .from("company_members")
    .select("user_id, role")
    .eq("employer_profile_id", profile.id);
  const members = (memberData ?? []) as { user_id: string; role: string }[];

  return (
    <div className="space-y-6">
      <div>
        <Link href="/employer" className="text-sm text-slate-500 hover:underline">
          {t.back}
        </Link>
        <h1 className="mt-2 text-2xl font-semibold">{t.title}</h1>
        <p className="mt-1 text-sm text-slate-500">{t.subtitle}</p>
      </div>

      {saved === "1" && (
        <p className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">
          ✓ {t.savedOk}
        </p>
      )}
      {saved === "name" && (
        <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
          {t.savedName}
        </p>
      )}

      <form action={saveCompanySettings} className="card space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          {t.company}
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="label">{t.name}</label>
            <input
              name="company_name"
              required
              defaultValue={profile.company_name ?? ""}
              className="input"
            />
          </div>
          <div>
            <label className="label">{t.country}</label>
            <input name="country" defaultValue={profile.country ?? ""} className="input" />
          </div>
          <div>
            <label className="label">{t.whatsapp}</label>
            <input
              name="contact_whatsapp"
              defaultValue={profile.contact_whatsapp ?? ""}
              className="input"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="label">{t.email}</label>
            <input
              name="contact_email"
              type="email"
              defaultValue={profile.contact_email ?? ""}
              className="input"
            />
          </div>
        </div>

        <div className="border-t border-slate-100 pt-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            {t.retentionTitle}
          </h2>
          <p className="mt-1 text-xs text-slate-400">{t.retentionHint}</p>
          <div className="mt-2 flex items-center gap-2">
            <input
              name="retention_months"
              type="number"
              min={1}
              max={120}
              defaultValue={profile.retention_months ?? 12}
              className="input w-28"
            />
            <span className="text-sm text-slate-500">{t.months}</span>
          </div>
        </div>

        <div className="border-t border-slate-100 pt-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            {t.consentTitle}
          </h2>
          <p className="mt-1 text-xs text-slate-400">{t.consentHint}</p>
          <textarea
            name="default_consent_text"
            rows={3}
            defaultValue={profile.default_consent_text ?? ""}
            className="input mt-2"
          />
        </div>

        <SubmitButton>{t.save}</SubmitButton>
      </form>

      <section className="card">
        <h2 className="mb-1 text-sm font-semibold uppercase tracking-wide text-slate-500">
          {t.members}
        </h2>
        <p className="mb-3 text-xs text-slate-400">{t.membersHint}</p>
        <ul className="divide-y divide-slate-100 text-sm">
          {members.map((m) => (
            <li key={m.user_id} className="flex items-center justify-between py-2">
              <span>
                {m.user_id === user!.id ? user!.email : m.user_id.slice(0, 8)}
                {m.user_id === user!.id ? ` (${t.you})` : ""}
              </span>
              <span className="text-xs text-slate-500">
                {m.role === "owner" ? t.owner : t.recruiter}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

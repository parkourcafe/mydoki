import Link from "next/link";
import { redirect } from "next/navigation";
import { getSupabaseServer } from "@/lib/supabase/server";
import { getOrCreateHouseholdId, getUser } from "@/lib/queries";
import { getLocale } from "@/lib/i18n";
import { isMedicalFeaturesDisabledRequest } from "@/lib/isRuStoreRequest";
import { categoryLabel, type DocCategory } from "@/lib/categories";
import { APP_URL } from "@/lib/appUrl";
import CopyButton from "@/components/CopyButton";
import SubmitButton from "@/components/SubmitButton";
import SharePackageManager from "./SharePackageManager";
import { revokeSharePackage } from "./actions";

const M = {
  ru: {
    title: "Поделиться пакетом документов",
    subtitle: "Одна защищённая ссылка на несколько документов — в том числе медицинский пакет для врача.",
    create: "Новая ссылка",
    existing: "Активные ссылки",
    none: "Пока нет активных ссылок.",
    validUntil: "действует до",
    revoke: "Отозвать",
    medical: "Медицинский пакет", draft: "черновик", review: "Проверить перевод", published: "опубликован",
  },
  en: {
    title: "Share a document package",
    subtitle: "One secure link for several documents, including a medical package for a doctor.",
    create: "New link",
    existing: "Active links",
    none: "No active links yet.",
    validUntil: "valid until",
    revoke: "Revoke",
    medical: "Medical package", draft: "draft", review: "Review translation", published: "published",
  },
  id: {
    title: "Bagikan paket dokumen",
    subtitle: "Satu tautan aman untuk beberapa dokumen, termasuk paket medis untuk dokter.",
    create: "Tautan baru",
    existing: "Tautan aktif",
    none: "Belum ada tautan aktif.",
    validUntil: "berlaku hingga",
    revoke: "Cabut",
    medical: "Paket medis", draft: "draf", review: "Tinjau terjemahan", published: "diterbitkan",
  },
  uz: {
    title: "Hujjatlar paketini ulashish",
    subtitle: "Bir nechta hujjat uchun bitta xavfsiz havola, jumladan shifokor uchun tibbiy paket.",
    create: "Yangi havola",
    existing: "Faol havolalar",
    none: "Hozircha faol havola yo‘q.",
    validUntil: "amal qiladi",
    revoke: "Bekor qilish",
    medical: "Tibbiy paket", draft: "qoralama", review: "Tarjimani tekshirish", published: "e’lon qilingan",
  },
} as const;

export default async function SharePackagePage() {
  const [locale, medicalDisabled] = await Promise.all([
    getLocale(),
    isMedicalFeaturesDisabledRequest(),
  ]);
  const user = await getUser();
  if (!user) redirect("/login");
  const t = M[locale];
  const supabase = await getSupabaseServer();
  const householdId = await getOrCreateHouseholdId();

  const [{ data: docsData }, { data: membersData }] = await Promise.all([
    supabase
      .from("documents")
      .select("id, title, category")
      .eq("household_id", householdId)
      .order("created_at", { ascending: false }),
    supabase
      .from("members")
      .select("id, full_name")
      .eq("household_id", householdId)
      .order("created_at"),
  ]);
  const documents = ((docsData ?? []) as { id: string; title: string; category: DocCategory }[])
    .filter((d) => !medicalDisabled || d.category !== "medical")
    .map((d) => ({ id: d.id, title: d.title, sub: categoryLabel(locale, d.category) }));
  const owners = ((membersData ?? []) as { id: string; full_name: string }[]).map(
    (member) => ({ id: member.id, name: member.full_name })
  );

  const { data: pkgData } = await supabase
    .from("share_packages")
    .select("id, title, token, expires_at, package_type, target_locale, published_at")
    .eq("household_id", householdId)
    .is("revoked_at", null)
    .gt("expires_at", new Date().toISOString())
    .order("created_at", { ascending: false });
  const packages = ((pkgData ?? []) as {
    id: string;
    title: string | null;
    token: string;
    expires_at: string;
    package_type: "generic" | "medical_doctor";
    target_locale: string | null;
    published_at: string | null;
  }[]).filter((pkg) => !medicalDisabled || pkg.package_type !== "medical_doctor");

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">{t.title}</h1>
        <p className="mt-1 text-sm text-slate-500">{t.subtitle}</p>
      </div>

      <div className="card">
        <h2 className="mb-3 text-base font-semibold">{t.create}</h2>
        <SharePackageManager
          locale={locale}
          documents={documents}
          owners={owners}
          medicalEnabled={!medicalDisabled}
        />
      </div>

      <div>
        <h2 className="mb-2 text-base font-semibold">{t.existing}</h2>
        {packages.length === 0 ? (
          <p className="text-sm text-slate-400">{t.none}</p>
        ) : (
          <ul className="space-y-2">
            {packages.map((p) => {
              const url = `${APP_URL}/pkg/${p.token}`;
              const medical = p.package_type === "medical_doctor";
              const draft = medical && !p.published_at;
              return (
                <li key={p.id} className="card flex flex-wrap items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      {p.title || url.replace(/^https?:\/\//, "")}
                    </p>
                    {medical && (
                      <p className="mt-0.5 text-xs font-medium text-brand-600">
                        {t.medical} · {draft ? t.draft : t.published}
                      </p>
                    )}
                    <p className="text-xs text-slate-400">
                      {t.validUntil} {new Date(p.expires_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {draft ? (
                      <Link href={`/my/share/${p.id}`} className="btn-primary">{t.review}</Link>
                    ) : (
                      <CopyButton text={url} locale={locale} />
                    )}
                    <form action={revokeSharePackage}>
                      <input type="hidden" name="id" value={p.id} />
                      <SubmitButton className="btn-danger">{t.revoke}</SubmitButton>
                    </form>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

import { getSupabaseServer } from "@/lib/supabase/server";
import { getOrCreateHouseholdId } from "@/lib/queries";
import { getLocale } from "@/lib/i18n";
import { categoryLabel, type DocCategory } from "@/lib/categories";
import CopyButton from "@/components/CopyButton";
import SubmitButton from "@/components/SubmitButton";
import SharePackageManager from "./SharePackageManager";
import { revokeSharePackage } from "./actions";

const M = {
  ru: {
    title: "Поделиться пакетом документов",
    subtitle: "Одна ссылка на несколько документов — отправьте работодателю, партнёру или кому угодно.",
    create: "Новая ссылка",
    existing: "Активные ссылки",
    none: "Пока нет активных ссылок.",
    validUntil: "действует до",
    revoke: "Отозвать",
  },
  en: {
    title: "Share a document package",
    subtitle: "One link for several documents — send it to an employer, a partner, or anyone.",
    create: "New link",
    existing: "Active links",
    none: "No active links yet.",
    validUntil: "valid until",
    revoke: "Revoke",
  },
  id: {
    title: "Bagikan paket dokumen",
    subtitle: "Satu tautan untuk beberapa dokumen — kirim ke perusahaan, mitra, atau siapa saja.",
    create: "Tautan baru",
    existing: "Tautan aktif",
    none: "Belum ada tautan aktif.",
    validUntil: "berlaku hingga",
    revoke: "Cabut",
  },
  uz: {
    title: "Hujjatlar paketini ulashish",
    subtitle: "Bir nechta hujjat uchun bitta havola — ish beruvchi, hamkor yoki istalgan kishiga yuboring.",
    create: "Yangi havola",
    existing: "Faol havolalar",
    none: "Hozircha faol havola yo‘q.",
    validUntil: "amal qiladi",
    revoke: "Bekor qilish",
  },
} as const;

const APP_URL = (process.env.NEXT_PUBLIC_APP_URL || "https://www.doki.help").replace(/\/$/, "");

export default async function SharePackagePage() {
  const locale = await getLocale();
  const t = M[locale];
  const supabase = await getSupabaseServer();
  const householdId = await getOrCreateHouseholdId();

  const { data: docsData } = await supabase
    .from("documents")
    .select("id, title, category")
    .eq("household_id", householdId)
    .order("created_at", { ascending: false });
  const documents = ((docsData ?? []) as { id: string; title: string; category: DocCategory }[]).map(
    (d) => ({ id: d.id, title: d.title, sub: categoryLabel(locale, d.category) })
  );

  const { data: pkgData } = await supabase
    .from("share_packages")
    .select("id, title, token, expires_at")
    .eq("household_id", householdId)
    .is("revoked_at", null)
    .gt("expires_at", new Date().toISOString())
    .order("created_at", { ascending: false });
  const packages = (pkgData ?? []) as { id: string; title: string | null; token: string; expires_at: string }[];

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">{t.title}</h1>
        <p className="mt-1 text-sm text-slate-500">{t.subtitle}</p>
      </div>

      <div className="card">
        <h2 className="mb-3 text-base font-semibold">{t.create}</h2>
        <SharePackageManager locale={locale} documents={documents} />
      </div>

      <div>
        <h2 className="mb-2 text-base font-semibold">{t.existing}</h2>
        {packages.length === 0 ? (
          <p className="text-sm text-slate-400">{t.none}</p>
        ) : (
          <ul className="space-y-2">
            {packages.map((p) => {
              const url = `${APP_URL}/pkg/${p.token}`;
              return (
                <li key={p.id} className="card flex flex-wrap items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      {p.title || url.replace(/^https?:\/\//, "")}
                    </p>
                    <p className="text-xs text-slate-400">
                      {t.validUntil} {new Date(p.expires_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <CopyButton text={url} locale={locale} />
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

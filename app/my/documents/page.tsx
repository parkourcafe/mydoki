import Link from "next/link";
import {
  getOrCreateHouseholdId,
  listAllDocuments,
  listAssets,
  listMembers,
} from "@/lib/queries";
import { categories, type DocCategory } from "@/lib/categories";
import { getLocale } from "@/lib/i18n";

const M = {
  ru: {
    title: "Документы",
    subtitle: "Все документы семьи — разложены по категориям.",
    empty:
      "Документов пока нет. Откройте человека в разделе «Семья» и добавьте первый.",
    noExpiry: "без срока",
    validUntil: (d: string) => `до ${d}`,
  },
  en: {
    title: "Documents",
    subtitle: "All your family's documents — grouped by category.",
    empty:
      "No documents yet. Open a person under “Family” and add the first one.",
    noExpiry: "no expiry",
    validUntil: (d: string) => `until ${d}`,
  },
  id: {
    title: "Dokumen",
    subtitle: "Semua dokumen keluarga — dikelompokkan menurut kategori.",
    empty:
      "Belum ada dokumen. Buka seseorang di “Keluarga” dan tambahkan yang pertama.",
    noExpiry: "tanpa batas",
    validUntil: (d: string) => `sampai ${d}`,
  },
  uz: {
    title: "Hujjatlar",
    subtitle: "Oila hujjatlari — toifalar boʻyicha ajratilgan.",
    empty:
      "Hozircha hujjatlar yoʻq. «Oila» boʻlimida odamni oching va birinchisini qoʻshing.",
    noExpiry: "muddatsiz",
    validUntil: (d: string) => `${d} gacha`,
  },
} as const;

export default async function DocumentsPage() {
  const locale = await getLocale();
  const t = M[locale];

  const householdId = await getOrCreateHouseholdId();
  const [docs, members, assets] = await Promise.all([
    listAllDocuments(householdId),
    listMembers(householdId),
    listAssets(householdId),
  ]);

  const ownerName = new Map<string, string>();
  for (const m of members) ownerName.set(`m:${m.id}`, m.full_name);
  for (const a of assets) ownerName.set(`a:${a.id}`, a.title);

  const byCat = new Map<DocCategory, typeof docs>();
  for (const d of docs) {
    const arr = byCat.get(d.category) ?? [];
    arr.push(d);
    byCat.set(d.category, arr);
  }

  const cats = categories(locale);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">{t.title}</h1>
        <p className="mt-1 text-sm text-slate-500">{t.subtitle}</p>
      </div>

      {docs.length === 0 ? (
        <div className="card text-center text-slate-500">{t.empty}</div>
      ) : (
        <div className="space-y-6">
          {cats
            .filter((c) => byCat.has(c.key as DocCategory))
            .map((c) => (
              <section key={c.key}>
                <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
                  {c.emoji} {c.label}
                </h2>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {byCat.get(c.key as DocCategory)!.map((d) => {
                    const owner = d.member_id
                      ? ownerName.get(`m:${d.member_id}`)
                      : d.asset_id
                        ? ownerName.get(`a:${d.asset_id}`)
                        : null;
                    return (
                      <Link
                        key={d.id}
                        href={`/my/documents/${d.id}`}
                        className="card transition hover:border-brand-300 hover:shadow"
                      >
                        <div className="font-medium">{d.title}</div>
                        <div className="mt-1 text-xs text-slate-500">
                          {owner ? `${owner} · ` : ""}
                          {d.expires_at ? t.validUntil(d.expires_at) : t.noExpiry}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </section>
            ))}
        </div>
      )}
    </div>
  );
}

import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getOrCreateHouseholdId,
  getStorageInfo,
  getUser,
  listAllDocuments,
  listAssets,
  listMembers,
} from "@/lib/queries";
import {
  categories,
  categoryLabel,
  type DocCategory,
} from "@/lib/categories";
import { getLocale } from "@/lib/i18n";
import { aiConfigured, userWantsAi } from "@/lib/classify";
import { isMedicalFeaturesDisabledRequest } from "@/lib/isRuStoreRequest";
import DocumentForm from "@/app/my/members/[id]/DocumentForm";

const M = {
  ru: {
    back: "← Документы",
    empty: "В этом разделе пока нет документов. Добавьте первый ниже.",
    validUntil: (d: string) => `действует до ${d}`,
    noExpiry: "без срока",
    addDocument: "+ Добавить документ",
    noOwners:
      "Сначала добавьте члена семьи в разделе «Семья» — документ нужно к кому-то привязать.",
    toFamily: "Перейти в «Семья»",
    countDocs: (n: number) =>
      `${n} ${n % 10 === 1 && n % 100 !== 11 ? "документ" : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? "документа" : "документов"}`,
  },
  en: {
    back: "← Documents",
    empty: "No documents in this section yet. Add the first one below.",
    validUntil: (d: string) => `valid until ${d}`,
    noExpiry: "no expiry",
    addDocument: "+ Add document",
    noOwners:
      "First add a family member under “Family” — a document has to belong to someone.",
    toFamily: "Go to “Family”",
    countDocs: (n: number) => `${n} ${n === 1 ? "document" : "documents"}`,
  },
  id: {
    back: "← Dokumen",
    empty: "Belum ada dokumen di bagian ini. Tambahkan yang pertama di bawah.",
    validUntil: (d: string) => `berlaku sampai ${d}`,
    noExpiry: "tanpa batas",
    addDocument: "+ Tambah dokumen",
    noOwners:
      "Tambahkan anggota keluarga dulu di “Keluarga” — dokumen harus dimiliki seseorang.",
    toFamily: "Ke “Keluarga”",
    countDocs: (n: number) => `${n} dokumen`,
  },
  uz: {
    back: "← Hujjatlar",
    empty: "Bu boʻlimda hozircha hujjat yoʻq. Birinchisini quyida qoʻshing.",
    validUntil: (d: string) => `${d} gacha amal qiladi`,
    noExpiry: "muddatsiz",
    addDocument: "+ Hujjat qoʻshish",
    noOwners:
      "Avval «Oila» boʻlimida oila aʼzosini qoʻshing — hujjat kimgadir tegishli boʻlishi kerak.",
    toFamily: "«Oila»ga oʻtish",
    countDocs: (n: number) => `${n} ta hujjat`,
  },
} as const;

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ key: string }>;
}) {
  const locale = await getLocale();
  const t = M[locale];
  const { key } = await params;
  const medicalDisabled = await isMedicalFeaturesDisabledRequest();

  const valid = categories(locale).some((c) => c.key === key);
  if (!valid || (medicalDisabled && key === "medical")) notFound();
  const cat = key as DocCategory;

  const householdId = await getOrCreateHouseholdId();
  const [docs, members, assets, storage, user] = await Promise.all([
    listAllDocuments(householdId),
    listMembers(householdId),
    listAssets(householdId),
    getStorageInfo(householdId),
    getUser(),
  ]);
  const aiEnabled = aiConfigured() && userWantsAi(user);

  const inCat = docs.filter((d) => d.category === cat);
  const emoji = categories(locale).find((c) => c.key === cat)?.emoji ?? "🗂️";

  const ownerName = new Map<string, string>();
  for (const m of members) ownerName.set(`m:${m.id}`, m.full_name);
  for (const a of assets) ownerName.set(`a:${a.id}`, a.title);

  const owners = [
    ...members.map((m) => ({
      id: m.id,
      name: m.full_name,
      kind: "member" as const,
    })),
    ...assets.map((a) => ({
      id: a.id,
      name: a.title,
      kind: "asset" as const,
    })),
  ];

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/my/documents"
          className="text-sm text-slate-500 hover:underline"
        >
          {t.back}
        </Link>
        <h1 className="mt-2 flex items-center gap-2 text-2xl font-semibold">
          <span>{emoji}</span>
          <span>{categoryLabel(locale, cat)}</span>
        </h1>
        <p className="text-sm text-slate-500">{t.countDocs(inCat.length)}</p>
      </div>

      {inCat.length === 0 ? (
        <div className="card text-center text-slate-500">{t.empty}</div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {inCat.map((d) => {
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
      )}

      {owners.length === 0 ? (
        <div className="card text-center text-sm text-slate-500">
          {t.noOwners}
          <div className="mt-3">
            <Link href="/my" className="btn-primary inline-block">
              {t.toFamily}
            </Link>
          </div>
        </div>
      ) : (
        <details className="card">
          <summary className="cursor-pointer font-medium">
            {t.addDocument}
          </summary>
          <DocumentForm
            locale={locale}
            owners={owners}
            defaultCategory={cat}
            storageUsed={storage.used}
            storageLimit={storage.limit}
            aiEnabled={aiEnabled}
          />
        </details>
      )}
    </div>
  );
}

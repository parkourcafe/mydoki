import Link from "next/link";
import { getOrCreateHouseholdId, listAllDocuments } from "@/lib/queries";
import { categories, type DocCategory } from "@/lib/categories";
import { getLocale } from "@/lib/i18n";

const M = {
  ru: {
    title: "Документы",
    subtitle: "Выбери раздел — внутри добавляй документы и смотри, что уже есть.",
    docs: (n: number) =>
      n === 0
        ? "пусто"
        : `${n} ${n % 10 === 1 && n % 100 !== 11 ? "документ" : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? "документа" : "документов"}`,
    add: "Добавить",
  },
  en: {
    title: "Documents",
    subtitle: "Pick a section — add documents inside and see what's already there.",
    docs: (n: number) => (n === 0 ? "empty" : `${n} ${n === 1 ? "document" : "documents"}`),
    add: "Add",
  },
  id: {
    title: "Dokumen",
    subtitle: "Pilih bagian — tambahkan dokumen di dalam dan lihat yang sudah ada.",
    docs: (n: number) => (n === 0 ? "kosong" : `${n} dokumen`),
    add: "Tambah",
  },
  uz: {
    title: "Hujjatlar",
    subtitle: "Boʻlimni tanlang — ichida hujjat qoʻshing va qanday hujjatlar borligini koʻring.",
    docs: (n: number) => (n === 0 ? "boʻsh" : `${n} ta hujjat`),
    add: "Qoʻshish",
  },
} as const;

export default async function DocumentsPage() {
  const locale = await getLocale();
  const t = M[locale];

  const householdId = await getOrCreateHouseholdId();
  const docs = await listAllDocuments(householdId);

  const count = new Map<DocCategory, number>();
  for (const d of docs) count.set(d.category, (count.get(d.category) ?? 0) + 1);

  const cats = categories(locale);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">{t.title}</h1>
        <p className="mt-1 text-sm text-slate-500">{t.subtitle}</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {cats.map((c) => {
          const n = count.get(c.key as DocCategory) ?? 0;
          return (
            <Link
              key={c.key}
              href={`/my/documents/category/${c.key}`}
              className="card flex items-center gap-4 transition hover:border-brand-300 hover:shadow"
            >
              <span className="text-3xl">{c.emoji}</span>
              <span className="min-w-0 flex-1">
                <span className="block font-medium">{c.label}</span>
                <span className="block text-xs text-slate-500">{t.docs(n)}</span>
              </span>
              <span
                className={
                  "flex h-7 min-w-7 items-center justify-center rounded-full px-2 text-sm font-semibold " +
                  (n > 0
                    ? "bg-brand-100 text-brand-700"
                    : "bg-slate-100 text-slate-400")
                }
              >
                {n}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

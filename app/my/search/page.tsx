import Link from "next/link";
import {
  getOrCreateHouseholdId,
  listMembers,
  searchDocuments,
} from "@/lib/queries";
import { categories, categoryLabel } from "@/lib/categories";
import { getLocale } from "@/lib/i18n";

const M = {
  ru: {
    title: "Поиск",
    subtitle: "По названию, типу, кем выдан — в пределах вашей семьи.",
    query: "Запрос",
    queryPlaceholder: "паспорт, диплом, страховка…",
    category: "Категория",
    all: "Все",
    searchBtn: "Искать",
    notFound: "Ничего не найдено.",
    until: "до",
    prompt: "Введите запрос или выберите категорию.",
  },
  en: {
    title: "Search",
    subtitle: "By title, type, or issuer — within your family.",
    query: "Query",
    queryPlaceholder: "passport, diploma, insurance…",
    category: "Category",
    all: "All",
    searchBtn: "Search",
    notFound: "Nothing found.",
    until: "until",
    prompt: "Enter a query or pick a category.",
  },
  uz: {
    title: "Qidiruv",
    subtitle: "Nomi, turi yoki kim tomonidan berilgani boʻyicha — oilangiz doirasida.",
    query: "Soʻrov",
    queryPlaceholder: "pasport, diplom, sugʻurta…",
    category: "Toifa",
    all: "Barchasi",
    searchBtn: "Qidirish",
    notFound: "Hech narsa topilmadi.",
    until: "gacha",
    prompt: "Soʻrov kiriting yoki toifani tanlang.",
  },
  id: {
    title: "Cari",
    subtitle: "Berdasarkan judul, jenis, atau penerbit — dalam keluarga Anda.",
    query: "Kueri",
    queryPlaceholder: "paspor, ijazah, asuransi…",
    category: "Kategori",
    all: "Semua",
    searchBtn: "Cari",
    notFound: "Tidak ada yang ditemukan.",
    until: "hingga",
    prompt: "Masukkan kueri atau pilih kategori.",
  },
} as const;

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string }>;
}) {
  const locale = await getLocale();
  const t = M[locale];

  const { q = "", category = "" } = await searchParams;
  const householdId = await getOrCreateHouseholdId();
  const members = await listMembers(householdId);
  const nameOf = new Map(members.map((m) => [m.id, m.full_name]));

  const results =
    q || category
      ? await searchDocuments(householdId, q, category || undefined)
      : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">{t.title}</h1>
        <p className="mt-1 text-sm text-slate-500">
          {t.subtitle}
        </p>
      </div>

      <form method="get" className="flex flex-wrap items-end gap-3">
        <div className="grow">
          <label className="label">{t.query}</label>
          <input
            name="q"
            defaultValue={q}
            className="input"
            placeholder={t.queryPlaceholder}
          />
        </div>
        <div>
          <label className="label">{t.category}</label>
          <select name="category" defaultValue={category} className="input">
            <option value="">{t.all}</option>
            {categories(locale).map((c) => (
              <option key={c.key} value={c.key}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
        <button className="btn-primary">{t.searchBtn}</button>
      </form>

      {q || category ? (
        results.length === 0 ? (
          <div className="card text-center text-slate-500">{t.notFound}</div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {results.map((d) => (
              <Link
                key={d.id}
                href={`/my/documents/${d.id}`}
                className="card transition hover:border-brand-300 hover:shadow"
              >
                <div className="font-medium">{d.title}</div>
                <div className="mt-1 text-xs text-slate-500">
                  {categoryLabel(locale, d.category)} · {nameOf.get(d.member_id ?? "") ?? "—"}
                  {d.expires_at ? ` · ${t.until} ${d.expires_at}` : ""}
                </div>
              </Link>
            ))}
          </div>
        )
      ) : (
        <p className="text-sm text-slate-400">{t.prompt}</p>
      )}
    </div>
  );
}

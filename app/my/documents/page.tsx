import Link from "next/link";
import {
  getOrCreateHouseholdId,
  listAllDocuments,
  listCustomCategories,
} from "@/lib/queries";
import { categories, type DocCategory } from "@/lib/categories";
import { getLocale } from "@/lib/i18n";
import { isRuStoreRequest } from "@/lib/isRuStoreRequest";
import { createDocSection } from "@/app/my/actions";
import SubmitButton from "@/components/SubmitButton";

const M = {
  ru: {
    title: "Документы",
    subtitle: "Выбери раздел — внутри добавляй документы и смотри, что уже есть.",
    docs: (n: number) =>
      n === 0
        ? "пусто"
        : `${n} ${n % 10 === 1 && n % 100 !== 11 ? "документ" : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? "документа" : "документов"}`,
    addSection: "+ Свой раздел",
    addSectionHint: "Заведи раздел под себя — например «Путешествия» или «Питомцы».",
    nameLabel: "Название раздела",
    namePh: "Путешествия",
    emojiLabel: "Значок",
    create: "Создать раздел",
  },
  en: {
    title: "Documents",
    subtitle: "Pick a section — add documents inside and see what's already there.",
    docs: (n: number) => (n === 0 ? "empty" : `${n} ${n === 1 ? "document" : "documents"}`),
    addSection: "+ Your own section",
    addSectionHint: "Create a section of your own — e.g. “Travel” or “Pets”.",
    nameLabel: "Section name",
    namePh: "Travel",
    emojiLabel: "Icon",
    create: "Create section",
  },
  id: {
    title: "Dokumen",
    subtitle: "Pilih bagian — tambahkan dokumen di dalam dan lihat yang sudah ada.",
    docs: (n: number) => (n === 0 ? "kosong" : `${n} dokumen`),
    addSection: "+ Bagian sendiri",
    addSectionHint: "Buat bagian sendiri — misalnya “Perjalanan” atau “Hewan”.",
    nameLabel: "Nama bagian",
    namePh: "Perjalanan",
    emojiLabel: "Ikon",
    create: "Buat bagian",
  },
  uz: {
    title: "Hujjatlar",
    subtitle: "Boʻlimni tanlang — ichida hujjat qoʻshing va qanday hujjatlar borligini koʻring.",
    docs: (n: number) => (n === 0 ? "boʻsh" : `${n} ta hujjat`),
    addSection: "+ Oʻz boʻlimingiz",
    addSectionHint: "Oʻzingizga moslab boʻlim oching — masalan «Sayohatlar» yoki «Uy hayvonlari».",
    nameLabel: "Boʻlim nomi",
    namePh: "Sayohatlar",
    emojiLabel: "Belgi",
    create: "Boʻlim yaratish",
  },
} as const;

export default async function DocumentsPage() {
  const [locale, ruStore] = await Promise.all([
    getLocale(),
    isRuStoreRequest(),
  ]);
  const t = M[locale];

  const householdId = await getOrCreateHouseholdId();
  const [docs, custom] = await Promise.all([
    listAllDocuments(householdId),
    listCustomCategories(householdId),
  ]);

  // Документ в своём разделе не дублируется во встроенной категории.
  const builtinCount = new Map<DocCategory, number>();
  const customCount = new Map<string, number>();
  for (const d of docs) {
    if (d.custom_category_id) {
      customCount.set(
        d.custom_category_id,
        (customCount.get(d.custom_category_id) ?? 0) + 1
      );
    } else {
      builtinCount.set(d.category, (builtinCount.get(d.category) ?? 0) + 1);
    }
  }

  const cats = categories(locale).filter(
    (category) => !ruStore || category.key !== "medical"
  );

  const tiles = [
    ...cats.map((c) => ({
      href: `/my/documents/category/${c.key}`,
      emoji: c.emoji,
      label: c.label,
      n: builtinCount.get(c.key as DocCategory) ?? 0,
    })),
    ...custom.map((c) => ({
      href: `/my/documents/section/${c.id}`,
      emoji: c.emoji || "🗂️",
      label: c.label,
      n: customCount.get(c.id) ?? 0,
    })),
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">{t.title}</h1>
        <p className="mt-1 text-sm text-slate-500">{t.subtitle}</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {tiles.map((tile) => (
          <Link
            key={tile.href}
            href={tile.href}
            className="card flex items-center gap-4 transition hover:border-brand-300 hover:shadow"
          >
            <span className="text-3xl">{tile.emoji}</span>
            <span className="min-w-0 flex-1">
              <span className="block font-medium">{tile.label}</span>
              <span className="block text-xs text-slate-500">{t.docs(tile.n)}</span>
            </span>
            <span
              className={
                "flex h-7 min-w-7 items-center justify-center rounded-full px-2 text-sm font-semibold " +
                (tile.n > 0
                  ? "bg-brand-100 text-brand-700"
                  : "bg-slate-100 text-slate-400")
              }
            >
              {tile.n}
            </span>
          </Link>
        ))}
      </div>

      <details className="card">
        <summary className="cursor-pointer font-medium">{t.addSection}</summary>
        <p className="mt-2 text-sm text-slate-500">{t.addSectionHint}</p>
        <form action={createDocSection} className="mt-3 flex flex-wrap items-end gap-3">
          <div className="w-20">
            <label className="label">{t.emojiLabel}</label>
            <input
              name="emoji"
              maxLength={4}
              className="input text-center"
              placeholder="🧳"
            />
          </div>
          <div className="min-w-[12rem] flex-1">
            <label className="label">{t.nameLabel}</label>
            <input
              name="label"
              required
              className="input"
              placeholder={t.namePh}
            />
          </div>
          <SubmitButton>{t.create}</SubmitButton>
        </form>
      </details>
    </div>
  );
}

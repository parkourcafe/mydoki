import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getMember,
  listDocumentsByMember,
  listRecordsByMember,
} from "@/lib/queries";
import { recordKinds, recordKindLabel, type RecordKind } from "@/lib/categories";
import { getLocale } from "@/lib/i18n";

const M = {
  ru: {
    healthCard: "Медкарта",
    intro: "История записей: анализы, прививки, назначения, питание.",
    all: "Все",
    records: "Записи",
    emptyOfKind: "Записей этого вида пока нет. Добавить можно на странице человека.",
    empty: "Записей пока нет. Добавить можно на странице человека.",
    noDate: "без даты",
    medDocs: "🩺 Медицинские документы",
    until: (d: string) => `до ${d}`,
    noExpiry: "без срока",
  },
  en: {
    healthCard: "Health card",
    intro: "Record history: lab tests, vaccinations, prescriptions, nutrition.",
    all: "All",
    records: "Records",
    emptyOfKind: "No records of this kind yet. You can add them on the person’s page.",
    empty: "No records yet. You can add them on the person’s page.",
    noDate: "no date",
    medDocs: "🩺 Medical documents",
    until: (d: string) => `until ${d}`,
    noExpiry: "no expiry",
  },
  uz: {
    healthCard: "Tibbiy karta",
    intro: "Yozuvlar tarixi: tahlillar, emlashlar, retseptlar, ovqatlanish.",
    all: "Barchasi",
    records: "Yozuvlar",
    emptyOfKind: "Bu turdagi yozuvlar hozircha yoʻq. Ularni shaxs sahifasida qoʻshishingiz mumkin.",
    empty: "Hozircha yozuvlar yoʻq. Ularni shaxs sahifasida qoʻshishingiz mumkin.",
    noDate: "sanasiz",
    medDocs: "🩺 Tibbiy hujjatlar",
    until: (d: string) => `${d} gacha`,
    noExpiry: "muddatsiz",
  },
  id: {
    healthCard: "Kartu kesehatan",
    intro: "Riwayat catatan: hasil lab, vaksinasi, resep, nutrisi.",
    all: "Semua",
    records: "Catatan",
    emptyOfKind: "Belum ada catatan jenis ini. Anda dapat menambahkannya di halaman orang tersebut.",
    empty: "Belum ada catatan. Anda dapat menambahkannya di halaman orang tersebut.",
    noDate: "tanpa tanggal",
    medDocs: "🩺 Dokumen medis",
    until: (d: string) => `sampai ${d}`,
    noExpiry: "tanpa batas waktu",
  },
} as const;

export default async function HealthPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ kind?: string }>;
}) {
  const locale = await getLocale();
  const t = M[locale];
  const { id } = await params;
  const { kind } = await searchParams;
  const member = await getMember(id);
  if (!member) notFound();

  const [records, docs] = await Promise.all([
    listRecordsByMember(id),
    listDocumentsByMember(id),
  ]);

  const filtered = kind ? records.filter((r) => r.kind === kind) : records;
  const medDocs = docs.filter((d) => d.category === "medical");

  const chip = (active: boolean) =>
    `rounded-full px-3 py-1 text-sm ${
      active ? "bg-brand-500 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
    }`;

  return (
    <div className="space-y-8">
      <div>
        <Link
          href={`/my/members/${member.id}`}
          className="text-sm text-slate-500 hover:underline"
        >
          ← {member.full_name}
        </Link>
        <h1 className="mt-2 text-2xl font-semibold">{t.healthCard} · {member.full_name}</h1>
        <p className="text-sm text-slate-500">{t.intro}</p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Link href={`/my/members/${member.id}/health`} className={chip(!kind)}>
          {t.all}
        </Link>
        {recordKinds(locale).map((k) => (
          <Link
            key={k.key}
            href={`/my/members/${member.id}/health?kind=${k.key}`}
            className={chip(kind === k.key)}
          >
            {k.emoji} {k.label}
          </Link>
        ))}
      </div>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
          {t.records}
        </h2>
        {filtered.length === 0 ? (
          <div className="card text-center text-slate-500">
            {kind ? t.emptyOfKind : t.empty}
          </div>
        ) : (
          <ol className="relative space-y-3 border-l border-slate-200 pl-5">
            {filtered.map((r) => {
              const meta = recordKinds(locale).find((k) => k.key === r.kind);
              return (
                <li key={r.id} className="relative">
                  <span className="absolute -left-[27px] top-1 text-base">
                    {meta?.emoji ?? "•"}
                  </span>
                  <div className="card">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{r.title}</span>
                      <span className="text-xs text-slate-400">
                        {r.recorded_at ?? t.noDate}
                      </span>
                    </div>
                    <div className="mt-1 text-xs text-slate-500">
                      {recordKindLabel(locale, r.kind as RecordKind)}
                      {typeof r.data?.note === "string" && r.data.note
                        ? ` · ${r.data.note}`
                        : ""}
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </section>

      {medDocs.length > 0 && (
        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
            {t.medDocs}
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {medDocs.map((d) => (
              <Link
                key={d.id}
                href={`/my/documents/${d.id}`}
                className="card transition hover:border-brand-300 hover:shadow"
              >
                <div className="font-medium">{d.title}</div>
                <div className="mt-1 text-xs text-slate-500">
                  {d.subtype ? `${d.subtype} · ` : ""}
                  {d.expires_at ? t.until(d.expires_at) : t.noExpiry}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getMember,
  getStorageInfo,
  getUser,
  listDocumentsByMember,
  listRecordsByMember,
} from "@/lib/queries";
import {
  categories,
  recordKinds,
  recordKindLabel,
  relationLabel,
  type DocCategory,
  type RecordKind,
} from "@/lib/categories";
import { getLocale } from "@/lib/i18n";
import { isRuStoreRequest } from "@/lib/isRuStoreRequest";
import { aiConfigured, userWantsAi } from "@/lib/classify";
import { createRecord, deleteRecord } from "@/app/my/actions";
import SubmitButton from "@/components/SubmitButton";
import DocumentForm from "./DocumentForm";

const M = {
  ru: {
    back: "← Семья",
    none: "—",
    health: "🩺 Медкарта →",
    noDocs: "Документов пока нет. Добавьте первый ниже.",
    validUntil: (d: string) => `действует до ${d}`,
    noExpiry: "без срока",
    addDocument: "+ Добавить документ",
    records: "Записи",
    recordsEmpty:
      "Структурные записи без файла: анализы, назначения, прививки, питание.",
    noDate: "без даты",
    delete: "удалить",
    addRecord: "+ Добавить запись",
    kind: "Тип",
    date: "Дата",
    title: "Название",
    titlePh: "Общий анализ крови",
    note: "Заметка",
    saveRecord: "Сохранить запись",
    showArchived: "Показать архив",
    hideArchived: "Скрыть архив",
    archivedBadge: "в архиве",
    tipIssuer: "Кем выдан",
    tipNumber: "Номер",
    tipHolder: "Владелец",
    tipTags: "Теги",
  },
  en: {
    back: "← Family",
    none: "—",
    health: "🩺 Health card →",
    noDocs: "No documents yet. Add the first one below.",
    validUntil: (d: string) => `valid until ${d}`,
    noExpiry: "no expiry",
    addDocument: "+ Add document",
    records: "Records",
    recordsEmpty:
      "Structured records without a file: lab tests, prescriptions, vaccinations, nutrition.",
    noDate: "no date",
    delete: "delete",
    addRecord: "+ Add record",
    kind: "Type",
    date: "Date",
    title: "Title",
    titlePh: "Complete blood count",
    note: "Note",
    saveRecord: "Save record",
    showArchived: "Show archive",
    hideArchived: "Hide archive",
    archivedBadge: "archived",
    tipIssuer: "Issued by",
    tipNumber: "Number",
    tipHolder: "Holder",
    tipTags: "Tags",
  },
  uz: {
    back: "← Oila",
    none: "—",
    health: "🩺 Tibbiy karta →",
    noDocs: "Hozircha hujjatlar yoʻq. Birinchisini quyida qoʻshing.",
    validUntil: (d: string) => `${d} gacha amal qiladi`,
    noExpiry: "muddatsiz",
    addDocument: "+ Hujjat qoʻshish",
    records: "Yozuvlar",
    recordsEmpty:
      "Faylsiz tuzilgan yozuvlar: tahlillar, retseptlar, emlashlar, ovqatlanish.",
    noDate: "sanasiz",
    delete: "oʻchirish",
    addRecord: "+ Yozuv qoʻshish",
    kind: "Turi",
    date: "Sana",
    title: "Nomi",
    titlePh: "Umumiy qon tahlili",
    note: "Izoh",
    saveRecord: "Yozuvni saqlash",
    showArchived: "Arxivni koʻrsatish",
    hideArchived: "Arxivni yashirish",
    archivedBadge: "arxivda",
    tipIssuer: "Kim tomonidan berilgan",
    tipNumber: "Raqami",
    tipHolder: "Egasi",
    tipTags: "Teglar",
  },
  id: {
    back: "← Keluarga",
    none: "—",
    health: "🩺 Kartu kesehatan →",
    noDocs: "Belum ada dokumen. Tambahkan yang pertama di bawah.",
    validUntil: (d: string) => `berlaku sampai ${d}`,
    noExpiry: "tanpa batas waktu",
    addDocument: "+ Tambah dokumen",
    records: "Catatan",
    recordsEmpty:
      "Catatan terstruktur tanpa berkas: hasil lab, resep, vaksinasi, nutrisi.",
    noDate: "tanpa tanggal",
    delete: "hapus",
    addRecord: "+ Tambah catatan",
    kind: "Jenis",
    date: "Tanggal",
    title: "Judul",
    titlePh: "Pemeriksaan darah lengkap",
    note: "Catatan",
    saveRecord: "Simpan catatan",
    showArchived: "Tampilkan arsip",
    hideArchived: "Sembunyikan arsip",
    archivedBadge: "diarsipkan",
    tipIssuer: "Diterbitkan oleh",
    tipNumber: "Nomor",
    tipHolder: "Pemilik",
    tipTags: "Tag",
  },
} as const;

export default async function MemberPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ archived?: string }>;
}) {
  const [locale, ruStore] = await Promise.all([
    getLocale(),
    isRuStoreRequest(),
  ]);
  const t = M[locale];
  const { id } = await params;
  const showArchived = (await searchParams).archived === "1";
  const member = await getMember(id);
  if (!member) notFound();

  const [docs, records, storage, user] = await Promise.all([
    listDocumentsByMember(id, showArchived),
    ruStore ? Promise.resolve([]) : listRecordsByMember(id),
    getStorageInfo(member.household_id),
    getUser(),
  ]);
  const aiEnabled = !ruStore && aiConfigured() && userWantsAi(user);
  const visibleDocs = ruStore
    ? docs.filter((document) => document.category !== "medical")
    : docs;

  const byCategory = new Map<DocCategory, typeof visibleDocs>();
  for (const d of visibleDocs) {
    const arr = byCategory.get(d.category) ?? [];
    arr.push(d);
    byCategory.set(d.category, arr);
  }

  return (
    <div className="space-y-8">
      <div>
        <Link href="/my" className="text-sm text-slate-500 hover:underline">
          {t.back}
        </Link>
        <h1 className="mt-2 text-2xl font-semibold">{member.full_name}</h1>
        <p className="text-sm text-slate-500">
          {member.relation ? relationLabel(locale, member.relation) : t.none}
          {member.birth_date ? ` · ${member.birth_date}` : ""}
        </p>
        {!ruStore && (
          <Link
            href={`/my/members/${member.id}/health`}
            className="mt-2 inline-block text-sm font-medium text-brand-600 hover:underline"
          >
            {t.health}
          </Link>
        )}
      </div>

      {/* Документы */}
      {visibleDocs.length === 0 ? (
        <div className="card text-center text-slate-500">
          {t.noDocs}
        </div>
      ) : (
        <div className="space-y-6">
          {categories(locale)
            .filter(
              (c) => (!ruStore || c.key !== "medical") && byCategory.has(c.key)
            )
            .map((c) => (
            <section key={c.key}>
              <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
                {c.emoji} {c.label}
              </h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {byCategory.get(c.key)!.map((d) => {
                  // Тултип наведения: только уже сохранённые метаданные
                  // документа — без обращения к ИИ и лишних запросов.
                  const tip = [
                    d.issuer ? `${t.tipIssuer}: ${d.issuer}` : null,
                    d.doc_number ? `${t.tipNumber}: ${d.doc_number}` : null,
                    d.holder_name ? `${t.tipHolder}: ${d.holder_name}` : null,
                    d.tags?.length ? `${t.tipTags}: ${d.tags.join(", ")}` : null,
                    d.notes ? d.notes : null,
                  ].filter(Boolean) as string[];
                  return (
                    <Link
                      key={d.id}
                      href={`/my/documents/${d.id}`}
                      className="group relative card transition hover:border-brand-300 hover:shadow"
                    >
                      <div className="flex items-center gap-2 font-medium">
                        {d.title}
                        {d.status === "archived" && (
                          <span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs font-normal text-slate-600">
                            {t.archivedBadge}
                          </span>
                        )}
                      </div>
                      <div className="mt-1 text-xs text-slate-500">
                        {d.subtype ? `${d.subtype} · ` : ""}
                        {d.expires_at ? t.validUntil(d.expires_at) : t.noExpiry}
                      </div>
                      {tip.length > 0 && (
                        <div className="pointer-events-none absolute left-0 top-full z-10 mt-1 hidden w-64 rounded-lg border border-slate-200 bg-white p-2.5 text-xs leading-snug text-slate-600 shadow-lg group-hover:block">
                          {tip.map((line, i) => (
                            <p key={i} className={i > 0 ? "mt-1" : ""}>
                              {line}
                            </p>
                          ))}
                        </div>
                      )}
                    </Link>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}

      <Link
        href={showArchived ? `/my/members/${member.id}` : `/my/members/${member.id}?archived=1`}
        className="inline-block text-sm text-slate-500 hover:underline"
      >
        {showArchived ? t.hideArchived : t.showArchived}
      </Link>

      <details className="card">
        <summary className="cursor-pointer font-medium">{t.addDocument}</summary>
        <DocumentForm
          memberId={member.id}
          locale={locale}
          storageUsed={storage.used}
          storageLimit={storage.limit}
          aiEnabled={aiEnabled}
          excludedCategories={ruStore ? ["medical"] : undefined}
        />
      </details>

      {/* Записи (медкарта/заметки без файла) */}
      {!ruStore && (
        <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          {t.records}
        </h2>
        {records.length === 0 ? (
          <p className="text-sm text-slate-400">
            {t.recordsEmpty}
          </p>
        ) : (
          <ul className="space-y-2">
            {records.map((r) => (
              <li
                key={r.id}
                className="flex items-start justify-between gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2"
              >
                <div className="text-sm">
                  <div className="font-medium">
                    {recordKindLabel(locale, r.kind as RecordKind)}: {r.title}
                  </div>
                  <div className="text-xs text-slate-500">
                    {r.recorded_at ?? t.noDate}
                    {typeof r.data?.note === "string" && r.data.note
                      ? ` · ${r.data.note}`
                      : ""}
                  </div>
                </div>
                <form action={deleteRecord}>
                  <input type="hidden" name="id" value={r.id} />
                  <input type="hidden" name="member_id" value={member.id} />
                  <button className="text-xs text-red-500 hover:underline">
                    {t.delete}
                  </button>
                </form>
              </li>
            ))}
          </ul>
        )}

        <details className="card">
          <summary className="cursor-pointer font-medium">{t.addRecord}</summary>
          <form action={createRecord} className="mt-4 grid gap-4 sm:grid-cols-2">
            <input type="hidden" name="member_id" value={member.id} />
            <div>
              <label className="label">{t.kind}</label>
              <select name="kind" className="input" defaultValue="medical_analysis">
                {recordKinds(locale).map((k) => (
                  <option key={k.key} value={k.key}>
                    {k.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">{t.date}</label>
              <input name="recorded_at" type="date" className="input" />
            </div>
            <div className="sm:col-span-2">
              <label className="label">{t.title}</label>
              <input
                name="title"
                required
                className="input"
                placeholder={t.titlePh}
              />
            </div>
            <div className="sm:col-span-2">
              <label className="label">{t.note}</label>
              <textarea name="note" rows={2} className="input" />
            </div>
            <div className="sm:col-span-2">
              <SubmitButton>{t.saveRecord}</SubmitButton>
            </div>
          </form>
        </details>
        </section>
      )}
    </div>
  );
}


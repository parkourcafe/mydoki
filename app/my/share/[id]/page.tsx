import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import CopyButton from "@/components/CopyButton";
import SubmitButton from "@/components/SubmitButton";
import { getLocale } from "@/lib/i18n";
import { canPublishMedicalSummaries } from "@/lib/medicalSummary";
import { isRuStoreRequest } from "@/lib/isRuStoreRequest";
import { getOrCreateHouseholdId, getUser } from "@/lib/queries";
import { getSupabaseServer } from "@/lib/supabase/server";
import { approveMedicalSummary, publishMedicalPackage } from "../actions";

const M = {
  ru: {
    back: "← Все ссылки", title: "Проверка медицинского перевода",
    intro: "Сверьте каждое резюме с оригиналом. Пока вы не подтвердите все документы, ссылка для врача закрыта.",
    warning: "AI переводит только сохранённые факты и заметки. Это не заверенный медицинский перевод и не диагноз.",
    original: "Исходные данные", document: "Открыть оригинальный документ",
    translatedTitle: "Название на Bahasa Indonesia", summary: "Краткое резюме на Bahasa Indonesia",
    facts: "Ключевые факты — по одному на строку", uncertainty: "Неясности — по одной на строку",
    confirm: "Я сверила перевод с оригиналом и подтверждаю этот текст.",
    approve: "Сохранить и подтвердить", approved: "Подтверждено",
    publish: "Открыть ссылку для врача", waiting: "Сначала подтвердите каждый документ.",
    published: "Ссылка для врача опубликована", expires: "Срок действия", inactive: "Пакет истёк или был отозван; опубликовать его нельзя.",
    sourceTitle: "Название", issuer: "Кем выдан", issued: "Дата", holder: "Пациент", notes: "Заметки",
  },
  en: {
    back: "← All links", title: "Review medical translation",
    intro: "Compare every summary with the original. The doctor link stays closed until you approve every document.",
    warning: "AI translates only stored facts and notes. This is not a certified medical translation or a diagnosis.",
    original: "Source data", document: "Open original document",
    translatedTitle: "Title in Bahasa Indonesia", summary: "Short summary in Bahasa Indonesia",
    facts: "Key facts — one per line", uncertainty: "Uncertainties — one per line",
    confirm: "I compared this translation with the original and approve this text.",
    approve: "Save and approve", approved: "Approved",
    publish: "Open the link for the doctor", waiting: "Approve every document first.",
    published: "Doctor link is published", expires: "Expires", inactive: "This package expired or was revoked and cannot be published.",
    sourceTitle: "Title", issuer: "Issuer", issued: "Date", holder: "Patient", notes: "Notes",
  },
  id: {
    back: "← Semua tautan", title: "Tinjau terjemahan medis",
    intro: "Bandingkan setiap ringkasan dengan dokumen asli. Tautan dokter tetap tertutup sampai semua dokumen disetujui.",
    warning: "AI hanya menerjemahkan fakta dan catatan tersimpan. Ini bukan terjemahan medis tersumpah atau diagnosis.",
    original: "Data sumber", document: "Buka dokumen asli",
    translatedTitle: "Judul dalam Bahasa Indonesia", summary: "Ringkasan singkat dalam Bahasa Indonesia",
    facts: "Fakta penting — satu per baris", uncertainty: "Ketidakpastian — satu per baris",
    confirm: "Saya telah membandingkan terjemahan dengan dokumen asli dan menyetujui teks ini.",
    approve: "Simpan dan setujui", approved: "Disetujui",
    publish: "Buka tautan untuk dokter", waiting: "Setujui setiap dokumen terlebih dahulu.",
    published: "Tautan dokter telah diterbitkan", expires: "Berlaku sampai", inactive: "Paket ini kedaluwarsa atau telah dicabut dan tidak dapat diterbitkan.",
    sourceTitle: "Judul", issuer: "Penerbit", issued: "Tanggal", holder: "Pasien", notes: "Catatan",
  },
  uz: {
    back: "← Barcha havolalar", title: "Tibbiy tarjimani tekshirish",
    intro: "Har bir xulosani asl hujjat bilan solishtiring. Barcha hujjatlar tasdiqlanmaguncha shifokor havolasi yopiq qoladi.",
    warning: "AI faqat saqlangan fakt va izohlarni tarjima qiladi. Bu tasdiqlangan tibbiy tarjima yoki tashxis emas.",
    original: "Manba ma’lumotlari", document: "Asl hujjatni ochish",
    translatedTitle: "Bahasa Indonesia tilidagi nom", summary: "Bahasa Indonesia tilidagi qisqa xulosa",
    facts: "Muhim faktlar — har satrda bittadan", uncertainty: "Noaniqliklar — har satrda bittadan",
    confirm: "Tarjimani asl hujjat bilan solishtirdim va ushbu matnni tasdiqlayman.",
    approve: "Saqlash va tasdiqlash", approved: "Tasdiqlangan",
    publish: "Shifokor uchun havolani ochish", waiting: "Avval barcha hujjatlarni tasdiqlang.",
    published: "Shifokor havolasi e’lon qilindi", expires: "Amal muddati", inactive: "Paket muddati tugagan yoki bekor qilingan; uni e’lon qilib bo‘lmaydi.",
    sourceTitle: "Nomi", issuer: "Kim bergan", issued: "Sana", holder: "Bemor", notes: "Izohlar",
  },
} as const;

type SourceSnapshot = {
  title?: string | null;
  issuer?: string | null;
  issued_at?: string | null;
  expires_at?: string | null;
  notes?: string | null;
  holder_name?: string | null;
};

type SummaryRow = {
  package_id: string;
  document_id: string;
  source_snapshot: SourceSnapshot;
  translated_title: string;
  translated_summary: string;
  key_facts: unknown;
  uncertainty_notes: unknown;
  status: string;
};

function lines(value: unknown): string {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string").join("\n")
    : "";
}

const APP_URL = (process.env.NEXT_PUBLIC_APP_URL || "https://doki.help").replace(/\/$/, "");

export default async function MedicalShareReviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [locale, ruStore] = await Promise.all([getLocale(), isRuStoreRequest()]);
  if (ruStore) notFound();
  const user = await getUser();
  if (!user) redirect("/login");
  const t = M[locale];
  const { id } = await params;
  const supabase = await getSupabaseServer();
  const householdId = await getOrCreateHouseholdId();

  const [{ data: pkgData }, { data: summaryData }, { count: documentCount }] = await Promise.all([
    supabase
      .from("share_packages")
      .select("id, title, token, package_type, published_at, expires_at, revoked_at")
      .eq("id", id)
      .eq("household_id", householdId)
      .maybeSingle(),
    supabase
      .from("share_package_summaries")
      .select("package_id, document_id, source_snapshot, translated_title, translated_summary, key_facts, uncertainty_notes, status")
      .eq("package_id", id)
      .order("created_at"),
    supabase
      .from("share_package_documents")
      .select("document_id", { count: "exact", head: true })
      .eq("package_id", id),
  ]);

  if (!pkgData || pkgData.package_type !== "medical_doctor") notFound();
  const summaries = (summaryData ?? []) as SummaryRow[];
  const canPublish = canPublishMedicalSummaries(summaries, documentCount ?? 0);
  const inactive = Boolean(pkgData.revoked_at) || new Date(pkgData.expires_at).getTime() <= Date.now();
  const publicUrl = `${APP_URL}/pkg/${pkgData.token}`;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Link href="/my/share" className="text-sm text-brand-600 hover:underline">{t.back}</Link>
        <h1 className="mt-2 text-2xl font-semibold">{pkgData.title || t.title}</h1>
        <p className="mt-1 text-sm text-slate-500">{t.intro}</p>
      </div>

      <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
        {t.warning}
      </p>

      <div className="space-y-4">
        {summaries.map((summary, index) => {
          const source = summary.source_snapshot ?? {};
          const sourceFields = [
            [t.sourceTitle, source.title],
            [t.holder, source.holder_name],
            [t.issuer, source.issuer],
            [t.issued, source.issued_at],
            [t.notes, source.notes],
          ].filter((field): field is [string, string] => typeof field[1] === "string" && Boolean(field[1]));
          return (
            <section key={summary.document_id} className="card space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="font-semibold">{index + 1}. {source.title || summary.translated_title}</h2>
                {summary.status === "approved" && (
                  <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">✓ {t.approved}</span>
                )}
              </div>

              <details className="rounded-lg bg-slate-50 px-3 py-2 text-sm">
                <summary className="cursor-pointer font-medium text-slate-700">{t.original}</summary>
                <dl className="mt-3 space-y-2">
                  {sourceFields.map(([label, value]) => (
                    <div key={label}>
                      <dt className="text-xs text-slate-400">{label}</dt>
                      <dd className="whitespace-pre-wrap text-slate-700">{value}</dd>
                    </div>
                  ))}
                </dl>
                <Link href={`/my/documents/${summary.document_id}`} target="_blank" className="mt-3 inline-block text-brand-600 hover:underline">
                  {t.document} ↗
                </Link>
              </details>

              <form action={approveMedicalSummary} className="space-y-3">
                <input type="hidden" name="package_id" value={id} />
                <input type="hidden" name="document_id" value={summary.document_id} />
                <div>
                  <label className="label" htmlFor={`title-${summary.document_id}`}>{t.translatedTitle}</label>
                  <input id={`title-${summary.document_id}`} name="translated_title" required maxLength={300}
                    defaultValue={summary.translated_title} className="input" lang="id" />
                </div>
                <div>
                  <label className="label" htmlFor={`summary-${summary.document_id}`}>{t.summary}</label>
                  <textarea id={`summary-${summary.document_id}`} name="translated_summary" required maxLength={5000}
                    defaultValue={summary.translated_summary} className="input min-h-28" lang="id" />
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="label" htmlFor={`facts-${summary.document_id}`}>{t.facts}</label>
                    <textarea id={`facts-${summary.document_id}`} name="key_facts"
                      defaultValue={lines(summary.key_facts)} className="input min-h-24" lang="id" />
                  </div>
                  <div>
                    <label className="label" htmlFor={`uncertainty-${summary.document_id}`}>{t.uncertainty}</label>
                    <textarea id={`uncertainty-${summary.document_id}`} name="uncertainty_notes"
                      defaultValue={lines(summary.uncertainty_notes)} className="input min-h-24" lang="id" />
                  </div>
                </div>
                <label className="flex items-start gap-2 text-sm text-slate-700">
                  <input type="checkbox" name="confirmed" required className="mt-0.5 h-4 w-4" />
                  <span>{t.confirm}</span>
                </label>
                <SubmitButton>{t.approve}</SubmitButton>
              </form>
            </section>
          );
        })}
      </div>

      <section className="card space-y-3">
        <p className="text-sm text-slate-500">{t.expires}: {new Date(pkgData.expires_at).toLocaleString(locale)}</p>
        {inactive ? (
          <p className="text-sm text-red-700">{t.inactive}</p>
        ) : pkgData.published_at ? (
          <>
            <p className="font-medium text-emerald-700">✓ {t.published}</p>
            <code className="block truncate rounded-lg bg-slate-50 px-3 py-2 text-sm">{publicUrl}</code>
            <CopyButton text={publicUrl} locale={locale} />
          </>
        ) : canPublish ? (
          <form action={publishMedicalPackage}>
            <input type="hidden" name="package_id" value={id} />
            <SubmitButton>{t.publish}</SubmitButton>
          </form>
        ) : (
          <p className="text-sm text-amber-700">{t.waiting}</p>
        )}
      </section>
    </div>
  );
}

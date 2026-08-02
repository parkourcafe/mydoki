import Link from "next/link";
import { getSupabaseServer } from "@/lib/supabase/server";
import { getPublicHiringLocale, type Locale } from "@/lib/i18n";
import {
  waLink,
  filterApplicationStageDocuments,
  type ApplicationStatus,
  type RequiredDocument,
} from "@/lib/career";
import type { CandidateOffer } from "@/lib/offer";
import OfferResponse from "./OfferResponse";

export const metadata = {
  robots: { index: false, follow: false },
};

type StatusData = {
  status: ApplicationStatus;
  full_name: string;
  created_at: string;
  vacancy: { title: string; company_name: string; location: string | null; slug: string };
  employer_contact: { whatsapp: string | null; email: string | null } | null;
  offer: CandidateOffer | null;
  timeline: { old_status: string | null; new_status: string; created_at: string }[];
  required_documents: RequiredDocument[];
  documents: { type: string; label: string }[];
};

const M = {
  en: {
    saveTitle: "Keep these documents",
    saveText: "Create a free account and this application — with the documents you uploaded — is saved to your own vault for next time.",
    saveCta: "Save to my account",
    notFoundTitle: "Application not found",
    notFoundText: "This status link is invalid or the application was deleted.",
    yourApplication: "Your application",
    submittedOn: "Submitted on",
    statusLabels: { new: "Submitted", viewed: "Viewed", shortlisted: "Shortlisted", rejected: "Not selected", hired: "Hired 🎉" },
    timeline: "Timeline",
    contact: "Employer contact",
    contactHint: "You've been shortlisted — reach out to the employer:",
    poweredBy: "Powered by",
    docsHeading: "Documents",
    complete: "Complete ✓",
    missing: (n: number) => `Missing ${n} document${n === 1 ? "" : "s"}`,
    missingList: "Still needed:",
  },
  id: {
    saveTitle: "Simpan dokumen ini",
    saveText: "Buat akun gratis dan lamaran ini — beserta dokumen yang Anda unggah — tersimpan di brankas Anda sendiri untuk lamaran berikutnya.",
    saveCta: "Simpan ke akun saya",
    notFoundTitle: "Lamaran tidak ditemukan",
    notFoundText: "Tautan status ini tidak valid atau lamaran telah dihapus.",
    yourApplication: "Lamaran Anda",
    submittedOn: "Dikirim pada",
    statusLabels: { new: "Terkirim", viewed: "Dilihat", shortlisted: "Terpilih", rejected: "Tidak dipilih", hired: "Diterima 🎉" },
    timeline: "Linimasa",
    contact: "Kontak perusahaan",
    contactHint: "Anda terpilih — hubungi perusahaan:",
    poweredBy: "Didukung oleh",
    docsHeading: "Dokumen",
    complete: "Lengkap ✓",
    missing: (n: number) => `Kurang ${n} dokumen`,
    missingList: "Masih dibutuhkan:",
  },
  ru: {
    saveTitle: "Сохранить эти документы",
    saveText: "Заведите бесплатный аккаунт — отклик и загруженные документы сохранятся в вашем сейфе для следующего раза.",
    saveCta: "Сохранить в свой аккаунт",
    notFoundTitle: "Отклик не найден",
    notFoundText: "Ссылка недействительна или отклик был удалён.",
    yourApplication: "Ваш отклик",
    submittedOn: "Отправлено",
    statusLabels: { new: "Отправлено", viewed: "Просмотрено", shortlisted: "В шортлисте", rejected: "Не выбран", hired: "Приняты 🎉" },
    timeline: "История",
    contact: "Контакт работодателя",
    contactHint: "Вас отобрали — свяжитесь с работодателем:",
    poweredBy: "Работает на",
    docsHeading: "Документы",
    complete: "Полный пакет ✓",
    missing: (n: number) => `Не хватает: ${n} док.`,
    missingList: "Ещё нужно:",
  },
  uz: {
    saveTitle: "Bu hujjatlarni saqlang",
    saveText: "Bepul hisob yarating — bu ariza va yuklagan hujjatlaringiz keyingi safar uchun o‘z seyfingizda saqlanadi.",
    saveCta: "Hisobimga saqlash",
    notFoundTitle: "Ariza topilmadi",
    notFoundText: "Havola yaroqsiz yoki ariza o‘chirilgan.",
    yourApplication: "Arizangiz",
    submittedOn: "Yuborilgan sana",
    statusLabels: { new: "Yuborildi", viewed: "Ko‘rildi", shortlisted: "Tanlangan", rejected: "Tanlanmadi", hired: "Qabul qilindi 🎉" },
    timeline: "Vaqt chizig‘i",
    contact: "Ish beruvchi aloqasi",
    contactHint: "Siz tanlandingiz — ish beruvchiga murojaat qiling:",
    poweredBy: "Ishlaydi",
    docsHeading: "Hujjatlar",
    complete: "To‘liq ✓",
    missing: (n: number) => `${n} ta hujjat yetishmayapti`,
    missingList: "Yana kerak:",
  },
} as const;

const LOCALE_CODE: Record<Locale, string> = {
  en: "en-US", id: "id-ID", ru: "ru-RU", uz: "uz-UZ",
};

function fmt(iso: string, locale: Locale): string {
  try {
    return new Intl.DateTimeFormat(LOCALE_CODE[locale], {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen px-4 py-8 sm:py-12">
      <div className="mx-auto w-full max-w-lg">{children}</div>
    </main>
  );
}

export default async function StatusPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const locale = await getPublicHiringLocale();
  const t = M[locale];
  const { token } = await params;

  const supabase = await getSupabaseServer();
  const { data } = await supabase.rpc("get_application_status", { p_token: token });
  const app = data as StatusData | null;

  if (!app) {
    return (
      <Shell>
        <div className="card text-center">
          <div className="mb-2 text-3xl">🔍</div>
          <h1 className="text-lg font-semibold">{t.notFoundTitle}</h1>
          <p className="mt-1 text-sm text-slate-500">{t.notFoundText}</p>
        </div>
      </Shell>
    );
  }

  const statusLabel = (s: string) =>
    t.statusLabels[s as ApplicationStatus] ?? s;

  const badgeCls: Record<ApplicationStatus, string> = {
    new: "bg-blue-100 text-blue-700",
    viewed: "bg-slate-100 text-slate-600",
    shortlisted: "bg-green-100 text-green-700",
    rejected: "bg-red-100 text-red-700",
    hired: "bg-emerald-600 text-white",
  };

  // E2: same completeness check the employer board runs — one required-docs
  // list (application stage only), one source of truth for "lengkap/kurang".
  const requiredOnly = filterApplicationStageDocuments(app.required_documents).filter(
    (d) => d.required !== false,
  );
  const uploadedTypes = new Set(app.documents.map((d) => d.type));
  const missingDocs = requiredOnly.filter((d) => !uploadedTypes.has(d.type));
  const isComplete = missingDocs.length === 0;

  return (
    <Shell>
      <div className="card space-y-5">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-400">
            {t.yourApplication}
          </p>
          <h1 className="mt-1 text-xl font-semibold leading-tight">{app.vacancy.title}</h1>
          <p className="text-sm text-slate-500">
            {app.vacancy.company_name}
            {app.vacancy.location ? ` · ${app.vacancy.location}` : ""}
          </p>
          <p className="mt-1 text-xs text-slate-400">
            {t.submittedOn} {fmt(app.created_at, locale)}
          </p>
        </div>

        <div>
          <span className={`rounded-full px-3 py-1 text-sm font-medium ${badgeCls[app.status]}`}>
            {statusLabel(app.status)}
          </span>
        </div>

        {requiredOnly.length > 0 && (
          <div className="rounded-lg border border-slate-200 p-3">
            <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-slate-400">
              {t.docsHeading}
            </p>
            <span
              className={`rounded-full px-3 py-1 text-sm font-medium ${
                isComplete ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
              }`}
            >
              {isComplete ? t.complete : t.missing(missingDocs.length)}
            </span>
            {!isComplete && (
              <p className="mt-2 text-sm text-slate-600">
                {t.missingList}{" "}
                {missingDocs.map((d) => d.label).join(", ")}
              </p>
            )}
          </div>
        )}

        {app.offer && (
          <OfferResponse locale={locale} token={token} offer={app.offer} />
        )}

        {app.status === "shortlisted" && app.employer_contact && (
          <div className="rounded-lg bg-green-50 p-3 text-sm">
            <p className="font-medium text-green-800">{t.contact}</p>
            <p className="mt-1 text-green-700">{t.contactHint}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {app.employer_contact.whatsapp && (
                <a
                  href={waLink(app.employer_contact.whatsapp)}
                  target="_blank"
                  rel="noreferrer"
                  className="btn border border-green-200 bg-white text-green-700 hover:bg-green-100"
                >
                  💬 {app.employer_contact.whatsapp}
                </a>
              )}
              {app.employer_contact.email && (
                <a
                  href={`mailto:${app.employer_contact.email}`}
                  className="btn border border-green-200 bg-white text-green-700 hover:bg-green-100"
                >
                  ✉️ {app.employer_contact.email}
                </a>
              )}
            </div>
          </div>
        )}

        {/* Timeline */}
        <div>
          <p className="mb-2 text-sm font-medium text-slate-700">{t.timeline}</p>
          <ol className="space-y-3">
            {app.timeline.map((e, i) => (
              <li key={i} className="flex gap-3">
                <div className="mt-1 flex flex-col items-center">
                  <span className="h-2.5 w-2.5 rounded-full bg-brand-500" />
                  {i < app.timeline.length - 1 && (
                    <span className="mt-1 h-full w-px flex-1 bg-slate-200" />
                  )}
                </div>
                <div className="pb-1">
                  <p className="text-sm text-slate-800">{statusLabel(e.new_status)}</p>
                  <p className="text-xs text-slate-400">{fmt(e.created_at, locale)}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>

      <div className="card mt-4">
        <p className="text-sm font-medium text-slate-800">{t.saveTitle}</p>
        <p className="mt-1 text-sm text-slate-500">{t.saveText}</p>
        <Link href={`/apply/claim/${token}`} className="btn-primary mt-3 inline-block">
          {t.saveCta}
        </Link>
      </div>

      <footer className="mt-6 text-center text-xs text-slate-400">
        {t.poweredBy}{" "}
        <Link href="/" className="font-medium text-brand-600 hover:underline">
          doki.help
        </Link>
      </footer>
    </Shell>
  );
}

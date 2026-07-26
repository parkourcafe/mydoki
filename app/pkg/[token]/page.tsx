import { cookies, headers } from "next/headers";
import { getSupabaseServer } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { categoryLabel, type DocCategory } from "@/lib/categories";
import { getLocale, type Locale } from "@/lib/i18n";
import { hashIp, shareCookieName } from "@/lib/shareAccess";
import { unlockShare } from "@/app/s/[token]/actions";

// Приватная страница пакета: не индексируем — токен-URL не должен попасть в поиск.
export const metadata = { robots: { index: false, follow: false } };

type PkgFile = { storage_path: string; file_name: string | null; mime_type: string | null };
type PkgSummary = {
  translated_title: string;
  translated_summary: string;
  key_facts: string[];
  uncertainty_notes: string[];
  source_language: string;
  target_locale: string;
};
type PkgDoc = {
  id: string;
  title: string;
  category: DocCategory;
  issuer: string | null;
  issued_at: string | null;
  expires_at: string | null;
  summary: PkgSummary | null;
  files: PkgFile[];
};
type Pkg = {
  title: string | null;
  allow_download: boolean;
  package_type: "generic" | "medical_doctor";
  target_locale: string | null;
  documents: PkgDoc[];
};

const M = {
  ru: {
    invalidTitle: "Ссылка недействительна",
    invalidIntro: "Срок действия истёк или ссылка отозвана.",
    sharedWithYou: "Документы, которыми с вами поделились",
    noServiceKey: "Предпросмотр файлов временно недоступен. Попробуйте позже.",
    noFiles: "К пакету не прикреплены файлы.",
    validUntil: "действует до",
    open: "Открыть",
    download: "↓ Скачать",
    footer: "🔐 Защищённая ссылка «Семейного сейфа». Доступ ограничен по времени и логируется.",
    pwTitle: "Ссылка защищена паролем", pwHint: "Введите пароль от отправителя.", pwPh: "Пароль", unlock: "Открыть", pwWrong: "Неверный пароль.",
    translatedSummary: "Переводное резюме", keyFacts: "Ключевые факты", uncertainty: "Требует уточнения",
    originalDocument: "Оригинал документа на русском языке", issuedAt: "дата", medicalDisclaimer: "Резюме создано с помощью AI и проверено отправителем. Это не заверенный медицинский перевод и не медицинская рекомендация. Сверяйтесь с оригиналом.",
  },
  en: {
    invalidTitle: "Link is invalid",
    invalidIntro: "It has expired or the link was revoked.",
    sharedWithYou: "Documents shared with you",
    noServiceKey: "File preview is temporarily unavailable. Please try again later.",
    noFiles: "No files are attached to this package.",
    validUntil: "valid until",
    open: "Open",
    download: "↓ Download",
    footer: "🔐 Secure “Family Vault” link. Access is time-limited and logged.",
    pwTitle: "This link is password-protected", pwHint: "Enter the password from the sender.", pwPh: "Password", unlock: "Open", pwWrong: "Wrong password.",
    translatedSummary: "Translated summary", keyFacts: "Key facts", uncertainty: "Needs clarification",
    originalDocument: "Original document in Russian", issuedAt: "issued", medicalDisclaimer: "This summary was created with AI assistance and reviewed by the sender. It is not a certified medical translation or medical advice. Check the original document.",
  },
  id: {
    invalidTitle: "Tautan tidak valid",
    invalidIntro: "Tautan sudah kedaluwarsa atau telah dicabut.",
    sharedWithYou: "Dokumen yang dibagikan kepada Anda",
    noServiceKey: "Pratinjau file sementara tidak tersedia. Coba lagi nanti.",
    noFiles: "Tidak ada file yang terlampir pada paket ini.",
    validUntil: "berlaku hingga",
    open: "Buka",
    download: "↓ Unduh",
    footer: "🔐 Tautan aman “Brankas Keluarga”. Akses dibatasi waktu dan dicatat.",
    pwTitle: "Tautan dilindungi kata sandi", pwHint: "Masukkan kata sandi dari pengirim.", pwPh: "Kata sandi", unlock: "Buka", pwWrong: "Kata sandi salah.",
    translatedSummary: "Ringkasan terjemahan", keyFacts: "Fakta penting", uncertainty: "Perlu diklarifikasi",
    originalDocument: "Dokumen asli dalam bahasa Rusia", issuedAt: "tanggal", medicalDisclaimer: "Ringkasan ini dibuat dengan bantuan AI dan telah diperiksa oleh pengirim. Ini bukan terjemahan medis tersumpah atau nasihat medis. Periksa dokumen asli.",
  },
  uz: {
    invalidTitle: "Havola yaroqsiz",
    invalidIntro: "Muddati o‘tgan yoki havola bekor qilingan.",
    sharedWithYou: "Siz bilan ulashilgan hujjatlar",
    noServiceKey: "Fayllarni oldindan ko‘rish vaqtincha imkonsiz. Keyinroq urinib ko‘ring.",
    noFiles: "Bu paketga fayllar biriktirilmagan.",
    validUntil: "amal qiladi",
    open: "Ochish",
    download: "↓ Yuklab olish",
    footer: "🔐 «Oilaviy seyf»ning xavfsiz havolasi. Kirish vaqt bilan cheklangan va qayd etiladi.",
    pwTitle: "Havola parol bilan himoyalangan", pwHint: "Yuboruvchi bergan parolni kiriting.", pwPh: "Parol", unlock: "Ochish", pwWrong: "Parol notoʻgʻri.",
    translatedSummary: "Tarjima xulosasi", keyFacts: "Muhim faktlar", uncertainty: "Aniqlashtirish kerak",
    originalDocument: "Rus tilidagi asl hujjat", issuedAt: "sana", medicalDisclaimer: "Bu xulosa AI yordamida yaratilib, yuboruvchi tomonidan tekshirilgan. U tasdiqlangan tibbiy tarjima yoki tibbiy maslahat emas. Asl hujjat bilan solishtiring.",
  },
} as const;

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-12">
      <div className="w-full max-w-lg">{children}</div>
    </main>
  );
}

export default async function PackagePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const locale = await getLocale();
  const t = M[locale];
  const { token } = await params;

  const cookieStore = await cookies();
  const pwHash = cookieStore.get(shareCookieName(token))?.value ?? null;
  const h = await headers();
  const ipHash = hashIp((h.get("x-forwarded-for") ?? "").split(",")[0].trim() || null);
  const userAgent = (h.get("user-agent") ?? "").slice(0, 300) || null;

  const supabase = await getSupabaseServer();
  const { data } = await supabase.rpc("get_shared_package", {
    p_token: token,
    p_password_hash: pwHash,
    p_ip_hash: ipHash,
    p_user_agent: userAgent,
  });
  const pkg = data as (Pkg & { locked?: boolean }) | null;

  if (pkg && (pkg as { locked?: boolean }).locked) {
    return (
      <Shell>
        <div className="card text-center">
          <div className="mb-2 text-3xl">🔒</div>
          <h1 className="text-lg font-semibold">{t.pwTitle}</h1>
          <p className="mt-1 text-sm text-slate-500">{t.pwHint}</p>
          {pwHash !== null && <p className="mt-2 text-sm text-red-600">{t.pwWrong}</p>}
          <form action={unlockShare} className="mt-4 flex flex-col gap-2">
            <input type="hidden" name="token" value={token} />
            <input type="hidden" name="scope" value="pkg" />
            <input name="password" type="password" required placeholder={t.pwPh} className="input" />
            <button className="btn-primary">{t.unlock}</button>
          </form>
        </div>
      </Shell>
    );
  }

  if (!pkg) {
    return (
      <Shell>
        <div className="card text-center">
          <div className="mb-2 text-3xl">⛔</div>
          <h1 className="text-lg font-semibold">{t.invalidTitle}</h1>
          <p className="mt-1 text-sm text-slate-500">{t.invalidIntro}</p>
        </div>
      </Shell>
    );
  }

  // Медицинский пакет намеренно открывается на языке врача независимо от
  // локали устройства/аккаунта отправителя. Экран пароля остаётся локальным.
  const displayLocale: Locale = pkg.package_type === "medical_doctor" ? "id" : locale;
  const contentT = M[displayLocale];

  const admin = getSupabaseAdmin();
  const signed: Record<string, string> = {};
  if (admin) {
    const allFiles = pkg.documents.flatMap((d) => d.files);
    await Promise.all(
      allFiles.map(async (f) => {
        const { data: s } = await admin.storage
          .from("vault-files")
          .createSignedUrl(f.storage_path, 300);
        if (s?.signedUrl) signed[f.storage_path] = s.signedUrl;
      })
    );
  }

  return (
    <Shell>
      <div className="card space-y-5">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-400">{contentT.sharedWithYou}</p>
          {pkg.title && <h1 className="mt-1 text-xl font-semibold">{pkg.title}</h1>}
        </div>

        {pkg.package_type === "medical_doctor" && (
          <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
            {contentT.medicalDisclaimer}
          </p>
        )}

        {!admin && (
          <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">{contentT.noServiceKey}</p>
        )}

        {pkg.documents.length === 0 ? (
          <p className="text-sm text-slate-400">{contentT.noFiles}</p>
        ) : (
          <div className="space-y-5">
            {pkg.documents.map((doc) => (
              <div key={doc.id} className="border-t border-slate-100 pt-4 first:border-t-0 first:pt-0">
                {pkg.package_type === "medical_doctor" && doc.summary && (
                  <section className="mb-4 rounded-xl border border-emerald-100 bg-emerald-50/60 p-4" lang="id">
                    <p className="text-xs font-medium uppercase tracking-wide text-emerald-700">{contentT.translatedSummary}</p>
                    <h2 className="mt-1 text-base font-semibold text-slate-900">{doc.summary.translated_title}</h2>
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">{doc.summary.translated_summary}</p>
                    {doc.summary.key_facts.length > 0 && (
                      <div className="mt-3">
                        <p className="text-xs font-semibold text-slate-600">{contentT.keyFacts}</p>
                        <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-slate-700">
                          {doc.summary.key_facts.map((fact, index) => <li key={index}>{fact}</li>)}
                        </ul>
                      </div>
                    )}
                    {doc.summary.uncertainty_notes.length > 0 && (
                      <div className="mt-3 rounded-lg bg-white/80 px-3 py-2">
                        <p className="text-xs font-semibold text-amber-800">{contentT.uncertainty}</p>
                        <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-amber-900">
                          {doc.summary.uncertainty_notes.map((note, index) => <li key={index}>{note}</li>)}
                        </ul>
                      </div>
                    )}
                  </section>
                )}

                {pkg.package_type === "medical_doctor" && (
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{contentT.originalDocument}</p>
                )}
                <p className="mt-1 text-sm font-medium text-slate-800">{doc.title}</p>
                <p className="text-xs text-slate-400">
                  {categoryLabel(displayLocale, doc.category)}
                  {doc.issuer ? ` · ${doc.issuer}` : ""}
                  {doc.issued_at ? ` · ${contentT.issuedAt} ${doc.issued_at}` : ""}
                  {doc.expires_at ? ` · ${contentT.validUntil} ${doc.expires_at}` : ""}
                </p>
                <div className="mt-2 space-y-2">
                  {doc.files.map((f) => {
                    const url = signed[f.storage_path];
                    const isImage = (f.mime_type ?? "").startsWith("image/");
                    return (
                      <div key={f.storage_path}>
                        {isImage && url ? (
                          <div className="overflow-hidden rounded-lg border border-slate-200">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={url} alt={f.file_name ?? doc.title} className="w-full" />
                          </div>
                        ) : (
                          <div className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2 text-sm">
                            <span className="truncate">{f.file_name ?? doc.title}</span>
                            {url && (
                              <a href={url} target="_blank" rel="noreferrer" className="btn-ghost">
                                {contentT.open}
                              </a>
                            )}
                          </div>
                        )}
                        {pkg.allow_download && url && (
                          <a
                            href={url}
                            download={f.file_name ?? true}
                            className="mt-1 inline-block text-sm text-brand-600 hover:underline"
                          >
                            {contentT.download}
                          </a>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        <p className="border-t border-slate-100 pt-3 text-center text-xs text-slate-400">{contentT.footer}</p>
      </div>
    </Shell>
  );
}

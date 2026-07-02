import { getSupabaseServer } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { categoryLabel, type DocCategory } from "@/lib/categories";
import { getLocale } from "@/lib/i18n";

// Приватная страница пакета: не индексируем — токен-URL не должен попасть в поиск.
export const metadata = { robots: { index: false, follow: false } };

type PkgFile = { storage_path: string; file_name: string | null; mime_type: string | null };
type PkgDoc = {
  title: string;
  category: DocCategory;
  issuer: string | null;
  expires_at: string | null;
  files: PkgFile[];
};
type Pkg = { title: string | null; allow_download: boolean; documents: PkgDoc[] };

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

  const supabase = await getSupabaseServer();
  const { data } = await supabase.rpc("get_shared_package", { p_token: token });
  const pkg = data as Pkg | null;

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
          <p className="text-xs uppercase tracking-wide text-slate-400">{t.sharedWithYou}</p>
          {pkg.title && <h1 className="mt-1 text-xl font-semibold">{pkg.title}</h1>}
        </div>

        {!admin ? (
          <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">{t.noServiceKey}</p>
        ) : pkg.documents.length === 0 ? (
          <p className="text-sm text-slate-400">{t.noFiles}</p>
        ) : (
          <div className="space-y-5">
            {pkg.documents.map((doc, di) => (
              <div key={di} className="border-t border-slate-100 pt-3 first:border-t-0 first:pt-0">
                <p className="text-sm font-medium text-slate-800">{doc.title}</p>
                <p className="text-xs text-slate-400">
                  {categoryLabel(locale, doc.category)}
                  {doc.issuer ? ` · ${doc.issuer}` : ""}
                  {doc.expires_at ? ` · ${t.validUntil} ${doc.expires_at}` : ""}
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
                                {t.open}
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
                            {t.download}
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

        <p className="border-t border-slate-100 pt-3 text-center text-xs text-slate-400">{t.footer}</p>
      </div>
    </Shell>
  );
}

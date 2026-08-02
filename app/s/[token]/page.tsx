import { cookies, headers } from "next/headers";
import { getSupabaseServer } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { categoryLabel, type DocCategory } from "@/lib/categories";
import { getLocale } from "@/lib/i18n";
import { hashIp, shareCookieName } from "@/lib/shareAccess";
import { unlockShare } from "./actions";

// Приватная страница расшаренного документа: никогда не индексируем и не
// переходим по ссылкам — токен-URL не должен попадать в поиск.
export const metadata = {
  robots: { index: false, follow: false },
};

type SharedFile = {
  storage_path: string;
  file_name: string | null;
  mime_type: string | null;
};
type SharedDoc = {
  document: {
    title: string;
    category: DocCategory;
    subtype: string | null;
    issuer: string | null;
    issued_at: string | null;
    expires_at: string | null;
  };
  share: { watermark: boolean; allow_download: boolean };
  files: SharedFile[];
};

const M = {
  ru: {
    invalidTitle: "Ссылка недействительна",
    invalidIntro:
      "Срок действия истёк, лимит просмотров исчерпан или ссылка отозвана.",
    sharedWithYou: "Документ, которым с вами поделились",
    validUntil: "действует до",
    noServiceKey: "Предпросмотр файлов временно недоступен. Попробуйте позже.",
    noFiles: "К документу не прикреплены файлы.",
    file: "файл",
    watermark: "Семейный сейф · только просмотр",
    open: "Открыть",
    download: "↓ Скачать оригинал",
    footer:
      "🔐 Защищённая ссылка «Семейного сейфа». Доступ ограничен по времени и логируется.",
    pwTitle: "Ссылка защищена паролем",
    pwHint: "Введите пароль, который прислал отправитель.",
    pwPh: "Пароль",
    unlock: "Открыть",
    pwWrong: "Неверный пароль. Попробуйте ещё раз.",
  },
  en: {
    invalidTitle: "Link is invalid",
    invalidIntro:
      "It has expired, the view limit has been reached, or the link was revoked.",
    sharedWithYou: "A document shared with you",
    validUntil: "valid until",
    noServiceKey: "File preview is temporarily unavailable. Please try again later.",
    noFiles: "No files are attached to this document.",
    file: "file",
    watermark: "Secure document link · view only",
    open: "Open",
    download: "↓ Download original",
    footer:
      "🔐 Secure document link. Access is time-limited and logged.",
    pwTitle: "This link is password-protected",
    pwHint: "Enter the password the sender gave you.",
    pwPh: "Password",
    unlock: "Open",
    pwWrong: "Wrong password. Please try again.",
  },
  id: {
    invalidTitle: "Tautan tidak valid",
    invalidIntro:
      "Tautan sudah kedaluwarsa, batas tampilan tercapai, atau tautan telah dicabut.",
    sharedWithYou: "Dokumen yang dibagikan kepada Anda",
    validUntil: "berlaku hingga",
    noServiceKey: "Pratinjau file untuk sementara tidak tersedia. Coba lagi nanti.",
    noFiles: "Tidak ada file yang terlampir pada dokumen ini.",
    file: "file",
    watermark: "Tautan dokumen aman · hanya lihat",
    open: "Buka",
    download: "↓ Unduh asli",
    footer:
      "🔐 Tautan dokumen aman. Akses dibatasi waktu dan dicatat.",
    pwTitle: "Tautan dilindungi kata sandi",
    pwHint: "Masukkan kata sandi dari pengirim.",
    pwPh: "Kata sandi",
    unlock: "Buka",
    pwWrong: "Kata sandi salah. Coba lagi.",
  },
  uz: {
    invalidTitle: "Havola yaroqsiz",
    invalidIntro:
      "Uning muddati oʻtgan, koʻrishlar chegarasiga yetilgan yoki havola bekor qilingan.",
    sharedWithYou: "Siz bilan ulashilgan hujjat",
    validUntil: "amal qiladi",
    noServiceKey: "Fayllarni oldindan koʻrish vaqtincha imkonsiz. Keyinroq urinib koʻring.",
    noFiles: "Bu hujjatga fayllar biriktirilmagan.",
    file: "fayl",
    watermark: "Oilaviy seyf · faqat koʻrish",
    open: "Ochish",
    download: "↓ Asl nusxasini yuklab olish",
    footer:
      "🔐 «Oilaviy seyf»ning xavfsiz havolasi. Kirish vaqt bilan cheklangan va qayd etiladi.",
    pwTitle: "Havola parol bilan himoyalangan",
    pwHint: "Yuboruvchi bergan parolni kiriting.",
    pwPh: "Parol",
    unlock: "Ochish",
    pwWrong: "Parol notoʻgʻri. Qaytadan urinib koʻring.",
  },
} as const;

function PwForm({
  token,
  t,
  wrong,
}: {
  token: string;
  t: (typeof M)[keyof typeof M];
  wrong: boolean;
}) {
  return (
    <div className="card text-center">
      <div className="mb-2 text-3xl">🔒</div>
      <h1 className="text-lg font-semibold">{t.pwTitle}</h1>
      <p className="mt-1 text-sm text-slate-500">{t.pwHint}</p>
      {wrong && <p className="mt-2 text-sm text-red-600">{t.pwWrong}</p>}
      <form action={unlockShare} className="mt-4 flex flex-col gap-2">
        <input type="hidden" name="token" value={token} />
        <input type="hidden" name="scope" value="s" />
        <input
          name="password"
          type="password"
          required
          placeholder={t.pwPh}
          className="input"
        />
        <button className="btn-primary">{t.unlock}</button>
      </form>
    </div>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-12">
      <div className="w-full max-w-lg">{children}</div>
    </main>
  );
}

export default async function SharePage({
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
  const { data } = await supabase.rpc("get_shared_document", {
    p_token: token,
    p_password_hash: pwHash,
    p_ip_hash: ipHash,
    p_user_agent: userAgent,
  });
  const shared = data as (SharedDoc & { locked?: boolean }) | null;

  // Пароль требуется (или неверный) — показываем форму ввода.
  if (shared && (shared as { locked?: boolean }).locked) {
    return (
      <Shell>
        <PwForm token={token} t={t} wrong={pwHash !== null} />
      </Shell>
    );
  }

  if (!shared) {
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

  const { document: doc, share, files } = shared;

  const admin = getSupabaseAdmin();
  const signed: Record<string, string> = {};
  if (admin) {
    await Promise.all(
      files.map(async (f) => {
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
          <p className="text-xs uppercase tracking-wide text-slate-400">
            {t.sharedWithYou}
          </p>
          <h1 className="mt-1 text-xl font-semibold">{doc.title}</h1>
          <p className="text-sm text-slate-500">
            {categoryLabel(locale, doc.category)}
            {doc.subtype ? ` · ${doc.subtype}` : ""}
            {doc.issuer ? ` · ${doc.issuer}` : ""}
          </p>
          {doc.expires_at && (
            <p className="text-xs text-slate-400">
              {t.validUntil} {doc.expires_at}
            </p>
          )}
        </div>

        {!admin ? (
          <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
            {t.noServiceKey}
          </p>
        ) : files.length === 0 ? (
          <p className="text-sm text-slate-400">{t.noFiles}</p>
        ) : (
          <div className="space-y-4">
            {files.map((f) => {
              const url = signed[f.storage_path];
              const isImage = (f.mime_type ?? "").startsWith("image/");
              return (
                <div key={f.storage_path}>
                  {isImage && url ? (
                    <div className="relative overflow-hidden rounded-lg border border-slate-200">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={url} alt={f.file_name ?? t.file} className="w-full" />
                      {share.watermark && (
                        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                          <span className="rotate-[-25deg] select-none text-2xl font-bold text-black/10">
                            {t.watermark}
                          </span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2 text-sm">
                      <span>{f.file_name ?? t.file}</span>
                      {url && (
                        <a
                          href={url}
                          target="_blank"
                          rel="noreferrer"
                          className="btn-ghost"
                        >
                          {t.open}
                        </a>
                      )}
                    </div>
                  )}
                  {share.allow_download && url && (
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
        )}

        <p className="border-t border-slate-100 pt-3 text-center text-xs text-slate-400">
          {t.footer}
        </p>
      </div>
    </Shell>
  );
}

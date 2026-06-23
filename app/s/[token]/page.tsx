import { getSupabaseServer } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { CATEGORY_LABEL, type DocCategory } from "@/lib/categories";

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
  const { token } = await params;

  const supabase = await getSupabaseServer();
  const { data } = await supabase.rpc("get_shared_document", { p_token: token });
  const shared = data as SharedDoc | null;

  if (!shared) {
    return (
      <Shell>
        <div className="card text-center">
          <div className="mb-2 text-3xl">⛔</div>
          <h1 className="text-lg font-semibold">Ссылка недействительна</h1>
          <p className="mt-1 text-sm text-slate-500">
            Срок действия истёк, лимит просмотров исчерпан или ссылка отозвана.
          </p>
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
            Документ, которым с вами поделились
          </p>
          <h1 className="mt-1 text-xl font-semibold">{doc.title}</h1>
          <p className="text-sm text-slate-500">
            {CATEGORY_LABEL[doc.category]}
            {doc.subtype ? ` · ${doc.subtype}` : ""}
            {doc.issuer ? ` · ${doc.issuer}` : ""}
          </p>
          {doc.expires_at && (
            <p className="text-xs text-slate-400">
              действует до {doc.expires_at}
            </p>
          )}
        </div>

        {!admin ? (
          <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
            Предпросмотр файлов недоступен: на сервере не задан
            <code className="mx-1">SUPABASE_SERVICE_ROLE_KEY</code>.
          </p>
        ) : files.length === 0 ? (
          <p className="text-sm text-slate-400">К документу не прикреплены файлы.</p>
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
                      <img src={url} alt={f.file_name ?? "файл"} className="w-full" />
                      {share.watermark && (
                        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                          <span className="rotate-[-25deg] select-none text-2xl font-bold text-black/10">
                            Семейный сейф · только просмотр
                          </span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2 text-sm">
                      <span>{f.file_name ?? "файл"}</span>
                      {url && (
                        <a
                          href={url}
                          target="_blank"
                          rel="noreferrer"
                          className="btn-ghost"
                        >
                          Открыть
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
                      ↓ Скачать оригинал
                    </a>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <p className="border-t border-slate-100 pt-3 text-center text-xs text-slate-400">
          🔐 Защищённая ссылка «Семейного сейфа». Доступ ограничен по времени и
          логируется.
        </p>
      </div>
    </Shell>
  );
}

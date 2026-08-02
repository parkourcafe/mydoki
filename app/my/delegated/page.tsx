import { redirect } from "next/navigation";
import { getSupabaseServer } from "@/lib/supabase/server";
import { getLocale, type Locale } from "@/lib/i18n";
import {
  type Delegation,
  isActive,
  effectiveStatus,
  statusLabel,
  scopeSummary,
  categoryLabel,
} from "@/lib/delegation";
import { revokeDelegation } from "../actions";

const M = {
  ru: {
    title: "Доступ, выданный мне",
    subtitle: "Документы, к которым вам открыли доступ по цели и на срок.",
    empty: "Вам пока не выдавали делегированный доступ.",
    purpose: "Цель", until: "до", noDocs: "Нет доступных документов в этой области.",
    leave: "Отказаться от доступа", issuer: "Эмитент", expires: "Истекает",
    dateLocale: "ru-RU",
  },
  en: {
    title: "Access granted to me",
    subtitle: "Documents shared with you for a purpose and a limited time.",
    empty: "No delegated access has been granted to you yet.",
    purpose: "Purpose", until: "until", noDocs: "No accessible documents in this scope.",
    leave: "Give up access", issuer: "Issuer", expires: "Expires",
    dateLocale: "en-US",
  },
  id: {
    title: "Akses yang diberikan kepada saya",
    subtitle: "Dokumen yang dibagikan kepada Anda untuk tujuan dan waktu terbatas.",
    empty: "Belum ada akses delegasi yang diberikan kepada Anda.",
    purpose: "Tujuan", until: "hingga", noDocs: "Tidak ada dokumen yang dapat diakses dalam cakupan ini.",
    leave: "Lepaskan akses", issuer: "Penerbit", expires: "Kedaluwarsa",
    dateLocale: "id-ID",
  },
  uz: {
    title: "Menga berilgan kirish",
    subtitle: "Sizga maqsad va muddat bilan ochilgan hujjatlar.",
    empty: "Sizga hali delegatsiya qilingan kirish berilmagan.",
    purpose: "Maqsad", until: "gacha", noDocs: "Bu sohada mavjud hujjatlar yo‘q.",
    leave: "Kirishdan voz kechish", issuer: "Beruvchi", expires: "Tugaydi",
    dateLocale: "uz-UZ",
  },
} as const;

type DocMeta = {
  id: string;
  title: string;
  category: string;
  issuer: string | null;
  issued_at: string | null;
  expires_at: string | null;
};

export default async function DelegatedToMePage() {
  const locale: Locale = await getLocale();
  const t = M[locale];
  const supabase = await getSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: delegs } = await supabase
    .from("vault_delegations")
    .select("*")
    .eq("grantee_user_id", user.id)
    .order("created_at", { ascending: false });
  const delegations = (delegs ?? []) as Delegation[];
  const now = new Date();

  // Документы каждой активной делегации (RLS сам ограничит областью).
  const activeList = delegations.filter((d) => isActive(d, now));
  const docsByDelegation = new Map<string, DocMeta[]>();
  await Promise.all(
    activeList.map(async (d) => {
      const { data } = await supabase
        .from("documents")
        .select("id, title, category, issuer, issued_at, expires_at")
        .eq("household_id", d.household_id)
        .order("category", { ascending: true });
      docsByDelegation.set(d.id, (data ?? []) as DocMeta[]);
    })
  );

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-4">
        <h1 className="text-2xl font-semibold">{t.title}</h1>
        <p className="mt-1 text-sm text-slate-500">{t.subtitle}</p>
      </div>

      {delegations.length === 0 ? (
        <p className="rounded-lg border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-500">
          {t.empty}
        </p>
      ) : (
        <ul className="space-y-4">
          {delegations.map((d) => {
            const st = effectiveStatus(d, now);
            const docs = docsByDelegation.get(d.id) ?? [];
            const active = isActive(d, now);
            return (
              <li key={d.id} className="card">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="font-medium">{scopeSummary(locale, d)}</h2>
                    <p className="text-sm text-slate-500">
                      {t.purpose}: {d.purpose}
                    </p>
                    <p className="text-xs text-slate-400">
                      {statusLabel(locale, st)} · {t.until}{" "}
                      {new Date(d.expires_at).toLocaleDateString(t.dateLocale)}
                    </p>
                  </div>
                  {active && (
                    <form action={revokeDelegation}>
                      <input type="hidden" name="id" value={d.id} />
                      <button className="btn-ghost text-xs">{t.leave}</button>
                    </form>
                  )}
                </div>

                {active && (
                  <div className="mt-3 border-t border-slate-100 pt-3">
                    {docs.length === 0 ? (
                      <p className="text-sm text-slate-400">{t.noDocs}</p>
                    ) : (
                      <ul className="divide-y divide-slate-100">
                        {docs.map((doc) => (
                          <li key={doc.id} className="py-2 text-sm">
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-medium">{doc.title}</span>
                              <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">
                                {categoryLabel(locale, doc.category)}
                              </span>
                            </div>
                            <div className="mt-0.5 flex flex-wrap gap-x-4 text-xs text-slate-400">
                              {doc.issuer && <span>{t.issuer}: {doc.issuer}</span>}
                              {doc.expires_at && (
                                <span>
                                  {t.expires}:{" "}
                                  {new Date(doc.expires_at).toLocaleDateString(t.dateLocale)}
                                </span>
                              )}
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

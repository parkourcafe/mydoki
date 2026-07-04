import Link from "next/link";
import { getSupabaseServer } from "@/lib/supabase/server";
import { getLocale, type Locale } from "@/lib/i18n";

type MyApp = {
  id: string;
  status: "new" | "viewed" | "shortlisted" | "rejected" | "hired";
  created_at: string;
  access_token: string;
  vacancy_title: string;
  company_name: string;
  location: string | null;
};

const M = {
  ru: {
    title: "Мои отклики",
    subtitle: "Куда вы откликнулись и что ответили. Обновления также приходят в WhatsApp.",
    empty: "Вы ещё никуда не откликались. Отклики появятся здесь после отправки.",
    open: "Открыть статус →",
    on: "от",
    st: { new: "Отправлено", viewed: "Просмотрено", shortlisted: "В шортлисте", rejected: "Не выбран", hired: "Приняты 🎉" },
  },
  en: {
    title: "My applications",
    subtitle: "Where you applied and how it's going. Updates also arrive on WhatsApp.",
    empty: "You haven't applied anywhere yet. Your applications will show up here.",
    open: "Open status →",
    on: "on",
    st: { new: "Submitted", viewed: "Viewed", shortlisted: "Shortlisted", rejected: "Not selected", hired: "Hired 🎉" },
  },
  id: {
    title: "Lamaran saya",
    subtitle: "Ke mana Anda melamar dan statusnya. Kabar juga dikirim via WhatsApp.",
    empty: "Anda belum melamar ke mana pun. Lamaran akan muncul di sini.",
    open: "Buka status →",
    on: "pada",
    st: { new: "Terkirim", viewed: "Dilihat", shortlisted: "Terpilih", rejected: "Tidak dipilih", hired: "Diterima 🎉" },
  },
  uz: {
    title: "Mening arizalarim",
    subtitle: "Qayerga ariza berdingiz va holati. Yangiliklar WhatsApp orqali ham keladi.",
    empty: "Hali hech qayerga ariza bermagansiz. Arizalar shu yerda ko‘rinadi.",
    open: "Holatni ochish →",
    on: "sana",
    st: { new: "Yuborildi", viewed: "Ko‘rildi", shortlisted: "Tanlangan", rejected: "Tanlanmadi", hired: "Qabul qilindi 🎉" },
  },
} as const;

const badgeCls: Record<MyApp["status"], string> = {
  new: "bg-blue-100 text-blue-700",
  viewed: "bg-slate-100 text-slate-600",
  shortlisted: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
  hired: "bg-emerald-600 text-white",
};

export default async function MyApplicationsPage() {
  const locale: Locale = await getLocale();
  const t = M[locale];
  const supabase = await getSupabaseServer();
  const { data } = await supabase.rpc("get_my_applications");
  const apps = (data ?? []) as MyApp[];

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-5">
        <h1 className="text-2xl font-semibold">{t.title}</h1>
        <p className="mt-1 text-sm text-slate-500">{t.subtitle}</p>
      </div>

      {apps.length === 0 ? (
        <p className="rounded-lg border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-500">
          {t.empty}
        </p>
      ) : (
        <ul className="space-y-3">
          {apps.map((a) => (
            <li key={a.id} className="card flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate font-medium">{a.vacancy_title}</p>
                <p className="truncate text-sm text-slate-500">
                  {a.company_name}
                  {a.location ? ` · ${a.location}` : ""}
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  {t.on} {new Date(a.created_at).toLocaleDateString()}
                </p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-2">
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${badgeCls[a.status]}`}>
                  {t.st[a.status]}
                </span>
                <Link
                  href={`/applications/status/${a.access_token}`}
                  className="text-xs text-brand-600 hover:underline"
                >
                  {t.open}
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

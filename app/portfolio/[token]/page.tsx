import { getSupabaseServer } from "@/lib/supabase/server";
import { getLocale, type Locale } from "@/lib/i18n";
import { normalizeWhatsapp } from "@/lib/career";

// Портфолио по токен-ссылке не индексируем.
export const metadata = { robots: { index: false, follow: false } };

type Item = {
  title: string;
  description: string | null;
  link: string | null;
  image_path: string | null;
};
type Portfolio = {
  display_name: string | null;
  tagline: string | null;
  about: string | null;
  contact_whatsapp: string | null;
  contact_email: string | null;
  items: Item[];
};

const M = {
  ru: {
    invalidTitle: "Ссылка недействительна",
    invalidIntro: "Портфолио скрыто или ссылка неверна.",
    works: "Работы",
    open: "Открыть →",
    contact: "Связаться",
    whatsapp: "Написать в WhatsApp",
    footer: "🔐 Портфолио на Doki.help",
  },
  en: {
    invalidTitle: "Link is invalid",
    invalidIntro: "The portfolio is hidden or the link is wrong.",
    works: "Works",
    open: "Open →",
    contact: "Contact",
    whatsapp: "Message on WhatsApp",
    footer: "🔐 Portfolio on Doki.help",
  },
  id: {
    invalidTitle: "Tautan tidak valid",
    invalidIntro: "Portofolio disembunyikan atau tautan salah.",
    works: "Karya",
    open: "Buka →",
    contact: "Kontak",
    whatsapp: "Kirim pesan WhatsApp",
    footer: "🔐 Portofolio di Doki.help",
  },
  uz: {
    invalidTitle: "Havola yaroqsiz",
    invalidIntro: "Portfolio yashirilgan yoki havola noto‘g‘ri.",
    works: "Ishlar",
    open: "Ochish →",
    contact: "Bog‘lanish",
    whatsapp: "WhatsApp orqali yozish",
    footer: "🔐 Doki.help’dagi portfolio",
  },
} as const;

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-screen justify-center bg-[#f9f5f0] px-4 py-10">
      <div className="w-full max-w-lg">{children}</div>
    </main>
  );
}

export default async function PublicPortfolioPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const locale: Locale = await getLocale();
  const t = M[locale];

  const supabase = await getSupabaseServer();
  const { data } = await supabase.rpc("get_public_portfolio", { p_token: token });
  const p = data as Portfolio | null;

  if (!p) {
    return (
      <Shell>
        <div className="card text-center">
          <h1 className="text-lg font-semibold">{t.invalidTitle}</h1>
          <p className="mt-1 text-sm text-slate-500">{t.invalidIntro}</p>
        </div>
      </Shell>
    );
  }

  const wa = p.contact_whatsapp ? normalizeWhatsapp(p.contact_whatsapp) : null;
  const waHref = wa ? `https://wa.me/${wa.replace(/[^0-9]/g, "")}` : null;

  return (
    <Shell>
      <div className="space-y-4">
        <header className="card">
          <h1 className="text-xl font-semibold">{p.display_name || "—"}</h1>
          {p.tagline && <p className="mt-0.5 text-sm text-slate-500">{p.tagline}</p>}
          {p.about && <p className="mt-3 whitespace-pre-line text-sm text-slate-700">{p.about}</p>}
          {(waHref || p.contact_email) && (
            <div className="mt-4 flex flex-wrap gap-2">
              {waHref && (
                <a href={waHref} target="_blank" rel="noreferrer" className="btn-primary">
                  {t.whatsapp}
                </a>
              )}
              {p.contact_email && (
                <a href={`mailto:${p.contact_email}`} className="btn-ghost">
                  {p.contact_email}
                </a>
              )}
            </div>
          )}
        </header>

        {p.items.length > 0 && (
          <section className="space-y-3">
            <h2 className="px-1 text-sm font-semibold uppercase tracking-wide text-slate-400">
              {t.works}
            </h2>
            {p.items.map((it, i) => (
              <article key={i} className="card">
                {it.image_path && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={
                      supabase.storage
                        .from("portfolio-images")
                        .getPublicUrl(it.image_path).data.publicUrl
                    }
                    alt=""
                    className="mb-3 max-h-72 w-full rounded-lg object-cover"
                  />
                )}
                <h3 className="font-medium">{it.title}</h3>
                {it.description && (
                  <p className="mt-1 whitespace-pre-line text-sm text-slate-600">{it.description}</p>
                )}
                {it.link && (
                  <a
                    href={it.link}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 inline-block text-sm font-medium text-brand-600 hover:underline"
                  >
                    {t.open}
                  </a>
                )}
              </article>
            ))}
          </section>
        )}

        <p className="pt-2 text-center text-xs text-slate-400">{t.footer}</p>
      </div>
    </Shell>
  );
}

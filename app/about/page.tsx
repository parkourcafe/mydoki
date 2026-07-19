import Link from "next/link";
import type { Metadata } from "next";
import { getLocale } from "@/lib/i18n";
import { SUPPORT_EMAIL, supportWhatsappUrl } from "@/lib/support";

const M = {
  ru: {
    title: "О doki.help",
    lead: "doki.help — защищённая система для документов, найма и трудовых отношений.",
    p1: "Документ создаётся или загружается человеком один раз, используется при найме и остаётся у него после — вместе с его профессиональной историей.",
    p2: "Человек сохраняет контроль над своими документами. Работодатель получает структурированный, безопасный и проверяемый процесс: вакансия, отклики, комплектность документов, факты и пробелы — с проверкой человеком.",
    valuesTitle: "Принципы",
    values: [
      "Документы принадлежат человеку, а не компании.",
      "AI помогает, но решение всегда принимает человек — без баллов и ранжирования.",
      "Доступ к файлам — только по короткоживущим защищённым ссылкам, каждый доступ логируется.",
      "Никаких вердиктов о подлинности документов — только нейтральные проверки.",
    ],
    cta: "Начать",
    ctaEmployers: "Для работодателей",
    operatorTitle: "Оператор",
    operatorLine:
      "doki.help ведёт независимый оператор (ИП, ИНН 780728592634). За брендом — реальный человек, с которым всегда можно связаться.",
    founderLabel: "Основатель",
    contactTitle: "Контакты",
    emailLabel: "Эл. почта",
    waLabel: "WhatsApp",
  },
  en: {
    title: "About doki.help",
    lead: "doki.help is a secure system for documents, hiring and employment.",
    p1: "A document is created or uploaded once, used in hiring, and stays with the person afterwards — together with their professional history.",
    p2: "People keep control of their documents. Employers get a structured, safe and verifiable process: vacancy, applications, document completeness, facts and gaps — reviewed by a human.",
    valuesTitle: "Principles",
    values: [
      "Documents belong to the person, not the company.",
      "AI assists, but a human always makes the decision — no scores, no ranking.",
      "File access only via short-lived secure links; every access is logged.",
      "No verdicts on document authenticity — only neutral checks.",
    ],
    cta: "Get started",
    ctaEmployers: "For employers",
    operatorTitle: "Operator",
    operatorLine:
      "doki.help is run by an independent solo operator (sole proprietor, Tax ID 780728592634). There's no faceless brand here — you can always reach a real person.",
    founderLabel: "Founder",
    contactTitle: "Contact",
    emailLabel: "Email",
    waLabel: "WhatsApp",
  },
  id: {
    title: "Tentang doki.help",
    lead: "doki.help adalah sistem aman untuk dokumen, rekrutmen, dan hubungan kerja.",
    p1: "Dokumen dibuat atau diunggah sekali, dipakai saat rekrutmen, dan tetap milik orangnya sesudahnya — bersama riwayat profesionalnya.",
    p2: "Orang tetap mengendalikan dokumennya. Perusahaan mendapat proses yang terstruktur, aman, dan dapat diverifikasi: lowongan, lamaran, kelengkapan dokumen, fakta dan kekurangan — ditinjau manusia.",
    valuesTitle: "Prinsip",
    values: [
      "Dokumen milik orangnya, bukan perusahaan.",
      "AI membantu, tapi keputusan selalu diambil manusia — tanpa skor, tanpa peringkat.",
      "Akses berkas hanya lewat tautan aman berumur pendek; setiap akses dicatat.",
      "Tidak ada vonis keaslian dokumen — hanya pemeriksaan netral.",
    ],
    cta: "Mulai",
    ctaEmployers: "Untuk perusahaan",
    operatorTitle: "Operator",
    operatorLine:
      "doki.help dijalankan oleh operator independen perorangan (NPWP 780728592634). Tidak ada merek tanpa wajah di sini — Anda selalu bisa menghubungi orang sungguhan.",
    founderLabel: "Pendiri",
    contactTitle: "Kontak",
    emailLabel: "Email",
    waLabel: "WhatsApp",
  },
  uz: {
    title: "doki.help haqida",
    lead: "doki.help — hujjatlar, ishga olish va mehnat munosabatlari uchun xavfsiz tizim.",
    p1: "Hujjat bir marta yaratiladi yoki yuklanadi, ishga olishda ishlatiladi va keyin ham insonda qoladi — kasbiy tarixi bilan birga.",
    p2: "Inson oʻz hujjatlarini nazorat qiladi. Ish beruvchi tuzilgan, xavfsiz va tekshiriladigan jarayonni oladi: vakansiya, arizalar, hujjatlar toʻliqligi, faktlar va kamchiliklar — inson tekshiruvi bilan.",
    valuesTitle: "Tamoyillar",
    values: [
      "Hujjatlar kompaniyaga emas, insonga tegishli.",
      "AI yordam beradi, lekin qarorni doim inson qabul qiladi — ballarsiz va reytingsiz.",
      "Fayllarga kirish faqat qisqa muddatli xavfsiz havolalar orqali; har bir kirish qayd etiladi.",
      "Hujjat haqiqiyligi haqida hukm yoʻq — faqat neytral tekshiruvlar.",
    ],
    cta: "Boshlash",
    ctaEmployers: "Ish beruvchilar uchun",
    operatorTitle: "Operator",
    operatorLine:
      "doki.help mustaqil yakka operator tomonidan yuritiladi (STIR 780728592634). Bu yerda yuzsiz brend yoʻq — siz doim haqiqiy inson bilan bogʻlana olasiz.",
    founderLabel: "Asoschi",
    contactTitle: "Aloqa",
    emailLabel: "Email",
    waLabel: "WhatsApp",
  },
} as const;

export async function generateMetadata(): Promise<Metadata> {
  const t = M[await getLocale()];
  return { title: t.title, description: t.lead };
}

export default async function AboutPage() {
  const locale = await getLocale();
  const t = M[locale];
  // Founder name/photo are optional and env-driven so nothing is fabricated.
  // Set NEXT_PUBLIC_FOUNDER_NAME (and optionally NEXT_PUBLIC_FOUNDER_PHOTO) to show them.
  const founderName = process.env.NEXT_PUBLIC_FOUNDER_NAME || "";
  const founderPhoto = process.env.NEXT_PUBLIC_FOUNDER_PHOTO || "";
  const waUrl = supportWhatsappUrl();
  return (
    <main className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-3xl font-semibold">{t.title}</h1>
      <p className="mt-4 text-lg text-slate-700">{t.lead}</p>
      <p className="mt-4 text-slate-600">{t.p1}</p>
      <p className="mt-3 text-slate-600">{t.p2}</p>

      <h2 className="mt-8 text-sm font-semibold uppercase tracking-wide text-slate-500">
        {t.valuesTitle}
      </h2>
      <ul className="mt-2 list-disc space-y-1 pl-5 text-slate-700">
        {t.values.map((v, i) => (
          <li key={i}>{v}</li>
        ))}
      </ul>

      <div className="mt-10 rounded-2xl border border-[#e8e0d5] bg-[#fdfaf5] p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          {t.operatorTitle}
        </h2>
        <p className="mt-2 text-slate-700">{t.operatorLine}</p>
        {founderName && (
          <div className="mt-4 flex items-center gap-3">
            {founderPhoto && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={founderPhoto}
                alt={founderName}
                className="h-12 w-12 rounded-full border border-[#e8e0d5] object-cover"
              />
            )}
            <div className="text-sm text-slate-700">
              <span className="text-slate-500">{t.founderLabel}: </span>
              {founderName}
            </div>
          </div>
        )}
        <h3 className="mt-5 text-sm font-semibold uppercase tracking-wide text-slate-500">
          {t.contactTitle}
        </h3>
        <ul className="mt-2 space-y-1 text-sm text-slate-700">
          <li>
            {t.emailLabel}:{" "}
            <a href={`mailto:${SUPPORT_EMAIL}`} className="text-[#b85c38] hover:underline">
              {SUPPORT_EMAIL}
            </a>
          </li>
          {waUrl && (
            <li>
              {t.waLabel}:{" "}
              <a href={waUrl} target="_blank" rel="noopener noreferrer" className="text-[#b85c38] hover:underline">
                {waUrl.replace("https://wa.me/", "+")}
              </a>
            </li>
          )}
        </ul>
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/login" className="btn-primary">
          {t.cta}
        </Link>
        <Link href="/for/employers" className="btn-ghost">
          {t.ctaEmployers}
        </Link>
      </div>
    </main>
  );
}

import Link from "next/link";
import type { Metadata } from "next";
import { getLocale } from "@/lib/i18n";

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
  },
} as const;

export async function generateMetadata(): Promise<Metadata> {
  const t = M[await getLocale()];
  return { title: t.title, description: t.lead };
}

export default async function AboutPage() {
  const locale = await getLocale();
  const t = M[locale];
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

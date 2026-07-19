import type { Metadata } from "next";
import Link from "next/link";
import { getLocale, type Locale } from "@/lib/i18n";
import { SUPPORT_EMAIL, supportWhatsappUrl } from "@/lib/support";

type QA = { q: string; a: string };
type Dict = {
  home: string;
  title: string;
  subtitle: string;
  hrTitle: string;
  candidateTitle: string;
  hr: QA[];
  candidate: QA[];
  contact: string;
};

const M: Record<Locale, Dict> = {
  ru: {
    home: "← На главную",
    title: "Частые вопросы",
    subtitle: "Отдельно для HR-команд и для кандидатов, которые загружают документы по ссылке.",
    hrTitle: "Для HR-команд и агентств",
    candidateTitle: "Для кандидатов",
    hr: [
      { q: "Где хранятся данные наших кандидатов?", a: "В защищённом облаке (инфраструктура Supabase) с передачей по HTTPS. Серверы могут находиться за пределами Индонезии — условия трансграничной передачи описаны в Политике конфиденциальности. Доступ изолирован на уровне базы (RLS)." },
      { q: "Кто видит загруженные кандидатом документы?", a: "Только ваша команда и только в рамках конкретной вакансии. Файлы отдаются по короткоживущим подписанным ссылкам, каждый доступ логируется." },
      { q: "Есть ли DPA (соглашение об обработке данных)?", a: "Да. Для пилотов доступен одностраничный DPA (работодатель — контролёр, Doki — процессор) по запросу." },
      { q: "Можно ли выгрузить документы и статусы?", a: "Да, экспорт доступен в любой момент — без привязки к сервису (no lock-in)." },
      { q: "Как удалить данные?", a: "Кандидат может запросить удаление в любой момент. Свой аккаунт вы удаляете сами: «Настройки → Безопасность → Удалить аккаунт»." },
    ],
    candidate: [
      { q: "Кто увидит мой KTP и документы?", a: "Только работодатель, к которому вы откликнулись, и только для этой вакансии. Мы не продаём ваши данные." },
      { q: "Нужен ли аккаунт, чтобы загрузить документы?", a: "Нет. Вы открываете ссылку и загружаете файлы без регистрации. Аккаунт можно создать позже, если захотите сохранить документы себе." },
      { q: "Сколько живёт ссылка?", a: "Срок действия и лимиты задаёт отправитель. Ссылку можно отозвать в любой момент." },
      { q: "Как удалить свои документы?", a: `В согласии указано, что вы можете запросить удаление в любой момент — напишите на ${SUPPORT_EMAIL} или воспользуйтесь страницей статуса отклика.` },
      { q: "Мои данные в безопасности?", a: "Файлы — в приватном хранилище, доступ по подписанным ссылкам и по HTTPS. При инциденте мы уведомляем в течение 3×24 часов." },
    ],
    contact: "Остались вопросы? Напишите нам:",
  },
  en: {
    home: "← Back to home",
    title: "Frequently asked questions",
    subtitle: "Split for HR teams and for candidates who upload documents via a link.",
    hrTitle: "For HR teams & agencies",
    candidateTitle: "For candidates",
    hr: [
      { q: "Where is our candidates' data stored?", a: "In secure cloud (Supabase infrastructure) over HTTPS. Servers may be located outside Indonesia — the cross-border transfer terms are in the Privacy Policy. Access is isolated at the database level (RLS)." },
      { q: "Who can see the documents a candidate uploads?", a: "Only your team, and only for that specific vacancy. Files are served via short-lived signed links, and every access is logged." },
      { q: "Is there a Data Processing Agreement (DPA)?", a: "Yes. A one-page DPA (employer = controller, Doki = processor) is available on request for pilots." },
      { q: "Can we export candidate documents and statuses?", a: "Yes — export is available at any time, with no lock-in." },
      { q: "How is data deleted?", a: "A candidate can request deletion at any time. You delete your own account self-serve: Settings → Security → Delete account." },
    ],
    candidate: [
      { q: "Who will see my KTP and documents?", a: "Only the employer you applied to, and only for that vacancy. We never sell your data." },
      { q: "Do I need an account to upload?", a: "No. You open the link and upload your files without registering. You can create an account later if you want to keep the documents for yourself." },
      { q: "How long does the link live?", a: "The sender sets the expiry and limits. The link can be revoked at any time." },
      { q: "How do I delete my documents?", a: `The consent says you can request deletion at any time — email ${SUPPORT_EMAIL} or use your application status page.` },
      { q: "Is my data safe?", a: "Files live in private storage, served via signed links over HTTPS. If an incident occurs, we notify within 3×24 hours." },
    ],
    contact: "Still have questions? Write to us:",
  },
  id: {
    home: "← Kembali ke beranda",
    title: "Pertanyaan umum",
    subtitle: "Dipisah untuk tim HR dan untuk kandidat yang mengunggah dokumen lewat tautan.",
    hrTitle: "Untuk tim HR & agensi",
    candidateTitle: "Untuk kandidat",
    hr: [
      { q: "Di mana data kandidat kami disimpan?", a: "Di cloud aman (infrastruktur Supabase) lewat HTTPS. Server dapat berada di luar Indonesia — ketentuan transfer lintas negara ada di Kebijakan Privasi. Akses diisolasi pada tingkat basis data (RLS)." },
      { q: "Siapa yang bisa melihat dokumen yang diunggah kandidat?", a: "Hanya tim Anda, dan hanya untuk lowongan tersebut. Berkas disajikan lewat tautan bertanda tangan berumur pendek, dan setiap akses dicatat." },
      { q: "Apakah ada Perjanjian Pemrosesan Data (DPA)?", a: "Ada. DPA satu halaman (perusahaan = pengendali, Doki = pemroses) tersedia atas permintaan untuk pilot." },
      { q: "Bisakah kami mengekspor dokumen dan status kandidat?", a: "Bisa — ekspor tersedia kapan saja, tanpa terkunci (no lock-in)." },
      { q: "Bagaimana data dihapus?", a: "Kandidat dapat meminta penghapusan kapan saja. Anda menghapus akun sendiri: Pengaturan → Keamanan → Hapus akun." },
    ],
    candidate: [
      { q: "Siapa yang akan melihat KTP dan dokumen saya?", a: "Hanya perusahaan tempat Anda melamar, dan hanya untuk lowongan itu. Kami tidak pernah menjual data Anda." },
      { q: "Apakah saya perlu akun untuk mengunggah?", a: "Tidak. Anda membuka tautan dan mengunggah berkas tanpa mendaftar. Anda bisa membuat akun nanti jika ingin menyimpan dokumen untuk diri sendiri." },
      { q: "Berapa lama tautan berlaku?", a: "Pengirim menentukan masa berlaku dan batasannya. Tautan dapat dicabut kapan saja." },
      { q: "Bagaimana cara menghapus dokumen saya?", a: `Persetujuan menyatakan Anda dapat meminta penghapusan kapan saja — email ke ${SUPPORT_EMAIL} atau gunakan halaman status lamaran Anda.` },
      { q: "Apakah data saya aman?", a: "Berkas berada di penyimpanan privat, disajikan lewat tautan bertanda tangan melalui HTTPS. Jika terjadi insiden, kami memberi tahu dalam 3×24 jam." },
    ],
    contact: "Masih ada pertanyaan? Hubungi kami:",
  },
  uz: {
    home: "← Bosh sahifaga",
    title: "Koʻp beriladigan savollar",
    subtitle: "HR jamoalari uchun va havola orqali hujjat yuklaydigan nomzodlar uchun alohida.",
    hrTitle: "HR jamoalari va agentliklar uchun",
    candidateTitle: "Nomzodlar uchun",
    hr: [
      { q: "Nomzodlarimiz maʼlumotlari qayerda saqlanadi?", a: "Xavfsiz bulutda (Supabase infratuzilmasi) HTTPS orqali. Serverlar Indoneziyadan tashqarida boʻlishi mumkin — chegaralararo uzatish shartlari Maxfiylik siyosatida. Kirish maʼlumotlar bazasi darajasida ajratilgan (RLS)." },
      { q: "Nomzod yuklagan hujjatlarni kim koʻra oladi?", a: "Faqat sizning jamoangiz va faqat oʻsha vakansiya doirasida. Fayllar qisqa muddatli imzolangan havolalar orqali beriladi, har bir kirish qayd etiladi." },
      { q: "Maʼlumotlarni qayta ishlash shartnomasi (DPA) bormi?", a: "Ha. Pilotlar uchun bir sahifalik DPA (ish beruvchi — nazoratchi, Doki — qayta ishlovchi) soʻrov boʻyicha mavjud." },
      { q: "Nomzod hujjatlari va holatlarini eksport qilsa boʻladimi?", a: "Ha — eksport istalgan vaqtda mavjud, bogʻlanishsiz (no lock-in)." },
      { q: "Maʼlumotlar qanday oʻchiriladi?", a: "Nomzod istalgan vaqtda oʻchirishni soʻrashi mumkin. Hisobingizni oʻzingiz oʻchirasiz: Sozlamalar → Xavfsizlik → Hisobni oʻchirish." },
    ],
    candidate: [
      { q: "KTP va hujjatlarimni kim koʻradi?", a: "Faqat siz ariza bergan ish beruvchi va faqat oʻsha vakansiya uchun. Biz maʼlumotlaringizni sotmaymiz." },
      { q: "Yuklash uchun hisob kerakmi?", a: "Yoʻq. Havolani ochib, fayllarni roʻyxatdan oʻtmasdan yuklaysiz. Hujjatlarni oʻzingizga saqlamoqchi boʻlsangiz, keyinroq hisob yaratishingiz mumkin." },
      { q: "Havola qancha yashaydi?", a: "Muddat va cheklovlarni joʻnatuvchi belgilaydi. Havolani istalgan vaqtda bekor qilish mumkin." },
      { q: "Hujjatlarimni qanday oʻchiraman?", a: `Rozilikda istalgan vaqtda oʻchirishni soʻrashingiz mumkinligi aytilgan — ${SUPPORT_EMAIL} manziliga yozing yoki ariza holati sahifasidan foydalaning.` },
      { q: "Maʼlumotlarim xavfsizmi?", a: "Fayllar shaxsiy saqlovda, imzolangan havolalar orqali HTTPS bilan beriladi. Hodisa yuz bersa, biz 3×24 soat ichida xabar beramiz." },
    ],
    contact: "Savollaringiz bormi? Bizga yozing:",
  },
};

export async function generateMetadata(): Promise<Metadata> {
  const t = M[await getLocale()];
  return { title: `${t.title} — doki.help`, description: t.subtitle };
}

function Section({ heading, items }: { heading: string; items: QA[] }) {
  return (
    <section className="mt-8">
      <h2 className="text-xl font-semibold text-[#2c2522]">{heading}</h2>
      <div className="mt-4 space-y-4">
        {items.map((it) => (
          <div key={it.q} className="rounded-2xl border border-[#e8e0d5] bg-[#fdfaf5] p-5">
            <div className="font-semibold text-[#2c2522]">{it.q}</div>
            <p className="mt-1.5 text-sm text-[#5c5248]">{it.a}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default async function FaqPage() {
  const locale = await getLocale();
  const t = M[locale];
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [...t.hr, ...t.candidate].map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
  return (
    <main className="mx-auto max-w-3xl px-4 py-12 sm:px-5">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Link href="/" className="text-sm text-[#8a7c6d] hover:underline">
        {t.home}
      </Link>
      <h1 className="heading-font mt-3 text-3xl text-[#2c2522] sm:text-4xl">{t.title}</h1>
      <p className="mt-3 text-[#5c5248]">{t.subtitle}</p>

      <div id="hr" className="scroll-mt-20">
        <Section heading={t.hrTitle} items={t.hr} />
      </div>
      <div id="candidate" className="scroll-mt-20">
        <Section heading={t.candidateTitle} items={t.candidate} />
      </div>

      <p className="mt-8 text-sm text-[#5c5248]">
        {t.contact}{" "}
        <a href={`mailto:${SUPPORT_EMAIL}`} className="text-[#b85c38] hover:underline">
          {SUPPORT_EMAIL}
        </a>
        {supportWhatsappUrl() && (
          <>
            {" · "}
            <a href={supportWhatsappUrl()!} target="_blank" rel="noopener noreferrer" className="text-[#b85c38] hover:underline">
              WhatsApp
            </a>
          </>
        )}
      </p>
    </main>
  );
}

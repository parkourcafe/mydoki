import type { Metadata } from "next";
import Link from "next/link";
import { getLocale, type Locale } from "@/lib/i18n";
import PseBadge from "@/components/PseBadge";

const M = {
  ru: {
    title: "Безопасность",
    subtitle:
      "Мы понимаем, что вы доверяете нам паспорта, медицинские документы и документы детей. Вот как именно мы их защищаем — без общих слов.",
    items: [
      { icon: "👨‍👩‍👧", title: "Только ваша семья видит документы", text: "Доступ изолирован на уровне базы данных (RLS): посторонние и другие семьи не видят ваши документы — это не настройка, а правило в самой базе." },
      { icon: "🗄️", title: "Приватное хранилище файлов", text: "Файлы лежат в закрытом хранилище и наружу отдаются только по коротким подписанным ссылкам (живут около 2 минут). Прямого публичного адреса у файла нет." },
      { icon: "🔗", title: "Безопасный обмен по одному документу", text: "Делитесь не всем архивом, а одним документом — по временной ссылке, которую можно в любой момент отозвать, ограничить числом просмотров и пометить водяным знаком." },
      { icon: "🛡️", title: "Двухфакторный вход и оповещения", text: "Можно включить вход по второму фактору (TOTP). При входе с нового устройства приходит письмо — вы сразу заметите чужой доступ." },
      { icon: "🧾", title: "Журнал доступа", text: "Каждое открытие документа по ссылке записывается в журнал — видно, что и когда смотрели." },
      { icon: "🤖", title: "ИИ-распознавание — по желанию", text: "По умолчанию выключено. Изображение документа уходит ИИ-провайдеру только если вы сами включили распознавание в настройках. Не хотите — документы не покидают сервис ради ИИ." },
      { icon: "☁️", title: "Где хранятся данные", text: "В защищённом облаке (инфраструктура Supabase), передача — по HTTPS. Серверы могут находиться за пределами Индонезии — условия трансграничной передачи описаны в Политике конфиденциальности. Мы не продаём и не передаём ваши данные для рекламы." },
      { icon: "📤", title: "Экспорт и удаление", text: "Свои документы можно выгрузить через экспорт в кабинете в любой момент — без привязки к сервису. Аккаунт и данные вы удаляете сами: «Настройки → Безопасность → Удалить аккаунт»." },
    ],
    incidentTitle: "Инциденты безопасности",
    incidentText: "Если утечка затронет ваши персональные данные, мы обязуемся уведомить затронутых пользователей и уполномоченный орган в течение 3×24 часов — в соответствии с законом Индонезии о защите персональных данных (UU PDP 27/2022). Сообщить о проблеме безопасности: security@doki.help.",
    privacy: "Политика конфиденциальности",
    terms: "Пользовательское соглашение",
    cta: "Создать сейф бесплатно",
    back: "← На главную",
  },
  en: {
    title: "Security",
    subtitle:
      "Candidate and employee documents contain sensitive data. Here's how doki.help helps collect them with more controlled access than ordinary chat.",
    items: [
      { icon: "🏢", title: "Only authorized people see documents", text: "Access is isolated at the database level (RLS) and limited by account, workspace, role, or the link granted." },
      { icon: "🗄️", title: "Private file storage", text: "Files live in a private bucket and are served only via short-lived signed links (about 2 minutes). A file has no public URL." },
      { icon: "🔗", title: "Per-document sharing", text: "Share a single document, not the whole archive — via a temporary link you can revoke anytime, cap by number of views, and mark with a watermark." },
      { icon: "🛡️", title: "Two-factor sign-in and alerts", text: "You can enable a second factor (TOTP). A new-device login triggers an email, so you notice unfamiliar access right away." },
      { icon: "🧾", title: "Access log", text: "Every link-based document view is written to a log — you can see what was opened and when." },
      { icon: "🤖", title: "AI recognition is opt-in", text: "Off by default. A document image is sent to an AI provider only if you turn recognition on yourself in settings. Don't want it — your documents never leave for AI." },
      { icon: "☁️", title: "Where your data lives", text: "In secure cloud (Supabase infrastructure), transferred over HTTPS. Servers may be located outside Indonesia — the cross-border transfer terms are set out in the Privacy Policy. We never sell or share your data for advertising." },
      { icon: "📤", title: "Export and deletion", text: "You can export your documents from the cabinet at any time — no lock-in. You delete your account and data yourself: Settings → Security → Delete account." },
    ],
    incidentTitle: "Security incidents",
    incidentText: "If a breach affects your personal data, we commit to notifying affected users and the relevant authority within 3×24 hours, in line with Indonesia's Personal Data Protection Law (UU PDP 27/2022). Report a suspected security issue to security@doki.help.",
    privacy: "Privacy Policy",
    terms: "Terms of Service",
    cta: "Create a free checklist",
    back: "← Home",
  },
  id: {
    title: "Keamanan",
    subtitle:
      "Dokumen kandidat dan karyawan berisi data sensitif. Begini cara doki.help membantu mengumpulkannya dengan akses yang lebih terkontrol daripada chat biasa.",
    items: [
      { icon: "🏢", title: "Hanya pihak berwenang yang melihat dokumen", text: "Akses diisolasi pada tingkat basis data (RLS) dan dibatasi sesuai akun, ruang kerja, peran, atau tautan yang diberikan." },
      { icon: "🗄️", title: "Penyimpanan berkas privat", text: "Berkas berada di bucket privat dan hanya disajikan lewat tautan bertanda tangan berumur pendek (sekitar 2 menit). Berkas tidak punya URL publik." },
      { icon: "🔗", title: "Berbagi per dokumen", text: "Bagikan satu dokumen, bukan seluruh arsip — lewat tautan sementara yang bisa dicabut kapan saja, dibatasi jumlah tampilan, dan diberi tanda air." },
      { icon: "🛡️", title: "Masuk dua faktor dan peringatan", text: "Anda bisa mengaktifkan faktor kedua (TOTP). Login dari perangkat baru memicu email, jadi Anda langsung tahu akses asing." },
      { icon: "🧾", title: "Log akses", text: "Setiap penampilan dokumen lewat tautan dicatat — Anda bisa melihat apa yang dibuka dan kapan." },
      { icon: "🤖", title: "Pengenalan AI bersifat opsional", text: "Nonaktif secara bawaan. Gambar dokumen dikirim ke penyedia AI hanya jika Anda mengaktifkannya sendiri di pengaturan. Tidak mau — dokumen Anda tidak dikirim untuk AI." },
      { icon: "☁️", title: "Di mana data Anda berada", text: "Di cloud aman (infrastruktur Supabase), ditransfer lewat HTTPS. Server dapat berada di luar Indonesia — ketentuan transfer lintas negara dijelaskan di Kebijakan Privasi. Kami tidak pernah menjual atau membagikan data Anda untuk iklan." },
      { icon: "📤", title: "Ekspor dan penghapusan", text: "Anda bisa mengekspor dokumen dari kabinet kapan saja — tanpa terkunci. Anda menghapus akun dan data sendiri: Pengaturan → Keamanan → Hapus akun." },
    ],
    incidentTitle: "Insiden keamanan",
    incidentText: "Jika terjadi kebocoran yang memengaruhi data pribadi Anda, kami berkomitmen memberi tahu pengguna yang terdampak dan otoritas terkait dalam waktu 3×24 jam, sesuai UU Pelindungan Data Pribadi (UU PDP 27/2022). Laporkan dugaan masalah keamanan ke security@doki.help.",
    privacy: "Kebijakan Privasi",
    terms: "Ketentuan Layanan",
    cta: "Buat checklist gratis",
    back: "← Beranda",
  },
  uz: {
    title: "Xavfsizlik",
    subtitle:
      "Bizga pasportlar, tibbiy hujjatlar va farzandlaringiz hujjatlarini ishonib topshirayotganingizni bilamiz. Ularni qanday himoya qilishimiz — quruq gaplarsiz.",
    items: [
      { icon: "👨‍👩‍👧", title: "Hujjatlarni faqat oilangiz koʻradi", text: "Kirish maʼlumotlar bazasi darajasida ajratilgan (RLS): begonalar va boshqa oilalar hujjatlaringizni koʻra olmaydi — bu sozlama emas, balki bazaning oʻzidagi qoida." },
      { icon: "🗄️", title: "Maxfiy fayl xotirasi", text: "Fayllar yopiq bucketda saqlanadi va faqat qisqa muddatli imzolangan havolalar orqali (taxminan 2 daqiqa) beriladi. Faylning ommaviy manzili yoʻq." },
      { icon: "🔗", title: "Har bir hujjat boʻyicha ulashish", text: "Butun arxivni emas, bitta hujjatni ulashing — istalgan vaqtda bekor qilinadigan, koʻrishlar soni cheklanadigan va suv belgisi qoʻyiladigan muddatli havola orqali." },
      { icon: "🛡️", title: "Ikki bosqichli kirish va ogohlantirishlar", text: "Ikkinchi omilni (TOTP) yoqishingiz mumkin. Yangi qurilmadan kirishda email keladi — begona kirishni darrov sezasiz." },
      { icon: "🧾", title: "Kirish jurnali", text: "Havola orqali har bir hujjat koʻrilishi jurnalga yoziladi — nima va qachon ochilganini koʻrasiz." },
      { icon: "🤖", title: "AI-aniqlash — ixtiyoriy", text: "Standart holatda oʻchirilgan. Hujjat tasviri AI-provayderga faqat siz sozlamalarda aniqlashni yoqsangiz yuboriladi. Istamasangiz — hujjatlaringiz AI uchun chiqib ketmaydi." },
      { icon: "☁️", title: "Maʼlumotlaringiz qayerda", text: "Xavfsiz bulutda (Supabase infratuzilmasi), HTTPS orqali uzatiladi. Serverlar Indoneziyadan tashqarida boʻlishi mumkin — chegaralararo uzatish shartlari Maxfiylik siyosatida yozilgan. Maʼlumotlaringizni reklama uchun hech qachon sotmaymiz yoki bermaymiz." },
      { icon: "📤", title: "Eksport va oʻchirish", text: "Hujjatlaringizni kabinetdagi eksport orqali istalgan vaqtda olib chiqishingiz mumkin — bogʻlanmagan holda. Hisob va maʼlumotlarni Sozlamalar → Xavfsizlik → Hisobni oʻchirish orqali oʻzingiz oʻchirasiz." },
    ],
    incidentTitle: "Xavfsizlik hodisalari",
    incidentText: "Agar maʼlumot sizib chiqishi shaxsiy maʼlumotlaringizga taʼsir qilsa, biz taʼsirlangan foydalanuvchilar va tegishli organni 3×24 soat ichida xabardor qilishga majburmiz — Indoneziyaning shaxsiy maʼlumotlarni himoya qilish qonuni (UU PDP 27/2022) boʻyicha. Xavfsizlik muammosi haqida xabar bering: security@doki.help.",
    privacy: "Maxfiylik siyosati",
    terms: "Foydalanish shartlari",
    cta: "Bepul seyf yaratish",
    back: "← Bosh sahifa",
  },
} as const;

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const t = M[locale];
  return {
    title: t.title,
    description: t.subtitle,
  };
}

export default async function SecurityPage() {
  const locale: Locale = await getLocale();
  const t = M[locale];

  return (
    <main className="mx-auto max-w-3xl px-4 py-12 sm:px-5">
      <Link href="/" className="text-sm text-[#8a7c6d] hover:underline">
        {t.back}
      </Link>
      <h1 className="heading-font mt-3 text-3xl text-[#2c2522] sm:text-4xl">
        {t.title}
      </h1>
      <p className="mt-3 max-w-2xl text-[#5c5248]">{t.subtitle}</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {t.items.map((s) => (
          <div
            key={s.title}
            className="rounded-3xl border border-[#e8e0d5] bg-[#fdfaf5] p-6"
          >
            <div className="flex gap-x-4">
              <div className="text-3xl">{s.icon}</div>
              <div>
                <div className="mb-1.5 text-lg font-semibold">{s.title}</div>
                <p className="text-sm text-[#5c5248]">{s.text}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-3xl border border-[#e8e0d5] bg-white p-6">
        <div className="mb-1.5 font-semibold text-[#2c2522]">
          {t.incidentTitle}
        </div>
        <p className="text-sm text-[#5c5248]">
          {t.incidentText.split("security@doki.help")[0]}
          <a
            href="mailto:security@doki.help"
            className="text-[#b85c38] hover:underline"
          >
            security@doki.help
          </a>
          {t.incidentText.split("security@doki.help")[1] ?? ""}
        </p>
        <p className="mt-3 text-sm">
          <Link href="/privacy" className="text-[#b85c38] hover:underline">
            {t.privacy}
          </Link>
          {" · "}
          <Link href="/terms" className="text-[#b85c38] hover:underline">
            {t.terms}
          </Link>
        </p>
        <PseBadge className="mt-4" />
      </div>

      <div className="mt-8">
        <Link
          href="/login"
          className="accent-btn inline-flex rounded-3xl px-8 py-3 text-base font-semibold"
        >
          {t.cta}
        </Link>
      </div>
    </main>
  );
}

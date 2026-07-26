import type { Metadata } from "next";
import Link from "next/link";
import { getLocale } from "@/lib/i18n";

const META_DESC = {
  ru: "Как Doki.help обрабатывает документы и данные вашей семьи: хранение, доступ, обмен, ИИ и ваши права.",
  en: "How Doki.help handles candidate and employee documents: storage, access, sharing, AI and your rights.",
  id: "Bagaimana Doki.help menangani dokumen kandidat dan karyawan: penyimpanan, akses, berbagi, AI, dan hak Anda.",
  uz: "Doki.help oila hujjatlari va maʼlumotlarini qanday boshqaradi: saqlash, kirish, ulashish, AI va huquqlaringiz.",
} as const;

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  return { title: M[locale].title, description: META_DESC[locale] };
}

function P({ children }: { children: React.ReactNode }) {
  return <p className="mt-2 text-[15px] leading-relaxed text-slate-600">{children}</p>;
}
function H({ children }: { children: React.ReactNode }) {
  return <h2 className="mt-7 text-lg font-semibold text-slate-900">{children}</h2>;
}

const M = {
  ru: {
    home: "← На главную",
    title: "Политика конфиденциальности",
    intro: "Сервис «doki.help» (далее — Сервис). Дата последнего обновления: 23.06.2026.",
    h1: "1. Оператор",
    operatorPre:
      "Оператором обработки персональных данных является владелец Сервиса doki.help, ИНН 780728592634. Контакт для обращений по вопросам данных: ",
    operatorPost: ".",
    h2: "2. Какие данные мы обрабатываем",
    data1: "— Данные аккаунта: адрес электронной почты, а при входе через Google — имя и email из вашего профиля Google.",
    data2:
      "— Содержимое, которое вы загружаете: документы, фотографии, сканы и их реквизиты. Эти материалы могут содержать персональные данные, в том числе специальных категорий (например, медицинские — анализы, заключения).",
    data3:
      "— Технические данные входов: IP-адрес, тип устройства/браузера, время входа (для безопасности и уведомлений о новых входах).",
    data4: "— Номер телефона — только если вы укажете его для SMS-уведомлений.",
    h3: "3. Цели и основание",
    purpose:
      "Мы обрабатываем данные, чтобы предоставлять Сервис: хранить и упорядочивать ваши документы, напоминать о сроках, обеспечивать безопасный доступ и поддержку. Правовое основание — ваше согласие, которое вы даёте при регистрации, и исполнение договора (оказание услуг Сервиса).",
    hSpecial: "3.1. Специальные категории ПДн (сведения о здоровье)",
    special:
      "Если вы загружаете медицинские документы (анализы, заключения, прививочные сертификаты и т.п.), Сервис обрабатывает специальные категории персональных данных — сведения о здоровье. Такая обработка ведётся только при вашем отдельном явном согласии, которое вы даёте при регистрации, и только в отношении данных, которые вы сами загрузили. Вы можете в любой момент удалить эти документы или аккаунт, что прекращает обработку; согласие можно отозвать, написав на support@doki.help.",
    h4: "4. Обработка с помощью ИИ",
    ai: "При использовании функций распознавания документов и AI-помощника часть данных (изображение документа или текст вашего запроса) передаётся стороннему поставщику ИИ для обработки и формирования ответа. Эти функции включаются по вашему действию. Если вы не хотите такой обработки — не пользуйтесь ИИ-функциями.",
    h5: "5. Где хранятся данные",
    storage:
      "Данные хранятся в облачной инфраструктуре нашего поставщика (Supabase) и в защищённом файловом хранилище. Серверы поставщика могут находиться за пределами Российской Федерации. Файлы доступны только по временным подписанным ссылкам.",
    h6: "6. Передача третьим лицам",
    sharing:
      "Мы не продаём ваши данные. Мы передаём их только: (а) поставщикам инфраструктуры (хостинг, база данных, отправка писем/SMS) в объёме, необходимом для работы Сервиса; (б) поставщику ИИ — при использовании соответствующих функций; (в) по законному требованию уполномоченных органов. Кому и когда вы сами открываете документ по ссылке — решаете вы.",
    h7: "7. Защита",
    protection:
      "Данные изолированы по семье на уровне базы (Row Level Security), файлы — в приватном хранилище, передача — по защищённому соединению. Доступны двухфакторная аутентификация и уведомления о входе с нового устройства.",
    h8: "8. Сроки хранения и удаление",
    retentionPre:
      "Мы храним данные, пока активен ваш аккаунт. Вы можете запросить удаление аккаунта и данных, написав на ",
    retentionPost: ".",
    h9: "9. Ваши права",
    rights:
      "Вы вправе получить доступ к своим данным, исправить их, удалить, а также отозвать согласие на обработку. Для этого свяжитесь с нами по указанному адресу.",
    h10: "10. Изменения",
    changes:
      "Мы можем обновлять эту Политику. Актуальная версия всегда доступна на этой странице.",
    consent:
      "Используя Сервис, вы подтверждаете, что ознакомлены с настоящей Политикой и даёте согласие на обработку персональных данных на изложенных условиях.",
  },
  en: {
    home: "← Back to home",
    title: "Privacy Policy",
    intro: "The “doki.help” service (hereinafter — the Service). Last updated: 23.06.2026.",
    h1: "1. Operator",
    operatorPre:
      "The operator processing personal data is the owner of the doki.help Service, foreign tax number 780728592634. Contact for data-related inquiries: ",
    operatorPost: ".",
    h2: "2. What data we process",
    data1: "— Account data: your email address, and when signing in via Google — your name and email from your Google profile.",
    data2:
      "— Content you upload: documents, photos, scans and their details. These materials may contain personal data, including special categories (for example, medical data — test results, reports).",
    data3:
      "— Technical sign-in data: IP address, device/browser type, sign-in time (for security and new-login notifications).",
    data4: "— Phone number — only if you provide it for SMS notifications.",
    h3: "3. Purposes and legal basis",
    purpose:
      "We process data to provide the Service: to collect, store, and organize candidate and employee documents, support document checklists, provide controlled access, and help with reminders or status tracking. The legal basis is your consent, given upon registration, and the performance of the contract (provision of the Service).",
    hSpecial: "3.1. Special categories of personal data (health information)",
    special:
      "If you upload medical documents (test results, reports, vaccination certificates, etc.), the Service processes special categories of personal data — health information. Such processing is carried out only with your separate explicit consent, given at registration, and only in respect of the data you upload yourself. You can delete these documents or your account at any time, which stops the processing; consent can be withdrawn by writing to support@doki.help.",
    h4: "4. AI processing",
    ai: "When using document recognition and AI assistant features, part of your data (the document image or the text of your request) is transferred to a third-party AI provider for processing and generating a response. These features are activated by your action. If you do not want such processing — do not use the AI features.",
    h5: "5. Where data is stored",
    storage:
      "Data is stored in the cloud infrastructure of our provider (Supabase) and in secure file storage. The provider's servers may be located outside the Russian Federation. Files are accessible only via temporary signed links.",
    h6: "6. Sharing with third parties",
    sharing:
      "We do not sell your data. We share it only: (a) with infrastructure providers (hosting, database, sending of emails/SMS) to the extent necessary for the Service to operate; (b) with the AI provider — when the relevant features are used; (c) at the lawful request of authorized bodies. You decide for yourself to whom and when you open a document via a link.",
    h7: "7. Protection",
    protection:
      "Data is isolated per account and workspace at the database level (Row Level Security), files are kept in private storage, and transmission is over a secure connection. Document access is limited according to roles and links granted.",
    h8: "8. Retention and deletion",
    retentionPre:
      "We keep data while your account is active. You can request deletion of your account and data by writing to ",
    retentionPost: ".",
    h9: "9. Your rights",
    rights:
      "You have the right to access your data, correct it, delete it, and withdraw your consent to processing. To do so, contact us at the address indicated.",
    h10: "10. Changes",
    changes:
      "We may update this Policy. The current version is always available on this page.",
    consent:
      "By using the Service, you confirm that you have read this Policy and consent to the processing of personal data under the stated terms.",
  },
  id: {
    home: "← Kembali ke beranda",
    title: "Kebijakan Privasi",
    intro: "Layanan “doki.help” (selanjutnya disebut — Layanan). Terakhir diperbarui: 23.06.2026.",
    h1: "1. Operator",
    operatorPre:
      "Operator yang memproses data pribadi adalah pemilik Layanan doki.help, nomor pajak luar negeri 780728592634. Kontak untuk pertanyaan terkait data: ",
    operatorPost: ".",
    h2: "2. Data apa yang kami proses",
    data1: "— Data akun: alamat email Anda, dan saat masuk melalui Google — nama dan email dari profil Google Anda.",
    data2:
      "— Konten yang Anda unggah: dokumen, foto, pindaian, dan detailnya. Materi ini dapat memuat data pribadi, termasuk kategori khusus (misalnya data medis — hasil tes, laporan).",
    data3:
      "— Data teknis saat masuk: alamat IP, jenis perangkat/peramban, waktu masuk (untuk keamanan dan pemberitahuan login baru).",
    data4: "— Nomor telepon — hanya jika Anda mencantumkannya untuk pemberitahuan SMS.",
    h3: "3. Tujuan dan dasar hukum",
    purpose:
      "Kami memproses data untuk menyediakan Layanan: menyimpan dan menata dokumen Anda, mengingatkan tenggat waktu, serta memastikan akses dan dukungan yang aman. Dasar hukumnya adalah persetujuan Anda yang diberikan saat pendaftaran, dan pelaksanaan perjanjian (penyediaan Layanan).",
    hSpecial: "3.1. Kategori khusus data pribadi (informasi kesehatan)",
    special:
      "Jika Anda mengunggah dokumen medis (hasil tes, laporan, sertifikat vaksinasi, dll.), Layanan memproses kategori khusus data pribadi — informasi kesehatan. Pemrosesan tersebut hanya dilakukan dengan persetujuan eksplisit terpisah dari Anda yang diberikan saat pendaftaran, dan hanya atas data yang Anda unggah sendiri. Anda dapat menghapus dokumen ini atau akun Anda kapan saja, yang menghentikan pemrosesan; persetujuan dapat ditarik dengan menulis ke support@doki.help.",
    h4: "4. Pemrosesan dengan AI",
    ai: "Saat menggunakan fitur pengenalan dokumen dan asisten AI, sebagian data (gambar dokumen atau teks permintaan Anda) dikirim ke penyedia AI pihak ketiga untuk diproses dan menghasilkan tanggapan. Fitur ini diaktifkan oleh tindakan Anda. Jika Anda tidak menginginkan pemrosesan seperti itu — jangan gunakan fitur AI.",
    h5: "5. Di mana data disimpan",
    storage:
      "Data disimpan dalam infrastruktur cloud penyedia kami (Supabase) dan dalam penyimpanan berkas yang aman. Server penyedia dapat berada di luar Federasi Rusia. Berkas hanya dapat diakses melalui tautan bertanda tangan sementara.",
    h6: "6. Pembagian kepada pihak ketiga",
    sharing:
      "Kami tidak menjual data Anda. Kami membagikannya hanya: (a) kepada penyedia infrastruktur (hosting, basis data, pengiriman email/SMS) sebatas yang diperlukan untuk pengoperasian Layanan; (b) kepada penyedia AI — saat fitur terkait digunakan; (c) atas permintaan sah dari otoritas yang berwenang. Anda sendiri yang memutuskan kepada siapa dan kapan Anda membuka dokumen melalui tautan.",
    h7: "7. Perlindungan",
    protection:
      "Data diisolasi per akun dan ruang kerja pada tingkat basis data (Row Level Security), berkas disimpan dalam penyimpanan pribadi, dan pengirimannya melalui koneksi yang aman. Akses dokumen dibatasi sesuai peran dan tautan yang diberikan.",
    h8: "8. Masa simpan dan penghapusan",
    retentionPre:
      "Kami menyimpan data selama akun Anda aktif. Anda dapat meminta penghapusan akun dan data dengan menulis ke ",
    retentionPost: ".",
    h9: "9. Hak Anda",
    rights:
      "Anda berhak mengakses data Anda, memperbaikinya, menghapusnya, serta menarik persetujuan atas pemrosesan. Untuk itu, hubungi kami di alamat yang tertera.",
    h10: "10. Perubahan",
    changes:
      "Kami dapat memperbarui Kebijakan ini. Versi terkini selalu tersedia di halaman ini.",
    consent:
      "Dengan menggunakan Layanan, Anda menyatakan telah membaca Kebijakan ini dan menyetujui pemrosesan data pribadi berdasarkan ketentuan yang disebutkan.",
  },
  uz: {
    home: "← Bosh sahifaga",
    title: "Maxfiylik siyosati",
    intro: "“doki.help” xizmati (bundan keyin — Xizmat). Oxirgi yangilangan sana: 23.06.2026.",
    h1: "1. Operator",
    operatorPre:
      "Shaxsiy ma’lumotlarni qayta ishlovchi operator doki.help Xizmati egasi, STIR 780728592634. Ma’lumotlarga oid murojaatlar uchun aloqa: ",
    operatorPost: ".",
    h2: "2. Biz qanday ma’lumotlarni qayta ishlaymiz",
    data1: "— Hisob ma’lumotlari: elektron pochta manzilingiz, Google orqali kirganda esa — Google profilingizdagi ism va email.",
    data2:
      "— Siz yuklaydigan kontent: hujjatlar, fotosuratlar, skanerlar va ularning rekvizitlari. Bu materiallar shaxsiy ma’lumotlarni, jumladan maxsus toifadagi (masalan, tibbiy — tahlillar, xulosalar) ma’lumotlarni o‘z ichiga olishi mumkin.",
    data3:
      "— Kirishlarning texnik ma’lumotlari: IP-manzil, qurilma/brauzer turi, kirish vaqti (xavfsizlik va yangi kirishlar haqida bildirishnomalar uchun).",
    data4: "— Telefon raqami — faqat SMS-bildirishnomalar uchun ko‘rsatsangiz.",
    h3: "3. Maqsadlar va asos",
    purpose:
      "Biz ma’lumotlarni Xizmatni taqdim etish uchun qayta ishlaymiz: hujjatlaringizni saqlash va tartibga solish, muddatlar haqida eslatish, xavfsiz kirish va qo‘llab-quvvatlashni ta’minlash. Huquqiy asos — ro‘yxatdan o‘tishda bergan roziligingiz va shartnomani bajarish (Xizmat ko‘rsatish).",
    hSpecial: "3.1. Shaxsiy ma’lumotlarning maxsus toifalari (sog‘liq haqidagi ma’lumotlar)",
    special:
      "Agar siz tibbiy hujjatlarni (tahlillar, xulosalar, emlash sertifikatlari va h.k.) yuklasangiz, Xizmat shaxsiy ma’lumotlarning maxsus toifalarini — sog‘liq haqidagi ma’lumotlarni qayta ishlaydi. Bunday qayta ishlash faqat ro‘yxatdan o‘tishda bergan alohida aniq roziligingiz bilan va faqat siz yuklagan ma’lumotlarga nisbatan amalga oshiriladi. Siz istalgan vaqtda ushbu hujjatlarni yoki hisobingizni o‘chirishingiz mumkin, bu qayta ishlashni to‘xtatadi; rozilikni support@doki.help manziliga yozib qaytarib olish mumkin.",
    h4: "4. AI yordamida qayta ishlash",
    ai: "Hujjatlarni aniqlash va AI-yordamchi funksiyalaridan foydalanganda ma’lumotlarning bir qismi (hujjat tasviri yoki so‘rovingiz matni) qayta ishlash va javob shakllantirish uchun uchinchi tomon AI-yetkazib beruvchisiga uzatiladi. Bu funksiyalar sizning harakatingiz bilan yoqiladi. Agar bunday qayta ishlashni istamasangiz — AI-funksiyalardan foydalanmang.",
    h5: "5. Ma’lumotlar qayerda saqlanadi",
    storage:
      "Ma’lumotlar yetkazib beruvchimizning bulutli infratuzilmasida (Supabase) va himoyalangan fayl saqlovida saqlanadi. Yetkazib beruvchining serverlari Rossiya Federatsiyasidan tashqarida joylashgan bo‘lishi mumkin. Fayllar faqat vaqtinchalik imzolangan havolalar orqali ochiladi.",
    h6: "6. Uchinchi shaxslarga uzatish",
    sharing:
      "Biz ma’lumotlaringizni sotmaymiz. Biz ularni faqat: (a) infratuzilma yetkazib beruvchilariga (xosting, ma’lumotlar bazasi, xat/SMS yuborish) Xizmat ishlashi uchun zarur hajmda; (b) AI-yetkazib beruvchiga — tegishli funksiyalardan foydalanganda; (v) vakolatli organlarning qonuniy talabiga binoan uzatamiz. Hujjatni havola orqali kimga va qachon ochishni o‘zingiz hal qilasiz.",
    h7: "7. Himoya",
    protection:
      "Ma’lumotlar ma’lumotlar bazasi darajasida oila bo‘yicha izolyatsiya qilingan (Row Level Security), fayllar — shaxsiy saqlovda, uzatish — himoyalangan ulanish orqali. Ikki bosqichli autentifikatsiya va yangi qurilmadan kirish haqida bildirishnomalar mavjud.",
    h8: "8. Saqlash muddatlari va o‘chirish",
    retentionPre:
      "Biz ma’lumotlarni hisobingiz faol bo‘lguncha saqlaymiz. Hisob va ma’lumotlarni o‘chirishni quyidagi manzilga yozib so‘rashingiz mumkin: ",
    retentionPost: ".",
    h9: "9. Sizning huquqlaringiz",
    rights:
      "Siz o‘z ma’lumotlaringizga kirish, ularni tuzatish, o‘chirish, shuningdek qayta ishlashga rozilikni qaytarib olish huquqiga egasiz. Buning uchun ko‘rsatilgan manzil orqali biz bilan bog‘laning.",
    h10: "10. O‘zgartirishlar",
    changes:
      "Biz ushbu Siyosatni yangilashimiz mumkin. Joriy versiya doimo ushbu sahifada mavjud.",
    consent:
      "Xizmatdan foydalanish orqali siz ushbu Siyosat bilan tanishganingizni va shaxsiy ma’lumotlarni bayon etilgan shartlar asosida qayta ishlashga rozilik berganingizni tasdiqlaysiz.",
  },
} as const;

export default async function PrivacyPage() {
  const locale = await getLocale();
  const t = M[locale];
  return (
    <main className="min-h-screen bg-[#f9f5f0] px-5 py-12 text-slate-800">
      <div className="mx-auto max-w-2xl rounded-3xl border border-[#e8e0d5] bg-white p-7 sm:p-10">
        <Link href="/" className="text-sm text-[#b85c38] hover:underline">
          {t.home}
        </Link>
        <h1 className="mt-4 text-2xl font-bold text-slate-900">{t.title}</h1>
        <P>{t.intro}</P>

        <H>{t.h1}</H>
        <P>
          {t.operatorPre}
          <a href="mailto:support@doki.help" className="text-[#b85c38] hover:underline">
            support@doki.help
          </a>
          {t.operatorPost}
        </P>

        <H>{t.h2}</H>
        <P>
          {t.data1}
          <br />
          {t.data2}
          <br />
          {t.data3}
          <br />
          {t.data4}
        </P>

        <H>{t.h3}</H>
        <P>{t.purpose}</P>

        <H>{t.hSpecial}</H>
        <P>{t.special}</P>

        <H>{t.h4}</H>
        <P>{t.ai}</P>

        <H>{t.h5}</H>
        <P>{t.storage}</P>

        <H>{t.h6}</H>
        <P>{t.sharing}</P>

        <H>{t.h7}</H>
        <P>{t.protection}</P>

        <H>{t.h8}</H>
        <P>
          {t.retentionPre}
          <a href="mailto:support@doki.help" className="text-[#b85c38] hover:underline">
            support@doki.help
          </a>
          {t.retentionPost}
        </P>

        <H>{t.h9}</H>
        <P>{t.rights}</P>

        <H>{t.h10}</H>
        <P>{t.changes}</P>

        <p className="mt-8 border-t border-slate-100 pt-4 text-xs text-slate-400">
          {t.consent}
        </p>
      </div>
    </main>
  );
}

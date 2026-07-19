import type { Metadata } from "next";
import Link from "next/link";
import { getLocale, type Locale } from "@/lib/i18n";

const META: Record<Locale, { title: string; description: string }> = {
  ru: {
    title: "Политика конфиденциальности",
    description: "Какие данные обрабатывает doki.help, зачем они нужны, где хранятся и как удалить документы или аккаунт.",
  },
  en: {
    title: "Privacy Policy",
    description: "What data doki.help processes, why it is needed, where it is stored, and how to delete documents or your account.",
  },
  id: {
    title: "Kebijakan Privasi",
    description: "Data yang diproses doki.help, alasan pemrosesan, lokasi penyimpanan, dan cara menghapus dokumen atau akun Anda.",
  },
  uz: {
    title: "Maxfiylik siyosati",
    description: "doki.help qanday maʼlumotlarni qayta ishlashi, saqlash joyi va hujjatlar yoki hisobni qanday oʻchirish haqida.",
  },
};

// Version of this Privacy Policy. Bump on any material change; the value is
// captured alongside candidate upload consent so we know which text was agreed.
export const POLICY_VERSION = "2026-07-19";

export async function generateMetadata(): Promise<Metadata> {
  return META[await getLocale()];
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
    intro: "Сервис «doki.help» (далее — Сервис). Дата последнего обновления: 17.07.2026.",
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
      "К специальным (чувствительным) категориям относятся данные о здоровье, финансовые данные и данные детей. Сервис не требует таких данных для создания аккаунта; их обработка начинается только тогда, когда вы сами выбираете и загружаете соответствующий документ (медицинский, финансовый и т.п.), и ограничена выбранными вами функциями хранения, организации и передачи. Не загружайте данные другого человека (включая ребёнка) без законного основания или согласия. Вы можете удалить такой документ или весь аккаунт в любой момент.",
    h4: "4. Обработка с помощью ИИ",
    ai: "При использовании функций распознавания документов и AI-помощника часть данных (изображение документа или текст вашего запроса) передаётся стороннему поставщику ИИ для обработки и формирования ответа. Эти функции включаются по вашему действию. Если вы не хотите такой обработки — не пользуйтесь ИИ-функциями.",
    h5: "5. Где хранятся данные",
    storage:
      "Данные хранятся в облачной инфраструктуре нашего поставщика (Supabase) и в защищённом файловом хранилище. Серверы поставщика могут находиться за пределами Индонезии. Используя Сервис и загружая документы, вы даёте согласие на такую трансграничную передачу и хранение данных за пределами Индонезии (ст. 55–56 UU PDP). Файлы доступны только по временным подписанным ссылкам.",
    h6: "6. Передача третьим лицам",
    sharing:
      "Мы не продаём ваши данные. Мы передаём их только: (а) поставщикам инфраструктуры (хостинг, база данных, отправка писем/SMS) в объёме, необходимом для работы Сервиса; (б) поставщику ИИ — при использовании соответствующих функций; (в) по законному требованию уполномоченных органов. Кому и когда вы сами открываете документ по ссылке — решаете вы.",
    h7: "7. Защита",
    protection:
      "Данные изолированы по семье на уровне базы (Row Level Security), файлы — в приватном хранилище, передача — по защищённому соединению. Доступны двухфакторная аутентификация и уведомления о входе с нового устройства.",
    h8: "8. Сроки хранения и удаление",
    retentionPre:
      "Мы храним данные, пока активен ваш аккаунт. Вы можете самостоятельно удалить аккаунт и связанные данные в кабинете: «Настройки → Безопасность → Удалить аккаунт». Если вы не можете войти, напишите на ",
    retentionPost: ".",
    h9: "9. Ваши права",
    rights:
      "Вы вправе получить доступ к своим данным и их копию, исправить их, удалить, получить их в машиночитаемом формате (переносимость), возразить против отдельных видов обработки, отозвать согласие, а также подать жалобу в уполномоченный орган. Для этого свяжитесь с нами по указанному адресу.",
    h10: "10. Изменения",
    changes:
      "Мы можем обновлять эту Политику. Актуальная версия всегда доступна на этой странице.",
    hIncident: "7.1. Инциденты и уведомление об утечке",
    incident:
      "При утечке персональных данных, затрагивающей ваши права, мы уведомим затронутых субъектов и уполномоченный орган в течение 3×24 часов, как того требует UU PDP. Сообщить о проблеме безопасности можно на security@doki.help.",
    hPdp: "9.1. Соответствие закону Индонезии (UU PDP 27/2022)",
    pdp:
      "Для пользователей в Индонезии обработка данных ведётся с учётом Закона № 27/2022 о защите персональных данных (UU PDP). Правовые основания обработки — ваше согласие и исполнение договора. Как субъект данных вы имеете перечисленные выше права (доступ, исправление, удаление, переносимость, возражение, отзыв согласия, жалоба в уполномоченный орган). Специальные категории (здоровье, финансы, дети) обрабатываются с повышенной осторожностью и только по вашей инициативе.",
    consent:
      "Используя Сервис, вы подтверждаете, что ознакомлены с настоящей Политикой и даёте согласие на обработку персональных данных на изложенных условиях.",
  },
  en: {
    home: "← Back to home",
    title: "Privacy Policy",
    intro: "The “doki.help” service (hereinafter — the Service). Last updated: 17.07.2026.",
    h1: "1. Operator",
    operatorPre:
      "The operator processing personal data is the owner of the doki.help Service, TIN 780728592634. Contact for data-related inquiries: ",
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
      "We process data to provide the Service: to store and organize your documents, remind you of deadlines, and ensure secure access and support. The legal basis is your consent, given upon registration, and the performance of the contract (provision of the Service).",
    hSpecial: "3.1. Special categories of personal data (health information)",
    special:
      "Special (sensitive) categories include health data, financial data and children's data. The Service does not require such data to create an account; processing begins only when you choose and upload the relevant document (medical, financial, etc.), and is limited to the storage, organization and sharing features you request. Do not upload another person's data (including a child's) unless you have a lawful basis or their consent. You can delete the document or your entire account at any time.",
    h4: "4. AI processing",
    ai: "When using document recognition and AI assistant features, part of your data (the document image or the text of your request) is transferred to a third-party AI provider for processing and generating a response. These features are activated by your action. If you do not want such processing — do not use the AI features.",
    h5: "5. Where data is stored",
    storage:
      "Data is stored in the cloud infrastructure of our provider (Supabase) and in secure file storage. The provider's servers may be located outside Indonesia. By using the Service and uploading documents, you consent to this cross-border transfer and storage of your data outside Indonesia (Arts. 55–56 UU PDP). Files are accessible only via temporary signed links.",
    h6: "6. Sharing with third parties",
    sharing:
      "We do not sell your data. We share it only: (a) with infrastructure providers (hosting, database, sending of emails/SMS) to the extent necessary for the Service to operate; (b) with the AI provider — when the relevant features are used; (c) at the lawful request of authorized bodies. You decide for yourself to whom and when you open a document via a link.",
    h7: "7. Protection",
    protection:
      "Data is isolated per family at the database level (Row Level Security), files are kept in private storage, and transmission is over a secure connection. Two-factor authentication and notifications of sign-ins from a new device are available.",
    h8: "8. Retention and deletion",
    retentionPre:
      "We keep data while your account is active. You can delete your account and associated data in the app under Settings → Security → Delete account. If you cannot sign in, contact ",
    retentionPost: ".",
    h9: "9. Your rights",
    rights:
      "You have the right to access your data and obtain a copy, correct it, delete it, receive it in a machine-readable format (portability), object to certain processing, withdraw your consent, and lodge a complaint with the competent authority. To do so, contact us at the address indicated.",
    h10: "10. Changes",
    changes:
      "We may update this Policy. The current version is always available on this page.",
    hIncident: "7.1. Incidents and breach notification",
    incident:
      "If a personal-data breach affects your rights, we will notify affected data subjects and the competent authority within 3×24 hours, as required by the UU PDP. Report a security concern to security@doki.help.",
    hPdp: "9.1. Compliance with Indonesian law (UU PDP 27/2022)",
    pdp:
      "For users in Indonesia, data is processed in line with Law No. 27/2022 on Personal Data Protection (UU PDP). The legal bases for processing are your consent and performance of the contract. As a data subject you hold the rights listed above (access, rectification, erasure, portability, objection, withdrawal of consent, and complaint to the competent authority). Special categories (health, finance, children) are processed with heightened care and only at your own initiative.",
    consent:
      "By using the Service, you confirm that you have read this Policy and consent to the processing of personal data under the stated terms.",
  },
  id: {
    home: "← Kembali ke beranda",
    title: "Kebijakan Privasi",
    intro: "Layanan “doki.help” (selanjutnya disebut — Layanan). Terakhir diperbarui: 17.07.2026.",
    h1: "1. Operator",
    operatorPre:
      "Operator yang memproses data pribadi adalah pemilik Layanan doki.help, NPWP 780728592634. Kontak untuk pertanyaan terkait data: ",
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
      "Kategori khusus (sensitif) mencakup data kesehatan, data keuangan, dan data anak. Layanan tidak meminta data seperti itu untuk membuat akun; pemrosesan baru dimulai ketika Anda sendiri memilih dan mengunggah dokumen terkait (medis, keuangan, dan sebagainya), dan terbatas pada fungsi penyimpanan, pengelolaan, serta pembagian yang Anda pilih. Jangan mengunggah data orang lain (termasuk anak) tanpa dasar hukum atau persetujuan mereka. Anda dapat menghapus dokumen tersebut atau seluruh akun kapan saja.",
    h4: "4. Pemrosesan dengan AI",
    ai: "Saat menggunakan fitur pengenalan dokumen dan asisten AI, sebagian data (gambar dokumen atau teks permintaan Anda) dikirim ke penyedia AI pihak ketiga untuk diproses dan menghasilkan tanggapan. Fitur ini diaktifkan oleh tindakan Anda. Jika Anda tidak menginginkan pemrosesan seperti itu — jangan gunakan fitur AI.",
    h5: "5. Di mana data disimpan",
    storage:
      "Data disimpan dalam infrastruktur cloud penyedia kami (Supabase) dan dalam penyimpanan berkas yang aman. Server penyedia dapat berada di luar Indonesia. Dengan menggunakan Layanan dan mengunggah dokumen, Anda menyetujui transfer dan penyimpanan lintas negara atas data Anda di luar Indonesia (Pasal 55–56 UU PDP). Berkas hanya dapat diakses melalui tautan bertanda tangan sementara.",
    h6: "6. Pembagian kepada pihak ketiga",
    sharing:
      "Kami tidak menjual data Anda. Kami membagikannya hanya: (a) kepada penyedia infrastruktur (hosting, basis data, pengiriman email/SMS) sebatas yang diperlukan untuk pengoperasian Layanan; (b) kepada penyedia AI — saat fitur terkait digunakan; (c) atas permintaan sah dari otoritas yang berwenang. Anda sendiri yang memutuskan kepada siapa dan kapan Anda membuka dokumen melalui tautan.",
    h7: "7. Perlindungan",
    protection:
      "Data diisolasi per keluarga pada tingkat basis data (Row Level Security), berkas disimpan dalam penyimpanan pribadi, dan pengirimannya melalui koneksi yang aman. Tersedia autentikasi dua faktor dan pemberitahuan masuk dari perangkat baru.",
    h8: "8. Masa simpan dan penghapusan",
    retentionPre:
      "Kami menyimpan data selama akun Anda aktif. Anda dapat menghapus akun dan data terkait di aplikasi melalui Pengaturan → Keamanan → Hapus akun. Jika Anda tidak dapat masuk, hubungi ",
    retentionPost: ".",
    h9: "9. Hak Anda",
    rights:
      "Anda berhak mengakses data Anda dan memperoleh salinannya, memperbaikinya, menghapusnya, menerimanya dalam format yang dapat dibaca mesin (portabilitas), menolak pemrosesan tertentu, menarik persetujuan, serta mengajukan keluhan kepada otoritas yang berwenang. Untuk itu, hubungi kami di alamat yang tertera.",
    h10: "10. Perubahan",
    changes:
      "Kami dapat memperbarui Kebijakan ini. Versi terkini selalu tersedia di halaman ini.",
    hIncident: "7.1. Insiden dan pemberitahuan pelanggaran data",
    incident:
      "Jika terjadi pelanggaran data pribadi yang memengaruhi hak Anda, kami akan memberi tahu subjek data yang terdampak dan otoritas yang berwenang dalam waktu 3×24 jam, sesuai UU PDP. Laporkan masalah keamanan ke security@doki.help.",
    hPdp: "9.1. Kepatuhan terhadap hukum Indonesia (UU PDP 27/2022)",
    pdp:
      "Untuk pengguna di Indonesia, data diproses sesuai Undang-Undang No. 27/2022 tentang Pelindungan Data Pribadi (UU PDP). Dasar hukum pemrosesan adalah persetujuan Anda dan pelaksanaan perjanjian. Sebagai subjek data, Anda memiliki hak-hak yang disebutkan di atas (akses, perbaikan, penghapusan, portabilitas, keberatan, penarikan persetujuan, serta pengaduan kepada otoritas yang berwenang). Kategori khusus (kesehatan, keuangan, anak) diproses dengan kehati-hatian lebih dan hanya atas inisiatif Anda sendiri.",
    consent:
      "Dengan menggunakan Layanan, Anda menyatakan telah membaca Kebijakan ini dan menyetujui pemrosesan data pribadi berdasarkan ketentuan yang disebutkan.",
  },
  uz: {
    home: "← Bosh sahifaga",
    title: "Maxfiylik siyosati",
    intro: "“doki.help” xizmati (bundan keyin — Xizmat). Oxirgi yangilangan sana: 17.07.2026.",
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
      "Maxsus (sezgir) toifalarga sog‘liq, moliyaviy ma’lumotlar va bolalar ma’lumotlari kiradi. Xizmat hisob yaratish uchun bunday ma’lumotlarni talab qilmaydi; qayta ishlash faqat siz tegishli hujjatni (tibbiy, moliyaviy va h.k.) o‘zingiz tanlab yuklaganingizda boshlanadi va siz tanlagan saqlash, tartibga solish hamda ulashish funksiyalari bilan cheklanadi. Boshqa shaxsning (jumladan bolaning) ma’lumotlarini qonuniy asos yoki roziligisiz yuklamang. Hujjatni yoki butun hisobni istalgan vaqtda o‘chirishingiz mumkin.",
    h4: "4. AI yordamida qayta ishlash",
    ai: "Hujjatlarni aniqlash va AI-yordamchi funksiyalaridan foydalanganda ma’lumotlarning bir qismi (hujjat tasviri yoki so‘rovingiz matni) qayta ishlash va javob shakllantirish uchun uchinchi tomon AI-yetkazib beruvchisiga uzatiladi. Bu funksiyalar sizning harakatingiz bilan yoqiladi. Agar bunday qayta ishlashni istamasangiz — AI-funksiyalardan foydalanmang.",
    h5: "5. Ma’lumotlar qayerda saqlanadi",
    storage:
      "Ma’lumotlar yetkazib beruvchimizning bulutli infratuzilmasida (Supabase) va himoyalangan fayl saqlovida saqlanadi. Yetkazib beruvchining serverlari Indoneziyadan tashqarida joylashgan bo‘lishi mumkin. Xizmatdan foydalanib va hujjatlarni yuklab, siz ma’lumotlaringizni Indoneziyadan tashqarida chegaralararo uzatish va saqlashga rozilik berasiz (UU PDP 55–56-moddalar). Fayllar faqat vaqtinchalik imzolangan havolalar orqali ochiladi.",
    h6: "6. Uchinchi shaxslarga uzatish",
    sharing:
      "Biz ma’lumotlaringizni sotmaymiz. Biz ularni faqat: (a) infratuzilma yetkazib beruvchilariga (xosting, ma’lumotlar bazasi, xat/SMS yuborish) Xizmat ishlashi uchun zarur hajmda; (b) AI-yetkazib beruvchiga — tegishli funksiyalardan foydalanganda; (v) vakolatli organlarning qonuniy talabiga binoan uzatamiz. Hujjatni havola orqali kimga va qachon ochishni o‘zingiz hal qilasiz.",
    h7: "7. Himoya",
    protection:
      "Ma’lumotlar ma’lumotlar bazasi darajasida oila bo‘yicha izolyatsiya qilingan (Row Level Security), fayllar — shaxsiy saqlovda, uzatish — himoyalangan ulanish orqali. Ikki bosqichli autentifikatsiya va yangi qurilmadan kirish haqida bildirishnomalar mavjud.",
    h8: "8. Saqlash muddatlari va o‘chirish",
    retentionPre:
      "Biz ma’lumotlarni hisobingiz faol bo‘lguncha saqlaymiz. Hisob va unga bog‘liq ma’lumotlarni ilovadagi Sozlamalar → Xavfsizlik → Hisobni o‘chirish orqali o‘zingiz o‘chirishingiz mumkin. Agar kira olmasangiz, quyidagi manzilga yozing: ",
    retentionPost: ".",
    h9: "9. Sizning huquqlaringiz",
    rights:
      "Siz o‘z ma’lumotlaringizga kirish va nusxasini olish, ularni tuzatish, o‘chirish, mashina o‘qiy oladigan formatda olish (ko‘chirish/portabellik), ayrim qayta ishlashga e’tiroz bildirish, rozilikni qaytarib olish, shuningdek vakolatli organga shikoyat qilish huquqiga egasiz. Buning uchun ko‘rsatilgan manzil orqali biz bilan bog‘laning.",
    h10: "10. O‘zgartirishlar",
    changes:
      "Biz ushbu Siyosatni yangilashimiz mumkin. Joriy versiya doimo ushbu sahifada mavjud.",
    hIncident: "7.1. Hodisalar va ma’lumot sizishi haqida xabar berish",
    incident:
      "Sizning huquqlaringizga ta’sir qiluvchi shaxsiy ma’lumotlar sizib chiqishi yuz bersa, biz ta’sirlangan sub’ektlar va vakolatli organni UU PDP talab qilganidek 3×24 soat ichida xabardor qilamiz. Xavfsizlik muammosi haqida security@doki.help manziliga xabar bering.",
    hPdp: "9.1. Indoneziya qonuniga muvofiqlik (UU PDP 27/2022)",
    pdp:
      "Indoneziyadagi foydalanuvchilar uchun ma’lumotlar Shaxsiy ma’lumotlarni himoya qilish to‘g‘risidagi 27/2022-sonli qonun (UU PDP) asosida qayta ishlanadi. Qayta ishlashning huquqiy asoslari — sizning roziligingiz va shartnomani bajarish. Ma’lumot sub’ekti sifatida siz yuqorida sanab o‘tilgan huquqlarga egasiz (kirish, tuzatish, o‘chirish, ko‘chirish, e’tiroz, rozilikni qaytarish va vakolatli organga shikoyat). Maxsus toifalar (sog‘liq, moliya, bolalar) yuqori ehtiyotkorlik bilan va faqat sizning tashabbusingiz bilan qayta ishlanadi.",
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

        <H>{t.hIncident}</H>
        <P>
          {t.incident.split("security@doki.help")[0]}
          <a href="mailto:security@doki.help" className="text-[#b85c38] hover:underline">
            security@doki.help
          </a>
          {t.incident.split("security@doki.help")[1] ?? ""}
        </P>

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

        <H>{t.hPdp}</H>
        <P>{t.pdp}</P>

        <H>{t.h10}</H>
        <P>{t.changes}</P>

        <p className="mt-8 border-t border-slate-100 pt-4 text-xs text-slate-400">
          {t.consent}
        </p>
      </div>
    </main>
  );
}

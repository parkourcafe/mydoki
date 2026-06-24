import Link from "next/link";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/queries";
import { getLocale, type Locale } from "@/lib/i18n";
import LangSwitcher from "@/components/LangSwitcher";
import { segmentLinks } from "@/lib/segments";
import { comparisonLinks, comparisonsHeading } from "@/lib/comparisons";

type Cat = { icon: string; title: string; items: string[] };
type Step = { n: string; title: string; text: string };
type Sec = { icon: string; title: string; text: string };
type Faq = { q: string; a: string };

type Dict = {
  nav: { login: string; start: string };
  hero: {
    badge: string;
    title: string[];
    subtitle: string;
    cta1: string;
    cta2: string;
    trust: string[];
    imgAlt: string;
  };
  store: {
    heading: string;
    sub: string;
    medTitle: string;
    medBadge: string;
    medCol1: string[];
    medCol2: string[];
    medNote: string;
    cats: Cat[];
  };
  how: { heading: string; sub: string; steps: Step[] };
  security: { heading: string; sub: string; promise: string; items: Sec[] };
  cta: { heading: string; sub: string; button: string };
  faq: { heading: string; items: Faq[] };
  forWhom: { heading: string; items: string[] };
  diff: { heading: string; intro: string; items: { t: string; d: string }[] };
  operator: { heading: string; line: string; contactLabel: string };
  footer: { copyright: string; security: string; privacy: string; login: string };
};

const M: Record<Locale, Dict> = {
  ru: {
    nav: { login: "Войти", start: "Начать бесплатно" },
    hero: {
      badge: "Личный сейф для документов всей семьи",
      title: ["Все важные документы", "вашей семьи —", "всегда под рукой"],
      subtitle:
        "Паспорта, анализы, визы, дипломы, справки и путёвки. Доступ с любого устройства. Напоминания работают сами.",
      cta1: "Начать бесплатно",
      cta2: "Как это работает",
      trust: ["С любого устройства", "Бесплатно", "Вход через Google"],
      imgAlt: "Документы семьи — под рукой и в порядке",
    },
    store: {
      heading: "Что можно хранить в архиве",
      sub: "Всё самое важное для семьи — в одном защищённом месте.",
      medTitle: "Анализы и медицинские исследования",
      medBadge: "Напоминания — бесплатно",
      medCol1: ["Результаты лабораторных анализов", "Биохимия, ОАК, гормоны, ОАМ", "УЗИ, МРТ, КТ, рентген"],
      medCol2: ["Заключения врачей", "Прививочные сертификаты", "Медицинские справки"],
      medNote: "Напоминания о сроках — бесплатно.",
      cats: [
        { icon: "📄", title: "Личные и миграционные документы", items: ["Паспорта и загранпаспорта", "Визы и визовые документы", "Документы на гражданство", "СНИЛС, ИНН, военный билет", "Дипломы, аттестаты, сертификаты"] },
        { icon: "✈️", title: "Поездки и путешествия", items: ["Путёвки и ваучеры", "Билеты и бронирования", "Страховки для поездок", "Документы для въезда/выезда", "Согласия на выезд ребёнка"] },
        { icon: "🚗", title: "Авто и недвижимость", items: ["ОСАГО и КАСКО", "ПТС и СТС", "Выписки ЕГРН и договоры"] },
        { icon: "🧾", title: "Квитанции и справки", items: ["Квитанции и чеки об оплате", "Справки с работы / учёбы", "Доверенности"] },
      ],
    },
    how: {
      heading: "Как это работает",
      sub: "Загрузи документ — остальное система сделает сама",
      steps: [
        { n: "1", title: "Загрузи фото или скан", text: "Паспорт, виза, анализ, путёвка — любой документ." },
        { n: "2", title: "Укажите срок действия", text: "Впишите дату «действует до» — приложение запомнит и напомнит заранее." },
        { n: "3", title: "Получай напоминания", text: "Система заранее предупредит об истечении визы, анализа или ОСАГО." },
        { n: "4", title: "Управляй доступом", text: "Отправляй временные ссылки врачам, в банк или родственникам." },
      ],
    },
    security: {
      heading: "Ваши документы в безопасности",
      sub: "Мы понимаем, насколько важны эти документы — и сделали всё, чтобы вы были спокойны.",
      promise:
        "Приватность и безопасность — наш главный приоритет. Данные хранятся в защищённом облаке и передаются по HTTPS, а доступ ограничен строгими правилами на уровне базы. Мы не продаём и не обмениваем ваши данные и не передаём их для рекламы.",
      items: [
        { icon: "👨‍👩‍👧", title: "Только ваша семья видит документы", text: "Доступ изолирован на уровне базы (RLS): посторонние не видят ваши документы." },
        { icon: "🛡️", title: "Защищённый вход и хранилище", text: "Файлы — в приватном хранилище, передача по HTTPS. Двухфакторный вход и письмо при входе с нового устройства." },
        { icon: "🎚️", title: "Вы управляете доступом", text: "Делитесь документом по временной ссылке и отзываете её в любой момент." },
        { icon: "🙅", title: "Не продаём ваши данные", text: "Мы не передаём и не продаём ваши данные третьим лицам." },
        { icon: "📥", title: "Работают без интернета", text: "Нужные документы можно сохранить на телефон и открыть даже без связи — в поездке или роуминге." },
      ],
    },
    cta: {
      heading: "Готовы собрать все документы семьи?",
      sub: "Меньше 15 минут — и порядок надолго.",
      button: "Начать пользоваться бесплатно",
    },
    faq: {
      heading: "Частые вопросы",
      items: [
        { q: "Это бесплатно?", a: "Да. Сейчас бесплатно: 2 ГБ места, напоминания о сроках, общий доступ для семьи и работа офлайн. Позже появится платный тариф с бóльшим объёмом — то, что доступно сейчас, останется." },
        { q: "Кто видит мои документы?", a: "Только вы и те члены семьи, кому вы открыли доступ. Доступ изолирован на уровне базы данных (RLS), файлы — в приватном хранилище." },
        { q: "Как работают напоминания?", a: "Вы указываете срок действия документа (например, загранпаспорта или ОСАГО), а сервис заранее присылает напоминание на email." },
        { q: "Можно ли поделиться документом?", a: "Да — по временной ссылке, которую можно отозвать в любой момент." },
        { q: "Где хранятся данные?", a: "В защищённом облачном хранилище, передача — по HTTPS. Мы не продаём и не передаём ваши данные третьим лицам." },
      ],
    },
    forWhom: {
      heading: "Кому подходит",
      items: [
        "Семьям, которые хотят собрать все важные документы в одном месте",
        "Родителям — хранить и не терять документы детей",
        "Тем, кто часто путешествует: паспорта, визы, страховки под рукой",
        "Кто боится забыть про срок — продление визы, ОСАГО, паспорта",
        "Кто делится документами с врачом или юристом по защищённой ссылке",
      ],
    },
    diff: {
      heading: "Чем это лучше обычного облака",
      intro: "doki.help — не ещё один файловый диск, а сервис под документы:",
      items: [
        { t: "Напоминает о сроках", d: "Указываете дату — напоминание приходит заранее. Обычное облако так не умеет." },
        { t: "Порядок по людям и категориям", d: "Документы разложены по членам семьи и типам, а не свалены в папки." },
        { t: "Безопасный обмен по одному документу", d: "Временная ссылка на конкретный файл, которую можно отозвать." },
        { t: "Работает офлайн", d: "Нужные документы открываются без интернета — в поездке или роуминге." },
      ],
    },
    operator: {
      heading: "Кто за сервисом",
      line: "Оператор: владелец сервиса doki.help, ИНН 780728592634.",
      contactLabel: "Поддержка:",
    },
    footer: { copyright: "© 2026 doki.help — Семейный архив документов", security: "Безопасность", privacy: "Конфиденциальность", login: "Войти" },
  },
  en: {
    nav: { login: "Sign in", start: "Get started free" },
    hero: {
      badge: "A private vault for your whole family's documents",
      title: ["All your family's", "important documents —", "always at hand"],
      subtitle:
        "Passports, medical results, visas, diplomas, certificates and travel docs. Access from any device. Reminders run on their own.",
      cta1: "Get started free",
      cta2: "How it works",
      trust: ["Any device", "Free", "Sign in with Google"],
      imgAlt: "A family's documents — organized and at hand",
    },
    store: {
      heading: "What you can keep in your vault",
      sub: "Everything important for your family — in one secure place.",
      medTitle: "Medical results and tests",
      medBadge: "Reminders — free",
      medCol1: ["Lab test results", "Blood panels, CBC, hormones, urinalysis", "Ultrasound, MRI, CT, X-ray"],
      medCol2: ["Doctor's reports", "Vaccination certificates", "Medical certificates"],
      medNote: "Deadline reminders — free.",
      cats: [
        { icon: "📄", title: "Personal & immigration documents", items: ["Passports & international passports", "Visas and visa paperwork", "Citizenship documents", "Tax & social security IDs", "Diplomas and certificates"] },
        { icon: "✈️", title: "Trips & travel", items: ["Tour packages & vouchers", "Tickets and bookings", "Travel insurance", "Entry/exit documents", "Child travel consents"] },
        { icon: "🚗", title: "Vehicles & property", items: ["Car insurance", "Vehicle titles & registration", "Property records & contracts"] },
        { icon: "🧾", title: "Receipts & certificates", items: ["Payment receipts", "Work / study certificates", "Powers of attorney"] },
      ],
    },
    how: {
      heading: "How it works",
      sub: "Upload a document — the app does the rest",
      steps: [
        { n: "1", title: "Upload a photo or scan", text: "Passport, visa, medical result, travel doc — any document." },
        { n: "2", title: "Add the expiry date", text: "Enter the 'valid until' date — the app remembers and reminds you in advance." },
        { n: "3", title: "Get reminders", text: "You'll be warned before a visa, test or insurance expires." },
        { n: "4", title: "Control access", text: "Send expiring links to doctors, banks or relatives." },
      ],
    },
    security: {
      heading: "Your documents are safe",
      sub: "We know how important these documents are — and built everything so you can feel at ease.",
      promise:
        "Your privacy and security are our top priority. Your data is kept in a secure cloud and sent over HTTPS, with access locked down by strict database rules. We never sell or trade your data, and we never share it for advertising.",
      items: [
        { icon: "👨‍👩‍👧", title: "Only your family sees the documents", text: "Access is isolated at the database level (RLS) — outsiders can't see your documents." },
        { icon: "🛡️", title: "Secure sign-in and storage", text: "Files in private storage, transfer over HTTPS. Two-factor sign-in and an email alert on new-device logins." },
        { icon: "🎚️", title: "You control access", text: "Share a document via an expiring link and revoke it anytime." },
        { icon: "🙅", title: "We don't sell your data", text: "We never share or sell your data to third parties." },
        { icon: "📥", title: "Available offline", text: "Save the documents you need to your phone and open them even with no connection — on a trip or in roaming." },
      ],
    },
    cta: {
      heading: "Ready to gather all your family's documents?",
      sub: "Less than 15 minutes — and order that lasts.",
      button: "Start for free",
    },
    faq: {
      heading: "Frequently asked questions",
      items: [
        { q: "Is it free?", a: "Yes. Right now you get 2 GB of storage, deadline reminders, family sharing and offline access — for free. A paid plan with more storage will come later; what's available now stays." },
        { q: "Who can see my documents?", a: "Only you and the family members you grant access to. Access is isolated at the database level (RLS), and files are kept in private storage." },
        { q: "How do reminders work?", a: "You set a document's expiry date (e.g. a passport or insurance), and the service emails you a reminder in advance." },
        { q: "Can I share a document?", a: "Yes — via a time-limited link you can revoke at any moment." },
        { q: "Where is my data stored?", a: "In secure cloud storage, with transfer over HTTPS. We never sell or share your data with third parties." },
      ],
    },
    forWhom: {
      heading: "Who it's for",
      items: [
        "Families who want all important documents in one place",
        "Parents — keep and never lose your children's documents",
        "Frequent travelers: passports, visas, insurance at hand",
        "Anyone afraid of missing a deadline — visa, insurance, passport renewal",
        "Those who share documents with a doctor or lawyer via a secure link",
      ],
    },
    diff: {
      heading: "Why it beats a regular cloud",
      intro: "doki.help isn't just another file drive — it's built for documents:",
      items: [
        { t: "Reminds you of deadlines", d: "Set a date and a reminder comes in advance. A regular cloud can't do that." },
        { t: "Organized by people and categories", d: "Documents are sorted by family member and type, not dumped into folders." },
        { t: "Safe per-document sharing", d: "A temporary link to a single file that you can revoke." },
        { t: "Works offline", d: "Open the documents you need with no internet — on a trip or in roaming." },
      ],
    },
    operator: {
      heading: "Who runs the service",
      line: "Operator: the owner of the doki.help service, TIN 780728592634.",
      contactLabel: "Support:",
    },
    footer: { copyright: "© 2026 doki.help — Family document vault", security: "Security", privacy: "Privacy", login: "Sign in" },
  },
  id: {
    nav: { login: "Masuk", start: "Mulai gratis" },
    hero: {
      badge: "Brankas pribadi untuk dokumen seluruh keluarga Anda",
      title: ["Semua dokumen penting", "keluarga Anda —", "selalu dalam genggaman"],
      subtitle:
        "Paspor, hasil medis, visa, ijazah, sertifikat, dan dokumen perjalanan. Akses dari perangkat apa pun. Pengingat berjalan sendiri.",
      cta1: "Mulai gratis",
      cta2: "Cara kerjanya",
      trust: ["Perangkat apa pun", "Gratis", "Masuk dengan Google"],
      imgAlt: "Dokumen keluarga — tertata rapi dan mudah dijangkau",
    },
    store: {
      heading: "Apa saja yang bisa disimpan di brankas Anda",
      sub: "Semua yang penting bagi keluarga Anda — di satu tempat yang aman.",
      medTitle: "Hasil dan pemeriksaan medis",
      medBadge: "Pengingat — gratis",
      medCol1: ["Hasil pemeriksaan laboratorium", "Panel darah, CBC, hormon, urinalisis", "USG, MRI, CT, rontgen"],
      medCol2: ["Laporan dokter", "Sertifikat vaksinasi", "Surat keterangan medis"],
      medNote: "Pengingat tenggat — gratis.",
      cats: [
        { icon: "📄", title: "Dokumen pribadi & imigrasi", items: ["Paspor & paspor internasional", "Visa dan berkas visa", "Dokumen kewarganegaraan", "NPWP & nomor jaminan sosial", "Ijazah dan sertifikat"] },
        { icon: "✈️", title: "Perjalanan & wisata", items: ["Paket tur & voucher", "Tiket dan pemesanan", "Asuransi perjalanan", "Dokumen masuk/keluar", "Surat izin perjalanan anak"] },
        { icon: "🚗", title: "Kendaraan & properti", items: ["Asuransi mobil", "BPKB & STNK kendaraan", "Sertifikat properti & kontrak"] },
        { icon: "🧾", title: "Kuitansi & surat keterangan", items: ["Bukti pembayaran", "Surat keterangan kerja / studi", "Surat kuasa"] },
      ],
    },
    how: {
      heading: "Cara kerjanya",
      sub: "Unggah dokumen — selebihnya aplikasi yang mengurus",
      steps: [
        { n: "1", title: "Unggah foto atau pindaian", text: "Paspor, visa, hasil medis, dokumen perjalanan — dokumen apa pun." },
        { n: "2", title: "Tambahkan tanggal berlaku", text: "Masukkan tanggal 'berlaku sampai' — aplikasi mengingat dan mengingatkan lebih awal." },
        { n: "3", title: "Terima pengingat", text: "Anda akan diingatkan sebelum visa, pemeriksaan, atau asuransi kedaluwarsa." },
        { n: "4", title: "Kendalikan akses", text: "Kirim tautan berbatas waktu ke dokter, bank, atau kerabat." },
      ],
    },
    security: {
      heading: "Dokumen Anda aman",
      sub: "Kami paham betapa pentingnya dokumen-dokumen ini — dan membangun semuanya agar Anda merasa tenang.",
      promise:
        "Privasi dan keamanan adalah prioritas utama kami. Data Anda disimpan di cloud yang aman dan dikirim melalui HTTPS, dengan akses dibatasi aturan basis data yang ketat. Kami tidak pernah menjual atau memperdagangkan data Anda, dan tidak membagikannya untuk iklan.",
      items: [
        { icon: "👨‍👩‍👧", title: "Hanya keluarga Anda yang melihat dokumen", text: "Akses diisolasi pada tingkat basis data (RLS) — pihak luar tidak bisa melihat dokumen Anda." },
        { icon: "🛡️", title: "Masuk dan penyimpanan aman", text: "Berkas di penyimpanan privat, transfer lewat HTTPS. Masuk dua faktor dan email peringatan saat login dari perangkat baru." },
        { icon: "🎚️", title: "Anda yang mengendalikan akses", text: "Bagikan dokumen lewat tautan berbatas waktu dan cabut kapan saja." },
        { icon: "🙅", title: "Kami tidak menjual data Anda", text: "Kami tidak pernah membagikan atau menjual data Anda ke pihak ketiga." },
        { icon: "📥", title: "Tersedia offline", text: "Simpan dokumen yang Anda butuhkan ke ponsel dan buka meski tanpa koneksi — saat bepergian atau roaming." },
      ],
    },
    cta: {
      heading: "Siap mengumpulkan semua dokumen keluarga Anda?",
      sub: "Kurang dari 15 menit — dan tertata rapi untuk seterusnya.",
      button: "Mulai gratis",
    },
    faq: {
      heading: "Pertanyaan umum",
      items: [
        { q: "Apakah gratis?", a: "Ya. Saat ini gratis: penyimpanan 2 GB, pengingat tenggat, berbagi untuk keluarga, dan akses offline. Paket berbayar dengan ruang lebih besar akan hadir nanti — yang tersedia sekarang tetap ada." },
        { q: "Siapa yang bisa melihat dokumen saya?", a: "Hanya Anda dan anggota keluarga yang Anda beri akses. Akses diisolasi pada tingkat basis data (RLS), dan berkas disimpan di penyimpanan privat." },
        { q: "Bagaimana pengingat bekerja?", a: "Anda menetapkan tanggal berlaku dokumen (misalnya paspor atau asuransi), dan layanan mengirim pengingat ke email lebih awal." },
        { q: "Bisakah saya membagikan dokumen?", a: "Ya — lewat tautan berbatas waktu yang bisa Anda cabut kapan saja." },
        { q: "Di mana data saya disimpan?", a: "Di penyimpanan awan yang aman, dengan transfer lewat HTTPS. Kami tidak pernah menjual atau membagikan data Anda ke pihak ketiga." },
      ],
    },
    forWhom: {
      heading: "Untuk siapa",
      items: [
        "Keluarga yang ingin semua dokumen penting di satu tempat",
        "Orang tua — menyimpan dan tidak kehilangan dokumen anak",
        "Sering bepergian: paspor, visa, asuransi selalu siap",
        "Siapa pun yang takut melewatkan tenggat — visa, asuransi, perpanjangan paspor",
        "Yang berbagi dokumen dengan dokter atau pengacara lewat tautan aman",
      ],
    },
    diff: {
      heading: "Kenapa lebih baik dari cloud biasa",
      intro: "doki.help bukan sekadar drive berkas — dibuat khusus untuk dokumen:",
      items: [
        { t: "Mengingatkan tenggat", d: "Tetapkan tanggal dan pengingat datang lebih awal. Cloud biasa tidak bisa." },
        { t: "Tertata per orang dan kategori", d: "Dokumen disusun per anggota keluarga dan jenis, bukan ditumpuk di folder." },
        { t: "Berbagi aman per dokumen", d: "Tautan sementara ke satu berkas yang bisa Anda cabut." },
        { t: "Berfungsi offline", d: "Buka dokumen yang Anda butuhkan tanpa internet — saat bepergian atau roaming." },
      ],
    },
    operator: {
      heading: "Siapa di balik layanan",
      line: "Operator: pemilik layanan doki.help, NPWP 780728592634.",
      contactLabel: "Dukungan:",
    },
    footer: { copyright: "© 2026 doki.help — Brankas dokumen keluarga", security: "Keamanan", privacy: "Privasi", login: "Masuk" },
  },
  uz: {
    nav: { login: "Kirish", start: "Bepul boshlash" },
    hero: {
      badge: "Butun oilangiz hujjatlari uchun shaxsiy seyf",
      title: ["Oilangizning barcha", "muhim hujjatlari —", "doimo qoʻl ostida"],
      subtitle:
        "Pasportlar, tibbiy natijalar, vizalar, diplomlar, sertifikatlar va sayohat hujjatlari. Istalgan qurilmadan kiring. Eslatmalar oʻzi ishlaydi.",
      cta1: "Bepul boshlash",
      cta2: "Bu qanday ishlaydi",
      trust: ["Istalgan qurilma", "Bepul", "Google orqali kirish"],
      imgAlt: "Oila hujjatlari — tartibli va qoʻl ostida",
    },
    store: {
      heading: "Seyfingizda nimalarni saqlashingiz mumkin",
      sub: "Oilangiz uchun muhim boʻlgan hamma narsa — bitta xavfsiz joyda.",
      medTitle: "Tibbiy natijalar va tahlillar",
      medBadge: "Eslatmalar — bepul",
      medCol1: ["Laboratoriya tahlili natijalari", "Qon tahlillari, UQT, gormonlar, siydik tahlili", "UTT, MRT, KT, rentgen"],
      medCol2: ["Shifokor xulosalari", "Emlash sertifikatlari", "Tibbiy maʼlumotnomalar"],
      medNote: "Muddat eslatmalari — bepul.",
      cats: [
        { icon: "📄", title: "Shaxsiy va migratsiya hujjatlari", items: ["Pasportlar va xalqaro pasportlar", "Vizalar va viza hujjatlari", "Fuqarolik hujjatlari", "Soliq va ijtimoiy sugʻurta raqamlari", "Diplomlar va sertifikatlar"] },
        { icon: "✈️", title: "Sayohatlar va sayyohlik", items: ["Tur paketlari va voucherlar", "Chiptalar va bronlar", "Sayohat sugʻurtasi", "Kirish/chiqish hujjatlari", "Bolaning sayohatiga ruxsatnomalar"] },
        { icon: "🚗", title: "Transport va mulk", items: ["Avtomobil sugʻurtasi", "Transport guvohnomalari va roʻyxati", "Mulk hujjatlari va shartnomalar"] },
        { icon: "🧾", title: "Kvitansiyalar va maʼlumotnomalar", items: ["Toʻlov kvitansiyalari", "Ish / oʻqish maʼlumotnomalari", "Ishonchnomalar"] },
      ],
    },
    how: {
      heading: "Bu qanday ishlaydi",
      sub: "Hujjatni yuklang — qolganini ilova bajaradi",
      steps: [
        { n: "1", title: "Rasm yoki skan yuklang", text: "Pasport, viza, tibbiy natija, sayohat hujjati — istalgan hujjat." },
        { n: "2", title: "Amal muddatini kiriting", text: "«Amal qiladi» sanasini kiriting — ilova eslab qoladi va oldindan eslatadi." },
        { n: "3", title: "Eslatmalar oling", text: "Viza, tahlil yoki sugʻurta muddati tugashidan oldin ogohlantiriladi." },
        { n: "4", title: "Kirishni boshqaring", text: "Shifokorlar, banklar yoki qarindoshlarga muddatli havolalar yuboring." },
      ],
    },
    security: {
      heading: "Hujjatlaringiz xavfsiz",
      sub: "Bu hujjatlar qanchalik muhimligini bilamiz — va xotirjam boʻlishingiz uchun hammasini puxta qurdik.",
      promise:
        "Maxfiylik va xavfsizlik — asosiy ustuvorligimiz. Maʼlumotlaringiz xavfsiz bulutda saqlanadi va HTTPS orqali uzatiladi, kirish esa maʼlumotlar bazasi darajasidagi qatʼiy qoidalar bilan cheklangan. Maʼlumotlaringizni hech qachon sotmaymiz yoki almashtirmaymiz va reklama uchun ulashmaymiz.",
      items: [
        { icon: "👨‍👩‍👧", title: "Hujjatlarni faqat oilangiz koʻradi", text: "Kirish maʼlumotlar bazasi darajasida ajratilgan (RLS) — begonalar hujjatlaringizni koʻra olmaydi." },
        { icon: "🛡️", title: "Xavfsiz kirish va xotira", text: "Fayllar shaxsiy xotirada, uzatish HTTPS orqali. Ikki bosqichli kirish va yangi qurilmadan kirishda email ogohlantirish." },
        { icon: "🎚️", title: "Kirishni siz boshqarasiz", text: "Hujjatni muddatli havola orqali ulashing va istalgan vaqtda bekor qiling." },
        { icon: "🙅", title: "Maʼlumotlaringizni sotmaymiz", text: "Maʼlumotlaringizni hech qachon uchinchi shaxslarga bermaymiz yoki sotmaymiz." },
        { icon: "📥", title: "Internetsiz ishlaydi", text: "Kerakli hujjatlarni telefonga saqlang va aloqa boʻlmasa ham oching — sayohatda yoki roumingda." },
      ],
    },
    cta: {
      heading: "Oilangizning barcha hujjatlarini yigʻishga tayyormisiz?",
      sub: "15 daqiqadan kam vaqt — va uzoq saqlanadigan tartib.",
      button: "Bepul boshlash",
    },
    faq: {
      heading: "Tez-tez beriladigan savollar",
      items: [
        { q: "Bu bepulmi?", a: "Ha. Hozir bepul: 2 GB joy, muddat eslatmalari, oila uchun ulashish va oflayn ishlash. Keyinroq koʻproq joy bilan pullik tarif paydo boʻladi — hozir mavjud imkoniyatlar saqlanadi." },
        { q: "Hujjatlarimni kim koʻradi?", a: "Faqat siz va siz ruxsat bergan oila aʼzolari. Kirish maʼlumotlar bazasi darajasida ajratilgan (RLS), fayllar shaxsiy xotirada saqlanadi." },
        { q: "Eslatmalar qanday ishlaydi?", a: "Siz hujjatning amal qilish muddatini (masalan, pasport yoki sugʻurta) belgilaysiz, xizmat esa oldindan emailga eslatma yuboradi." },
        { q: "Hujjatni ulasha olamanmi?", a: "Ha — istalgan vaqtda bekor qila oladigan muddatli havola orqali." },
        { q: "Maʼlumotlarim qayerda saqlanadi?", a: "HTTPS orqali uzatiladigan xavfsiz bulutli xotirada. Maʼlumotlaringizni hech qachon uchinchi shaxslarga sotmaymiz yoki bermaymiz." },
      ],
    },
    forWhom: {
      heading: "Kimga mos",
      items: [
        "Barcha muhim hujjatlarni bitta joyda saqlamoqchi oilalarga",
        "Ota-onalarga — farzandlar hujjatlarini saqlash va yoʻqotmaslik",
        "Tez-tez sayohat qiluvchilarga: pasport, viza, sugʻurta qoʻl ostida",
        "Muddatni unutishdan qoʻrqadiganlarga — viza, sugʻurta, pasportni yangilash",
        "Hujjatni shifokor yoki yurist bilan xavfsiz havola orqali ulashadiganlarga",
      ],
    },
    diff: {
      heading: "Oddiy bulutdan nimasi yaxshi",
      intro: "doki.help — shunchaki fayl diski emas, hujjatlar uchun yaratilgan:",
      items: [
        { t: "Muddatlarni eslatadi", d: "Sanani belgilang — eslatma oldindan keladi. Oddiy bulut buni qila olmaydi." },
        { t: "Odamlar va toifalar boʻyicha tartib", d: "Hujjatlar oila aʼzolari va turlari boʻyicha joylangan, papkalarga tashlanmagan." },
        { t: "Har bir hujjat uchun xavfsiz ulashish", d: "Bitta faylga vaqtinchalik havola, uni bekor qilish mumkin." },
        { t: "Oflayn ishlaydi", d: "Kerakli hujjatlarni internetsiz oching — sayohatda yoki roumingda." },
      ],
    },
    operator: {
      heading: "Xizmat ortida kim turadi",
      line: "Operator: doki.help xizmati egasi, STIR 780728592634.",
      contactLabel: "Qoʻllab-quvvatlash:",
    },
    footer: { copyright: "© 2026 doki.help — Oila hujjatlari seyfi", security: "Xavfsizlik", privacy: "Maxfiylik", login: "Kirish" },
  },
};

function Check() {
  return <span className="font-semibold text-[#b85c38]">✓</span>;
}

/** Структурированные данные для поисковиков (без выдуманных рейтингов/отзывов). */
function buildJsonLd(t: Dict, locale: Locale, appUrl: string) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${appUrl}/#org`,
        name: "doki.help",
        url: appUrl,
        email: "support@doki.help",
      },
      {
        "@type": "WebSite",
        "@id": `${appUrl}/#website`,
        url: appUrl,
        name: "doki.help",
        inLanguage: locale,
        publisher: { "@id": `${appUrl}/#org` },
      },
      {
        "@type": "SoftwareApplication",
        name: "doki.help",
        applicationCategory: "ProductivityApplication",
        operatingSystem: "Web",
        description: t.hero.subtitle,
        url: appUrl,
        offers: { "@type": "Offer", price: "0", priceCurrency: "RUB" },
      },
      {
        "@type": "FAQPage",
        mainEntity: t.faq.items.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      },
    ],
  };
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ code?: string; next?: string }>;
}) {
  // Подстраховка: если в Supabase не разрешён redirect на /auth/callback,
  // он возвращает OAuth-код на Site URL (главную). Перехватываем код здесь
  // и отправляем в callback-роут, который завершит обмен на сессию.
  const sp = await searchParams;
  if (sp.code) {
    const qs = new URLSearchParams({ code: sp.code });
    if (sp.next) qs.set("next", sp.next);
    redirect(`/auth/callback?${qs.toString()}`);
  }
  if (await getUser()) redirect("/my");
  const locale = await getLocale();
  const t = M[locale];
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://doki.help";
  const jsonLd = buildJsonLd(t, locale, appUrl);

  return (
    <div lang={locale} className="min-h-screen bg-[#f9f5f0] text-[#2c2522]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* NAV */}
      <nav className="sticky top-0 z-50 border-b border-[#e8e0d5] bg-[#fdfaf5]">
        <div className="mx-auto max-w-screen-xl px-5">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-x-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[#b85c38] text-white">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M10 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z" />
                </svg>
              </div>
              <div>
                <span className="text-2xl font-semibold tracking-tighter">doki</span>
                <span className="text-2xl font-semibold tracking-tighter text-[#c17a5e]">.help</span>
              </div>
            </div>
            <div className="flex items-center gap-x-4">
              <LangSwitcher locale={locale} />
              <Link href="/login" className="hidden rounded-3xl border border-[#d4c9b8] px-5 py-2.5 text-sm font-medium transition-colors hover:bg-white md:block">
                {t.nav.login}
              </Link>
              <Link href="/login" className="accent-btn rounded-3xl px-6 py-2.5 text-sm font-semibold">
                {t.nav.start}
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="mx-auto max-w-screen-xl px-5 pb-8 pt-10">
        <div className="grid items-center gap-x-8 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <div className="mb-6 inline-flex items-center gap-x-2 rounded-full border border-[#e8e0d5] bg-white px-4 py-1.5 text-sm">
              <span className="h-2 w-2 rounded-full bg-[#b85c38]" />
              <span className="font-medium text-[#5c5248]">{t.hero.badge}</span>
            </div>

            <h1 className="heading-font mb-5 text-[2.65rem] leading-[1.05] tracking-[-1.4px] text-[#2c2522] lg:text-[3.5rem]">
              {t.hero.title.map((line, i) => (
                <span key={i}>
                  {line}
                  {i < t.hero.title.length - 1 && <br />}
                </span>
              ))}
            </h1>

            <p className="mb-8 max-w-md text-[19px] leading-snug text-[#5c5248]">{t.hero.subtitle}</p>

            <div className="mb-8 flex max-w-lg flex-col gap-3 sm:flex-row">
              <Link href="/login" className="accent-btn flex flex-1 items-center justify-center rounded-3xl px-8 py-[17px] text-[17px] font-semibold active:scale-[0.985]">
                {t.hero.cta1}
              </Link>
              <a href="#how" className="flex flex-1 items-center justify-center rounded-3xl border border-[#d4c9b8] px-8 py-[17px] text-[17px] font-semibold transition-colors hover:bg-white">
                {t.hero.cta2}
              </a>
            </div>

            <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-[#5c5248]">
              {t.hero.trust.map((tr) => (
                <span key={tr} className="flex items-center gap-x-2"><Check /> {tr}</span>
              ))}
            </div>
          </div>

          <div className="mt-8 lg:col-span-5 lg:mt-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://d8j0ntlcm91z4.cloudfront.net/user_3EKntK4EDjG8nay4H1dy1TK30mB/hf_20260624_011709_6438e496-ffee-421a-a01a-41cca1abd28f_min.webp"
              alt={t.hero.imgAlt}
              width={928}
              height={1152}
              loading="eager"
              className="h-auto w-full rounded-3xl border border-[#e8e0d5] object-cover shadow-2xl"
            />
          </div>
        </div>
      </section>

      {/* FOR WHOM */}
      <section className="mx-auto max-w-screen-xl px-5 py-8">
        <div className="rounded-3xl border border-[#e8e0d5] bg-[#fdfaf5] p-7">
          <h2 className="section-header mb-5">{t.forWhom.heading}</h2>
          <ul className="grid gap-3 sm:grid-cols-2">
            {t.forWhom.items.map((it) => (
              <li key={it} className="flex items-start gap-x-2 text-[#5c5248]">
                <Check /> <span>{it}</span>
              </li>
            ))}
          </ul>
          <div className="mt-6 flex flex-wrap gap-2">
            {segmentLinks(locale).map((s) => (
              <Link
                key={s.key}
                href={`/for/${s.key}`}
                className="inline-flex items-center gap-1.5 rounded-2xl border border-[#e8e0d5] bg-white px-3.5 py-1.5 text-sm text-[#5c5248] transition-colors hover:border-[#d4a373]"
              >
                <span>{s.emoji}</span> {s.label}
              </Link>
            ))}
          </div>
          <div className="mt-5 border-t border-[#e8e0d5] pt-5">
            <div className="mb-3 text-sm font-medium text-[#8a7c6d]">{comparisonsHeading(locale)}</div>
            <div className="flex flex-wrap gap-2">
              {comparisonLinks(locale).map((cmp) => (
                <Link
                  key={cmp.key}
                  href={`/vs/${cmp.key}`}
                  className="inline-flex items-center gap-1.5 rounded-2xl border border-[#e8e0d5] bg-white px-3.5 py-1.5 text-sm text-[#5c5248] transition-colors hover:border-[#d4a373]"
                >
                  <span>{cmp.emoji}</span> {cmp.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* WHAT TO STORE */}
      <section id="what-to-store" className="mx-auto max-w-screen-xl px-5 py-12">
        <div className="mb-8">
          <h2 className="section-header mb-2">{t.store.heading}</h2>
          <p className="text-xl text-[#5c5248]">{t.store.sub}</p>
        </div>

        <div className="grid gap-4">
          <div className="warm-card rounded-3xl border border-[#e8e0d5] p-7">
            <div className="flex items-start gap-x-5">
              <div className="mt-1 text-5xl">🩺</div>
              <div className="flex-1">
                <div className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-1">
                  <div className="text-2xl font-semibold">{t.store.medTitle}</div>
                  <span className="rounded-full bg-gradient-to-r from-[#b85c38] to-[#d4a373] px-3 py-0.5 text-xs font-semibold text-white">
                    {t.store.medBadge}
                  </span>
                </div>
                <div className="grid grid-cols-1 gap-x-8 text-[#5c5248] md:grid-cols-2">
                  <ul className="space-y-1.5 text-[15px]">
                    {t.store.medCol1.map((it) => <li key={it}>• {it}</li>)}
                  </ul>
                  <ul className="mt-3 space-y-1.5 text-[15px] md:mt-0">
                    {t.store.medCol2.map((it) => <li key={it}>• {it}</li>)}
                  </ul>
                </div>
                <div className="mt-4 text-sm font-medium text-[#b85c38]">{t.store.medNote}</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {t.store.cats.map((c) => (
              <div key={c.title} className="warm-card rounded-3xl border border-[#e8e0d5] p-6">
                <div className="mb-3 flex items-center gap-x-2 text-xl font-semibold">
                  <span>{c.icon}</span>
                  <span>{c.title}</span>
                </div>
                <ul className="space-y-1.5 text-[15px] text-[#5c5248]">
                  {c.items.map((it) => <li key={it}>{it}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="mx-auto max-w-screen-xl rounded-3xl border border-[#e8e0d5] bg-[#fdfaf5] px-5 py-12">
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <h2 className="section-header mb-3">{t.how.heading}</h2>
          <p className="text-xl text-[#5c5248]">{t.how.sub}</p>
        </div>
        <div className="mx-auto grid max-w-3xl gap-x-8 gap-y-8 md:grid-cols-2">
          {t.how.steps.map((s) => (
            <div key={s.n} className="flex gap-5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-[#e8e0d5] bg-white text-2xl font-semibold text-[#b85c38]">
                {s.n}
              </div>
              <div>
                <div className="mb-1.5 text-xl font-semibold">{s.title}</div>
                <p className="text-[#5c5248]">{s.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SECURITY */}
      <section id="security" className="mx-auto max-w-screen-xl px-5 py-14">
        <div className="mx-auto mb-10 max-w-3xl text-center">
          <h2 className="section-header mb-3">{t.security.heading}</h2>
          <p className="text-xl text-[#5c5248]">{t.security.sub}</p>
          <p className="mx-auto mt-4 max-w-2xl text-[#5c5248]">{t.security.promise}</p>
        </div>
        <div className="mx-auto grid max-w-4xl gap-5 md:grid-cols-2">
          {t.security.items.map((s) => (
            <div key={s.title} className="warm-card rounded-3xl border border-[#e8e0d5] p-7">
              <div className="flex gap-x-4">
                <div className="text-3xl">{s.icon}</div>
                <div>
                  <div className="mb-2 text-xl font-semibold">{s.title}</div>
                  <p className="text-[#5c5248]">{s.text}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* WHY BETTER THAN A REGULAR CLOUD */}
      <section className="mx-auto max-w-screen-xl px-5 py-12">
        <div className="mb-6">
          <h2 className="section-header mb-2">{t.diff.heading}</h2>
          <p className="text-xl text-[#5c5248]">{t.diff.intro}</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {t.diff.items.map((d) => (
            <div key={d.t} className="warm-card rounded-3xl border border-[#e8e0d5] p-6">
              <div className="mb-1.5 text-xl font-semibold">{d.t}</div>
              <p className="text-[#5c5248]">{d.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto max-w-screen-xl px-5 py-12">
        <div className="mx-auto mb-8 max-w-3xl text-center">
          <h2 className="section-header mb-3">{t.faq.heading}</h2>
        </div>
        <div className="mx-auto max-w-3xl divide-y divide-[#e8e0d5] overflow-hidden rounded-3xl border border-[#e8e0d5] bg-white">
          {t.faq.items.map((f) => (
            <details key={f.q} className="group px-6 py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-lg font-semibold text-[#2c2522]">
                <span>{f.q}</span>
                <span className="shrink-0 text-2xl leading-none text-[#b85c38] transition-transform group-open:rotate-45">+</span>
              </summary>
              <p className="mt-3 text-[#5c5248]">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* WHO RUNS THE SERVICE */}
      <section className="mx-auto max-w-screen-xl px-5 pb-2">
        <div className="mx-auto max-w-3xl rounded-3xl border border-[#e8e0d5] bg-[#fdfaf5] px-6 py-5 text-center text-sm text-[#5c5248]">
          <div className="mb-1 font-semibold text-[#2c2522]">{t.operator.heading}</div>
          <div>{t.operator.line}</div>
          <div className="mt-1">
            {t.operator.contactLabel}{" "}
            <a href="mailto:support@doki.help" className="text-[#b85c38] hover:underline">
              support@doki.help
            </a>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="mx-auto max-w-screen-xl px-5 py-10">
        <div className="rounded-3xl bg-[#2c2522] px-8 py-10 text-center text-[#f9f5f0]">
          <h2 className="mb-4 text-3xl font-semibold tracking-tight">{t.cta.heading}</h2>
          <p className="mx-auto mb-7 max-w-sm text-[#d4c9b8]">{t.cta.sub}</p>
          <Link href="/login" className="inline-flex items-center justify-center rounded-3xl bg-[#b85c38] px-10 py-4 text-lg font-semibold transition-all hover:bg-[#9f4a2e] active:scale-[0.985]">
            {t.cta.button}
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-[#e8e0d5] bg-[#fdfaf5] px-5 py-8 text-sm text-[#8a7c6d]">
        <div className="mx-auto flex max-w-screen-xl flex-col items-center justify-between gap-y-3 text-center md:flex-row md:text-left">
          <div>{t.footer.copyright}</div>
          <div className="flex gap-x-6">
            <a href="#security" className="hover:text-[#2c2522]">{t.footer.security}</a>
            <Link href="/privacy" className="hover:text-[#2c2522]">{t.footer.privacy}</Link>
            <Link href="/login" className="hover:text-[#2c2522]">{t.footer.login}</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

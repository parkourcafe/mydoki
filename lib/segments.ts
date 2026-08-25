import type { Locale } from "./i18n";

export type SegmentKey =
  | "medical"
  | "travel"
  | "families"
  | "expats"
  | "job-seekers"
  | "employers"
  | "recruitment-agencies"
  | "hospitality"
  | "visa-agents"
  | "freelancers"
  | "visa"
  | "residence";

export const SEGMENT_KEYS: SegmentKey[] = [
  "employers",
  "recruitment-agencies",
  "hospitality",
  "visa-agents",
  "job-seekers",
  "freelancers",
  "families",
  "travel",
  "visa",
  "residence",
  "expats",
  "medical",
];

export type SegmentContent = {
  navLabel: string;
  title: string;
  subtitle: string;
  pains: string[];
  solutions: string[];
  docs: string[];
  /** Optional CTA label override (e.g. "Create your first checklist"). */
  ctaLabel?: string;
  /** Optional anonymized case-study quote shown as a trust block. */
  caseStudy?: { quote: string; role: string };
};

// ctaHref: optional CTA destination override for this segment (defaults to /login).
type Segment = { emoji: string; locales: Record<Locale, SegmentContent>; ctaHref?: string };

const DATA: Record<SegmentKey, Segment> = {
  medical: {
    emoji: "🩺",
    locales: {
      ru: {
        navLabel: "Медицина",
        title: "Все медицинские документы семьи — в одном месте",
        subtitle:
          "Анализы, заключения, прививки и полисы под рукой. Поделитесь с врачом по защищённой ссылке и получайте напоминания о сроках.",
        pains: [
          "Результаты анализов теряются в мессенджерах и почте",
          "Перед приёмом не найти нужную выписку или снимок",
          "Забываются сроки: продление полиса, переосвидетельствование",
          "Неудобно передавать историю болезни новому врачу",
        ],
        solutions: [
          "Вся медкарта семьи в одном месте, по каждому человеку",
          "Поделиться документом с врачом по временной ссылке — и отозвать её",
          "Напоминания о сроках: полис ОМС/ДМС, справки, переосвидетельствование",
          "Доступ с телефона даже без интернета — на приёме или в поездке",
        ],
        docs: [
          "Результаты анализов",
          "УЗИ, МРТ, КТ, рентген",
          "Заключения врачей",
          "Прививочный сертификат",
          "Полис ОМС / ДМС",
          "Медицинские справки",
        ],
      },
      en: {
        navLabel: "Medical",
        title: "All your family's medical documents in one place",
        subtitle:
          "Test results, reports, vaccinations and insurance at hand. Share with a doctor via a secure link and get deadline reminders.",
        pains: [
          "Test results get lost in messengers and email",
          "Before an appointment you can't find the right report or scan",
          "Deadlines slip: insurance renewals, re-examinations",
          "Hard to hand your medical history to a new doctor",
        ],
        solutions: [
          "The whole family's health card in one place, per person",
          "Share a document with a doctor via a temporary link — and revoke it",
          "Reminders for deadlines: insurance, certificates, re-examinations",
          "Access from your phone even offline — at the clinic or on a trip",
        ],
        docs: [
          "Test results",
          "Ultrasound, MRI, CT, X-ray",
          "Doctor's reports",
          "Vaccination certificate",
          "Health insurance",
          "Medical certificates",
        ],
      },
      id: {
        navLabel: "Medis",
        title: "Semua dokumen medis keluarga di satu tempat",
        subtitle:
          "Hasil tes, laporan, vaksinasi, dan asuransi selalu siap. Bagikan ke dokter lewat tautan aman dan dapatkan pengingat tenggat.",
        pains: [
          "Hasil tes hilang di pesan dan email",
          "Sebelum konsultasi, sulit menemukan laporan atau hasil pindai yang tepat",
          "Tenggat terlewat: perpanjangan asuransi, pemeriksaan ulang",
          "Sulit menyerahkan riwayat medis ke dokter baru",
        ],
        solutions: [
          "Seluruh kartu kesehatan keluarga di satu tempat, per orang",
          "Bagikan dokumen ke dokter lewat tautan sementara — dan cabut kapan saja",
          "Pengingat tenggat: asuransi, surat keterangan, pemeriksaan ulang",
          "Akses dari ponsel bahkan offline — di klinik atau saat bepergian",
        ],
        docs: [
          "Hasil tes",
          "USG, MRI, CT, rontgen",
          "Laporan dokter",
          "Sertifikat vaksinasi",
          "Asuransi kesehatan",
          "Surat keterangan medis",
        ],
      },
      uz: {
        navLabel: "Tibbiyot",
        title: "Oilaning barcha tibbiy hujjatlari bitta joyda",
        subtitle:
          "Tahlillar, xulosalar, emlashlar va sugʻurta qoʻl ostida. Shifokorga xavfsiz havola orqali ulashing va muddat eslatmalarini oling.",
        pains: [
          "Tahlil natijalari messenjer va pochtada yoʻqoladi",
          "Qabuldan oldin kerakli xulosa yoki suratni topib boʻlmaydi",
          "Muddatlar oʻtib ketadi: sugʻurtani yangilash, qayta koʻrik",
          "Kasallik tarixini yangi shifokorga topshirish noqulay",
        ],
        solutions: [
          "Butun oila tibbiy kartasi bitta joyda, har bir odam boʻyicha",
          "Hujjatni shifokorga vaqtinchalik havola orqali ulashing — va bekor qiling",
          "Muddat eslatmalari: sugʻurta, maʼlumotnomalar, qayta koʻrik",
          "Telefondan oflayn ham kirish — qabulda yoki sayohatda",
        ],
        docs: [
          "Tahlil natijalari",
          "UTT, MRT, KT, rentgen",
          "Shifokor xulosalari",
          "Emlash sertifikati",
          "Tibbiy sugʻurta",
          "Tibbiy maʼlumotnomalar",
        ],
      },
    },
  },
  travel: {
    emoji: "✈️",
    locales: {
      ru: {
        navLabel: "Путешествия",
        title: "Путешествуйте без страха потерять документы",
        subtitle:
          "Паспорт, виза, страховка и брони — в одном месте, доступны с любого устройства. Напоминания о сроках визы и загранпаспорта.",
        pains: [
          "Потеря загранпаспорта или визы вдали от дома",
          "В поездке нет под рукой брони или страховки",
          "Просроченная виза или паспорт из-за забытого срока",
          "Сложно собрать документы на всю семью перед поездкой",
        ],
        solutions: [
          "Все документы для поездки — в одном месте и под рукой",
          "Напоминания о сроках визы, загранпаспорта и страховки",
          "Доступ офлайн — в самолёте, роуминге или без связи",
          "Общий доступ для семьи: документы детей и супруга рядом",
        ],
        docs: [
          "Загранпаспорт",
          "Виза",
          "Страховка для поездок",
          "Брони и билеты",
          "Справки о прививках",
          "Водительское удостоверение",
        ],
      },
      en: {
        navLabel: "Travel",
        title: "Travel without fear of losing documents",
        subtitle:
          "Passport, visa, insurance and bookings in one place, available on any device. Reminders for visa and passport expiry.",
        pains: [
          "Losing a passport or visa far from home",
          "On a trip you don't have your booking or insurance at hand",
          "An expired visa or passport because a deadline was forgotten",
          "Hard to gather documents for the whole family before a trip",
        ],
        solutions: [
          "All your travel documents in one place and at hand",
          "Reminders for visa, passport and insurance deadlines",
          "Offline access — on a plane, in roaming or with no signal",
          "Shared access for the family: kids' and spouse's documents nearby",
        ],
        docs: [
          "International passport",
          "Visa",
          "Travel insurance",
          "Bookings & tickets",
          "Vaccination certificates",
          "Driver's license",
        ],
      },
      id: {
        navLabel: "Perjalanan",
        title: "Bepergian tanpa takut kehilangan dokumen",
        subtitle:
          "Paspor, visa, asuransi, dan pemesanan di satu tempat, tersedia di perangkat apa pun. Pengingat masa berlaku visa dan paspor.",
        pains: [
          "Kehilangan paspor atau visa jauh dari rumah",
          "Saat bepergian, pemesanan atau asuransi tidak ada di tangan",
          "Visa atau paspor kedaluwarsa karena tenggat terlupakan",
          "Sulit mengumpulkan dokumen seluruh keluarga sebelum perjalanan",
        ],
        solutions: [
          "Semua dokumen perjalanan di satu tempat dan siap pakai",
          "Pengingat tenggat visa, paspor, dan asuransi",
          "Akses offline — di pesawat, roaming, atau tanpa sinyal",
          "Akses bersama untuk keluarga: dokumen anak dan pasangan",
        ],
        docs: [
          "Paspor internasional",
          "Visa",
          "Asuransi perjalanan",
          "Pemesanan & tiket",
          "Sertifikat vaksinasi",
          "SIM",
        ],
      },
      uz: {
        navLabel: "Sayohat",
        title: "Hujjatlarni yoʻqotishdan qoʻrqmasdan sayohat qiling",
        subtitle:
          "Pasport, viza, sugʻurta va bronlar bitta joyda, istalgan qurilmada. Viza va xorijiy pasport muddati haqida eslatmalar.",
        pains: [
          "Uydan uzoqda pasport yoki vizani yoʻqotish",
          "Sayohatda bron yoki sugʻurta qoʻl ostida boʻlmaydi",
          "Muddat unutilgani uchun viza yoki pasport muddati oʻtadi",
          "Sayohatdan oldin butun oila hujjatlarini yigʻish qiyin",
        ],
        solutions: [
          "Barcha sayohat hujjatlari bitta joyda va qoʻl ostida",
          "Viza, pasport va sugʻurta muddatlari haqida eslatmalar",
          "Oflayn kirish — samolyotda, roumingda yoki aloqasiz",
          "Oila uchun umumiy kirish: bolalar va turmush oʻrtoq hujjatlari",
        ],
        docs: [
          "Xorijiy pasport",
          "Viza",
          "Sayohat sugʻurtasi",
          "Bron va chiptalar",
          "Emlash sertifikatlari",
          "Haydovchilik guvohnomasi",
        ],
      },
    },
  },
  families: {
    emoji: "👨‍👩‍👧",
    locales: {
      ru: {
        navLabel: "Семьи",
        title: "Документы всей семьи — в одном порядке",
        subtitle:
          "Свидетельства, паспорта, медкарта и имущество по каждому члену семьи. Общий доступ для близких и напоминания о сроках.",
        pains: [
          "Документы детей, супруга и родителей разбросаны по папкам и телефонам",
          "Перед садиком, школой или поликлиникой не найти нужную справку",
          "Никто, кроме одного человека, не знает, где что лежит",
          "Забываются сроки: паспорт ребёнка в 14 лет, продление полиса",
        ],
        solutions: [
          "Профиль на каждого члена семьи — взрослого и ребёнка",
          "Общий доступ для близких: видят и находят документы сами",
          "Напоминания о сроках сразу по всем членам семьи",
          "Безопасный обмен с садиком, школой, врачом по ссылке",
        ],
        docs: [
          "Свидетельства о рождении",
          "Паспорта и СНИЛС",
          "Документы детей (сад, школа)",
          "Медкарта семьи",
          "Полисы и страховки",
          "Документы на имущество",
        ],
      },
      en: {
        navLabel: "Families",
        title: "Your whole family's documents, neatly in order",
        subtitle:
          "Certificates, passports, health records and property per family member. Shared access for loved ones and deadline reminders.",
        pains: [
          "Kids', spouse's and parents' documents scattered across folders and phones",
          "Before daycare, school or a clinic you can't find the right certificate",
          "Only one person knows where everything is",
          "Deadlines slip: a child's passport, insurance renewals",
        ],
        solutions: [
          "A profile for each family member — adult and child",
          "Shared access for loved ones: they find documents themselves",
          "Reminders for deadlines across all family members at once",
          "Secure sharing with daycare, school or a doctor via a link",
        ],
        docs: [
          "Birth certificates",
          "Passports & IDs",
          "Children's documents (daycare, school)",
          "Family health records",
          "Insurance policies",
          "Property documents",
        ],
      },
      id: {
        navLabel: "Keluarga",
        title: "Dokumen seluruh keluarga, tertata rapi",
        subtitle:
          "Akta, paspor, rekam medis, dan properti per anggota keluarga. Akses bersama untuk orang terkasih dan pengingat tenggat.",
        pains: [
          "Dokumen anak, pasangan, dan orang tua tersebar di folder dan ponsel",
          "Sebelum penitipan anak, sekolah, atau klinik, sulit menemukan surat yang tepat",
          "Hanya satu orang yang tahu di mana semuanya",
          "Tenggat terlewat: paspor anak, perpanjangan asuransi",
        ],
        solutions: [
          "Profil untuk setiap anggota keluarga — dewasa dan anak",
          "Akses bersama untuk orang terkasih: mereka menemukan dokumen sendiri",
          "Pengingat tenggat untuk semua anggota keluarga sekaligus",
          "Berbagi aman dengan penitipan anak, sekolah, atau dokter lewat tautan",
        ],
        docs: [
          "Akta kelahiran",
          "Paspor & identitas",
          "Dokumen anak (penitipan, sekolah)",
          "Rekam medis keluarga",
          "Polis asuransi",
          "Dokumen properti",
        ],
      },
      uz: {
        navLabel: "Oila",
        title: "Butun oila hujjatlari — tartibda",
        subtitle:
          "Guvohnomalar, pasportlar, tibbiy karta va mulk har bir oila aʼzosi boʻyicha. Yaqinlar uchun umumiy kirish va muddat eslatmalari.",
        pains: [
          "Bolalar, turmush oʻrtoq va ota-ona hujjatlari papka va telefonlarga tarqalgan",
          "Bogʻcha, maktab yoki poliklinikadan oldin kerakli maʼlumotnomani topib boʻlmaydi",
          "Hammasi qayerdaligini faqat bitta odam biladi",
          "Muddatlar oʻtib ketadi: bola pasporti, sugʻurtani yangilash",
        ],
        solutions: [
          "Har bir oila aʼzosi uchun profil — kattalar va bola",
          "Yaqinlar uchun umumiy kirish: hujjatlarni oʻzlari topadi",
          "Barcha oila aʼzolari boʻyicha muddat eslatmalari bir vaqtda",
          "Bogʻcha, maktab yoki shifokor bilan havola orqali xavfsiz ulashish",
        ],
        docs: [
          "Tugʻilganlik guvohnomalari",
          "Pasportlar va ID",
          "Bola hujjatlari (bogʻcha, maktab)",
          "Oila tibbiy kartasi",
          "Sugʻurta polislari",
          "Mulk hujjatlari",
        ],
      },
    },
  },
  expats: {
    emoji: "🌍",
    locales: {
      // RU-локаль ведёт другой рынок: русскоязычные экспаты и долгосрочные
      // жители Бали/Индонезии, а не иммигранты в Россию. Лексика — их:
      // визы/KITAS/визаран, аренда, страховки, дети в местной школе.
      ru: {
        navLabel: "Жизнь на Бали",
        title: "Все документы для жизни на Бали — в одном месте",
        subtitle:
          "Визы и KITAS, паспорта, страховки, договоры аренды и документы детей спокойно лежат в одном месте, а напоминания помогают не пропустить продление.",
        pains: [
          "Срок визы, KITAS или загранпаспорта легко пропустить среди бытовых дел",
          "Сканы разбросаны по чатам, галерее и почте — нужный не находится",
          "Школа, арендодатель или страховая просят документ срочно, а вы не дома",
          "Документы всей семьи должны быть под рукой у каждого взрослого",
        ],
        solutions: [
          "Визы, KITAS, паспорта, страховки и договоры — по членам семьи в одном сейфе",
          "Напоминания о датах продления приходят заранее: за 30, 7 и 1 день",
          "Офлайн-доступ (PWA): сохранённые документы открываются даже без связи",
          "Нужный файл отправляется агенту или школе ссылкой с истекающим сроком",
        ],
        docs: [
          "Паспорт и визы",
          "KITAS / KITAP",
          "Страховые полисы",
          "Договоры аренды",
          "Документы детей",
          "Доверенности и справки",
        ],
      },
      en: {
        navLabel: "Expats",
        title: "All your documents for life abroad — at hand",
        subtitle:
          "Residence permits, visas and immigration papers in one place. Deadline reminders so you never miss a renewal.",
        pains: [
          "An expired residence permit or visa because a deadline was missed",
          "Documents in different languages scattered and lost",
          "You urgently need a scan, but the original is far away",
          "Hard to keep the whole family's documents at hand in another country",
        ],
        solutions: [
          "Residence permits, visas and immigration papers in one place",
          "Reminders for renewal deadlines in advance",
          "Access to scans from any device, in any country",
          "Shared access for family and sharing with a lawyer via a secure link",
        ],
        docs: [
          "Residence permit",
          "Visa",
          "Migration card",
          "International passport",
          "Registrations & notices",
          "Translations & apostilles",
        ],
      },
      id: {
        navLabel: "Ekspat",
        title: "Semua dokumen untuk hidup di luar negeri — siap pakai",
        subtitle:
          "Izin tinggal, visa, dan dokumen imigrasi di satu tempat. Pengingat tenggat agar tidak pernah melewatkan perpanjangan.",
        pains: [
          "Izin tinggal atau visa kedaluwarsa karena tenggat terlewat",
          "Dokumen dalam berbagai bahasa tersebar dan hilang",
          "Anda butuh pindaian mendesak, tapi aslinya jauh",
          "Sulit menyimpan dokumen seluruh keluarga di negara lain",
        ],
        solutions: [
          "Izin tinggal, visa, dan dokumen imigrasi di satu tempat",
          "Pengingat tenggat perpanjangan lebih awal",
          "Akses ke pindaian dari perangkat apa pun, di negara mana pun",
          "Akses bersama untuk keluarga dan berbagi dengan pengacara lewat tautan aman",
        ],
        docs: [
          "Izin tinggal",
          "Visa",
          "Kartu migrasi",
          "Paspor internasional",
          "Registrasi & pemberitahuan",
          "Terjemahan & apostille",
        ],
      },
      uz: {
        navLabel: "Ekspatlar",
        title: "Chet elda yashash uchun barcha hujjatlar — qoʻl ostida",
        subtitle:
          "Yashash uchun ruxsatnoma, vizalar va migratsiya hujjatlari bitta joyda. Yangilashni oʻtkazib yubormaslik uchun muddat eslatmalari.",
        pains: [
          "Muddat oʻtkazib yuborilgani uchun yashash ruxsatnomasi yoki viza muddati oʻtadi",
          "Turli tillardagi hujjatlar tarqalgan va yoʻqoladi",
          "Skan shoshilinch kerak, lekin asl nusxa uzoqda",
          "Boshqa davlatda butun oila hujjatlarini qoʻl ostida saqlash qiyin",
        ],
        solutions: [
          "Yashash ruxsatnomasi, vizalar va migratsiya hujjatlari bitta joyda",
          "Yangilash muddatlari haqida oldindan eslatmalar",
          "Skanlarga istalgan qurilmadan, istalgan davlatda kirish",
          "Oila uchun umumiy kirish va yurist bilan xavfsiz havola orqali ulashish",
        ],
        docs: [
          "Yashash ruxsatnomasi",
          "Viza",
          "Migratsiya kartasi",
          "Xorijiy pasport",
          "Roʻyxat va bildirishnomalar",
          "Tarjima va apostil",
        ],
      },
    },
  },
  "job-seekers": {
    emoji: "🙋",
    locales: {
      ru: {
        navLabel: "Ищу работу",
        title: "Откликайтесь на вакансии готовым пакетом документов",
        subtitle:
          "Резюме, ID, сертификаты и портфолио — в одном месте. Один клик — и работодатель получает всё, что просил.",
        pains: [
          "CV в одном чате, сертификат в почте, ID в галерее",
          "Каждый отклик — заново собирать одни и те же документы",
          "Работодатель просит справку или видео в последний момент",
          "После отклика непонятно, что происходит со статусом",
        ],
        solutions: [
          "Резюме и документы хранятся готовым пакетом",
          "Отклик одним кликом — со всеми документами, которые просит вакансия",
          "Видео-ответ и ответы на вопросы прямо в отклике",
          "Статус отклика — по ссылке, без звонков и ожидания",
        ],
        docs: ["Резюме (CV)", "ID / паспорт", "Дипломы и сертификаты", "Портфолио", "Медсправка", "Рекомендации"],
      },
      en: {
        navLabel: "Job seekers",
        title: "Apply to jobs with a ready document package",
        subtitle:
          "Resume, ID, certificates and portfolio in one place. One click — and the employer gets everything they asked for.",
        pains: [
          "CV in one chat, certificate in email, ID in the gallery",
          "Every application means collecting the same documents again",
          "The employer asks for a certificate or video at the last minute",
          "After applying, the status is a mystery",
        ],
        solutions: [
          "Your resume and documents live as a ready package",
          "Apply in one click — with every document the vacancy asks for",
          "Video answer and screening answers right in the application",
          "Application status by link — no calls, no waiting",
        ],
        docs: ["Resume (CV)", "ID / passport", "Diplomas & certificates", "Portfolio", "Health certificate", "References"],
      },
      id: {
        navLabel: "Pencari kerja",
        title: "Lamar kerja dengan paket dokumen siap kirim",
        subtitle:
          "Resume, KTP, sertifikat, dan portofolio di satu tempat. Satu klik — perusahaan menerima semua yang diminta.",
        pains: [
          "CV di satu chat, sertifikat di email, KTP di galeri",
          "Setiap lamaran harus mengumpulkan dokumen yang sama lagi",
          "Perusahaan minta surat atau video di menit terakhir",
          "Setelah melamar, status tidak jelas",
        ],
        solutions: [
          "Resume dan dokumen tersimpan sebagai paket siap pakai",
          "Lamar sekali klik — dengan semua dokumen yang diminta lowongan",
          "Jawaban video dan pertanyaan seleksi langsung di lamaran",
          "Status lamaran lewat tautan — tanpa telepon dan menunggu",
        ],
        docs: ["Resume (CV)", "KTP / paspor", "Ijazah & sertifikat", "Portofolio", "Surat sehat", "Rekomendasi"],
      },
      uz: {
        navLabel: "Ish izlovchilar",
        title: "Tayyor hujjatlar paketi bilan ishga ariza bering",
        subtitle:
          "Rezyume, ID, sertifikatlar va portfolio — bitta joyda. Bir bosish — ish beruvchi soʻragan hamma narsani oladi.",
        pains: [
          "CV bir chatda, sertifikat pochtada, ID galereyada",
          "Har bir ariza uchun oʻsha hujjatlarni qaytadan yigʻish",
          "Ish beruvchi oxirgi daqiqada maʼlumotnoma yoki video soʻraydi",
          "Arizadan keyin status nima boʻlgani nomaʼlum",
        ],
        solutions: [
          "Rezyume va hujjatlar tayyor paket sifatida saqlanadi",
          "Bir bosishda ariza — vakansiya soʻragan barcha hujjatlar bilan",
          "Video-javob va savollar javobi arizaning oʻzida",
          "Ariza statusi — havola orqali, qoʻngʻiroqsiz",
        ],
        docs: ["Rezyume (CV)", "ID / pasport", "Diplom va sertifikatlar", "Portfolio", "Tibbiy maʼlumotnoma", "Tavsiyalar"],
      },
    },
  },
  employers: {
    emoji: "💼",
    ctaHref: "/employer/vacancies/new",
    locales: {
      ru: {
        navLabel: "HR и агентства",
        title: "Отправьте один чек-лист — получите полный пакет документов",
        subtitle:
          "Для HR-команд и рекрутинговых агентств: один список нужных документов → ссылка кандидату → полный пакет, статус «чего не хватает» и напоминания о сроках.",
        pains: [
          "Кандидаты присылают документы кусками в WhatsApp и email",
          "Резюме есть, а нужных справок, KTP и сертификатов — нет",
          "Непонятно, у кого чего не хватает и что просрочено",
          "Документы теряются между чатами и папками",
        ],
        solutions: [
          "Чек-лист-ссылка: кандидат загружает без регистрации, вы получаете полный пакет",
          "Статус по каждому кандидату: «полный / не хватает» — сразу видно, кого догнать",
          "Напоминания о сроках (SKCK, KITAS, сертификаты) — ничего не просрочено",
          "Все пакеты в одном дашборде: шортлист, отказы, экспорт без привязки",
        ],
        docs: ["CV кандидата", "KTP / ID", "Сертификаты", "SKCK", "KITAS", "Медсправка"],
        ctaLabel: "Создать первый чек-лист",
      },
      en: {
        navLabel: "HR & agencies",
        title: "Send one checklist — get the full document package back",
        subtitle:
          "For HR teams and recruiting agencies: one list of required documents → a link to the candidate → a complete package, a “what's missing” status, and deadline reminders.",
        pains: [
          "Candidates send documents in pieces over WhatsApp and email",
          "There's a resume, but no required certificates, KTP or ID",
          "No clarity on who is missing what, or what has expired",
          "Documents get lost between chats and folders",
        ],
        solutions: [
          "A checklist link: candidates upload without an account, you get the full package",
          "Per-candidate status: “complete / missing” — you instantly see who to chase",
          "Deadline reminders (SKCK, KITAS, certificates) — nothing expires unnoticed",
          "Every package in one dashboard: shortlist, rejections, export with no lock-in",
        ],
        docs: ["Candidate CV", "KTP / ID", "Certificates", "SKCK", "KITAS", "Health certificate"],
        ctaLabel: "Create your first checklist",
      },
      id: {
        navLabel: "Tim HR & Agensi",
        title: "Kirim satu ceklis — terima paket dokumen lengkap",
        subtitle:
          "Untuk tim HR dan agensi rekrutmen: satu daftar dokumen wajib → tautan ke kandidat → paket lengkap, status “apa yang kurang”, dan pengingat tenggat.",
        pains: [
          "Kandidat mengirim dokumen sepotong-sepotong lewat WhatsApp dan email",
          "Ada resume, tapi sertifikat, KTP, atau surat yang wajib tidak ada",
          "Tidak jelas siapa yang kurang apa, atau apa yang sudah kedaluwarsa",
          "Dokumen tercecer di antara chat dan folder",
        ],
        solutions: [
          "Tautan ceklis: kandidat mengunggah tanpa akun, Anda menerima paket lengkap",
          "Status per kandidat: “lengkap / kurang” — langsung terlihat siapa yang perlu ditagih",
          "Pengingat tenggat (SKCK, KITAS, sertifikat) — tidak ada yang kedaluwarsa diam-diam",
          "Semua paket di satu dasbor: shortlist, penolakan, ekspor tanpa terkunci",
        ],
        docs: ["CV kandidat", "KTP / ID", "Sertifikat", "SKCK", "KITAS", "Surat sehat"],
        ctaLabel: "Buat checklist pertama",
      },
      uz: {
        navLabel: "HR va agentliklar",
        title: "Bitta roʻyxat yuboring — toʻliq hujjatlar paketini oling",
        subtitle:
          "HR jamoalari va rekruting agentliklari uchun: kerakli hujjatlar roʻyxati → nomzodga havola → toʻliq paket, “nima yetishmayapti” statusi va muddat eslatmalari.",
        pains: [
          "Nomzodlar hujjatlarni WhatsApp va emailda boʻlak-boʻlak yuboradi",
          "Rezyume bor, kerakli sertifikat, KTP yoki maʼlumotnoma yoʻq",
          "Kimda nima yetishmayotgani yoki nima muddati oʻtgani noaniq",
          "Hujjatlar chat va papkalar orasida yoʻqoladi",
        ],
        solutions: [
          "Roʻyxat-havola: nomzod hisobsiz yuklaydi, siz toʻliq paketni olasiz",
          "Har bir nomzod boʻyicha status: “toʻliq / kam” — kimni qoʻshishni darrov koʻrasiz",
          "Muddat eslatmalari (SKCK, KITAS, sertifikatlar) — hech narsa bilinmay oʻtmaydi",
          "Barcha paketlar bitta dashboardda: shortlist, rad etish, bogʻlanishsiz eksport",
        ],
        docs: ["Nomzod CV", "KTP / ID", "Sertifikatlar", "SKCK", "KITAS", "Tibbiy maʼlumotnoma"],
        ctaLabel: "Birinchi roʻyxatni yarating",
      },
    },
  },
  freelancers: {
    emoji: "🎨",
    locales: {
      ru: {
        navLabel: "Фрилансерам",
        title: "Портфолио и документы — одной ссылкой клиенту",
        subtitle:
          "Соберите работы и подтверждения в аккуратную публичную страницу. Клиент открывает без входа, доступ можно отозвать.",
        pains: [
          "Работы разбросаны по ссылкам, дискам и чатам",
          "Клиент просит подтверждения и документы — собираешь заново",
          "Личные документы страшно отправлять в переписке",
          "Для каждого клиента — новая подборка вручную",
        ],
        solutions: [
          "Публичное портфолио одной ссылкой — без регистрации для клиента",
          "Пакет документов по защищённой ссылке с ограниченным сроком",
          "Доступ можно отозвать в любой момент",
          "Резюме и портфолио подключаются к откликам на вакансии",
        ],
        docs: ["Портфолио работ", "Резюме (CV)", "Сертификаты", "ID / паспорт", "Договоры", "Рекомендации"],
      },
      en: {
        navLabel: "Freelancers",
        title: "Your portfolio and documents — one link for the client",
        subtitle:
          "Gather your work and credentials into one tidy public page. The client opens it with no sign-in; access can be revoked.",
        pains: [
          "Work scattered across links, drives and chats",
          "A client asks for credentials — you assemble them again",
          "Sending personal documents in a chat feels unsafe",
          "Every client means a new manual compilation",
        ],
        solutions: [
          "A public portfolio in one link — no registration for the client",
          "A document package via a secure, time-limited link",
          "Access can be revoked at any moment",
          "Resume and portfolio plug into your job applications",
        ],
        docs: ["Work portfolio", "Resume (CV)", "Certificates", "ID / passport", "Contracts", "References"],
      },
      id: {
        navLabel: "Freelancer",
        title: "Portofolio dan dokumen — satu tautan untuk klien",
        subtitle:
          "Kumpulkan karya dan bukti ke satu halaman publik yang rapi. Klien membuka tanpa login; akses bisa dicabut.",
        pains: [
          "Karya tersebar di tautan, drive, dan chat",
          "Klien minta bukti dan dokumen — dikumpulkan ulang lagi",
          "Mengirim dokumen pribadi lewat chat terasa tidak aman",
          "Setiap klien berarti kompilasi manual baru",
        ],
        solutions: [
          "Portofolio publik satu tautan — tanpa registrasi untuk klien",
          "Paket dokumen lewat tautan aman berbatas waktu",
          "Akses bisa dicabut kapan saja",
          "Resume dan portofolio terhubung ke lamaran kerja",
        ],
        docs: ["Portofolio karya", "Resume (CV)", "Sertifikat", "KTP / paspor", "Kontrak", "Rekomendasi"],
      },
      uz: {
        navLabel: "Frilanserlarga",
        title: "Portfolio va hujjatlar — mijozga bitta havola",
        subtitle:
          "Ishlar va tasdiqlarni bitta ozoda sahifaga yigʻing. Mijoz kirishsiz ochadi; kirishni bekor qilish mumkin.",
        pains: [
          "Ishlar havolalar, disklar va chatlarda sochilib yotibdi",
          "Mijoz tasdiq va hujjat soʻraydi — yana qaytadan yigʻasiz",
          "Shaxsiy hujjatlarni chatda yuborish xavfli tuyuladi",
          "Har bir mijoz uchun yangi qoʻlda toʻplam",
        ],
        solutions: [
          "Bitta havolada ochiq portfolio — mijozga roʻyxatdan oʻtish shart emas",
          "Muddatli xavfsiz havola orqali hujjatlar paketi",
          "Kirishni istalgan payt bekor qilish mumkin",
          "Rezyume va portfolio ish arizalariga ulanadi",
        ],
        docs: ["Ishlar portfoliosi", "Rezyume (CV)", "Sertifikatlar", "ID / pasport", "Shartnomalar", "Tavsiyalar"],
      },
    },
  },
  visa: {
    emoji: "🛂",
    locales: {
      ru: {
        navLabel: "Визы",
        title: "Визы и их сроки — под контролем",
        subtitle:
          "Все визы семьи в одном месте, AI распознаёт срок с фото, а напоминание приходит заранее — не в последний день.",
        pains: [
          "Срок визы подкрадывается незаметно — и начинается паника",
          "Документы для продления разбросаны по чатам и папкам",
          "В аэропорту просят то, чего нет под рукой",
          "У каждого члена семьи — свои даты, всё в голове не удержать",
        ],
        solutions: [
          "Напоминания заранее — по каждой визе каждого члена семьи",
          "AI сам распознаёт срок действия с фото документа",
          "Пакет для продления собран заранее и готов к отправке",
          "Офлайн-доступ к сканам в поездке и на границе",
        ],
        docs: ["Виза", "Загранпаспорт", "Страховка", "Билеты и брони", "Фото для визы", "Справки и выписки"],
      },
      en: {
        navLabel: "Visas",
        title: "Visas and their deadlines — under control",
        subtitle:
          "All the family's visas in one place, AI reads the expiry date from a photo, and the reminder comes early — not on the last day.",
        pains: [
          "The visa deadline sneaks up — and panic begins",
          "Renewal documents are scattered across chats and folders",
          "The airport asks for something you don't have at hand",
          "Each family member has different dates — impossible to keep in mind",
        ],
        solutions: [
          "Early reminders — for every visa of every family member",
          "AI reads the expiry date straight from a document photo",
          "The renewal package is assembled in advance, ready to send",
          "Offline access to scans while traveling and at the border",
        ],
        docs: ["Visa", "Passport", "Insurance", "Tickets & bookings", "Visa photos", "Certificates & statements"],
      },
      id: {
        navLabel: "Visa",
        title: "Visa dan tenggatnya — terkendali",
        subtitle:
          "Semua visa keluarga di satu tempat, AI membaca tanggal kedaluwarsa dari foto, pengingat datang lebih awal — bukan di hari terakhir.",
        pains: [
          "Tenggat visa datang diam-diam — lalu panik",
          "Dokumen perpanjangan tersebar di chat dan folder",
          "Bandara minta sesuatu yang tidak ada di tangan",
          "Tiap anggota keluarga punya tanggal berbeda — mustahil diingat semua",
        ],
        solutions: [
          "Pengingat lebih awal — untuk setiap visa setiap anggota keluarga",
          "AI membaca tanggal kedaluwarsa langsung dari foto dokumen",
          "Paket perpanjangan disiapkan lebih dulu, siap dikirim",
          "Akses offline ke pindaian saat bepergian dan di perbatasan",
        ],
        docs: ["Visa", "Paspor", "Asuransi", "Tiket & pemesanan", "Foto visa", "Surat & keterangan"],
      },
      uz: {
        navLabel: "Vizalar",
        title: "Vizalar va muddatlari — nazoratda",
        subtitle:
          "Oilaning barcha vizalari bitta joyda, AI suratdan muddatni oʻqiydi, eslatma esa oldindan keladi — oxirgi kunda emas.",
        pains: [
          "Viza muddati sezdirmay keladi — keyin vahima boshlanadi",
          "Uzaytirish hujjatlari chat va papkalarda sochilgan",
          "Aeroportda qoʻl ostida yoʻq narsani soʻrashadi",
          "Har bir oila aʼzosining oʻz sanalari bor — hammasini eslab boʻlmaydi",
        ],
        solutions: [
          "Oldindan eslatmalar — har bir oila aʼzosining har bir vizasi uchun",
          "AI hujjat suratidan amal qilish muddatini oʻzi oʻqiydi",
          "Uzaytirish paketi oldindan yigʻilgan va yuborishga tayyor",
          "Sayohatda va chegarada skanlarga oflayn kirish",
        ],
        docs: ["Viza", "Xorijiy pasport", "Sugʻurta", "Chiptalar va bronlar", "Viza uchun surat", "Maʼlumotnomalar"],
      },
    },
  },
  residence: {
    emoji: "🏝️",
    locales: {
      ru: {
        navLabel: "Вид на жительство",
        title: "ВНЖ и KITAS: документы и продления без паники",
        subtitle:
          "Все документы на проживание — по каждому члену семьи, с напоминаниями о продлении и пакетом для иммиграционной службы.",
        pains: [
          "Продление ВНЖ — это куча справок, и все в разных местах",
          "Сроки у всей семьи разные, легко пропустить чей-то",
          "Документы на разных языках, часть — только в бумаге",
          "Потерять оригинал — страшно, а копии не найти",
        ],
        solutions: [
          "Всё по каждому члену семьи: ВНЖ, паспорта, письма, страховки",
          "Напоминания о продлении приходят заранее",
          "Сканы всегда с собой — офлайн, в любой стране",
          "Пакет для иммиграционной службы — одним кликом",
        ],
        docs: ["ВНЖ / KITAS", "Паспорт", "Спонсорские письма", "Налоговые номера", "Страховка", "Договор аренды"],
      },
      en: {
        navLabel: "Residence permit",
        title: "Residence permits & KITAS: renewals without panic",
        subtitle:
          "All residency documents — per family member, with renewal reminders and a ready package for the immigration office.",
        pains: [
          "A residence renewal means a pile of certificates in different places",
          "The whole family has different dates — easy to miss someone's",
          "Documents in different languages, some only on paper",
          "Losing an original is scary, and copies are nowhere to be found",
        ],
        solutions: [
          "Everything per family member: permits, passports, letters, insurance",
          "Renewal reminders arrive in advance",
          "Scans always with you — offline, in any country",
          "The immigration-office package — in one click",
        ],
        docs: ["Residence permit / KITAS", "Passport", "Sponsor letters", "Tax numbers", "Insurance", "Rental contract"],
      },
      id: {
        navLabel: "Izin tinggal",
        title: "KITAS & izin tinggal: perpanjangan tanpa panik",
        subtitle:
          "Semua dokumen tinggal — per anggota keluarga, dengan pengingat perpanjangan dan paket siap untuk kantor imigrasi.",
        pains: [
          "Perpanjangan izin tinggal berarti tumpukan surat di tempat berbeda",
          "Tanggal tiap anggota keluarga berbeda — mudah terlewat",
          "Dokumen dalam berbagai bahasa, sebagian hanya di kertas",
          "Kehilangan dokumen asli itu menakutkan, salinannya tak ketemu",
        ],
        solutions: [
          "Semua per anggota keluarga: izin, paspor, surat, asuransi",
          "Pengingat perpanjangan datang lebih awal",
          "Pindaian selalu bersama Anda — offline, di negara mana pun",
          "Paket untuk kantor imigrasi — sekali klik",
        ],
        docs: ["KITAS / izin tinggal", "Paspor", "Surat sponsor", "NPWP / nomor pajak", "Asuransi", "Kontrak sewa"],
      },
      uz: {
        navLabel: "Yashash ruxsatnomasi",
        title: "Yashash ruxsatnomasi: hujjatlar va uzaytirish vahimasiz",
        subtitle:
          "Barcha yashash hujjatlari — har bir oila aʼzosi boʻyicha, uzaytirish eslatmalari va immigratsiya uchun tayyor paket bilan.",
        pains: [
          "Ruxsatnomani uzaytirish — turli joylardagi bir uyum maʼlumotnoma",
          "Oilada sanalar har xil — birovnikini oʻtkazib yuborish oson",
          "Hujjatlar turli tillarda, baʼzilari faqat qogʻozda",
          "Asl nusxani yoʻqotish qoʻrqinchli, nusxalari esa topilmaydi",
        ],
        solutions: [
          "Har bir oila aʼzosi boʻyicha hammasi: ruxsatnoma, pasport, xatlar, sugʻurta",
          "Uzaytirish eslatmalari oldindan keladi",
          "Skanlar doim siz bilan — oflayn, istalgan davlatda",
          "Immigratsiya xizmati uchun paket — bir bosishda",
        ],
        docs: ["Yashash ruxsatnomasi", "Pasport", "Homiy xatlari", "Soliq raqamlari", "Sugʻurta", "Ijara shartnomasi"],
      },
    },
  },
  "recruitment-agencies": {
    emoji: "🧑‍💼",
    ctaHref: "/employer/vacancies/new",
    locales: {
      ru: {
        navLabel: "Агентствам",
        title: "Собирайте документы кандидатов пачками — по одной ссылке",
        subtitle:
          "Для рекрутинговых и стаффинговых агентств: один чек-лист → ссылка каждому кандидату → полные пакеты, статус «чего не хватает» и напоминания о сроках, всё в одном дашборде.",
        pains: [
          "Десятки кандидатов присылают документы кусками в WhatsApp",
          "Непонятно, у кого чего не хватает и что просрочено",
          "Документы теряются между чатами, почтой и папками",
          "На сбор пакета уходит больше времени, чем на сам подбор",
        ],
        solutions: [
          "Чек-лист-ссылка: кандидат загружает без регистрации, вы получаете полный пакет",
          "Статус по каждому кандидату: «полный / не хватает» — сразу видно, кого догнать",
          "Напоминания о сроках (SKCK, KITAS, сертификаты) — ничего не просрочено",
          "Все пакеты в одном дашборде: шортлист, отказы, экспорт без привязки",
        ],
        docs: ["CV кандидата", "KTP / ID", "Сертификаты", "SKCK", "KITAS", "Медсправка"],
        ctaLabel: "Создать первый чек-лист",
        caseStudy: { role: "Типичный сценарий", quote: "При массовом найме в F&B рекрутинговое агентство раньше собирало документы с 20+ кандидатов вручную по WhatsApp. С чек-лист-ссылкой команда сразу видит, кто укомплектован." },
      },
      en: {
        navLabel: "Agencies",
        title: "Collect candidate documents in batches — from one link",
        subtitle:
          "For recruiting and staffing agencies: one checklist → a link to every candidate → complete packages, a “what's missing” status, and deadline reminders, all in one dashboard.",
        pains: [
          "Dozens of candidates send documents in pieces over WhatsApp",
          "No clarity on who is missing what, or what has expired",
          "Documents get lost between chats, email and folders",
          "Assembling a package takes longer than the sourcing itself",
        ],
        solutions: [
          "A checklist link: candidates upload without an account, you get the full package",
          "Per-candidate status “complete / missing” — instantly see who to chase",
          "Deadline reminders (SKCK, KITAS, certificates) — nothing expires unnoticed",
          "Every package in one dashboard: shortlist, rejections, export with no lock-in",
        ],
        docs: ["Candidate CV", "KTP / ID", "Certificates", "SKCK", "KITAS", "Health certificate"],
        ctaLabel: "Create your first checklist",
        caseStudy: { role: "Typical scenario", quote: "During high-volume F&B hiring, a recruiting agency used to collect documents from 20+ candidates manually over WhatsApp. With a checklist link, the team sees who is complete within minutes." },
      },
      id: {
        navLabel: "Agensi",
        title: "Kumpulkan dokumen kandidat sekaligus — dari satu tautan",
        subtitle:
          "Untuk agensi rekrutmen dan staffing: satu ceklis → tautan ke setiap kandidat → paket lengkap, status “apa yang kurang”, dan pengingat tenggat, semua di satu dasbor.",
        pains: [
          "Puluhan kandidat mengirim dokumen sepotong-sepotong lewat WhatsApp",
          "Tidak jelas siapa yang kurang apa, atau apa yang sudah kedaluwarsa",
          "Dokumen tercecer di antara chat, email, dan folder",
          "Menyusun paket lebih lama daripada mencari kandidatnya",
        ],
        solutions: [
          "Tautan ceklis: kandidat mengunggah tanpa akun, Anda menerima paket lengkap",
          "Status per kandidat “lengkap / kurang” — langsung terlihat siapa yang perlu ditagih",
          "Pengingat tenggat (SKCK, KITAS, sertifikat) — tidak ada yang kedaluwarsa diam-diam",
          "Semua paket di satu dasbor: shortlist, penolakan, ekspor tanpa terkunci",
        ],
        docs: ["CV kandidat", "KTP / ID", "Sertifikat", "SKCK", "KITAS", "Surat sehat"],
        ctaLabel: "Buat checklist pertama",
        caseStudy: { role: "Skenario umum", quote: "Saat rekrutmen F&B dalam jumlah besar, agensi rekrutmen biasanya mengumpulkan dokumen dari 20+ kandidat secara manual lewat WhatsApp. Dengan tautan ceklis, tim langsung tahu siapa yang lengkap." },
      },
      uz: {
        navLabel: "Agentliklarga",
        title: "Nomzod hujjatlarini bitta havola orqali to‘plang",
        subtitle:
          "Rekruting va staffing agentliklari uchun: bitta ro‘yxat → har bir nomzodga havola → to‘liq paketlar, “nima yetishmayapti” statusi va muddat eslatmalari, hammasi bitta dashboardda.",
        pains: [
          "O‘nlab nomzod hujjatlarni WhatsAppda bo‘lak-bo‘lak yuboradi",
          "Kimda nima yetishmayotgani yoki nima muddati o‘tgani noaniq",
          "Hujjatlar chat, email va papkalar orasida yo‘qoladi",
          "Paketni yig‘ish nomzod izlashdan ko‘ra ko‘proq vaqt oladi",
        ],
        solutions: [
          "Ro‘yxat-havola: nomzod hisobsiz yuklaydi, siz to‘liq paketni olasiz",
          "Har bir nomzod bo‘yicha status “to‘liq / kam” — kimni qo‘shishni darrov ko‘rasiz",
          "Muddat eslatmalari (SKCK, KITAS, sertifikatlar) — hech narsa bilinmay o‘tmaydi",
          "Barcha paketlar bitta dashboardda: shortlist, rad etish, bog‘lanishsiz eksport",
        ],
        docs: ["Nomzod CV", "KTP / ID", "Sertifikatlar", "SKCK", "KITAS", "Tibbiy ma’lumotnoma"],
        ctaLabel: "Birinchi ro‘yxatni yaratish",
        caseStudy: { role: "Odatiy holat", quote: "F&B sohasida ommaviy yollashda rekruting agentligi 20+ nomzoddan hujjatlarni WhatsAppda qo‘lda yig‘ardi. Ro‘yxat-havola bilan jamoa kim to‘liq ekanini bir zumda ko‘radi." },
      },
    },
  },
  hospitality: {
    emoji: "🏝️",
    ctaHref: "/employer/vacancies/new",
    locales: {
      ru: {
        navLabel: "Hospitality",
        title: "Наём персонала вилл, кафе и отелей — документы без хаоса",
        subtitle:
          "Для владельцев вилл, F&B и отелей на Бали: соберите документы линейного персонала по одной ссылке и держите сроки под контролем.",
        pains: [
          "Персонал меняется часто, документы каждый раз собираются заново",
          "SKCK, справки и сертификаты присылают вразнобой",
          "Легко упустить срок медсправки или разрешения",
          "Нет единого места, где видно, кто уже укомплектован",
        ],
        solutions: [
          "Готовые шаблоны паков: персонал виллы, F&B, водитель, ресепшн",
          "Ссылка кандидату — загрузка без регистрации и приложения",
          "Статус «полный / не хватает» по каждому человеку",
          "Напоминания о сроках справок и сертификатов",
        ],
        docs: ["CV", "KTP / ID", "SKCK", "Медсправка", "Сертификаты", "Референсы"],
        ctaLabel: "Создать первый чек-лист",
        caseStudy: { role: "Типичный сценарий", quote: "Управляющая компания вилл на Бали раньше собирала документы заново при каждой смене персонала. С шаблоном пака и напоминаниями о сроках процесс стал заметно быстрее." },
      },
      en: {
        navLabel: "Hospitality",
        title: "Hire villa, F&B and hotel staff — without document chaos",
        subtitle:
          "For villa owners, F&B and hotels in Bali: collect line-staff documents from one link and keep expiry dates under control.",
        pains: [
          "Staff turns over often; documents are re-collected every time",
          "SKCK, health certificates and certificates arrive scattered",
          "Easy to miss a health-certificate or permit expiry",
          "No single place showing who is already complete",
        ],
        solutions: [
          "Ready pack templates: villa staff, F&B, driver, receptionist",
          "A link to the candidate — upload with no account, no app",
          "“Complete / missing” status for each person",
          "Reminders for certificate and permit expiry dates",
        ],
        docs: ["CV", "KTP / ID", "SKCK", "Health certificate", "Certificates", "References"],
        ctaLabel: "Create your first checklist",
        caseStudy: { role: "Typical scenario", quote: "A villa management team in Bali used to re-collect documents every time staff turned over. With a pack template and expiry reminders, the process got noticeably faster." },
      },
      id: {
        navLabel: "Hospitality",
        title: "Rekrut staf vila, F&B, dan hotel — tanpa dokumen berantakan",
        subtitle:
          "Untuk pemilik vila, F&B, dan hotel di Bali: kumpulkan dokumen staf dari satu tautan dan pantau tenggatnya.",
        pains: [
          "Staf sering berganti; dokumen dikumpulkan ulang setiap kali",
          "SKCK, surat sehat, dan sertifikat datang tidak beraturan",
          "Mudah melewatkan masa berlaku surat sehat atau izin",
          "Tidak ada satu tempat yang menunjukkan siapa yang sudah lengkap",
        ],
        solutions: [
          "Template paket siap pakai: staf vila, F&B, sopir, resepsionis",
          "Tautan ke kandidat — unggah tanpa akun, tanpa aplikasi",
          "Status “lengkap / kurang” untuk tiap orang",
          "Pengingat masa berlaku sertifikat dan izin",
        ],
        docs: ["CV", "KTP / ID", "SKCK", "Surat sehat", "Sertifikat", "Referensi"],
        ctaLabel: "Buat checklist pertama",
        caseStudy: { role: "Skenario umum", quote: "Manajemen vila di Bali dulu mengumpulkan ulang dokumen setiap kali staf berganti. Dengan template paket dan pengingat masa berlaku, prosesnya jadi jauh lebih cepat." },
      },
      uz: {
        navLabel: "Hospitality",
        title: "Villa va mehmonxona xodimlarini yollash: hujjatlar tartibda",
        subtitle:
          "Balidagi villa egalari, F&B va mehmonxonalar uchun: xodimlar hujjatlarini bitta havola orqali yig‘ing va muddatlarni nazoratda tuting.",
        pains: [
          "Xodimlar tez almashadi; hujjatlar har safar qaytadan yig‘iladi",
          "SKCK, tibbiy ma’lumotnoma va sertifikatlar tartibsiz keladi",
          "Tibbiy ma’lumotnoma yoki ruxsat muddatini o‘tkazib yuborish oson",
          "Kim to‘liq ekanini ko‘rsatadigan yagona joy yo‘q",
        ],
        solutions: [
          "Tayyor paket shablonlari: villa xodimi, F&B, haydovchi, resepsionist",
          "Nomzodga havola — hisobsiz, ilovasiz yuklash",
          "Har bir odam bo‘yicha “to‘liq / kam” statusi",
          "Sertifikat va ruxsat muddatlari bo‘yicha eslatmalar",
        ],
        docs: ["CV", "KTP / ID", "SKCK", "Tibbiy ma’lumotnoma", "Sertifikatlar", "Referenslar"],
        ctaLabel: "Birinchi ro‘yxatni yaratish",
        caseStudy: { role: "Odatiy holat", quote: "Balidagi villa boshqaruvi tez-tez almashadigan xodimlar uchun hujjatlarni har safar qaytadan yig‘ishga majbur bo‘lardi. Paket shabloni va muddat eslatmalari bilan bu jarayon ancha tezlashdi." },
      },
    },
  },
  "visa-agents": {
    emoji: "🛂",
    ctaHref: "/employer/vacancies/new",
    locales: {
      ru: {
        navLabel: "Визовым агентам",
        title: "Собирайте документы клиентов для визы — по одной ссылке",
        subtitle:
          "Для визовых и релокационных агентов: отправьте клиенту чек-лист документов, получите полный пакет и отслеживайте сроки KITAS и паспортов.",
        pains: [
          "Клиенты присылают паспорт и справки частями в мессенджерах",
          "Сложно отследить, у кого какой пакет и что просрочено",
          "Сроки KITAS и паспортов легко упустить",
        ],
        solutions: [
          "Чек-лист-ссылка клиенту — загрузка без регистрации",
          "Статус пакета «полный / не хватает» по каждому клиенту",
          "Напоминания о сроках KITAS, паспорта, страховки",
        ],
        docs: ["Паспорт", "Фото", "KITAS", "Спонсорские документы", "Страховка"],
        ctaLabel: "Создать первый чек-лист",
        caseStudy: { role: "Типичный сценарий", quote: "Визовое и релокационное агентство раньше получало паспорт и справки от клиентов частями в разных чатах. С чек-лист-ссылкой команда сразу получает полный пакет и отслеживает сроки KITAS." },
      },
      en: {
        navLabel: "Visa agents",
        title: "Collect client documents for visas — from one link",
        subtitle:
          "For visa and relocation agents: send the client a document checklist, get the full package, and track KITAS and passport expiry.",
        pains: [
          "Clients send passport and certificates in pieces over chat",
          "Hard to track who has which package and what has expired",
          "KITAS and passport expiry dates are easy to miss",
        ],
        solutions: [
          "A checklist link to the client — upload with no account",
          "“Complete / missing” package status per client",
          "Reminders for KITAS, passport and insurance expiry",
        ],
        docs: ["Passport", "Photo", "KITAS", "Sponsor documents", "Insurance"],
        ctaLabel: "Create your first checklist",
        caseStudy: { role: "Typical scenario", quote: "A visa and relocation agency used to receive passports and certificates from clients scattered across chats. With a checklist link, the team gets the full package right away and tracks KITAS deadlines." },
      },
      id: {
        navLabel: "Agen visa",
        title: "Kumpulkan dokumen klien untuk visa — dari satu tautan",
        subtitle:
          "Untuk agen visa dan relokasi: kirim ceklis dokumen ke klien, terima paket lengkap, dan pantau masa berlaku KITAS serta paspor.",
        pains: [
          "Klien mengirim paspor dan surat sepotong-sepotong lewat chat",
          "Sulit melacak siapa punya paket apa dan apa yang kedaluwarsa",
          "Masa berlaku KITAS dan paspor mudah terlewat",
        ],
        solutions: [
          "Tautan ceklis ke klien — unggah tanpa akun",
          "Status paket “lengkap / kurang” per klien",
          "Pengingat masa berlaku KITAS, paspor, dan asuransi",
        ],
        docs: ["Paspor", "Pas foto", "KITAS", "Dokumen penjamin", "Asuransi"],
        ctaLabel: "Buat checklist pertama",
        caseStudy: { role: "Skenario umum", quote: "Agen visa dan relokasi biasanya menerima paspor dan surat dari klien secara terpisah di berbagai chat. Dengan tautan ceklis, tim langsung menerima paket lengkap dan memantau tenggat KITAS." },
      },
      uz: {
        navLabel: "Viza agentlari",
        title: "Mijoz hujjatlarini viza uchun bitta havola orqali yig‘ing",
        subtitle:
          "Viza va ko‘chirish agentlari uchun: mijozga hujjatlar ro‘yxatini yuboring, to‘liq paketni oling va KITAS hamda pasport muddatlarini kuzating.",
        pains: [
          "Mijozlar pasport va ma’lumotnomalarni chatda bo‘lak-bo‘lak yuboradi",
          "Kimda qaysi paket borligini va nima muddati o‘tganini kuzatish qiyin",
          "KITAS va pasport muddatlarini o‘tkazib yuborish oson",
        ],
        solutions: [
          "Mijozga ro‘yxat-havola — hisobsiz yuklash",
          "Har bir mijoz bo‘yicha “to‘liq / kam” paket statusi",
          "KITAS, pasport va sug‘urta muddatlari bo‘yicha eslatmalar",
        ],
        docs: ["Pasport", "Pas foto", "KITAS", "Homiy hujjatlari", "Sug‘urta"],
        ctaLabel: "Birinchi ro‘yxatni yaratish",
        caseStudy: { role: "Doimiy holat", quote: "Viza va ko‘chirish agentligi mijozlardan pasport va ma’lumotnomalarni turli chatlarda bo‘lak-bo‘lak olardi. Ro‘yxat-havola bilan jamoa to‘liq paketni darhol oladi va KITAS muddatlarini kuzatib boradi." },
      },
    },
  },
};

export function getSegment(key: string): Segment | null {
  return (DATA as Record<string, Segment>)[key] ?? null;
}

/** Короткие ссылки на сегменты для внутренней перелинковки на главной. */
export function segmentLinks(locale: Locale) {
  return SEGMENT_KEYS.map((key) => ({
    key,
    emoji: DATA[key].emoji,
    label: DATA[key].locales[locale].navLabel,
  }));
}

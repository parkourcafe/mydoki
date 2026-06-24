import type { Locale } from "./i18n";

export type SegmentKey = "medical" | "travel" | "families" | "expats";

export const SEGMENT_KEYS: SegmentKey[] = ["medical", "travel", "families", "expats"];

export type SegmentContent = {
  navLabel: string;
  title: string;
  subtitle: string;
  pains: string[];
  solutions: string[];
  docs: string[];
};

type Segment = { emoji: string; locales: Record<Locale, SegmentContent> };

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
      ru: {
        navLabel: "Эмигранты",
        title: "Все документы для жизни за границей — под рукой",
        subtitle:
          "ВНЖ, РВП, визы и миграционные документы в одном месте. Напоминания о сроках, чтобы не пропустить продление.",
        pains: [
          "Просроченный ВНЖ, РВП или виза из-за пропущенного срока",
          "Документы на разных языках разбросаны и теряются",
          "Срочно нужен скан, а оригинал далеко",
          "Сложно держать под рукой документы на всю семью в другой стране",
        ],
        solutions: [
          "ВНЖ, РВП, визы и миграционные документы — в одном месте",
          "Напоминания о сроках продления заранее",
          "Доступ к сканам с любого устройства, в любой стране",
          "Общий доступ для семьи и обмен с юристом по защищённой ссылке",
        ],
        docs: [
          "ВНЖ / РВП",
          "Виза",
          "Миграционная карта",
          "Загранпаспорт",
          "Уведомления и регистрации",
          "Переводы и апостили",
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

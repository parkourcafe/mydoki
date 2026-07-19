import "server-only";
import type { Metadata } from "next";
import type { Locale } from "./i18n";
import { getLocale } from "./i18n";
import { altLangs } from "./seo";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://doki.help";

/**
 * Чеклист-страницы (/checklists/*). Контент-лид-магниты: практичный список
 * документов под ситуацию + привязка к продукту (сохранить и поставить
 * напоминания). 4 языка. Правила правдивости — как в lib/landings.ts:
 * только подтверждённые факты; правила стран — «проверьте требования»;
 * неподтверждённое — TODO. Schema: Article + BreadcrumbList + FAQPage + ItemList.
 */

export type ChecklistGroup = { h2: string; items: string[] };
export type ChecklistFaq = { q: string; a: string };

export type ChecklistContent = {
  navLabel: string;
  title: string; // <= 60
  metaDescription: string; // <= 155
  h1: string;
  intro: string;
  ctaPrimary: string;
  groups: ChecklistGroup[];
  faqHeading: string;
  faq: ChecklistFaq[];
};

export type RelatedLink = { href: string; label: string };

export type Checklist = {
  slug: string;
  emoji: string;
  locales: Record<Locale, ChecklistContent>;
  related: Record<Locale, RelatedLink[]>;
};

const DATA: Record<string, Checklist> = {
  "travel-documents-checklist": {
    slug: "travel-documents-checklist",
    emoji: "🧳",
    locales: {
      en: {
        navLabel: "Travel checklist",
        title: "Travel Documents Checklist (Family) | Doki.help",
        metaDescription:
          "A practical travel documents checklist for families: passports, visas, insurance, bookings and consent forms — plus where to keep them.",
        h1: "Travel documents checklist for the whole family",
        intro:
          "A practical checklist of the documents to sort before a trip — passports, visas, insurance, bookings and consent forms. Save them in your vault, keep them offline for the journey, and set reminders so nothing expires mid-trip. It's a starting point, not legal advice — always check your destination's entry requirements.",
        ctaPrimary: "Save these documents in your vault",
        groups: [
          {
            h2: "Before you book",
            items: [
              "Check every traveller's passport and how long it stays valid past your return date",
              "Note each passport number, issue date and expiry date",
              "Confirm whether your destination requires a visa, and which type",
              "Check passport and visa validity rules for your destination — requirements vary by country, so verify the official ones",
            ],
          },
          {
            h2: "Before you fly",
            items: [
              "Travel insurance policy and emergency contact number",
              "Flight, train or ferry tickets and boarding details",
              "Hotel or accommodation bookings and confirmations",
              "Car rental, transfers and any tour reservations",
              "Child travel consent form, if one is needed — check your destination's and airline's requirements",
              "Driving licence or international driving permit, if you'll drive",
            ],
          },
          {
            h2: "For families with children",
            items: [
              "A passport (and visa, if required) for every child",
              "Birth certificate, in case proof of relationship is asked for",
              "Child travel consent form when a child travels with one parent or another adult — requirements vary, so check them",
              "Vaccination records, if your destination requires them",
              "A profile for each child so their documents stay together",
            ],
          },
          {
            h2: "Keep it with you offline and on time",
            items: [
              "Save the documents you need to your phone in advance so they open without a connection",
              "Set a “valid until” date on each passport and visa to get an email reminder before it expires",
              "Share a copy with a travel agent or relative through a link that expires and can be revoked",
            ],
          },
        ],
        faqHeading: "FAQ",
        faq: [
          {
            q: "What documents do I need for international travel?",
            a: "Usually a valid passport, any required visa, travel insurance, and your bookings — plus consent forms for children in some cases. Requirements vary by country, so always check your destination's official entry rules.",
          },
          {
            q: "How long should my passport be valid?",
            a: "Many countries ask for several months of validity beyond your travel dates, but the exact rule depends on your destination. Check the official entry requirements and set a renewal reminder early.",
          },
          {
            q: "What documents do children need to travel?",
            a: "Typically their own passport and any required visa, and sometimes a travel consent form or birth certificate. See our child documents checklist, and check your destination's requirements.",
          },
          {
            q: "Can I access the checklist offline?",
            a: "Yes. Save the documents you need to your phone in advance and open them without internet — handy at the airport or in roaming. Doki.help works offline as a PWA once documents are saved ahead of time.",
          },
          {
            q: "How do I avoid documents expiring during a trip?",
            a: "Set a “valid until” date on each passport, visa and insurance policy, and a reminder arrives by email before it expires.",
          },
        ],
      },
      ru: {
        navLabel: "Чеклист для поездки",
        title: "Чеклист документов в поездку (семья) | Doki.help",
        metaDescription:
          "Практичный чеклист документов для семьи в поездку: паспорта, визы, страховки, брони и согласия — и где их хранить.",
        h1: "Чеклист документов в поездку для всей семьи",
        intro:
          "Практичный список документов, которые стоит собрать перед поездкой, — паспорта, визы, страховки, брони и согласия. Сохраните их в сейфе, держите офлайн в дороге и поставьте напоминания, чтобы ничего не истекло посреди поездки. Это отправная точка, а не юридический совет — всегда проверяйте правила въезда страны назначения.",
        ctaPrimary: "Сохранить эти документы в сейфе",
        groups: [
          {
            h2: "Прежде чем бронировать",
            items: [
              "Проверьте паспорт каждого путешественника и срок его действия после даты возвращения",
              "Запишите номер, дату выдачи и дату окончания каждого паспорта",
              "Уточните, нужна ли виза в страну назначения и какого типа",
              "Проверьте правила по сроку паспорта и визы для страны назначения — требования различаются, сверяйтесь с официальными",
            ],
          },
          {
            h2: "Перед вылетом",
            items: [
              "Полис страховки и номер экстренной связи",
              "Билеты на самолёт, поезд или паром и данные посадки",
              "Брони отелей или жилья и подтверждения",
              "Аренда авто, трансферы и брони экскурсий",
              "Согласие на выезд ребёнка, если оно нужно, — проверьте требования страны назначения и авиакомпании",
              "Водительские права или международное удостоверение, если будете за рулём",
            ],
          },
          {
            h2: "Для семей с детьми",
            items: [
              "Паспорт (и виза, если нужна) на каждого ребёнка",
              "Свидетельство о рождении — на случай, если попросят подтвердить родство",
              "Согласие на выезд, когда ребёнок едет с одним родителем или другим взрослым, — требования различаются, проверьте их",
              "Прививочные сертификаты, если их требует страна назначения",
              "Профиль на каждого ребёнка, чтобы его документы были вместе",
            ],
          },
          {
            h2: "Держите под рукой офлайн и в срок",
            items: [
              "Сохраните нужные документы на телефон заранее, чтобы они открывались без связи",
              "Укажите дату «действует до» для каждого паспорта и визы, чтобы получить напоминание на email заранее",
              "Поделитесь копией с агентом или родственником по ссылке, которая истекает и отзывается",
            ],
          },
        ],
        faqHeading: "Частые вопросы",
        faq: [
          {
            q: "Какие документы нужны для зарубежной поездки?",
            a: "Обычно действующий паспорт, нужная виза, страховка и ваши брони — а в некоторых случаях и согласия для детей. Требования различаются по странам, поэтому всегда проверяйте официальные правила въезда страны назначения.",
          },
          {
            q: "Сколько должен действовать паспорт?",
            a: "Многие страны просят запас в несколько месяцев после дат поездки, но точное правило зависит от страны назначения. Проверьте официальные требования и поставьте напоминание о продлении заранее.",
          },
          {
            q: "Какие документы нужны детям для поездки?",
            a: "Обычно собственный паспорт и нужная виза, иногда согласие на выезд или свидетельство о рождении. Смотрите наш чеклист документов ребёнка и проверяйте требования страны назначения.",
          },
          {
            q: "Можно открыть чеклист офлайн?",
            a: "Да. Сохраните нужные документы на телефон заранее и открывайте их без интернета — удобно в аэропорту или в роуминге. Doki.help работает офлайн как PWA, если документы сохранены заблаговременно.",
          },
          {
            q: "Как не дать документам истечь во время поездки?",
            a: "Укажите дату «действует до» для каждого паспорта, визы и страховки — напоминание придёт на email заранее.",
          },
        ],
      },
      id: {
        navLabel: "Ceklis perjalanan",
        title: "Ceklis Dokumen Perjalanan (Keluarga) | Doki.help",
        metaDescription:
          "Ceklis dokumen perjalanan praktis untuk keluarga: paspor, visa, asuransi, pemesanan, dan surat persetujuan — plus tempat menyimpannya.",
        h1: "Ceklis dokumen perjalanan untuk seluruh keluarga",
        intro:
          "Daftar praktis dokumen yang perlu disiapkan sebelum bepergian — paspor, visa, asuransi, pemesanan, dan surat persetujuan. Simpan di brankas Anda, jaga tetap offline selama perjalanan, dan pasang pengingat agar tidak ada yang kedaluwarsa di tengah perjalanan. Ini titik awal, bukan nasihat hukum — selalu periksa persyaratan masuk negara tujuan.",
        ctaPrimary: "Simpan dokumen ini di brankas Anda",
        groups: [
          {
            h2: "Sebelum memesan",
            items: [
              "Periksa paspor tiap pelancong dan berapa lama masa berlakunya setelah tanggal pulang",
              "Catat nomor, tanggal terbit, dan tanggal kedaluwarsa tiap paspor",
              "Pastikan apakah negara tujuan mensyaratkan visa, dan jenis apa",
              "Periksa aturan masa berlaku paspor dan visa untuk negara tujuan — persyaratan beda tiap negara, jadi verifikasi yang resmi",
            ],
          },
          {
            h2: "Sebelum terbang",
            items: [
              "Polis asuransi perjalanan dan nomor kontak darurat",
              "Tiket pesawat, kereta, atau feri dan detail boarding",
              "Pemesanan hotel atau akomodasi dan konfirmasinya",
              "Sewa mobil, transfer, dan reservasi tur",
              "Surat persetujuan perjalanan anak, jika diperlukan — periksa persyaratan negara tujuan dan maskapai",
              "SIM atau SIM internasional, jika Anda akan menyetir",
            ],
          },
          {
            h2: "Untuk keluarga dengan anak",
            items: [
              "Paspor (dan visa, jika perlu) untuk tiap anak",
              "Akta kelahiran, jika diminta bukti hubungan keluarga",
              "Surat persetujuan perjalanan saat anak bepergian dengan satu orang tua atau orang dewasa lain — persyaratan beda-beda, jadi periksa",
              "Catatan vaksinasi, jika negara tujuan mensyaratkannya",
              "Profil untuk tiap anak agar dokumennya tetap menyatu",
            ],
          },
          {
            h2: "Bawa offline dan tepat waktu",
            items: [
              "Simpan dokumen yang Anda butuhkan ke ponsel lebih dulu agar bisa dibuka tanpa koneksi",
              "Pasang tanggal “berlaku sampai” pada tiap paspor dan visa untuk dapat pengingat email sebelum kedaluwarsa",
              "Bagikan salinan ke agen atau kerabat lewat tautan yang kedaluwarsa dan bisa dicabut",
            ],
          },
        ],
        faqHeading: "Pertanyaan umum",
        faq: [
          {
            q: "Dokumen apa yang saya butuhkan untuk perjalanan internasional?",
            a: "Biasanya paspor yang berlaku, visa bila perlu, asuransi perjalanan, dan pemesanan Anda — plus surat persetujuan untuk anak dalam beberapa kasus. Persyaratan beda tiap negara, jadi selalu periksa aturan masuk resmi negara tujuan.",
          },
          {
            q: "Berapa lama paspor harus berlaku?",
            a: "Banyak negara minta sisa masa berlaku beberapa bulan melebihi tanggal perjalanan, tetapi aturan pastinya tergantung negara tujuan. Periksa persyaratan masuk resmi dan pasang pengingat perpanjangan lebih awal.",
          },
          {
            q: "Dokumen apa yang dibutuhkan anak untuk bepergian?",
            a: "Umumnya paspor sendiri dan visa bila perlu, kadang surat persetujuan perjalanan atau akta kelahiran. Lihat ceklis dokumen anak kami, dan periksa persyaratan negara tujuan.",
          },
          {
            q: "Bisakah mengakses ceklis offline?",
            a: "Bisa. Simpan dokumen yang Anda butuhkan ke ponsel lebih dulu dan buka tanpa internet — berguna di bandara atau saat roaming. Doki.help bekerja offline sebagai PWA setelah dokumen disimpan lebih awal.",
          },
          {
            q: "Bagaimana mencegah dokumen kedaluwarsa saat perjalanan?",
            a: "Pasang tanggal “berlaku sampai” pada tiap paspor, visa, dan polis asuransi, dan pengingat tiba lewat email sebelum kedaluwarsa.",
          },
        ],
      },
      uz: {
        navLabel: "Sayohat roʻyxati",
        title: "Sayohat hujjatlari roʻyxati (oila) | Doki.help",
        metaDescription:
          "Oila uchun amaliy sayohat hujjatlari roʻyxati: pasport, viza, sugʻurta, bronlar va roziliklar — hamda ularni qayerda saqlash.",
        h1: "Butun oila uchun sayohat hujjatlari roʻyxati",
        intro:
          "Sayohatdan oldin saralash kerak boʻlgan hujjatlarning amaliy roʻyxati — pasportlar, vizalar, sugʻurta, bronlar va roziliklar. Ularni seyfingizda saqlang, yoʻlda oflayn ushlab turing va eslatmalar qoʻying, toki hech narsa sayohat oʻrtasida tugab qolmasin. Bu boshlangʻich nuqta, yuridik maslahat emas — boriladigan davlat kirish talablarini doim tekshiring.",
        ctaPrimary: "Bu hujjatlarni seyfingizda saqlang",
        groups: [
          {
            h2: "Bron qilishdan oldin",
            items: [
              "Har bir sayohatchining pasportini va u qaytish sanasidan keyin qancha amal qilishini tekshiring",
              "Har bir pasport raqami, berilgan va tugash sanasini yozib qoʻying",
              "Boriladigan davlat viza talab qiladimi va qaysi turini — aniqlang",
              "Boriladigan davlat uchun pasport va viza amal qilish qoidalarini tekshiring — talablar har xil, rasmiylarini tasdiqlang",
            ],
          },
          {
            h2: "Uchishdan oldin",
            items: [
              "Sayohat sugʻurtasi polisi va favqulodda aloqa raqami",
              "Samolyot, poyezd yoki parom chiptalari va chiqish maʼlumotlari",
              "Mehmonxona yoki turar joy bronlari va tasdiqlari",
              "Avto ijarasi, transferlar va sayohat bronlari",
              "Bola sayohatiga rozilik xati, agar kerak boʻlsa — boriladigan davlat va aviakompaniya talablarini tekshiring",
              "Haydovchilik guvohnomasi yoki xalqaro guvohnoma, agar haydasangiz",
            ],
          },
          {
            h2: "Bolali oilalar uchun",
            items: [
              "Har bir bola uchun pasport (va kerak boʻlsa viza)",
              "Tugʻilganlik haqidagi guvohnoma — qarindoshlik tasdigʻi soʻralsa",
              "Bola bitta ota-ona yoki boshqa kattalar bilan sayohat qilganda rozilik xati — talablar har xil, tekshiring",
              "Emlash hujjatlari, agar boriladigan davlat talab qilsa",
              "Har bir bola uchun profil, hujjatlari birga tursin",
            ],
          },
          {
            h2: "Oflayn va oʻz vaqtida yoningizda saqlang",
            items: [
              "Kerakli hujjatlarni telefoningizga oldindan saqlang, ular aloqasiz ochilsin",
              "Har bir pasport va vizaga “amal qiladi” sanasini qoʻying, muddat tugashidan oldin email eslatma oling",
              "Nusxani agent yoki qarindoshga muddati tugaydigan va bekor qilinadigan havola orqali ulashing",
            ],
          },
        ],
        faqHeading: "Tez-tez beriladigan savollar",
        faq: [
          {
            q: "Xalqaro sayohat uchun qanday hujjatlar kerak?",
            a: "Odatda amaldagi pasport, kerak boʻlsa viza, sayohat sugʻurtasi va bronlaringiz — baʼzi hollarda bolalar uchun rozilik xatlari ham. Talablar har xil, shuning uchun boriladigan davlatning rasmiy kirish qoidalarini doim tekshiring.",
          },
          {
            q: "Pasport qancha amal qilishi kerak?",
            a: "Koʻplab davlatlar sayohat sanasidan keyin bir necha oy zaxira muddat soʻraydi, lekin aniq qoida boriladigan davlatga bogʻliq. Rasmiy kirish talablarini tekshiring va yangilash eslatmasini erta qoʻying.",
          },
          {
            q: "Bolalarga sayohat uchun qanday hujjatlar kerak?",
            a: "Odatda oʻz pasporti va kerak boʻlsa viza, baʼzan sayohat rozilik xati yoki tugʻilganlik guvohnomasi. Bola hujjatlari roʻyxatimizni koʻring va boriladigan davlat talablarini tekshiring.",
          },
          {
            q: "Roʻyxatni oflayn ochsa boʻladimi?",
            a: "Ha. Kerakli hujjatlarni telefoningizga oldindan saqlang va internetsiz oching — aeroportda yoki roumingda qulay. Doki.help hujjatlar oldindan saqlangach PWA sifatida oflayn ishlaydi.",
          },
          {
            q: "Hujjatlar sayohat paytida tugab qolmasligi uchun nima qilish kerak?",
            a: "Har bir pasport, viza va sugʻurta polisiga “amal qiladi” sanasini qoʻying — eslatma muddat tugashidan oldin email orqali keladi.",
          },
        ],
      },
    },
    related: {
      en: [
        { href: "/travel-documents", label: "Travel documents organizer" },
        { href: "/passport-expiry-reminder", label: "Passport expiry reminder" },
      ],
      ru: [
        { href: "/travel-documents", label: "Документы для поездок" },
        { href: "/passport-expiry-reminder", label: "Напоминание о сроке паспорта" },
      ],
      id: [
        { href: "/travel-documents", label: "Pengelola dokumen perjalanan" },
        { href: "/passport-expiry-reminder", label: "Pengingat masa berlaku paspor" },
      ],
      uz: [
        { href: "/travel-documents", label: "Sayohat hujjatlari tartibi" },
        { href: "/passport-expiry-reminder", label: "Pasport muddati eslatmasi" },
      ],
    },
  },
  "child-documents-checklist": {
    slug: "child-documents-checklist",
    emoji: "🧒",
    locales: {
      en: {
        navLabel: "Child checklist",
        title: "Child Documents Checklist for Parents",
        metaDescription:
          "A checklist of the documents to keep for each child: birth certificate, passport, medical, school — plus consent forms for travel.",
        h1: "Child documents checklist: what every parent should keep",
        intro:
          "The documents worth keeping for each child, in one place — birth certificate, passport, medical and vaccination records, school papers and travel consent. Create a profile per child, store the documents in your family vault, and set reminders before anything expires. School and travel rules vary, so always check your country's and school's requirements.",
        ctaPrimary: "Create a profile for each child",
        groups: [
          {
            h2: "Core documents for every child",
            items: [
              "Birth certificate (and any official translation you have)",
              "Passport or national ID, with its number and expiry date",
              "Visa or residence permit, if your family needs one",
              "Medical records: doctor reports, allergies and test results",
              "Vaccination records and immunisation certificates",
              "Health insurance policy or card",
            ],
          },
          {
            h2: "For school",
            items: [
              "Enrollment and registration documents",
              "Previous school reports, transcripts or certificates",
              "Proof of address, if the school asks for it",
              "Required vaccination or medical forms — requirements depend on the school and country, so check them",
            ],
          },
          {
            h2: "For travel",
            items: [
              "Each child's own passport and any required visa",
              "Child travel consent form when a child travels with one parent or another adult — requirements vary, so check your destination's rules",
              "Birth certificate, in case proof of relationship is requested",
              "Vaccination records, if the destination requires them",
            ],
          },
          {
            h2: "Keep it organized and current",
            items: [
              "Keep one profile per child so each child's documents stay together",
              "Set a “valid until” date on each passport and certificate to get an email reminder before it expires",
              "Save key documents to your phone in advance for offline access when you travel",
              "Share a document with a school or relative through a link that expires and can be revoked",
            ],
          },
        ],
        faqHeading: "FAQ",
        faq: [
          {
            q: "What documents should I keep for my child?",
            a: "At minimum a birth certificate, passport or ID, medical and vaccination records, health insurance and school papers. Keep them together in a profile for each child and add expiry dates where they apply.",
          },
          {
            q: "What do children need to travel internationally?",
            a: "Usually their own passport and any required visa, and sometimes a travel consent form or birth certificate. Rules vary, so check your destination's and airline's requirements before you go.",
          },
          {
            q: "What documents are needed for school enrollment?",
            a: "Often a birth certificate, proof of address, previous school records and vaccination forms — but it depends on the school and country. Check your school's exact requirements.",
          },
          {
            q: "Who can see my child's documents?",
            a: "Only the people in your family that you invite. Access is isolated at the database level (row-level security), so no one outside your family can see your child's documents.",
          },
          {
            q: "Can I get reminders before a child's passport expires?",
            a: "Yes. Set a “valid until” date on each child's passport and a reminder arrives by email before it expires.",
          },
        ],
      },
      ru: {
        navLabel: "Чеклист ребёнка",
        title: "Чеклист документов ребёнка для родителей",
        metaDescription:
          "Чеклист документов на каждого ребёнка: свидетельство о рождении, паспорт, медицина, школа — и согласия на выезд.",
        h1: "Чеклист документов ребёнка: что стоит хранить каждому родителю",
        intro:
          "Документы, которые стоит держать на каждого ребёнка в одном месте, — свидетельство о рождении, паспорт, медицинские и прививочные записи, школьные бумаги и согласие на выезд. Заведите профиль на каждого ребёнка, храните документы в семейном сейфе и ставьте напоминания, пока ничего не истекло. Правила школы и выезда различаются, поэтому всегда проверяйте требования вашей страны и школы.",
        ctaPrimary: "Создать профиль для каждого ребёнка",
        groups: [
          {
            h2: "Основные документы на каждого ребёнка",
            items: [
              "Свидетельство о рождении (и официальный перевод, если есть)",
              "Паспорт или удостоверение личности с номером и датой окончания",
              "Виза или ВНЖ, если они нужны вашей семье",
              "Медицинские записи: заключения врачей, аллергии и результаты анализов",
              "Прививочные записи и сертификаты о вакцинации",
              "Полис или карта медицинского страхования",
            ],
          },
          {
            h2: "Для школы",
            items: [
              "Документы о зачислении и регистрации",
              "Табели, выписки или сертификаты из прошлой школы",
              "Подтверждение адреса, если его просит школа",
              "Нужные прививочные или медицинские справки — требования зависят от школы и страны, проверьте их",
            ],
          },
          {
            h2: "Для поездки",
            items: [
              "Собственный паспорт ребёнка и нужная виза",
              "Согласие на выезд, когда ребёнок едет с одним родителем или другим взрослым, — требования различаются, проверьте правила страны назначения",
              "Свидетельство о рождении — на случай, если попросят подтвердить родство",
              "Прививочные записи, если их требует страна назначения",
            ],
          },
          {
            h2: "Держите в порядке и в актуальности",
            items: [
              "Ведите один профиль на каждого ребёнка, чтобы его документы были вместе",
              "Укажите дату «действует до» для каждого паспорта и сертификата, чтобы получить напоминание на email заранее",
              "Сохраните ключевые документы на телефон заранее для офлайн-доступа в поездке",
              "Поделитесь документом со школой или родственником по ссылке, которая истекает и отзывается",
            ],
          },
        ],
        faqHeading: "Частые вопросы",
        faq: [
          {
            q: "Какие документы хранить на ребёнка?",
            a: "Как минимум свидетельство о рождении, паспорт или удостоверение, медицинские и прививочные записи, медстраховку и школьные бумаги. Держите их вместе в профиле каждого ребёнка и добавляйте даты окончания, где они есть.",
          },
          {
            q: "Что нужно детям для зарубежной поездки?",
            a: "Обычно собственный паспорт и нужная виза, иногда согласие на выезд или свидетельство о рождении. Правила различаются, поэтому проверяйте требования страны назначения и авиакомпании перед поездкой.",
          },
          {
            q: "Какие документы нужны для зачисления в школу?",
            a: "Часто свидетельство о рождении, подтверждение адреса, записи из прошлой школы и прививочные справки — но это зависит от школы и страны. Уточните точные требования вашей школы.",
          },
          {
            q: "Кто видит документы моего ребёнка?",
            a: "Только те, кого вы пригласили в свою семью. Доступ изолирован на уровне базы (RLS), поэтому посторонние не видят документы вашего ребёнка.",
          },
          {
            q: "Будет ли напоминание до окончания паспорта ребёнка?",
            a: "Да. Укажите дату «действует до» для паспорта каждого ребёнка — напоминание придёт на email заранее.",
          },
        ],
      },
      id: {
        navLabel: "Ceklis anak",
        title: "Ceklis Dokumen Anak untuk Orang Tua",
        metaDescription:
          "Ceklis dokumen untuk disimpan bagi tiap anak: akta kelahiran, paspor, medis, sekolah — plus surat persetujuan untuk perjalanan.",
        h1: "Ceklis dokumen anak: yang perlu disimpan tiap orang tua",
        intro:
          "Dokumen yang layak disimpan untuk tiap anak, di satu tempat — akta kelahiran, paspor, catatan medis dan vaksinasi, berkas sekolah, dan persetujuan perjalanan. Buat profil per anak, simpan dokumen di brankas keluarga, dan pasang pengingat sebelum ada yang kedaluwarsa. Aturan sekolah dan perjalanan beda-beda, jadi selalu periksa persyaratan negara dan sekolah Anda.",
        ctaPrimary: "Buat profil untuk tiap anak",
        groups: [
          {
            h2: "Dokumen inti untuk tiap anak",
            items: [
              "Akta kelahiran (dan terjemahan resmi bila ada)",
              "Paspor atau identitas nasional, dengan nomor dan tanggal kedaluwarsanya",
              "Visa atau izin tinggal, jika keluarga Anda membutuhkannya",
              "Catatan medis: laporan dokter, alergi, dan hasil pemeriksaan",
              "Catatan vaksinasi dan sertifikat imunisasi",
              "Polis atau kartu asuransi kesehatan",
            ],
          },
          {
            h2: "Untuk sekolah",
            items: [
              "Dokumen pendaftaran dan registrasi",
              "Rapor, transkrip, atau sertifikat sekolah sebelumnya",
              "Bukti alamat, jika diminta sekolah",
              "Formulir vaksinasi atau medis yang diperlukan — persyaratan tergantung sekolah dan negara, jadi periksa",
            ],
          },
          {
            h2: "Untuk perjalanan",
            items: [
              "Paspor sendiri tiap anak dan visa bila diperlukan",
              "Surat persetujuan perjalanan saat anak bepergian dengan satu orang tua atau orang dewasa lain — persyaratan beda-beda, jadi periksa aturan negara tujuan",
              "Akta kelahiran, jika diminta bukti hubungan keluarga",
              "Catatan vaksinasi, jika negara tujuan mensyaratkannya",
            ],
          },
          {
            h2: "Jaga tetap tertata dan terbarui",
            items: [
              "Simpan satu profil per anak agar dokumen tiap anak tetap menyatu",
              "Pasang tanggal “berlaku sampai” pada tiap paspor dan sertifikat untuk dapat pengingat email sebelum kedaluwarsa",
              "Simpan dokumen penting ke ponsel lebih dulu untuk akses offline saat bepergian",
              "Bagikan dokumen ke sekolah atau kerabat lewat tautan yang kedaluwarsa dan bisa dicabut",
            ],
          },
        ],
        faqHeading: "Pertanyaan umum",
        faq: [
          {
            q: "Dokumen apa yang harus saya simpan untuk anak?",
            a: "Minimal akta kelahiran, paspor atau identitas, catatan medis dan vaksinasi, asuransi kesehatan, dan berkas sekolah. Simpan menyatu dalam profil tiap anak dan tambahkan tanggal kedaluwarsa bila berlaku.",
          },
          {
            q: "Apa yang dibutuhkan anak untuk perjalanan internasional?",
            a: "Biasanya paspor sendiri dan visa bila perlu, kadang surat persetujuan perjalanan atau akta kelahiran. Aturan beda-beda, jadi periksa persyaratan negara tujuan dan maskapai sebelum berangkat.",
          },
          {
            q: "Dokumen apa yang dibutuhkan untuk pendaftaran sekolah?",
            a: "Sering kali akta kelahiran, bukti alamat, rapor sekolah sebelumnya, dan formulir vaksinasi — tetapi tergantung sekolah dan negara. Periksa persyaratan persis sekolah Anda.",
          },
          {
            q: "Siapa yang bisa melihat dokumen anak saya?",
            a: "Hanya orang di keluarga yang Anda undang. Akses diisolasi di tingkat basis data (RLS), jadi tidak ada pihak luar yang bisa melihat dokumen anak Anda.",
          },
          {
            q: "Bisakah dapat pengingat sebelum paspor anak kedaluwarsa?",
            a: "Bisa. Pasang tanggal “berlaku sampai” pada paspor tiap anak, dan pengingat tiba lewat email sebelum kedaluwarsa.",
          },
        ],
      },
      uz: {
        navLabel: "Bola roʻyxati",
        title: "Ota-onalar uchun bola hujjatlari roʻyxati",
        metaDescription:
          "Har bir bola uchun saqlanadigan hujjatlar roʻyxati: tugʻilganlik guvohnomasi, pasport, tibbiy, maktab — hamda sayohat roziliklari.",
        h1: "Bola hujjatlari roʻyxati: har bir ota-ona nimani saqlashi kerak",
        intro:
          "Har bir bola uchun bitta joyda saqlashga arziydigan hujjatlar — tugʻilganlik guvohnomasi, pasport, tibbiy va emlash yozuvlari, maktab qogʻozlari va sayohat roziligi. Har bir bola uchun profil yarating, hujjatlarni oilaviy seyfda saqlang va biror narsa tugashidan oldin eslatmalar qoʻying. Maktab va sayohat qoidalari har xil, shuning uchun davlatingiz va maktabingiz talablarini doim tekshiring.",
        ctaPrimary: "Har bir bola uchun profil yarating",
        groups: [
          {
            h2: "Har bir bola uchun asosiy hujjatlar",
            items: [
              "Tugʻilganlik haqidagi guvohnoma (va bor boʻlsa rasmiy tarjimasi)",
              "Pasport yoki milliy ID, raqami va tugash sanasi bilan",
              "Viza yoki yashash ruxsatnomasi, agar oilangizga kerak boʻlsa",
              "Tibbiy yozuvlar: shifokor xulosalari, allergiyalar va tahlil natijalari",
              "Emlash yozuvlari va vaksinatsiya sertifikatlari",
              "Tibbiy sugʻurta polisi yoki kartasi",
            ],
          },
          {
            h2: "Maktab uchun",
            items: [
              "Qabul va roʻyxatga olish hujjatlari",
              "Oldingi maktab tabellari, koʻchirmalari yoki sertifikatlari",
              "Manzil tasdigʻi, agar maktab soʻrasa",
              "Talab qilingan emlash yoki tibbiy ariza — talablar maktab va davlatga bogʻliq, tekshiring",
            ],
          },
          {
            h2: "Sayohat uchun",
            items: [
              "Har bir bolaning oʻz pasporti va kerak boʻlsa viza",
              "Bola bitta ota-ona yoki boshqa kattalar bilan sayohat qilganda rozilik xati — talablar har xil, boriladigan davlat qoidalarini tekshiring",
              "Tugʻilganlik guvohnomasi — qarindoshlik tasdigʻi soʻralsa",
              "Emlash yozuvlari, agar boriladigan davlat talab qilsa",
            ],
          },
          {
            h2: "Tartibli va dolzarb saqlang",
            items: [
              "Har bir bola uchun bitta profil yuriting, hujjatlari birga tursin",
              "Har bir pasport va sertifikatga “amal qiladi” sanasini qoʻying, muddat tugashidan oldin email eslatma oling",
              "Muhim hujjatlarni telefoningizga oldindan saqlang, sayohatda oflayn kirish uchun",
              "Hujjatni maktab yoki qarindoshga muddati tugaydigan va bekor qilinadigan havola orqali ulashing",
            ],
          },
        ],
        faqHeading: "Tez-tez beriladigan savollar",
        faq: [
          {
            q: "Bolam uchun qanday hujjatlarni saqlashim kerak?",
            a: "Kamida tugʻilganlik guvohnomasi, pasport yoki ID, tibbiy va emlash yozuvlari, tibbiy sugʻurta va maktab qogʻozlari. Ularni har bir bolaning profilida birga saqlang va tegishli joylarda tugash sanasini qoʻshing.",
          },
          {
            q: "Bolalarga xalqaro sayohat uchun nima kerak?",
            a: "Odatda oʻz pasporti va kerak boʻlsa viza, baʼzan sayohat rozilik xati yoki tugʻilganlik guvohnomasi. Qoidalar har xil, shuning uchun ketishdan oldin boriladigan davlat va aviakompaniya talablarini tekshiring.",
          },
          {
            q: "Maktabga qabul uchun qanday hujjatlar kerak?",
            a: "Koʻpincha tugʻilganlik guvohnomasi, manzil tasdigʻi, oldingi maktab yozuvlari va emlash arizalari — lekin bu maktab va davlatga bogʻliq. Maktabingizning aniq talablarini tekshiring.",
          },
          {
            q: "Bolamning hujjatlarini kim koʻradi?",
            a: "Faqat oilangizga taklif qilgan odamlar. Kirish maʼlumotlar bazasi darajasida izolyatsiya qilingan (RLS), shuning uchun begonalar bolangiz hujjatlarini koʻrmaydi.",
          },
          {
            q: "Bola pasporti tugashidan oldin eslatma olsa boʻladimi?",
            a: "Ha. Har bir bola pasportiga “amal qiladi” sanasini qoʻying — eslatma muddat tugashidan oldin email orqali keladi.",
          },
        ],
      },
    },
    related: {
      en: [
        { href: "/family-document-vault", label: "Family document vault" },
        { href: "/for/families", label: "For families" },
      ],
      ru: [
        { href: "/family-document-vault", label: "Семейный сейф документов" },
        { href: "/for/families", label: "Для семей" },
      ],
      id: [
        { href: "/family-document-vault", label: "Brankas dokumen keluarga" },
        { href: "/for/families", label: "Untuk keluarga" },
      ],
      uz: [
        { href: "/family-document-vault", label: "Oilaviy hujjatlar seyfi" },
        { href: "/for/families", label: "Oilalar uchun" },
      ],
    },
  },
  "skck-checklist": {
    slug: "skck-checklist",
    emoji: "🗂️",
    locales: {
      en: {
        navLabel: "SKCK checklist",
        title: "SKCK Requirements Checklist for Hiring | Doki.help",
        metaDescription:
          "What SKCK is, the documents usually needed to apply, and how HR teams collect it from candidates via one reusable checklist link.",
        h1: "SKCK document checklist for hiring",
        intro:
          "SKCK (Surat Keterangan Catatan Kepolisian) is a police-record certificate many Indonesian employers request during hiring. This checklist covers what candidates usually need to apply and how to collect it cleanly. Always confirm current requirements with the local police (Polri) or the official SKCK portal.",
        ctaPrimary: "Collect these documents via one link",
        groups: [
          {
            h2: "What candidates usually need to apply",
            items: [
              "Valid KTP (national ID)",
              "Family card (Kartu Keluarga / KK)",
              "Recent red-background photos",
              "Birth certificate or ijazah (varies by office)",
              "Application form at the police office or online",
            ],
          },
          {
            h2: "What HR usually collects from the candidate",
            items: [
              "A copy of the issued SKCK",
              "Issue and expiry date (SKCK is time-limited)",
              "KTP for an identity match",
            ],
          },
          {
            h2: "Collect it without the back-and-forth",
            items: [
              "Send one checklist link — the candidate uploads without an account",
              "See a “complete / missing” status per candidate",
              "Set a reminder before the SKCK expires",
            ],
          },
        ],
        faqHeading: "SKCK — frequently asked",
        faq: [
          {
            q: "How long is an SKCK valid?",
            a: "An SKCK is time-limited and typically needs renewal after a period set by Polri. Check the exact validity on the certificate or the official SKCK portal.",
          },
          {
            q: "Should candidates upload SKCK before an interview?",
            a: "Sensitive documents are best collected after an offer, not from every applicant. Doki keeps ID and health documents to the post-offer stage by default.",
          },
          {
            q: "Can I collect SKCK from many candidates at once?",
            a: "Yes — send each candidate the same checklist link; each uploads their own file and you instantly see who is complete.",
          },
        ],
      },
      id: {
        navLabel: "Ceklis SKCK",
        title: "Ceklis Dokumen SKCK untuk Rekrutmen | Doki.help",
        metaDescription:
          "Apa itu SKCK, dokumen yang biasanya diperlukan untuk mengurusnya, dan cara tim HR mengumpulkannya dari kandidat lewat satu tautan ceklis.",
        h1: "Ceklis dokumen SKCK untuk rekrutmen",
        intro:
          "SKCK (Surat Keterangan Catatan Kepolisian) sering diminta banyak perusahaan saat rekrutmen. Ceklis ini merangkum apa yang biasanya diperlukan kandidat untuk mengurusnya dan cara mengumpulkannya dengan rapi. Selalu cek syarat terbaru di kepolisian (Polri) atau portal SKCK resmi.",
        ctaPrimary: "Kumpulkan dokumen ini lewat satu tautan",
        groups: [
          {
            h2: "Yang biasanya diperlukan untuk mengurus SKCK",
            items: [
              "KTP yang berlaku",
              "Kartu Keluarga (KK)",
              "Pas foto latar merah terbaru",
              "Akta kelahiran atau ijazah (tergantung kantor)",
              "Formulir permohonan di kantor polisi atau online",
            ],
          },
          {
            h2: "Yang biasanya dikumpulkan HR dari kandidat",
            items: [
              "Salinan SKCK yang sudah terbit",
              "Tanggal terbit dan masa berlaku",
              "KTP untuk pencocokan identitas",
            ],
          },
          {
            h2: "Kumpulkan tanpa bolak-balik",
            items: [
              "Kirim satu tautan ceklis — kandidat unggah tanpa akun",
              "Lihat status “lengkap / kurang” per kandidat",
              "Pasang pengingat sebelum SKCK kedaluwarsa",
            ],
          },
        ],
        faqHeading: "SKCK — pertanyaan umum",
        faq: [
          {
            q: "Berapa lama SKCK berlaku?",
            a: "SKCK memiliki masa berlaku terbatas dan biasanya perlu diperpanjang setelah periode yang ditetapkan Polri. Cek masa berlaku persisnya di sertifikat atau portal SKCK resmi.",
          },
          {
            q: "Apakah kandidat harus mengunggah SKCK sebelum wawancara?",
            a: "Dokumen sensitif sebaiknya dikumpulkan setelah penawaran, bukan dari setiap pelamar. Doki secara bawaan menunda dokumen identitas dan kesehatan ke tahap pasca-penawaran.",
          },
          {
            q: "Bisakah mengumpulkan SKCK dari banyak kandidat sekaligus?",
            a: "Bisa — kirim tautan ceklis yang sama ke tiap kandidat; masing-masing mengunggah berkasnya dan Anda langsung melihat siapa yang lengkap.",
          },
        ],
      },
      ru: {
        navLabel: "Чек-лист SKCK",
        title: "Чек-лист документов SKCK для найма | Doki.help",
        metaDescription:
          "Что такое SKCK, какие документы обычно нужны для оформления и как HR собирает его у кандидатов по одной ссылке-чек-листу.",
        h1: "Чек-лист документов SKCK для найма",
        intro:
          "SKCK (справка о несудимости) — документ, который многие индонезийские работодатели запрашивают при найме. Чек-лист собирает то, что обычно нужно кандидату для оформления, и как аккуратно всё получить. Актуальные требования уточняйте в полиции (Polri) или на официальном портале SKCK.",
        ctaPrimary: "Собрать эти документы по одной ссылке",
        groups: [
          {
            h2: "Что обычно нужно для оформления SKCK",
            items: [
              "Действующий KTP",
              "Семейная карта (KK)",
              "Свежие фото на красном фоне",
              "Свидетельство о рождении или диплом (зависит от отделения)",
              "Заявление в отделении полиции или онлайн",
            ],
          },
          {
            h2: "Что HR обычно собирает у кандидата",
            items: [
              "Копию готового SKCK",
              "Дату выдачи и срок действия",
              "KTP для сверки личности",
            ],
          },
          {
            h2: "Соберите без переписки",
            items: [
              "Отправьте одну ссылку-чек-лист — кандидат загружает без регистрации",
              "Статус «полный / не хватает» по каждому",
              "Напоминание до истечения срока SKCK",
            ],
          },
        ],
        faqHeading: "SKCK — частые вопросы",
        faq: [
          {
            q: "Сколько действует SKCK?",
            a: "У SKCK ограниченный срок действия, обычно требуется продление через период, установленный Polri. Точный срок смотрите на справке или официальном портале SKCK.",
          },
          {
            q: "Должен ли кандидат загружать SKCK до собеседования?",
            a: "Чувствительные документы лучше собирать после оффера, а не у каждого соискателя. Doki по умолчанию откладывает ID и медицинские документы на пост-офферный этап.",
          },
          {
            q: "Можно собрать SKCK у многих кандидатов сразу?",
            a: "Да — отправьте каждому одну и ту же ссылку-чек-лист; каждый загружает свой файл, и вы сразу видите, кто укомплектован.",
          },
        ],
      },
      uz: {
        navLabel: "SKCK ro‘yxati",
        title: "Yollash uchun SKCK hujjatlari ro‘yxati | Doki.help",
        metaDescription:
          "SKCK nima, uni rasmiylashtirish uchun odatda qanday hujjatlar kerak va HR uni nomzodlardan bitta havola orqali qanday yig‘adi.",
        h1: "Yollash uchun SKCK hujjatlari ro‘yxati",
        intro:
          "SKCK (politsiya ma’lumotnomasi) — ko‘plab Indoneziya ish beruvchilari yollashda so‘raydigan hujjat. Bu ro‘yxatda nomzodga uni rasmiylashtirish uchun odatda nima kerakligi va uni qanday tartibli yig‘ish yig‘ilgan. Dolzarb talablarni politsiya (Polri) yoki rasmiy SKCK portalidan tekshiring.",
        ctaPrimary: "Bu hujjatlarni bitta havola orqali yig‘ing",
        groups: [
          {
            h2: "SKCK olish uchun odatda nima kerak",
            items: [
              "Amaldagi KTP",
              "Oila kartasi (KK)",
              "Qizil fonli yangi rasmlar",
              "Tug‘ilganlik guvohnomasi yoki diplom (bo‘limga qarab)",
              "Politsiya bo‘limida yoki onlayn ariza",
            ],
          },
          {
            h2: "HR nomzoddan odatda nima yig‘adi",
            items: [
              "Tayyor SKCK nusxasi",
              "Berilgan sana va amal qilish muddati",
              "Shaxsni solishtirish uchun KTP",
            ],
          },
          {
            h2: "Yozishmalarsiz yig‘ing",
            items: [
              "Bitta ro‘yxat-havola yuboring — nomzod hisobsiz yuklaydi",
              "Har bir nomzod bo‘yicha “to‘liq / kam” statusi",
              "SKCK muddati tugashidan oldin eslatma",
            ],
          },
        ],
        faqHeading: "SKCK — ko‘p beriladigan savollar",
        faq: [
          {
            q: "SKCK qancha amal qiladi?",
            a: "SKCK cheklangan muddatga ega va odatda Polri belgilagan muddatdan so‘ng yangilanishi kerak. Aniq muddatni guvohnomada yoki rasmiy SKCK portalida tekshiring.",
          },
          {
            q: "Nomzod SKCK ni suhbatdan oldin yuklashi kerakmi?",
            a: "Sezgir hujjatlarni har bir arizachidan emas, taklifdan keyin yig‘gan ma’qul. Doki sukut bo‘yicha shaxs va sog‘liq hujjatlarini taklifdan keyingi bosqichga qoldiradi.",
          },
          {
            q: "Ko‘p nomzoddan SKCK ni bir vaqtda yig‘sa bo‘ladimi?",
            a: "Ha — har bir nomzodga bir xil ro‘yxat-havola yuboring; har biri o‘z faylini yuklaydi va siz kim to‘liq ekanini darrov ko‘rasiz.",
          },
        ],
      },
    },
    related: {
      en: [
        { href: "/for/recruitment-agencies", label: "For recruiting agencies" },
        { href: "/checklists/employee-onboarding-11-checklist", label: "Employee onboarding checklist" },
        { href: "/security", label: "How your documents are protected" },
      ],
      id: [
        { href: "/for/recruitment-agencies", label: "Untuk agensi rekrutmen" },
        { href: "/checklists/employee-onboarding-11-checklist", label: "Ceklis onboarding karyawan" },
        { href: "/security", label: "Cara dokumen Anda dilindungi" },
      ],
      ru: [
        { href: "/for/recruitment-agencies", label: "Для рекрутинговых агентств" },
        { href: "/checklists/employee-onboarding-11-checklist", label: "Чек-лист онбординга сотрудника" },
        { href: "/security", label: "Как защищены документы" },
      ],
      uz: [
        { href: "/for/recruitment-agencies", label: "Rekruting agentliklari uchun" },
        { href: "/checklists/employee-onboarding-11-checklist", label: "Xodim onboarding ro‘yxati" },
        { href: "/security", label: "Hujjatlaringiz qanday himoyalanadi" },
      ],
    },
  },
  "kitas-work-permit-checklist": {
    slug: "kitas-work-permit-checklist",
    emoji: "🛂",
    locales: {
      en: {
        navLabel: "KITAS checklist",
        title: "KITAS & Work Permit Document Checklist | Doki.help",
        metaDescription:
          "Documents commonly needed for a KITAS / work permit, and how relocation agents collect them from clients via one checklist link.",
        h1: "KITAS / work permit document checklist",
        intro:
          "A KITAS (limited-stay permit) usually requires a set of documents from the applicant and the sponsor. This checklist lists what's commonly needed and how to collect it from a client in one place. Requirements change — always verify with immigration (imigrasi.go.id) or a licensed agent.",
        ctaPrimary: "Collect these documents via one link",
        groups: [
          {
            h2: "Applicant documents (commonly requested)",
            items: [
              "Passport valid well beyond the stay",
              "Red-background photos",
              "CV and diploma / certificates",
              "Health certificate (as required)",
            ],
          },
          {
            h2: "Sponsor / company documents",
            items: [
              "Sponsor letter and company deed",
              "Company NPWP (tax ID)",
              "Position and job description",
            ],
          },
          {
            h2: "Collect from the client cleanly",
            items: [
              "Send one checklist link — the client uploads without an account",
              "Track a “complete / missing” status per client",
              "Set reminders for KITAS and passport expiry",
            ],
          },
        ],
        faqHeading: "KITAS — frequently asked",
        faq: [
          {
            q: "Is this the official KITAS requirement list?",
            a: "No — requirements vary by permit type and change over time. Treat this as a working checklist and confirm with immigration or a licensed agent.",
          },
          {
            q: "Can I reuse the checklist for every client?",
            a: "Yes — the same checklist link works for each client; everyone uploads their own documents into their own package.",
          },
          {
            q: "Does Doki give immigration advice?",
            a: "No. Doki organizes and collects documents; it does not provide legal or immigration advice.",
          },
        ],
      },
      id: {
        navLabel: "Ceklis KITAS",
        title: "Ceklis Dokumen KITAS & Izin Kerja | Doki.help",
        metaDescription:
          "Dokumen yang umum diperlukan untuk KITAS / izin kerja, dan cara agen relokasi mengumpulkannya dari klien lewat satu tautan ceklis.",
        h1: "Ceklis dokumen KITAS / izin kerja",
        intro:
          "KITAS (izin tinggal terbatas) biasanya memerlukan sejumlah dokumen dari pemohon dan penjamin. Ceklis ini merangkum yang umum diperlukan dan cara mengumpulkannya dari klien di satu tempat. Syarat bisa berubah — selalu cek di imigrasi (imigrasi.go.id) atau agen berlisensi.",
        ctaPrimary: "Kumpulkan dokumen ini lewat satu tautan",
        groups: [
          {
            h2: "Dokumen pemohon (umum diminta)",
            items: [
              "Paspor berlaku jauh melebihi masa tinggal",
              "Pas foto latar merah",
              "CV dan ijazah / sertifikat",
              "Surat sehat (sesuai kebutuhan)",
            ],
          },
          {
            h2: "Dokumen penjamin / perusahaan",
            items: [
              "Surat penjamin dan akta perusahaan",
              "NPWP perusahaan",
              "Posisi dan uraian pekerjaan",
            ],
          },
          {
            h2: "Kumpulkan dari klien dengan rapi",
            items: [
              "Kirim satu tautan ceklis — klien unggah tanpa akun",
              "Pantau status “lengkap / kurang” per klien",
              "Pasang pengingat masa berlaku KITAS dan paspor",
            ],
          },
        ],
        faqHeading: "KITAS — pertanyaan umum",
        faq: [
          {
            q: "Apakah ini daftar syarat KITAS resmi?",
            a: "Bukan — syarat berbeda menurut jenis izin dan bisa berubah. Anggap ini ceklis kerja dan konfirmasikan ke imigrasi atau agen berlisensi.",
          },
          {
            q: "Bisakah ceklisnya dipakai ulang untuk tiap klien?",
            a: "Bisa — tautan ceklis yang sama berlaku untuk tiap klien; masing-masing mengunggah dokumennya ke paketnya sendiri.",
          },
          {
            q: "Apakah Doki memberi saran imigrasi?",
            a: "Tidak. Doki menata dan mengumpulkan dokumen; Doki tidak memberi nasihat hukum atau imigrasi.",
          },
        ],
      },
      ru: {
        navLabel: "Чек-лист KITAS",
        title: "Чек-лист документов KITAS и разрешения | Doki.help",
        metaDescription:
          "Какие документы обычно нужны для KITAS / разрешения на работу и как релокейт-агенты собирают их у клиентов по одной ссылке.",
        h1: "Чек-лист документов KITAS / разрешения на работу",
        intro:
          "KITAS (разрешение на временное пребывание) обычно требует пакет документов от заявителя и спонсора. Чек-лист собирает то, что чаще всего нужно, и как получить это у клиента в одном месте. Требования меняются — уточняйте в иммиграции (imigrasi.go.id) или у лицензированного агента.",
        ctaPrimary: "Собрать эти документы по одной ссылке",
        groups: [
          {
            h2: "Документы заявителя (обычно запрашивают)",
            items: [
              "Паспорт с запасом срока действия",
              "Фото на красном фоне",
              "CV и диплом / сертификаты",
              "Медсправка (по требованию)",
            ],
          },
          {
            h2: "Документы спонсора / компании",
            items: [
              "Спонсорское письмо и устав компании",
              "NPWP компании",
              "Должность и описание работы",
            ],
          },
          {
            h2: "Соберите у клиента аккуратно",
            items: [
              "Отправьте одну ссылку-чек-лист — клиент загружает без регистрации",
              "Статус «полный / не хватает» по каждому клиенту",
              "Напоминания о сроках KITAS и паспорта",
            ],
          },
        ],
        faqHeading: "KITAS — частые вопросы",
        faq: [
          {
            q: "Это официальный список требований KITAS?",
            a: "Нет — требования зависят от типа разрешения и меняются. Считайте это рабочим чек-листом и уточняйте в иммиграции или у лицензированного агента.",
          },
          {
            q: "Можно использовать чек-лист для каждого клиента?",
            a: "Да — одна и та же ссылка работает для каждого клиента; каждый загружает свои документы в свой пакет.",
          },
          {
            q: "Даёт ли Doki иммиграционные советы?",
            a: "Нет. Doki организует и собирает документы; юридических и иммиграционных советов сервис не даёт.",
          },
        ],
      },
      uz: {
        navLabel: "KITAS ro‘yxati",
        title: "KITAS va ish ruxsati hujjatlari ro‘yxati | Doki.help",
        metaDescription:
          "KITAS / ish ruxsati uchun odatda kerak bo‘ladigan hujjatlar va ko‘chirish agentlari ularni mijozdan bitta havola orqali qanday yig‘adi.",
        h1: "KITAS / ish ruxsati hujjatlari ro‘yxati",
        intro:
          "KITAS (vaqtinchalik yashash ruxsati) odatda arizachi va homiydan bir qator hujjatlarni talab qiladi. Bu ro‘yxatda ko‘pincha nima kerakligi va uni mijozdan bir joyda qanday yig‘ish keltirilgan. Talablar o‘zgaradi — har doim immigratsiya (imigrasi.go.id) yoki litsenziyali agentda tekshiring.",
        ctaPrimary: "Bu hujjatlarni bitta havola orqali yig‘ing",
        groups: [
          {
            h2: "Arizachi hujjatlari (odatda so‘raladi)",
            items: [
              "Yashash muddatidan ancha oshib amal qiladigan pasport",
              "Qizil fonli rasmlar",
              "CV va diplom / sertifikatlar",
              "Tibbiy ma’lumotnoma (talabga ko‘ra)",
            ],
          },
          {
            h2: "Homiy / kompaniya hujjatlari",
            items: [
              "Homiy xati va kompaniya ta’sis hujjati",
              "Kompaniya NPWP",
              "Lavozim va ish tavsifi",
            ],
          },
          {
            h2: "Mijozdan tartibli yig‘ing",
            items: [
              "Bitta ro‘yxat-havola yuboring — mijoz hisobsiz yuklaydi",
              "Har bir mijoz bo‘yicha “to‘liq / kam” statusi",
              "KITAS va pasport muddati bo‘yicha eslatmalar",
            ],
          },
        ],
        faqHeading: "KITAS — ko‘p beriladigan savollar",
        faq: [
          {
            q: "Bu rasmiy KITAS talablari ro‘yxatimi?",
            a: "Yo‘q — talablar ruxsat turiga qarab farq qiladi va o‘zgaradi. Buni ishchi ro‘yxat deb biling va immigratsiya yoki litsenziyali agentda tasdiqlang.",
          },
          {
            q: "Ro‘yxatni har bir mijoz uchun qayta ishlatsa bo‘ladimi?",
            a: "Ha — bir xil ro‘yxat-havola har bir mijoz uchun ishlaydi; har biri o‘z hujjatlarini o‘z paketiga yuklaydi.",
          },
          {
            q: "Doki immigratsiya bo‘yicha maslahat beradimi?",
            a: "Yo‘q. Doki hujjatlarni tartibga soladi va yig‘adi; huquqiy yoki immigratsiya maslahatini bermaydi.",
          },
        ],
      },
    },
    related: {
      en: [
        { href: "/for/visa-agents", label: "For visa & relocation agents" },
        { href: "/for/residence", label: "KITAS & stay documents" },
        { href: "/security", label: "How your documents are protected" },
      ],
      id: [
        { href: "/for/visa-agents", label: "Untuk agen visa & relokasi" },
        { href: "/for/residence", label: "Dokumen KITAS & izin tinggal" },
        { href: "/security", label: "Cara dokumen Anda dilindungi" },
      ],
      ru: [
        { href: "/for/visa-agents", label: "Для визовых и релокейт-агентов" },
        { href: "/for/residence", label: "Документы KITAS и пребывания" },
        { href: "/security", label: "Как защищены документы" },
      ],
      uz: [
        { href: "/for/visa-agents", label: "Viza va ko‘chirish agentlari uchun" },
        { href: "/for/residence", label: "KITAS va yashash hujjatlari" },
        { href: "/security", label: "Hujjatlaringiz qanday himoyalanadi" },
      ],
    },
  },
  "employee-onboarding-11-checklist": {
    slug: "employee-onboarding-11-checklist",
    emoji: "📋",
    locales: {
      en: {
        navLabel: "Onboarding checklist",
        title: "Employee Onboarding Document Checklist | Doki.help",
        metaDescription:
          "The documents Indonesian employers commonly collect when onboarding a new employee — an 11-item checklist plus how to collect it from one link.",
        h1: "Employee onboarding document checklist (11 documents)",
        intro:
          "When a new hire joins, Indonesian employers usually collect a standard set of documents. This 11-item checklist is a practical starting point — adjust it to your company and always confirm what your payroll/BPJS process requires.",
        ctaPrimary: "Collect these documents via one link",
        groups: [
          {
            h2: "The 11 documents most employers collect",
            items: [
              "KTP (national ID)",
              "Family card (Kartu Keluarga / KK)",
              "CV / résumé",
              "Ijazah (diploma)",
              "Certificates (as relevant)",
              "SKCK (police record)",
              "NPWP (tax ID)",
              "Passport-size photo",
              "Health certificate (surat sehat)",
              "Bank account details (buku rekening)",
              "BPJS (Kesehatan / Ketenagakerjaan)",
            ],
          },
          {
            h2: "Good practice",
            items: [
              "Collect ID and health documents after the offer, not from every applicant",
              "Note expiry dates for SKCK, KITAS and certificates",
              "Keep one package per employee, not scattered chats",
            ],
          },
          {
            h2: "Collect it cleanly",
            items: [
              "Send the new hire one checklist link — they upload without an account",
              "Track a “complete / missing” status",
              "Export the package with no lock-in",
            ],
          },
        ],
        faqHeading: "Onboarding documents — FAQ",
        faq: [
          { q: "Is this list mandatory?", a: "No — it's a common baseline. Requirements vary by company, role and payroll/BPJS setup. Confirm your own list." },
          { q: "Should candidates upload KTP before an offer?", a: "Sensitive ID and health documents are best collected after an offer. Doki defers them to the post-offer stage by default." },
          { q: "Can I reuse the checklist for every new hire?", a: "Yes — send each new employee the same checklist link." },
        ],
      },
      id: {
        navLabel: "Ceklis onboarding",
        title: "Ceklis Dokumen Onboarding Karyawan | Doki.help",
        metaDescription:
          "Dokumen yang umum dikumpulkan perusahaan saat onboarding karyawan baru — ceklis 11 dokumen plus cara mengumpulkannya dari satu tautan.",
        h1: "Ceklis dokumen onboarding karyawan (11 dokumen)",
        intro:
          "Saat karyawan baru bergabung, perusahaan biasanya mengumpulkan sejumlah dokumen standar. Ceklis 11 dokumen ini titik awal yang praktis — sesuaikan dengan perusahaan Anda dan selalu cek kebutuhan payroll/BPJS Anda.",
        ctaPrimary: "Kumpulkan dokumen ini lewat satu tautan",
        groups: [
          {
            h2: "11 dokumen yang umum dikumpulkan",
            items: [
              "KTP",
              "Kartu Keluarga (KK)",
              "CV / resume",
              "Ijazah",
              "Sertifikat (sesuai kebutuhan)",
              "SKCK",
              "NPWP",
              "Pas foto",
              "Surat sehat",
              "Buku rekening",
              "BPJS (Kesehatan / Ketenagakerjaan)",
            ],
          },
          {
            h2: "Praktik yang baik",
            items: [
              "Kumpulkan dokumen identitas dan kesehatan setelah penawaran, bukan dari setiap pelamar",
              "Catat masa berlaku SKCK, KITAS, dan sertifikat",
              "Simpan satu paket per karyawan, bukan tersebar di chat",
            ],
          },
          {
            h2: "Kumpulkan dengan rapi",
            items: [
              "Kirim satu tautan ceklis ke karyawan baru — unggah tanpa akun",
              "Pantau status “lengkap / kurang”",
              "Ekspor paketnya tanpa terkunci",
            ],
          },
        ],
        faqHeading: "Dokumen onboarding — FAQ",
        faq: [
          { q: "Apakah daftar ini wajib?", a: "Bukan — ini baseline umum. Kebutuhan berbeda menurut perusahaan, peran, dan payroll/BPJS. Konfirmasikan daftar Anda sendiri." },
          { q: "Apakah kandidat harus unggah KTP sebelum penawaran?", a: "Dokumen identitas dan kesehatan yang sensitif sebaiknya dikumpulkan setelah penawaran. Doki menundanya ke tahap pasca-penawaran secara bawaan." },
          { q: "Bisakah ceklisnya dipakai ulang untuk tiap karyawan baru?", a: "Bisa — kirim tautan ceklis yang sama ke tiap karyawan baru." },
        ],
      },
      ru: {
        navLabel: "Чек-лист онбординга",
        title: "Чек-лист документов онбординга сотрудника | Doki.help",
        metaDescription:
          "Документы, которые индонезийские работодатели обычно собирают при онбординге нового сотрудника — 11 пунктов и как собрать по одной ссылке.",
        h1: "Чек-лист документов онбординга сотрудника (11 документов)",
        intro:
          "Когда выходит новый сотрудник, индонезийские работодатели обычно собирают стандартный набор документов. Этот чек-лист из 11 пунктов — практичная отправная точка; адаптируйте под компанию и сверяйтесь с требованиями payroll/BPJS.",
        ctaPrimary: "Собрать эти документы по одной ссылке",
        groups: [
          {
            h2: "11 документов, которые обычно собирают",
            items: [
              "KTP",
              "Семейная карта (KK)",
              "CV / резюме",
              "Диплом (Ijazah)",
              "Сертификаты (по необходимости)",
              "SKCK",
              "NPWP",
              "Фото на документы",
              "Медсправка (surat sehat)",
              "Реквизиты счёта (buku rekening)",
              "BPJS (Kesehatan / Ketenagakerjaan)",
            ],
          },
          {
            h2: "Хорошая практика",
            items: [
              "ID и медицинские документы собирайте после оффера, а не у каждого соискателя",
              "Отмечайте сроки SKCK, KITAS и сертификатов",
              "Держите один пакет на сотрудника, а не в чатах",
            ],
          },
          {
            h2: "Соберите аккуратно",
            items: [
              "Отправьте новому сотруднику одну ссылку-чек-лист — загрузка без аккаунта",
              "Статус «полный / не хватает»",
              "Экспорт пакета без привязки",
            ],
          },
        ],
        faqHeading: "Документы онбординга — FAQ",
        faq: [
          { q: "Этот список обязателен?", a: "Нет — это типовая база. Требования зависят от компании, роли и настройки payroll/BPJS. Уточните свой список." },
          { q: "Загружать ли KTP до оффера?", a: "Чувствительные ID и мед-документы лучше собирать после оффера. Doki по умолчанию откладывает их на пост-офферный этап." },
          { q: "Можно использовать чек-лист для каждого нового сотрудника?", a: "Да — отправляйте каждому одну и ту же ссылку-чек-лист." },
        ],
      },
      uz: {
        navLabel: "Onboarding ro‘yxati",
        title: "Xodim onboardingi hujjatlari ro‘yxati | Doki.help",
        metaDescription:
          "Ish beruvchilar yangi xodimni onboarding qilishda odatda yig‘adigan hujjatlar — 11 bandlik ro‘yxat va uni bitta havoladan yig‘ish.",
        h1: "Xodim onboardingi hujjatlari ro‘yxati (11 hujjat)",
        intro:
          "Yangi xodim ishga kirganda ish beruvchilar odatda standart hujjatlar to‘plamini yig‘adi. Bu 11 bandlik ro‘yxat — amaliy boshlang‘ich nuqta; kompaniyangizga moslang va payroll/BPJS talablarini tekshiring.",
        ctaPrimary: "Bu hujjatlarni bitta havola orqali yig‘ing",
        groups: [
          {
            h2: "Odatda yig‘iladigan 11 hujjat",
            items: [
              "KTP",
              "Oila kartasi (KK)",
              "CV / rezyume",
              "Ijazah (diplom)",
              "Sertifikatlar (kerak bo‘lsa)",
              "SKCK",
              "NPWP",
              "Pas foto",
              "Tibbiy ma’lumotnoma (surat sehat)",
              "Bank hisob raqami (buku rekening)",
              "BPJS (Kesehatan / Ketenagakerjaan)",
            ],
          },
          {
            h2: "Yaxshi amaliyot",
            items: [
              "Shaxs va sog‘liq hujjatlarini har bir arizachidan emas, taklifdan keyin yig‘ing",
              "SKCK, KITAS va sertifikatlar muddatini belgilang",
              "Chatlarda emas, har bir xodim uchun bitta paket saqlang",
            ],
          },
          {
            h2: "Tartibli yig‘ing",
            items: [
              "Yangi xodimga bitta ro‘yxat-havola yuboring — hisobsiz yuklaydi",
              "“to‘liq / kam” statusini kuzating",
              "Paketni bog‘lanishsiz eksport qiling",
            ],
          },
        ],
        faqHeading: "Onboarding hujjatlari — FAQ",
        faq: [
          { q: "Bu ro‘yxat majburiymi?", a: "Yo‘q — bu umumiy asos. Talablar kompaniya, lavozim va payroll/BPJS ga qarab farq qiladi. O‘z ro‘yxatingizni tasdiqlang." },
          { q: "Nomzod KTP ni taklifdan oldin yuklashi kerakmi?", a: "Sezgir shaxs va sog‘liq hujjatlarini taklifdan keyin yig‘gan ma’qul. Doki ularni sukut bo‘yicha taklifdan keyingi bosqichga qoldiradi." },
          { q: "Ro‘yxatni har bir yangi xodim uchun qayta ishlatsa bo‘ladimi?", a: "Ha — har biriga bir xil ro‘yxat-havola yuboring." },
        ],
      },
    },
    related: {
      en: [
        { href: "/for/employers", label: "For HR teams & agencies" },
        { href: "/checklists/skck-checklist", label: "SKCK checklist" },
        { href: "/candidate-document-collection", label: "Collect candidate documents" },
      ],
      id: [
        { href: "/for/employers", label: "Untuk tim HR & agensi" },
        { href: "/checklists/skck-checklist", label: "Ceklis SKCK" },
        { href: "/candidate-document-collection", label: "Kumpulkan dokumen kandidat" },
      ],
      ru: [
        { href: "/for/employers", label: "Для HR-команд и агентств" },
        { href: "/checklists/skck-checklist", label: "Чек-лист SKCK" },
        { href: "/candidate-document-collection", label: "Сбор документов кандидатов" },
      ],
      uz: [
        { href: "/for/employers", label: "HR jamoalari va agentliklar uchun" },
        { href: "/checklists/skck-checklist", label: "SKCK ro‘yxati" },
        { href: "/candidate-document-collection", label: "Nomzod hujjatlarini yig‘ish" },
      ],
    },
  },
  "candidate-documents-requested-checklist": {
    slug: "candidate-documents-requested-checklist",
    emoji: "🧾",
    locales: {
      en: {
        navLabel: "Candidate docs",
        title: "Documents HR Requests From Candidates | Doki.help",
        metaDescription:
          "The documents Indonesian HR teams commonly request from candidates, when each is usually asked for, and how they collect them via one link.",
        h1: "Documents HR usually requests from candidates",
        intro:
          "Applying for a job in Indonesia? Employers usually ask for a predictable set of documents — and sensitive ones only after an offer. Here's what to prepare and how HR collects it.",
        ctaPrimary: "Collect these documents via one link",
        groups: [
          {
            h2: "At application (usually enough)",
            items: [
              "CV / résumé",
              "Certificates relevant to the role",
              "SKCK (if requested)",
              "Work references or portfolio",
              "Passport-size photo",
            ],
          },
          {
            h2: "After an offer (sensitive — post-offer)",
            items: [
              "KTP (national ID)",
              "Family card (KK)",
              "Health certificate (surat sehat)",
              "NPWP, bank details, BPJS",
            ],
          },
          {
            h2: "How HR collects it",
            items: [
              "One checklist link — you upload without an account",
              "You see what's complete and what's missing",
              "Your files stay in your control (revocable links)",
            ],
          },
        ],
        faqHeading: "Candidate documents — FAQ",
        faq: [
          { q: "Do I need to upload my KTP to apply?", a: "Usually not at the application stage. Sensitive ID and health documents are typically collected after an offer." },
          { q: "Who sees my documents?", a: "Only the employer you applied to, for that vacancy. Doki does not sell your data." },
          { q: "Do I need an account?", a: "No — you upload via the employer's link without registering. You can save a personal vault afterwards if you want." },
        ],
      },
      id: {
        navLabel: "Dokumen kandidat",
        title: "Dokumen yang Diminta HR dari Kandidat | Doki.help",
        metaDescription:
          "Dokumen yang umum diminta HR dari kandidat, kapan biasanya diminta, dan cara mereka mengumpulkannya lewat satu tautan.",
        h1: "Dokumen yang biasanya diminta HR dari kandidat",
        intro:
          "Melamar kerja di Indonesia? Perusahaan biasanya meminta sejumlah dokumen yang bisa ditebak — dan yang sensitif hanya setelah penawaran. Berikut yang perlu disiapkan dan cara HR mengumpulkannya.",
        ctaPrimary: "Kumpulkan dokumen ini lewat satu tautan",
        groups: [
          {
            h2: "Saat melamar (biasanya cukup)",
            items: [
              "CV / resume",
              "Sertifikat yang relevan dengan posisi",
              "SKCK (jika diminta)",
              "Referensi kerja atau portofolio",
              "Pas foto",
            ],
          },
          {
            h2: "Setelah penawaran (sensitif — pasca-penawaran)",
            items: [
              "KTP",
              "Kartu Keluarga (KK)",
              "Surat sehat",
              "NPWP, rekening bank, BPJS",
            ],
          },
          {
            h2: "Cara HR mengumpulkannya",
            items: [
              "Satu tautan ceklis — Anda unggah tanpa akun",
              "Anda lihat apa yang lengkap dan apa yang kurang",
              "Berkas Anda tetap terkendali (tautan bisa dicabut)",
            ],
          },
        ],
        faqHeading: "Dokumen kandidat — FAQ",
        faq: [
          { q: "Apakah saya perlu unggah KTP untuk melamar?", a: "Biasanya tidak pada tahap lamaran. Dokumen identitas dan kesehatan yang sensitif umumnya dikumpulkan setelah penawaran." },
          { q: "Siapa yang melihat dokumen saya?", a: "Hanya perusahaan tempat Anda melamar, untuk lowongan itu. Doki tidak menjual data Anda." },
          { q: "Apakah saya perlu akun?", a: "Tidak — Anda unggah lewat tautan perusahaan tanpa mendaftar. Anda bisa menyimpan brankas pribadi setelahnya jika mau." },
        ],
      },
      ru: {
        navLabel: "Документы кандидата",
        title: "Какие документы HR запрашивает у кандидата | Doki.help",
        metaDescription:
          "Какие документы индонезийские HR обычно запрашивают у кандидатов, когда именно и как их собирают по одной ссылке.",
        h1: "Какие документы HR обычно запрашивает у кандидата",
        intro:
          "Откликаетесь на работу в Индонезии? Работодатели обычно просят предсказуемый набор документов — а чувствительные только после оффера. Вот что подготовить и как HR это собирает.",
        ctaPrimary: "Собрать эти документы по одной ссылке",
        groups: [
          {
            h2: "На отклике (обычно достаточно)",
            items: [
              "CV / резюме",
              "Сертификаты под роль",
              "SKCK (если просят)",
              "Рекомендации или портфолио",
              "Фото на документы",
            ],
          },
          {
            h2: "После оффера (чувствительное — пост-оффер)",
            items: [
              "KTP",
              "Семейная карта (KK)",
              "Медсправка (surat sehat)",
              "NPWP, реквизиты счёта, BPJS",
            ],
          },
          {
            h2: "Как HR это собирает",
            items: [
              "Одна ссылка-чек-лист — вы загружаете без аккаунта",
              "Видно, что полное, а чего не хватает",
              "Файлы под вашим контролем (отзывные ссылки)",
            ],
          },
        ],
        faqHeading: "Документы кандидата — FAQ",
        faq: [
          { q: "Нужно ли загружать KTP, чтобы откликнуться?", a: "Обычно нет на этапе отклика. Чувствительные ID и мед-документы, как правило, собирают после оффера." },
          { q: "Кто видит мои документы?", a: "Только работодатель, к которому вы откликнулись, и для этой вакансии. Doki не продаёт ваши данные." },
          { q: "Нужен ли аккаунт?", a: "Нет — вы загружаете по ссылке работодателя без регистрации. При желании потом можно сохранить личный сейф." },
        ],
      },
      uz: {
        navLabel: "Nomzod hujjatlari",
        title: "HR nomzoddan qanday hujjatlarni so‘raydi | Doki.help",
        metaDescription:
          "HR nomzoddan odatda qanday hujjatlarni so‘raydi, qachon so‘raladi va ularni bitta havola orqali qanday yig‘adi.",
        h1: "HR nomzoddan odatda qanday hujjatlarni so‘raydi",
        intro:
          "Indoneziyada ishga ariza berayapsizmi? Ish beruvchilar odatda oldindan bilinadigan hujjatlarni so‘raydi — sezgirlarini esa faqat taklifdan keyin. Mana nima tayyorlash kerak va HR buni qanday yig‘adi.",
        ctaPrimary: "Bu hujjatlarni bitta havola orqali yig‘ing",
        groups: [
          {
            h2: "Ariza bosqichida (odatda yetarli)",
            items: [
              "CV / rezyume",
              "Lavozimga oid sertifikatlar",
              "SKCK (so‘ralsa)",
              "Ish tavsiyalari yoki portfolio",
              "Pas foto",
            ],
          },
          {
            h2: "Taklifdan keyin (sezgir — post-offer)",
            items: [
              "KTP",
              "Oila kartasi (KK)",
              "Tibbiy ma’lumotnoma (surat sehat)",
              "NPWP, bank rekvizitlari, BPJS",
            ],
          },
          {
            h2: "HR buni qanday yig‘adi",
            items: [
              "Bitta ro‘yxat-havola — hisobsiz yuklaysiz",
              "Nima to‘liq, nima kamligi ko‘rinadi",
              "Fayllaringiz nazoratingizda (bekor qilinadigan havolalar)",
            ],
          },
        ],
        faqHeading: "Nomzod hujjatlari — FAQ",
        faq: [
          { q: "Ariza berish uchun KTP yuklashim kerakmi?", a: "Odatda ariza bosqichida shart emas. Sezgir shaxs va sog‘liq hujjatlari odatda taklifdan keyin yig‘iladi." },
          { q: "Hujjatlarimni kim ko‘radi?", a: "Faqat siz ariza bergan ish beruvchi, o‘sha vakansiya uchun. Doki ma’lumotlaringizni sotmaydi." },
          { q: "Menga hisob kerakmi?", a: "Yo‘q — ish beruvchi havolasi orqali ro‘yxatdan o‘tmasdan yuklaysiz. Xohlasangiz, keyin shaxsiy seyf saqlashingiz mumkin." },
        ],
      },
    },
    related: {
      en: [
        { href: "/for/job-seekers", label: "For job seekers" },
        { href: "/checklists/skck-checklist", label: "SKCK checklist" },
        { href: "/security", label: "How your documents are protected" },
      ],
      id: [
        { href: "/for/job-seekers", label: "Untuk pencari kerja" },
        { href: "/checklists/skck-checklist", label: "Ceklis SKCK" },
        { href: "/security", label: "Cara dokumen Anda dilindungi" },
      ],
      ru: [
        { href: "/for/job-seekers", label: "Для соискателей" },
        { href: "/checklists/skck-checklist", label: "Чек-лист SKCK" },
        { href: "/security", label: "Как защищены документы" },
      ],
      uz: [
        { href: "/for/job-seekers", label: "Ish izlovchilar uchun" },
        { href: "/checklists/skck-checklist", label: "SKCK ro‘yxati" },
        { href: "/security", label: "Hujjatlaringiz qanday himoyalanadi" },
      ],
    },
  },
  "villa-staff-documents-checklist": {
    slug: "villa-staff-documents-checklist",
    emoji: "🏝️",
    locales: {
      en: {
        navLabel: "Villa staff docs",
        title: "Villa Staff Document Checklist (Bali) | Doki.help",
        metaDescription:
          "Documents commonly collected when hiring villa staff in Bali — housekeeping, pool, garden, security — and how to collect them from one link.",
        h1: "Villa staff document checklist",
        intro:
          "Hiring villa staff in Bali means frequent turnover and repeated document collection. This checklist covers what employers usually gather and how to collect it cleanly from one link.",
        ctaPrimary: "Collect these documents via one link",
        groups: [
          {
            h2: "Commonly collected",
            items: ["CV or work history", "SKCK (police record)", "Health certificate (surat sehat)", "Work references", "Passport-size photo"],
          },
          {
            h2: "Collect it cleanly",
            items: ["Start from the villa-staff pack template", "Send each candidate one link — no account needed", "See a “complete / missing” status per person"],
          },
        ],
        faqHeading: "Villa staff documents — FAQ",
        faq: [
          { q: "Do I collect KTP at the application stage?", a: "ID and health documents are best collected after an offer; Doki defers them to the post-offer stage by default." },
          { q: "Can I reuse the checklist for seasonal hiring?", a: "Yes — the same checklist link works for each new candidate." },
        ],
      },
      id: {
        navLabel: "Dokumen staf vila",
        title: "Ceklis Dokumen Staf Vila (Bali) | Doki.help",
        metaDescription:
          "Dokumen yang umum dikumpulkan saat merekrut staf vila di Bali — housekeeping, kolam, taman, keamanan — dan cara mengumpulkannya dari satu tautan.",
        h1: "Ceklis dokumen staf vila",
        intro:
          "Merekrut staf vila di Bali berarti pergantian sering dan pengumpulan dokumen berulang. Ceklis ini merangkum yang biasa dikumpulkan dan cara mengumpulkannya rapi dari satu tautan.",
        ctaPrimary: "Kumpulkan dokumen ini lewat satu tautan",
        groups: [
          {
            h2: "Umum dikumpulkan",
            items: ["CV atau riwayat kerja", "SKCK", "Surat sehat", "Referensi kerja", "Pas foto"],
          },
          {
            h2: "Kumpulkan dengan rapi",
            items: ["Mulai dari template paket staf vila", "Kirim tiap kandidat satu tautan — tanpa akun", "Lihat status “lengkap / kurang” per orang"],
          },
        ],
        faqHeading: "Dokumen staf vila — FAQ",
        faq: [
          { q: "Apakah KTP dikumpulkan saat lamaran?", a: "Dokumen identitas dan kesehatan sebaiknya dikumpulkan setelah penawaran; Doki menundanya ke tahap pasca-penawaran secara bawaan." },
          { q: "Bisakah ceklisnya dipakai ulang untuk rekrutmen musiman?", a: "Bisa — tautan ceklis yang sama berlaku untuk tiap kandidat baru." },
        ],
      },
      ru: {
        navLabel: "Документы персонала виллы",
        title: "Чек-лист документов персонала виллы | Doki.help",
        metaDescription:
          "Документы, которые обычно собирают при найме персонала виллы на Бали, и как собрать их по одной ссылке.",
        h1: "Чек-лист документов персонала виллы",
        intro:
          "Найм персонала виллы на Бали — это частая текучка и повторный сбор документов. Чек-лист собирает то, что обычно нужно, и как аккуратно собрать по одной ссылке.",
        ctaPrimary: "Собрать эти документы по одной ссылке",
        groups: [
          {
            h2: "Обычно собирают",
            items: ["CV или опыт работы", "SKCK", "Медсправка (surat sehat)", "Рекомендации", "Фото на документы"],
          },
          {
            h2: "Соберите аккуратно",
            items: ["Начните с шаблона пака «персонал виллы»", "Отправьте каждому одну ссылку — без аккаунта", "Статус «полный / не хватает» по каждому"],
          },
        ],
        faqHeading: "Документы персонала виллы — FAQ",
        faq: [
          { q: "Собирать ли KTP на этапе отклика?", a: "ID и мед-документы лучше собирать после оффера; Doki по умолчанию откладывает их на пост-оффер." },
          { q: "Можно использовать чек-лист для сезонного найма?", a: "Да — одна и та же ссылка работает для каждого нового кандидата." },
        ],
      },
      uz: {
        navLabel: "Villa xodimi hujjatlari",
        title: "Villa xodimi hujjatlari ro‘yxati | Doki.help",
        metaDescription:
          "Balida villa xodimini yollashda odatda yig‘iladigan hujjatlar va ularni bitta havoladan yig‘ish.",
        h1: "Villa xodimi hujjatlari ro‘yxati",
        intro:
          "Balida villa xodimini yollash — tez almashuv va hujjatlarni qayta yig‘ish demakdir. Bu ro‘yxatda odatda nima yig‘ilishi va uni bitta havoladan tartibli yig‘ish keltirilgan.",
        ctaPrimary: "Bu hujjatlarni bitta havola orqali yig‘ing",
        groups: [
          {
            h2: "Odatda yig‘iladi",
            items: ["CV yoki ish tarixi", "SKCK", "Tibbiy ma’lumotnoma", "Ish tavsiyalari", "Pas foto"],
          },
          {
            h2: "Tartibli yig‘ing",
            items: ["Villa xodimi paket shablonidan boshlang", "Har bir nomzodga bitta havola — hisobsiz", "Har bir odam bo‘yicha “to‘liq / kam” statusi"],
          },
        ],
        faqHeading: "Villa xodimi hujjatlari — FAQ",
        faq: [
          { q: "KTP ariza bosqichida yig‘iladimi?", a: "Shaxs va sog‘liq hujjatlarini taklifdan keyin yig‘gan ma’qul; Doki ularni sukut bo‘yicha post-offer bosqichiga qoldiradi." },
          { q: "Ro‘yxatni mavsumiy yollash uchun qayta ishlatsa bo‘ladimi?", a: "Ha — bir xil havola har bir yangi nomzod uchun ishlaydi." },
        ],
      },
    },
    related: {
      en: [
        { href: "/for/hospitality", label: "For hospitality employers" },
        { href: "/checklists/skck-checklist", label: "SKCK checklist" },
        { href: "/candidate-document-collection", label: "Collect candidate documents" },
      ],
      id: [
        { href: "/for/hospitality", label: "Untuk pemberi kerja hospitality" },
        { href: "/checklists/skck-checklist", label: "Ceklis SKCK" },
        { href: "/candidate-document-collection", label: "Kumpulkan dokumen kandidat" },
      ],
      ru: [
        { href: "/for/hospitality", label: "Для hospitality-работодателей" },
        { href: "/checklists/skck-checklist", label: "Чек-лист SKCK" },
        { href: "/candidate-document-collection", label: "Сбор документов кандидатов" },
      ],
      uz: [
        { href: "/for/hospitality", label: "Hospitality ish beruvchilari uchun" },
        { href: "/checklists/skck-checklist", label: "SKCK ro‘yxati" },
        { href: "/candidate-document-collection", label: "Nomzod hujjatlarini yig‘ish" },
      ],
    },
  },
  "driver-documents-checklist": {
    slug: "driver-documents-checklist",
    emoji: "🚗",
    locales: {
      en: {
        navLabel: "Driver docs",
        title: "Driver Document Checklist for Hiring | Doki.help",
        metaDescription:
          "Documents commonly collected when hiring a driver in Indonesia — SIM, CV, SKCK, references — and how to collect them from one link.",
        h1: "Driver document checklist for hiring",
        intro:
          "Hiring a driver usually starts with the SIM (driving licence) and a few supporting documents. This checklist covers what employers typically collect and how to gather it cleanly.",
        ctaPrimary: "Collect these documents via one link",
        groups: [
          {
            h2: "Commonly collected",
            items: ["SIM (driving licence) — the right class", "CV or driving experience", "SKCK (police record)", "Work references", "Passport-size photo"],
          },
          {
            h2: "Collect it cleanly",
            items: ["Start from the driver pack template", "Send one link — the candidate uploads without an account", "Set a reminder before the SIM expires"],
          },
        ],
        faqHeading: "Driver documents — FAQ",
        faq: [
          { q: "Which SIM class do I need?", a: "It depends on the vehicle. Ask the candidate for the class on their SIM and confirm against the role." },
          { q: "When do I collect KTP?", a: "ID documents are best collected after an offer; Doki defers them to the post-offer stage by default." },
        ],
      },
      id: {
        navLabel: "Dokumen sopir",
        title: "Ceklis Dokumen Sopir untuk Rekrutmen | Doki.help",
        metaDescription:
          "Dokumen yang umum dikumpulkan saat merekrut sopir di Indonesia — SIM, CV, SKCK, referensi — dan cara mengumpulkannya dari satu tautan.",
        h1: "Ceklis dokumen sopir untuk rekrutmen",
        intro:
          "Merekrut sopir biasanya dimulai dari SIM dan beberapa dokumen pendukung. Ceklis ini merangkum yang biasa dikumpulkan dan cara mengumpulkannya dengan rapi.",
        ctaPrimary: "Kumpulkan dokumen ini lewat satu tautan",
        groups: [
          {
            h2: "Umum dikumpulkan",
            items: ["SIM — kelas yang sesuai", "CV atau pengalaman menyetir", "SKCK", "Referensi kerja", "Pas foto"],
          },
          {
            h2: "Kumpulkan dengan rapi",
            items: ["Mulai dari template paket sopir", "Kirim satu tautan — kandidat unggah tanpa akun", "Pasang pengingat sebelum SIM kedaluwarsa"],
          },
        ],
        faqHeading: "Dokumen sopir — FAQ",
        faq: [
          { q: "SIM kelas apa yang dibutuhkan?", a: "Tergantung kendaraannya. Tanyakan kelas SIM kandidat dan cocokkan dengan posisi." },
          { q: "Kapan mengumpulkan KTP?", a: "Dokumen identitas sebaiknya dikumpulkan setelah penawaran; Doki menundanya ke tahap pasca-penawaran secara bawaan." },
        ],
      },
      ru: {
        navLabel: "Документы водителя",
        title: "Чек-лист документов водителя для найма | Doki.help",
        metaDescription:
          "Документы, которые обычно собирают при найме водителя в Индонезии — SIM, CV, SKCK, рекомендации — и как собрать по одной ссылке.",
        h1: "Чек-лист документов водителя для найма",
        intro:
          "Найм водителя обычно начинается с SIM (прав) и нескольких сопроводительных документов. Чек-лист собирает то, что обычно нужно, и как аккуратно собрать.",
        ctaPrimary: "Собрать эти документы по одной ссылке",
        groups: [
          {
            h2: "Обычно собирают",
            items: ["SIM (права) — нужной категории", "CV или водительский опыт", "SKCK", "Рекомендации", "Фото на документы"],
          },
          {
            h2: "Соберите аккуратно",
            items: ["Начните с шаблона пака «водитель»", "Отправьте одну ссылку — загрузка без аккаунта", "Напоминание до истечения SIM"],
          },
        ],
        faqHeading: "Документы водителя — FAQ",
        faq: [
          { q: "Какая категория SIM нужна?", a: "Зависит от транспорта. Спросите у кандидата категорию в SIM и сверьте с ролью." },
          { q: "Когда собирать KTP?", a: "ID лучше собирать после оффера; Doki по умолчанию откладывает их на пост-оффер." },
        ],
      },
      uz: {
        navLabel: "Haydovchi hujjatlari",
        title: "Yollash uchun haydovchi hujjatlari ro‘yxati | Doki.help",
        metaDescription:
          "Indoneziyada haydovchi yollashda odatda yig‘iladigan hujjatlar — SIM, CV, SKCK, tavsiyalar — va ularni bitta havoladan yig‘ish.",
        h1: "Yollash uchun haydovchi hujjatlari ro‘yxati",
        intro:
          "Haydovchi yollash odatda SIM (guvohnoma) va bir nechta yordamchi hujjatdan boshlanadi. Bu ro‘yxatda odatda nima yig‘ilishi va uni tartibli yig‘ish keltirilgan.",
        ctaPrimary: "Bu hujjatlarni bitta havola orqali yig‘ing",
        groups: [
          {
            h2: "Odatda yig‘iladi",
            items: ["SIM — mos toifadagi", "CV yoki haydash tajribasi", "SKCK", "Ish tavsiyalari", "Pas foto"],
          },
          {
            h2: "Tartibli yig‘ing",
            items: ["Haydovchi paket shablonidan boshlang", "Bitta havola yuboring — hisobsiz yuklash", "SIM muddati tugashidan oldin eslatma"],
          },
        ],
        faqHeading: "Haydovchi hujjatlari — FAQ",
        faq: [
          { q: "Qaysi toifadagi SIM kerak?", a: "Transportga bog‘liq. Nomzoddan SIM toifasini so‘rang va lavozimga solishtiring." },
          { q: "KTP ni qachon yig‘aman?", a: "Shaxs hujjatlarini taklifdan keyin yig‘gan ma’qul; Doki ularni sukut bo‘yicha post-offer bosqichiga qoldiradi." },
        ],
      },
    },
    related: {
      en: [
        { href: "/for/hospitality", label: "For hospitality employers" },
        { href: "/for/recruitment-agencies", label: "For recruiting agencies" },
        { href: "/candidate-document-collection", label: "Collect candidate documents" },
      ],
      id: [
        { href: "/for/hospitality", label: "Untuk pemberi kerja hospitality" },
        { href: "/for/recruitment-agencies", label: "Untuk agensi rekrutmen" },
        { href: "/candidate-document-collection", label: "Kumpulkan dokumen kandidat" },
      ],
      ru: [
        { href: "/for/hospitality", label: "Для hospitality-работодателей" },
        { href: "/for/recruitment-agencies", label: "Для рекрутинговых агентств" },
        { href: "/candidate-document-collection", label: "Сбор документов кандидатов" },
      ],
      uz: [
        { href: "/for/hospitality", label: "Hospitality ish beruvchilari uchun" },
        { href: "/for/recruitment-agencies", label: "Rekruting agentliklari uchun" },
        { href: "/candidate-document-collection", label: "Nomzod hujjatlarini yig‘ish" },
      ],
    },
  },
};

export const CHECKLIST_KEYS = Object.keys(DATA);

export function getChecklist(slug: string): Checklist | undefined {
  return DATA[slug];
}

export async function checklistMetadata(slug: string): Promise<Metadata> {
  const c = getChecklist(slug);
  if (!c) return {};
  const locale = await getLocale();
  const t = c.locales[locale] ?? c.locales.en;
  return {
    title: t.title,
    description: t.metaDescription,
    alternates: await altLangs(),
    openGraph: {
      title: t.title,
      description: t.metaDescription,
      url: `${APP_URL}/${locale}/checklists/${slug}`,
    },
  };
}

/** Ссылки на чеклисты для внутренней перелинковки. */
export function checklistLinks(locale: Locale) {
  return CHECKLIST_KEYS.map((key) => ({
    key,
    emoji: DATA[key].emoji,
    label: DATA[key].locales[locale].navLabel,
  }));
}

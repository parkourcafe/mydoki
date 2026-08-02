import "server-only";
import type { Metadata } from "next";
import type { Locale } from "./i18n";
import { getLocale } from "./i18n";
import { altLangs } from "./seo";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://www.doki.help";

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
            a: "Set a “valid until” date on each passport, visa and insurance policy, and a reminder arrives by email before it expires. The reminder comes 30, 7 and 1 day before that date.",
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
            a: "Укажите дату «действует до» для каждого паспорта, визы и страховки — напоминание придёт на email заранее. Напоминание приходит за 30, 7 и 1 день до этой даты.",
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
            a: "Pasang tanggal “berlaku sampai” pada tiap paspor, visa, dan polis asuransi, dan pengingat tiba lewat email sebelum kedaluwarsa. Pengingat datang 30, 7, dan 1 hari sebelum tanggal itu.",
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
            a: "Har bir pasport, viza va sugʻurta polisiga “amal qiladi” sanasini qoʻying — eslatma muddat tugashidan oldin email orqali keladi. Eslatma shu sanadan 30, 7 va 1 kun oldin keladi.",
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
            a: "Yes. Set a “valid until” date on each child's passport and a reminder arrives by email before it expires. The reminder comes 30, 7 and 1 day before that date.",
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
            a: "Да. Укажите дату «действует до» для паспорта каждого ребёнка — напоминание придёт на email заранее. Напоминание приходит за 30, 7 и 1 день до этой даты.",
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
            a: "Bisa. Pasang tanggal “berlaku sampai” pada paspor tiap anak, dan pengingat tiba lewat email sebelum kedaluwarsa. Pengingat datang 30, 7, dan 1 hari sebelum tanggal itu.",
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
            a: "Ha. Har bir bola pasportiga “amal qiladi” sanasini qoʻying — eslatma muddat tugashidan oldin email orqali keladi. Eslatma shu sanadan 30, 7 va 1 kun oldin keladi.",
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
          {
            q: "When does an SKCK need renewing?",
            a: "An SKCK has a limited validity period. Record the issue date when you collect it and set a reminder — email goes out 30, 7 and 1 day before the date you set. Check the exact validity on the official SKCK portal.",
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
          {
            q: "Kapan SKCK harus diperpanjang?",
            a: "SKCK punya masa berlaku terbatas. Catat tanggal terbitnya saat mengumpulkan berkas, lalu pasang pengingat — sistem mengirim email 30, 7, dan 1 hari sebelum tanggal yang Anda tetapkan. Masa berlaku persisnya cek di portal SKCK resmi.",
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
          {
            q: "Когда нужно продлевать SKCK?",
            a: "У SKCK ограниченный срок действия. Зафиксируйте дату выдачи при сборе и поставьте напоминание — письмо придёт за 30, 7 и 1 день до указанной даты. Точный срок уточняйте на официальном портале SKCK.",
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
          {
            q: "SKCK qachon yangilanishi kerak?",
            a: "SKCK amal qilish muddati cheklangan. Yig‘ish paytida berilgan sanani qayd eting va eslatma qo‘ying — xat siz belgilagan sanadan 30, 7 va 1 kun oldin keladi. Aniq muddatni rasmiy SKCK portalidan tekshiring.",
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
          {
            q: "How do I track KITAS and passport expiry for staff?",
            a: "Store the validity date alongside the document and set a reminder: email goes out 30, 7 and 1 day before it. For passports, many countries require a minimum remaining validity — check official immigration requirements before travel or renewal.",
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
          {
            q: "Bagaimana melacak masa berlaku KITAS dan paspor karyawan?",
            a: "Simpan tanggal berlakunya bersama berkasnya, lalu pasang pengingat: email dikirim 30, 7, dan 1 hari sebelum tanggal itu. Untuk paspor, banyak negara meminta sisa masa berlaku tertentu — cek syarat resmi imigrasi sebelum perjalanan atau perpanjangan.",
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
          {
            q: "Как отслеживать сроки KITAS и паспортов сотрудников?",
            a: "Сохраните дату действия вместе с документом и поставьте напоминание: письмо придёт за 30, 7 и 1 день. По паспортам многие страны требуют минимальный остаточный срок — сверяйтесь с официальными требованиями иммиграционной службы.",
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
          {
            q: "Xodimlarning KITAS va pasport muddatini qanday kuzatish mumkin?",
            a: "Amal qilish sanasini hujjat bilan birga saqlang va eslatma qo‘ying: xat 30, 7 va 1 kun oldin keladi. Pasportlar bo‘yicha ko‘p davlatlar minimal qolgan muddatni talab qiladi — rasmiy migratsiya talablarini tekshiring.",
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
          {
            q: "Which administrative documents must an employer keep?",
            a: "Retention duties for employment records are set by regulation and vary by business type. This checklist covers what's commonly collected; for binding legal obligations, check with Disnaker or your legal adviser.",
          },
          {
            q: "Is the employment contract part of the onboarding pack?",
            a: "Yes — the signed employment agreement is normally collected alongside the other onboarding documents. What the contract itself must contain is best drafted with your legal adviser.",
          },
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
          {
            q: "Dokumen administrasi apa yang wajib disimpan perusahaan?",
            a: "Kewajiban penyimpanan dokumen ketenagakerjaan diatur peraturan dan bisa berbeda menurut jenis usaha. Ceklis ini menyusun apa yang biasanya dikumpulkan; untuk kewajiban hukum yang mengikat, cek ke Disnaker atau konsultan hukum Anda.",
          },
          {
            q: "Apakah kontrak kerja termasuk yang dikumpulkan saat onboarding?",
            a: "Ya — perjanjian kerja yang sudah ditandatangani biasanya menjadi bagian dari berkas onboarding, bersama dokumen pendukung lain. Isi dan bentuk kontraknya sendiri sebaiknya disusun bersama penasihat hukum Anda.",
          },
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
          {
            q: "Какие административные документы обязан хранить работодатель?",
            a: "Сроки хранения кадровых документов устанавливаются регулированием и различаются по типу бизнеса. Этот чек-лист описывает, что собирают обычно; по обязательным требованиям сверяйтесь с Disnaker или юристом.",
          },
          {
            q: "Входит ли трудовой договор в пакет онбординга?",
            a: "Да — подписанный трудовой договор обычно собирается вместе с остальными документами онбординга. Содержание самого договора лучше готовить с юристом.",
          },
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
          {
            q: "Ish beruvchi qanday ma’muriy hujjatlarni saqlashi shart?",
            a: "Kadr hujjatlarini saqlash muddatlari qonunchilik bilan belgilanadi va biznes turiga qarab farq qiladi. Bu ro‘yxat odatda nima yig‘ilishini ko‘rsatadi; majburiy talablar bo‘yicha Disnaker yoki yuristdan tekshiring.",
          },
          {
            q: "Mehnat shartnomasi onboarding to‘plamiga kiradimi?",
            a: "Ha — imzolangan mehnat shartnomasi odatda boshqa onboarding hujjatlari bilan birga yig‘iladi. Shartnomaning mazmunini esa yurist bilan tayyorlagan ma’qul.",
          },
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
          {
            q: "Which identity documents are usually requested?",
            a: "At the application stage a CV and job-related documents are usually enough. Identity documents such as a national ID are normally only needed after an offer — not from every applicant.",
          },
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
          {
            q: "Dokumen identitas apa saja yang biasanya diminta?",
            a: "Untuk lamaran awal biasanya cukup CV dan berkas terkait pekerjaan. Dokumen identitas seperti KTP umumnya baru diperlukan setelah ada penawaran kerja — bukan dari setiap pelamar.",
          },
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
          {
            q: "Какие документы, удостоверяющие личность, обычно запрашивают?",
            a: "На этапе отклика обычно достаточно резюме и документов по работе. Удостоверение личности, как правило, нужно только после оффера, а не от каждого откликнувшегося.",
          },
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
          {
            q: "Odatda qanday shaxsni tasdiqlovchi hujjatlar so‘raladi?",
            a: "Ariza bosqichida odatda rezyume va ish bilan bog‘liq hujjatlar yetarli. Guvohnoma kabi hujjatlar odatda faqat taklifdan keyin kerak bo‘ladi, har bir arizachidan emas.",
          },
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
  "hospitality-hiring-checklist": {
    slug: "hospitality-hiring-checklist",
    emoji: "🍽️",
    locales: {
      en: {
        navLabel: "Hospitality hiring",
        title: "Hospitality Hiring Document Checklist | Doki.help",
        metaDescription:
          "Documents commonly collected when hiring restaurant, cafe and hotel staff in Indonesia, and how to collect them from one link.",
        h1: "Hospitality hiring document checklist",
        intro:
          "Restaurants, cafes and hotels hire often and shift-based. This checklist covers the documents usually collected for F&B and front-of-house roles and how to gather them without WhatsApp chaos.",
        ctaPrimary: "Collect these documents via one link",
        groups: [
          { h2: "Commonly collected", items: ["CV or work history", "Certificates (food handling, hospitality)", "SKCK (if requested)", "Work references", "Passport-size photo"] },
          { h2: "Collect it cleanly", items: ["Start from an F&B / receptionist pack template", "One link per candidate — no account", "“Complete / missing” status per person"] },
        ],
        faqHeading: "Hospitality hiring — FAQ",
        faq: [
          { q: "Do I need a health certificate?", a: "Many F&B roles ask for one; collect it after an offer. Confirm requirements locally." },
          { q: "Can I hire in batches?", a: "Yes — one checklist link works for many candidates at once." },
        ],
      },
      id: {
        navLabel: "Rekrutmen hospitality",
        title: "Ceklis Dokumen Rekrutmen Hospitality | Doki.help",
        metaDescription:
          "Dokumen yang umum dikumpulkan saat merekrut staf restoran, kafe, dan hotel di Indonesia, dan cara mengumpulkannya dari satu tautan.",
        h1: "Ceklis dokumen rekrutmen hospitality",
        intro:
          "Restoran, kafe, dan hotel sering merekrut dan berbasis shift. Ceklis ini merangkum dokumen yang biasa dikumpulkan untuk peran F&B dan front-of-house dan cara mengumpulkannya tanpa ribet di WhatsApp.",
        ctaPrimary: "Kumpulkan dokumen ini lewat satu tautan",
        groups: [
          { h2: "Umum dikumpulkan", items: ["CV atau riwayat kerja", "Sertifikat (food handling, perhotelan)", "SKCK (jika diminta)", "Referensi kerja", "Pas foto"] },
          { h2: "Kumpulkan dengan rapi", items: ["Mulai dari template paket F&B / resepsionis", "Satu tautan per kandidat — tanpa akun", "Status “lengkap / kurang” per orang"] },
        ],
        faqHeading: "Rekrutmen hospitality — FAQ",
        faq: [
          { q: "Apakah perlu surat sehat?", a: "Banyak peran F&B memintanya; kumpulkan setelah penawaran. Konfirmasikan syaratnya secara lokal." },
          { q: "Bisakah merekrut secara batch?", a: "Bisa — satu tautan ceklis berlaku untuk banyak kandidat sekaligus." },
        ],
      },
      ru: {
        navLabel: "Найм в hospitality",
        title: "Чек-лист документов найма в hospitality | Doki.help",
        metaDescription:
          "Документы, которые обычно собирают при найме персонала ресторанов, кафе и отелей в Индонезии, и как собрать по одной ссылке.",
        h1: "Чек-лист документов найма в hospitality",
        intro:
          "Рестораны, кафе и отели нанимают часто и посменно. Чек-лист собирает документы для F&B и front-of-house и как их получить без хаоса в WhatsApp.",
        ctaPrimary: "Собрать эти документы по одной ссылке",
        groups: [
          { h2: "Обычно собирают", items: ["CV или опыт работы", "Сертификаты (food handling, hospitality)", "SKCK (если просят)", "Рекомендации", "Фото на документы"] },
          { h2: "Соберите аккуратно", items: ["Начните с шаблона пака F&B / ресепшн", "Одна ссылка на кандидата — без аккаунта", "Статус «полный / не хватает»"] },
        ],
        faqHeading: "Найм в hospitality — FAQ",
        faq: [
          { q: "Нужна ли медсправка?", a: "Многие F&B-роли её просят; собирайте после оффера. Уточните требования на месте." },
          { q: "Можно нанимать пачками?", a: "Да — одна ссылка-чек-лист работает сразу для многих кандидатов." },
        ],
      },
      uz: {
        navLabel: "Hospitality yollash",
        title: "Hospitality yollash hujjatlari ro‘yxati | Doki.help",
        metaDescription:
          "Indoneziyada restoran, kafe va mehmonxona xodimlarini yollashda odatda yig‘iladigan hujjatlar va ularni bitta havoladan yig‘ish.",
        h1: "Hospitality yollash hujjatlari ro‘yxati",
        intro:
          "Restoran, kafe va mehmonxonalar tez-tez va smenali yollaydi. Bu ro‘yxatda F&B va front-of-house rollari uchun odatda yig‘iladigan hujjatlar va ularni WhatsAppda tartibsizliksiz yig‘ish keltirilgan.",
        ctaPrimary: "Bu hujjatlarni bitta havola orqali yig‘ing",
        groups: [
          { h2: "Odatda yig‘iladi", items: ["CV yoki ish tarixi", "Sertifikatlar (food handling, mehmondo‘stlik)", "SKCK (so‘ralsa)", "Ish tavsiyalari", "Pas foto"] },
          { h2: "Tartibli yig‘ing", items: ["F&B / resepsionist paket shablonidan boshlang", "Har bir nomzodga bitta havola — hisobsiz", "Har bir odam bo‘yicha “to‘liq / kam” statusi"] },
        ],
        faqHeading: "Hospitality yollash — FAQ",
        faq: [
          { q: "Tibbiy ma’lumotnoma kerakmi?", a: "Ko‘p F&B rollari uni so‘raydi; taklifdan keyin yig‘ing. Talablarni joyida tasdiqlang." },
          { q: "Partiyalab yollasa bo‘ladimi?", a: "Ha — bitta ro‘yxat-havola bir vaqtda ko‘p nomzod uchun ishlaydi." },
        ],
      },
    },
    related: {
      en: [
        { href: "/for/hospitality", label: "For hospitality employers" },
        { href: "/checklists/villa-staff-documents-checklist", label: "Villa staff checklist" },
        { href: "/candidate-document-collection", label: "Collect candidate documents" },
      ],
      id: [
        { href: "/for/hospitality", label: "Untuk pemberi kerja hospitality" },
        { href: "/checklists/villa-staff-documents-checklist", label: "Ceklis staf vila" },
        { href: "/candidate-document-collection", label: "Kumpulkan dokumen kandidat" },
      ],
      ru: [
        { href: "/for/hospitality", label: "Для hospitality-работодателей" },
        { href: "/checklists/villa-staff-documents-checklist", label: "Чек-лист персонала виллы" },
        { href: "/candidate-document-collection", label: "Сбор документов кандидатов" },
      ],
      uz: [
        { href: "/for/hospitality", label: "Hospitality ish beruvchilari uchun" },
        { href: "/checklists/villa-staff-documents-checklist", label: "Villa xodimi ro‘yxati" },
        { href: "/candidate-document-collection", label: "Nomzod hujjatlarini yig‘ish" },
      ],
    },
  },
  "domestic-worker-documents-checklist": {
    slug: "domestic-worker-documents-checklist",
    emoji: "🏠",
    locales: {
      en: {
        navLabel: "Domestic worker docs",
        title: "Domestic Worker (ART) Document Checklist | Doki.help",
        metaDescription:
          "Documents commonly collected when hiring a domestic worker (ART/PRT) in Indonesia, and how to collect them respectfully from one link.",
        h1: "Domestic worker (ART) document checklist",
        intro:
          "Hiring a domestic worker (ART/PRT) usually involves a few key documents and trust on both sides. This checklist covers what's commonly collected and how to gather it in one place.",
        ctaPrimary: "Collect these documents via one link",
        groups: [
          { h2: "Commonly collected", items: ["CV or work history", "SKCK (police record)", "Health certificate (surat sehat)", "Work references", "Passport-size photo"] },
          { h2: "Collect it respectfully", items: ["One link — the worker uploads without an account", "ID documents collected after agreement, not upfront", "Files stay in your control (revocable links)"] },
        ],
        faqHeading: "Domestic worker documents — FAQ",
        faq: [
          { q: "Is SKCK required?", a: "Many households ask for it, but it's not universal. Agree with the worker and confirm current SKCK rules with Polri." },
          { q: "Where are the documents stored?", a: "In secure cloud infrastructure; servers may be located outside Indonesia — see the Privacy Policy." },
        ],
      },
      id: {
        navLabel: "Dokumen ART",
        title: "Ceklis Dokumen ART / PRT | Doki.help",
        metaDescription:
          "Dokumen yang umum dikumpulkan saat merekrut asisten rumah tangga (ART/PRT) di Indonesia, dan cara mengumpulkannya dengan sopan dari satu tautan.",
        h1: "Ceklis dokumen ART / PRT",
        intro:
          "Merekrut asisten rumah tangga (ART/PRT) biasanya melibatkan beberapa dokumen penting dan rasa saling percaya. Ceklis ini merangkum yang biasa dikumpulkan dan cara mengumpulkannya di satu tempat.",
        ctaPrimary: "Kumpulkan dokumen ini lewat satu tautan",
        groups: [
          { h2: "Umum dikumpulkan", items: ["CV atau riwayat kerja", "SKCK", "Surat sehat", "Referensi kerja", "Pas foto"] },
          { h2: "Kumpulkan dengan sopan", items: ["Satu tautan — pekerja unggah tanpa akun", "Dokumen identitas dikumpulkan setelah kesepakatan, bukan di awal", "Berkas tetap terkendali (tautan bisa dicabut)"] },
        ],
        faqHeading: "Dokumen ART — FAQ",
        faq: [
          { q: "Apakah SKCK wajib?", a: "Banyak keluarga memintanya, tapi tidak universal. Sepakati dengan pekerja dan cek aturan SKCK terbaru di Polri." },
          { q: "Di mana dokumen disimpan?", a: "Di infrastruktur cloud aman; server dapat berada di luar Indonesia — lihat Kebijakan Privasi." },
        ],
      },
      ru: {
        navLabel: "Документы ART",
        title: "Чек-лист документов ART / PRT | Doki.help",
        metaDescription:
          "Документы, которые обычно собирают при найме домашнего работника (ART/PRT) в Индонезии, и как собрать по одной ссылке уважительно.",
        h1: "Чек-лист документов ART / PRT",
        intro:
          "Найм домашнего работника (ART/PRT) обычно включает несколько ключевых документов и взаимное доверие. Чек-лист собирает то, что обычно нужно, и как получить в одном месте.",
        ctaPrimary: "Собрать эти документы по одной ссылке",
        groups: [
          { h2: "Обычно собирают", items: ["CV или опыт работы", "SKCK", "Медсправка (surat sehat)", "Рекомендации", "Фото на документы"] },
          { h2: "Соберите уважительно", items: ["Одна ссылка — работник загружает без аккаунта", "ID собираются после договорённости, не сразу", "Файлы под вашим контролем (отзывные ссылки)"] },
        ],
        faqHeading: "Документы ART — FAQ",
        faq: [
          { q: "Обязателен ли SKCK?", a: "Многие семьи просят его, но не всегда. Договоритесь с работником и уточните актуальные правила SKCK в Polri." },
          { q: "Где хранятся документы?", a: "В защищённой облачной инфраструктуре; серверы могут быть за пределами Индонезии — см. Политику конфиденциальности." },
        ],
      },
      uz: {
        navLabel: "ART hujjatlari",
        title: "Uy xodimi (ART) hujjatlari ro‘yxati | Doki.help",
        metaDescription:
          "Indoneziyada uy xodimini (ART/PRT) yollashda odatda yig‘iladigan hujjatlar va ularni bitta havoladan hurmat bilan yig‘ish.",
        h1: "Uy xodimi (ART) hujjatlari ro‘yxati",
        intro:
          "Uy xodimini (ART/PRT) yollash odatda bir nechta muhim hujjat va o‘zaro ishonchni o‘z ichiga oladi. Bu ro‘yxatda odatda nima yig‘ilishi va uni bir joyda yig‘ish keltirilgan.",
        ctaPrimary: "Bu hujjatlarni bitta havola orqali yig‘ing",
        groups: [
          { h2: "Odatda yig‘iladi", items: ["CV yoki ish tarixi", "SKCK", "Tibbiy ma’lumotnoma", "Ish tavsiyalari", "Pas foto"] },
          { h2: "Hurmat bilan yig‘ing", items: ["Bitta havola — xodim hisobsiz yuklaydi", "Shaxs hujjatlari kelishuvdan keyin yig‘iladi, boshida emas", "Fayllar nazoratingizda (bekor qilinadigan havolalar)"] },
        ],
        faqHeading: "ART hujjatlari — FAQ",
        faq: [
          { q: "SKCK majburiymi?", a: "Ko‘p oilalar so‘raydi, lekin universal emas. Xodim bilan kelishing va SKCK qoidalarini Polri da tekshiring." },
          { q: "Hujjatlar qayerda saqlanadi?", a: "Xavfsiz bulut infratuzilmasida; serverlar Indoneziyadan tashqarida bo‘lishi mumkin — Maxfiylik siyosatiga qarang." },
        ],
      },
    },
    related: {
      en: [
        { href: "/for/families", label: "For families" },
        { href: "/checklists/skck-checklist", label: "SKCK checklist" },
        { href: "/security", label: "How your documents are protected" },
      ],
      id: [
        { href: "/for/families", label: "Untuk keluarga" },
        { href: "/checklists/skck-checklist", label: "Ceklis SKCK" },
        { href: "/security", label: "Cara dokumen Anda dilindungi" },
      ],
      ru: [
        { href: "/for/families", label: "Для семей" },
        { href: "/checklists/skck-checklist", label: "Чек-лист SKCK" },
        { href: "/security", label: "Как защищены документы" },
      ],
      uz: [
        { href: "/for/families", label: "Oilalar uchun" },
        { href: "/checklists/skck-checklist", label: "SKCK ro‘yxati" },
        { href: "/security", label: "Hujjatlaringiz qanday himoyalanadi" },
      ],
    },
  },
  "ijazah-transkrip-checklist": {
    slug: "ijazah-transkrip-checklist",
    emoji: "🎓",
    locales: {
      id: {
        navLabel: "Ceklis ijazah",
        title: "Ceklis Ijazah & Transkrip untuk Lamaran Kerja",
        metaDescription:
          "Ijazah, transkrip akademik, dan legalisir: apa yang biasanya diminta HR, dan cara mengumpulkannya dari kandidat lewat satu tautan.",
        h1: "Ceklis ijazah dan transkrip untuk lamaran kerja",
        intro:
          "Ijazah dan transkrip termasuk berkas yang paling sering diminta saat rekrutmen — dan paling sering menyusul belakangan. Ceklis ini merangkum apa yang biasanya diminta, kapan legalisir diperlukan, dan cara mengumpulkannya tanpa chat bolak-balik. Syarat legalisir berbeda tiap kampus dan instansi — selalu cek ke pihak penerbit.",
        ctaPrimary: "Kumpulkan berkas ini lewat satu tautan",
        groups: [
          {
            h2: "Yang biasanya diminta HR",
            items: [
              "Ijazah pendidikan terakhir",
              "Transkrip akademik (nilai lengkap)",
              "Sertifikat pelatihan atau kompetensi yang relevan",
              "Salinan yang terbaca jelas — bukan foto miring atau gelap",
            ],
          },
          {
            h2: "Kapan legalisir biasanya diperlukan",
            items: [
              "Untuk instansi pemerintah atau BUMN",
              "Untuk lamaran ke luar negeri atau pengurusan izin kerja",
              "Bila perusahaan meminta salinan dilegalisir kampus",
              "Cek ke kampus penerbit: prosedur dan biayanya berbeda-beda",
            ],
          },
          {
            h2: "Kumpulkan tanpa bolak-balik",
            items: [
              "Kirim satu tautan ceklis — kandidat unggah tanpa perlu akun",
              "Lihat status “lengkap / kurang” per kandidat",
              "Kandidat cukup foto dari ponsel; berkas dirapikan otomatis",
            ],
          },
        ],
        faqHeading: "Ijazah dan transkrip — pertanyaan umum",
        faq: [
          {
            q: "Apakah kandidat harus mengunggah ijazah asli?",
            a: "Tidak. Yang dikumpulkan adalah salinan digital (foto atau pindaian) agar bisa diperiksa. Dokumen asli tetap dipegang kandidat.",
          },
          {
            q: "Bagaimana kalau ijazah belum terbit?",
            a: "Banyak kampus menerbitkan surat keterangan lulus sementara. Anda bisa menerimanya dulu dan meminta ijazah menyusul — status “kurang” tetap terlihat sampai berkasnya masuk.",
          },
          {
            q: "Apakah Doki memeriksa keaslian ijazah?",
            a: "Tidak. Doki mengumpulkan berkas dan menunjukkan kelengkapannya. Verifikasi keaslian dilakukan perusahaan langsung ke kampus atau instansi penerbit.",
          },
        ],
      },
      en: {
        navLabel: "Diploma checklist",
        title: "Diploma & Transcript Checklist for Job Applications",
        metaDescription:
          "Diplomas, academic transcripts and legalisation: what HR usually asks for, and how to collect it from candidates through one link.",
        h1: "Diploma and transcript checklist for job applications",
        intro:
          "Diplomas and transcripts are among the most requested documents in hiring — and the ones that most often arrive late. This checklist covers what's usually asked for, when a legalised copy is needed, and how to collect it without chasing people in chat. Legalisation rules differ by university and institution — always check with the issuer.",
        ctaPrimary: "Collect these documents via one link",
        groups: [
          {
            h2: "What HR usually asks for",
            items: [
              "Diploma from the highest completed level of education",
              "Academic transcript with full grades",
              "Relevant training or competency certificates",
              "A clearly readable copy — not a dark or angled photo",
            ],
          },
          {
            h2: "When a legalised copy is usually needed",
            items: [
              "For government or state-owned employers",
              "For applications abroad or work-permit processing",
              "When the employer asks for a university-legalised copy",
              "Check with the issuing university: process and fees vary",
            ],
          },
          {
            h2: "Collect it without the back-and-forth",
            items: [
              "Send one checklist link — candidates upload without an account",
              "See “complete / missing” status per candidate",
              "Candidates can photograph documents on a phone",
            ],
          },
        ],
        faqHeading: "Diplomas and transcripts — common questions",
        faq: [
          {
            q: "Do candidates need to upload the original diploma?",
            a: "No. What's collected is a digital copy (photo or scan) so it can be reviewed. The original stays with the candidate.",
          },
          {
            q: "What if the diploma hasn't been issued yet?",
            a: "Many universities issue a temporary graduation letter. You can accept that first and ask for the diploma later — the pack stays marked “missing” until it arrives.",
          },
          {
            q: "Does Doki check whether a diploma is genuine?",
            a: "No. Doki collects documents and shows whether the set is complete. Confirming a document with the issuing university or authority is the employer's own step.",
          },
        ],
      },
      ru: {
        navLabel: "Чек-лист диплома",
        title: "Диплом и транскрипт: чек-лист для отклика",
        metaDescription:
          "Диплом, академический транскрипт и легализация: что обычно запрашивает HR и как собрать это у кандидатов по одной ссылке.",
        h1: "Чек-лист диплома и транскрипта для отклика",
        intro:
          "Диплом и транскрипт — одни из самых запрашиваемых документов при найме и одни из самых «догоняющих». В чек-листе — что обычно просят, когда нужна легализованная копия и как собрать это без переписки. Правила легализации отличаются у разных вузов и ведомств — уточняйте у того, кто выдал документ.",
        ctaPrimary: "Собрать эти документы по одной ссылке",
        groups: [
          {
            h2: "Что обычно запрашивает HR",
            items: [
              "Диплом об оконченном образовании",
              "Академический транскрипт с оценками",
              "Профильные сертификаты об обучении",
              "Читаемая копия — без тёмных и перекошенных фото",
            ],
          },
          {
            h2: "Когда обычно нужна легализованная копия",
            items: [
              "Для государственных работодателей",
              "Для отклика за рубеж или оформления разрешения на работу",
              "Если работодатель просит копию с отметкой вуза",
              "Уточните в вузе: процедура и стоимость различаются",
            ],
          },
          {
            h2: "Собрать без переписки",
            items: [
              "Одна ссылка-чек-лист — кандидат грузит без регистрации",
              "Статус «полный / не хватает» по каждому кандидату",
              "Кандидату достаточно сфотографировать документ на телефон",
            ],
          },
        ],
        faqHeading: "Диплом и транскрипт — частые вопросы",
        faq: [
          {
            q: "Нужно ли загружать оригинал диплома?",
            a: "Нет. Собирается цифровая копия (фото или скан), чтобы её можно было посмотреть. Оригинал остаётся у кандидата.",
          },
          {
            q: "А если диплом ещё не выдан?",
            a: "Многие вузы выдают справку об окончании. Её можно принять сейчас, а диплом запросить позже — пакет будет числиться неполным, пока документ не придёт.",
          },
          {
            q: "Проверяет ли Doki подлинность диплома?",
            a: "Нет. Doki собирает документы и показывает комплектность пакета. Сверка документа с вузом или ведомством — шаг самого работодателя.",
          },
        ],
      },
      uz: {
        navLabel: "Diplom ro‘yxati",
        title: "Diplom va transkript: ariza uchun ro‘yxat",
        metaDescription:
          "Diplom, akademik transkript va legallashtirish: HR odatda nima so‘raydi va buni bitta havola orqali qanday yig‘ish mumkin.",
        h1: "Ariza uchun diplom va transkript ro‘yxati",
        intro:
          "Diplom va transkript — ishga qabulda eng ko‘p so‘raladigan va eng ko‘p kechikadigan hujjatlar. Bu ro‘yxatda: odatda nima so‘raladi, qachon legallashtirilgan nusxa kerak bo‘ladi va buni yozishmalarsiz qanday yig‘ish mumkin. Legallashtirish qoidalari oliygoh va idoraga qarab farq qiladi — hujjatni bergan tomondan aniqlang.",
        ctaPrimary: "Bu hujjatlarni bitta havola orqali yig‘ish",
        groups: [
          {
            h2: "HR odatda nima so‘raydi",
            items: [
              "Tugallangan ta’lim bo‘yicha diplom",
              "Baholar bilan akademik transkript",
              "Tegishli o‘quv sertifikatlari",
              "O‘qilishi aniq nusxa — qorong‘i va qiyshiq suratlarsiz",
            ],
          },
          {
            h2: "Qachon legallashtirilgan nusxa kerak",
            items: [
              "Davlat ish beruvchilari uchun",
              "Chet elga ariza yoki ishlash ruxsatnomasi uchun",
              "Ish beruvchi oliygoh tasdig‘ini so‘rasa",
              "Oliygohdan aniqlang: tartib va narx har xil",
            ],
          },
          {
            h2: "Yozishmalarsiz yig‘ish",
            items: [
              "Bitta havola — nomzod ro‘yxatdan o‘tmasdan yuklaydi",
              "Har bir nomzod bo‘yicha “to‘liq / yetishmayapti” holati",
              "Nomzodga telefonda suratga olish kifoya",
            ],
          },
        ],
        faqHeading: "Diplom va transkript — savollar",
        faq: [
          {
            q: "Diplom aslini yuklash kerakmi?",
            a: "Yo‘q. Ko‘rib chiqish uchun raqamli nusxa (surat yoki skan) yig‘iladi. Asl nusxa nomzodda qoladi.",
          },
          {
            q: "Diplom hali berilmagan bo‘lsa-chi?",
            a: "Ko‘p oliygohlar tugatganlik haqida ma’lumotnoma beradi. Uni hozir qabul qilib, diplomni keyinroq so‘rash mumkin — hujjat kelguncha to‘plam to‘liqsiz bo‘lib turadi.",
          },
          {
            q: "Doki diplom haqiqiyligini tekshiradimi?",
            a: "Yo‘q. Doki hujjatlarni yig‘adi va to‘plam to‘liqligini ko‘rsatadi. Hujjatni oliygoh yoki idora bilan solishtirish — ish beruvchining o‘z qadami.",
          },
        ],
      },
    },
    related: {
      id: [
        { href: "/for/recruitment-agencies", label: "Untuk agensi rekrutmen" },
        { href: "/checklists/candidate-documents-requested-checklist", label: "Dokumen yang diminta HR" },
        { href: "/security", label: "Cara dokumen Anda dilindungi" },
      ],
      en: [
        { href: "/for/recruitment-agencies", label: "For recruiting agencies" },
        { href: "/checklists/candidate-documents-requested-checklist", label: "Documents HR asks for" },
        { href: "/security", label: "How your documents are protected" },
      ],
      ru: [
        { href: "/for/recruitment-agencies", label: "Для рекрутинговых агентств" },
        { href: "/checklists/candidate-documents-requested-checklist", label: "Что запрашивает HR" },
        { href: "/security", label: "Как защищены документы" },
      ],
      uz: [
        { href: "/for/recruitment-agencies", label: "Rekrutment agentliklari uchun" },
        { href: "/checklists/candidate-documents-requested-checklist", label: "HR so‘raydigan hujjatlar" },
        { href: "/security", label: "Hujjatlaringiz qanday himoyalanadi" },
      ],
    },
  },
  "fast-document-submission": {
    slug: "fast-document-submission",
    emoji: "⚡",
    locales: {
      id: {
        navLabel: "Kirim berkas cepat",
        title: "Cara Kirim Berkas Lamaran dengan Cepat & Lengkap",
        metaDescription:
          "Siapkan berkas lamaran sekali, kirim dalam hitungan menit, dan hindari bolak-balik karena dokumen kurang atau foto tidak terbaca.",
        h1: "Cara mengirim berkas lamaran dengan cepat dan lengkap",
        intro:
          "Lamaran paling sering tertunda bukan karena kualifikasi, tapi karena berkasnya menyusul satu per satu. Ceklis ini untuk kandidat: menyiapkan berkas sekali, mengirimnya sekaligus, dan tahu apa yang masih kurang sebelum HR menanyakannya.",
        ctaPrimary: "Simpan berkas Anda untuk lamaran berikutnya",
        groups: [
          {
            h2: "Siapkan sekali, pakai berkali-kali",
            items: [
              "Simpan CV versi terbaru dalam satu tempat",
              "Foto ijazah dan transkrip sekali, dengan hasil yang terbaca",
              "Catat masa berlaku dokumen yang bisa kedaluwarsa",
              "Beri nama berkas yang jelas, mis. “CV — Budi Santoso”",
            ],
          },
          {
            h2: "Agar tidak ditolak karena berkas",
            items: [
              "Foto di tempat terang, seluruh dokumen masuk bingkai",
              "Pastikan nomor dan tanggal terbaca, tidak buram",
              "Kirim format yang diminta (biasanya PDF, JPG, atau PNG)",
              "Periksa daftar dokumen wajib sebelum menekan kirim",
            ],
          },
          {
            h2: "Saat melamar",
            items: [
              "Buka tautan ceklis dari perusahaan — tanpa perlu buat akun",
              "Unggah semua berkas dalam satu kali proses",
              "Lihat sendiri status “lengkap / kurang” sebelum mengirim",
              "Pantau status lamaran lewat tautan yang Anda terima",
            ],
          },
        ],
        faqHeading: "Kirim berkas — pertanyaan umum",
        faq: [
          {
            q: "Apakah saya harus membuat akun untuk melamar?",
            a: "Tidak. Tautan ceklis dari perusahaan bisa dibuka dan diisi tanpa mendaftar. Membuat akun gratis hanya berguna jika Anda ingin menyimpan berkas untuk lamaran berikutnya.",
          },
          {
            q: "Bagaimana kalau saya belum punya semua dokumen?",
            a: "Kirim yang sudah ada. Status lamaran akan menunjukkan apa yang masih kurang, dan Anda bisa melengkapinya lewat tautan yang sama.",
          },
          {
            q: "Berkas saya besar dan gagal terunggah — bagaimana?",
            a: "Foto dari ponsel dikecilkan otomatis sebelum dikirim. Kalau masih gagal, periksa apakah formatnya termasuk yang diterima (PDF, JPG, PNG).",
          },
        ],
      },
      en: {
        navLabel: "Submit documents fast",
        title: "How to Send a Complete Application Pack Quickly",
        metaDescription:
          "Prepare your documents once, send them in minutes, and avoid the back-and-forth caused by missing files or unreadable photos.",
        h1: "How to send a complete application pack quickly",
        intro:
          "Applications usually stall not because of qualifications, but because documents arrive one at a time. This checklist is for candidates: prepare your files once, send them together, and see what's missing before the employer has to ask.",
        ctaPrimary: "Keep your documents for the next application",
        groups: [
          {
            h2: "Prepare once, reuse many times",
            items: [
              "Keep your current CV in one place",
              "Photograph your diploma and transcript once, clearly",
              "Note the expiry date of anything that can expire",
              "Name files plainly, e.g. “CV — Budi Santoso”",
            ],
          },
          {
            h2: "So nothing gets sent back",
            items: [
              "Shoot in good light with the whole document in frame",
              "Check that numbers and dates are readable, not blurred",
              "Send the formats asked for (usually PDF, JPG or PNG)",
              "Re-read the required list before you hit submit",
            ],
          },
          {
            h2: "When you apply",
            items: [
              "Open the employer's checklist link — no account needed",
              "Upload everything in one pass",
              "Check the “complete / missing” status yourself before sending",
              "Follow your application status through the link you receive",
            ],
          },
        ],
        faqHeading: "Sending documents — common questions",
        faq: [
          {
            q: "Do I need an account to apply?",
            a: "No. An employer's checklist link opens and accepts uploads without registering. A free account is only useful if you want to keep your documents for future applications.",
          },
          {
            q: "What if I don't have every document yet?",
            a: "Send what you have. The status page shows what's still missing, and you can add it through the same link.",
          },
          {
            q: "My file is too large to upload — what now?",
            a: "Phone photos are shrunk automatically before sending. If it still fails, check that the format is one of the accepted ones (PDF, JPG, PNG).",
          },
        ],
      },
      ru: {
        navLabel: "Быстрая отправка",
        title: "Как быстро отправить полный пакет документов",
        metaDescription:
          "Подготовьте документы один раз, отправьте за минуты и не тратьте дни на переписку из-за нехватки файлов или нечитаемых фото.",
        h1: "Как быстро отправить полный пакет документов",
        intro:
          "Отклики чаще застревают не из-за квалификации, а из-за того, что документы приходят по одному. Этот чек-лист для кандидата: подготовить файлы один раз, отправить их вместе и увидеть, чего не хватает, до того как об этом спросит работодатель.",
        ctaPrimary: "Сохранить документы для следующего отклика",
        groups: [
          {
            h2: "Подготовить один раз",
            items: [
              "Держите актуальное резюме в одном месте",
              "Сфотографируйте диплом и транскрипт один раз, разборчиво",
              "Отметьте срок действия у документов, которые истекают",
              "Называйте файлы понятно, например «CV — Budi Santoso»",
            ],
          },
          {
            h2: "Чтобы документы не вернули",
            items: [
              "Снимайте при хорошем свете, документ целиком в кадре",
              "Проверьте, что номера и даты читаются, а не смазаны",
              "Отправляйте запрошенные форматы (обычно PDF, JPG, PNG)",
              "Перечитайте список обязательных перед отправкой",
            ],
          },
          {
            h2: "Когда откликаетесь",
            items: [
              "Откройте ссылку-чек-лист работодателя — регистрация не нужна",
              "Загрузите всё за один заход",
              "Сами посмотрите статус «полный / не хватает» перед отправкой",
              "Следите за статусом отклика по полученной ссылке",
            ],
          },
        ],
        faqHeading: "Отправка документов — частые вопросы",
        faq: [
          {
            q: "Нужен ли аккаунт, чтобы откликнуться?",
            a: "Нет. Ссылка-чек-лист от работодателя открывается и принимает файлы без регистрации. Бесплатный аккаунт нужен, только если хотите сохранить документы для будущих откликов.",
          },
          {
            q: "А если у меня есть не все документы?",
            a: "Отправьте то, что есть. На странице статуса видно, чего не хватает, и это можно дослать по той же ссылке.",
          },
          {
            q: "Файл слишком большой и не загружается?",
            a: "Фото с телефона уменьшаются автоматически перед отправкой. Если всё равно не идёт — проверьте, что формат из списка допустимых (PDF, JPG, PNG).",
          },
        ],
      },
      uz: {
        navLabel: "Tez yuborish",
        title: "To‘liq hujjat to‘plamini tez yuborish",
        metaDescription:
          "Hujjatlarni bir marta tayyorlang, bir necha daqiqada yuboring va yetishmagan fayllar tufayli yozishmalarga vaqt sarflamang.",
        h1: "To‘liq hujjat to‘plamini qanday tez yuborish mumkin",
        intro:
          "Arizalar ko‘pincha malaka tufayli emas, hujjatlar bittalab kelgani uchun cho‘ziladi. Bu ro‘yxat nomzod uchun: fayllarni bir marta tayyorlash, birga yuborish va ish beruvchi so‘ramasidan oldin nima yetishmayotganini ko‘rish.",
        ctaPrimary: "Keyingi ariza uchun hujjatlaringizni saqlang",
        groups: [
          {
            h2: "Bir marta tayyorlang",
            items: [
              "Eng so‘nggi rezyumeni bitta joyda saqlang",
              "Diplom va transkriptni bir marta, aniq suratga oling",
              "Muddati tugaydigan hujjatlar sanasini belgilang",
              "Fayllarni tushunarli nomlang, masalan “CV — Budi Santoso”",
            ],
          },
          {
            h2: "Hujjat qaytarilmasligi uchun",
            items: [
              "Yorug‘ joyda, hujjat to‘liq kadrga tushsin",
              "Raqam va sanalar o‘qilishini tekshiring",
              "So‘ralgan formatda yuboring (odatda PDF, JPG, PNG)",
              "Yuborishdan oldin majburiy ro‘yxatni qayta o‘qing",
            ],
          },
          {
            h2: "Ariza berayotganda",
            items: [
              "Ish beruvchi havolasini oching — ro‘yxatdan o‘tish shart emas",
              "Hammasini bir martada yuklang",
              "Yuborishdan oldin “to‘liq / yetishmayapti” holatini ko‘ring",
              "Ariza holatini olgan havolangiz orqali kuzating",
            ],
          },
        ],
        faqHeading: "Hujjat yuborish — savollar",
        faq: [
          {
            q: "Ariza berish uchun hisob kerakmi?",
            a: "Yo‘q. Ish beruvchining havolasi ro‘yxatdan o‘tmasdan ochiladi va fayllarni qabul qiladi. Bepul hisob faqat hujjatlarni keyingi arizalar uchun saqlamoqchi bo‘lsangiz kerak bo‘ladi.",
          },
          {
            q: "Barcha hujjatlarim tayyor bo‘lmasa-chi?",
            a: "Bor bo‘lganini yuboring. Holat sahifasida nima yetishmayotgani ko‘rinadi va uni o‘sha havola orqali qo‘shishingiz mumkin.",
          },
          {
            q: "Fayl katta va yuklanmayapti?",
            a: "Telefondagi suratlar yuborishdan oldin avtomatik kichraytiriladi. Baribir yuklanmasa, format ruxsat etilganlar (PDF, JPG, PNG) ichida ekanini tekshiring.",
          },
        ],
      },
    },
    related: {
      id: [
        { href: "/checklists/candidate-documents-requested-checklist", label: "Dokumen yang diminta HR" },
        { href: "/checklists/ijazah-transkrip-checklist", label: "Ceklis ijazah dan transkrip" },
        { href: "/security", label: "Cara dokumen Anda dilindungi" },
      ],
      en: [
        { href: "/checklists/candidate-documents-requested-checklist", label: "Documents HR asks for" },
        { href: "/checklists/ijazah-transkrip-checklist", label: "Diploma and transcript checklist" },
        { href: "/security", label: "How your documents are protected" },
      ],
      ru: [
        { href: "/checklists/candidate-documents-requested-checklist", label: "Что запрашивает HR" },
        { href: "/checklists/ijazah-transkrip-checklist", label: "Чек-лист диплома и транскрипта" },
        { href: "/security", label: "Как защищены документы" },
      ],
      uz: [
        { href: "/checklists/candidate-documents-requested-checklist", label: "HR so‘raydigan hujjatlar" },
        { href: "/checklists/ijazah-transkrip-checklist", label: "Diplom va transkript ro‘yxati" },
        { href: "/security", label: "Hujjatlaringiz qanday himoyalanadi" },
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

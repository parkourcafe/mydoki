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
            a: "Set a “valid until” date on each passport, visa and insurance policy, and a reminder arrives by email before it expires. (TODO: confirm exact lead time with the team.)",
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
            a: "Укажите дату «действует до» для каждого паспорта, визы и страховки — напоминание придёт на email заранее. (TODO: уточнить у команды точный срок.)",
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
            a: "Pasang tanggal “berlaku sampai” pada tiap paspor, visa, dan polis asuransi, dan pengingat tiba lewat email sebelum kedaluwarsa. (TODO: konfirmasi tenggat pasti ke tim.)",
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
            a: "Har bir pasport, viza va sugʻurta polisiga “amal qiladi” sanasini qoʻying — eslatma muddat tugashidan oldin email orqali keladi. (TODO: aniq muddatni jamoa bilan tasdiqlash.)",
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
            a: "Yes. Set a “valid until” date on each child's passport and a reminder arrives by email before it expires. (TODO: confirm exact lead time with the team.)",
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
            a: "Да. Укажите дату «действует до» для паспорта каждого ребёнка — напоминание придёт на email заранее. (TODO: уточнить у команды точный срок.)",
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
            a: "Bisa. Pasang tanggal “berlaku sampai” pada paspor tiap anak, dan pengingat tiba lewat email sebelum kedaluwarsa. (TODO: konfirmasi tenggat pasti ke tim.)",
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
            a: "Ha. Har bir bola pasportiga “amal qiladi” sanasini qoʻying — eslatma muddat tugashidan oldin email orqali keladi. (TODO: aniq muddatni jamoa bilan tasdiqlash.)",
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

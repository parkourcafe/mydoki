import "server-only";
import type { Metadata } from "next";
import type { Locale } from "./i18n";
import { getLocale } from "./i18n";
import { altLangs } from "./seo";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://www.doki.help";

/**
 * Реестр SEO-лендингов (Deadline-Led Document SEO). Каждый ключ — отдельный
 * top-level URL из брифов (docs/seo/page-briefs.md). Контент по 4 языкам,
 * рендерится общим components/LandingPage.tsx.
 *
 * Правила правдивости (см. бриф §0): только подтверждённые факты (RLS,
 * приватный bucket, HTTPS, 2FA, beta, AI≠консультация, офлайн). Сроки/правила
 * госорганов — без жёстких чисел («проверьте требования вашей страны»).
 * Неподтверждённое помечено TODO и не выводится как факт.
 */

export type LandingSection = { h2: string; body?: string; bullets?: string[] };
export type LandingFaq = { q: string; a: string };

export type LandingContent = {
  navLabel: string;
  /** meta <title>, ≤60 симв. */
  title: string;
  /** meta description, ≤155 симв. */
  metaDescription: string;
  h1: string;
  intro: string;
  ctaPrimary: string;
  sections: LandingSection[];
  /** Заголовок trust-блока + пункты. */
  trustHeading: string;
  trust: string[];
  faqHeading: string;
  faq: LandingFaq[];
};

export type RelatedLink = { href: string; label: string };

export type Landing = {
  slug: string;
  emoji: string;
  /** Языки, на которых публикуем (по умолчанию все). */
  pageLocales?: Locale[];
  locales: Record<Locale, LandingContent>;
  /** Внутренние ссылки на существующие страницы (префикс локали — в рендере). */
  related: Record<Locale, RelatedLink[]>;
};

export const LANDING_KEYS = [
  "passport-expiry-reminder",
  "family-document-vault",
  "document-expiry-reminder",
  "family-document-organizer",
  "visa-expiry-reminder",
  "secure-document-sharing",
  "expat-document-organizer",
  "medical-document-organizer",
  "travel-documents",
  "family-emergency-documents",
  "candidate-document-collection",
  "hr-document-checklist",
] as const;
export type LandingKey = (typeof LANDING_KEYS)[number];

const DATA: Record<LandingKey, Landing> = {
  "passport-expiry-reminder": {
    slug: "passport-expiry-reminder",
    emoji: "🛂",
    locales: {
      en: {
        navLabel: "Passport reminders",
        title: "Passport Expiry Reminder for the Whole Family",
        metaDescription:
          "Store every family passport in one place and get a reminder before renewal becomes urgent. Offline access for your next trip.",
        h1: "Passport expiry reminder for the whole family",
        intro:
          "Keep passport expiry dates for every family member in one place and get reminders before renewal becomes urgent.",
        ctaPrimary: "Add a passport reminder",
        sections: [
          {
            h2: "Why passport expiry dates are easy to miss",
            body: "A passport quietly expires years after you last looked at it — usually noticed only when a trip is already booked. With every passport in one place and a deadline attached, the date finds you instead of surprising you.",
          },
          {
            h2: "What to store with each passport",
            bullets: [
              "A clear photo or scan of the passport",
              "Passport number, issue date and expiry date",
              "Linked documents: visas, travel insurance, bookings",
            ],
          },
          {
            h2: "When to set a reminder",
            body: "Many countries require several months of passport validity beyond your travel dates, and renewals can take time — so set the reminder well ahead. Always check the entry rules of your destination; Doki.help reminds you of the date, it does not advise on requirements.",
          },
          {
            h2: "How Doki.help helps",
            body: "Add a passport, set its “valid until” date, and the reminder arrives by email before it expires — no spreadsheet, no mental note.",
          },
          {
            h2: "Family passport tracking",
            body: "Keep a profile for every family member — partner, children, parents — so no one's passport slips through the cracks.",
          },
          {
            h2: "Offline access before a trip",
            body: "Save the documents you need to your phone and open them even without a connection — at the airport or in roaming.",
          },
          {
            h2: "Secure sharing when needed",
            body: "Need to send a passport copy to a travel agent or relative? Share a link that expires and can be revoked at any time, with each open logged.",
          },
        ],
        trustHeading: "Your documents stay private",
        trust: [
          "Only your family can see the documents (row-level security in the database).",
          "Files live in private storage, transferred over HTTPS; two-factor login available.",
          "Doki.help is in beta and does not replace your original passport.",
        ],
        faqHeading: "FAQ",
        faq: [
          {
            q: "How far in advance should I renew a passport?",
            a: "It depends on your country and your destination's entry rules — many require several months of validity beyond your trip. Set the reminder early and check the official requirements before you travel.",
          },
          {
            q: "Can I track passports for my children?",
            a: "Yes. Keep a separate profile for each family member and a reminder for every passport.",
          },
          {
            q: "How will I be reminded?",
            a: "By email, before the expiry date you set. The reminder comes 30, 7 and 1 day before that date.",
          },
          {
            q: "Can I access my passport scan offline?",
            a: "Yes. Save it to your phone in advance and open it without internet — useful in transit or roaming.",
          },
          {
            q: "Is storing a passport scan here safe?",
            a: "Files are kept in private storage over HTTPS, access is isolated to your family at the database level, and two-factor login is available.",
          },
        ],
      },
      ru: {
        navLabel: "Напоминания о паспорте",
        title: "Напоминание о сроке паспорта для всей семьи",
        metaDescription:
          "Храните паспорта всех членов семьи в одном месте и получайте напоминание заранее, до того как продление станет срочным. Доступ офлайн в поездке.",
        h1: "Напоминание о сроке паспорта для всей семьи",
        intro:
          "Держите сроки паспортов всех членов семьи в одном месте и получайте напоминания заранее, пока продление не стало срочным.",
        ctaPrimary: "Добавить напоминание о паспорте",
        sections: [
          {
            h2: "Почему сроки паспортов легко пропустить",
            body: "Паспорт тихо истекает спустя годы после того, как вы в него заглядывали в последний раз, — и это обычно замечают, когда поездка уже куплена. Когда все паспорта в одном месте и к каждому привязан срок, дата сама напомнит о себе.",
          },
          {
            h2: "Что хранить вместе с каждым паспортом",
            bullets: [
              "Чёткое фото или скан паспорта",
              "Номер паспорта, дата выдачи и дата окончания",
              "Связанные документы: визы, страховки, брони",
            ],
          },
          {
            h2: "Когда ставить напоминание",
            body: "Многие страны требуют, чтобы паспорт был действителен ещё несколько месяцев после дат поездки, а продление занимает время — поэтому ставьте напоминание заранее. Всегда проверяйте правила въезда страны назначения: Doki.help напоминает о дате, но не консультирует по требованиям.",
          },
          {
            h2: "Как помогает Doki.help",
            body: "Добавьте паспорт, укажите дату «действует до» — и напоминание придёт на email заранее. Без таблиц и заметок на полях.",
          },
          {
            h2: "Паспорта всей семьи",
            body: "Заведите профиль на каждого — супруга, детей, родителей, — чтобы ничей паспорт не остался незамеченным.",
          },
          {
            h2: "Доступ офлайн перед поездкой",
            body: "Сохраните нужные документы на телефон и открывайте их даже без связи — в аэропорту или в роуминге.",
          },
          {
            h2: "Безопасная отправка при необходимости",
            body: "Нужно отправить копию паспорта агенту или родственнику? Поделитесь ссылкой, которая истекает и отзывается в любой момент, а каждое открытие логируется.",
          },
        ],
        trustHeading: "Ваши документы остаются приватными",
        trust: [
          "Документы видит только ваша семья (изоляция на уровне базы, RLS).",
          "Файлы — в приватном хранилище, передача по HTTPS; доступен двухфакторный вход.",
          "Doki.help в стадии beta и не заменяет оригинал паспорта.",
        ],
        faqHeading: "Частые вопросы",
        faq: [
          {
            q: "За сколько менять паспорт заранее?",
            a: "Зависит от вашей страны и правил въезда страны назначения — многие требуют запас в несколько месяцев. Ставьте напоминание заранее и проверяйте официальные требования перед поездкой.",
          },
          {
            q: "Можно вести паспорта детей?",
            a: "Да. Заведите отдельный профиль на каждого члена семьи и напоминание для каждого паспорта.",
          },
          {
            q: "Как придёт напоминание?",
            a: "На email, до указанной вами даты окончания. Напоминание приходит за 30, 7 и 1 день до этой даты.",
          },
          {
            q: "Будет ли доступ к скану офлайн?",
            a: "Да. Сохраните его заранее на телефон и открывайте без интернета — удобно в пути и в роуминге.",
          },
          {
            q: "Безопасно ли хранить скан паспорта здесь?",
            a: "Файлы хранятся в приватном хранилище по HTTPS, доступ изолирован вашей семьёй на уровне базы, доступен двухфакторный вход.",
          },
        ],
      },
      id: {
        navLabel: "Pengingat paspor",
        title: "Pengingat Masa Berlaku Paspor untuk Keluarga",
        metaDescription:
          "Simpan paspor seluruh keluarga di satu tempat dan dapatkan pengingat sebelum perpanjangan jadi mendesak. Akses offline untuk perjalanan Anda.",
        h1: "Pengingat masa berlaku paspor untuk seluruh keluarga",
        intro:
          "Simpan tanggal kedaluwarsa paspor setiap anggota keluarga di satu tempat dan dapatkan pengingat sebelum perpanjangan menjadi mendesak.",
        ctaPrimary: "Tambahkan pengingat paspor",
        sections: [
          {
            h2: "Mengapa masa berlaku paspor mudah terlewat",
            body: "Paspor diam-diam kedaluwarsa bertahun-tahun setelah terakhir Anda lihat — biasanya baru disadari saat tiket sudah dipesan. Dengan semua paspor di satu tempat dan tanggal yang terpasang, tanggalnya yang mengingatkan Anda.",
          },
          {
            h2: "Apa yang disimpan bersama tiap paspor",
            bullets: [
              "Foto atau pindaian paspor yang jelas",
              "Nomor paspor, tanggal terbit dan tanggal kedaluwarsa",
              "Dokumen terkait: visa, asuransi perjalanan, pemesanan",
            ],
          },
          {
            h2: "Kapan memasang pengingat",
            body: "Banyak negara mensyaratkan masa berlaku paspor beberapa bulan melebihi tanggal perjalanan, dan perpanjangan butuh waktu — jadi pasang pengingat jauh hari. Selalu periksa aturan masuk negara tujuan; Doki.help mengingatkan tanggal, bukan memberi nasihat persyaratan.",
          },
          {
            h2: "Bagaimana Doki.help membantu",
            body: "Tambahkan paspor, isi tanggal “berlaku sampai”, dan pengingat tiba lewat email sebelum kedaluwarsa — tanpa spreadsheet, tanpa catatan di kepala.",
          },
          {
            h2: "Pantau paspor seluruh keluarga",
            body: "Buat profil untuk tiap anggota keluarga — pasangan, anak, orang tua — agar tidak ada paspor yang terlewat.",
          },
          {
            h2: "Akses offline sebelum perjalanan",
            body: "Simpan dokumen yang Anda butuhkan ke ponsel dan buka tanpa koneksi — di bandara atau saat roaming.",
          },
          {
            h2: "Berbagi aman saat diperlukan",
            body: "Perlu mengirim salinan paspor ke agen atau kerabat? Bagikan tautan yang kedaluwarsa dan bisa dicabut kapan saja, setiap pembukaan tercatat.",
          },
        ],
        trustHeading: "Dokumen Anda tetap privat",
        trust: [
          "Hanya keluarga Anda yang melihat dokumen (isolasi di tingkat basis data, RLS).",
          "Berkas di penyimpanan privat, ditransfer lewat HTTPS; login dua faktor tersedia.",
          "Doki.help masih beta dan tidak menggantikan paspor asli Anda.",
        ],
        faqHeading: "Pertanyaan umum",
        faq: [
          {
            q: "Berapa jauh hari sebaiknya perpanjang paspor?",
            a: "Tergantung negara Anda dan aturan masuk negara tujuan — banyak yang minta sisa masa berlaku beberapa bulan. Pasang pengingat lebih awal dan periksa persyaratan resmi sebelum berangkat.",
          },
          {
            q: "Bisakah memantau paspor anak?",
            a: "Bisa. Buat profil terpisah untuk tiap anggota keluarga dan pengingat untuk tiap paspor.",
          },
          {
            q: "Bagaimana pengingatnya datang?",
            a: "Lewat email, sebelum tanggal kedaluwarsa yang Anda tetapkan. Pengingat datang 30, 7, dan 1 hari sebelum tanggal itu.",
          },
          {
            q: "Bisakah akses pindaian paspor offline?",
            a: "Bisa. Simpan lebih dulu ke ponsel dan buka tanpa internet — berguna saat transit atau roaming.",
          },
          {
            q: "Aman menyimpan pindaian paspor di sini?",
            a: "Berkas disimpan di penyimpanan privat lewat HTTPS, akses diisolasi untuk keluarga Anda di tingkat basis data, dan login dua faktor tersedia.",
          },
        ],
      },
      uz: {
        navLabel: "Pasport eslatmalari",
        title: "Butun oila uchun pasport muddati eslatmasi",
        metaDescription:
          "Oila aʼzolarining pasportlarini bitta joyda saqlang va muddat tugashidan oldin eslatma oling. Sayohatda oflayn kirish.",
        h1: "Butun oila uchun pasport muddati eslatmasi",
        intro:
          "Har bir oila aʼzosi pasportining muddatini bitta joyda saqlang va yangilash shoshilinch boʻlib qolishidan oldin eslatma oling.",
        ctaPrimary: "Pasport eslatmasini qoʻshish",
        sections: [
          {
            h2: "Nega pasport muddatini oʻtkazib yuborish oson",
            body: "Pasport siz unga oxirgi marta qaragandan keyin yillar oʻtib jimgina tugaydi — odatda buni chipta allaqachon olingach sezasiz. Hamma pasport bitta joyda va muddati biriktirilgan boʻlsa, sana oʻzi eslatadi.",
          },
          {
            h2: "Har bir pasport bilan nimani saqlash kerak",
            bullets: [
              "Pasportning aniq surati yoki skani",
              "Pasport raqami, berilgan va tugash sanasi",
              "Bogʻliq hujjatlar: vizalar, sayohat sugʻurtasi, bronlar",
            ],
          },
          {
            h2: "Eslatmani qachon qoʻyish kerak",
            body: "Koʻp davlatlar pasport sayohat sanasidan keyin yana bir necha oy amal qilishini talab qiladi, yangilash esa vaqt oladi — shuning uchun eslatmani oldindan qoʻying. Boriladigan davlat talablarini doim tekshiring; Doki.help sanani eslatadi, talablar boʻyicha maslahat bermaydi.",
          },
          {
            h2: "Doki.help qanday yordam beradi",
            body: "Pasport qoʻshing, “amal qiladi” sanasini kiriting — eslatma muddat tugashidan oldin email orqali keladi. Jadval ham, xotirada saqlash ham shart emas.",
          },
          {
            h2: "Butun oila pasportlarini kuzatish",
            body: "Har bir aʼzo uchun profil yarating — turmush oʻrtogʻingiz, bolalar, ota-onangiz — hech kimning pasporti eʼtibordan chetda qolmaydi.",
          },
          {
            h2: "Sayohatdan oldin oflayn kirish",
            body: "Kerakli hujjatlarni telefoningizga saqlang va aloqasiz ham oching — aeroportda yoki rouming paytida.",
          },
          {
            h2: "Kerak boʻlganda xavfsiz ulashish",
            body: "Pasport nusxasini agent yoki qarindoshga yuborish kerakmi? Muddati tugaydigan va istalgan vaqt bekor qilinadigan havola ulashing, har bir ochilish qayd etiladi.",
          },
        ],
        trustHeading: "Hujjatlaringiz maxfiy qoladi",
        trust: [
          "Hujjatlarni faqat oilangiz koʻradi (maʼlumotlar bazasi darajasida izolyatsiya, RLS).",
          "Fayllar maxfiy omborda, HTTPS orqali uzatiladi; ikki bosqichli kirish mavjud.",
          "Doki.help beta bosqichida va asl pasportingiz oʻrnini bosmaydi.",
        ],
        faqHeading: "Tez-tez beriladigan savollar",
        faq: [
          {
            q: "Pasportni qancha oldin yangilash kerak?",
            a: "Bu davlatingiz va boriladigan davlat talablariga bogʻliq — koʻplari bir necha oy zaxira muddat soʻraydi. Eslatmani erta qoʻying va sayohatdan oldin rasmiy talablarni tekshiring.",
          },
          {
            q: "Bolalar pasportini kuzatsa boʻladimi?",
            a: "Ha. Har bir oila aʼzosi uchun alohida profil va har bir pasport uchun eslatma yarating.",
          },
          {
            q: "Eslatma qanday keladi?",
            a: "Email orqali, siz belgilagan tugash sanasidan oldin. Eslatma shu sanadan 30, 7 va 1 kun oldin keladi.",
          },
          {
            q: "Pasport skaniga oflayn kirsa boʻladimi?",
            a: "Ha. Uni oldindan telefoningizga saqlang va internetsiz oching — tranzit yoki roumingda qulay.",
          },
          {
            q: "Bu yerda pasport skanini saqlash xavfsizmi?",
            a: "Fayllar maxfiy omborda HTTPS orqali saqlanadi, kirish oilangiz darajasida izolyatsiya qilingan, ikki bosqichli kirish mavjud.",
          },
        ],
      },
    },
    related: {
      en: [
        { href: "/for/travel", label: "For travelers" },
        { href: "/for/families", label: "For families" },
      ],
      ru: [
        { href: "/for/travel", label: "Для путешественников" },
        { href: "/for/families", label: "Для семей" },
      ],
      id: [
        { href: "/for/travel", label: "Untuk pelancong" },
        { href: "/for/families", label: "Untuk keluarga" },
      ],
      uz: [
        { href: "/for/travel", label: "Sayohatchilar uchun" },
        { href: "/for/families", label: "Oilalar uchun" },
      ],
    },
  },
  "family-document-vault": {
    slug: "family-document-vault",
    emoji: "🗄️",
    locales: {
      en: {
        navLabel: "Family vault",
        title: "Family Document Vault — Secure & With Reminders",
        metaDescription:
          "Keep your whole family's documents in one private vault: passports, medical, visas, insurance. Deadline reminders and secure sharing.",
        h1: "A secure family document vault for everything that matters",
        intro:
          "Keep every family member's important documents in one private vault — with expiry reminders and secure, revocable sharing.",
        ctaPrimary: "Create your family vault",
        sections: [
          {
            h2: "Where do your family's documents actually live right now?",
            body: "Scattered across chats, email attachments, your phone's gallery and a paper folder somewhere at home — so when one is needed, the search begins. A vault gives every document one place you can actually find.",
          },
          {
            h2: "What a family document vault is (and isn't)",
            body: "It's a private, organized home for your family's important documents, with deadlines and controlled access. It is not a general cloud drive, and it does not replace your original documents — keep those safe too.",
          },
          {
            h2: "What you can keep here",
            bullets: [
              "IDs & migration: passports, ID cards, visas, residence permits",
              "Medical: lab results, reports, vaccinations, insurance",
              "Travel: tickets, bookings, travel insurance, consent forms",
              "Property & car: contracts, registration, ownership papers",
              "Education: diplomas, certificates, enrollment documents",
            ],
          },
          {
            h2: "A profile for every family member",
            body: "Keep a separate profile for your partner, children and parents, so each person's documents stay together and nothing gets mixed up.",
          },
          {
            h2: "Never miss an expiry date",
            body: "Add a document, set its “valid until” date, and a reminder arrives by email before it expires — for every member of the family.",
          },
          {
            h2: "Share securely, revoke anytime",
            body: "Send a document with a link that expires and can be revoked at any time, with a view limit and a log of every open. The recipient needs no account.",
          },
          {
            h2: "Your privacy and security",
            body: "Documents live in private storage on Supabase, transferred over HTTPS, with access isolated to your family at the database level (row-level security). Roles let you decide who is owner, editor or viewer, and two-factor login is available.",
          },
        ],
        trustHeading: "Built to keep family documents private",
        trust: [
          "Only your family can see the documents (row-level security in the database).",
          "Files live in a private bucket, transferred over HTTPS; two-factor login available.",
          "We don't sell your data, and Doki.help does not replace your original documents.",
          "Doki.help is in beta.",
        ],
        faqHeading: "FAQ",
        faq: [
          {
            q: "Who can see our family documents?",
            a: "Only the people in your family that you invite. Access is isolated at the database level (row-level security), so no one outside your family can see your documents.",
          },
          {
            q: "Is it free?",
            a: "Yes. The free tier includes 2 GB of storage, expiry reminders, family access and offline access. A paid tier may come later, and what's free now stays free.",
          },
          {
            q: "How is this different from Google Drive?",
            a: "A general cloud stores files; a document vault adds document types, expiry reminders, a profile per family member and revocable sharing of a single document. It's built for important documents rather than everything.",
          },
          {
            q: "Can I add my spouse and kids?",
            a: "Yes. Invite them with a link and assign roles — owner, editor or viewer — so each person has the right level of access.",
          },
          {
            q: "What happens to my data if I leave?",
            a: "You can download your documents and delete your data. See our privacy page for how deletion works.",
          },
        ],
      },
      ru: {
        navLabel: "Семейный сейф",
        title: "Семейный сейф документов — безопасно, с напоминаниями",
        metaDescription:
          "Документы всей семьи в одном приватном сейфе: паспорта, медицина, визы, страховки. Напоминания о сроках и безопасная отправка.",
        h1: "Безопасный семейный сейф для всего, что важно",
        intro:
          "Держите важные документы каждого члена семьи в одном приватном сейфе — с напоминаниями о сроках и безопасной, отзываемой отправкой.",
        ctaPrimary: "Создать семейный сейф",
        sections: [
          {
            h2: "Где сейчас на самом деле лежат документы вашей семьи?",
            body: "Раскиданы по чатам, вложениям в почте, галерее телефона и бумажной папке где-то дома — и когда документ нужен, начинаются поиски. Сейф даёт одно место, где документ реально находится.",
          },
          {
            h2: "Что такое семейный сейф документов (и что — нет)",
            body: "Это приватный, упорядоченный дом для важных документов семьи — со сроками и управляемым доступом. Это не общее облако и не замена оригиналам: оригиналы тоже храните в безопасности.",
          },
          {
            h2: "Что здесь можно хранить",
            bullets: [
              "Удостоверения и миграция: паспорта, ID-карты, визы, ВНЖ",
              "Медицина: анализы, заключения, прививки, страховки",
              "Путешествия: билеты, брони, страховки, согласия",
              "Имущество и авто: договоры, регистрация, документы о собственности",
              "Образование: дипломы, сертификаты, документы о зачислении",
            ],
          },
          {
            h2: "Профиль на каждого члена семьи",
            body: "Заведите отдельный профиль для супруга, детей и родителей, чтобы документы каждого были вместе и ничего не перемешалось.",
          },
          {
            h2: "Не пропустите ни одного срока",
            body: "Добавьте документ, укажите дату «действует до» — и напоминание придёт на email заранее, для каждого члена семьи.",
          },
          {
            h2: "Делитесь безопасно, отзывайте в любой момент",
            body: "Отправьте документ ссылкой, которая истекает и отзывается в любой момент, с лимитом просмотров и логом каждого открытия. Получателю не нужен аккаунт.",
          },
          {
            h2: "Ваша приватность и безопасность",
            body: "Документы лежат в приватном хранилище на Supabase, передаются по HTTPS, доступ изолирован вашей семьёй на уровне базы (RLS). Роли определяют, кто owner, editor или viewer, доступен двухфакторный вход.",
          },
        ],
        trustHeading: "Сделано, чтобы документы семьи оставались приватными",
        trust: [
          "Документы видит только ваша семья (изоляция на уровне базы, RLS).",
          "Файлы — в приватном bucket, передача по HTTPS; доступен двухфакторный вход.",
          "Мы не продаём ваши данные, и Doki.help не заменяет оригиналы документов.",
          "Doki.help в стадии beta.",
        ],
        faqHeading: "Частые вопросы",
        faq: [
          {
            q: "Кто видит наши семейные документы?",
            a: "Только те, кого вы пригласили в свою семью. Доступ изолирован на уровне базы (RLS), поэтому посторонние не видят ваши документы.",
          },
          {
            q: "Это бесплатно?",
            a: "Да. Бесплатный тариф включает 2 ГБ хранилища, напоминания о сроках, семейный доступ и офлайн-доступ. Платный тариф может появиться позже, а то, что бесплатно сейчас, останется бесплатным.",
          },
          {
            q: "Чем это отличается от Google Drive?",
            a: "Общее облако хранит файлы; сейф документов добавляет типы документов, напоминания о сроках, профиль на каждого члена семьи и отзываемую отправку отдельного документа. Он создан для важных документов, а не для всего подряд.",
          },
          {
            q: "Можно добавить супруга и детей?",
            a: "Да. Пригласите их по ссылке и назначьте роли — owner, editor или viewer, — чтобы у каждого был нужный уровень доступа.",
          },
          {
            q: "Что будет с данными, если я уйду?",
            a: "Вы можете скачать свои документы и удалить данные. Как работает удаление — на странице приватности.",
          },
        ],
      },
      id: {
        navLabel: "Brankas keluarga",
        title: "Brankas Dokumen Keluarga — Aman & Ada Pengingat",
        metaDescription:
          "Simpan dokumen seluruh keluarga di satu brankas privat: paspor, medis, visa, asuransi. Pengingat tenggat dan berbagi yang aman.",
        h1: "Brankas dokumen keluarga yang aman untuk semua yang penting",
        intro:
          "Simpan dokumen penting tiap anggota keluarga di satu brankas privat — dengan pengingat masa berlaku dan berbagi aman yang bisa dicabut.",
        ctaPrimary: "Buat brankas keluarga Anda",
        sections: [
          {
            h2: "Di mana sebenarnya dokumen keluarga Anda tersimpan sekarang?",
            body: "Tersebar di obrolan, lampiran email, galeri ponsel, dan map kertas di suatu tempat di rumah — jadi saat satu dibutuhkan, pencarian dimulai. Brankas memberi satu tempat di mana dokumen benar-benar bisa ditemukan.",
          },
          {
            h2: "Apa itu brankas dokumen keluarga (dan bukan apa)",
            body: "Ini rumah privat dan tertata untuk dokumen penting keluarga, lengkap dengan tenggat dan akses terkendali. Ini bukan cloud umum dan tidak menggantikan dokumen asli — simpan juga yang asli dengan aman.",
          },
          {
            h2: "Apa yang bisa disimpan di sini",
            bullets: [
              "Identitas & migrasi: paspor, KTP, visa, izin tinggal",
              "Medis: hasil lab, laporan, vaksinasi, asuransi",
              "Perjalanan: tiket, pemesanan, asuransi, surat persetujuan",
              "Properti & kendaraan: kontrak, registrasi, surat kepemilikan",
              "Pendidikan: ijazah, sertifikat, dokumen pendaftaran",
            ],
          },
          {
            h2: "Satu profil untuk tiap anggota keluarga",
            body: "Buat profil terpisah untuk pasangan, anak, dan orang tua, agar dokumen tiap orang tetap menyatu dan tidak tercampur.",
          },
          {
            h2: "Jangan pernah lewatkan tanggal kedaluwarsa",
            body: "Tambahkan dokumen, isi tanggal “berlaku sampai”, dan pengingat tiba lewat email sebelum kedaluwarsa — untuk tiap anggota keluarga.",
          },
          {
            h2: "Berbagi aman, cabut kapan saja",
            body: "Kirim dokumen lewat tautan yang kedaluwarsa dan bisa dicabut kapan saja, dengan batas tampilan dan catatan tiap pembukaan. Penerima tidak perlu akun.",
          },
          {
            h2: "Privasi dan keamanan Anda",
            body: "Dokumen tersimpan di penyimpanan privat pada Supabase, ditransfer lewat HTTPS, dengan akses diisolasi untuk keluarga Anda di tingkat basis data (RLS). Peran menentukan siapa owner, editor, atau viewer, dan login dua faktor tersedia.",
          },
        ],
        trustHeading: "Dibuat agar dokumen keluarga tetap privat",
        trust: [
          "Hanya keluarga Anda yang melihat dokumen (isolasi di tingkat basis data, RLS).",
          "Berkas di bucket privat, ditransfer lewat HTTPS; login dua faktor tersedia.",
          "Kami tidak menjual data Anda, dan Doki.help tidak menggantikan dokumen asli.",
          "Doki.help masih beta.",
        ],
        faqHeading: "Pertanyaan umum",
        faq: [
          {
            q: "Siapa yang bisa melihat dokumen keluarga kami?",
            a: "Hanya orang di keluarga yang Anda undang. Akses diisolasi di tingkat basis data (RLS), jadi tidak ada pihak luar yang bisa melihat dokumen Anda.",
          },
          {
            q: "Apakah gratis?",
            a: "Ya. Tier gratis mencakup penyimpanan 2 GB, pengingat kedaluwarsa, akses keluarga, dan akses offline. Tier berbayar mungkin hadir nanti, dan yang gratis sekarang tetap gratis.",
          },
          {
            q: "Apa bedanya dengan Google Drive?",
            a: "Cloud umum menyimpan berkas; brankas dokumen menambah tipe dokumen, pengingat kedaluwarsa, profil tiap anggota keluarga, dan berbagi satu dokumen yang bisa dicabut. Dibuat untuk dokumen penting, bukan untuk segalanya.",
          },
          {
            q: "Bisakah menambahkan pasangan dan anak?",
            a: "Bisa. Undang mereka lewat tautan dan tetapkan peran — owner, editor, atau viewer — agar tiap orang punya tingkat akses yang tepat.",
          },
          {
            q: "Apa yang terjadi pada data saya jika saya berhenti?",
            a: "Anda bisa mengunduh dokumen dan menghapus data Anda. Lihat halaman privasi kami untuk cara penghapusannya.",
          },
        ],
      },
      uz: {
        navLabel: "Oilaviy seyf",
        title: "Oilaviy hujjatlar seyfi — xavfsiz va eslatmali",
        metaDescription:
          "Butun oila hujjatlarini bitta maxfiy seyfda saqlang: pasport, tibbiy, viza, sugʻurta. Muddat eslatmalari va xavfsiz ulashish.",
        h1: "Muhim hamma narsa uchun xavfsiz oilaviy hujjatlar seyfi",
        intro:
          "Har bir oila aʼzosining muhim hujjatlarini bitta maxfiy seyfda saqlang — muddat eslatmalari va xavfsiz, bekor qilinadigan ulashish bilan.",
        ctaPrimary: "Oilaviy seyf yaratish",
        sections: [
          {
            h2: "Hozir oilangiz hujjatlari aslida qayerda turibdi?",
            body: "Chatlarda, email ilovalarida, telefon galereyasida va uyda qayerdadir qogʻoz papkada tarqalib ketgan — hujjat kerak boʻlganda qidiruv boshlanadi. Seyf hujjat haqiqatan topiladigan bitta joyni beradi.",
          },
          {
            h2: "Oilaviy hujjatlar seyfi nima (va nima emas)",
            body: "Bu oila muhim hujjatlari uchun maxfiy, tartibli uy — muddatlar va boshqariladigan kirish bilan. Bu umumiy bulut emas va asl hujjatlar oʻrnini bosmaydi — asllarini ham xavfsiz saqlang.",
          },
          {
            h2: "Bu yerda nimani saqlash mumkin",
            bullets: [
              "Shaxsiy guvohnoma va migratsiya: pasportlar, ID-kartalar, vizalar, yashash ruxsatnomalari",
              "Tibbiy: tahlillar, xulosalar, emlashlar, sugʻurta",
              "Sayohat: chiptalar, bronlar, sugʻurta, rozilik xatlari",
              "Mulk va avtomobil: shartnomalar, roʻyxatga olish, mulk hujjatlari",
              "Taʼlim: diplomlar, sertifikatlar, qabul hujjatlari",
            ],
          },
          {
            h2: "Har bir oila aʼzosi uchun profil",
            body: "Turmush oʻrtogʻingiz, bolalar va ota-onangiz uchun alohida profil yarating, har kimning hujjatlari birga tursin va aralashib ketmasin.",
          },
          {
            h2: "Hech qachon muddatni oʻtkazib yubormang",
            body: "Hujjat qoʻshing, “amal qiladi” sanasini kiriting — eslatma muddat tugashidan oldin email orqali keladi, har bir oila aʼzosi uchun.",
          },
          {
            h2: "Xavfsiz ulashing, istalgan vaqt bekor qiling",
            body: "Hujjatni muddati tugaydigan va istalgan vaqt bekor qilinadigan havola bilan yuboring — koʻrishlar chegarasi va har bir ochilish qaydi bilan. Qabul qiluvchiga akkaunt kerak emas.",
          },
          {
            h2: "Sizning maxfiyligingiz va xavfsizligingiz",
            body: "Hujjatlar Supabase’dagi maxfiy omborda saqlanadi, HTTPS orqali uzatiladi, kirish oilangiz darajasida izolyatsiya qilingan (RLS). Rollar kim owner, editor yoki viewer ekanini belgilaydi, ikki bosqichli kirish mavjud.",
          },
        ],
        trustHeading: "Oila hujjatlari maxfiy qolishi uchun yaratilgan",
        trust: [
          "Hujjatlarni faqat oilangiz koʻradi (maʼlumotlar bazasi darajasida izolyatsiya, RLS).",
          "Fayllar maxfiy bucket’da, HTTPS orqali uzatiladi; ikki bosqichli kirish mavjud.",
          "Biz maʼlumotlaringizni sotmaymiz, va Doki.help asl hujjatlar oʻrnini bosmaydi.",
          "Doki.help beta bosqichida.",
        ],
        faqHeading: "Tez-tez beriladigan savollar",
        faq: [
          {
            q: "Oilaviy hujjatlarimizni kim koʻradi?",
            a: "Faqat oilangizga taklif qilgan odamlar. Kirish maʼlumotlar bazasi darajasida izolyatsiya qilingan (RLS), shuning uchun begonalar hujjatlaringizni koʻrmaydi.",
          },
          {
            q: "Bu bepulmi?",
            a: "Ha. Bepul tarif 2 GB ombor, muddat eslatmalari, oilaviy kirish va oflayn kirishni oʻz ichiga oladi. Pulli tarif keyinroq chiqishi mumkin, hozir bepul boʻlgan narsa bepulligicha qoladi.",
          },
          {
            q: "Bu Google Drive’dan nimasi bilan farq qiladi?",
            a: "Umumiy bulut fayllarni saqlaydi; hujjatlar seyfi hujjat turlari, muddat eslatmalari, har bir oila aʼzosi profili va alohida hujjatni bekor qilinadigan ulashishni qoʻshadi. U hamma narsa uchun emas, muhim hujjatlar uchun yaratilgan.",
          },
          {
            q: "Turmush oʻrtogʻim va bolalarimni qoʻshsam boʻladimi?",
            a: "Ha. Ularni havola orqali taklif qiling va rollar tayinlang — owner, editor yoki viewer — har kimda kerakli kirish darajasi boʻlsin.",
          },
          {
            q: "Agar ketib qolsam, maʼlumotlarimga nima boʻladi?",
            a: "Hujjatlaringizni yuklab olib, maʼlumotlaringizni oʻchirishingiz mumkin. Oʻchirish qanday ishlashini maxfiylik sahifasida koʻring.",
          },
        ],
      },
    },
    related: {
      en: [
        { href: "/for/families", label: "For families" },
        { href: "/secure-document-sharing", label: "Secure document sharing" },
      ],
      ru: [
        { href: "/for/families", label: "Для семей" },
        { href: "/secure-document-sharing", label: "Безопасная отправка документов" },
      ],
      id: [
        { href: "/for/families", label: "Untuk keluarga" },
        { href: "/secure-document-sharing", label: "Berbagi dokumen aman" },
      ],
      uz: [
        { href: "/for/families", label: "Oilalar uchun" },
        { href: "/secure-document-sharing", label: "Xavfsiz hujjat ulashish" },
      ],
    },
  },
  "document-expiry-reminder": {
    slug: "document-expiry-reminder",
    emoji: "⏰",
    locales: {
      en: {
        navLabel: "Expiry reminders",
        title: "Document Expiry Reminder App | Doki.help",
        metaDescription:
          "Track expiry dates for passports, visas, insurance and more. Get reminders before renewal becomes urgent — for every family member.",
        h1: "Document expiry reminders for your whole family",
        intro:
          "Track expiry dates for every important document and get a reminder before renewal becomes urgent — for the whole family.",
        ctaPrimary: "Add your first reminder",
        sections: [
          {
            h2: "Why expiry dates are so easy to miss",
            body: "A document's expiry date sits quietly for years and is usually noticed too late — when a trip is booked or a form is due. With every deadline in one place, the date finds you instead of catching you off guard.",
          },
          {
            h2: "Which documents have deadlines worth tracking",
            bullets: [
              "Passports — set a passport expiry reminder",
              "Visas and residence permits — set a visa expiry reminder",
              "Insurance policies — health, travel, car, home",
              "Driver's licenses and ID cards",
              "Certificates, contracts and warranties",
            ],
          },
          {
            h2: "How reminders work",
            body: "Add a document and set its “valid until” date. A reminder then arrives by email before it expires, so you have time to renew without the last-minute rush.",
          },
          {
            h2: "One place for the whole family's deadlines",
            body: "Keep a profile for every family member and track each person's deadlines together, so no one's document slips through the cracks.",
          },
          {
            h2: "Offline access before you travel",
            body: "Save the documents you need to your phone in advance and open them even without a connection — handy at the airport or in roaming.",
          },
          {
            h2: "Privacy and security",
            body: "Reminders are tied to your own vault. Documents live in private storage with access isolated to your family at the database level (row-level security), and your email is used only for notifications.",
          },
        ],
        trustHeading: "Your reminders stay private",
        trust: [
          "Documents and deadlines are visible only to your family (row-level security).",
          "Files live in a private bucket, transferred over HTTPS.",
          "We don't sell your data; Doki.help does not renew documents for you.",
          "Doki.help is in beta.",
        ],
        faqHeading: "FAQ",
        faq: [
          {
            q: "How early will I be reminded?",
            a: "A reminder arrives by email before the “valid until” date you set. The reminder comes 30, 7 and 1 day before that date.",
          },
          {
            q: "How do I set an expiry date?",
            a: "When you upload a document, fill in its “valid until” date. AI field extraction can suggest dates from the document on upload, and you can edit anything by hand.",
          },
          {
            q: "Where do reminders arrive?",
            a: "By email, to the address on your account.",
          },
          {
            q: "Can I track deadlines for my kids too?",
            a: "Yes. Keep a profile for each family member and a reminder for every document.",
          },
          {
            q: "Is it free?",
            a: "Yes. The free tier includes 2 GB of storage, expiry reminders, family access and offline access. A paid tier may come later.",
          },
        ],
      },
      ru: {
        navLabel: "Напоминания о сроках",
        title: "Напоминания о сроках документов | Doki.help",
        metaDescription:
          "Отслеживайте сроки паспортов, виз, страховок и не только. Получайте напоминания до того, как продление станет срочным — для всей семьи.",
        h1: "Напоминания о сроках документов для всей семьи",
        intro:
          "Отслеживайте сроки каждого важного документа и получайте напоминание, пока продление не стало срочным — для всей семьи.",
        ctaPrimary: "Добавить первое напоминание",
        sections: [
          {
            h2: "Почему сроки так легко пропустить",
            body: "Срок документа тихо лежит годами и обычно замечается слишком поздно — когда поездка куплена или подходит дедлайн по бумагам. Когда все сроки в одном месте, дата сама напомнит, а не застанет врасплох.",
          },
          {
            h2: "У каких документов есть сроки, которые стоит отслеживать",
            bullets: [
              "Паспорта — поставьте напоминание о сроке паспорта",
              "Визы и ВНЖ — поставьте напоминание о сроке визы",
              "Страховые полисы — медицинские, travel, авто, жильё",
              "Водительские права и ID-карты",
              "Сертификаты, договоры и гарантии",
            ],
          },
          {
            h2: "Как работают напоминания",
            body: "Добавьте документ и укажите дату «действует до». Напоминание придёт на email заранее, чтобы успеть продлить без спешки в последний момент.",
          },
          {
            h2: "Сроки всей семьи в одном месте",
            body: "Заведите профиль на каждого члена семьи и отслеживайте сроки всех вместе, чтобы ничей документ не остался незамеченным.",
          },
          {
            h2: "Доступ офлайн перед поездкой",
            body: "Сохраните нужные документы на телефон заранее и открывайте их даже без связи — удобно в аэропорту или в роуминге.",
          },
          {
            h2: "Приватность и безопасность",
            body: "Напоминания привязаны к вашему сейфу. Документы лежат в приватном хранилище, доступ изолирован вашей семьёй на уровне базы (RLS), а email используется только для уведомлений.",
          },
        ],
        trustHeading: "Ваши напоминания остаются приватными",
        trust: [
          "Документы и сроки видит только ваша семья (изоляция на уровне базы, RLS).",
          "Файлы — в приватном bucket, передача по HTTPS.",
          "Мы не продаём ваши данные; Doki.help не продлевает документы за вас.",
          "Doki.help в стадии beta.",
        ],
        faqHeading: "Частые вопросы",
        faq: [
          {
            q: "За сколько придёт напоминание?",
            a: "Напоминание приходит на email до указанной вами даты «действует до». Напоминание приходит за 30, 7 и 1 день до этой даты.",
          },
          {
            q: "Как указать дату окончания?",
            a: "При загрузке документа заполните дату «действует до». AI-распознавание может предложить даты из документа при загрузке, а вы можете всё поправить вручную.",
          },
          {
            q: "Куда приходят напоминания?",
            a: "На email, привязанный к вашему аккаунту.",
          },
          {
            q: "Можно отслеживать сроки детей?",
            a: "Да. Заведите профиль на каждого члена семьи и напоминание для каждого документа.",
          },
          {
            q: "Это бесплатно?",
            a: "Да. Бесплатный тариф включает 2 ГБ хранилища, напоминания о сроках, семейный доступ и офлайн-доступ. Платный тариф может появиться позже.",
          },
        ],
      },
      id: {
        navLabel: "Pengingat kedaluwarsa",
        title: "Aplikasi Pengingat Kedaluwarsa Dokumen | Doki.help",
        metaDescription:
          "Pantau tanggal kedaluwarsa paspor, visa, asuransi, dan lainnya. Dapatkan pengingat sebelum perpanjangan mendesak — untuk tiap anggota keluarga.",
        h1: "Pengingat kedaluwarsa dokumen untuk seluruh keluarga",
        intro:
          "Pantau tanggal kedaluwarsa tiap dokumen penting dan dapatkan pengingat sebelum perpanjangan menjadi mendesak — untuk seluruh keluarga.",
        ctaPrimary: "Tambahkan pengingat pertama Anda",
        sections: [
          {
            h2: "Mengapa tanggal kedaluwarsa mudah terlewat",
            body: "Tanggal kedaluwarsa dokumen diam bertahun-tahun dan biasanya baru disadari terlambat — saat tiket sudah dipesan atau formulir jatuh tempo. Dengan semua tenggat di satu tempat, tanggalnya yang mengingatkan Anda, bukan mengejutkan Anda.",
          },
          {
            h2: "Dokumen mana yang tenggatnya layak dipantau",
            bullets: [
              "Paspor — pasang pengingat masa berlaku paspor",
              "Visa dan izin tinggal — pasang pengingat masa berlaku visa",
              "Polis asuransi — kesehatan, perjalanan, mobil, rumah",
              "SIM dan kartu identitas",
              "Sertifikat, kontrak, dan garansi",
            ],
          },
          {
            h2: "Bagaimana pengingat bekerja",
            body: "Tambahkan dokumen dan isi tanggal “berlaku sampai”. Pengingat lalu tiba lewat email sebelum kedaluwarsa, jadi Anda punya waktu memperpanjang tanpa terburu-buru.",
          },
          {
            h2: "Satu tempat untuk tenggat seluruh keluarga",
            body: "Buat profil untuk tiap anggota keluarga dan pantau tenggat tiap orang bersama, agar tidak ada dokumen yang terlewat.",
          },
          {
            h2: "Akses offline sebelum bepergian",
            body: "Simpan dokumen yang Anda butuhkan ke ponsel lebih dulu dan buka tanpa koneksi — berguna di bandara atau saat roaming.",
          },
          {
            h2: "Privasi dan keamanan",
            body: "Pengingat terikat pada brankas Anda sendiri. Dokumen tersimpan di penyimpanan privat dengan akses diisolasi untuk keluarga Anda di tingkat basis data (RLS), dan email Anda hanya dipakai untuk notifikasi.",
          },
        ],
        trustHeading: "Pengingat Anda tetap privat",
        trust: [
          "Dokumen dan tenggat hanya terlihat oleh keluarga Anda (RLS).",
          "Berkas di bucket privat, ditransfer lewat HTTPS.",
          "Kami tidak menjual data Anda; Doki.help tidak memperpanjang dokumen untuk Anda.",
          "Doki.help masih beta.",
        ],
        faqHeading: "Pertanyaan umum",
        faq: [
          {
            q: "Seberapa awal saya akan diingatkan?",
            a: "Pengingat tiba lewat email sebelum tanggal “berlaku sampai” yang Anda tetapkan. Pengingat datang 30, 7, dan 1 hari sebelum tanggal itu.",
          },
          {
            q: "Bagaimana cara menetapkan tanggal kedaluwarsa?",
            a: "Saat mengunggah dokumen, isi tanggal “berlaku sampai”. AI dapat menyarankan tanggal dari dokumen saat diunggah, dan Anda bisa menyuntingnya secara manual.",
          },
          {
            q: "Ke mana pengingat dikirim?",
            a: "Ke email pada akun Anda.",
          },
          {
            q: "Bisakah memantau tenggat anak juga?",
            a: "Bisa. Buat profil untuk tiap anggota keluarga dan pengingat untuk tiap dokumen.",
          },
          {
            q: "Apakah gratis?",
            a: "Ya. Tier gratis mencakup penyimpanan 2 GB, pengingat kedaluwarsa, akses keluarga, dan akses offline. Tier berbayar mungkin hadir nanti.",
          },
        ],
      },
      uz: {
        navLabel: "Muddat eslatmalari",
        title: "Hujjat muddati eslatmasi ilovasi | Doki.help",
        metaDescription:
          "Pasport, viza, sugʻurta va boshqalar muddatini kuzating. Yangilash shoshilinch boʻlishidan oldin eslatma oling — har bir oila aʼzosi uchun.",
        h1: "Butun oilangiz uchun hujjat muddati eslatmalari",
        intro:
          "Har bir muhim hujjat muddatini kuzating va yangilash shoshilinch boʻlishidan oldin eslatma oling — butun oila uchun.",
        ctaPrimary: "Birinchi eslatmani qoʻshish",
        sections: [
          {
            h2: "Nega muddatlarni oʻtkazib yuborish juda oson",
            body: "Hujjat muddati yillab jimgina turadi va odatda juda kech sezilad — chipta olingach yoki hujjat topshirish muddati kelganda. Hamma muddat bitta joyda boʻlsa, sana sizni hayron qoldirmasdan, oʻzi eslatadi.",
          },
          {
            h2: "Qaysi hujjatlarning muddatini kuzatishga arziydi",
            bullets: [
              "Pasportlar — pasport muddati eslatmasini qoʻying",
              "Vizalar va yashash ruxsatnomalari — viza muddati eslatmasini qoʻying",
              "Sugʻurta polislari — tibbiy, sayohat, avto, uy",
              "Haydovchilik guvohnomalari va ID-kartalar",
              "Sertifikatlar, shartnomalar va kafolatlar",
            ],
          },
          {
            h2: "Eslatmalar qanday ishlaydi",
            body: "Hujjat qoʻshing va “amal qiladi” sanasini kiriting. Soʻng eslatma muddat tugashidan oldin email orqali keladi, shunda oxirgi daqiqada shoshilmasdan yangilashga ulguringiz.",
          },
          {
            h2: "Butun oila muddatlari uchun bitta joy",
            body: "Har bir oila aʼzosi uchun profil yarating va har kimning muddatlarini birga kuzating, hech kimning hujjati eʼtibordan chetda qolmasin.",
          },
          {
            h2: "Sayohatdan oldin oflayn kirish",
            body: "Kerakli hujjatlarni telefoningizga oldindan saqlang va aloqasiz ham oching — aeroportda yoki rouming paytida qulay.",
          },
          {
            h2: "Maxfiylik va xavfsizlik",
            body: "Eslatmalar oʻz seyfingizga bogʻlangan. Hujjatlar maxfiy omborda saqlanadi, kirish oilangiz darajasida izolyatsiya qilingan (RLS), email esa faqat bildirishnomalar uchun ishlatiladi.",
          },
        ],
        trustHeading: "Eslatmalaringiz maxfiy qoladi",
        trust: [
          "Hujjat va muddatlarni faqat oilangiz koʻradi (RLS).",
          "Fayllar maxfiy bucket’da, HTTPS orqali uzatiladi.",
          "Biz maʼlumotlaringizni sotmaymiz; Doki.help hujjatlarni siz uchun yangilamaydi.",
          "Doki.help beta bosqichida.",
        ],
        faqHeading: "Tez-tez beriladigan savollar",
        faq: [
          {
            q: "Eslatma qancha oldin keladi?",
            a: "Eslatma siz belgilagan “amal qiladi” sanasidan oldin email orqali keladi. Eslatma shu sanadan 30, 7 va 1 kun oldin keladi.",
          },
          {
            q: "Tugash sanasini qanday belgilayman?",
            a: "Hujjatni yuklashda “amal qiladi” sanasini kiriting. AI yuklash paytida hujjatdan sanalarni taklif qilishi mumkin, hammasini qoʻlda tahrirlashingiz mumkin.",
          },
          {
            q: "Eslatmalar qayerga keladi?",
            a: "Akkauntingizdagi emailga.",
          },
          {
            q: "Bolalarim muddatlarini ham kuzatsa boʻladimi?",
            a: "Ha. Har bir oila aʼzosi uchun profil va har bir hujjat uchun eslatma yarating.",
          },
          {
            q: "Bu bepulmi?",
            a: "Ha. Bepul tarif 2 GB ombor, muddat eslatmalari, oilaviy kirish va oflayn kirishni oʻz ichiga oladi. Pulli tarif keyinroq chiqishi mumkin.",
          },
        ],
      },
    },
    related: {
      en: [
        { href: "/passport-expiry-reminder", label: "Passport expiry reminder" },
        { href: "/family-document-vault", label: "Family document vault" },
      ],
      ru: [
        { href: "/passport-expiry-reminder", label: "Напоминание о сроке паспорта" },
        { href: "/family-document-vault", label: "Семейный сейф документов" },
      ],
      id: [
        { href: "/passport-expiry-reminder", label: "Pengingat masa berlaku paspor" },
        { href: "/family-document-vault", label: "Brankas dokumen keluarga" },
      ],
      uz: [
        { href: "/passport-expiry-reminder", label: "Pasport muddati eslatmasi" },
        { href: "/family-document-vault", label: "Oilaviy hujjatlar seyfi" },
      ],
    },
  },
  "family-document-organizer": {
    slug: "family-document-organizer",
    emoji: "🗂️",
    locales: {
      en: {
        navLabel: "Document organizer",
        title: "Family Document Organizer App | Doki.help",
        metaDescription:
          "Organize your family's documents by member and category, with expiry reminders and secure sharing. Stop digging through chats.",
        h1: "A family document organizer that keeps itself in order",
        intro:
          "Sort your family's documents by member and category, with AI auto-fill, expiry reminders and secure sharing — and stop digging through chats.",
        ctaPrimary: "Start organizing for free",
        sections: [
          {
            h2: "The problem with “I'll sort it later”",
            body: "Documents pile up in chats, email and your phone's gallery, and “later” never comes — until you urgently need one and can't find it. An organizer that keeps order for you breaks that cycle.",
          },
          {
            h2: "Organize by family member, then by category",
            body: "Keep a profile for each family member and file each document under a clear category, so everything has an obvious place and stays there.",
          },
          {
            h2: "Auto-fill with AI when you upload",
            body: "On upload, AI field extraction reads the document and suggests its category, type, number and dates. Every suggestion is fully editable, so you stay in control.",
          },
          {
            h2: "Find any document in seconds",
            body: "Search across everything you've stored — by name, category or member — instead of scrolling through a chat history.",
          },
          {
            h2: "Reminders keep it current",
            body: "Set a “valid until” date on a document and a reminder arrives by email before it expires, so your organized vault never quietly goes out of date.",
          },
          {
            h2: "Privacy and security",
            body: "Documents live in private storage on Supabase with access isolated to your family at the database level (row-level security). AI field extraction processes the file you upload to suggest fields; two-factor login is available.",
          },
        ],
        trustHeading: "Organized and private",
        trust: [
          "Only your family can see the documents (row-level security).",
          "Files live in a private bucket, transferred over HTTPS.",
          "We don't sell your data, and AI suggestions are not professional advice.",
          "Doki.help is in beta.",
        ],
        faqHeading: "FAQ",
        faq: [
          {
            q: "How does auto-categorization work?",
            a: "When you upload a document, AI field extraction suggests its category, type, number and dates. You can edit or replace any of it by hand.",
          },
          {
            q: "Does AI advice replace a professional?",
            a: "No. AI suggestions help you organize and fill in fields — they are not legal, medical or other professional advice.",
          },
          {
            q: "Can I search across everything?",
            a: "Yes. Search your whole vault by name, category or family member to find a document in seconds.",
          },
          {
            q: "Can the whole family use it?",
            a: "Yes. Invite family members with a link and assign roles — owner, editor or viewer.",
          },
          {
            q: "Is it free?",
            a: "Yes. The free tier includes 2 GB of storage, expiry reminders, family access and offline access. A paid tier may come later.",
          },
        ],
      },
      ru: {
        navLabel: "Организатор документов",
        title: "Организатор семейных документов | Doki.help",
        metaDescription:
          "Разложите документы семьи по членам и категориям, с напоминаниями о сроках и безопасной отправкой. Хватит копаться в чатах.",
        h1: "Организатор семейных документов, который сам держит порядок",
        intro:
          "Разложите документы семьи по членам и категориям — с AI-автозаполнением, напоминаниями о сроках и безопасной отправкой. И хватит копаться в чатах.",
        ctaPrimary: "Начать бесплатно",
        sections: [
          {
            h2: "Проблема подхода «разберу потом»",
            body: "Документы копятся в чатах, почте и галерее телефона, а «потом» так и не наступает — пока документ срочно не понадобится и не найдётся. Организатор, который сам держит порядок, разрывает этот круг.",
          },
          {
            h2: "Сортируйте по членам семьи, затем по категориям",
            body: "Заведите профиль на каждого члена семьи и кладите каждый документ в понятную категорию, чтобы у всего было очевидное место — и оно там оставалось.",
          },
          {
            h2: "Автозаполнение с AI при загрузке",
            body: "При загрузке AI-распознавание читает документ и предлагает категорию, тип, номер и даты. Любое предложение можно полностью отредактировать — контроль остаётся за вами.",
          },
          {
            h2: "Найдите любой документ за секунды",
            body: "Ищите по всему, что сохранили — по названию, категории или члену семьи, — вместо прокрутки истории чата.",
          },
          {
            h2: "Напоминания держат всё актуальным",
            body: "Укажите у документа дату «действует до» — и напоминание придёт на email заранее, чтобы упорядоченный сейф не устарел незаметно.",
          },
          {
            h2: "Приватность и безопасность",
            body: "Документы лежат в приватном хранилище на Supabase, доступ изолирован вашей семьёй на уровне базы (RLS). AI-распознавание обрабатывает загруженный файл, чтобы предложить поля; доступен двухфакторный вход.",
          },
        ],
        trustHeading: "Упорядоченно и приватно",
        trust: [
          "Документы видит только ваша семья (изоляция на уровне базы, RLS).",
          "Файлы — в приватном bucket, передача по HTTPS.",
          "Мы не продаём ваши данные, а подсказки AI не являются профессиональной консультацией.",
          "Doki.help в стадии beta.",
        ],
        faqHeading: "Частые вопросы",
        faq: [
          {
            q: "Как работает автокатегоризация?",
            a: "При загрузке документа AI-распознавание предлагает категорию, тип, номер и даты. Всё это можно отредактировать или заменить вручную.",
          },
          {
            q: "Заменяют ли подсказки AI специалиста?",
            a: "Нет. Подсказки AI помогают упорядочить и заполнить поля — это не юридическая, медицинская или иная профессиональная консультация.",
          },
          {
            q: "Можно искать по всему сразу?",
            a: "Да. Ищите по всему сейфу — по названию, категории или члену семьи — и находите документ за секунды.",
          },
          {
            q: "Может пользоваться вся семья?",
            a: "Да. Пригласите членов семьи по ссылке и назначьте роли — owner, editor или viewer.",
          },
          {
            q: "Это бесплатно?",
            a: "Да. Бесплатный тариф включает 2 ГБ хранилища, напоминания о сроках, семейный доступ и офлайн-доступ. Платный тариф может появиться позже.",
          },
        ],
      },
      id: {
        navLabel: "Penata dokumen",
        title: "Aplikasi Penata Dokumen Keluarga | Doki.help",
        metaDescription:
          "Tata dokumen keluarga per anggota dan kategori, dengan pengingat kedaluwarsa dan berbagi aman. Berhenti mengaduk-aduk obrolan.",
        h1: "Penata dokumen keluarga yang menjaga dirinya tetap rapi",
        intro:
          "Tata dokumen keluarga per anggota dan kategori — dengan isian otomatis AI, pengingat kedaluwarsa, dan berbagi aman. Berhenti mengaduk-aduk obrolan.",
        ctaPrimary: "Mulai menata gratis",
        sections: [
          {
            h2: "Masalah dengan “nanti saja saya rapikan”",
            body: "Dokumen menumpuk di obrolan, email, dan galeri ponsel, dan “nanti” tak pernah datang — sampai Anda mendesak membutuhkan satu dan tak menemukannya. Penata yang menjaga kerapian memutus siklus itu.",
          },
          {
            h2: "Tata per anggota keluarga, lalu per kategori",
            body: "Buat profil untuk tiap anggota keluarga dan letakkan tiap dokumen di kategori yang jelas, agar semuanya punya tempat yang pasti dan tetap di sana.",
          },
          {
            h2: "Isian otomatis dengan AI saat mengunggah",
            body: "Saat diunggah, AI membaca dokumen dan menyarankan kategori, tipe, nomor, dan tanggalnya. Setiap saran bisa disunting sepenuhnya, jadi kendali tetap di tangan Anda.",
          },
          {
            h2: "Temukan dokumen apa pun dalam hitungan detik",
            body: "Cari di seluruh yang Anda simpan — berdasarkan nama, kategori, atau anggota — alih-alih menggulir riwayat obrolan.",
          },
          {
            h2: "Pengingat menjaganya tetap terkini",
            body: "Tetapkan tanggal “berlaku sampai” pada dokumen dan pengingat tiba lewat email sebelum kedaluwarsa, agar brankas rapi Anda tidak diam-diam kedaluwarsa.",
          },
          {
            h2: "Privasi dan keamanan",
            body: "Dokumen tersimpan di penyimpanan privat pada Supabase dengan akses diisolasi untuk keluarga Anda di tingkat basis data (RLS). AI memproses berkas yang Anda unggah untuk menyarankan kolom; login dua faktor tersedia.",
          },
        ],
        trustHeading: "Rapi dan privat",
        trust: [
          "Hanya keluarga Anda yang melihat dokumen (RLS).",
          "Berkas di bucket privat, ditransfer lewat HTTPS.",
          "Kami tidak menjual data Anda, dan saran AI bukan nasihat profesional.",
          "Doki.help masih beta.",
        ],
        faqHeading: "Pertanyaan umum",
        faq: [
          {
            q: "Bagaimana kategorisasi otomatis bekerja?",
            a: "Saat Anda mengunggah dokumen, AI menyarankan kategori, tipe, nomor, dan tanggalnya. Anda bisa menyunting atau menggantinya secara manual.",
          },
          {
            q: "Apakah saran AI menggantikan profesional?",
            a: "Tidak. Saran AI membantu menata dan mengisi kolom — itu bukan nasihat hukum, medis, atau profesional lainnya.",
          },
          {
            q: "Bisakah mencari di seluruh dokumen?",
            a: "Bisa. Cari di seluruh brankas berdasarkan nama, kategori, atau anggota keluarga untuk menemukan dokumen dalam hitungan detik.",
          },
          {
            q: "Bisakah seluruh keluarga memakainya?",
            a: "Bisa. Undang anggota keluarga lewat tautan dan tetapkan peran — owner, editor, atau viewer.",
          },
          {
            q: "Apakah gratis?",
            a: "Ya. Tier gratis mencakup penyimpanan 2 GB, pengingat kedaluwarsa, akses keluarga, dan akses offline. Tier berbayar mungkin hadir nanti.",
          },
        ],
      },
      uz: {
        navLabel: "Hujjat tartibchisi",
        title: "Oilaviy hujjat tartibchisi ilovasi | Doki.help",
        metaDescription:
          "Oila hujjatlarini aʼzo va toifaga ajrating, muddat eslatmalari va xavfsiz ulashish bilan. Chatlarni titishni bas qiling.",
        h1: "Oʻzini tartibda saqlaydigan oilaviy hujjat tartibchisi",
        intro:
          "Oila hujjatlarini aʼzo va toifaga ajrating — AI avto-toʻldirish, muddat eslatmalari va xavfsiz ulashish bilan. Chatlarni titishni bas qiling.",
        ctaPrimary: "Bepul tartibga solishni boshlash",
        sections: [
          {
            h2: "“Keyin tartibga solaman” yondashuvi muammosi",
            body: "Hujjatlar chatlar, email va telefon galereyasida toʻplanadi, “keyin” esa hech kelmaydi — toki bittasi shoshilinch kerak boʻlib, topilmay qolguncha. Oʻzi tartib saqlaydigan tartibchi bu doirani uzadi.",
          },
          {
            h2: "Oila aʼzosi boʻyicha, soʻng toifa boʻyicha ajrating",
            body: "Har bir oila aʼzosi uchun profil yarating va har bir hujjatni aniq toifaga joylang, hammasining oʻrni aniq boʻlsin va oʻsha yerda qolsin.",
          },
          {
            h2: "Yuklashda AI bilan avto-toʻldirish",
            body: "Yuklashda AI hujjatni oʻqiydi va uning toifasi, turi, raqami va sanalarini taklif qiladi. Har bir taklifni toʻliq tahrirlash mumkin, nazorat sizda qoladi.",
          },
          {
            h2: "Istalgan hujjatni soniyalarda toping",
            body: "Chat tarixini varaqlash oʻrniga saqlagan hamma narsangiz boʻyicha qidiring — nom, toifa yoki aʼzo boʻyicha.",
          },
          {
            h2: "Eslatmalar hammasini dolzarb saqlaydi",
            body: "Hujjatga “amal qiladi” sanasini qoʻying — eslatma muddat tugashidan oldin email orqali keladi, tartibli seyfingiz sezilmasdan eskirib qolmaydi.",
          },
          {
            h2: "Maxfiylik va xavfsizlik",
            body: "Hujjatlar Supabase’dagi maxfiy omborda saqlanadi, kirish oilangiz darajasida izolyatsiya qilingan (RLS). AI siz yuklagan faylni qayta ishlab, maydonlarni taklif qiladi; ikki bosqichli kirish mavjud.",
          },
        ],
        trustHeading: "Tartibli va maxfiy",
        trust: [
          "Hujjatlarni faqat oilangiz koʻradi (RLS).",
          "Fayllar maxfiy bucket’da, HTTPS orqali uzatiladi.",
          "Biz maʼlumotlaringizni sotmaymiz, AI takliflari esa professional maslahat emas.",
          "Doki.help beta bosqichida.",
        ],
        faqHeading: "Tez-tez beriladigan savollar",
        faq: [
          {
            q: "Avtomatik toifalash qanday ishlaydi?",
            a: "Hujjatni yuklaganingizda AI uning toifasi, turi, raqami va sanalarini taklif qiladi. Hammasini qoʻlda tahrirlash yoki almashtirish mumkin.",
          },
          {
            q: "AI maslahati mutaxassis oʻrnini bosadimi?",
            a: "Yoʻq. AI takliflari tartibga solish va maydonlarni toʻldirishga yordam beradi — bu yuridik, tibbiy yoki boshqa professional maslahat emas.",
          },
          {
            q: "Hamma narsa boʻyicha qidirsa boʻladimi?",
            a: "Ha. Butun seyfingiz boʻyicha nom, toifa yoki oila aʼzosi orqali qidiring va hujjatni soniyalarda toping.",
          },
          {
            q: "Butun oila foydalansa boʻladimi?",
            a: "Ha. Oila aʼzolarini havola orqali taklif qiling va rollar tayinlang — owner, editor yoki viewer.",
          },
          {
            q: "Bu bepulmi?",
            a: "Ha. Bepul tarif 2 GB ombor, muddat eslatmalari, oilaviy kirish va oflayn kirishni oʻz ichiga oladi. Pulli tarif keyinroq chiqishi mumkin.",
          },
        ],
      },
    },
    related: {
      en: [
        { href: "/family-document-vault", label: "Family document vault" },
        { href: "/document-expiry-reminder", label: "Document expiry reminder" },
      ],
      ru: [
        { href: "/family-document-vault", label: "Семейный сейф документов" },
        { href: "/document-expiry-reminder", label: "Напоминания о сроках документов" },
      ],
      id: [
        { href: "/family-document-vault", label: "Brankas dokumen keluarga" },
        { href: "/document-expiry-reminder", label: "Pengingat kedaluwarsa dokumen" },
      ],
      uz: [
        { href: "/family-document-vault", label: "Oilaviy hujjatlar seyfi" },
        { href: "/document-expiry-reminder", label: "Hujjat muddati eslatmasi" },
      ],
    },
  },
  "visa-expiry-reminder": {
    slug: "visa-expiry-reminder",
    emoji: "🛃",
    locales: {
      en: {
        navLabel: "Visa reminders",
        title: "Visa Expiry Reminder & Renewal Tracker | Doki.help",
        metaDescription:
          "Track visa and residence permit expiry dates and get reminders before renewal is due. Keep visas for the whole family in one place.",
        h1: "Visa expiry reminder — never overstay by accident",
        intro:
          "Track visa and residence permit expiry dates in one place and get reminders before renewal is due — for every member of the family.",
        ctaPrimary: "Add a visa reminder",
        sections: [
          {
            h2: "Why visa deadlines are stressful to track",
            body: "A visa or permit deadline rarely announces itself, and the cost of missing it is high. Keep every date in one place with a reminder attached, so renewal never sneaks up on you.",
          },
          {
            h2: "What to store with each visa",
            bullets: [
              "A clear photo or scan of the visa or residence permit",
              "Visa type, number, issue date and expiry date",
              "Linked documents: application confirmations, receipts, appointment letters",
            ],
          },
          {
            h2: "Reminders before renewal is due",
            body: "Add a visa, set its “valid until” date, and the reminder arrives by email before it expires. Doki.help reminds you of the date — it does not advise on immigration requirements, so always check the official rules that apply to you.",
          },
          {
            h2: "Visas for the whole family in one place",
            body: "Keep a profile for every family member — partner, children, parents — so no one's visa or permit slips through the cracks.",
          },
          {
            h2: "Offline access at the border",
            body: "Save the documents you need to your phone in advance and open them even without a connection — at a border crossing or in roaming.",
          },
          {
            h2: "Secure sharing with lawyers or employers",
            body: "Need to send a visa copy to a lawyer or employer? Share a link that expires and can be revoked at any time, with a view limit and each open logged.",
          },
          {
            h2: "Privacy and security",
            body: "Only your family can see the documents (row-level security in the database), files live in private storage over HTTPS, and two-factor login is available.",
          },
        ],
        trustHeading: "Your documents stay private",
        trust: [
          "Only your family can see the documents (row-level security in the database).",
          "Files live in private storage, transferred over HTTPS; two-factor login available.",
          "Doki.help is in beta, does not replace your original documents, and does not give immigration or legal advice.",
        ],
        faqHeading: "FAQ",
        faq: [
          {
            q: "Does Doki.help give immigration advice?",
            a: "No. Doki.help only stores your documents and reminds you of dates. Its AI field suggestions are not legal or immigration advice — always check the official requirements that apply to you.",
          },
          {
            q: "Can I track residence permits too?",
            a: "Yes. Store a residence permit like any other document, set its “valid until” date, and get a reminder before it's due.",
          },
          {
            q: "How early are reminders sent?",
            a: "By email, before the expiry date you set. The reminder comes 30, 7 and 1 day before that date.",
          },
          {
            q: "Can I share my visa securely with a lawyer?",
            a: "Yes. Create a link that expires and can be revoked anytime, with a view limit and an access log — no account needed to open it.",
          },
          {
            q: "Is it free?",
            a: "Yes. The free tier includes 2 GB, reminders, family access and offline access. A paid tier may come later.",
          },
        ],
      },
      ru: {
        navLabel: "Напоминания о визе",
        title: "Напоминание о сроке визы и трекер продления | Doki.help",
        metaDescription:
          "Следите за сроками виз и ВНЖ и получайте напоминания до продления. Храните визы всей семьи в одном месте.",
        h1: "Напоминание о сроке визы — не просрочьте случайно",
        intro:
          "Следите за сроками виз и видов на жительство в одном месте и получайте напоминания до того, как нужно продлевать, — для каждого члена семьи.",
        ctaPrimary: "Добавить напоминание о визе",
        sections: [
          {
            h2: "Почему сроки виз так напрягают",
            body: "Срок визы или разрешения редко напоминает о себе сам, а цена пропуска высока. Держите каждую дату в одном месте с привязанным напоминанием, чтобы продление не застало врасплох.",
          },
          {
            h2: "Что хранить вместе с каждой визой",
            bullets: [
              "Чёткое фото или скан визы либо вида на жительство",
              "Тип визы, номер, дата выдачи и дата окончания",
              "Связанные документы: подтверждения заявок, квитанции, письма о записи",
            ],
          },
          {
            h2: "Напоминания до продления",
            body: "Добавьте визу, укажите дату «действует до» — и напоминание придёт на email заранее. Doki.help напоминает о дате, но не консультирует по миграционным требованиям, поэтому всегда проверяйте официальные правила, которые касаются вас.",
          },
          {
            h2: "Визы всей семьи в одном месте",
            body: "Заведите профиль на каждого — супруга, детей, родителей, — чтобы ничья виза или разрешение не остались незамеченными.",
          },
          {
            h2: "Доступ офлайн на границе",
            body: "Сохраните нужные документы на телефон заранее и открывайте их даже без связи — на границе или в роуминге.",
          },
          {
            h2: "Безопасная отправка юристу или работодателю",
            body: "Нужно отправить копию визы юристу или работодателю? Поделитесь ссылкой, которая истекает и отзывается в любой момент, с лимитом просмотров, а каждое открытие логируется.",
          },
          {
            h2: "Приватность и безопасность",
            body: "Документы видит только ваша семья (изоляция на уровне базы, RLS), файлы — в приватном хранилище по HTTPS, доступен двухфакторный вход.",
          },
        ],
        trustHeading: "Ваши документы остаются приватными",
        trust: [
          "Документы видит только ваша семья (изоляция на уровне базы, RLS).",
          "Файлы — в приватном хранилище, передача по HTTPS; доступен двухфакторный вход.",
          "Doki.help в стадии beta, не заменяет оригиналы документов и не даёт миграционных или юридических советов.",
        ],
        faqHeading: "Частые вопросы",
        faq: [
          {
            q: "Даёт ли Doki.help миграционные советы?",
            a: "Нет. Doki.help только хранит документы и напоминает о датах. Подсказки AI по полям не являются юридической или миграционной консультацией — всегда проверяйте официальные требования, которые касаются вас.",
          },
          {
            q: "Можно ли вести виды на жительство?",
            a: "Да. Храните ВНЖ как любой другой документ, укажите дату «действует до» и получайте напоминание заранее.",
          },
          {
            q: "За сколько приходят напоминания?",
            a: "На email, до указанной вами даты окончания. Напоминание приходит за 30, 7 и 1 день до этой даты.",
          },
          {
            q: "Можно ли безопасно поделиться визой с юристом?",
            a: "Да. Создайте ссылку, которая истекает и отзывается в любой момент, с лимитом просмотров и логом доступа — для открытия аккаунт не нужен.",
          },
          {
            q: "Это бесплатно?",
            a: "Да. Бесплатный тариф включает 2 ГБ, напоминания, семейный доступ и офлайн-доступ. Платный тариф может появиться позже.",
          },
        ],
      },
      id: {
        navLabel: "Pengingat visa",
        title: "Pengingat Masa Berlaku Visa & Pelacak | Doki.help",
        metaDescription:
          "Pantau masa berlaku visa dan izin tinggal serta dapatkan pengingat sebelum perpanjangan. Simpan visa seluruh keluarga di satu tempat.",
        h1: "Pengingat masa berlaku visa — jangan overstay tanpa sengaja",
        intro:
          "Pantau tanggal kedaluwarsa visa dan izin tinggal di satu tempat dan dapatkan pengingat sebelum perpanjangan jatuh tempo — untuk tiap anggota keluarga.",
        ctaPrimary: "Tambahkan pengingat visa",
        sections: [
          {
            h2: "Mengapa tenggat visa bikin stres",
            body: "Tenggat visa atau izin jarang mengingatkan dirinya sendiri, padahal akibat terlewat itu mahal. Simpan tiap tanggal di satu tempat dengan pengingat terpasang, agar perpanjangan tak datang mendadak.",
          },
          {
            h2: "Apa yang disimpan bersama tiap visa",
            bullets: [
              "Foto atau pindaian visa atau izin tinggal yang jelas",
              "Jenis visa, nomor, tanggal terbit dan tanggal kedaluwarsa",
              "Dokumen terkait: konfirmasi pengajuan, kuitansi, surat janji temu",
            ],
          },
          {
            h2: "Pengingat sebelum perpanjangan jatuh tempo",
            body: "Tambahkan visa, isi tanggal “berlaku sampai”, dan pengingat tiba lewat email sebelum kedaluwarsa. Doki.help mengingatkan tanggal — bukan memberi nasihat persyaratan imigrasi, jadi selalu periksa aturan resmi yang berlaku bagi Anda.",
          },
          {
            h2: "Visa seluruh keluarga di satu tempat",
            body: "Buat profil untuk tiap anggota keluarga — pasangan, anak, orang tua — agar tidak ada visa atau izin yang terlewat.",
          },
          {
            h2: "Akses offline di perbatasan",
            body: "Simpan dokumen yang Anda butuhkan ke ponsel lebih dulu dan buka tanpa koneksi — di pos perbatasan atau saat roaming.",
          },
          {
            h2: "Berbagi aman dengan pengacara atau pemberi kerja",
            body: "Perlu mengirim salinan visa ke pengacara atau pemberi kerja? Bagikan tautan yang kedaluwarsa dan bisa dicabut kapan saja, dengan batas tampilan, dan setiap pembukaan tercatat.",
          },
          {
            h2: "Privasi dan keamanan",
            body: "Hanya keluarga Anda yang melihat dokumen (isolasi di tingkat basis data, RLS), berkas di penyimpanan privat lewat HTTPS, dan login dua faktor tersedia.",
          },
        ],
        trustHeading: "Dokumen Anda tetap privat",
        trust: [
          "Hanya keluarga Anda yang melihat dokumen (isolasi di tingkat basis data, RLS).",
          "Berkas di penyimpanan privat, ditransfer lewat HTTPS; login dua faktor tersedia.",
          "Doki.help masih beta, tidak menggantikan dokumen asli, dan tidak memberi nasihat imigrasi atau hukum.",
        ],
        faqHeading: "Pertanyaan umum",
        faq: [
          {
            q: "Apakah Doki.help memberi nasihat imigrasi?",
            a: "Tidak. Doki.help hanya menyimpan dokumen dan mengingatkan tanggal. Saran kolom dari AI bukan nasihat hukum atau imigrasi — selalu periksa persyaratan resmi yang berlaku bagi Anda.",
          },
          {
            q: "Bisakah memantau izin tinggal juga?",
            a: "Bisa. Simpan izin tinggal seperti dokumen lain, isi tanggal “berlaku sampai”, dan dapatkan pengingat sebelum jatuh tempo.",
          },
          {
            q: "Seberapa awal pengingat dikirim?",
            a: "Lewat email, sebelum tanggal kedaluwarsa yang Anda tetapkan. Pengingat datang 30, 7, dan 1 hari sebelum tanggal itu.",
          },
          {
            q: "Bisakah berbagi visa dengan pengacara secara aman?",
            a: "Bisa. Buat tautan yang kedaluwarsa dan bisa dicabut kapan saja, dengan batas tampilan dan catatan akses — tanpa perlu akun untuk membukanya.",
          },
          {
            q: "Apakah gratis?",
            a: "Ya. Paket gratis mencakup 2 GB, pengingat, akses keluarga dan akses offline. Paket berbayar mungkin hadir nanti.",
          },
        ],
      },
      uz: {
        navLabel: "Viza eslatmalari",
        title: "Viza muddati eslatmasi va yangilash kuzatuvi | Doki.help",
        metaDescription:
          "Viza va yashash ruxsati muddatini kuzating va yangilashdan oldin eslatma oling. Oilaning vizalarini bitta joyda saqlang.",
        h1: "Viza muddati eslatmasi — tasodifan muddatdan oshib ketmang",
        intro:
          "Viza va yashash ruxsati muddatlarini bitta joyda kuzating va yangilash vaqti kelishidan oldin eslatma oling — har bir oila aʼzosi uchun.",
        ctaPrimary: "Viza eslatmasini qoʻshish",
        sections: [
          {
            h2: "Nega viza muddatlari asabni buzadi",
            body: "Viza yoki ruxsat muddati kamdan-kam oʻzi eslatadi, oʻtkazib yuborishning narxi esa baland. Har bir sanani eslatma bilan bitta joyda saqlang, shunda yangilash kutilmaganda kelmaydi.",
          },
          {
            h2: "Har bir viza bilan nimani saqlash kerak",
            bullets: [
              "Viza yoki yashash ruxsatining aniq surati yoki skani",
              "Viza turi, raqami, berilgan va tugash sanasi",
              "Bogʻliq hujjatlar: ariza tasdiqlari, kvitansiyalar, uchrashuv xatlari",
            ],
          },
          {
            h2: "Yangilashdan oldin eslatmalar",
            body: "Viza qoʻshing, “amal qiladi” sanasini kiriting — eslatma muddat tugashidan oldin email orqali keladi. Doki.help sanani eslatadi, migratsiya talablari boʻyicha maslahat bermaydi, shuning uchun sizga tegishli rasmiy qoidalarni doim tekshiring.",
          },
          {
            h2: "Butun oila vizalari bitta joyda",
            body: "Har bir aʼzo uchun profil yarating — turmush oʻrtogʻingiz, bolalar, ota-onangiz — hech kimning vizasi yoki ruxsati eʼtibordan chetda qolmaydi.",
          },
          {
            h2: "Chegarada oflayn kirish",
            body: "Kerakli hujjatlarni oldindan telefoningizga saqlang va aloqasiz ham oching — chegara oʻtish punktida yoki rouming paytida.",
          },
          {
            h2: "Yurist yoki ish beruvchi bilan xavfsiz ulashish",
            body: "Viza nusxasini yurist yoki ish beruvchiga yuborish kerakmi? Muddati tugaydigan va istalgan vaqt bekor qilinadigan havola ulashing, koʻrish limiti bilan, har bir ochilish qayd etiladi.",
          },
          {
            h2: "Maxfiylik va xavfsizlik",
            body: "Hujjatlarni faqat oilangiz koʻradi (maʼlumotlar bazasi darajasida izolyatsiya, RLS), fayllar maxfiy omborda HTTPS orqali, ikki bosqichli kirish mavjud.",
          },
        ],
        trustHeading: "Hujjatlaringiz maxfiy qoladi",
        trust: [
          "Hujjatlarni faqat oilangiz koʻradi (maʼlumotlar bazasi darajasida izolyatsiya, RLS).",
          "Fayllar maxfiy omborda, HTTPS orqali uzatiladi; ikki bosqichli kirish mavjud.",
          "Doki.help beta bosqichida, asl hujjatlar oʻrnini bosmaydi va migratsiya yoki yuridik maslahat bermaydi.",
        ],
        faqHeading: "Tez-tez beriladigan savollar",
        faq: [
          {
            q: "Doki.help migratsiya boʻyicha maslahat beradimi?",
            a: "Yoʻq. Doki.help faqat hujjatlarni saqlaydi va sanalarni eslatadi. AI ning maydon takliflari yuridik yoki migratsiya maslahati emas — sizga tegishli rasmiy talablarni doim tekshiring.",
          },
          {
            q: "Yashash ruxsatlarini ham kuzatsa boʻladimi?",
            a: "Ha. Yashash ruxsatini har qanday hujjat kabi saqlang, “amal qiladi” sanasini kiriting va muddat kelishidan oldin eslatma oling.",
          },
          {
            q: "Eslatmalar qancha oldin keladi?",
            a: "Email orqali, siz belgilagan tugash sanasidan oldin. Eslatma shu sanadan 30, 7 va 1 kun oldin keladi.",
          },
          {
            q: "Vizani yurist bilan xavfsiz ulashsa boʻladimi?",
            a: "Ha. Muddati tugaydigan va istalgan vaqt bekor qilinadigan havola yarating, koʻrish limiti va kirish jurnali bilan — uni ochish uchun akkaunt kerak emas.",
          },
          {
            q: "Bu bepulmi?",
            a: "Ha. Bepul tarif 2 GB, eslatmalar, oilaviy kirish va oflayn kirishni oʻz ichiga oladi. Pullik tarif keyinroq paydo boʻlishi mumkin.",
          },
        ],
      },
    },
    related: {
      en: [
        { href: "/expat-document-organizer", label: "Expat document organizer" },
        { href: "/for/expats", label: "For expats" },
      ],
      ru: [
        { href: "/expat-document-organizer", label: "Документы экспата" },
        { href: "/for/expats", label: "Для экспатов" },
      ],
      id: [
        { href: "/expat-document-organizer", label: "Penata dokumen ekspat" },
        { href: "/for/expats", label: "Untuk ekspat" },
      ],
      uz: [
        { href: "/expat-document-organizer", label: "Ekspat hujjatlari tartibi" },
        { href: "/for/expats", label: "Ekspatlar uchun" },
      ],
    },
  },
  "secure-document-sharing": {
    slug: "secure-document-sharing",
    emoji: "🔗",
    locales: {
      en: {
        navLabel: "Secure sharing",
        title: "Secure Document Sharing with Expiring Links",
        metaDescription:
          "Send documents with a private link that expires and can be revoked anytime. View limits and access logs included. No more open chats.",
        h1: "Share sensitive documents securely — and take access back",
        intro:
          "Send a document with a private link that expires and can be revoked at any time — with a view limit and a log of every open.",
        ctaPrimary: "Create a secure link",
        sections: [
          {
            h2: "Why sending documents over chat or email is risky",
            body: "Once a document lands in a chat or inbox, it stays there for good — forwarded, screenshotted, out of your hands. A share link puts you back in control of who sees it and for how long.",
          },
          {
            h2: "How secure sharing works",
            bullets: [
              "Expiring link — it stops working after the time you set",
              "View limit — cap how many times it can be opened",
              "Revoke anytime — cut off access with one click, even after sending",
              "Access log — see each time the link is opened",
            ],
          },
          {
            h2: "When you'd use it",
            body: "Send a record to a doctor, a statement to a bank, a contract to a lawyer, a form to a school, or a copy to a relative — without leaving it sitting in a chat forever.",
          },
          {
            h2: "Share without giving full access",
            body: "A share link exposes only the one document you pick — not your vault. For people who need ongoing access, invite them to the family with an owner, editor or viewer role instead.",
          },
          {
            h2: "No account needed to open",
            body: "The recipient opens a public share page in their browser — no sign-up, no app. You stay in control of the link's lifetime and can revoke it whenever you want.",
          },
          {
            h2: "Privacy and security",
            body: "Your documents live in private storage over HTTPS, only your family can see your vault (row-level security), and two-factor login is available.",
          },
        ],
        trustHeading: "You stay in control of every link",
        trust: [
          "Links expire, carry a view limit, and can be revoked at any time.",
          "Every open is logged; files live in private storage over HTTPS.",
          "Doki.help is in beta and does not replace your original documents.",
        ],
        faqHeading: "FAQ",
        faq: [
          {
            q: "Can I revoke a link after sending it?",
            a: "Yes. You can revoke a share link at any time, even after it's been opened — access stops immediately.",
          },
          {
            q: "Does the recipient need an account?",
            a: "No. The link opens a public share page in any browser, with no sign-up required.",
          },
          {
            q: "Can I limit how many times it's opened?",
            a: "Yes. Each link can carry a view limit, so it stops working after that many opens.",
          },
          {
            q: "Will I know if someone opened it?",
            a: "Yes. Every open is recorded in an access log for that link — you can see which document was opened and when.",
          },
          {
            q: "Do links expire automatically?",
            a: "Yes. You set an expiry, and the link stops working after that — you can also revoke it sooner.",
          },
        ],
      },
      ru: {
        navLabel: "Безопасный доступ",
        title: "Безопасная передача документов по ссылкам",
        metaDescription:
          "Отправляйте документы по приватной ссылке, которая истекает и отзывается в любой момент. Лимит просмотров и лог доступа. Без открытых чатов.",
        h1: "Делитесь важными документами безопасно — и забирайте доступ обратно",
        intro:
          "Отправляйте документ по приватной ссылке, которая истекает и отзывается в любой момент — с лимитом просмотров и логом каждого открытия.",
        ctaPrimary: "Создать безопасную ссылку",
        sections: [
          {
            h2: "Почему отправлять документы в чате или почте рискованно",
            body: "Попав в чат или почту, документ остаётся там навсегда — его пересылают, делают скриншоты, он уходит из-под контроля. Ссылка возвращает вам контроль над тем, кто и сколько его видит.",
          },
          {
            h2: "Как работает безопасный доступ",
            bullets: [
              "Истекающая ссылка — перестаёт работать после заданного срока",
              "Лимит просмотров — ограничьте число открытий",
              "Отзыв в любой момент — обрубите доступ одним кликом, даже после отправки",
              "Лог доступа — видно каждое открытие ссылки",
            ],
          },
          {
            h2: "Когда это пригодится",
            body: "Отправьте выписку врачу, справку в банк, договор юристу, форму в школу или копию родственнику — не оставляя её навсегда в чате.",
          },
          {
            h2: "Поделиться без полного доступа",
            body: "Ссылка открывает только выбранный документ — не весь сейф. Тем, кому нужен постоянный доступ, выдайте роль owner, editor или viewer в семье.",
          },
          {
            h2: "Для открытия аккаунт не нужен",
            body: "Получатель открывает публичную страницу в браузере — без регистрации и приложений. Срок жизни ссылки контролируете вы и можете отозвать её когда угодно.",
          },
          {
            h2: "Приватность и безопасность",
            body: "Документы — в приватном хранилище по HTTPS, ваш сейф видит только семья (RLS), доступен двухфакторный вход.",
          },
        ],
        trustHeading: "Каждая ссылка под вашим контролем",
        trust: [
          "Ссылки истекают, имеют лимит просмотров и отзываются в любой момент.",
          "Каждое открытие логируется; файлы — в приватном хранилище по HTTPS.",
          "Doki.help в стадии beta и не заменяет оригиналы документов.",
        ],
        faqHeading: "Частые вопросы",
        faq: [
          {
            q: "Можно отозвать ссылку после отправки?",
            a: "Да. Ссылку можно отозвать в любой момент, даже после того как её открыли, — доступ прекращается сразу.",
          },
          {
            q: "Нужен ли получателю аккаунт?",
            a: "Нет. Ссылка открывает публичную страницу в любом браузере, без регистрации.",
          },
          {
            q: "Можно ограничить число открытий?",
            a: "Да. У каждой ссылки можно задать лимит просмотров, после которого она перестаёт работать.",
          },
          {
            q: "Узнаю ли я, что кто-то открыл?",
            a: "Да. Каждое открытие фиксируется в логе доступа этой ссылки — видно, какой документ открывали и когда.",
          },
          {
            q: "Истекают ли ссылки автоматически?",
            a: "Да. Вы задаёте срок, после которого ссылка перестаёт работать, — можно отозвать и раньше.",
          },
        ],
      },
      id: {
        navLabel: "Berbagi aman",
        title: "Berbagi Dokumen Aman dengan Tautan Kedaluwarsa",
        metaDescription:
          "Kirim dokumen lewat tautan privat yang kedaluwarsa dan bisa dicabut kapan saja. Batas tampilan dan catatan akses. Tanpa chat terbuka lagi.",
        h1: "Bagikan dokumen sensitif dengan aman — dan tarik kembali aksesnya",
        intro:
          "Kirim dokumen lewat tautan privat yang kedaluwarsa dan bisa dicabut kapan saja — dengan batas tampilan dan catatan tiap pembukaan.",
        ctaPrimary: "Buat tautan aman",
        sections: [
          {
            h2: "Mengapa mengirim dokumen lewat chat atau email berisiko",
            body: "Begitu dokumen masuk ke chat atau kotak masuk, ia menetap selamanya — diteruskan, di-screenshot, lepas dari kendali Anda. Tautan berbagi mengembalikan kendali atas siapa yang melihat dan berapa lama.",
          },
          {
            h2: "Cara kerja berbagi aman",
            bullets: [
              "Tautan kedaluwarsa — berhenti bekerja setelah waktu yang Anda tetapkan",
              "Batas tampilan — batasi berapa kali bisa dibuka",
              "Cabut kapan saja — putus akses dengan satu klik, bahkan setelah dikirim",
              "Catatan akses — lihat tiap kali tautan dibuka",
            ],
          },
          {
            h2: "Kapan Anda memakainya",
            body: "Kirim hasil ke dokter, rekening ke bank, kontrak ke pengacara, formulir ke sekolah, atau salinan ke kerabat — tanpa membiarkannya menumpuk di chat selamanya.",
          },
          {
            h2: "Berbagi tanpa memberi akses penuh",
            body: "Tautan berbagi hanya menampilkan satu dokumen yang Anda pilih — bukan seluruh brankas. Untuk yang butuh akses berkelanjutan, undang mereka ke keluarga dengan peran owner, editor atau viewer.",
          },
          {
            h2: "Tanpa akun untuk membukanya",
            body: "Penerima membuka halaman berbagi publik di browser — tanpa daftar, tanpa aplikasi. Anda mengendalikan masa berlaku tautan dan bisa mencabutnya kapan pun.",
          },
          {
            h2: "Privasi dan keamanan",
            body: "Dokumen Anda di penyimpanan privat lewat HTTPS, hanya keluarga Anda yang melihat brankas (RLS), dan login dua faktor tersedia.",
          },
        ],
        trustHeading: "Anda mengendalikan setiap tautan",
        trust: [
          "Tautan kedaluwarsa, punya batas tampilan, dan bisa dicabut kapan saja.",
          "Tiap pembukaan tercatat; berkas di penyimpanan privat lewat HTTPS.",
          "Doki.help masih beta dan tidak menggantikan dokumen asli Anda.",
        ],
        faqHeading: "Pertanyaan umum",
        faq: [
          {
            q: "Bisakah mencabut tautan setelah dikirim?",
            a: "Bisa. Anda dapat mencabut tautan berbagi kapan saja, bahkan setelah dibuka — akses langsung berhenti.",
          },
          {
            q: "Apakah penerima butuh akun?",
            a: "Tidak. Tautan membuka halaman berbagi publik di browser mana pun, tanpa perlu mendaftar.",
          },
          {
            q: "Bisakah membatasi berapa kali dibuka?",
            a: "Bisa. Tiap tautan bisa diberi batas tampilan, sehingga berhenti bekerja setelah sekian pembukaan.",
          },
          {
            q: "Apakah saya tahu jika seseorang membukanya?",
            a: "Ya. Tiap pembukaan dicatat dalam log akses tautan itu — Anda bisa melihat dokumen mana yang dibuka dan kapan.",
          },
          {
            q: "Apakah tautan kedaluwarsa otomatis?",
            a: "Ya. Anda menetapkan masa berlaku, dan tautan berhenti bekerja sesudahnya — bisa juga dicabut lebih awal.",
          },
        ],
      },
      uz: {
        navLabel: "Xavfsiz ulashish",
        title: "Muddatli havolalar bilan hujjatlarni xavfsiz ulashish",
        metaDescription:
          "Hujjatlarni muddati tugaydigan va istalgan vaqt bekor qilinadigan maxfiy havola orqali yuboring. Koʻrish limiti va kirish jurnali. Ochiq chatlarsiz.",
        h1: "Maxfiy hujjatlarni xavfsiz ulashing — va kirishni qaytarib oling",
        intro:
          "Hujjatni muddati tugaydigan va istalgan vaqt bekor qilinadigan maxfiy havola orqali yuboring — koʻrish limiti va har bir ochilish jurnali bilan.",
        ctaPrimary: "Xavfsiz havola yaratish",
        sections: [
          {
            h2: "Nega chat yoki email orqali hujjat yuborish xavfli",
            body: "Hujjat chat yoki pochtaga tushgach, u abadiy qoladi — yuboriladi, skrinshot olinadi, nazoratdan chiqadi. Havola kim va qancha vaqt koʻrishi ustidan nazoratni sizga qaytaradi.",
          },
          {
            h2: "Xavfsiz ulashish qanday ishlaydi",
            bullets: [
              "Muddatli havola — siz belgilagan vaqtdan keyin ishlamay qoladi",
              "Koʻrish limiti — necha marta ochilishini cheklang",
              "Istalgan vaqt bekor qilish — yuborilgandan keyin ham bir bosishda kirishni uzing",
              "Kirish jurnali — havola har ochilganini koʻring",
            ],
          },
          {
            h2: "Qachon foydalanasiz",
            body: "Tahlilni shifokorga, maʼlumotnomani bankka, shartnomani yuristga, anketani maktabga yoki nusxani qarindoshga yuboring — uni chatda abadiy qoldirmasdan.",
          },
          {
            h2: "Toʻliq kirish bermasdan ulashish",
            body: "Havola faqat siz tanlagan bitta hujjatni koʻrsatadi — butun omborni emas. Doimiy kirish kerak boʻlganlarga oilaga owner, editor yoki viewer roli bilan taklif yuboring.",
          },
          {
            h2: "Ochish uchun akkaunt kerak emas",
            body: "Qabul qiluvchi brauzerda ommaviy ulashish sahifasini ochadi — roʻyxatdan oʻtmasdan, ilovasiz. Havolaning amal qilish muddatini siz boshqarasiz va istalgan vaqt bekor qilishingiz mumkin.",
          },
          {
            h2: "Maxfiylik va xavfsizlik",
            body: "Hujjatlaringiz maxfiy omborda HTTPS orqali, omborni faqat oilangiz koʻradi (RLS), ikki bosqichli kirish mavjud.",
          },
        ],
        trustHeading: "Har bir havola sizning nazoratingizda",
        trust: [
          "Havolalar muddati tugaydi, koʻrish limiti bor va istalgan vaqt bekor qilinadi.",
          "Har bir ochilish qayd etiladi; fayllar maxfiy omborda HTTPS orqali.",
          "Doki.help beta bosqichida va asl hujjatlaringiz oʻrnini bosmaydi.",
        ],
        faqHeading: "Tez-tez beriladigan savollar",
        faq: [
          {
            q: "Havolani yuborgandan keyin bekor qilsa boʻladimi?",
            a: "Ha. Ulashish havolasini istalgan vaqt, hatto ochilgandan keyin ham bekor qilishingiz mumkin — kirish darhol toʻxtaydi.",
          },
          {
            q: "Qabul qiluvchiga akkaunt kerakmi?",
            a: "Yoʻq. Havola istalgan brauzerda ommaviy ulashish sahifasini ochadi, roʻyxatdan oʻtish shart emas.",
          },
          {
            q: "Necha marta ochilishini cheklasa boʻladimi?",
            a: "Ha. Har bir havolaga koʻrish limiti qoʻyish mumkin, shu sondan keyin u ishlamay qoladi.",
          },
          {
            q: "Kimdir ochganini bilamanmi?",
            a: "Ha. Har bir ochilish oʻsha havolaning kirish jurnalida qayd etiladi — qaysi hujjat qachon ochilganini koʻrasiz.",
          },
          {
            q: "Havolalar avtomatik muddati tugaydimi?",
            a: "Ha. Siz muddat belgilaysiz, undan keyin havola ishlamaydi — uni ertaroq ham bekor qilsa boʻladi.",
          },
        ],
      },
    },
    related: {
      en: [
        { href: "/family-document-vault", label: "Family document vault" },
        { href: "/medical-document-organizer", label: "Medical document organizer" },
      ],
      ru: [
        { href: "/family-document-vault", label: "Семейный сейф документов" },
        { href: "/medical-document-organizer", label: "Медицинские документы" },
      ],
      id: [
        { href: "/family-document-vault", label: "Brankas dokumen keluarga" },
        { href: "/medical-document-organizer", label: "Penata dokumen medis" },
      ],
      uz: [
        { href: "/family-document-vault", label: "Oilaviy hujjatlar ombori" },
        { href: "/medical-document-organizer", label: "Tibbiy hujjatlar tartibi" },
      ],
    },
  },
  "expat-document-organizer": {
    slug: "expat-document-organizer",
    emoji: "🌍",
    locales: {
      en: {
        navLabel: "Expat documents",
        title: "Expat Document Organizer | Doki.help",
        metaDescription:
          "Keep visas, residence permits, translations and family documents in one place. Renewal reminders and secure sharing for life abroad.",
        h1: "An expat document organizer for life abroad",
        intro:
          "Keep visas, residence permits, translations and family documents in one place — with renewal reminders and secure sharing for life abroad.",
        ctaPrimary: "Build your expat document vault",
        sections: [
          {
            h2: "Life abroad means more documents, more deadlines",
            body: "Moving abroad multiplies the paperwork — and the deadlines that come with it. Keep every document in one place with dates attached, so renewals find you instead of surprising you.",
          },
          {
            h2: "What expats keep here",
            bullets: [
              "Visas and residence permits",
              "Translations and apostilles",
              "Insurance and bank documents",
              "Family documents for everyone abroad with you",
            ],
          },
          {
            h2: "Renewal reminders before deadlines hit",
            body: "Set a “valid until” date on a visa or permit and the reminder arrives by email before it's due. Doki.help reminds you of the date — it does not give immigration or legal advice, so always check the official requirements that apply to you.",
          },
          {
            h2: "Documents for the whole family abroad",
            body: "Keep a profile for every family member — partner, children, parents — so no one's permit or document slips through the cracks while you're settling in.",
          },
          {
            h2: "Share securely with lawyers and authorities",
            body: "Send a document to a lawyer or an office with a link that expires and can be revoked at any time, with a view limit and each open logged.",
          },
          {
            h2: "Privacy and security",
            body: "Only your family can see your documents (row-level security), files live in private storage over HTTPS, and two-factor login is available.",
          },
        ],
        trustHeading: "Your documents stay private",
        trust: [
          "Only your family can see the documents (row-level security in the database).",
          "Files live in private storage, transferred over HTTPS; two-factor login available.",
          "Doki.help is in beta, does not replace your original documents, and does not give immigration or legal advice.",
        ],
        faqHeading: "FAQ",
        faq: [
          {
            q: "Does Doki.help help with immigration or legal advice?",
            a: "No. Doki.help only stores your documents and reminds you of dates. Its AI field suggestions are not legal or immigration advice — always check the official requirements that apply to you.",
          },
          {
            q: "Can I track residence permit renewals?",
            a: "Yes. Store a residence permit, set its “valid until” date, and get a reminder by email before renewal is due.",
          },
          {
            q: "Can I store translations and apostilles?",
            a: "Yes. Keep translations, apostilles and the originals they belong to together, organized by family member.",
          },
          {
            q: "Can I share documents with a lawyer securely?",
            a: "Yes. Create a link that expires and can be revoked anytime, with a view limit and an access log — no account needed to open it.",
          },
          {
            q: "Is it free?",
            a: "Yes. The free tier includes 2 GB, reminders, family access and offline access. A paid tier may come later. Documents are stored in secure cloud (Supabase); servers may be located outside Russia — see our Privacy Policy.",
          },
        ],
      },
      ru: {
        navLabel: "Документы экспата",
        title: "Документы экспата — органайзер | Doki.help",
        metaDescription:
          "Храните визы, ВНЖ, переводы и семейные документы в одном месте. Напоминания о продлении и безопасный доступ для жизни за рубежом.",
        h1: "Органайзер документов экспата для жизни за рубежом",
        intro:
          "Храните визы, виды на жительство, переводы и семейные документы в одном месте — с напоминаниями о продлении и безопасным доступом для жизни за рубежом.",
        ctaPrimary: "Собрать сейф документов экспата",
        sections: [
          {
            h2: "Жизнь за рубежом — больше документов и сроков",
            body: "Переезд за границу умножает бумаги — и связанные с ними сроки. Держите каждый документ в одном месте с привязанными датами, чтобы продления сами напоминали о себе.",
          },
          {
            h2: "Что экспаты хранят здесь",
            bullets: [
              "Визы и виды на жительство",
              "Переводы и апостили",
              "Страховки и банковские документы",
              "Семейные документы всех, кто за границей с вами",
            ],
          },
          {
            h2: "Напоминания о продлении до наступления сроков",
            body: "Укажите дату «действует до» у визы или разрешения — и напоминание придёт на email заранее. Doki.help напоминает о дате, но не даёт миграционных или юридических советов, поэтому всегда проверяйте официальные требования, которые касаются вас.",
          },
          {
            h2: "Документы всей семьи за границей",
            body: "Заведите профиль на каждого — супруга, детей, родителей, — чтобы ничьё разрешение или документ не потерялись, пока вы обустраиваетесь.",
          },
          {
            h2: "Безопасная передача юристам и в инстанции",
            body: "Отправьте документ юристу или в офис по ссылке, которая истекает и отзывается в любой момент, с лимитом просмотров, а каждое открытие логируется.",
          },
          {
            h2: "Приватность и безопасность",
            body: "Документы видит только ваша семья (RLS), файлы — в приватном хранилище по HTTPS, доступен двухфакторный вход.",
          },
        ],
        trustHeading: "Ваши документы остаются приватными",
        trust: [
          "Документы видит только ваша семья (изоляция на уровне базы, RLS).",
          "Файлы — в приватном хранилище, передача по HTTPS; доступен двухфакторный вход.",
          "Doki.help в стадии beta, не заменяет оригиналы документов и не даёт миграционных или юридических советов.",
        ],
        faqHeading: "Частые вопросы",
        faq: [
          {
            q: "Помогает ли Doki.help с миграционными или юридическими советами?",
            a: "Нет. Doki.help только хранит документы и напоминает о датах. Подсказки AI по полям не являются юридической или миграционной консультацией — всегда проверяйте официальные требования, которые касаются вас.",
          },
          {
            q: "Можно отслеживать продление ВНЖ?",
            a: "Да. Сохраните вид на жительство, укажите дату «действует до» и получайте напоминание на email до срока продления.",
          },
          {
            q: "Можно хранить переводы и апостили?",
            a: "Да. Держите переводы, апостили и оригиналы, к которым они относятся, вместе — с разбивкой по членам семьи.",
          },
          {
            q: "Можно безопасно поделиться документами с юристом?",
            a: "Да. Создайте ссылку, которая истекает и отзывается в любой момент, с лимитом просмотров и логом доступа — для открытия аккаунт не нужен.",
          },
          {
            q: "Это бесплатно?",
            a: "Да. Бесплатный тариф включает 2 ГБ, напоминания, семейный доступ и офлайн-доступ. Платный тариф может появиться позже. Документы хранятся в защищённом облаке (Supabase); серверы могут находиться вне РФ — подробности в Политике конфиденциальности.",
          },
        ],
      },
      id: {
        navLabel: "Dokumen ekspat",
        title: "Penata Dokumen Ekspat | Doki.help",
        metaDescription:
          "Simpan visa, izin tinggal, terjemahan dan dokumen keluarga di satu tempat. Pengingat perpanjangan dan berbagi aman untuk hidup di luar negeri.",
        h1: "Penata dokumen ekspat untuk hidup di luar negeri",
        intro:
          "Simpan visa, izin tinggal, terjemahan dan dokumen keluarga di satu tempat — dengan pengingat perpanjangan dan berbagi aman untuk hidup di luar negeri.",
        ctaPrimary: "Bangun brankas dokumen ekspat",
        sections: [
          {
            h2: "Hidup di luar negeri berarti lebih banyak dokumen dan tenggat",
            body: "Pindah ke luar negeri melipatgandakan berkas — dan tenggat yang menyertainya. Simpan tiap dokumen di satu tempat dengan tanggal terpasang, agar perpanjangan yang mengingatkan Anda.",
          },
          {
            h2: "Apa yang disimpan ekspat di sini",
            bullets: [
              "Visa dan izin tinggal",
              "Terjemahan dan apostille",
              "Asuransi dan dokumen bank",
              "Dokumen keluarga semua orang yang di luar negeri bersama Anda",
            ],
          },
          {
            h2: "Pengingat perpanjangan sebelum tenggat tiba",
            body: "Pasang tanggal “berlaku sampai” pada visa atau izin, dan pengingat tiba lewat email sebelum jatuh tempo. Doki.help mengingatkan tanggal — bukan memberi nasihat imigrasi atau hukum, jadi selalu periksa persyaratan resmi yang berlaku bagi Anda.",
          },
          {
            h2: "Dokumen seluruh keluarga di luar negeri",
            body: "Buat profil untuk tiap anggota keluarga — pasangan, anak, orang tua — agar tidak ada izin atau dokumen yang terlewat saat Anda menata diri.",
          },
          {
            h2: "Berbagi aman dengan pengacara dan instansi",
            body: "Kirim dokumen ke pengacara atau kantor lewat tautan yang kedaluwarsa dan bisa dicabut kapan saja, dengan batas tampilan, dan tiap pembukaan tercatat.",
          },
          {
            h2: "Privasi dan keamanan",
            body: "Hanya keluarga Anda yang melihat dokumen (RLS), berkas di penyimpanan privat lewat HTTPS, dan login dua faktor tersedia.",
          },
        ],
        trustHeading: "Dokumen Anda tetap privat",
        trust: [
          "Hanya keluarga Anda yang melihat dokumen (isolasi di tingkat basis data, RLS).",
          "Berkas di penyimpanan privat, ditransfer lewat HTTPS; login dua faktor tersedia.",
          "Doki.help masih beta, tidak menggantikan dokumen asli, dan tidak memberi nasihat imigrasi atau hukum.",
        ],
        faqHeading: "Pertanyaan umum",
        faq: [
          {
            q: "Apakah Doki.help membantu nasihat imigrasi atau hukum?",
            a: "Tidak. Doki.help hanya menyimpan dokumen dan mengingatkan tanggal. Saran kolom dari AI bukan nasihat hukum atau imigrasi — selalu periksa persyaratan resmi yang berlaku bagi Anda.",
          },
          {
            q: "Bisakah memantau perpanjangan izin tinggal?",
            a: "Bisa. Simpan izin tinggal, isi tanggal “berlaku sampai”, dan dapatkan pengingat lewat email sebelum perpanjangan jatuh tempo.",
          },
          {
            q: "Bisakah menyimpan terjemahan dan apostille?",
            a: "Bisa. Simpan terjemahan, apostille dan dokumen asli yang terkait bersama-sama, tertata per anggota keluarga.",
          },
          {
            q: "Bisakah berbagi dokumen dengan pengacara secara aman?",
            a: "Bisa. Buat tautan yang kedaluwarsa dan bisa dicabut kapan saja, dengan batas tampilan dan catatan akses — tanpa perlu akun untuk membukanya.",
          },
          {
            q: "Apakah gratis?",
            a: "Ya. Paket gratis mencakup 2 GB, pengingat, akses keluarga dan akses offline. Paket berbayar mungkin hadir nanti. Dokumen disimpan di cloud aman (Supabase); server bisa berada di luar Rusia — lihat Kebijakan Privasi kami.",
          },
        ],
      },
      uz: {
        navLabel: "Ekspat hujjatlari",
        title: "Ekspat hujjatlari tartibga soluvchi | Doki.help",
        metaDescription:
          "Vizalar, yashash ruxsatlari, tarjimalar va oila hujjatlarini bitta joyda saqlang. Chet eldagi hayot uchun yangilash eslatmalari va xavfsiz ulashish.",
        h1: "Chet eldagi hayot uchun ekspat hujjatlari tartibga soluvchisi",
        intro:
          "Vizalar, yashash ruxsatlari, tarjimalar va oila hujjatlarini bitta joyda saqlang — chet eldagi hayot uchun yangilash eslatmalari va xavfsiz ulashish bilan.",
        ctaPrimary: "Ekspat hujjatlari omborini yarating",
        sections: [
          {
            h2: "Chet eldagi hayot — koʻproq hujjat va muddat",
            body: "Chet elga koʻchish qogʻozbozlikni — va u bilan keladigan muddatlarni koʻpaytiradi. Har bir hujjatni sanasi biriktirilgan holda bitta joyda saqlang, shunda yangilashlar oʻzi eslatadi.",
          },
          {
            h2: "Ekspatlar bu yerda nimani saqlaydi",
            bullets: [
              "Vizalar va yashash ruxsatlari",
              "Tarjimalar va apostillar",
              "Sugʻurta va bank hujjatlari",
              "Siz bilan chet elda boʻlganlarning oila hujjatlari",
            ],
          },
          {
            h2: "Muddat kelishidan oldin yangilash eslatmalari",
            body: "Viza yoki ruxsatga “amal qiladi” sanasini qoʻying — eslatma muddat kelishidan oldin email orqali keladi. Doki.help sanani eslatadi, migratsiya yoki yuridik maslahat bermaydi, shuning uchun sizga tegishli rasmiy talablarni doim tekshiring.",
          },
          {
            h2: "Chet eldagi butun oila hujjatlari",
            body: "Har bir oila aʼzosi uchun profil yarating — turmush oʻrtogʻingiz, bolalar, ota-onangiz — joylashayotganingizda hech kimning ruxsati yoki hujjati yoʻqolmaydi.",
          },
          {
            h2: "Yuristlar va idoralar bilan xavfsiz ulashish",
            body: "Hujjatni yurist yoki idoraga muddati tugaydigan va istalgan vaqt bekor qilinadigan havola orqali yuboring, koʻrish limiti bilan, har bir ochilish qayd etiladi.",
          },
          {
            h2: "Maxfiylik va xavfsizlik",
            body: "Hujjatlarni faqat oilangiz koʻradi (RLS), fayllar maxfiy omborda HTTPS orqali, ikki bosqichli kirish mavjud.",
          },
        ],
        trustHeading: "Hujjatlaringiz maxfiy qoladi",
        trust: [
          "Hujjatlarni faqat oilangiz koʻradi (maʼlumotlar bazasi darajasida izolyatsiya, RLS).",
          "Fayllar maxfiy omborda, HTTPS orqali uzatiladi; ikki bosqichli kirish mavjud.",
          "Doki.help beta bosqichida, asl hujjatlar oʻrnini bosmaydi va migratsiya yoki yuridik maslahat bermaydi.",
        ],
        faqHeading: "Tez-tez beriladigan savollar",
        faq: [
          {
            q: "Doki.help migratsiya yoki yuridik maslahatda yordam beradimi?",
            a: "Yoʻq. Doki.help faqat hujjatlarni saqlaydi va sanalarni eslatadi. AI ning maydon takliflari yuridik yoki migratsiya maslahati emas — sizga tegishli rasmiy talablarni doim tekshiring.",
          },
          {
            q: "Yashash ruxsati yangilanishini kuzatsa boʻladimi?",
            a: "Ha. Yashash ruxsatini saqlang, “amal qiladi” sanasini kiriting va yangilash muddatidan oldin email orqali eslatma oling.",
          },
          {
            q: "Tarjima va apostillarni saqlasa boʻladimi?",
            a: "Ha. Tarjimalar, apostillar va ular tegishli asl hujjatlarni birga saqlang — oila aʼzolari boʻyicha tartiblangan.",
          },
          {
            q: "Hujjatlarni yurist bilan xavfsiz ulashsa boʻladimi?",
            a: "Ha. Muddati tugaydigan va istalgan vaqt bekor qilinadigan havola yarating, koʻrish limiti va kirish jurnali bilan — uni ochish uchun akkaunt kerak emas.",
          },
          {
            q: "Bu bepulmi?",
            a: "Ha. Bepul tarif 2 GB, eslatmalar, oilaviy kirish va oflayn kirishni oʻz ichiga oladi. Pullik tarif keyinroq paydo boʻlishi mumkin. Hujjatlar xavfsiz bulutda (Supabase) saqlanadi; serverlar Rossiyadan tashqarida boʻlishi mumkin — Maxfiylik siyosatimizga qarang.",
          },
        ],
      },
    },
    related: {
      en: [
        { href: "/visa-expiry-reminder", label: "Visa expiry reminder" },
        { href: "/for/expats", label: "For expats" },
      ],
      ru: [
        { href: "/visa-expiry-reminder", label: "Напоминание о сроке визы" },
        { href: "/for/expats", label: "Для экспатов" },
      ],
      id: [
        { href: "/visa-expiry-reminder", label: "Pengingat masa berlaku visa" },
        { href: "/for/expats", label: "Untuk ekspat" },
      ],
      uz: [
        { href: "/visa-expiry-reminder", label: "Viza muddati eslatmasi" },
        { href: "/for/expats", label: "Ekspatlar uchun" },
      ],
    },
  },
  "medical-document-organizer": {
    slug: "medical-document-organizer",
    emoji: "🩺",
    locales: {
      en: {
        navLabel: "Medical documents",
        title: "Medical Document Organizer for Families",
        metaDescription:
          "Store lab results, reports, vaccinations and insurance per family member. Share securely with a doctor and get renewal reminders.",
        h1: "Keep your family's medical documents organized in one place",
        intro:
          "Organize lab results, reports, vaccinations and insurance for every family member, share securely with a doctor, and get reminders before cover or certificates lapse.",
        ctaPrimary: "Upload your first medical document",
        sections: [
          {
            h2: "When you need a medical document, you need it now",
            body: "A referral, a vaccination record, last year's results — they always come up at the worst moment. Keep them in one place so you can find the right document in seconds, not in a folder full of chat photos.",
          },
          {
            h2: "What you can keep",
            bullets: [
              "Lab results and test reports",
              "Imaging: ultrasound, MRI, CT scans",
              "Doctor reports and referrals",
              "Vaccination records",
              "Health insurance documents",
            ],
          },
          {
            h2: "A medical profile per family member",
            body: "Keep a separate profile for each person — partner, children, parents — so everyone's records stay grouped and easy to find.",
          },
          {
            h2: "Share securely with a doctor",
            body: "Send a single result with a link that expires and can be revoked at any time, with a view limit and each open logged — no need to give full access to your vault.",
          },
          {
            h2: "Reminders for insurance and certificates",
            body: "Add a \"valid until\" date to an insurance policy or certificate and a reminder arrives by email before it lapses.",
          },
          {
            h2: "Privacy and your medical data",
            body: "Medical information is a special category of personal data. Files live in a private bucket over HTTPS, access is isolated to your family at the database level (RLS), and two-factor login is available. Doki.help organizes and stores your documents — it does not give medical advice.",
          },
        ],
        trustHeading: "Your medical documents stay private",
        trust: [
          "Only your family can see the documents (row-level security in the database).",
          "Files live in a private bucket over HTTPS; two-factor login available.",
          "Doki.help is in beta, does not replace your medical records or originals, and does not give medical advice.",
        ],
        faqHeading: "FAQ",
        faq: [
          {
            q: "Does Doki.help give medical advice?",
            a: "No. Doki.help only helps you organize, store, share and set reminders for your documents. Any AI field suggestions on upload are not medical advice — always consult a qualified professional.",
          },
          {
            q: "Who can see our medical records?",
            a: "Only your family. Access is isolated to your account at the database level (row-level security), so no one outside your family can see the documents.",
          },
          {
            q: "Can I share a result with a doctor without giving full access?",
            a: "Yes. Share a single document with a link that expires and can be revoked anytime, with a view limit and an access log — the doctor sees only that one document and needs no account.",
          },
          {
            q: "Can I keep records for each family member?",
            a: "Yes. Keep a separate medical profile for each family member so everyone's records stay grouped.",
          },
          {
            q: "How is sensitive medical data protected?",
            a: "Files are kept in a private bucket over HTTPS, access is isolated to your family at the database level, and two-factor login is available. Servers may be located outside Russia — see our Privacy Policy.",
          },
        ],
      },
      ru: {
        navLabel: "Медицинские документы",
        title: "Органайзер медицинских документов семьи",
        metaDescription:
          "Храните анализы, заключения, прививки и страховку по каждому члену семьи. Безопасно делитесь с врачом и получайте напоминания.",
        h1: "Держите медицинские документы семьи в одном месте",
        intro:
          "Соберите анализы, заключения, прививки и страховку по каждому члену семьи, безопасно делитесь с врачом и получайте напоминания, пока страховка или справки не истекли.",
        ctaPrimary: "Загрузить первый медицинский документ",
        sections: [
          {
            h2: "Когда нужен медицинский документ, он нужен сразу",
            body: "Направление, прививочный сертификат, прошлогодние результаты — всё всплывает в самый неподходящий момент. Держите их в одном месте, чтобы найти нужный документ за секунды, а не в папке с фото из чатов.",
          },
          {
            h2: "Что можно хранить",
            bullets: [
              "Анализы и результаты обследований",
              "Снимки: УЗИ, МРТ, КТ",
              "Заключения и направления врачей",
              "Прививочные сертификаты",
              "Документы медицинской страховки",
            ],
          },
          {
            h2: "Медицинский профиль на каждого члена семьи",
            body: "Заведите отдельный профиль на каждого — супруга, детей, родителей, — чтобы документы каждого были сгруппированы и легко находились.",
          },
          {
            h2: "Безопасно делитесь с врачом",
            body: "Отправьте один результат по ссылке, которая истекает и отзывается в любой момент, с лимитом просмотров и логом каждого открытия — без полного доступа к вашему сейфу.",
          },
          {
            h2: "Напоминания о страховке и справках",
            body: "Укажите дату «действует до» для полиса или справки — и напоминание придёт на email до того, как срок истечёт.",
          },
          {
            h2: "Приватность и ваши медицинские данные",
            body: "Медицинская информация — особая категория персональных данных. Файлы хранятся в приватном bucket по HTTPS, доступ изолирован вашей семьёй на уровне базы (RLS), доступен двухфакторный вход. Doki.help организует и хранит документы — он не даёт медицинских советов.",
          },
        ],
        trustHeading: "Ваши медицинские документы остаются приватными",
        trust: [
          "Документы видит только ваша семья (изоляция на уровне базы, RLS).",
          "Файлы — в приватном bucket, передача по HTTPS; доступен двухфакторный вход.",
          "Doki.help в стадии beta, не заменяет медкарту и оригиналы и не даёт медицинских советов.",
        ],
        faqHeading: "Частые вопросы",
        faq: [
          {
            q: "Даёт ли Doki.help медицинские советы?",
            a: "Нет. Doki.help помогает только организовать, хранить, отправлять документы и ставить напоминания. Подсказки AI при загрузке не являются медицинской консультацией — всегда обращайтесь к специалисту.",
          },
          {
            q: "Кто видит наши медицинские документы?",
            a: "Только ваша семья. Доступ изолирован вашим аккаунтом на уровне базы (RLS), поэтому посторонние документы не видят.",
          },
          {
            q: "Можно отправить результат врачу без полного доступа?",
            a: "Да. Поделитесь одним документом по ссылке, которая истекает и отзывается в любой момент, с лимитом просмотров и логом открытий — врач увидит только этот документ, аккаунт не нужен.",
          },
          {
            q: "Можно вести документы по каждому члену семьи?",
            a: "Да. Заведите отдельный медицинский профиль на каждого члена семьи, чтобы документы были сгруппированы.",
          },
          {
            q: "Как защищены чувствительные медицинские данные?",
            a: "Файлы хранятся в приватном bucket по HTTPS, доступ изолирован вашей семьёй на уровне базы, доступен двухфакторный вход. Серверы могут находиться вне РФ — подробности в Политике конфиденциальности.",
          },
        ],
      },
      id: {
        navLabel: "Dokumen medis",
        title: "Pengatur Dokumen Medis untuk Keluarga",
        metaDescription:
          "Simpan hasil lab, laporan, vaksinasi dan asuransi per anggota keluarga. Bagikan aman ke dokter dan dapatkan pengingat.",
        h1: "Atur dokumen medis keluarga Anda di satu tempat",
        intro:
          "Atur hasil lab, laporan, vaksinasi dan asuransi untuk tiap anggota keluarga, bagikan aman ke dokter, dan dapatkan pengingat sebelum asuransi atau surat keterangan kedaluwarsa.",
        ctaPrimary: "Unggah dokumen medis pertama Anda",
        sections: [
          {
            h2: "Saat butuh dokumen medis, Anda butuh sekarang",
            body: "Rujukan, kartu vaksinasi, hasil tahun lalu — selalu muncul di saat paling tidak tepat. Simpan di satu tempat agar dokumen yang tepat ketemu dalam hitungan detik, bukan di folder penuh foto dari obrolan.",
          },
          {
            h2: "Apa yang bisa Anda simpan",
            bullets: [
              "Hasil lab dan laporan pemeriksaan",
              "Pencitraan: USG, MRI, CT scan",
              "Laporan dan rujukan dokter",
              "Catatan vaksinasi",
              "Dokumen asuransi kesehatan",
            ],
          },
          {
            h2: "Profil medis per anggota keluarga",
            body: "Buat profil terpisah untuk tiap orang — pasangan, anak, orang tua — agar catatan tiap orang tetap terkelompok dan mudah ditemukan.",
          },
          {
            h2: "Bagikan aman ke dokter",
            body: "Kirim satu hasil lewat tautan yang kedaluwarsa dan bisa dicabut kapan saja, dengan batas tampilan dan tiap pembukaan tercatat — tanpa memberi akses penuh ke brankas Anda.",
          },
          {
            h2: "Pengingat untuk asuransi dan surat keterangan",
            body: "Tambahkan tanggal \"berlaku sampai\" pada polis atau surat keterangan, dan pengingat tiba lewat email sebelum kedaluwarsa.",
          },
          {
            h2: "Privasi dan data medis Anda",
            body: "Informasi medis adalah kategori khusus data pribadi. Berkas disimpan di bucket privat lewat HTTPS, akses diisolasi untuk keluarga Anda di tingkat basis data (RLS), dan login dua faktor tersedia. Doki.help mengatur dan menyimpan dokumen — bukan memberi nasihat medis.",
          },
        ],
        trustHeading: "Dokumen medis Anda tetap privat",
        trust: [
          "Hanya keluarga Anda yang melihat dokumen (isolasi di tingkat basis data, RLS).",
          "Berkas di bucket privat lewat HTTPS; login dua faktor tersedia.",
          "Doki.help masih beta, tidak menggantikan rekam medis atau dokumen asli, dan tidak memberi nasihat medis.",
        ],
        faqHeading: "Pertanyaan umum",
        faq: [
          {
            q: "Apakah Doki.help memberi nasihat medis?",
            a: "Tidak. Doki.help hanya membantu mengatur, menyimpan, membagikan dan memasang pengingat dokumen. Saran kolom dari AI saat unggah bukan nasihat medis — selalu konsultasikan ke tenaga profesional.",
          },
          {
            q: "Siapa yang bisa melihat rekam medis kami?",
            a: "Hanya keluarga Anda. Akses diisolasi ke akun Anda di tingkat basis data (RLS), jadi pihak luar tidak bisa melihat dokumen.",
          },
          {
            q: "Bisakah berbagi hasil ke dokter tanpa akses penuh?",
            a: "Bisa. Bagikan satu dokumen lewat tautan yang kedaluwarsa dan bisa dicabut kapan saja, dengan batas tampilan dan catatan akses — dokter hanya melihat dokumen itu dan tak perlu akun.",
          },
          {
            q: "Bisakah menyimpan catatan tiap anggota keluarga?",
            a: "Bisa. Buat profil medis terpisah untuk tiap anggota keluarga agar catatan tetap terkelompok.",
          },
          {
            q: "Bagaimana data medis sensitif dilindungi?",
            a: "Berkas disimpan di bucket privat lewat HTTPS, akses diisolasi untuk keluarga Anda di tingkat basis data, dan login dua faktor tersedia. Server bisa berada di luar Rusia — lihat Kebijakan Privasi kami.",
          },
        ],
      },
      uz: {
        navLabel: "Tibbiy hujjatlar",
        title: "Oila uchun tibbiy hujjatlar tartibga soluvchisi",
        metaDescription:
          "Tahlil, xulosa, emlash va sugʻurtani har bir oila aʼzosi boʻyicha saqlang. Shifokor bilan xavfsiz ulashing va eslatma oling.",
        h1: "Oilangiz tibbiy hujjatlarini bitta joyda tartibga soling",
        intro:
          "Tahlillar, xulosalar, emlash va sugʻurtani har bir oila aʼzosi boʻyicha tartibga soling, shifokor bilan xavfsiz ulashing va sugʻurta yoki maʼlumotnoma muddati tugashidan oldin eslatma oling.",
        ctaPrimary: "Birinchi tibbiy hujjatni yuklang",
        sections: [
          {
            h2: "Tibbiy hujjat kerak boʻlsa, u darhol kerak",
            body: "Yoʻllanma, emlash sertifikati, oʻtgan yilgi natijalar — hammasi eng nomaqbul paytda kerak boʻladi. Ularni bitta joyda saqlang, shunda kerakli hujjatni chatdagi suratlar papkasidan emas, soniyalarda topasiz.",
          },
          {
            h2: "Nimani saqlash mumkin",
            bullets: [
              "Tahlil va tekshiruv natijalari",
              "Tasvirlar: UTT, MRT, KT",
              "Shifokor xulosalari va yoʻllanmalar",
              "Emlash sertifikatlari",
              "Tibbiy sugʻurta hujjatlari",
            ],
          },
          {
            h2: "Har bir oila aʼzosi uchun tibbiy profil",
            body: "Har bir kishi uchun alohida profil yarating — turmush oʻrtogʻingiz, bolalar, ota-onangiz — shunda har kimning hujjatlari guruhlanib, oson topiladi.",
          },
          {
            h2: "Shifokor bilan xavfsiz ulashing",
            body: "Bitta natijani muddati tugaydigan va istalgan vaqt bekor qilinadigan havola orqali yuboring — koʻrish chegarasi va har bir ochilish qaydi bilan, sefingizga toʻliq kirishsiz.",
          },
          {
            h2: "Sugʻurta va maʼlumotnomalar uchun eslatmalar",
            body: "Polis yoki maʼlumotnomaga \"amal qiladi\" sanasini qoʻshing — eslatma muddat tugashidan oldin email orqali keladi.",
          },
          {
            h2: "Maxfiylik va tibbiy maʼlumotlaringiz",
            body: "Tibbiy maʼlumot — shaxsiy maʼlumotlarning alohida toifasi. Fayllar maxfiy bucketda HTTPS orqali saqlanadi, kirish oilangiz darajasida izolyatsiya qilinadi (RLS), ikki bosqichli kirish mavjud. Doki.help hujjatlarni tartibga soladi va saqlaydi — tibbiy maslahat bermaydi.",
          },
        ],
        trustHeading: "Tibbiy hujjatlaringiz maxfiy qoladi",
        trust: [
          "Hujjatlarni faqat oilangiz koʻradi (maʼlumotlar bazasi darajasida izolyatsiya, RLS).",
          "Fayllar maxfiy bucketda HTTPS orqali; ikki bosqichli kirish mavjud.",
          "Doki.help beta bosqichida, tibbiy karta yoki asl hujjatlar oʻrnini bosmaydi va tibbiy maslahat bermaydi.",
        ],
        faqHeading: "Tez-tez beriladigan savollar",
        faq: [
          {
            q: "Doki.help tibbiy maslahat beradimi?",
            a: "Yoʻq. Doki.help faqat hujjatlarni tartibga solish, saqlash, ulashish va eslatma qoʻyishda yordam beradi. Yuklashdagi AI maydon takliflari tibbiy maslahat emas — har doim malakali mutaxassisga murojaat qiling.",
          },
          {
            q: "Tibbiy hujjatlarimizni kim koʻradi?",
            a: "Faqat oilangiz. Kirish maʼlumotlar bazasi darajasida hisobingizga izolyatsiya qilingan (RLS), shuning uchun begonalar hujjatlarni koʻrmaydi.",
          },
          {
            q: "Natijani toʻliq kirishsiz shifokorga ulashsa boʻladimi?",
            a: "Ha. Bitta hujjatni muddati tugaydigan va istalgan vaqt bekor qilinadigan havola orqali ulashing — koʻrish chegarasi va kirish qaydi bilan; shifokor faqat shu hujjatni koʻradi va hisob kerak emas.",
          },
          {
            q: "Har bir oila aʼzosi uchun hujjat yuritsa boʻladimi?",
            a: "Ha. Har bir oila aʼzosi uchun alohida tibbiy profil yarating, shunda hujjatlar guruhlanib qoladi.",
          },
          {
            q: "Nozik tibbiy maʼlumot qanday himoyalanadi?",
            a: "Fayllar maxfiy bucketda HTTPS orqali saqlanadi, kirish oilangiz darajasida izolyatsiya qilingan, ikki bosqichli kirish mavjud. Serverlar Rossiyadan tashqarida boʻlishi mumkin — Maxfiylik siyosatimizga qarang.",
          },
        ],
      },
    },
    related: {
      en: [
        { href: "/for/medical", label: "For medical" },
        { href: "/secure-document-sharing", label: "Secure document sharing" },
      ],
      ru: [
        { href: "/for/medical", label: "Для медицины" },
        { href: "/secure-document-sharing", label: "Безопасная отправка документов" },
      ],
      id: [
        { href: "/for/medical", label: "Untuk medis" },
        { href: "/secure-document-sharing", label: "Berbagi dokumen aman" },
      ],
      uz: [
        { href: "/for/medical", label: "Tibbiyot uchun" },
        { href: "/secure-document-sharing", label: "Hujjatlarni xavfsiz ulashish" },
      ],
    },
  },
  "travel-documents": {
    slug: "travel-documents",
    emoji: "✈️",
    locales: {
      en: {
        navLabel: "Travel documents",
        title: "Travel Documents Organizer with Offline Access",
        metaDescription:
          "Keep passports, visas, insurance and bookings for the whole family in one place. Access them offline and get expiry reminders.",
        h1: "All your travel documents in one place — even offline",
        intro:
          "Keep passports, visas, insurance and bookings for the whole family in one place, open them offline, and get reminders before anything expires mid-trip.",
        ctaPrimary: "Build your travel vault",
        sections: [
          {
            h2: "Travel documents scattered across chats and email",
            body: "Booking confirmations in one chat, the visa in your email, the passport scan in your gallery. When you're at the gate, that's the worst place for them to be — keep everything in one place instead.",
          },
          {
            h2: "What to keep before a trip",
            bullets: [
              "Passports and visas",
              "Travel and health insurance",
              "Bookings and tickets",
              "Child travel consent forms",
            ],
          },
          {
            h2: "Offline access when you have no signal",
            body: "Save the documents you need to your phone in advance and open them without a connection — at the airport, in roaming, or anywhere with no signal.",
          },
          {
            h2: "Reminders so nothing expires mid-trip",
            body: "Add a \"valid until\" date to a passport, visa or insurance policy and a reminder arrives by email before it lapses — so a deadline never surprises you abroad.",
          },
          {
            h2: "For families travelling with children",
            body: "Keep a profile for every family member and store each child's passport, visa and consent forms together. Always check your destination's and your country's requirements for travelling with children.",
          },
          {
            h2: "Privacy and security",
            body: "Files live in a private bucket over HTTPS and only your family can see them (row-level security). Need to send a copy to a travel agent or relative? Use a link that expires and can be revoked anytime.",
          },
        ],
        trustHeading: "Your travel documents stay private",
        trust: [
          "Only your family can see the documents (row-level security in the database).",
          "Files live in a private bucket over HTTPS; save them to your phone for offline access.",
          "Doki.help is in beta and does not replace your original documents.",
        ],
        faqHeading: "FAQ",
        faq: [
          {
            q: "Can I access documents without internet?",
            a: "Yes. Save the documents you need to your phone in advance (PWA) and open them offline — at the airport or in roaming.",
          },
          {
            q: "Can I keep documents for the whole family?",
            a: "Yes. Keep a separate profile for each family member and store everyone's passports, visas and bookings together.",
          },
          {
            q: "Will I be reminded before a passport or visa expires?",
            a: "Yes. Add a \"valid until\" date and a reminder arrives by email before it expires. The reminder comes 30, 7 and 1 day before that date.",
          },
          {
            q: "Can I store child travel consent forms?",
            a: "Yes. Store consent forms alongside each child's documents. Always check your destination's and your country's requirements for travelling with children.",
          },
          {
            q: "Is it free?",
            a: "Yes. The free tier includes 2 GB, expiry reminders, family access and offline access. A paid tier may come later.",
          },
        ],
      },
      ru: {
        navLabel: "Документы для поездок",
        title: "Документы для поездок с доступом офлайн",
        metaDescription:
          "Храните паспорта, визы, страховки и брони всей семьи в одном месте. Открывайте офлайн и получайте напоминания о сроках.",
        h1: "Все документы для поездок в одном месте — даже офлайн",
        intro:
          "Держите паспорта, визы, страховки и брони всей семьи в одном месте, открывайте их офлайн и получайте напоминания, пока в поездке ничего не истекло.",
        ctaPrimary: "Собрать сейф для поездок",
        sections: [
          {
            h2: "Документы для поездки разбросаны по чатам и почте",
            body: "Брони в одном чате, виза в почте, скан паспорта в галерее. У выхода на посадку это худшее место для них — лучше держите всё в одном месте.",
          },
          {
            h2: "Что собрать перед поездкой",
            bullets: [
              "Паспорта и визы",
              "Туристическая и медицинская страховка",
              "Брони и билеты",
              "Согласия на выезд ребёнка",
            ],
          },
          {
            h2: "Доступ офлайн, когда нет связи",
            body: "Сохраните нужные документы на телефон заранее и открывайте их без связи — в аэропорту, в роуминге или там, где нет сигнала.",
          },
          {
            h2: "Напоминания, чтобы ничего не истекло в поездке",
            body: "Укажите дату «действует до» для паспорта, визы или страховки — и напоминание придёт на email заранее, чтобы срок не застал вас за границей.",
          },
          {
            h2: "Для семей, путешествующих с детьми",
            body: "Заведите профиль на каждого члена семьи и храните паспорт, визу и согласия каждого ребёнка вместе. Всегда проверяйте требования страны назначения и вашей страны для поездок с детьми.",
          },
          {
            h2: "Приватность и безопасность",
            body: "Файлы хранятся в приватном bucket по HTTPS, и видит их только ваша семья (RLS). Нужно отправить копию агенту или родственнику? Используйте ссылку, которая истекает и отзывается в любой момент.",
          },
        ],
        trustHeading: "Ваши документы для поездок остаются приватными",
        trust: [
          "Документы видит только ваша семья (изоляция на уровне базы, RLS).",
          "Файлы — в приватном bucket по HTTPS; сохраните их на телефон для офлайн-доступа.",
          "Doki.help в стадии beta и не заменяет оригиналы документов.",
        ],
        faqHeading: "Частые вопросы",
        faq: [
          {
            q: "Можно открывать документы без интернета?",
            a: "Да. Сохраните нужные документы на телефон заранее (PWA) и открывайте офлайн — в аэропорту или в роуминге.",
          },
          {
            q: "Можно хранить документы всей семьи?",
            a: "Да. Заведите отдельный профиль на каждого члена семьи и храните паспорта, визы и брони всех вместе.",
          },
          {
            q: "Напомнит ли о сроке паспорта или визы?",
            a: "Да. Укажите дату «действует до» — и напоминание придёт на email заранее. Напоминание приходит за 30, 7 и 1 день до этой даты.",
          },
          {
            q: "Можно хранить согласия на выезд ребёнка?",
            a: "Да. Храните согласия вместе с документами каждого ребёнка. Всегда проверяйте требования страны назначения и вашей страны для поездок с детьми.",
          },
          {
            q: "Это бесплатно?",
            a: "Да. Бесплатный тариф включает 2 ГБ, напоминания о сроках, семейный доступ и офлайн-доступ. Платный тариф может появиться позже.",
          },
        ],
      },
      id: {
        navLabel: "Dokumen perjalanan",
        title: "Pengatur Dokumen Perjalanan, Akses Offline",
        metaDescription:
          "Simpan paspor, visa, asuransi dan pemesanan seluruh keluarga di satu tempat. Akses offline dan dapatkan pengingat masa berlaku.",
        h1: "Semua dokumen perjalanan di satu tempat — bahkan offline",
        intro:
          "Simpan paspor, visa, asuransi dan pemesanan seluruh keluarga di satu tempat, buka offline, dan dapatkan pengingat sebelum ada yang kedaluwarsa di tengah perjalanan.",
        ctaPrimary: "Bangun brankas perjalanan Anda",
        sections: [
          {
            h2: "Dokumen perjalanan tersebar di obrolan dan email",
            body: "Konfirmasi pemesanan di satu obrolan, visa di email, pindaian paspor di galeri. Saat di gerbang keberangkatan, itu tempat terburuk untuknya — lebih baik simpan semua di satu tempat.",
          },
          {
            h2: "Apa yang disimpan sebelum perjalanan",
            bullets: [
              "Paspor dan visa",
              "Asuransi perjalanan dan kesehatan",
              "Pemesanan dan tiket",
              "Surat izin perjalanan anak",
            ],
          },
          {
            h2: "Akses offline saat tak ada sinyal",
            body: "Simpan dokumen yang Anda butuhkan ke ponsel lebih dulu dan buka tanpa koneksi — di bandara, saat roaming, atau di mana pun tanpa sinyal.",
          },
          {
            h2: "Pengingat agar tak ada yang kedaluwarsa di tengah jalan",
            body: "Tambahkan tanggal \"berlaku sampai\" pada paspor, visa atau asuransi, dan pengingat tiba lewat email sebelum kedaluwarsa — agar tenggat tak mengejutkan Anda di luar negeri.",
          },
          {
            h2: "Untuk keluarga yang bepergian dengan anak",
            body: "Buat profil untuk tiap anggota keluarga dan simpan paspor, visa serta surat izin tiap anak bersama. Selalu periksa persyaratan negara tujuan dan negara Anda untuk bepergian dengan anak.",
          },
          {
            h2: "Privasi dan keamanan",
            body: "Berkas disimpan di bucket privat lewat HTTPS dan hanya keluarga Anda yang melihatnya (RLS). Perlu mengirim salinan ke agen atau kerabat? Gunakan tautan yang kedaluwarsa dan bisa dicabut kapan saja.",
          },
        ],
        trustHeading: "Dokumen perjalanan Anda tetap privat",
        trust: [
          "Hanya keluarga Anda yang melihat dokumen (isolasi di tingkat basis data, RLS).",
          "Berkas di bucket privat lewat HTTPS; simpan ke ponsel untuk akses offline.",
          "Doki.help masih beta dan tidak menggantikan dokumen asli Anda.",
        ],
        faqHeading: "Pertanyaan umum",
        faq: [
          {
            q: "Bisakah mengakses dokumen tanpa internet?",
            a: "Bisa. Simpan dokumen yang Anda butuhkan ke ponsel lebih dulu (PWA) dan buka offline — di bandara atau saat roaming.",
          },
          {
            q: "Bisakah menyimpan dokumen seluruh keluarga?",
            a: "Bisa. Buat profil terpisah untuk tiap anggota keluarga dan simpan paspor, visa serta pemesanan semua orang bersama.",
          },
          {
            q: "Apakah saya diingatkan sebelum paspor atau visa kedaluwarsa?",
            a: "Ya. Tambahkan tanggal \"berlaku sampai\" dan pengingat tiba lewat email sebelum kedaluwarsa. Pengingat datang 30, 7, dan 1 hari sebelum tanggal itu.",
          },
          {
            q: "Bisakah menyimpan surat izin perjalanan anak?",
            a: "Bisa. Simpan surat izin bersama dokumen tiap anak. Selalu periksa persyaratan negara tujuan dan negara Anda untuk bepergian dengan anak.",
          },
          {
            q: "Apakah gratis?",
            a: "Ya. Tier gratis mencakup 2 GB, pengingat masa berlaku, akses keluarga dan akses offline. Tier berbayar mungkin hadir nanti.",
          },
        ],
      },
      uz: {
        navLabel: "Sayohat hujjatlari",
        title: "Sayohat hujjatlari tartiblagichi, oflayn kirish",
        metaDescription:
          "Pasport, viza, sugʻurta va bronlarni butun oila uchun bitta joyda saqlang. Oflayn oching va muddat eslatmalarini oling.",
        h1: "Barcha sayohat hujjatlari bitta joyda — hatto oflayn",
        intro:
          "Pasport, viza, sugʻurta va bronlarni butun oila uchun bitta joyda saqlang, ularni oflayn oching va sayohat oʻrtasida hech narsa muddati tugamasligi uchun eslatma oling.",
        ctaPrimary: "Sayohat sefini yarating",
        sections: [
          {
            h2: "Sayohat hujjatlari chat va emailga tarqalgan",
            body: "Bron tasdiqlari bir chatda, viza emailda, pasport skani galereyada. Chiqish darvozasida bu ular uchun eng yomon joy — buning oʻrniga hammasini bitta joyda saqlang.",
          },
          {
            h2: "Sayohatdan oldin nimani saqlash kerak",
            bullets: [
              "Pasportlar va vizalar",
              "Sayohat va tibbiy sugʻurta",
              "Bronlar va chiptalar",
              "Bola sayohati uchun rozilik hujjatlari",
            ],
          },
          {
            h2: "Signal boʻlmaganda oflayn kirish",
            body: "Kerakli hujjatlarni telefoningizga oldindan saqlang va aloqasiz oching — aeroportda, roumingda yoki signal yoʻq joyda.",
          },
          {
            h2: "Sayohat oʻrtasida hech narsa tugamasligi uchun eslatmalar",
            body: "Pasport, viza yoki sugʻurtaga \"amal qiladi\" sanasini qoʻshing — eslatma muddat tugashidan oldin email orqali keladi, shunda muddat sizni chet elda kutib qolmaydi.",
          },
          {
            h2: "Bolalar bilan sayohat qiladigan oilalar uchun",
            body: "Har bir oila aʼzosi uchun profil yarating va har bir bolaning pasporti, vizasi va rozilik hujjatlarini birga saqlang. Bolalar bilan sayohat boʻyicha boriladigan davlat va oʻz davlatingiz talablarini doim tekshiring.",
          },
          {
            h2: "Maxfiylik va xavfsizlik",
            body: "Fayllar maxfiy bucketda HTTPS orqali saqlanadi va ularni faqat oilangiz koʻradi (RLS). Nusxani agent yoki qarindoshga yuborish kerakmi? Muddati tugaydigan va istalgan vaqt bekor qilinadigan havoladan foydalaning.",
          },
        ],
        trustHeading: "Sayohat hujjatlaringiz maxfiy qoladi",
        trust: [
          "Hujjatlarni faqat oilangiz koʻradi (maʼlumotlar bazasi darajasida izolyatsiya, RLS).",
          "Fayllar maxfiy bucketda HTTPS orqali; oflayn kirish uchun telefoningizga saqlang.",
          "Doki.help beta bosqichida va asl hujjatlaringiz oʻrnini bosmaydi.",
        ],
        faqHeading: "Tez-tez beriladigan savollar",
        faq: [
          {
            q: "Hujjatlarga internetsiz kirsa boʻladimi?",
            a: "Ha. Kerakli hujjatlarni telefoningizga oldindan saqlang (PWA) va oflayn oching — aeroportda yoki roumingda.",
          },
          {
            q: "Butun oila hujjatlarini saqlasa boʻladimi?",
            a: "Ha. Har bir oila aʼzosi uchun alohida profil yarating va hammaning pasport, viza va bronlarini birga saqlang.",
          },
          {
            q: "Pasport yoki viza muddati tugashidan oldin eslatadimi?",
            a: "Ha. \"Amal qiladi\" sanasini qoʻshing — eslatma muddat tugashidan oldin email orqali keladi. Eslatma shu sanadan 30, 7 va 1 kun oldin keladi.",
          },
          {
            q: "Bola sayohati uchun rozilik hujjatlarini saqlasa boʻladimi?",
            a: "Ha. Rozilik hujjatlarini har bir bolaning hujjatlari bilan birga saqlang. Bolalar bilan sayohat boʻyicha boriladigan davlat va oʻz davlatingiz talablarini doim tekshiring.",
          },
          {
            q: "Bu bepulmi?",
            a: "Ha. Bepul tarif 2 GB, muddat eslatmalari, oilaviy kirish va oflayn kirishni oʻz ichiga oladi. Pullik tarif keyinroq paydo boʻlishi mumkin.",
          },
        ],
      },
    },
    related: {
      en: [
        { href: "/for/travel", label: "For travelers" },
        { href: "/passport-expiry-reminder", label: "Passport expiry reminder" },
      ],
      ru: [
        { href: "/for/travel", label: "Для путешественников" },
        { href: "/passport-expiry-reminder", label: "Напоминание о сроке паспорта" },
      ],
      id: [
        { href: "/for/travel", label: "Untuk pelancong" },
        { href: "/passport-expiry-reminder", label: "Pengingat masa berlaku paspor" },
      ],
      uz: [
        { href: "/for/travel", label: "Sayohatchilar uchun" },
        { href: "/passport-expiry-reminder", label: "Pasport muddati eslatmasi" },
      ],
    },
  },
  "family-emergency-documents": {
    slug: "family-emergency-documents",
    emoji: "🚨",
    locales: {
      en: {
        navLabel: "Emergency documents",
        title: "Family Emergency Documents Checklist & Vault",
        metaDescription:
          "The documents every family should keep ready for an emergency — and a secure place to store them with offline access for each member.",
        h1: "Family emergency documents: what to keep and where",
        intro:
          "The documents every family should keep ready for an emergency, and a secure place to store them with offline access for each family member.",
        ctaPrimary: "Create your family emergency folder",
        sections: [
          {
            h2: "An emergency is the worst time to go looking",
            body: "When something goes wrong, you don't want to be digging through drawers and chats for an insurance number or an ID. Decide what matters now and keep it ready in one place.",
          },
          {
            h2: "The family emergency document checklist",
            bullets: [
              "IDs: passports and national ID cards",
              "Medical: insurance, key records, vaccination cards",
              "Insurance policies (health, home, life)",
              "Property and finance: deeds, contracts, account details",
              "Important contacts: doctors, relatives, emergency numbers",
            ],
          },
          {
            h2: "Keep them ready and accessible",
            body: "Save the documents you'd need in a hurry to your phone in advance, so you can open them offline — even with no signal or a dead Wi-Fi.",
          },
          {
            h2: "Make sure the right family member can reach them",
            body: "Invite your family and assign roles — owner, editor or viewer — so the right people can open the documents when they need them. (Doki.help uses roles you set; it does not grant automatic access on your behalf.)",
          },
          {
            h2: "Privacy and security",
            body: "Files live in a private bucket over HTTPS and only your family can see them (row-level security). You control who has access and at what role.",
          },
        ],
        trustHeading: "Your emergency documents stay private",
        trust: [
          "Only your family can see the documents (row-level security in the database).",
          "Files live in a private bucket over HTTPS; save them to your phone for offline access.",
          "Doki.help is in beta and does not replace your original documents.",
        ],
        faqHeading: "FAQ",
        faq: [
          {
            q: "What documents should every family keep for emergencies?",
            a: "At a minimum: IDs and passports, medical and insurance documents, property and finance papers, and a list of important contacts. Keep them in one place and set reminders for anything that expires.",
          },
          {
            q: "Can my spouse access them if I can't?",
            a: "Yes, if you've set it up. Invite family members and give them an owner, editor or viewer role, so the right person can open the documents. Doki.help uses the roles you assign — it does not grant access automatically on your behalf.",
          },
          {
            q: "Can I open them without internet?",
            a: "Yes. Save the documents you'd need in a hurry to your phone in advance (PWA) and open them offline.",
          },
          {
            q: "Is this a substitute for the originals?",
            a: "No. Doki.help keeps organized copies and reminders, but it does not replace your original documents — keep the originals safe.",
          },
          {
            q: "Is it free?",
            a: "Yes. The free tier includes 2 GB, expiry reminders, family access and offline access. A paid tier may come later.",
          },
        ],
      },
      ru: {
        navLabel: "Документы на случай ЧП",
        title: "Документы семьи на случай ЧП: список и сейф",
        metaDescription:
          "Документы, которые семье стоит держать наготове на случай ЧП, и безопасное место для них с офлайн-доступом для каждого.",
        h1: "Документы семьи на случай ЧП: что хранить и где",
        intro:
          "Документы, которые семье стоит держать наготове на случай ЧП, и безопасное место для них с офлайн-доступом для каждого члена семьи.",
        ctaPrimary: "Создать папку на случай ЧП",
        sections: [
          {
            h2: "ЧП — худшее время для поисков",
            body: "Когда что-то случилось, меньше всего хочется рыться в ящиках и чатах в поисках номера полиса или удостоверения. Решите, что важно, сейчас и держите это наготове в одном месте.",
          },
          {
            h2: "Список документов на случай ЧП",
            bullets: [
              "Удостоверения: паспорта и ID-карты",
              "Медицина: страховка, ключевые выписки, прививочные карты",
              "Страховые полисы (мед., имущество, жизнь)",
              "Имущество и финансы: документы на собственность, договоры, реквизиты",
              "Важные контакты: врачи, родственники, экстренные номера",
            ],
          },
          {
            h2: "Держите их наготове и под рукой",
            body: "Сохраните документы, которые могут срочно понадобиться, на телефон заранее, чтобы открыть их офлайн — даже без связи и Wi-Fi.",
          },
          {
            h2: "Чтобы нужный член семьи смог до них добраться",
            body: "Пригласите семью и назначьте роли — owner, editor или viewer, — чтобы нужные люди могли открыть документы, когда это потребуется. (Doki.help работает по заданным вами ролям и не выдаёт доступ автоматически за вас.)",
          },
          {
            h2: "Приватность и безопасность",
            body: "Файлы хранятся в приватном bucket по HTTPS, и видит их только ваша семья (RLS). Вы сами решаете, у кого есть доступ и с какой ролью.",
          },
        ],
        trustHeading: "Ваши документы на случай ЧП остаются приватными",
        trust: [
          "Документы видит только ваша семья (изоляция на уровне базы, RLS).",
          "Файлы — в приватном bucket по HTTPS; сохраните их на телефон для офлайн-доступа.",
          "Doki.help в стадии beta и не заменяет оригиналы документов.",
        ],
        faqHeading: "Частые вопросы",
        faq: [
          {
            q: "Какие документы держать на случай ЧП?",
            a: "Как минимум: удостоверения и паспорта, медицинские и страховые документы, бумаги по имуществу и финансам, список важных контактов. Держите их в одном месте и ставьте напоминания на всё, что истекает.",
          },
          {
            q: "Сможет ли супруг(а) открыть их, если я не смогу?",
            a: "Да, если вы это настроили. Пригласите членов семьи и дайте им роль owner, editor или viewer, чтобы нужный человек мог открыть документы. Doki.help работает по заданным вами ролям и не выдаёт доступ автоматически за вас.",
          },
          {
            q: "Можно открыть их без интернета?",
            a: "Да. Сохраните документы, которые могут срочно понадобиться, на телефон заранее (PWA) и открывайте офлайн.",
          },
          {
            q: "Это замена оригиналам?",
            a: "Нет. Doki.help хранит упорядоченные копии и напоминания, но не заменяет оригиналы — берегите оригиналы.",
          },
          {
            q: "Это бесплатно?",
            a: "Да. Бесплатный тариф включает 2 ГБ, напоминания о сроках, семейный доступ и офлайн-доступ. Платный тариф может появиться позже.",
          },
        ],
      },
      id: {
        navLabel: "Dokumen darurat",
        title: "Dokumen Darurat Keluarga: Daftar & Brankas",
        metaDescription:
          "Dokumen yang sebaiknya disiapkan tiap keluarga untuk keadaan darurat — dan tempat aman menyimpannya dengan akses offline.",
        h1: "Dokumen darurat keluarga: apa yang disimpan dan di mana",
        intro:
          "Dokumen yang sebaiknya disiapkan tiap keluarga untuk keadaan darurat, dan tempat aman menyimpannya dengan akses offline untuk tiap anggota keluarga.",
        ctaPrimary: "Buat folder darurat keluarga Anda",
        sections: [
          {
            h2: "Keadaan darurat adalah waktu terburuk untuk mencari",
            body: "Saat ada masalah, Anda tak ingin mengaduk laci dan obrolan demi nomor asuransi atau identitas. Putuskan apa yang penting sekarang dan siapkan di satu tempat.",
          },
          {
            h2: "Daftar dokumen darurat keluarga",
            bullets: [
              "Identitas: paspor dan KTP",
              "Medis: asuransi, catatan penting, kartu vaksinasi",
              "Polis asuransi (kesehatan, rumah, jiwa)",
              "Properti dan keuangan: sertifikat, kontrak, rincian rekening",
              "Kontak penting: dokter, kerabat, nomor darurat",
            ],
          },
          {
            h2: "Siapkan dan mudah dijangkau",
            body: "Simpan dokumen yang mungkin Anda butuhkan mendadak ke ponsel lebih dulu, agar bisa dibuka offline — bahkan tanpa sinyal atau Wi-Fi.",
          },
          {
            h2: "Pastikan anggota keluarga yang tepat bisa menjangkaunya",
            body: "Undang keluarga dan tetapkan peran — owner, editor atau viewer — agar orang yang tepat bisa membuka dokumen saat dibutuhkan. (Doki.help memakai peran yang Anda tetapkan; ia tidak memberi akses otomatis atas nama Anda.)",
          },
          {
            h2: "Privasi dan keamanan",
            body: "Berkas disimpan di bucket privat lewat HTTPS dan hanya keluarga Anda yang melihatnya (RLS). Anda mengendalikan siapa yang punya akses dan dengan peran apa.",
          },
        ],
        trustHeading: "Dokumen darurat Anda tetap privat",
        trust: [
          "Hanya keluarga Anda yang melihat dokumen (isolasi di tingkat basis data, RLS).",
          "Berkas di bucket privat lewat HTTPS; simpan ke ponsel untuk akses offline.",
          "Doki.help masih beta dan tidak menggantikan dokumen asli Anda.",
        ],
        faqHeading: "Pertanyaan umum",
        faq: [
          {
            q: "Dokumen apa yang harus disiapkan tiap keluarga untuk darurat?",
            a: "Minimal: identitas dan paspor, dokumen medis dan asuransi, surat properti dan keuangan, serta daftar kontak penting. Simpan di satu tempat dan pasang pengingat untuk yang akan kedaluwarsa.",
          },
          {
            q: "Bisakah pasangan saya mengaksesnya jika saya tak bisa?",
            a: "Bisa, jika Anda mengaturnya. Undang anggota keluarga dan beri peran owner, editor atau viewer agar orang yang tepat bisa membuka dokumen. Doki.help memakai peran yang Anda tetapkan — bukan memberi akses otomatis atas nama Anda.",
          },
          {
            q: "Bisakah membukanya tanpa internet?",
            a: "Bisa. Simpan dokumen yang mungkin Anda butuhkan mendadak ke ponsel lebih dulu (PWA) dan buka offline.",
          },
          {
            q: "Apakah ini pengganti dokumen asli?",
            a: "Tidak. Doki.help menyimpan salinan tertata dan pengingat, tetapi tidak menggantikan dokumen asli Anda — simpan yang asli dengan aman.",
          },
          {
            q: "Apakah gratis?",
            a: "Ya. Tier gratis mencakup 2 GB, pengingat masa berlaku, akses keluarga dan akses offline. Tier berbayar mungkin hadir nanti.",
          },
        ],
      },
      uz: {
        navLabel: "Favqulodda hujjatlar",
        title: "Oilaviy favqulodda hujjatlar: roʻyxat va sef",
        metaDescription:
          "Har bir oila favqulodda holatga tayyor saqlashi kerak boʻlgan hujjatlar — va ularni oflayn kirish bilan xavfsiz saqlash joyi.",
        h1: "Oilaviy favqulodda hujjatlar: nimani va qayerda saqlash",
        intro:
          "Har bir oila favqulodda holatga tayyor saqlashi kerak boʻlgan hujjatlar va ularni har bir oila aʼzosi uchun oflayn kirish bilan xavfsiz saqlash joyi.",
        ctaPrimary: "Oilaviy favqulodda papkani yarating",
        sections: [
          {
            h2: "Favqulodda holat — qidirish uchun eng yomon payt",
            body: "Biror narsa yuz berganda, sugʻurta raqami yoki guvohnoma uchun tortmalar va chatlarni titkilashni xohlamaysiz. Nima muhimligini hozir hal qiling va uni bitta joyda tayyor saqlang.",
          },
          {
            h2: "Oilaviy favqulodda hujjatlar roʻyxati",
            bullets: [
              "Guvohnomalar: pasportlar va ID-kartalar",
              "Tibbiyot: sugʻurta, asosiy yozuvlar, emlash kartalari",
              "Sugʻurta polislari (tibbiy, uy-joy, hayot)",
              "Mulk va moliya: mulk hujjatlari, shartnomalar, rekvizitlar",
              "Muhim kontaktlar: shifokorlar, qarindoshlar, favqulodda raqamlar",
            ],
          },
          {
            h2: "Ularni tayyor va qoʻl ostida saqlang",
            body: "Shoshilinch kerak boʻlishi mumkin boʻlgan hujjatlarni telefoningizga oldindan saqlang, shunda ularni oflayn ochasiz — signal yoki Wi-Fi boʻlmasa ham.",
          },
          {
            h2: "Kerakli oila aʼzosi ularga yeta olishini taʼminlang",
            body: "Oilangizni taklif qiling va rollar bering — owner, editor yoki viewer — shunda kerakli odamlar zarur boʻlganda hujjatlarni ocha oladi. (Doki.help siz belgilagan rollar boʻyicha ishlaydi; sizning nomingizdan avtomatik kirish bermaydi.)",
          },
          {
            h2: "Maxfiylik va xavfsizlik",
            body: "Fayllar maxfiy bucketda HTTPS orqali saqlanadi va ularni faqat oilangiz koʻradi (RLS). Kimda qaysi rol bilan kirish borligini oʻzingiz boshqarasiz.",
          },
        ],
        trustHeading: "Favqulodda hujjatlaringiz maxfiy qoladi",
        trust: [
          "Hujjatlarni faqat oilangiz koʻradi (maʼlumotlar bazasi darajasida izolyatsiya, RLS).",
          "Fayllar maxfiy bucketda HTTPS orqali; oflayn kirish uchun telefoningizga saqlang.",
          "Doki.help beta bosqichida va asl hujjatlaringiz oʻrnini bosmaydi.",
        ],
        faqHeading: "Tez-tez beriladigan savollar",
        faq: [
          {
            q: "Har bir oila favqulodda holatga qaysi hujjatlarni saqlashi kerak?",
            a: "Kamida: guvohnomalar va pasportlar, tibbiy va sugʻurta hujjatlari, mulk va moliya qogʻozlari hamda muhim kontaktlar roʻyxati. Ularni bitta joyda saqlang va muddati tugaydiganlarga eslatma qoʻying.",
          },
          {
            q: "Men ojiz boʻlsam, turmush oʻrtogʻim ularga kira oladimi?",
            a: "Ha, agar buni sozlagan boʻlsangiz. Oila aʼzolarini taklif qiling va ularga owner, editor yoki viewer roli bering, shunda kerakli odam hujjatlarni ocha oladi. Doki.help siz bergan rollar boʻyicha ishlaydi — nomingizdan avtomatik kirish bermaydi.",
          },
          {
            q: "Ularni internetsiz ochsa boʻladimi?",
            a: "Ha. Shoshilinch kerak boʻlishi mumkin boʻlgan hujjatlarni telefoningizga oldindan saqlang (PWA) va oflayn oching.",
          },
          {
            q: "Bu asl hujjatlar oʻrnini bosadimi?",
            a: "Yoʻq. Doki.help tartibli nusxalar va eslatmalarni saqlaydi, lekin asl hujjatlaringiz oʻrnini bosmaydi — asllarini xavfsiz saqlang.",
          },
          {
            q: "Bu bepulmi?",
            a: "Ha. Bepul tarif 2 GB, muddat eslatmalari, oilaviy kirish va oflayn kirishni oʻz ichiga oladi. Pullik tarif keyinroq paydo boʻlishi mumkin.",
          },
        ],
      },
    },
    related: {
      en: [
        { href: "/family-document-vault", label: "Family document vault" },
        { href: "/medical-document-organizer", label: "Medical document organizer" },
      ],
      ru: [
        { href: "/family-document-vault", label: "Семейный сейф документов" },
        { href: "/medical-document-organizer", label: "Органайзер медицинских документов" },
      ],
      id: [
        { href: "/family-document-vault", label: "Brankas dokumen keluarga" },
        { href: "/medical-document-organizer", label: "Pengatur dokumen medis" },
      ],
      uz: [
        { href: "/family-document-vault", label: "Oilaviy hujjatlar sefi" },
        { href: "/medical-document-organizer", label: "Tibbiy hujjatlar tartiblagichi" },
      ],
    },
  },
  "candidate-document-collection": {
    slug: "candidate-document-collection",
    emoji: "📨",
    locales: {
      en: {
        navLabel: "Collect candidate docs",
        title: "Collect Candidate Documents via One Link | Doki.help",
        metaDescription:
          "Send candidates one checklist link and get complete document packages — with a “what's missing” status and expiry reminders. No candidate account.",
        h1: "Collect candidate documents via one link",
        intro:
          "Stop chasing candidates for files across WhatsApp and email. Send one checklist link, and each candidate uploads their documents without an account — you see a complete/missing status per person.",
        ctaPrimary: "Create your first checklist",
        sections: [
          {
            h2: "How it works",
            bullets: [
              "Create a checklist of the documents you need (or start from a template)",
              "Share the link with candidates over WhatsApp",
              "Candidates upload without registering",
              "You see who is complete and who is still missing documents",
            ],
          },
          {
            h2: "Built for hiring at volume",
            body: "One link works for many candidates at once. Sensitive documents like KTP and health certificates are collected after an offer, not from every applicant.",
          },
          {
            h2: "Nothing expires unnoticed",
            body: "Add expiry dates for documents like SKCK, KITAS and certificates and get reminders before they lapse.",
          },
        ],
        trustHeading: "How documents are protected",
        trust: [
          "Files served via short-lived signed links, not public URLs",
          "Revocable share links with expiry, view limits and watermark",
          "Access is isolated at the database level (RLS)",
        ],
        faqHeading: "Frequently asked",
        faq: [
          { q: "Do candidates need an account?", a: "No. They open the link and upload documents without registering." },
          { q: "Can I collect from many candidates with one link?", a: "Yes — the same checklist link works for every candidate; each gets their own package." },
          { q: "Where are documents stored?", a: "In secure cloud infrastructure (Supabase); servers may be located outside Indonesia — see the Privacy Policy." },
        ],
      },
      id: {
        navLabel: "Kumpulkan dokumen kandidat",
        title: "Kumpulkan Dokumen Kandidat Lewat Satu Tautan | Doki.help",
        metaDescription:
          "Kirim satu tautan ceklis ke kandidat dan terima paket dokumen lengkap — dengan status “apa yang kurang” dan pengingat tenggat. Tanpa akun untuk kandidat.",
        h1: "Kumpulkan dokumen kandidat lewat satu tautan",
        intro:
          "Berhenti mengejar kandidat untuk berkas di WhatsApp dan email. Kirim satu tautan ceklis, dan tiap kandidat mengunggah dokumennya tanpa akun — Anda melihat status lengkap/kurang per orang.",
        ctaPrimary: "Buat checklist pertama",
        sections: [
          {
            h2: "Cara kerjanya",
            bullets: [
              "Buat ceklis dokumen yang dibutuhkan (atau mulai dari template)",
              "Bagikan tautannya ke kandidat lewat WhatsApp",
              "Kandidat mengunggah tanpa mendaftar",
              "Anda melihat siapa yang lengkap dan siapa yang masih kurang",
            ],
          },
          {
            h2: "Dibuat untuk rekrutmen jumlah banyak",
            body: "Satu tautan berlaku untuk banyak kandidat sekaligus. Dokumen sensitif seperti KTP dan surat sehat dikumpulkan setelah penawaran, bukan dari setiap pelamar.",
          },
          {
            h2: "Tidak ada yang kedaluwarsa diam-diam",
            body: "Tambahkan tanggal masa berlaku untuk dokumen seperti SKCK, KITAS, dan sertifikat, lalu dapatkan pengingat sebelum kedaluwarsa.",
          },
        ],
        trustHeading: "Cara dokumen dilindungi",
        trust: [
          "Berkas disajikan lewat tautan bertanda tangan berumur pendek, bukan URL publik",
          "Tautan berbagi bisa dicabut dengan kedaluwarsa, batas tampilan, dan watermark",
          "Akses diisolasi pada tingkat basis data (RLS)",
        ],
        faqHeading: "Pertanyaan umum",
        faq: [
          { q: "Apakah kandidat perlu akun?", a: "Tidak. Mereka membuka tautan dan mengunggah dokumen tanpa mendaftar." },
          { q: "Bisakah mengumpulkan dari banyak kandidat dengan satu tautan?", a: "Bisa — tautan ceklis yang sama berlaku untuk tiap kandidat; masing-masing punya paketnya sendiri." },
          { q: "Di mana dokumen disimpan?", a: "Di infrastruktur cloud aman (Supabase); server dapat berada di luar Indonesia — lihat Kebijakan Privasi." },
        ],
      },
      ru: {
        navLabel: "Сбор документов кандидатов",
        title: "Сбор документов кандидатов по одной ссылке | Doki.help",
        metaDescription:
          "Отправьте кандидатам ссылку-чек-лист и получите полные пакеты документов — со статусом «чего не хватает» и напоминаниями. Без регистрации кандидата.",
        h1: "Сбор документов кандидатов по одной ссылке",
        intro:
          "Хватит гоняться за кандидатами по WhatsApp и почте. Отправьте одну ссылку-чек-лист — каждый кандидат загружает документы без аккаунта, а вы видите статус «полный / не хватает» по каждому.",
        ctaPrimary: "Создать первый чек-лист",
        sections: [
          {
            h2: "Как это работает",
            bullets: [
              "Создайте чек-лист нужных документов (или из шаблона)",
              "Отправьте ссылку кандидатам в WhatsApp",
              "Кандидаты загружают без регистрации",
              "Вы видите, кто укомплектован, а у кого чего не хватает",
            ],
          },
          {
            h2: "Под наём на объёме",
            body: "Одна ссылка работает сразу для многих кандидатов. Чувствительные документы вроде KTP и медсправок собираются после оффера, а не у каждого соискателя.",
          },
          {
            h2: "Ничего не просрочено",
            body: "Добавьте сроки для документов вроде SKCK, KITAS и сертификатов и получайте напоминания заранее.",
          },
        ],
        trustHeading: "Как защищены документы",
        trust: [
          "Файлы отдаются по короткоживущим подписанным ссылкам, без публичных адресов",
          "Отзывные ссылки с истечением, лимитом просмотров и watermark",
          "Доступ изолирован на уровне базы (RLS)",
        ],
        faqHeading: "Частые вопросы",
        faq: [
          { q: "Нужен ли кандидату аккаунт?", a: "Нет. Он открывает ссылку и загружает документы без регистрации." },
          { q: "Можно собрать у многих кандидатов одной ссылкой?", a: "Да — одна ссылка-чек-лист работает для каждого; у каждого свой пакет." },
          { q: "Где хранятся документы?", a: "В защищённой облачной инфраструктуре (Supabase); серверы могут быть за пределами Индонезии — см. Политику конфиденциальности." },
        ],
      },
      uz: {
        navLabel: "Nomzod hujjatlarini yig‘ish",
        title: "Nomzod hujjatlarini bitta havola orqali yig‘ing | Doki.help",
        metaDescription:
          "Nomzodlarga ro‘yxat-havola yuboring va to‘liq hujjat paketlarini oling — “nima yetishmayapti” statusi va eslatmalar bilan. Nomzodga hisob kerak emas.",
        h1: "Nomzod hujjatlarini bitta havola orqali yig‘ing",
        intro:
          "Nomzodlarni WhatsApp va emailda fayllar uchun quvishni bas qiling. Bitta ro‘yxat-havola yuboring — har bir nomzod hujjatlarini hisobsiz yuklaydi, siz esa har biri bo‘yicha to‘liq/kam statusini ko‘rasiz.",
        ctaPrimary: "Birinchi ro‘yxatni yaratish",
        sections: [
          {
            h2: "Qanday ishlaydi",
            bullets: [
              "Kerakli hujjatlar ro‘yxatini tuzing (yoki shablondan boshlang)",
              "Havolani nomzodlarga WhatsApp orqali ulashing",
              "Nomzodlar ro‘yxatdan o‘tmasdan yuklaydi",
              "Kim to‘liq, kimda hujjat yetishmayotganini ko‘rasiz",
            ],
          },
          {
            h2: "Ko‘p sonli yollash uchun",
            body: "Bitta havola bir vaqtda ko‘p nomzod uchun ishlaydi. KTP va tibbiy ma’lumotnoma kabi sezgir hujjatlar har bir arizachidan emas, taklifdan keyin yig‘iladi.",
          },
          {
            h2: "Hech narsa bilinmay o‘tmaydi",
            body: "SKCK, KITAS va sertifikatlar kabi hujjatlar uchun muddat qo‘shing va tugashidan oldin eslatma oling.",
          },
        ],
        trustHeading: "Hujjatlar qanday himoyalanadi",
        trust: [
          "Fayllar ommaviy URL emas, qisqa muddatli imzolangan havolalar orqali beriladi",
          "Ulashish havolalari muddati, ko‘rish chegarasi va watermark bilan bekor qilinadi",
          "Kirish ma’lumotlar bazasi darajasida ajratilgan (RLS)",
        ],
        faqHeading: "Ko‘p beriladigan savollar",
        faq: [
          { q: "Nomzodga hisob kerakmi?", a: "Yo‘q. U havolani ochib, hujjatlarni ro‘yxatdan o‘tmasdan yuklaydi." },
          { q: "Bitta havola bilan ko‘p nomzoddan yig‘sa bo‘ladimi?", a: "Ha — bir xil ro‘yxat-havola har bir nomzod uchun ishlaydi; har birida o‘z paketi bo‘ladi." },
          { q: "Hujjatlar qayerda saqlanadi?", a: "Xavfsiz bulut infratuzilmasida (Supabase); serverlar Indoneziyadan tashqarida bo‘lishi mumkin — Maxfiylik siyosatiga qarang." },
        ],
      },
    },
    related: {
      en: [
        { href: "/for/recruitment-agencies", label: "For recruiting agencies" },
        { href: "/checklists/skck-checklist", label: "SKCK checklist" },
        { href: "/security", label: "How your documents are protected" },
      ],
      id: [
        { href: "/for/recruitment-agencies", label: "Untuk agensi rekrutmen" },
        { href: "/checklists/skck-checklist", label: "Ceklis SKCK" },
        { href: "/security", label: "Cara dokumen Anda dilindungi" },
      ],
      ru: [
        { href: "/for/recruitment-agencies", label: "Для рекрутинговых агентств" },
        { href: "/checklists/skck-checklist", label: "Чек-лист SKCK" },
        { href: "/security", label: "Как защищены документы" },
      ],
      uz: [
        { href: "/for/recruitment-agencies", label: "Rekruting agentliklari uchun" },
        { href: "/checklists/skck-checklist", label: "SKCK ro‘yxati" },
        { href: "/security", label: "Hujjatlaringiz qanday himoyalanadi" },
      ],
    },
  },
  "hr-document-checklist": {
    slug: "hr-document-checklist",
    emoji: "✅",
    locales: {
      en: {
        navLabel: "HR document checklist",
        title: "HR Document Checklist Tool for Hiring | Doki.help",
        metaDescription:
          "Build a document checklist for any role, send it as one link, and get complete candidate packages with a “what's missing” status and reminders.",
        h1: "HR document checklist — build it, send it, track it",
        intro:
          "Turn “please send your documents” into a structured checklist. Pick the documents a role needs, share one link, and Doki tracks who is complete and who is still missing files.",
        ctaPrimary: "Create your first checklist",
        sections: [
          {
            h2: "Start from a template or build your own",
            bullets: [
              "Ready pack templates: villa staff, F&B, receptionist, driver, general staff",
              "Or pick documents one by one for the role",
              "Reuse the same checklist for every candidate",
            ],
          },
          {
            h2: "Send one link, track completeness",
            bullets: [
              "Candidates upload without an account",
              "See a “complete / missing” status per person",
              "Reminders for SKCK, KITAS and certificate expiry",
            ],
          },
          {
            h2: "Privacy by design",
            body: "Sensitive documents like KTP and health certificates are collected after an offer, not from every applicant — a cleaner, more trustworthy process for candidates.",
          },
        ],
        trustHeading: "How documents are protected",
        trust: [
          "Revocable share links with expiry, view limits and watermark",
          "Files served via short-lived signed links, not public URLs",
          "Export with no lock-in",
        ],
        faqHeading: "Frequently asked",
        faq: [
          { q: "Can I reuse one checklist for many candidates?", a: "Yes — the same link works for every candidate; each gets their own package." },
          { q: "Do candidates need an account?", a: "No. They open the link and upload without registering." },
          { q: "Can I edit the checklist?", a: "Yes — start from a template and add or remove documents for the role." },
        ],
      },
      id: {
        navLabel: "Checklist dokumen HR",
        title: "Alat Ceklis Dokumen HR untuk Rekrutmen | Doki.help",
        metaDescription:
          "Buat ceklis dokumen untuk posisi apa pun, kirim sebagai satu tautan, dan terima paket kandidat lengkap dengan status “apa yang kurang” dan pengingat.",
        h1: "Ceklis dokumen HR — buat, kirim, pantau",
        intro:
          "Ubah “tolong kirim dokumennya” jadi ceklis yang terstruktur. Pilih dokumen yang dibutuhkan sebuah posisi, bagikan satu tautan, dan Doki memantau siapa yang lengkap dan siapa yang masih kurang.",
        ctaPrimary: "Buat checklist pertama",
        sections: [
          {
            h2: "Mulai dari template atau buat sendiri",
            bullets: [
              "Template paket siap pakai: staf vila, F&B, resepsionis, sopir, staf umum",
              "Atau pilih dokumen satu per satu untuk posisinya",
              "Pakai ulang ceklis yang sama untuk tiap kandidat",
            ],
          },
          {
            h2: "Kirim satu tautan, pantau kelengkapan",
            bullets: [
              "Kandidat mengunggah tanpa akun",
              "Lihat status “lengkap / kurang” per orang",
              "Pengingat masa berlaku SKCK, KITAS, dan sertifikat",
            ],
          },
          {
            h2: "Privasi sejak awal",
            body: "Dokumen sensitif seperti KTP dan surat sehat dikumpulkan setelah penawaran, bukan dari setiap pelamar — proses yang lebih rapi dan tepercaya bagi kandidat.",
          },
        ],
        trustHeading: "Cara dokumen dilindungi",
        trust: [
          "Tautan berbagi bisa dicabut dengan kedaluwarsa, batas tampilan, dan watermark",
          "Berkas disajikan lewat tautan bertanda tangan berumur pendek, bukan URL publik",
          "Ekspor tanpa terkunci",
        ],
        faqHeading: "Pertanyaan umum",
        faq: [
          { q: "Bisakah pakai satu ceklis untuk banyak kandidat?", a: "Bisa — tautan yang sama berlaku untuk tiap kandidat; masing-masing punya paketnya sendiri." },
          { q: "Apakah kandidat perlu akun?", a: "Tidak. Mereka membuka tautan dan mengunggah tanpa mendaftar." },
          { q: "Bisakah mengedit ceklisnya?", a: "Bisa — mulai dari template lalu tambah atau hapus dokumen sesuai posisi." },
        ],
      },
      ru: {
        navLabel: "Чек-лист документов HR",
        title: "Инструмент чек-листа документов для HR | Doki.help",
        metaDescription:
          "Соберите чек-лист документов под любую роль, отправьте одной ссылкой и получайте полные пакеты кандидатов со статусом «чего не хватает» и напоминаниями.",
        h1: "Чек-лист документов HR — собрать, отправить, отследить",
        intro:
          "Превратите «пришлите документы» в структурированный чек-лист. Выберите документы под роль, отправьте одну ссылку — Doki отследит, кто укомплектован, а у кого чего не хватает.",
        ctaPrimary: "Создать первый чек-лист",
        sections: [
          {
            h2: "Из шаблона или свой",
            bullets: [
              "Готовые шаблоны паков: персонал виллы, F&B, ресепшн, водитель, линейный персонал",
              "Или выберите документы по одному под роль",
              "Переиспользуйте один чек-лист для каждого кандидата",
            ],
          },
          {
            h2: "Одна ссылка, контроль комплектности",
            bullets: [
              "Кандидаты загружают без аккаунта",
              "Статус «полный / не хватает» по каждому",
              "Напоминания о сроках SKCK, KITAS и сертификатов",
            ],
          },
          {
            h2: "Приватность по умолчанию",
            body: "Чувствительные документы вроде KTP и медсправок собираются после оффера, а не у каждого соискателя — это чище и надёжнее для кандидатов.",
          },
        ],
        trustHeading: "Как защищены документы",
        trust: [
          "Отзывные ссылки с истечением, лимитом просмотров и watermark",
          "Файлы отдаются по короткоживущим подписанным ссылкам, без публичных адресов",
          "Экспорт без привязки",
        ],
        faqHeading: "Частые вопросы",
        faq: [
          { q: "Можно один чек-лист для многих кандидатов?", a: "Да — одна ссылка работает для каждого; у каждого свой пакет." },
          { q: "Нужен ли кандидату аккаунт?", a: "Нет. Он открывает ссылку и загружает без регистрации." },
          { q: "Можно редактировать чек-лист?", a: "Да — начните с шаблона и добавьте/уберите документы под роль." },
        ],
      },
      uz: {
        navLabel: "HR hujjat ro‘yxati",
        title: "Yollash uchun HR hujjat ro‘yxati vositasi | Doki.help",
        metaDescription:
          "Istalgan lavozim uchun hujjatlar ro‘yxatini tuzing, bitta havola qilib yuboring va to‘liq nomzod paketlarini “nima yetishmayapti” statusi bilan oling.",
        h1: "HR hujjat ro‘yxati — tuzing, yuboring, kuzating",
        intro:
          "“Hujjatlaringizni yuboring” ni tuzilgan ro‘yxatga aylantiring. Lavozimga kerakli hujjatlarni tanlang, bitta havola ulashing — Doki kim to‘liq, kimda nima kamligini kuzatadi.",
        ctaPrimary: "Birinchi ro‘yxatni yaratish",
        sections: [
          {
            h2: "Shablondan yoki o‘zingiz",
            bullets: [
              "Tayyor paket shablonlari: villa xodimi, F&B, resepsionist, haydovchi, umumiy xodim",
              "Yoki lavozim uchun hujjatlarni birma-bir tanlang",
              "Bir xil ro‘yxatni har bir nomzod uchun qayta ishlating",
            ],
          },
          {
            h2: "Bitta havola, to‘liqlikni kuzating",
            bullets: [
              "Nomzodlar hisobsiz yuklaydi",
              "Har bir odam bo‘yicha “to‘liq / kam” statusi",
              "SKCK, KITAS va sertifikat muddatlari bo‘yicha eslatmalar",
            ],
          },
          {
            h2: "Boshidan maxfiylik",
            body: "KTP va tibbiy ma’lumotnoma kabi sezgir hujjatlar har bir arizachidan emas, taklifdan keyin yig‘iladi — nomzodlar uchun tozaroq va ishonchliroq jarayon.",
          },
        ],
        trustHeading: "Hujjatlar qanday himoyalanadi",
        trust: [
          "Ulashish havolalari muddati, ko‘rish chegarasi va watermark bilan bekor qilinadi",
          "Fayllar ommaviy URL emas, qisqa muddatli imzolangan havolalar orqali beriladi",
          "Bog‘lanishsiz eksport",
        ],
        faqHeading: "Ko‘p beriladigan savollar",
        faq: [
          { q: "Bitta ro‘yxatni ko‘p nomzod uchun ishlatsa bo‘ladimi?", a: "Ha — bir xil havola har bir nomzod uchun ishlaydi; har birida o‘z paketi bo‘ladi." },
          { q: "Nomzodga hisob kerakmi?", a: "Yo‘q. Havolani ochib, ro‘yxatdan o‘tmasdan yuklaydi." },
          { q: "Ro‘yxatni tahrirlash mumkinmi?", a: "Ha — shablondan boshlang va lavozimga qarab hujjat qo‘shing yoki olib tashlang." },
        ],
      },
    },
    related: {
      en: [
        { href: "/for/employers", label: "For HR teams & agencies" },
        { href: "/checklists/employee-onboarding-11-checklist", label: "Onboarding checklist" },
        { href: "/candidate-document-collection", label: "Collect candidate documents" },
      ],
      id: [
        { href: "/for/employers", label: "Untuk tim HR & agensi" },
        { href: "/checklists/employee-onboarding-11-checklist", label: "Ceklis onboarding" },
        { href: "/candidate-document-collection", label: "Kumpulkan dokumen kandidat" },
      ],
      ru: [
        { href: "/for/employers", label: "Для HR-команд и агентств" },
        { href: "/checklists/employee-onboarding-11-checklist", label: "Чек-лист онбординга" },
        { href: "/candidate-document-collection", label: "Сбор документов кандидатов" },
      ],
      uz: [
        { href: "/for/employers", label: "HR jamoalari va agentliklar uchun" },
        { href: "/checklists/employee-onboarding-11-checklist", label: "Onboarding ro‘yxati" },
        { href: "/candidate-document-collection", label: "Nomzod hujjatlarini yig‘ish" },
      ],
    },
  },
};

export function getLanding(slug: string): Landing | undefined {
  return DATA[slug as LandingKey];
}

/** Metadata для роута лендинга: title/description + canonical/hreflang + OG. */
export async function landingMetadata(slug: string): Promise<Metadata> {
  const l = getLanding(slug);
  if (!l) return {};
  const locale = await getLocale();
  const c = l.locales[locale] ?? l.locales.en;
  return {
    title: c.title,
    description: c.metaDescription,
    alternates: await altLangs(),
    openGraph: {
      title: c.title,
      description: c.metaDescription,
      url: `${APP_URL}/${locale}/${slug}`,
    },
  };
}

/** Ссылки на лендинги для внутренней перелинковки (главная и т.п.). */
export function landingLinks(locale: Locale) {
  return LANDING_KEYS.map((key) => ({
    key,
    emoji: DATA[key].emoji,
    label: DATA[key].locales[locale].navLabel,
  }));
}

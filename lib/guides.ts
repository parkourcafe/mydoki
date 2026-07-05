import "server-only";
import type { Metadata } from "next";
import type { Locale } from "./i18n";
import { getLocale } from "./i18n";
import { altLangs } from "./seo";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://doki.help";

/**
 * Гайды/блог (/blog/*). Полезные статьи под реальные запросы (организация
 * документов, сроки, поездки, безопасный обмен). 4 языка. Тон и правила — см.
 * .claude/skills/doki-brand-voice. Только подтверждённые факты; правила стран —
 * «проверьте требования»; неподтверждённое — TODO. Schema: Article +
 * BreadcrumbList + FAQPage.
 */

export type GuideSection = { h2: string; body?: string; bullets?: string[] };
export type GuideFaq = { q: string; a: string };

export type GuideContent = {
  navLabel: string;
  title: string; // <= 60
  metaDescription: string; // <= 155
  h1: string;
  intro: string;
  ctaPrimary: string;
  sections: GuideSection[];
  faqHeading: string;
  faq: GuideFaq[];
};

export type RelatedLink = { href: string; label: string };

export type Guide = {
  slug: string;
  emoji: string;
  locales: Record<Locale, GuideContent>;
  related: Record<Locale, RelatedLink[]>;
};

const DATA: Record<string, Guide> = {
  "how-to-organize-family-documents": {
    slug: "how-to-organize-family-documents",
    emoji: "🗂️",
    locales: {
      en: {
        navLabel: "Organize documents",
        title: "How to Organize Family Documents Without the Chaos",
        metaDescription:
          "A simple, calm system to organize your family's documents: gather them in one place, sort by person, add expiry dates, set reminders and share safely.",
        h1: "How to organize family documents: a simple system without the chaos",
        intro:
          "A calm, practical way to bring your family's important documents into one place — sorted by person, with expiry dates and reminders, so nothing gets lost or forgotten.",
        ctaPrimary: "Create your family document vault",
        sections: [
          {
            h2: "Why family documents turn into chaos",
            body: "Documents pile up gradually — a passport photo in a chat, a certificate in your email, an insurance PDF somewhere on a laptop. No single person owns the system, so when one document is suddenly needed, the whole family starts searching. The goal isn't to be perfectly tidy; it's to have one place you can actually rely on.",
          },
          {
            h2: "Step 1: Gather everything in one place",
            body: "Start by collecting the documents you reach for most often, and add the rest over time. You don't need to do it all in one sitting.",
            bullets: [
              "IDs and migration: passports, ID cards, visas, residence permits",
              "Medical: insurance, vaccination records, key reports",
              "Home and car: contracts, registration, ownership papers",
              "Education: diplomas, certificates, enrollment documents",
            ],
          },
          {
            h2: "Step 2: Sort by family member",
            body: "Give each person their own profile — partner, children, parents — and keep their documents together. This way you always know where to look, and children's papers don't get mixed up with the adults'. In doki.help you can organize documents by family member from the start.",
          },
          {
            h2: "Step 3: Add expiry dates",
            body: "Many documents quietly expire — passports, visas, insurance, driving licences. As you add each one, set its \"valid until\" date so the deadline lives with the document instead of in your head. Renewal rules differ by country and document, so always check the official requirements for anything time-sensitive.",
          },
          {
            h2: "Step 4: Set the reminders that matter",
            body: "Once a date is attached, doki.help can send an email reminder before the document expires, for every member of the family. Set them for the documents that are slow or stressful to renew, so a deadline reaches you early instead of surprising you.",
          },
          {
            h2: "Step 5: Share the right document safely",
            body: "Sometimes one document needs to go to a relative, a school or an agent. Instead of sending a copy that lives forever in a chat, share a link that expires and can be revoked at any time, with a view limit and a log of every open. The recipient needs no account.",
          },
          {
            h2: "How doki.help helps",
            body: "doki.help keeps your family's documents in private storage, transferred over HTTPS, with access isolated to your family at the database level (row-level security) — only your family sees them. Roles let you decide who is owner, editor or viewer, two-factor login is available, and optional AI field recognition is off by default. It's in beta and doesn't replace your original documents.",
          },
        ],
        faqHeading: "FAQ",
        faq: [
          {
            q: "Where do I even start organizing family documents?",
            a: "Start with the documents you use most, add each person's papers under their own profile, and set expiry dates as you go. You don't need to finish in one day — a little at a time works.",
          },
          {
            q: "How should I sort documents for the whole family?",
            a: "Keep a separate profile for each family member, so everyone's documents stay together. It makes anything easy to find and keeps children's papers from getting mixed up with the adults'.",
          },
          {
            q: "How will I be reminded before a document expires?",
            a: "By email, before the \"valid until\" date you set on each document. The reminder comes 30, 15, 7 and 1 day before that date.",
          },
          {
            q: "Is it safe to keep our documents here?",
            a: "Files are kept in private storage over HTTPS, access is isolated to your family at the database level (row-level security), and two-factor login is available. doki.help is in beta and doesn't replace your originals.",
          },
          {
            q: "Can I share one document without giving access to everything?",
            a: "Yes. Share a single document with a link that expires and can be revoked at any time, with a view limit and a log of every open — the rest of your vault stays private.",
          },
        ],
      },
      ru: {
        navLabel: "Организовать документы",
        title: "Как организовать документы семьи без хаоса",
        metaDescription:
          "Простая спокойная система для документов семьи: собрать в одном месте, разделить по членам семьи, добавить сроки, настроить напоминания и безопасно делиться.",
        h1: "Как организовать документы семьи: простая система без хаоса",
        intro:
          "Спокойный и практичный способ собрать важные документы семьи в одном месте — по членам семьи, со сроками и напоминаниями, чтобы ничего не потерялось и не забылось.",
        ctaPrimary: "Создайте семейный сейф документов",
        sections: [
          {
            h2: "Почему документы семьи превращаются в хаос",
            body: "Документы накапливаются постепенно: фото паспорта в чате, справка в почте, PDF страховки где-то на ноутбуке. Единой системы нет ни у кого, поэтому когда документ вдруг нужен, искать начинает вся семья. Цель — не идеальный порядок, а одно место, на которое действительно можно положиться.",
          },
          {
            h2: "Шаг 1: собрать всё в одном месте",
            body: "Начните с документов, к которым обращаетесь чаще всего, а остальные добавляйте постепенно. Всё сразу делать не нужно.",
            bullets: [
              "Удостоверения и миграция: паспорта, ID, визы, ВНЖ",
              "Медицина: страховки, прививки, ключевые заключения",
              "Дом и авто: договоры, регистрация, документы о собственности",
              "Образование: дипломы, сертификаты, документы о зачислении",
            ],
          },
          {
            h2: "Шаг 2: разделить по членам семьи",
            body: "Заведите профиль на каждого — супруга, детей, родителей — и держите их документы вместе. Так вы всегда знаете, где искать, а бумаги детей не путаются с документами взрослых. В doki.help документы можно организовать по членам семьи с самого начала.",
          },
          {
            h2: "Шаг 3: добавить сроки действия",
            body: "Многие документы тихо истекают — паспорта, визы, страховки, водительские права. Добавляя документ, укажите дату «действует до», чтобы срок жил вместе с документом, а не в голове. Правила продления зависят от страны и типа документа, поэтому по всему срочному проверяйте официальные требования.",
          },
          {
            h2: "Шаг 4: настроить нужные напоминания",
            body: "Когда к документу привязана дата, doki.help может прислать email-напоминание до окончания срока — для каждого члена семьи. Ставьте их на то, что долго или хлопотно продлевать, чтобы срок находил вас заранее, а не заставал врасплох.",
          },
          {
            h2: "Шаг 5: безопасно поделиться нужным документом",
            body: "Иногда один документ нужно отправить родственнику, в школу или агенту. Вместо копии, которая навсегда останется в чате, поделитесь ссылкой, которая истекает и отзывается в любой момент, с лимитом просмотров и журналом открытий. Получателю не нужен аккаунт.",
          },
          {
            h2: "Как помогает doki.help",
            body: "doki.help хранит документы семьи в приватном хранилище, передаёт их по HTTPS, а доступ изолирован вашей семьёй на уровне базы (RLS) — документы видит только ваша семья. Роли позволяют решить, кто owner, editor или viewer, доступен двухфакторный вход, а опциональное AI-распознавание полей по умолчанию выключено. Сервис в стадии beta и не заменяет оригиналы документов.",
          },
        ],
        faqHeading: "Частые вопросы",
        faq: [
          {
            q: "С чего вообще начать организацию документов семьи?",
            a: "Начните с тех документов, которыми пользуетесь чаще всего, добавьте бумаги каждого под его профилем и укажите сроки по ходу дела. Всё за один день делать не обязательно — понемногу тоже работает.",
          },
          {
            q: "Как разделить документы всей семьи?",
            a: "Заведите отдельный профиль на каждого члена семьи, чтобы документы каждого лежали вместе. Так всё легко найти, а бумаги детей не путаются с документами взрослых.",
          },
          {
            q: "Как придёт напоминание до окончания срока?",
            a: "На email, до указанной вами даты «действует до» на каждом документе. Напоминание приходит за 30, 15, 7 и 1 день до этой даты.",
          },
          {
            q: "Безопасно ли хранить наши документы здесь?",
            a: "Файлы хранятся в приватном хранилище по HTTPS, доступ изолирован вашей семьёй на уровне базы (RLS), доступен двухфакторный вход. doki.help в стадии beta и не заменяет оригиналы.",
          },
          {
            q: "Можно поделиться одним документом, не открывая доступ ко всему?",
            a: "Да. Поделитесь одним документом по ссылке, которая истекает и отзывается в любой момент, с лимитом просмотров и журналом открытий — остальной сейф остаётся приватным.",
          },
        ],
      },
      id: {
        navLabel: "Tata dokumen",
        title: "Cara Menata Dokumen Keluarga Tanpa Kekacauan",
        metaDescription:
          "Sistem sederhana dan tenang untuk dokumen keluarga: kumpulkan di satu tempat, pilah per anggota, tambahkan masa berlaku, pasang pengingat, dan berbagi aman.",
        h1: "Cara menata dokumen keluarga: sistem sederhana tanpa kekacauan",
        intro:
          "Cara yang tenang dan praktis untuk mengumpulkan dokumen penting keluarga di satu tempat — dipilah per anggota, dengan masa berlaku dan pengingat, agar tidak ada yang hilang atau terlupa.",
        ctaPrimary: "Buat brankas dokumen keluarga",
        sections: [
          {
            h2: "Mengapa dokumen keluarga jadi kacau",
            body: "Dokumen menumpuk sedikit demi sedikit — foto paspor di chat, sertifikat di email, PDF asuransi entah di laptop mana. Tidak ada satu orang yang memegang sistemnya, jadi saat satu dokumen tiba-tiba diperlukan, satu keluarga ikut mencari. Tujuannya bukan rapi sempurna, melainkan satu tempat yang benar-benar bisa diandalkan.",
          },
          {
            h2: "Langkah 1: kumpulkan di satu tempat",
            body: "Mulai dari dokumen yang paling sering Anda butuhkan, lalu tambahkan sisanya seiring waktu. Tidak perlu selesai sekaligus.",
            bullets: [
              "Identitas dan migrasi: paspor, KTP, visa, izin tinggal",
              "Medis: asuransi, catatan vaksinasi, hasil penting",
              "Rumah dan mobil: kontrak, registrasi, surat kepemilikan",
              "Pendidikan: ijazah, sertifikat, dokumen pendaftaran",
            ],
          },
          {
            h2: "Langkah 2: pilah per anggota keluarga",
            body: "Beri tiap orang profilnya sendiri — pasangan, anak, orang tua — dan simpan dokumennya bersama. Dengan begitu Anda selalu tahu di mana mencari, dan berkas anak tidak tercampur dengan milik orang dewasa. Di doki.help, dokumen bisa ditata per anggota keluarga sejak awal.",
          },
          {
            h2: "Langkah 3: tambahkan masa berlaku",
            body: "Banyak dokumen diam-diam kedaluwarsa — paspor, visa, asuransi, SIM. Saat menambahkan tiap dokumen, isi tanggal \"berlaku sampai\" agar tenggatnya menempel pada dokumen, bukan di kepala. Aturan perpanjangan berbeda tiap negara dan jenis dokumen, jadi selalu periksa persyaratan resmi untuk hal yang terikat waktu.",
          },
          {
            h2: "Langkah 4: pasang pengingat yang penting",
            body: "Setelah tanggal terpasang, doki.help bisa mengirim pengingat email sebelum dokumen kedaluwarsa, untuk tiap anggota keluarga. Pasang untuk dokumen yang lama atau merepotkan diperpanjang, agar tenggat menghampiri Anda lebih awal, bukan mengejutkan.",
          },
          {
            h2: "Langkah 5: berbagi dokumen yang tepat dengan aman",
            body: "Kadang satu dokumen perlu dikirim ke kerabat, sekolah, atau agen. Alih-alih salinan yang selamanya tersimpan di chat, bagikan tautan yang kedaluwarsa dan bisa dicabut kapan saja, dengan batas tampilan dan catatan tiap pembukaan. Penerima tidak perlu akun.",
          },
          {
            h2: "Bagaimana doki.help membantu",
            body: "doki.help menyimpan dokumen keluarga di penyimpanan privat, ditransfer lewat HTTPS, dengan akses diisolasi untuk keluarga Anda di tingkat basis data (row-level security) — hanya keluarga Anda yang melihatnya. Peran menentukan siapa owner, editor, atau viewer, login dua faktor tersedia, dan pengenalan bidang AI opsional mati secara default. Masih beta dan tidak menggantikan dokumen asli Anda.",
          },
        ],
        faqHeading: "Pertanyaan umum",
        faq: [
          {
            q: "Mulai dari mana menata dokumen keluarga?",
            a: "Mulai dari dokumen yang paling sering dipakai, tambahkan berkas tiap orang di bawah profilnya, dan isi masa berlaku sambil jalan. Tidak harus selesai dalam sehari — sedikit demi sedikit juga bisa.",
          },
          {
            q: "Bagaimana memilah dokumen seluruh keluarga?",
            a: "Buat profil terpisah untuk tiap anggota keluarga agar dokumen masing-masing tetap bersama. Semua jadi mudah ditemukan dan berkas anak tidak tercampur dengan milik orang dewasa.",
          },
          {
            q: "Bagaimana pengingat sebelum dokumen kedaluwarsa datang?",
            a: "Lewat email, sebelum tanggal \"berlaku sampai\" yang Anda tetapkan pada tiap dokumen. Pengingat datang 30, 15, 7, dan 1 hari sebelum tanggal itu.",
          },
          {
            q: "Apakah aman menyimpan dokumen kami di sini?",
            a: "Berkas disimpan di penyimpanan privat lewat HTTPS, akses diisolasi untuk keluarga Anda di tingkat basis data (row-level security), dan login dua faktor tersedia. doki.help masih beta dan tidak menggantikan dokumen asli.",
          },
          {
            q: "Bisakah berbagi satu dokumen tanpa membuka akses ke semuanya?",
            a: "Bisa. Bagikan satu dokumen lewat tautan yang kedaluwarsa dan bisa dicabut kapan saja, dengan batas tampilan dan catatan tiap pembukaan — sisa brankas tetap privat.",
          },
        ],
      },
      uz: {
        navLabel: "Hujjatlarni tartiblash",
        title: "Oila hujjatlarini tartibga solishning oddiy tizimi",
        metaDescription:
          "Oila hujjatlari uchun sokin va oddiy tizim: bitta joyga yigʻing, aʼzolar boʻyicha ajrating, muddatlarni qoʻshing, eslatma sozlang va xavfsiz ulashing.",
        h1: "Oila hujjatlarini qanday tartibga solish: xaossiz oddiy tizim",
        intro:
          "Oilaning muhim hujjatlarini bitta joyga yigʻishning sokin va amaliy yoʻli — aʼzolar boʻyicha, muddat va eslatmalar bilan, hech narsa yoʻqolmasin va unutilmasin.",
        ctaPrimary: "Oilaviy hujjatlar seyfini yarating",
        sections: [
          {
            h2: "Nega oila hujjatlari xaosga aylanadi",
            body: "Hujjatlar asta-sekin toʻplanadi — chatda pasport surati, pochtada guvohnoma, notebookda qayerdadir sugʻurta PDFi. Tizim hech kimning zimmasida boʻlmaydi, shuning uchun bitta hujjat kerak boʻlib qolsa, butun oila qidira boshlaydi. Maqsad — mukammal tartib emas, balki chindan ishonsa boʻladigan bitta joy.",
          },
          {
            h2: "1-qadam: hammasini bitta joyga yigʻing",
            body: "Eng koʻp murojaat qiladigan hujjatlardan boshlang, qolganini vaqt oʻtgani sari qoʻshib boring. Hammasini bir oʻtirishda qilish shart emas.",
            bullets: [
              "Guvohnoma va migratsiya: pasportlar, ID, vizalar, yashash ruxsati",
              "Tibbiyot: sugʻurta, emlash yozuvlari, muhim xulosalar",
              "Uy va avto: shartnomalar, roʻyxat, mulk hujjatlari",
              "Taʼlim: diplomlar, sertifikatlar, oʻqishga qabul hujjatlari",
            ],
          },
          {
            h2: "2-qadam: oila aʼzolari boʻyicha ajrating",
            body: "Har bir kishiga oʻz profilini bering — turmush oʻrtogʻingiz, bolalar, ota-onangiz — va ularning hujjatlarini birga saqlang. Shunda qayerdan qidirishni doim bilasiz, bolalarning hujjatlari kattalarnikiga aralashib ketmaydi. doki.help da hujjatlarni boshidanoq oila aʼzolari boʻyicha tartiblash mumkin.",
          },
          {
            h2: "3-qadam: amal qilish muddatini qoʻshing",
            body: "Koʻp hujjatlar jimgina tugaydi — pasportlar, vizalar, sugʻurtalar, haydovchilik guvohnomalari. Har bir hujjatni qoʻshayotib \"amal qiladi\" sanasini kiriting, shunda muddat xotirada emas, hujjat bilan birga yashaydi. Yangilash qoidalari davlat va hujjat turiga qarab farq qiladi, shuning uchun muddatga bogʻliq har narsa boʻyicha rasmiy talablarni tekshiring.",
          },
          {
            h2: "4-qadam: kerakli eslatmalarni sozlang",
            body: "Sana biriktirilgach, doki.help hujjat muddati tugashidan oldin email eslatma yuborishi mumkin — har bir oila aʼzosi uchun. Uni yangilash uzoq yoki mashaqqatli hujjatlarga qoʻying, shunda muddat sizni kutilmaganda emas, oldindan topadi.",
          },
          {
            h2: "5-qadam: kerakli hujjatni xavfsiz ulashing",
            body: "Baʼzida bitta hujjatni qarindoshga, maktabga yoki agentga yuborish kerak boʻladi. Chatda abadiy qoladigan nusxa oʻrniga muddati tugaydigan va istalgan vaqt bekor qilinadigan havola ulashing, koʻrish chegarasi va har ochilish qaydi bilan. Qabul qiluvchiga akkaunt kerak emas.",
          },
          {
            h2: "doki.help qanday yordam beradi",
            body: "doki.help oila hujjatlarini maxfiy omborda saqlaydi, HTTPS orqali uzatadi, kirish esa maʼlumotlar bazasi darajasida oilangiz bilan izolyatsiya qilingan (RLS) — hujjatlarni faqat oilangiz koʻradi. Rollar kim owner, editor yoki viewer ekanini belgilaydi, ikki bosqichli kirish mavjud, ixtiyoriy AI maydon tanish esa sukut boʻyicha oʻchiq. U beta bosqichida va asl hujjatlaringiz oʻrnini bosmaydi.",
          },
        ],
        faqHeading: "Tez-tez beriladigan savollar",
        faq: [
          {
            q: "Oila hujjatlarini tartiblashni nimadan boshlash kerak?",
            a: "Eng koʻp ishlatadigan hujjatlardan boshlang, har kimning qogʻozlarini oʻz profili ostiga qoʻshing va muddatlarni yoʻl-yoʻlakay kiriting. Bir kunda tugatish shart emas — oz-ozdan ham boʻladi.",
          },
          {
            q: "Butun oila hujjatlarini qanday ajratish kerak?",
            a: "Har bir oila aʼzosi uchun alohida profil yarating, shunda har kimning hujjatlari birga turadi. Hammasi oson topiladi, bolalarning qogʻozlari kattalarnikiga aralashmaydi.",
          },
          {
            q: "Hujjat muddati tugashidan oldin eslatma qanday keladi?",
            a: "Email orqali, har bir hujjatda siz belgilagan \"amal qiladi\" sanasidan oldin. Eslatma shu sanadan 30, 15, 7 va 1 kun oldin keladi.",
          },
          {
            q: "Hujjatlarimizni bu yerda saqlash xavfsizmi?",
            a: "Fayllar maxfiy omborda HTTPS orqali saqlanadi, kirish oilangiz darajasida izolyatsiya qilingan (RLS), ikki bosqichli kirish mavjud. doki.help beta bosqichida va asl hujjatlar oʻrnini bosmaydi.",
          },
          {
            q: "Hammasiga ruxsat bermay bitta hujjatni ulashsa boʻladimi?",
            a: "Ha. Bitta hujjatni muddati tugaydigan va istalgan vaqt bekor qilinadigan havola orqali ulashing, koʻrish chegarasi va har ochilish qaydi bilan — seyfning qolgani maxfiy qoladi.",
          },
        ],
      },
    },
    related: {
      en: [
        { href: "/family-document-vault", label: "Family document vault" },
        { href: "/document-expiry-reminder", label: "Document expiry reminders" },
      ],
      ru: [
        { href: "/family-document-vault", label: "Семейный сейф документов" },
        { href: "/document-expiry-reminder", label: "Напоминания о сроках документов" },
      ],
      id: [
        { href: "/family-document-vault", label: "Brankas dokumen keluarga" },
        { href: "/document-expiry-reminder", label: "Pengingat masa berlaku dokumen" },
      ],
      uz: [
        { href: "/family-document-vault", label: "Oilaviy hujjatlar seyfi" },
        { href: "/document-expiry-reminder", label: "Hujjat muddati eslatmalari" },
      ],
    },
  },
  "how-to-track-document-expiry-dates": {
    slug: "how-to-track-document-expiry-dates",
    emoji: "⏰",
    locales: {
      en: {
        navLabel: "Track expiry dates",
        title: "How to Track Document Expiry Dates for the Family",
        metaDescription:
          "A calm way to never miss a passport, visa or insurance deadline: know which documents to watch, set reminders early and keep every date in one place.",
        h1: "How to avoid missing a passport, visa or insurance deadline",
        intro:
          "A practical way to keep track of when your family's documents expire — which ones need watching, how early to set reminders, and how to keep every deadline in one place instead of in your head.",
        ctaPrimary: "Add your documents and set up reminders",
        sections: [
          {
            h2: "Why expiry dates are so easy to forget",
            body: "Expiry dates rarely announce themselves. A passport is valid for years, an insurance policy renews quietly, a visa sits in a drawer until the day you need it. There's no natural moment that reminds you a deadline is coming — so it surfaces at the worst time, often right before a trip. The fix isn't to memorise dates; it's to store each date with its document and let a reminder reach you early.",
          },
          {
            h2: "Which documents usually need watching",
            body: "Not everything expires, but a handful of documents almost always do — and these are the ones worth tracking first.",
            bullets: [
              "Passports, especially with children whose documents expire sooner",
              "Visas and residence permits",
              "Insurance policies — health, travel, car, home",
              "Driving licences",
              "Certificates and other documents with a renewal date",
            ],
          },
          {
            h2: "How early to set a reminder",
            body: "There's no single right answer — the lead time you need depends on the document and the country. Renewing a passport or a visa can take weeks or months, while some documents renew in a day. As a rule of thumb, give yourself enough time to gather papers, book an appointment and wait for processing. For anything tied to travel or immigration, check the official requirements for the country involved, since rules and validity windows differ.",
          },
          {
            h2: "Keeping dates for the whole family",
            body: "One person's dates are manageable in your head; a family's are not. Give each member their own profile — partner, children, parents — and store each document with its \"valid until\" date. That way a child's passport and a parent's visa are tracked side by side, and no one's deadline slips through because it lived only in someone else's memory.",
          },
          {
            h2: "What to check before a trip",
            body: "Before you travel, do a quick pass over the documents you'll rely on: passports and their validity, any visa or permit, and travel or health insurance for the dates you're away. Many countries ask for passport validity beyond your return date, so confirm the official requirements for your destination rather than assuming. Having every date in one place makes this a two-minute check instead of a scramble.",
          },
          {
            h2: "How doki.help helps with reminders",
            body: "As you add each document, set its \"valid until\" date, and doki.help can send an email reminder before it expires — for every member of the family. The reminder comes 30, 15, 7 and 1 day before that date. Documents stay in private storage over HTTPS, with access isolated to your family at the database level (row-level security), roles for who is owner, editor or viewer, and two-factor login available. Optional AI field recognition is off by default. doki.help is in beta and doesn't replace your original documents.",
          },
        ],
        faqHeading: "FAQ",
        faq: [
          {
            q: "How far in advance should I set an expiry reminder?",
            a: "Enough time to renew without stress — which varies by document and country. Passports and visas can take weeks or months, so give yourself a wide margin and check the official requirements for anything travel- or immigration-related.",
          },
          {
            q: "Which documents should I track first?",
            a: "Start with the ones that expire and are slow to renew: passports, visas and residence permits, insurance policies, and driving licences. Add certificates and anything else with a renewal date over time.",
          },
          {
            q: "How will I be reminded before a document expires?",
            a: "By email, before the \"valid until\" date you set on each document. The reminder comes 30, 15, 7 and 1 day before that date.",
          },
          {
            q: "Can I track expiry dates for everyone in the family?",
            a: "Yes. Give each family member their own profile and store each document with its expiry date, so a child's passport and a parent's visa are tracked side by side in one place.",
          },
          {
            q: "What should I check before travelling?",
            a: "Passport validity, any visa or permit, and travel or health insurance for your dates away. Many countries require passport validity beyond your return date, so confirm the official requirements for your destination.",
          },
        ],
      },
      ru: {
        navLabel: "Отслеживать сроки",
        title: "Как отслеживать сроки документов семьи",
        metaDescription:
          "Спокойный способ не пропустить срок паспорта, визы или страховки: какие документы контролировать, за сколько ставить напоминания и держать сроки в одном месте.",
        h1: "Как не пропустить срок паспорта, визы или страховки",
        intro:
          "Практичный способ следить за сроками документов семьи — какие держать под контролем, за сколько ставить напоминания и как хранить каждую дату в одном месте, а не в голове.",
        ctaPrimary: "Добавьте документы и настройте напоминания",
        sections: [
          {
            h2: "Почему сроки документов легко забыть",
            body: "Сроки не напоминают о себе сами. Паспорт действует годами, страховка тихо продлевается, виза лежит в ящике до того дня, когда вдруг понадобится. Нет естественного момента, который подсказал бы, что срок близко, — и он всплывает в самый неподходящий момент, часто прямо перед поездкой. Решение — не заучивать даты, а хранить каждую дату вместе с документом и получать напоминание заранее.",
          },
          {
            h2: "Какие документы чаще требуют контроля",
            body: "Истекает не всё, но несколько документов почти всегда — и именно их стоит отслеживать в первую очередь.",
            bullets: [
              "Загранпаспорта, особенно у детей — их документы истекают быстрее",
              "Визы и ВНЖ",
              "Страховки — медицинская, туристическая, авто, жильё",
              "Водительские права",
              "Сертификаты и другие документы с датой продления",
            ],
          },
          {
            h2: "За сколько ставить напоминание",
            body: "Единого правильного ответа нет — нужный запас зависит от документа и страны. Продление паспорта или визы может занять недели или месяцы, а что-то продлевается за день. Общий ориентир — оставить время собрать бумаги, записаться на приём и дождаться оформления. По всему, что связано с поездками или миграцией, проверяйте официальные требования нужной страны: правила и сроки действия различаются.",
          },
          {
            h2: "Как вести сроки для всей семьи",
            body: "Сроки одного человека ещё можно держать в голове, сроки семьи — уже нет. Заведите профиль на каждого — супруга, детей, родителей — и храните каждый документ с датой «действует до». Так паспорт ребёнка и виза родителя отслеживаются рядом, и ничей срок не теряется из-за того, что он жил только в чьей-то памяти.",
          },
          {
            h2: "Что проверить перед поездкой",
            body: "Перед поездкой быстро пройдитесь по документам, на которые будете рассчитывать: паспорта и их срок действия, визы или разрешения, туристическая или медицинская страховка на даты поездки. Многие страны требуют, чтобы паспорт действовал ещё какое-то время после возвращения, поэтому проверяйте официальные требования страны назначения, а не полагайтесь на догадки. Когда все даты в одном месте, это проверка на пару минут, а не спешка.",
          },
          {
            h2: "Как doki.help помогает с напоминаниями",
            body: "Добавляя документ, укажите дату «действует до» — и doki.help может прислать email-напоминание до окончания срока, для каждого члена семьи. Напоминание приходит за 30, 15, 7 и 1 день до этой даты. Документы хранятся в приватном хранилище по HTTPS, доступ изолирован вашей семьёй на уровне базы (RLS), роли определяют, кто owner, editor или viewer, доступен двухфакторный вход. Опциональное AI-распознавание полей по умолчанию выключено. doki.help в стадии beta и не заменяет оригиналы документов.",
          },
        ],
        faqHeading: "Частые вопросы",
        faq: [
          {
            q: "За сколько заранее ставить напоминание о сроке?",
            a: "Столько, чтобы успеть продлить без спешки — а это зависит от документа и страны. Паспорта и визы могут оформляться недели или месяцы, поэтому берите широкий запас и проверяйте официальные требования по всему, что связано с поездками и миграцией.",
          },
          {
            q: "Какие документы отслеживать в первую очередь?",
            a: "Те, что истекают и долго продлеваются: загранпаспорта, визы и ВНЖ, страховки, водительские права. Сертификаты и остальное с датой продления добавляйте постепенно.",
          },
          {
            q: "Как придёт напоминание до окончания срока?",
            a: "На email, до указанной вами даты «действует до» на каждом документе. Напоминание приходит за 30, 15, 7 и 1 день до этой даты.",
          },
          {
            q: "Можно отслеживать сроки для всех членов семьи?",
            a: "Да. Заведите профиль на каждого члена семьи и храните каждый документ с датой окончания, чтобы паспорт ребёнка и виза родителя отслеживались рядом, в одном месте.",
          },
          {
            q: "Что проверить перед поездкой?",
            a: "Срок действия паспортов, визы или разрешения, туристическую или медицинскую страховку на даты поездки. Многие страны требуют запас срока паспорта после возвращения, поэтому проверьте официальные требования страны назначения.",
          },
        ],
      },
      id: {
        navLabel: "Pantau masa berlaku",
        title: "Cara Memantau Masa Berlaku Dokumen Keluarga",
        metaDescription:
          "Cara tenang agar tidak melewatkan tenggat paspor, visa, atau asuransi: dokumen mana yang dipantau, kapan memasang pengingat, dan menyimpan tanggal di satu tempat.",
        h1: "Cara agar tidak melewatkan tenggat paspor, visa, atau asuransi",
        intro:
          "Cara praktis memantau kapan dokumen keluarga kedaluwarsa — mana yang perlu diawasi, seberapa awal memasang pengingat, dan menyimpan tiap tenggat di satu tempat, bukan di kepala.",
        ctaPrimary: "Tambahkan dokumen dan atur pengingat",
        sections: [
          {
            h2: "Mengapa masa berlaku mudah terlupa",
            body: "Masa berlaku jarang mengingatkan dirinya sendiri. Paspor berlaku bertahun-tahun, polis asuransi diperpanjang diam-diam, visa tersimpan di laci sampai hari Anda membutuhkannya. Tidak ada momen alami yang mengingatkan bahwa tenggat sudah dekat — jadi ia muncul di saat paling tidak tepat, sering tepat sebelum perjalanan. Solusinya bukan menghafal tanggal, melainkan menyimpan tiap tanggal bersama dokumennya dan membiarkan pengingat menghampiri Anda lebih awal.",
          },
          {
            h2: "Dokumen mana yang biasanya perlu dipantau",
            body: "Tidak semua kedaluwarsa, tetapi beberapa dokumen hampir selalu — dan inilah yang layak dipantau lebih dulu.",
            bullets: [
              "Paspor, terutama anak yang dokumennya lebih cepat habis",
              "Visa dan izin tinggal",
              "Polis asuransi — kesehatan, perjalanan, mobil, rumah",
              "SIM",
              "Sertifikat dan dokumen lain dengan tanggal perpanjangan",
            ],
          },
          {
            h2: "Seberapa awal memasang pengingat",
            body: "Tidak ada satu jawaban yang benar — jarak waktu yang Anda perlukan bergantung pada dokumen dan negara. Memperpanjang paspor atau visa bisa memakan waktu berminggu-minggu atau berbulan-bulan, sementara sebagian dokumen selesai dalam sehari. Sebagai patokan, beri diri Anda cukup waktu untuk menyiapkan berkas, membuat janji, dan menunggu proses. Untuk apa pun yang terkait perjalanan atau imigrasi, periksa persyaratan resmi negara terkait, karena aturan dan masa berlakunya berbeda.",
          },
          {
            h2: "Menjaga tanggal untuk seluruh keluarga",
            body: "Tanggal satu orang masih bisa diingat; tanggal satu keluarga tidak. Beri tiap anggota profilnya sendiri — pasangan, anak, orang tua — dan simpan tiap dokumen dengan tanggal \"berlaku sampai\". Dengan begitu paspor anak dan visa orang tua terpantau berdampingan, dan tidak ada tenggat yang lolos hanya karena ia tersimpan di ingatan satu orang saja.",
          },
          {
            h2: "Yang perlu diperiksa sebelum bepergian",
            body: "Sebelum berangkat, tinjau cepat dokumen yang akan Anda andalkan: paspor dan masa berlakunya, visa atau izin, serta asuransi perjalanan atau kesehatan untuk tanggal Anda bepergian. Banyak negara meminta paspor berlaku beberapa waktu setelah tanggal pulang, jadi pastikan persyaratan resmi negara tujuan, bukan sekadar menebak. Dengan semua tanggal di satu tempat, ini jadi pemeriksaan dua menit, bukan kepanikan.",
          },
          {
            h2: "Bagaimana doki.help membantu dengan pengingat",
            body: "Saat menambahkan tiap dokumen, isi tanggal \"berlaku sampai\", dan doki.help bisa mengirim pengingat email sebelum kedaluwarsa — untuk tiap anggota keluarga. Pengingat datang 30, 15, 7, dan 1 hari sebelum tanggal itu. Dokumen tersimpan di penyimpanan privat lewat HTTPS, akses diisolasi untuk keluarga Anda di tingkat basis data (row-level security), peran menentukan siapa owner, editor, atau viewer, dan login dua faktor tersedia. Pengenalan bidang AI opsional mati secara default. doki.help masih beta dan tidak menggantikan dokumen asli Anda.",
          },
        ],
        faqHeading: "Pertanyaan umum",
        faq: [
          {
            q: "Seberapa awal sebaiknya memasang pengingat masa berlaku?",
            a: "Cukup waktu untuk memperpanjang tanpa terburu-buru — dan itu berbeda tiap dokumen dan negara. Paspor dan visa bisa memakan waktu berminggu-minggu atau berbulan-bulan, jadi beri margin lebar dan periksa persyaratan resmi untuk hal terkait perjalanan atau imigrasi.",
          },
          {
            q: "Dokumen mana yang harus dipantau lebih dulu?",
            a: "Yang kedaluwarsa dan lama diperpanjang: paspor, visa dan izin tinggal, polis asuransi, serta SIM. Tambahkan sertifikat dan lainnya yang punya tanggal perpanjangan seiring waktu.",
          },
          {
            q: "Bagaimana pengingat sebelum dokumen kedaluwarsa datang?",
            a: "Lewat email, sebelum tanggal \"berlaku sampai\" yang Anda tetapkan pada tiap dokumen. Pengingat datang 30, 15, 7, dan 1 hari sebelum tanggal itu.",
          },
          {
            q: "Bisakah memantau masa berlaku untuk semua anggota keluarga?",
            a: "Bisa. Beri tiap anggota keluarga profilnya sendiri dan simpan tiap dokumen dengan tanggal kedaluwarsanya, agar paspor anak dan visa orang tua terpantau berdampingan di satu tempat.",
          },
          {
            q: "Apa yang perlu diperiksa sebelum bepergian?",
            a: "Masa berlaku paspor, visa atau izin, serta asuransi perjalanan atau kesehatan untuk tanggal Anda bepergian. Banyak negara mensyaratkan sisa masa berlaku paspor setelah pulang, jadi pastikan persyaratan resmi negara tujuan.",
          },
        ],
      },
      uz: {
        navLabel: "Muddatlarni kuzatish",
        title: "Oila hujjatlari muddatini qanday kuzatish",
        metaDescription:
          "Pasport, viza yoki sugʻurta muddatini oʻtkazib yubormaslikning sokin yoʻli: qaysi hujjatlarni kuzatish, qachon eslatma qoʻyish va sanalarni bir joyda saqlash.",
        h1: "Pasport, viza yoki sugʻurta muddatini qanday oʻtkazib yubormaslik",
        intro:
          "Oila hujjatlari qachon tugashini kuzatishning amaliy yoʻli — qaysilarini nazorat qilish, eslatmani qancha oldin qoʻyish va har bir sanani xotirada emas, bitta joyda saqlash.",
        ctaPrimary: "Hujjatlarni qoʻshing va eslatmalarni sozlang",
        sections: [
          {
            h2: "Nega hujjat muddatlari oson unutiladi",
            body: "Muddatlar oʻzi haqida eslatmaydi. Pasport yillar davomida amal qiladi, sugʻurta jimgina yangilanadi, viza kerak boʻlgan kungacha tortmada yotadi. Muddat yaqinlashganini aytadigan tabiiy lahza yoʻq — shu bois u eng nomaqbul paytda, koʻpincha safardan oldin paydo boʻladi. Yechim — sanalarni yodlash emas, har bir sanani hujjat bilan birga saqlash va eslatma sizni oldindan topishiga yoʻl qoʻyish.",
          },
          {
            h2: "Qaysi hujjatlar koʻproq nazorat talab qiladi",
            body: "Hammasi tugamaydi, lekin bir nechta hujjat deyarli doim tugaydi — va aynan ularni birinchi navbatda kuzatish kerak.",
            bullets: [
              "Chet el pasportlari, ayniqsa hujjatlari tezroq tugaydigan bolalarniki",
              "Vizalar va yashash ruxsatnomalari",
              "Sugʻurtalar — tibbiy, turistik, avto, uy",
              "Haydovchilik guvohnomalari",
              "Sertifikatlar va yangilash sanasi bor boshqa hujjatlar",
            ],
          },
          {
            h2: "Eslatmani qancha oldin qoʻyish kerak",
            body: "Yagona toʻgʻri javob yoʻq — kerakli zaxira hujjat va davlatga bogʻliq. Pasport yoki vizani yangilash haftalar yoki oylar olishi mumkin, baʼzi hujjatlar esa bir kunda yangilanadi. Umumiy moʻljal — qogʻozlarni yigʻish, qabulga yozilish va rasmiylashtirishni kutish uchun yetarli vaqt qoldiring. Safar yoki migratsiyaga bogʻliq har narsa boʻyicha tegishli davlatning rasmiy talablarini tekshiring: qoidalar va amal qilish muddatlari farq qiladi.",
          },
          {
            h2: "Muddatlarni butun oila uchun yuritish",
            body: "Bir kishining sanalarini xotirada tutsa boʻladi, oilaniki esa — yoʻq. Har bir aʼzoga oʻz profilini bering — turmush oʻrtogʻingiz, bolalar, ota-onangiz — va har bir hujjatni \"amal qiladi\" sanasi bilan saqlang. Shunda bolaning pasporti va ota-onaning vizasi yonma-yon kuzatiladi, hech kimning muddati faqat birovning xotirasida yashagani uchun oʻtib ketmaydi.",
          },
          {
            h2: "Safardan oldin nimani tekshirish kerak",
            body: "Safardan oldin ishonadigan hujjatlaringizni tez koʻrib chiqing: pasportlar va ularning amal muddati, viza yoki ruxsatnoma, safar sanalaringizga turistik yoki tibbiy sugʻurta. Koʻp davlatlar pasport qaytishdan keyin ham biror muddat amal qilishini talab qiladi, shuning uchun taxmin qilmay, borar davlatning rasmiy talablarini tekshiring. Barcha sanalar bitta joyda boʻlsa, bu shoshilinch emas, ikki daqiqalik tekshiruvga aylanadi.",
          },
          {
            h2: "doki.help eslatmalarda qanday yordam beradi",
            body: "Har bir hujjatni qoʻshayotib \"amal qiladi\" sanasini kiriting — va doki.help muddat tugashidan oldin email eslatma yuborishi mumkin, har bir oila aʼzosi uchun. Eslatma shu sanadan 30, 15, 7 va 1 kun oldin keladi. Hujjatlar maxfiy omborda HTTPS orqali saqlanadi, kirish maʼlumotlar bazasi darajasida oilangiz bilan izolyatsiya qilingan (RLS), rollar kim owner, editor yoki viewer ekanini belgilaydi, ikki bosqichli kirish mavjud. Ixtiyoriy AI maydon tanish sukut boʻyicha oʻchiq. doki.help beta bosqichida va asl hujjatlaringiz oʻrnini bosmaydi.",
          },
        ],
        faqHeading: "Tez-tez beriladigan savollar",
        faq: [
          {
            q: "Muddat eslatmasini qancha oldin qoʻyish kerak?",
            a: "Shoshilmasdan yangilashga yetadigancha — bu hujjat va davlatga qarab farq qiladi. Pasport va vizalar haftalar yoki oylar olishi mumkin, shuning uchun keng zaxira oling va safar hamda migratsiyaga bogʻliq har narsa boʻyicha rasmiy talablarni tekshiring.",
          },
          {
            q: "Qaysi hujjatlarni birinchi navbatda kuzatish kerak?",
            a: "Tugaydigan va yangilash uzoq davom etadiganlarini: chet el pasportlari, vizalar va yashash ruxsatnomalari, sugʻurtalar, haydovchilik guvohnomalari. Sertifikatlar va yangilash sanasi bor boshqalarini asta qoʻshib boring.",
          },
          {
            q: "Muddat tugashidan oldin eslatma qanday keladi?",
            a: "Email orqali, har bir hujjatda siz belgilagan \"amal qiladi\" sanasidan oldin. Eslatma shu sanadan 30, 15, 7 va 1 kun oldin keladi.",
          },
          {
            q: "Muddatlarni oilaning barcha aʼzolari uchun kuzatsa boʻladimi?",
            a: "Ha. Har bir oila aʼzosiga oʻz profilini bering va har bir hujjatni tugash sanasi bilan saqlang, shunda bolaning pasporti va ota-onaning vizasi bitta joyda yonma-yon kuzatiladi.",
          },
          {
            q: "Safardan oldin nimani tekshirish kerak?",
            a: "Pasportlar amal muddatini, viza yoki ruxsatnomani, safar sanalaringizga turistik yoki tibbiy sugʻurtani. Koʻp davlatlar pasport qaytgandan keyin ham amal qilishini talab qiladi, shuning uchun borar davlatning rasmiy talablarini tekshiring.",
          },
        ],
      },
    },
    related: {
      en: [
        { href: "/passport-expiry-reminder", label: "Passport expiry reminders" },
        { href: "/document-expiry-reminder", label: "Document expiry reminders" },
      ],
      ru: [
        { href: "/passport-expiry-reminder", label: "Напоминания о сроке паспорта" },
        { href: "/document-expiry-reminder", label: "Напоминания о сроках документов" },
      ],
      id: [
        { href: "/passport-expiry-reminder", label: "Pengingat masa berlaku paspor" },
        { href: "/document-expiry-reminder", label: "Pengingat masa berlaku dokumen" },
      ],
      uz: [
        { href: "/passport-expiry-reminder", label: "Pasport muddati eslatmalari" },
        { href: "/document-expiry-reminder", label: "Hujjat muddati eslatmalari" },
      ],
    },
  },
  "documents-for-a-family-trip-abroad": {
    slug: "documents-for-a-family-trip-abroad",
    emoji: "✈️",
    locales: {
      en: {
        navLabel: "Documents for a trip abroad",
        title: "Documents a Family Needs Before Travelling Abroad",
        metaDescription:
          "A calm checklist of documents a family needs before a trip abroad: passports & expiry dates, children's papers, visas, insurance, copies and one trip folder.",
        h1: "What documents a family needs before travelling abroad",
        intro:
          "Before a trip abroad, the paperwork tends to scatter — one passport in a drawer, an insurance PDF in email, a booking in a chat. Here is a calm way to gather what your family needs into one trip folder, check the deadlines that matter, and keep copies within reach.",
        ctaPrimary: "Create your trip folder",
        sections: [
          {
            h2: "The basic document list",
            body: "Start with the documents almost every trip needs, then adjust for your route. Requirements differ by destination and airline, so always check the official requirements for the country you're travelling to.",
            bullets: [
              "Passports for every family member (and ID cards if relevant)",
              "Visas or entry permits, where required",
              "Tickets and booking confirmations",
              "Travel or medical insurance",
              "Hotel or accommodation details",
              "Driving licence, if you plan to drive",
            ],
          },
          {
            h2: "Documents for children",
            body: "Children usually need their own passports, and some routes ask for extra papers — a birth certificate, or consent documents when a child travels with one parent or without both. The exact rules depend on the country and the airline, so check the requirements of your destination and carrier in advance, and keep each child's documents together under their own profile.",
          },
          {
            h2: "Passports and expiry dates",
            body: "This is the deadline that catches families out. Many countries require your passport to stay valid for a period beyond your travel dates, and some won't let you board without it — check the requirements of your destination country. As you pack, confirm every passport's \"valid until\" date well before departure, so a renewal never turns into a last-minute rush.",
          },
          {
            h2: "Visas and permits",
            body: "Depending on your nationality and destination, you may need a visa, an electronic travel authorization or another permit — and processing can take time. Rules and timelines vary widely, so check the official requirements of the country you're visiting rather than relying on last year's experience, and keep any approval or confirmation with the rest of the trip.",
          },
          {
            h2: "Insurance",
            body: "Travel or medical insurance is often the document you most hope not to need. Keep the policy and its emergency contacts where the whole family can reach them, and note the coverage dates. Some destinations ask for proof of insurance on entry, so check whether yours does.",
          },
          {
            h2: "Copies and one trip folder",
            body: "Keep a copy of each key document — passports, visas, insurance, bookings — separate from the originals, so a lost or stolen document is an inconvenience, not a crisis. Gather everything the trip needs into a single folder, sorted by family member, so on the day you're checking one place instead of five.",
          },
          {
            h2: "How doki.help helps",
            body: "In doki.help you can build one trip folder that holds the whole family's travel documents, organized by member. Add each passport's \"valid until\" date and doki.help can send an email reminder before it expires, so an expiry doesn't surprise you close to departure. As a PWA it works offline once documents are saved in advance, so you can open them at the airport or a border even without signal. It's in beta and doesn't replace your original documents — check the requirements of your destination country and airline for anything official.",
          },
        ],
        faqHeading: "FAQ",
        faq: [
          {
            q: "What documents does a family need for a trip abroad?",
            a: "Usually passports for everyone, any required visas or permits, tickets and bookings, and travel or medical insurance — plus children's papers. Requirements differ by destination and airline, so check the official requirements for the country you're travelling to.",
          },
          {
            q: "How long should our passports be valid before we travel?",
            a: "Many countries require your passport to stay valid for a period beyond your travel dates, and the exact rule varies — always check the requirements of your destination country. Confirm every passport's expiry date well before departure.",
          },
          {
            q: "What extra documents do children need to travel?",
            a: "Children usually need their own passports, and some routes ask for a birth certificate or consent documents when a child travels with one parent. The rules depend on the country and airline, so check the requirements of your destination and carrier in advance.",
          },
          {
            q: "Can I open our travel documents without internet at the airport?",
            a: "Yes, if you save them in advance. doki.help is a PWA that works offline for documents already stored, so you can reach them even without signal. It's in beta and doesn't replace your originals.",
          },
          {
            q: "Will I be reminded before a passport expires?",
            a: "By email, before the \"valid until\" date you set on each document. The reminder comes 30, 15, 7 and 1 day before that date.",
          },
        ],
      },
      ru: {
        navLabel: "Документы для поездки",
        title: "Документы семье перед поездкой за границу",
        metaDescription:
          "Спокойный список документов семье перед поездкой за границу: паспорта и сроки, документы детей, визы, страховки, копии и одна папка поездки.",
        h1: "Какие документы нужны семье перед поездкой за границу",
        intro:
          "Перед поездкой за границу бумаги обычно разбросаны — паспорт в ящике, PDF страховки в почте, бронь в чате. Вот спокойный способ собрать всё, что нужно семье, в одну папку поездки, проверить важные сроки и держать копии под рукой.",
        ctaPrimary: "Создайте папку поездки",
        sections: [
          {
            h2: "Базовый список документов",
            body: "Начните с документов, которые нужны почти в любой поездке, а дальше подстройте под свой маршрут. Требования зависят от страны назначения и авиакомпании, поэтому всегда проверяйте официальные требования страны, куда вы едете.",
            bullets: [
              "Паспорта на каждого члена семьи (и ID при необходимости)",
              "Визы или разрешения на въезд, где требуются",
              "Билеты и подтверждения бронирований",
              "Туристическая или медицинская страховка",
              "Данные об отеле или проживании",
              "Водительские права, если планируете водить",
            ],
          },
          {
            h2: "Документы для детей",
            body: "Детям обычно нужны свои паспорта, а на некоторых маршрутах просят дополнительные бумаги — свидетельство о рождении или согласие, когда ребёнок едет с одним родителем или без обоих. Точные правила зависят от страны и авиакомпании, поэтому заранее проверьте требования страны назначения и перевозчика, а документы каждого ребёнка держите вместе под его профилем.",
          },
          {
            h2: "Паспорта и сроки действия",
            body: "Именно этот срок чаще всего подводит семьи. Многие страны требуют, чтобы паспорт оставался действительным ещё какое-то время после дат поездки, а некоторые без этого не пустят на борт — проверьте требования страны назначения. Собираясь, заранее сверьте дату «действует до» на каждом паспорте, чтобы продление не превратилось в спешку в последний момент.",
          },
          {
            h2: "Визы и разрешения",
            body: "В зависимости от гражданства и страны вам может понадобиться виза, электронное разрешение на въезд или другой документ — а оформление занимает время. Правила и сроки сильно различаются, поэтому проверяйте официальные требования страны, куда вы едете, а не полагайтесь на прошлогодний опыт, и держите одобрение или подтверждение вместе с остальным по поездке.",
          },
          {
            h2: "Страховки",
            body: "Туристическая или медицинская страховка — это документ, который больше всего надеешься не открывать. Держите полис и его экстренные контакты там, где до них дотянется вся семья, и отметьте даты покрытия. Некоторые страны просят подтверждение страховки на въезде, поэтому проверьте, требует ли этого ваша.",
          },
          {
            h2: "Копии и одна папка поездки",
            body: "Держите копию каждого ключевого документа — паспортов, виз, страховки, броней — отдельно от оригиналов, чтобы потерянный или украденный документ был неудобством, а не бедой. Соберите всё нужное для поездки в одну папку, разложенную по членам семьи, чтобы в день выезда проверять одно место, а не пять.",
          },
          {
            h2: "Как помогает doki.help",
            body: "В doki.help можно собрать одну папку поездки со всеми документами семьи, разложенными по членам. Добавьте к каждому паспорту дату «действует до», и doki.help пришлёт email-напоминание до окончания срока, чтобы истечение не застало вас перед самым вылетом. Как PWA сервис работает офлайн, если документы сохранены заранее, — их можно открыть в аэропорту или на границе даже без связи. Сервис в стадии beta и не заменяет оригиналы документов — по всему официальному проверяйте требования страны назначения и авиакомпании.",
          },
        ],
        faqHeading: "Частые вопросы",
        faq: [
          {
            q: "Какие документы нужны семье для поездки за границу?",
            a: "Обычно паспорта на всех, нужные визы или разрешения, билеты и брони, туристическая или медицинская страховка — плюс документы детей. Требования зависят от страны назначения и авиакомпании, поэтому проверяйте официальные требования страны, куда вы едете.",
          },
          {
            q: "Сколько должны быть действительны паспорта перед поездкой?",
            a: "Многие страны требуют, чтобы паспорт оставался действительным ещё какое-то время после дат поездки, и точное правило разнится — всегда проверяйте требования страны назначения. Сверьте дату окончания каждого паспорта заранее.",
          },
          {
            q: "Какие дополнительные документы нужны детям для поездки?",
            a: "Детям обычно нужны свои паспорта, а на некоторых маршрутах просят свидетельство о рождении или согласие, когда ребёнок едет с одним родителем. Правила зависят от страны и авиакомпании, поэтому заранее проверьте требования страны назначения и перевозчика.",
          },
          {
            q: "Можно открыть документы без интернета в аэропорту?",
            a: "Да, если сохранить их заранее. doki.help — это PWA, который работает офлайн для уже сохранённых документов, так что до них можно добраться даже без связи. Сервис в стадии beta и не заменяет оригиналы.",
          },
          {
            q: "Придёт ли напоминание до окончания срока паспорта?",
            a: "На email, до указанной вами даты «действует до» на каждом документе. Напоминание приходит за 30, 15, 7 и 1 день до этой даты.",
          },
        ],
      },
      id: {
        navLabel: "Dokumen untuk perjalanan",
        title: "Dokumen Keluarga Sebelum Bepergian ke Luar Negeri",
        metaDescription:
          "Daftar tenang dokumen keluarga sebelum ke luar negeri: paspor & masa berlaku, dokumen anak, visa, asuransi, salinan, dan satu folder perjalanan.",
        h1: "Dokumen apa yang dibutuhkan keluarga sebelum bepergian ke luar negeri",
        intro:
          "Sebelum perjalanan ke luar negeri, berkas cenderung tercecer — satu paspor di laci, PDF asuransi di email, pemesanan di chat. Ini cara tenang mengumpulkan yang dibutuhkan keluarga ke dalam satu folder perjalanan, memeriksa tenggat penting, dan menyimpan salinan tetap terjangkau.",
        ctaPrimary: "Buat folder perjalanan",
        sections: [
          {
            h2: "Daftar dokumen dasar",
            body: "Mulai dari dokumen yang dibutuhkan hampir setiap perjalanan, lalu sesuaikan dengan rute Anda. Persyaratan berbeda tiap tujuan dan maskapai, jadi selalu periksa persyaratan resmi negara tujuan Anda.",
            bullets: [
              "Paspor untuk tiap anggota keluarga (dan KTP bila relevan)",
              "Visa atau izin masuk, bila diperlukan",
              "Tiket dan konfirmasi pemesanan",
              "Asuransi perjalanan atau medis",
              "Detail hotel atau akomodasi",
              "SIM, jika berencana menyetir",
            ],
          },
          {
            h2: "Dokumen untuk anak",
            body: "Anak biasanya perlu paspor sendiri, dan beberapa rute meminta berkas tambahan — akta kelahiran, atau dokumen persetujuan saat anak bepergian dengan satu orang tua atau tanpa keduanya. Aturan pastinya tergantung negara dan maskapai, jadi periksa persyaratan negara tujuan dan pengangkut Anda lebih awal, dan simpan dokumen tiap anak bersama di bawah profilnya.",
          },
          {
            h2: "Paspor dan masa berlaku",
            body: "Inilah tenggat yang paling sering menjebak keluarga. Banyak negara mensyaratkan paspor tetap berlaku beberapa waktu setelah tanggal perjalanan, dan sebagian tak mengizinkan Anda naik tanpa itu — periksa persyaratan negara tujuan. Saat berkemas, pastikan tanggal \"berlaku sampai\" tiap paspor jauh sebelum keberangkatan, agar perpanjangan tak jadi kejaran menit terakhir.",
          },
          {
            h2: "Visa dan izin",
            body: "Tergantung kewarganegaraan dan tujuan, Anda mungkin perlu visa, otorisasi perjalanan elektronik, atau izin lain — dan prosesnya bisa memakan waktu. Aturan dan jangka waktunya sangat beragam, jadi periksa persyaratan resmi negara yang Anda kunjungi alih-alih mengandalkan pengalaman tahun lalu, dan simpan persetujuan atau konfirmasi bersama sisa perjalanan.",
          },
          {
            h2: "Asuransi",
            body: "Asuransi perjalanan atau medis sering jadi dokumen yang paling Anda harap tak perlu dibuka. Simpan polis dan kontak daruratnya di tempat yang terjangkau seluruh keluarga, dan catat tanggal cakupannya. Beberapa tujuan meminta bukti asuransi saat masuk, jadi periksa apakah milik Anda diperlukan.",
          },
          {
            h2: "Salinan dan satu folder perjalanan",
            body: "Simpan salinan tiap dokumen penting — paspor, visa, asuransi, pemesanan — terpisah dari yang asli, agar dokumen yang hilang atau dicuri jadi kerepotan, bukan krisis. Kumpulkan semua yang dibutuhkan perjalanan ke dalam satu folder, dipilah per anggota keluarga, agar di hari-H Anda memeriksa satu tempat, bukan lima.",
          },
          {
            h2: "Bagaimana doki.help membantu",
            body: "Di doki.help Anda bisa membangun satu folder perjalanan yang memuat dokumen perjalanan seluruh keluarga, ditata per anggota. Tambahkan tanggal \"berlaku sampai\" tiap paspor dan doki.help bisa mengirim pengingat email sebelum kedaluwarsa, agar masa berlaku tak mengejutkan menjelang keberangkatan. Sebagai PWA, ia bekerja offline setelah dokumen disimpan lebih dulu, jadi bisa dibuka di bandara atau perbatasan meski tanpa sinyal. Masih beta dan tidak menggantikan dokumen asli — untuk hal resmi, periksa persyaratan negara tujuan dan maskapai Anda.",
          },
        ],
        faqHeading: "Pertanyaan umum",
        faq: [
          {
            q: "Dokumen apa yang dibutuhkan keluarga untuk perjalanan ke luar negeri?",
            a: "Biasanya paspor untuk semua, visa atau izin yang diperlukan, tiket dan pemesanan, serta asuransi perjalanan atau medis — plus berkas anak. Persyaratan berbeda tiap tujuan dan maskapai, jadi periksa persyaratan resmi negara tujuan Anda.",
          },
          {
            q: "Berapa lama paspor kami harus berlaku sebelum bepergian?",
            a: "Banyak negara mensyaratkan paspor tetap berlaku beberapa waktu setelah tanggal perjalanan, dan aturan pastinya bervariasi — selalu periksa persyaratan negara tujuan. Pastikan tanggal kedaluwarsa tiap paspor jauh sebelum keberangkatan.",
          },
          {
            q: "Dokumen tambahan apa yang dibutuhkan anak untuk bepergian?",
            a: "Anak biasanya perlu paspor sendiri, dan beberapa rute meminta akta kelahiran atau dokumen persetujuan saat anak bepergian dengan satu orang tua. Aturannya tergantung negara dan maskapai, jadi periksa persyaratan negara tujuan dan pengangkut lebih awal.",
          },
          {
            q: "Bisakah membuka dokumen perjalanan tanpa internet di bandara?",
            a: "Bisa, jika disimpan lebih dulu. doki.help adalah PWA yang bekerja offline untuk dokumen yang sudah tersimpan, jadi bisa dijangkau meski tanpa sinyal. Masih beta dan tidak menggantikan dokumen asli.",
          },
          {
            q: "Akankah saya diingatkan sebelum paspor kedaluwarsa?",
            a: "Lewat email, sebelum tanggal \"berlaku sampai\" yang Anda tetapkan pada tiap dokumen. Pengingat datang 30, 15, 7, dan 1 hari sebelum tanggal itu.",
          },
        ],
      },
      uz: {
        navLabel: "Sayohat hujjatlari",
        title: "Chet elga sayohat oldidan oila hujjatlari",
        metaDescription:
          "Chet elga sayohat oldidan oila hujjatlarining sokin roʻyxati: pasport va muddatlar, bolalar hujjatlari, vizalar, sugʻurta, nusxalar va bitta sayohat papkasi.",
        h1: "Chet elga sayohat oldidan oilaga qanday hujjatlar kerak",
        intro:
          "Chet elga sayohat oldidan qogʻozlar odatda sochilib ketadi — pasport tortmada, sugʻurta PDFi pochtada, bron chatda. Bu — oilaga kerak boʻlgan hamma narsani bitta sayohat papkasiga yigʻish, muhim muddatlarni tekshirish va nusxalarni qoʻl ostida saqlashning sokin yoʻli.",
        ctaPrimary: "Sayohat papkasini yarating",
        sections: [
          {
            h2: "Asosiy hujjatlar roʻyxati",
            body: "Deyarli har qanday sayohatga kerak boʻladigan hujjatlardan boshlang, keyin marshrutingizga moslang. Talablar borar joy va aviakompaniyaga qarab farq qiladi, shuning uchun har doim borayotgan davlatingizning rasmiy talablarini tekshiring.",
            bullets: [
              "Har bir oila aʼzosiga pasport (kerak boʻlsa ID ham)",
              "Talab qilinsa, vizalar yoki kirish ruxsatlari",
              "Chiptalar va bron tasdiqlari",
              "Sayohat yoki tibbiy sugʻurta",
              "Mehmonxona yoki yashash joyi maʼlumotlari",
              "Haydashni rejalashtirsangiz, haydovchilik guvohnomasi",
            ],
          },
          {
            h2: "Bolalar uchun hujjatlar",
            body: "Bolalarga odatda oʻz pasporti kerak, baʼzi marshrutlarda esa qoʻshimcha qogʻozlar soʻraladi — tugʻilganlik guvohnomasi yoki bola bitta ota-ona bilan yoki ikkovisiz sayohat qilganda rozilik hujjatlari. Aniq qoidalar davlat va aviakompaniyaga bogʻliq, shuning uchun borar joy va tashuvchining talablarini oldindan tekshiring, har bir bolaning hujjatlarini uning profili ostida birga saqlang.",
          },
          {
            h2: "Pasportlar va amal qilish muddati",
            body: "Aynan shu muddat oilalarni koʻpincha dovdiratadi. Koʻp davlatlar pasport sayohat sanalaridan keyin ham maʼlum muddat amal qilishini talab qiladi, baʼzilari busiz samolyotga qoʻymaydi — borar joyingiz talablarini tekshiring. Yigʻilayotib har bir pasportning \"amal qiladi\" sanasini joʻnashdan ancha oldin tekshiring, shunda yangilash oxirgi daqiqadagi shoshqaloqlikka aylanmaydi.",
          },
          {
            h2: "Vizalar va ruxsatlar",
            body: "Fuqaroligingiz va borar joyingizga qarab sizga viza, elektron sayohat ruxsati yoki boshqa hujjat kerak boʻlishi mumkin — rasmiylashtirish esa vaqt oladi. Qoidalar va muddatlar juda xilma-xil, shuning uchun oʻtgan yilgi tajribaga tayanmay borayotgan davlatingizning rasmiy talablarini tekshiring, har qanday tasdiq yoki ruxsatni sayohatning qolgan hujjatlari bilan birga saqlang.",
          },
          {
            h2: "Sugʻurtalar",
            body: "Sayohat yoki tibbiy sugʻurta — koʻpincha ochishga toʻgʻri kelmasin deb umid qiladigan hujjat. Polis va uning favqulodda aloqalarini butun oila yeta oladigan joyda saqlang, qamrov sanalarini belgilab qoʻying. Baʼzi davlatlar kirishda sugʻurta dalilini soʻraydi, shuning uchun sizniki talab qilinadimi, tekshiring.",
          },
          {
            h2: "Nusxalar va bitta sayohat papkasi",
            body: "Har bir muhim hujjatning — pasportlar, vizalar, sugʻurta, bronlar — nusxasini asl nusxadan alohida saqlang, shunda yoʻqolgan yoki oʻgʻirlangan hujjat falokat emas, noqulaylik boʻlib qoladi. Sayohatga kerak boʻlgan hamma narsani oila aʼzolari boʻyicha ajratilgan bitta papkaga yigʻing, shunda joʻnash kuni besh joyni emas, bitta joyni tekshirasiz.",
          },
          {
            h2: "doki.help qanday yordam beradi",
            body: "doki.help da butun oilaning sayohat hujjatlarini aʼzolar boʻyicha tartiblab, bitta sayohat papkasiga yigʻishingiz mumkin. Har bir pasportga \"amal qiladi\" sanasini qoʻshing, doki.help esa muddat tugashidan oldin email eslatma yuborishi mumkin, shunda muddat joʻnash arafasida kutilmaganda tugab qolmaydi. PWA sifatida u hujjatlar oldindan saqlangan boʻlsa oflayn ishlaydi, shuning uchun ularni aeroportda yoki chegarada aloqa boʻlmasa ham ochish mumkin. U beta bosqichida va asl hujjatlar oʻrnini bosmaydi — har qanday rasmiy narsa boʻyicha borar joy va aviakompaniya talablarini tekshiring.",
          },
        ],
        faqHeading: "Tez-tez beriladigan savollar",
        faq: [
          {
            q: "Chet elga sayohat uchun oilaga qanday hujjatlar kerak?",
            a: "Odatda hammaga pasport, kerakli vizalar yoki ruxsatlar, chiptalar va bronlar, sayohat yoki tibbiy sugʻurta — hamda bolalar hujjatlari. Talablar borar joy va aviakompaniyaga qarab farq qiladi, shuning uchun borayotgan davlatingizning rasmiy talablarini tekshiring.",
          },
          {
            q: "Sayohat oldidan pasportlar qancha muddat amal qilishi kerak?",
            a: "Koʻp davlatlar pasport sayohat sanalaridan keyin ham maʼlum muddat amal qilishini talab qiladi, aniq qoida esa har xil — har doim borar joyingiz talablarini tekshiring. Har bir pasportning tugash sanasini joʻnashdan oldin tekshiring.",
          },
          {
            q: "Bolalarga sayohat uchun qanday qoʻshimcha hujjatlar kerak?",
            a: "Bolalarga odatda oʻz pasporti kerak, baʼzi marshrutlarda esa tugʻilganlik guvohnomasi yoki bola bitta ota-ona bilan sayohat qilganda rozilik hujjatlari soʻraladi. Qoidalar davlat va aviakompaniyaga bogʻliq, shuning uchun borar joy va tashuvchi talablarini oldindan tekshiring.",
          },
          {
            q: "Sayohat hujjatlarini aeroportda internetsiz ochsa boʻladimi?",
            a: "Ha, oldindan saqlab qoʻysangiz. doki.help — allaqachon saqlangan hujjatlar uchun oflayn ishlaydigan PWA, shuning uchun ularga aloqa boʻlmasa ham yetish mumkin. U beta bosqichida va asl hujjatlar oʻrnini bosmaydi.",
          },
          {
            q: "Pasport muddati tugashidan oldin eslatma keladimi?",
            a: "Email orqali, har bir hujjatda siz belgilagan \"amal qiladi\" sanasidan oldin. Eslatma shu sanadan 30, 15, 7 va 1 kun oldin keladi.",
          },
        ],
      },
    },
    related: {
      en: [
        { href: "/travel-documents", label: "Travel documents" },
        { href: "/checklists/travel-documents-checklist", label: "Travel documents checklist" },
      ],
      ru: [
        { href: "/travel-documents", label: "Документы для поездки" },
        { href: "/checklists/travel-documents-checklist", label: "Чек-лист документов для поездки" },
      ],
      id: [
        { href: "/travel-documents", label: "Dokumen perjalanan" },
        { href: "/checklists/travel-documents-checklist", label: "Ceklis dokumen perjalanan" },
      ],
      uz: [
        { href: "/travel-documents", label: "Sayohat hujjatlari" },
        { href: "/checklists/travel-documents-checklist", label: "Sayohat hujjatlari roʻyxati" },
      ],
    },
  },
  "where-to-keep-document-copies-when-travelling": {
    slug: "where-to-keep-document-copies-when-travelling",
    emoji: "📄",
    locales: {
      en: {
        navLabel: "Copies while travelling",
        title: "Where to Keep Document Copies While Travelling",
        metaDescription:
          "Where to keep passport, visa, insurance and booking copies while travelling: one place, sorted by person, available offline and safe to share.",
        h1: "Where to keep document copies while travelling",
        intro:
          "A calm way to carry copies of your family's documents on a trip — kept in one place, sorted by person, ready offline when there's no signal, and easy to share one file without handing over the rest.",
        ctaPrimary: "Gather your copies in one place",
        sections: [
          {
            h2: "Why photos in your gallery aren't a real system",
            body: "Snapping a passport photo before a trip feels like enough, until you need it. In the gallery that photo sits between thousands of others, easy to scroll past, easy to delete by accident, and impossible to search by document type. If the phone is lost or the storage fills up, the copy goes with it. A gallery stores pictures; it doesn't give you a place you can actually rely on when you're standing at a counter.",
          },
          {
            h2: "Why messengers are awkward for documents",
            body: "Sending yourself the visa in a chat works for a minute, then it's buried under new messages. Chats keep encrypted conversations, but they were built for talking, not for structure: you can't sort by person, you can't see what expires when, and the file quietly disappears down the scroll. When you actually need it at the gate, searching a chat history is the last thing you want to be doing. The problem isn't safety — it's that documents get lost and can't be found in time.",
          },
          {
            h2: "Which copies are worth having on hand",
            body: "You don't need everything — just the documents a trip tends to ask for, for each person travelling.",
            bullets: [
              "Passport and visa (plus residence permit if you have one)",
              "Travel and medical insurance",
              "Tickets and booking confirmations",
              "Consent letters for children travelling with one parent or another adult",
            ],
          },
          {
            h2: "How to organise copies by person and category",
            body: "Give each traveller their own profile — you, your partner, each child — and keep their documents together. Then a document is two taps away: the person, then the category. When a border officer asks for one child's passport and consent letter, you're not scrolling a shared gallery hoping to recognise the right photo. In doki.help you can organise documents by family member from the start.",
          },
          {
            h2: "Offline access when there's no signal",
            body: "Airports, borders and foreign SIM gaps are exactly where connection fails. doki.help works as an installable app (PWA), so documents you have opened and saved in advance stay available offline. The key word is in advance: open what you'll need before you leave, while you still have wifi, so it's already there when the signal isn't. Keep your phone charged, and treat this as a copy — not a replacement for the originals you carry.",
          },
          {
            h2: "How to share the right file safely",
            body: "Sometimes a hotel, an agent or a relative needs one document. Instead of sending a copy that lives forever in a chat, share a link that expires and can be revoked at any time, with a view limit and a log of every open. The recipient needs no account, and the rest of your vault stays private — you're handing over one file, not the whole folder.",
          },
          {
            h2: "How doki.help helps",
            body: "doki.help keeps your family's documents in private storage, transferred over HTTPS, with access isolated to your family at the database level (row-level security) — only your family sees them. Roles let you decide who is owner, editor or viewer, two-factor login is available, and optional AI field recognition is off by default. It's in beta and doesn't replace the original documents you travel with.",
          },
        ],
        faqHeading: "FAQ",
        faq: [
          {
            q: "What's the safest place to keep document copies while travelling?",
            a: "One place you can actually rely on: your documents in private storage over HTTPS, isolated to your family at the database level, with two-factor login available — and saved offline in advance for when there's no signal. Keep the originals with you too; copies don't replace them.",
          },
          {
            q: "Can I open my documents without internet abroad?",
            a: "Yes, if you prepare. doki.help works as an installable app (PWA), so documents you open and save before you travel stay available offline. Do it while you still have wifi, because anything you haven't opened in advance won't be there without a connection.",
          },
          {
            q: "Which document copies should I bring on a trip?",
            a: "For each traveller: passport and visa, travel and medical insurance, tickets and booking confirmations, and a consent letter for any child travelling with one parent or another adult. Requirements differ by country, so always check the official rules for your route.",
          },
          {
            q: "Are photos in my phone gallery enough?",
            a: "They can help in a pinch, but a gallery has no structure — you can't sort by person, see what expires, or find the right file fast, and it's gone if the phone is lost. A vault sorted by person and category is far easier to trust mid-trip.",
          },
          {
            q: "How do I show one document without sharing everything?",
            a: "Share a single file with a link that expires and can be revoked at any time, with a view limit and a log of every open. The recipient needs no account, and the rest of your vault stays private.",
          },
        ],
      },
      ru: {
        navLabel: "Копии в поездке",
        title: "Где хранить копии документов в поездке",
        metaDescription:
          "Где держать копии паспорта, визы, страховки и броней в поездке: одно место, по членам семьи, доступ офлайн и безопасная отправка нужного файла.",
        h1: "Где хранить копии документов в поездке",
        intro:
          "Спокойный способ взять копии документов семьи в поездку — в одном месте, по членам семьи, доступные офлайн без связи, и с возможностью отправить один файл, не открывая остального.",
        ctaPrimary: "Соберите копии в одном месте",
        sections: [
          {
            h2: "Почему фото в галерее — плохая система",
            body: "Сфотографировать паспорт перед поездкой кажется достаточным — пока он не понадобится. В галерее это фото теряется среди тысяч других: легко пролистать, легко случайно удалить, невозможно найти по типу документа. Потеряется телефон или закончится память — копия исчезнет вместе с ними. Галерея хранит картинки, но не даёт места, на которое можно положиться, когда вы стоите у стойки.",
          },
          {
            h2: "Почему мессенджеры неудобны для документов",
            body: "Отправить себе визу в чат помогает на минуту, а дальше её накрывает новыми сообщениями. Чаты хранят переписку в зашифрованном виде, но созданы они для общения, а не для порядка: нельзя разделить по людям, не видно, что и когда истекает, а файл тихо уходит вниз по ленте. Когда документ вдруг нужен у выхода на посадку, искать его в истории чата — последнее, чего хочется. Дело не в безопасности, а в том, что документы теряются и их не находят вовремя.",
          },
          {
            h2: "Какие копии стоит иметь под рукой",
            body: "Не нужно брать всё — только те документы, которые обычно спрашивают в поездке, на каждого едущего.",
            bullets: [
              "Паспорт и виза (и ВНЖ, если есть)",
              "Страховка — туристическая и медицинская",
              "Билеты и подтверждения броней",
              "Согласия на выезд ребёнка с одним родителем или другим взрослым",
            ],
          },
          {
            h2: "Как организовать по людям и категориям",
            body: "Заведите профиль на каждого едущего — на себя, супруга, каждого ребёнка — и держите их документы вместе. Тогда документ в двух касаниях: человек, потом категория. Когда на границе просят паспорт и согласие конкретного ребёнка, вы не листаете общую галерею в надежде узнать нужное фото. В doki.help документы можно организовать по членам семьи с самого начала.",
          },
          {
            h2: "Офлайн-доступ, когда нет связи",
            body: "Аэропорты, границы и перебои с чужой SIM — как раз те места, где связь пропадает. doki.help работает как устанавливаемое приложение (PWA), поэтому документы, которые вы открыли и сохранили заранее, остаются доступны офлайн. Ключевое слово — заранее: откройте нужное до выезда, пока есть wifi, чтобы оно уже было под рукой, когда связи нет. Держите телефон заряженным и относитесь к этому как к копии, а не замене оригиналов, которые вы везёте с собой.",
          },
          {
            h2: "Как безопасно поделиться нужным файлом",
            body: "Иногда отелю, агенту или родственнику нужен один документ. Вместо копии, которая навсегда останется в чате, поделитесь ссылкой, которая истекает и отзывается в любой момент, с лимитом просмотров и журналом открытий. Получателю не нужен аккаунт, а остальной сейф остаётся приватным — вы отдаёте один файл, а не всю папку.",
          },
          {
            h2: "Как помогает doki.help",
            body: "doki.help хранит документы семьи в приватном хранилище, передаёт их по HTTPS, а доступ изолирован вашей семьёй на уровне базы (RLS) — документы видит только ваша семья. Роли позволяют решить, кто owner, editor или viewer, доступен двухфакторный вход, а опциональное AI-распознавание полей по умолчанию выключено. Сервис в стадии beta и не заменяет оригиналы документов, с которыми вы едете.",
          },
        ],
        faqHeading: "Частые вопросы",
        faq: [
          {
            q: "Где безопаснее всего хранить копии документов в поездке?",
            a: "В одном месте, на которое можно положиться: документы в приватном хранилище по HTTPS, изолированные вашей семьёй на уровне базы, с доступным двухфакторным входом — и сохранённые офлайн заранее на случай без связи. Оригиналы всё равно держите при себе, копии их не заменяют.",
          },
          {
            q: "Смогу ли я открыть документы без интернета за границей?",
            a: "Да, если подготовиться. doki.help работает как устанавливаемое приложение (PWA), поэтому документы, открытые и сохранённые до поездки, остаются доступны офлайн. Сделайте это, пока есть wifi: то, что не открыли заранее, без связи не появится.",
          },
          {
            q: "Какие копии документов брать в поездку?",
            a: "На каждого едущего: паспорт и виза, туристическая и медицинская страховка, билеты и подтверждения броней, а также согласие на ребёнка, едущего с одним родителем или другим взрослым. Требования зависят от страны, поэтому проверяйте официальные правила для вашего маршрута.",
          },
          {
            q: "Достаточно ли фото в галерее телефона?",
            a: "В крайнем случае помогут, но в галерее нет структуры — не разделить по людям, не видно сроков, не найти нужный файл быстро, и всё пропадёт с потерей телефона. Сейф по людям и категориям гораздо надёжнее в дороге.",
          },
          {
            q: "Как показать один документ, не открывая доступ ко всему?",
            a: "Поделитесь одним файлом по ссылке, которая истекает и отзывается в любой момент, с лимитом просмотров и журналом открытий. Получателю не нужен аккаунт, а остальной сейф остаётся приватным.",
          },
        ],
      },
      id: {
        navLabel: "Salinan saat bepergian",
        title: "Menyimpan Salinan Dokumen Saat Bepergian",
        metaDescription:
          "Tempat menyimpan salinan paspor, visa, asuransi, dan booking saat bepergian: satu tempat, per anggota, bisa diakses offline dan aman dibagikan.",
        h1: "Di mana menyimpan salinan dokumen saat bepergian",
        intro:
          "Cara tenang membawa salinan dokumen keluarga saat bepergian — di satu tempat, dipilah per anggota, siap offline saat tanpa sinyal, dan mudah membagikan satu berkas tanpa menyerahkan sisanya.",
        ctaPrimary: "Kumpulkan salinan di satu tempat",
        sections: [
          {
            h2: "Mengapa foto di galeri bukan sistem yang andal",
            body: "Memotret paspor sebelum berangkat terasa cukup — sampai Anda membutuhkannya. Di galeri, foto itu terselip di antara ribuan lainnya: mudah terlewat, mudah terhapus tak sengaja, dan tak bisa dicari per jenis dokumen. Jika ponsel hilang atau memori penuh, salinannya ikut hilang. Galeri menyimpan gambar, bukan tempat yang bisa diandalkan saat Anda berdiri di depan loket.",
          },
          {
            h2: "Mengapa aplikasi chat merepotkan untuk dokumen",
            body: "Mengirim visa ke chat sendiri membantu sesaat, lalu tertimbun pesan baru. Chat menyimpan percakapan terenkripsi, tetapi dibuat untuk berbincang, bukan untuk keteraturan: tak bisa dipilah per orang, tak terlihat apa yang kedaluwarsa dan kapan, dan berkasnya diam-diam turun di gulungan. Saat benar-benar dibutuhkan di gerbang, mengorek riwayat chat adalah hal terakhir yang Anda mau. Masalahnya bukan keamanan — dokumen hilang dan tak ditemukan tepat waktu.",
          },
          {
            h2: "Salinan mana yang perlu disiapkan",
            body: "Tak perlu membawa semuanya — cukup dokumen yang biasa diminta dalam perjalanan, untuk tiap orang yang ikut.",
            bullets: [
              "Paspor dan visa (serta izin tinggal bila ada)",
              "Asuransi perjalanan dan medis",
              "Tiket dan konfirmasi pemesanan",
              "Surat izin untuk anak yang bepergian dengan satu orang tua atau orang dewasa lain",
            ],
          },
          {
            h2: "Cara menata salinan per orang dan kategori",
            body: "Beri tiap orang yang ikut profilnya sendiri — Anda, pasangan, tiap anak — dan simpan dokumennya bersama. Maka satu dokumen cukup dua ketukan: orangnya, lalu kategorinya. Saat petugas imigrasi meminta paspor dan surat izin satu anak, Anda tak menggulir galeri bersama sambil menebak foto yang benar. Di doki.help, dokumen bisa ditata per anggota keluarga sejak awal.",
          },
          {
            h2: "Akses offline saat tanpa sinyal",
            body: "Bandara, perbatasan, dan celah SIM asing justru tempat sinyal menghilang. doki.help berjalan sebagai aplikasi yang bisa dipasang (PWA), jadi dokumen yang sudah Anda buka dan simpan sebelumnya tetap tersedia offline. Kata kuncinya sebelumnya: buka yang akan Anda perlukan sebelum berangkat, selagi masih ada wifi, agar sudah siap saat sinyal tak ada. Jaga baterai tetap terisi, dan anggap ini salinan — bukan pengganti dokumen asli yang Anda bawa.",
          },
          {
            h2: "Cara membagikan berkas yang tepat dengan aman",
            body: "Kadang hotel, agen, atau kerabat butuh satu dokumen. Alih-alih salinan yang selamanya tersimpan di chat, bagikan tautan yang kedaluwarsa dan bisa dicabut kapan saja, dengan batas tampilan dan catatan tiap pembukaan. Penerima tak perlu akun, dan sisa brankas tetap privat — Anda menyerahkan satu berkas, bukan seluruh folder.",
          },
          {
            h2: "Bagaimana doki.help membantu",
            body: "doki.help menyimpan dokumen keluarga di penyimpanan privat, ditransfer lewat HTTPS, dengan akses diisolasi untuk keluarga Anda di tingkat basis data (row-level security) — hanya keluarga Anda yang melihatnya. Peran menentukan siapa owner, editor, atau viewer, login dua faktor tersedia, dan pengenalan bidang AI opsional mati secara default. Masih beta dan tidak menggantikan dokumen asli yang Anda bawa.",
          },
        ],
        faqHeading: "Pertanyaan umum",
        faq: [
          {
            q: "Di mana tempat teraman menyimpan salinan dokumen saat bepergian?",
            a: "Satu tempat yang bisa diandalkan: dokumen di penyimpanan privat lewat HTTPS, diisolasi untuk keluarga Anda di tingkat basis data, dengan login dua faktor tersedia — dan disimpan offline lebih awal untuk saat tanpa sinyal. Tetap bawa dokumen asli; salinan tidak menggantikannya.",
          },
          {
            q: "Bisakah membuka dokumen tanpa internet di luar negeri?",
            a: "Bisa, jika disiapkan. doki.help berjalan sebagai aplikasi yang bisa dipasang (PWA), jadi dokumen yang Anda buka dan simpan sebelum berangkat tetap tersedia offline. Lakukan selagi masih ada wifi, karena yang belum dibuka lebih awal tak akan muncul tanpa koneksi.",
          },
          {
            q: "Salinan dokumen apa yang sebaiknya dibawa?",
            a: "Untuk tiap orang: paspor dan visa, asuransi perjalanan dan medis, tiket dan konfirmasi pemesanan, serta surat izin untuk anak yang bepergian dengan satu orang tua atau orang dewasa lain. Persyaratan berbeda tiap negara, jadi selalu periksa aturan resmi untuk rute Anda.",
          },
          {
            q: "Apakah foto di galeri ponsel sudah cukup?",
            a: "Bisa menolong saat darurat, tetapi galeri tak punya struktur — tak bisa dipilah per orang, tak terlihat masa berlaku, sulit menemukan berkas dengan cepat, dan hilang bila ponsel hilang. Brankas per orang dan kategori jauh lebih bisa dipercaya di tengah perjalanan.",
          },
          {
            q: "Bagaimana menunjukkan satu dokumen tanpa membagikan semuanya?",
            a: "Bagikan satu berkas lewat tautan yang kedaluwarsa dan bisa dicabut kapan saja, dengan batas tampilan dan catatan tiap pembukaan. Penerima tak perlu akun, dan sisa brankas tetap privat.",
          },
        ],
      },
      uz: {
        navLabel: "Sayohatda nusxalar",
        title: "Sayohatda hujjat nusxalarini qayerda saqlash",
        metaDescription:
          "Sayohatda pasport, viza, sugʻurta va bron nusxalarini qayerda saqlash: bitta joy, aʼzolar boʻyicha, oflayn kirish va kerakli faylni xavfsiz ulashish.",
        h1: "Sayohatda hujjat nusxalarini qayerda saqlash",
        intro:
          "Oila hujjatlari nusxalarini sayohatga olishning sokin yoʻli — bitta joyda, aʼzolar boʻyicha, aloqa yoʻqda oflayn tayyor, va qolganini ochmay bitta faylni ulasha oladigan.",
        ctaPrimary: "Nusxalarni bitta joyga yigʻing",
        sections: [
          {
            h2: "Nega galereyadagi surat ishonchli tizim emas",
            body: "Sayohatdan oldin pasportni suratga olish yetarli tuyuladi — kerak boʻlgunicha. Galereyada bu surat minglab boshqalari orasida yoʻqoladi: oson oʻtkazib yuboriladi, tasodifan oʻchiriladi, hujjat turi boʻyicha topib boʻlmaydi. Telefon yoʻqolsa yoki xotira toʻlsa, nusxa ular bilan birga ketadi. Galereya rasmlarni saqlaydi, ammo peshtaxta oldida turganingizda ishonsa boʻladigan joy bermaydi.",
          },
          {
            h2: "Nega messenjerlar hujjatlar uchun noqulay",
            body: "Vizani oʻzingizga chatga yuborish bir daqiqaga yordam beradi, keyin uni yangi xabarlar bosib ketadi. Chatlar yozishmalarni shifrlangan holda saqlaydi, ammo ular suhbat uchun, tartib uchun emas: aʼzolar boʻyicha ajratib boʻlmaydi, nima qachon tugashi koʻrinmaydi, fayl esa jimgina pastga tushib ketadi. Chiqish eshigida hujjat kerak boʻlganda, chat tarixini titish — eng istamagan ishingiz. Gap xavfsizlikda emas — hujjatlar yoʻqoladi va vaqtida topilmaydi.",
          },
          {
            h2: "Qaysi nusxalarni qoʻl ostida saqlash kerak",
            body: "Hammasini olish shart emas — sayohatda odatda soʻraladigan hujjatlar, har bir ketayotgan kishi uchun.",
            bullets: [
              "Pasport va viza (agar boʻlsa, yashash ruxsati ham)",
              "Sayohat va tibbiy sugʻurta",
              "Chiptalar va bron tasdiqlari",
              "Bir ota-ona yoki boshqa kattaga hamroh boladigan bola uchun rozilik xatlari",
            ],
          },
          {
            h2: "Nusxalarni odamlar va toifalar boʻyicha qanday tartiblash",
            body: "Har bir ketayotgan kishiga oʻz profilini bering — oʻzingiz, turmush oʻrtogʻingiz, har bir bola — va ularning hujjatlarini birga saqlang. Shunda hujjat ikki teginishda: avval kishi, keyin toifa. Chegarada bitta bolaning pasporti va rozilik xati soʻralganda, umumiy galereyani kerakli surat umidida titmaysiz. doki.help da hujjatlarni boshidanoq oila aʼzolari boʻyicha tartiblash mumkin.",
          },
          {
            h2: "Aloqa yoʻqda oflayn kirish",
            body: "Aeroportlar, chegaralar va begona SIM uzilishlari — aynan aloqa yoʻqoladigan joylar. doki.help oʻrnatiladigan ilova (PWA) sifatida ishlaydi, shuning uchun oldindan ochib saqlagan hujjatlaringiz oflayn holatda ham qoladi. Kalit soʻz — oldindan: kerak boʻladiganini chiqishdan oldin, wifi borida oching, toki aloqa yoʻqda tayyor tursin. Telefonni quvvatli tuting va buni nusxa deb biling — oʻzingiz olib yurgan asl hujjatlar oʻrnini bosmaydi.",
          },
          {
            h2: "Kerakli faylni qanday xavfsiz ulashish",
            body: "Baʼzida mehmonxona, agent yoki qarindoshga bitta hujjat kerak boʻladi. Chatda abadiy qoladigan nusxa oʻrniga muddati tugaydigan va istalgan vaqt bekor qilinadigan havola ulashing, koʻrish chegarasi va har ochilish qaydi bilan. Qabul qiluvchiga akkaunt kerak emas, seyfning qolgani esa maxfiy qoladi — siz butun jild emas, bitta fayl berasiz.",
          },
          {
            h2: "doki.help qanday yordam beradi",
            body: "doki.help oila hujjatlarini maxfiy omborda saqlaydi, HTTPS orqali uzatadi, kirish esa maʼlumotlar bazasi darajasida oilangiz bilan izolyatsiya qilingan (RLS) — hujjatlarni faqat oilangiz koʻradi. Rollar kim owner, editor yoki viewer ekanini belgilaydi, ikki bosqichli kirish mavjud, ixtiyoriy AI maydon tanish esa sukut boʻyicha oʻchiq. U beta bosqichida va oʻzingiz olib yuradigan asl hujjatlar oʻrnini bosmaydi.",
          },
        ],
        faqHeading: "Tez-tez beriladigan savollar",
        faq: [
          {
            q: "Sayohatda hujjat nusxalarini saqlashning eng xavfsiz joyi qayer?",
            a: "Ishonsa boʻladigan bitta joy: hujjatlar HTTPS orqali maxfiy omborda, maʼlumotlar bazasi darajasida oilangiz bilan izolyatsiya qilingan, ikki bosqichli kirish mavjud — va aloqa yoʻq holat uchun oldindan oflayn saqlangan. Asl hujjatlarni baribir yoningizda tuting, nusxalar ularning oʻrnini bosmaydi.",
          },
          {
            q: "Chet elda internetsiz hujjatlarni ocholamanmi?",
            a: "Ha, tayyorlansangiz. doki.help oʻrnatiladigan ilova (PWA) sifatida ishlaydi, shuning uchun sayohatdan oldin ochib saqlagan hujjatlaringiz oflayn qoladi. Buni wifi borida qiling, chunki oldindan ochilmagani aloqasiz paydo boʻlmaydi.",
          },
          {
            q: "Sayohatga qaysi hujjat nusxalarini olish kerak?",
            a: "Har bir ketayotgan kishi uchun: pasport va viza, sayohat va tibbiy sugʻurta, chiptalar va bron tasdiqlari, hamda bir ota-ona yoki boshqa kattaga hamroh boʻlgan bola uchun rozilik xati. Talablar davlatga qarab farq qiladi, shuning uchun yoʻnalishingiz boʻyicha rasmiy qoidalarni tekshiring.",
          },
          {
            q: "Telefon galereyasidagi suratlar yetarlimi?",
            a: "Zarur paytda yordam berishi mumkin, ammo galereyada tartib yoʻq — aʼzolar boʻyicha ajratib boʻlmaydi, muddatlar koʻrinmaydi, kerakli faylni tez topib boʻlmaydi, telefon yoʻqolsa hammasi ketadi. Odamlar va toifalar boʻyicha seyf yoʻlda ancha ishonchli.",
          },
          {
            q: "Hammasiga ruxsat bermay bitta hujjatni qanday koʻrsatish mumkin?",
            a: "Bitta faylni muddati tugaydigan va istalgan vaqt bekor qilinadigan havola orqali ulashing, koʻrish chegarasi va har ochilish qaydi bilan. Qabul qiluvchiga akkaunt kerak emas, seyfning qolgani esa maxfiy qoladi.",
          },
        ],
      },
    },
    related: {
      en: [
        { href: "/travel-documents", label: "Travel documents" },
        { href: "/secure-document-sharing", label: "Secure document sharing" },
      ],
      ru: [
        { href: "/travel-documents", label: "Документы для поездок" },
        { href: "/secure-document-sharing", label: "Безопасная отправка документов" },
      ],
      id: [
        { href: "/travel-documents", label: "Dokumen perjalanan" },
        { href: "/secure-document-sharing", label: "Berbagi dokumen aman" },
      ],
      uz: [
        { href: "/travel-documents", label: "Sayohat hujjatlari" },
        { href: "/secure-document-sharing", label: "Xavfsiz hujjat ulashish" },
      ],
    },
  },
  "what-to-do-if-a-document-is-about-to-expire": {
    slug: "what-to-do-if-a-document-is-about-to-expire",
    emoji: "⏳",
    locales: {
      en: {
        navLabel: "Document about to expire",
        title: "Document About to Expire: What to Do Next",
        metaDescription:
          "A calm plan for when a document is about to expire: work out what expires and when, renew by priority, gather what you need, and set reminders so it doesn't happen again.",
        h1: "What to do if a document is about to expire",
        intro:
          "A calm plan for when a document is close to expiring: work out what expires and when, renew things in the right order, and set reminders so next time you know early.",
        ctaPrimary: "Set an expiry reminder",
        sections: [
          {
            h2: "How to catch an expiring document in time",
            body: "The real problem with deadlines is finding out too late. Check the \"valid until\" date on the document itself and gather all your family's dates in one list, so you can see what runs out first. If a date is already close, don't panic — it matters more to calmly decide the order of what to do.",
          },
          {
            h2: "Where to start: what to renew first",
            body: "When several documents expire at once, renew first the ones your life depends on — what you need for an upcoming trip, work or studies. A passport or visa usually matters more than something you can update later. Mark what's urgent and what can wait.",
            bullets: [
              "For travel: passport, visa, travel insurance",
              "For work and study: work permit, residence permit, professional certificates",
              "For everyday life: driving licence, local ID, health insurance",
            ],
          },
          {
            h2: "How early to start renewing",
            body: "There's no universal answer: every document and country has its own rules and processing times. In some places renewal takes weeks, in others longer, and sometimes you can't start too early. So check the official requirements and processing times in advance — doki.help doesn't renew documents for you, it helps you not miss the moment.",
          },
          {
            h2: "Gather the documents you need to renew in one place",
            body: "Renewing almost always needs other papers — the old document, photos, certificates, proofs. Collect them in one place ahead of time so you're not searching at the last minute. In doki.help you can keep related documents together for each family member.",
          },
          {
            h2: "Set reminders for the future so it doesn't happen again",
            body: "Once the current task is done, set a reminder for the future so the next deadline doesn't catch you off guard. Add the \"valid until\" date to the new document, and doki.help can send an email reminder in advance — for every family member.",
          },
          {
            h2: "Share a document safely if you need to",
            body: "Sometimes renewing means sending a document to an agent, an employer or a relative. Instead of a copy that lives forever in a chat, share a revocable link that expires, with a view limit and a log of every open. The recipient needs no account, and you can close access at any time.",
          },
          {
            h2: "How doki.help helps",
            body: "doki.help keeps your family's documents in private storage over HTTPS, with access isolated to your family at the database level (row-level security). Roles for owner, editor and viewer, two-factor login, email reminders based on the \"valid until\" date, revocable links and offline access (PWA). Optional AI field recognition is off by default. It's in beta, doesn't replace your originals and doesn't renew documents — it reminds and stores.",
          },
        ],
        faqHeading: "FAQ",
        faq: [
          {
            q: "How early should I start renewing a document?",
            a: "There's no single answer — every document and country has its own rules and processing times. Check the official requirements in advance and start as soon as you see the deadline approaching.",
          },
          {
            q: "What should I renew first if several expire at once?",
            a: "Start with what your nearest plans depend on: documents for travel, work or study. A passport and visa usually matter more than things you can update later.",
          },
          {
            q: "Does doki.help renew documents for me?",
            a: "No. doki.help doesn't renew documents or replace originals — it keeps them in one place and reminds you of deadlines by email so you have time to renew.",
          },
          {
            q: "How will a reminder reach me before the deadline?",
            a: "By email, before the \"valid until\" date you set on the document. The reminder comes 30, 15, 7 and 1 day before that date.",
          },
          {
            q: "Can I share a document safely for renewal?",
            a: "Yes. Share a revocable link with a view limit and a log of every open — it expires, access can be closed at any time, and the rest of your vault stays private.",
          },
        ],
      },
      ru: {
        navLabel: "Документ истекает",
        title: "Документ скоро истекает: что делать",
        metaDescription:
          "Спокойный план, когда документ скоро истекает: понять, что и когда заканчивается, продлить по приоритету, собрать нужное и поставить напоминания, чтобы не повторилось.",
        h1: "Что делать, если срок документа скоро заканчивается",
        intro:
          "Спокойный план на случай, когда до конца срока осталось немного: понять, что и когда истекает, продлить в правильном порядке и поставить напоминания, чтобы в следующий раз узнать заранее.",
        ctaPrimary: "Поставьте напоминание о сроке",
        sections: [
          {
            h2: "Как вовремя понять, что документ истекает",
            body: "Главная проблема со сроками — узнать о них слишком поздно. Проверьте дату «действует до» на самом документе и соберите все сроки семьи в одном списке, чтобы видеть, что заканчивается ближайшим. Если дата уже близко, не паникуйте — важнее спокойно определить порядок действий.",
          },
          {
            h2: "С чего начать: что продлевать первым",
            body: "Когда истекает сразу несколько документов, продлевайте первым то, без чего остановится жизнь: то, что нужно для ближайшей поездки, работы или учёбы. Паспорт и виза обычно важнее того, что можно обновить позже. Отметьте, что срочно, а что может подождать.",
            bullets: [
              "Для поездки: загранпаспорт, виза, страховка путешественника",
              "Для работы и учёбы: разрешение на работу, ВНЖ, профессиональные сертификаты",
              "Для повседневного: водительские права, местный ID, медстраховка",
            ],
          },
          {
            h2: "За сколько времени начинать продление",
            body: "Универсального срока нет: у каждого документа и страны свои правила и время оформления. Где-то продление занимает недели, где-то дольше, а иногда нельзя начать слишком рано. Поэтому проверьте официальные требования и сроки оформления заранее — doki.help не продлевает документы за вас, он помогает не пропустить момент.",
          },
          {
            h2: "Соберите документы для продления в одном месте",
            body: "Продление почти всегда требует других бумаг — старого документа, фото, справок, подтверждений. Соберите их в одном месте заранее, чтобы не искать в последний момент. В doki.help можно держать связанные документы вместе по каждому члену семьи.",
          },
          {
            h2: "Поставьте напоминания на будущее, чтобы не повторилось",
            body: "Когда текущий вопрос закрыт, поставьте напоминание на будущее, чтобы следующий срок не застал врасплох. Укажите дату «действует до» на новом документе, и doki.help пришлёт email-напоминание заранее — для каждого члена семьи.",
          },
          {
            h2: "Безопасно передайте документ, если нужно",
            body: "Иногда для продления документ нужно отправить агенту, работодателю или родственнику. Вместо копии, которая навсегда останется в чате, поделитесь отзываемой ссылкой, которая истекает, с лимитом просмотров и журналом открытий. Получателю не нужен аккаунт, а доступ можно закрыть в любой момент.",
          },
          {
            h2: "Как помогает doki.help",
            body: "doki.help хранит документы семьи в приватном хранилище по HTTPS, доступ изолирован вашей семьёй на уровне базы (RLS). Роли owner/editor/viewer, двухфакторный вход, email-напоминания по дате «действует до», отзываемые ссылки и офлайн-доступ (PWA). AI-распознавание полей опционально и по умолчанию выключено. Сервис в стадии beta, не заменяет оригиналы и не продлевает документы — он напоминает и хранит.",
          },
        ],
        faqHeading: "Частые вопросы",
        faq: [
          {
            q: "За сколько начинать продление документа?",
            a: "Единого срока нет — у каждого документа и страны свои правила и время оформления. Проверьте официальные требования заранее и начните, как только увидите, что срок приближается.",
          },
          {
            q: "Что продлевать первым, если истекает сразу несколько?",
            a: "Сначала то, без чего остановятся ближайшие планы: документы для поездки, работы или учёбы. Паспорт и визу обычно важнее того, что можно обновить позже.",
          },
          {
            q: "doki.help продлевает документы за меня?",
            a: "Нет. doki.help не продлевает документы и не заменяет оригиналы — он хранит их в одном месте и напоминает о сроках по email, чтобы вы успели продлить вовремя.",
          },
          {
            q: "Как напоминание придёт до окончания срока?",
            a: "На email, до указанной вами даты «действует до» на документе. Напоминание приходит за 30, 15, 7 и 1 день до этой даты.",
          },
          {
            q: "Можно безопасно передать документ для продления?",
            a: "Да. Поделитесь отзываемой ссылкой с лимитом просмотров и журналом открытий — она истекает, доступ можно закрыть в любой момент, а остальной сейф остаётся приватным.",
          },
        ],
      },
      id: {
        navLabel: "Dokumen segera kedaluwarsa",
        title: "Dokumen Segera Kedaluwarsa: Apa yang Harus Dilakukan",
        metaDescription:
          "Rencana tenang saat dokumen hampir kedaluwarsa: ketahui apa yang berakhir dan kapan, perpanjang sesuai prioritas, siapkan berkas, dan pasang pengingat agar tak terulang.",
        h1: "Apa yang harus dilakukan jika masa berlaku dokumen segera habis",
        intro:
          "Rencana yang tenang saat dokumen hampir habis masa berlakunya: cari tahu apa yang berakhir dan kapan, perpanjang sesuai urutan yang tepat, dan pasang pengingat agar lain kali Anda tahu lebih awal.",
        ctaPrimary: "Pasang pengingat masa berlaku",
        sections: [
          {
            h2: "Cara mengetahui dokumen akan kedaluwarsa tepat waktu",
            body: "Masalah utama tenggat adalah tahu terlalu terlambat. Periksa tanggal \"berlaku sampai\" pada dokumennya sendiri dan kumpulkan semua tanggal keluarga dalam satu daftar, agar terlihat mana yang paling dekat habis. Jika tanggalnya sudah dekat, jangan panik — lebih penting menentukan urutan langkah dengan tenang.",
          },
          {
            h2: "Mulai dari mana: apa yang diperpanjang lebih dulu",
            body: "Saat beberapa dokumen habis bersamaan, perpanjang dulu yang paling menentukan — yang Anda butuhkan untuk perjalanan, pekerjaan, atau studi terdekat. Paspor dan visa biasanya lebih penting daripada yang bisa diperbarui belakangan. Tandai mana yang mendesak dan mana yang bisa menunggu.",
            bullets: [
              "Untuk perjalanan: paspor, visa, asuransi perjalanan",
              "Untuk kerja dan studi: izin kerja, izin tinggal, sertifikat profesi",
              "Untuk sehari-hari: SIM, KTP, asuransi kesehatan",
            ],
          },
          {
            h2: "Seberapa awal mulai memperpanjang",
            body: "Tidak ada jawaban universal: tiap dokumen dan negara punya aturan dan waktu pemrosesan sendiri. Di beberapa tempat perpanjangan butuh berminggu-minggu, di tempat lain lebih lama, dan kadang tak bisa mulai terlalu awal. Jadi periksa persyaratan resmi dan waktu pemrosesan lebih dulu — doki.help tidak memperpanjang dokumen untuk Anda, ia membantu agar Anda tidak melewatkan momennya.",
          },
          {
            h2: "Kumpulkan dokumen untuk perpanjangan di satu tempat",
            body: "Perpanjangan hampir selalu butuh berkas lain — dokumen lama, foto, surat keterangan, bukti. Kumpulkan di satu tempat sejak awal agar tak mencari di menit terakhir. Di doki.help, dokumen terkait bisa disimpan bersama untuk tiap anggota keluarga.",
          },
          {
            h2: "Pasang pengingat untuk masa depan agar tak terulang",
            body: "Setelah urusan saat ini selesai, pasang pengingat untuk masa depan agar tenggat berikutnya tak mengejutkan. Isi tanggal \"berlaku sampai\" pada dokumen baru, dan doki.help bisa mengirim pengingat email lebih awal — untuk tiap anggota keluarga.",
          },
          {
            h2: "Bagikan dokumen dengan aman bila perlu",
            body: "Kadang memperpanjang berarti mengirim dokumen ke agen, pemberi kerja, atau kerabat. Alih-alih salinan yang selamanya di chat, bagikan tautan yang bisa dicabut dan kedaluwarsa, dengan batas tampilan dan catatan tiap pembukaan. Penerima tak perlu akun, dan akses bisa ditutup kapan saja.",
          },
          {
            h2: "Bagaimana doki.help membantu",
            body: "doki.help menyimpan dokumen keluarga di penyimpanan privat lewat HTTPS, dengan akses diisolasi untuk keluarga Anda di tingkat basis data (row-level security). Peran owner, editor, dan viewer, login dua faktor, pengingat email berdasarkan tanggal \"berlaku sampai\", tautan yang bisa dicabut, dan akses offline (PWA). Pengenalan bidang AI opsional mati secara default. Masih beta, tidak menggantikan dokumen asli dan tidak memperpanjang dokumen — ia mengingatkan dan menyimpan.",
          },
        ],
        faqHeading: "Pertanyaan umum",
        faq: [
          {
            q: "Seberapa awal harus mulai memperpanjang dokumen?",
            a: "Tak ada jawaban tunggal — tiap dokumen dan negara punya aturan dan waktu pemrosesan sendiri. Periksa persyaratan resmi lebih dulu dan mulai begitu Anda melihat tenggat mendekat.",
          },
          {
            q: "Apa yang diperpanjang lebih dulu jika beberapa habis sekaligus?",
            a: "Mulai dari yang menentukan rencana terdekat: dokumen untuk perjalanan, kerja, atau studi. Paspor dan visa biasanya lebih penting daripada yang bisa diperbarui belakangan.",
          },
          {
            q: "Apakah doki.help memperpanjang dokumen untuk saya?",
            a: "Tidak. doki.help tidak memperpanjang dokumen atau menggantikan yang asli — ia menyimpannya di satu tempat dan mengingatkan tenggat lewat email agar Anda sempat memperpanjang.",
          },
          {
            q: "Bagaimana pengingat sampai sebelum tenggat?",
            a: "Lewat email, sebelum tanggal \"berlaku sampai\" yang Anda tetapkan pada dokumen. Pengingat datang 30, 15, 7, dan 1 hari sebelum tanggal itu.",
          },
          {
            q: "Bisakah berbagi dokumen dengan aman untuk perpanjangan?",
            a: "Bisa. Bagikan tautan yang bisa dicabut dengan batas tampilan dan catatan tiap pembukaan — ia kedaluwarsa, akses bisa ditutup kapan saja, dan sisa brankas tetap privat.",
          },
        ],
      },
      uz: {
        navLabel: "Hujjat muddati tugayapti",
        title: "Hujjat muddati tugayapti: nima qilish kerak",
        metaDescription:
          "Hujjat muddati tugashiga oz qolganda sokin reja: nima va qachon tugashini biling, ustuvorlik boʻyicha yangilang va eslatma qoʻyib takrorlanmasin.",
        h1: "Hujjat muddati yaqinda tugasa, nima qilish kerak",
        intro:
          "Hujjat muddati tugashiga oz qolganda sokin reja: nima va qachon tugashini aniqlang, toʻgʻri tartibda yangilang va keyingi safar oldindan bilishingiz uchun eslatma qoʻying.",
        ctaPrimary: "Muddat uchun eslatma qoʻying",
        sections: [
          {
            h2: "Hujjat muddati tugashini oʻz vaqtida qanday bilish",
            body: "Muddat bilan bogʻliq asosiy muammo — bu haqda juda kech bilib qolish. Hujjatning oʻzidagi \"amal qiladi\" sanasini tekshiring va oilaning barcha muddatlarini bitta roʻyxatga yigʻing, shunda avval nima tugashi koʻrinadi. Agar sana yaqin boʻlsa, vahima qilmang — muhimi harakatlar tartibini xotirjam belgilash.",
          },
          {
            h2: "Nimadan boshlash: avval nimani yangilash kerak",
            body: "Bir vaqtda bir nechta hujjat tugasa, avval hayotingiz bogʻliq boʻlganini yangilang — yaqin safar, ish yoki oʻqish uchun keragini. Pasport va viza odatda keyin yangilasa boʻladigan narsadan muhimroq. Nima shoshilinch, nima kutishi mumkinligini belgilab qoʻying.",
            bullets: [
              "Safar uchun: pasport, viza, sayohat sugʻurtasi",
              "Ish va oʻqish uchun: ishlash ruxsati, yashash ruxsati, kasbiy sertifikatlar",
              "Kundalik hayot uchun: haydovchilik guvohnomasi, mahalliy ID, tibbiy sugʻurta",
            ],
          },
          {
            h2: "Yangilashni qancha oldin boshlash kerak",
            body: "Umumiy javob yoʻq: har bir hujjat va davlatning oʻz qoidalari va rasmiylashtirish muddati bor. Baʼzi joyda yangilash haftalar oladi, boshqasida uzoqroq, baʼzan esa juda erta boshlab boʻlmaydi. Shuning uchun rasmiy talablar va rasmiylashtirish muddatlarini oldindan tekshiring — doki.help hujjatlarni siz uchun yangilamaydi, u kerakli vaqtni oʻtkazib yubormaslikka yordam beradi.",
          },
          {
            h2: "Yangilash uchun kerakli hujjatlarni bitta joyga yigʻing",
            body: "Yangilash deyarli doim boshqa qogʻozlarni talab qiladi — eski hujjat, surat, maʼlumotnomalar, tasdiqlar. Ularni oldindan bitta joyga yigʻing, shunda oxirgi daqiqada qidirmaysiz. doki.help da bogʻliq hujjatlarni har bir oila aʼzosi uchun birga saqlash mumkin.",
          },
          {
            h2: "Takrorlanmasligi uchun kelajakka eslatma qoʻying",
            body: "Joriy masala hal boʻlgach, keyingi muddat kutilmaganda kelmasligi uchun kelajakka eslatma qoʻying. Yangi hujjatga \"amal qiladi\" sanasini kiriting, doki.help esa oldindan email eslatma yuborishi mumkin — har bir oila aʼzosi uchun.",
          },
          {
            h2: "Kerak boʻlsa, hujjatni xavfsiz ulashing",
            body: "Baʼzida yangilash hujjatni agentga, ish beruvchiga yoki qarindoshga yuborishni bildiradi. Chatda abadiy qoladigan nusxa oʻrniga muddati tugaydigan, bekor qilinadigan havola ulashing, koʻrish chegarasi va har ochilish qaydi bilan. Qabul qiluvchiga akkaunt kerak emas, kirishni istalgan vaqt yopish mumkin.",
          },
          {
            h2: "doki.help qanday yordam beradi",
            body: "doki.help oila hujjatlarini HTTPS orqali maxfiy omborda saqlaydi, kirish maʼlumotlar bazasi darajasida oilangiz bilan izolyatsiya qilingan (RLS). owner, editor va viewer rollari, ikki bosqichli kirish, \"amal qiladi\" sanasi boʻyicha email eslatmalar, bekor qilinadigan havolalar va oflayn kirish (PWA). Ixtiyoriy AI maydon tanish sukut boʻyicha oʻchiq. U beta bosqichida, asl hujjatlar oʻrnini bosmaydi va hujjatlarni yangilamaydi — u eslatadi va saqlaydi.",
          },
        ],
        faqHeading: "Tez-tez beriladigan savollar",
        faq: [
          {
            q: "Hujjatni qancha oldin yangilashni boshlash kerak?",
            a: "Yagona javob yoʻq — har bir hujjat va davlatning oʻz qoidalari va rasmiylashtirish muddati bor. Rasmiy talablarni oldindan tekshiring va muddat yaqinlashayotganini koʻrishingiz bilan boshlang.",
          },
          {
            q: "Bir nechta hujjat birdan tugasa, avval nimani yangilash kerak?",
            a: "Yaqin rejalaringiz bogʻliq boʻlganidan boshlang: safar, ish yoki oʻqish uchun hujjatlar. Pasport va viza odatda keyin yangilasa boʻladigan narsadan muhimroq.",
          },
          {
            q: "doki.help hujjatlarni men uchun yangiladimi?",
            a: "Yoʻq. doki.help hujjatlarni yangilamaydi va asl nusxa oʻrnini bosmaydi — u ularni bitta joyda saqlaydi va muddatlar haqida email orqali eslatadi, shunda vaqtida yangilab olasiz.",
          },
          {
            q: "Muddatdan oldin eslatma qanday keladi?",
            a: "Email orqali, hujjatda siz belgilagan \"amal qiladi\" sanasidan oldin. Eslatma shu sanadan 30, 15, 7 va 1 kun oldin keladi.",
          },
          {
            q: "Yangilash uchun hujjatni xavfsiz ulashsa boʻladimi?",
            a: "Ha. Koʻrish chegarasi va har ochilish qaydi bilan bekor qilinadigan havola ulashing — u muddati tugaydi, kirishni istalgan vaqt yopish mumkin, seyfning qolgani maxfiy qoladi.",
          },
        ],
      },
    },
    related: {
      en: [
        { href: "/document-expiry-reminder", label: "Document expiry reminders" },
        { href: "/passport-expiry-reminder", label: "Passport expiry reminders" },
      ],
      ru: [
        { href: "/document-expiry-reminder", label: "Напоминания о сроках документов" },
        { href: "/passport-expiry-reminder", label: "Напоминания о сроке паспорта" },
      ],
      id: [
        { href: "/document-expiry-reminder", label: "Pengingat masa berlaku dokumen" },
        { href: "/passport-expiry-reminder", label: "Pengingat masa berlaku paspor" },
      ],
      uz: [
        { href: "/document-expiry-reminder", label: "Hujjat muddati eslatmalari" },
        { href: "/passport-expiry-reminder", label: "Pasport muddati eslatmalari" },
      ],
    },
  },
};

export const GUIDE_KEYS = Object.keys(DATA);

export function getGuide(slug: string): Guide | undefined {
  return DATA[slug];
}

/** Ссылки на гайды для внутренней перелинковки. */
export function guideLinks(locale: Locale) {
  return GUIDE_KEYS.map((key) => ({
    key,
    emoji: DATA[key].emoji,
    label: DATA[key].locales[locale].navLabel,
  }));
}

export async function guideMetadata(slug: string): Promise<Metadata> {
  const g = getGuide(slug);
  if (!g) return {};
  const locale = await getLocale();
  const c = g.locales[locale] ?? g.locales.en;
  return {
    title: c.title,
    description: c.metaDescription,
    alternates: await altLangs(),
    openGraph: {
      title: c.title,
      description: c.metaDescription,
      url: `${APP_URL}/${locale}/blog/${slug}`,
    },
  };
}

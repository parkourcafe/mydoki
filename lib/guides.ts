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
  "organize-documents-by-family-member": {
    slug: "organize-documents-by-family-member",
    emoji: "👨‍👩‍👧‍👦",
    locales: {
      en: {
        navLabel: "Sort by family member",
        title: "Organize Family Documents by Family Member",
        metaDescription:
          "A calm way to sort your family's documents by member: a profile for each person, simple categories, two-tap access, expiry dates and reminders.",
        h1: "How to organize documents by family member",
        intro:
          "A calm, practical way to organize your family's documents by member — a profile for each person, a few simple categories, and expiry dates with reminders, so finding anyone's document takes two taps instead of a search.",
        ctaPrimary: "Organize your documents by family member",
        sections: [
          {
            h2: "Why one shared pile of documents doesn't work",
            body: "When every document lands in the same folder — everyone's passports, insurance and certificates mixed together — finding one thing means scrolling past everyone else's. The pile grows, names blur, and when a specific person's document is suddenly needed, you're searching the whole family's paperwork at once. Sorting by person turns that search into a single, obvious place to look.",
          },
          {
            h2: "The principle: a profile for each family member",
            body: "Instead of one big pile, give each person their own space — partner, children, parents — and keep their documents together under their name. A child's passport lives with a child's papers, a parent's visa with the parent's. You stop asking \"where did we put it?\" because the answer is always the same: under the person it belongs to.",
          },
          {
            h2: "Which categories to set up for each person",
            body: "Within each person's profile, a few simple categories keep things easy to scan. You don't need all of them for everyone — use the ones that fit.",
            bullets: [
              "Identity: passports, ID cards, birth certificates",
              "Medical: insurance, vaccination records, key reports",
              "Travel: visas, permits, tickets and bookings",
              "Financial: bank papers, tax and contract documents",
              "Children and school: enrollment, certificates, permission forms",
            ],
          },
          {
            h2: "What it looks like in practice",
            body: "Once documents sit under the right person, getting to one is quick: open the family member, open the document — two taps instead of scrolling a shared pile. When someone asks for your daughter's insurance or your father's ID, you go straight to their profile instead of digging through everything.",
          },
          {
            h2: "Add expiry dates and reminders for each person",
            body: "As you file each document, set its \"valid until\" date so the deadline lives with the document. doki.help can then send an email reminder before it expires, for every member of the family — the reminder comes 30, 15, 7 and 1 day before that date. Because dates are attached per person, a child's passport and a parent's visa are each tracked on their own, so no one's deadline slips. Renewal rules differ by country, so check the official requirements for anything time-sensitive.",
          },
          {
            h2: "How doki.help helps",
            body: "doki.help keeps each family member's documents in private storage, transferred over HTTPS, with access isolated to your family at the database level (row-level security) — only your family sees them. Roles let you decide who is owner, editor or viewer, so the whole family can share one organized vault while you control who can change what. Two-factor login is available, and optional AI field recognition is off by default. It's in beta and doesn't replace your original documents.",
          },
        ],
        faqHeading: "FAQ",
        faq: [
          {
            q: "How should I organize documents by family member?",
            a: "Give each person their own profile — partner, children, parents — and keep their documents together under their name. Within each profile, a few simple categories like identity, medical and travel make anything easy to find.",
          },
          {
            q: "What categories should I set up for each person?",
            a: "Identity, medical, travel, financial, and children or school documents cover most families. You don't need every category for everyone — use the ones that fit each person.",
          },
          {
            q: "How quickly can I find one person's document?",
            a: "Open the family member, then open the document — two taps, instead of scrolling a shared pile. Sorting by person means you always know where to look.",
          },
          {
            q: "How will I be reminded before a document expires?",
            a: "By email, before the \"valid until\" date you set on each document. The reminder comes 30, 15, 7 and 1 day before that date, for every member of the family.",
          },
          {
            q: "Can the whole family use the same vault?",
            a: "Yes. Roles let you decide who is owner, editor or viewer, so everyone can reach the documents while you control who can change what. Access is isolated to your family at the database level (row-level security).",
          },
        ],
      },
      ru: {
        navLabel: "По членам семьи",
        title: "Как разложить документы по членам семьи",
        metaDescription:
          "Спокойный способ разложить документы семьи по членам: профиль на каждого, простые категории, быстрый доступ в два касания, сроки и напоминания.",
        h1: "Как разложить документы по членам семьи",
        intro:
          "Спокойный и практичный способ разложить документы семьи по членам — профиль на каждого, несколько простых категорий, а также сроки с напоминаниями, чтобы документ любого находился в два касания, а не поиском.",
        ctaPrimary: "Разложите документы по членам семьи",
        sections: [
          {
            h2: "Почему общая куча документов не работает",
            body: "Когда все документы лежат в одной папке — паспорта, страховки и справки всех вперемешку — чтобы найти одно, приходится прокручивать чужое. Куча растёт, имена сливаются, и когда вдруг нужен документ конкретного человека, вы ищете сразу по бумагам всей семьи. Разбор по членам семьи превращает этот поиск в одно очевидное место, куда смотреть.",
          },
          {
            h2: "Принцип: профиль на каждого члена семьи",
            body: "Вместо одной большой кучи дайте каждому своё место — супругу, детям, родителям — и держите их документы вместе под их именем. Паспорт ребёнка лежит с бумагами ребёнка, виза родителя — с родительскими. Вопрос «куда мы это положили?» отпадает, потому что ответ всегда один: под тем человеком, кому документ принадлежит.",
          },
          {
            h2: "Какие категории завести на каждого",
            body: "Внутри профиля каждого человека несколько простых категорий помогают быстро ориентироваться. Все сразу не нужны — используйте те, что подходят.",
            bullets: [
              "Удостоверяющие: паспорта, ID, свидетельства о рождении",
              "Медицинские: страховки, прививки, ключевые заключения",
              "Для поездок: визы, разрешения, билеты и брони",
              "Финансовые: банковские бумаги, налоги, договоры",
              "Детские и школьные: зачисление, справки, согласия",
            ],
          },
          {
            h2: "Как это выглядит на практике",
            body: "Когда документы лежат под нужным человеком, добраться до одного — быстро: откройте члена семьи, откройте документ — два касания вместо прокрутки общей кучи. Когда просят страховку дочери или ID отца, вы идёте прямо в их профиль, а не роетесь во всём подряд.",
          },
          {
            h2: "Как подключить сроки и напоминания к документам каждого",
            body: "Добавляя документ, укажите дату «действует до», чтобы срок жил вместе с документом. Тогда doki.help пришлёт email-напоминание до окончания срока — для каждого члена семьи. Напоминание приходит за 30, 15, 7 и 1 день до этой даты. Так как даты привязаны к каждому человеку, паспорт ребёнка и виза родителя отслеживаются каждый сам по себе, и ничей срок не теряется. Правила продления зависят от страны, поэтому по всему срочному проверяйте официальные требования.",
          },
          {
            h2: "Как помогает doki.help",
            body: "doki.help хранит документы каждого члена семьи в приватном хранилище, передаёт их по HTTPS, а доступ изолирован вашей семьёй на уровне базы (RLS) — документы видит только ваша семья. Роли позволяют решить, кто owner, editor или viewer, так что вся семья пользуется одним упорядоченным сейфом, а вы решаете, кто что может менять. Доступен двухфакторный вход, а опциональное AI-распознавание полей по умолчанию выключено. Сервис в стадии beta и не заменяет оригиналы документов.",
          },
        ],
        faqHeading: "Частые вопросы",
        faq: [
          {
            q: "Как разложить документы по членам семьи?",
            a: "Дайте каждому свой профиль — супругу, детям, родителям — и держите их документы вместе под их именем. Внутри профиля несколько простых категорий (удостоверяющие, медицинские, для поездок) помогают всё легко найти.",
          },
          {
            q: "Какие категории завести на каждого человека?",
            a: "Удостоверяющие, медицинские, для поездок, финансовые и детские или школьные документы покрывают большинство семей. Все сразу не нужны — используйте те, что подходят каждому.",
          },
          {
            q: "Как быстро найти документ одного человека?",
            a: "Откройте члена семьи, затем откройте документ — два касания вместо прокрутки общей кучи. Разбор по людям означает, что вы всегда знаете, где смотреть.",
          },
          {
            q: "Как придёт напоминание до окончания срока?",
            a: "На email, до указанной вами даты «действует до» на каждом документе. Напоминание приходит за 30, 15, 7 и 1 день до этой даты, для каждого члена семьи.",
          },
          {
            q: "Может ли вся семья пользоваться одним сейфом?",
            a: "Да. Роли позволяют решить, кто owner, editor или viewer, так что доступ есть у всех, а вы решаете, кто что может менять. Доступ изолирован вашей семьёй на уровне базы (RLS).",
          },
        ],
      },
      id: {
        navLabel: "Per anggota keluarga",
        title: "Menata Dokumen Keluarga per Anggota",
        metaDescription:
          "Cara tenang menata dokumen keluarga per anggota: profil untuk tiap orang, kategori sederhana, akses dua ketukan, masa berlaku, dan pengingat.",
        h1: "Cara menata dokumen per anggota keluarga",
        intro:
          "Cara tenang dan praktis menata dokumen keluarga per anggota — profil untuk tiap orang, beberapa kategori sederhana, serta masa berlaku dengan pengingat, agar menemukan dokumen siapa pun cukup dua ketukan, bukan pencarian.",
        ctaPrimary: "Tata dokumen per anggota keluarga",
        sections: [
          {
            h2: "Mengapa satu tumpukan dokumen bersama tidak berhasil",
            body: "Saat semua dokumen masuk ke satu folder — paspor, asuransi, dan sertifikat semua orang bercampur — menemukan satu berkas berarti menggulir melewati milik orang lain. Tumpukan membesar, nama-nama mengabur, dan saat dokumen orang tertentu tiba-tiba diperlukan, Anda mencari di seluruh berkas keluarga sekaligus. Memilah per orang mengubah pencarian itu jadi satu tempat yang jelas untuk dilihat.",
          },
          {
            h2: "Prinsipnya: satu profil untuk tiap anggota keluarga",
            body: "Alih-alih satu tumpukan besar, beri tiap orang ruangnya sendiri — pasangan, anak, orang tua — dan simpan dokumennya bersama di bawah namanya. Paspor anak ada bersama berkas anak, visa orang tua bersama milik orang tua. Pertanyaan \"di mana kita menaruhnya?\" hilang, karena jawabannya selalu sama: di bawah orang pemiliknya.",
          },
          {
            h2: "Kategori apa yang perlu dibuat untuk tiap orang",
            body: "Di dalam profil tiap orang, beberapa kategori sederhana membuatnya mudah dipindai. Anda tidak perlu semuanya untuk semua orang — pakai yang sesuai.",
            bullets: [
              "Identitas: paspor, KTP, akta kelahiran",
              "Medis: asuransi, catatan vaksinasi, hasil penting",
              "Perjalanan: visa, izin, tiket dan pemesanan",
              "Keuangan: berkas bank, pajak, dan kontrak",
              "Anak dan sekolah: pendaftaran, sertifikat, surat izin",
            ],
          },
          {
            h2: "Seperti apa dalam praktik",
            body: "Setelah dokumen berada di bawah orang yang tepat, membukanya jadi cepat: buka anggota keluarga, buka dokumen — dua ketukan, bukan menggulir tumpukan bersama. Saat seseorang meminta asuransi putri Anda atau KTP ayah Anda, Anda langsung ke profil mereka, bukan mengaduk semuanya.",
          },
          {
            h2: "Menghubungkan masa berlaku dan pengingat ke dokumen tiap orang",
            body: "Saat menyimpan tiap dokumen, isi tanggal \"berlaku sampai\" agar tenggat menempel pada dokumen. Lalu doki.help bisa mengirim pengingat email sebelum kedaluwarsa — untuk tiap anggota keluarga. Pengingat datang 30, 15, 7, dan 1 hari sebelum tanggal itu. Karena tanggal terpasang per orang, paspor anak dan visa orang tua terpantau masing-masing, jadi tidak ada tenggat yang lolos. Aturan perpanjangan berbeda tiap negara, jadi periksa persyaratan resmi untuk hal yang terikat waktu.",
          },
          {
            h2: "Bagaimana doki.help membantu",
            body: "doki.help menyimpan dokumen tiap anggota keluarga di penyimpanan privat, ditransfer lewat HTTPS, dengan akses diisolasi untuk keluarga Anda di tingkat basis data (row-level security) — hanya keluarga Anda yang melihatnya. Peran menentukan siapa owner, editor, atau viewer, sehingga seluruh keluarga memakai satu brankas yang tertata sementara Anda mengatur siapa yang boleh mengubah apa. Login dua faktor tersedia, dan pengenalan bidang AI opsional mati secara default. Masih beta dan tidak menggantikan dokumen asli Anda.",
          },
        ],
        faqHeading: "Pertanyaan umum",
        faq: [
          {
            q: "Bagaimana cara menata dokumen per anggota keluarga?",
            a: "Beri tiap orang profilnya sendiri — pasangan, anak, orang tua — dan simpan dokumennya bersama di bawah namanya. Di dalam profil, beberapa kategori sederhana seperti identitas, medis, dan perjalanan membuat semuanya mudah ditemukan.",
          },
          {
            q: "Kategori apa yang perlu dibuat untuk tiap orang?",
            a: "Identitas, medis, perjalanan, keuangan, serta dokumen anak atau sekolah mencakup sebagian besar keluarga. Anda tidak perlu tiap kategori untuk semua orang — pakai yang sesuai untuk masing-masing.",
          },
          {
            q: "Seberapa cepat menemukan dokumen satu orang?",
            a: "Buka anggota keluarga, lalu buka dokumen — dua ketukan, bukan menggulir tumpukan bersama. Memilah per orang berarti Anda selalu tahu di mana mencari.",
          },
          {
            q: "Bagaimana pengingat sebelum dokumen kedaluwarsa datang?",
            a: "Lewat email, sebelum tanggal \"berlaku sampai\" yang Anda tetapkan pada tiap dokumen. Pengingat datang 30, 15, 7, dan 1 hari sebelum tanggal itu, untuk tiap anggota keluarga.",
          },
          {
            q: "Bisakah seluruh keluarga memakai brankas yang sama?",
            a: "Bisa. Peran menentukan siapa owner, editor, atau viewer, jadi semua orang bisa mengakses dokumen sementara Anda mengatur siapa yang boleh mengubah apa. Akses diisolasi untuk keluarga Anda di tingkat basis data (row-level security).",
          },
        ],
      },
      uz: {
        navLabel: "Aʼzolar boʻyicha",
        title: "Hujjatlarni oila aʼzolari boʻyicha saralash",
        metaDescription:
          "Oila hujjatlarini aʼzolar boʻyicha saralashning sokin yoʻli: har kishiga profil, oddiy toifalar, ikki teginishda kirish, muddat va eslatmalar.",
        h1: "Hujjatlarni oila aʼzolari boʻyicha qanday saralash",
        intro:
          "Oila hujjatlarini aʼzolar boʻyicha saralashning sokin va amaliy yoʻli — har kishiga profil, bir necha oddiy toifa, muddatlar va eslatmalar bilan, shunda istalgan kishining hujjati qidiruvsiz, ikki teginishda topiladi.",
        ctaPrimary: "Hujjatlarni oila aʼzolari boʻyicha saralang",
        sections: [
          {
            h2: "Nega umumiy hujjatlar uyumi ishlamaydi",
            body: "Barcha hujjatlar bitta papkaga tushganda — hammaning pasportlari, sugʻurtalari va guvohnomalari aralash — bittasini topish uchun oʻzganikini varaqlashga toʻgʻri keladi. Uyum oʻsadi, ismlar chalkashadi, va muayyan kishining hujjati kerak boʻlib qolsa, siz butun oilaning qogʻozlarini birdan qidirasiz. Aʼzolar boʻyicha ajratish bu qidiruvni qaraydigan bitta aniq joyga aylantiradi.",
          },
          {
            h2: "Tamoyil: har bir oila aʼzosiga profil",
            body: "Bitta katta uyum oʻrniga har kishiga oʻz joyini bering — turmush oʻrtogʻingiz, bolalar, ota-onangiz — va ularning hujjatlarini oʻz nomi ostida birga saqlang. Bolaning pasporti bolaning qogʻozlari bilan, ota-onaning vizasi ota-onaniki bilan yotadi. \"Buni qayerga qoʻygandik?\" degan savol yoʻqoladi, chunki javob doim bitta: hujjat kimniki boʻlsa, oʻsha kishi ostida.",
          },
          {
            h2: "Har kishiga qanday toifalar ochish kerak",
            body: "Har kishining profili ichida bir necha oddiy toifa koʻz yugurtirishni osonlashtiradi. Hammasi har kimga kerak emas — mosini ishlating.",
            bullets: [
              "Guvohnoma: pasportlar, ID, tugʻilganlik guvohnomalari",
              "Tibbiy: sugʻurta, emlash yozuvlari, muhim xulosalar",
              "Safar uchun: vizalar, ruxsatnomalar, chiptalar va bronlar",
              "Moliyaviy: bank qogʻozlari, soliq, shartnomalar",
              "Bolalar va maktab: qabul, sertifikatlar, rozilik xatlari",
            ],
          },
          {
            h2: "Bu amalda qanday koʻrinadi",
            body: "Hujjatlar kerakli kishi ostida yotganda, bittasiga yetish tez: oila aʼzosini oching, hujjatni oching — umumiy uyumni varaqlash oʻrniga ikki teginish. Kimdir qizingizning sugʻurtasini yoki otangizning IDsini soʻrasa, hammasini titkilamay, toʻgʻri ularning profiliga borasiz.",
          },
          {
            h2: "Har kimning hujjatiga muddat va eslatma ulash",
            body: "Har bir hujjatni saqlayotib \"amal qiladi\" sanasini kiriting, shunda muddat hujjat bilan birga yashaydi. Keyin doki.help muddat tugashidan oldin email eslatma yuborishi mumkin — har bir oila aʼzosi uchun. Eslatma shu sanadan 30, 15, 7 va 1 kun oldin keladi. Sanalar har kishiga bogʻlangani uchun bolaning pasporti va ota-onaning vizasi alohida kuzatiladi, hech kimning muddati oʻtib ketmaydi. Yangilash qoidalari davlatga qarab farq qiladi, shuning uchun muddatga bogʻliq har narsa boʻyicha rasmiy talablarni tekshiring.",
          },
          {
            h2: "doki.help qanday yordam beradi",
            body: "doki.help har bir oila aʼzosining hujjatlarini maxfiy omborda saqlaydi, HTTPS orqali uzatadi, kirish esa maʼlumotlar bazasi darajasida oilangiz bilan izolyatsiya qilingan (RLS) — hujjatlarni faqat oilangiz koʻradi. Rollar kim owner, editor yoki viewer ekanini belgilaydi, shunda butun oila bitta tartibli seyfdan foydalanadi, siz esa kim nimani oʻzgartira olishini nazorat qilasiz. Ikki bosqichli kirish mavjud, ixtiyoriy AI maydon tanish esa sukut boʻyicha oʻchiq. U beta bosqichida va asl hujjatlaringiz oʻrnini bosmaydi.",
          },
        ],
        faqHeading: "Tez-tez beriladigan savollar",
        faq: [
          {
            q: "Hujjatlarni oila aʼzolari boʻyicha qanday saralash kerak?",
            a: "Har kishiga oʻz profilini bering — turmush oʻrtogʻingiz, bolalar, ota-onangiz — va hujjatlarini oʻz nomi ostida birga saqlang. Profil ichida guvohnoma, tibbiy, safar kabi bir necha oddiy toifa hammasini oson topishga yordam beradi.",
          },
          {
            q: "Har kishiga qanday toifalar ochish kerak?",
            a: "Guvohnoma, tibbiy, safar, moliyaviy va bolalar yoki maktab hujjatlari koʻp oilalarni qamrab oladi. Hammasi har kimga kerak emas — har kishi uchun mosini ishlating.",
          },
          {
            q: "Bir kishining hujjatini qanchalik tez topsa boʻladi?",
            a: "Oila aʼzosini oching, keyin hujjatni oching — umumiy uyumni varaqlash oʻrniga ikki teginish. Aʼzolar boʻyicha ajratish qayerdan qidirishni doim bilishingizni anglatadi.",
          },
          {
            q: "Muddat tugashidan oldin eslatma qanday keladi?",
            a: "Email orqali, har bir hujjatda siz belgilagan \"amal qiladi\" sanasidan oldin. Eslatma shu sanadan 30, 15, 7 va 1 kun oldin keladi, har bir oila aʼzosi uchun.",
          },
          {
            q: "Butun oila bitta seyfdan foydalana oladimi?",
            a: "Ha. Rollar kim owner, editor yoki viewer ekanini belgilaydi, shunda hamma hujjatlarga kira oladi, siz esa kim nimani oʻzgartira olishini nazorat qilasiz. Kirish maʼlumotlar bazasi darajasida oilangiz bilan izolyatsiya qilingan (RLS).",
          },
        ],
      },
    },
    related: {
      en: [
        { href: "/family-document-organizer", label: "Family document organizer" },
        { href: "/family-document-vault", label: "Family document vault" },
      ],
      ru: [
        { href: "/family-document-organizer", label: "Организатор документов семьи" },
        { href: "/family-document-vault", label: "Семейный сейф документов" },
      ],
      id: [
        { href: "/family-document-organizer", label: "Penata dokumen keluarga" },
        { href: "/family-document-vault", label: "Brankas dokumen keluarga" },
      ],
      uz: [
        { href: "/family-document-organizer", label: "Oila hujjatlari tartibchisi" },
        { href: "/family-document-vault", label: "Oilaviy hujjatlar seyfi" },
      ],
    },
  },
  "visa-expiry-how-to-renew-in-time": {
    slug: "visa-expiry-how-to-renew-in-time",
    emoji: "🛂",
    locales: {
      en: {
        navLabel: "Visa expiry",
        title: "Visa Expiry: How to Renew in Time",
        metaDescription:
          "A calm way to stay ahead of a visa deadline: which dates matter, how early to start renewing, how to track the whole family's visas and get reminders in time.",
        h1: "Visa expiry: how not to miss the renewal",
        intro:
          "A practical way to stay ahead of a visa deadline — which dates actually matter, how early to start renewing, and how to keep every family member's visa in one place so a deadline reaches you early instead of by surprise.",
        ctaPrimary: "Add your visa and set up a reminder",
        sections: [
          {
            h2: "Why a visa deadline is so easy to miss",
            body: "A visa is easy to lose track of because nothing reminds you it's running out. You get it once, travel or settle in, and the date quietly sits in a passport or an email. There's no natural moment that says the deadline is coming — so it surfaces at the worst time, often when a trip or an appointment is already booked. The fix isn't to memorise the date; it's to store it with the document and let a reminder reach you early.",
          },
          {
            h2: "Which dates actually matter",
            body: "A visa usually involves more than one date, and it's worth knowing which ones you're tracking. The rules behind them depend on the country, so treat this as what to look for, not a universal answer.",
            bullets: [
              "The visa's own expiry date — when the visa itself stops being valid",
              "Your permitted length of stay — sometimes shorter than the visa's validity",
              "Passport requirements — many countries want your passport valid well beyond your stay",
            ],
          },
          {
            h2: "How early to start renewing",
            body: "There's no single right answer — how early you should start depends entirely on the country and the type of visa. Some renewals are quick; others take weeks or months and need appointments, documents and waiting. As a rule of thumb, give yourself enough time to gather papers, apply and wait for processing without pressure. doki.help doesn't renew visas or give immigration advice, so for timelines and steps always check the official requirements of the destination country.",
          },
          {
            h2: "Keeping the whole family's visas in one place",
            body: "One visa is manageable; a family's visas, each with its own date and country, are not. Give each member their own profile — partner, children, parents — and store each visa with its \"valid until\" date. That way a child's visa and a parent's permit are tracked side by side, and no one's deadline slips through because it lived only in someone's memory or a single passport.",
          },
          {
            h2: "How reminders help you not miss the date",
            body: "Once a visa has a \"valid until\" date attached, doki.help can send an email reminder before it expires — 30, 15, 7 and 1 day before that date, for every member of the family. That early warning gives you room to start a renewal on your own schedule, rather than discovering the deadline the week you need to travel.",
          },
          {
            h2: "How doki.help helps",
            body: "doki.help keeps your family's visas and documents in private storage, transferred over HTTPS, with access isolated to your family at the database level (row-level security) — only your family sees them. Roles let you decide who is owner, editor or viewer, two-factor login is available, and optional AI field recognition is off by default. It's in beta and doesn't replace your original documents — doki.help reminds and stores, it doesn't renew visas or give immigration advice.",
          },
        ],
        faqHeading: "FAQ",
        faq: [
          {
            q: "How early should I start renewing a visa?",
            a: "It depends entirely on the country and the visa type — some renewals take a day, others weeks or months. Give yourself a wide margin to gather documents, apply and wait, and check the official requirements of the destination country for exact timelines.",
          },
          {
            q: "Which visa dates should I keep track of?",
            a: "The visa's own expiry date, your permitted length of stay (sometimes shorter than the visa), and your passport's validity, since many countries require it to stay valid beyond your stay. The exact rules depend on the country.",
          },
          {
            q: "How will I be reminded before a visa expires?",
            a: "By email, before the \"valid until\" date you set on the visa. The reminder comes 30, 15, 7 and 1 day before that date, for every member of the family.",
          },
          {
            q: "Can I track visas for everyone in the family?",
            a: "Yes. Give each family member their own profile and store each visa with its expiry date, so a child's visa and a parent's permit are tracked side by side in one place.",
          },
          {
            q: "Does doki.help renew visas or give immigration advice?",
            a: "No. doki.help reminds and stores — it keeps your visas in one place and warns you before a deadline. For renewal steps and rules, check the official requirements of the destination country.",
          },
        ],
      },
      ru: {
        navLabel: "Срок действия визы",
        title: "Срок действия визы: как продлить вовремя",
        metaDescription:
          "Спокойный способ не пропустить срок визы: какие даты важны, за сколько начинать продление, как вести визы всей семьи и получать напоминания вовремя.",
        h1: "Срок действия визы: как не пропустить продление",
        intro:
          "Практичный способ держать срок визы под контролем — какие даты действительно важны, за сколько начинать продление и как хранить визы всех членов семьи в одном месте, чтобы срок находил вас заранее, а не заставал врасплох.",
        ctaPrimary: "Добавьте визу и настройте напоминание",
        sections: [
          {
            h2: "Почему срок визы легко упустить",
            body: "Срок визы легко упустить, потому что о нём ничего не напоминает. Вы получаете её один раз, уезжаете или обустраиваетесь, и дата тихо лежит в паспорте или в почте. Нет естественного момента, который подсказал бы, что срок близко, — и он всплывает в самый неподходящий момент, часто когда поездка или запись уже назначены. Решение — не заучивать дату, а хранить её вместе с документом и получать напоминание заранее.",
          },
          {
            h2: "Какие даты действительно важны",
            body: "У визы обычно не одна дата, и стоит понимать, за какими из них вы следите. Правила за ними зависят от страны, поэтому воспринимайте это как список того, что проверить, а не как универсальный ответ.",
            bullets: [
              "Дата окончания визы — когда сама виза перестаёт действовать",
              "Разрешённый срок пребывания — иногда короче срока действия визы",
              "Требования к паспорту — многие страны хотят, чтобы паспорт действовал ещё долго после пребывания",
            ],
          },
          {
            h2: "За сколько начинать продление",
            body: "Единого правильного ответа нет — за сколько начинать, полностью зависит от страны и типа визы. Одни продления быстрые, другие занимают недели или месяцы и требуют записи, документов и ожидания. Общий ориентир — оставить время собрать бумаги, подать заявление и дождаться оформления без спешки. doki.help не продлевает визы и не даёт миграционных консультаций, поэтому по срокам и шагам всегда сверяйтесь с официальными требованиями страны назначения.",
          },
          {
            h2: "Как вести визы всей семьи в одном месте",
            body: "Одну визу держать под контролем можно, визы всей семьи — каждая со своей датой и страной — уже нет. Заведите профиль на каждого — супруга, детей, родителей — и храните каждую визу с датой «действует до». Так виза ребёнка и разрешение родителя отслеживаются рядом, и ничей срок не теряется из-за того, что он жил только в чьей-то памяти или в одном паспорте.",
          },
          {
            h2: "Как напоминания помогают не пропустить дату",
            body: "Когда к визе привязана дата «действует до», doki.help может прислать email-напоминание до окончания срока — за 30, 15, 7 и 1 день до этой даты, для каждого члена семьи. Такое раннее предупреждение даёт время начать продление в удобном темпе, а не обнаружить срок на той неделе, когда нужно ехать.",
          },
          {
            h2: "Как помогает doki.help",
            body: "doki.help хранит визы и документы семьи в приватном хранилище, передаёт их по HTTPS, а доступ изолирован вашей семьёй на уровне базы (RLS) — документы видит только ваша семья. Роли позволяют решить, кто owner, editor или viewer, доступен двухфакторный вход, а опциональное AI-распознавание полей по умолчанию выключено. Сервис в стадии beta и не заменяет оригиналы документов — doki.help напоминает и хранит, но не продлевает визы и не даёт миграционных консультаций.",
          },
        ],
        faqHeading: "Частые вопросы",
        faq: [
          {
            q: "За сколько начинать продление визы?",
            a: "Это полностью зависит от страны и типа визы — одни продления занимают день, другие недели или месяцы. Берите широкий запас, чтобы собрать документы, подать и подождать, и сверяйтесь с официальными требованиями страны назначения по точным срокам.",
          },
          {
            q: "Какие даты визы держать под контролем?",
            a: "Дату окончания самой визы, разрешённый срок пребывания (иногда короче срока визы) и срок действия паспорта, ведь многие страны требуют, чтобы он действовал ещё после пребывания. Конкретные правила зависят от страны.",
          },
          {
            q: "Как придёт напоминание до окончания визы?",
            a: "На email, до указанной вами даты «действует до» на визе. Напоминание приходит за 30, 15, 7 и 1 день до этой даты, для каждого члена семьи.",
          },
          {
            q: "Можно вести визы для всех членов семьи?",
            a: "Да. Заведите профиль на каждого члена семьи и храните каждую визу с датой окончания, чтобы виза ребёнка и разрешение родителя отслеживались рядом, в одном месте.",
          },
          {
            q: "doki.help продлевает визы или даёт миграционные консультации?",
            a: "Нет. doki.help напоминает и хранит — держит визы в одном месте и предупреждает до срока. По шагам и правилам продления сверяйтесь с официальными требованиями страны назначения.",
          },
        ],
      },
      id: {
        navLabel: "Masa berlaku visa",
        title: "Masa Berlaku Visa: Cara Perpanjang Tepat Waktu",
        metaDescription:
          "Cara tenang agar tidak melewatkan tenggat visa: tanggal mana yang penting, kapan mulai memperpanjang, memantau visa seluruh keluarga, dan pengingat tepat waktu.",
        h1: "Masa berlaku visa: agar tidak melewatkan perpanjangan",
        intro:
          "Cara praktis untuk tetap unggul dari tenggat visa — tanggal mana yang benar-benar penting, seberapa awal mulai memperpanjang, dan cara menyimpan visa tiap anggota keluarga di satu tempat agar tenggat menghampiri Anda lebih awal, bukan mengejutkan.",
        ctaPrimary: "Tambahkan visa dan atur pengingat",
        sections: [
          {
            h2: "Mengapa tenggat visa mudah terlewat",
            body: "Visa mudah lepas dari pantauan karena tidak ada yang mengingatkan bahwa ia hampir habis. Anda mendapatkannya sekali, lalu bepergian atau menetap, dan tanggalnya diam-diam tersimpan di paspor atau email. Tidak ada momen alami yang mengatakan tenggat sudah dekat — jadi ia muncul di saat paling tidak tepat, sering ketika perjalanan atau janji sudah dipesan. Solusinya bukan menghafal tanggal, melainkan menyimpannya bersama dokumen dan membiarkan pengingat menghampiri Anda lebih awal.",
          },
          {
            h2: "Tanggal mana yang benar-benar penting",
            body: "Visa biasanya melibatkan lebih dari satu tanggal, dan penting mengetahui yang mana yang Anda pantau. Aturan di baliknya bergantung pada negara, jadi anggap ini sebagai daftar hal yang perlu diperiksa, bukan jawaban universal.",
            bullets: [
              "Tanggal habis visa itu sendiri — kapan visa berhenti berlaku",
              "Lama tinggal yang diizinkan — kadang lebih pendek dari masa berlaku visa",
              "Persyaratan paspor — banyak negara ingin paspor berlaku jauh melewati masa tinggal",
            ],
          },
          {
            h2: "Seberapa awal mulai memperpanjang",
            body: "Tidak ada satu jawaban yang benar — seberapa awal Anda mulai sepenuhnya bergantung pada negara dan jenis visa. Sebagian perpanjangan cepat; lainnya makan waktu berminggu-minggu atau berbulan-bulan dan perlu janji temu, dokumen, serta menunggu. Sebagai patokan, beri diri Anda cukup waktu untuk menyiapkan berkas, mengajukan, dan menunggu proses tanpa tekanan. doki.help tidak memperpanjang visa atau memberi nasihat imigrasi, jadi untuk jadwal dan langkahnya selalu periksa persyaratan resmi negara tujuan.",
          },
          {
            h2: "Menyimpan visa seluruh keluarga di satu tempat",
            body: "Satu visa masih bisa dikelola; visa satu keluarga, masing-masing dengan tanggal dan negaranya sendiri, tidak. Beri tiap anggota profilnya sendiri — pasangan, anak, orang tua — dan simpan tiap visa dengan tanggal \"berlaku sampai\". Dengan begitu visa anak dan izin orang tua terpantau berdampingan, dan tidak ada tenggat yang lolos hanya karena ia tersimpan di ingatan satu orang atau di satu paspor.",
          },
          {
            h2: "Bagaimana pengingat membantu Anda tidak melewatkan tanggal",
            body: "Setelah visa punya tanggal \"berlaku sampai\", doki.help bisa mengirim pengingat email sebelum kedaluwarsa — 30, 15, 7, dan 1 hari sebelum tanggal itu, untuk tiap anggota keluarga. Peringatan dini itu memberi ruang untuk mulai memperpanjang sesuai jadwal Anda, bukan menemukan tenggat di minggu Anda harus bepergian.",
          },
          {
            h2: "Bagaimana doki.help membantu",
            body: "doki.help menyimpan visa dan dokumen keluarga di penyimpanan privat, ditransfer lewat HTTPS, dengan akses diisolasi untuk keluarga Anda di tingkat basis data (row-level security) — hanya keluarga Anda yang melihatnya. Peran menentukan siapa owner, editor, atau viewer, login dua faktor tersedia, dan pengenalan bidang AI opsional mati secara default. Masih beta dan tidak menggantikan dokumen asli Anda — doki.help mengingatkan dan menyimpan, bukan memperpanjang visa atau memberi nasihat imigrasi.",
          },
        ],
        faqHeading: "Pertanyaan umum",
        faq: [
          {
            q: "Seberapa awal sebaiknya mulai memperpanjang visa?",
            a: "Itu sepenuhnya bergantung pada negara dan jenis visa — sebagian perpanjangan selesai sehari, lainnya berminggu-minggu atau berbulan-bulan. Beri margin lebar untuk menyiapkan dokumen, mengajukan, dan menunggu, serta periksa persyaratan resmi negara tujuan untuk jadwal pastinya.",
          },
          {
            q: "Tanggal visa mana yang harus dipantau?",
            a: "Tanggal habis visa itu sendiri, lama tinggal yang diizinkan (kadang lebih pendek dari visa), dan masa berlaku paspor, karena banyak negara mensyaratkannya tetap berlaku setelah masa tinggal. Aturan pastinya bergantung pada negara.",
          },
          {
            q: "Bagaimana pengingat sebelum visa habis datang?",
            a: "Lewat email, sebelum tanggal \"berlaku sampai\" yang Anda tetapkan pada visa. Pengingat datang 30, 15, 7, dan 1 hari sebelum tanggal itu, untuk tiap anggota keluarga.",
          },
          {
            q: "Bisakah memantau visa untuk semua anggota keluarga?",
            a: "Bisa. Beri tiap anggota keluarga profilnya sendiri dan simpan tiap visa dengan tanggal habisnya, agar visa anak dan izin orang tua terpantau berdampingan di satu tempat.",
          },
          {
            q: "Apakah doki.help memperpanjang visa atau memberi nasihat imigrasi?",
            a: "Tidak. doki.help mengingatkan dan menyimpan — menjaga visa di satu tempat dan memperingatkan sebelum tenggat. Untuk langkah dan aturan perpanjangan, periksa persyaratan resmi negara tujuan.",
          },
        ],
      },
      uz: {
        navLabel: "Viza muddati",
        title: "Viza muddati: qanday oʻz vaqtida yangilash",
        metaDescription:
          "Viza muddatini oʻtkazib yubormaslikning sokin yoʻli: qaysi sanalar muhim, yangilashni qachon boshlash, butun oila vizalarini yuritish va oʻz vaqtida eslatma olish.",
        h1: "Viza muddati: yangilashni qanday oʻtkazib yubormaslik",
        intro:
          "Viza muddatini nazoratda ushlashning amaliy yoʻli — qaysi sanalar chindan muhim, yangilashni qancha oldin boshlash va har bir oila aʼzosining vizasini bitta joyda saqlash, toki muddat sizni kutilmaganda emas, oldindan topsin.",
        ctaPrimary: "Vizani qoʻshing va eslatma sozlang",
        sections: [
          {
            h2: "Nega viza muddatini oson oʻtkazib yuboriladi",
            body: "Viza muddatini oson oʻtkazib yuboriladi, chunki uning tugayotgani haqida hech narsa eslatmaydi. Uni bir marta olasiz, safarga chiqasiz yoki joylashib olasiz, sana esa jimgina pasportda yoki pochtada yotadi. Muddat yaqinlashganini aytadigan tabiiy lahza yoʻq — shu bois u eng nomaqbul paytda, koʻpincha safar yoki qabul allaqachon belgilangan chogʻda paydo boʻladi. Yechim — sanani yodlash emas, uni hujjat bilan birga saqlash va eslatma sizni oldindan topishiga yoʻl qoʻyish.",
          },
          {
            h2: "Qaysi sanalar chindan muhim",
            body: "Vizada odatda bittadan koʻp sana boʻladi, va qaysilarini kuzatayotganingizni bilish muhim. Ular ortidagi qoidalar davlatga bogʻliq, shuning uchun buni universal javob emas, tekshirish kerak boʻlgan roʻyxat sifatida qabul qiling.",
            bullets: [
              "Vizaning oʻz tugash sanasi — viza qachon amal qilishdan toʻxtaydi",
              "Ruxsat etilgan turish muddati — baʼzida viza amal muddatidan qisqaroq",
              "Pasportga talablar — koʻp davlatlar pasport turishdan keyin ham uzoq amal qilishini xohlaydi",
            ],
          },
          {
            h2: "Yangilashni qancha oldin boshlash kerak",
            body: "Yagona toʻgʻri javob yoʻq — qancha oldin boshlash butunlay davlat va viza turiga bogʻliq. Baʼzi yangilashlar tez, boshqalari haftalar yoki oylar oladi va qabul, hujjatlar hamda kutishni talab qiladi. Umumiy moʻljal — qogʻozlarni yigʻish, ariza berish va rasmiylashtirishni shoshilmasdan kutish uchun yetarli vaqt qoldiring. doki.help vizalarni yangilamaydi va migratsiya boʻyicha maslahat bermaydi, shuning uchun muddatlar va qadamlar boʻyicha har doim borar davlatning rasmiy talablarini tekshiring.",
          },
          {
            h2: "Butun oila vizalarini bitta joyda yuritish",
            body: "Bitta vizani nazoratda tutsa boʻladi, oilaning vizalarini — har biri oʻz sanasi va davlati bilan — endi yoʻq. Har bir aʼzoga oʻz profilini bering — turmush oʻrtogʻingiz, bolalar, ota-onangiz — va har bir vizani \"amal qiladi\" sanasi bilan saqlang. Shunda bolaning vizasi va ota-onaning ruxsatnomasi yonma-yon kuzatiladi, hech kimning muddati faqat birovning xotirasida yoki bitta pasportda yashagani uchun oʻtib ketmaydi.",
          },
          {
            h2: "Eslatmalar sanani oʻtkazib yubormaslikka qanday yordam beradi",
            body: "Vizaga \"amal qiladi\" sanasi biriktirilgach, doki.help muddat tugashidan oldin email eslatma yuborishi mumkin — shu sanadan 30, 15, 7 va 1 kun oldin, har bir oila aʼzosi uchun. Bu erta ogohlantirish yangilashni oʻz sur'atingizda boshlashga imkon beradi, muddatni esa aynan safar kerak boʻlgan haftada bilib qolmaysiz.",
          },
          {
            h2: "doki.help qanday yordam beradi",
            body: "doki.help oila vizalari va hujjatlarini maxfiy omborda saqlaydi, HTTPS orqali uzatadi, kirish esa maʼlumotlar bazasi darajasida oilangiz bilan izolyatsiya qilingan (RLS) — hujjatlarni faqat oilangiz koʻradi. Rollar kim owner, editor yoki viewer ekanini belgilaydi, ikki bosqichli kirish mavjud, ixtiyoriy AI maydon tanish esa sukut boʻyicha oʻchiq. U beta bosqichida va asl hujjatlaringiz oʻrnini bosmaydi — doki.help eslatadi va saqlaydi, vizalarni yangilamaydi va migratsiya boʻyicha maslahat bermaydi.",
          },
        ],
        faqHeading: "Tez-tez beriladigan savollar",
        faq: [
          {
            q: "Vizani yangilashni qancha oldin boshlash kerak?",
            a: "Bu butunlay davlat va viza turiga bogʻliq — baʼzi yangilashlar bir kunda, boshqalari haftalar yoki oylar oladi. Hujjat yigʻish, ariza berish va kutish uchun keng zaxira oling, aniq muddatlar boʻyicha borar davlatning rasmiy talablarini tekshiring.",
          },
          {
            q: "Vizaning qaysi sanalarini kuzatish kerak?",
            a: "Vizaning oʻz tugash sanasini, ruxsat etilgan turish muddatini (baʼzida vizadan qisqaroq) va pasport amal muddatini, chunki koʻp davlatlar u turishdan keyin ham amal qilishini talab qiladi. Aniq qoidalar davlatga bogʻliq.",
          },
          {
            q: "Viza tugashidan oldin eslatma qanday keladi?",
            a: "Email orqali, vizada siz belgilagan \"amal qiladi\" sanasidan oldin. Eslatma shu sanadan 30, 15, 7 va 1 kun oldin keladi, har bir oila aʼzosi uchun.",
          },
          {
            q: "Vizalarni oilaning barcha aʼzolari uchun yuritsa boʻladimi?",
            a: "Ha. Har bir oila aʼzosiga oʻz profilini bering va har bir vizani tugash sanasi bilan saqlang, shunda bolaning vizasi va ota-onaning ruxsatnomasi bitta joyda yonma-yon kuzatiladi.",
          },
          {
            q: "doki.help vizalarni yangiladimi yoki migratsiya maslahatini beradimi?",
            a: "Yoʻq. doki.help eslatadi va saqlaydi — vizalarni bitta joyda ushlaydi va muddatdan oldin ogohlantiradi. Yangilash qadamlari va qoidalari boʻyicha borar davlatning rasmiy talablarini tekshiring.",
          },
        ],
      },
    },
    related: {
      en: [
        { href: "/visa-expiry-reminder", label: "Visa expiry reminders" },
        { href: "/document-expiry-reminder", label: "Document expiry reminders" },
      ],
      ru: [
        { href: "/visa-expiry-reminder", label: "Напоминания о сроке визы" },
        { href: "/document-expiry-reminder", label: "Напоминания о сроках документов" },
      ],
      id: [
        { href: "/visa-expiry-reminder", label: "Pengingat masa berlaku visa" },
        { href: "/document-expiry-reminder", label: "Pengingat masa berlaku dokumen" },
      ],
      uz: [
        { href: "/visa-expiry-reminder", label: "Viza muddati eslatmalari" },
        { href: "/document-expiry-reminder", label: "Hujjat muddati eslatmalari" },
      ],
    },
  },
  "how-to-track-insurance-policy-expiry": {
    slug: "how-to-track-insurance-policy-expiry",
    emoji: "🛡️",
    locales: {
      en: {
        navLabel: "Track insurance expiry",
        title: "How to Track Insurance Policy Expiry Dates",
        metaDescription:
          "A calm way to keep every family insurance policy renewed on time: which policies to watch, which dates to record, and how reminders reach you early.",
        h1: "How to track insurance policy expiry for the whole family",
        intro:
          "A practical way to keep track of when your family's insurance policies lapse — which ones to watch, which dates to record, and how a reminder can reach you before a policy quietly expires.",
        ctaPrimary: "Add a policy and set a reminder",
        sections: [
          {
            h2: "Why policies expire without you noticing",
            body: "Insurance rarely tells you it's about to lapse. A car policy runs for a year, health cover renews on a date you set once and forgot, travel insurance ends the day after you land, home cover sits in an email you can't find. There's no natural nudge before the coverage stops — so a gap in protection often surfaces exactly when you need to claim. The fix isn't to memorise dates; it's to store each policy's end date with the policy and let a reminder reach you early.",
          },
          {
            h2: "Which policies are worth keeping an eye on",
            body: "Not every document expires, but insurance almost always renews on a fixed date — and these are the ones worth tracking first.",
            bullets: [
              "Car and motor insurance",
              "Health and medical insurance",
              "Travel insurance for upcoming trips",
              "Home and property insurance",
              "Life or accident cover with a renewal date",
            ],
          },
          {
            h2: "Which dates to record",
            body: "For each policy, note where coverage starts, when it ends, and the renewal date if it differs from the end date. The date that matters most for reminders is the \"valid until\" date — the point after which you're no longer covered. Some policies renew automatically and some don't, and grace periods vary, so check your policy documents or your insurer for how yours works.",
          },
          {
            h2: "Gathering the whole family's policies in one place",
            body: "One person's policies are manageable; a family's spread across cars, health, travel and home are not. Give each member their own profile — partner, children, parents — and store each policy with its \"valid until\" date, so a child's health cover and a parent's car policy are tracked side by side instead of scattered across inboxes and glove boxes.",
          },
          {
            h2: "How reminders help you renew on time",
            body: "Once a policy has an end date attached, doki.help can send an email reminder before it lapses — for every member of the family. The reminder comes 30, 15, 7 and 1 day before that date, so you have time to compare options, contact your insurer and renew calmly rather than discovering a gap after it's opened.",
          },
          {
            h2: "How doki.help helps",
            body: "doki.help keeps your family's policies in private storage, transferred over HTTPS, with access isolated to your family at the database level (row-level security) — only your family sees them. Add each policy's \"valid until\" date and reminders arrive 30, 15, 7 and 1 day before. Roles decide who is owner, editor or viewer, two-factor login is available, and optional AI field recognition is off by default. doki.help stores your policies and reminds you about dates — it doesn't sell or advise on insurance. It's in beta and doesn't replace your original documents.",
          },
        ],
        faqHeading: "FAQ",
        faq: [
          {
            q: "Which insurance policies should I track first?",
            a: "Start with the ones that renew on a fixed date and are costly to let lapse: car, health, travel and home insurance, plus any life or accident cover with a renewal date. Add the rest over time.",
          },
          {
            q: "Which dates should I record for a policy?",
            a: "The start of coverage, the end date, and the renewal date if it differs. The end or \"valid until\" date is what reminders are based on. Check your policy documents or insurer for how renewal and any grace period work.",
          },
          {
            q: "How will I be reminded before a policy expires?",
            a: "By email, before the \"valid until\" date you set on each policy. The reminder comes 30, 15, 7 and 1 day before that date.",
          },
          {
            q: "Can I track policies for everyone in the family?",
            a: "Yes. Give each family member their own profile and store each policy with its expiry date, so a child's health cover and a parent's car policy are tracked side by side in one place.",
          },
          {
            q: "Does doki.help sell or recommend insurance?",
            a: "No. doki.help stores your policies and reminds you about their dates. It doesn't sell insurance or advise which policy to choose — for that, speak to your insurer.",
          },
        ],
      },
      ru: {
        navLabel: "Сроки страховок",
        title: "Как отслеживать срок действия страхового полиса",
        metaDescription:
          "Спокойный способ продлевать страховки семьи вовремя: какие полисы контролировать, какие даты фиксировать и как напоминания приходят заранее.",
        h1: "Как отслеживать срок действия страхового полиса для всей семьи",
        intro:
          "Практичный способ следить за тем, когда истекают страховки семьи — какие держать под контролем, какие даты фиксировать и как напоминание может прийти до того, как полис тихо закончится.",
        ctaPrimary: "Добавьте полис и настройте напоминание",
        sections: [
          {
            h2: "Почему полисы истекают незаметно",
            body: "Страховка редко предупреждает, что скоро закончится. Полис на авто действует год, медицинская страховка продлевается в дату, которую вы задали однажды и забыли, туристическая заканчивается на следующий день после возвращения, страховка жилья лежит в письме, которое не найти. Естественного сигнала перед окончанием покрытия нет — поэтому пробел в защите всплывает именно тогда, когда нужно обращаться за выплатой. Решение — не заучивать даты, а хранить дату окончания вместе с полисом и получать напоминание заранее.",
          },
          {
            h2: "Какие полисы стоит держать под контролем",
            body: "Истекает не всё, но страховки почти всегда продлеваются в фиксированную дату — и именно их стоит отслеживать в первую очередь.",
            bullets: [
              "Автострахование (ОСАГО, КАСКО и подобные)",
              "Медицинская страховка",
              "Туристическая страховка на предстоящие поездки",
              "Страхование жилья и имущества",
              "Страхование жизни или от несчастного случая с датой продления",
            ],
          },
          {
            h2: "Какие даты фиксировать",
            body: "По каждому полису отметьте, когда начинается покрытие, когда оно заканчивается и дату продления, если она отличается от даты окончания. Для напоминаний важнее всего дата «действует до» — момент, после которого покрытия уже нет. Одни полисы продлеваются автоматически, другие нет, а льготные периоды различаются, поэтому уточняйте в документах полиса или у страховщика, как устроен ваш.",
          },
          {
            h2: "Как собрать полисы всей семьи в одном месте",
            body: "Полисы одного человека держать под контролем ещё можно, но страховки семьи — по авто, медицине, поездкам и жилью — уже нет. Заведите профиль на каждого — супруга, детей, родителей — и храните каждый полис с датой «действует до», чтобы медицинская страховка ребёнка и автополис родителя отслеживались рядом, а не были разбросаны по почте и бардачку.",
          },
          {
            h2: "Как напоминания помогают продлить вовремя",
            body: "Когда к полису привязана дата окончания, doki.help может прислать email-напоминание до окончания срока — для каждого члена семьи. Напоминание приходит за 30, 15, 7 и 1 день до этой даты, чтобы вы успели сравнить варианты, связаться со страховщиком и спокойно продлить, а не обнаружить пробел уже после того, как он появился.",
          },
          {
            h2: "Как помогает doki.help",
            body: "doki.help хранит полисы семьи в приватном хранилище, передаёт их по HTTPS, а доступ изолирован вашей семьёй на уровне базы (RLS) — полисы видит только ваша семья. Укажите дату «действует до» по каждому полису — и напоминания придут за 30, 15, 7 и 1 день. Роли определяют, кто owner, editor или viewer, доступен двухфакторный вход, а опциональное AI-распознавание полей по умолчанию выключено. doki.help хранит полисы и напоминает о датах — он не продаёт страховки и не консультирует по ним. Сервис в стадии beta и не заменяет оригиналы документов.",
          },
        ],
        faqHeading: "Частые вопросы",
        faq: [
          {
            q: "Какие страховки отслеживать в первую очередь?",
            a: "Те, что продлеваются в фиксированную дату и дорого обходятся, если их упустить: авто, медицинская, туристическая, страховка жилья, а также страхование жизни или от несчастного случая с датой продления. Остальное добавляйте постепенно.",
          },
          {
            q: "Какие даты фиксировать по полису?",
            a: "Начало покрытия, дату окончания и дату продления, если она отличается. Напоминания строятся на дате окончания, «действует до». Как работает продление и льготный период, уточняйте в документах полиса или у страховщика.",
          },
          {
            q: "Как придёт напоминание до окончания полиса?",
            a: "На email, до указанной вами даты «действует до» на каждом полисе. Напоминание приходит за 30, 15, 7 и 1 день до этой даты.",
          },
          {
            q: "Можно отслеживать полисы для всех членов семьи?",
            a: "Да. Заведите профиль на каждого члена семьи и храните каждый полис с датой окончания, чтобы медицинская страховка ребёнка и автополис родителя отслеживались рядом, в одном месте.",
          },
          {
            q: "doki.help продаёт страховки или советует, какую выбрать?",
            a: "Нет. doki.help хранит ваши полисы и напоминает об их датах. Он не продаёт страховки и не советует, какой полис выбрать — с этим обращайтесь к страховщику.",
          },
        ],
      },
      id: {
        navLabel: "Pantau masa asuransi",
        title: "Cara Memantau Masa Berlaku Polis Asuransi",
        metaDescription:
          "Cara tenang memperpanjang asuransi keluarga tepat waktu: polis mana yang dipantau, tanggal apa yang dicatat, dan bagaimana pengingat datang lebih awal.",
        h1: "Cara memantau masa berlaku polis asuransi untuk seluruh keluarga",
        intro:
          "Cara praktis memantau kapan asuransi keluarga berakhir — mana yang perlu diawasi, tanggal apa yang dicatat, dan bagaimana pengingat bisa datang sebelum polis diam-diam habis.",
        ctaPrimary: "Tambahkan polis dan atur pengingat",
        sections: [
          {
            h2: "Mengapa polis habis tanpa Anda sadari",
            body: "Asuransi jarang memberi tahu bahwa ia hampir habis. Polis mobil berlaku setahun, asuransi kesehatan diperpanjang pada tanggal yang Anda tetapkan sekali lalu lupa, asuransi perjalanan berakhir sehari setelah Anda mendarat, asuransi rumah tersimpan di email yang sulit ditemukan. Tidak ada dorongan alami sebelum perlindungan berhenti — jadi celah proteksi sering muncul tepat saat Anda perlu mengajukan klaim. Solusinya bukan menghafal tanggal, melainkan menyimpan tanggal berakhir bersama polisnya dan membiarkan pengingat menghampiri Anda lebih awal.",
          },
          {
            h2: "Polis mana yang layak diawasi",
            body: "Tidak semua dokumen kedaluwarsa, tetapi asuransi hampir selalu diperpanjang pada tanggal tetap — dan inilah yang layak dipantau lebih dulu.",
            bullets: [
              "Asuransi mobil dan kendaraan",
              "Asuransi kesehatan dan medis",
              "Asuransi perjalanan untuk perjalanan mendatang",
              "Asuransi rumah dan properti",
              "Asuransi jiwa atau kecelakaan dengan tanggal perpanjangan",
            ],
          },
          {
            h2: "Tanggal apa yang perlu dicatat",
            body: "Untuk tiap polis, catat kapan perlindungan mulai, kapan berakhir, dan tanggal perpanjangan bila berbeda dari tanggal berakhir. Tanggal yang paling penting untuk pengingat adalah tanggal \"berlaku sampai\" — titik setelahnya Anda tidak lagi terlindungi. Sebagian polis diperpanjang otomatis dan sebagian tidak, dan masa tenggangnya berbeda-beda, jadi periksa dokumen polis Anda atau tanyakan ke penanggung tentang cara kerja milik Anda.",
          },
          {
            h2: "Mengumpulkan polis seluruh keluarga di satu tempat",
            body: "Polis satu orang masih bisa dikelola; polis satu keluarga yang tersebar di mobil, kesehatan, perjalanan, dan rumah tidak. Beri tiap anggota profilnya sendiri — pasangan, anak, orang tua — dan simpan tiap polis dengan tanggal \"berlaku sampai\", agar asuransi kesehatan anak dan polis mobil orang tua terpantau berdampingan, bukan tersebar di email dan laci mobil.",
          },
          {
            h2: "Bagaimana pengingat membantu memperpanjang tepat waktu",
            body: "Setelah polis punya tanggal berakhir, doki.help bisa mengirim pengingat email sebelum ia habis — untuk tiap anggota keluarga. Pengingat datang 30, 15, 7, dan 1 hari sebelum tanggal itu, sehingga Anda punya waktu membandingkan pilihan, menghubungi penanggung, dan memperpanjang dengan tenang, bukan menemukan celah setelah ia terbuka.",
          },
          {
            h2: "Bagaimana doki.help membantu",
            body: "doki.help menyimpan polis keluarga di penyimpanan privat, ditransfer lewat HTTPS, dengan akses diisolasi untuk keluarga Anda di tingkat basis data (row-level security) — hanya keluarga Anda yang melihatnya. Isi tanggal \"berlaku sampai\" tiap polis dan pengingat datang 30, 15, 7, dan 1 hari sebelumnya. Peran menentukan siapa owner, editor, atau viewer, login dua faktor tersedia, dan pengenalan bidang AI opsional mati secara default. doki.help menyimpan polis dan mengingatkan tanggalnya — ia tidak menjual atau menasihati soal asuransi. Masih beta dan tidak menggantikan dokumen asli Anda.",
          },
        ],
        faqHeading: "Pertanyaan umum",
        faq: [
          {
            q: "Polis asuransi mana yang harus dipantau lebih dulu?",
            a: "Mulai dari yang diperpanjang pada tanggal tetap dan mahal bila dibiarkan habis: asuransi mobil, kesehatan, perjalanan, dan rumah, ditambah asuransi jiwa atau kecelakaan dengan tanggal perpanjangan. Tambahkan sisanya seiring waktu.",
          },
          {
            q: "Tanggal apa yang perlu dicatat untuk sebuah polis?",
            a: "Awal perlindungan, tanggal berakhir, dan tanggal perpanjangan bila berbeda. Pengingat didasarkan pada tanggal berakhir, \"berlaku sampai\". Periksa dokumen polis atau penanggung untuk cara kerja perpanjangan dan masa tenggang.",
          },
          {
            q: "Bagaimana pengingat sebelum polis habis datang?",
            a: "Lewat email, sebelum tanggal \"berlaku sampai\" yang Anda tetapkan pada tiap polis. Pengingat datang 30, 15, 7, dan 1 hari sebelum tanggal itu.",
          },
          {
            q: "Bisakah memantau polis untuk semua anggota keluarga?",
            a: "Bisa. Beri tiap anggota keluarga profilnya sendiri dan simpan tiap polis dengan tanggal berakhirnya, agar asuransi kesehatan anak dan polis mobil orang tua terpantau berdampingan di satu tempat.",
          },
          {
            q: "Apakah doki.help menjual atau merekomendasikan asuransi?",
            a: "Tidak. doki.help menyimpan polis Anda dan mengingatkan tanggalnya. Ia tidak menjual asuransi atau menyarankan polis mana yang dipilih — untuk itu, hubungi penanggung Anda.",
          },
        ],
      },
      uz: {
        navLabel: "Sugʻurta muddatlari",
        title: "Sugʻurta polisi muddatini qanday kuzatish",
        metaDescription:
          "Oila sugʻurtalarini oʻz vaqtida yangilashning sokin yoʻli: qaysi polislarni nazorat qilish, qaysi sanalarni belgilash va eslatmalar qanday oldindan keladi.",
        h1: "Butun oila uchun sugʻurta polisi muddatini qanday kuzatish",
        intro:
          "Oila sugʻurtalari qachon tugashini kuzatishning amaliy yoʻli — qaysilarini nazorat qilish, qaysi sanalarni belgilash va polis jimgina tugashidan oldin eslatma qanday kelishi mumkinligi.",
        ctaPrimary: "Polis qoʻshing va eslatma sozlang",
        sections: [
          {
            h2: "Nega polislar sezilmay tugaydi",
            body: "Sugʻurta tugashidan oldin kamdan-kam ogohlantiradi. Avto polisi bir yil amal qiladi, tibbiy sugʻurta siz bir marta qoʻyib unutgan sanada yangilanadi, turistik sugʻurta qaytganingizdan keyingi kuni tugaydi, uy sugʻurtasi topib boʻlmaydigan xatda yotadi. Himoya toʻxtashidan oldin tabiiy ishora yoʻq — shu bois himoyadagi boʻshliq aynan daʼvo qilish kerak boʻlgan paytda paydo boʻladi. Yechim — sanalarni yodlash emas, tugash sanasini polis bilan birga saqlash va eslatma sizni oldindan topishiga yoʻl qoʻyish.",
          },
          {
            h2: "Qaysi polislarni nazorat qilgan maʼqul",
            body: "Hammasi tugamaydi, lekin sugʻurtalar deyarli doim belgilangan sanada yangilanadi — va aynan ularni birinchi navbatda kuzatish kerak.",
            bullets: [
              "Avto va transport sugʻurtasi",
              "Tibbiy sugʻurta",
              "Yaqin safarlar uchun turistik sugʻurta",
              "Uy va mulk sugʻurtasi",
              "Yangilash sanasi bor hayot yoki baxtsiz hodisa sugʻurtasi",
            ],
          },
          {
            h2: "Qaysi sanalarni belgilash kerak",
            body: "Har bir polis boʻyicha qoplama qachon boshlanishini, qachon tugashini va tugash sanasidan farq qilsa, yangilash sanasini belgilang. Eslatmalar uchun eng muhimi — \"amal qiladi\" sanasi, undan keyin siz endi himoyalanmaysiz. Baʼzi polislar avtomatik yangilanadi, baʼzilari yoʻq, imtiyozli muddatlar ham farq qiladi, shuning uchun sizniki qanday ishlashini polis hujjatlaringizdan yoki sugʻurtachidan aniqlang.",
          },
          {
            h2: "Butun oila polislarini bitta joyga yigʻish",
            body: "Bir kishining polislarini nazorat qilsa boʻladi, oilaning avto, tibbiyot, safar va uy boʻyicha tarqoq sugʻurtalarini esa — yoʻq. Har bir aʼzoga oʻz profilini bering — turmush oʻrtogʻingiz, bolalar, ota-onangiz — va har bir polisni \"amal qiladi\" sanasi bilan saqlang, shunda bolaning tibbiy sugʻurtasi va ota-onaning avto polisi pochta va bardachokda tarqalib emas, yonma-yon kuzatiladi.",
          },
          {
            h2: "Eslatmalar oʻz vaqtida yangilashga qanday yordam beradi",
            body: "Polisga tugash sanasi biriktirilgach, doki.help u tugashidan oldin email eslatma yuborishi mumkin — har bir oila aʼzosi uchun. Eslatma shu sanadan 30, 15, 7 va 1 kun oldin keladi, shunda variantlarni solishtirish, sugʻurtachi bilan bogʻlanish va boʻshliq ochilgandan keyin bilib qolish emas, xotirjam yangilashga vaqtingiz boʻladi.",
          },
          {
            h2: "doki.help qanday yordam beradi",
            body: "doki.help oila polislarini maxfiy omborda saqlaydi, HTTPS orqali uzatadi, kirish esa maʼlumotlar bazasi darajasida oilangiz bilan izolyatsiya qilingan (RLS) — polislarni faqat oilangiz koʻradi. Har bir polisga \"amal qiladi\" sanasini kiriting — eslatmalar 30, 15, 7 va 1 kun oldin keladi. Rollar kim owner, editor yoki viewer ekanini belgilaydi, ikki bosqichli kirish mavjud, ixtiyoriy AI maydon tanish esa sukut boʻyicha oʻchiq. doki.help polislarni saqlaydi va sanalar haqida eslatadi — u sugʻurta sotmaydi va u boʻyicha maslahat bermaydi. U beta bosqichida va asl hujjatlaringiz oʻrnini bosmaydi.",
          },
        ],
        faqHeading: "Tez-tez beriladigan savollar",
        faq: [
          {
            q: "Qaysi sugʻurta polislarini birinchi navbatda kuzatish kerak?",
            a: "Belgilangan sanada yangilanadigan va tugab ketsa qimmatga tushadiganlaridan boshlang: avto, tibbiy, turistik va uy sugʻurtasi, shuningdek yangilash sanasi bor hayot yoki baxtsiz hodisa sugʻurtasi. Qolganini asta qoʻshib boring.",
          },
          {
            q: "Polis boʻyicha qaysi sanalarni belgilash kerak?",
            a: "Qoplamaning boshlanishi, tugash sanasi va farq qilsa, yangilash sanasi. Eslatmalar tugash, \"amal qiladi\" sanasiga asoslanadi. Yangilash va imtiyozli muddat qanday ishlashini polis hujjatlaringizdan yoki sugʻurtachidan tekshiring.",
          },
          {
            q: "Polis tugashidan oldin eslatma qanday keladi?",
            a: "Email orqali, har bir polisda siz belgilagan \"amal qiladi\" sanasidan oldin. Eslatma shu sanadan 30, 15, 7 va 1 kun oldin keladi.",
          },
          {
            q: "Polislarni oilaning barcha aʼzolari uchun kuzatsa boʻladimi?",
            a: "Ha. Har bir oila aʼzosiga oʻz profilini bering va har bir polisni tugash sanasi bilan saqlang, shunda bolaning tibbiy sugʻurtasi va ota-onaning avto polisi bitta joyda yonma-yon kuzatiladi.",
          },
          {
            q: "doki.help sugʻurta sotadimi yoki tavsiya qiladimi?",
            a: "Yoʻq. doki.help polislaringizni saqlaydi va ularning sanalari haqida eslatadi. U sugʻurta sotmaydi va qaysi polisni tanlashni maslahat bermaydi — buning uchun sugʻurtachingizga murojaat qiling.",
          },
        ],
      },
    },
    related: {
      en: [
        { href: "/document-expiry-reminder", label: "Document expiry reminders" },
        { href: "/medical-document-organizer", label: "Medical document organizer" },
      ],
      ru: [
        { href: "/document-expiry-reminder", label: "Напоминания о сроках документов" },
        { href: "/medical-document-organizer", label: "Организация медицинских документов" },
      ],
      id: [
        { href: "/document-expiry-reminder", label: "Pengingat masa berlaku dokumen" },
        { href: "/medical-document-organizer", label: "Penata dokumen medis" },
      ],
      uz: [
        { href: "/document-expiry-reminder", label: "Hujjat muddati eslatmalari" },
        { href: "/medical-document-organizer", label: "Tibbiy hujjatlarni tartiblash" },
      ],
    },
  },
  "how-to-store-elderly-parents-documents": {
    slug: "how-to-store-elderly-parents-documents",
    emoji: "👵",
    locales: {
      en: {
        navLabel: "Elderly parents' documents",
        title: "How to Store Elderly Parents' Documents Safely",
        metaDescription:
          "A calm, respectful way to keep your elderly parents' documents in one place: what to gather, sort by person, add expiry dates, set reminders and share gently.",
        h1: "How to store elderly parents' documents",
        intro:
          "A warm, practical way to bring your parents' important documents into one place — sorted by person, with expiry dates and reminders — so that in the moment they're needed, the whole family can find them calmly.",
        ctaPrimary: "Gather your parents' documents in one place",
        sections: [
          {
            h2: "Why this matters",
            body: "As parents get older, their documents matter more and are often harder to locate — a policy in a drawer, an ID in a handbag, a prescription slip nobody can find. The moment you need one is rarely a calm one: a clinic visit, a renewal, a form to fill in. Having everything in one place means that when a document is suddenly needed, any family member can reach it without turning the house upside down.",
          },
          {
            h2: "Which documents to gather",
            body: "You don't need to collect everything at once. Start with the documents your parents reach for most, and add the rest gradually.",
            bullets: [
              "Identity: passports, ID cards, residence permits, pension documents",
              "Medical and prescriptions: insurance, prescription lists, key reports and referrals",
              "Insurance: health, life, home and other policies",
              "Important contacts: doctors, insurers, a trusted relative or neighbour",
              "Financial: bank details, pension and benefit paperwork, key contracts",
            ],
          },
          {
            h2: "Organize by person and category",
            body: "Give each parent their own profile and keep their documents together, sorted into simple categories like identity, medical and financial. That way you always know where to look, mother's papers don't get mixed up with father's, and anyone helping out can find the right document quickly. In doki.help you can organize documents by family member from the start.",
          },
          {
            h2: "Give loved ones access, gently",
            body: "Caring for parents is usually a shared effort, so more than one person may need to reach these documents. Roles let you decide that carefully: an owner or editor can add and update documents, while a viewer can only look. So a sibling who helps with appointments can see what's needed without being able to change anything, and you stay in control of who does what.",
          },
          {
            h2: "Mark deadlines and get reminders",
            body: "Policies, IDs and permits quietly expire, and for older parents a lapsed document can mean a missed appointment or a gap in cover. As you add each one, set its \"valid until\" date so the deadline lives with the document. doki.help then sends an email reminder 30, 15, 7 and 1 day before that date. Renewal rules differ by country and document, so for anything official, check the official requirements or consult a professional.",
          },
          {
            h2: "How doki.help helps",
            body: "doki.help keeps your parents' documents in private storage, transferred over HTTPS, with access isolated to your family at the database level (row-level security) — only your family sees them. Roles let you decide who can view and who can edit, two-factor login is available, and when you need to send one document to a clinic or relative you can share a link that expires and can be revoked at any time, with a view limit and a log of every open — the recipient needs no account. Optional AI field recognition is off by default. It's in beta and doesn't replace your original documents.",
          },
        ],
        faqHeading: "FAQ",
        faq: [
          {
            q: "Which of my parents' documents should I store first?",
            a: "Start with the ones they reach for most and the ones that are stressful to replace: identity documents, medical and insurance papers, prescription lists and important contacts. Add financial and other paperwork over time.",
          },
          {
            q: "Can my siblings help without being able to change things?",
            a: "Yes. Roles let you decide who can view and who can edit. A sibling can be a viewer who only looks at what's needed, while you or another editor keep the ability to add and update documents.",
          },
          {
            q: "How will I be reminded before a policy or ID expires?",
            a: "By email, before the \"valid until\" date you set on each document. The reminder comes 30, 15, 7 and 1 day before that date.",
          },
          {
            q: "Can I share one document with a clinic without giving access to everything?",
            a: "Yes. Share a single document with a link that expires and can be revoked at any time, with a view limit and a log of every open — the rest stays private and the recipient needs no account.",
          },
          {
            q: "Is it safe to keep my parents' documents here?",
            a: "Files are kept in private storage over HTTPS, access is isolated to your family at the database level (row-level security), and two-factor login is available. doki.help is in beta and doesn't replace the originals.",
          },
        ],
      },
      ru: {
        navLabel: "Документы родителей",
        title: "Как хранить документы пожилых родителей",
        metaDescription:
          "Спокойный и бережный способ собрать документы пожилых родителей в одном месте: что собрать, разделить по людям, добавить сроки, напоминания и аккуратный доступ.",
        h1: "Как хранить документы пожилых родителей",
        intro:
          "Тёплый и практичный способ собрать важные документы родителей в одном месте — по людям, со сроками и напоминаниями, — чтобы в нужный момент они были под рукой у всей семьи.",
        ctaPrimary: "Соберите документы родителей в одном месте",
        sections: [
          {
            h2: "Почему это важно",
            body: "С возрастом документы родителей значат всё больше, а найти их всё труднее: полис в ящике, удостоверение в сумке, рецепт, который никак не отыскать. Момент, когда документ вдруг нужен, редко бывает спокойным — приём у врача, продление, очередная форма. Когда всё в одном месте, любой член семьи может найти нужное без спешки, не переворачивая весь дом.",
          },
          {
            h2: "Какие документы собрать",
            body: "Собирать всё сразу не нужно. Начните с тех документов, к которым родители обращаются чаще всего, а остальные добавляйте постепенно.",
            bullets: [
              "Удостоверяющие: паспорта, удостоверения, ВНЖ, пенсионные документы",
              "Медицинские и рецепты: страховки, списки рецептов, ключевые заключения и направления",
              "Страховки: медицинская, жизни, жильё и другие полисы",
              "Важные контакты: врачи, страховые, доверенный родственник или сосед",
              "Финансовые: банковские данные, пенсия и льготы, ключевые договоры",
            ],
          },
          {
            h2: "Как организовать по человеку и категории",
            body: "Заведите профиль на каждого родителя и держите их документы вместе, разложив по простым категориям — удостоверяющие, медицинские, финансовые. Так вы всегда знаете, где искать, документы мамы не путаются с документами папы, а тот, кто помогает, быстро находит нужное. В doki.help документы можно организовать по членам семьи с самого начала.",
          },
          {
            h2: "Как аккуратно дать доступ близким",
            body: "Забота о родителях обычно общая, поэтому доступ к документам может быть нужен нескольким людям. Роли позволяют решить это аккуратно: owner или editor может добавлять и менять документы, а viewer — только смотреть. Так сестра или брат, кто помогает с приёмами, видит нужное, но ничего не может изменить, а вы контролируете, кто чем занимается.",
          },
          {
            h2: "Как отметить сроки и получать напоминания",
            body: "Полисы, удостоверения и разрешения тихо истекают, а для пожилых родителей просроченный документ — это пропущенный приём или пробел в страховке. Добавляя документ, укажите дату «действует до», чтобы срок жил вместе с ним. doki.help пришлёт email-напоминание за 30, 15, 7 и 1 день до этой даты. Правила продления зависят от страны и документа, поэтому по всему официальному проверяйте официальные требования или обратитесь к специалисту.",
          },
          {
            h2: "Как помогает doki.help",
            body: "doki.help хранит документы родителей в приватном хранилище, передаёт их по HTTPS, а доступ изолирован вашей семьёй на уровне базы (RLS) — документы видит только ваша семья. Роли позволяют решить, кто может смотреть, а кто редактировать, доступен двухфакторный вход, а когда нужно отправить один документ в клинику или родственнику, можно поделиться ссылкой, которая истекает и отзывается в любой момент, с лимитом просмотров и журналом открытий — получателю не нужен аккаунт. Опциональное AI-распознавание полей по умолчанию выключено. Сервис в стадии beta и не заменяет оригиналы документов.",
          },
        ],
        faqHeading: "Частые вопросы",
        faq: [
          {
            q: "Какие документы родителей хранить в первую очередь?",
            a: "Начните с тех, к которым они обращаются чаще всего, и тех, что сложно восстановить: удостоверяющие, медицинские и страховые бумаги, списки рецептов и важные контакты. Финансовое и остальное добавляйте постепенно.",
          },
          {
            q: "Могут ли братья и сёстры помогать, но не иметь права менять?",
            a: "Да. Роли позволяют решить, кто может смотреть, а кто редактировать. Родственник может быть viewer и только смотреть нужное, а вы или другой editor сохраняете возможность добавлять и менять документы.",
          },
          {
            q: "Как придёт напоминание до окончания срока полиса или удостоверения?",
            a: "На email, до указанной вами даты «действует до» на каждом документе. Напоминание приходит за 30, 15, 7 и 1 день до этой даты.",
          },
          {
            q: "Можно поделиться одним документом с клиникой, не открывая доступ ко всему?",
            a: "Да. Поделитесь одним документом по ссылке, которая истекает и отзывается в любой момент, с лимитом просмотров и журналом открытий — остальное остаётся приватным, а получателю не нужен аккаунт.",
          },
          {
            q: "Безопасно ли хранить документы родителей здесь?",
            a: "Файлы хранятся в приватном хранилище по HTTPS, доступ изолирован вашей семьёй на уровне базы (RLS), доступен двухфакторный вход. doki.help в стадии beta и не заменяет оригиналы.",
          },
        ],
      },
      id: {
        navLabel: "Dokumen orang tua",
        title: "Cara Menyimpan Dokumen Orang Tua Lansia",
        metaDescription:
          "Cara tenang dan penuh hormat menyimpan dokumen orang tua lansia di satu tempat: apa yang dikumpulkan, pilah per orang, tambah masa berlaku, pengingat, akses rapi.",
        h1: "Cara menyimpan dokumen orang tua lansia",
        intro:
          "Cara yang hangat dan praktis untuk mengumpulkan dokumen penting orang tua di satu tempat — dipilah per orang, dengan masa berlaku dan pengingat — agar saat dibutuhkan, seluruh keluarga bisa menemukannya dengan tenang.",
        ctaPrimary: "Kumpulkan dokumen orang tua di satu tempat",
        sections: [
          {
            h2: "Mengapa ini penting",
            body: "Seiring usia, dokumen orang tua makin penting dan sering makin sulit ditemukan — polis di laci, KTP di tas, resep yang tak ketemu. Saat sebuah dokumen tiba-tiba diperlukan, situasinya jarang tenang: kunjungan ke klinik, perpanjangan, formulir yang harus diisi. Dengan semuanya di satu tempat, anggota keluarga mana pun bisa menjangkaunya tanpa harus membongkar seisi rumah.",
          },
          {
            h2: "Dokumen apa yang perlu dikumpulkan",
            body: "Anda tidak perlu mengumpulkan semuanya sekaligus. Mulai dari dokumen yang paling sering dipakai orang tua, lalu tambahkan sisanya sedikit demi sedikit.",
            bullets: [
              "Identitas: paspor, KTP, izin tinggal, dokumen pensiun",
              "Medis dan resep: asuransi, daftar resep, hasil dan rujukan penting",
              "Asuransi: kesehatan, jiwa, rumah, dan polis lainnya",
              "Kontak penting: dokter, pihak asuransi, kerabat atau tetangga tepercaya",
              "Keuangan: data bank, dokumen pensiun dan tunjangan, kontrak penting",
            ],
          },
          {
            h2: "Tata per orang dan kategori",
            body: "Beri tiap orang tua profilnya sendiri dan simpan dokumennya bersama, dipilah ke kategori sederhana seperti identitas, medis, dan keuangan. Dengan begitu Anda selalu tahu di mana mencari, berkas ibu tidak tercampur dengan berkas ayah, dan siapa pun yang membantu bisa cepat menemukannya. Di doki.help, dokumen bisa ditata per anggota keluarga sejak awal.",
          },
          {
            h2: "Beri akses ke keluarga dengan rapi",
            body: "Merawat orang tua biasanya kerja bersama, jadi lebih dari satu orang mungkin perlu menjangkau dokumen ini. Peran membuat Anda bisa mengaturnya dengan cermat: owner atau editor bisa menambah dan memperbarui dokumen, sedangkan viewer hanya bisa melihat. Jadi saudara yang membantu urusan janji temu bisa melihat yang diperlukan tanpa bisa mengubah apa pun, dan Anda tetap memegang kendali.",
          },
          {
            h2: "Tandai tenggat dan dapatkan pengingat",
            body: "Polis, KTP, dan izin diam-diam kedaluwarsa, dan bagi orang tua lansia dokumen yang lewat masa berlaku bisa berarti janji temu terlewat atau celah dalam perlindungan. Saat menambahkan tiap dokumen, isi tanggal \"berlaku sampai\" agar tenggatnya menempel padanya. doki.help lalu mengirim pengingat email 30, 15, 7, dan 1 hari sebelum tanggal itu. Aturan perpanjangan berbeda tiap negara dan dokumen, jadi untuk hal resmi, periksa persyaratan resmi atau konsultasikan dengan profesional.",
          },
          {
            h2: "Bagaimana doki.help membantu",
            body: "doki.help menyimpan dokumen orang tua di penyimpanan privat, ditransfer lewat HTTPS, dengan akses diisolasi untuk keluarga Anda di tingkat basis data (row-level security) — hanya keluarga Anda yang melihatnya. Peran membuat Anda menentukan siapa yang bisa melihat dan siapa yang bisa mengedit, login dua faktor tersedia, dan saat perlu mengirim satu dokumen ke klinik atau kerabat, Anda bisa membagikan tautan yang kedaluwarsa dan bisa dicabut kapan saja, dengan batas tampilan dan catatan tiap pembukaan — penerima tidak perlu akun. Pengenalan bidang AI opsional mati secara default. Masih beta dan tidak menggantikan dokumen asli Anda.",
          },
        ],
        faqHeading: "Pertanyaan umum",
        faq: [
          {
            q: "Dokumen orang tua mana yang disimpan lebih dulu?",
            a: "Mulai dari yang paling sering dipakai dan yang sulit diganti: dokumen identitas, berkas medis dan asuransi, daftar resep, serta kontak penting. Tambahkan keuangan dan lainnya seiring waktu.",
          },
          {
            q: "Bisakah saudara membantu tanpa bisa mengubah apa pun?",
            a: "Bisa. Peran membuat Anda menentukan siapa yang bisa melihat dan siapa yang bisa mengedit. Saudara bisa jadi viewer yang hanya melihat yang diperlukan, sementara Anda atau editor lain tetap bisa menambah dan memperbarui dokumen.",
          },
          {
            q: "Bagaimana pengingat sebelum polis atau KTP kedaluwarsa datang?",
            a: "Lewat email, sebelum tanggal \"berlaku sampai\" yang Anda tetapkan pada tiap dokumen. Pengingat datang 30, 15, 7, dan 1 hari sebelum tanggal itu.",
          },
          {
            q: "Bisakah berbagi satu dokumen ke klinik tanpa membuka akses ke semuanya?",
            a: "Bisa. Bagikan satu dokumen lewat tautan yang kedaluwarsa dan bisa dicabut kapan saja, dengan batas tampilan dan catatan tiap pembukaan — sisanya tetap privat dan penerima tidak perlu akun.",
          },
          {
            q: "Apakah aman menyimpan dokumen orang tua di sini?",
            a: "Berkas disimpan di penyimpanan privat lewat HTTPS, akses diisolasi untuk keluarga Anda di tingkat basis data (row-level security), dan login dua faktor tersedia. doki.help masih beta dan tidak menggantikan dokumen asli.",
          },
        ],
      },
      uz: {
        navLabel: "Ota-ona hujjatlari",
        title: "Keksa ota-ona hujjatlarini qanday saqlash",
        metaDescription:
          "Keksa ota-ona hujjatlarini bitta joyda saqlashning sokin va hurmatli yoʻli: nimani yigʻish, kishilar boʻyicha ajratish, muddatlar, eslatmalar va ehtiyotkor kirish.",
        h1: "Keksa ota-ona hujjatlarini qanday saqlash",
        intro:
          "Ota-onaning muhim hujjatlarini bitta joyga yigʻishning iliq va amaliy yoʻli — kishilar boʻyicha, muddat va eslatmalar bilan — toki kerak boʻlgan lahzada ular butun oila qoʻl ostida boʻlsin.",
        ctaPrimary: "Ota-ona hujjatlarini bitta joyga yigʻing",
        sections: [
          {
            h2: "Nega bu muhim",
            body: "Yosh oʻtgani sari ota-onaning hujjatlari koʻproq ahamiyat kasb etadi va koʻpincha topish qiyinlashadi — tortmadagi polis, sumkadagi guvohnoma, hech topilmaydigan retsept. Hujjat birdan kerak boʻlgan lahza kamdan-kam sokin boʻladi: shifokor qabuli, yangilash, toʻldiriladigan ariza. Hammasi bitta joyda boʻlsa, oilaning istalgan aʼzosi butun uyni agʻdarmasdan kerakligini topa oladi.",
          },
          {
            h2: "Qaysi hujjatlarni yigʻish kerak",
            body: "Hammasini birdan yigʻish shart emas. Ota-ona eng koʻp murojaat qiladigan hujjatlardan boshlang, qolganini asta-sekin qoʻshib boring.",
            bullets: [
              "Guvohnoma: pasportlar, ID, yashash ruxsati, nafaqa hujjatlari",
              "Tibbiy va retseptlar: sugʻurta, retsept roʻyxatlari, muhim xulosa va yoʻllanmalar",
              "Sugʻurtalar: tibbiy, hayot, uy va boshqa polislar",
              "Muhim kontaktlar: shifokorlar, sugʻurtachilar, ishonchli qarindosh yoki qoʻshni",
              "Moliyaviy: bank maʼlumotlari, nafaqa va imtiyoz qogʻozlari, muhim shartnomalar",
            ],
          },
          {
            h2: "Kishi va toifa boʻyicha tartiblang",
            body: "Har bir ota-onaga oʻz profilini bering va hujjatlarini birga saqlang, ularni guvohnoma, tibbiy, moliyaviy kabi sodda toifalarga ajrating. Shunda qayerdan qidirishni doim bilasiz, onaning qogʻozlari otanikiga aralashmaydi, yordam beradigan kishi kerakligini tez topadi. doki.help da hujjatlarni boshidanoq oila aʼzolari boʻyicha tartiblash mumkin.",
          },
          {
            h2: "Yaqinlarga ehtiyotkorlik bilan kirish bering",
            body: "Ota-onaga gʻamxoʻrlik odatda umumiy ish, shuning uchun bu hujjatlarga bir necha kishi kirishi kerak boʻlishi mumkin. Rollar buni ehtiyotkorlik bilan hal qilishga imkon beradi: owner yoki editor hujjatlarni qoʻsha va yangilay oladi, viewer esa faqat koʻra oladi. Shunday qilib, qabullarga yordam beradigan aka yoki opa kerakligini koʻradi, lekin hech narsani oʻzgartira olmaydi, siz esa kim nima qilishini nazorat qilib turasiz.",
          },
          {
            h2: "Muddatlarni belgilang va eslatma oling",
            body: "Polislar, guvohnomalar va ruxsatnomalar jimgina tugaydi, keksa ota-ona uchun esa muddati oʻtgan hujjat oʻtkazib yuborilgan qabul yoki sugʻurtadagi uzilish demakdir. Har bir hujjatni qoʻshayotib \"amal qiladi\" sanasini kiriting, shunda muddat u bilan birga yashaydi. doki.help shu sanadan 30, 15, 7 va 1 kun oldin email eslatma yuboradi. Yangilash qoidalari davlat va hujjatga qarab farq qiladi, shuning uchun rasmiy har narsa boʻyicha rasmiy talablarni tekshiring yoki mutaxassisga murojaat qiling.",
          },
          {
            h2: "doki.help qanday yordam beradi",
            body: "doki.help ota-ona hujjatlarini maxfiy omborda saqlaydi, HTTPS orqali uzatadi, kirish esa maʼlumotlar bazasi darajasida oilangiz bilan izolyatsiya qilingan (RLS) — hujjatlarni faqat oilangiz koʻradi. Rollar kim koʻra oladi va kim tahrirlay oladi degan qarorni sizga qoldiradi, ikki bosqichli kirish mavjud, bitta hujjatni klinikaga yoki qarindoshga yuborish kerak boʻlsa esa, muddati tugaydigan va istalgan vaqt bekor qilinadigan havola ulashishingiz mumkin, koʻrish chegarasi va har ochilish qaydi bilan — qabul qiluvchiga akkaunt kerak emas. Ixtiyoriy AI maydon tanish sukut boʻyicha oʻchiq. U beta bosqichida va asl hujjatlaringiz oʻrnini bosmaydi.",
          },
        ],
        faqHeading: "Tez-tez beriladigan savollar",
        faq: [
          {
            q: "Ota-onaning qaysi hujjatlarini birinchi saqlash kerak?",
            a: "Ular eng koʻp murojaat qiladigan va tiklash mashaqqatli boʻlganlaridan boshlang: guvohnoma hujjatlari, tibbiy va sugʻurta qogʻozlari, retsept roʻyxatlari va muhim kontaktlar. Moliyaviy va qolganlarini asta qoʻshib boring.",
          },
          {
            q: "Aka-uka va opa-singillar oʻzgartira olmasdan yordam bera oladimi?",
            a: "Ha. Rollar kim koʻra oladi va kim tahrirlay oladi degan qarorni sizga qoldiradi. Qarindosh viewer boʻlib faqat kerakligini koʻra oladi, siz yoki boshqa editor esa hujjatlarni qoʻshish va yangilash imkonini saqlab qolasiz.",
          },
          {
            q: "Polis yoki guvohnoma muddati tugashidan oldin eslatma qanday keladi?",
            a: "Email orqali, har bir hujjatda siz belgilagan \"amal qiladi\" sanasidan oldin. Eslatma shu sanadan 30, 15, 7 va 1 kun oldin keladi.",
          },
          {
            q: "Bitta hujjatni hammasiga ruxsat bermay klinikaga ulashsa boʻladimi?",
            a: "Ha. Bitta hujjatni muddati tugaydigan va istalgan vaqt bekor qilinadigan havola orqali ulashing, koʻrish chegarasi va har ochilish qaydi bilan — qolgani maxfiy qoladi, qabul qiluvchiga esa akkaunt kerak emas.",
          },
          {
            q: "Ota-ona hujjatlarini bu yerda saqlash xavfsizmi?",
            a: "Fayllar maxfiy omborda HTTPS orqali saqlanadi, kirish oilangiz darajasida izolyatsiya qilingan (RLS), ikki bosqichli kirish mavjud. doki.help beta bosqichida va asl hujjatlar oʻrnini bosmaydi.",
          },
        ],
      },
    },
    related: {
      en: [
        { href: "/family-emergency-documents", label: "Family emergency documents" },
        { href: "/medical-document-organizer", label: "Medical document organizer" },
      ],
      ru: [
        { href: "/family-emergency-documents", label: "Документы семьи на экстренный случай" },
        { href: "/medical-document-organizer", label: "Организатор медицинских документов" },
      ],
      id: [
        { href: "/family-emergency-documents", label: "Dokumen darurat keluarga" },
        { href: "/medical-document-organizer", label: "Penata dokumen medis" },
      ],
      uz: [
        { href: "/family-emergency-documents", label: "Oila favqulodda hujjatlari" },
        { href: "/medical-document-organizer", label: "Tibbiy hujjatlar tartiblagichi" },
      ],
    },
  },
  "how-to-send-a-document-securely": {
    slug: "how-to-send-a-document-securely",
    emoji: "🔐",
    locales: {
      en: {
        navLabel: "Send a document securely",
        title: "How to Send a Document Securely to a Lawyer or Agent",
        metaDescription:
          "Instead of sending a scan into a chat that lives forever, share one document with a link that expires, has a view limit and a log — and can be revoked anytime.",
        h1: "How to send a document securely to a lawyer or agent",
        intro:
          "When a lawyer, an agent or an employer asks for a scan, the quickest option — dropping it into a chat or email — is also the one you have the least control over. Here is a calmer way to send a single document, with a link you can limit and revoke, without opening the rest of your vault.",
        ctaPrimary: "Share a document with a secure link",
        sections: [
          {
            h2: "Why sending a scan into a chat or email is risky",
            body: "A file sent into a chat or an email is a copy you no longer control. It stays in that thread for as long as the account exists, gets backed up, and can be forwarded onward without you ever knowing. You can't set an expiry, you can't see who opened it, and you can't take it back. For a passport, a contract or a certificate, that's a lot of exposure for a one-time request.",
          },
          {
            h2: "What sharing securely actually means",
            body: "Sharing securely isn't a promise of absolute safety — it's a set of concrete controls over one link. You decide the terms up front and can change your mind later.",
            bullets: [
              "The link expires on a date you set, so access doesn't last forever",
              "A view limit caps how many times it can be opened",
              "A log records every open — who opened it and when",
              "You can revoke the link at any moment, in one step",
              "The recipient needs no account to open it",
            ],
          },
          {
            h2: "When you need this",
            body: "A secure link fits any moment where a copy would otherwise linger somewhere you don't control.",
            bullets: [
              "A lawyer or notary asking for a scan of a document",
              "A real-estate or visa agent collecting paperwork",
              "An employer or HR requesting an ID or certificate",
              "A relative who needs one document, not your whole vault",
            ],
          },
          {
            h2: "How to share one file without opening your whole vault",
            body: "You don't have to grant access to everything to send one thing. Pick the single document, create a share link for it, and set the expiry and view limit. The recipient opens just that file over HTTPS, without an account, and the rest of your vault stays private and isolated to your family. When the matter is closed, revoke the link.",
          },
          {
            h2: "What to check before you send",
            body: "A few seconds of checking prevents the awkward second message.",
            bullets: [
              "The right document — the correct file and the current version",
              "The right recipient — the exact person or address you mean to reach",
              "The link terms — an expiry date and view limit that match the request",
              "Whether to revoke it afterwards, once the document has been received",
            ],
          },
          {
            h2: "How doki.help helps",
            body: "In doki.help you can share a single document with a link that expires and can be revoked at any time, with a view limit and a log of every open — who opened it and when. The recipient needs no account, and the rest of your vault stays private, kept in private storage over HTTPS with access isolated to your family at the database level (row-level security). Roles let you decide who is owner, editor or viewer, two-factor login is available, and optional AI field recognition is off by default. doki.help is in beta and doesn't replace your original documents.",
          },
        ],
        faqHeading: "FAQ",
        faq: [
          {
            q: "Why not just send the scan by email or chat?",
            a: "Because that copy stays in the thread for as long as the account exists and can be forwarded onward. You can't set an expiry, see who opened it, or take it back. A secure link gives you those controls.",
          },
          {
            q: "What does a secure link let me control?",
            a: "You set an expiry date and a view limit, see a log of every open (who and when), and can revoke the link at any moment. The recipient needs no account to open it.",
          },
          {
            q: "Can I share one document without giving access to everything?",
            a: "Yes. Share a single document with its own link — the recipient sees only that file, and the rest of your vault stays private and isolated to your family.",
          },
          {
            q: "Can I take a shared link back after sending it?",
            a: "Yes. You can revoke the link at any time in one step, and it can also expire automatically on the date you set and after the view limit is reached.",
          },
          {
            q: "Does the recipient need a doki.help account?",
            a: "No. They open the shared document over HTTPS through the link, without creating an account. doki.help is in beta and doesn't replace your original documents.",
          },
        ],
      },
      ru: {
        navLabel: "Безопасно отправить документ",
        title: "Как безопасно отправить документ адвокату или агенту",
        metaDescription:
          "Вместо скана в чат, который останется навсегда, поделитесь одним документом по ссылке с истечением, лимитом просмотров и журналом — и отзывом в любой момент.",
        h1: "Как безопасно отправить документ адвокату или агенту",
        intro:
          "Когда адвокат, агент или работодатель просит скан, самый быстрый способ — бросить его в чат или почту — это и способ, над которым у вас меньше всего контроля. Есть более спокойный вариант: отправить один документ по ссылке, которую можно ограничить и отозвать, не открывая остальной сейф.",
        ctaPrimary: "Поделитесь документом по защищённой ссылке",
        sections: [
          {
            h2: "Почему отправлять скан в чат или почту рискованно",
            body: "Файл, отправленный в чат или почту, — это копия, которую вы больше не контролируете. Она остаётся в переписке столько, сколько существует аккаунт, попадает в резервные копии и может уйти дальше пересылкой, а вы об этом даже не узнаете. Нельзя задать срок, нельзя увидеть, кто её открыл, нельзя забрать назад. Для паспорта, договора или справки это слишком много открытости ради разовой просьбы.",
          },
          {
            h2: "Что значит «поделиться безопасно»",
            body: "Поделиться безопасно — это не обещание абсолютной защиты, а набор конкретных настроек над одной ссылкой. Условия вы задаёте заранее и можете передумать позже.",
            bullets: [
              "Ссылка истекает в указанную вами дату, доступ не длится вечно",
              "Лимит просмотров ограничивает, сколько раз её можно открыть",
              "Журнал фиксирует каждое открытие — кто открыл и когда",
              "Ссылку можно отозвать в любой момент, в один шаг",
              "Получателю не нужен аккаунт, чтобы её открыть",
            ],
          },
          {
            h2: "Когда это нужно",
            body: "Защищённая ссылка подходит для любого случая, где иначе копия осталась бы там, где вы её не контролируете.",
            bullets: [
              "Адвокат или нотариус просит скан документа",
              "Агент по недвижимости или визам собирает бумаги",
              "Работодатель или HR запрашивает удостоверение или справку",
              "Родственнику нужен один документ, а не весь ваш сейф",
            ],
          },
          {
            h2: "Как поделиться одним файлом, не открывая весь сейф",
            body: "Чтобы отправить одно, не нужно давать доступ ко всему. Выберите один документ, создайте для него ссылку и задайте срок и лимит просмотров. Получатель открывает только этот файл по HTTPS, без аккаунта, а остальной сейф остаётся приватным и изолированным вашей семьёй. Когда вопрос решён, отзовите ссылку.",
          },
          {
            h2: "Что проверить перед отправкой",
            body: "Несколько секунд проверки избавят от неловкого второго сообщения.",
            bullets: [
              "Тот ли документ — нужный файл и актуальная версия",
              "Тот ли получатель — именно тот человек или адрес, что вы имеете в виду",
              "Условия ссылки — срок и лимит просмотров под конкретную просьбу",
              "Стоит ли отозвать её потом, когда документ уже получен",
            ],
          },
          {
            h2: "Как помогает doki.help",
            body: "В doki.help можно поделиться одним документом по ссылке, которая истекает и отзывается в любой момент, с лимитом просмотров и журналом каждого открытия — кто открыл и когда. Получателю не нужен аккаунт, а остальной сейф остаётся приватным: документы хранятся в приватном хранилище по HTTPS, доступ изолирован вашей семьёй на уровне базы (RLS). Роли позволяют решить, кто owner, editor или viewer, доступен двухфакторный вход, а опциональное AI-распознавание полей по умолчанию выключено. doki.help в стадии beta и не заменяет оригиналы документов.",
          },
        ],
        faqHeading: "Частые вопросы",
        faq: [
          {
            q: "Почему не отправить скан просто по почте или в чат?",
            a: "Потому что эта копия остаётся в переписке столько, сколько существует аккаунт, и может уйти дальше пересылкой. Нельзя задать срок, увидеть, кто её открыл, или забрать назад. Защищённая ссылка даёт эти настройки.",
          },
          {
            q: "Что позволяет контролировать защищённая ссылка?",
            a: "Вы задаёте дату истечения и лимит просмотров, видите журнал каждого открытия (кто и когда) и можете отозвать ссылку в любой момент. Получателю не нужен аккаунт, чтобы её открыть.",
          },
          {
            q: "Можно поделиться одним документом, не давая доступ ко всему?",
            a: "Да. Поделитесь одним документом по отдельной ссылке — получатель видит только этот файл, а остальной сейф остаётся приватным и изолированным вашей семьёй.",
          },
          {
            q: "Можно забрать отправленную ссылку обратно?",
            a: "Да. Ссылку можно отозвать в любой момент в один шаг, а ещё она может истечь автоматически в указанную дату и после исчерпания лимита просмотров.",
          },
          {
            q: "Нужен ли получателю аккаунт doki.help?",
            a: "Нет. Он открывает документ по ссылке по HTTPS, без создания аккаунта. doki.help в стадии beta и не заменяет оригиналы документов.",
          },
        ],
      },
      id: {
        navLabel: "Kirim dokumen dengan aman",
        title: "Cara Mengirim Dokumen dengan Aman ke Pengacara/Agen",
        metaDescription:
          "Alih-alih mengirim scan ke chat yang tersimpan selamanya, bagikan satu dokumen lewat tautan yang kedaluwarsa, berbatas tampilan, tercatat, dan bisa dicabut.",
        h1: "Cara mengirim dokumen dengan aman ke pengacara atau agen",
        intro:
          "Saat pengacara, agen, atau pemberi kerja meminta scan, cara tercepat — melemparnya ke chat atau email — juga cara yang paling sedikit Anda kendalikan. Ada cara yang lebih tenang: mengirim satu dokumen lewat tautan yang bisa Anda batasi dan cabut, tanpa membuka sisa brankas.",
        ctaPrimary: "Bagikan dokumen lewat tautan aman",
        sections: [
          {
            h2: "Mengapa mengirim scan ke chat atau email berisiko",
            body: "Berkas yang dikirim ke chat atau email adalah salinan yang tidak lagi Anda kendalikan. Ia tetap di percakapan itu selama akunnya ada, ikut tersalin ke cadangan, dan bisa diteruskan lebih jauh tanpa Anda ketahui. Anda tidak bisa memasang masa berlaku, tidak bisa melihat siapa yang membukanya, dan tidak bisa menariknya kembali. Untuk paspor, kontrak, atau sertifikat, itu keterbukaan yang terlalu besar demi satu permintaan.",
          },
          {
            h2: "Apa arti \"berbagi dengan aman\"",
            body: "Berbagi dengan aman bukan janji keamanan mutlak — melainkan sejumlah kontrol nyata atas satu tautan. Syaratnya Anda tentukan di awal dan bisa Anda ubah kemudian.",
            bullets: [
              "Tautan kedaluwarsa pada tanggal yang Anda tetapkan, akses tidak selamanya",
              "Batas tampilan membatasi berapa kali ia bisa dibuka",
              "Catatan merekam tiap pembukaan — siapa membuka dan kapan",
              "Anda bisa mencabut tautan kapan saja, dalam satu langkah",
              "Penerima tidak perlu akun untuk membukanya",
            ],
          },
          {
            h2: "Kapan Anda membutuhkannya",
            body: "Tautan aman cocok untuk setiap situasi di mana salinan akan tertinggal di tempat yang tidak Anda kendalikan.",
            bullets: [
              "Pengacara atau notaris meminta scan dokumen",
              "Agen properti atau visa mengumpulkan berkas",
              "Pemberi kerja atau HRD meminta identitas atau sertifikat",
              "Kerabat yang perlu satu dokumen, bukan seluruh brankas Anda",
            ],
          },
          {
            h2: "Cara berbagi satu berkas tanpa membuka seluruh brankas",
            body: "Anda tak perlu memberi akses ke semua demi mengirim satu hal. Pilih satu dokumen, buatkan tautan berbagi untuknya, lalu tetapkan masa berlaku dan batas tampilan. Penerima membuka hanya berkas itu lewat HTTPS, tanpa akun, dan sisa brankas tetap privat serta terisolasi untuk keluarga Anda. Setelah urusan selesai, cabut tautannya.",
          },
          {
            h2: "Yang perlu diperiksa sebelum mengirim",
            body: "Beberapa detik memeriksa mencegah pesan kedua yang canggung.",
            bullets: [
              "Dokumen yang tepat — berkas yang benar dan versi terkini",
              "Penerima yang tepat — persis orang atau alamat yang Anda tuju",
              "Syarat tautan — masa berlaku dan batas tampilan sesuai permintaan",
              "Perlukah dicabut setelahnya, begitu dokumen sudah diterima",
            ],
          },
          {
            h2: "Bagaimana doki.help membantu",
            body: "Di doki.help Anda bisa membagikan satu dokumen lewat tautan yang kedaluwarsa dan bisa dicabut kapan saja, dengan batas tampilan dan catatan tiap pembukaan — siapa membuka dan kapan. Penerima tidak perlu akun, dan sisa brankas tetap privat: dokumen disimpan di penyimpanan privat lewat HTTPS dengan akses diisolasi untuk keluarga Anda di tingkat basis data (row-level security). Peran menentukan siapa owner, editor, atau viewer, login dua faktor tersedia, dan pengenalan bidang AI opsional mati secara default. doki.help masih beta dan tidak menggantikan dokumen asli Anda.",
          },
        ],
        faqHeading: "Pertanyaan umum",
        faq: [
          {
            q: "Kenapa tidak sekadar kirim scan lewat email atau chat?",
            a: "Karena salinan itu tetap di percakapan selama akunnya ada dan bisa diteruskan lebih jauh. Anda tidak bisa memasang masa berlaku, melihat siapa membukanya, atau menariknya kembali. Tautan aman memberi kontrol itu.",
          },
          {
            q: "Apa yang bisa saya kendalikan lewat tautan aman?",
            a: "Anda menetapkan tanggal kedaluwarsa dan batas tampilan, melihat catatan tiap pembukaan (siapa dan kapan), serta bisa mencabut tautan kapan saja. Penerima tidak perlu akun untuk membukanya.",
          },
          {
            q: "Bisakah berbagi satu dokumen tanpa memberi akses ke semuanya?",
            a: "Bisa. Bagikan satu dokumen lewat tautannya sendiri — penerima hanya melihat berkas itu, dan sisa brankas tetap privat serta terisolasi untuk keluarga Anda.",
          },
          {
            q: "Bisakah menarik kembali tautan setelah dikirim?",
            a: "Bisa. Tautan bisa dicabut kapan saja dalam satu langkah, dan ia juga bisa kedaluwarsa otomatis pada tanggal yang Anda tetapkan serta setelah batas tampilan tercapai.",
          },
          {
            q: "Apakah penerima perlu akun doki.help?",
            a: "Tidak. Mereka membuka dokumen lewat tautan melalui HTTPS, tanpa membuat akun. doki.help masih beta dan tidak menggantikan dokumen asli Anda.",
          },
        ],
      },
      uz: {
        navLabel: "Hujjatni xavfsiz yuborish",
        title: "Hujjatni advokat yoki agentga xavfsiz yuborish",
        metaDescription:
          "Chatda abadiy qoladigan skan oʻrniga bitta hujjatni muddati tugaydigan, koʻrish chegarali, qaydli va istalgan vaqt bekor qilinadigan havola bilan ulashing.",
        h1: "Hujjatni advokat yoki agentga qanday xavfsiz yuborish",
        intro:
          "Advokat, agent yoki ish beruvchi skan soʻraganda eng tez yoʻl — uni chat yoki pochtaga tashlash — ayni paytda siz ustidan eng kam nazorat qiladigan yoʻl hamdir. Sokinroq yoʻl bor: bitta hujjatni cheklab va bekor qila oladigan havola orqali yuborish, seyfning qolganini ochmasdan.",
        ctaPrimary: "Hujjatni himoyalangan havola orqali ulashing",
        sections: [
          {
            h2: "Nega skanni chat yoki pochtaga yuborish xavfli",
            body: "Chat yoki pochtaga yuborilgan fayl — endi siz nazorat qilmaydigan nusxa. U akkaunt mavjud boʻlgan davrgacha oʻsha yozishmada qoladi, zaxira nusxalarga tushadi va siz bilmagan holda boshqalarga uzatilishi mumkin. Muddat qoʻyib boʻlmaydi, kim ochganini koʻrib boʻlmaydi, orqaga qaytarib ham boʻlmaydi. Pasport, shartnoma yoki maʼlumotnoma uchun bu bir martalik iltimos evaziga juda koʻp ochiqlik.",
          },
          {
            h2: "«Xavfsiz ulashish» nima degani",
            body: "Xavfsiz ulashish — mutlaq xavfsizlik vaʼdasi emas, balki bitta havola ustidan aniq boshqaruvlar toʻplami. Shartlarni oldindan belgilaysiz va keyin fikringizni oʻzgartira olasiz.",
            bullets: [
              "Havola siz belgilagan sanada tugaydi, kirish abadiy davom etmaydi",
              "Koʻrish chegarasi uni necha marta ochish mumkinligini cheklaydi",
              "Qayd har ochilishni yozadi — kim ochdi va qachon",
              "Havolani istalgan vaqt, bir qadamda bekor qilsa boʻladi",
              "Qabul qiluvchiga uni ochish uchun akkaunt kerak emas",
            ],
          },
          {
            h2: "Bu qachon kerak boʻladi",
            body: "Himoyalangan havola nusxa aks holda siz nazorat qilmaydigan joyda qolib ketadigan har qanday holatga mos keladi.",
            bullets: [
              "Advokat yoki notarius hujjat skanini soʻraganda",
              "Koʻchmas mulk yoki viza agenti qogʻozlarni yigʻayotganda",
              "Ish beruvchi yoki HR guvohnoma yoki maʼlumotnoma soʻraganda",
              "Qarindoshga butun seyf emas, bitta hujjat kerak boʻlganda",
            ],
          },
          {
            h2: "Butun seyfni ochmay bitta faylni qanday ulashish",
            body: "Bitta narsani yuborish uchun hammasiga ruxsat berish shart emas. Bitta hujjatni tanlang, unga ulashish havolasini yarating va muddat hamda koʻrish chegarasini belgilang. Qabul qiluvchi faqat oʻsha faylni HTTPS orqali, akkauntsiz ochadi, seyfning qolgani esa maxfiy va oilangiz bilan izolyatsiya qilingan holda qoladi. Masala hal boʻlgach, havolani bekor qiling.",
          },
          {
            h2: "Yuborishdan oldin nimani tekshirish kerak",
            body: "Bir necha soniyalik tekshiruv noqulay ikkinchi xabardan qutqaradi.",
            bullets: [
              "Toʻgʻri hujjat — kerakli fayl va joriy versiya",
              "Toʻgʻri qabul qiluvchi — aynan siz moʻljallagan shaxs yoki manzil",
              "Havola shartlari — iltimosga mos muddat va koʻrish chegarasi",
              "Hujjat qabul qilingach, uni keyin bekor qilish kerakmi",
            ],
          },
          {
            h2: "doki.help qanday yordam beradi",
            body: "doki.help da bitta hujjatni muddati tugaydigan va istalgan vaqt bekor qilinadigan havola orqali ulashish mumkin, koʻrish chegarasi va har ochilish qaydi bilan — kim ochdi va qachon. Qabul qiluvchiga akkaunt kerak emas, seyfning qolgani esa maxfiy qoladi: hujjatlar maxfiy omborda HTTPS orqali saqlanadi, kirish maʼlumotlar bazasi darajasida oilangiz bilan izolyatsiya qilingan (RLS). Rollar kim owner, editor yoki viewer ekanini belgilaydi, ikki bosqichli kirish mavjud, ixtiyoriy AI maydon tanish esa sukut boʻyicha oʻchiq. doki.help beta bosqichida va asl hujjatlaringiz oʻrnini bosmaydi.",
          },
        ],
        faqHeading: "Tez-tez beriladigan savollar",
        faq: [
          {
            q: "Nega skanni shunchaki pochta yoki chatga yubormaslik kerak?",
            a: "Chunki bu nusxa akkaunt mavjud boʻlgan davrgacha yozishmada qoladi va boshqalarga uzatilishi mumkin. Muddat qoʻyib, kim ochganini koʻrib yoki orqaga qaytarib boʻlmaydi. Himoyalangan havola shu boshqaruvlarni beradi.",
          },
          {
            q: "Himoyalangan havola nimani nazorat qilishga imkon beradi?",
            a: "Siz tugash sanasi va koʻrish chegarasini belgilaysiz, har ochilish qaydini (kim va qachon) koʻrasiz va havolani istalgan vaqt bekor qila olasiz. Qabul qiluvchiga uni ochish uchun akkaunt kerak emas.",
          },
          {
            q: "Hammasiga ruxsat bermay bitta hujjatni ulashsa boʻladimi?",
            a: "Ha. Bitta hujjatni oʻz havolasi orqali ulashing — qabul qiluvchi faqat oʻsha faylni koʻradi, seyfning qolgani esa maxfiy va oilangiz bilan izolyatsiya qilingan holda qoladi.",
          },
          {
            q: "Yuborilgan havolani orqaga qaytarib olsa boʻladimi?",
            a: "Ha. Havolani istalgan vaqt bir qadamda bekor qilsa boʻladi, u yana siz belgilagan sanada va koʻrish chegarasi tugagach avtomatik tugashi ham mumkin.",
          },
          {
            q: "Qabul qiluvchiga doki.help akkaunti kerakmi?",
            a: "Yoʻq. U hujjatni havola orqali HTTPS orqali, akkaunt ochmasdan ochadi. doki.help beta bosqichida va asl hujjatlaringiz oʻrnini bosmaydi.",
          },
        ],
      },
    },
    related: {
      en: [
        { href: "/secure-document-sharing", label: "Secure document sharing" },
        { href: "/family-document-vault", label: "Family document vault" },
      ],
      ru: [
        { href: "/secure-document-sharing", label: "Безопасный обмен документами" },
        { href: "/family-document-vault", label: "Семейный сейф документов" },
      ],
      id: [
        { href: "/secure-document-sharing", label: "Berbagi dokumen aman" },
        { href: "/family-document-vault", label: "Brankas dokumen keluarga" },
      ],
      uz: [
        { href: "/secure-document-sharing", label: "Hujjatlarni xavfsiz ulashish" },
        { href: "/family-document-vault", label: "Oilaviy hujjatlar seyfi" },
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

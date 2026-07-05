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
            a: "By email, before the \"valid until\" date you set on each document. (TODO: confirm exact lead time / configurable intervals with the team.)",
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
            a: "На email, до указанной вами даты «действует до» на каждом документе. (TODO: уточнить у команды точный срок/настраиваемые интервалы.)",
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
            a: "Lewat email, sebelum tanggal \"berlaku sampai\" yang Anda tetapkan pada tiap dokumen. (TODO: konfirmasi tenggat/interval ke tim.)",
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
            a: "Email orqali, har bir hujjatda siz belgilagan \"amal qiladi\" sanasidan oldin. (TODO: aniq muddat/sozlanadigan oraliqlarni jamoa bilan tasdiqlash.)",
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

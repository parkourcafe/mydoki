import type { Locale } from "./i18n";

export type ComparisonKey =
  | "paper"
  | "cloud"
  | "gallery"
  | "notary"
  | "gosuslugi"
  | "google-drive"
  | "telegram"
  | "whatsapp";

export const COMPARISON_KEYS: ComparisonKey[] = ["paper", "cloud", "gallery", "notary", "gosuslugi", "google-drive", "telegram", "whatsapp"];

export type ComparisonRow = { aspect: string; alt: string; doki: string };
export type ComparisonFaq = { q: string; a: string };

export type ComparisonContent = {
  navLabel: string; // короткая подпись для чипа, напр. «vs бумага»
  altName: string; // как называем альтернативу в таблице
  title: string;
  subtitle: string;
  intro: string;
  rows: ComparisonRow[];
  verdict: string;
  faq: ComparisonFaq[];
};

// `ru` обязателен; остальные локали опциональны — некоторые сравнения
// (например, Госуслуги) релевантны только русскому рынку.
type Comparison = {
  emoji: string;
  locales: { ru: ComparisonContent } & Partial<Record<Locale, ComparisonContent>>;
};

const DATA: Record<ComparisonKey, Comparison> = {
  paper: {
    emoji: "📄",
    locales: {
      ru: {
        navLabel: "vs бумага",
        altName: "Бумажная папка",
        title: "Электронные документы или бумажные: что удобнее и надёжнее",
        subtitle:
          "Бумага рвётся, теряется и всегда не с собой. Сравниваем хранение документов в doki.help и в бумажной папке дома.",
        intro:
          "Бумажная папка кажется надёжной, пока не нужно срочно найти справку, показать её врачу или восстановить после потери. Электронное хранилище решает это: документы всегда под рукой, ищутся за секунды, ими легко поделиться и их нельзя потерять.",
        rows: [
          { aspect: "Доступ к документу", alt: "Только дома, где лежит папка", doki: "С телефона в любой точке мира, даже офлайн" },
          { aspect: "Поиск нужного", alt: "Перебирать папку вручную", doki: "Поиск и категории — нужное за секунды" },
          { aspect: "Потеря и порча", alt: "Пожар, потоп, потеря — и копии нет", doki: "Копии в защищённом облаке, ничего не пропадёт" },
          { aspect: "Сроки и продления", alt: "Держать в голове или в блокноте", doki: "Напоминания о сроках заранее" },
          { aspect: "Передать другому", alt: "Сделать копию, отдать оригинал", doki: "Защищённая ссылка — и её можно отозвать" },
          { aspect: "Документы семьи", alt: "Своя папка у каждого", doki: "Профиль на каждого члена семьи в одном месте" },
        ],
        verdict:
          "Бумага по-прежнему нужна для оригиналов. Но рабочая копия должна быть под рукой — в doki.help вы находите, показываете и продлеваете документы, не перерывая папки.",
        faq: [
          {
            q: "Заменяет ли doki.help оригиналы бумажных документов?",
            a: "Нет. doki.help — это удобная копия под рукой: оригиналы храните как обычно, а сканы и фото всегда с собой для поиска, продлений и передачи.",
          },
          {
            q: "Это безопаснее, чем папка дома?",
            a: "Бумага уязвима к пожару, потопу и потере без копии. В doki.help документы лежат в защищённом облаке с доступом только у вас и тех, кому вы дали ссылку.",
          },
          {
            q: "Что если нет интернета?",
            a: "Открытые документы доступны офлайн — на приёме у врача, в поездке или в роуминге.",
          },
        ],
      },
      en: {
        navLabel: "vs paper",
        altName: "Paper folder",
        title: "Digital documents vs paper: which is handier and safer",
        subtitle:
          "Paper tears, gets lost and is never with you. We compare keeping documents in doki.help and in a paper folder at home.",
        intro:
          "A paper folder feels reliable — until you urgently need a certificate, have to show it to a doctor, or must recover it after a loss. A digital vault solves this: documents are always at hand, found in seconds, easy to share and impossible to lose.",
        rows: [
          { aspect: "Access to a document", alt: "Only at home, where the folder is", doki: "From your phone anywhere, even offline" },
          { aspect: "Finding the right one", alt: "Sort through the folder by hand", doki: "Search and categories — in seconds" },
          { aspect: "Loss & damage", alt: "Fire, flood, loss — and no copy", doki: "Copies in a secure cloud, nothing disappears" },
          { aspect: "Deadlines & renewals", alt: "Keep them in your head or a notebook", doki: "Reminders for deadlines in advance" },
          { aspect: "Handing to someone", alt: "Make a copy, give up the original", doki: "A secure link — and you can revoke it" },
          { aspect: "Family documents", alt: "A separate folder for each person", doki: "A profile per family member in one place" },
        ],
        verdict:
          "Paper is still needed for originals. But a working copy belongs at hand — in doki.help you find, show and renew documents without digging through folders.",
        faq: [
          {
            q: "Does doki.help replace original paper documents?",
            a: "No. doki.help is a convenient copy at hand: keep originals as usual, while scans and photos travel with you for search, renewals and sharing.",
          },
          {
            q: "Is it safer than a folder at home?",
            a: "Paper is vulnerable to fire, flood and loss with no copy. In doki.help documents sit in a secure cloud, accessible only to you and those you share a link with.",
          },
          {
            q: "What if there's no internet?",
            a: "Documents you've opened are available offline — at the doctor's, on a trip or in roaming.",
          },
        ],
      },
      id: {
        navLabel: "vs kertas",
        altName: "Map kertas",
        title: "Dokumen digital vs kertas: mana yang lebih praktis dan aman",
        subtitle:
          "Kertas robek, hilang, dan tak pernah ikut bersama Anda. Kami membandingkan menyimpan dokumen di doki.help dan di map kertas di rumah.",
        intro:
          "Map kertas terasa andal — sampai Anda butuh surat keterangan mendadak, harus menunjukkannya ke dokter, atau memulihkannya setelah hilang. Brankas digital mengatasinya: dokumen selalu siap, ditemukan dalam hitungan detik, mudah dibagikan, dan mustahil hilang.",
        rows: [
          { aspect: "Akses ke dokumen", alt: "Hanya di rumah, tempat map berada", doki: "Dari ponsel di mana saja, bahkan offline" },
          { aspect: "Menemukan yang tepat", alt: "Membongkar map satu per satu", doki: "Pencarian dan kategori — dalam detik" },
          { aspect: "Hilang & rusak", alt: "Kebakaran, banjir, hilang — tanpa salinan", doki: "Salinan di cloud aman, tak ada yang hilang" },
          { aspect: "Tenggat & perpanjangan", alt: "Diingat sendiri atau dicatat", doki: "Pengingat tenggat lebih awal" },
          { aspect: "Menyerahkan ke orang lain", alt: "Buat salinan, serahkan aslinya", doki: "Tautan aman — dan bisa dicabut" },
          { aspect: "Dokumen keluarga", alt: "Map terpisah untuk tiap orang", doki: "Profil per anggota keluarga di satu tempat" },
        ],
        verdict:
          "Kertas tetap diperlukan untuk dokumen asli. Tapi salinan kerja seharusnya selalu siap — di doki.help Anda menemukan, menunjukkan, dan memperpanjang dokumen tanpa membongkar map.",
        faq: [
          {
            q: "Apakah doki.help menggantikan dokumen kertas asli?",
            a: "Tidak. doki.help adalah salinan praktis yang siap pakai: simpan dokumen asli seperti biasa, sementara pindaian dan foto selalu ikut untuk pencarian, perpanjangan, dan berbagi.",
          },
          {
            q: "Apakah lebih aman daripada map di rumah?",
            a: "Kertas rentan kebakaran, banjir, dan hilang tanpa salinan. Di doki.help dokumen ada di cloud aman, hanya bisa diakses Anda dan orang yang Anda beri tautan.",
          },
          {
            q: "Bagaimana jika tidak ada internet?",
            a: "Dokumen yang sudah dibuka tersedia offline — di klinik, saat bepergian, atau saat roaming.",
          },
        ],
      },
      uz: {
        navLabel: "vs qogʻoz",
        altName: "Qogʻoz papka",
        title: "Raqamli hujjatlar yoki qogʻoz: qaysi biri qulayroq va ishonchliroq",
        subtitle:
          "Qogʻoz yirtiladi, yoʻqoladi va doim yoningizda boʻlmaydi. doki.help va uydagi qogʻoz papkada hujjat saqlashni taqqoslaymiz.",
        intro:
          "Qogʻoz papka ishonchli tuyuladi — toki sizga shoshilinch maʼlumotnoma kerak boʻlmaguncha, uni shifokorga koʻrsatmaguningizcha yoki yoʻqotgandan keyin tiklamaguningizcha. Raqamli ombor buni hal qiladi: hujjatlar doim qoʻl ostida, soniyalarda topiladi, ulashish oson va yoʻqotib boʻlmaydi.",
        rows: [
          { aspect: "Hujjatga kirish", alt: "Faqat uyda, papka turgan joyda", doki: "Telefondan istalgan joyda, oflayn ham" },
          { aspect: "Kerakligini topish", alt: "Papkani qoʻlda titkilash", doki: "Qidiruv va toifalar — soniyalarda" },
          { aspect: "Yoʻqolish va shikast", alt: "Yongʻin, suv toshqini, yoʻqolish — nusxa yoʻq", doki: "Nusxalar xavfsiz bulutda, hech narsa yoʻqolmaydi" },
          { aspect: "Muddat va yangilash", alt: "Yodda yoki daftarda saqlash", doki: "Muddatlar haqida oldindan eslatma" },
          { aspect: "Boshqaga berish", alt: "Nusxa olib, aslini berish", doki: "Xavfsiz havola — va uni bekor qilish mumkin" },
          { aspect: "Oila hujjatlari", alt: "Har kimda alohida papka", doki: "Har bir oila aʼzosi uchun profil bitta joyda" },
        ],
        verdict:
          "Asl nusxalar uchun qogʻoz hamon kerak. Lekin ishchi nusxa qoʻl ostida boʻlishi kerak — doki.help’da hujjatlarni papkalarni titmasdan topasiz, koʻrsatasiz va yangilaysiz.",
        faq: [
          {
            q: "doki.help qogʻoz hujjatlarning asl nusxalarini almashtiradimi?",
            a: "Yoʻq. doki.help — qoʻl ostidagi qulay nusxa: asl nusxalarni odatdagidek saqlang, skan va suratlar esa qidiruv, yangilash va ulashish uchun doim yoningizda.",
          },
          {
            q: "Bu uydagi papkadan xavfsizroqmi?",
            a: "Qogʻoz yongʻin, suv toshqini va nusxasiz yoʻqolishga moyil. doki.help’da hujjatlar xavfsiz bulutda, faqat siz va havola bergan odamlaringiz koʻra oladi.",
          },
          {
            q: "Internet boʻlmasa-chi?",
            a: "Ochilgan hujjatlar oflayn ham mavjud — shifokor qabulida, sayohatda yoki roumingda.",
          },
        ],
      },
    },
  },
  cloud: {
    emoji: "☁️",
    locales: {
      ru: {
        navLabel: "vs облако",
        altName: "Облако (Google Drive)",
        title: "doki.help или Google Drive: где хранить документы",
        subtitle:
          "Облако хранит любые файлы, но не понимает, что это за документы. Сравниваем универсальное облако и хранилище, заточенное под документы семьи.",
        intro:
          "В Google Drive или Dropbox можно сложить сканы, но дальше начинается ручная работа: придумывать папки, помнить сроки, искать нужное среди тысяч файлов. doki.help изначально устроен под документы — с категориями, напоминаниями и безопасным обменом.",
        rows: [
          { aspect: "Под что заточено", alt: "Любые файлы вперемешку", doki: "Только документы — категории и типы из коробки" },
          { aspect: "Поиск по типам", alt: "Только по имени файла", doki: "Категории: удостоверения, медицина, налоги, авто…" },
          { aspect: "Сроки и продления", alt: "Нет напоминаний", doki: "Напоминания о сроках паспорта, визы, полиса" },
          { aspect: "Безопасный обмен", alt: "Ссылка без срока, легко забыть закрыть", doki: "Временная ссылка, которую можно отозвать" },
          { aspect: "Члены семьи", alt: "Папки вручную на каждого", doki: "Готовые профили на каждого члена семьи" },
          { aspect: "Распознавание", alt: "Файл как файл", doki: "ИИ подсказывает тип и категорию документа" },
        ],
        verdict:
          "Облако — отличное общее хранилище. Но именно для документов doki.help экономит время: меньше ручной структуры, есть сроки и безопасная передача.",
        faq: [
          {
            q: "Чем doki.help лучше Google Drive для документов?",
            a: "Drive хранит любые файлы, но не знает, что внутри. doki.help понимает документы: раскладывает по категориям, напоминает о сроках и даёт безопасные ссылки с возможностью отзыва.",
          },
          {
            q: "Можно ли перенести документы из облака?",
            a: "Да. Загрузите сканы и фото из любого облака или галереи — doki.help сам подскажет категорию.",
          },
          {
            q: "Кто видит мои документы?",
            a: "Только вы и те, кому вы открыли доступ по ссылке. Ссылку можно отозвать в любой момент.",
          },
        ],
      },
      en: {
        navLabel: "vs cloud",
        altName: "Cloud (Google Drive)",
        title: "doki.help vs Google Drive: where to keep documents",
        subtitle:
          "The cloud stores any file but doesn't understand what the documents are. We compare a general cloud and a vault built for family documents.",
        intro:
          "You can drop scans into Google Drive or Dropbox, but then the manual work begins: inventing folders, remembering deadlines, finding the right file among thousands. doki.help is built for documents from the start — with categories, reminders and secure sharing.",
        rows: [
          { aspect: "What it's built for", alt: "Any files, all mixed together", doki: "Documents only — categories and types out of the box" },
          { aspect: "Search by type", alt: "By file name only", doki: "Categories: ID, medical, taxes, vehicle…" },
          { aspect: "Deadlines & renewals", alt: "No reminders", doki: "Reminders for passport, visa, insurance" },
          { aspect: "Secure sharing", alt: "A link with no expiry, easy to forget", doki: "A temporary link you can revoke" },
          { aspect: "Family members", alt: "Folders made by hand for each", doki: "Ready profiles per family member" },
          { aspect: "Recognition", alt: "A file is just a file", doki: "AI suggests the document's type and category" },
        ],
        verdict:
          "The cloud is a great general store. But for documents specifically, doki.help saves time: less manual structure, real deadlines and secure sharing.",
        faq: [
          {
            q: "Why is doki.help better than Google Drive for documents?",
            a: "Drive stores any file but doesn't know what's inside. doki.help understands documents: it sorts them into categories, reminds you of deadlines and gives secure links you can revoke.",
          },
          {
            q: "Can I move documents from the cloud?",
            a: "Yes. Upload scans and photos from any cloud or gallery — doki.help will suggest a category for you.",
          },
          {
            q: "Who can see my documents?",
            a: "Only you and those you grant access to via a link. The link can be revoked at any time.",
          },
        ],
      },
      id: {
        navLabel: "vs cloud",
        altName: "Cloud (Google Drive)",
        title: "doki.help vs Google Drive: di mana menyimpan dokumen",
        subtitle:
          "Cloud menyimpan file apa pun tapi tak memahami jenis dokumennya. Kami membandingkan cloud umum dan brankas yang dirancang untuk dokumen keluarga.",
        intro:
          "Anda bisa menaruh pindaian di Google Drive atau Dropbox, tapi setelah itu pekerjaan manual dimulai: membuat folder, mengingat tenggat, mencari file yang tepat di antara ribuan. doki.help dirancang untuk dokumen sejak awal — dengan kategori, pengingat, dan berbagi aman.",
        rows: [
          { aspect: "Dirancang untuk apa", alt: "File apa pun bercampur jadi satu", doki: "Khusus dokumen — kategori dan jenis siap pakai" },
          { aspect: "Cari berdasarkan jenis", alt: "Hanya berdasarkan nama file", doki: "Kategori: identitas, medis, pajak, kendaraan…" },
          { aspect: "Tenggat & perpanjangan", alt: "Tanpa pengingat", doki: "Pengingat paspor, visa, asuransi" },
          { aspect: "Berbagi aman", alt: "Tautan tanpa batas waktu, mudah lupa ditutup", doki: "Tautan sementara yang bisa dicabut" },
          { aspect: "Anggota keluarga", alt: "Folder dibuat manual per orang", doki: "Profil siap per anggota keluarga" },
          { aspect: "Pengenalan", alt: "File ya file saja", doki: "AI menyarankan jenis dan kategori dokumen" },
        ],
        verdict:
          "Cloud adalah penyimpanan umum yang bagus. Tapi khusus untuk dokumen, doki.help menghemat waktu: lebih sedikit penataan manual, ada tenggat, dan berbagi yang aman.",
        faq: [
          {
            q: "Kenapa doki.help lebih baik daripada Google Drive untuk dokumen?",
            a: "Drive menyimpan file apa pun tapi tak tahu isinya. doki.help memahami dokumen: menatanya ke dalam kategori, mengingatkan tenggat, dan memberi tautan aman yang bisa dicabut.",
          },
          {
            q: "Bisakah saya memindahkan dokumen dari cloud?",
            a: "Bisa. Unggah pindaian dan foto dari cloud atau galeri mana pun — doki.help akan menyarankan kategorinya.",
          },
          {
            q: "Siapa yang bisa melihat dokumen saya?",
            a: "Hanya Anda dan orang yang Anda beri akses lewat tautan. Tautan bisa dicabut kapan saja.",
          },
        ],
      },
      uz: {
        navLabel: "vs bulut",
        altName: "Bulut (Google Drive)",
        title: "doki.help yoki Google Drive: hujjatlarni qayerda saqlash kerak",
        subtitle:
          "Bulut istalgan faylni saqlaydi, lekin bu qanday hujjat ekanini tushunmaydi. Universal bulut va oila hujjatlari uchun moslangan omborni taqqoslaymiz.",
        intro:
          "Google Drive yoki Dropbox’ga skanlarni tashlash mumkin, lekin keyin qoʻl mehnati boshlanadi: papka oʻylab topish, muddatlarni eslab qolish, minglab fayl orasidan keraklisini topish. doki.help dastlabdan hujjatlar uchun moslangan — toifalar, eslatmalar va xavfsiz ulashish bilan.",
        rows: [
          { aspect: "Nimaga moslangan", alt: "Istalgan fayllar aralash", doki: "Faqat hujjatlar — toifa va turlar tayyor" },
          { aspect: "Tur boʻyicha qidiruv", alt: "Faqat fayl nomi boʻyicha", doki: "Toifalar: shaxsiy, tibbiy, soliq, transport…" },
          { aspect: "Muddat va yangilash", alt: "Eslatma yoʻq", doki: "Pasport, viza, sugʻurta muddati eslatmalari" },
          { aspect: "Xavfsiz ulashish", alt: "Muddatsiz havola, yopishni unutish oson", doki: "Bekor qilsa boʻladigan vaqtinchalik havola" },
          { aspect: "Oila aʼzolari", alt: "Har kimga qoʻlda papka", doki: "Har bir oila aʼzosi uchun tayyor profil" },
          { aspect: "Tanib olish", alt: "Fayl shunchaki fayl", doki: "AI hujjat turi va toifasini taklif qiladi" },
        ],
        verdict:
          "Bulut — ajoyib umumiy ombor. Lekin aynan hujjatlar uchun doki.help vaqtni tejaydi: qoʻlda tuzilma kamroq, muddatlar bor va ulashish xavfsiz.",
        faq: [
          {
            q: "Nega doki.help hujjatlar uchun Google Drive’dan yaxshiroq?",
            a: "Drive istalgan faylni saqlaydi, lekin ichida nima borligini bilmaydi. doki.help hujjatlarni tushunadi: toifalarga ajratadi, muddatlarni eslatadi va bekor qilsa boʻladigan xavfsiz havola beradi.",
          },
          {
            q: "Hujjatlarni bulutdan koʻchirish mumkinmi?",
            a: "Ha. Skan va suratlarni istalgan bulut yoki galereyadan yuklang — doki.help toifani oʻzi taklif qiladi.",
          },
          {
            q: "Hujjatlarimni kim koʻradi?",
            a: "Faqat siz va havola orqali ruxsat berganlaringiz. Havolani istalgan vaqtda bekor qilish mumkin.",
          },
        ],
      },
    },
  },
  gallery: {
    emoji: "📱",
    locales: {
      ru: {
        navLabel: "vs телефон",
        altName: "Галерея и мессенджеры",
        title: "Хранить документы в галерее телефона или в doki.help",
        subtitle:
          "Фото паспорта в галерее и сканы в чатах теряются среди мемов и снимков. Сравниваем привычный способ и порядок в doki.help.",
        intro:
          "Сфоткать документ и отправить себе в избранное — быстро, но через месяц это не найти. Фото тонут в галерее, чаты чистятся, при смене телефона часть пропадает. doki.help собирает документы отдельно от ленты фотографий и наводит порядок.",
        rows: [
          { aspect: "Где лежит", alt: "Среди тысяч фото и в десятке чатов", doki: "Отдельное хранилище только для документов" },
          { aspect: "Поиск нужного", alt: "Листать галерею и переписку", doki: "Категории и поиск — за секунды" },
          { aspect: "Смена телефона", alt: "Часть фото и чатов теряется", doki: "Документы в облаке, привязаны к аккаунту" },
          { aspect: "Сроки", alt: "Никто не напомнит", doki: "Напоминания о продлении заранее" },
          { aspect: "Передать врачу/школе", alt: "Искать и пересылать по одному", doki: "Собрать и поделиться ссылкой разом" },
          { aspect: "Порядок по людям", alt: "Всё в одной куче", doki: "Профиль на каждого члена семьи" },
        ],
        verdict:
          "Телефон под рукой, но галерея и чаты — не место для документов. doki.help хранит их отдельно: ничего не теряется, всё находится и продлевается вовремя.",
        faq: [
          {
            q: "Чем плохо хранить фото документов в галерее?",
            a: "Они смешиваются с личными снимками, их трудно найти, а при смене или потере телефона часть пропадает без копии.",
          },
          {
            q: "А если я уже отправлял документы в избранное в мессенджере?",
            a: "Перенесите их в doki.help один раз — дальше всё в одном месте, с категориями и напоминаниями.",
          },
          {
            q: "Это безопасно?",
            a: "Документы хранятся в защищённом облаке, доступ — только у вас и тех, кому вы дали временную ссылку.",
          },
        ],
      },
      en: {
        navLabel: "vs phone",
        altName: "Gallery & chats",
        title: "Keeping documents in your phone gallery vs in doki.help",
        subtitle:
          "A passport photo in your gallery and scans in chats get lost among memes and snapshots. We compare the usual way and order in doki.help.",
        intro:
          "Snapping a document and sending it to your saved messages is quick — but a month later you can't find it. Photos drown in the gallery, chats get cleared, and switching phones loses some. doki.help keeps documents apart from your photo feed and brings order.",
        rows: [
          { aspect: "Where it lives", alt: "Among thousands of photos and a dozen chats", doki: "A separate vault for documents only" },
          { aspect: "Finding the right one", alt: "Scroll the gallery and chat history", doki: "Categories and search — in seconds" },
          { aspect: "Switching phones", alt: "Some photos and chats get lost", doki: "Documents in the cloud, tied to your account" },
          { aspect: "Deadlines", alt: "Nobody reminds you", doki: "Renewal reminders in advance" },
          { aspect: "Sharing with a doctor/school", alt: "Find and forward one by one", doki: "Gather and share via one link" },
          { aspect: "Order by person", alt: "Everything in one pile", doki: "A profile per family member" },
        ],
        verdict:
          "Your phone is at hand, but the gallery and chats are no place for documents. doki.help keeps them separately: nothing gets lost, everything is found and renewed on time.",
        faq: [
          {
            q: "What's wrong with keeping document photos in the gallery?",
            a: "They mix with personal snapshots, are hard to find, and switching or losing your phone loses some with no copy.",
          },
          {
            q: "What if I already sent documents to my saved messages?",
            a: "Move them into doki.help once — then everything is in one place, with categories and reminders.",
          },
          {
            q: "Is it secure?",
            a: "Documents are kept in a secure cloud, accessible only to you and those you give a temporary link.",
          },
        ],
      },
      id: {
        navLabel: "vs ponsel",
        altName: "Galeri & chat",
        title: "Menyimpan dokumen di galeri ponsel vs di doki.help",
        subtitle:
          "Foto paspor di galeri dan pindaian di chat tenggelam di antara meme dan jepretan. Kami membandingkan cara biasa dan kerapian di doki.help.",
        intro:
          "Memotret dokumen lalu mengirimnya ke pesan tersimpan memang cepat — tapi sebulan kemudian sulit ditemukan. Foto tenggelam di galeri, chat dibersihkan, dan saat ganti ponsel sebagian hilang. doki.help menyimpan dokumen terpisah dari linimasa foto dan merapikannya.",
        rows: [
          { aspect: "Di mana tersimpan", alt: "Di antara ribuan foto dan belasan chat", doki: "Brankas terpisah khusus dokumen" },
          { aspect: "Menemukan yang tepat", alt: "Gulir galeri dan riwayat chat", doki: "Kategori dan pencarian — dalam detik" },
          { aspect: "Ganti ponsel", alt: "Sebagian foto dan chat hilang", doki: "Dokumen di cloud, terikat akun Anda" },
          { aspect: "Tenggat", alt: "Tak ada yang mengingatkan", doki: "Pengingat perpanjangan lebih awal" },
          { aspect: "Berbagi ke dokter/sekolah", alt: "Cari dan teruskan satu per satu", doki: "Kumpulkan dan bagikan lewat satu tautan" },
          { aspect: "Tertata per orang", alt: "Semua menumpuk jadi satu", doki: "Profil per anggota keluarga" },
        ],
        verdict:
          "Ponsel memang di tangan, tapi galeri dan chat bukan tempat untuk dokumen. doki.help menyimpannya terpisah: tak ada yang hilang, semua ditemukan dan diperpanjang tepat waktu.",
        faq: [
          {
            q: "Apa salahnya menyimpan foto dokumen di galeri?",
            a: "Foto bercampur dengan jepretan pribadi, sulit ditemukan, dan saat ganti atau kehilangan ponsel sebagian hilang tanpa salinan.",
          },
          {
            q: "Bagaimana jika saya sudah mengirim dokumen ke pesan tersimpan?",
            a: "Pindahkan sekali ke doki.help — selanjutnya semua di satu tempat, dengan kategori dan pengingat.",
          },
          {
            q: "Apakah aman?",
            a: "Dokumen disimpan di cloud aman, hanya bisa diakses Anda dan orang yang Anda beri tautan sementara.",
          },
        ],
      },
      uz: {
        navLabel: "vs telefon",
        altName: "Galereya va chatlar",
        title: "Hujjatlarni telefon galereyasida yoki doki.help’da saqlash",
        subtitle:
          "Galereyadagi pasport surati va chatlardagi skanlar memlar va suratlar orasida yoʻqoladi. Odatdagi usul va doki.help’dagi tartibni taqqoslaymiz.",
        intro:
          "Hujjatni suratga olib, oʻzingizga saqlangan xabarlarga yuborish tez — lekin bir oydan keyin uni topib boʻlmaydi. Suratlar galereyada choʻkadi, chatlar tozalanadi, telefon almashtirilganda bir qismi yoʻqoladi. doki.help hujjatlarni surat lentasidan ajratib saqlaydi va tartibga soladi.",
        rows: [
          { aspect: "Qayerda turadi", alt: "Minglab surat va oʻnlab chat orasida", doki: "Faqat hujjatlar uchun alohida ombor" },
          { aspect: "Kerakligini topish", alt: "Galereya va yozishmalarni varaqlash", doki: "Toifalar va qidiruv — soniyalarda" },
          { aspect: "Telefon almashtirish", alt: "Bir qism surat va chat yoʻqoladi", doki: "Hujjatlar bulutda, akkauntga bogʻlangan" },
          { aspect: "Muddatlar", alt: "Hech kim eslatmaydi", doki: "Yangilash haqida oldindan eslatma" },
          { aspect: "Shifokor/maktabga berish", alt: "Bittalab izlab yuborish", doki: "Yigʻib, bitta havola bilan ulashish" },
          { aspect: "Odamlar boʻyicha tartib", alt: "Hammasi bir uyumda", doki: "Har bir oila aʼzosi uchun profil" },
        ],
        verdict:
          "Telefon qoʻl ostida, lekin galereya va chatlar hujjatlar uchun joy emas. doki.help ularni alohida saqlaydi: hech narsa yoʻqolmaydi, hammasi topiladi va oʻz vaqtida yangilanadi.",
        faq: [
          {
            q: "Hujjat suratlarini galereyada saqlash nimasi yomon?",
            a: "Ular shaxsiy suratlar bilan aralashadi, topish qiyin, telefon almashtirilganda yoki yoʻqolganda bir qismi nusxasiz yoʻqoladi.",
          },
          {
            q: "Agar hujjatlarni allaqachon saqlangan xabarlarga yuborgan boʻlsam-chi?",
            a: "Ularni bir marta doki.help’ga koʻchiring — keyin hammasi bitta joyda, toifalar va eslatmalar bilan.",
          },
          {
            q: "Bu xavfsizmi?",
            a: "Hujjatlar xavfsiz bulutda saqlanadi, kirish — faqat sizda va vaqtinchalik havola berganlaringizda.",
          },
        ],
      },
    },
  },
  notary: {
    emoji: "📜",
    locales: {
      ru: {
        navLabel: "vs нотариус",
        altName: "Нотариальные копии",
        title: "Нотариальные копии или электронные документы: что под рукой",
        subtitle:
          "Заверенные копии лежат в папке и стоят денег за каждую. Сравниваем нотариальные копии и цифровые документы в doki.help.",
        intro:
          "Нотариальная копия нужна для официальных процедур, но в быту чаще требуется просто быстро показать или отправить документ. Платить за копию и хранить её в папке ради этого — лишнее. doki.help держит рабочие копии под рукой, а к нотариусу вы идёте только когда это действительно нужно.",
        rows: [
          { aspect: "Сколько стоит", alt: "Платно за каждую копию", doki: "Бесплатно, копий сколько нужно" },
          { aspect: "Где лежит", alt: "В бумажной папке дома", doki: "В телефоне, доступ из любой точки" },
          { aspect: "Быстро показать", alt: "Достать из папки, а она дома", doki: "Открыть на телефоне за секунды" },
          { aspect: "Передать другому", alt: "Отдать копию из рук в руки", doki: "Поделиться по защищённой ссылке" },
          { aspect: "Когда нужна", alt: "Для официальных процедур", doki: "Для повседневного доступа и обмена" },
          { aspect: "Потеря", alt: "Сделать и оплатить заново", doki: "Копия в облаке, не потеряется" },
        ],
        verdict:
          "Нотариальная копия незаменима там, где нужна официально заверенная бумага. Но для повседневных задач — показать, отправить, не потерять — удобнее цифровая копия в doki.help.",
        faq: [
          {
            q: "Заменяет ли doki.help нотариально заверенную копию?",
            a: "Нет. Для официальных процедур нужна заверенная копия. doki.help хранит рабочие копии для повседневного доступа, поиска и обмена.",
          },
          {
            q: "Зачем хранить документы цифрово, если есть нотариальные копии?",
            a: "Заверенная копия нужна редко и стоит денег. Цифровая копия под рукой всегда — её можно показать, отправить и не платить за каждую.",
          },
          {
            q: "Это безопасно?",
            a: "Документы лежат в защищённом облаке, доступ — только у вас и тех, кому вы дали временную ссылку.",
          },
        ],
      },
      en: {
        navLabel: "vs notary",
        altName: "Notarized copies",
        title: "Notarized copies vs digital documents: what's at hand",
        subtitle:
          "Certified copies sit in a folder and cost money each time. We compare notarized copies and digital documents in doki.help.",
        intro:
          "A notarized copy is needed for official procedures, but day to day you usually just need to show or send a document quickly. Paying for a copy and keeping it in a folder for that is overkill. doki.help keeps working copies at hand, and you visit a notary only when it's truly required.",
        rows: [
          { aspect: "What it costs", alt: "Paid for each copy", doki: "Free, as many copies as you need" },
          { aspect: "Where it lives", alt: "In a paper folder at home", doki: "On your phone, accessible anywhere" },
          { aspect: "Showing it quickly", alt: "Dig it out of the folder, which is at home", doki: "Open it on your phone in seconds" },
          { aspect: "Handing to someone", alt: "Hand over a copy in person", doki: "Share via a secure link" },
          { aspect: "When it's needed", alt: "For official procedures", doki: "For everyday access and sharing" },
          { aspect: "Loss", alt: "Make and pay for it again", doki: "A copy in the cloud, never lost" },
        ],
        verdict:
          "A notarized copy is irreplaceable where an officially certified paper is required. But for everyday tasks — show, send, don't lose — a digital copy in doki.help is handier.",
        faq: [
          {
            q: "Does doki.help replace a notarized copy?",
            a: "No. Official procedures need a certified copy. doki.help keeps working copies for everyday access, search and sharing.",
          },
          {
            q: "Why keep documents digitally if I have notarized copies?",
            a: "A certified copy is rarely needed and costs money. A digital copy is always at hand — show it, send it, and pay nothing per copy.",
          },
          {
            q: "Is it secure?",
            a: "Documents are kept in a secure cloud, accessible only to you and those you give a temporary link.",
          },
        ],
      },
      id: {
        navLabel: "vs notaris",
        altName: "Salinan ternotarisasi",
        title: "Salinan ternotarisasi vs dokumen digital: mana yang siap pakai",
        subtitle:
          "Salinan tersertifikasi tersimpan di map dan berbiaya tiap kali. Kami membandingkan salinan notaris dan dokumen digital di doki.help.",
        intro:
          "Salinan ternotarisasi diperlukan untuk prosedur resmi, tapi sehari-hari Anda biasanya hanya perlu menunjukkan atau mengirim dokumen dengan cepat. Membayar salinan dan menyimpannya di map untuk itu berlebihan. doki.help menyimpan salinan kerja yang siap pakai, dan Anda ke notaris hanya saat benar-benar perlu.",
        rows: [
          { aspect: "Berapa biayanya", alt: "Berbayar tiap salinan", doki: "Gratis, sebanyak yang dibutuhkan" },
          { aspect: "Di mana tersimpan", alt: "Di map kertas di rumah", doki: "Di ponsel, bisa diakses di mana saja" },
          { aspect: "Menunjukkan cepat", alt: "Mengeluarkannya dari map yang ada di rumah", doki: "Buka di ponsel dalam hitungan detik" },
          { aspect: "Menyerahkan ke orang lain", alt: "Menyerahkan salinan langsung", doki: "Bagikan lewat tautan aman" },
          { aspect: "Kapan diperlukan", alt: "Untuk prosedur resmi", doki: "Untuk akses dan berbagi sehari-hari" },
          { aspect: "Hilang", alt: "Buat dan bayar lagi", doki: "Salinan di cloud, tak akan hilang" },
        ],
        verdict:
          "Salinan ternotarisasi tak tergantikan di mana dokumen tersertifikasi resmi diperlukan. Tapi untuk tugas sehari-hari — menunjukkan, mengirim, tak kehilangan — salinan digital di doki.help lebih praktis.",
        faq: [
          {
            q: "Apakah doki.help menggantikan salinan ternotarisasi?",
            a: "Tidak. Prosedur resmi memerlukan salinan tersertifikasi. doki.help menyimpan salinan kerja untuk akses, pencarian, dan berbagi sehari-hari.",
          },
          {
            q: "Mengapa menyimpan dokumen digital jika punya salinan notaris?",
            a: "Salinan tersertifikasi jarang dibutuhkan dan berbiaya. Salinan digital selalu siap — tunjukkan, kirim, tanpa bayar per salinan.",
          },
          {
            q: "Apakah aman?",
            a: "Dokumen disimpan di cloud aman, hanya bisa diakses Anda dan orang yang Anda beri tautan sementara.",
          },
        ],
      },
      uz: {
        navLabel: "vs notarius",
        altName: "Notarial nusxalar",
        title: "Notarial nusxalar yoki raqamli hujjatlar: qaysi biri qoʻl ostida",
        subtitle:
          "Tasdiqlangan nusxalar papkada turadi va har safar pul turadi. Notarial nusxalar va doki.help’dagi raqamli hujjatlarni taqqoslaymiz.",
        intro:
          "Notarial nusxa rasmiy jarayonlar uchun kerak, lekin kundalik hayotda odatda hujjatni tez koʻrsatish yoki yuborish kifoya. Buning uchun nusxaga pul toʻlab, uni papkada saqlash ortiqcha. doki.help ishchi nusxalarni qoʻl ostida saqlaydi, notariusga esa faqat haqiqatan kerak boʻlganda borasiz.",
        rows: [
          { aspect: "Qancha turadi", alt: "Har nusxa uchun pullik", doki: "Bepul, kerakli miqdorda nusxa" },
          { aspect: "Qayerda turadi", alt: "Uydagi qogʻoz papkada", doki: "Telefonda, istalgan joydan kirish" },
          { aspect: "Tez koʻrsatish", alt: "Uydagi papkadan olish", doki: "Telefonda soniyalarda ochish" },
          { aspect: "Boshqaga berish", alt: "Nusxani qoʻlma-qoʻl berish", doki: "Xavfsiz havola orqali ulashish" },
          { aspect: "Qachon kerak", alt: "Rasmiy jarayonlar uchun", doki: "Kundalik kirish va ulashish uchun" },
          { aspect: "Yoʻqolish", alt: "Qaytadan qilish va toʻlash", doki: "Bulutdagi nusxa yoʻqolmaydi" },
        ],
        verdict:
          "Notarial nusxa rasmiy tasdiqlangan qogʻoz talab qilinadigan joyda oʻrnini bosib boʻlmaydi. Lekin kundalik ishlar uchun — koʻrsatish, yuborish, yoʻqotmaslik — doki.help’dagi raqamli nusxa qulayroq.",
        faq: [
          {
            q: "doki.help notarial nusxani almashtiradimi?",
            a: "Yoʻq. Rasmiy jarayonlar tasdiqlangan nusxani talab qiladi. doki.help kundalik kirish, qidiruv va ulashish uchun ishchi nusxalarni saqlaydi.",
          },
          {
            q: "Notarial nusxalar boʻlsa, nega hujjatlarni raqamli saqlash kerak?",
            a: "Tasdiqlangan nusxa kamdan-kam kerak va pullik. Raqamli nusxa doim qoʻl ostida — koʻrsating, yuboring va har nusxa uchun toʻlamang.",
          },
          {
            q: "Bu xavfsizmi?",
            a: "Hujjatlar xavfsiz bulutda saqlanadi, kirish — faqat sizda va vaqtinchalik havola berganlaringizda.",
          },
        ],
      },
    },
  },
  gosuslugi: {
    emoji: "🏛️",
    locales: {
      ru: {
        navLabel: "vs Госуслуги",
        altName: "Папка на Госуслугах",
        title: "Документы на Госуслугах или в doki.help: в чём разница",
        subtitle:
          "На Госуслугах часть документов появляется автоматически, но не все и не для всей семьи. Сравниваем госпортал и личное хранилище документов.",
        intro:
          "Госуслуги удобны для части документов — тех, что есть в государственных базах. Но загранпаспорт супруга, прививочный сертификат ребёнка, договор аренды или диплом туда не положишь. doki.help — это ваше личное хранилище для всех документов семьи, а не только тех, что завёл портал.",
        rows: [
          { aspect: "Какие документы", alt: "Только из госбаз", doki: "Любые: сканы, фото, договоры, дипломы" },
          { aspect: "Документы семьи", alt: "В основном только ваши", doki: "Профиль на каждого члена семьи" },
          { aspect: "Загрузить своё", alt: "Нельзя добавить произвольный документ", doki: "Загрузите любой скан или фото" },
          { aspect: "Поделиться", alt: "Не предназначено для обмена", doki: "Защищённая ссылка с возможностью отзыва" },
          { aspect: "Офлайн-доступ", alt: "Нужен вход и интернет", doki: "Открытые документы доступны офлайн" },
          { aspect: "Напоминания о сроках", alt: "Только по части услуг", doki: "По любому документу: паспорт, виза, ОСАГО" },
        ],
        verdict:
          "Госуслуги — отличный источник государственных документов. doki.help дополняет их: хранит то, чего на портале нет, собирает документы всей семьи и даёт безопасно делиться ими.",
        faq: [
          {
            q: "Зачем хранить документы в doki.help, если есть Госуслуги?",
            a: "На Госуслугах есть только документы из госбаз и в основном ваши. doki.help хранит любые сканы и фото — договоры, дипломы, медкарту — и документы всей семьи.",
          },
          {
            q: "Можно ли сохранить документы с Госуслуг в doki.help?",
            a: "Да. Скачайте PDF или сделайте скан и загрузите в doki.help — он подскажет категорию, и документ будет под рукой даже офлайн.",
          },
          {
            q: "Чем удобнее обмен через doki.help?",
            a: "Можно поделиться конкретным документом по временной ссылке и отозвать доступ в любой момент — портал для этого не предназначен.",
          },
        ],
      },
    },
  },
  "google-drive": {
    emoji: "📁",
    locales: {
      ru: {
        navLabel: "vs Google Drive",
        altName: "Google Drive",
        title: "doki.help или Google Drive: где держать важные документы",
        subtitle:
          "Google Drive — отличное универсальное облако. Но документам семьи нужны типы, сроки и отзываемые ссылки. Разбираем разницу честно.",
        intro:
          "Google Drive прекрасно справляется с любыми файлами: много места, удобная экосистема, всё под рукой. Но как только речь о паспортах, визах и медкарте, начинается ручная работа — папки, поиск по имени файла, сроки в голове. doki.help изначально устроен под документы: категории, напоминания о сроках, профили членов семьи и безопасная выдача доступа.",
        rows: [
          { aspect: "Под что заточено", alt: "Универсальное облако для любых файлов", doki: "Хранилище именно под документы — типы и категории из коробки" },
          { aspect: "Поиск по типам", alt: "По имени файла и папкам", doki: "Категории: удостоверения, медицина, налоги, авто…" },
          { aspect: "Сроки и продления", alt: "Нет напоминаний из коробки", doki: "Email-напоминания о сроках паспорта, визы, полиса" },
          { aspect: "Выдача доступа", alt: "Ссылка на файл или папку", doki: "Истекающая ссылка с лимитом просмотров, отзывом и журналом открытий" },
          { aspect: "Члены семьи", alt: "Папки и доступы вручную", doki: "Профиль на каждого члена семьи, роли owner/editor/viewer" },
          { aspect: "Распознавание", alt: "Файл как файл", doki: "ИИ подсказывает тип, категорию и даты при загрузке (можно поправить)" },
        ],
        verdict:
          "Google Drive — отличное общее облако, и оно никуда не денется. Но именно для документов семьи doki.help снимает ручную работу: типы, сроки и безопасная передача с отзывом. doki.help пока в бете и не заменяет оригиналы.",
        faq: [
          {
            q: "doki.help — это замена Google Drive?",
            a: "Нет. Google Drive — универсальное облако для любых файлов. doki.help — это специализированный сейф под документы: категории, напоминания о сроках и безопасная выдача доступа. Многие используют оба.",
          },
          {
            q: "Можно ли импортировать документы из Google Drive?",
            a: "Автоматического импорта пока нет. Скачайте нужные файлы из Google Drive и загрузите их в doki.help — при загрузке ИИ подскажет тип и категорию.",
          },
          {
            q: "Google Drive менее безопасен?",
            a: "Мы так не утверждаем — это надёжное облако Google. Разница в модели доступа: в doki.help документы видит только ваша семья (изоляция на уровне базы), а доступ выдаётся по истекающей и отзываемой ссылке с журналом открытий.",
          },
          {
            q: "doki.help напоминает о сроках?",
            a: "Да. Укажите дату «действует до» — и придёт email-напоминание заранее. В обычном облаке такого из коробки нет.",
          },
          {
            q: "Это бесплатно?",
            a: "Да. Сейчас бесплатно: 2 ГБ, напоминания, семейный доступ и офлайн-доступ. Продукт в бете.",
          },
        ],
      },
      en: {
        navLabel: "vs Google Drive",
        altName: "Google Drive",
        title: "doki.help vs Google Drive for important documents",
        subtitle:
          "Google Drive is a great general-purpose cloud. But family documents also need types, expiry reminders and revocable links. Here's the honest difference.",
        intro:
          "Google Drive is excellent at handling any file: lots of space, a familiar ecosystem, everything in one account. But the moment it's passports, visas and medical records, the manual work begins — folders, searching by file name, deadlines kept in your head. doki.help is built for documents from the start: categories, expiry reminders, per-member profiles and secure, revocable sharing.",
        rows: [
          { aspect: "What it's built for", alt: "A general cloud for any file", doki: "A vault for documents — types and categories out of the box" },
          { aspect: "Search by type", alt: "By file name and folders", doki: "Categories: ID, medical, taxes, vehicle…" },
          { aspect: "Deadlines & renewals", alt: "No reminders out of the box", doki: "Email reminders for passport, visa, insurance" },
          { aspect: "Granting access", alt: "A link to a file or folder", doki: "An expiring link with a view limit, revoke and access log" },
          { aspect: "Family members", alt: "Folders and access set by hand", doki: "A profile per family member, owner/editor/viewer roles" },
          { aspect: "Recognition", alt: "A file is just a file", doki: "AI suggests type, category and dates on upload (editable)" },
        ],
        verdict:
          "Google Drive is a great general cloud and isn't going anywhere. But for family documents specifically, doki.help removes the manual work: types, deadlines and secure sharing you can revoke. doki.help is in beta and doesn't replace your originals.",
        faq: [
          {
            q: "Is doki.help a replacement for Google Drive?",
            a: "No. Google Drive is a general cloud for any file. doki.help is a specialized vault for documents: categories, expiry reminders and secure sharing. Many people use both.",
          },
          {
            q: "Can I import documents from Google Drive?",
            a: "There's no automatic import yet. Download the files you need from Google Drive and upload them to doki.help — on upload, AI suggests the type and category for you.",
          },
          {
            q: "Is Google Drive less secure?",
            a: "We don't claim that — it's a reliable Google cloud. The difference is the access model: in doki.help only your family sees documents (database-level isolation), and you grant access via an expiring, revocable link with an access log.",
          },
          {
            q: "Does doki.help remind me about expiry dates?",
            a: "Yes. Set a \"valid until\" date and get an email reminder in advance. A general cloud doesn't do that out of the box.",
          },
          {
            q: "Is it free?",
            a: "Yes. Right now it's free: 2 GB, reminders, family access and offline access. The product is in beta.",
          },
        ],
      },
      id: {
        navLabel: "vs Google Drive",
        altName: "Google Drive",
        title: "doki.help vs Google Drive untuk dokumen penting",
        subtitle:
          "Google Drive adalah cloud serbaguna yang hebat. Tapi dokumen keluarga juga butuh jenis, pengingat tenggat, dan tautan yang bisa dicabut. Ini bedanya secara jujur.",
        intro:
          "Google Drive hebat menangani file apa pun: ruang besar, ekosistem yang familier, semua dalam satu akun. Tapi begitu menyangkut paspor, visa, dan rekam medis, pekerjaan manual dimulai — folder, mencari lewat nama file, tenggat yang harus diingat sendiri. doki.help dirancang untuk dokumen sejak awal: kategori, pengingat tenggat, profil per anggota, dan berbagi aman yang bisa dicabut.",
        rows: [
          { aspect: "Dirancang untuk apa", alt: "Cloud umum untuk file apa pun", doki: "Brankas khusus dokumen — jenis dan kategori siap pakai" },
          { aspect: "Cari berdasarkan jenis", alt: "Berdasarkan nama file dan folder", doki: "Kategori: identitas, medis, pajak, kendaraan…" },
          { aspect: "Tenggat & perpanjangan", alt: "Tanpa pengingat bawaan", doki: "Pengingat email untuk paspor, visa, asuransi" },
          { aspect: "Memberi akses", alt: "Tautan ke file atau folder", doki: "Tautan kedaluwarsa dengan batas tampilan, pencabutan, dan log akses" },
          { aspect: "Anggota keluarga", alt: "Folder dan akses diatur manual", doki: "Profil per anggota keluarga, peran owner/editor/viewer" },
          { aspect: "Pengenalan", alt: "File ya file saja", doki: "AI menyarankan jenis, kategori, dan tanggal saat unggah (bisa diedit)" },
        ],
        verdict:
          "Google Drive adalah cloud umum yang hebat dan akan tetap berguna. Tapi khusus untuk dokumen keluarga, doki.help menghapus pekerjaan manual: jenis, tenggat, dan berbagi aman yang bisa dicabut. doki.help masih beta dan tidak menggantikan dokumen asli.",
        faq: [
          {
            q: "Apakah doki.help pengganti Google Drive?",
            a: "Tidak. Google Drive adalah cloud umum untuk file apa pun. doki.help adalah brankas khusus dokumen: kategori, pengingat tenggat, dan berbagi aman. Banyak orang memakai keduanya.",
          },
          {
            q: "Bisakah saya mengimpor dokumen dari Google Drive?",
            a: "Belum ada impor otomatis. Unduh file yang Anda butuhkan dari Google Drive lalu unggah ke doki.help — saat diunggah, AI menyarankan jenis dan kategorinya.",
          },
          {
            q: "Apakah Google Drive kurang aman?",
            a: "Kami tidak mengeklaim itu — Google Drive adalah cloud Google yang andal. Bedanya pada model akses: di doki.help hanya keluarga Anda yang melihat dokumen (isolasi tingkat basis data), dan akses diberikan lewat tautan kedaluwarsa yang bisa dicabut, dengan log akses.",
          },
          {
            q: "Apakah doki.help mengingatkan tenggat?",
            a: "Ya. Atur tanggal \"berlaku hingga\" dan terima pengingat email lebih awal. Cloud umum tidak melakukannya secara bawaan.",
          },
          {
            q: "Apakah gratis?",
            a: "Ya. Saat ini gratis: 2 GB, pengingat, akses keluarga, dan akses offline. Produk masih beta.",
          },
        ],
      },
      uz: {
        navLabel: "vs Google Drive",
        altName: "Google Drive",
        title: "doki.help yoki Google Drive: muhim hujjatlarni qayerda saqlash",
        subtitle:
          "Google Drive — ajoyib universal bulut. Lekin oila hujjatlariga turlar, muddat eslatmalari va bekor qilinadigan havolalar ham kerak. Farqni halol koʻrsatamiz.",
        intro:
          "Google Drive istalgan fayl bilan ajoyib ishlaydi: koʻp joy, qulay ekotizim, hammasi bitta akkauntda. Lekin gap pasport, viza va tibbiy hujjatlarga kelganda, qoʻl mehnati boshlanadi — papkalar, fayl nomi boʻyicha qidiruv, yodda saqlanadigan muddatlar. doki.help dastlabdan hujjatlar uchun moslangan: toifalar, muddat eslatmalari, har bir aʼzo uchun profil va xavfsiz, bekor qilinadigan ulashish.",
        rows: [
          { aspect: "Nimaga moslangan", alt: "Istalgan fayl uchun umumiy bulut", doki: "Aynan hujjatlar uchun ombor — turlar va toifalar tayyor" },
          { aspect: "Tur boʻyicha qidiruv", alt: "Fayl nomi va papkalar boʻyicha", doki: "Toifalar: shaxsiy, tibbiy, soliq, transport…" },
          { aspect: "Muddat va yangilash", alt: "Tayyor eslatmalar yoʻq", doki: "Pasport, viza, sugʻurta muddati uchun email eslatmalar" },
          { aspect: "Ruxsat berish", alt: "Fayl yoki papkaga havola", doki: "Koʻrish chekloviga ega, bekor qilinadigan, jurnal yuritiladigan muddatli havola" },
          { aspect: "Oila aʼzolari", alt: "Papka va ruxsatlar qoʻlda", doki: "Har bir oila aʼzosi uchun profil, owner/editor/viewer rollari" },
          { aspect: "Tanib olish", alt: "Fayl shunchaki fayl", doki: "AI yuklashda tur, toifa va sanalarni taklif qiladi (tahrirlasa boʻladi)" },
        ],
        verdict:
          "Google Drive — ajoyib umumiy bulut va kerakligicha qoladi. Lekin aynan oila hujjatlari uchun doki.help qoʻl mehnatini olib tashlaydi: turlar, muddatlar va bekor qilsa boʻladigan xavfsiz ulashish. doki.help hozircha betada va asl nusxalar oʻrnini bosmaydi.",
        faq: [
          {
            q: "doki.help Google Drive oʻrnini bosadimi?",
            a: "Yoʻq. Google Drive — istalgan fayl uchun umumiy bulut. doki.help — hujjatlar uchun maxsus sejf: toifalar, muddat eslatmalari va xavfsiz ulashish. Koʻpchilik ikkalasidan ham foydalanadi.",
          },
          {
            q: "Hujjatlarni Google Drive’dan import qilsa boʻladimi?",
            a: "Avtomatik import hozircha yoʻq. Kerakli fayllarni Google Drive’dan yuklab oling va doki.help’ga yuklang — yuklashda AI tur va toifani oʻzi taklif qiladi.",
          },
          {
            q: "Google Drive xavfsizroq emasmi?",
            a: "Biz bunday demaymiz — bu ishonchli Google buluti. Farq kirish modelida: doki.help’da hujjatlarni faqat oilangiz koʻradi (maʼlumotlar bazasi darajasidagi izolyatsiya), ruxsat esa jurnal yuritiladigan, muddatli va bekor qilinadigan havola orqali beriladi.",
          },
          {
            q: "doki.help muddatlar haqida eslatadimi?",
            a: "Ha. \"Amal qilish muddati\" sanasini kiriting — va oldindan email eslatma keladi. Umumiy bulut buni tayyor holda qilmaydi.",
          },
          {
            q: "Bu bepulmi?",
            a: "Ha. Hozir bepul: 2 GB, eslatmalar, oilaviy kirish va oflayn kirish. Mahsulot betada.",
          },
        ],
      },
    },
  },
  "telegram": {
    emoji: "✈️",
    locales: {
      ru: {
        navLabel: "vs Telegram",
        altName: "Telegram (Избранное)",
        title: "Telegram Избранное или настоящий сейф документов",
        subtitle:
          "Отправить документ в «Избранное» — быстро. Найти его через месяц — нет. Сравниваем привычку Saved Messages и структурированный сейф.",
        intro:
          "Telegram быстрый и всегда под рукой, поэтому многие складывают сканы в «Избранное» — это удобно. Но через месяц документ тонет в общей ленте: нет типов, категорий и сроков, а при смене аккаунта всё это легко потерять. doki.help хранит документы отдельно от переписки — с категориями, напоминаниями и безопасной выдачей доступа.",
        rows: [
          { aspect: "Структура", alt: "Одна лента «Избранного», всё подряд", doki: "Категории и типы: удостоверения, медицина, авто…" },
          { aspect: "Поиск нужного", alt: "Листать ленту и искать по тексту", doki: "Поиск и фильтры по типу — за секунды" },
          { aspect: "Сроки и продления", alt: "Никто не напомнит", doki: "Email-напоминания о сроках заранее" },
          { aspect: "Смена телефона/аккаунта", alt: "Доступ привязан к аккаунту Telegram", doki: "Документы в сейфе, есть экспорт архива" },
          { aspect: "Выдача доступа", alt: "Переслать файл, дальше он у получателя навсегда", doki: "Истекающая ссылка с лимитом просмотров и отзывом" },
          { aspect: "Документы семьи", alt: "Всё в одном чате с собой", doki: "Профиль на каждого члена семьи, роли доступа" },
        ],
        verdict:
          "Telegram удобен для быстрой пересылки, и чаты в нём защищены. Но как картотека документов «Избранное» не работает: нет структуры, сроков и контроля над выданным доступом. doki.help закрывает именно это. Продукт в бете и не заменяет оригиналы.",
        faq: [
          {
            q: "Безопасно ли хранить документы в Telegram?",
            a: "Telegram — надёжный мессенджер, и чаты в нём защищены. Дело не в этом: «Избранное» не задумано как система хранения документов — нет типов, сроков и удобного поиска, а доступ привязан к аккаунту.",
          },
          {
            q: "Получится ли быстро найти нужный документ?",
            a: "В ленте «Избранного» — вряд ли. В doki.help документы разложены по категориям и типам, есть поиск и фильтры, поэтому нужное находится за секунды.",
          },
          {
            q: "Потеряю ли я документы при смене телефона или аккаунта?",
            a: "Доступ к «Избранному» завязан на аккаунт Telegram. В doki.help документы лежат в вашем сейфе и привязаны к аккаунту, а архив можно выгрузить.",
          },
          {
            q: "doki.help напоминает о сроках?",
            a: "Да. Укажите дату «действует до» — придёт email-напоминание заранее, чтобы паспорт, виза или полис не истекли незаметно.",
          },
          {
            q: "Это бесплатно?",
            a: "Да. Сейчас бесплатно: 2 ГБ, напоминания, семейный доступ и офлайн-доступ. Продукт в бете.",
          },
        ],
      },
      en: {
        navLabel: "vs Telegram",
        altName: "Telegram (Saved Messages)",
        title: "Telegram Saved Messages vs a real document vault",
        subtitle:
          "Saving a document to Saved Messages is fast. Finding it a month later isn't. We compare the Saved Messages habit with a structured vault.",
        intro:
          "Telegram is fast and always with you, so many people drop scans into Saved Messages — it's convenient. But a month later the document drowns in one long feed: no types, categories or deadlines, and it's easy to lose if you change accounts. doki.help keeps documents apart from your chats — with categories, reminders and secure, revocable sharing.",
        rows: [
          { aspect: "Structure", alt: "One Saved Messages feed, everything in a row", doki: "Categories and types: ID, medical, vehicle…" },
          { aspect: "Finding the right one", alt: "Scroll the feed and search by text", doki: "Search and filters by type — in seconds" },
          { aspect: "Deadlines & renewals", alt: "Nobody reminds you", doki: "Email reminders for deadlines in advance" },
          { aspect: "Switching phone/account", alt: "Access is tied to your Telegram account", doki: "Documents in a vault, with archive export" },
          { aspect: "Granting access", alt: "Forward a file and the recipient keeps it forever", doki: "An expiring link with a view limit and revoke" },
          { aspect: "Family documents", alt: "Everything in one chat with yourself", doki: "A profile per family member, access roles" },
        ],
        verdict:
          "Telegram is handy for quick forwarding, and its chats are encrypted. But as a filing system, Saved Messages doesn't work: no structure, no deadlines, no control over access once it's shared. doki.help covers exactly that. The product is in beta and doesn't replace your originals.",
        faq: [
          {
            q: "Is Telegram safe for documents?",
            a: "Telegram is a solid messenger and its chats are encrypted. That's not the issue: Saved Messages isn't designed as a document storage system — no types, deadlines or easy search, and access is tied to your account.",
          },
          {
            q: "Can I find a document quickly?",
            a: "In the Saved Messages feed, probably not. In doki.help documents are sorted by category and type, with search and filters, so the right one shows up in seconds.",
          },
          {
            q: "Will I lose documents if I change phone or account?",
            a: "Access to Saved Messages is bound to your Telegram account. In doki.help documents live in your vault, tied to your account, and you can export an archive.",
          },
          {
            q: "Does doki.help remind me about deadlines?",
            a: "Yes. Set a \"valid until\" date and get an email reminder in advance, so a passport, visa or insurance doesn't expire unnoticed.",
          },
          {
            q: "Is it free?",
            a: "Yes. Right now it's free: 2 GB, reminders, family access and offline access. The product is in beta.",
          },
        ],
      },
      id: {
        navLabel: "vs Telegram",
        altName: "Telegram (Pesan Tersimpan)",
        title: "Telegram Pesan Tersimpan vs brankas dokumen sungguhan",
        subtitle:
          "Menyimpan dokumen ke Pesan Tersimpan itu cepat. Menemukannya sebulan kemudian tidak. Kami membandingkan kebiasaan Saved Messages dengan brankas terstruktur.",
        intro:
          "Telegram cepat dan selalu ikut bersama Anda, jadi banyak orang menaruh pindaian ke Pesan Tersimpan — praktis. Tapi sebulan kemudian dokumen tenggelam di satu linimasa panjang: tanpa jenis, kategori, atau tenggat, dan mudah hilang jika ganti akun. doki.help menyimpan dokumen terpisah dari chat — dengan kategori, pengingat, dan berbagi aman yang bisa dicabut.",
        rows: [
          { aspect: "Struktur", alt: "Satu linimasa Pesan Tersimpan, semua beruntun", doki: "Kategori dan jenis: identitas, medis, kendaraan…" },
          { aspect: "Menemukan yang tepat", alt: "Gulir linimasa dan cari lewat teks", doki: "Pencarian dan filter per jenis — dalam detik" },
          { aspect: "Tenggat & perpanjangan", alt: "Tak ada yang mengingatkan", doki: "Pengingat email untuk tenggat lebih awal" },
          { aspect: "Ganti ponsel/akun", alt: "Akses terikat akun Telegram Anda", doki: "Dokumen di brankas, dengan ekspor arsip" },
          { aspect: "Memberi akses", alt: "Teruskan file lalu penerima menyimpannya selamanya", doki: "Tautan kedaluwarsa dengan batas tampilan dan pencabutan" },
          { aspect: "Dokumen keluarga", alt: "Semua di satu chat dengan diri sendiri", doki: "Profil per anggota keluarga, peran akses" },
        ],
        verdict:
          "Telegram praktis untuk meneruskan cepat, dan chat-nya terenkripsi. Tapi sebagai sistem pengarsipan, Pesan Tersimpan tidak berfungsi: tanpa struktur, tanpa tenggat, tanpa kendali atas akses setelah dibagikan. doki.help menutup persis hal itu. Produk masih beta dan tidak menggantikan dokumen asli.",
        faq: [
          {
            q: "Apakah Telegram aman untuk dokumen?",
            a: "Telegram adalah pesan instan yang solid dan chat-nya terenkripsi. Bukan itu masalahnya: Pesan Tersimpan tidak dirancang sebagai sistem penyimpanan dokumen — tanpa jenis, tenggat, atau pencarian mudah, dan akses terikat akun Anda.",
          },
          {
            q: "Bisakah saya menemukan dokumen dengan cepat?",
            a: "Di linimasa Pesan Tersimpan, kemungkinan tidak. Di doki.help dokumen tertata per kategori dan jenis, dengan pencarian dan filter, jadi yang tepat muncul dalam detik.",
          },
          {
            q: "Apakah dokumen hilang jika ganti ponsel atau akun?",
            a: "Akses ke Pesan Tersimpan terikat akun Telegram Anda. Di doki.help dokumen ada di brankas Anda, terikat akun, dan Anda bisa mengekspor arsip.",
          },
          {
            q: "Apakah doki.help mengingatkan tenggat?",
            a: "Ya. Atur tanggal \"berlaku hingga\" dan terima pengingat email lebih awal, agar paspor, visa, atau asuransi tidak kedaluwarsa tanpa disadari.",
          },
          {
            q: "Apakah gratis?",
            a: "Ya. Saat ini gratis: 2 GB, pengingat, akses keluarga, dan akses offline. Produk masih beta.",
          },
        ],
      },
      uz: {
        navLabel: "vs Telegram",
        altName: "Telegram (Saqlangan xabarlar)",
        title: "Telegram Saqlangan xabarlar yoki asl hujjat sejfi",
        subtitle:
          "Hujjatni «Saqlangan»ga yuborish — tez. Bir oydan keyin uni topish — yoʻq. Saved Messages odati va tuzilgan sejfni taqqoslaymiz.",
        intro:
          "Telegram tez va doim yoningizda, shu sabab koʻpchilik skanlarni «Saqlangan xabarlar»ga tashlaydi — bu qulay. Lekin bir oydan keyin hujjat bitta uzun lentada choʻkadi: turlar, toifalar va muddatlar yoʻq, akkaunt almashtirilganda esa osongina yoʻqoladi. doki.help hujjatlarni yozishmalardan ajratib saqlaydi — toifalar, eslatmalar va bekor qilinadigan xavfsiz ulashish bilan.",
        rows: [
          { aspect: "Tuzilma", alt: "Bitta «Saqlangan» lenta, hammasi ketma-ket", doki: "Toifa va turlar: shaxsiy, tibbiy, transport…" },
          { aspect: "Kerakligini topish", alt: "Lentani varaqlash va matn boʻyicha qidirish", doki: "Tur boʻyicha qidiruv va filtrlar — soniyalarda" },
          { aspect: "Muddat va yangilash", alt: "Hech kim eslatmaydi", doki: "Muddatlar haqida oldindan email eslatma" },
          { aspect: "Telefon/akkaunt almashtirish", alt: "Kirish Telegram akkauntiga bogʻlangan", doki: "Hujjatlar sejfda, arxivni eksport qilsa boʻladi" },
          { aspect: "Ruxsat berish", alt: "Faylni yuborasiz, keyin u qabul qiluvchida abadiy qoladi", doki: "Koʻrish chekloviga ega, bekor qilinadigan muddatli havola" },
          { aspect: "Oila hujjatlari", alt: "Hammasi oʻzi bilan bitta chatda", doki: "Har bir oila aʼzosi uchun profil, kirish rollari" },
        ],
        verdict:
          "Telegram tez yuborish uchun qulay va undagi chatlar shifrlangan. Lekin kartoteka sifatida «Saqlangan» ishlamaydi: tuzilma yoʻq, muddatlar yoʻq, ulashilgandan keyin kirish ustidan nazorat yoʻq. doki.help aynan shuni qoplaydi. Mahsulot betada va asl nusxalar oʻrnini bosmaydi.",
        faq: [
          {
            q: "Telegram’da hujjat saqlash xavfsizmi?",
            a: "Telegram — ishonchli messenjer va undagi chatlar shifrlangan. Gap bunda emas: «Saqlangan xabarlar» hujjat saqlash tizimi sifatida moʻljallanmagan — turlar, muddatlar yoki qulay qidiruv yoʻq, kirish esa akkauntga bogʻlangan.",
          },
          {
            q: "Kerakli hujjatni tez topsa boʻladimi?",
            a: "«Saqlangan» lentasida — qiyin. doki.help’da hujjatlar toifa va turlar boʻyicha tartiblangan, qidiruv va filtrlar bor, shuning uchun keraklisi soniyalarda topiladi.",
          },
          {
            q: "Telefon yoki akkaunt almashtirsam, hujjatlarni yoʻqotamanmi?",
            a: "«Saqlangan»ga kirish Telegram akkauntiga bogʻlangan. doki.help’da hujjatlar sizning sejfingizda, akkauntga bogʻlangan, arxivni esa yuklab olsa boʻladi.",
          },
          {
            q: "doki.help muddatlar haqida eslatadimi?",
            a: "Ha. \"Amal qilish muddati\" sanasini kiriting — pasport, viza yoki sugʻurta sezilmay tugab qolmasligi uchun oldindan email eslatma keladi.",
          },
          {
            q: "Bu bepulmi?",
            a: "Ha. Hozir bepul: 2 GB, eslatmalar, oilaviy kirish va oflayn kirish. Mahsulot betada.",
          },
        ],
      },
    },
  },
  "whatsapp": {
    emoji: "💬",
    locales: {
      ru: {
        navLabel: "vs WhatsApp",
        altName: "WhatsApp (чаты)",
        title: "Документы в чатах WhatsApp или в защищённом сейфе",
        subtitle:
          "Семейные документы копятся в переписке WhatsApp и теряются. Сейф хранит их по категориям, со сроками и отзываемыми ссылками.",
        intro:
          "Скинуть скан родным в WhatsApp — быстро и привычно, а чаты там зашифрованы. Но как картотека переписка не работает: документы тонут в ленте сообщений, медиа со временем чистится, нет типов и сроков. doki.help собирает документы семьи в одном месте — с категориями, напоминаниями и контролем над выданным доступом.",
        rows: [
          { aspect: "Где лежит", alt: "Разбросано по десятку семейных чатов", doki: "Один сейф только под документы" },
          { aspect: "Поиск нужного", alt: "Прокручивать переписку вручную", doki: "Категории, типы и поиск — за секунды" },
          { aspect: "Сроки и продления", alt: "Никто не напомнит", doki: "Email-напоминания о сроках заранее" },
          { aspect: "Контроль после отправки", alt: "Файл остаётся в чате навсегда", doki: "Истекающая ссылка с лимитом просмотров и отзывом" },
          { aspect: "Смена телефона", alt: "Без резервной копии медиа теряется", doki: "Документы в сейфе, привязаны к аккаунту, есть экспорт" },
          { aspect: "Документы семьи", alt: "У каждого свой набор в своём чате", doki: "Профиль на каждого члена семьи, роли доступа" },
        ],
        verdict:
          "WhatsApp удобен и зашифрован — для общения это отлично. Но документам нужны структура, сроки и возможность отозвать доступ, чего у чата нет. doki.help даёт именно это, не заменяя WhatsApp для переписки. Продукт в бете и не заменяет оригиналы.",
        faq: [
          {
            q: "Безопасно ли хранить документы в WhatsApp?",
            a: "Чаты в WhatsApp зашифрованы, и для общения это надёжно. Но мессенджер — не система хранения документов: они теряются в ленте, медиа со временем чистится, нет типов и сроков.",
          },
          {
            q: "Можно ли отозвать документ после отправки?",
            a: "В чате — нет: отправленный файл остаётся у получателя. В doki.help вы делитесь по истекающей ссылке с лимитом просмотров и можете отозвать доступ в любой момент.",
          },
          {
            q: "Переживут ли документы смену телефона?",
            a: "Медиа в чатах легко потерять без резервной копии. В doki.help документы лежат в сейфе и привязаны к аккаунту, а архив можно выгрузить.",
          },
          {
            q: "doki.help напоминает о сроках?",
            a: "Да. Укажите дату «действует до» — придёт email-напоминание заранее, чтобы документ не истёк незаметно.",
          },
          {
            q: "Это бесплатно?",
            a: "Да. Сейчас бесплатно: 2 ГБ, напоминания, семейный доступ и офлайн-доступ. Продукт в бете.",
          },
        ],
      },
      en: {
        navLabel: "vs WhatsApp",
        altName: "WhatsApp (chats)",
        title: "Documents in WhatsApp chats vs a secure vault",
        subtitle:
          "Family documents pile up in WhatsApp chats and get lost. A vault keeps them sorted, dated and shareable — with revocable links.",
        intro:
          "Sending a scan to family on WhatsApp is fast and familiar, and its chats are encrypted. But as a filing system, a chat doesn't work: documents drown in the message feed, media gets cleared over time, and there are no types or deadlines. doki.help gathers your family's documents in one place — with categories, reminders and control over access once it's shared.",
        rows: [
          { aspect: "Where it lives", alt: "Scattered across a dozen family chats", doki: "One vault for documents only" },
          { aspect: "Finding the right one", alt: "Scroll the chat history by hand", doki: "Categories, types and search — in seconds" },
          { aspect: "Deadlines & renewals", alt: "Nobody reminds you", doki: "Email reminders for deadlines in advance" },
          { aspect: "Control after sending", alt: "The file stays in the chat forever", doki: "An expiring link with a view limit and revoke" },
          { aspect: "Switching phones", alt: "Without a backup, media gets lost", doki: "Documents in a vault, tied to your account, with export" },
          { aspect: "Family documents", alt: "Everyone has their own set in their own chat", doki: "A profile per family member, access roles" },
        ],
        verdict:
          "WhatsApp is convenient and encrypted — great for messaging. But documents need structure, deadlines and the ability to revoke access, which a chat doesn't offer. doki.help provides exactly that, without replacing WhatsApp for conversations. The product is in beta and doesn't replace your originals.",
        faq: [
          {
            q: "Is WhatsApp safe for documents?",
            a: "WhatsApp chats are encrypted, and that's reliable for messaging. But a messenger isn't a document storage system: documents get lost in the feed, media gets cleared over time, and there are no types or deadlines.",
          },
          {
            q: "Can I revoke a document after sending?",
            a: "In a chat, no — the sent file stays with the recipient. In doki.help you share via an expiring link with a view limit and can revoke access at any time.",
          },
          {
            q: "Will documents survive a phone change?",
            a: "Chat media is easy to lose without a backup. In doki.help documents live in a vault tied to your account, and you can export an archive.",
          },
          {
            q: "Does doki.help remind me about expiry dates?",
            a: "Yes. Set a \"valid until\" date and get an email reminder in advance, so a document doesn't expire unnoticed.",
          },
          {
            q: "Is it free?",
            a: "Yes. Right now it's free: 2 GB, reminders, family access and offline access. The product is in beta.",
          },
        ],
      },
      id: {
        navLabel: "vs WhatsApp",
        altName: "WhatsApp (chat)",
        title: "Dokumen di chat WhatsApp vs brankas aman",
        subtitle:
          "Dokumen keluarga menumpuk di chat WhatsApp dan hilang. Brankas menyimpannya tertata, bertanggal, dan bisa dibagikan — dengan tautan yang bisa dicabut.",
        intro:
          "Mengirim pindaian ke keluarga di WhatsApp itu cepat dan familier, dan chat-nya terenkripsi. Tapi sebagai sistem pengarsipan, chat tidak berfungsi: dokumen tenggelam di linimasa pesan, media terhapus seiring waktu, dan tak ada jenis atau tenggat. doki.help mengumpulkan dokumen keluarga di satu tempat — dengan kategori, pengingat, dan kendali atas akses setelah dibagikan.",
        rows: [
          { aspect: "Di mana tersimpan", alt: "Tersebar di belasan chat keluarga", doki: "Satu brankas khusus dokumen" },
          { aspect: "Menemukan yang tepat", alt: "Gulir riwayat chat secara manual", doki: "Kategori, jenis, dan pencarian — dalam detik" },
          { aspect: "Tenggat & perpanjangan", alt: "Tak ada yang mengingatkan", doki: "Pengingat email untuk tenggat lebih awal" },
          { aspect: "Kendali setelah dikirim", alt: "File tetap di chat selamanya", doki: "Tautan kedaluwarsa dengan batas tampilan dan pencabutan" },
          { aspect: "Ganti ponsel", alt: "Tanpa cadangan, media hilang", doki: "Dokumen di brankas, terikat akun, dengan ekspor" },
          { aspect: "Dokumen keluarga", alt: "Tiap orang punya set sendiri di chat sendiri", doki: "Profil per anggota keluarga, peran akses" },
        ],
        verdict:
          "WhatsApp praktis dan terenkripsi — bagus untuk perpesanan. Tapi dokumen butuh struktur, tenggat, dan kemampuan mencabut akses, yang tak ditawarkan chat. doki.help memberikan persis itu, tanpa menggantikan WhatsApp untuk percakapan. Produk masih beta dan tidak menggantikan dokumen asli.",
        faq: [
          {
            q: "Apakah WhatsApp aman untuk dokumen?",
            a: "Chat WhatsApp terenkripsi, dan itu andal untuk perpesanan. Tapi pesan instan bukan sistem penyimpanan dokumen: dokumen hilang di linimasa, media terhapus seiring waktu, dan tak ada jenis atau tenggat.",
          },
          {
            q: "Bisakah saya mencabut dokumen setelah dikirim?",
            a: "Di chat, tidak — file yang dikirim tetap ada pada penerima. Di doki.help Anda berbagi lewat tautan kedaluwarsa dengan batas tampilan dan bisa mencabut akses kapan saja.",
          },
          {
            q: "Apakah dokumen bertahan saat ganti ponsel?",
            a: "Media chat mudah hilang tanpa cadangan. Di doki.help dokumen ada di brankas yang terikat akun Anda, dan Anda bisa mengekspor arsip.",
          },
          {
            q: "Apakah doki.help mengingatkan tenggat?",
            a: "Ya. Atur tanggal \"berlaku hingga\" dan terima pengingat email lebih awal, agar dokumen tidak kedaluwarsa tanpa disadari.",
          },
          {
            q: "Apakah gratis?",
            a: "Ya. Saat ini gratis: 2 GB, pengingat, akses keluarga, dan akses offline. Produk masih beta.",
          },
        ],
      },
      uz: {
        navLabel: "vs WhatsApp",
        altName: "WhatsApp (chatlar)",
        title: "WhatsApp chatlaridagi hujjatlar yoki xavfsiz sejf",
        subtitle:
          "Oila hujjatlari WhatsApp chatlarida toʻplanib yoʻqoladi. Sejf ularni toifalar, sanalar va bekor qilinadigan havolalar bilan saqlaydi.",
        intro:
          "Skanni WhatsApp orqali yaqinlarga yuborish tez va odatiy, undagi chatlar esa shifrlangan. Lekin kartoteka sifatida chat ishlamaydi: hujjatlar xabarlar lentasida choʻkadi, media vaqt oʻtib tozalanadi, turlar va muddatlar yoʻq. doki.help oila hujjatlarini bitta joyga yigʻadi — toifalar, eslatmalar va ulashilgan kirish ustidan nazorat bilan.",
        rows: [
          { aspect: "Qayerda turadi", alt: "Oʻnlab oilaviy chatlarga tarqalgan", doki: "Faqat hujjatlar uchun bitta sejf" },
          { aspect: "Kerakligini topish", alt: "Chat tarixini qoʻlda varaqlash", doki: "Toifalar, turlar va qidiruv — soniyalarda" },
          { aspect: "Muddat va yangilash", alt: "Hech kim eslatmaydi", doki: "Muddatlar haqida oldindan email eslatma" },
          { aspect: "Yuborilgandan keyingi nazorat", alt: "Fayl chatda abadiy qoladi", doki: "Koʻrish chekloviga ega, bekor qilinadigan muddatli havola" },
          { aspect: "Telefon almashtirish", alt: "Zaxira nusxasiz media yoʻqoladi", doki: "Hujjatlar sejfda, akkauntga bogʻlangan, eksport bor" },
          { aspect: "Oila hujjatlari", alt: "Har kimda oʻz chatida oʻz toʻplami", doki: "Har bir oila aʼzosi uchun profil, kirish rollari" },
        ],
        verdict:
          "WhatsApp qulay va shifrlangan — muloqot uchun ajoyib. Lekin hujjatlarga tuzilma, muddatlar va kirishni bekor qilish imkoni kerak, buni chat bermaydi. doki.help aynan shuni beradi, muloqot uchun WhatsApp oʻrnini bosmaydi. Mahsulot betada va asl nusxalar oʻrnini bosmaydi.",
        faq: [
          {
            q: "WhatsApp’da hujjat saqlash xavfsizmi?",
            a: "WhatsApp chatlari shifrlangan va muloqot uchun bu ishonchli. Lekin messenjer hujjat saqlash tizimi emas: hujjatlar lentada yoʻqoladi, media vaqt oʻtib tozalanadi, turlar va muddatlar yoʻq.",
          },
          {
            q: "Yuborilgandan keyin hujjatni bekor qilsa boʻladimi?",
            a: "Chatda — yoʻq: yuborilgan fayl qabul qiluvchida qoladi. doki.help’da siz koʻrish chekloviga ega muddatli havola orqali ulashasiz va istalgan vaqtda kirishni bekor qila olasiz.",
          },
          {
            q: "Telefon almashtirilganda hujjatlar saqlanadimi?",
            a: "Chatdagi media zaxira nusxasiz osongina yoʻqoladi. doki.help’da hujjatlar akkauntingizga bogʻlangan sejfda turadi, arxivni esa eksport qilsa boʻladi.",
          },
          {
            q: "doki.help muddatlar haqida eslatadimi?",
            a: "Ha. \"Amal qilish muddati\" sanasini kiriting — hujjat sezilmay tugab qolmasligi uchun oldindan email eslatma keladi.",
          },
          {
            q: "Bu bepulmi?",
            a: "Ha. Hozir bepul: 2 GB, eslatmalar, oilaviy kirish va oflayn kirish. Mahsulot betada.",
          },
        ],
      },
    },
  },
};

export function getComparison(key: string): Comparison | null {
  return (DATA as Record<string, Comparison>)[key] ?? null;
}

/** Короткие ссылки на сравнения для внутренней перелинковки.
 *  Сравнения без перевода на текущий язык (RU-only) показываются только в ru. */
export function comparisonLinks(locale: Locale) {
  return COMPARISON_KEYS.filter((key) => DATA[key].locales[locale]).map((key) => ({
    key,
    emoji: DATA[key].emoji,
    label: DATA[key].locales[locale]!.navLabel,
  }));
}

/** Локализованный заголовок блока сравнений. */
export function comparisonsHeading(locale: Locale): string {
  return { ru: "Сравнения", en: "Comparisons", id: "Perbandingan", uz: "Taqqoslashlar" }[locale];
}

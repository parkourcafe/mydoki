import type { Locale } from "./i18n";

export type ComparisonKey = "paper" | "cloud" | "gallery";

export const COMPARISON_KEYS: ComparisonKey[] = ["paper", "cloud", "gallery"];

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

type Comparison = { emoji: string; locales: Record<Locale, ComparisonContent> };

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
};

export function getComparison(key: string): Comparison | null {
  return (DATA as Record<string, Comparison>)[key] ?? null;
}

/** Короткие ссылки на сравнения для внутренней перелинковки. */
export function comparisonLinks(locale: Locale) {
  return COMPARISON_KEYS.map((key) => ({
    key,
    emoji: DATA[key].emoji,
    label: DATA[key].locales[locale].navLabel,
  }));
}

/** Локализованный заголовок блока сравнений. */
export function comparisonsHeading(locale: Locale): string {
  return { ru: "Сравнения", en: "Comparisons", id: "Perbandingan", uz: "Taqqoslashlar" }[locale];
}

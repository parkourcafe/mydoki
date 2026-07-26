import Link from "next/link";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/queries";
import { getLocale, type Locale } from "@/lib/i18n";
import LangSwitcher from "@/components/LangSwitcher";
import { segmentLinks } from "@/lib/segments";
import { comparisonLinks, comparisonsHeading } from "@/lib/comparisons";
import { usecaseLinks } from "@/lib/usecases";
import { landingLinks } from "@/lib/landings";
import { checklistLinks } from "@/lib/checklists";
import { guideLinks } from "@/lib/guides";
import { trustLinks } from "@/lib/trust";

// Заголовки блоков внутренней перелинковки на новые SEO-страницы.
const MORE_HEADINGS: Record<Locale, { tools: string; checklists: string; guides: string }> = {
  ru: { tools: "Напоминания о сроках и сейфы", checklists: "Чеклисты документов", guides: "Гайды" },
  en: { tools: "Expiry reminders & vaults", checklists: "Document checklists", guides: "Guides" },
  id: { tools: "Pengingat tenggat & brankas", checklists: "Ceklis dokumen", guides: "Panduan" },
  uz: { tools: "Muddat eslatmalari va seyflar", checklists: "Hujjat roʻyxatlari", guides: "Qoʻllanmalar" },
};

type Cat = { icon: string; title: string; items: string[] };
type Step = { n: string; title: string; text: string };
type Sec = { icon: string; title: string; text: string };
type Faq = { q: string; a: string };

type Dict = {
  nav: { login: string; start: string; startShort: string };
  hero: {
    badge: string;
    title: string[];
    subtitle: string;
    cta1: string;
    cta2: string;
    demo: string;
    trust: string[];
    security: string;
    imgAlt: string;
  };
  store: {
    heading: string;
    sub: string;
    medTitle: string;
    medBadge: string;
    medCol1: string[];
    medCol2: string[];
    medNote: string;
    cats: Cat[];
  };
  pain: { heading: string; items: string[] };
  how: { heading: string; sub: string; steps: Step[] };
  security: { heading: string; sub: string; promise: string; items: Sec[] };
  cta: { heading: string; sub: string; button: string };
  faq: { heading: string; items: Faq[] };
  forWhom: { heading: string; items: string[] };
  diff: { heading: string; intro: string; items: { t: string; d: string }[] };
  operator: { heading: string; line: string; contactLabel: string };
  footer: { copyright: string; pricing: string; security: string; privacy: string; login: string };
};

const M: Record<Locale, Dict> = {
  ru: {
    nav: { login: "Войти", start: "Начать бесплатно", startShort: "Начать" },
    hero: {
      badge: "Личный сейф для документов всей семьи",
      title: ["Семейный сейф", "для всех документов —", "и сроки под контролем"],
      subtitle:
        "Паспорта, анализы, визы, дипломы, справки и путёвки. Доступ с любого устройства. Напоминания работают сами.",
      cta1: "Создать сейф бесплатно",
      cta2: "Как это работает",
      demo: "Посмотреть демо без регистрации →",
      trust: ["С любого устройства", "2 ГБ бесплатно", "Вход через Google"],
      security:
        "Приватное хранилище · Доступ только у вашей семьи · ИИ-распознавание — по желанию",
      imgAlt: "Документы семьи — под рукой и в порядке",
    },
    store: {
      heading: "Что можно хранить в архиве",
      sub: "Всё самое важное для семьи — в одном защищённом месте.",
      medTitle: "Анализы и медицинские исследования",
      medBadge: "Напоминания — бесплатно",
      medCol1: ["Результаты лабораторных анализов", "Биохимия, ОАК, гормоны, ОАМ", "УЗИ, МРТ, КТ, рентген"],
      medCol2: ["Заключения врачей", "Прививочные сертификаты", "Медицинские справки"],
      medNote: "Напоминания о сроках — бесплатно.",
      cats: [
        { icon: "📄", title: "Личные и миграционные документы", items: ["Паспорта и загранпаспорта", "Визы и визовые документы", "Документы на гражданство", "СНИЛС, ИНН, военный билет", "Дипломы, аттестаты, сертификаты"] },
        { icon: "✈️", title: "Поездки и путешествия", items: ["Путёвки и ваучеры", "Билеты и бронирования", "Страховки для поездок", "Документы для въезда/выезда", "Согласия на выезд ребёнка"] },
        { icon: "🚗", title: "Авто и недвижимость", items: ["ОСАГО и КАСКО", "ПТС и СТС", "Выписки ЕГРН и договоры"] },
        { icon: "🧾", title: "Квитанции и справки", items: ["Квитанции и чеки об оплате", "Справки с работы / учёбы", "Доверенности"] },
      ],
    },
    pain: {
      heading: "Знакомо?",
      items: [
        "Ребёнку утром в садик — а нужной справки не найти.",
        "В аэропорту просят полис, а он где-то в переписке.",
        "Врач просит прошлые анализы — они на старом телефоне.",
        "Виза или ОСАГО заканчивается, а узнаёшь в последний момент.",
      ],
    },
    how: {
      heading: "Как это работает",
      sub: "Загрузи документ — остальное система сделает сама",
      steps: [
        { n: "1", title: "Загрузи фото или скан", text: "Паспорт, виза, анализ, путёвка — любой документ." },
        { n: "2", title: "Укажите срок действия", text: "Впишите дату «действует до» — приложение запомнит и напомнит заранее." },
        { n: "3", title: "Получай напоминания", text: "Система заранее предупредит об истечении визы, анализа или ОСАГО." },
        { n: "4", title: "Управляй доступом", text: "Отправляй временные ссылки врачам, в банк или родственникам." },
      ],
    },
    security: {
      heading: "Ваши документы в безопасности",
      sub: "Мы понимаем, насколько важны эти документы — и сделали всё, чтобы вы были спокойны.",
      promise:
        "Приватность и безопасность — наш главный приоритет. Данные хранятся в защищённом облаке и передаются по HTTPS, а доступ ограничен строгими правилами на уровне базы. Мы не продаём и не обмениваем ваши данные и не передаём их для рекламы.",
      items: [
        { icon: "👨‍👩‍👧", title: "Только ваша семья видит документы", text: "Доступ изолирован на уровне базы (RLS): посторонние не видят ваши документы." },
        { icon: "🛡️", title: "Защищённый вход и хранилище", text: "Файлы — в приватном хранилище, передача по HTTPS. Двухфакторный вход и письмо при входе с нового устройства." },
        { icon: "🎚️", title: "Вы управляете доступом", text: "Делитесь документом по временной ссылке и отзываете её в любой момент." },
        { icon: "🙅", title: "Не продаём ваши данные", text: "Мы не передаём и не продаём ваши данные третьим лицам." },
        { icon: "📥", title: "Работают без интернета", text: "Нужные документы можно сохранить на телефон и открыть даже без связи — в поездке или роуминге." },
      ],
    },
    cta: {
      heading: "Готовы собрать все документы семьи?",
      sub: "Меньше 15 минут — и порядок надолго.",
      button: "Создать сейф бесплатно",
    },
    faq: {
      heading: "Частые вопросы",
      items: [
        { q: "Это бесплатно?", a: "Да. Сейчас бесплатно: 2 ГБ места, напоминания о сроках, общий доступ для семьи и работа офлайн. Позже появится платный тариф с бóльшим объёмом — то, что доступно сейчас, останется." },
        { q: "Кто видит мои документы?", a: "Только вы и те члены семьи, кому вы открыли доступ. Доступ изолирован на уровне базы данных (RLS), файлы — в приватном хранилище." },
        { q: "Как работают напоминания?", a: "Вы указываете срок действия документа (например, загранпаспорта или ОСАГО), а сервис заранее присылает напоминание на email." },
        { q: "Можно ли поделиться документом?", a: "Да — по временной ссылке, которую можно отозвать в любой момент." },
        { q: "Где хранятся данные?", a: "В защищённом облачном хранилище, передача — по HTTPS. Мы не продаём и не передаём ваши данные третьим лицам." },
        { q: "Можно ли выгрузить мои документы?", a: "Да. В личном кабинете есть экспорт — заберёте свои файлы и данные в любой момент, без привязки к сервису." },
        { q: "Использует ли сервис ИИ для чтения документов?", a: "По умолчанию — нет. Распознавание ИИ выключено; вы включаете его сами в настройках, и только тогда изображение документа отправляется ИИ-провайдеру." },
        { q: "Чем это лучше Google Drive или галереи телефона?", a: "Обычное облако просто хранит файлы. doki раскладывает документы по людям и категориям, напоминает о сроках и даёт поделиться одним документом по временной ссылке — а не всей папкой." },
      ],
    },
    forWhom: {
      heading: "Кому подходит",
      items: [
        "Семьям, которые хотят собрать все важные документы в одном месте",
        "Родителям — хранить и не терять документы детей",
        "Тем, кто часто путешествует: паспорта, визы, страховки под рукой",
        "Кто боится забыть про срок — продление визы, ОСАГО, паспорта",
        "Кто делится документами с врачом или юристом по защищённой ссылке",
      ],
    },
    diff: {
      heading: "Чем это лучше обычного облака",
      intro: "doki.help — не ещё один файловый диск, а сервис под документы:",
      items: [
        { t: "Напоминает о сроках", d: "Указываете дату — напоминание приходит заранее. Обычное облако так не умеет." },
        { t: "Порядок по людям и категориям", d: "Документы разложены по членам семьи и типам, а не свалены в папки." },
        { t: "Безопасный обмен по одному документу", d: "Временная ссылка на конкретный файл, которую можно отозвать." },
        { t: "Работает офлайн", d: "Нужные документы открываются без интернета — в поездке или роуминге." },
      ],
    },
    operator: {
      heading: "Кто за сервисом",
      line: "Оператор: владелец сервиса doki.help, ИНН 780728592634.",
      contactLabel: "Поддержка:",
    },
    footer: { copyright: "© 2026 doki.help — Семейный архив документов", pricing: "Цены", security: "Безопасность", privacy: "Конфиденциальность", login: "Войти" },
  },
  en: {
    nav: { login: "Sign in", start: "Create a free checklist", startShort: "Start" },
    hero: {
      badge: "For HR teams, business owners, candidates, and employees in Indonesia",
      title: ["Collect candidate", "and employee documents —", "with one link"],
      subtitle:
        "Create a document checklist, send it over WhatsApp, and see who is complete — without messy chats or spreadsheets.",
      cta1: "Create a free checklist",
      cta2: "How it works",
      demo: "See the document flow demo →",
      trust: ["For Indonesian employers", "Candidates upload by link", "Document status is visible"],
      security:
        "Controlled access · Secure links · AI/OCR only when enabled",
      imgAlt: "Candidate and employee documents organized for hiring and onboarding",
    },
    store: {
      heading: "Work documents you can collect",
      sub: "Everything needed for applications, onboarding, and internal verification — in one clean flow.",
      medTitle: "Candidate and employee documents",
      medBadge: "Checklist — free",
      medCol1: ["KTP or the requested identity document", "CV, diplomas, training certificates", "Portfolio or work references"],
      medCol2: ["Contracts and onboarding forms", "Health certificates when actually required", "Work permit or visa documents when relevant"],
      medNote: "Ask only for documents that are truly needed for the current stage.",
      cats: [
        { icon: "📄", title: "Identity & profile", items: ["KTP/passport when needed", "CV and contact details", "Candidate profile documents or photo"] },
        { icon: "🎓", title: "Qualifications", items: ["Diplomas and transcripts", "Training certificates", "Licenses or professional permits"] },
        { icon: "🏨", title: "Hospitality & operations", items: ["Hygiene or safety certificates", "Work references", "Experience documents"] },
        { icon: "🧾", title: "Onboarding", items: ["Contracts", "Internal forms", "Checklist of documents still missing"] },
      ],
    },
    pain: {
      heading: "Common document problems",
      items: [
        "KTP, CVs, certificates, and contracts arrive in different chats.",
        "HR has to remind candidates one by one.",
        "Owners cannot see who has completed their documents.",
        "Sensitive documents sit in WhatsApp with no clear access control.",
      ],
    },
    how: {
      heading: "How it works",
      sub: "The company creates a checklist, the candidate uploads documents, and status stays clear.",
      steps: [
        { n: "1", title: "Create a document checklist", text: "Choose the documents needed for a role, application stage, or onboarding." },
        { n: "2", title: "Send a link to the candidate", text: "Share it over WhatsApp, email, or your internal workflow — no extra spreadsheet." },
        { n: "3", title: "Candidates upload files", text: "They see what is required and what is still missing." },
        { n: "4", title: "Track completion status", text: "HR or the owner sees what came in, what is missing, and which links are active." },
      ],
    },
    security: {
      heading: "Candidate documents stay safer",
      sub: "Work documents contain sensitive data. doki.help helps collect them with clearer access than ordinary chat.",
      promise:
        "Privacy and security are our top priority. Data is sent over HTTPS, access is restricted by database rules, and document links can be controlled. We do not sell data or share it for advertising.",
      items: [
        { icon: "🏢", title: "Access only for authorized teams", text: "Documents are not scattered across private chats; access is managed through accounts and links." },
        { icon: "🛡️", title: "Secure sign-in and storage", text: "Files are sent over HTTPS and protected by database access rules." },
        { icon: "🎚️", title: "Status and access can be controlled", text: "See complete/missing documents and limit who can open files." },
        { icon: "🙅", title: "Not for advertising", text: "Candidate and employee data is not sold and is not shared for advertising." },
        { icon: "📥", title: "Cleaner than WhatsApp", text: "Checklists, uploads, and document status stay in one place." },
      ],
    },
    cta: {
      heading: "Ready to organize candidate and employee documents?",
      sub: "Create the first checklist, send one link, and see document status without chasing every chat.",
      button: "Create a free checklist",
    },
    faq: {
      heading: "Frequently asked questions",
      items: [
        { q: "Is this a job board?", a: "No. doki.help is not a job marketplace. It helps companies collect and review candidate/employee documents after there is a hiring or onboarding process." },
        { q: "Who uses doki.help?", a: "HR teams, owners, admins, candidates, and new employees who need to send or review a work-document package." },
        { q: "Do candidates need an account?", a: "Candidate flows can work through a document link. To manage personal documents or file history, users can sign in to their own account." },
        { q: "Which documents should be requested?", a: "Only documents relevant to the stage: for example CV/certificates during application, then contracts or onboarding documents after acceptance." },
        { q: "What about KTP and sensitive documents?", a: "Ask for them only when truly required, explain why, and limit access to authorized people." },
        { q: "Can document status be tracked?", a: "Yes. The checklist helps show what has arrived, what is incomplete, and what may need updating." },
        { q: "Does AI/OCR automatically read documents?", a: "No automatic promise by default. AI/OCR recognition is used only when that feature is enabled and fits the applicable policy." },
        { q: "Why is it better than WhatsApp or spreadsheets?", a: "Because checklists, uploads, status, and access links are in one place — not scattered across many chats and files." },
      ],
    },
    forWhom: {
      heading: "Who it's for",
      items: [
        "Restaurant, villa, spa, school, clinic, and agency owners in Bali and Indonesia",
        "HR or admin teams collecting candidate documents through WhatsApp",
        "Candidates who need to send a complete document package to a company",
        "New employees completing onboarding paperwork",
        "Teams that need clear status: complete, missing, or needs update",
      ],
    },
    diff: {
      heading: "Why it beats WhatsApp or a regular cloud",
      intro: "doki.help is built for work-document workflows — not just file storage:",
      items: [
        { t: "Checklists per role", d: "Define the documents needed for each role or onboarding stage." },
        { t: "Completion status", d: "See who is complete and who is still missing files." },
        { t: "Candidate links", d: "Candidates upload through a link; HR does not need to hunt through chat files." },
        { t: "More controlled access", d: "Sensitive documents are not spread across shared folders or private conversations." },
      ],
    },
    operator: {
      heading: "Who runs the service",
      line: "Operator: the owner of the doki.help service, foreign tax number 780728592634.",
      contactLabel: "Support:",
    },
    footer: { copyright: "© 2026 doki.help — Candidate and employee documents", pricing: "Pricing", security: "Security", privacy: "Privacy", login: "Sign in" },
  },
  id: {
    nav: { login: "Masuk", start: "Buat checklist gratis", startShort: "Mulai" },
    hero: {
      badge: "Untuk HR, pemilik usaha, kandidat, dan karyawan",
      title: ["Kumpulkan dokumen", "kandidat dan karyawan —", "lewat satu link"],
      subtitle:
        "Buat checklist dokumen, kirim tautan lewat WhatsApp, dan lihat siapa yang sudah lengkap — tanpa spreadsheet dan chat yang berantakan.",
      cta1: "Buat checklist gratis",
      cta2: "Cara kerjanya",
      demo: "Lihat demo alur dokumen →",
      trust: ["Untuk perusahaan Bali", "Kandidat unggah lewat link", "Status dokumen terlihat"],
      security:
        "Akses terkontrol · Tautan aman · AI/OCR hanya bila diaktifkan",
      imgAlt: "Dokumen kandidat dan karyawan tertata untuk proses hiring dan onboarding",
    },
    store: {
      heading: "Dokumen kerja yang bisa dikumpulkan",
      sub: "Semua berkas penting untuk melamar, onboarding, dan verifikasi internal — dalam satu alur yang rapi.",
      medTitle: "Dokumen kandidat dan karyawan",
      medBadge: "Checklist — gratis",
      medCol1: ["KTP atau identitas yang diminta", "CV, ijazah, sertifikat pelatihan", "Portofolio atau referensi kerja"],
      medCol2: ["Kontrak dan formulir onboarding", "Sertifikat kesehatan bila memang diperlukan", "Izin kerja atau dokumen visa bila relevan"],
      medNote: "Gunakan hanya dokumen yang benar-benar diperlukan untuk tahap prosesnya.",
      cats: [
        { icon: "📄", title: "Identitas & profil", items: ["KTP/paspor sesuai kebutuhan", "CV dan data kontak", "Foto atau dokumen profil kandidat"] },
        { icon: "🎓", title: "Kualifikasi", items: ["Ijazah dan transkrip", "Sertifikat training", "Lisensi atau izin profesi"] },
        { icon: "🏨", title: "Hospitality & operasional", items: ["Sertifikat hygiene atau keselamatan", "Referensi kerja", "Dokumen pengalaman kerja"] },
        { icon: "🧾", title: "Onboarding", items: ["Kontrak", "Formulir internal", "Checklist dokumen yang masih kurang"] },
      ],
    },
    pain: {
      heading: "Masalah yang sering terjadi",
      items: [
        "KTP, CV, sertifikat, dan kontrak masuk lewat chat berbeda.",
        "HR harus mengingatkan kandidat satu per satu.",
        "Pemilik tidak tahu siapa yang dokumennya sudah lengkap.",
        "Dokumen sensitif tersimpan di WhatsApp tanpa kontrol akses.",
      ],
    },
    how: {
      heading: "Cara kerjanya",
      sub: "Perusahaan membuat checklist, kandidat mengunggah dokumen, status terlihat jelas.",
      steps: [
        { n: "1", title: "Buat checklist dokumen", text: "Pilih dokumen yang dibutuhkan untuk posisi, tahap lamaran, atau onboarding." },
        { n: "2", title: "Kirim tautan ke kandidat", text: "Bagikan lewat WhatsApp, email, atau sistem internal — tanpa spreadsheet tambahan." },
        { n: "3", title: "Kandidat mengunggah berkas", text: "Mereka melihat apa yang diminta dan apa yang masih kurang." },
        { n: "4", title: "Pantau status kelengkapan", text: "HR atau owner melihat dokumen yang masuk, yang kurang, dan tautan aksesnya." },
      ],
    },
    security: {
      heading: "Dokumen kandidat tetap aman",
      sub: "Dokumen kerja berisi data sensitif. doki.help membantu mengumpulkannya dengan akses yang lebih jelas daripada chat biasa.",
      promise:
        "Privasi dan keamanan adalah prioritas utama kami. Data dikirim melalui HTTPS, akses dibatasi aturan basis data, dan tautan dokumen bisa dikontrol. Kami tidak menjual data dan tidak membagikannya untuk iklan.",
      items: [
        { icon: "🏢", title: "Akses hanya untuk tim yang berwenang", text: "Dokumen tidak tercecer di chat pribadi; akses dikelola lewat akun dan tautan." },
        { icon: "🛡️", title: "Masuk dan penyimpanan aman", text: "Berkas dikirim lewat HTTPS dan dilindungi aturan akses database." },
        { icon: "🎚️", title: "Status dan akses bisa dikontrol", text: "Lihat dokumen lengkap/kurang dan batasi siapa yang bisa membuka berkas." },
        { icon: "🙅", title: "Tidak untuk iklan", text: "Data kandidat dan karyawan tidak dijual dan tidak dibagikan untuk periklanan." },
        { icon: "📥", title: "Lebih rapi daripada WhatsApp", text: "Checklist, unggahan, dan status dokumen berada di satu tempat." },
      ],
    },
    cta: {
      heading: "Siap merapikan dokumen kandidat dan karyawan?",
      sub: "Buat checklist pertama, kirim tautan, dan lihat status dokumen tanpa mengejar chat satu per satu.",
      button: "Buat checklist gratis",
    },
    faq: {
      heading: "Pertanyaan umum",
      items: [
        { q: "Apakah ini job board?", a: "Bukan. doki.help bukan marketplace lowongan. Kami membantu perusahaan mengumpulkan dan mengecek dokumen kandidat/karyawan setelah ada proses rekrutmen atau onboarding." },
        { q: "Siapa yang menggunakan doki.help?", a: "HR, owner, admin, kandidat, dan karyawan baru yang perlu mengirim atau memeriksa paket dokumen kerja." },
        { q: "Apakah kandidat harus membuat akun?", a: "Alur kandidat bisa lewat tautan dokumen. Untuk mengelola dokumen pribadi atau riwayat berkas, pengguna dapat masuk ke akun sendiri." },
        { q: "Dokumen apa yang boleh diminta?", a: "Hanya dokumen yang relevan dengan tahap proses: misalnya CV/sertifikat pada tahap lamaran, lalu kontrak atau dokumen onboarding setelah kandidat diterima." },
        { q: "Bagaimana dengan KTP dan dokumen sensitif?", a: "Minta hanya bila benar-benar diperlukan, jelaskan tujuannya, dan batasi akses ke orang yang berwenang." },
        { q: "Bisakah status dokumen dipantau?", a: "Ya. Checklist membantu melihat dokumen yang sudah masuk, belum lengkap, atau perlu diperbarui." },
        { q: "Apakah AI/OCR otomatis membaca dokumen?", a: "Tidak sebagai janji default. Pengenalan AI/OCR hanya digunakan bila fitur tersebut diaktifkan dan sesuai kebijakan yang berlaku." },
        { q: "Kenapa lebih baik dari WhatsApp atau spreadsheet?", a: "Karena checklist, unggahan, status, dan tautan akses ada di satu tempat — bukan tercecer di banyak chat dan file." },
      ],
    },
    forWhom: {
      heading: "Untuk siapa",
      items: [
        "Pemilik restoran, villa, spa, sekolah, klinik, dan agensi di Bali",
        "HR atau admin yang mengumpulkan dokumen kandidat lewat WhatsApp",
        "Kandidat yang perlu mengirim paket dokumen lengkap ke perusahaan",
        "Karyawan baru yang harus melengkapi berkas onboarding",
        "Tim yang butuh status jelas: lengkap, kurang, atau perlu diperbarui",
      ],
    },
    diff: {
      heading: "Kenapa lebih baik dari WhatsApp atau cloud biasa",
      intro: "doki.help dibuat untuk alur dokumen kerja — bukan hanya menyimpan file:",
      items: [
        { t: "Checklist per posisi", d: "Tentukan dokumen yang dibutuhkan untuk setiap peran atau tahap onboarding." },
        { t: "Status kelengkapan", d: "Lihat siapa yang sudah lengkap dan siapa yang masih kurang." },
        { t: "Link untuk kandidat", d: "Kandidat mengunggah lewat tautan; HR tidak perlu mencari file di chat." },
        { t: "Akses lebih terkontrol", d: "Dokumen sensitif tidak tersebar di folder umum atau percakapan pribadi." },
      ],
    },
    operator: {
      heading: "Siapa di balik layanan",
      line: "Operator: pemilik layanan doki.help, nomor pajak luar negeri 780728592634.",
      contactLabel: "Dukungan:",
    },
    footer: { copyright: "© 2026 doki.help — Dokumen kandidat dan karyawan", pricing: "Harga", security: "Keamanan", privacy: "Privasi", login: "Masuk" },
  },
  uz: {
    nav: { login: "Kirish", start: "Bepul boshlash", startShort: "Boshlash" },
    hero: {
      badge: "Butun oilangiz hujjatlari uchun shaxsiy seyf",
      title: ["Oilaviy seyf", "barcha hujjatlar uchun —", "muddatlar nazoratda"],
      subtitle:
        "Pasportlar, tibbiy natijalar, vizalar, diplomlar, sertifikatlar va sayohat hujjatlari. Istalgan qurilmadan kiring. Eslatmalar oʻzi ishlaydi.",
      cta1: "Seyf yaratish — bepul",
      cta2: "Bu qanday ishlaydi",
      demo: "Demoni koʻrish — roʻyxatsiz →",
      trust: ["Istalgan qurilma", "2 GB bepul", "Google orqali kirish"],
      security:
        "Maxfiy xotira · Faqat oilangizda kirish · AI-aniqlash — ixtiyoriy",
      imgAlt: "Oila hujjatlari — tartibli va qoʻl ostida",
    },
    store: {
      heading: "Seyfingizda nimalarni saqlashingiz mumkin",
      sub: "Oilangiz uchun muhim boʻlgan hamma narsa — bitta xavfsiz joyda.",
      medTitle: "Tibbiy natijalar va tahlillar",
      medBadge: "Eslatmalar — bepul",
      medCol1: ["Laboratoriya tahlili natijalari", "Qon tahlillari, UQT, gormonlar, siydik tahlili", "UTT, MRT, KT, rentgen"],
      medCol2: ["Shifokor xulosalari", "Emlash sertifikatlari", "Tibbiy maʼlumotnomalar"],
      medNote: "Muddat eslatmalari — bepul.",
      cats: [
        { icon: "📄", title: "Shaxsiy va migratsiya hujjatlari", items: ["Pasportlar va xalqaro pasportlar", "Vizalar va viza hujjatlari", "Fuqarolik hujjatlari", "Soliq va ijtimoiy sugʻurta raqamlari", "Diplomlar va sertifikatlar"] },
        { icon: "✈️", title: "Sayohatlar va sayyohlik", items: ["Tur paketlari va voucherlar", "Chiptalar va bronlar", "Sayohat sugʻurtasi", "Kirish/chiqish hujjatlari", "Bolaning sayohatiga ruxsatnomalar"] },
        { icon: "🚗", title: "Transport va mulk", items: ["Avtomobil sugʻurtasi", "Transport guvohnomalari va roʻyxati", "Mulk hujjatlari va shartnomalar"] },
        { icon: "🧾", title: "Kvitansiyalar va maʼlumotnomalar", items: ["Toʻlov kvitansiyalari", "Ish / oʻqish maʼlumotnomalari", "Ishonchnomalar"] },
      ],
    },
    pain: {
      heading: "Tanishmi?",
      items: [
        "Ertalab bogʻchaga maʼlumotnoma kerak — topib boʻlmayapti.",
        "Aeroportda sugʻurta soʻrashadi, u esa qaysidir yozishmada.",
        "Shifokor eski tahlillarni soʻrayapti — ular eski telefonda.",
        "Viza yoki sugʻurta tugayapti, buni esa oxirgi daqiqada bilasiz.",
      ],
    },
    how: {
      heading: "Bu qanday ishlaydi",
      sub: "Hujjatni yuklang — qolganini ilova bajaradi",
      steps: [
        { n: "1", title: "Rasm yoki skan yuklang", text: "Pasport, viza, tibbiy natija, sayohat hujjati — istalgan hujjat." },
        { n: "2", title: "Amal muddatini kiriting", text: "«Amal qiladi» sanasini kiriting — ilova eslab qoladi va oldindan eslatadi." },
        { n: "3", title: "Eslatmalar oling", text: "Viza, tahlil yoki sugʻurta muddati tugashidan oldin ogohlantiriladi." },
        { n: "4", title: "Kirishni boshqaring", text: "Shifokorlar, banklar yoki qarindoshlarga muddatli havolalar yuboring." },
      ],
    },
    security: {
      heading: "Hujjatlaringiz xavfsiz",
      sub: "Bu hujjatlar qanchalik muhimligini bilamiz — va xotirjam boʻlishingiz uchun hammasini puxta qurdik.",
      promise:
        "Maxfiylik va xavfsizlik — asosiy ustuvorligimiz. Maʼlumotlaringiz xavfsiz bulutda saqlanadi va HTTPS orqali uzatiladi, kirish esa maʼlumotlar bazasi darajasidagi qatʼiy qoidalar bilan cheklangan. Maʼlumotlaringizni hech qachon sotmaymiz yoki almashtirmaymiz va reklama uchun ulashmaymiz.",
      items: [
        { icon: "👨‍👩‍👧", title: "Hujjatlarni faqat oilangiz koʻradi", text: "Kirish maʼlumotlar bazasi darajasida ajratilgan (RLS) — begonalar hujjatlaringizni koʻra olmaydi." },
        { icon: "🛡️", title: "Xavfsiz kirish va xotira", text: "Fayllar shaxsiy xotirada, uzatish HTTPS orqali. Ikki bosqichli kirish va yangi qurilmadan kirishda email ogohlantirish." },
        { icon: "🎚️", title: "Kirishni siz boshqarasiz", text: "Hujjatni muddatli havola orqali ulashing va istalgan vaqtda bekor qiling." },
        { icon: "🙅", title: "Maʼlumotlaringizni sotmaymiz", text: "Maʼlumotlaringizni hech qachon uchinchi shaxslarga bermaymiz yoki sotmaymiz." },
        { icon: "📥", title: "Internetsiz ishlaydi", text: "Kerakli hujjatlarni telefonga saqlang va aloqa boʻlmasa ham oching — sayohatda yoki roumingda." },
      ],
    },
    cta: {
      heading: "Oilangizning barcha hujjatlarini yigʻishga tayyormisiz?",
      sub: "15 daqiqadan kam vaqt — va uzoq saqlanadigan tartib.",
      button: "Seyf yaratish — bepul",
    },
    faq: {
      heading: "Tez-tez beriladigan savollar",
      items: [
        { q: "Bu bepulmi?", a: "Ha. Hozir bepul: 2 GB joy, muddat eslatmalari, oila uchun ulashish va oflayn ishlash. Keyinroq koʻproq joy bilan pullik tarif paydo boʻladi — hozir mavjud imkoniyatlar saqlanadi." },
        { q: "Hujjatlarimni kim koʻradi?", a: "Faqat siz va siz ruxsat bergan oila aʼzolari. Kirish maʼlumotlar bazasi darajasida ajratilgan (RLS), fayllar shaxsiy xotirada saqlanadi." },
        { q: "Eslatmalar qanday ishlaydi?", a: "Siz hujjatning amal qilish muddatini (masalan, pasport yoki sugʻurta) belgilaysiz, xizmat esa oldindan emailga eslatma yuboradi." },
        { q: "Hujjatni ulasha olamanmi?", a: "Ha — istalgan vaqtda bekor qila oladigan muddatli havola orqali." },
        { q: "Maʼlumotlarim qayerda saqlanadi?", a: "HTTPS orqali uzatiladigan xavfsiz bulutli xotirada. Maʼlumotlaringizni hech qachon uchinchi shaxslarga sotmaymiz yoki bermaymiz." },
        { q: "Hujjatlarimni eksport qila olamanmi?", a: "Ha. Shaxsiy kabinetda eksport bor — fayllaringiz va maʼlumotlaringizni istalgan vaqtda olib chiqasiz, xizmatga bogʻlanmagan holda." },
        { q: "Xizmat hujjatlarni oʻqish uchun AI ishlatadimi?", a: "Standart holatda — yoʻq. AI-aniqlash oʻchirilgan; uni sozlamalarda oʻzingiz yoqasiz, va faqat shundagina hujjat tasviri AI-provayderga yuboriladi." },
        { q: "Nega bu Google Drive yoki telefon galereyasidan yaxshi?", a: "Oddiy bulut shunchaki fayllarni saqlaydi. doki hujjatlarni odamlar va toifalar boʻyicha tartiblaydi, muddatlarni eslatadi va bitta hujjatni muddatli havola orqali ulashish imkonini beradi — butun papka emas." },
      ],
    },
    forWhom: {
      heading: "Kimga mos",
      items: [
        "Barcha muhim hujjatlarni bitta joyda saqlamoqchi oilalarga",
        "Ota-onalarga — farzandlar hujjatlarini saqlash va yoʻqotmaslik",
        "Tez-tez sayohat qiluvchilarga: pasport, viza, sugʻurta qoʻl ostida",
        "Muddatni unutishdan qoʻrqadiganlarga — viza, sugʻurta, pasportni yangilash",
        "Hujjatni shifokor yoki yurist bilan xavfsiz havola orqali ulashadiganlarga",
      ],
    },
    diff: {
      heading: "Oddiy bulutdan nimasi yaxshi",
      intro: "doki.help — shunchaki fayl diski emas, hujjatlar uchun yaratilgan:",
      items: [
        { t: "Muddatlarni eslatadi", d: "Sanani belgilang — eslatma oldindan keladi. Oddiy bulut buni qila olmaydi." },
        { t: "Odamlar va toifalar boʻyicha tartib", d: "Hujjatlar oila aʼzolari va turlari boʻyicha joylangan, papkalarga tashlanmagan." },
        { t: "Har bir hujjat uchun xavfsiz ulashish", d: "Bitta faylga vaqtinchalik havola, uni bekor qilish mumkin." },
        { t: "Oflayn ishlaydi", d: "Kerakli hujjatlarni internetsiz oching — sayohatda yoki roumingda." },
      ],
    },
    operator: {
      heading: "Xizmat ortida kim turadi",
      line: "Operator: doki.help xizmati egasi, STIR 780728592634.",
      contactLabel: "Qoʻllab-quvvatlash:",
    },
    footer: { copyright: "© 2026 doki.help — Oila hujjatlari seyfi", pricing: "Narxlar", security: "Xavfsizlik", privacy: "Maxfiylik", login: "Kirish" },
  },
};

function Check() {
  return <span className="font-semibold text-[#b85c38]">✓</span>;
}

function localizedPath(locale: Locale, path: string) {
  if (!path.startsWith("/")) return path;
  return locale === "en" ? path : `/${locale}${path}`;
}

function signupPath(locale: Locale, next?: string) {
  const base = localizedPath(locale, "/login");
  const qs = new URLSearchParams({ mode: "signup" });
  if (next) qs.set("next", next);
  return `${base}?${qs.toString()}`;
}

/** Структурированные данные для поисковиков (без выдуманных рейтингов/отзывов). */
function buildJsonLd(t: Dict, locale: Locale, appUrl: string) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${appUrl}/#org`,
        name: "doki.help",
        url: appUrl,
        email: "support@doki.help",
      },
      {
        "@type": "WebSite",
        "@id": `${appUrl}/#website`,
        url: appUrl,
        name: "doki.help",
        inLanguage: locale,
        publisher: { "@id": `${appUrl}/#org` },
      },
      {
        "@type": "SoftwareApplication",
        name: "doki.help",
        applicationCategory: "ProductivityApplication",
        operatingSystem: "Web",
        description: t.hero.subtitle,
        url: appUrl,
        offers: { "@type": "Offer", price: "0", priceCurrency: "RUB" },
      },
      {
        "@type": "FAQPage",
        mainEntity: t.faq.items.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      },
    ],
  };
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ code?: string; next?: string }>;
}) {
  // Подстраховка: если в Supabase не разрешён redirect на /auth/callback,
  // он возвращает OAuth-код на Site URL (главную). Перехватываем код здесь
  // и отправляем в callback-роут, который завершит обмен на сессию.
  const sp = await searchParams;
  if (sp.code) {
    const qs = new URLSearchParams({ code: sp.code });
    if (sp.next) qs.set("next", sp.next);
    redirect(`/auth/callback?${qs.toString()}`);
  }
  if (await getUser()) redirect("/my");
  const locale = await getLocale();
  const t = M[locale];
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.doki.help";
  const jsonLd = buildJsonLd(t, locale, appUrl);

  return (
    <div lang={locale} className="min-h-screen bg-[#f9f5f0] text-[#2c2522]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* NAV */}
      <nav className="sticky top-0 z-50 border-b border-[#e8e0d5] bg-[#fdfaf5]">
        <div className="mx-auto max-w-screen-xl px-4 sm:px-5">
          <div className="flex h-16 items-center justify-between gap-x-2">
            <div className="flex items-center gap-x-2 sm:gap-x-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-[#b85c38] text-white">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M10 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z" />
                </svg>
              </div>
              <div>
                <span className="text-xl font-semibold tracking-tighter sm:text-2xl">doki</span>
                <span className="text-xl font-semibold tracking-tighter text-[#c17a5e] sm:text-2xl">.help</span>
              </div>
            </div>
            <div className="flex items-center gap-x-2 sm:gap-x-4">
              <LangSwitcher locale={locale} />
              <Link href={localizedPath(locale, "/login")} className="hidden rounded-3xl border border-[#d4c9b8] px-5 py-2.5 text-sm font-medium transition-colors hover:bg-white md:block">
                {t.nav.login}
              </Link>
              <Link href={signupPath(locale)} className="accent-btn shrink-0 rounded-3xl px-4 py-2.5 text-sm font-semibold sm:px-6">
                <span className="sm:hidden">{t.nav.startShort}</span>
                <span className="hidden sm:inline">{t.nav.start}</span>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="mx-auto max-w-screen-xl px-5 pb-8 pt-10">
        <div className="grid items-center gap-x-8 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <div className="mb-6 inline-flex items-center gap-x-2 rounded-full border border-[#e8e0d5] bg-white px-4 py-1.5 text-sm">
              <span className="h-2 w-2 rounded-full bg-[#b85c38]" />
              <span className="font-medium text-[#5c5248]">{t.hero.badge}</span>
            </div>

            <h1 className="heading-font mb-5 text-[2.65rem] leading-[1.05] tracking-[-1.4px] text-[#2c2522] lg:text-[3.5rem]">
              {t.hero.title.map((line, i) => (
                <span key={i}>
                  {line}
                  {i < t.hero.title.length - 1 && <br />}
                </span>
              ))}
            </h1>

            <p className="mb-8 max-w-md text-[19px] leading-snug text-[#5c5248]">{t.hero.subtitle}</p>

            <div className="mb-8 flex max-w-lg flex-col gap-3 sm:flex-row">
              <Link href={signupPath(locale)} className="accent-btn flex flex-1 items-center justify-center rounded-3xl px-8 py-[17px] text-[17px] font-semibold active:scale-[0.985]">
                {t.hero.cta1}
              </Link>
              <a href="#how" className="flex flex-1 items-center justify-center rounded-3xl border border-[#d4c9b8] px-8 py-[17px] text-[17px] font-semibold transition-colors hover:bg-white">
                {t.hero.cta2}
              </a>
            </div>

            <Link
              href={localizedPath(locale, "/demo")}
              className="mb-6 inline-block text-sm font-medium text-[#b85c38] hover:underline"
            >
              {t.hero.demo}
            </Link>

            <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-[#5c5248]">
              {t.hero.trust.map((tr) => (
                <span key={tr} className="flex items-center gap-x-2"><Check /> {tr}</span>
              ))}
            </div>
            <p className="mt-3 text-xs text-[#8a7c6d]">🔒 {t.hero.security}</p>
          </div>

          <div className="mt-8 lg:col-span-5 lg:mt-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://d8j0ntlcm91z4.cloudfront.net/user_3EKntK4EDjG8nay4H1dy1TK30mB/hf_20260624_011709_6438e496-ffee-421a-a01a-41cca1abd28f_min.webp"
              alt={t.hero.imgAlt}
              width={928}
              height={1152}
              loading="eager"
              className="h-auto w-full rounded-3xl border border-[#e8e0d5] object-cover shadow-2xl"
            />
          </div>
        </div>
      </section>

      {/* PAIN */}
      <section className="mx-auto max-w-screen-xl px-4 pb-8 pt-2 sm:px-5">
        <div className="rounded-3xl border border-[#e8e0d5] bg-[#fdfaf5] p-6 sm:p-7">
          <h2 className="section-header mb-5">{t.pain.heading}</h2>
          <ul className="grid gap-3 sm:grid-cols-2">
            {t.pain.items.map((it) => (
              <li key={it} className="flex items-start gap-x-2 text-[#5c5248]">
                <span className="mt-0.5 shrink-0 text-[#b85c38]">•</span>
                <span>{it}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* FOR WHOM */}
      <section className="mx-auto max-w-screen-xl px-5 py-8">
        <div className="rounded-3xl border border-[#e8e0d5] bg-[#fdfaf5] p-7">
          <h2 className="section-header mb-5">{t.forWhom.heading}</h2>
          <ul className="grid gap-3 sm:grid-cols-2">
            {t.forWhom.items.map((it) => (
              <li key={it} className="flex items-start gap-x-2 text-[#5c5248]">
                <Check /> <span>{it}</span>
              </li>
            ))}
          </ul>
          <div className="mt-6 flex flex-wrap gap-2">
            {locale === "id" || locale === "en" ? (
              [
                { href: "/for/employers", emoji: "🏢", label: locale === "id" ? "Untuk perusahaan" : "For employers" },
                { href: "/for/job-seekers", emoji: "🧑‍💼", label: locale === "id" ? "Untuk kandidat" : "For candidates" },
                { href: "/hiring", emoji: "📋", label: locale === "id" ? "Alur hiring & onboarding" : "Hiring & onboarding flow" },
              ].map((s) => (
                <Link
                  key={s.href}
                  href={localizedPath(locale, s.href)}
                  className="inline-flex items-center gap-1.5 rounded-2xl border border-[#e8e0d5] bg-white px-3.5 py-1.5 text-sm text-[#5c5248] transition-colors hover:border-[#d4a373]"
                >
                  <span>{s.emoji}</span> {s.label}
                </Link>
              ))
            ) : (
              segmentLinks(locale).map((s) => (
                <Link
                  key={s.key}
                  href={localizedPath(locale, `/for/${s.key}`)}
                  className="inline-flex items-center gap-1.5 rounded-2xl border border-[#e8e0d5] bg-white px-3.5 py-1.5 text-sm text-[#5c5248] transition-colors hover:border-[#d4a373]"
                >
                  <span>{s.emoji}</span> {s.label}
                </Link>
              ))
            )}
          </div>
          {locale !== "id" && locale !== "en" && <div className="mt-5 border-t border-[#e8e0d5] pt-5">
            <div className="mb-3 text-sm font-medium text-[#8a7c6d]">{comparisonsHeading(locale)}</div>
            <div className="flex flex-wrap gap-2">
              {comparisonLinks(locale).map((cmp) => (
                <Link
                  key={cmp.key}
                  href={localizedPath(locale, `/vs/${cmp.key}`)}
                  className="inline-flex items-center gap-1.5 rounded-2xl border border-[#e8e0d5] bg-white px-3.5 py-1.5 text-sm text-[#5c5248] transition-colors hover:border-[#d4a373]"
                >
                  <span>{cmp.emoji}</span> {cmp.label}
                </Link>
              ))}
            </div>
          </div>}
          {locale !== "id" && locale !== "en" && <div className="mt-5 border-t border-[#e8e0d5] pt-5">
            <div className="mb-3 text-sm font-medium text-[#8a7c6d]">{MORE_HEADINGS[locale].tools}</div>
            <div className="flex flex-wrap gap-2">
              {landingLinks(locale).map((l) => (
                <Link
                  key={l.key}
                  href={localizedPath(locale, `/${l.key}`)}
                  className="inline-flex items-center gap-1.5 rounded-2xl border border-[#e8e0d5] bg-white px-3.5 py-1.5 text-sm text-[#5c5248] transition-colors hover:border-[#d4a373]"
                >
                  <span>{l.emoji}</span> {l.label}
                </Link>
              ))}
            </div>
          </div>}
          {locale !== "id" && locale !== "en" && <div className="mt-5 border-t border-[#e8e0d5] pt-5">
            <div className="mb-3 text-sm font-medium text-[#8a7c6d]">{MORE_HEADINGS[locale].checklists}</div>
            <div className="flex flex-wrap gap-2">
              {checklistLinks(locale).map((l) => (
                <Link
                  key={l.key}
                  href={localizedPath(locale, `/checklists/${l.key}`)}
                  className="inline-flex items-center gap-1.5 rounded-2xl border border-[#e8e0d5] bg-white px-3.5 py-1.5 text-sm text-[#5c5248] transition-colors hover:border-[#d4a373]"
                >
                  <span>{l.emoji}</span> {l.label}
                </Link>
              ))}
            </div>
          </div>}
          {locale !== "id" && locale !== "en" && guideLinks(locale).length > 0 && (
            <div className="mt-5 border-t border-[#e8e0d5] pt-5">
              <div className="mb-3 text-sm font-medium text-[#8a7c6d]">{MORE_HEADINGS[locale].guides}</div>
              <div className="flex flex-wrap gap-2">
                {guideLinks(locale).map((l) => (
                  <Link
                    key={l.key}
                    href={localizedPath(locale, `/blog/${l.key}`)}
                    className="inline-flex items-center gap-1.5 rounded-2xl border border-[#e8e0d5] bg-white px-3.5 py-1.5 text-sm text-[#5c5248] transition-colors hover:border-[#d4a373]"
                  >
                    <span>{l.emoji}</span> {l.label}
                  </Link>
                ))}
              </div>
            </div>
          )}
          {locale === "ru" && (
            <div className="mt-5 border-t border-[#e8e0d5] pt-5">
              <div className="mb-3 text-sm font-medium text-[#8a7c6d]">По документам</div>
              <div className="flex flex-wrap gap-2">
                {usecaseLinks().map((uc) => (
                  <Link
                    key={uc.key}
                    href={localizedPath(locale, `/keep/${uc.key}`)}
                    className="inline-flex items-center gap-1.5 rounded-2xl border border-[#e8e0d5] bg-white px-3.5 py-1.5 text-sm text-[#5c5248] transition-colors hover:border-[#d4a373]"
                  >
                    <span>{uc.emoji}</span> {uc.label}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* WHAT TO STORE */}
      <section id="what-to-store" className="mx-auto max-w-screen-xl px-5 py-12">
        <div className="mb-8">
          <h2 className="section-header mb-2">{t.store.heading}</h2>
          <p className="text-xl text-[#5c5248]">{t.store.sub}</p>
        </div>

        <div className="grid gap-4">
          <div className="warm-card rounded-3xl border border-[#e8e0d5] p-7">
            <div className="flex items-start gap-x-5">
              <div className="mt-1 text-5xl">🩺</div>
              <div className="flex-1">
                <div className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-1">
                  <div className="text-2xl font-semibold">{t.store.medTitle}</div>
                  <span className="rounded-full bg-gradient-to-r from-[#b85c38] to-[#d4a373] px-3 py-0.5 text-xs font-semibold text-white">
                    {t.store.medBadge}
                  </span>
                </div>
                <div className="grid grid-cols-1 gap-x-8 text-[#5c5248] md:grid-cols-2">
                  <ul className="space-y-1.5 text-[15px]">
                    {t.store.medCol1.map((it) => <li key={it}>• {it}</li>)}
                  </ul>
                  <ul className="mt-3 space-y-1.5 text-[15px] md:mt-0">
                    {t.store.medCol2.map((it) => <li key={it}>• {it}</li>)}
                  </ul>
                </div>
                <div className="mt-4 text-sm font-medium text-[#b85c38]">{t.store.medNote}</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {t.store.cats.map((c) => (
              <div key={c.title} className="warm-card rounded-3xl border border-[#e8e0d5] p-6">
                <div className="mb-3 flex items-center gap-x-2 text-xl font-semibold">
                  <span>{c.icon}</span>
                  <span>{c.title}</span>
                </div>
                <ul className="space-y-1.5 text-[15px] text-[#5c5248]">
                  {c.items.map((it) => <li key={it}>{it}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="mx-auto max-w-screen-xl rounded-3xl border border-[#e8e0d5] bg-[#fdfaf5] px-5 py-12">
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <h2 className="section-header mb-3">{t.how.heading}</h2>
          <p className="text-xl text-[#5c5248]">{t.how.sub}</p>
        </div>
        <div className="mx-auto grid max-w-3xl gap-x-8 gap-y-8 md:grid-cols-2">
          {t.how.steps.map((s) => (
            <div key={s.n} className="flex gap-5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-[#e8e0d5] bg-white text-2xl font-semibold text-[#b85c38]">
                {s.n}
              </div>
              <div>
                <div className="mb-1.5 text-xl font-semibold">{s.title}</div>
                <p className="text-[#5c5248]">{s.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SECURITY */}
      <section id="security" className="mx-auto max-w-screen-xl px-5 py-14">
        <div className="mx-auto mb-10 max-w-3xl text-center">
          <h2 className="section-header mb-3">{t.security.heading}</h2>
          <p className="text-xl text-[#5c5248]">{t.security.sub}</p>
          <p className="mx-auto mt-4 max-w-2xl text-[#5c5248]">{t.security.promise}</p>
        </div>
        <div className="mx-auto grid max-w-4xl gap-5 md:grid-cols-2">
          {t.security.items.map((s) => (
            <div key={s.title} className="warm-card rounded-3xl border border-[#e8e0d5] p-7">
              <div className="flex gap-x-4">
                <div className="text-3xl">{s.icon}</div>
                <div>
                  <div className="mb-2 text-xl font-semibold">{s.title}</div>
                  <p className="text-[#5c5248]">{s.text}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-8 text-center">
          <Link
            href={localizedPath(locale, "/security")}
            className="text-sm font-medium text-[#b85c38] hover:underline"
          >
            {t.footer.security} →
          </Link>
        </div>
      </section>

      {/* WHY BETTER THAN A REGULAR CLOUD */}
      <section className="mx-auto max-w-screen-xl px-5 py-12">
        <div className="mb-6">
          <h2 className="section-header mb-2">{t.diff.heading}</h2>
          <p className="text-xl text-[#5c5248]">{t.diff.intro}</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {t.diff.items.map((d) => (
            <div key={d.t} className="warm-card rounded-3xl border border-[#e8e0d5] p-6">
              <div className="mb-1.5 text-xl font-semibold">{d.t}</div>
              <p className="text-[#5c5248]">{d.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto max-w-screen-xl px-5 py-12">
        <div className="mx-auto mb-8 max-w-3xl text-center">
          <h2 className="section-header mb-3">{t.faq.heading}</h2>
        </div>
        <div className="mx-auto max-w-3xl divide-y divide-[#e8e0d5] overflow-hidden rounded-3xl border border-[#e8e0d5] bg-white">
          {t.faq.items.map((f) => (
            <details key={f.q} className="group px-6 py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-lg font-semibold text-[#2c2522]">
                <span>{f.q}</span>
                <span className="shrink-0 text-2xl leading-none text-[#b85c38] transition-transform group-open:rotate-45">+</span>
              </summary>
              <p className="mt-3 text-[#5c5248]">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* WHO RUNS THE SERVICE */}
      <section className="mx-auto max-w-screen-xl px-5 pb-2">
        <div className="mx-auto max-w-3xl rounded-3xl border border-[#e8e0d5] bg-[#fdfaf5] px-6 py-5 text-center text-sm text-[#5c5248]">
          <div className="mb-1 font-semibold text-[#2c2522]">{t.operator.heading}</div>
          <div>{t.operator.line}</div>
          <div className="mt-1">
            {t.operator.contactLabel}{" "}
            <a href="mailto:support@doki.help" className="text-[#b85c38] hover:underline">
              support@doki.help
            </a>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="mx-auto max-w-screen-xl px-5 py-10">
        <div className="rounded-3xl bg-[#2c2522] px-8 py-10 text-center text-[#f9f5f0]">
          <h2 className="mb-4 text-3xl font-semibold tracking-tight">{t.cta.heading}</h2>
          <p className="mx-auto mb-7 max-w-sm text-[#d4c9b8]">{t.cta.sub}</p>
          <Link href={signupPath(locale)} className="inline-flex items-center justify-center rounded-3xl bg-[#b85c38] px-10 py-4 text-lg font-semibold transition-all hover:bg-[#9f4a2e] active:scale-[0.985]">
            {t.cta.button}
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-[#e8e0d5] bg-[#fdfaf5] px-5 py-8 text-sm text-[#8a7c6d]">
        <div className="mx-auto flex max-w-screen-xl flex-col items-center justify-between gap-y-3 text-center md:flex-row md:text-left">
          <div>{t.footer.copyright}</div>
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-1">
            <Link href={localizedPath(locale, "/pricing")} className="hover:text-[#2c2522]">{t.footer.pricing}</Link>
            <Link href={localizedPath(locale, "/security")} className="hover:text-[#2c2522]">{t.footer.security}</Link>
            {trustLinks(locale).map((tl) => (
              <Link key={tl.key} href={localizedPath(locale, `/${tl.key}`)} className="hover:text-[#2c2522]">{tl.label}</Link>
            ))}
            <Link href={localizedPath(locale, "/privacy")} className="hover:text-[#2c2522]">{t.footer.privacy}</Link>
            <Link href={localizedPath(locale, "/login")} className="hover:text-[#2c2522]">{t.footer.login}</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

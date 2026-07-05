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
import { trustLinks } from "@/lib/trust";

// Сгенерированные кинематографичные ассеты (Higgsfield · nano-banana / kling).
// Хостинг — тот же CDN, что использовался для прежней hero-картинки.
const CDN = "https://d8j0ntlcm91z4.cloudfront.net/user_3EKntK4EDjG8nay4H1dy1TK30mB";
const MEDIA = {
  heroVideo: `${CDN}/hf_20260705_173559_470d784d-c825-4060-9400-401a45fa6312.mp4`,
  heroPoster: `${CDN}/hf_20260705_173205_0c5580fc-2c91-4fb3-9491-b220403182bb_min.webp`,
  chaos: `${CDN}/hf_20260705_173216_9403d270-0146-4f13-b568-6a22749745c0_min.webp`,
  employer: `${CDN}/hf_20260705_174154_99154d83-7edc-496c-9a27-e6d039f29f05_min.webp`,
  phone: `${CDN}/hf_20260705_180101_daf59700-7ab3-4177-91ba-adfb7c76e067_min.webp`,
  aiScanPoster: `${CDN}/hf_20260705_184004_737afa3e-e56e-42f4-97c7-d9fc0f3fd4a6_min.webp`,
  aiScanVideo: `${CDN}/hf_20260705_184118_1f7d77c8-e242-4840-9866-6afaf9b5dca8.mp4`,
};

const MEDIA_ALT: Record<Locale, { chaos: string; employer: string; phone: string }> = {
  ru: { chaos: "Из хаоса чатов и папок — в один аккуратный пакет документов", employer: "Владелец кафе спокойно просматривает кандидатов с документами", phone: "Приложение doki.help на телефоне: документы семьи разложены по разделам" },
  en: { chaos: "From chat-and-folder chaos into one tidy document package", employer: "A cafe owner calmly reviewing candidates with documents", phone: "The doki.help app on a phone: family documents neatly organized" },
  id: { chaos: "Dari kekacauan chat dan folder menjadi satu paket dokumen rapi", employer: "Pemilik kafe meninjau kandidat lengkap dengan dokumen", phone: "Aplikasi doki.help di ponsel: dokumen keluarga tertata rapi" },
  uz: { chaos: "Chat va papkalar tartibsizligidan — bitta ozoda hujjatlar paketiga", employer: "Kafe egasi hujjatlari bilan nomzodlarni xotirjam koʻrib chiqmoqda", phone: "Telefondagi doki.help ilovasi: oila hujjatlari tartib bilan joylangan" },
};

// Заголовки блоков внутренней перелинковки на новые SEO-страницы.
const MORE_HEADINGS: Record<Locale, { tools: string; checklists: string }> = {
  ru: { tools: "Напоминания о сроках и сейфы", checklists: "Чеклисты документов" },
  en: { tools: "Expiry reminders & vaults", checklists: "Document checklists" },
  id: { tools: "Pengingat tenggat & brankas", checklists: "Ceklis dokumen" },
  uz: { tools: "Muddat eslatmalari va seyflar", checklists: "Hujjat roʻyxatlari" },
};

type Cat = { icon: string; title: string; items: string[] };
type Step = { n: string; title: string; text: string };
type Sec = { icon: string; title: string; text: string };
type Faq = { q: string; a: string };

type Role = { emoji: string; label: string; href: string };
type Scenario = { emoji: string; title: string; text: string; cta: string; href: string };

type Dict = {
  nav: { login: string; start: string; startShort: string };
  hero: {
    kicker: string;
    titlePre: string;
    titleAccent: string;
    subtitle: string;
    cta1: string;
    cta2: string;
    trust: string[];
    roles: Role[];
    pkg: {
      title: string;
      vacancy: string;
      needTitle: string;
      need: string[];
      readyTitle: string;
      ready: string[];
      send: string;
      badge: string;
      chip: string;
    };
  };
  scenarios: { heading: string; items: Scenario[] };
  employer: {
    heading: string;
    text: string;
    cardTitle: string;
    doLabel: string;
    doItems: string[];
    askLabel: string;
    askItems: string[];
    qLabel: string;
    qItems: string[];
    cta: string;
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
  pain: { heading: string; items: { t: string; d: string }[] };
  how: { heading: string; sub: string; steps: Step[]; aiNote: string };
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
      kicker: "Пакет документов — для реальных действий",
      titlePre: "Документы, которые можно",
      titleAccent: "сразу использовать",
      subtitle:
        "Соберите резюме, ID, сертификаты, справки, портфолио и семейные документы в одном месте. Откликайтесь на вакансии, нанимайте с нужными документами или отправляйте выбранный пакет по защищённой ссылке.",
      cta1: "Собрать первый пакет",
      cta2: "Посмотреть демо",
      trust: ["2 ГБ бесплатно", "Доступ можно отозвать", "Документы не передаются в AI без вашего решения"],
      roles: [
        { emoji: "🙋", label: "Ищу работу → резюме", href: "/login?next=/my/resume" },
        { emoji: "💼", label: "Нанимаю → вакансия", href: "/login?next=/employer/vacancies/new" },
        { emoji: "🎨", label: "Фрилансер → портфолио", href: "/login?next=/my/freelance" },
      ],
      pkg: {
        title: "Пакет для отклика",
        vacancy: "Вакансия: Бариста · Чангу",
        needTitle: "Работодатель просит:",
        need: ["CV", "ID / паспорт", "Сертификат", "Видео-ответ до 60 сек"],
        readyTitle: "Ваш пакет готов:",
        ready: ["Резюме готово", "ID выбран", "Сертификат выбран", "WhatsApp добавлен"],
        send: "Отправить отклик",
        badge: "Не весь архив — только выбранные документы.",
        chip: "🔗 Ссылка истекает · доступ можно отозвать",
      },
    },
    scenarios: {
      heading: "Используйте документы там, где они нужны",
      items: [
        { emoji: "🙋", title: "Откликайтесь готовым пакетом", text: "CV, ID, сертификаты, портфолио, ответы и видео — работодателю одним кликом.", cta: "Создать резюме", href: "/login?next=/my/resume" },
        { emoji: "💼", title: "Получайте отклики сразу с документами", text: "Создайте вакансию, выберите нужные документы и вопросы — кандидаты приходят в одно место.", cta: "Разместить вакансию", href: "/login?next=/employer/vacancies/new" },
        { emoji: "🎨", title: "Покажите работы одной ссылкой", text: "Соберите портфолио, добавьте контакты — клиент откроет без входа.", cta: "Создать портфолио", href: "/login?next=/my/freelance" },
        { emoji: "👪", title: "Держите важное под рукой", text: "Паспорта, страховки, справки, документы ребёнка и сроки — в одном месте.", cta: "Загрузить документы", href: "/login" },
      ],
    },
    employer: {
      heading: "Не знаете, кого нанять? Начните с задачи.",
      text: "Опишите, что нужно сделать: «человек на смены в кафе», «кто-то отвечать в WhatsApp», «ассистент для операционки». doki.help предложит роль, задачи, документы и вопросы для кандидата.",
      cardTitle: "Вакансия: Бариста",
      doLabel: "Что будет делать:",
      doItems: ["готовить кофе", "обслуживать гостей", "работать с кассой"],
      askLabel: "Что попросить у кандидата:",
      askItems: ["CV", "ID / паспорт", "сертификат", "видео-ответ до 60 сек"],
      qLabel: "Вопросы:",
      qItems: ["Когда готовы выйти?", "Какой опыт с кофемашиной?"],
      cta: "Создать вакансию",
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
        { icon: "💼", title: "Работа и карьера", items: ["CV и резюме", "Дипломы и сертификаты", "Портфолио", "Рекомендательные письма", "Трудовые договоры"] },
        { icon: "📄", title: "Личные и миграционные документы", items: ["Паспорта и загранпаспорта", "Визы и визовые документы", "Документы на гражданство", "СНИЛС, ИНН, военный билет", "Дипломы, аттестаты, сертификаты"] },
        { icon: "✈️", title: "Поездки и путешествия", items: ["Путёвки и ваучеры", "Билеты и бронирования", "Страховки для поездок", "Документы для въезда/выезда", "Согласия на выезд ребёнка"] },
        { icon: "🚗", title: "Авто и недвижимость", items: ["ОСАГО и КАСКО", "ПТС и СТС", "Выписки ЕГРН и договоры"] },
        { icon: "🧾", title: "Квитанции и справки", items: ["Квитанции и чеки об оплате", "Справки с работы / учёбы", "Доверенности"] },
      ],
    },
    pain: {
      heading: "Документы нужны не «когда-нибудь». Они нужны срочно.",
      items: [
        { t: "Отклик на работу", d: "Вакансия уже открыта, а CV, ID и сертификат лежат в разных чатах." },
        { t: "Найм сотрудника", d: "Кандидаты присылают документы кусками в WhatsApp — потом их кто-то героически ищет." },
        { t: "Семья и поездки", d: "В аэропорту нужен полис, в школе справка, у паспорта заканчивается срок." },
        { t: "Фриланс и клиенты", d: "Клиент просит портфолио и подтверждения — и вы снова собираете ссылки вручную." },
      ],
    },
    how: {
      heading: "Один раз собрали документы. Дальше отправляете только нужное.",
      sub: "Главный принцип: отправляется не весь сейф, а собранный вами пакет.",
      steps: [
        { n: "1", title: "Загрузите документы", text: "Резюме, паспорт, ID, дипломы, сертификаты, медсправки, портфолио, страховки." },
        { n: "2", title: "Разложите по людям и задачам", text: "Для себя, семьи, ребёнка, кандидата, сотрудника или фриланс-профиля." },
        { n: "3", title: "Соберите пакет", text: "Только нужные документы: для отклика, работодателя, школы, врача или поездки." },
        { n: "4", title: "Отправьте безопасную ссылку", text: "Ссылка действует ограниченное время. Доступ можно отозвать в любой момент." },
      ],
      aiNote: "🤖 AI сам найдёт срок действия на фото документа — виза, ОСАГО, паспорт. Нажали «Распознать» — дата вписалась, напоминание придёт заранее. Включается по желанию, ничего не уходит без вашего разрешения.",
    },
    security: {
      heading: "Вы отправляете не весь сейф — только выбранные документы",
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
      heading: "Соберите документы один раз. Используйте каждый раз, когда они нужны.",
      sub: "Для работы, найма, семьи, поездок и безопасной отправки документов.",
      button: "Собрать первый пакет бесплатно",
    },
    faq: {
      heading: "Частые вопросы",
      items: [
        { q: "Это бесплатно?", a: "Да. Сейчас бесплатно: 2 ГБ места, напоминания о сроках, общий доступ для семьи и работа офлайн. Позже появится платный тариф с бóльшим объёмом — то, что доступно сейчас, останется." },
        { q: "Кто видит мои документы?", a: "Только вы и те члены семьи, кому вы открыли доступ. Доступ изолирован на уровне базы данных (RLS), файлы — в приватном хранилище." },
        { q: "Как работают напоминания?", a: "Впишите срок действия документа сами — или нажмите «Распознать», и AI сам найдёт дату на фото (загранпаспорт, ОСАГО, виза). Дальше сервис заранее пришлёт напоминание на email." },
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
    nav: { login: "Sign in", start: "Get started free", startShort: "Start" },
    hero: {
      kicker: "A document package — built for action",
      titlePre: "Documents you can",
      titleAccent: "actually use",
      subtitle:
        "Gather your CV, ID, certificates, records, portfolio and family documents in one place. Apply to jobs, hire with the right documents, or send a selected package via a secure link.",
      cta1: "Build your first package",
      cta2: "See the demo",
      trust: ["2 GB free", "Access can be revoked", "Documents never go to AI without your say"],
      roles: [
        { emoji: "🙋", label: "Job seeker → resume", href: "/login?next=/my/resume" },
        { emoji: "💼", label: "Hiring → vacancy", href: "/login?next=/employer/vacancies/new" },
        { emoji: "🎨", label: "Freelancer → portfolio", href: "/login?next=/my/freelance" },
      ],
      pkg: {
        title: "Application package",
        vacancy: "Vacancy: Barista · Canggu",
        needTitle: "The employer asks for:",
        need: ["CV", "ID / passport", "Certificate", "Video answer, 60 sec"],
        readyTitle: "Your package is ready:",
        ready: ["Resume ready", "ID selected", "Certificate selected", "WhatsApp added"],
        send: "Send application",
        badge: "Not your whole archive — only the documents you picked.",
        chip: "🔗 Link expires · access can be revoked",
      },
    },
    scenarios: {
      heading: "Use your documents where they're needed",
      items: [
        { emoji: "🙋", title: "Apply with a ready package", text: "CV, ID, certificates, portfolio, answers and video — sent to the employer in one click.", cta: "Create a resume", href: "/login?next=/my/resume" },
        { emoji: "💼", title: "Get applications with documents attached", text: "Create a vacancy, pick the documents and questions — candidates arrive in one place.", cta: "Post a vacancy", href: "/login?next=/employer/vacancies/new" },
        { emoji: "🎨", title: "Show your work with one link", text: "Build a portfolio, add contacts — the client opens it with no sign-in.", cta: "Create a portfolio", href: "/login?next=/my/freelance" },
        { emoji: "👪", title: "Keep the essentials at hand", text: "Passports, insurance, certificates, your child's documents and deadlines — in one place.", cta: "Upload documents", href: "/login" },
      ],
    },
    employer: {
      heading: "Not sure who to hire? Start from the task.",
      text: "Describe what needs doing: “someone for cafe shifts”, “someone to answer WhatsApp”, “an assistant for operations”. doki.help will suggest the role, tasks, documents and candidate questions.",
      cardTitle: "Vacancy: Barista",
      doLabel: "What they'll do:",
      doItems: ["make coffee", "serve guests", "handle the register"],
      askLabel: "What to request:",
      askItems: ["CV", "ID / passport", "certificate", "video answer, 60 sec"],
      qLabel: "Questions:",
      qItems: ["When can you start?", "Espresso machine experience?"],
      cta: "Create a vacancy",
    },
    store: {
      heading: "What you can keep in your vault",
      sub: "Everything important for your family — in one secure place.",
      medTitle: "Medical results and tests",
      medBadge: "Reminders — free",
      medCol1: ["Lab test results", "Blood panels, CBC, hormones, urinalysis", "Ultrasound, MRI, CT, X-ray"],
      medCol2: ["Doctor's reports", "Vaccination certificates", "Medical certificates"],
      medNote: "Deadline reminders — free.",
      cats: [
        { icon: "💼", title: "Work & career", items: ["CV & resume", "Diplomas and certificates", "Portfolio", "Reference letters", "Employment contracts"] },
        { icon: "📄", title: "Personal & immigration documents", items: ["Passports & international passports", "Visas and visa paperwork", "Citizenship documents", "Tax & social security IDs", "Diplomas and certificates"] },
        { icon: "✈️", title: "Trips & travel", items: ["Tour packages & vouchers", "Tickets and bookings", "Travel insurance", "Entry/exit documents", "Child travel consents"] },
        { icon: "🚗", title: "Vehicles & property", items: ["Car insurance", "Vehicle titles & registration", "Property records & contracts"] },
        { icon: "🧾", title: "Receipts & certificates", items: ["Payment receipts", "Work / study certificates", "Powers of attorney"] },
      ],
    },
    pain: {
      heading: "Documents aren't needed “someday”. They're needed urgently.",
      items: [
        { t: "Applying for a job", d: "The vacancy is open, but your CV, ID and certificate live in different chats." },
        { t: "Hiring someone", d: "Candidates send documents in pieces over WhatsApp — then someone heroically hunts them down." },
        { t: "Family & travel", d: "The airport wants your insurance, the school wants a certificate, your passport is expiring." },
        { t: "Freelance & clients", d: "A client asks for your portfolio and proof — and you're collecting links by hand again." },
      ],
    },
    how: {
      heading: "Gather your documents once. Then send only what's needed.",
      sub: "The core principle: what you send is a package you picked — never the whole vault.",
      steps: [
        { n: "1", title: "Upload your documents", text: "Resume, passport, ID, diplomas, certificates, medical records, portfolio, insurance." },
        { n: "2", title: "Sort by people and tasks", text: "For yourself, family, a child, a candidate, an employee or a freelance profile." },
        { n: "3", title: "Build a package", text: "Only the documents needed: for an application, employer, school, doctor or trip." },
        { n: "4", title: "Send a secure link", text: "The link is time-limited. Access can be revoked at any moment." },
      ],
      aiNote: "🤖 AI can spot the expiry date on a document photo — a visa, insurance, a passport. Tap “Recognize”, the date fills in, and the reminder arrives in advance. Opt-in — nothing is sent anywhere without your say.",
    },
    security: {
      heading: "You send only selected documents — never the whole vault",
      sub: "We know how important these documents are — and built everything so you can feel at ease.",
      promise:
        "Your privacy and security are our top priority. Your data is kept in a secure cloud and sent over HTTPS, with access locked down by strict database rules. We never sell or trade your data, and we never share it for advertising.",
      items: [
        { icon: "👨‍👩‍👧", title: "Only your family sees the documents", text: "Access is isolated at the database level (RLS) — outsiders can't see your documents." },
        { icon: "🛡️", title: "Secure sign-in and storage", text: "Files in private storage, transfer over HTTPS. Two-factor sign-in and an email alert on new-device logins." },
        { icon: "🎚️", title: "You control access", text: "Share a document via an expiring link and revoke it anytime." },
        { icon: "🙅", title: "We don't sell your data", text: "We never share or sell your data to third parties." },
        { icon: "📥", title: "Available offline", text: "Save the documents you need to your phone and open them even with no connection — on a trip or in roaming." },
      ],
    },
    cta: {
      heading: "Gather your documents once. Use them every time they're needed.",
      sub: "For work, hiring, family, travel and secure document sharing.",
      button: "Build your first package — free",
    },
    faq: {
      heading: "Frequently asked questions",
      items: [
        { q: "Is it free?", a: "Yes. Right now you get 2 GB of storage, deadline reminders, family sharing and offline access — for free. A paid plan with more storage will come later; what's available now stays." },
        { q: "Who can see my documents?", a: "Only you and the family members you grant access to. Access is isolated at the database level (RLS), and files are kept in private storage." },
        { q: "How do reminders work?", a: "Enter a document's expiry date yourself — or tap “Recognize” and AI finds the date on the photo (passport, insurance, visa). Either way, the service emails you a reminder in advance." },
        { q: "Can I share a document?", a: "Yes — via a time-limited link you can revoke at any moment." },
        { q: "Where is my data stored?", a: "In secure cloud storage, with transfer over HTTPS. We never sell or share your data with third parties." },
        { q: "Can I export my documents?", a: "Yes. The cabinet has an export — take your files and data out at any time, with no lock-in." },
        { q: "Does the service use AI to read my documents?", a: "By default, no. AI recognition is off; you turn it on yourself in settings, and only then is a document image sent to an AI provider." },
        { q: "Why is it better than Google Drive or my phone gallery?", a: "A regular cloud just stores files. doki sorts documents by person and category, reminds you of deadlines, and lets you share a single document via an expiring link — not the whole folder." },
      ],
    },
    forWhom: {
      heading: "Who it's for",
      items: [
        "Families who want all important documents in one place",
        "Parents — keep and never lose your children's documents",
        "Frequent travelers: passports, visas, insurance at hand",
        "Anyone afraid of missing a deadline — visa, insurance, passport renewal",
        "Those who share documents with a doctor or lawyer via a secure link",
      ],
    },
    diff: {
      heading: "Why it beats a regular cloud",
      intro: "doki.help isn't just another file drive — it's built for documents:",
      items: [
        { t: "Reminds you of deadlines", d: "Set a date and a reminder comes in advance. A regular cloud can't do that." },
        { t: "Organized by people and categories", d: "Documents are sorted by family member and type, not dumped into folders." },
        { t: "Safe per-document sharing", d: "A temporary link to a single file that you can revoke." },
        { t: "Works offline", d: "Open the documents you need with no internet — on a trip or in roaming." },
      ],
    },
    operator: {
      heading: "Who runs the service",
      line: "Operator: the owner of the doki.help service, TIN 780728592634.",
      contactLabel: "Support:",
    },
    footer: { copyright: "© 2026 doki.help — Family document vault", pricing: "Pricing", security: "Security", privacy: "Privacy", login: "Sign in" },
  },
  id: {
    nav: { login: "Masuk", start: "Mulai gratis", startShort: "Mulai" },
    hero: {
      kicker: "Paket dokumen — siap dipakai beraksi",
      titlePre: "Dokumen yang bisa",
      titleAccent: "langsung dipakai",
      subtitle:
        "Kumpulkan CV, KTP, sertifikat, surat, portofolio, dan dokumen keluarga di satu tempat. Lamar kerja, rekrut dengan dokumen yang tepat, atau kirim paket pilihan lewat tautan aman.",
      cta1: "Susun paket pertama",
      cta2: "Lihat demo",
      trust: ["2 GB gratis", "Akses bisa dicabut", "Dokumen tidak dikirim ke AI tanpa izin Anda"],
      roles: [
        { emoji: "🙋", label: "Cari kerja → resume", href: "/login?next=/my/resume" },
        { emoji: "💼", label: "Merekrut → lowongan", href: "/login?next=/employer/vacancies/new" },
        { emoji: "🎨", label: "Freelancer → portofolio", href: "/login?next=/my/freelance" },
      ],
      pkg: {
        title: "Paket lamaran",
        vacancy: "Lowongan: Barista · Canggu",
        needTitle: "Diminta perusahaan:",
        need: ["CV", "KTP / paspor", "Sertifikat", "Jawaban video 60 dtk"],
        readyTitle: "Paket Anda siap:",
        ready: ["Resume siap", "KTP dipilih", "Sertifikat dipilih", "WhatsApp ditambahkan"],
        send: "Kirim lamaran",
        badge: "Bukan seluruh arsip — hanya dokumen yang Anda pilih.",
        chip: "🔗 Tautan kedaluwarsa · akses bisa dicabut",
      },
    },
    scenarios: {
      heading: "Pakai dokumen di tempat yang membutuhkannya",
      items: [
        { emoji: "🙋", title: "Lamar dengan paket siap kirim", text: "CV, KTP, sertifikat, portofolio, jawaban dan video — ke perusahaan dalam satu klik.", cta: "Buat resume", href: "/login?next=/my/resume" },
        { emoji: "💼", title: "Terima lamaran lengkap dengan dokumen", text: "Buat lowongan, pilih dokumen dan pertanyaan — kandidat masuk ke satu tempat.", cta: "Pasang lowongan", href: "/login?next=/employer/vacancies/new" },
        { emoji: "🎨", title: "Tunjukkan karya lewat satu tautan", text: "Susun portofolio, tambah kontak — klien membukanya tanpa login.", cta: "Buat portofolio", href: "/login?next=/my/freelance" },
        { emoji: "👪", title: "Simpan yang penting di dekat Anda", text: "Paspor, asuransi, surat, dokumen anak dan tenggatnya — di satu tempat.", cta: "Unggah dokumen", href: "/login" },
      ],
    },
    employer: {
      heading: "Belum tahu mau merekrut siapa? Mulai dari tugasnya.",
      text: "Jelaskan yang perlu dikerjakan: “orang untuk shift kafe”, “yang membalas WhatsApp”, “asisten operasional”. doki.help menyarankan peran, tugas, dokumen dan pertanyaan kandidat.",
      cardTitle: "Lowongan: Barista",
      doLabel: "Yang akan dikerjakan:",
      doItems: ["membuat kopi", "melayani tamu", "menangani kasir"],
      askLabel: "Yang diminta dari kandidat:",
      askItems: ["CV", "KTP / paspor", "sertifikat", "jawaban video 60 dtk"],
      qLabel: "Pertanyaan:",
      qItems: ["Kapan bisa mulai?", "Pengalaman mesin espresso?"],
      cta: "Buat lowongan",
    },
    store: {
      heading: "Apa saja yang bisa disimpan di brankas Anda",
      sub: "Semua yang penting bagi keluarga Anda — di satu tempat yang aman.",
      medTitle: "Hasil dan pemeriksaan medis",
      medBadge: "Pengingat — gratis",
      medCol1: ["Hasil pemeriksaan laboratorium", "Panel darah, CBC, hormon, urinalisis", "USG, MRI, CT, rontgen"],
      medCol2: ["Laporan dokter", "Sertifikat vaksinasi", "Surat keterangan medis"],
      medNote: "Pengingat tenggat — gratis.",
      cats: [
        { icon: "💼", title: "Kerja & karier", items: ["CV & resume", "Ijazah dan sertifikat", "Portofolio", "Surat rekomendasi", "Kontrak kerja"] },
        { icon: "📄", title: "Dokumen pribadi & imigrasi", items: ["Paspor & paspor internasional", "Visa dan berkas visa", "Dokumen kewarganegaraan", "NPWP & nomor jaminan sosial", "Ijazah dan sertifikat"] },
        { icon: "✈️", title: "Perjalanan & wisata", items: ["Paket tur & voucher", "Tiket dan pemesanan", "Asuransi perjalanan", "Dokumen masuk/keluar", "Surat izin perjalanan anak"] },
        { icon: "🚗", title: "Kendaraan & properti", items: ["Asuransi mobil", "BPKB & STNK kendaraan", "Sertifikat properti & kontrak"] },
        { icon: "🧾", title: "Kuitansi & surat keterangan", items: ["Bukti pembayaran", "Surat keterangan kerja / studi", "Surat kuasa"] },
      ],
    },
    pain: {
      heading: "Dokumen tidak dibutuhkan “kapan-kapan”. Dibutuhkannya mendesak.",
      items: [
        { t: "Melamar kerja", d: "Lowongan sudah dibuka, tapi CV, KTP dan sertifikat tersebar di banyak chat." },
        { t: "Merekrut karyawan", d: "Kandidat mengirim dokumen sepotong-sepotong lewat WhatsApp — lalu seseorang mencarinya dengan heroik." },
        { t: "Keluarga & perjalanan", d: "Bandara minta asuransi, sekolah minta surat, paspor hampir kedaluwarsa." },
        { t: "Freelance & klien", d: "Klien minta portofolio dan bukti — dan Anda kembali mengumpulkan tautan satu per satu." },
      ],
    },
    how: {
      heading: "Kumpulkan dokumen sekali. Selanjutnya kirim yang perlu saja.",
      sub: "Prinsip utama: yang terkirim adalah paket pilihan Anda — bukan seluruh brankas.",
      steps: [
        { n: "1", title: "Unggah dokumen", text: "Resume, paspor, KTP, ijazah, sertifikat, surat medis, portofolio, asuransi." },
        { n: "2", title: "Susun per orang dan tugas", text: "Untuk Anda, keluarga, anak, kandidat, karyawan, atau profil freelance." },
        { n: "3", title: "Susun paket", text: "Hanya dokumen yang dibutuhkan: untuk lamaran, perusahaan, sekolah, dokter, atau perjalanan." },
        { n: "4", title: "Kirim tautan aman", text: "Tautan berbatas waktu. Akses bisa dicabut kapan saja." },
      ],
      aiNote: "🤖 AI bisa menemukan tanggal kedaluwarsa dari foto dokumen — visa, asuransi, paspor. Tekan \"Kenali\", tanggal terisi otomatis, pengingat datang lebih awal. Opsional — tidak ada yang dikirim tanpa izin Anda.",
    },
    security: {
      heading: "Yang terkirim hanya dokumen pilihan — bukan seluruh brankas",
      sub: "Kami paham betapa pentingnya dokumen-dokumen ini — dan membangun semuanya agar Anda merasa tenang.",
      promise:
        "Privasi dan keamanan adalah prioritas utama kami. Data Anda disimpan di cloud yang aman dan dikirim melalui HTTPS, dengan akses dibatasi aturan basis data yang ketat. Kami tidak pernah menjual atau memperdagangkan data Anda, dan tidak membagikannya untuk iklan.",
      items: [
        { icon: "👨‍👩‍👧", title: "Hanya keluarga Anda yang melihat dokumen", text: "Akses diisolasi pada tingkat basis data (RLS) — pihak luar tidak bisa melihat dokumen Anda." },
        { icon: "🛡️", title: "Masuk dan penyimpanan aman", text: "Berkas di penyimpanan privat, transfer lewat HTTPS. Masuk dua faktor dan email peringatan saat login dari perangkat baru." },
        { icon: "🎚️", title: "Anda yang mengendalikan akses", text: "Bagikan dokumen lewat tautan berbatas waktu dan cabut kapan saja." },
        { icon: "🙅", title: "Kami tidak menjual data Anda", text: "Kami tidak pernah membagikan atau menjual data Anda ke pihak ketiga." },
        { icon: "📥", title: "Tersedia offline", text: "Simpan dokumen yang Anda butuhkan ke ponsel dan buka meski tanpa koneksi — saat bepergian atau roaming." },
      ],
    },
    cta: {
      heading: "Kumpulkan dokumen sekali. Pakai setiap kali dibutuhkan.",
      sub: "Untuk kerja, rekrutmen, keluarga, perjalanan, dan pengiriman dokumen yang aman.",
      button: "Susun paket pertama — gratis",
    },
    faq: {
      heading: "Pertanyaan umum",
      items: [
        { q: "Apakah gratis?", a: "Ya. Saat ini gratis: penyimpanan 2 GB, pengingat tenggat, berbagi untuk keluarga, dan akses offline. Paket berbayar dengan ruang lebih besar akan hadir nanti — yang tersedia sekarang tetap ada." },
        { q: "Siapa yang bisa melihat dokumen saya?", a: "Hanya Anda dan anggota keluarga yang Anda beri akses. Akses diisolasi pada tingkat basis data (RLS), dan berkas disimpan di penyimpanan privat." },
        { q: "Bagaimana pengingat bekerja?", a: "Masukkan tanggal berlaku dokumen sendiri — atau tekan \"Kenali\", AI akan menemukan tanggalnya dari foto (paspor, asuransi, visa). Layanan lalu mengirim pengingat ke email lebih awal." },
        { q: "Bisakah saya membagikan dokumen?", a: "Ya — lewat tautan berbatas waktu yang bisa Anda cabut kapan saja." },
        { q: "Di mana data saya disimpan?", a: "Di penyimpanan awan yang aman, dengan transfer lewat HTTPS. Kami tidak pernah menjual atau membagikan data Anda ke pihak ketiga." },
        { q: "Bisakah saya mengekspor dokumen saya?", a: "Ya. Di kabinet ada ekspor — ambil berkas dan data Anda kapan saja, tanpa terkunci ke layanan." },
        { q: "Apakah layanan memakai AI untuk membaca dokumen saya?", a: "Secara bawaan, tidak. Pengenalan AI nonaktif; Anda mengaktifkannya sendiri di pengaturan, dan baru saat itu gambar dokumen dikirim ke penyedia AI." },
        { q: "Kenapa lebih baik dari Google Drive atau galeri ponsel?", a: "Cloud biasa hanya menyimpan berkas. doki menata dokumen per orang dan kategori, mengingatkan tenggat, dan memungkinkan berbagi satu dokumen lewat tautan berbatas waktu — bukan seluruh folder." },
      ],
    },
    forWhom: {
      heading: "Untuk siapa",
      items: [
        "Keluarga yang ingin semua dokumen penting di satu tempat",
        "Orang tua — menyimpan dan tidak kehilangan dokumen anak",
        "Sering bepergian: paspor, visa, asuransi selalu siap",
        "Siapa pun yang takut melewatkan tenggat — visa, asuransi, perpanjangan paspor",
        "Yang berbagi dokumen dengan dokter atau pengacara lewat tautan aman",
      ],
    },
    diff: {
      heading: "Kenapa lebih baik dari cloud biasa",
      intro: "doki.help bukan sekadar drive berkas — dibuat khusus untuk dokumen:",
      items: [
        { t: "Mengingatkan tenggat", d: "Tetapkan tanggal dan pengingat datang lebih awal. Cloud biasa tidak bisa." },
        { t: "Tertata per orang dan kategori", d: "Dokumen disusun per anggota keluarga dan jenis, bukan ditumpuk di folder." },
        { t: "Berbagi aman per dokumen", d: "Tautan sementara ke satu berkas yang bisa Anda cabut." },
        { t: "Berfungsi offline", d: "Buka dokumen yang Anda butuhkan tanpa internet — saat bepergian atau roaming." },
      ],
    },
    operator: {
      heading: "Siapa di balik layanan",
      line: "Operator: pemilik layanan doki.help, NPWP 780728592634.",
      contactLabel: "Dukungan:",
    },
    footer: { copyright: "© 2026 doki.help — Brankas dokumen keluarga", pricing: "Harga", security: "Keamanan", privacy: "Privasi", login: "Masuk" },
  },
  uz: {
    nav: { login: "Kirish", start: "Bepul boshlash", startShort: "Boshlash" },
    hero: {
      kicker: "Hujjatlar paketi — real harakatlar uchun",
      titlePre: "Darhol ishlatsa boʻladigan",
      titleAccent: "hujjatlar",
      subtitle:
        "Rezyume, ID, sertifikatlar, maʼlumotnomalar, portfolio va oila hujjatlarini bitta joyga yigʻing. Vakansiyalarga ariza bering, kerakli hujjatlar bilan yollang yoki tanlangan paketni xavfsiz havola orqali yuboring.",
      cta1: "Birinchi paketni yigʻish",
      cta2: "Demoni koʻrish",
      trust: ["2 GB bepul", "Kirishni bekor qilish mumkin", "Hujjatlar sizning ruxsatingizsiz AIga yuborilmaydi"],
      roles: [
        { emoji: "🙋", label: "Ish izlayapman → rezyume", href: "/login?next=/my/resume" },
        { emoji: "💼", label: "Yollayapman → vakansiya", href: "/login?next=/employer/vacancies/new" },
        { emoji: "🎨", label: "Frilanser → portfolio", href: "/login?next=/my/freelance" },
      ],
      pkg: {
        title: "Ariza paketi",
        vacancy: "Vakansiya: Barista · Changu",
        needTitle: "Ish beruvchi soʻraydi:",
        need: ["CV", "ID / pasport", "Sertifikat", "60 soniyalik video-javob"],
        readyTitle: "Paketingiz tayyor:",
        ready: ["Rezyume tayyor", "ID tanlandi", "Sertifikat tanlandi", "WhatsApp qoʻshildi"],
        send: "Ariza yuborish",
        badge: "Butun arxiv emas — faqat siz tanlagan hujjatlar.",
        chip: "🔗 Havola muddatli · kirishni bekor qilish mumkin",
      },
    },
    scenarios: {
      heading: "Hujjatlarni kerak boʻlgan joyda ishlating",
      items: [
        { emoji: "🙋", title: "Tayyor paket bilan ariza bering", text: "CV, ID, sertifikatlar, portfolio, javoblar va video — ish beruvchiga bir bosishda.", cta: "Rezyume yaratish", href: "/login?next=/my/resume" },
        { emoji: "💼", title: "Arizalarni hujjatlari bilan oling", text: "Vakansiya yarating, kerakli hujjat va savollarni tanlang — nomzodlar bitta joyga keladi.", cta: "Vakansiya joylash", href: "/login?next=/employer/vacancies/new" },
        { emoji: "🎨", title: "Ishlaringizni bitta havola bilan koʻrsating", text: "Portfolio yigʻing, kontakt qoʻshing — mijoz kirishsiz ochadi.", cta: "Portfolio yaratish", href: "/login?next=/my/freelance" },
        { emoji: "👪", title: "Muhim narsalar qoʻl ostida boʻlsin", text: "Pasportlar, sugʻurtalar, maʼlumotnomalar, bola hujjatlari va muddatlar — bitta joyda.", cta: "Hujjat yuklash", href: "/login" },
      ],
    },
    employer: {
      heading: "Kimni yollashni bilmayapsizmi? Vazifadan boshlang.",
      text: "Nima kerakligini yozing: «kafega smenaga odam», «WhatsAppga javob beradigan», «operatsion ishlarga assistent». doki.help rol, vazifalar, hujjatlar va nomzodga savollarni taklif qiladi.",
      cardTitle: "Vakansiya: Barista",
      doLabel: "Nima qiladi:",
      doItems: ["kofe tayyorlash", "mehmonlarga xizmat", "kassa bilan ishlash"],
      askLabel: "Nomzoddan nima soʻraladi:",
      askItems: ["CV", "ID / pasport", "sertifikat", "60 soniyalik video-javob"],
      qLabel: "Savollar:",
      qItems: ["Qachon chiqa olasiz?", "Kofe mashinasida tajriba?"],
      cta: "Vakansiya yaratish",
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
        { icon: "💼", title: "Ish va karyera", items: ["CV va rezyume", "Diplomlar va sertifikatlar", "Portfolio", "Tavsiya xatlari", "Mehnat shartnomalari"] },
        { icon: "📄", title: "Shaxsiy va migratsiya hujjatlari", items: ["Pasportlar va xalqaro pasportlar", "Vizalar va viza hujjatlari", "Fuqarolik hujjatlari", "Soliq va ijtimoiy sugʻurta raqamlari", "Diplomlar va sertifikatlar"] },
        { icon: "✈️", title: "Sayohatlar va sayyohlik", items: ["Tur paketlari va voucherlar", "Chiptalar va bronlar", "Sayohat sugʻurtasi", "Kirish/chiqish hujjatlari", "Bolaning sayohatiga ruxsatnomalar"] },
        { icon: "🚗", title: "Transport va mulk", items: ["Avtomobil sugʻurtasi", "Transport guvohnomalari va roʻyxati", "Mulk hujjatlari va shartnomalar"] },
        { icon: "🧾", title: "Kvitansiyalar va maʼlumotnomalar", items: ["Toʻlov kvitansiyalari", "Ish / oʻqish maʼlumotnomalari", "Ishonchnomalar"] },
      ],
    },
    pain: {
      heading: "Hujjatlar «qachondir» emas — shoshilinch kerak boʻladi.",
      items: [
        { t: "Ishga ariza", d: "Vakansiya ochiq, CV, ID va sertifikat esa turli chatlarda yotibdi." },
        { t: "Xodim yollash", d: "Nomzodlar hujjatlarni WhatsAppda boʻlak-boʻlak yuboradi — keyin kimdir ularni qahramonlarcha qidiradi." },
        { t: "Oila va sayohat", d: "Aeroportda sugʻurta, maktabda maʼlumotnoma kerak, pasport muddati tugayapti." },
        { t: "Frilans va mijozlar", d: "Mijoz portfolio va tasdiqlarni soʻraydi — siz yana havolalarni qoʻlda yigʻasiz." },
      ],
    },
    how: {
      heading: "Hujjatlarni bir marta yigʻing. Keyin faqat keragini yuboring.",
      sub: "Asosiy tamoyil: butun seyf emas, siz tanlagan paket yuboriladi.",
      steps: [
        { n: "1", title: "Hujjatlarni yuklang", text: "Rezyume, pasport, ID, diplomlar, sertifikatlar, tibbiy hujjatlar, portfolio, sugʻurtalar." },
        { n: "2", title: "Odam va vazifalar boʻyicha joylang", text: "Oʻzingiz, oila, bola, nomzod, xodim yoki frilans-profil uchun." },
        { n: "3", title: "Paket yigʻing", text: "Faqat kerakli hujjatlar: ariza, ish beruvchi, maktab, shifokor yoki sayohat uchun." },
        { n: "4", title: "Xavfsiz havola yuboring", text: "Havola cheklangan muddat ishlaydi. Kirishni istalgan payt bekor qilish mumkin." },
      ],
      aiNote: "🤖 AI hujjat suratidagi amal qilish muddatini topa oladi — viza, sugʻurta, pasport. \"Aniqlash\" tugmasini bosing — sana avtomatik kiritiladi, eslatma oldindan keladi. Ixtiyoriy — sizning ruxsatingizsiz hech narsa yuborilmaydi.",
    },
    security: {
      heading: "Butun seyf emas — faqat tanlangan hujjatlar yuboriladi",
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
      heading: "Hujjatlarni bir marta yigʻing. Kerak boʻlganda har safar ishlating.",
      sub: "Ish, yollash, oila, sayohat va hujjatlarni xavfsiz yuborish uchun.",
      button: "Birinchi paketni yigʻish — bepul",
    },
    faq: {
      heading: "Tez-tez beriladigan savollar",
      items: [
        { q: "Bu bepulmi?", a: "Ha. Hozir bepul: 2 GB joy, muddat eslatmalari, oila uchun ulashish va oflayn ishlash. Keyinroq koʻproq joy bilan pullik tarif paydo boʻladi — hozir mavjud imkoniyatlar saqlanadi." },
        { q: "Hujjatlarimni kim koʻradi?", a: "Faqat siz va siz ruxsat bergan oila aʼzolari. Kirish maʼlumotlar bazasi darajasida ajratilgan (RLS), fayllar shaxsiy xotirada saqlanadi." },
        { q: "Eslatmalar qanday ishlaydi?", a: "Hujjat muddatini oʻzingiz kiriting — yoki \"Aniqlash\" tugmasini bosing, AI suratdan sanani topadi (pasport, sugʻurta, viza). Xizmat oldindan emailga eslatma yuboradi." },
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
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://doki.help";
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
              <Link href="/login" className="hidden rounded-3xl border border-[#d4c9b8] px-5 py-2.5 text-sm font-medium transition-colors hover:bg-white md:block">
                {t.nav.login}
              </Link>
              <Link href="/login" className="accent-btn shrink-0 rounded-3xl px-4 py-2.5 text-sm font-semibold sm:px-6">
                <span className="sm:hidden">{t.nav.startShort}</span>
                <span className="hidden sm:inline">{t.nav.start}</span>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* HERO — кинематографичная тёмная сцена, герой — «пакет документов» */}
      <section className="mx-auto max-w-screen-xl px-3 pt-4 sm:px-5 sm:pt-6">
        <div className="hero-stage rounded-[2rem] px-5 py-10 text-[#f9f5f0] sm:px-10 sm:py-14 lg:px-14">
          {/* Кинематографичный фон: видео (постер как fallback), затемнение
              слева под текст. При prefers-reduced-motion видео скрывается. */}
          <div className="absolute inset-0 overflow-hidden rounded-[2rem]" aria-hidden="true">
            <video
              className="h-full w-full object-cover opacity-40 motion-reduce:hidden"
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              poster={MEDIA.heroPoster}
              src={MEDIA.heroVideo}
            />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={MEDIA.heroPoster}
              alt=""
              className="hidden h-full w-full object-cover opacity-40 motion-reduce:block"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#241b16]/95 via-[#241b16]/70 to-[#241b16]/25" />
            <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#241b16]/80 to-transparent" />
          </div>
          <div className="relative z-10 grid items-center gap-x-12 gap-y-12 lg:grid-cols-12">
            <div className="lg:col-span-6">
              <div className="hero-rise hero-rise-1 mb-6 inline-flex items-center gap-x-2.5 rounded-full border border-white/15 bg-white/[0.06] px-4 py-1.5 text-sm backdrop-blur">
                <span className="hero-kicker-dot h-2 w-2 rounded-full bg-[#e8935f]" />
                <span className="font-medium text-[#e9ddcd]">{t.hero.kicker}</span>
              </div>

              <h1 className="hero-rise hero-rise-2 heading-font mb-5 text-[2.5rem] leading-[1.04] tracking-[-1.4px] sm:text-[3.1rem] lg:text-[3.6rem]">
                {t.hero.titlePre}
                <br />
                <span className="hero-accent">{t.hero.titleAccent}</span>
              </h1>

              <p className="hero-rise hero-rise-3 mb-8 max-w-lg text-[17px] leading-relaxed text-[#cfc2b1] sm:text-[18px]">
                {t.hero.subtitle}
              </p>

              <div className="hero-rise hero-rise-4 mb-6 flex max-w-lg flex-col gap-3 sm:flex-row">
                <Link href="/login" className="hero-cta flex flex-1 items-center justify-center rounded-2xl px-8 py-[16px] text-[17px] font-semibold text-white active:scale-[0.985]">
                  {t.hero.cta1}
                </Link>
                <Link href="/demo" className="flex flex-1 items-center justify-center rounded-2xl border border-white/20 px-8 py-[16px] text-[17px] font-semibold text-[#f1e7d8] transition-colors hover:bg-white/[0.07]">
                  {t.hero.cta2}
                </Link>
              </div>

              <div className="hero-rise hero-rise-5">
                <div className="mb-5 flex flex-wrap gap-2">
                  {t.hero.roles.map((r) => (
                    <Link
                      key={r.href}
                      href={r.href}
                      className="inline-flex items-center gap-1.5 rounded-full border border-white/12 bg-white/[0.05] px-3.5 py-1.5 text-[13px] font-medium text-[#dfd3c1] transition-colors hover:border-[#e8935f]/60 hover:text-white"
                    >
                      <span>{r.emoji}</span> {r.label}
                    </Link>
                  ))}
                </div>
                <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-[13px] text-[#a8977f]">
                  {t.hero.trust.map((tr) => (
                    <span key={tr} className="flex items-center gap-x-1.5">
                      <span className="text-[#e8935f]">✓</span> {tr}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Живая карточка пакета — вместо статичной картинки */}
            <div className="lg:col-span-6">
              <div className="relative mx-auto max-w-md">
                <div className="pkg-card-back absolute -right-3 -top-5 hidden rounded-2xl border border-white/12 bg-white/[0.07] px-4 py-2.5 text-[12px] font-medium text-[#e9ddcd] backdrop-blur sm:block">
                  {t.hero.pkg.chip}
                </div>
                <div className="pkg-card relative rounded-3xl p-6 text-[#2c2522] sm:p-7">
                  <div className="mb-1 flex items-center justify-between gap-3">
                    <div className="text-lg font-semibold">📦 {t.hero.pkg.title}</div>
                  </div>
                  <p className="mb-4 text-sm text-[#8a7c6d]">{t.hero.pkg.vacancy}</p>

                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#8a7c6d]">{t.hero.pkg.needTitle}</p>
                  <ul className="mb-4 space-y-1 text-[15px] text-[#5c5248]">
                    {t.hero.pkg.need.map((n) => (
                      <li key={n} className="flex items-center gap-2">
                        <span className="text-[#b85c38]">✓</span> {n}
                      </li>
                    ))}
                  </ul>

                  <div className="mb-4 h-px bg-[#e8e0d5]" />

                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#8a7c6d]">{t.hero.pkg.readyTitle}</p>
                  <ul className="mb-5 space-y-1.5 text-[15px] font-medium">
                    {t.hero.pkg.ready.map((r, i) => (
                      <li key={r} className={`pkg-check pkg-check-${i + 1} flex items-center gap-2`}>
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-[11px] text-emerald-700">✓</span>
                        {r}
                      </li>
                    ))}
                  </ul>

                  <Link href="/login" className="accent-btn block w-full rounded-2xl py-3 text-center text-[15px] font-semibold text-white">
                    {t.hero.pkg.send}
                  </Link>
                </div>
                <p className="mt-4 text-center text-[13px] text-[#a8977f]">{t.hero.pkg.badge}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PAIN */}
      <section className="mx-auto max-w-screen-xl px-4 pb-8 pt-8 sm:px-5">
        <h2 className="section-header mb-6">{t.pain.heading}</h2>
        <div className="mb-6 grid gap-4 sm:grid-cols-2">
          {t.pain.items.map((it) => (
            <div key={it.t} className="warm-card rounded-3xl border border-[#e8e0d5] p-6">
              <div className="mb-1.5 text-lg font-semibold">{it.t}</div>
              <p className="text-[#5c5248]">{it.d}</p>
            </div>
          ))}
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={MEDIA.chaos}
          alt={MEDIA_ALT[locale].chaos}
          loading="lazy"
          width={1376}
          height={768}
          className="h-auto w-full rounded-3xl border border-[#e8e0d5] object-cover shadow-xl"
        />
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
            {segmentLinks(locale).map((s) => (
              <Link
                key={s.key}
                href={`/for/${s.key}`}
                className="inline-flex items-center gap-1.5 rounded-2xl border border-[#e8e0d5] bg-white px-3.5 py-1.5 text-sm text-[#5c5248] transition-colors hover:border-[#d4a373]"
              >
                <span>{s.emoji}</span> {s.label}
              </Link>
            ))}
          </div>
          <div className="mt-5 border-t border-[#e8e0d5] pt-5">
            <div className="mb-3 text-sm font-medium text-[#8a7c6d]">{comparisonsHeading(locale)}</div>
            <div className="flex flex-wrap gap-2">
              {comparisonLinks(locale).map((cmp) => (
                <Link
                  key={cmp.key}
                  href={`/vs/${cmp.key}`}
                  className="inline-flex items-center gap-1.5 rounded-2xl border border-[#e8e0d5] bg-white px-3.5 py-1.5 text-sm text-[#5c5248] transition-colors hover:border-[#d4a373]"
                >
                  <span>{cmp.emoji}</span> {cmp.label}
                </Link>
              ))}
            </div>
          </div>
          <div className="mt-5 border-t border-[#e8e0d5] pt-5">
            <div className="mb-3 text-sm font-medium text-[#8a7c6d]">{MORE_HEADINGS[locale].tools}</div>
            <div className="flex flex-wrap gap-2">
              {landingLinks(locale).map((l) => (
                <Link
                  key={l.key}
                  href={`/${l.key}`}
                  className="inline-flex items-center gap-1.5 rounded-2xl border border-[#e8e0d5] bg-white px-3.5 py-1.5 text-sm text-[#5c5248] transition-colors hover:border-[#d4a373]"
                >
                  <span>{l.emoji}</span> {l.label}
                </Link>
              ))}
            </div>
          </div>
          <div className="mt-5 border-t border-[#e8e0d5] pt-5">
            <div className="mb-3 text-sm font-medium text-[#8a7c6d]">{MORE_HEADINGS[locale].checklists}</div>
            <div className="flex flex-wrap gap-2">
              {checklistLinks(locale).map((l) => (
                <Link
                  key={l.key}
                  href={`/checklists/${l.key}`}
                  className="inline-flex items-center gap-1.5 rounded-2xl border border-[#e8e0d5] bg-white px-3.5 py-1.5 text-sm text-[#5c5248] transition-colors hover:border-[#d4a373]"
                >
                  <span>{l.emoji}</span> {l.label}
                </Link>
              ))}
            </div>
          </div>
          {locale === "ru" && (
            <div className="mt-5 border-t border-[#e8e0d5] pt-5">
              <div className="mb-3 text-sm font-medium text-[#8a7c6d]">По документам</div>
              <div className="flex flex-wrap gap-2">
                {usecaseLinks().map((uc) => (
                  <Link
                    key={uc.key}
                    href={`/keep/${uc.key}`}
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
        <div className="mx-auto grid max-w-5xl items-center gap-x-12 gap-y-10 lg:grid-cols-[1fr_auto]">
          <div>
            <div className="grid gap-x-8 gap-y-8 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
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
            <div className="mt-8 grid items-center gap-5 rounded-2xl border border-[#e8e0d5] bg-white p-5 sm:grid-cols-[1fr_auto]">
              <p className="text-[15px] leading-relaxed text-[#5c5248]">{t.how.aiNote}</p>
              {/* AI находит срок действия на фото — короткая сцена-петля */}
              <div className="relative mx-auto w-full max-w-[240px] overflow-hidden rounded-xl border border-[#e8e0d5] shadow-lg sm:w-56" aria-hidden="true">
                <video
                  className="h-auto w-full object-cover motion-reduce:hidden"
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  poster={MEDIA.aiScanPoster}
                  src={MEDIA.aiScanVideo}
                />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={MEDIA.aiScanPoster}
                  alt=""
                  loading="lazy"
                  className="hidden h-auto w-full object-cover motion-reduce:block"
                />
              </div>
            </div>
          </div>
          {/* Как приложение выглядит на телефоне — живой кадр продукта */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={MEDIA.phone}
            alt={MEDIA_ALT[locale].phone}
            loading="lazy"
            width={896}
            height={1200}
            className="mx-auto h-auto w-64 rounded-3xl border border-[#e8e0d5] object-cover shadow-2xl sm:w-72"
          />
        </div>
      </section>

      {/* SCENARIOS — используйте документы там, где они нужны */}
      <section className="mx-auto max-w-screen-xl px-5 py-12">
        <h2 className="section-header mb-6">{t.scenarios.heading}</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {t.scenarios.items.map((s) => (
            <div key={s.title} className="warm-card flex flex-col rounded-3xl border border-[#e8e0d5] p-7">
              <div className="mb-2 text-3xl">{s.emoji}</div>
              <div className="mb-1.5 text-xl font-semibold">{s.title}</div>
              <p className="mb-5 flex-1 text-[#5c5248]">{s.text}</p>
              <Link href={s.href} className="inline-flex w-fit items-center rounded-2xl border border-[#d4c9b8] px-5 py-2.5 text-sm font-semibold transition-colors hover:border-[#b85c38] hover:text-[#b85c38]">
                {s.cta} →
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* EMPLOYER — не знаете, кого нанять */}
      <section className="mx-auto max-w-screen-xl px-5 py-6">
        <div className="rounded-[2rem] bg-[#2c2522] px-6 py-10 text-[#f9f5f0] sm:px-10">
          <div className="grid items-center gap-x-12 gap-y-8 lg:grid-cols-2">
            <div>
              <h2 className="heading-font mb-4 text-3xl tracking-tight sm:text-4xl">{t.employer.heading}</h2>
              <p className="mb-6 max-w-lg leading-relaxed text-[#cfc2b1]">{t.employer.text}</p>
              <Link href="/login?next=/employer/vacancies/new" className="hero-cta inline-flex items-center rounded-2xl px-8 py-[15px] text-[16px] font-semibold text-white">
                {t.employer.cta}
              </Link>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={MEDIA.employer}
                alt={MEDIA_ALT[locale].employer}
                loading="lazy"
                width={1200}
                height={896}
                className="mt-8 hidden h-auto w-full max-w-md rounded-3xl border border-white/10 object-cover shadow-2xl lg:block"
              />
            </div>
            <div className="rounded-3xl bg-[#fdfaf5] p-6 text-[#2c2522] shadow-2xl sm:p-7">
              <div className="mb-4 text-lg font-semibold">{t.employer.cardTitle}</div>
              <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-[#8a7c6d]">{t.employer.doLabel}</p>
              <ul className="mb-4 space-y-1 text-[15px] text-[#5c5248]">
                {t.employer.doItems.map((d) => (
                  <li key={d} className="flex items-center gap-2"><span className="text-[#b85c38]">✓</span> {d}</li>
                ))}
              </ul>
              <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-[#8a7c6d]">{t.employer.askLabel}</p>
              <ul className="mb-4 space-y-1 text-[15px] text-[#5c5248]">
                {t.employer.askItems.map((d) => (
                  <li key={d} className="flex items-center gap-2"><span className="text-[#b85c38]">✓</span> {d}</li>
                ))}
              </ul>
              <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-[#8a7c6d]">{t.employer.qLabel}</p>
              <ul className="space-y-1 text-[15px] text-[#5c5248]">
                {t.employer.qItems.map((d) => (
                  <li key={d} className="flex items-center gap-2"><span className="text-[#b85c38]">•</span> {d}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* SECURITY */}
      <section id="security" className="mx-auto max-w-screen-xl px-5 py-14">
        <div className="mx-auto mb-10 max-w-3xl text-center">
          <h2 className="section-header mb-3">{t.security.heading}</h2>
          <p className="text-xl text-[#5c5248]">{t.security.sub}</p>
          <p className="mx-auto mt-4 max-w-2xl text-[#5c5248]">{t.security.promise}</p>
        </div>
        {/* 5 карточек: на lg — 3+2 без «сироты», последняя строка по центру */}
        <div className="mx-auto grid max-w-5xl gap-5 sm:grid-cols-2 lg:grid-cols-6">
          {t.security.items.map((s, i) => {
            const accents = ["#b85c38", "#6b8f71", "#c99a2e", "#7d6b8f", "#4f7fa3"];
            const span =
              i < 3
                ? "lg:col-span-2"
                : i === 3
                  ? "lg:col-span-2 lg:col-start-2"
                  : "lg:col-span-2";
            return (
              <div
                key={s.title}
                className={`accent-card reveal-up reveal-d${i % 3} rounded-3xl border border-[#e8e0d5] p-7 ${span}`}
                style={{ "--accent": accents[i % accents.length] } as React.CSSProperties}
              >
                <div className="accent-chip mb-4" aria-hidden="true">{s.icon}</div>
                <div className="mb-2 text-xl font-bold leading-snug">{s.title}</div>
                <p className="text-[16px] leading-relaxed text-[#4a4038]">{s.text}</p>
              </div>
            );
          })}
        </div>
        <div className="mt-8 text-center">
          <Link
            href="/security"
            className="text-sm font-medium text-[#b85c38] hover:underline"
          >
            {t.footer.security} →
          </Link>
        </div>
      </section>

      {/* WHY BETTER THAN A REGULAR CLOUD — цветовое кодирование + reveal */}
      <section className="mx-auto max-w-screen-xl px-5 py-12">
        <div className="mb-8">
          <h2 className="section-header mb-2">{t.diff.heading}</h2>
          <p className="text-xl text-[#5c5248]">{t.diff.intro}</p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          {t.diff.items.map((d, i) => {
            const looks = [
              { accent: "#b85c38", emoji: "⏰" },
              { accent: "#6b8f71", emoji: "🗂️" },
              { accent: "#c99a2e", emoji: "🔗" },
              { accent: "#7d6b8f", emoji: "✈️" },
            ];
            const look = looks[i % looks.length];
            return (
              <div
                key={d.t}
                className={`accent-card reveal-up reveal-d${i % 4} rounded-3xl border border-[#e8e0d5] p-7`}
                style={{ "--accent": look.accent } as React.CSSProperties}
              >
                <div className="accent-chip mb-4" aria-hidden="true">{look.emoji}</div>
                <div className="mb-2 text-[22px] font-bold leading-snug" style={{ color: look.accent }}>
                  {d.t}
                </div>
                <p className="text-[17px] leading-relaxed text-[#4a4038]">{d.d}</p>
              </div>
            );
          })}
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
          <Link href="/login" className="inline-flex items-center justify-center rounded-3xl bg-[#b85c38] px-10 py-4 text-lg font-semibold transition-all hover:bg-[#9f4a2e] active:scale-[0.985]">
            {t.cta.button}
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-[#e8e0d5] bg-[#fdfaf5] px-5 py-8 text-sm text-[#8a7c6d]">
        <div className="mx-auto flex max-w-screen-xl flex-col items-center justify-between gap-y-3 text-center md:flex-row md:text-left">
          <div>{t.footer.copyright}</div>
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-1">
            <Link href="/pricing" className="hover:text-[#2c2522]">{t.footer.pricing}</Link>
            <Link href="/security" className="hover:text-[#2c2522]">{t.footer.security}</Link>
            {trustLinks(locale).map((tl) => (
              <Link key={tl.key} href={`/${tl.key}`} className="hover:text-[#2c2522]">{tl.label}</Link>
            ))}
            <Link href="/privacy" className="hover:text-[#2c2522]">{t.footer.privacy}</Link>
            <Link href="/login" className="hover:text-[#2c2522]">{t.footer.login}</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

# SEO-брифы для Doki.help — Deadline-Led Document SEO

> Это **только брифы**, не финальный текст страниц. Каждый бриф — техзадание
> копирайтеру/разработчику: что страница должна делать, под какой запрос, с
> какой структурой и какими ограничениями по правдивости.
>
> Стратегия: **Deadline-Led Document SEO** — не «облако для документов», а
> семейный сейф документов с напоминаниями о сроках, безопасным доступом и
> сценариями для жизни (travel / medical / expat / family).

---

## 0. Что правда про продукт сегодня (источник истины для всех брифов)

Брифы обязаны опираться только на реальные возможности. Перед написанием
текста сверяйтесь с этим списком; всё, чего здесь нет, помечено как «факт нужен
от бизнеса» и не пишется без подтверждения.

**Подтверждено в коде / docs / privacy / terms:**

- Продукт в статусе **beta** (terms). Это нужно честно отражать.
- Хранилище: **Supabase** — Postgres + Storage. Файлы в приватном bucket
  `vault-files`. Передача по HTTPS.
- Доступ изолирован на уровне базы (**RLS**): посторонние не видят документы.
- **2FA (TOTP)** на `/my/security`; письмо при входе с нового устройства.
- Безопасный шаринг: **истекающие, отзываемые ссылки** с лимитом просмотров,
  публичная страница `/s/[token]`, аудит каждого открытия.
- Семейный доступ: приглашения по ссылке + роли **owner / editor / viewer**.
- **Напоминания о сроках** (email), cron `/api/cron/reminders`.
- **AI-распознавание** документа при загрузке (категория/тип/номер/даты) через
  Anthropic. В terms прямо сказано: **AI-ответы не являются юридической,
  медицинской или иной профессиональной консультацией.**
- **Офлайн-доступ**: нужные документы можно сохранить на телефон (PWA, sw.js).
- Бесплатно сейчас: 2 ГБ, напоминания, семейный доступ, офлайн. Платный тариф —
  позже (то, что бесплатно сейчас, останется).
- Языки интерфейса: **ru / en / id / uz**.

**Важный технический разрыв со стратегией (передать в Codex-задачу, не в текст):**

- Локаль сейчас выбирается по **cookie / Accept-Language**, а НЕ через путь.
  Структуры `/en/ /ru/ /id/ /uz/` и `hreflang` пока **нет**. Все URL ниже даны в
  «чистом» виде (`/passport-expiry-reminder/`); при внедрении мультиязычности их
  нужно будет развести по локалям и связать `hreflang` + `x-default`.
- Новые разделы `/reminders/`, `/documents/`, `/checklists/` в коде пока
  отсутствуют — это новые маршруты. Существуют: `/for/*`, `/vs/*`, `/keep/*`.

**Глобальные «нельзя» (action на каждой странице):**

- Не обещать шифрование «end-to-end» / «zero-knowledge» — это не подтверждено.
  Говорить точно: приватный bucket, HTTPS, RLS, 2FA. (факт нужен от бизнеса:
  есть ли шифрование at-rest и какое.)
- Не давать юридических/медицинских/миграционных советов. Только организация,
  хранение, доступ, напоминания, шаринг.
- Не называть сроки/правила госорганов как факт без источника (например «паспорт
  нужно менять за 6 месяцев») — формулировать как «многие страны требуют…,
  проверьте требования вашей страны».
- Не заявлять «заменяет оригиналы» — наоборот, в trust-блоке честно: не заменяет
  оригиналы документов.
- Не приводить цифры (число пользователей, аптайм, сертификаты SOC2/ISO,
  «банковский уровень») без подтверждения.

**Общие внутренние ссылки (доступны на каждой странице):** `/` (главная),
`/security/`*, `/privacy`, `/terms`, ближайшие `/for/*`, релевантные `/vs/*`,
релевантные `/checklists/*`.
*`/security/` как отдельная публичная страница — новая, см. задачу для Codex.

**Schema по умолчанию для всех:** `BreadcrumbList` + (на лендингах продукта)
`SoftwareApplication`, на чеклистах/гайдах — `Article`. `FAQPage` — **только**
если FAQ реально виден на странице. `Organization` + `WebSite` — глобально в
layout, не дублировать на каждой странице.

---

# Приоритет 1 — money pages

## 1. /family-document-vault/

- **Цель страницы:** главный money-лендинг категории «family document vault»;
  забрать пользователя, который ищет специализированный сейф для семейных
  документов (а не очередное облако), и довести до регистрации + первого
  документа.
- **Целевая аудитория:** родители/взрослые, ведущие документы всей семьи
  (супруги, дети, иногда пожилые родители).
- **Поисковый интент:** commercial / решение — «куда сложить все важные семейные
  документы безопасно и с напоминаниями».
- **Primary keyword:** family document vault
- **Secondary keywords:** family document storage, secure family documents app,
  important family documents, store family documents online, digital family
  document organizer, household documents app
- **H1:** A secure family document vault for everything that matters
- **Title (≤60):** Family Document Vault — Secure & With Reminders
- **Meta description (≤155):** Keep your whole family's documents in one private
  vault: passports, medical, visas, insurance. Deadline reminders and secure
  sharing.
- **Структура H2/H3:**
  - H2: Where do your family's documents actually live right now? (боль: чаты,
    почта, галерея, бумажная папка)
  - H2: What a family document vault is (and isn't)
  - H2: What you can keep here → H3 IDs & migration · H3 Medical · H3 Travel ·
    H3 Property & car · H3 Education
  - H2: A profile for every family member
  - H2: Never miss an expiry date (напоминания)
  - H2: Share securely, revoke anytime (signed links)
  - H2: Your privacy and security
  - H2: FAQ
- **Главный CTA:** Create your family vault (→ регистрация)
- **Вторичный CTA:** See what you can store (anchor → раздел документов)
- **Trust block:** beta; RLS — только ваша семья видит документы; приватный
  bucket + HTTPS; 2FA; не продаём данные; не заменяет оригиналы.
- **Privacy/security block:** где хранятся данные (Supabase, приватный bucket),
  RLS, роли доступа owner/editor/viewer, как удалить данные → ссылка на
  `/privacy` и `/data-deletion/`.
- **FAQ (5):**
  1. Who can see our family documents? (только семья, RLS)
  2. Is it free? (да, 2 ГБ + напоминания + семейный доступ; платный тариф позже)
  3. How is this different from Google Drive? (типы документов, сроки, профили
    членов семьи, безопасная выдача доступа → ссылка на /vs/google-drive/)
  4. Can I add my spouse/kids? (роли, приглашение по ссылке)
  5. What happens to my data if I leave? (экспорт архива, удаление)
- **Внутренние ссылки:** /for/families, /document-expiry-reminder/,
  /secure-document-sharing/, /vs/google-drive/, /checklists/family-emergency-documents/
- **Schema:** SoftwareApplication + BreadcrumbList + FAQPage (FAQ виден)
- **Факты нужны от бизнеса:** лимит членов семьи; есть ли шифрование at-rest;
  точные лимиты бесплатного тарифа на текущий момент.
- **Нельзя без подтверждения:** «банковский уровень безопасности», «end-to-end»,
  любые сертификации, числа пользователей.

---

## 2. /document-expiry-reminder/

- **Цель страницы:** хаб-лендинг всего кластера напоминаний; ранжироваться по
  родовому запросу и раздавать вес дочерним страницам (passport/visa/insurance…).
- **Целевая аудитория:** все, кто хоть раз пропустил срок (паспорт, виза,
  страховка, права) и ищет систему, которая напомнит.
- **Поисковый интент:** commercial / tool — «инструмент, который напоминает о
  сроках документов».
- **Primary keyword:** document expiry reminder
- **Secondary keywords:** document expiration reminder app, expiry date reminder
  for documents, document renewal reminder, track document expiry dates, never
  miss a document deadline
- **H1:** Document expiry reminders for your whole family
- **Title (≤60):** Document Expiry Reminder App | Doki.help
- **Meta description (≤155):** Track expiry dates for passports, visas, insurance
  and more. Get reminders before renewal becomes urgent — for every family member.
- **Структура H2/H3:**
  - H2: Why expiry dates are so easy to miss
  - H2: Which documents have deadlines worth tracking → H3 список с ссылками на
    дочерние reminder-страницы
  - H2: How reminders work (укажи дату «действует до» → email заранее)
  - H2: One place for the whole family's deadlines
  - H2: Offline access before you travel
  - H2: Privacy and security
  - H2: FAQ
- **Главный CTA:** Add your first reminder
- **Вторичный CTA:** Browse reminders by document type (→ список дочерних)
- **Trust block:** beta; данные в приватном хранилище; RLS; не продаём данные.
- **Privacy/security block:** напоминания привязаны к вашему сейфу; email только
  для уведомлений; ссылка на /privacy.
- **FAQ (5):**
  1. How early will I be reminded? (факт нужен: за сколько дней, настраивается?)
  2. How do I set an expiry date? (поле «действует до» при загрузке)
  3. Where do reminders arrive? (email; факт: push/др. каналы?)
  4. Can I track deadlines for my kids too? (да, профили)
  5. Is it free? (да)
- **Внутренние ссылки:** /passport-expiry-reminder/, /visa-expiry-reminder/,
  /family-document-vault/, /checklists/travel-documents-checklist/
- **Schema:** SoftwareApplication + BreadcrumbList + FAQPage
- **Факты нужны от бизнеса:** за сколько дней до срока приходит напоминание;
  настраиваемые интервалы; каналы (email/push); можно ли несколько напоминаний.
- **Нельзя без подтверждения:** SMS/push-каналы, если их нет; «автоматически
  продлим за вас» (продукт не продлевает документы).

---

## 3. /passport-expiry-reminder/

- **Цель страницы:** топ-конвертер кластера; ловить «у паспорта заканчивается
  срок» — момент тревоги перед поездкой.
- **Целевая аудитория:** путешественники, семьи с детьми, экспаты.
- **Поисковый интент:** high-intent commercial — нужен напоминатель именно по
  паспорту.
- **Primary keyword:** passport expiry reminder
- **Secondary keywords:** passport renewal reminder, passport expiration tracker,
  track passport expiry date, family passport tracker, passport expiry alert
- **H1:** Passport expiry reminder for the whole family
- **Title (≤60):** Passport Expiry Reminder for the Whole Family
- **Meta description (≤155):** Store every family passport in one place and get a
  reminder before renewal becomes urgent. Offline access for your next trip.
- **Структура H2/H3:**
  - H2: Why passport expiry dates are easy to miss
  - H2: What to store with each passport (скан, номер, дата выдачи/окончания)
  - H2: When to set reminders (формулировать как «многие страны требуют ≥6 мес
    срока — проверьте требования назначения», не как факт)
  - H2: How Doki.help helps
  - H2: Family passport tracking (профиль на каждого)
  - H2: Offline access before a trip
  - H2: Secure sharing when needed
  - H2: FAQ
- **Главный CTA:** Add a passport reminder
- **Вторичный CTA:** Build your travel document vault (→ /travel-documents/)
- **Trust block:** приватный bucket, RLS, 2FA; не заменяет оригинал паспорта.
- **Privacy/security block:** паспорт — чувствительный документ; кто видит
  (только семья), как делиться по отзываемой ссылке.
- **FAQ (5):**
  1. How far in advance should I renew a passport? (общий ответ + «проверьте
    требования страны назначения», без жёстких чисел)
  2. Can I track passports for my children? (да)
  3. Will I get a reminder by email? (да; факт: за сколько дней)
  4. Can I access my passport scan offline? (да, PWA)
  5. Is storing a passport scan safe here? (приватный bucket, RLS, HTTPS)
- **Внутренние ссылки:** /document-expiry-reminder/, /visa-expiry-reminder/,
  /travel-documents/, /for/travel, /checklists/travel-documents-checklist/
- **Schema:** SoftwareApplication + BreadcrumbList + FAQPage
- **Факты нужны от бизнеса:** интервал напоминаний; можно ли хранить несколько
  паспортов (внутренний/загран) на человека.
- **Нельзя без подтверждения:** конкретные визовые/паспортные правила стран как
  факт; «продлим паспорт»; обещание, что скан паспорта примут как оригинал.

---

## 4. /visa-expiry-reminder/

- **Цель страницы:** ловить высокотревожный запрос про срок визы; сильно
  пересекается с expat-кластером.
- **Целевая аудитория:** экспаты, релоканты, частые путешественники, студенты за
  рубежом.
- **Поисковый интент:** high-intent commercial.
- **Primary keyword:** visa expiry reminder
- **Secondary keywords:** visa renewal reminder, visa expiration tracker, track
  visa expiry date, residence visa reminder, visa overstay reminder
- **H1:** Visa expiry reminder — never overstay by accident
- **Title (≤60):** Visa Expiry Reminder & Renewal Tracker | Doki.help
- **Meta description (≤155):** Track visa and residence permit expiry dates and
  get reminders before renewal is due. Keep visas for the whole family in one place.
- **Структура H2/H3:**
  - H2: Why visa deadlines are stressful to track
  - H2: What to store with each visa (виза, разрешение, подтверждения)
  - H2: Reminders before renewal is due
  - H2: Visas for the whole family in one place
  - H2: Offline access at the border
  - H2: Secure sharing with lawyers or employers (отзываемая ссылка)
  - H2: Privacy and security
  - H2: FAQ
- **Главный CTA:** Add a visa reminder
- **Вторичный CTA:** Organize all your expat documents (→ /expat-document-organizer/)
- **Trust block:** RLS, приватное хранилище; не заменяет оригиналы; **не даёт
  миграционных/юридических советов** (terms).
- **Privacy/security block:** документы видны только семье; шаринг по
  отзываемой ссылке с аудитом.
- **FAQ (5):**
  1. Does Doki.help give immigration advice? (нет — только хранение/напоминания;
    AI ≠ юр. консультация)
  2. Can I track residence permits too? (да → ссылка /residence-permit-reminder/
    когда появится)
  3. How early are reminders sent? (факт нужен)
  4. Can I share my visa securely with a lawyer? (отзываемая ссылка)
  5. Is it free? (да)
- **Внутренние ссылки:** /document-expiry-reminder/, /expat-document-organizer/,
  /passport-expiry-reminder/, /for/expats
- **Schema:** SoftwareApplication + BreadcrumbList + FAQPage
- **Факты нужны от бизнеса:** интервалы напоминаний; есть ли отдельное поле под
  residence permit.
- **Нельзя без подтверждения:** правила оверстея/визовые сроки конкретных стран;
  любые формулировки «поможем продлить визу».

---

## 5. /family-document-organizer/

- **Цель страницы:** второй money-лендинг под «organizer»-интент (поиск
  инструмента для наведения порядка), смежный с #1; меньше про «сейф», больше про
  «разложить по полочкам».
- **Целевая аудитория:** те, кто решил «надо наконец всё разобрать».
- **Поисковый интент:** commercial / how-to пограничный.
- **Primary keyword:** family document organizer
- **Secondary keywords:** organize family documents, family paperwork organizer
  app, how to organize family documents, digital document organizer for families,
  household paperwork organizer
- **H1:** A family document organizer that keeps itself in order
- **Title (≤60):** Family Document Organizer App | Doki.help
- **Meta description (≤155):** Organize your family's documents by member and
  category, with expiry reminders and secure sharing. Stop digging through chats.
- **Структура H2/H3:**
  - H2: The problem with "I'll sort it later"
  - H2: Organize by family member → by category
  - H2: Auto-fill with AI when you upload (категория/тип/даты)
  - H2: Find any document in seconds (поиск)
  - H2: Reminders keep it current
  - H2: Privacy and security
  - H2: FAQ
- **Главный CTA:** Start organizing for free
- **Вторичный CTA:** See the document categories (anchor)
- **Trust block:** beta; RLS; приватный bucket; не продаём данные.
- **Privacy/security block:** AI-распознавание обрабатывает загруженный файл —
  честно описать (ссылка /ai-processing/); кто видит документы.
- **FAQ (5):**
  1. How does auto-categorization work? (AI заполняет поля; можно поправить
    вручную)
  2. Does AI advice replace a professional? (нет — terms)
  3. Can I search across everything? (да, /my/search)
  4. Can the whole family use it? (роли)
  5. Is it free? (да)
- **Внутренние ссылки:** /family-document-vault/, /document-expiry-reminder/,
  /for/families, /checklists/family-emergency-documents/
- **Schema:** SoftwareApplication + BreadcrumbList + FAQPage
- **Факты нужны от бизнеса:** какие именно поля заполняет AI; точность/языки
  распознавания; что передаётся AI-провайдеру (для /ai-processing/).
- **Нельзя без подтверждения:** «100% точное распознавание»; «работает с любым
  языком/форматом».

---

## 6. /secure-document-sharing/

- **Цель страницы:** money-лендинг под запрос про безопасную передачу документа
  (врачу, в банк, юристу, родственнику) — прямая сильная сторона продукта.
- **Целевая аудитория:** все, кому надо передать документ, но не хочется слать
  его в открытом чате/почте.
- **Поисковый интент:** commercial / решение.
- **Primary keyword:** secure document sharing
- **Secondary keywords:** share documents securely, secure document link, send
  documents safely online, expiring document link, revocable share link, share
  sensitive documents
- **H1:** Share sensitive documents securely — and take access back
- **Title (≤60):** Secure Document Sharing with Expiring Links
- **Meta description (≤155):** Send documents with a private link that expires and
  can be revoked anytime. View limits and access logs included. No more open chats.
- **Структура H2/H3:**
  - H2: Why sending documents over chat/email is risky
  - H2: How secure sharing works → H3 expiring link · H3 view limit · H3 revoke
    anytime · H3 access log
  - H2: When you'd use it (врач, банк, юрист, школа, родственник)
  - H2: Share without giving full access (роли)
  - H2: Privacy and security
  - H2: FAQ
- **Главный CTA:** Create a secure link
- **Вторичный CTA:** Store your documents first (→ /family-document-vault/)
- **Trust block:** ссылки истекают и отзываются; лимит просмотров; аудит каждого
  открытия; RLS; HTTPS.
- **Privacy/security block:** что видит получатель по ссылке (только этот
  документ), как отозвать → ссылка /how-secure-sharing-works/.
- **FAQ (5):**
  1. Can I revoke a link after sending? (да, в любой момент)
  2. Does the recipient need an account? (нет — публичная /s/[token])
  3. Can I limit how many times it's opened? (да, лимит просмотров)
  4. Will I know if someone opened it? (аудит открытий)
  5. Do links expire automatically? (да)
- **Внутренние ссылки:** /family-document-vault/, /medical-document-organizer/
  (поделиться с врачом), /vs/whatsapp/, /vs/telegram/, /how-secure-sharing-works/
- **Schema:** SoftwareApplication + BreadcrumbList + FAQPage
- **Факты нужны от бизнеса:** настройки срока/лимита просмотров по умолчанию;
  виден ли получателю скачиваемый файл или только просмотр.
- **Нельзя без подтверждения:** «end-to-end шифрование ссылки»; «получатель не
  сможет сохранить файл» (если технически может).

---

## 7. /medical-document-organizer/

- **Цель страницы:** money-лендинг медицинского кластера; YMYL-чувствительная —
  строго про организацию/хранение/шаринг, без медсоветов.
- **Целевая аудитория:** семьи, родители, люди с хроническими состояниями,
  ухаживающие за близкими.
- **Поисковый интент:** commercial / решение.
- **Primary keyword:** medical document organizer
- **Secondary keywords:** organize medical records, family medical records app,
  store medical documents, lab results organizer, health document storage, keep
  medical records organized
- **H1:** Keep your family's medical documents organized in one place
- **Title (≤60):** Medical Document Organizer for Families
- **Meta description (≤155):** Store lab results, reports, vaccinations and
  insurance per family member. Share securely with a doctor and get renewal
  reminders.
- **Структура H2/H3:**
  - H2: When you need a medical document, you need it now
  - H2: What you can keep → H3 lab results · H3 imaging (УЗИ/МРТ/КТ) · H3 doctor
    reports · H3 vaccinations · H3 insurance
  - H2: A medical profile per family member
  - H2: Share securely with a doctor (отзываемая ссылка)
  - H2: Reminders for insurance and certificates
  - H2: Privacy and your medical data (особая категория данных)
  - H2: FAQ
- **Главный CTA:** Upload your first medical document
- **Вторичный CTA:** Share a record with your doctor (→ /secure-document-sharing/)
- **Trust block:** особая категория персональных данных (privacy); RLS; приватный
  bucket; HTTPS; не заменяет медкарту/оригиналы; **не даёт медицинских советов**.
- **Privacy/security block:** medical = special category; AI-обработка при
  загрузке (ссылка /ai-processing/); кто видит; как удалить.
- **FAQ (5):**
  1. Does Doki.help give medical advice? (нет — только организация/хранение)
  2. Who can see our medical records? (только семья, RLS)
  3. Can I share a result with a doctor without giving full access? (да,
    отзываемая ссылка на один документ)
  4. Can I keep records for each family member? (да)
  5. How is sensitive medical data protected? (приватный bucket, RLS, HTTPS, 2FA)
- **Внутренние ссылки:** /for/medical, /secure-document-sharing/,
  /document-expiry-reminder/, /family-document-vault/,
  /checklists/medical-documents-checklist/
- **Schema:** SoftwareApplication + BreadcrumbList + FAQPage
- **Факты нужны от бизнеса:** обрабатываются ли мед.документы тем же AI; что
  именно уходит провайдеру; есть ли регион хранения ЕС/др.; шифрование at-rest.
- **Нельзя без подтверждения:** «HIPAA/GDPR-compliant» без подтверждения;
  «медицинский» функционал интерпретации; любые health-выводы.

---

## 8. /travel-documents/

- **Цель страницы:** расширить короткую существующую travel-тему (`/for/travel`)
  в полноценный кластерный хаб под «travel documents».
- **Целевая аудитория:** частые путешественники, семьи с детьми, digital nomads.
- **Поисковый интент:** informational→commercial (часть аудитории ищет «какие
  документы брать», часть — где хранить).
- **Primary keyword:** travel documents
- **Secondary keywords:** travel documents organizer, keep travel documents in one
  place, travel documents app, documents for international travel, offline travel
  documents, family travel documents
- **H1:** All your travel documents in one place — even offline
- **Title (≤60):** Travel Documents Organizer with Offline Access
- **Meta description (≤155):** Keep passports, visas, insurance and bookings for
  the whole family in one place. Access them offline and get expiry reminders.
- **Структура H2/H3:**
  - H2: Travel documents scattered across chats and email
  - H2: What to keep before a trip → H3 passports/visas · H3 insurance · H3
    bookings/tickets · H3 child travel consent
  - H2: Offline access when you have no signal
  - H2: Reminders so nothing expires mid-trip
  - H2: For families travelling with children
  - H2: Privacy and security
  - H2: FAQ
- **Главный CTA:** Build your travel vault
- **Вторичный CTA:** Get the travel documents checklist (→
  /checklists/travel-documents-checklist/)
- **Trust block:** офлайн-доступ; приватный bucket; RLS; не заменяет оригиналы.
- **Privacy/security block:** кто видит; шаринг по отзываемой ссылке.
- **FAQ (5):**
  1. Can I access documents without internet? (да, PWA — сохранить заранее)
  2. Can I keep documents for the whole family? (да)
  3. Will I be reminded before a passport/visa expires? (да → ссылки)
  4. Can I store child travel consent forms? (да)
  5. Is it free? (да)
- **Внутренние ссылки:** /for/travel, /passport-expiry-reminder/,
  /visa-expiry-reminder/, /checklists/travel-documents-checklist/,
  /checklists/child-documents-checklist/
- **Schema:** SoftwareApplication + BreadcrumbList + FAQPage (+ возможно Article,
  если контент гайдовый — выбрать один основной тип)
- **Факты нужны от бизнеса:** как именно работает офлайн (что кэшируется, лимиты).
- **Нельзя без подтверждения:** визовые требования стран; «работает офлайн на 100%
  всегда» — описывать механику честно (надо сохранить заранее).

---

## 9. /expat-document-organizer/

- **Цель страницы:** money-лендинг expat-кластера (один из самых перспективных);
  опирается на существующий `/for/expats`.
- **Целевая аудитория:** релоканты, экспаты, семьи, живущие за границей.
- **Поисковый интент:** commercial / решение.
- **Primary keyword:** expat document organizer
- **Secondary keywords:** documents for living abroad, organize expat documents,
  immigration documents organizer, residence permit organizer, documents for
  moving abroad, expat paperwork app
- **H1:** An expat document organizer for life abroad
- **Title (≤60):** Expat Document Organizer | Doki.help
- **Meta description (≤155):** Keep visas, residence permits, translations and
  family documents in one place. Renewal reminders and secure sharing for life
  abroad.
- **Структура H2/H3:**
  - H2: Life abroad means more documents, more deadlines
  - H2: What expats keep here → H3 visas & residence permits · H3 translations &
    apostilles · H3 insurance · H3 family documents
  - H2: Renewal reminders before deadlines hit
  - H2: Documents for the whole family abroad
  - H2: Share securely with lawyers and authorities
  - H2: Privacy and security
  - H2: FAQ
- **Главный CTA:** Build your expat document vault
- **Вторичный CTA:** Get the expat documents checklist (→
  /checklists/expat-documents-checklist/)
- **Trust block:** RLS; приватный bucket; **не юридическая/миграционная
  консультация**; не заменяет оригиналы.
- **Privacy/security block:** кто видит; отзываемые ссылки; удаление данных.
- **FAQ (5):**
  1. Does Doki.help help with immigration/legal advice? (нет — только
    хранение/напоминания)
  2. Can I track residence permit renewals? (да)
  3. Can I store translations and apostilles? (да)
  4. Can I share documents with a lawyer securely? (отзываемая ссылка)
  5. Is it free? (да)
- **Внутренние ссылки:** /for/expats, /visa-expiry-reminder/,
  /document-expiry-reminder/, /checklists/expat-documents-checklist/
- **Schema:** SoftwareApplication + BreadcrumbList + FAQPage
- **Факты нужны от бизнеса:** регион хранения данных (важно для экспатов/GDPR);
  интервалы напоминаний.
- **Нельзя без подтверждения:** миграционные правила конкретных стран; «поможем
  получить/продлить ВНЖ/визу».

---

## 10. /family-emergency-documents/

- **Цель страницы:** ловить высоко-намеренный запрос «какие документы нужны на
  случай ЧП и где их держать»; сильный лид-магнит (чеклист) + конверсия.
- **Целевая аудитория:** ответственные родители, ухаживающие за пожилыми,
  prepared-семьи.
- **Поисковый интент:** informational→commercial (нужен список + место хранения).
- **Primary keyword:** family emergency documents
- **Secondary keywords:** emergency document checklist, important documents in
  case of emergency, emergency document binder, family emergency document kit,
  what documents to keep for emergencies
- **H1:** Family emergency documents: what to keep and where
- **Title (≤60):** Family Emergency Documents Checklist & Vault
- **Meta description (≤155):** The documents every family should keep ready for an
  emergency — and a secure place to store them with offline access for each member.
- **Структура H2/H3:**
  - H2: Why an emergency is the worst time to go looking
  - H2: The family emergency document checklist → H3 IDs · H3 medical · H3
    insurance · H3 property/finance · H3 contacts
  - H2: Keep them ready and accessible (офлайн, на телефоне)
  - H2: Make sure the right family member can reach them (роли)
  - H2: Privacy and security
  - H2: FAQ
  - (этот лендинг — мост к чеклисту: H2 Get the printable/interactive checklist)
- **Главный CTA:** Create your family emergency folder
- **Вторичный CTA:** Open the full checklist (→
  /checklists/family-emergency-documents/)
- **Trust block:** приватный bucket; RLS; офлайн-доступ; не заменяет оригиналы.
- **Privacy/security block:** кто из семьи имеет доступ (роли), как настроить.
- **FAQ (5):**
  1. What documents should every family keep for emergencies? (краткий список +
    ссылка на чеклист)
  2. Can my spouse access them if I can't? (роли owner/editor/viewer)
  3. Can I open them without internet? (да, PWA)
  4. Is this a substitute for the originals? (нет)
  5. Is it free? (да)
- **Внутренние ссылки:** /family-document-vault/,
  /checklists/family-emergency-documents/, /medical-document-organizer/,
  /document-expiry-reminder/
- **Schema:** Article + BreadcrumbList + FAQPage (контент по сути гайд+чеклист)
- **Факты нужны от бизнеса:** есть ли «экстренный доступ»/делегирование на случай
  недоступности владельца (или это просто роли).
- **Нельзя без подтверждения:** «доступ при недоступности владельца», если такой
  механики (dead man's switch / emergency access) нет; финансовые/юр. советы.

---

# Приоритет 2 — compare pages

> Общий принцип для всех `/vs/*`: **не врать**. Честно признать сильные стороны
> конкурента, выиграть на специализации (типы документов, сроки, профили семьи,
> безопасная выдача доступа). Существующий каркас `/vs/[slug]` уже есть (paper,
> cloud, gallery, notary, gosuslugi) — новые делаем в том же шаблоне.
> Schema: BreadcrumbList + FAQPage. **Не** использовать сравнительную разметку,
> порочащую конкурента; никаких ложных утверждений о чужом продукте.

## 11. /vs/google-drive/

- **Цель страницы:** перехватить «Google Drive для документов» — самый объёмный
  сравнительный запрос; показать, где специализированный сейф сильнее облака.
- **Целевая аудитория:** те, кто сейчас держит сканы в Google Drive и чувствует
  бардак.
- **Поисковый интент:** commercial comparison.
- **Primary keyword:** doki.help vs google drive
- **Secondary keywords:** google drive for documents, store documents google
  drive alternative, document vault vs cloud storage, best place to store family
  documents
- **H1:** Doki.help vs Google Drive: where to keep important documents
- **Title (≤60):** Doki.help vs Google Drive for Documents
- **Meta description (≤155):** Google Drive is a great general cloud. For family
  documents you also need types, expiry reminders and revocable sharing. Here's the
  difference.
- **Структура H2/H3:**
  - H2: What Google Drive is great at (честно: общее облако, объём, экосистема)
  - H2: Where it falls short for documents (нет типов, сроков, профилей, выдачи
    доступа на один файл с отзывом)
  - H2: Side-by-side comparison (таблица)
  - H2: Who should use what
  - H2: How to move documents from Drive (без «экспорта» обещаний — ручной аплоад)
  - H2: FAQ
- **Главный CTA:** Move your important documents from cloud folders
- **Вторичный CTA:** See the family document vault (→ /family-document-vault/)
- **Trust block:** RLS; приватный bucket; отзываемые ссылки; не продаём данные.
- **Privacy/security block:** разница в модели доступа (папки/ссылки Drive vs
  отзываемые ссылки + аудит).
- **FAQ (5):**
  1. Is Doki.help a replacement for Google Drive? (нет — это сейф под документы, а
    не общее облако)
  2. Can I import from Google Drive? (факт нужен: есть ли импорт; иначе — ручная
    загрузка)
  3. Is Drive less secure? (не утверждать; разница в специализации/модели доступа)
  4. Does Doki.help remind me about expiry dates? (да — чего нет в Drive «из
    коробки»)
  5. Is it free? (да)
- **Внутренние ссылки:** /vs/cloud, /family-document-vault/,
  /secure-document-sharing/, /document-expiry-reminder/
- **Schema:** BreadcrumbList + FAQPage
- **Факты нужны от бизнеса:** есть ли импорт из Drive; объём бесплатного тарифа
  для честного сравнения.
- **Нельзя без подтверждения:** утверждения «Drive небезопасен/продаёт данные»;
  ложные feature-сравнения; цифры тарифов Google без проверки.

---

## 12. /vs/telegram/

- **Цель страницы:** перехватить привычку «храню документы в Saved Messages».
- **Целевая аудитория:** активные пользователи Telegram (особенно RU/CIS-аудитория).
- **Поисковый интент:** commercial comparison / habit-switch.
- **Primary keyword:** telegram saved messages vs document vault
- **Secondary keywords:** store documents in telegram, telegram saved messages for
  documents, is telegram safe for documents, organize documents telegram alternative
- **H1:** Telegram Saved Messages vs a real document vault
- **Title (≤60):** Telegram Saved Messages vs Document Vault
- **Meta description (≤155):** Saving a document to Telegram is fast — finding it a
  month later isn't. See why a structured vault beats Saved Messages for documents.
- **Структура H2/H3:**
  - H2: Why people use Saved Messages for documents (честно: быстро, всегда с собой)
  - H2: Where it breaks down (нет структуры/типов/сроков; теряется при смене
    аккаунта; всё в одной ленте)
  - H2: Side-by-side comparison
  - H2: How to move documents out of Telegram (ручная загрузка → категории)
  - H2: Privacy and security
  - H2: FAQ
- **Главный CTA:** Move your documents out of Telegram
- **Вторичный CTA:** See how secure sharing works (→ /secure-document-sharing/)
- **Trust block:** типы/категории/сроки; RLS; отзываемые ссылки.
- **Privacy/security block:** разница в модели (чат vs приватный сейф с ролями).
- **FAQ (5):**
  1. Is Telegram safe for documents? (не давать жёсткой оценки; объяснить риски
    структуры/потери доступа, без обвинений)
  2. Can I find a document quickly? (поиск + категории vs лента)
  3. Will I lose documents if I change phone/account? (риск для чата; в сейфе —
    привязка к аккаунту, экспорт)
  4. Does it remind me about deadlines? (да)
  5. Is it free? (да)
- **Внутренние ссылки:** /vs/gallery, /vs/whatsapp/, /secure-document-sharing/,
  /family-document-organizer/
- **Schema:** BreadcrumbList + FAQPage
- **Факты нужны от бизнеса:** —
- **Нельзя без подтверждения:** «Telegram сливает/продаёт ваши документы»;
  абсолютные заявления о безопасности Telegram.

---

## 13. /vs/whatsapp/

- **Цель страницы:** перехватить «храню/пересылаю документы в WhatsApp-чатах».
- **Целевая аудитория:** семьи, пересылающие документы друг другу в WhatsApp
  (сильно для ID/SEA/глобальной аудитории).
- **Поисковый интент:** commercial comparison / habit-switch.
- **Primary keyword:** whatsapp vs document vault
- **Secondary keywords:** store documents in whatsapp, is whatsapp safe for
  documents, send documents whatsapp alternative, family documents in whatsapp chat
- **H1:** WhatsApp chats vs a secure document vault
- **Title (≤60):** WhatsApp vs a Secure Document Vault
- **Meta description (≤155):** Family documents pile up in WhatsApp chats and get
  lost. A document vault keeps them sorted, dated and shareable — with revocable links.
- **Структура H2/H3:**
  - H2: How family documents end up in WhatsApp
  - H2: Why chats are a bad filing system (теряются в ленте, медиа чистится, нет
    сроков)
  - H2: Side-by-side comparison
  - H2: Sharing without leaving documents in a chat forever (отзываемая ссылка)
  - H2: Privacy and security
  - H2: FAQ
- **Главный CTA:** Move family documents out of chats
- **Вторичный CTA:** Build your family vault (→ /family-document-vault/)
- **Trust block:** категории/сроки; отзываемые ссылки vs «навсегда в чате»; RLS.
- **Privacy/security block:** разница в контроле доступа после отправки.
- **FAQ (5):**
  1. Is WhatsApp safe for documents? (нейтрально: чаты шифруются, но это не
    система хранения; риск потери/беспорядка — без обвинений)
  2. Can I revoke a document after sending? (в чате — нет; здесь — да)
  3. Will documents survive a phone change? (риск для чатов; здесь — аккаунт+экспорт)
  4. Does it remind me about expiry dates? (да)
  5. Is it free? (да)
- **Внутренние ссылки:** /vs/telegram/, /vs/gallery, /secure-document-sharing/,
  /family-document-vault/
- **Schema:** BreadcrumbList + FAQPage
- **Факты нужны от бизнеса:** —
- **Нельзя без подтверждения:** отрицание факта, что WhatsApp использует E2E-шифр
  (использует — не врать); «WhatsApp продаёт ваши документы».

---

# Приоритет 3 — checklist pages

> Общий принцип `/checklists/*`: это контент-лид-магниты. Формат: SEO-страница →
> интерактивный/печатный чеклист → sign-in → создание vault → первое напоминание.
> Schema: **Article** (+ FAQPage если FAQ виден; можно `ItemList` для пунктов
> чеклиста). Тон — практичный, без воды («10 советов» — не делаем). На каждой
> привязка к продукту: «сохраните эти документы и поставьте напоминания».

## 14. /checklists/travel-documents-checklist/

- **Цель страницы:** ранжироваться по «travel documents checklist», собирать
  ссылки/регистрации, кормить travel-кластер.
- **Целевая аудитория:** путешественники и семьи перед поездкой.
- **Поисковый интент:** informational (checklist) с конверсией в продукт.
- **Primary keyword:** travel documents checklist
- **Secondary keywords:** documents needed for international travel, what to pack
  documents, travel document list family, international trip document checklist,
  documents before a trip
- **H1:** Travel documents checklist for the whole family
- **Title (≤60):** Travel Documents Checklist (Family) | Doki.help
- **Meta description (≤155):** A practical travel documents checklist for families:
  passports, visas, insurance, bookings and consent forms — plus where to keep them.
- **Структура H2/H3:**
  - H2: Before you book → H3 passports & validity · H3 visas
  - H2: Before you fly → H3 insurance · H3 bookings/tickets · H3 child travel consent
  - H2: For families with children
  - H2: Keep the checklist with you offline
  - H2: Set reminders so nothing expires mid-trip
  - H2: FAQ
- **Главный CTA:** Save these documents in your vault
- **Вторичный CTA:** Set passport & visa reminders (→ reminder pages)
- **Trust block:** офлайн-доступ; приватный bucket; не заменяет оригиналы.
- **Privacy/security block:** кратко — где хранятся, кто видит; ссылка /privacy.
- **FAQ (5):**
  1. What documents do I need for international travel? (краткий список +
    «проверьте требования страны»)
  2. How long should my passport be valid? (общий ответ, без жёстких чисел стран)
  3. What documents do children need to travel? (→ child checklist)
  4. Can I access the checklist offline? (да)
  5. How do I avoid documents expiring during a trip? (напоминания)
- **Внутренние ссылки:** /travel-documents/, /passport-expiry-reminder/,
  /visa-expiry-reminder/, /checklists/child-documents-checklist/, /for/travel
- **Schema:** Article + BreadcrumbList + FAQPage (+ опц. ItemList)
- **Факты нужны от бизнеса:** —
- **Нельзя без подтверждения:** конкретные визовые/паспортные требования стран как
  факт; «этого списка достаточно для любой страны».

---

## 15. /checklists/child-documents-checklist/

- **Цель страницы:** ранжироваться по «child documents checklist», ловить
  родителей; кормить family/travel кластеры.
- **Целевая аудитория:** родители (хранение документов детей; поездки с детьми;
  школа).
- **Поисковый интент:** informational (checklist) с конверсией.
- **Primary keyword:** child documents checklist
- **Secondary keywords:** documents for children to keep, kids important documents
  list, documents for travelling with children, child travel consent documents,
  school enrollment documents
- **H1:** Child documents checklist: what every parent should keep
- **Title (≤60):** Child Documents Checklist for Parents
- **Meta description (≤155):** A checklist of the documents to keep for each child:
  birth certificate, passport, medical, school — plus consent forms for travel.
- **Структура H2/H3:**
  - H2: Core documents for every child → H3 birth certificate · H3 passport/ID ·
    H3 medical & vaccinations
  - H2: For school → H3 enrollment documents
  - H2: For travel → H3 child travel consent
  - H2: Keep one profile per child
  - H2: Reminders for passports and certificates
  - H2: FAQ
- **Главный CTA:** Create a profile for each child
- **Вторичный CTA:** Get the travel checklist (→ /checklists/travel-documents-checklist/)
- **Trust block:** RLS — только семья видит документы детей; приватный bucket; не
  заменяет оригиналы.
- **Privacy/security block:** данные детей — повышенная чувствительность; кто
  имеет доступ (роли); удаление; ссылка /privacy.
- **FAQ (5):**
  1. What documents should I keep for my child? (список + ссылка)
  2. What do children need to travel internationally? (паспорт/виза/согласие —
    «проверьте требования страны»)
  3. What documents are needed for school enrollment? (общий список; «зависит от
    школы/страны»)
  4. Who can see my child's documents? (только семья, RLS)
  5. Can I get reminders before a child's passport expires? (да)
- **Внутренние ссылки:** /family-document-vault/,
  /checklists/travel-documents-checklist/, /passport-expiry-reminder/,
  /for/families, /for/travel
- **Schema:** Article + BreadcrumbList + FAQPage (+ опц. ItemList)
- **Факты нужны от бизнеса:** —
- **Нельзя без подтверждения:** конкретные требования по согласию на выезд/школе
  для стран как факт; юридические формулировки про опеку/согласие.

---

## Сводка приоритетов внедрения

| # | URL | Тип | Schema | Primary keyword |
|---|-----|-----|--------|-----------------|
| 1 | /family-document-vault/ | money | SoftwareApplication | family document vault |
| 2 | /document-expiry-reminder/ | money/hub | SoftwareApplication | document expiry reminder |
| 3 | /passport-expiry-reminder/ | money | SoftwareApplication | passport expiry reminder |
| 4 | /visa-expiry-reminder/ | money | SoftwareApplication | visa expiry reminder |
| 5 | /family-document-organizer/ | money | SoftwareApplication | family document organizer |
| 6 | /secure-document-sharing/ | money | SoftwareApplication | secure document sharing |
| 7 | /medical-document-organizer/ | money (YMYL) | SoftwareApplication | medical document organizer |
| 8 | /travel-documents/ | hub | SoftwareApplication | travel documents |
| 9 | /expat-document-organizer/ | money | SoftwareApplication | expat document organizer |
| 10 | /family-emergency-documents/ | money/guide | Article | family emergency documents |
| 11 | /vs/google-drive/ | compare | FAQPage | doki.help vs google drive |
| 12 | /vs/telegram/ | compare | FAQPage | telegram saved messages vs vault |
| 13 | /vs/whatsapp/ | compare | FAQPage | whatsapp vs document vault |
| 14 | /checklists/travel-documents-checklist/ | checklist | Article | travel documents checklist |
| 15 | /checklists/child-documents-checklist/ | checklist | Article | child documents checklist |

### Открытые вопросы к бизнесу (собрать до написания текста)

1. Интервалы напоминаний: за сколько дней, настраиваемые ли, какие каналы
   (email/push/SMS).
2. Шифрование at-rest: есть ли, какое (для честного security-блока).
3. Регион хранения данных (ЕС/др.) — важно для expat/medical/GDPR-сигналов.
4. Импорт из Google Drive / других облаков — есть ли.
5. Лимиты бесплатного тарифа на текущий момент (объём, число членов семьи).
6. Что именно AI-распознавание передаёт провайдеру и какие поля заполняет — для
   страницы /ai-processing/.
7. Есть ли «экстренный доступ»/делегирование (для /family-emergency-documents/).

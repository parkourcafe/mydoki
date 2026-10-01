# DOKI.help Indonesia — план посевов для HR и агентств (2026-09-28)

- **task_id:** T-DOKI-D4; названные площадки (§1a–§1c, §2, §5) — T-DOKI-05 (2026-10-01)
- **статус:** DONE_CODE (документ). **Ничего не отправлено и не опубликовано.**
  Это план. Публикует только владелец или локальный представитель после согласования.
  Тексты T1–T3 — READY_FOR_PLACEMENT, не PUBLISHED.
- **голос и правила:** `.claude/skills/doki-id-brand-voice/SKILL.md`: без скоринга и вердиктов,
  без гарантий, для SKCK/KITAS — «cek syarat resmi»; массовые WhatsApp-рассылки запрещены
  (`docs/gtm-dashboard.md` §2, `docs/launch-indonesia.md` ч. 5).

## 0. Что подтверждено и что нет

| Утверждение | Источник |
|---|---|
| Клин — рекрутинговые и стаффинговые агентства | `docs/gtm-dashboard.md` §2, `docs/launch-indonesia.md` ч. 5 |
| Обещание «Kirim satu ceklis — terima paket dokumen lengkap» | `docs/gtm-dashboard.md` §2, `lib/segments.ts` (`employers`, id `title`) |
| Кандидат загружает без аккаунта, у HR статус «lengkap / kurang», напоминания о сроках SKCK/KITAS | `docs/seo/indonesia-content-plan.md` §0, `lib/comparisons.ts` (`hr-whatsapp`) |
| Каналы при нулевом бюджете: тёплые контакты, представитель 1:1 в WA, офлайн-обход, коворкинги Бали, HR-сообщества FB/WA/TG, контент на бахаса (Reels, чек-листы как лид-магнит) | `docs/launch-indonesia.md:46`, `docs/gtm-dashboard.md:50-56` |
| «Вступить в 3–5 HR-сообществ с бесплатным чек-листом как лид-магнитом» — неделя 2 плана владельца | `docs/launch-indonesia.md:53`, `docs/gtm-dashboard.md:69` |
| Гейты до платных каналов (≥3 активных отправителя, completion ≥40 %, органические новые отправители, ≥1 отзыв) | `docs/gtm-dashboard.md` §4 |

**Не подтверждено (28.09):** в репозитории нет ни одного **названия** конкретной группы, чата,
коворкинга или страницы. Ниже площадки даны на уровне **канала** с источником.

**Обновление 01.10 (T-DOKI-05):** после разрешения владельца (28.09, ТЗ п.7) проведено исследование
по открытым источникам: только WebSearch; все попытки открыть страницы (11 доменов, по одной
попытке на домен) отклонены сетевой политикой сессии (EGRESS_BLOCKED). Поэтому **каждая строка
§1a — «по выдаче поиска, страница не открыта»**: название, тип и ссылка взяты из сниппетов
поисковой выдачи, а не из самой страницы. Правила размещения ни у одной площадки прочитать
не удалось → везде «неизвестно». Числа аудитории приведены только там, где их называет сам
источник в сниппете. Статус у всех: **кандидат — не связывались, согласия нет.**

## 1. Площадки (8, все из репозитория)

| # | Площадка (канал) | Источник | Формат | Ограничение |
|---|---|---|---|---|
| P1 | Тёплые контакты владельца → design-партнёры | `launch-indonesia.md:46`, `gtm-dashboard.md:52` | личное сообщение, текст T2 | только люди, которых владелец знает лично |
| P2 | Локальный представитель, 1:1 в WhatsApp | `launch-indonesia.md:46`, `gtm-dashboard.md:53` | текст T2, демо на звонке | 1:1, без рассылок и списков |
| P3 | Офлайн-обход агентств и работодателей (Бали) | `launch-indonesia.md:46`, `gtm-dashboard.md:53` | разговор + QR на T3 | — |
| P4 | Коворкинги Бали (доска объявлений, комьюнити-чат) | `launch-indonesia.md:46`, `gtm-dashboard.md:53` | T3 | только где правила места разрешают |
| P5 | HR-сообщества в Facebook | `launch-indonesia.md:46`, `gtm-dashboard.md:54` | пост T1 с чек-листом как пользой | правила группы; разрешение админа, если ссылки запрещены |
| P6 | HR-сообщества в WhatsApp (группы/сообщества) | там же | короткая версия T1 | только если сам участник; без холодных добавлений |
| P7 | HR-сообщества в Telegram | там же | T1 | правила чата |
| P8 | Контент на бахаса: Reels + чек-лист как лид-магнит | `launch-indonesia.md:46` | сценарий Reels на основе T1 (не в этом плане) | аккаунт бренда в соцсетях в репозитории не указан → BLOCKED_DECISION |

Интерпретация: P5–P7 — это одна задача из плана («3–5 HR-сообществ»), разбитая по платформам.
Больше 8 каналов не добавляю: джоб-борды Glints и KitaLulus упомянуты в
`docs/pricing-pilot-id.md:16` и `gtm-dashboard.md:91` только как ориентир цены, не как канал посева.

### 1a. Названные кандидаты для P4–P7 (исследование 2026-10-01, открытые источники)

Правила отбора (ТЗ п.7): только публичные деловые каналы — официальный сайт, официальная
страница, публичное сообщество с открытыми правилами, отраслевое мероприятие или медиа с разделом
для партнёров. Личные телефоны и email не собирались и в таблицу не внесены (в сниппетах выдачи они
встречались — намеренно опущены). Джоб-борды, биржи рекламы, закрытые платные клубы без правил
и сообщества кандидатов не брались (см. §1b). Дата проверки у всех строк — **2026-10-01**.
Пометка «ПВ» = «по выдаче поиска, страница не открыта». Все тексты — после вычитки BI (§6).

| # | Название | Тип | Канал | Публичная ссылка-источник | Язык | Правила размещения | Аудитория (только по источнику) | Текст | `utm_source` / `utm_medium` | Статус |
|---|---|---|---|---|---|---|---|---|---|---|
| C1 | Tropical Nomad Coworking Space (Canggu) | коворкинг с публичной страницей событий и еженедельными member-событиями | P4 | `https://www.tropicalnomad.org/events` (ПВ); также `tropicalnomad.id/about` | EN | неизвестно (сниппет: «Members BBQ, Skill Share, SpeakUp Monday» — формат событий, не правила доски) | источник числа не называет | T3 (карточка/QR); устно на Skill Share — только с разрешения | `tropicalnomad` / `coworking` | кандидат — не связывались, согласия нет |
| C2 | Outpost (Canggu, Berawa, Ubud-Penestanan) | сеть коворкинг/коливинг с еженедельными событиями (ланчи ср/пт, First Friday) | P4 | `https://destinationoutpost.co/cowork-in-ubud/` (ПВ) | EN | неизвестно | источник числа не называет; сниппет: day pass действует во всех трёх локациях | T3 | `outpost` / `coworking` | кандидат — не связывались, согласия нет |
| C3 | Bali Loop Coliving & Coworking (Denpasar, Sumerta Kelod) | коворкинг/коливинг; «collaborative community events» по сниппету агрегатора | P4 | `https://baliloop.com/bali-loop-denpasar/` (ПВ; описание событий — из сниппета `mindtrip.ai`, не с сайта) | EN | неизвестно | источник числа не называет | T3 | `baliloop` / `coworking` | кандидат — не связывались, согласия нет; **самое слабое подтверждение** в таблице |
| C4 | Young HRD Indonesia | публичное HR-сообщество: группа в Facebook + Telegram + LinkedIn + WhatsApp (по собственному блогу) | P5 (FB-группа); у сообщества есть и TG → P7 | `http://younghrd.blogspot.com/p/komunitas-hrd-surabaya.html` (ПВ) | BI | неизвестно (правила FB-группы без входа не видны) | сниппет блога: «ribuan» (тысячи) участников HRD — число не конкретизировано | T1 | `younghrd` / `community` | кандидат — не связывались, согласия нет |
| C5 | HRBP Indonesia (HR Indonesia Community) — Telegram `t.me/hrbpindo` | публичный Telegram-чат HR-практиков (ссылка опубликована в блоге сообщества, запись 2017 г.) | P7 | `http://hrbplearningforum.blogspot.com/2017/03/meningkatkan-kompetensi-melalui-grup-wa.html` (ПВ) | BI | неизвестно; активность чата в 2026 не проверена (запись-источник 2017 г.) | источник числа не называет | T1 (`utm_source=telegram` заменить на `hrbpindo`) | `hrbpindo` / `community` | кандидат — не связывались, согласия нет |
| C6 | HRD Forum (Diskusi HRD Forum) | старейшее HR-сообщество (с 2004) с каналами Telegram/Facebook/Instagram/YouTube и WA-группой «только для HR-практиков» через админа; одновременно коммерческий провайдер тренингов и консалтинга | P7 / P5 (публичные каналы); WA-группа — только P6 | `https://www.hrd-forum.com/ingin-terhubung-dengan-hrd-forum/` (ПВ); `https://hrd-forum.com/komunitas-hrd-terbesar-di-indonesia/` (ПВ) | BI | неизвестно; вход в WA-группу — через админа (личный номер в сниппете — не записан) | по собственному сайту в сниппете: «±24 000 участников» (другая страница — «>22 000»); цифра не проверена | T1 | `hrdforum` / `community` | кандидат — не связывались, согласия нет; владельцу проверить конфликт интересов (платные HR-услуги) |
| C7 | PMSM Indonesia (Perhimpunan Manajemen Sumberdaya Manusia) | профессиональная ассоциация HR (с 1978), членство индивидуальное и корпоративное | P5/P7 (ассоциация: вход только через официальные каналы, не постинг) | `https://pmsm.or.id/faq/` (ПВ) | BI | неизвестно; партнёрский/вендорский раздел в выдаче не найден | источник числа не называет | T2 (одному контактному лицу ассоциации — по официальному каналу сайта) | `pmsm` / `association` | кандидат — не связывались, согласия нет |
| C8 | HR & WorkTech Summit Indonesia 2026 (4th Annual), 19.11.2026, AYANA Midplaza Jakarta, организатор Escom Events | отраслевое HR-мероприятие с разделом для спонсоров/экспонентов и списком партнёров | P3-офлайн / медиа-событие (вне P4–P7, но по ТЗ «мероприятия 2026 с разделом для партнёров») | `https://indonesia2026.hrworkplaceshow.com/` (ПВ) | EN | неизвестно; партнёрство, вероятно, платное → до гейтов §4 только посещение, без спонсорства | по сниппету сайта: «300+ HR leaders, 30+ speakers»; не проверено | T3 (EN) + T2 при личной встрече | `hrworktech2026` / `event` | кандидат — не связывались, согласия нет |

**Резерв (найдено, в таблицу не вошло из-за лимита 8; те же правила, ПВ, 2026-10-01):**

| Название | Тип | Ссылка-источник | Почему в резерве |
|---|---|---|---|
| DuniaHR (`duniahr.com`) | HR-медиа и сообщество; раздел «Kontributor»; по сниппету — объявления участников размещает админ и «может отклонить при конфликте интересов» | `https://duniahr.com/category/kontributor/` | формат — статья-контрибуция, не пост в сообществе; отдельное решение владельца |
| HRPods (`hrpods.co.id`) | HR-медиа + сообщество (Джакарта, с 2020), страница About с контактом для сотрудничества | `https://hrpods.co.id/about-us` | то же: медиа-формат |
| ASPHRI (Asosiasi Praktisi Human Resource Indonesia) | ассоциация (с 2008); по сниппетам 900–1 100 практиков, 19 региональных отделений; членство — только действующие HR-практики | `https://asphri.or.id/about/` | дубль типа «ассоциация» к C7; владелец не может вступить как не-практик, только партнёрство |
| IndHRI (Indonesia Human Resource Institute) | некоммерческое сообщество HR-профессионалов (разработчики SKKNI) | `https://www.indhri.com/` | то же |
| Kinship Studio Bali (Berawa) | коворкинг «только для участников», креативная аудитория (керамика, фото) | `https://balipedia.com/listing/kinship-studio-bali/` | аудитория не HR/агентства; доступ только членам |
| HR Indonesia Community (страница Facebook) | страница (page), не группа | `https://www.facebook.com/p/HR-Indonesia-Community-100066548889822/` | у страницы нет правил размещения для посторонних; возможно, та же организация, что C5 — не подтверждено |

### 1b. Что искали и не взяли

- **Джоб-борды** (Glints, KitaLulus, Dealls, Indeed/Glassdoor-выдача): канал найма, не посев; цена — `docs/pricing-pilot-id.md`.
- **Telegram-каналы вакансий** («Lowongan Kerja Indonesia / LKI» от HRD Forum, `t.me/s/lowongankerjaindo`, подборки karir.ai): аудитория — соискатели, не HR.
- **Сообщества вендоров HR-софта и тренингов**: Mekari HR 101 Community (для пользователей Mekari Talenta), Proxsis HR Professional Community, Klub Human Capital — закрытые или вендорские площадки; правила для сторонних продуктов не видны, риск конфликта интересов.
- **Мероприятия 2026, которые уже прошли к 01.10:** 12th Indonesia HR Director Summit (11.02.2026), Transform Talent 2026 Indonesia (06.08.2026), IHCA 2026 (19.08.2026). People Matters TechHR Pulse Indonesia 2026 — дата в выдаче не видна, в таблицу не внесён.
- **Ассоциации работодателей Бали** — PHRI Bali (`phribali.or.id`, типы членства associate/allied/affiliate) и Bali Villa Association (`balivillaassociation.com`): это объединения отелей, ресторанов и вилл, а не HR-сообщества. Для посева по ТЗ не подходят, но это прямая аудитория `/for/hospitality` → отметка владельцу для офлайн-канала P3 (отдельное решение).
- **Dojo Bali (Canggu), Outpost Canggu, Kinship** — одна из подборок (`juliasdaysoff.com`) предупреждает, что часть этих мест могла закрыться; Outpost оставлен в таблице по собственному сайту сети, Dojo — нет.
- **Подборки «500+ ссылок на Telegram-группы»** (`alatekno.com` и т. п.) — агрегаторы без правил и без проверки, не источник.
- **WhatsApp-группы** — по определению публично непроверяемы; остаются P6 «только где владелец или представитель уже участник».
- **Facebook-группы без видимых правил** — правила FB-группы не видны без входа; поэтому у C4 «правила неизвестны», а другие FB-группы не добавлялись.

### 1c. Что владелец проверяет сам до любого контакта

Для каждой строки C1–C8 (5–10 минут на строку, вход в группы и посты — не в этом запуске):

1. **Существование и актуальность:** страница открывается; последняя активность (пост/событие) не старше ~3 месяцев. Особо: C5 (источник 2017 г.), C3 (только агрегаторы).
2. **Правила размещения:** закреплённое сообщение / раздел «Rules» / «Aturan grup»; разрешены ли ссылки и упоминание продуктов; нужно ли разрешение админа. Если запрещено — площадка выбывает или остаётся только для T2 админу.
3. **Не является ли площадка рекламной или вендорской:** не биржа объявлений, не группа «пасанг иклан», не сообщество одного конкурирующего продукта (C6 — есть платные услуги; проверить, допускают ли сторонние инструменты).
4. **Аудитория — HR и агентства, не соискатели:** по составу последних постов.
5. **Для C7–C8:** есть ли бесплатный формат (вступление, посещение, выступление участника); спонсорство до гейтов §4 (`docs/gtm-dashboard.md`) не оплачиваем.
6. После проверки — заполнить колонку «Правила размещения» и только потом переходить к очереди §5.

## 2. Посадочные страницы с UTM

Все маршруты реальные: реестры `lib/checklists.ts`, `lib/segments.ts`, `lib/comparisons.ts`,
`lib/landings.ts`; все URL с префиксом языка и совпадают со своим canonical (после
коммита 353e67c в этой ветке). Схема UTM: `utm_source` — площадка, `utm_medium` — формат,
`utm_campaign=id_hr_seed_2026q4`, `utm_content` — номер текста.

| Для | Landing URL |
|---|---|
| P5/P7 пост (польза: чек-лист) | `https://www.doki.help/id/checklists/candidate-documents-requested-checklist?utm_source=facebook&utm_medium=community&utm_campaign=id_hr_seed_2026q4&utm_content=t1` (для TG — `utm_source=telegram`) |
| P6 WA-сообщество | `https://www.doki.help/id/vs/hr-whatsapp?utm_source=whatsapp&utm_medium=community&utm_campaign=id_hr_seed_2026q4&utm_content=t1` |
| P1/P2 агентство, 1:1 | `https://www.doki.help/id/for/recruitment-agencies?utm_source=whatsapp&utm_medium=direct&utm_campaign=id_hr_seed_2026q4&utm_content=t2` |
| P3/P4 вилла, F&B (EN) | `https://www.doki.help/en/for/hospitality?utm_source=offline&utm_medium=qr&utm_campaign=id_hr_seed_2026q4&utm_content=t3` |
| P3/P4 вилла, F&B (BI) | `https://www.doki.help/id/checklists/villa-staff-documents-checklist?utm_source=offline&utm_medium=qr&utm_campaign=id_hr_seed_2026q4&utm_content=t3` |

**URL под названные площадки §1a (01.10).** Та же схема; `utm_source` — слуг площадки из §1a,
`utm_medium` — тип канала. Один QR/ссылка на площадку, чтобы переходы различались в PostHog.

| # | Площадка | URL |
|---|---|---|
| C1 | Tropical Nomad (EN-карточка) | `https://www.doki.help/en/for/hospitality?utm_source=tropicalnomad&utm_medium=coworking&utm_campaign=id_hr_seed_2026q4&utm_content=t3` |
| C2 | Outpost (EN-карточка) | `https://www.doki.help/en/for/hospitality?utm_source=outpost&utm_medium=coworking&utm_campaign=id_hr_seed_2026q4&utm_content=t3` |
| C3 | Bali Loop (BI-карточка, Denpasar) | `https://www.doki.help/id/checklists/villa-staff-documents-checklist?utm_source=baliloop&utm_medium=coworking&utm_campaign=id_hr_seed_2026q4&utm_content=t3` |
| C4 | Young HRD Indonesia (FB-пост) | `https://www.doki.help/id/checklists/candidate-documents-requested-checklist?utm_source=younghrd&utm_medium=community&utm_campaign=id_hr_seed_2026q4&utm_content=t1` |
| C5 | HRBP Indonesia (TG-пост) | `https://www.doki.help/id/checklists/candidate-documents-requested-checklist?utm_source=hrbpindo&utm_medium=community&utm_campaign=id_hr_seed_2026q4&utm_content=t1` |
| C6 | HRD Forum (пост в публичном канале) | `https://www.doki.help/id/checklists/candidate-documents-requested-checklist?utm_source=hrdforum&utm_medium=community&utm_campaign=id_hr_seed_2026q4&utm_content=t1` |
| C7 | PMSM (письмо T2 по официальному каналу) | `https://www.doki.help/id/for/recruitment-agencies?utm_source=pmsm&utm_medium=association&utm_campaign=id_hr_seed_2026q4&utm_content=t2` |
| C8 | HR & WorkTech Summit 2026 (EN-карточка на встрече) | `https://www.doki.help/en/for/recruitment-agencies?utm_source=hrworktech2026&utm_medium=event&utm_campaign=id_hr_seed_2026q4&utm_content=t3` |

Про измерение (интерпретация, не проверено): `lib/analytics.ts` инициализирует `posthog-js`
и шлёт `$pageview` вручную (`components/PostHogProvider.tsx`). Обычно posthog-js сам
сохраняет `utm_*` из URL в свойствах события. Работает это только при заданном
`NEXT_PUBLIC_POSTHOG_KEY` в продакшене, а его наличие из этой сессии проверить нельзя.

## 3. Три адаптированных текста

### T1 — пост в HR-сообществе (FB/TG; для WA короче). BI

> **Ceklis dokumen kandidat — gratis, silakan dipakai**
>
> Rekan HR, saat rekrutmen banyak posisi, dokumen kandidat sering datang sepotong-sepotong
> di WhatsApp: CV di satu chat, KTP di chat lain, SKCK menyusul. Saya rangkum ceklis dokumen
> yang biasanya diminta HR dari kandidat, lengkap dengan catatan kapan dokumen sensitif
> sebaiknya diminta.
>
> 👉 [link P5/P7]
>
> Ceklisnya bisa dipakai tanpa daftar. Kalau mau kirim ceklis ke kandidat dalam bentuk satu
> tautan, di halaman yang sama ada Doki: kandidat unggah tanpa akun, dan HR melihat status
> lengkap / kurang. Untuk SKCK dan KITAS, syarat bisa berubah, jadi selalu cek syarat resmi
> di Polri / imigrasi.
>
> Masukan dari tim HR di sini sangat membantu: dokumen apa yang paling sering kurang?

Почему так: польза (чек-лист) идёт первой, продукт — вторым; в конце вопрос к сообществу, чтобы
начался разговор, а не только клики. Без гарантий и без оценки кандидатов.

### T2 — личное сообщение, 1:1 (тёплый контакт или представитель). BI

> Halo [nama], saya lagi uji coba alat kecil untuk agensi rekrutmen: kirim satu tautan
> ceklis ke kandidat, lalu dokumen masuk lengkap dalam satu paket dan kelihatan siapa yang
> masih kurang. Kandidat tidak perlu bikin akun.
>
> Boleh saya tunjukkan 10 menit? Atau lihat dulu di sini: [link P1/P2]
>
> Masih tahap awal, jadi masukan dari agensi seperti [nama agensi] sangat berharga.

Почему так: одно сообщение одному знакомому человеку, без списков. Честно сказано «tahap
awal» — продукт в пилоте, разговоров о цене пока 0 (`gtm-dashboard.md`, «Ключевые цифры»).
О цене здесь ни слова: сценарий разговора о цене — `docs/pricing-pilot-id.md`.

### T3 — офлайн / коворкинг: карточка с QR. EN + BI

> **Hiring villa or F&B staff?**
> Send candidates one checklist link — get the full document package back.
> No account for candidates. See who's complete and who's missing what.
>
> **Rekrut staf vila atau F&B?**
> Kirim satu tautan ceklis — terima paket dokumen lengkap.
>
> [QR → link P3/P4]

Почему так: слоган взят из `lib/segments.ts` (`employers`, en/id `title`). Про сроки справок
на карточке ничего нет — без дисклеймера такое обещание не уместить.

## 4. Критерий результата (через 14 дней после первого посева)

Опираемся на гейты `docs/gtm-dashboard.md` §4, но считаем только вклад посевов:

- **Успех:** ≥ 3 разговора с агентствами или работодателями (P1–P4) **и** ≥ 1 новый отправитель —
  работодатель, который создал вакансию или чек-лист и отправил ссылку хотя бы одному
  кандидату после перехода по `utm_campaign=id_hr_seed_2026q4` или после разговора.
- **Сигнал продолжать сообщества:** из P5–P7 есть хотя бы один комментарий или вопрос
  по существу либо один переход, который дошёл до `/employer/vacancies/new`.
- **Стоп-сигнал:** за 14 дней 0 разговоров и 0 новых отправителей. Тогда меняем
  лид-магнит или сегмент, а не увеличиваем объём публикаций.
- Во время посевов **никаких платных каналов**: гейты §4 не пройдены, число активных
  отправителей в репозитории не зафиксировано.

## 5. Очередь на 14 дней (черновик; день 1 наступает после согласования владельцем)

| День | Площадка | Действие | Текст / URL |
|---|---|---|---|
| 1 | P1 | 3 личных сообщения тёплым контактам | T2, URL P1/P2 |
| 2 | P5/P7 | Владелец проверяет C4 (Young HRD Indonesia), C5 (HRBP Indonesia, `t.me/hrbpindo`), C6 (HRD Forum) по чек-листу §1c: существование, правила, не рекламная ли площадка. Решение «вступать / нет» — владельца; вступление и посты — не в этом запуске | — |
| 3 | P2 | Представитель: 3 сообщения 1:1 знакомым агентствам | T2 |
| 4 | P3 | Офлайн-обход: 2–3 агентства или виллы, оставить карточку | T3 |
| 5 | P1/P2 | Ответить на ответы, назначить демо | — |
| 6 | P5 | Если C4 прошла проверку §1c и правила разрешают ссылки — владелец/представитель публикует один пост; если ссылки запрещены — только T2 админу с вопросом о разрешении | T1, URL C4 |
| 7 | — | Промежуточный итог: разговоры, переходы по UTM, новые отправители | — |
| 8 | P7 | Одно из C5 / C6 (то, что прошло проверку §1c): пост владельца/представителя, если правила разрешают; иначе T2 админу | T1, URL C5 или C6 |
| 9 | P4 | Один коворкинг из C1–C3 (владелец выбирает по месту): спросить на ресепшене о доске/чате, оставить карточку только с разрешения | T3, URL C1/C2/C3 |
| 10 | P6 | WA-сообщество, где владелец или представитель уже участник: короткий T1 | T1 short, URL P6 |
| 11 | P1/P2 | Повторное сообщение тем, кто не ответил (одно, не больше) | — |
| 12 | P5 | Ответить в комментариях к посту дня 6 | — |
| 13 | P3 | Второй офлайн-обход по откликам | T3 |
| 14 | — | Итог по критерию §4 → решение «продолжать / менять» | — |

Темп — не больше одного поста в день и одного поста на группу: «с редактурой, не ферма»
(`docs/seo/indonesia-content-plan.md` §3).

## 6. Блокеры и решения владельца

- **Снято 01.10 (T-DOKI-05): BLOCKED_DECISION по названиям площадок.** Кандидаты C1–C8 и резерв
  — в §1a; что не взяли — §1b. Остаток за владельцем — не решение «какие площадки», а проверка
  §1c (существование, правила, не рекламная ли) и решение «вступать / нет». Страницы площадок
  из сессии не открывались (BLOCKED_EXTERNAL, сетевая политика) — у всех строк «по выдаче поиска».
- **BLOCKED_DECISION — вычитка BI носителем** перед публикацией T1–T3
  (`gtm-dashboard.md` §1: «блокер для продвижения»).
- **BLOCKED_DECISION — P8 (Reels):** аккаунт бренда и кто снимает ролики.
- **BLOCKED_EXTERNAL — измерение.** Проверить, что `NEXT_PUBLIC_POSTHOG_KEY` задан
  в продакшене и что `utm_*` видны в событиях `$pageview`: одна тестовая ссылка с UTM,
  потом просмотр события в PostHog (≈ 5 минут).
- **Зависимость:** контакты поддержки на страницах (`NEXT_PUBLIC_SUPPORT_WHATSAPP`,
  `NEXT_PUBLIC_ID_REP_NAME`) — `gtm-dashboard.md` §1. Без них посетителю из посева
  негде задать вопрос, кроме формы входа.

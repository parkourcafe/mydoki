# T-DOKI-05 — названные площадки посевов (§1 плана) + критерий DK-04 «кейсы без доказательств помечены как примеры»

- **task_id:** T-DOKI-05
- **repo / base:** parkourcafe/mydoki, ветка `claude/doki-seeding-names` от `claude/autonomy-doki-01` @ `2bb04a7` (PR #116). Сливать после #116; от #117/#118 не зависит.
- **статус:** задача 1 — DONE_CODE (документ; READY_FOR_PLACEMENT, ничего не отправлено и не опубликовано); задача 2 — TESTED_LOCAL (typecheck, lint, unit, lexicon, `next build`; прод не проверен — BLOCKED_EXTERNAL).
- **скиллы:** `doki-id-brand-voice` (без гарантий, без скоринга, «cek syarat resmi»).

## Задача 1 — названные площадки в плане посевов

**Результат:** `docs/ops/autonomy/seeding/DOKI_ID_SEEDING_2026-09-28.md` — новые подразделы §1a (таблица
8 кандидатов C1–C8 + резерв 6), §1b «что искали и не взяли», §1c «что владелец проверяет сам до контакта»;
§2 дополнен URL со слугами `utm_source` под каждую площадку; §5 дни 2, 6, 8, 9 переписаны под C1–C8
(только действия владельца/представителя; вступление и посты — не в этом запуске); §6 — BLOCKED_DECISION
по названиям снят, остались вычитка BI, Reels, PostHog.

**Как искали (ТЗ п.7, только открытые источники):** 18 запросов WebSearch (HR Telegram/FB-сообщества
Индонезии, ассоциации PMSM/ASPHRI/IndHRI, HR-мероприятия 2026, HR-медиа, коворкинги Canggu/Ubud/Denpasar,
HR-сообщества Бали, PHRI/BVA). Личные телефоны и email в выдаче встречались — **не записаны**.

**Evidence / ограничение:** WebFetch отклонён сетевой политикой (`EGRESS_BLOCKED`) на всех 11 доменах
(hrd-forum.com, pmsm.or.id, asphri.or.id, indonesia2026.hrworkplaceshow.com, hrpods.co.id, duniahr.com,
destinationoutpost.co, indhri.com, hrbplearningforum.blogspot.com, tropicalnomad.org, phribali.or.id) — по
одной попытке на домен, блокировка сплошная, дальше не пробовал. Поэтому **все строки — «по выдаче поиска,
страница не открыта»**, правила размещения у всех «неизвестно», числа аудитории только из сниппетов
собственных сайтов (HRD Forum «±24 000», Summit «300+», Young HRD «ribuan») и помечены как непроверенные.
Интерпретация: исследование даёт список для проверки владельцем, а не подтверждённые площадки.

**Blocker:** BLOCKED_EXTERNAL — страницы площадок не открыть из сессии (проверка §1c остаётся владельцу).
BLOCKED_DECISION (прежние): вычитка BI носителем, аккаунт для Reels; BLOCKED_EXTERNAL: UTM в PostHog на проде.

## Задача 2 — DK-04: кейсы, отзывы, названия компаний, числа эффекта на HR-страницах

**Что проверено (все локали ru/en/id/uz, где есть):** `lib/segments.ts` (все сегменты, `caseStudy`),
`lib/landings.ts` (HR-лендинги `candidate-document-collection`, `hr-document-checklist`,
`candidate-document-privacy`), `lib/comparisons.ts` (HR: `google-form`, `hr-whatsapp`, `email-attachments`,
`spreadsheet-tracker`), `lib/checklists.ts` (HR-записи `skck` … `fast-document-submission`), `lib/guides.ts`
(HR-гайдов нет — всё семейное/экспатское, вне объёма), `app/for/[segment]/page.tsx`, `app/vs/[slug]/page.tsx`,
`app/hiring/page.tsx`, `app/page.tsx` (словарь en/id главной), `app/pricing/page.tsx`, `app/faq/page.tsx`,
`app/about/page.tsx`, `app/demo/page.tsx`, `app/llms.txt/route.ts`, `components/LandingPage.tsx`,
`components/ChecklistPage.tsx`, `components/GuidePage.tsx`. Отдельных i18n-словарей (messages/locales) в
репозитории нет — копия лежит inline в `UI`/`M`/`DATA` объектах страниц.
Паттерны: `caseStudy|testimonial|klien kami|pengguna kami|testimoni|our clients|наши клиенты`; числа эффекта
(`\d+ (%|×|раз|times|kali|hours|час|jam|minut|менит|agenc|агентств|agensi|users|пользоват|candidates)`); слова
эффекта (`faster|быстрее|lebih cepat|tezla|saved|сэконом|hemat|trusted|ribuan|thousands|within minutes`);
маркеры примера (`scenario|сценари|skenario|contoh|ilustrasi|example|misalnya|review|отзыв|ulasan`).

**Итог:** реальных отзывов, имён клиентов, названий компаний, счётчиков пользователей/агентств и «сэкономили
N часов» на публичных HR-страницах **нет**. Найдено и исправлено три группы:

| # | Где (до правки) | Вердикт | Правка |
|---|---|---|---|
| 1 | `lib/segments.ts:925–1164` — 3 кейс-блока × 4 локали (`recruitment-agencies`, `hospitality`, `visa-agents`), рендер `app/for/[segment]/page.tsx:206–216` | **(б)** помечены ролью «Типичный сценарий / Typical scenario / Skenario umum / Odatiy holat» (комментарий в коде: «иллюстративный сценарий, не отзыв»; коммит `40a3870`: «framed as scenarios… no real testimonials exist yet»); **но** в uz `visa-agents` маркер был «Doimiy holat» (не «типичный сценарий»), а в `hospitality` все 4 локали и en `recruitment-agencies` содержали числа/слова эффекта без доказательства: «процесс стал заметно быстрее / noticeably faster / jauh lebih cepat / ancha tezlashdi», «within minutes» | роль во всех 12 строках: «… — иллюстрация, не отзыв клиента / an illustration, not a customer review / ilustrasi, bukan ulasan klien / misol, mijoz sharhi emas»; uz `Doimiy` → `Odatiy`; эффект заменён на факт продукта (шаблон пака + напоминания: «каждый новый сотрудник проходит по одному списку, а сроки справок остаются на виду» и эквиваленты en/id/uz); en «within minutes» → «right away» (как ru «сразу» / id «langsung»); uz «bir zumda» → «darhol». «20+ кандидатов» — часть сценария, не результат, оставлено |
| 2 | «Меньше 15 минут — и порядок надолго / Less than 15 minutes… / Kurang dari 15 menit… / 15 daqiqadan kam…» — `app/for/[segment]/page.tsx:20,32,44,56`, `components/LandingPage.tsx:11–14` (рендер на трёх HR-лендингах), `app/vs/[slug]/page.tsx:23,36,49,62` (рендер на HR-сравнениях) | **(в)** число времени без доказательства в репозитории (поиск «15 мин» по docs/tests — только таймаут Talent Pool, не про это) | число убрано: «Начните сегодня — … / Start today — … / Mulai hari ini — … / Bugun boshlang — …», смысл CTA сохранён. Те же компоненты обслуживают семейные `/vs/*` и `/for/*` — правка затрагивает и их (одна строка словаря на компонент) |
| 3 | `app/page.tsx:759` бейдж «Real workflow / Alur nyata» и `:808` чип «live» над макетом доски с вымышленными кандидатами Ayu/Budi/Maya (`:812–814`); на `/demo` те же имена явно помечены «sample with made-up data / data fiktif» (`app/demo/page.tsx:66,100`) | **(в)** макет подписан как реальный | бейдж → «Example workflow (sample data) / Contoh alur (data fiktif)», чип → «sample / contoh» |

**(а) — подтверждено кодом, не трогал:** «2 GB» (`lib/queries.ts:99` `DEFAULT_STORAGE_LIMIT`, миграция
`20260624075557_bump_storage_limit_to_2gb.sql`); «3×24 часа» уведомления об инциденте (`app/privacy/page.tsx`,
`app/dpa/page.tsx` — обязательство политики); шаблоны паков villa/F&B/receptionist/driver/general
(`lib/vacancyTemplates.ts`); «для 1–2 кандидатов — да» в `lib/comparisons.ts:1220,1241,1262` (эмпирическое
правило, не эффект). Обобщения рынка без чисел («sering diminta banyak perusahaan» `lib/checklists.ts:742`,
«The 11 documents most employers collect» `:1204`) — не кейсы, оставлены.

**Проверки (локально, после `npm ci`):**
- `npm run typecheck` → exit 0
- `npm run lint` → 0 ошибок, 18 предупреждений (столько же на базе, см. T-DOKI-D3)
- `npm run test:unit` → 187/187 pass
- `npm run test:lexicon` → OK
- `next build` (заглушки `NEXT_PUBLIC_SUPABASE_*`) → «Compiled successfully», 103/103 статических страниц, exit 0

**Не проверено:** продакшен и визуальный рендер (BLOCKED_EXTERNAL); вычитка BI/UZ новых формулировок носителем
(BLOCKED_DECISION, давний блокер `docs/gtm-dashboard.md` §1).

## Изменённые файлы
- `docs/ops/autonomy/seeding/DOKI_ID_SEEDING_2026-09-28.md` — §0, §1a–§1c, §2, §5, §6
- `lib/segments.ts` — 12 строк `caseStudy`
- `app/for/[segment]/page.tsx`, `app/vs/[slug]/page.tsx`, `components/LandingPage.tsx` — `ctaSub` ×4 локали
- `app/page.tsx` — бейдж и чип макета
- `docs/ops/autonomy/tasks/T-DOKI-05.md` — этот журнал

## next_step
1. Владелец: проверка C1–C8 по §1c (существование, правила, не рекламная ли) → решение «вступать / нет»; затем день 1 очереди §5.
2. Вычитка BI/UZ носителем: новые роли кейс-блоков, CTA, бейдж главной.
3. Слить после #116; после деплоя проверить `/id/for/hospitality` (роль под цитатой) и главную (бейдж «Contoh alur»).

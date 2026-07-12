# CODE_AUDIT.md — аудит кодовой базы под ТЗ «Doki.help, фаза 1»

*Фаза 0 по ТЗ (§0.1, PR-0). Дата: 12 июля 2026. Ветка: `claude/new-session-jdn8ri`.*

Входные документы: **«Doki.help — каноническая архитектура продукта» v1.1 (12.07.2026, утверждённая — далее «Архитектура v1.1», в репо: `docs/ARCHITECTURE.md`)**, «ТЗ для Codex — фаза 1» (v1.0, 11.07.2026, `docs/tz-phase1.md`) и «Аудит архитектуры и перспектива» (11.07.2026, `docs/architecture-perspective.md`). При расхождениях приоритет у Архитектуры v1.1. Ниже — карта соответствия «существующий код → целевая архитектура»: что уже есть, что переиспользуется, что рефакторится, что замораживается, что помечено на удаление. **Ничего не удалено** — только пометки (§8.4).

---

## 1. Резюме

Репозиторий — работающее приложение **Doki (doki.help)**: семейный/личный сейф документов **плюс** карьерный MVP найма (вакансии → отклики → воронка). Это не пустой каркас: значительная часть фазы 1 уже реализована в упрощённом виде.

Главные выводы:

1. **Стек отличается от предположений ТЗ, но эквивалентен по возможностям.** Вместо «Postgres + Drizzle + S3/MinIO + pg-boss» здесь **Supabase** (Postgres + RLS + Auth + Storage) + Vercel (cron) + Resend. Менять не нужно — нужен зафиксированный путь соответствия (§2). Переписывание на Drizzle/MinIO дало бы месяцы работы без пользы.
2. **Ядро vault есть, но оно семейное (household-scoped), а не личное.** Документы привязаны к `household_id` + `member_id`. Версий документов и автопроверок нет. Рекомендация: трактовать «личный vault» ТЗ как личное пространство (household, где пользователь owner) — это одновременно готовый задел под «семьи» фазы 4 (§9.1).
3. **Найм есть, но «гостевой».** Кандидат откликается без аккаунта (WhatsApp + секретный токен статуса). ТЗ требует отклик из vault с согласием и пакетом документов. Мост уже существует (`attachVaultDocs` подкладывает документы залогиненного кандидата), но модель воронки, компании и события требуют расширения (§4.3).
4. **AI-слой зачаточный и не соответствует §7 ТЗ.** Есть распознавание документа при загрузке (vision), «полировка» текста вакансии и неиспользуемый чат-юрист. Нет `lib/ai/` с провайдер-абстракцией, нет версионируемых промптов, нет `ai_runs`, нет groundings, нет Guardrails и Human Review Gate. Candidate Analyzer отсутствует полностью (§6).
5. **Безопасность: фундамент хороший (RLS, приватные бакеты, signed URL, SECURITY DEFINER RPC), но сквозные требования §8 ТЗ не выполнены**: аудит-лог фактически не подключён, retention отклонённых кандидатов нет, шифрование envelope нет, Turnstile fail-open, есть обходной путь мимо rate-limit RPC (§7).
6. **Критическое ограничение: БД общая с приложением Doki.id.** Комментарии миграций (`20260704000000_hired_status.sql`, `20260704020000_video_screening.sql`, `20260705120000_vacancy_limit.sql`) прямо фиксируют: «Общая БД с Doki.id — правка совместима с обоими». Все изменения схемы фазы 1 обязаны быть **аддитивными** (новые таблицы/колонки/RPC), без переименований и смены семантики существующих колонок (§9.6).

### 1.1. Что уточняет Архитектура v1.1 относительно ТЗ v1.0

- **Фаза 0 объявлена завершённой** — этот документ и есть её артефакт; перед следующими задачами достаточно короткой сверки состояния репозитория, а не повторного аудита.
- **Фаза 1 разбита на подфазы 1A → 1B → 1C → 1D**: стабилизация vault → ядро найма → Evidence Intelligence (AI) → sharing и hardening. Ближайшая цель (§17 v1.1) — вертикаль «структурированная вакансия → отклик → Candidate Card → запрос документов → человеческое решение». Это меняет порядок работ относительно ТЗ: пароли/лимиты share-ссылок, retention, антивирус, i18n-прогон и публичные страницы уходят в 1D (см. §10).
- **Версионирование вакансии обязательно** (§8 v1.1): изменение опубликованной вакансии не меняет условия существующих откликов; каждый отклик ссылается на версию/immutable snapshot.
- **Новые канонические сущности**: найм — `CandidateRequest`, `EmployerNote`, `DecisionRecord`, `ConsentRecord`; AI — `EvidenceItem`, `ReviewFlag`, `AiOutputReview`; `AiRun` со состояниями queued/running/completed/failed/blocked/needs_review/reviewed.
- **Envelope encryption смягчено** (§12.2 v1.1): вводится «только после подтверждённого архитектурного решения» — снимается с критического пути (было открытым вопросом ТЗ).
- **Новое требование — LLM redaction policy (§12.5 v1.1)**: полные паспорта и медицинские документы не отправляются в модель без отдельно утверждённого сценария. **Зафиксированное расхождение с текущим кодом:** `lib/classify.ts` отправляет полный скан документа (base64) в Yandex/GLM/Anthropic — сегодня это opt-in пользователя, но redaction-слоя нет. Требование закладывается в `lib/ai/` (PR-8).
- **§15 v1.1 подтверждает решения §2 этого аудита**: стек не менять, ORM/очередь/новое хранилище «ради соответствия документу» не вводить, работающие модули не переписывать — расширять совместимо.

---

## 2. Стек: отклонения от §3 ТЗ и путь соответствия

| ТЗ §3 предполагает | В коде фактически | Решение |
|---|---|---|
| Next.js 15+ App Router, TS strict | Next.js 15, React 19, TS strict, App Router | ✅ совпадает |
| PostgreSQL + Prisma/Drizzle, миграции | Supabase Postgres, SQL-миграции в `supabase/migrations/` (26 шт.), типы вручную в `lib/*.ts` | **Оставить Supabase.** ORM не вводить: авторизация живёт в RLS/RPC, ORM её обойдёт. Миграции — как раньше, чистым SQL. Типы БД можно генерировать (`supabase gen types`) — задача PR-1 |
| S3-совместимое хранилище, MinIO в dev, подписанные URL TTL ≤ 5 мин | Supabase Storage: приватные бакеты `vault-files`, `applications`, `video-screenings` (+ публичный `portfolio-images`), signed URL 120–600 с | **Оставить Storage.** TTL уже ≤ 5 мин везде, кроме offline-копии (600 с — сознательное исключение, зафиксировать). Envelope encryption — отдельная задача (§7) |
| Очередь pg-boss/BullMQ | Vercel Cron → `/api/cron/reminders` (fail-closed по `CRON_SECRET`) + `SECURITY DEFINER` RPC | **Оставить cron.** Для фазы 1 достаточно: напоминания и retention — суточные джобы; фоновый AI-анализ — асинхронный вызов из route handler. Очередь вводить только если появится реальная нагрузка |
| AI через единый `lib/ai/` с провайдер-абстракцией, промпты — файлы | Три разрозненных модуля: `lib/llm.ts` (GLM), `lib/anthropic.ts`, `lib/yandex.ts`, `lib/vacancyAI.ts`; промпты — строковые константы в коде | **Рефакторинг обязателен** (PR-6): единый `lib/ai/` (`runAgent(kind, input) → AiRun`), промпты в `lib/ai/prompts/*`, zod-схемы вывода, retry. Существующие провайдер-вызовы переезжают внутрь |
| i18n: русский первый, словарь (next-intl или аналог) | 4 локали ru/en/id/uz; `lib/i18n.ts` (cookie/`x-locale`) + словарные объекты `Record<Locale, …>` в `lib/*.ts` и компонентах | **Оставить текущий механизм** как «аналог» по ТЗ. Зафиксировать конвенцию: строки только в словарных объектах, не в разметке. Полноценный next-intl — не в фазе 1 |
| Сессии cookie, argon2 | Supabase Auth (email+пароль, Google OAuth, TOTP MFA), httpOnly cookie через `@supabase/ssr` | ✅ эквивалент: хэширование паролей — на стороне Supabase Auth (bcrypt). Argon2 не требуется |
| REST API `/api/*` (§6 ТЗ) | Смесь: server actions (`app/*/actions.ts`) + немного route handlers + SECURITY DEFINER RPC | **Оставить server actions + RPC** как транспорт. Контракт §6 ТЗ трактовать как логический (какие операции существуют и кто их может звать), а не как обязательные REST-урлы. Публичные endpoints (`/api/v/:slug`-эквиваленты) — там, где нужен анонимный доступ, уже есть паттерн RPC для anon |

Отдельно: e-mail — Resend; антиспам — Cloudflare Turnstile (только apply-форма); аналитика — PostHog + Яндекс.Метрика; PWA/offline — service worker + IndexedDB. Всё переиспользуется.

---

## 3. Два контура текущего продукта

**Контур A — vault (семейный сейф).** `households` → `members` → `documents` → `document_files`; категории enum + пользовательские разделы; напоминания-письма d30/d7; share-ссылки на документ и пакеты; приглашения в семью с ролями owner/editor/viewer; имущество (`assets`); медкарта (`records`); экспорт; 2FA; удаление аккаунта. UI: `/my/*`.

**Контур B — найм (career MVP).** `employer_profiles` (1:1 user, верификация email-кодом, лимит 3 активных вакансии) → `vacancies` (slug, required_documents, screening_questions, видео-скрининг) → `applications` (статусы `new→viewed→shortlisted→rejected/hired`, консент inline, анти-спам по IP-хэшу и телефону) + `application_documents/answers/status_log`. Визард вакансии — детерминированный опросник + AI-полировка. UI: `/employer/*`, `/apply/[slug]`, `/applications/status/[token]`, `/my/applications`, `/my/resume`.

ТЗ фазы 1 — это, по сути, **слияние контуров**: отклик перестаёт быть анонимной формой и становится операцией из vault. Оба контура — фундамент, не конкурент ТЗ.

---

## 4. Карта данных: §4 ТЗ → существующая схема

Легенда: ✅ есть и переиспользуется · 🔧 есть, требует расширения (аддитивно) · ➕ создать новое · ⚠️ решение владельца продукта (§9).

### 4.1. Пользователи и компании

| ТЗ | Код | Статус / действие |
|---|---|---|
| `users` | `auth.users` (Supabase) + `resumes` (1:1, профиль кандидата) | ✅ Своей таблицы users не создавать. `locale` живёт в cookie — достаточно |
| `companies` | Нет. Есть `employer_profiles` (1:1 с пользователем: company_name, logo, контакты, verified_at, vacancy_limit) | ➕⚠️ Создать `companies` + перенос данных из `employer_profiles` миграцией (employer_profile → company c owner). `employer_profiles` не удалять (общая БД!) — оставить как совместимый слой, новые фичи вешать на companies |
| `company_members` | Нет | ➕ role `owner`/`recruiter`; membership не отменяет личный аккаунт — уже так (у работодателя есть личный `/my`) |

### 4.2. Vault

| ТЗ | Код | Статус / действие |
|---|---|---|
| `documents` (owner_user_id, категории ТЗ, status active/archived, current_version_id) | `documents`: household_id + member_id, enum `doc_category` (identity/education/career/medical/financial/tax/legal/other) + `custom_doc_categories`, subtype, issued_at/expires_at, теги | 🔧 Владелец = личное пространство (§9.1). Категории ТЗ (passport, diploma, visa, …) мапить на пары (category, subtype) — enum не расширять ломающе; недостающие значения enum добавлять аддитивно. Добавить `status`(active/archived) и `current_version_id` |
| `document_versions` (immutable, file_hash) | `document_files` — несколько файлов у документа, без хэша, без семантики версий; удаление файлов возможно | ➕ Новая таблица `document_versions` (file_key, sha256, mime, size, note) поверх того же бакета; `document_files` оставить для совместимости, новые загрузки писать в versions. Запрет удаления версий — политиками RLS |
| `document_checks` (expiry / name_match / date_consistency / file_integrity; **без слова «подделка»**) | Нет. Грep по коду: терминов «подделка/фальшивый» в проверках нет (упоминание «фейковых работодателей» в `EmployerVerification.tsx` — другой контекст, к проверкам документов не относится) | ➕ Таблица + фоновые проверки. Для name_match/date_consistency переиспользовать распознавание (`lib/classify.ts` уже извлекает title/issuer/номер/даты) |
| `reminders` (offsets jsonb, ручные + автоматические) | Таблица `reminders` из init-миграции **не используется кодом** (грep: ни одного обращения). Реально работает: RPC `due_reminders` (пороги d30/d7 захардкожены) + `reminder_sent` (дедуп) + cron + Resend; UI `/my/reminders` показывает выборку истекающих документов | 🔧 Реализовать модель ТЗ (offsets [-30,-7,-1], ручные напоминания, каналы) на новой/оживлённой таблице; `due_reminders` переписать поверх неё. Старую таблицу пометить как замещаемую (§8.4) |
| `share_links` (token, scope, expires, max_views, **password_hash**, revoked) | `shares` (1 документ: token 128 бит, expires, max_views+view_count, watermark, allow_download, revoked) + `share_packages` (N документов: token, expires, revoked, allow_download; **без max_views/пароля/watermark**) | 🔧 Добавить `password_hash` обеим; пакетам — max_views. Проверка пароля — в RPC `get_shared_*`. Исправить TOCTOU на view_count (инкремент с проверкой атомарно) |
| `share_access_log` (ip, user_agent; владелец видит каждый доступ) | Отдельной таблицы нет; `get_shared_document/package` пишут `*.share_view` в `audit_log` (без ip/ua) | 🔧 Достроить: ip/ua в метаданные записи (ip — хэшировать по образцу apply-потока) + UI журнала доступов у владельца |
| `bundles` + `bundle_items` (пакет как сущность, отдельно от ссылки) | `share_packages` = пакет и ссылка в одном (token прямо в пакете) | 🔧 Разделить: `bundles` без токена (переименованная семантика share_packages) + ссылки указывают на bundle. Аддитивно: новая таблица ссылок, share_packages сохраняет работу старых URL |

### 4.3. Найм

| ТЗ | Код | Статус / действие |
|---|---|---|
| `vacancies` (draft/published/closed, problem_statement, daily_tasks, must_have, trainable, scorecard, **stages**, success_criteria_probation, published_at, company_id) + **`VacancyVersion`/snapshot (v1.1 §8)** | `vacancies`: slug ✅, title ✅, required_documents jsonb ✅, screening_questions jsonb ✅, description (структурированные блоки 🏠👤🎯✅🧩), video_screening, статусы `active/paused/closed`, employer_id. Версионирования нет: правка вакансии меняет условия задним числом для уже поданных откликов | 🔧 Аддитивно добавить недостающие jsonb-поля и `published_at`; статусную модель расширить (draft → published ≈ active; paused сохранить). ➕ `vacancy_versions` (immutable snapshot при публикации/правке), отклик ссылается на версию. Публикация без просмотра человеком уже невозможна (визард всегда показывает форму редактирования — сохранить это свойство) |
| `applications` (stage из stages вакансии × state active/hired/rejected/withdrawn, rejected_reason, answers jsonb, UNIQUE(vacancy, applicant)) | `applications`: статус-машина `new→viewed→shortlisted→rejected/hired` в RPC `update_application_status`; `hired` уже терминальный ✅ (задел под Employment фазы 2 существует); consent inline ✅; UNIQUE(vacancy_id, whatsapp); user_id nullable (гостевой отклик) | 🔧⚠️ Добавить `stage` + `state` как новые колонки с обратной совместимостью (status остаётся для Doki.id); добавить `rejected_reason`, `withdrawn`; уникальность по (vacancy_id, user_id) — для vault-откликов. Судьба гостевого отклика — решение §9.2 |
| `application_documents` (document_id + document_version_id из vault, status provided/missing/expired) | `application_documents`: **копия файла** в бакет `applications` (без связи с vault-документом) | 🔧 Добавить nullable `document_id`/`document_version_id` (фиксация версии на момент подачи). Комплектность вычислять по required_documents — сейчас есть зачаток (чек-лист в карточке отклика). «Не заполнено» как флаг, не этап — уже так |
| `application_events` (единая лента: stage_change, note, document_request, ai_analysis, consent) + отдельные `CandidateRequest`, `EmployerNote`, `DecisionRecord` (v1.1 §7.3) | `application_status_log` — только смены статусов; заметок, запросов документов и записи решения нет | 🔧 Новая таблица `application_events` (actor: user/system/ai, type, payload) + миграция-бэкофилл из status_log. Запросы кандидату, заметки команды и решение человека — типизированные записи (отдельные таблицы или типы событий — решить в PR 1B, аддитивно) |
| `consents` (kind data_processing, text_version, отзыв → потеря доступа компании) | Согласие отклика — inline (`consent_text`, `consent_given_at` в applications) ✅ фиксация текста даже лучше, чем «версия». Отдельная таблица `consents` (household-scoped: privacy_policy/medical/marketing, только version, без текста) — из контура A | 🔧 Для найма: оставить inline-фиксацию + добавить `consent_revoked_at`; отзыв согласия должен закрывать RLS-доступ работодателя к документам отклика (сейчас отзыва нет вообще) |

### 4.4. AI и сквозное

| ТЗ | Код | Статус / действие |
|---|---|---|
| `ai_runs` (kind, prompt_version, model, groundings, reviewed_by, review_action; Human Review Gate) + `EvidenceItem`, `ReviewFlag`, `AiOutputReview`; состояния AiRun queued→…→reviewed (v1.1 §7.5) | Нет. `ai_usage` — только счётчик вызовов для дневного лимита (50/сутки) | ➕ Создать с первого AI-PR: `ai_runs` со state-машиной v1.1 + пунктовые выводы (`evidence_items`) с category/текст/источник/цитата/confidence/prompt_version/model/статус ревью. Ни один вывод без ревью не влияет на воронку — техтребование EU AI Act, закладывается в PR-8, проверяется в PR-9 |
| `audit_log` (каждый просмотр/скачивание/смена стадии/вход по ссылке) | Таблица и hardened-функция `log_audit` есть (`20260626043616`), **но из кода приложения не вызывается ни разу**. Пишут только share-RPC (`*.share_view`) | 🔧 Подключить повсеместно: просмотр/скачивание файлов (signed URL выдача), просмотры работодателя, смены стадий. Владелец должен видеть журнал — UI отсутствует |
| `retention_jobs` (автообезличивание отклонённых, дефолт 12 мес.) | Нет. Отклонённые и «осиротевшие» (после удаления аккаунта кандидата user_id→NULL) отклики хранят ФИО/телефон/email/файлы бессрочно | ➕ Суточный cron: обезличивание application + отзыв доступа к файлам; настройка срока — в будущих настройках компании |

---

## 5. Карта маршрутов: §5 ТЗ → текущие

### Публичные

| ТЗ | Сейчас | Действие |
|---|---|---|
| `/` три входа | `/` — маркетинговый лендинг vault (видео-hero, SEO-кластеры) | 🔧 Перестроить на «три входа» (люди/работодатели/семьи), позиционирование по ТЗ |
| `/for-people`, `/for-employers` | `/for/[segment]` — 9 сегментов (job-seekers, employers, families, visa, …) | ✅ Считать `/for/job-seekers` и `/for/employers` выполнением; при желании — алиасы-редиректы |
| `/document-vault` | 10 фиче-лендингов (`/family-document-vault` и др.) | ✅ покрыто с запасом |
| `/security`, `/pricing` | Есть | ✅ (плюс `/privacy`, `/terms`, `/ai-processing`, `/data-deletion`) |
| `/about` | Нет | ➕ |
| `/v/[slug]` вакансия по прямой ссылке | `/apply/[slug]` — страница вакансии + форма отклика. **Внимание:** близкий URL `/vs/[slug]` уже занят страницами сравнений («doki vs google-drive») | ⚠️ §9.3: либо `/v/[slug]` = публичная страница вакансии, а `/apply/[slug]` — мастер отклика; либо остаться на `/apply`. Публичной доски вакансий нет — соответствует ТЗ ✅ |

### Кабинет человека (ТЗ `/app/*` ↔ текущий `/my/*`; рекомендация — остаться на `/my/*`, §9.3)

| ТЗ | Сейчас | Действие |
|---|---|---|
| `/app/home` | `/my` — члены семьи, storage, истекающие | 🔧 добавить блоки: активные отклики, активные share-ссылки |
| `/app/documents` | `/my/documents` (+category/section/[id]) — сетка, загрузка, распознавание | 🔧 карточка документа: версии, проверки, напоминания |
| `/app/profile` | `/my/resume` (анкета) + `/my/security` (личные настройки) | 🔧 объединить в проф. профиль (опыт, навыки, резюме-документ по умолчанию) |
| `/app/applications`, `/app/jobs` | `/my/applications` — список статусов через `get_my_applications` | 🔧 комплектность, лента событий, отзыв отклика |
| `/app/reminders` | `/my/reminders` — только просмотр истекающих | 🔧 ручные напоминания + offsets |
| `/app/shared` | `/my/share` — пакеты; одиночные ссылки — в карточке документа | 🔧 единый центр: пакеты, ссылки, журнал доступов, отзыв |

### Кабинет работодателя

| ТЗ | Сейчас | Действие |
|---|---|---|
| `/employer/dashboard` | `/employer` — вакансии со счётчиками откликов | 🔧 добавить: неполные комплекты, задачи на ревью AI |
| `/employer/vacancies`, `/new` | `/employer`, `/employer/vacancies/new` (визард: профиль → верификация email → лимит → опросник → AI-полировка → форма → публикация), `/edit` | 🔧 визард эволюционирует в Discovery+Structuring по §7.1; см. также `docs/dokihel/vacancies/create-vacancy/job-profile.md` (O*NET-модель JobProfile — совместима с ТЗ, использовать как базу для брифа Discovery) |
| `/employer/candidates` (kanban) | Доска статусов внутри `/employer/vacancies/[id]` (ApplicationsBoard) | 🔧 kanban по stages вакансии + сквозной список кандидатов |
| Candidate Card (15 разделов по v1.1 §10; представление **отклика**, не глобальная оценка человека) | Разворачиваемая карточка в доске: документы (signed URL), ответы, видео | ➕ полноценная страница `/employer/candidates/[applicationId]` (v1.1 §6.3); плюс `/employer/vacancies/[id]/candidates` как kanban-вид |
| `/employer/settings` | Нет (профиль компании — шаг визарда) | ➕ компания, участники, срок хранения, тексты согласий |

Голос/видео кандидата: видео-скрининг уже реализован (bucket `video-screenings`, file-тип вложения отклика) — соответствует ТЗ («file-тип screening question, без записи в продукте» — сейчас запись в браузере есть; оставить, это superset) ✅.

---

## 6. AI-модули: §7 ТЗ → текущее состояние

| Роль ТЗ | Сейчас | Разрыв |
|---|---|---|
| Vacancy Discovery (диалог) | `WizardIntake` + `lib/vacancyWizard.ts` — детерминированный опросник (роль, задачи, качества, документы, оплата) **без AI**; `lib/roleTemplates.ts` — шаблоны ролей | Диалоговость и бриф — нет. Но UX-скелет и вопросы почти совпадают с ТЗ (проблема→задачи→обязательно/научим→документы). Достроить AI-диалог поверх, не выбрасывая опросник |
| Vacancy Structuring | `buildDraft()` (детерминированная сборка) + `polishVacancy()` (`lib/vacancyAI.ts`, GLM→Anthropic; анти-дискриминационные правила в промпте ✅) | Нет: структурированный JSON по zod, must_have/trainable/scorecard/stages, prompt-файлы, ai_runs. Редактирование человеком до публикации — есть ✅ |
| Candidate Analyzer (Evidence / Completeness / Consistency) | Нет. Есть кирпичи: `lib/classify.ts` (vision-извлечение полей документа), чек-лист требуемых документов в отклике | Создать целиком (PR-9). Запреты ТЗ (балл, ранжирование, «подделка») в текущем коде не нарушаются — нечему нарушать |
| Guardrails + Human Review Gate | Нет | Слой пост-обработки + лексический фильтр + ревью-кнопки. Закладывается вместе с `lib/ai/` |
| Логирование (§7.4) | `ai_usage` — только счётчик | `ai_runs` со всеми полями — обязательный минимум с первого AI-вызова |
| Инфраструктура | `lib/llm.ts` (GLM + чат-юрист), `lib/anthropic.ts`, `lib/yandex.ts`, `lib/vacancyAI.ts` — 4 модуля с дублированной провайдер-логикой, промпты-строки | Свести в `lib/ai/` c `runAgent(kind, input)`; промпты — версионируемые файлы; температуры низкие; retry невалидного JSON. Плюс **redaction policy (v1.1 §12.5)** на входе каждого вызова: категория документа → что можно отправлять (сейчас `classify` шлёт полный скан; паспорта/медицина без утверждённого сценария отправляться не должны) |

`lawyerChat` (`lib/llm.ts:146`) — **мёртвый код** (нигде не вызывается), функциональность фазы 3. Пометка: заморозить/удалить при рефакторинге `lib/ai/` (§8.4).

---

## 7. Безопасность: §8 ТЗ → статус

| §8 ТЗ | Статус | Детали |
|---|---|---|
| 1. Приватный bucket + signed URL TTL ≤ 5 мин; envelope encryption (DEK per-document) | 🟡 частично | Бакеты приватные, TTL 120–600 с ✅. Envelope encryption **нет** (только at-rest Supabase) — по v1.1 §12.2 вводится только после отдельного архитектурного решения, с критического пути снято. Исключение: `portfolio-images` — публичный bucket (осознанно, для портфолио; в контур документов не входит — зафиксировать) |
| 2. audit_log на каждый доступ | 🔴 | `log_audit` hardened, но не вызывается из кода; пишутся только share-просмотры. Просмотры владельца/работодателя, скачивания, смены стадий — не журналируются. UI журнала нет |
| 3. Согласие при отклике, версия текста; отзыв → потеря доступа | 🟡 | Фиксация полного текста согласия + времени ✅ (сильнее ТЗ). Отзыва согласия нет; механизм закрытия доступа компании — строить |
| 4. Retention отклонённых | 🔴 | Отсутствует; PII и файлы хранятся бессрочно, `delete_my_account` не чистит отклики кандидата |
| 5. Rate limiting, argon2, httpOnly | 🟡 | Apply: IP-хэш ≤5/час, телефон ≤3/24ч, дедуп по вакансии ✅ — но только внутри RPC: INSERT-политики `with check (true)` позволяют боту писать в `applications` напрямую через PostgREST мимо лимитов и Turnstile. Auth-endpoints без капчи; Turnstile **fail-open** при отсутствии секрета/сетевой ошибке. Пароли — Supabase Auth ✅, httpOnly ✅. `applications` UPDATE-политика без `WITH CHECK` — работодатель может править поля отклика, включая consent_text |
| 6. Валидация загрузок: mime/размер ✅ (лимиты бакетов); антивирус ❌; EXIF-strip ❌ | 🟡 | Плюс: анонимная загрузка в бакеты `applications`/`video-screenings` возможна без создания отклика (спам-вектор оrphan-файлов) |
| 7. PII не в логах | 🟡 | Apply-поток хэширует IP ✅; но `login_events` хранит сырой IP + user-agent; письма-напоминания содержат названия документов (приемлемо, зафиксировать) |
| 8. Центральный authz-модуль `lib/authz/` | 🟡 иначе | Фактический центр — RLS + `private.is_household_*` хелперы в Postgres; это **сильнее** ad-hoc проверок в коде. Дополнительно: MFA настраивается, но нигде не форсится (нет AAL2-гейта). Service-role используется в 3 местах (share-подпись файлов ×2, cron) — узко и после валидации токена ✅ |

Вывод: пункты 2, 4 и обход RPC-лимитов — самые приоритетные долги, они входят в критерии приёмки ТЗ (№8, №9) и не могут быть отложены на конец (ТЗ §8: «не откладывается»).

---

## 8. Классификация модулей

### 8.1. Переиспользуется как есть
`lib/supabase/{server,client,admin}.ts` · `middleware.ts` (i18n + auth-refresh + md-negotiation) · RLS-хелперы `private.*` и паттерн SECURITY DEFINER RPC для anon-потоков · бакеты и signed-URL-потоки · Supabase Auth + MFA + OAuth + верификация работодателя email-кодом · Resend + cron-каркас · `lib/classify.ts`/vision-распознавание (станет частью Evidence Extraction) · SEO-слой (`lib/{landings,segments,comparisons,usecases,checklists,trust,seo}.ts`, sitemap/robots/agents.md) · PWA/offline · аналитика · тесты `tests/rls/*.sql` (паттерн двух пользователей) и e2e-каркас Playwright.

### 8.2. Рефакторится (аддитивно) в рамках фазы 1
Документы (версии, проверки, категория-маппинг, archived) · напоминания (offsets, ручные) · share (пароль, max_views пакетов, журнал, разделение bundle/ссылка) · найм (companies/members, поля вакансии, stage×state, события, карточка кандидата, kanban) · согласия (отзыв) · AI-слой (консолидация в `lib/ai/`) · главная страница (три входа) · `/my` home (сводка по ТЗ).

### 8.3. Замораживается (не развивать в фазе 1, не удалять)
`/my/assets` (имущество) · `/my/members/[id]/health` + `records` (медкарта) · `/my/freelance` + `portfolios` + бакет `portfolio-images` (фриланс) · `/my/export` · `/saved` (offline) · видео-скрининг (работает — не расширять) · SEO-лендинги (контент-работа вне ТЗ).

### 8.4. Помечено на удаление/замещение (само удаление — отдельным осознанным PR)
- `lawyerChat` в `lib/llm.ts` — мёртвый код; функциональность = юрпомощник фазы 3, в фазе 1 запрещён к реализации. Удалить при создании `lib/ai/`.
- Таблица `reminders` из init-миграции — не используется кодом; будет замещена моделью напоминаний ТЗ. В общей БД таблицу не дропать — пометить deprecated в комментарии миграции.
- `docs/schema.sql` — «авторитетный design-черновик» разошёлся с реальными миграциями; после PR-1 объявить единственным источником правды `supabase/migrations/`, файл пометить историческим.

---

## 9. Решения, которые надо принять до PR-1 (с рекомендациями)

> **Статус: утверждено владельцем продукта 12.07.2026 — по всем пунктам приняты рекомендации ниже.** Кратко: vault = личное пространство (без миграции данных); гостевой отклик сохраняется как настройка вакансии, vault-отклик становится основным; кабинет остаётся на `/my/*`, публичная страница вакансии — `/v/[slug]`; категории — маппингом (category, subtype); рынок — обе локали без конфликта; все миграции аддитивные (общая БД с Doki.id).

1. **Личный vault vs household.** ТЗ: документы принадлежат `owner_user_id`. Код: всё household-scoped, у каждого пользователя уже есть своё пространство (создаётся автоматически), есть переключатель пространств. **Рекомендация: не мигрировать данные.** «Личный vault» = личное пространство пользователя; «семьи» фазы 4 = уже готовые совместные пространства с ролями. Это ровно позиция v1.1 §3.3 («семья — функция личного vault до фазы 4») и запрет §7.1 v1.1 на параллельные сущности с тем же смыслом.
2. **Гостевой отклик (без аккаунта).** ТЗ требует отклик через регистрацию (согласие + документы из vault). Текущий продукт построен на отклике без аккаунта (WhatsApp-рынок Индонезии), и это работающий канал с анти-спамом. **Рекомендация:** vault-отклик сделать основным (мастер по ТЗ), гостевой канал сохранить как настройку вакансии («разрешить быстрый отклик»), т.к. это живая воронка Doki.id и общая БД. Требует явного «да/нет» владельца.
3. **URL-ы.** Кабинет: оставить `/my/*` (вместо целевого `/app/*` из v1.1 §6.2) — переименование ломает ссылки/SEO/привычки без пользы, а v1.1 §16 предписывает совместимое расширение вместо переписывания; трактовать `/app/home` ≡ `/my` и т.д. (либо алиасы-редиректы). Вакансия: завести `/v/[slug]` (свободен; не путать с занятым `/vs/[slug]` — сравнения) как публичную страницу, `/apply/[slug]` оставить мастером отклика (или редиректом).
4. **Категории документов.** Не ломать enum `doc_category`; категории ТЗ реализовать как (category, subtype)-маппинг + аддитивные значения enum (passport→identity/паспорт и т.п.).
5. **Рынок и язык.** ТЗ: русский первый. Код: 4 локали, контент найма заточен под Индонезию (KTP, WhatsApp, SIM C). Конфликта нет технически (словарная i18n), но контент-словари найма придётся расширять на ru-рынок (документы РФ: паспорт, СНИЛС, трудовая книжка — частично уже в classify).
6. **Общая БД с Doki.id — рамка всех миграций.** Только аддитивные изменения; существующие RPC (`submit_application`, `update_application_status`, …) менять только расширением сигнатур/новыми функциями; колонку `applications.status` и её статус-машину сохранить работающей параллельно с новыми stage/state до синхронизации обоих приложений.

---

## 10. План работ: подфазы 1A–1D (v1.1 §14) применительно к этому репо

Порядок — по Архитектуре v1.1 (vault-стабилизация → ядро найма → AI → sharing/hardening); содержание PR скорректировано под существующий код. Каждый PR: миграции аддитивные и обратимые (план отката — v1.1 §16.7), тесты зелёные, описание по-русски.

> **Статус фазы 1: все 13 PR (PR-0…PR-12) выполнены + PR-13 RLS-hardening (по санкции владельца).** Функциональное ядро готово: личный vault (версии/проверки/архив/напоминания), ручная вертикаль найма §17 (вакансия→отклик→Candidate Card→решение), AI-слой с Human Review Gate, sharing с паролем, retention, публичные страницы. **PR-13 (миграция `20260712210000`):** отзыв INSERT/UPDATE/DELETE-грантов на `applications`/`application_documents`/`application_answers` у anon/authenticated (запись только через SECURITY DEFINER RPC — закрыт анти-абьюз-bypass и tampering; подтверждено грепом: прямых записей в коде нет); `WITH CHECK` на UPDATE-политику; атомарный `view_count` в `get_shared_document`/`get_shared_package` (TOCTOU); доступ рекрутёров на чтение через `company_members` (аддитивные permissive-политики + `private.can_access_employer`). Проверено на локальном Postgres. Предпосылка: Doki.id тоже пишет эти таблицы только через RPC (в шапке миграции — план отката). **Остаётся инфраструктурное** (не блокирует фазу 1): антивирус (ClamAV), EXIF-strip (image-lib = новая зависимость), enforcement MFA (AAL2-flow). Все миграции применяются мейнтейнером в обычном порядке; реальный прод-прогон — за мейнтейнером.

| PR | Подфаза | Содержание |
|---|---|---|
| PR-0 | Фаза 0 | Этот документ + канонические доки в `docs/` ✅ |
| PR-1 | 1A Vault | ✅ **Выполнено.** `document_versions` (immutable — нет update/delete-политик) + `document_checks` (expiry/name_match/date_consistency/file_integrity) + `documents.status/current_version_id/holder_name` + бэкофилл из `document_files` (dual-write для совместимости с Doki.id) + write-once RPC хэша + маппинг категорий (`lib/docTypes.ts`) + карточка документа (Версии/Проверки/Архив, 4 локали) + переключатель архива. Тесты: RLS-неизменяемость (`tests/rls/document_versions.sql`), unit (`tests/unit/vault.test.ts`), лексика (`tests/lexicon.mjs`) — прогнаны на локальном Postgres. Envelope encryption не делаем (v1.1 §12.2 — только после отдельного решения). Файл ТЗ: `docs/tasks/tz-pr1.md` |
| PR-2 | 1A Vault | ✅ **Выполнено.** Авто-напоминания по expires_at на offsets **[30,7,1]** (новый RPC `due_reminder_candidates`, логика порогов — чистая `lib/reminders.ts`, старый `due_reminders` не тронут — Doki.id); ручные напоминания на таблице `reminders` (поля `title/offsets/channel`, CRUD в `/my/reminders`, RPC `due_manual_reminder_candidates`, дедуп `reminder_sent_manual`); cron переписан поверх, письма Resend. Тесты: unit с фиксированным «сегодня» (`tests/unit/reminders.test.ts`, 9 кейсов — критерий приёмки №1); RPC-кандидаты и исключение архивных проверены на локальном Postgres. Файл ТЗ: `docs/tasks/tz-pr2.md` |
| PR-3 | 1A Vault | 🟡 **Частично (безопасная аддитивная часть).** Сделано: `log_audit` подключён к просмотру документа владельцем (`lib/audit.ts`) + журнал доступов в карточке (просмотры + просмотры по share-ссылке); Turnstile переведён в fail-closed (не-200/невалидный ответ/сетевой сбой при активном Turnstile → блок). Без миграции — общий прод не тронут. **Отложено (нужна отдельная санкция — общие с Doki.id таблицы):** ужесточение RLS `applications` (INSERT вместо `with check(true)`, `WITH CHECK` на UPDATE), атомарный `view_count` в `get_shared_document`, а также аудит доступа **работодателя** к документам кандидата (hardened `log_audit` привязан к household — нужен отдельный механизм) |
| PR-4 | 1B Hiring | ✅ **Выполнено.** Решение: **отдельную `companies` не заводим** (v1.1 §15 — параллельные сущности запрещены), `employer_profiles` и есть компания. Аддитивно: колонки `retention_months` (дефолт 12), `default_consent_text`, `country`; таблица `company_members` (задел под мультидоступ, бэкофилл owner, RLS: владелец управляет / участник видит себя); action `saveCompanySettings`; страница `/employer/settings` (данные компании, срок хранения, текст согласия, список участников) + ссылка в шапке. Реальный доступ рекрутёров через RLS общих таблиц — отложено (см. PR-3 deferred). Проверено на локальном Postgres (бэкофилл owner, RLS-изоляция, дефолт retention). Файл ТЗ: `docs/tasks/tz-pr4.md` |
| PR-5 | 1B Hiring | ✅ **Выполнено (аддитивно).** Вакансия += `problem_statement, must_have, trainable, scorecard, stages` (дефолт new→review→interview→assignment→decision)`, success_criteria_probation, published_at`; `vacancy_versions` (неизменяемый снимок, RLS владельца, снимок делает код doki.help на save — не триггер, чтобы не порождать версии на записях Doki.id); публичная **`/v/[slug]`** (read-only вакансия + CTA «Откликнуться», noindex). Проверено на локальном Postgres (дефолты, RLS/immutability версий, изоляция). **Отложено:** статус `draft` (правка общего CHECK-constraint) и привязка отклика к версии через `submit_application` (общий RPC — вместе с PR-6) |
| PR-6 | 1B Hiring | ✅ **Выполнено (аддитивно).** `applications` += `stage`×`state` (дефолты new/active — консистентны и для старого `submit_application`/Doki.id), `rejected_reason`, `consent_revoked_at`; бэкофилл из status. `application_events` (единая лента, RLS работодатель+кандидат, бэкофилл из status_log). `update_application_status` расширен аддитивно (пишет state/stage + событие; поведение для Doki.id не меняется). Новые RPC: `set_application_stage`, `reject_application` (отказ только с причиной), `add_application_note`, `request_application_documents`, `withdraw_application` (кандидат), `revoke_application_consent` (по токену). `get_my_applications` += stage/state/consent. UI `/my/applications`: этап/состояние, отзыв отклика и согласия. Employer-actions для Candidate Card заведены (используются в PR-7). Всё проверено на локальном Postgres (переходы, отказ, отзыв, лента из 5 событий, изоляция). **Отложено:** привязка отклика к версии вакансии через `submit_application` и закрытие доступа работодателя к документам при отзыве согласия на уровне RLS (app-level enforcement — в Candidate Card PR-7) |
| PR-7 | 1B Hiring | ✅ **Выполнено. Вертикаль §17 закрыта — ручной end-to-end найм работает без AI.** Страница Candidate Card `/employer/candidates/[applicationId]` (гейт по владельцу вакансии; разделы: профиль, документы, ответы, история/лента, согласия, решение) + клиентский `CandidateActions` (перемещение по этапам `set_application_stage`, отказ только с причиной `reject_application`, заметка команды, запрос документов — из PR-6). Ссылка с доски откликов на карточку. App-level закрытие доступа к документам при отзыве согласия. Миграция: внутренние заметки скрыты от кандидата в ленте (RLS). Проверено на локальном Postgres (кандидат не видит note, работодатель видит всё). Kanban-представление по stage — отложено как presentation-refinement (доска по status работает). Отложено: доступ рекрутёров (общие RLS) |
| PR-8 | 1C AI | ✅ **Выполнено (инфраструктура AI).** `lib/ai/`: `provider` (GLM→Anthropic абстракция), `prompts` (версионируемые: vacancy_structuring/evidence_extraction/consistency_check), `guardrails` (лексический фильтр запретов + grounding-фильтр — чистые, юнит-тесты), `redaction` (§12.5 — паспорта/медицина не уходят в модель без утверждённого сценария, юнит-тест), `runAgent(kind,input)` (вызов → парс JSON → guardrails → лог в `ai_runs` с prompt_version/model/groundings, state='needs_review' = Human Review Gate). Миграция `ai_runs` (state-машина queued…reviewed, RLS по created_by). Без `zod` — ручная валидация (без новых зависимостей). Удалён мёртвый `lawyerChat`. Проверено: 5 AI-юнит-тестов, `ai_runs` RLS на локальном Postgres. **Осталось на PR-9:** подключение агентов к UI (Structuring в визард, Candidate Analyzer) |
| PR-9 | 1C AI | ✅ **Выполнено.** Candidate Analyzer: `lib/ai/completeness` (детерминированная сверка required_documents vs приложенные — без LLM, юнит-тесты) + evidence_extraction/consistency_check через `runAgent` (по тексту ответов, gated на ключах). Каждый прогон → `ai_runs` со state='needs_review'. Employer-actions `analyzeCandidate`/`reviewAiRun`. UI: секция «AI-анализ» в Candidate Card (`CandidateAI`, 4 локали) — findings с основаниями, метка «требует проверки», кнопки Принять/Редактировать/Отклонить = **Human Review Gate** (вывод не влияет на воронку до ревью). Guardrails (лексика+grounding) применяются в runAgent. Запреты §10/§15 — юнит-тестами (7 AI-тестов). Проверено: typecheck/build/unit(29)/lexicon |
| PR-10 | 1D Sharing | ✅ **Выполнено.** `shares` += `password_hash`; `share_packages` += `password_hash/max_views/view_count/watermark` (паритет с одиночными). RPC `get_shared_document`/`get_shared_package` пересозданы с параметрами-дефолтами (пароль + ip-хэш + user-agent в журнал; пакеты теперь чтут max_views/watermark) — старые вызовы Doki.id совместимы. Пароль: `hashSharePassword` (env-соль), форма ввода на `/s/[token]` и `/pkg/[token]` (cookie-хэш → RPC), `createShare`/`createSharePackage` принимают пароль. Журнал доступов — per-doc история из PR-3 + ip-хэш/ua в метаданных. Проверено на локальном Postgres (locked/unlocked, max_views пакета, логирование ua). **Осталось:** input пароля/лимита в `SharePackageManager` (backend готов); атомарность view_count (get_shared_document TOCTOU) — отложено с общими RPC |
| PR-11 | 1D Hardening | 🟡 **Retention сделан; остальное — обоснованно отложено.** ✅ RPC `run_application_retention` (обезличивает отклонённые отклики старше `retention_months` компании: PII→'—'/null, удаляет ответы и метаданные документов, возвращает пути файлов; `anonymized_at`-маркер против повторов) + cron `/api/cron/retention` (fail-closed, удаляет осиротевшие файлы из storage). Личные документы кандидата в vault не трогаются. Проверено на локальном Postgres (старый обезличен, недавний нетронут). **Обоснованные отложения:** антивирус (нужен ClamAV/скан-API — инфраструктура), EXIF-strip (нужен image-lib = новая зависимость, запрещено v1.1 §15), enforcement MFA (нужен AAL2-challenge-flow — отдельный UX), login_events IP — **осознанно не хэшируем**: это собственные данные пользователя, показываемые только ему для мониторинга входов (own-row RLS, как в GitHub/Google) |
| PR-12 | 1D Публичка | ✅ **Выполнено.** Главная: аддитивный блок «три входа» (люди→`/for/job-seekers`, работодатели→`/for/employers`, семьи→`/for/families` с пометкой «скоро»), 4 локали, cinematic hero сохранён. Новая `/about` (позиционирование + принципы, 4 локали) + в sitemap. E2E `tests/e2e/phase1.spec.ts`: публичные смоук (три входа, `/about`, `/v/[slug]` невалидный); три авторизованных критических пути — как `test.skip` (нужен засеянный тест-пользователь + storageState). typecheck/build(55 страниц)/unit(29)/lexicon зелёные. Runtime-прогон с реальным Supabase-env в этой среде недоступен (нет ключей) — опора на build+typecheck+e2e-спеки |

Критерии приёмки ТЗ §9 покрываются: 1→PR-2, 2→PR-10, 3→PR-8, 4→PR-6, 5–6→PR-9, 7→PR-7, 8→PR-1/3, 9→PR-6, 10→PR-12.

---

## 11.5. Adversarial code-review фазы 1 + правки (PR-14)

Прогнан многоагентный adversarial-review всего диффа (66 файлов, 10 миграций): 6 линз (SQL/RLS, security/authz, TS-корректность, AI-слой, Next/UI, кросс-срез) → находки → верификация. Реальные проблемы исправлены в **PR-14** (`20260712220000_review_fixes.sql` + правки кода), проверено на локальном Postgres:

- **stage-clobber:** `update_application_status` больше не перезаписывает `stage` (им владеет `set_application_stage`).
- **Терминальные гарды:** `update_application_status`/`set_application_stage`/`reject_application` уважают `withdrawn`/`hired` — отзыв кандидата нельзя «оживить», нанятого нельзя отклонить.
- **Утечка причины отказа:** `rejected_reason` больше не кладётся в событие, читаемое кандидатом (остаётся в колонке для работодателя).
- **Enforcement согласия у работодателя:** на доске откликов документы кандидата с отозванным согласием не отдаются; `analyzeCandidate` не запускается при отзыве.
- **Guardrails:** лексический фильтр сканирует и `quote`/`source` (не только text); расширены regex рекомендаций нанять/отказать.
- **Retention:** чистит и `withdrawn`-кандидатов (не только rejected).
- **Ручные напоминания:** окно кандидатов расширено до 90 дней (offset > 30 теперь срабатывает).
- **Отзыв согласия в UI:** доступен кандидату и после отказа/найма (право на защиту данных).
- **PR-13 сужен:** отзыв грантов — только у `anon` (снят HIGH-риск поломки Doki.id; authenticated-гранты сохранены, cross-tenant блокирует WITH CHECK).
- **Мелочи:** проверка ошибки при обновлении `current_version_id`.

Принято как есть (с обоснованием): redaction-политика — дормант-гард под будущий анализ документов кандидата (self-recognition в vault — собственный approved-сценарий пользователя; включать её в classify = ломать распознавание паспортов); единая соль share-паролей и client-side `version_no` — допустимо для phase 1 (низкая ценность/редкость).

## 11.6. Судьба существующей документации

- `docs/01…08-*.md`, `docs/schema.sql` — история контура A (family vault); остаются как контекст, источником правды по схеме объявляются миграции (после PR-1 добавить пометку в README).
- `docs/roadmap/sprint0-audit.md` — предшественник этого аудита по контуру B; не противоречит, поглощён.
- `docs/dokihel/vacancies/create-vacancy/job-profile.md` — O*NET-модель JobProfile: прямой вход для Discovery/Structuring (PR-8), сохраняет актуальность.
- `docs/launch-russia.md` — регуляторный контекст (152-ФЗ, локализация, провайдеры AI); учитывать при выборе провайдера в `lib/ai/`, в redaction policy и при DPIA (аудит-перспектива §3.2).
- Канонические документы добавлены в репозиторий: `docs/ARCHITECTURE.md` (Архитектура v1.1 — источник продуктовых границ), `docs/tz-phase1.md` (ТЗ фазы 1), `docs/architecture-perspective.md` (аудит и перспектива). Иерархия по v1.1 §16: репозиторий — источник технической истины, `ARCHITECTURE.md` — источник продуктовых границ, детальные ТЗ — отдельные task-документы.

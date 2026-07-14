# Career FEATURE_DIFF — v2-hardening backport (T1)

Источник v2-кода: `parkourcafe/Doki.id` (apply-doki). Канон: `parkourcafe/mydoki` (doki.help).
Общая живая БД: Supabase `uuopxzlcmzdtwebottar` (оба деплоя читают её сегодня).

Флаги: **DB** — объект уже в общей БД; **Code (before)** — был ли код в mydoki до этого PR.

| v2-фича | Файлы (apply-doki) | DB | Code (before) | Статус в этом PR |
|---|---|:--:|:--:|---|
| Turnstile (серверная проверка `cf-turnstile-response`) | `lib/antispam.ts` | — | ❌ | Перенесён `lib/antispam.ts`; виджет в `ApplyForm` (guard по `NEXT_PUBLIC_TURNSTILE_SITE_KEY`) |
| Rate-limit ≤5 откликов/час по `ip_hash` | `precheck_application` / `submit_application` | ✅ | ❌ | `precheckApplication` перед загрузкой + backstop в `submit_application` |
| Анти-дубль: один WhatsApp = один отклик на вакансию | `precheck_application`, constraint `uq_application_per_phone` | ✅ | ❌ | precheck + backstop; дубль возвращает существующий `access_token` |
| Письмо работодателю о новом отклике (Resend) | `lib/email.ts` | — | ❌ | `lib/email.ts` (EN/ID), `NOTIFY_FROM_EMAIL`→fallback `ALERT_EMAIL_FROM`; ошибка письма не роняет подачу |
| `?src` → `applications.source` | apply page + `parseSource` | ✅ | ❌ | `parseSource` в `lib/career.ts`, проброс `source` в форму и submit |
| `vacancies.views_count` + `increment_vacancy_views` | apply page RPC | ✅ | ❌ | `incrementVacancyView` server action, вызов из формы с дедупом по `sessionStorage` (reload не удваивает) |
| `claim_application` + `/apply/claim/[token]` | claim page + `claimApplication` | ✅ | ❌ | Перенесены; копирование файлов в vault выверено по реальной схеме mydoki (`documents`/`document_files`/`members`) |
| v2-миграция (описание схемы в репо) | `20260702000000_career_mvp_v2.sql` | ✅ применена | ❌ | Файл скопирован в `supabase/migrations/`; идемпотентен (`IF NOT EXISTS`/`CREATE OR REPLACE`) — новой схемы не вводит |
| Домен `doki.id` на том же деплое | — | — | ❌ | Host-based middleware: `/` → `/hiring`, не-карьерные пути → 308 на doki.help (D1/D2); лендинг `/hiring` |

## Что НЕ переносилось (вне T1)
- Библиотеки готовых вопросов/документов и переключатель языка — доп.фичи apply-doki, **не** часть v2-хардненинга.
- Reuse-loop (автозаполнение из профиля, «прикрепить из vault») — рост, вне списка T1.

## Инфра (вручную, вне кода)
Env в Vercel-проекте mydoki: `TURNSTILE_SECRET_KEY`, `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `RESEND_API_KEY`, `NOTIFY_FROM_EMAIL`, `ADMIN_ALERT_EMAIL` (для T4), `IP_HASH_SALT`, `SUPABASE_SERVICE_ROLE_KEY` (для claim-копирования). Привязка домена `doki.id`, DNS, заморозка apply-doki.

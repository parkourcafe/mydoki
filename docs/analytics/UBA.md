# User Behavior Analytics (UBA) — step by step

Как устроена аналитика поведения в doki.help и как её развернуть в PostHog по
шагам. Инструмент — **PostHog** (`lib/analytics.ts`), события — типизированный
каталог `lib/events.ts`.

Приватность: `track()` вырезает PII из свойств (`name/email/phone/token/…`);
в нативной iOS-обёртке сторонняя аналитика **отключена** (см.
`docs/app-store/PRIVACY.md`).

---

## Шаг 0. Что уже сделано в коде (foundation)

- **Типизированный каталог событий** — `lib/events.ts` (`EventMap` + `trackEvent`).
  Единый источник имён/свойств; новые события шлём только через `trackEvent`.
- **Identify** — `identify()` / `resetIdentity()` в `lib/analytics.ts`.
  Подключено в `/my` и `/employer` layout'ах (`components/IdentifyUser.tsx`) и
  сбрасывается на выходе (`components/SignOutButton.tsx`). Теперь сессии
  связаны со стабильным `auth.users.id` → доступны ретеншн/воронки «по юзеру».
- **Автозахват** ($pageview, клики) — включён в `initPostHog()`.

## Шаг 1. Таксономия событий (канон)

Именование: `snake_case`, «объект_действие» в прошедшем времени. Полный список —
в `lib/events.ts`. Ключевые:

| Домен | Событие | Ключевые свойства | Статус в коде |
|---|---|---|---|
| Аккаунт | `signed_up`, `logged_in` | `method` | ✅ есть |
| Сейф | `document_added` | `category`, `via` | ✅ есть |
| Сейф | `member_added` | — | ✅ есть |
| Сейф | `reminder_set` | `doc_category` | ✅ есть |
| Сейф | `document_shared` | `kind`, `expires_days` | ✅ пакет (link — ⬜) |
| Сейф | `document_exported` | — | ⬜ |
| Вакансии | `vacancy_create_started`→`vacancy_published` | см. `EventMap` | ✅ есть (T11) |
| Отклик | `vacancy_viewed`→`application_submitted` | `vacancy_id` | ✅ есть |
| Отклики | `application_status_changed`, `whatsapp_clicked` | `vacancy_id` | ✅ есть |

## Шаг 2. Ключевые воронки (строятся в PostHog → Product analytics → Funnels)

1. **Активация сейфа** (главная воронка ценности):
   `$pageview (/my)` → `member_added` → `document_added` → `reminder_set`
   → `document_shared`. Метрика: доля дошедших до `document_added` за 7 дней.
2. **Работодатель — публикация вакансии** (T11):
   `vacancy_create_started` → (`vacancy_template_selected` **или**
   `vacancy_ai_draft_applied`) → `vacancy_published`. Сравнить конверсию по
   свойству `source` (template vs ai_freeform vs manual) — это kill/keep-метрика
   AI-слоя из DEV_TASK §10.
3. **Кандидат — отклик:**
   `vacancy_viewed` → `application_started` → `document_uploaded` →
   `application_submitted`. Разбивка по `src` (wa/ig/qr/direct).

Для каждой воронки: окно конверсии 7 дней, разбивка (breakdown) по важному
свойству (`source`, `src`, `category`).

## Шаг 3. Retention (PostHog → Retention)

- **Returning-retention:** первое действие `document_added`, возврат — любое
  `$pageview`. Смотрим недельные когорты (W0…W6).
- Отдельно для работодателей: первое `vacancy_published`, возврат —
  `application_status_changed` (работают ли с откликами).

## Шаг 4. Когорты (PostHog → Cohorts)

- **Активированные:** совершили `document_added` ≥ 1.
- **Работодатели:** совершили `vacancy_published` ≥ 1.
- **Спящие:** были активны > 14 дней назад и не заходили 14 дней (для
  ре-энгейджмент-пушей через `native_push_tokens`).

## Шаг 5. Что доинструментировать (чеклист)

Добавляйте только через `trackEvent(...)` из `lib/events.ts`.

- [x] `signed_up` / `logged_in` — success-based, через одноразовый флаг `?ev=`
  (login/signup actions + OAuth callback → `components/AnalyticsEvents.tsx`).
  `method` = email | google.
- [x] `member_added` — `createMember` редиректит на `/my?ev=member_added`,
  флаг читает `AnalyticsEvents`.
- [x] `reminder_set` — в `DocumentForm`, когда указан срок действия (`expires_at`).
- [x] `document_shared` — в `SharePackageManager` после успешного создания
  пакета (`kind: "package"`, `expires_days`).
- [ ] `document_shared` для одиночного документа (`kind: "link"`) — поток в
  `app/my/documents/[id]` (одиночный share ещё не инструментирован).
- [ ] `document_exported` — в экспорте (`/my/export`).
- [ ] (нативный) `document_added.via = "camera"` — когда добавление шло через
  `captureDocument()` (`lib/native.ts`).

## Шаг 6. Дашборд (PostHog → Dashboards → New)

Соберите один дашборд «North Star» с тайлами:
1. Активные пользователи (DAU/WAU) — insight по `$pageview`, unique users.
2. Воронка активации сейфа (Шаг 2.1).
3. Воронка публикации вакансии с breakdown по `source` (Шаг 2.2).
4. Retention активированных (Шаг 3).
5. Топ-события (Trends, все события, за 30 дней) — контроль, что ничего не
   «отвалилось».

## Шаг 7. Проверка корректности

- PostHog → **Activity/Live events**: выполните сценарий (добавьте документ) и
  убедитесь, что `document_added` приходит с ожидаемыми свойствами и **без PII**.
- Проверьте, что событие привязано к персоне (identify сработал): в Live events
  у события должен быть ваш `auth.users.id`, а не случайный anonymous id.
- В нативном приложении событий PostHog быть **не должно** (аналитика выключена).

---

### Замечание про мёрж
Хуки identify живут в `app/my/layout.tsx`, `app/employer/layout.tsx`,
`components/SignOutButton.tsx`, `components/IdentifyUser.tsx` этой ветки.
Прод сейчас новее — при мёрже перенесите identify-хуки и `lib/events.ts`/
`lib/analytics.ts` изменения.

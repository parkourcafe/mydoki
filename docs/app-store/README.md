# doki.help → App Store

Подготовка iOS-приложения для публикации в App Store. Приложение — нативная
обёртка (Capacitor) вокруг живого сайта `www.doki.help` с реальными нативными
возможностями (Face ID-замок, APNs-push, камера, статус-бар/сплэш).

## Что уже сделано в репозитории
- `capacitor.config.ts` — конфиг обёртки (hosted `server.url`, iOS-настройки).
- `lib/native.ts` — мост нативных возможностей (детект платформы, статус-бар,
  сплэш, APNs-регистрация, Face ID, камера). No-op в вебе.
- `components/NativeGate.tsx` — Face ID-замок хранилища, подключён в
  `app/layout.tsx`.
- `app/api/native/push-token/route.ts` + миграция `native_push_tokens` —
  приём/хранение APNs-токенов.
- apple-мета в `app/layout.tsx` (viewport-fit cover, apple-touch-icon, статус-бар).
- Исходники иконки/сплэша в `assets/` (`icon.svg`, `splash.svg`, `splash-dark.svg`).
- npm-скрипты `cap:*` в `package.json`.

## Документы
| Файл | Назначение |
|---|---|
| **RUNBOOK.md** | Пошагово: от `npm ci` до Submit for Review (шаги на Mac/Xcode). |
| **LISTING.md** | Тексты карточки: имя, subtitle, описание (EN/RU), ключевые слова, категории, URL. |
| **PRIVACY.md** | App Privacy (nutrition labels), Info.plist-строки, развилки по трекингу/ATT и AI. |
| **REVIEW.md** | Заметки ревьюеру (Guideline 4.2), демо-аккаунт, план и размеры скриншотов. |

## Что остаётся сделать вам (вне этой среды)
1. На Mac пройти **RUNBOOK.md** (создать `ios/`, иконки, Xcode-подпись,
   capabilities, архив, загрузка).
2. Применить миграцию `native_push_tokens` к прод-БД.
3. Реализовать **отправку** APNs в кроне напоминаний (приём токенов готов).
4. Принять решения из **PRIVACY.md** (аналитика/трекинг, AI-провайдер).
5. Заполнить карточку и **App Privacy**, залить скриншоты, указать демо-аккаунт,
   отправить на ревью.

Требуется: macOS + Xcode + активный Apple Developer Program.

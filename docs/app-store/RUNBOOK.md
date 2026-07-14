# doki.help iOS — Build & Submit Runbook

Практический чеклист: от репозитория до кнопки **Submit for Review** в App Store
Connect. Всё, что можно было подготовить в коде, уже сделано (Capacitor,
конфиг, нативный мост, apple-мета, исходники иконок, эндпоинт push-токенов).
Ниже — шаги, которые выполняются **только на macOS с Xcode** и в кабинетах Apple.

Архитектура: приложение серверное (Next.js SSR + Supabase-auth), поэтому
WebView грузит живой сайт (`server.url = https://www.doki.help`). Нативную
ценность дают плагины — Face ID-замок, APNs-push, камера/сканер, статус-бар и
сплэш (см. `lib/native.ts`, `components/NativeGate.tsx`).

---

## 0. Предпосылки (один раз)

- macOS + **Xcode** (последняя из App Store) + Command Line Tools.
- **CocoaPods**: `sudo gem install cocoapods` (или `brew install cocoapods`).
- Node 20+ и `npm ci` в корне репозитория.
- **Apple Developer Program** (активная подписка, $99/год).
- Bundle ID: **`help.doki.app`** (значение `appId` в `capacitor.config.ts`).
  Если меняете — меняйте в обоих местах (конфиг + Xcode target → Signing).

## 1. Установить зависимости и создать iOS-проект

```bash
npm ci
npx cap add ios          # создаёт папку ios/ (Xcode-проект из шаблона)
```

> `ios/` намеренно НЕ в гите (см. `.gitignore`) — это генерируемый нативный
> проект. Пересоздаётся из `capacitor.config.ts` командой выше.

## 2. Сгенерировать иконки и сплэши

Исходники лежат в `assets/` (`icon.svg`, `splash.svg`, `splash-dark.svg`).

```bash
npm i -D @capacitor/assets   # ставится на Mac (нужен sharp/libvips)
npx capacitor-assets generate --ios
```

Это заполнит `AppIcon` (включая маркетинговую 1024×1024) и `Splash` в
`ios/App/App/Assets.xcassets`. Проверьте, что 1024-иконка **без прозрачности**
и без альфы (Apple отклоняет альфу в маркетинговой иконке — наш `icon.svg`
уже сплошной).

## 3. Синхронизировать веб-конфиг с нативным проектом

```bash
npx cap sync ios
cd ios/App && pod install && cd ../..
```

## 4. Настроить проект в Xcode

```bash
npx cap open ios
```

В Xcode (target **App**):

1. **Signing & Capabilities**
   - Team = ваша команда Apple Developer; включите *Automatically manage signing*.
   - Bundle Identifier = `help.doki.app`.
   - **+ Capability → Push Notifications**.
   - **+ Capability → Background Modes** → отметьте *Remote notifications*.
   - (Опц.) *Associated Domains* — если позже добавите universal links.
2. **Info.plist** — добавьте строки-обоснования доступа (иначе краш/reject):
   - `NSCameraUsageDescription` — «doki.help uses the camera to capture and
     add your documents.»
   - `NSPhotoLibraryUsageDescription` — «doki.help lets you attach documents
     from your photo library.»
   - `NSPhotoLibraryAddUsageDescription` — «doki.help can save documents to
     your photo library.»
   - `NSFaceIDUsageDescription` — «doki.help uses Face ID to lock your
     documents.»
3. **Deployment target**: iOS 14+ (Capacitor 6 min iOS 14).
4. **App Transport Security**: не отключайте. Весь трафик — HTTPS.
5. Версия/сборка: *General → Identity* → Version `1.0.0`, Build `1`.

## 5. APNs (пуш) — ключ и бэкенд

1. Apple Developer → **Certificates, IDs & Profiles → Keys → +** → включите
   *Apple Push Notifications service (APNs)* → скачайте **`AuthKey_XXXX.p8`**
   (скачивается ОДИН раз). Запишите **Key ID** и **Team ID**.
2. Секреты на сервере (Vercel env): `APNS_KEY_ID`, `APNS_TEAM_ID`,
   `APNS_BUNDLE_ID=help.doki.app`, `APNS_PRIVATE_KEY` (содержимое .p8),
   `APNS_PRODUCTION=true`.
3. Клиент уже регистрируется и шлёт токен на `POST /api/native/push-token`
   (см. `lib/native.ts`); токены хранятся в таблице `native_push_tokens`
   (миграция `supabase/migrations/20260714000000_native_push_tokens.sql`).
   **Не забудьте применить миграцию к прод-БД** (`supabase db push` или через
   панель) — она additive и безопасна.
4. Отправку APNs подключите в существующую рассылку (крон напоминаний
   `app/api/cron/reminders`): для каждого получателя выберите его
   `native_push_tokens` и отправьте через APNs (библиотека `apns2`/`node-apn`
   с JWT из .p8). Это единственная нереализованная серверная часть — см.
   TODO в `PRIVACY.md`/`REVIEW.md`.

## 6. Прогон на устройстве

- Подключите iPhone, выберите его как таргет, **Run**. Проверьте:
  - открывается живой сайт, логин Google/Supabase работает внутри приложения;
  - Face ID-замок появляется на старте и после сворачивания > 60 c;
  - камера открывается при добавлении документа;
  - push: разрешение запрашивается, тестовый пуш доходит.

## 7. Архив и загрузка

1. Target устройства = **Any iOS Device (arm64)**.
2. **Product → Archive** → Organizer → **Distribute App → App Store Connect →
   Upload**.
3. Дождитесь обработки билда в App Store Connect (10–30 мин).

## 8. App Store Connect — карточка и отправка

1. **My Apps → +** → New App: платформа iOS, имя, Bundle ID `help.doki.app`,
   SKU (любой уникальный, напр. `doki-help-ios`).
2. Заполните карточку по **`LISTING.md`** (имя, subtitle, описание, ключевые
   слова, категории, URL поддержки/маркетинга, возрастной рейтинг).
3. **App Privacy** — заполните по **`PRIVACY.md`**.
4. Загрузите скриншоты по **`REVIEW.md`** (раздел Screenshots).
5. Прикрепите обработанный билд.
6. **App Review Information** — демо-аккаунт и заметки ревьюеру из
   **`REVIEW.md`** (критично для прохождения Guideline 4.2).
7. **Submit for Review**.

---

## Локальная отладка против дев-сервера (опционально)

```bash
CAP_SERVER_URL="http://192.168.1.50:3000" npx cap sync ios
```

`capacitor.config.ts` читает `CAP_SERVER_URL` для `server.url`; по умолчанию —
`https://www.doki.help`. Для http-адреса на iOS понадобится временно включить
ATS-исключение (не коммитить).

## Обновления приложения

Так как контент грузится с сайта, **изменения веб-части появляются в приложении
сразу после деплоя `www.doki.help`** — без нового билда App Store. Новый билд
нужен только при изменении нативной части (плагины, иконки, capabilities,
Info.plist, версия).

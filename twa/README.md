# Публикация в Google Play через TWA (T10)

doki.help — это PWA, а Google Play принимает её как приложение через **TWA**
(Trusted Web Activity): тонкую Android-обёртку, которая открывает сайт в
полноэкранном режиме без адресной строки. Никакого второго кода — приложение
это и есть doki.help.

## Что уже готово в коде ✅
- **Манифест** `app/manifest.ts` — `display: standalone`, иконки 192/512 (+maskable), `theme_color`, `start_url: /my`.
- **Иконки** генерируются роутами `app/icon-192`, `app/icon-512`, `apple-icon`.
- **Service worker** `public/sw.js` (пуши T9 переносятся в TWA без изменений).
- **Digital Asset Links** — роут `/.well-known/assetlinks.json`, значения из env (см. ниже).

## Что нужно сделать (твоя часть)

### 1. Собрать TWA через Bubblewrap
На своём компьютере (нужен Node + JDK):
```bash
npm i -g @bubblewrap/cli
bubblewrap init --manifest https://www.doki.help/manifest.webmanifest
# ответь на вопросы: package name (напр. help.doki.twa), имя, цвета — подтягиваются из манифеста
bubblewrap build
```
На выходе: `app-release-signed.aab` (для загрузки в Play) и keystore с ключом подписи.

### 2. Взять SHA-256 отпечаток(ки)
```bash
# отпечаток твоего upload-ключа:
keytool -list -v -keystore android.keystore -alias android | grep SHA256
```
Позже, когда включишь **Play App Signing**, Google покажет **второй** отпечаток
(ключ подписи Google) в Play Console → Setup → App integrity. **Нужны оба.**

### 3. Прописать env в Vercel-проекте mydoki
Settings → Environment Variables:

| Переменная | Значение |
|---|---|
| `TWA_PACKAGE_NAME` | `help.doki.twa` (тот же, что в Bubblewrap) |
| `TWA_SHA256_CERT_FINGERPRINTS` | оба отпечатка через запятую: `AA:BB:…,CC:DD:…` |

→ **Redeploy**. Проверь, что открывается `https://www.doki.help/.well-known/assetlinks.json`
и в нём твой package + отпечатки (а не пустой `[]`).

Быстрая проверка связки: [Statement List Tester](https://developers.google.com/digital-asset-links/tools/generator)
— вставь `https://www.doki.help` и package name → должно быть «success».

### 4. Загрузить в Play Console
1. Play Console → Create app → залей `.aab`.
2. Заполни листинг (описание, иконка 512, скриншоты телефона, категория, политика конфиденциальности → ссылка `https://www.doki.help/privacy`).
3. Внутреннее тестирование → добавь свой аккаунт → установи → проверь, что **адресной строки нет** (значит assetlinks сошёлся).
4. Если сверху видно URL-бар — assetlinks не прошёл: перепроверь env-отпечатки и что оба ключа добавлены.

## Частые грабли
- **Адресная строка не исчезает** → отпечаток в `assetlinks.json` не совпадает с ключом, которым реально подписан AAB. После включения Play App Signing добавь и отпечаток Google.
- **`start_url: /my`** ведёт на логин, если не авторизован — это ок; TWA откроет вход, дальше сессия сохраняется.
- **Обновления контента** не требуют новой версии в Play — TWA грузит живой сайт. Новый AAB нужен только при смене иконки/имени/пакета.

## Мини-чек-лист запуска
- [ ] `bubblewrap build` → `.aab` собран
- [ ] SHA-256 upload-ключа получен
- [ ] `TWA_PACKAGE_NAME` + `TWA_SHA256_CERT_FINGERPRINTS` в Vercel, redeploy
- [ ] `/.well-known/assetlinks.json` отдаёт package + отпечатки
- [ ] Statement List Tester = success
- [ ] `.aab` в Play Console, internal testing без адресной строки
- [ ] После Play App Signing — добавить второй отпечаток Google

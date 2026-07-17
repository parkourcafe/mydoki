# Сборка и публикация RuStore

## Идентификаторы

- Package name: `help.doki.twa`
- App name: `DOKI HELP`
- Version name: `1.0.1`
- Version code: `2`
- Min SDK: `23`
- Target/compile SDK: `35`
- User-Agent: `DokiHelpAndroid/RU/1.0`

SHA-256 сертификата сверяется с сохранённым значением в защищённом менеджере релизов. Сам ключ, alias и пароли не должны попадать в Git, документацию или чат.

## Подготовка

```bash
npm ci
npm run cap:sync:android:ru
npm run cap:assets:android:ru
```

Для QA по текущему сайту дополнительных переменных не требуется. Для production после миграции на российскую инфраструктуру:

```bash
CAP_RUSTORE_SERVER_URL=https://<production-ru-host>/ru/login?next=/my \
  npm run cap:sync:android:ru
```

## Подпись

1. Поместить существующий Android-ключ DOKI в `android/app/signing.keystore`.
2. Скопировать `android/keystore.properties.example` в `android/keystore.properties`.
3. Заполнить значения из защищённого хранилища.
4. Не отправлять эти два файла в Git. Они исключены через `.gitignore`.

Release-сборка намеренно завершается ошибкой, если подпись не настроена.

## Сборка

```bash
cd android
./gradlew clean bundleRelease assembleRelease
```

Результаты:

```text
android/app/build/outputs/apk/release/app-release.apk
android/app/build/outputs/bundle/release/app-release.aab
```

RuStore принимает APK и AAB. Для текущей первой загрузки проще использовать подписанный APK; AAB требует предварительно добавить подпись приложения в RuStore Консоли.

## Проверка APK

```bash
$ANDROID_HOME/build-tools/35.0.0/aapt dump badging \
  android/app/build/outputs/apk/release/app-release.apk

$ANDROID_HOME/build-tools/35.0.0/aapt dump permissions \
  android/app/build/outputs/apk/release/app-release.apk

$ANDROID_HOME/build-tools/35.0.0/apksigner verify --print-certs \
  android/app/build/outputs/apk/release/app-release.apk
```

Ожидается:

- package `help.doki.twa`;
- version code `2`, version name `1.0.1`;
- min SDK `23`, target SDK `35`;
- только INTERNET, биометрия и внутреннее signature permission;
- SHA-256 сертификата совпадает с предыдущей Android-сборкой.

## Локальные проверенные артефакты

```text
artifacts/rustore/DOKI-HELP-RuStore-1.0.1-vc2.apk
artifacts/rustore/DOKI-HELP-RuStore-1.0.1-vc2.aab
artifacts/rustore/icon-512.png
```

Хэши QA-сборки от 17 июля 2026 года:

```text
APK  578c6109de0bf9d46d9d15d33721a74eb8e76ecc65fbc436e882ec6c6dd7acb8
AAB  ae0452377fc790304d1519a3d804b3042fe5a6f4c6c9da90760cc502d96ccfe9
```

Production-сборка после смены российского host будет иметь другие хэши.

## Порядок в RuStore Консоли

1. Создать приложение `DOKI HELP`.
2. Нажать «Загрузить версию» и выбрать универсальную мобильную версию, не ТВ.
3. Загрузить APK или настроить AAB-подпись и загрузить AAB.
4. Дождаться обработки файла, не закрывая страницу во время загрузки.
5. Заполнить «Что нового» и безопасность данных.
6. Вставить тексты из `STORE_LISTING_RU.md`.
7. Загрузить `icon-512.png` и 1–10 актуальных русских Android-скриншотов.
8. Указать контакты и готовую отдельную политику RuStore.
9. Добавить тестовый email/пароль в комментарий модератору.
10. Перед отправкой подтвердить все пункты `LEGAL_AND_RESIDENCY_GATE.md`.
11. Только после GO нажать «Отправить на модерацию».

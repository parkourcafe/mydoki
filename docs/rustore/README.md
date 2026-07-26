# DOKI HELP для RuStore

Статус на 17 июля 2026 года: **техническая QA-сборка готова; публичный релиз заблокирован юридической и инфраструктурной подготовкой**.

## Что готово

- Android package: `help.doki.twa`.
- Версия: `1.0.1`, version code `2`.
- Минимальная версия: Android 6.0 (API 23).
- Target SDK: API 35.
- Сохранена подпись ранее созданного Android-приложения DOKI.
- Русский интерфейс включается для RuStore по User-Agent.
- Вакансии, кабинет работодателя, медицинские документы и AI отключены.
- Доступны личные и семейные документы, сроки, камера, биометрическая блокировка, защищённые ссылки и удаление аккаунта.
- Google OAuth скрыт; для модерации используется самостоятельный вход по email и паролю.
- Удалены push-уведомления и неиспользуемые Android permissions.

## Что нельзя делать сейчас

Нельзя отправлять эту сборку в публичный production с реальными персональными данными граждан РФ. Текущая серверная часть использует `doki.help`, Vercel и Supabase, а действующая политика прямо допускает зарубежное хранение. До релиза необходимо закрыть [юридический и инфраструктурный gate](./LEGAL_AND_RESIDENCY_GATE.md).

Для внутреннего QA используйте только вымышленные тестовые данные и документы.

## Файлы

- Тексты карточки: [STORE_LISTING_RU.md](./STORE_LISTING_RU.md)
- Декларация данных: [DATA_SAFETY_RU.md](./DATA_SAFETY_RU.md)
- Сборка и загрузка: [RELEASE_RUNBOOK.md](./RELEASE_RUNBOOK.md)
- Юридические блокеры: [LEGAL_AND_RESIDENCY_GATE.md](./LEGAL_AND_RESIDENCY_GATE.md)

Локальные бинарные файлы создаются в `artifacts/rustore/`. Папка исключена из Git.

## Официальные требования

- [Публикация приложения в RuStore](https://www.rustore.ru/help/developers/publishing-and-verifying-apps/app-publication)
- [Требования к приложениям RuStore](https://www.rustore.ru/help/developers/publishing-and-verifying-apps/requirement-apps)
- [Федеральный закон № 152-ФЗ](https://ips.pravo.gov.ru/api/ips/legislation/document?baseid=None&hash=98490812b3409e2a8d78a11ca9010f434ea3d9250a11dbbdb78690cd5551bdd6)


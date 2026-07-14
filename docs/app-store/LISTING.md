# App Store Connect — Listing metadata

Готовые тексты для карточки приложения. Английский — основная локализация,
русский — дополнительная (App Store Connect → App Information → добавить
Russian). Лимиты Apple указаны в скобках; тексты уже в них укладываются.

> Продукт позиционируем как **личный/семейный сейф документов** (это и есть
> идентичность приложения в `manifest.ts`/метаданных). Карьерную часть сайта в
> карточке не выпячиваем, чтобы не размывать ценностное предложение.

---

## App name (30) 
`doki.help — Document Vault`

## Subtitle (30)
- EN: `Family documents & reminders`
- RU: `Документы семьи и напоминания`

## Promotional text (170, можно менять без ревью)
- EN: `Keep passports, IDs, medical and travel documents for the whole family
  in one secure place — with reminders before anything expires.`
- RU: `Паспорта, удостоверения, медицинские и дорожные документы всей семьи в
  одном защищённом месте — с напоминанием до истечения срока.`

## Description (4000)

**EN**
```
doki.help is a private vault for your family's important documents.

Passports, IDs, visas, diplomas, medical results, insurance, property papers —
keep them all in one place, on any device, and never dig through chats or an
old phone again.

WHAT YOU GET
• One secure home for every family member's documents
• Expiry reminders — get a heads-up before a passport, visa or insurance lapses
• Face ID lock — your documents stay private if your phone is lost
• Offline access — save what you need and open it with no signal
• Secure sharing — send a single document via a link that expires and can be
  revoked, with view limits and a watermark
• Capture with the camera — add a document straight from your phone
• Family profiles — keep every member's papers organized separately

PRIVATE BY DESIGN
• Files live in private storage and are served only via short-lived links
• Access is isolated per family at the database level
• Two-factor sign-in and new-device email alerts
• We never sell your data or use it for advertising
• Optional AI recognition is strictly opt-in — off by default

doki.help is in active development and does not replace keeping your own backup
of the truly important originals.
```

**RU**
```
doki.help — приватный сейф для важных документов вашей семьи.

Паспорта, удостоверения, визы, дипломы, медицинские результаты, страховки,
документы на имущество — всё в одном месте, на любом устройстве. Больше не
нужно искать по чатам и старым телефонам.

ЧТО ВНУТРИ
• Одно защищённое место для документов каждого члена семьи
• Напоминания о сроках — предупредим до истечения паспорта, визы, страховки
• Замок по Face ID — документы под защитой, даже если телефон потерян
• Офлайн-доступ — сохраните нужное и открывайте без интернета
• Безопасная отправка — один документ по истекающей ссылке с отзывом,
  лимитом просмотров и водяным знаком
• Съёмка камерой — добавьте документ прямо с телефона
• Профили семьи — документы каждого разложены отдельно

ПРИВАТНОСТЬ ПО УМОЛЧАНИЮ
• Файлы в приватном хранилище, отдаются только по коротким ссылкам
• Доступ изолирован по семье на уровне базы данных
• Двухфакторный вход и письмо при входе с нового устройства
• Мы не продаём ваши данные и не используем их для рекламы
• AI-распознавание — строго по вашему согласию, по умолчанию выключено

doki.help активно развивается и не заменяет ваш собственный резервный архив
по-настоящему важных оригиналов.
```

## Keywords (100 символов, через запятую, без пробелов после запятой)
- EN: `documents,vault,passport,visa,reminder,family,ID,expiry,storage,scan,insurance,secure,offline`
- RU: `документы,сейф,паспорт,виза,напоминание,семья,срок,хранение,скан,страховка,архив,офлайн`

## Categories
- Primary: **Productivity**
- Secondary: **Utilities**

## URLs
- Support URL: `https://www.doki.help/` (или отдельная страница поддержки; в
  крайнем случае — mailto через страницу). Support-email: `support@doki.help`.
- Marketing URL: `https://www.doki.help/`
- Privacy Policy URL (обязателен): `https://www.doki.help/privacy`

## Copyright
`2026 doki.help`

## Age rating
Ответы на анкету → ожидаемый рейтинг **4+** (нет нежелательного контента,
насилия, азартных игр). Пользовательский контент — приватный, не публикуется
и не модерируется как UGC (документы видит только сам пользователь/семья),
поэтому UGC-вопросы Apple можно отвечать «нет публично доступного
пользовательского контента».

## App Store icon
Берётся из билда (сгенерирован `@capacitor/assets` из `assets/icon.svg`,
1024×1024, без альфы).

## Localizations
Как минимум English (U.S.) + Russian. При желании — Indonesian: тексты можно
взять из существующих `META.id` в `app/layout.tsx`.

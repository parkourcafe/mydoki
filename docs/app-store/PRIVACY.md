# App Privacy (nutrition labels) + iOS privacy requirements

Заполняется в App Store Connect → **App Privacy**. Ниже — сопоставление с тем,
что приложение реально собирает (по коду и инфраструктуре). Пункты, помеченные
⚠️ **РЕШИТЬ**, требуют подтверждения командой/юристом до отправки.

Privacy Policy URL (обязателен): **https://www.doki.help/privacy**

---

## Собираемые типы данных → как отвечать

| Data type | Собираем? | Linked to user | Used for tracking | Назначение | Источник в приложении |
|---|---|---|---|---|---|
| **Email address** | Да | Да | Нет | App Functionality (аккаунт, вход, письма-напоминания) | Supabase Auth, `employer_profiles.contact_email` |
| **Name** | Да | Да | Нет | App Functionality | `members.full_name`, `applications.full_name` |
| **Phone number** | Да | Да | Нет | App Functionality (контакт, WhatsApp) | `contact_whatsapp`, `applications.whatsapp` |
| **Photos / User content (документы, файлы)** | Да | Да | Нет | App Functionality (хранение документов) | Storage bucket + `documents`/`document_files` |
| **Other user content** (заметки, метаданные документов) | Да | Да | Нет | App Functionality | `documents.notes/title/...` |
| **User ID** | Да | Да | Нет | App Functionality | `auth.users.id` |
| **Product interaction / Usage data** | Да (ограниченно) | Нет | Нет | Analytics | Vercel Analytics (first-party). Яндекс.Метрика и PostHog в нативе ОТКЛЮЧЕНЫ |
| **Diagnostics / Performance** | Возможно | Нет | Нет | Analytics | Vercel Analytics |
| **Coarse/precise location** | Нет | — | — | — | не собирается |
| **Payment info** | Нет | — | — | — | приложение бесплатное, оплат нет |
| **Contacts (адресная книга)** | Нет | — | — | — | не читаем |

### ✅ Аналитика и «Tracking» / ATT — решено в коде
Сторонние аналитики **Яндекс.Метрика** и **PostHog** внутри нативной обёртки
**отключены**. Реализация: обёртка добавляет метку `dokiNativeApp` в User-Agent
(`appendUserAgent` в `capacitor.config.ts`), а сервер по ней не рендерит эти
трекеры (`lib/isNativeRequest.ts` → `app/layout.tsx`). Гейтинг **серверный**,
поэтому скрипты не попадают даже в SSR-разметку приложения.
- Остаётся только **Vercel Web Analytics** — first-party, без cookies, без
  кросс-сайтового профилирования и рекламы.
- Итог: корректный ответ в App Privacy — **Not Used to Track**, и **ATT-промпт
  не нужен** (`NSUserTrackingUsageDescription` не требуется).
- Проверка после сборки: открыть приложение → в сетевых запросах WebView НЕ
  должно быть обращений к `mc.yandex.ru` и `*.posthog.com`.
- Примечание: гейтинг живёт в `app/layout.tsx` этой ветки. Прод-`layout.tsx`
  сейчас новее — при мёрже перенесите туда `isNativeRequest()`-проверку.

### ⚠️ РЕШИТЬ #2 — AI-распознавание документов (передача третьей стороне)
Опциональная функция распознавания отправляет **изображение документа**
стороннему AI-провайдеру (GLM/z.ai или Anthropic — см. `lib/llm.ts`,
`lib/classify.ts`). Функция **выключена по умолчанию и включается только
пользователем**.
- В App Privacy это раскрывается как передача **User Content** третьей стороне
  для цели **App Functionality**.
- В Privacy Policy (`/privacy`) должно быть явно указано: какой провайдер, что
  передаётся, сколько хранится. В коде уже стоит TODO об уточнении провайдера —
  **закройте его перед публичным заявлением**.

---

## Обязательные строки Info.plist (иначе краш/reject)

| Ключ | Текст (пример) |
|---|---|
| `NSCameraUsageDescription` | doki.help uses the camera to capture and add your documents. |
| `NSPhotoLibraryUsageDescription` | doki.help lets you attach documents from your photo library. |
| `NSPhotoLibraryAddUsageDescription` | doki.help can save documents to your photo library. |
| `NSFaceIDUsageDescription` | doki.help uses Face ID to lock your documents. |

`NSUserTrackingUsageDescription` **не нужен** — сторонний трекинг в нативе
отключён (см. раздел выше).

## Что НЕ используется (для чистых ответов Apple)
- Нет рекламных SDK, нет IDFA, нет покупок в приложении.
- Нет доступа к геолокации, контактам, микрофону, календарю.
- Push — транзакционный (напоминания о сроках, новые отклики), не маркетинговый
  по умолчанию.

## Серверная TODO (не блокирует ревью, но нужно для работы push)
Отправка APNs из крона напоминаний ещё не реализована — есть только приём и
хранение токенов (`/api/native/push-token`, таблица `native_push_tokens`).
Подключение отправки описано в `RUNBOOK.md` §5.

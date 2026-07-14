# App Review notes + Screenshots

## App Review Information (заполнить в App Store Connect перед Submit)

### Demo account (обязательно — иначе reject)
Приложение требует вход. Заведите тестовый аккаунт и укажите:
- **Username / email:** `<demo@doki.help>` ⚠️ создать и вписать реальные
- **Password:** `<…>` ⚠️ вписать
- Если вход по коду/2FA — либо отключите 2FA для демо-аккаунта, либо приложите
  инструкцию, как ревьюер получит код (например, укажите, что код приходит на
  этот же email, доступ к которому есть).

### Notes for the Reviewer (шаблон — вставить в поле Notes)

```
doki.help is a private document vault for families. The app is a native iOS
client (Capacitor) around our web service and adds native capabilities beyond a
website:

• Face ID / Touch ID lock — the vault is locked on launch and after returning
  from background (tap Unlock on the lock screen).
• Native camera capture — when adding a document you can take a photo or scan
  it directly (Camera permission).
• Push notifications — transactional reminders before a document (passport,
  visa, insurance) expires.
• Offline handling and native status bar / splash.

How to test:
1. Sign in with the demo account above.
2. On launch you will see the Face ID lock screen — authenticate to enter.
3. Open a family member and add a document via the camera to see native capture.
4. Documents, reminders and secure sharing are the core functionality.

No paid features. All content is private to the signed-in user; there is no
public user-generated content. AI document recognition is off by default and
strictly opt-in in settings.
```

> Это прямо адресует **Guideline 4.2 (Minimum Functionality)** — самая частая
> причина отклонения web-обёрток. Нативные фичи реальны (см. `lib/native.ts`,
> `components/NativeGate.tsx`), а не декоративны.

### Sign-in required? → Yes. Content rights? → у вас есть права на весь контент.

---

## Screenshots

### Настройка перед съёмкой
Рекомендуется собрать приложение как **iPhone-only** (Xcode → target → General
→ *Supported Destinations* оставить iPhone; или *Targeted Device Family =
iPhone*). Тогда **не нужны iPad-скриншоты**. Если оставляете универсальным —
добавьте набор iPad 12.9"/13".

### Требуемые размеры (портрет)
| Устройство | Разрешение (px) | Обязательно |
|---|---|---|
| iPhone 6.7"/6.9" (напр. 15/16 Pro Max) | **1290 × 2796** | **Да** (основной набор) |
| iPhone 6.5" (11 Pro Max / XS Max) | 1242 × 2688 | Опционально |
| iPad 13"/12.9" | 2048 × 2732 | только если поддерживаете iPad |

Минимум **3** скриншота на набор, максимум **10**. Достаточно залить набор 6.7"
— Apple масштабирует его на прочие iPhone.

### Как снять на симуляторе (без физического устройства)
```bash
npx cap open ios              # запустить на нужном симуляторе из Xcode
# Симулятор → iPhone 16 Pro Max
# Файл → New Screen Shot (⌘S) — сохранит PNG в нужном разрешении
```
Либо снять на реальном iPhone Pro Max (кнопки громкость+боковая).

### Предлагаемый сценарий кадров (6 шт.)
1. **Экран-замок Face ID** — «Locked for your privacy» (нативная фича, сразу
   видно ценность).
2. **Обзор сейфа** — документы по членам семьи/категориям.
3. **Напоминание о сроке** — карточка «паспорт истекает через N дней».
4. **Добавление документа камерой** — нативный захват.
5. **Карточка документа** — метаданные, срок действия.
6. **Безопасная отправка** — истекающая ссылка с лимитом просмотров/водяным
   знаком.

Подписи на скриншотах (по желанию, крупно, на языке локализации):
`Everything in one place` · `Never miss an expiry` · `Locked with Face ID` ·
`Add with your camera` · `Share safely, revoke anytime`.

### App Preview (видео) — опционально
15–30 c экранной записи (⌘R в QuickTime с устройства). Не обязательно для
первого релиза.

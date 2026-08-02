# ТЗ PR-1 — Vault: версии документов, автопроверки, архивация (подфаза 1A)

*Task-документ по Архитектуре v1.1 (`docs/ARCHITECTURE.md`) и аудиту (`docs/CODE_AUDIT.md`). Дата: 12.07.2026. Решения §9 аудита утверждены владельцем.*

---

## 0. Контекст и границы

Первый PR подфазы **1A Vault Foundation / Stabilization**. Существующий vault (households → members → documents → document_files) работает — мы его **расширяем, не переписываем** (v1.1 §16).

**Входит:** неизменяемые версии документов; автоматические проверки (`document_checks`); статус `archived`; маппинг канонических категорий; карточка документа с версиями и проверками.

**Не входит:** envelope encryption (v1.1 §12.2 — только после отдельного решения); подключение `log_audit` к просмотрам (PR-3); напоминания-offsets (PR-2); всё из найма (1B); AI-извлечение полей сверх уже работающего `classify` (1C).

**Жёсткие рамки:**

1. **БД общая с Doki.id** — миграции только аддитивные: новые таблицы/колонки/функции. Существующие таблицы, колонки, RPC и их семантику не менять и не переименовывать. `document_files` продолжает работать.
2. RLS — единственная граница доступа; использовать существующие хелперы `private.is_household_member/editor` (см. `supabase/migrations/*move_rls_helpers*`). Никаких ad-hoc проверок только в UI.
3. Файлы — только bucket `vault-files`, отдача только по signed URL (TTL ≤ 300 с; исключение — offline-копия 600 с, уже зафиксировано).
4. Все строки UI — в словарях 4 локалей (ru/en/id/uz) по текущей конвенции `Record<Locale, …>`; русский — первый.
5. **Запрещённая лексика:** «подделка», «фальшивый», «fake», «forged» — нигде: ни в коде, ни в UI, ни в комментариях. Допустимая формулировка: «не совпадает / требует ручной проверки» (v1.1 §10).
6. Миграция — один файл в `supabase/migrations/`, с комментарием-планом отката (v1.1 §16.7).

---

## 1. Модель данных (одна миграция)

### 1.1. `document_versions` — неизменяемая история файлов

```sql
create table document_versions (
  id            uuid primary key default gen_random_uuid(),
  document_id   uuid not null references documents(id) on delete cascade,
  household_id  uuid not null references households(id) on delete cascade, -- денормализация для RLS
  storage_path  text not null,          -- путь в bucket vault-files (существующая схема путей: {household_id}/...)
  file_hash     text not null,          -- sha256 hex, считается на сервере при загрузке
  mime          text not null,
  size_bytes    bigint not null,
  note          text,                   -- необязательный комментарий «что изменилось»
  uploaded_by   uuid references auth.users(id),
  created_at    timestamptz not null default now()
);
```

RLS: `select` — `private.is_household_member(household_id)`; `insert` — `private.is_household_editor(household_id)` + `with check` на household_id; **политик `update` и `delete` нет вообще** — неизменяемость версий обеспечивается отсутствием политик (v1.1 §7.2). Индекс: `(document_id, created_at desc)`.

### 1.2. Расширение `documents` (аддитивно)

```sql
alter table documents add column if not exists current_version_id uuid references document_versions(id);
alter table documents add column if not exists status text not null default 'active'
  check (status in ('active','archived'));
```

### 1.3. `document_checks` — автопроверки

```sql
create table document_checks (
  id                   uuid primary key default gen_random_uuid(),
  document_version_id  uuid not null references document_versions(id) on delete cascade,
  household_id         uuid not null references households(id) on delete cascade,
  check_type           text not null check (check_type in ('expiry','name_match','date_consistency','file_integrity')),
  result               text not null check (result in ('pass','mismatch','unreadable')),
  details              jsonb not null default '{}'::jsonb,  -- машинные основания: что с чем сравнили
  checked_at           timestamptz not null default now()
);
```

RLS: `select` — member; `insert` — editor (проверки запускает сервер от имени пользователя). `update/delete` — нет. Индекс: `(document_version_id)`.

Результат — только три значения. Никаких «verdict»-полей.

### 1.4. Бэкофилл (в той же миграции)

Для каждой строки `document_files` создать `document_versions` (storage_path/mime/size переносятся; `file_hash = ''` — хэш досчитывается лениво при первой проверке целостности, помечать `details.legacy = true`); `documents.current_version_id` := последняя версия по `uploaded_at`/`created_at`.

### 1.5. Совместимость (dual-write)

Новая загрузка файла пишет **и** `document_files` (как сейчас), **и** `document_versions`, затем обновляет `current_version_id`. Так Doki.id и существующие экраны (`/my/documents/[id]`, export, offline) продолжают работать без изменений. Отказ от dual-write — отдельным решением после синхронизации обоих приложений.

---

## 2. Канонические категории — маппинг, не ломая enum

Файл `lib/docTypes.ts`: словарь канонических типов ТЗ → пары `(doc_category, subtype)`:

| Канонический тип | category | subtype (пример) |
|---|---|---|
| passport | identity | passport |
| visa | identity | visa |
| diploma | education | diploma |
| certificate | education | certificate |
| resume | career | resume |
| recommendation | career | recommendation |
| employment_contract | career | employment_contract |
| insurance | financial | insurance |
| medical | medical | — |
| family | legal | family |
| other | other | — |

Enum `doc_category` не трогаем. Функции: `toCanonical(category, subtype)`, `fromCanonical(kind)`; локализованные названия — в словаре. `lib/classify.ts` при распознавании начинает заполнять subtype каноническими значениями (совместимо: subtype — свободный text).

---

## 3. Логика проверок (`lib/documentChecks.ts`)

Запуск: (а) после загрузки новой версии — асинхронно, не блокируя ответ; (б) кнопкой «Проверить» в карточке; (в) идемпотентно — повторный запуск создаёт новые строки, история сохраняется.

1. **expiry** — по `documents.expires_at`: нет даты → проверка не создаётся; дата в будущем → `pass`; в прошлом → `mismatch` (`details: {expires_at}`).
2. **file_integrity** — скачать объект из Storage сервером, посчитать sha256, сравнить с `file_hash`: совпало → `pass`; не совпало → `mismatch`; скачивание не удалось / hash пуст (legacy) → досчитать и записать `pass` с `details.legacy_hash_set = true`, при ошибке чтения → `unreadable`.
3. **name_match** — только если у документа есть распознанные поля от `classify` (person name) и у `members` заполнено имя: сравнение нормализованных строк (кириллица/латиница, регистр, порядок слов) → `pass`/`mismatch` (`details`: оба значения и источники). Нет данных → проверка не создаётся.
4. **date_consistency** — только при наличии распознанных дат: `issued_at ≤ expires_at`, `issued_at` не в будущем → `pass`/`mismatch`. Нет данных → не создаётся.

UI-текст результата: `pass` — «совпадает / действует», `mismatch` — «не совпадает, требуется ручная проверка» / «срок истёк», `unreadable` — «не удалось проверить».

---

## 4. Server actions (`app/my/actions.ts`)

- `uploadDocumentVersion(documentId, file, note?)` — эволюция `attachDocumentFile`: проверка квоты (существующая), запись в Storage по текущей схеме путей, sha256, dual-write (§1.5), `current_version_id`, асинхронный запуск проверок. Существующую `attachDocumentFile` не удалять — переключить на вызов новой логики.
- `archiveDocument(documentId)` / `unarchiveDocument(documentId)` — переключение `status` (только editor; RLS).
- `runDocumentChecks(documentId)` — ручной перезапуск по текущей версии.

Списки (`lib/queries.ts`): по умолчанию показывать только `status = 'active'` (или `status is null` не бывает — default 'active' закрывает старые строки); фильтр «показать архив» на `/my/documents` и в категориях. Счётчики категорий — только active.

---

## 5. UI — карточка документа `/my/documents/[id]`

Три новых блока (строки — в словарях):

1. **Версии** — список по убыванию даты: дата, размер, mime, note, кто загрузил; «Скачать» (signed URL ≤ 300 с); форма «Загрузить новую версию» (+note). Первая версия помечается «текущая».
2. **Проверки** — по текущей версии: тип, бейдж результата, дата, раскрываемые details; кнопка «Проверить сейчас».
3. **Архив** — кнопка «Архивировать» (с подтверждением) / «Восстановить»; архивный документ открывается по прямой ссылке с плашкой «в архиве».

Существующие блоки (файлы, share, offline) не трогать — они работают поверх `document_files`.

---

## 6. Тесты

1. **RLS** (`tests/rls/`, существующий паттерн двух пользователей): чужой household не читает `document_versions`/`document_checks`; участник-viewer не может insert; **update/delete версии запрещены даже владельцу**.
2. **Unit**: sha256; маппинг категорий туда-обратно; нормализация имён для name_match; date_consistency на граничных датах.
3. **E2E** (Playwright, существующий каркас): загрузка второй версии документа → в карточке две версии, текущая — новая; архивирование → документ пропал из списка, виден с фильтром «архив».
4. Грep-тест (unit или CI-шаг): запрещённая лексика §0.5 отсутствует в `app/`, `lib/`, `supabase/migrations/` (кроме документации, цитирующей запрет).

---

## 7. Критерии приёмки

1. Загрузка нового файла создаёт версию; старые версии доступны и неудаляемы; `current_version_id` обновлён; Doki.id-совместимость не нарушена (document_files пишется).
2. Бэкофилл: у всех существующих документов есть хотя бы одна версия.
3. Просроченный документ после проверки имеет `expiry = mismatch`, это видно в карточке.
4. Подмена файла в Storage ловится `file_integrity = mismatch` (интеграционный тест).
5. Несовпадение имени члена семьи и распознанного имени даёт `name_match = mismatch` с обоими значениями в details; формулировка в UI — «требуется ручная проверка».
6. Архивирование скрывает документ из списков и счётчиков, не удаляя ни файлы, ни историю.
7. Все новые строки UI переведены на 4 локали; миграция обратима по задокументированному плану отката.

---

## 8. Definition of Done

Миграция применяется на чистой БД и на БД с данными (бэкофилл); `npm run lint`/`build` зелёные; RLS/unit/E2E-тесты зелёные; описание PR — по-русски с перечнем изменений схемы; в `docs/CODE_AUDIT.md` §10 строка PR-1 помечается выполненной.

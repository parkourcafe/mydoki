# 02 · Доменная модель

> Соответствует авторитетной схеме [schema.sql](schema.sql). Имена и типы полей —
> как в SQL.

## Иерархия

```
Семья / Household  (корневая единица доступа — есть всегда)
  └─ Член семьи (member): «я», «сын», «супруга»…
        ├─ Документы (documents) + файлы (document_files): паспорт, диплом, грамота…
        └─ Записи (records, структурные): анализ, назначение, питание, прививка
```

**Household — обязателен.** Даже один пользователь работает внутри своей семьи
(он в ней `owner`). Совместный доступ = добавление участников
(`household_members`) с ролями. Главная «карточка жизни» — **член семьи
(member)**; всё привязано к нему и к household.

## Сущности (таблицы)

| Сущность | Что хранит |
|---|---|
| **households** | Семья: `name`, `created_by`. Корень доступа |
| **household_members** | Кто состоит в семье + `role`: `owner` / `editor` / `viewer` |
| **members** | Человек: `full_name`, `birth_date`, `relation`, `photo_url` |
| **documents** | Документ: `category`, `subtype`, `title`, `issuer`, `doc_number`, `issued_at`, `expires_at`, `notes` |
| **document_files** | Файл(ы) документа: `storage_path`, `file_name`, `mime_type`, `size_bytes` |
| **records** | Структурная запись без файла: `kind`, `title`, `data` (jsonb), `recorded_at` |
| **reminders** | Напоминание о сроке: `due_at`, `message`, `done` |
| **shares** | Ссылка на **один** документ: `token`, `expires_at`, `revoked_at`, `max_views`, `view_count` |
| **audit_log** | Журнал: `action`, `entity_type`, `entity_id`, `metadata`, `actor_user_id` |

Категории и виды записей — **PostgreSQL enum**, а не таблицы-справочники:
`doc_category` и `record_kind` (см. ниже).

## Доступ и роли

| Роль | Может |
|---|---|
| **owner** | Всё + управление семьёй (состав, роли) |
| **editor** | Чтение + создание/изменение данных |
| **viewer** | Только чтение |

Правило RLS на каждой таблице: **чтение — любой член семьи**
(`is_household_member`), **запись — `editor`/`owner`** (`is_household_editor`),
**управление семьёй — `owner`** (`is_household_owner`). Подробности — в
[05-database-schema.md](05-database-schema.md).

## Категории документов — enum `doc_category`

| Значение | Примеры |
|---|---|
| **identity** | паспорт, загранпаспорт, свидетельство о рождении |
| **education** | дипломы, аттестаты, грамоты, сертификаты |
| **medical** | анализы, назначения, прививки, справки |
| **financial** | счета, страховки, банковские документы |
| **legal** | договоры, доверенности |
| **other** | всё остальное |

## Виды записей — enum `record_kind`

`medical_analysis` · `prescription` · `nutrition` · `vaccination` · `note` · `other`

Запись (`records`) хранит структурированные данные **без файла** в поле `data`
(jsonb) — например, результат анализа, назначение врача, план питания, прививку.

## Обмен — `shares`

- `document_id` — делимся **одним** документом, не профилем человека.
- `token` — случайный, в URL.
- `expires_at` — ссылка истекает; `revoked_at` — можно отозвать.
- `max_views` / `view_count` — опциональный лимит просмотров и счётчик.
- Доступ получателя — **не** через RLS, а через RPC `get_shared_document`
  (проверяет срок/отзыв/лимит, пишет аудит, отдаёт минимум полей + пути файлов).

> Водяной знак и запрет скачивания в текущей схеме отсутствуют — возможное
> расширение (см. [08-open-questions.md](08-open-questions.md)).

## Аудит — `audit_log`

- `action` — точечное имя события: `document.view`, `file.download`,
  `document.share`, `document.share_view`.
- `entity_type` / `entity_id` — на что действие; `metadata` (jsonb) — детали
  (туда же можно класть ip / user-agent).
- Пишется **только** через функцию `log_audit` (прямой insert закрыт RLS),
  кроме `share_view`, который пишет сама `get_shared_document`.

## Storage

- Один **приватный** bucket `vault-files`.
- Путь файла: `'<household_id>/<document_id>/<file>'` — первый сегмент = семья,
  по нему storage-RLS пускает только её членов.
- Наружу файлы — только короткими signed URL, которые генерит сервер.

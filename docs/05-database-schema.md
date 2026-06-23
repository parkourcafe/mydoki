# 05 · Схема БД

> **Источник правды — [schema.sql](schema.sql)** (design-черновик для отдельного
> проекta Supabase, не миграция PET ID). Этот файл — пояснение к нему.

## Таблицы

`households` · `household_members` · `members` · `documents` ·
`document_files` · `records` · `reminders` · `shares` · `audit_log` ·
`consents` · `invitations`

Категории, виды записей и согласия — enum: `doc_category`
(`identity/education/medical/financial/legal/other`), `record_kind`
(`medical_analysis/prescription/nutrition/vaccination/note/other`), `consent_kind`
(`privacy_policy/medical/marketing`); роли — `household_role` (`owner/editor/viewer`).

## Модель доступа

Всё привязано к `household_id`. Доступ проверяют `SECURITY DEFINER`-хелперы
(они же спасают `household_members` от рекурсии RLS):

| Функция | Что проверяет |
|---|---|
| `current_user_household_ids()` | список семей текущего пользователя |
| `is_household_member(hid)` | состоит ли в семье (чтение) |
| `is_household_editor(hid)` | `owner`/`editor` (запись) |
| `is_household_owner(hid)` | `owner` (управление семьёй) |

**Унифицированный паттерн RLS** на `members / documents / document_files /
records / reminders / shares / consents`:

```sql
create policy "<t> read"  on <t> for select using (is_household_member(household_id));
create policy "<t> write" on <t> for all
  using (is_household_editor(household_id)) with check (is_household_editor(household_id));
```

- `households`: чтение — член, `update` — только `owner`.
- `household_members`: чтение — член, управление — только `owner`.
- `audit_log`: чтение — член; **записи нет** (пишет только `log_audit` /
  `get_shared_document` как `SECURITY DEFINER`).

## RPC

| Функция | Назначение | Кому |
|---|---|---|
| `create_household(name)` | создать семью и сделать создателя `owner` (атомарно) | authenticated |
| `get_shared_document(token)` | публичный доступ по ссылке: валидация срока/отзыва/`max_views`, инкремент `view_count`, аудит, минимум полей + флаги (`watermark`/`allow_download`) + пути файлов | anon, authenticated |
| `revoke_share(share_id)` | отозвать ссылку (только `editor`/`owner`) | authenticated |
| `log_audit(...)` | единая точка записи аудита (`actor = auth.uid()`) | authenticated |

`get_shared_document` сознательно отдаёт **allowlist** полей документа и
`storage_path` файлов; **короткие signed URL** генерит сервер приложения уже
после успешного вызова — bucket остаётся приватным, токен в URL — единственный
«ключ».

## Storage

- Bucket `vault-files`, `public = false`.
- Путь: `'<household_id>/<document_id>/<file>'`.
- RLS на `storage.objects`: select/insert/delete разрешены, только если первый
  сегмент пути (`household_id`) входит в `current_user_household_ids()`.

## Применение и hardening

Схема применена к проекту Supabase `uuopxzlcmzdtwebottar` миграциями
`init_family_vault_schema` и `harden_function_grants`: 10 таблиц, RLS на всех,
приватный bucket `vault-files`.

Права на функции: `revoke execute … from public, anon` для хелперов и пишущих
RPC, `grant … to authenticated` (их вызывают RLS-политики). Анонимам открыта
только `get_shared_document` (share-ссылки).

Security-advisors просмотрены: оставшиеся предупреждения уровня WARN —
`SECURITY DEFINER`-функции, исполнимые `authenticated`. Это by-design (нужны
политикам RLS). Дальнейшее ужесточение — вынести хелперы в схему вне PostgREST
(см. [08-open-questions.md](08-open-questions.md)).

## Чего в схеме пока НЕТ (осознанно)

- **`profiles`** / профиль пользователя — пользователь живёт в `auth.users`.
- Отдельный, более строгий контур доступа к медицине (сейчас единый паттерн
  «чтение — любой член семьи»).

Прочее вынесено в [08-open-questions.md](08-open-questions.md).

## Примечания к безопасности из схемы

- Медицина (`category='medical'`, `record_kind` analysis/prescription) — спец-
  категория ПДн: отдельное согласие, возможно отдельная таблица со строгим
  доступом и обязательным аудитом.
- Топ-чувствительные файлы (паспорт, св-во о рождении) — кандидат на
  **envelope-шифрование на клиенте** (ключ у пользователя → сервер хранит шифртекст).
- Включить **2FA** в Supabase Auth, ограничить время жизни сессии.

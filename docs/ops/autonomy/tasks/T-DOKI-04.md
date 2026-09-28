# T-DOKI-04 — вопросы владельца 52–54: доверие к работодателю (название, домены, отметка об увольнении)

- **task_id:** T-DOKI-04
- **repo:** parkourcafe/mydoki (DOKI.help)
- **base:** `claude/doki-talent-pool-employer-match` @ `0fae7d55bd9e0239c1d74e02d69ffd84a353d8bb` (head draft PR #117, поверх #116)
- **branch / PR:** `claude/doki-employer-trust` → draft PR (база `claude/doki-talent-pool-employer-match`; **сливать после #116 и #117**)
- **дата прогона:** 2026-09-28, локально, синтетические данные, одноразовая PostgreSQL 16 (`/var/tmp`, базы `base0`, `t1`, `t2`, с нуля)
- **статус:** анализ 52–54 — DONE; исправления — DONE_CODE, TESTED_LOCAL; применение к Supabase — не выполнялось (только владелец)

Правила владельца, которым следует ветка: непроверенную компанию нельзя показывать как проверенную;
отсутствие корпоративного домена не делает работодателя недействительным; отметка об увольнении не
удаляет аккаунт кандидата и его независимые документы.

---

## 52. Название компании до подтверждения никто не проверяет

### Факты (где кандидат видит `company_name` и с каким статусом)

| Экран кандидата | Откуда название | Статус рядом | Файл:строка |
|---|---|---|---|
| Страница отклика `/apply/[slug]` | `vacancies.company_name` — **свободный текст на каждую вакансию** (`create_vacancy(p_title, p_company_name)`; форма подставляет `profile.company_name`, но поле редактируемое) | бейдж «✓ Verified/Terverifikasi/Проверен», если `employer_profiles.verified_at is not null` — **без учёта `verification_revoked_at`** и без сверки названия | `app/apply/[slug]/page.tsx:214-219`; `apply_vacancy_meta` в `20260704000000_t4_verification_reports.sql:172-181`; `app/employer/vacancies/new/VacancyForm.tsx:291`, `:496` |
| Публичная вакансия `/v/[slug]` | `vacancies.company_name` | без бейджа | `app/v/[slug]/page.tsx:147` |
| Мои отклики `/my/applications`, статус по токену `/applications/status/[token]` | `vacancies.company_name` | без бейджа | `app/my/applications/page.tsx:103`; `app/applications/status/[token]/page.tsx:181` |
| Приглашения Talent Pool `/my/opportunities` | `employer_profiles.company_name` | зелёная «✓», если `verified_at` есть и не отозвано; приглашения шлют только подтверждённые, поэтому «✓» стоит **всегда** | `get_my_opportunity_invites` (`20260819110000:807-809`); `app/my/opportunities/OpportunityList.tsx:179-180` |
| Talent Pool (выдача) | кандидат работодателей не видит | — | — |
| Письма/пуши | название компании не используется | — | `lib/email.ts`, `lib/push.ts` |

Что на самом деле подтверждает Doki: контроль над почтовым ящиком (`contact_email`, иначе email
аккаунта, в т. ч. gmail) — `app/employer/actions.ts:111`, `confirm_employer_verification`.
Название профиля и название в вакансии никто не проверяет. Все вакансии в базе — от «подтверждённых»
работодателей (`EMPLOYER_NOT_VERIFIED` в `create_vacancy`), поэтому бейдж стоял почти на каждой.

### Разбор

| Кто что может сделать | Кому это видно | Реальный риск | Минимальное исправление |
|---|---|---|---|
| Работодатель подтверждает почту с gmail, в профиль пишет любое название («PT Nyata»), в вакансию — любое другое («Google Indonesia») | кандидат на `/apply/[slug]`: «Google Indonesia ✓ Verified» | кандидат отдаёт KTP/паспорт/резюме, доверившись бейджу, который означает лишь «почта подтверждена» | бейдж честно говорит, что подтверждено («Email verified» + домен, если корпоративный), и не показывается рядом с названием, которого нет в профиле (текущем или на момент подтверждения) |
| Владелец отозвал подтверждение (`verification_revoked_at`) | `/apply/[slug]` продолжал показывать «✓» (`apply_vacancy_meta` смотрит только `verified_at`) | отозванный работодатель выглядит подтверждённым; вакансии он тоже продолжает публиковать (`create_vacancy` не смотрит на отзыв — интерпретация: пробел с 20260819110000) | `apply_vacancy_meta` учитывает отзыв — сделано; блокировка публикации у отозванного — решение владельца (см. BLOCKED_DECISION) |
| Работодатель переименовывает профиль после подтверждения | приглашения показывают новое название с «✓» | «✓» без слова рядом; все приглашения от подтверждённых — знак не несёт информации, но читается как «компания проверена» | не менялось (интерпретация: малый риск, кандидат раскрывает профиль только после принятия); при желании — тот же приём, что на `/apply` |

### Сделано (DONE_CODE, TESTED_LOCAL)
- `apply_vacancy_meta` (миграция `20260928140000_employer_verified_domain.sql`): `verified` = подтверждение
  действует **и** не отозвано **и** `vacancies.company_name` совпадает с `employer_profiles.company_name`
  или `verified_company_name` (снимок #117); новое поле `verified_domain`.
- `app/apply/[slug]/page.tsx`: подпись бейджа «Email verified / Email terverifikasi / Email подтверждён /
  Email tasdiqlangan», рядом домен организации, если он подтверждён («✓ Email terverifikasi · nyata.co.id»).
  Работодатель не блокируется: вакансия публикуется и показывается как раньше, меняется только бейдж.
- Тест `tests/rls/employer_verified_domain.sql` §6: совпадающее название → `verified=true`; другое
  название → `false`; публичная почта → `verified=true`, `verified_domain=null`; отзыв → `false`.

---

## 53. Домены организации не заполняются

### Факты
- `employer_profiles.domains` добавлена в `20260819110000:52`; **ни код, ни миграции её не заполняли**
  (T-DOKI-03 §«Где решается»). После #116 клиент менять её не может.
- От неё зависят два пути в `private.discovery_denied_reason` (`20260928130000:108-137`): блокировка
  организации по домену (`organization_discovery_blocks.domain`, RPC `block_organization(null, domain)`) и
  «скрыть от текущего работодателя», если кандидат вписал домен. Оба пути были мёртвыми — сверка шла
  только по названию.
- Код подтверждения уходит на `contact_email`, иначе на email аккаунта (`app/employer/actions.ts:111`);
  `contact_email` работодатель потом свободно меняет (`saveCompanySettings`, прямой update разрешён).

### Разбор

| Кто что может сделать | Кому это видно | Реальный риск | Минимальное исправление |
|---|---|---|---|
| Кандидат вписывает домен работодателя («nyata.co.id») в список скрытия или блокирует домен | никому — сверка с пустым `domains` не срабатывала | кандидат считает себя скрытым, а работодатель его видит | при `confirm_employer_verification` записывать домен адреса, на который ушёл код, кроме публичных почтовых сервисов — сделано |
| Работодатель меняет `contact_email` между запросом кода и вводом | — | домен мог бы записаться от адреса, который код не получал | адрес получателя фиксируется при запросе кода (`verification_email`, ставит `set_employer_verification`, клиенту недоступен) — сделано, тест §4 |
| Работодатель с gmail/yahoo | бейдж без домена | никакого: `verified_at` ставится как раньше, вакансии и Talent Pool доступны (тест §2) | ничего; домен — только для скрытия/блокировки |
| Уже подтверждённые работодатели | без домена | их `contact_email` сегодня не доказан (мог смениться после ввода кода) | не заполнять автоматически; разовый SQL — решение владельца (ниже) |

### Сделано (DONE_CODE, TESTED_LOCAL) — `supabase/migrations/20260928140000_employer_verified_domain.sql`
1. Колонка `employer_profiles.verification_email` (nullable, аддитивная); клиентским ролям недоступна
   (триггер `employer_profiles_verification_email`, ошибка `EMPLOYER_PROTECTED_FIELDS`, как #116/#117).
2. `set_employer_verification`: запоминает получателя кода по правилу приложения
   (`contact_email`, иначе `auth.email()`); для уже подтверждённого профиля — no-op (раньше прямой вызов
   RPC ставил `verification_expires_at` и через 15 минут отключал Talent Pool — то, что чинил #116).
3. `confirm_employer_verification`: при успехе добавляет домен `verification_email` в `domains`, если он не
   из списка публичных сервисов (`private.is_public_email_domain`, ~40 доменов: gmail, yahoo(.co.id),
   hotmail, outlook, icloud, proton, mail.ru, yandex, qq и т. д.) и его там ещё нет. Всё остальное — как в #116.
4. `apply_vacancy_meta` — см. п. 52.
5. `private.email_domain(text)`, `private.is_public_email_domain(text)` — хелперы.

Тест `tests/rls/employer_verified_domain.sql` (в `run.sh`): корпоративная почта → `domains=["nyata.co.id"]`
и кандидат, скрывший этот домен, не виден; блокировка по домену срабатывает и не задевает другую
организацию; gmail → `domains=[]`, но `create_vacancy` и `talent_pool_candidates` работают; без
`contact_email` домен из `auth.email()`; смена `contact_email` между запросом и вводом кода не подменяет
домен; `verification_email` клиент не задаёт/не меняет; повторный `set_employer_verification`
подтверждённым — no-op.

**Красный без миграции (реальный прогон):** на схеме #116+#117 копия теста без новой колонки падает с
`FAIL: домен подтверждённой почты не попал в domains: []` (`scratchpad/domain_mut.sql`, база `base0`).
Полный файл на старой схеме падает на отсутствии колонки `verification_email`.

**Разовое заполнение для уже подтверждённых — только по решению владельца** (не выполнялось):
```sql
-- предварительно посмотреть, что получится
select id, company_name, contact_email, private.email_domain(contact_email) as d
  from public.employer_profiles
 where verified_at is not null and jsonb_array_length(domains) = 0
   and private.email_domain(contact_email) is not null
   and not private.is_public_email_domain(private.email_domain(contact_email));
-- применить (домен из текущего contact_email — не доказан кодом!)
-- update public.employer_profiles
--    set domains = domains || to_jsonb(private.email_domain(contact_email))
--  where ... (то же условие);
```

---

## 54. Работодатель может сам перевести `employments.status` в `ended`

### Факты
- **Права.** Политика `"employments company update"` (`20260712230000:86-89`): владелец/рекрутёр компании
  (`private.can_access_employer`) может менять **любую колонку** записи с `company_id` своей компании; `WITH CHECK`
  проверяет только `company_id`. Приложение так и делает: `updateEmployment` — прямой update `status`,
  `end_date`, `start_date`, `position` (`app/employer/actions.ts:782-814`, форма
  `app/employer/employees/[id]/EmployeeEditForm.tsx:131-134`). Второй путь — RPC `complete_offboarding`
  (`20260713130000:99-117`, SECURITY DEFINER, гейт `can_access_employer`). Кандидат свои записи «от
  работодателя» менять не может (политики `person … manual` требуют `manual=true and company_id is null`).
- **Журнал.** Не было: ни таблицы, ни триггера, ни `changed_by`. Для откликов журнал есть
  (`application_status_log`, `20260701000000`), для условий — `employment_amendments` с согласием сотрудника;
  для статуса — ничего. Уведомления кандидату — тоже нет (`lib/push.ts` знал два типа: отклик и shortlist).
- **Что менялось для кандидата после `ended`:**
  - Talent Pool: путь «действующее трудоустройство» из #117 (`e.status = 'active'`,
    `20260928130000:123-128`) перестаёт скрывать кандидата от этой организации **сразу**; скрытие по
    названию/домену из списка кандидата продолжает действовать (если он его вписал);
  - «Мои трудовые отношения» и карьерная лента: запись уходит в архив (`lib/careerTimeline.ts:35`), в
    экспорте резюме `current=false` (`lib/resume.ts:308-309`);
  - публичная ссылка-подтверждение занятости (`get_employment_verification`, `20260713150000:102-110`)
    сразу показывает третьим лицам `status: ended` и `end_date` — кандидат об изменении не узнаёт.
- **Удаление.** Смена статуса ничего не удаляет: каскады (`onboarding_tasks`, `employment_documents`,
  `employment_amendments`, `offboarding_tasks`, `employment_verifications`) срабатывают только на DELETE
  строки `employments`, а DELETE-политики у компании нет; `application_documents` привязаны к
  `applications`, паспорт/резюме — к `auth.users`. Проверено тестом §3.
- **Найдено попутно (интерпретация: дефект прав).** Та же политика позволяла работодателю переписать
  `employee_user_id`, `application_id`, `manual`, `created_by`, `company_name` — то есть «переназначить»
  запись другому человеку или сменить название компании в его истории. На старой схеме
  `update employments set employee_user_id = <другой>` от имени работодателя **проходит** (прогон
  `scratchpad/status_mut.sql` на `t1`).

### Разбор

| Кто что может сделать | Кому это видно | Реальный риск | Минимальное исправление |
|---|---|---|---|
| Владелец/рекрутёр компании ставит `status='ended'` (+ любую `end_date`) прямым update или через `complete_offboarding` | кандидату — только итоговый статус в «Мои трудовые отношения»; третьим лицам — по ссылке-подтверждению | увольнение «задним числом» или в отместку без следа; кандидат узнаёт случайно; ссылка-подтверждение, которую он дал новому работодателю, уже показывает «ended» | журнал `employment_status_log` (кто/когда/что→что) триггером на любой путь + пуш кандидату + блок «История статуса» у кандидата — сделано |
| Та же роль меняет `employee_user_id` / `application_id` / `manual` / `company_name` | никому — записи просто «переезжают» | подмена истории человека, приписывание записи другому аккаунту | триггер `employments_guard_identity`: эти поля для клиентских ролей неизменяемы (`EMPLOYMENT_PROTECTED_FIELDS`) — сделано |
| После `ended` организация снова видит бывшего сотрудника в Talent Pool (если он не вписал название/домен) | работодателю | скрытие, которое кандидат считал автоматическим, снимается одним кликом работодателя | не менялось — продуктовое решение (скрывать N месяцев после `end_date` / всегда / оставить); журнал даёт `actor_role`, на который такое правило можно опереть |

### Выбор: журнал + уведомление, а не подтверждение кандидатом (обоснование по коду)
- Завершение — процесс работодателя: оффбординг, финальные документы, справка (`docs/tasks/tz-phase4.md` §7.4:
  «экран человека read-only»); RPC `complete_offboarding` и чек-лист построены вокруг этого.
- Согласие сотрудника уже есть там, где меняются условия (`employment_amendments` →
  `respond_to_amendment`); статус «ended» — факт, который работодатель обязан уметь зафиксировать, иначе
  ушедший сотрудник может бессрочно числиться `active`.
- Требование подтверждения меняет продукт (что делать при молчании кандидата, спор), это решение
  владельца; журнал и уведомление закрывают именно то, что просили проверить: права, след и последствия.

### Сделано (DONE_CODE, TESTED_LOCAL) — `supabase/migrations/20260928150000_employment_status_log.sql`
1. Таблица `employment_status_log` (`employment_id`, `old_status`, `new_status`, `old_end_date`,
   `new_end_date`, `changed_by`, `actor_role` ∈ company/employee/system, `created_at`), RLS: чтение через
   видимость `employments` (сотрудник + компания), записи у клиентов нет (ни политик, ни грантов).
2. Триггер `employments_status_log` (AFTER UPDATE, SECURITY DEFINER): любая смена `status`/`end_date` у записи
   с `company_id` — строка в журнале; работает и для прямого update, и для `complete_offboarding`.
3. Триггер `employments_guard_identity` (BEFORE UPDATE): для `authenticated`/`anon` неизменяемы
   `employee_user_id`, `application_id`, `manual`, `company_id`, `created_by`, `created_at`, а у записей с
   `company_id` — и `company_name`. Ручные записи человек правит как раньше (тест §6).
4. Приложение: `updateEmployment` и `completeOffboarding` шлют пуш `employment_ended` (best-effort, как
   `shortlisted`; без VAPID — тихо ничего) — `app/employer/actions.ts`, `lib/push.ts`.
   Страница `/my/employment/[id]`: блок «История статуса» (`StatusHistory.tsx`) для записей от работодателя,
   если статус `ended` или есть строки журнала; хелперы `describeStatusEvent`, `employmentActorLabel` в
   `lib/employment.ts` + юнит-тесты.

Тест `tests/rls/employment_status_log.sql` (в `run.sh`): работодатель отмечает `ended` → строка журнала
`active → ended`, `changed_by` = он, `actor_role = company`; клиент не пишет/не удаляет журнал; сотрудник
видит строку, чужая организация — нет; аккаунт кандидата, отклик и `application_documents`, сама запись —
на месте; 5 попыток переписать «чью» запись → `EMPLOYMENT_PROTECTED_FIELDS`; `complete_offboarding`
журналируется с `new_end_date` = последний день; ручная запись — без журнала, `company_name` правится.

**Красный без миграции (реальный прогон):** на схеме `t1` (без `20260928150000`) полный тест падает на
отсутствии таблицы; копия только с проверкой прав (`scratchpad/status_mut.sql`) —
`FAIL: работодатель выполнил «update employments set employee_user_id = …»`.

---

## Изменённые файлы
- `supabase/migrations/20260928140000_employer_verified_domain.sql` (новая)
- `supabase/migrations/20260928150000_employment_status_log.sql` (новая)
- `tests/rls/employer_verified_domain.sql`, `tests/rls/employment_status_log.sql` (новые), `tests/rls/run.sh`, `tests/rls/README.md`
- `app/apply/[slug]/page.tsx` — подпись бейджа, домен
- `app/employer/actions.ts` — пуш при завершении (два пути)
- `lib/push.ts` — тип `employment_ended`
- `lib/employment.ts`, `tests/unit/employment.test.ts` — тип события журнала, хелперы, тесты
- `app/my/employment/[id]/page.tsx`, `app/my/employment/[id]/StatusHistory.tsx` — история статуса у кандидата
- `docs/ops/autonomy/tasks/T-DOKI-04.md` — этот журнал

## Команды и результаты (локально, PostgreSQL 16.13, `node` 22)

| Команда | Результат |
|---|---|
| `bash tests/rls/run.sh` на пустой `base0` (схема #116+#117, до изменений) | 72 миграции, 10/10 ✓ |
| `employer_verified_domain.sql` на `base0` (без миграции) | красный: `column "verification_email" … does not exist`; поведенческая копия — `FAIL: домен подтверждённой почты не попал в domains: []` |
| `bash tests/rls/run.sh` на пустой `t1` (+ `20260928140000`) | 73 миграции, 10/10 ✓ (+ новый тест отдельно ✓) |
| `employment_status_log.sql` на `t1` (без `20260928150000`) | красный: `type "employment_status_log" does not exist`; копия с проверкой прав — `FAIL: работодатель выполнил «update employments set employee_user_id …»` |
| `bash tests/rls/run.sh` на пустой `t2` (обе миграции) | 74 миграции, **12/12 ✓** |
| повторное применение обеих миграций | exit 0 |
| `npm run typecheck` | exit 0 |
| `npx eslint` по изменённым файлам | 0 ошибок, 6 предупреждений — все существовали до ветки |
| `npm run test:unit` | 191/191 ✓ (добавлено 2 теста) |
| `node tests/lexicon.mjs` | OK |

Не запускалось: e2e (Playwright), `next build`, Lighthouse — смотреть CI draft PR. К живым Supabase-проектам
ничего не применялось и не запрашивалось.

## Блокеры / решения владельца (BLOCKED_DECISION)
1. **Разовое заполнение `domains` у уже подтверждённых** по текущему `contact_email` (SQL выше) — данные
   не доказаны кодом; без этого у них бейдж «Email verified» без домена.
2. **Отозванный работодатель продолжает публиковать вакансии** (`create_vacancy` смотрит только `verified_at`).
   Бейдж на `/apply` теперь снят; блокировать ли публикацию — решение владельца (правка одной строки в
   `create_vacancy` + тест).
3. **Talent Pool после `ended`:** скрывать ли от бывшего работодателя N месяцев после `end_date`
   (журнал даёт `actor_role`/дату для такого правила) или оставить как есть.
4. Новые строки UI (бейдж на 4 языках, «История статуса», пуш `employment_ended`) — на вычитку носителю
   бахаса; в этой ветке вычитка не делалась (запрет владельца).
5. Порядок слияния: после #116 и #117 (миграции `20260928140000`/`150000` опираются на
   `verified_company_name` из #117 и `EMPLOYER_PROTECTED_FIELDS` из #116). Применять к Supabase — только владельцу.

## next_step
- Дождаться CI draft PR; при красном — чинить.
- Решения владельца по пп. 1–3; п. 3 — отдельная миграция с тестом.

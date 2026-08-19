# Скриншоты: Candidate Passport, Talent Pool, blind invitation

| Файл | Flow | Что видно |
| --- | --- | --- |
| `01-candidate-passport-step1.png` | candidate creates passport | шаг 1 из 7 полей, статус поиска `active/open/unavailable`, начало progressive profiling |
| `02-candidate-passport-progressive.png` | candidate creates passport | заполненный паспорт, полнота профиля, подсказка «что добавить дальше», фиксация неизменяемой версии |
| `03-talent-pool-join.png` | candidate joins talent pool | дефолт `private`, пять режимов видимости, состояние «не в пуле» |
| `04-talent-pool-joined.png` | candidate joins talent pool | `confidential_pool`, скрытие текущего работодателя, field-level скрытие, предупреждение о косвенной идентификации, активное членство, блокировка организации |
| `05-employer-blind-invitation.png` | employer sends blind invitation | кампания приглашения с обязательным раскрытием цели, «Кандидат ещё не ответил — профиль недоступен», после принятия знакомства — ограниченный профиль и покрытие требований «7 met, 1 needs_verification» без процента и ранжирования |

## Прогон против staging-like Supabase

| Файл | Что на нём |
| --- | --- |
| `stage-01-my-passport.png` | `/my/passport` под сессией кандидата: паспорт подгружен из БД, членство `В пуле`, режим `Конфиденциально`, предупреждение о косвенной идентификации |
| `stage-02-my-opportunities.png` | `/my/opportunities`: blind-приглашение от PT Pencari Stage с целью доступа и сроком ответа, кнопки «Принять знакомство» / «Отклонить» |
| `stage-03-employer-talent.png` | `/employer/talent` под сессией проверенной организации: списка людей нет, когорта подавлена ниже порога, приглашение без профиля |
| `stage-05-apply-submitted.png` | обычный отклик, отправленный анонимно через реальный server action (в БД появились `applications` и `application_profile_snapshots`) |

Эти четыре сняты **против работающего стека**: PostgreSQL 16 + настоящий
PostgREST 12.2.3 + шим `/auth/v1/user`, с применённой полной цепочкой из 63
миграций. Страницы рендерились Next.js dev-сервером, все запросы шли через
PostgREST с подписанными JWT (`role=authenticated`), то есть RLS работала
по-настоящему. Это не продовый Supabase (нет GoTrue и Storage), но REST-слой
и политики — настоящие.

## Как сняты (первые пять)

Скриншоты сделаны Playwright/Chromium с **реальных клиентских компонентов**
(`app/my/passport/PassportForm.tsx`, `app/my/passport/TalentPoolPanel.tsx`,
`app/employer/talent/TalentSourcing.tsx`, `components/MatchExplanationView.tsx`)
на временном harness-роуте с фикстурными пропсами. Строка покрытия
«7 met, 1 needs_verification» посчитана настоящей функцией
`evaluateCriteria()` из `lib/matching.ts`, а не написана руками.

Это **не** прогон end-to-end против живого Supabase: в CI-окружении ветки нет
инстанса Supabase (auth + PostgREST), поэтому серверные действия и RPC в
скриншотах не выполнялись. Поведение БД проверено отдельно — SQL-тестами
`tests/rls/talent_pool_visibility.sql` и `tests/rls/opportunity_invite_flow.sql`
на локальном PostgreSQL 16. Harness-страницы удалены и в репозиторий не
попали.

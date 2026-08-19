# Скриншоты: Candidate Passport, Talent Pool, blind invitation

| Файл | Flow | Что видно |
| --- | --- | --- |
| `01-candidate-passport-step1.png` | candidate creates passport | шаг 1 из 7 полей, статус поиска `active/open/unavailable`, начало progressive profiling |
| `02-candidate-passport-progressive.png` | candidate creates passport | заполненный паспорт, полнота профиля, подсказка «что добавить дальше», фиксация неизменяемой версии |
| `03-talent-pool-join.png` | candidate joins talent pool | дефолт `private`, пять режимов видимости, состояние «не в пуле» |
| `04-talent-pool-joined.png` | candidate joins talent pool | `confidential_pool`, скрытие текущего работодателя, field-level скрытие, предупреждение о косвенной идентификации, активное членство, блокировка организации |
| `05-employer-blind-invitation.png` | employer sends blind invitation | кампания приглашения с обязательным раскрытием цели, «Кандидат ещё не ответил — профиль недоступен», после принятия знакомства — ограниченный профиль и покрытие требований «7 met, 1 needs_verification» без процента и ранжирования |

## Как сняты

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

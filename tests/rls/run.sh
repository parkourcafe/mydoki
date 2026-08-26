#!/usr/bin/env bash
# Прогон RLS-тестов против ПУСТОЙ базы Postgres.
#
# Раньше эти тесты existed, но никогда не запускались автоматически: они
# печатали значения, а вердикт выносил человек, сверяя вывод с шапкой файла.
# Теперь каждый файл заканчивается do-блоком, который падает при нарушении,
# поэтому весь набор годится для CI — этот скрипт его и запускает.
#
# Подключение берётся из стандартных переменных PG* (PGHOST, PGPORT, PGUSER,
# PGPASSWORD, PGDATABASE) — так же, как их отдаёт service-контейнер в GitHub
# Actions. Локальный запуск описан в tests/rls/README.md.
#
# ВАЖНО: скрипт применяет схему к базе, на которую указывают PG*. Никогда не
# направляйте его на боевой проект — только на одноразовую базу.
set -uo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
PSQL=(psql -v ON_ERROR_STOP=1 -q --no-psqlrc)

say() { printf '%s\n' "$*"; }

say "▸ Шимы Supabase (auth.uid, роли, storage-хелперы)"
if ! "${PSQL[@]}" -f "$ROOT/tests/rls/_local_shim.sql"; then
  say "✗ не удалось применить _local_shim.sql"; exit 1
fi

say "▸ Миграции"
migrations=0
for f in "$ROOT"/supabase/migrations/*.sql; do
  if ! "${PSQL[@]}" -f "$f"; then
    say "✗ миграция не применилась: $(basename "$f")"
    say "  Схема неполная — дальше тесты дали бы неверный результат, поэтому останавливаемся."
    exit 1
  fi
  migrations=$((migrations + 1))
done
say "  применено: $migrations"

# PostgREST выдаёт эти гранты сам; на голой базе их надо проставить руками,
# иначе роль упрётся в отсутствие привилегии раньше, чем в политику RLS, и
# тест проверит не то, что задумано.
"${PSQL[@]}" -c "grant select,insert,update,delete on all tables in schema public to authenticated, anon;" || {
  say "✗ не удалось выдать гранты"; exit 1
}

say "▸ Тесты"
failed=()
for t in isolation document_versions invitations claim_application write_roles; do
  file="$ROOT/tests/rls/$t.sql"
  if out=$("${PSQL[@]}" -tA -f "$file" 2>&1); then
    say "  ✓ $t"
  else
    failed+=("$t")
    say "  ✗ $t"
    # Печатаем только строку с причиной: полный вывод — это дамп значений,
    # в котором сообщение об ошибке потеряется.
    printf '%s\n' "$out" | grep -iE 'ERROR|ОШИБКА' | head -3 | sed 's/^/      /'
  fi
done

if [ ${#failed[@]} -gt 0 ]; then
  say ""
  say "✗ провалено: ${failed[*]}"
  exit 1
fi

say ""
say "✓ все RLS-тесты пройдены"

-- =====================================================================
-- T11 Vacancy Composer — Screen 1 (создание вакансии).
-- Новые поля вакансии для трёх слоёв: role-шаблоны, AI-черновик и
-- проверка качества. Все столбцы nullable/с дефолтом — существующие
-- строки не затрагиваются, RLS наследуется без изменений.
--
-- role_template  — id шаблона (напр. 'barista'); NULL если вакансия кастомная.
-- created_via    — как создана ваканс.: 'manual' | 'template' | 'ai' (аналитика).
-- clarity_score  — последний рассчитанный балл качества 0–100 (только аналитика,
--                  НИЧЕГО не гейтит — работодатель всегда может опубликовать).
-- scorecard      — «спящие» структурированные критерии найма ДЛЯ РОЛИ
--                  (не оценка кандидата). Метаданные уровня вакансии; правила —
--                  канонично в DEV_TASK §8. Ни один кандидат-фейсинг компонент
--                  их не читает: скоринга кандидатов в T11 нет.
-- Общая БД с Doki.id — правка совместима с обоими приложениями.
-- =====================================================================

alter table vacancies
  add column if not exists role_template  text,
  add column if not exists created_via    text not null default 'manual',
  add column if not exists clarity_score   integer,
  add column if not exists scorecard       jsonb not null default '[]';

do $$ begin
  alter table vacancies add constraint vacancies_created_via_check
    check (created_via in ('manual', 'template', 'ai'));
exception when duplicate_object then null; end $$;

do $$ begin
  alter table vacancies add constraint vacancies_clarity_score_range
    check (clarity_score is null or (clarity_score between 0 and 100));
exception when duplicate_object then null; end $$;

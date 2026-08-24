-- =====================================================================
-- Структурное резюме: секции опыта, обучения, навыков и языков.
--
-- Было: весь опыт работы — один текстовый абзац resumes.experience.
-- Стало: resumes.sections jsonb вида
--   { "experience": [...], "education": [...], "skills": [...], "languages": [...] }
-- Форма и нормализация — в lib/resume.ts.
--
-- Миграция аддитивная: старое поле experience остаётся и читается как
-- запасной вариант, RLS и гранты таблицы не меняются.
-- =====================================================================

alter table resumes
  add column if not exists sections jsonb not null default '{}'::jsonb;

comment on column resumes.sections is
  'Структурные секции резюме (experience/education/skills/languages). Схема — lib/resume.ts.';

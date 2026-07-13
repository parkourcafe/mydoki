-- PR-8 (фаза 1C): журнал AI-прогонов (требование EU AI Act — найм high-risk).
-- Аддитивно. Каждый существенный AI-вывод — строка здесь, с основаниями и
-- статусом ревью (Human Review Gate). Ни один прогон не влияет на статус
-- кандидата, пока reviewed_by IS NULL.
--
-- План отката: drop table if exists ai_runs;

create table if not exists ai_runs (
  id             uuid primary key default gen_random_uuid(),
  kind           text not null,           -- vacancy_structuring | evidence_extraction | completeness | consistency
  subject_type   text,                    -- vacancy | application
  subject_id     uuid,
  prompt_version text,
  model          text,
  input_digest   text,                    -- sha256 входа (не сам вход — PII не храним)
  output         jsonb not null default '{}'::jsonb,
  groundings     jsonb not null default '[]'::jsonb,  -- [{claim, source, quote, confidence}]
  state          text not null default 'completed'
                   check (state in ('queued','running','completed','failed','blocked','needs_review','reviewed')),
  reviewed_by    uuid,
  review_action  text check (review_action in ('accepted','edited','rejected')),
  created_by     uuid default auth.uid(),
  created_at     timestamptz not null default now()
);
create index if not exists ai_runs_subject_idx on ai_runs(subject_type, subject_id);
create index if not exists ai_runs_creator_idx on ai_runs(created_by, created_at desc);

alter table ai_runs enable row level security;

-- Автор (работодатель, инициировавший прогон) читает и обновляет свои
-- прогоны. Пишет — только через приложение с created_by = auth.uid().
create policy "ai_runs read own" on ai_runs for select
  using (created_by = (select auth.uid()));
create policy "ai_runs insert own" on ai_runs for insert
  with check (created_by = (select auth.uid()));
create policy "ai_runs update own" on ai_runs for update
  using (created_by = (select auth.uid()))
  with check (created_by = (select auth.uid()));

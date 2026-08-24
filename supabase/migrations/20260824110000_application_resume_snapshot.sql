-- =====================================================================
-- Снимок резюме, приложенный к отклику.
--
-- Было: работодатель видел в карточке кандидата только имя, WhatsApp, email,
-- ответы на скрининг и приложенные документы. Опыт работы не доходил до него
-- ни в каком виде — резюме использовалось лишь для предзаполнения формы.
--
-- Стало: кандидат может приложить к отклику СНИМОК своего резюме. Именно
-- снимок, а не ссылку на живую таблицу resumes: работодатель видит то, что
-- ему отправили, а последующие правки резюме в его копию не протекают.
--
-- Приватность: снимок создаёт только сам кандидат и только к своему отклику,
-- читает — он сам и работодатель этой вакансии; кандидат может удалить снимок.
-- =====================================================================

create table if not exists application_resumes (
  application_id uuid primary key references applications(id) on delete cascade,
  user_id        uuid not null references auth.users(id) on delete cascade,
  headline       text,
  location       text,
  about          text,
  sections       jsonb not null default '{}'::jsonb,
  created_at     timestamptz not null default now()
);

create index if not exists application_resumes_user_idx on application_resumes(user_id);

alter table application_resumes enable row level security;

-- Кандидат прикладывает снимок только к своему отклику и только от себя.
do $$ begin
  create policy "candidate attaches own resume snapshot" on application_resumes for insert
    with check (
      user_id = (select auth.uid())
      and application_id in (
        select id from applications where user_id = (select auth.uid())
      )
    );
exception when duplicate_object then null; end $$;

-- Кандидат видит, что именно он отправил.
do $$ begin
  create policy "candidate reads own resume snapshot" on application_resumes for select
    using (user_id = (select auth.uid()));
exception when duplicate_object then null; end $$;

-- Кандидат может отозвать снимок.
do $$ begin
  create policy "candidate deletes own resume snapshot" on application_resumes for delete
    using (user_id = (select auth.uid()));
exception when duplicate_object then null; end $$;

-- Работодатель читает снимки по откликам на свои вакансии — тот же принцип,
-- что для документов и ответов отклика.
do $$ begin
  create policy "employers read resume snapshots for own vacancies"
    on application_resumes for select
    using (application_id in (
      select id from applications where vacancy_id in (
        select id from vacancies where employer_id in (
          select id from employer_profiles where user_id = (select auth.uid())
        )
      )
    ));
exception when duplicate_object then null; end $$;

grant select, insert, delete on application_resumes to authenticated;

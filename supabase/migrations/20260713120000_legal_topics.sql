-- =====================================================================
-- P3-3 (фаза 3): Юридический информационный слой (арх. §13, §14). ОДНА
-- юрисдикция за запуск (Индонезия, 'ID'), КУРИРУЕМАЯ база: у каждой темы —
-- источник, версия, дата сверки, дисклеймер, маршрут к специалисту.
--
-- ВАЖНО: Doki.help НЕ даёт универсальных юридических заключений. Контент
-- курируется командой/юристом (наполняется вне UI, service_role). Здесь —
-- только СТРУКТУРА и read-модель; реальный правовой текст не выдумывается.
--
-- Аддитивно и совместимо с Doki.id: новая таблица; общих таблиц не трогаем.
--
-- План отката (rollback):
--   drop table if exists legal_topics;

create table if not exists legal_topics (
  id               uuid primary key default gen_random_uuid(),
  jurisdiction     text not null default 'ID',
  category         text not null default 'general'
                     check (category in ('employment','contract','work_permit',
                                         'probation','termination','wages','general')),
  slug             text not null,
  title            text not null,
  body             text,              -- курируемый контент (пусто до наполнения)
  source           text,             -- название закона/источника
  source_version   text,             -- редакция/версия источника
  source_url       text,
  reviewed_at      date,             -- дата сверки/обновления
  disclaimer       text,
  specialist_route text,             -- как связаться со специалистом
  published        boolean not null default false,
  sort             integer not null default 0,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  unique (jurisdiction, slug)
);
create index if not exists legal_topics_pub_idx
  on legal_topics(jurisdiction, published, sort);

alter table legal_topics enable row level security;

-- Чтение: только опубликованные темы (курирование гейтит выдачу). Запись —
-- НЕ через пользовательский UI: наполнение делает команда/юрист (service_role
-- обходит RLS). Пользовательских insert/update/delete-политик нет.
do $$ begin
  create policy "legal read published" on legal_topics for select
    using (published = true);
exception when duplicate_object then null; end $$;

grant select on legal_topics to authenticated;

-- Сид: неопубликованные заглушки-темы для Индонезии — это backlog структуры
-- (только метки-категории, БЕЗ юридического текста; published=false, поэтому
-- пользователям не видны, пока команда/юрист не наполнит и не опубликует).
insert into legal_topics (jurisdiction, category, slug, title, sort) values
  ('ID','contract','employment-contract','Трудовой договор (PKWT/PKWTT)', 1),
  ('ID','work_permit','work-permit-kitas','Разрешение на работу и KITAS', 2),
  ('ID','probation','probation-period','Испытательный срок', 3),
  ('ID','wages','minimum-wage','Минимальная оплата труда', 4),
  ('ID','termination','termination-basics','Прекращение трудовых отношений', 5),
  ('ID','general','how-to-use','Как пользоваться разделом', 0)
on conflict (jurisdiction, slug) do nothing;

-- =====================================================================
-- §3.1 Видео-скрининг (пилот). У вакансии — режим (off/optional/required)
-- и один вопрос. Кандидат записывает ответ (до 60 сек) в приватный bucket
-- video-screenings; файл регистрируется в application_documents как
-- document_type='video_intro' (переиспользуем чеклист и signed-URL).
-- Зеркалит политики bucket 'applications'. Общая БД — совместимо с Doki.id.
-- =====================================================================

alter table vacancies
  add column if not exists video_screening text not null default 'off',
  add column if not exists video_question text;

do $$ begin
  alter table vacancies add constraint vacancies_video_screening_check
    check (video_screening in ('off','optional','required'));
exception when duplicate_object then null; end $$;

-- Приватный bucket под видео (50 МБ, webm/mp4/mov).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'video-screenings', 'video-screenings', false, 52428800,
  array['video/webm','video/mp4','video/quicktime']
)
on conflict (id) do update set
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Загрузка: кто угодно грузит в папку активной вакансии {vacancy_id}/...
do $$ begin
  create policy "video public upload" on storage.objects for insert
    with check (
      bucket_id = 'video-screenings'
      and (storage.foldername(name))[1]::uuid in (select id from vacancies where status = 'active')
    );
exception when duplicate_object then null; end $$;

-- Чтение: только работодатель — владелец вакансии.
do $$ begin
  create policy "video owner read" on storage.objects for select
    using (
      bucket_id = 'video-screenings'
      and (storage.foldername(name))[1]::uuid in (
        select v.id from vacancies v
        join employer_profiles ep on ep.id = v.employer_id
        where ep.user_id = (select auth.uid())
      )
    );
exception when duplicate_object then null; end $$;

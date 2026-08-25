-- =====================================================================
-- Ограничения на bucket vault-files: размер файла и допустимые типы.
--
-- Было: у vault-files, самой чувствительной категории хранилища (паспорта,
-- медицинские документы), не было ни file_size_limit, ни allowed_mime_types —
-- в отличие от applications, employment-docs, portfolio-images,
-- video-screenings, у которых оба ограничения заданы с самого начала.
-- Приложение соблюдает свои клиентские проверки, но прямой вызов Storage API
-- с токеном самого пользователя их обходит: ограничение должно жить на
-- уровне bucket, а не только в форме загрузки.
--
-- Список mime-типов подобран по реальным данным (не наугад): на момент
-- миграции в document_files хранятся image/jpeg, application/pdf и
-- .docx (application/vnd.openxmlformats-officedocument.wordprocessingml.document,
-- 7 файлов) — все три должны продолжить загружаться. image/png добавлен как
-- прямой сосед jpeg под тем же UI-хинтом (accept="image/*,application/pdf"
-- в форме загрузки документа) — экранного скриншота или PNG-скана сейчас
-- нет, но отказ по типу для формата, который форма визуально разрешает,
-- был бы хуже, чем один разрешённый лишний тип.
--
-- Лимит размера — 10 МБ, тот же, что уже используется для applications и
-- employment-docs (совпадает с MAX_FILE_BYTES в lib/career.ts). Крупнейший
-- реальный файл на момент миграции — 4.8 МБ, двукратный запас достаточен.
--
-- Откат:
--   update storage.buckets set file_size_limit = null, allowed_mime_types = null
--   where id = 'vault-files';
-- =====================================================================

update storage.buckets
set
  file_size_limit = 10485760,
  allowed_mime_types = array[
    'application/pdf',
    'image/jpeg',
    'image/png',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
where id = 'vault-files';

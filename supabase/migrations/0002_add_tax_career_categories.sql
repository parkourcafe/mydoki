-- Добавляем категории документов «Работа и карьера» и «Налоги».
-- Аддитивно: только новые значения enum, существующие документы не затрагиваются.
-- (ALTER TYPE ... ADD VALUE нельзя использовать в той же транзакции, где значение
--  применяется; здесь мы лишь добавляем значения, поэтому безопасно.)

alter type doc_category add value if not exists 'career';
alter type doc_category add value if not exists 'tax';

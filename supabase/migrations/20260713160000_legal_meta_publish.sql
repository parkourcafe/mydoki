-- =====================================================================
-- Публикация ТОЛЬКО мета-темы «как пользоваться» (P3-3, юр-слой). Это НЕ
-- правовое утверждение — пояснение о самом разделе, поэтому безопасно
-- публиковать без юр-проверки. Реальные правовые темы (договор/виза/
-- испытательный/оплата/прекращение) остаются published=false до сверки
-- юристом (см. docs/legal/id-employment-drafts.md).
--
-- Тело показывается локализованно (lib/legal.howToUseText по локали
-- пользователя), поэтому в БД храним нейтральный маркер; дисклеймер и
-- маршрут к специалисту также локализуются на странице /my/legal.
--
-- Аддитивно (UPDATE существующей засеянной строки). Идемпотентно.
--
-- План отката (rollback):
--   update legal_topics set published = false
--   where jurisdiction = 'ID' and slug = 'how-to-use';

update legal_topics set
  published = true,
  body = coalesce(body, '(localized in app)'),
  reviewed_at = current_date,
  updated_at = now()
where jurisdiction = 'ID' and slug = 'how-to-use';

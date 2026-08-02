-- PR-7: внутренние заметки работодателя не видны кандидату в ленте
-- событий. Уточняет политику чтения, добавленную в PR-6 (не трогает
-- политики Doki.id). Кандидат видит смену этапа, запрос документов,
-- согласие и отзыв — но не type='note'.
--
-- План отката: вернуть политику к версии из 20260712160000.

drop policy if exists "app_events candidate read" on application_events;
create policy "app_events candidate read" on application_events for select
  using (
    type <> 'note'
    and application_id in (
      select id from applications where user_id = (select auth.uid())
    )
  );

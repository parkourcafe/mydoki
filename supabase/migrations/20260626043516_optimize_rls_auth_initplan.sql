-- Perf (advisor 0003 auth_rls_initplan): evaluate auth.uid() once per query
-- instead of once per row by wrapping it in a scalar subselect. Behaviour is
-- identical; only the query plan improves.
drop policy "ai_usage read own" on public.ai_usage;
create policy "ai_usage read own" on public.ai_usage
  for select using (user_id = (select auth.uid()));

drop policy "ai_usage insert own" on public.ai_usage;
create policy "ai_usage insert own" on public.ai_usage
  for insert with check (user_id = (select auth.uid()));

drop policy "login_events read own" on public.login_events;
create policy "login_events read own" on public.login_events
  for select using (user_id = (select auth.uid()));

drop policy "login_events insert own" on public.login_events;
create policy "login_events insert own" on public.login_events
  for insert with check (user_id = (select auth.uid()));

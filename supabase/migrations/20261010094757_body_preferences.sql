begin;
alter table public.body_entries drop constraint body_weight_range;
alter table public.body_entries add constraint body_weight_range check(weight_kg between 20 and 400 and weight_kg=round(weight_kg,8));
create table public.body_preferences (
 user_id uuid primary key references auth.users(id) on delete cascade,
 weight_unit text not null default 'kg' check(weight_unit in ('kg','lb')),
 height_cm numeric check(height_cm between 100 and 250)
);
alter table public.body_preferences enable row level security;
revoke all on public.body_preferences from public,anon,authenticated;
grant select,insert,update,delete on public.body_preferences to authenticated;
create policy body_preferences_select on public.body_preferences for select to authenticated using ((select auth.uid())=user_id);
create policy body_preferences_insert on public.body_preferences for insert to authenticated with check ((select auth.uid())=user_id);
create policy body_preferences_update on public.body_preferences for update to authenticated using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);
create policy body_preferences_delete on public.body_preferences for delete to authenticated using ((select auth.uid())=user_id);
commit;

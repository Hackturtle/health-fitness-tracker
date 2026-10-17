begin;
create table public.account_preferences (
 user_id uuid primary key references auth.users(id) on delete cascade,
 default_period text not null default 'month' check(default_period in ('today','week','month','year','all')),
 default_metric text not null default 'workouts' check(default_metric in ('workouts','sleep','body')),
 reduced_motion boolean not null default false
);
alter table public.account_preferences enable row level security;
revoke all on public.account_preferences from public,anon,authenticated;
grant select,insert,update,delete on public.account_preferences to authenticated;
create policy account_preferences_select on public.account_preferences for select to authenticated using ((select auth.uid())=user_id);
create policy account_preferences_insert on public.account_preferences for insert to authenticated with check ((select auth.uid())=user_id);
create policy account_preferences_update on public.account_preferences for update to authenticated using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);
create policy account_preferences_delete on public.account_preferences for delete to authenticated using ((select auth.uid())=user_id);
commit;

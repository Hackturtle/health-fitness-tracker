begin;
create table public.body_entries (
 id uuid primary key,
 user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
 logged_date date not null,
 weight_kg numeric not null,
 notes text not null default '' check(char_length(notes)<=1000),
 created_at timestamptz not null default now(),
 constraint body_weight_range check(weight_kg between 20 and 400 and weight_kg=round(weight_kg,1)),
 constraint body_valid_date check(isfinite(logged_date)),
 constraint body_one_per_day unique(user_id,logged_date)
);
alter table public.body_entries enable row level security;
revoke all on public.body_entries from public,anon,authenticated;
grant select,insert,update,delete on public.body_entries to authenticated;
create policy body_select_own on public.body_entries for select to authenticated using ((select auth.uid())=user_id);
create policy body_insert_own on public.body_entries for insert to authenticated with check ((select auth.uid())=user_id);
create policy body_update_own on public.body_entries for update to authenticated using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);
create policy body_delete_own on public.body_entries for delete to authenticated using ((select auth.uid())=user_id);
commit;

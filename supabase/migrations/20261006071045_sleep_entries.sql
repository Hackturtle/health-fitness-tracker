begin;
create table public.sleep_entries (
 id uuid primary key,
 user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
 bedtime timestamptz not null,
 wake_at timestamptz not null,
 wake_date date not null,
 time_zone text not null,
 quality text check (quality in ('Poor','Fair','Good','Great')),
 notes text not null default '' check (char_length(notes)<=1000),
 duration_minutes integer generated always as ((extract(epoch from (wake_at-bedtime))/60)::integer) stored,
 created_at timestamptz not null default now(),
 constraint sleep_positive_duration check (wake_at>bedtime and wake_at<=bedtime+interval '24 hours'),
 constraint sleep_wake_date_matches check (wake_date=(wake_at at time zone time_zone)::date),
 constraint sleep_not_future check (wake_at<=now()),
 constraint sleep_one_per_wake_day unique(user_id,wake_date)
);
alter table public.sleep_entries enable row level security;
revoke all on public.sleep_entries from public,anon,authenticated;
grant select,insert,update,delete on public.sleep_entries to authenticated;
create policy sleep_select_own on public.sleep_entries for select to authenticated using ((select auth.uid())=user_id);
create policy sleep_insert_own on public.sleep_entries for insert to authenticated with check ((select auth.uid())=user_id);
create policy sleep_update_own on public.sleep_entries for update to authenticated using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);
create policy sleep_delete_own on public.sleep_entries for delete to authenticated using ((select auth.uid())=user_id);
commit;

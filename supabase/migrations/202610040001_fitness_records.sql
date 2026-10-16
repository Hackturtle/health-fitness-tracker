-- Fitness OS v1. Apply to xooikuvxmwbqdtijaxls only.
-- Ordered exercises and sets are stored as one workout aggregate so saves are atomic.
-- This migration creates only Fitness OS objects; it does not touch existing tables.
begin;

create table public.fitness_records (
  id uuid primary key,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  kind text not null check (kind in ('workout', 'template', 'exercise')),
  payload jsonb not null,
  created_at timestamptz not null default now(),
  constraint fitness_payload_object check (jsonb_typeof(payload) = 'object'),
  constraint fitness_payload_id check (payload ? 'id' and payload->>'id' = id::text),
  constraint fitness_payload_size check (octet_length(payload::text) <= 262144),
  constraint fitness_payload_shape check (coalesce(case kind
    when 'workout' then payload->>'topic' = 'workouts'
      and jsonb_typeof(payload->'workout') = 'array'
      and length(payload->>'label') between 1 and 80
      and payload ?& array['topic','workout','label','date','value']
    when 'template' then jsonb_typeof(payload->'exercises') = 'array'
      and length(payload->>'name') between 1 and 80
      and payload ?& array['exercises','name']
    when 'exercise' then length(payload->>'name') between 1 and 80
      and payload ?& array['name','equipment','muscle','basis']
    else false end, false))
);
create index fitness_records_owner_kind on public.fitness_records(user_id, kind, created_at);
alter table public.fitness_records enable row level security;
revoke all on public.fitness_records from anon, authenticated;
grant select, insert, update, delete on public.fitness_records to authenticated;
create policy fitness_select_own on public.fitness_records for select to authenticated
  using ((select auth.uid()) = user_id);
create policy fitness_insert_own on public.fitness_records for insert to authenticated
  with check ((select auth.uid()) = user_id);
create policy fitness_update_own on public.fitness_records for update to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy fitness_delete_own on public.fitness_records for delete to authenticated
  using ((select auth.uid()) = user_id);

commit;

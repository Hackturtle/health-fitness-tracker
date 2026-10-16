begin;
create function public.valid_nutrition_food(v jsonb) returns boolean
language plpgsql immutable security invoker set search_path='' as $$
declare k text;
begin
 if jsonb_typeof(v) is distinct from 'object' then return false; end if;
 if jsonb_typeof(v->'name') is distinct from 'string' or length(btrim(v->>'name')) not between 1 and 100 then return false; end if;
 if coalesce(v->>'unit','') not in ('g','ml') or coalesce(v->>'preparation','') not in ('as_sold','raw','cooked') then return false; end if;
 foreach k in array array['kcal','protein','carbs','fat'] loop
  if jsonb_typeof(v->k) is distinct from 'number' then return false; end if;
  if (v->>k)::numeric < 0 or (v->>k)::numeric > (case when k='kcal' then 1000 else 100 end) then return false; end if;
 end loop;
 return true;
end $$;
create function public.valid_nutrition_payload(kind text,v jsonb) returns boolean
language plpgsql immutable security invoker set search_path='' as $$
declare item jsonb; seen text[]:='{}';
begin
 if kind='ingredient' then return public.valid_nutrition_food(v); end if;
 if kind not in ('meal','template') or jsonb_typeof(v) is distinct from 'object' then return false; end if;
 if jsonb_typeof(v->'name') is distinct from 'string' or length(btrim(v->>'name')) not between 1 and 100 then return false; end if;
 if jsonb_typeof(v->'notes') is distinct from 'string' or length(v->>'notes')>1000 then return false; end if;
 if jsonb_typeof(v->'items') is distinct from 'array' then return false; end if;
 if jsonb_array_length(v->'items') not between 1 and 50 then return false; end if;
 for item in select value from jsonb_array_elements(v->'items') loop
  if not public.valid_nutrition_food(item->'food') then return false; end if;
  if coalesce(item->>'id','') !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' or coalesce(item->>'foodId','') !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' then return false; end if;
  if item->>'id'=any(seen) then return false; end if; seen:=array_append(seen,item->>'id');
  if jsonb_typeof(item->'quantity') is distinct from 'number' then return false; end if;
  if (item->>'quantity')::numeric <=0 or (item->>'quantity')::numeric>10000 then return false; end if;
 end loop;
 return true;
end $$;
revoke all on function public.valid_nutrition_food(jsonb) from public,anon;
revoke all on function public.valid_nutrition_payload(text,jsonb) from public,anon;
grant execute on function public.valid_nutrition_food(jsonb),public.valid_nutrition_payload(text,jsonb) to authenticated;
create table public.nutrition_records (
 id uuid primary key,
 user_id uuid not null references auth.users(id) on delete cascade,
 kind text not null check(kind in ('ingredient','template','meal')),
 logged_date date,
 payload jsonb not null,
 constraint nutrition_date check((kind='meal' and logged_date is not null and logged_date>='1900-01-01') or (kind<>'meal' and logged_date is null)),
 constraint nutrition_payload check(public.valid_nutrition_payload(kind,payload))
);
create index nutrition_records_owner on public.nutrition_records(user_id,id);
alter table public.nutrition_records enable row level security;
revoke all on public.nutrition_records from public,anon,authenticated;
grant select,insert,update,delete on public.nutrition_records to authenticated;
create policy nutrition_select on public.nutrition_records for select to authenticated using ((select auth.uid())=user_id);
create policy nutrition_insert on public.nutrition_records for insert to authenticated with check ((select auth.uid())=user_id);
create policy nutrition_update on public.nutrition_records for update to authenticated using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);
create policy nutrition_delete on public.nutrition_records for delete to authenticated using ((select auth.uid())=user_id);
alter table public.account_preferences drop constraint account_preferences_default_metric_check;
alter table public.account_preferences add constraint account_preferences_default_metric_check check(default_metric in ('workouts','sleep','body','nutrition'));
commit;

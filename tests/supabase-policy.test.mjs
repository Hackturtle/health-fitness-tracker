import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { PGlite } from '@electric-sql/pglite';

// Execute the actual migration in local PostgreSQL; no live users or records are created.
const db=new PGlite();
const a='11111111-1111-4111-8111-111111111111';
const b='22222222-2222-4222-8222-222222222222';
const id='33333333-3333-4333-8333-333333333333';
const other='44444444-4444-4444-8444-444444444444';
await db.exec(`create role anon; create role authenticated; create schema auth;
 create table auth.users(id uuid primary key);
 create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
 grant usage on schema auth to authenticated;
 insert into auth.users values ('${a}'),('${b}');`);
await db.exec(await readFile(new URL('../supabase/migrations/202610040001_fitness_records.sql',import.meta.url),'utf8'));
const payload={id,topic:'workouts',label:'Leg day',date:'2026-10-04',value:1,workout:[{id:'movement',exercise:{id:'squat',name:'Squat',equipment:'Barbell',muscle:'Quads',basis:'Total weight'},basis:'Total weight',increment:2.5,sets:[{id:'set',kg:60,reps:8,kind:'working'}]}]};
const insert='insert into public.fitness_records(id,user_id,kind,payload) values($1,$2,$3,$4)';
async function user(who){await db.exec(`reset role; set role authenticated; set request.jwt.claim.sub='${who}';`);}
await user(a);
await db.query(insert,[id,a,'workout',JSON.stringify(payload)]);
assert.deepEqual((await db.query('select payload from fitness_records')).rows[0].payload,payload);
await db.query('update fitness_records set payload=$1 where id=$2',[JSON.stringify({...payload,label:'Updated'}),id]);
assert.equal((await db.query('select payload from fitness_records')).rows[0].payload.label,'Updated');
await user(b);
assert.equal((await db.query('select * from fitness_records')).rows.length,0);
assert.equal((await db.query('delete from fitness_records where id=$1 returning id',[id])).rows.length,0);
assert.equal((await db.query('update fitness_records set payload=$1 where id=$2 returning id',[JSON.stringify(payload),id])).rows.length,0);
await assert.rejects(db.query(insert,[other,a,'workout',JSON.stringify({...payload,id:other})]),/row-level security/);
await assert.rejects(db.query(insert+' on conflict(id) do update set payload=excluded.payload',[id,b,'workout',JSON.stringify(payload)]),/row-level security/);
await user(a);
await assert.rejects(db.query('update fitness_records set user_id=$1 where id=$2',[b,id]),/row-level security/);
await assert.rejects(db.query(insert,[other,a,'workout',JSON.stringify({...payload,id:other,workout:null})]),/fitness_payload_shape/);
// A failed template in the same statement must roll back the workout too.
await assert.rejects(db.query('insert into fitness_records(id,user_id,kind,payload) values($1,$2,$3,$4),($5,$2,$6,$7)',[other,a,'workout',JSON.stringify({...payload,id:other}),b,'template',JSON.stringify({id:b,name:'Bad'})]),/fitness_payload_shape/);
assert.equal((await db.query('select * from fitness_records where id=$1',[other])).rows.length,0);
await db.exec('reset role; set role anon;');
await assert.rejects(db.query('select * from fitness_records'),/permission denied/);
await user(a);
await db.query('delete from fitness_records where id=$1',[id]);
assert.equal((await db.query('select * from fitness_records')).rows.length,0);
await db.close();
console.log('PASS: migration, owner CRUD, cross-user isolation, anonymous denial, ownership transfer denial, payload checks and atomic rollback.');

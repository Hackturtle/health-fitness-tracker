"use client";
import { useCallback, useEffect, useRef, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { z } from 'zod';
import { supabase } from '@/lib/supabase';
import type { Entry } from '@/lib/fitness';
import type { Template } from '@/lib/workouts';
import type { Exercise } from '@/lib/exercises';

const exerciseSchema=z.object({id:z.string(),name:z.string(),equipment:z.string(),muscle:z.string(),basis:z.string()});
const movementSchema=z.object({id:z.string(),exercise:exerciseSchema,basis:z.string(),increment:z.number().positive(),sets:z.array(z.object({id:z.string(),kg:z.number().min(0).max(1500),reps:z.number().int().min(1).max(200),kind:z.enum(['warmup','working'])})).min(1).max(30)});
const schemas={
 workout:z.object({id:z.string().uuid(),topic:z.literal('workouts'),label:z.string().min(1).max(80),date:z.string().regex(/^\d{4}-\d{2}-\d{2}$/),value:z.literal(1),workout:z.array(movementSchema).min(1).max(30)}),
 template:z.object({id:z.string().uuid(),name:z.string().min(1).max(80),exercises:z.array(movementSchema).min(1).max(30)}),
 exercise:exerciseSchema.extend({id:z.string().uuid(),name:z.string().min(1).max(80)}),
};
type Kind=keyof typeof schemas;
type RecordRow={id:string;kind:Kind;payload:Entry|Template|Exercise};
function message(error:unknown){
 const e=error as {code?:string;message?:string};
 if(e.code==='PGRST205'||e.code==='42P01'||e.code==='42501')return 'Database setup is not complete. Your workout tables and access rules still need to be applied.';
 return e.message||'Could not reach your workout storage. Check your connection and retry.';
}
export function useWorkoutStore(){
 const [user,setUser]=useState<User|null>(null);
 const [authReady,setAuthReady]=useState(false);
 const [records,setRecords]=useState<RecordRow[]>([]);
 const [ready,setReady]=useState(false);
 const [error,setError]=useState('');
 const [revision,setRevision]=useState(0);
 const epoch=useRef(0);
 const owner=useRef<string|null>(null);
 useEffect(()=>{
  const {data:{subscription}}=supabase.auth.onAuthStateChange((_event,session)=>{
   const id=session?.user.id??null;
   if(owner.current!==id){owner.current=id;epoch.current++;setRecords([]);setReady(false);setError('');}
   setUser(session?.user??null);setAuthReady(true);
  });
  return ()=>subscription.unsubscribe();
 },[]);
 useEffect(()=>{
  setReady(false);setError('');
  if(!user)return;
  let cancelled=false;const version=epoch.current;
  async function load(){try{
   const rows:RecordRow[]=[];
   for(let start=0;;start+=500){
    const {data,error}=await supabase.from('fitness_records').select('id,kind,payload').eq('user_id',user!.id).order('created_at').order('id').range(start,start+499);
    if(error)throw error;
    for(const row of data??[]){
     if(!(row.kind in schemas))throw new Error('An unrecognised saved record was found. Please contact support before editing.');
     const parsed=schemas[row.kind as Kind].safeParse(row.payload);
     if(!parsed.success||parsed.data.id!==row.id)throw new Error('A saved record could not be read. Your records have not been changed.');
     rows.push({id:row.id,kind:row.kind,payload:parsed.data});
    }
    if((data??[]).length<500)break;
   }
   if(!cancelled&&version===epoch.current){setRecords(rows);setReady(true);}
  }catch(e){if(!cancelled&&version===epoch.current)setError(message(e));}}
  void load();return ()=>{cancelled=true;};
 },[user?.id,revision]);
 const save=useCallback(async (rows:RecordRow[])=>{
  if(!user||!ready||owner.current!==user.id)throw new Error('Your saved workouts are not ready. Please retry after loading.');
  const version=epoch.current;
  for(const row of rows)schemas[row.kind].parse(row.payload);
  const {error}=await supabase.from('fitness_records').upsert(rows.map(row=>({...row,user_id:user.id})),{onConflict:'id'});
  if(error)throw new Error(message(error));
  if(version!==epoch.current)throw new Error('Your account changed. Sign in again to check the saved workout.');
  setRecords(current=>[...current.filter(r=>!rows.some(row=>row.id===r.id)),...rows]);
 },[user?.id,ready]);
 const remove=useCallback(async(id:string)=>{
  if(!user||!ready||owner.current!==user.id)throw new Error('Your saved workouts are not ready.');
  const version=epoch.current;
  const {error}=await supabase.from('fitness_records').delete().eq('id',id).eq('user_id',user.id);
  if(error)throw new Error(message(error));
  if(version===epoch.current)setRecords(current=>current.filter(r=>r.id!==id));
 },[user?.id,ready]);
 return {user,authReady,ready,error,retry:()=>setRevision(n=>n+1),
  entries:records.filter(r=>r.kind==='workout').map(r=>r.payload as Entry),
  templates:records.filter(r=>r.kind==='template').map(r=>r.payload as Template),
  custom:records.filter(r=>r.kind==='exercise').map(r=>r.payload as Exercise),
  saveWorkout:(entry:Entry,template?:Template)=>save([{id:entry.id,kind:'workout',payload:entry},...(template?[{id:template.id,kind:'template' as const,payload:template}]:[])]),
  saveTemplate:(template:Template)=>save([{id:template.id,kind:'template',payload:template}]),
  saveCustom:(exercise:Exercise)=>save([{id:exercise.id,kind:'exercise',payload:exercise}]),remove};
}

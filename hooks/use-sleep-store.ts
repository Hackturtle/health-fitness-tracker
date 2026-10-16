"use client";
import {useEffect,useRef,useState} from 'react';
import {supabase} from '@/lib/supabase';
import {sleepEntry,sleepRowSchema} from '@/lib/sleep';
import type {Entry} from '@/lib/fitness';

function storageError(error:unknown){const e=error as {code?:string;message?:string};if(e.code==='23505')return 'An entry already exists for this wake-up date. Edit that entry instead.';if(e.code==='42P01'||e.code==='PGRST205')return 'Sleep storage is not ready yet. Please retry shortly.';return e.message||'Could not save sleep. Check your connection and retry.';}
export function useSleepStore(userId:string|undefined){
 const [state,setState]=useState<{owner?:string;entries:Entry[];ready:boolean;error:string}>({entries:[],ready:false,error:''});
 const [revision,setRevision]=useState(0);
 const owner=useRef(userId);owner.current=userId;
 useEffect(()=>{
  let cancelled=false;setState({owner:userId,entries:[],ready:false,error:''});
  if(!userId)return;
  void (async()=>{try{
   const entries:Entry[]=[];
   for(let start=0;;start+=500){
    const {data,error}=await supabase.from('sleep_entries').select('id,bedtime,wake_at,wake_date,time_zone,quality,notes,duration_minutes').eq('user_id',userId).order('wake_date').order('id').range(start,start+499);
    if(error)throw error;
    for(const row of data??[])entries.push(sleepEntry(sleepRowSchema.parse(row)));
    if((data??[]).length<500)break;
   }
   if(!cancelled&&owner.current===userId)setState({owner:userId,entries,ready:true,error:''});
  }catch(e){if(!cancelled&&owner.current===userId)setState({owner:userId,entries:[],ready:false,error:storageError(e)});}})();
  return ()=>{cancelled=true;};
 },[userId,revision]);
 const visible=state.owner===userId?state:{entries:[],ready:false,error:''};
 async function save(entry:Entry){
  if(!userId||owner.current!==userId||!visible.ready||!entry.sleep)throw new Error('Your sleep log is not ready. Please retry after loading.');
  const {data,error}=await supabase.from('sleep_entries').upsert({id:entry.id,user_id:userId,bedtime:entry.sleep.bedtime,wake_at:entry.sleep.wakeAt,wake_date:entry.date,time_zone:entry.sleep.timeZone,quality:entry.sleep.quality,notes:entry.sleep.notes},{onConflict:'id'}).select('id,bedtime,wake_at,wake_date,time_zone,quality,notes,duration_minutes').single();
  if(error)throw new Error(storageError(error));
  const saved=sleepEntry(sleepRowSchema.parse(data));
  if(owner.current!==userId)throw new Error('Your account changed. Sign in again to check the saved entry.');
  setState(s=>({...s,entries:[...s.entries.filter(e=>e.id!==saved.id),saved]}));
 }
 async function remove(id:string){
  if(!userId||owner.current!==userId||!visible.ready)throw new Error('Your sleep log is not ready.');
  const {data,error}=await supabase.from('sleep_entries').delete().eq('id',id).eq('user_id',userId).select('id');
  if(error)throw new Error(storageError(error));
  if(!data?.length)throw new Error('This entry was not found. Refresh to check your sleep log.');
  if(owner.current===userId)setState(s=>({...s,entries:s.entries.filter(e=>e.id!==id)}));
 }
 return {...visible,retry:()=>setRevision(n=>n+1),save,remove};
}

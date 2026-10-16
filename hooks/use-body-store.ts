"use client";
import {useEffect,useRef,useState} from 'react';
import {supabase} from '@/lib/supabase';
import {bodyEntry,bodyRowSchema} from '@/lib/body';
import type {Entry} from '@/lib/fitness';

function storageError(error:unknown){const e=error as {code?:string;message?:string};if(e.code==='23505')return 'An entry already exists for this date. Edit that entry instead.';if(e.code==='42P01'||e.code==='PGRST205')return 'Body storage is not ready yet. Please retry shortly.';return e.message||'Could not save your weigh-in. Check your connection and retry.';}
export function useBodyStore(userId:string|undefined){
 const [state,setState]=useState<{owner?:string;entries:Entry[];ready:boolean;error:string}>({entries:[],ready:false,error:''});
 const [revision,setRevision]=useState(0);
 const owner=useRef(userId);owner.current=userId;
 useEffect(()=>{
  let cancelled=false;setState({owner:userId,entries:[],ready:false,error:''});
  if(!userId)return;
  void (async()=>{try{
   const entries:Entry[]=[];
   for(let start=0;;start+=500){
    const {data,error}=await supabase.from('body_entries').select('id,logged_date,weight_kg,notes').eq('user_id',userId).order('logged_date').order('id').range(start,start+499);
    if(error)throw error;
    for(const row of data??[])entries.push(bodyEntry(bodyRowSchema.parse(row)));
    if((data??[]).length<500)break;
   }
   if(!cancelled&&owner.current===userId)setState({owner:userId,entries,ready:true,error:''});
  }catch(e){if(!cancelled&&owner.current===userId)setState({owner:userId,entries:[],ready:false,error:storageError(e)});}})();
  return ()=>{cancelled=true;};
 },[userId,revision]);
 const visible=state.owner===userId?state:{entries:[],ready:false,error:''};
 async function save(entry:Entry){
  if(!userId||owner.current!==userId||!visible.ready||!entry.body)throw new Error('Your body progress is not ready. Please retry after loading.');
  const {data,error}=await supabase.from('body_entries').upsert({id:entry.id,user_id:userId,logged_date:entry.date,weight_kg:entry.value,notes:entry.body.notes},{onConflict:'id'}).select('id,logged_date,weight_kg,notes').single();
  if(error)throw new Error(storageError(error));
  const saved=bodyEntry(bodyRowSchema.parse(data));
  if(owner.current!==userId)throw new Error('Your account changed. Sign in again to check the saved entry.');
  setState(s=>({...s,entries:[...s.entries.filter(e=>e.id!==saved.id),saved]}));
 }
 async function remove(id:string){
  if(!userId||owner.current!==userId||!visible.ready)throw new Error('Your body progress is not ready.');
  const {data,error}=await supabase.from('body_entries').delete().eq('id',id).eq('user_id',userId).select('id');
  if(error)throw new Error(storageError(error));
  if(!data?.length)throw new Error('This entry was not found. Refresh to check your body log.');
  if(owner.current===userId)setState(s=>({...s,entries:s.entries.filter(e=>e.id!==id)}));
 }
 return {...visible,retry:()=>setRevision(n=>n+1),save,remove};
}

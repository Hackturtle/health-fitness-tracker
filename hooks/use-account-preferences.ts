"use client";
import {useEffect,useRef,useState} from 'react';
import {z} from 'zod';
import {supabase} from '@/lib/supabase';
export const accountPreferenceSchema=z.object({default_period:z.enum(['today','week','month','year','all']),default_metric:z.enum(['workouts','sleep','body','nutrition']),reduced_motion:z.boolean()});
export type AccountPreferences=z.infer<typeof accountPreferenceSchema>;
export const defaultAccountPreferences:AccountPreferences={default_period:'month',default_metric:'workouts',reduced_motion:false};
export function useAccountPreferences(userId?:string){
 const owner=useRef(userId);owner.current=userId;
 const [state,setState]=useState<{owner?:string;value:AccountPreferences;ready:boolean;error:string}>({value:defaultAccountPreferences,ready:false,error:''});
 const [revision,setRevision]=useState(0);
 useEffect(()=>{let cancelled=false;setState({owner:userId,value:defaultAccountPreferences,ready:!userId,error:''});if(!userId)return;
 void(async()=>{try{const {data,error}=await supabase.from('account_preferences').select('default_period,default_metric,reduced_motion').eq('user_id',userId).maybeSingle();if(error)throw error;const value=data?accountPreferenceSchema.parse(data):defaultAccountPreferences;if(!cancelled&&owner.current===userId)setState({owner:userId,value,ready:true,error:''});}catch{if(!cancelled&&owner.current===userId)setState({owner:userId,value:defaultAccountPreferences,ready:false,error:'Could not load account settings. Please retry.'});}})();return()=>{cancelled=true};},[userId,revision]);
 const visible=state.owner===userId?state:{value:defaultAccountPreferences,ready:false,error:''};
 async function save(value:AccountPreferences){const validated=accountPreferenceSchema.parse(value);if(!userId||!visible.ready||owner.current!==userId)throw new Error('Your account settings are not ready.');const {error}=await supabase.from('account_preferences').upsert({user_id:userId,...validated});if(error)throw new Error('Could not save settings. Please retry.');if(owner.current!==userId)throw new Error('Your account changed. Reopen settings.');setState({owner:userId,value:validated,ready:true,error:''});}
 return {...visible,save,retry:()=>setRevision(n=>n+1)};
}

"use client";
import {useEffect,useRef,useState} from 'react';
import {supabase} from '@/lib/supabase';
import {type WeightUnit} from '@/lib/body';
export type BodyPreferences={unit:WeightUnit;heightCm:number|null};
export function useBodyPreferences(userId?:string){
 const owner=useRef(userId);owner.current=userId;
 const [state,setState]=useState<{owner?:string;value:BodyPreferences;ready:boolean;error:string}>({value:{unit:'kg',heightCm:null},ready:false,error:''});
 const [revision,setRevision]=useState(0);
 useEffect(()=>{let cancelled=false;setState({owner:userId,value:{unit:'kg',heightCm:null},ready:!userId,error:''});if(!userId)return;
 void (async()=>{const {data,error}=await supabase.from('body_preferences').select('weight_unit,height_cm').eq('user_id',userId).maybeSingle();if(cancelled||owner.current!==userId)return;setState({owner:userId,value:{unit:data?.weight_unit==='lb'?'lb':'kg',heightCm:data?.height_cm??null},ready:!error,error:error?'Could not load body settings. Retry before logging.':''});})();return()=>{cancelled=true};},[userId,revision]);
 const visible=state.owner===userId?state:{value:{unit:'kg' as WeightUnit,heightCm:null},ready:false,error:''};
 async function save(value:BodyPreferences){if(!visible.ready)throw new Error('Body settings are still loading.');if(userId){const {error}=await supabase.from('body_preferences').upsert({user_id:userId,weight_unit:value.unit,height_cm:value.heightCm});if(error)throw new Error('Could not save settings. Please retry.');}if(owner.current!==userId)throw new Error('Your account changed. Please reopen Body progress.');setState({owner:userId,value,ready:true,error:''});}
 return {...visible,save,retry:()=>setRevision(n=>n+1)};
}

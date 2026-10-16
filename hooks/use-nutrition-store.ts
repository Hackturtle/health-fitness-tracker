"use client";
import {useEffect,useRef,useState} from 'react';
import {supabase} from '@/lib/supabase';
import {decodeNutrition,nutritionRowSchema,foodSchema,mealSchema,validMealDate,type NutritionRow,type Food,type Meal} from '@/lib/nutrition';
const empty=()=>({ingredients:[],templates:[],entries:[]});
export function useNutritionStore(userId?:string){
 const owner=useRef(userId);owner.current=userId;
 const [state,setState]=useState<{owner?:string;rows:NutritionRow[];ready:boolean;error:string}>({rows:[],ready:false,error:''});const [revision,setRevision]=useState(0);
 useEffect(()=>{let cancelled=false;setState({owner:userId,rows:[],ready:!userId,error:''});if(!userId)return;
 void(async()=>{try{const rows:NutritionRow[]=[];for(let start=0;;start+=500){const {data,error}=await supabase.from('nutrition_records').select('id,kind,logged_date,payload').eq('user_id',userId).order('id').range(start,start+499);if(error)throw error;rows.push(...(data??[]).map(r=>nutritionRowSchema.parse(r)));if((data??[]).length<500)break;}decodeNutrition(rows);if(!cancelled&&owner.current===userId)setState({owner:userId,rows,ready:true,error:''});}catch{if(!cancelled&&owner.current===userId)setState({owner:userId,rows:[],ready:false,error:'Could not load nutrition. Please retry.'});}})();return()=>{cancelled=true};},[userId,revision]);
 const visible=state.owner===userId?state:{rows:[],ready:false,error:''};
 const decoded=visible.ready?decodeNutrition(visible.rows):empty();
 async function save(id:string,kind:NutritionRow['kind'],payload:Food|Meal,date:string|null=null){
  if(!userId||owner.current!==userId||!visible.ready)throw new Error('Your nutrition log is not ready.');
  const validated=kind==='ingredient'?foodSchema.parse(payload):mealSchema.parse(payload);
  if(kind==='meal'&&(!date||!validMealDate(date)))throw new Error('Choose today or an earlier valid date.');
  const {data,error}=await supabase.from('nutrition_records').upsert({id,user_id:userId,kind,logged_date:kind==='meal'?date:null,payload:validated},{onConflict:'id'}).select('id,kind,logged_date,payload').single();
  if(error)throw new Error('Could not save nutrition. Your draft is still here; please retry.');
  if(owner.current!==userId)throw new Error('Your account changed. Reopen nutrition to check the saved record.');
  const row=nutritionRowSchema.parse(data);decodeNutrition([row]);setState(s=>({...s,rows:[...s.rows.filter(r=>r.id!==id),row]}));
 }
 async function remove(id:string){if(!userId||owner.current!==userId||!visible.ready)throw new Error('Your nutrition log is not ready.');const {data,error}=await supabase.from('nutrition_records').delete().eq('user_id',userId).eq('id',id).select('id');if(error||!data?.length)throw new Error('Could not delete this record. Refresh and retry.');if(owner.current===userId)setState(s=>({...s,rows:s.rows.filter(r=>r.id!==id)}));}
 return {...decoded,ready:visible.ready,error:visible.error,save,remove,retry:()=>setRevision(n=>n+1)};
}

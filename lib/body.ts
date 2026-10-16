import {z} from 'zod';
export type WeightUnit='kg'|'lb';
export const fromKg=(kg:number,unit:WeightUnit)=>unit==='lb'?kg/0.45359237:kg;
export const toKg=(weight:number,unit:WeightUnit)=>unit==='lb'?Number((weight*0.45359237).toFixed(8)):weight;
export const bmi=(kg:number,heightCm:number)=>kg/(heightCm/100)**2;
export type BodyDraft={date:string;weight:string;notes:string};
export const bodyRowSchema=z.object({id:z.string().uuid(),logged_date:z.string(),weight_kg:z.number().min(20).max(400),notes:z.string().max(1000)});
export function validateBody(draft:BodyDraft,now=new Date(),unit:WeightUnit='kg'):string|null{
 const d=new Date(draft.date+'T12:00:00');
 const key=(v:Date)=>`${v.getFullYear()}-${String(v.getMonth()+1).padStart(2,'0')}-${String(v.getDate()).padStart(2,'0')}`;
 if(!/^\d{4}-\d{2}-\d{2}$/.test(draft.date)||!Number.isFinite(d.getTime())||key(d)!==draft.date)return 'Choose a valid date.';
 if(draft.date>key(now))return 'Choose today or an earlier date.';
 if(!/^\d+(\.\d)?$/.test(draft.weight)||toKg(Number(draft.weight),unit)<20||toKg(Number(draft.weight),unit)>400)return `Enter a weight from ${unit==='kg'?'20 to 400 kg':'44.1 to 881.8 lbs'}, with up to one decimal place.`;
 if(draft.notes.length>1000)return 'Keep notes within 1,000 characters.';
 return null;
}
export function bodyEntry(row:z.infer<typeof bodyRowSchema>){return {id:row.id,date:row.logged_date,topic:'body' as const,label:'Weigh-in',value:row.weight_kg,body:{notes:row.notes}};}

import { z } from 'zod';

export const sleepQualities=['Poor','Fair','Good','Great'] as const;
export type SleepDetails={bedtime:string;wakeAt:string;timeZone:string;quality:string|null;notes:string};
export type SleepDraft={bedtime:string;wakeAt:string;quality:string;notes:string};
export const sleepRowSchema=z.object({
 id:z.string().uuid(),bedtime:z.string(),wake_at:z.string(),wake_date:z.string(),
 time_zone:z.string(),quality:z.enum(sleepQualities).nullable(),notes:z.string().max(1000),
 duration_minutes:z.number().positive().max(1440),
});
export function localDateTime(d:Date){return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}T${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;}
export function durationMinutes(start:string,end:string){return Math.round((new Date(end).getTime()-new Date(start).getTime())/60000);}
export function formatDuration(hours:number){const minutes=Math.round(hours*60);return `${Math.floor(minutes/60)}h ${minutes%60}m`;}
export function validateSleep(draft:SleepDraft,now=new Date()):string|null{
 for(const value of [draft.bedtime,draft.wakeAt]){
  const parsed=new Date(value);
  if(!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)||!Number.isFinite(parsed.getTime())||localDateTime(parsed)!==value)return 'Choose valid dates and times. Some times do not exist when the clocks change.';
 }
 const minutes=durationMinutes(draft.bedtime,draft.wakeAt);
 if(minutes<=0)return 'Wake time must be after bedtime. Check both dates for an overnight entry.';
 if(minutes>1440)return 'Keep each entry within 24 hours. Please check the dates.';
 if(new Date(draft.wakeAt)>now)return 'Wake time cannot be in the future.';
 if(draft.quality&&!sleepQualities.includes(draft.quality as typeof sleepQualities[number]))return 'Choose a sleep quality or leave it blank.';
 if(draft.notes.length>1000)return 'Keep notes within 1,000 characters.';
 return null;
}
export function sleepEntry(row:z.infer<typeof sleepRowSchema>){
 return {id:row.id,date:row.wake_date,topic:'sleep' as const,label:row.quality?`${row.quality} sleep`:'Sleep entry',value:row.duration_minutes/60,
 sleep:{bedtime:row.bedtime,wakeAt:row.wake_at,timeZone:row.time_zone,quality:row.quality,notes:row.notes}};
}

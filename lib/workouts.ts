import { exerciseLibrary, type Exercise } from './exercises';
import type { Entry } from './fitness';
export type WorkoutSet={id:string;kg:number|null;reps:number|null;kind:'warmup'|'working'};
export type Movement={id:string;exercise:Exercise;basis:string;increment:number;sets:WorkoutSet[]};
export type Workout={name:string;date:string;exercises:Movement[]};
export type Template={id:string;name:string;exercises:Movement[]};
export const uid=()=>crypto.randomUUID();
export const newSet=():WorkoutSet=>({id:uid(),kg:null,reps:null,kind:'working'});
export function cloneMovements(exercises:Movement[]):Movement[]{return exercises.map(e=>({...e,id:uid(),exercise:{...e.exercise},sets:e.sets.map(s=>({...s,id:uid()}))}));}
export function fromEntry(entry:Entry):Movement[]{
 if(entry.workout)return cloneMovements(entry.workout);
 return (entry.sets??[]).map(s=>{const match=exerciseLibrary.find(e=>e.name.toLowerCase()===s.exercise.toLowerCase());const exercise=match??{id:'legacy-'+s.exercise.toLowerCase().replace(/\W+/g,'-'),name:s.exercise,equipment:'Machine',muscle:'Chest',basis:'Total weight'};return {id:uid(),exercise,basis:exercise.basis,increment:2.5,sets:[{id:uid(),kg:s.kg,reps:s.reps,kind:'working'}]};});
}
export function workingCount(entry:Entry){return entry.workout?entry.workout.reduce((n,e)=>n+e.sets.filter(s=>s.kind==='working').length,0):entry.sets?.length??0;}
export function validateWorkout(w:Workout,today:string):string|null{
 if(!w.name.trim())return 'Give your workout a name.';
 if(!/^\d{4}-\d{2}-\d{2}$/.test(w.date)||(!Number.isFinite(Date.parse(w.date+'T12:00:00Z'))||new Date(w.date+'T12:00:00Z').toISOString().slice(0,10)!==w.date)||w.date>today)return 'Choose a valid date, today or earlier.';
 if(!w.exercises.length)return 'Add at least one exercise.';
 for(const e of w.exercises){if(!e.sets.length)return `Add a set for ${e.exercise.name}.`;for(const s of e.sets){if(s.kg===null||!Number.isFinite(s.kg)||s.kg<0||s.kg>1500||s.reps===null||!Number.isInteger(s.reps)||s.reps<1||s.reps>200)return `Check the weight and reps for ${e.exercise.name}.`;}}
 return null;
}
export function previousMovement(entries:Entry[],movement:Movement,date:string,excludeId?:string){
 const sorted=[...entries].reverse().filter(e=>e.topic==='workouts'&&e.id!==excludeId&&e.date<=date).sort((a,b)=>b.date.localeCompare(a.date));
 for(const entry of sorted){const match=fromEntry(entry).find(e=>e.exercise.id===movement.exercise.id&&e.basis===movement.basis);if(match)return {date:entry.date,sets:match.sets};}return null;
}

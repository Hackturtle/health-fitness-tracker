"use client";

import { useEffect, useMemo, useState, type FormEvent, type CSSProperties } from 'react';
import { Activity, Dumbbell, Moon, Utensils, Scale, Plus, ChevronRight, Check, X, CalendarDays, Layers, FlaskConical } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Toaster, toast } from 'sonner';
import { AccountPanel } from '@/components/account-panel';
import { useWorkoutStore } from '@/hooks/use-workout-store';
import {NutritionLog} from '@/components/nutrition-log';
import {useNutritionStore} from '@/hooks/use-nutrition-store';
import {AccountSettings} from '@/components/account-settings';
import {useAccountPreferences} from '@/hooks/use-account-preferences';
import {getDateRange,inRange,dayNumber} from '@/lib/date-range';
import { useBodyPreferences } from '@/hooks/use-body-preferences';
import { fromKg } from '@/lib/body';
import { BodyLog } from '@/components/body-log';
import { useBodyStore } from '@/hooks/use-body-store';
import { SleepLog } from '@/components/sleep-log';
import { useSleepStore } from '@/hooks/use-sleep-store';
import { formatDuration } from '@/lib/sleep';
import { WorkoutBuilder } from '@/components/workout-builder';
import { workingCount } from '@/lib/workouts';
import { ScrollWireframe } from '@/components/scroll-wireframe';
import { makeDemo, summarize, dateKey, inPeriod, type Entry, type Topic, type Period } from '@/lib/fitness';

const topics = [
 {id:'workouts',name:'Workouts',tag:'TRAIN WITH INTENT',icon:Dumbbell,color:'#ad5273',tint:'#fcf0f5'},
 {id:'nutrition',name:'Nutrition',tag:'FUEL YOUR PROGRESS',icon:Utensils,color:'#267867',tint:'#edf9f3'},
 {id:'sleep',name:'Sleep',tag:'MAKE RECOVERY COUNT',icon:Moon,color:'#7860b0',tint:'#f4f0fc'},
 {id:'body',name:'Body progress',tag:'SEE THE BIGGER PICTURE',icon:Scale,color:'#237e8b',tint:'#edf9fb'},
] as const;
const periods: Period[]=['today','week','month','year','all'];
const periodNames={today:'Day',week:'Week',month:'Month',year:'Year',all:'All time'};
const dayLabel=(date:string)=>new Date(date+'T12:00:00').toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'});

export default function Home(){
 const [now,setNow]=useState<Date|null>(null);
 const [demoEntries,setEntries]=useState<Entry[]>([]);
 const store=useWorkoutStore();
 const sleepStore=useSleepStore(store.user?.id);
 const bodyStore=useBodyStore(store.user?.id);
 const nutritionStore=useNutritionStore(store.user?.id);
 const bodyPrefs=useBodyPreferences(store.user?.id);
 const accountPrefs=useAccountPreferences(store.user?.id);
 const bodyUnit=bodyPrefs.value.unit==='lb'?'lbs':'kg';
 const weightDisplay=(kg:number)=>fromKg(kg,bodyPrefs.value.unit).toFixed(1);
 const entries=store.user?[...store.entries,...sleepStore.entries,...bodyStore.entries,...nutritionStore.entries]:demoEntries;
 const [accountOpen,setAccountOpen]=useState(false);
 const [period,setPeriod]=useState<Period>('month');
 const [offset,setOffset]=useState(0);
 const [active,setActive]=useState<Topic|null>(null);
 const [metric,setMetric]=useState<Topic>('workouts');
 const [logging,setLogging]=useState(false);
 const [quality,setQuality]=useState('Good');
 const [date,setDate]=useState('');
 useEffect(()=>{const d=new Date();setNow(d);setEntries(makeDemo(d));setDate(dateKey(d));},[]);
 useEffect(()=>{const refresh=()=>setNow(new Date());window.addEventListener('focus',refresh);const timer=window.setInterval(refresh,60000);return()=>{window.removeEventListener('focus',refresh);window.clearInterval(timer)};},[]);
 useEffect(()=>{
  if(!('IntersectionObserver' in window))return;
  const observer=new IntersectionObserver(items=>{for(const item of items)item.target.classList.toggle('card-elevated',item.isIntersecting);},{threshold:.3});
  document.querySelectorAll('.topic-card').forEach(card=>observer.observe(card));
  return ()=>observer.disconnect();
 },[]);
 const earliest=entries.reduce((first,e)=>e.date<first?e.date:first,dateKey(now??new Date()));
 const range=getDateRange(period,offset,now??new Date(),earliest);
 const selected=useMemo(()=>now?entries.filter(e=>inRange(e.date,range)):[],[entries,range.start,range.end,now]);
 const stats=summarize(selected);
 const topic=topics.find(t=>t.id===active);
 const open=(id:Topic,log=false)=>{if(id==='body'&&!bodyPrefs.ready){toast.error(bodyPrefs.error||'Loading body settings…');return;}if(store.user&&id==='nutrition'&&!nutritionStore.ready){toast.error(nutritionStore.error||'Your nutrition log is still loading.');return;}if(store.user&&id==='body'&&!bodyStore.ready){toast.error(bodyStore.error||'Your body progress is still loading.');return;}if(store.user&&id==='sleep'&&!sleepStore.ready){toast.error(sleepStore.error||'Your sleep log is still loading.');return;}if(store.user&&id==='workouts'&&!store.ready){toast.error(store.error||'Your workouts are still loading.');return;}setActive(id);setLogging(log);setQuality('Good');setDate(dateKey(new Date()));};
 useEffect(()=>{
 if(store.user)return;
 const context=(document as unknown as {modelContext?:{registerTool:(tool:unknown,options:unknown)=>Promise<void>}}).modelContext;
 if(!context?.registerTool)return;
 const lifecycle=new AbortController();
 Promise.resolve(context.registerTool({name:'read_fitness_demo_summary',description:'Read the visible fitness prototype summary. All records are demo data, not actual health records.',inputSchema:{type:'object',properties:{},additionalProperties:false},annotations:{readOnlyHint:true},execute:()=>({period,demo:true,...stats})},{signal:lifecycle.signal})).catch(()=>{});
 return ()=>lifecycle.abort();
 },[store.user,period,stats.workouts,stats.sleep,stats.calories,stats.weight]);
 useEffect(()=>{setActive(null);setMetric('workouts');setPeriod('month');setOffset(0);},[store.user?.id]);
 useEffect(()=>{if(store.user&&accountPrefs.ready){setPeriod(accountPrefs.value.default_period);setMetric(accountPrefs.value.default_metric);setOffset(0)}},[store.user?.id,accountPrefs.ready,accountPrefs.value]);
 useEffect(()=>{document.documentElement.classList.toggle('reduce-motion',accountPrefs.value.reduced_motion);return()=>document.documentElement.classList.remove('reduce-motion')},[accountPrefs.value.reduced_motion]);
 function save(event:FormEvent<HTMLFormElement>){
 event.preventDefault();if(!active||!now)return;
 const form=new FormData(event.currentTarget); const n=(key:string)=>Number(form.get(key));
 if(!date||date>dateKey(new Date()))return toast.error('Choose today or an earlier date.');
 const base={id:crypto.randomUUID(),date,topic:active};let entry:Entry;
 if(active==='nutrition')entry={...base,label:String(form.get('name')).trim(),value:n('calories'),protein:n('protein'),carbs:n('carbs'),fat:n('fat')};
 else if(active==='sleep')entry={...base,label:quality+' sleep',value:n('hours')};
 else entry={...base,label:'Weigh-in',value:n('weight')};
 if(!entry.label||!Number.isFinite(entry.value)||entry.value<=0)return toast.error('Please check your entry.');
 setEntries(current=>[...current,entry]);setLogging(false);toast.success('Added to the demo. Entries reset on refresh.');
 }
 const chartEntries=selected.filter(e=>e.topic===metric).sort((a,b)=>a.date.localeCompare(b.date));
 const grouped=Object.entries(chartEntries.reduce<Record<string,number[]>>((a,e)=>{(a[e.date]??=[]).push(e.value);return a},{}));
 const points=grouped.map(([date,values])=>({date,value:metric==='workouts'?values.length:metric==='nutrition'?values.reduce((a,b)=>a+b,0):metric==='body'?fromKg(values.reduce((a,b)=>a+b,0)/values.length,bodyPrefs.value.unit):values.reduce((a,b)=>a+b,0)/values.length}));
 const chartMax=Math.max(1,...points.map(p=>p.value));
 const min=metric==='body'&&points.length?Math.floor(Math.min(...points.map(p=>p.value))-1):0;
 const chartTop=metric==='body'?Math.ceil(chartMax+1):Math.ceil(chartMax*1.15);
 const start=new Date(range.start+'T12:00:00');
 const startTime=dayNumber(range.start),endTime=dayNumber(range.end);
 const coords=points.map(p=>({x:range.start===range.end?340:38+(dayNumber(p.date)-startTime)/Math.max(1,endTime-startTime)*604,y:180-(p.value-min)/(chartTop-min)*145,...p}));
 const graphUnit=metric==='workouts'?'Sessions per day':metric==='sleep'?'Time in bed · hours':metric==='nutrition'?'Calories · kcal per day':`Weight · ${bodyUnit}`;
 const recent=[...selected].reverse().sort((a,b)=>b.date.localeCompare(a.date)).slice(0,4);
 return <><Toaster position="top-center"/><header className="topbar"><a className="brand" href="/" aria-label="Fitness OS home"><span className="brand-mark"><Activity size={23}/></span>FITNESS<span className="os">OS</span></a><span className="header-note">YOUR PERSONAL TRAINING SPACE</span><button className="secondary account-button" onClick={()=>setAccountOpen(true)} disabled={!store.authReady}>{!store.authReady?"Loading…":store.user?"Account":"Sign in"}</button></header>
 <ScrollWireframe reduceMotion={accountPrefs.value.reduced_motion}/><div className="ambient-grid" aria-hidden="true"><svg viewBox="0 0 1200 850" preserveAspectRatio="xMidYMid slice"><g className="ambient-network"><path d="M20 140 120 90 205 155 175 270 50 310 20 140M120 90 280 45 360 170 205 155M50 310 100 470 245 405 175 270M100 470 30 640 190 720 245 405M190 720 330 810 400 665M910 50 1030 130 1150 90 1180 260 1050 310 1030 130M910 50 845 215 930 365 1050 310M930 365 865 530 1010 615 1120 520 1050 310M1010 615 1100 775 1180 700 1120 520"/>{[[20,140],[120,90],[205,155],[175,270],[50,310],[280,45],[360,170],[100,470],[245,405],[30,640],[190,720],[330,810],[400,665],[910,50],[1030,130],[1150,90],[1180,260],[1050,310],[845,215],[930,365],[865,530],[1010,615],[1120,520],[1100,775],[1180,700]].map(([x,y],i)=><circle key={i} cx={x} cy={y} r={i%3===0?2.8:1.8}/>)}</g></svg></div><main className="shell"><div className="page-heading"><div><p className="eyebrow">YOUR OVERVIEW</p><h1>Every day adds up<span>.</span></h1><p className="subhead">Training, fuel and recovery. All in one place.</p></div><div className="date-label"><CalendarDays size={17}/>{now?now.toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric'}):'Loading your overview'}</div></div>
 <div className="demo-note"><FlaskConical size={17}/><span>{store.user?<><b>Your personal logbook</b> · {store.ready?"Workouts, nutrition, sleep and body progress save to your account.":store.error||"Loading your saved workouts…"}</>:<><b>Interactive demo</b> · Sample data. Sign in to start your own saved logbook.</>}</span>{store.user&&store.error?<button className="text-button" onClick={store.retry}>Retry</button>:!store.user&&<button className="text-button" disabled={!store.authReady} onClick={()=>setAccountOpen(true)}>Sign in</button>}</div>
 <div className="section-toolbar date-toolbar"><Tabs value={period} onValueChange={v=>{setPeriod(v as Period);setOffset(0)}}><TabsList className="period-tabs date-tabs">{periods.map(p=><TabsTrigger key={p} value={p}>{periodNames[p]}</TabsTrigger>)}</TabsList></Tabs><div className="date-navigation">{period!=='all'&&<button className="secondary date-arrow" aria-label="Previous period" onClick={()=>setOffset(n=>n-1)}>‹</button>}<span className="range-label" aria-live="polite">{now?range.label:'Loading dates…'}</span>{period!=='all'&&<button className="secondary date-arrow" aria-label="Next period" disabled={offset===0} onClick={()=>setOffset(n=>Math.min(0,n+1))}>›</button>}</div>{offset<0&&period!=='all'&&<button className="text-button" onClick={()=>setOffset(0)}>Back to current {period==='today'?'day':period}</button>}</div>
 <div className="cards">{topics.map(t=>{const Icon=t.icon;let value:string,unit:string,detail:string;
 if(t.id==='workouts'){value=String(stats.workouts);unit=stats.workouts===1?'session':'sessions';detail=`${stats.sets} working sets logged`;}
 else if(t.id==='nutrition'){value=selected.some(e=>e.topic==='nutrition')?Math.round(stats.calories).toLocaleString():'—';unit='kcal / logged day';detail=selected.some(e=>e.topic==='nutrition')?`${Math.round(stats.protein)} g protein / logged day`:'No meals logged in this period';}
 else if(t.id==='sleep'){value=stats.sleep?formatDuration(stats.sleep):'—';unit='average time in bed';detail=`${stats.nights} ${stats.nights===1?'night':'nights'} logged`;}
 else {value=stats.weight?weightDisplay(stats.weight):'—';unit=`${bodyUnit} · latest`;detail=stats.change===null?'Log two weigh-ins to see change':`${stats.change>0?'+':''}${weightDisplay(stats.change)} ${bodyUnit} in this period`;}

 return <button className={'topic-card '+t.id} style={{'--topic':t.color,'--tint':t.tint} as CSSProperties} key={t.id} onClick={()=>open(t.id)}><div className="card-top"><span className="topic-icon"><Icon size={25}/></span><ChevronRight size={20}/></div><p className="card-tag">{t.tag}</p><h2>{t.name}</h2><div className="card-value">{value}<span>{unit}</span></div><div className="card-bottom"><span>{detail}</span><span className="open-label">Open</span></div></button>})}</div>
 <div className="lower-grid"><section className="panel chart-panel"><div className="panel-heading"><div><p className="eyebrow">THE LONG VIEW</p><h2>Your progress</h2></div><Select value={metric} onValueChange={v=>setMetric(v as Topic)}><SelectTrigger aria-label="Progress metric"><SelectValue/></SelectTrigger><SelectContent>{topics.map(t=><SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}</SelectContent></Select></div><div className="chart-caption"><span>{graphUnit}</span><span>{range.label}</span></div>{points.length?<><svg className="chart" viewBox="0 0 680 215" role="img" aria-label={`${graphUnit}, ${range.label}. ${points.length} days recorded. Exact values available below.`}>{[0,1,2,3].map(i=><g key={i}><line x1="38" x2="642" y1={35+i*145/3} y2={35+i*145/3} stroke="#e7e9eb" strokeDasharray="4 5"/><text x="0" y={40+i*145/3} fontSize="12" fill="#707780">{(chartTop-i*(chartTop-min)/3).toFixed(metric==='workouts'?0:1)}</text></g>)}{metric==='workouts'?coords.map(p=><rect key={p.date} x={p.x-5} y={p.y} width={10} height={180-p.y} rx="4" fill="#68bec4"><title>{dayLabel(p.date)}: {p.value} sessions</title></rect>):<><polyline points={coords.map(p=>`${p.x},${p.y}`).join(' ')} fill="none" stroke={metric==='sleep'?'#8366c2':'#389ba5'} strokeWidth="3" strokeLinejoin="round"/>{coords.map(p=><circle key={p.date} cx={p.x} cy={p.y} r="3" fill={metric==='sleep'?'#8366c2':'#389ba5'}><title>{dayLabel(p.date)}: {p.value.toFixed(1)}</title></circle>)}</>}<text x="38" y="208" fontSize="12" fill="#707780">{dayLabel(dateKey(start))}</text><text x="642" y="208" textAnchor="end" fontSize="12" fill="#707780">{now?dayLabel(range.end):''}</text></svg><details className="chart-data"><summary>View recorded values</summary><ul>{points.map(p=><li key={p.date}><span>{dayLabel(p.date)}</span><b>{p.value.toFixed(metric==='workouts'?0:1)} {metric==='sleep'?'h':metric==='body'?bodyUnit:metric==='nutrition'?'kcal':'sessions'}</b></li>)}</ul></details></>:<div className="empty"><Activity/><p>No entries for this period yet.</p><button className="text-button" onClick={()=>open(metric,true)}>{store.user?(metric==='sleep'?"Log your first sleep":metric==='body'?"Log your first weight":metric==='nutrition'?"Log your first meal":"Add your first workout"):"Add your first demo entry"}</button></div>}</section>
 <section className="panel activity-panel"><div className="panel-heading"><div><p className="eyebrow">IN THE LOGBOOK</p><h2>Recent activity</h2></div><Layers size={20}/></div><div className="activity-list">{recent.length?recent.map(e=>{const t=topics.find(t=>t.id===e.topic)!;const Icon=t.icon;return <button key={e.id} onClick={()=>open(e.topic)} className="activity-item"><span className="small-icon" style={{color:t.color,background:t.tint}}><Icon size={19}/></span><span><b>{e.label}</b><small>{dayLabel(e.date)} · {e.topic==='workouts'?`${workingCount(e)} working sets`:e.topic==='nutrition'?`${e.value} kcal`:e.topic==='sleep'?`${e.value} hours`:`${weightDisplay(e.value)} ${bodyUnit}`}</small></span><ChevronRight size={16}/></button>}):<p className="empty">Nothing logged in this period.</p>}</div></section></div>
 <footer><span><Activity size={15}/> FITNESS OS <span className="version">/ FIRST EDITION</span></span><span>One session at a time.</span></footer></main>
 {store.user&&sleepStore.error&&<div className="sleep-load-error" role="alert">{sleepStore.error}<button className="text-button" onClick={sleepStore.retry}>Retry sleep</button></div>}
 <SleepLog key={'sleep-'+(store.user?.id??'demo')} open={active==='sleep'} onClose={()=>setActive(null)} entries={entries} period={period} range={range} persisted={!!store.user} onSave={async entry=>{if(store.user)await sleepStore.save(entry);else setEntries(current=>[...current.filter(e=>e.id!==entry.id),entry]);}} onDelete={async id=>{if(store.user)await sleepStore.remove(id);else setEntries(current=>current.filter(e=>e.id!==id));}}/>
 {store.user&&bodyStore.error&&<div className="sleep-load-error" role="alert">{bodyStore.error}<button className="text-button" onClick={bodyStore.retry}>Retry body progress</button></div>}
 {bodyPrefs.error&&<div className="sleep-load-error" role="alert">{bodyPrefs.error}<button className="text-button" onClick={bodyPrefs.retry}>Retry settings</button></div>}
 <BodyLog preferences={bodyPrefs.value} onPreferences={bodyPrefs.save} key={'body-'+(store.user?.id??'demo')} open={active==='body'} onClose={()=>setActive(null)} entries={entries} period={period} range={range} persisted={!!store.user} onSave={async entry=>{if(store.user)await bodyStore.save(entry);else setEntries(current=>[...current.filter(e=>e.id!==entry.id),entry]);}} onDelete={async id=>{if(store.user)await bodyStore.remove(id);else setEntries(current=>current.filter(e=>e.id!==id));}}/>
 {store.user&&nutritionStore.error&&<div className="sleep-load-error" role="alert">{nutritionStore.error}<button className="text-button" onClick={nutritionStore.retry}>Retry nutrition</button></div>}
 {store.user&&<NutritionLog key={'nutrition-'+store.user.id} open={active==='nutrition'} onClose={()=>setActive(null)} store={nutritionStore} range={range}/>}
 <AccountPanel user={store.user} open={accountOpen} onClose={()=>setAccountOpen(false)}>{store.user&&<AccountSettings key={store.user.id} entries={entries} range={range} exportReady={store.ready&&sleepStore.ready&&bodyStore.ready&&nutritionStore.ready&&bodyPrefs.ready} value={accountPrefs.value} ready={accountPrefs.ready} error={accountPrefs.error} onSave={accountPrefs.save} onRetry={accountPrefs.retry} body={bodyPrefs.value} bodyReady={bodyPrefs.ready} onBodySave={bodyPrefs.save}/>}</AccountPanel>
 <WorkoutBuilder key={store.user?.id??'demo'} open={active==='workouts'} onClose={()=>setActive(null)} entries={entries} period={period} range={range} persistence={store.user?{templates:store.templates,custom:store.custom,saveTemplate:store.saveTemplate,saveCustom:store.saveCustom,remove:store.remove}:undefined} onSave={async(entry,template)=>{if(store.user)await store.saveWorkout(entry,template);else setEntries(current=>current.some(e=>e.id===entry.id)?current.map(e=>e.id===entry.id?entry:e):[...current,entry]);}} onDelete={async id=>{if(store.user)await store.remove(id);else setEntries(current=>current.filter(e=>e.id!==id));}}/><Dialog open={!store.user&&active!==null&&active!=='workouts'&&active!=='sleep'&&active!=='body'} onOpenChange={v=>{if(!v)setActive(null)}}><DialogContent className="detail-dialog"><DialogTitle className="detail-title">{topic?.name}{logging?' · New entry':''}</DialogTitle><DialogDescription>{logging?'Try the logging flow. This entry will only last until the page refreshes.':`${range.label} · Demo logbook`}</DialogDescription>{active&&(!logging?<><button className="primary" onClick={()=>setLogging(true)}><Plus size={18}/> {active==='workouts'?'Start workout':'Add entry'}</button><div className="history">{selected.filter(e=>e.topic===active).sort((a,b)=>b.date.localeCompare(a.date)).map(e=><article key={e.id}><div><b>{e.label}</b><span>{dayLabel(e.date)}</span></div>{e.sets?<ul>{e.sets.map((s,i)=><li key={i}><span>{s.exercise}</span><b>{s.kg} kg × {s.reps}</b></li>)}</ul>:<p>{e.topic==='nutrition'?`${e.value} kcal · ${e.protein??0} g protein · ${e.carbs??0} g carbs · ${e.fat??0} g fat`:`${e.value} ${e.topic==='sleep'?'hours':'kg'}`}</p>}</article>)}{!selected.some(e=>e.topic===active)&&<p className="empty">No entries in this period. Add one to try it out.</p>}</div></>:<form onSubmit={save} className="entry-form"><label>Date<input type="date" value={date} onChange={e=>setDate(e.target.value)} max={dateKey(new Date())} required/></label>{active==='nutrition'?<><label>Meal name<input name="name" placeholder="e.g. Chicken, rice & vegetables" required maxLength={80}/></label><div className="field-grid">{[['calories','Calories (kcal)'],['protein','Protein (g)'],['carbs','Carbohydrates (g)'],['fat','Fat (g)']].map(([name,label])=><label key={name}>{label}<input name={name} type="number" step="1" min={name==='calories'?1:0} max={name==='calories'?10000:1000} defaultValue={name==='calories'?undefined:0} required/></label>)}</div></>:active==='sleep'?<><label>Hours slept<input name="hours" type="number" step="0.25" min="0.25" max="24" placeholder="7.5" required/></label><label>How did you sleep?</label><Select value={quality} onValueChange={setQuality}><SelectTrigger aria-label="Sleep quality"><SelectValue/></SelectTrigger><SelectContent>{['Poor','Fair','Good','Great'].map(q=><SelectItem key={q} value={q}>{q}</SelectItem>)}</SelectContent></Select></>:<label>Bodyweight (kg)<input name="weight" type="number" min="20" max="400" step="0.1" placeholder="80.0" required/></label>}<div className="form-actions"><button type="button" className="secondary" onClick={()=>setLogging(false)}>Back</button><button className="primary" type="submit"><Check size={17}/> Add to demo</button></div></form>)}</DialogContent></Dialog>
 </>;
}

export type Period='today'|'week'|'month'|'year'|'all';
export type DateRange={start:string;end:string;label:string};
export const dateKey=(d:Date)=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
const label=(d:Date)=>d.toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'});
export function getDateRange(period:Period,offset:number,now:Date,earliest?:string):DateRange{
 const today=new Date(now.getFullYear(),now.getMonth(),now.getDate(),12);let start=new Date(today),end=new Date(today);
 if(period==='all'){const first=earliest&&earliest<dateKey(today)?earliest:dateKey(today);return {start:first,end:dateKey(today),label:'All time'};}
 if(period==='today'){start.setDate(start.getDate()+offset);end=new Date(start);}
 if(period==='week'){start.setDate(start.getDate()-((start.getDay()+6)%7)+offset*7);end=new Date(start);end.setDate(end.getDate()+6);}
 if(period==='month'){start=new Date(today.getFullYear(),today.getMonth()+offset,1,12);end=new Date(start.getFullYear(),start.getMonth()+1,0,12);}
 if(period==='year'){start=new Date(today.getFullYear()+offset,0,1,12);end=new Date(start.getFullYear(),11,31,12);}
 if(end>today)end=today;
 const text=period==='today'?(offset===0?'Today':label(start)):`${label(start)} – ${label(end)}${offset===0?' · to date':''}`;
 return {start:dateKey(start),end:dateKey(end),label:text};
}
export const inRange=(date:string,range:DateRange)=>date>=range.start&&date<=range.end;
// Calendar-day coordinates remain equally spaced across daylight-saving changes.
export const dayNumber=(date:string)=>{const [y,m,d]=date.split('-').map(Number);return Date.UTC(y,m-1,d)/86400000;};

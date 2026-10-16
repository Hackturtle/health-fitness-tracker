import {zipSync,unzipSync,strToU8,strFromU8} from 'fflate';
import type {Entry} from './fitness';
import {preparations} from './nutrition';
import {workingCount} from './workouts';
import {fromKg,bmi,type WeightUnit} from './body';
import {inRange,type DateRange,dayNumber} from './date-range';
type Cell=string|number|null;
type Formula={formula:string;value:Cell};
type ExportCell=Cell|Formula;
export type ExportOptions={range:DateRange;unit:WeightUnit;heightCm:number|null};
const headers={nutrition:['Date','Meal','Ingredient','Food state','Amount','Unit','Calories (kcal)','Protein (g)','Carbs (g)','Fat (g)','Meal notes','Meal ID','Kcal per 100','Protein per 100','Carbs per 100','Fat per 100','Ingredient ID'],workouts:['Date','Session','Exercise','Equipment','Muscle','Weight basis','Exercise order','Set','Set type','Weight','Unit','Reps','Session ID','Exercise ID','Set ID'],sleep:['Wake date','Bedtime (local)','Wake time (local)','Timezone','Time in bed (hours)','Quality','Notes','Entry ID'],body:['Date','Weight','Unit','Height (cm)','BMI','Notes','Entry ID']};
const label=(date:string)=>new Date(date+'T12:00:00').toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'});
function localTime(iso:string,zone:string){return new Intl.DateTimeFormat('sv-SE',{timeZone:zone,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).format(new Date(iso));}
export function exportData(entries:Entry[],options:ExportOptions){
 const selected=entries.filter(e=>inRange(e.date,options.range)).sort((a,b)=>a.date.localeCompare(b.date)||a.id.localeCompare(b.id));
 const workouts:Cell[][]=[],sleep:Cell[][]=[],body:Cell[][]=[],nutrition:Cell[][]=[];const nutritionDaily=new Map<string,number>();const daily=new Map<string,number>();
 for(const e of selected){
  if(e.topic==='workouts'){daily.set(e.date,(daily.get(e.date)??0)+1);if(e.workout){e.workout.forEach((m,mi)=>m.sets.forEach((s,si)=>workouts.push([e.date,e.label,m.exercise.name,m.exercise.equipment,m.exercise.muscle,m.basis,mi+1,si+1,s.kind,s.kg,'kg',s.reps,e.id,m.exercise.id,s.id])));}else (e.sets??[]).forEach((s,i)=>workouts.push([e.date,e.label,s.exercise,'','','Recorded kg',i+1,1,'working',s.kg,'kg',s.reps,e.id,'','']));}
  if(e.topic==='nutrition'){nutritionDaily.set(e.date,(nutritionDaily.get(e.date)??0)+e.value);for(const item of e.nutrition?.items??[]){const f=item.food,q=item.quantity/100;nutrition.push([e.date,e.label,f.name,preparations[f.preparation],item.quantity,f.unit,f.kcal*q,f.protein*q,f.carbs*q,f.fat*q,e.nutrition?.notes??'',e.id,f.kcal,f.protein,f.carbs,f.fat,item.foodId]);}}
  if(e.topic==='sleep')sleep.push([e.date,e.sleep?localTime(e.sleep.bedtime,e.sleep.timeZone):'',e.sleep?localTime(e.sleep.wakeAt,e.sleep.timeZone):'',e.sleep?.timeZone??'',e.value,e.sleep?.quality??'',e.sleep?.notes??'',e.id]);
  if(e.topic==='body')body.push([e.date,fromKg(e.value,options.unit),options.unit==='lb'?'lbs':'kg',options.heightCm,options.heightCm?bmi(e.value,options.heightCm):null,e.body?.notes??'',e.id]);
 }
 return {workouts,sleep,body,nutrition,nutritionDaily:[...nutritionDaily].map(([date,n])=>[label(date),n,date] as [string,number,string]),daily:[...daily].map(([date,n])=>[label(date),n] as [string,number]),sessions:selected.filter(e=>e.topic==='workouts').length,sets:selected.filter(e=>e.topic==='workouts').reduce((n,e)=>n+workingCount(e),0)};
}
// CSV spreadsheet viewers must not execute user-entered names or notes as formulas.
export function csv(rows:Cell[][]){return '\ufeff'+rows.map(row=>row.map(value=>{let s=String(value??'');if(typeof value==='string'&&/^[\s]*[=+@-]/.test(s))s="'"+s;return '"'+s.replace(/"/g,'""')+'"';}).join(',')).join('\r\n');}
export function csvArchive(entries:Entry[],options:ExportOptions){const data=exportData(entries,options);return zipSync({'nutrition.csv':strToU8(csv([headers.nutrition,...data.nutrition])),'workouts.csv':strToU8(csv([headers.workouts,...data.workouts])),'sleep.csv':strToU8(csv([headers.sleep,...data.sleep])),'body.csv':strToU8(csv([headers.body,...data.body])),'README.txt':strToU8(`Fitness OS records: ${options.range.start} to ${options.range.end}.\nBody unit: ${options.unit}. Workout loads remain kg with their recorded weight basis.\nBMI uses current saved height. Sleep duration is elapsed time in bed, not measured sleep.\nNutrition rows are individual ingredients, with their logged quantities and saved label values per 100 g or ml. Raw and cooked states are not converted.\nThis export contains logged records, not templates or ingredient-library definitions.\nNames/notes starting with spreadsheet formula characters are prefixed with an apostrophe for safe opening.`)},{level:6});}
const esc=(value:unknown)=>String(value??'').replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g,'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&apos;');
const col=(i:number)=>String.fromCharCode(65+i);
function cell(ref:string,value:ExportCell,style='0'){const isFormula=typeof value==='object'&&value!==null;const raw=isFormula?value.value:value;const f=isFormula?`<x:f>${esc(value.formula)}</x:f>`:'';return `<x:c r="${ref}" s="${style}"${typeof raw==='string'?' t="str"':''}>${f}${raw===null?'':`<x:v>${esc(raw)}</x:v>`}</x:c>`;}
function row(n:number,values:ExportCell[],styles:string[]=[]){return `<x:row r="${n}" ht="${Math.min(409,Math.max(28,...values.filter((v):v is string=>typeof v==='string').map(v=>Math.ceil(v.length/60)*16)))}" customHeight="1">${values.map((v,i)=>cell(col(i)+n,v,styles[i]??'0')).join('')}</x:row>`;}
function stylesAt(xml:string,n:number){const row=xml.match(new RegExp(`<x:row r="${n}"[^>]*>[\\s\\S]*?</x:row>`))?.[0]??'';const styles:string[]=[];for(const c of row.matchAll(/<x:c r="([A-Z]+)\d+"[^>]*s="(\d+)"/g)){if(c[1].length===1)styles[c[1].charCodeAt(0)-65]=c[2];}return styles;}
function updateCell(xml:string,ref:string,value:ExportCell){const re=new RegExp(`<x:c r="${ref}"(?:[^>]*?\\/>|[^>]*>[\\s\\S]*?<\\/x:c>)`);const old=xml.match(re)?.[0];if(!old)throw new Error('Workbook template cell missing: '+ref);return xml.replace(re,()=>cell(ref,value,old.match(/s="(\d+)"/)?.[1]??'0'));}
export function workbookArchive(template:Uint8Array,entries:Entry[],options:ExportOptions){
 const files=unzipSync(template),data=exportData(entries,options);const text=(p:string)=>strFromU8(files[p]);const put=(p:string,s:string)=>files[p]=strToU8(s);
 const groups=[data.workouts,data.sleep,data.body,data.nutrition];
 groups.forEach((rows,idx)=>{const path=`xl/worksheets/sheet${idx+2}.xml`;let xml=text(path);const styles=stylesAt(xml,6);const old=xml.match(/<x:sheetData>([\s\S]*?)<\/x:sheetData>/)![1];const leading=[...old.matchAll(/<x:row\b[^>]*>[\s\S]*?<\/x:row>/g)].map(m=>m[0]).filter(r=>Number(r.match(/r="(\d+)"/)?.[1])<6).join('');
  const generated=(rows.length?rows:[headers[idx===0?'workouts':idx===1?'sleep':idx===2?'body':'nutrition'].map(()=>null)]).map((values,i)=>{const n=i+6;const cells:ExportCell[]=[...values];if(typeof values[0]==='string')cells[0]=dayNumber(values[0])+25569;
   if(idx===2&&values[0])cells[4]={formula:`IF(D${n}="","",IF(C${n}="lbs",B${n}*0.45359237,B${n})/(D${n}/100)^2)`,value:values[4]};
   if((idx===1||idx===2)&&values[0]){while(cells.length<9)cells.push(null);cells.push({formula:`TEXT(A${n},"dd mmm yyyy")`,value:label(String(values[0]))},{formula:`${idx===1?'E':'B'}${n}`,value:values[idx===1?4:1]});}
   if(idx===3&&values[0]){for(let k=0;k<4;k++)cells[6+k]={formula:`E${n}*${col(12+k)}${n}/100`,value:values[6+k]};if(data.nutritionDaily[i]){const [date,total,rawDate]=data.nutritionDaily[i];while(cells.length<20)cells.push(null);cells.push(date,{formula:`SUMIF(A6:A${Math.max(6,rows.length+5)},${dayNumber(rawDate)+25569},G6:G${Math.max(6,rows.length+5)})`,value:total});}}
   return row(n,cells,styles);
  }).join('');xml=xml.replace(/<x:sheetData>[\s\S]*?<\/x:sheetData>/,()=>`<x:sheetData>${leading}${generated}</x:sheetData>`);xml=updateCell(xml,'A3',`${options.range.start} to ${options.range.end} · ${rows.length} ${idx===0?'sets':idx===3?'ingredient rows':'entries'}`);put(path,xml);
 });
 let overview=text('xl/worksheets/sheet1.xml');overview=updateCell(overview,'A3',`${options.range.label} · ${options.range.start} to ${options.range.end}`);
 const wEnd=Math.max(6,data.workouts.length+5),sEnd=Math.max(6,data.sleep.length+5),bEnd=Math.max(6,data.body.length+5),dEnd=Math.max(41,data.daily.length+40);
 const summaries:Formula[]=[{formula:`SUM(B41:B${dEnd})`,value:data.sessions},{formula:`COUNTIF(Workouts!I6:I${wEnd},"working")`,value:data.sets},{formula:`COUNTA(Sleep!H6:H${sEnd})`,value:data.sleep.length},{formula:`IF(COUNT(Sleep!E6:E${sEnd})=0,"",AVERAGE(Sleep!E6:E${sEnd}))`,value:data.sleep.length?data.sleep.reduce((n,r)=>n+Number(r[4]),0)/data.sleep.length:null},{formula:`COUNT(Body!B6:B${bEnd})`,value:data.body.length}];summaries.forEach((v,i)=>overview=updateCell(overview,'B'+(i+5),v));
 overview=overview.replace(/<x:row r="(?:4[1-9]|[5-9]\d|\d{3,})"[^>]*>[\s\S]*?<\/x:row>/g,'');overview=overview.replace('</x:sheetData>',data.daily.map((r,i)=>row(i+41,r,stylesAt(text('xl/worksheets/sheet1.xml'),41))).join('')+'</x:sheetData>');put('xl/worksheets/sheet1.xml',overview);
 // Resize the authored Excel tables and native chart bindings to the exported rows.
 for(const p of Object.keys(files).filter(p=>p.startsWith('xl/tables/')&&p.endsWith('.xml'))){let xml=text(p);const name=xml.match(/name="(Workouts|Sleep|Body|Nutrition)Log"/)?.[1];const index=name==='Workouts'?0:name==='Sleep'?1:name==='Body'?2:3;const last=Math.max(6,groups[index].length+5);xml=xml.replace(/ref="A5:([A-Z]+)7"/g,`ref="A5:$1${last}"`);put(p,xml);}
 const chartRows=[data.daily,data.sleep.map(r=>[label(String(r[0])),r[4]]),data.body.map(r=>[label(String(r[0])),r[1]]),data.nutritionDaily];
 chartRows.forEach((rows,i)=>{const p=`xl/drawings/charts/chart${i+1}.xml`;let xml=text(p);const sheet=i===0?'Overview':i===1?'Sleep':i===2?'Body':'Nutrition',start=i===0?41:6,end=Math.max(start,start+rows.length-1),cat=i===0?'A':i===3?'U':'J',val=i===0?'B':i===3?'V':'K';xml=xml.replace(/<c:cat>[\s\S]*?<\/c:cat>/,`<c:cat><c:strRef><c:f>'${sheet}'!$${cat}$${start}:$${cat}$${end}</c:f><c:strCache><c:ptCount val="${rows.length}"/>${rows.map((r,n)=>`<c:pt idx="${n}"><c:v>${esc(r[0])}</c:v></c:pt>`).join('')}</c:strCache></c:strRef></c:cat>`).replace(/<c:val>[\s\S]*?<\/c:val>/,`<c:val><c:numRef><c:f>'${sheet}'!$${val}$${start}:$${val}$${end}</c:f><c:numCache><c:formatCode>0.0</c:formatCode><c:ptCount val="${rows.length}"/>${rows.map((r,n)=>`<c:pt idx="${n}"><c:v>${r[1]}</c:v></c:pt>`).join('')}</c:numCache></c:numRef></c:val>`);
  xml=xml.replace('<c:symbol val="none" />','<c:symbol val="circle" /><c:size val="5" />');if(i===2)xml=xml.replace('<a:t>Bodyweight</a:t>',`<a:t>Bodyweight (${options.unit==='lb'?'lbs':'kg'})</a:t>`);if(!rows.length)xml=xml.replace(/<a:t>([^<]+)<\/a:t>/, '<a:t>$1 — no entries in this range</a:t>');if(i===0)xml=xml.replace('</c:valAx>','<c:majorUnit val="1" /></c:valAx>');put(p,xml);
 });
 return zipSync(files,{level:6});
}

import fs from 'node:fs/promises';
import {Workbook,SpreadsheetFile} from '@oai/artifact-tool';
const out=process.argv[2];
const wb=Workbook.create();
const specs=[
 ['Overview',['Date','Sessions'],[['10 Oct 2020',1],['10 Oct 2026',2]]],
 ['Workouts',['Date','Session','Exercise','Equipment','Muscle','Weight basis','Exercise order','Set','Set type','Weight','Unit','Reps','Session ID','Exercise ID','Set ID'],[[44114,'Chest & triceps','Bench press','Barbell','Chest','Total weight',1,1,'working',60,'kg',8,'sample','sample','sample'],[46305,'Back & biceps','Row','Cable','Back','Total weight',1,1,'working',70,'kg',10,'sample','sample','sample']]],
 ['Sleep',['Wake date','Bedtime (local)','Wake time (local)','Timezone','Time in bed (hours)','Quality','Notes','Entry ID'],[[44114,'2020-10-09 23:00','2020-10-10 07:00','Europe/London',8,'Good','Example note','sample'],[46305,'2026-10-09 23:00','2026-10-10 07:00','Europe/London',8,'Good','','sample']]],
 ['Nutrition',['Date','Meal','Ingredient','Food state','Amount','Unit','Calories (kcal)','Protein (g)','Carbs (g)','Fat (g)','Meal notes','Meal ID','Kcal per 100','Protein per 100','Carbs per 100','Fat per 100','Ingredient ID'],[[46304,'Example meal','Example oats','Raw / dry',100,'g',380,12,60,8,'','sample',380,12,60,8,'sample'],[46305,'Example meal','Example oats','Raw / dry',150,'g',570,18,90,12,'','sample',380,12,60,8,'sample']]],
 ['Body',['Date','Weight','Unit','Height (cm)','BMI','Notes','Entry ID'],[[44114,80,'kg',173,26.7,'Example note','sample'],[46305,82,'kg',173,27.4,'','sample']]],
];
specs.sort((a,b)=>['Overview','Workouts','Sleep','Body','Nutrition'].indexOf(a[0])-['Overview','Workouts','Sleep','Body','Nutrition'].indexOf(b[0]));
for(const [name,headers,rows] of specs){
 const sh=wb.worksheets.add(name);sh.showGridLines=false;sh.tabColor=name==='Overview'?'#237E8B':'#B8DCDD';
 sh.getRange('A1:O8').format.font={name:'Arial',size:11,color:'#263B40'};
 sh.getRange('A1:O8').format.rowHeight=24;
 sh.getRange('A1:O8').format.columnWidth=19;
 sh.getRange('A2').values=[[name==='Overview'?'FITNESS OS — Progress export':name]];sh.getRange('A2').format.font={name:'Arial',size:16,bold:true,color:'#237E8B'};
 sh.getRange('A3').values=[['Your logged records. Source: Fitness OS account.']];
 const row=name==='Overview'?40:5;
 sh.getRangeByIndexes(row-1,0,1,headers.length).values=[headers];
 sh.getRangeByIndexes(row-1,0,1,headers.length).format={fill:'#237E8B',font:{name:'Arial',size:11,bold:true,color:'#FFFFFF'},rowHeight:30};
 sh.getRangeByIndexes(row,0,rows.length,headers.length).values=rows;
 sh.getRangeByIndexes(row,0,rows.length,headers.length).format.font={name:'Arial',size:11,color:'#263B40'};
 sh.getRangeByIndexes(row,0,rows.length,headers.length).format.rowHeight=26;
 sh.getRangeByIndexes(row,0,rows.length,headers.length).setNumberFormat('0.0');
 if(name!=='Overview')sh.getRange('A6:A7').setNumberFormat('dd mmm yyyy');
 if(name==='Workouts'){sh.getRange('B1:F8').format.columnWidth=26;sh.getRange('G6:I7').setNumberFormat('0');sh.getRange('L6:L7').setNumberFormat('0');}
 if(name==='Sleep'){sh.getRange('B1:D8').format.columnWidth=24;sh.getRange('G1:G8').format.columnWidth=50;}
 if(name==='Body')sh.getRange('F1:F8').format.columnWidth=50;
 if(name==='Body')sh.getRange('F6:F7').format.wrapText=true;
 if(name==='Sleep')sh.getRange('G6:G7').format.wrapText=true;
 if(name!=='Overview'){sh.freezePanes.freezeRows(5);sh.tables.add(`A5:${String.fromCharCode(64+headers.length)}7`,true,`${name}Log`);}
 if(name==='Overview'){
  sh.getRange('A5:B9').values=[['Workout sessions',3],['Working sets',2],['Sleep entries',2],['Average time in bed (h)',8],['Weigh-ins',2]];
  sh.getRange('A5:A9').format.columnWidth=31;
  sh.getRange('B5:B9').format.font={name:'Arial',size:14,bold:true,color:'#237E8B'};
  sh.getRange('A11').values=[['Snapshot of the selected records. Changes here do not sync back to the app.']];
  sh.getRange('A12').values=[['Charts use logged dates only; gaps do not represent continuous tracking.']];
  sh.getRange('A13').values=[['Re-export for newly logged records. Templates and custom-exercise definitions are not included.']];
  sh.getRange('A14').values=[['Body uses your saved unit; workout set loads retain kg and their recorded weight basis.']];
  sh.getRange('A15').values=[['BMI uses current saved height and does not distinguish muscle from fat.']];
  const c=sh.charts.add('bar',sh.getRange('A40:B42'));c.title='Workout sessions by logged day';c.hasLegend=false;c.setPosition('A17','G37');c.series.items[0].fill='#237E8B';c.yAxis={numberFormatCode:'0',numberFormatSourceLinked:false};
 }
 if(name==='Nutrition'){
  sh.getRange('P1:Q8').format.columnWidth=20;sh.getRange('P1:Q8').format.font={name:'Arial',size:11,color:'#263B40'};sh.getRange('P5:Q5').format.font={name:'Arial',size:11,bold:true,color:'#FFFFFF'};sh.getRange('B1:D8').format.columnWidth=26;sh.getRange('K1:K8').format.columnWidth=45;sh.getRange('K6:K7').format.wrapText=true;
  sh.getRange('U5:V7').values=[['Logged day','Calories'],['09 Oct 2026',380],['10 Oct 2026',570]];
  sh.getRange('U1:V8').format.columnWidth=20;
  const c=sh.charts.add('line',sh.getRange('U5:V7'));c.title='Calories by logged day';c.hasLegend=false;c.setPosition('X5','AE24');c.series.items[0].line={fill:'#33745A',style:'solid',width:2};c.yAxis={numberFormatCode:'0',numberFormatSourceLinked:false};
 }
 if(name==='Sleep'||name==='Body'){
  // Chart helper labels avoid serial-date rendering in spreadsheet viewers.
  sh.getRange('J5:K7').values=[['Logged date',name==='Sleep'?'Hours':'Weight'],['10 Oct 2020',name==='Sleep'?8:80],['10 Oct 2026',name==='Sleep'?8:82]];
  sh.getRange('J1:K8').format.columnWidth=19;
  const c=sh.charts.add('line',sh.getRange('J5:K7'));c.title=name==='Sleep'?'Time in bed (hours)':'Bodyweight';c.hasLegend=false;c.setPosition('M5','T24');c.series.items[0].line={fill:name==='Sleep'?'#7860B0':'#237E8B',style:'solid',width:2};c.yAxis={numberFormatCode:'0.0',numberFormatSourceLinked:false};
 }
}
wb.recalculate();
await fs.mkdir(out,{recursive:true});
for(const name of ['Nutrition']){
 const range=name==='Nutrition'?'A1:AE24':name==='Overview'?'A1:G37':name==='Workouts'?'A1:L8':name==='Sleep'?'A1:T24':'A1:T24';
 const img=await wb.render({sheetName:name,range,scale:1,format:'png'});await fs.writeFile(`${out}/${name}.png`,new Uint8Array(await img.arrayBuffer()));
}
await (await SpreadsheetFile.exportXlsx(wb)).save(`${out}/fitness-template.xlsx`);
console.log('Template rendered and exported.');

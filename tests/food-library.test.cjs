const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),ts=require('typescript');
const cache={};function load(file){file=path.resolve(file);if(cache[file])return cache[file];if(file.endsWith('.json'))return JSON.parse(fs.readFileSync(file,'utf8'));const mod={exports:{}};cache[file]=mod.exports;new Function('require','module','exports',ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText)(name=>name.startsWith('.')?load(path.resolve(path.dirname(file),name.endsWith('.json')?name:name+'.ts')):require(name),mod,mod.exports);return mod.exports;}
const n=load('lib/nutrition.ts');
// Library uses an alias-free import so the same module is tested as the UI.
const lib=load('lib/food-library.ts'),foods=lib.foodLibrary;
assert.equal(foods.length,89);assert.equal(new Set(foods.map(f=>f.id)).size,89);assert.equal(new Set(foods.map(f=>f.source.code)).size,89);
for(const f of foods){assert.equal(n.foodSchema.safeParse(f).success,true);assert.equal(f.unit,'g');assert.equal(f.name,f.source.foodName);for(const k of f.source.trace)assert.equal(f[k],0);}
const rice=lib.searchIngredients([],'rice cooked','library','all');assert.ok(rice.length>=3);assert.ok(rice.every(f=>f.preparation==='cooked'));
const raw=foods.find(f=>f.source.code==='11-857'),cooked=foods.find(f=>f.source.code==='11-858');assert.equal(raw.kcal,351);assert.equal(cooked.kcal,117);assert.equal(cooked.carbs,26.5);
const uuid='11111111-1111-4111-8111-111111111111';const meal=n.mealEntry(uuid,'2026-10-11',{name:'Rice',notes:'',items:[{id:uuid,foodId:cooked.id,food:cooked,quantity:200}]});assert.equal(meal.value,234);assert.equal(meal.carbs,53);assert.equal(meal.nutrition.items[0].food.source.code,'11-858');
const saved=JSON.parse(JSON.stringify(meal.nutrition));cooked.kcal=999;assert.equal(n.mealTotals(saved.items).kcal,234);
assert.equal(lib.searchIngredients([],'','mine','all').length,0);const mine={...raw,id:uuid,name:'My rice',source:undefined};assert.equal(lib.searchIngredients([mine],'my rice','all','raw')[0].id,uuid);
assert.ok(foods.some(f=>f.source.trace.includes('carbs')));assert.equal(lib.searchIngredients([],'not-a-real-food','all','all').length,0);
console.log('PASS: curated source IDs, food schema, raw/cooked search, source snapshots, manual ingredients and portion calculation.');

assert.equal(lib.searchIngredients([],'carrot cooked','library','all').length,2);
assert.equal(lib.searchIngredients([],'peas frozen','library','cooked').length,2);
assert.ok(lib.searchIngredients([],'vegetables','library','all').some(f=>f.source.code==='13-497'));
const peas=foods.find(f=>f.source.code==='13-536'),carrots=foods.find(f=>f.source.code==='13-497');
assert.equal(peas.kcal,70);assert.equal(peas.carbs,11.2);assert.equal(carrots.kcal,29);assert.equal(carrots.carbs,6);
console.log('PASS: carrots, frozen peas, cooked-state filtering and vegetable discovery.');

import data from './food-library.json';
import {foodSchema,preparations,type Ingredient} from './nutrition';
export const FOOD_SOURCE_URL='https://www.gov.uk/government/publications/composition-of-foods-integrated-dataset-cofid';
export const foodLibrary:Ingredient[]=data.map(row=>({id:row.id,...foodSchema.parse(row)}));
export function searchIngredients(mine:Ingredient[],query:string,scope:'all'|'mine'|'library',state:string){
 const terms=query.toLowerCase().trim().split(/\s+/).filter(Boolean);
 const list=[...(scope==='library'?[]:mine),...(scope==='mine'?[]:foodLibrary)];
 return list.filter(f=>(state==='all'||f.preparation===state)&&terms.every(t=>(f.name+' '+preparations[f.preparation]+(f.source?.code.startsWith('13-')?' vegetables veg':'')+(f.name.startsWith('Chicken, light meat')?' breast':'')).toLowerCase().includes(t)));
}

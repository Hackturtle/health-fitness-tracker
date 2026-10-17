import {z} from 'zod';
import type {Entry} from './fitness';
import {dateKey} from './fitness';
export const preparations={as_sold:'As sold / ready to eat',raw:'Raw / dry',cooked:'Cooked / prepared'} as const;
const nutrient=z.number().finite().min(0).max(100);
export const foodSchema=z.object({name:z.string().trim().min(1).max(100),unit:z.enum(['g','ml']),preparation:z.enum(['as_sold','raw','cooked']),kcal:z.number().finite().min(0).max(1000),protein:nutrient,carbs:nutrient,fat:nutrient,source:z.object({dataset:z.literal('CoFID2021'),code:z.string().regex(/^\d{2}-\d{3,4}$/),foodName:z.string().max(200),trace:z.array(z.enum(['kcal','protein','carbs','fat']))}).optional()});
export type Food=z.infer<typeof foodSchema>;
export type Ingredient=Food&{id:string};
export const mealItemSchema=z.object({id:z.string().uuid(),foodId:z.string().uuid(),food:foodSchema,quantity:z.number().finite().positive().max(10000)});
export const mealSchema=z.object({name:z.string().trim().min(1).max(100),notes:z.string().max(1000),items:z.array(mealItemSchema).min(1).max(50)}).refine(m=>new Set(m.items.map(i=>i.id)).size===m.items.length,'Ingredient row IDs must be unique');
export type Meal=z.infer<typeof mealSchema>;
export type MealItem=z.infer<typeof mealItemSchema>;
export type MealTemplate=Meal&{id:string};
export const nutritionRowSchema=z.object({id:z.string().uuid(),kind:z.enum(['ingredient','template','meal']),logged_date:z.string().nullable(),payload:z.unknown()});
export type NutritionRow=z.infer<typeof nutritionRowSchema>;
export type Macros={kcal:number;protein:number;carbs:number;fat:number};
export function mealTotals(items:MealItem[]):Macros{return items.reduce((sum,item)=>{for(const key of ['kcal','protein','carbs','fat'] as const)sum[key]+=item.food[key]*item.quantity/100;return sum;},{kcal:0,protein:0,carbs:0,fat:0});}
export function mealEntry(id:string,date:string,meal:Meal):Entry{const m=mealSchema.parse(meal),totals=mealTotals(m.items);return {id,date,topic:'nutrition',label:m.name,value:totals.kcal,protein:totals.protein,carbs:totals.carbs,fat:totals.fat,nutrition:m};}
export function validMealDate(date:string,now=new Date()){const d=new Date(date+'T12:00:00');return /^\d{4}-\d{2}-\d{2}$/.test(date)&&Number.isFinite(d.getTime())&&dateKey(d)===date&&date<=dateKey(now)&&date>='1900-01-01';}
export function decodeNutrition(rows:NutritionRow[]){const ingredients:Ingredient[]=[],templates:MealTemplate[]=[],entries:Entry[]=[];for(const r of rows){if(r.kind==='ingredient')ingredients.push({...foodSchema.parse(r.payload),id:r.id});else {const m=mealSchema.parse(r.payload);if(r.kind==='template')templates.push({...m,id:r.id});else {if(!r.logged_date)throw new Error('Meal date missing');entries.push(mealEntry(r.id,r.logged_date,m));}}}return {ingredients,templates,entries};}

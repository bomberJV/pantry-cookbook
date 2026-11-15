import {recipes,ingredients,basicIds} from './recipes.js';
export const recipeIds=new Set(recipes.map(r=>r.id));
const ingredientIds=new Set(ingredients.map(i=>i.id));
export const defaultState=()=>({version:2,chosen:[],basics:true,servings:2,favorites:[],shopping:[],checked:[]});
export function normalizeState(value){
 const state=defaultState();if(!value||typeof value!=='object'||Array.isArray(value))return state;
 const valid=(array,ids)=>Array.isArray(array)?[...new Set(array.filter(x=>typeof x==='string'&&ids.has(x)))]:[];
 state.chosen=valid(value.chosen,ingredientIds);state.favorites=valid(value.favorites,recipeIds);state.shopping=valid(value.shopping,recipeIds);state.basics=value.basics!==false;state.servings=[1,2,4,6].includes(value.servings)?value.servings:2;
 state.checked=Array.isArray(value.checked)?[...new Set(value.checked.filter(x=>typeof x==='string'&&x.length<100))].slice(0,150):[];
 return state;
}
export function availableIds(state){return new Set(['water',...state.chosen,...(state.basics?basicIds:[])]);}
export function recipeMatch(recipe,available){const unique=[...new Set(recipe.ingredients.map(i=>i.id))];const missing=unique.filter(id=>!available.has(id));return {have:unique.length-missing.length,total:unique.length,missing,ratio:(unique.length-missing.length)/unique.length};}
export function selectRecipes(all,{available=new Set(),query='',maxTime=Infinity,favorites=[],savedOnly=false,type='all'}={}){
 const q=query.trim().toLowerCase();return all.filter(r=>r.time<=maxTime&&(!savedOnly||favorites.includes(r.id))&&(type==='all'||r.type===type)&&(!q||`${r.title} ${r.deck} ${r.ingredients.map(i=>i.name).join(' ')}`.toLowerCase().includes(q))).map((r,i)=>({r,i,m:recipeMatch(r,available)})).sort((a,b)=>b.m.ratio-a.m.ratio||a.m.missing.length-b.m.missing.length||a.i-b.i).map(x=>x.r);
}
export function scaledIngredients(recipe,servings){const count=[1,2,4,6].includes(servings)?servings:recipe.baseServings;return recipe.ingredients.map(i=>({...i,amount:i.amount*count/recipe.baseServings}));}
export function formatAmount(value){if(!Number.isFinite(value)||value<0)return '—';const whole=Math.floor(value+1e-8),fraction=value-whole;const common=[[.125,'⅛'],[.25,'¼'],[1/3,'⅓'],[.375,'⅜'],[.5,'½'],[.625,'⅝'],[2/3,'⅔'],[.75,'¾'],[.875,'⅞']];const found=common.find(([n])=>Math.abs(fraction-n)<.006);if(found)return (whole?whole+' ':'')+found[1];return Number(value.toFixed(2)).toString();}
export const itemKey=i=>`${i.id}|${i.unit}`;
export function shoppingList(all,selected,servings,available){const rows=new Map();for(const id of [...new Set(selected)]){const recipe=all.find(r=>r.id===id);if(!recipe)continue;for(const item of scaledIngredients(recipe,servings)){if(available.has(item.id))continue;const key=itemKey(item);if(!rows.has(key))rows.set(key,{...item,key,recipes:[]});else rows.get(key).amount+=item.amount;rows.get(key).recipes.push(recipe.title);}}return [...rows.values()].sort((a,b)=>a.name.localeCompare(b.name));}
export function chooseRecipe(items,previousId,random=Math.random){if(!items.length)return null;let pool=items;const first=items[0];if(first){const previous=items.filter(r=>r.id!==previousId);if(previous.length)pool=previous;}return pool[Math.min(pool.length-1,Math.floor(Math.max(0,random())*pool.length))];}
export const remainingSeconds=(deadline,now=Date.now())=>Math.max(0,Math.ceil((deadline-now)/1000));

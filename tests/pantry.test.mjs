import test from 'node:test';
import assert from 'node:assert/strict';
import {recipes,ingredients,basicIds} from '../pantry/recipes.js';
import {normalizeState,availableIds,recipeMatch,selectRecipes,scaledIngredients,formatAmount,shoppingList,chooseRecipe,remainingSeconds} from '../pantry/logic.js';
const recipe=id=>recipes.find(r=>r.id===id);
test('all eight recipes have complete usable ingredient and step data',()=>{
 assert.equal(recipes.length,8);assert.equal(new Set(recipes.map(r=>r.id)).size,recipes.length);const ids=new Set(ingredients.map(i=>i.id));
 for(const r of recipes){assert.equal(r.baseServings,2);assert.ok(r.time>0);assert.ok(['meal','side'].includes(r.type));assert.ok(r.steps.length>=3);assert.ok(r.ingredients.length>=5);assert.equal(new Set(r.ingredients.map(i=>i.id)).size,r.ingredients.length);for(const i of r.ingredients){assert.ok(ids.has(i.id),`${r.id}: ${i.id}`);assert.ok(Number.isFinite(i.amount)&&i.amount>0);assert.ok(i.name.length>1);}for(const s of r.steps){assert.ok(s.text.length>20);assert.ok(Number.isInteger(s.timer)&&s.timer>=0);}}
});
test('scaling handles one, four, and six servings without rounding away small seasoning amounts',()=>{
 const base=recipe('cucumber');assert.equal(scaledIngredients(base,1).find(i=>i.id==='salt').amount,.125);assert.equal(formatAmount(.125),'⅛');assert.equal(formatAmount(1.5),'1 ½');assert.equal(formatAmount(.375),'⅜');assert.equal(formatAmount(120),'120');assert.equal(scaledIngredients(recipe('shakshuka'),6).find(i=>i.id==='eggs').amount,12);assert.equal(scaledIngredients(recipe('lemon-beans'),4).find(i=>i.id==='water').amount,240);assert.equal(scaledIngredients(recipe('tomato-rice-soup'),1).find(i=>i.id==='water').amount,200);
 assert.equal(scaledIngredients(base,NaN)[0].amount,base.ingredients[0].amount);assert.equal(formatAmount(Infinity),'—');
});
test('pantry matching checks every ingredient, including non-headline seasonings',()=>{
 const r=recipe('shakshuka'),available=new Set(['tomatoes','bell-pepper','eggs']);const m=recipeMatch(r,available);assert.equal(m.have,3);assert.equal(m.total,11);assert.ok(m.missing.includes('cumin'));assert.ok(m.missing.includes('bread'));assert.equal(recipeMatch(r,new Set(r.ingredients.map(i=>i.id))).missing.length,0);
});
test('basic toggle affects only its stated ingredients; water is always available',()=>{
 const s=normalizeState(null),withBasics=availableIds(s);assert.ok(basicIds.every(id=>withBasics.has(id)));assert.ok(withBasics.has('water'));assert.ok(!withBasics.has('garlic'));s.basics=false;const without=availableIds(s);assert.deepEqual([...without],['water']);
});
test('matching and filters rank fully stocked recipes above partial matches',()=>{
 const ready=recipe('caper-pasta'),available=new Set(ready.ingredients.map(i=>i.id));assert.equal(selectRecipes(recipes,{available})[0].id,'caper-pasta');assert.ok(selectRecipes(recipes,{query:'caper',available}).every(r=>r.id==='caper-pasta'));assert.ok(selectRecipes(recipes,{maxTime:15}).every(r=>r.time<=15));assert.deepEqual(selectRecipes(recipes,{type:'side'}).map(r=>r.id),['cucumber']);assert.deepEqual(selectRecipes(recipes,{savedOnly:true,favorites:['rice']}).map(r=>r.id),['rice']);assert.equal(selectRecipes(recipes,{query:'definitely-not-a-recipe'}).length,0);
});
test('shopping list combines dishes without duplicates and subtracts available ingredients',()=>{
 const rows=shoppingList(recipes,['shakshuka','caper-pasta','shakshuka'],4,new Set(['oil','salt']));assert.equal(rows.find(i=>i.id==='tomatoes').amount,1200);assert.equal(rows.find(i=>i.id==='garlic').amount,8);assert.equal(rows.find(i=>i.id==='parsley').amount,8);assert.ok(!rows.some(i=>i.id==='oil'||i.id==='salt'));assert.equal(rows.find(i=>i.id==='tomatoes').recipes.length,2);
 assert.deepEqual(shoppingList(recipes,['missing'],2,new Set()),[]);const complete=new Set(recipe('cucumber').ingredients.map(i=>i.id));assert.deepEqual(shoppingList(recipes,['cucumber'],2,complete),[]);
});
test('storage restores only known, bounded settings and de-duplicates records',()=>{
 const s=normalizeState({chosen:['tomatoes','tomatoes','not-food',null],favorites:['rice','rice','missing'],shopping:['caper-pasta',{}],servings:500,basics:false,checked:['x','x',1,'x'.repeat(101)]});assert.deepEqual(s.chosen,['tomatoes']);assert.deepEqual(s.favorites,['rice']);assert.deepEqual(s.shopping,['caper-pasta']);assert.equal(s.servings,2);assert.equal(s.basics,false);assert.deepEqual(s.checked,['x']);assert.deepEqual(normalizeState([]),normalizeState(null));
});
test('dinner draw avoids immediate repeats when alternatives exist and handles empty lists',()=>{
 assert.equal(chooseRecipe([],null),null);assert.equal(chooseRecipe([recipe('rice')],'rice',()=>0).id,'rice');assert.notEqual(chooseRecipe([recipe('rice'),recipe('caper-pasta')],'rice',()=>0).id,'rice');assert.equal(chooseRecipe([recipe('rice'),recipe('caper-pasta')],null,()=>.999).id,'caper-pasta');
});
test('kitchen timer uses a wall-clock deadline so backgrounding cannot stretch a countdown',()=>{
 assert.equal(remainingSeconds(10000,0),10);assert.equal(remainingSeconds(10000,9999),1);assert.equal(remainingSeconds(10000,10000),0);assert.equal(remainingSeconds(10000,30000),0);
});

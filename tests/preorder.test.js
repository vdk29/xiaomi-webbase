import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {PREORDER_MODELS} from '../js/preorder-data.js';
import {preorderSelection,preorderRequest,preorderSpecGroups,preorderVariants} from '../js/preorder.js';
import {PREORDER_PRICES,preorderPrice} from '../js/preorder-prices.js';
test('saved links to removed colours fall back to black while preserving valid memory',()=>{
 for(const phone of PREORDER_MODELS.map(m=>m.id))for(const finish of ['pink','transparent','transparent-red','ice-peach','special-edition','unknown']){
  const selected=preorderSelection(new URLSearchParams({phone,finish,capacity:'12/512 ГБ'}));assert.equal(selected.color.id,'black');assert.equal(selected.capacity,'12/512 ГБ');assert.equal(preorderPrice(selected).amount,phone.endsWith('max')?169990:149990);
 }
 for(const phone of ['unknown','xiaomi-18-fold','xiaomi-17-max','xiaomi-17t','xiaomi-17t-pro'])assert.equal(preorderSelection(new URLSearchParams({phone})).model.id,'xiaomi-18-pro');
});
test('Global launch models retain four official finishes, distinct capacities and verified specification groups',()=>{
 assert.deepEqual(PREORDER_MODELS.map(m=>m.id),['xiaomi-18-pro','xiaomi-18-pro-max']);assert.deepEqual(PREORDER_MODELS.map(m=>[m.battery,m.wired]),[[6000,90],[7050,100]]);
 for(const model of PREORDER_MODELS){assert.equal(model.region,'Global');assert.match(model.specSource,/mi.com\/global\/product/);assert.deepEqual(model.colors.map(c=>c.id),['black','white','blue','red']);assert.equal(model.variants.length,model.id.endsWith('max')?3:2);const groups=preorderSpecGroups(model);assert.equal(groups.length,7);assert.ok(groups.reduce((n,g)=>n+g[1].length,0)>=50);const facts=JSON.stringify(groups);assert.match(facts,/200 Мп/);assert.match(facts,/Диапазоны 5G/);assert.match(facts,/Xiaomi HyperOS 4/);assert.doesNotMatch(facts,/Ледяной персик|Прозрачный|Special Edition/);assert.match(facts,/Velvet Red/);}
});
test('all selectable configurations retain exact screenshot prices; unpriced memory never inherits another capacity price',()=>{
 assert.equal(PREORDER_PRICES.length,16);
 for(const model of PREORDER_MODELS)for(const color of model.colors)for(const capacity of preorderVariants(model,color)){
  const selected=preorderSelection(new URLSearchParams({phone:model.id,finish:color.id,capacity}));assert.equal(selected.capacity,capacity);const price=preorderPrice(selected);
  if(capacity.startsWith('12/')){assert.equal(price.amount,model.id.endsWith('max')?(capacity.includes('256')?159990:169990):(capacity.includes('256')?139990:149990));assert.match(preorderRequest(selected),/Цена по скриншотам 1С/);}else assert.equal(price,null);
 }
 const pro=preorderSelection(new URLSearchParams({phone:'xiaomi-18-pro',finish:'red',capacity:'16 ГБ / 1 ТБ'}));assert.equal(pro.capacity,'12/256 ГБ');const max=preorderSelection(new URLSearchParams({phone:'xiaomi-18-pro-max',finish:'red',capacity:'16 ГБ / 1 ТБ'}));assert.equal(max.capacity,'16 ГБ / 1 ТБ');assert.equal(preorderPrice(max),null);
});
test('selectable finishes have distinct sourced assets; every local manifest asset exists and its content hash matches',()=>{
 const manifest=JSON.parse(readFileSync(new URL('../assets/preorder/manifest.json',import.meta.url)));
 for(const model of PREORDER_MODELS)for(const color of model.colors){const a=manifest.find(a=>a.path===color.image);assert.ok(a);assert.equal(a.color,color.id);assert.equal(a.model,model.id);assert.notEqual(a.selectable,false);}
 for(const a of manifest){const bytes=readFileSync(new URL('../'+a.path,import.meta.url));assert.equal(bytes.length,a.byte_size);assert.equal(createHash('sha256').update(bytes).digest('hex'),a.sha256);}
});

test('Global facts cannot inherit China battery, SIM, box or unannounced reverse charging data',()=>{
 for(const m of PREORDER_MODELS){const facts=JSON.stringify(preorderSpecGroups(m));assert.match(facts,/eSIM/);assert.match(facts,/Адаптер питания не входит/);assert.match(facts,/Shield Glass 3.0/);assert.match(facts,/Victus 2/);assert.doesNotMatch(facts,/Китай|7000|8500|27 Вт|HDR Vivid|Dragon Crystal|макро от 5 см/);assert.equal(m.minimum,undefined);assert.equal(m.reverse,undefined);assert.equal(m.variants.includes('16/512 ГБ'),false);}
 assert.match(PREORDER_MODELS[0].weight,/198/);assert.match(PREORDER_MODELS[1].weight,/229/);
});

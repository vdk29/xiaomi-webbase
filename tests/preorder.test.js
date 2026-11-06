import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {PREORDER_MODELS} from '../js/preorder-data.js';
import {preorderSelection,preorderRequest,preorderSpecGroups} from '../js/preorder.js';
test('excluded models cannot return through saved links; color and memory validate against the chosen China edition',()=>{
 for(const phone of ['unknown','xiaomi-18-fold','xiaomi-17-max','xiaomi-17t','xiaomi-17t-pro']){
 const selected=preorderSelection(new URLSearchParams({phone,finish:'unknown',capacity:'invalid'}));
 assert.equal(selected.model.id,'xiaomi-18-pro');assert.equal(selected.color.id,'black');assert.equal(selected.capacity,'12/256 ГБ');
 }
 const special=preorderSelection(new URLSearchParams({phone:'xiaomi-18-pro-max',finish:'transparent',capacity:'12/256 ГБ'}));
 assert.equal(special.capacity,'16 ГБ / 1 ТБ');assert.equal(special.color.id,'transparent');
 const request=preorderRequest(special);assert.match(request,/Китай/);assert.match(request,/16 ГБ \/ 1 ТБ/);assert.doesNotMatch(request,/Global|предварительно/);
});
test('only the two requested China editions offer all five colors and full manufacturer specifications',()=>{
 assert.deepEqual(PREORDER_MODELS.map(m=>m.id),['xiaomi-18-pro','xiaomi-18-pro-max']);
 assert.deepEqual(PREORDER_MODELS.map(m=>[m.battery,m.wired]),[[7000,100],[8500,100]]);
 for(const model of PREORDER_MODELS){
 assert.equal(model.region,'Китай');
 assert.deepEqual(model.colors.map(c=>c.id),['black','white','pink','blue','transparent']);
 assert.equal(model.variants.length,4);
 const groups=preorderSpecGroups(model);assert.equal(groups.length,7);assert.ok(groups.reduce((n,g)=>n+g[1].length,0)>=50);
 const facts=JSON.stringify(groups);assert.match(facts,/200 Мп/);assert.match(facts,/Диапазоны 5G/);assert.match(facts,/Xiaomi HyperOS 4/);assert.doesNotMatch(facts,/Global|Требует подтверждения/);
 assert.match(model.specSource,/^https:\/\/www\.mi\.com\/prod\//);
 }
});
test('every selectable finish uses its own manufacturer photo and all media content hashes remain unchanged',()=>{
 const manifest=JSON.parse(readFileSync(new URL('../assets/preorder/manifest.json',import.meta.url)));
 for(const model of PREORDER_MODELS)for(const color of model.colors){const asset=manifest.find(a=>a.path===color.image);assert.ok(asset,`${model.id} ${color.id}`);assert.equal(asset.color,color.id);assert.equal(asset.model,model.id);}
 for(const asset of manifest){const bytes=readFileSync(new URL('../'+asset.path,import.meta.url));assert.equal(bytes.length,asset.byte_size);assert.equal(createHash('sha256').update(bytes).digest('hex'),asset.sha256);}
});

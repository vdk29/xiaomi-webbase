import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {PREORDER_MODELS} from '../js/preorder-data.js';
import {preorderSelection,preorderRequest,preorderSpecGroups} from '../js/preorder.js';
test('removed models and old regional configurations cannot return through saved deep links',()=>{
 for(const phone of ['unknown','xiaomi-18-fold','xiaomi-17-max','xiaomi-17t','xiaomi-17t-pro']){
 const selected=preorderSelection(new URLSearchParams({phone,finish:'transparent',capacity:'16 ГБ / 1 ТБ'}));
 assert.equal(selected.model.id,'xiaomi-18-pro');assert.equal(selected.color.id,'black');assert.equal(selected.capacity,'12/256 ГБ');
 }
 const max=preorderSelection(new URLSearchParams('phone=xiaomi-18-pro-max&finish=white&capacity=12/256'));
 assert.equal(max.capacity,'12/512 ГБ');assert.equal(max.color.id,'white');
 const request=preorderRequest(max);assert.match(request,/Global/);assert.match(request,/предварительно/);assert.doesNotMatch(request,/Китай|16 ГБ|1 ТБ/);
});
test('only the two requested Global models are shown and missing global specifications are never filled from China editions',()=>{
 assert.deepEqual(PREORDER_MODELS.map(m=>m.id),['xiaomi-18-pro','xiaomi-18-pro-max']);
 assert.deepEqual(PREORDER_MODELS.map(m=>[m.battery,m.wired]),[[6000,90],[7050,100]]);
 for(const model of PREORDER_MODELS){
 assert.equal(model.region,'Global');assert.equal(model.specStatus,'preliminary');
 assert.equal(preorderSpecGroups(model).length,6);
 for(const group of model.specGroups)for(const item of group.items){
 assert.ok(['reported','unconfirmed'].includes(item.status));
 if(item.status==='reported')assert.match(item.source,/^https:\/\//);
 }
 assert.equal(model.specGroups.find(g=>g.title==='Камеры и съёмка').items.every(item=>item.status==='unconfirmed'),true);
 assert.doesNotMatch(JSON.stringify(model),/7000|8500|6860|8350|Китай|1 ТБ/);
 }
});
test('selectable finishes have manufacturer-sourced local images and all archived assets retain their content hashes',()=>{
 const manifest=JSON.parse(readFileSync(new URL('../assets/preorder/manifest.json',import.meta.url)));
 for(const model of PREORDER_MODELS)for(const color of model.colors){const asset=manifest.find(a=>a.path===color.image);assert.ok(asset,`${model.id} ${color.id}`);assert.equal(asset.color,color.id);}
 for(const asset of manifest){const bytes=readFileSync(new URL('../'+asset.path,import.meta.url));assert.equal(bytes.length,asset.byte_size);assert.equal(createHash('sha256').update(bytes).digest('hex'),asset.sha256);}
});

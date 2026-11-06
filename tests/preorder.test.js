import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {PREORDER_MODELS} from '../js/preorder-data.js';
import {preorderSelection,preorderRequest,preorderSpecGroups} from '../js/preorder.js';
test('presentation deep links validate model, color and memory, including special edition restriction',()=>{
 const invalid=preorderSelection(new URLSearchParams('phone=unknown&finish=unknown&capacity=unknown'));
 assert.equal(invalid.model.id,'xiaomi-18-pro-max');assert.equal(invalid.color.id,'blue');
 const special=preorderSelection(new URLSearchParams('phone=xiaomi-18-pro&finish=transparent&capacity=12/256'));
 assert.equal(special.capacity,'16 ГБ / 1 ТБ');
 const request=preorderRequest(special);assert.match(request,/Прозрач/);assert.match(request,/Китай/);assert.match(request,/уточнить в магазине/);
 assert.equal(PREORDER_MODELS.some(m=>m.id==='xiaomi-18'),false,'No invented base model specs');
});
test('every selectable finish has a local manufacturer-sourced image with verified content hash',()=>{
 const manifest=JSON.parse(readFileSync(new URL('../assets/preorder/manifest.json',import.meta.url)));
 assert.equal(PREORDER_MODELS.length,6);
 for(const model of PREORDER_MODELS){
 assert.match(model.specSource,/^https:\/\/www\.mi\.com\/prod\//);assert.equal(preorderSpecGroups(model).length,7);
 for(const color of model.colors){const asset=manifest.find(a=>a.path===color.image);assert.ok(asset,`${model.id} ${color.id}`);assert.equal(asset.color,color.id);}
 }
 for(const asset of manifest){const bytes=readFileSync(new URL('../'+asset.path,import.meta.url));assert.equal(bytes.length,asset.byte_size);assert.equal(createHash('sha256').update(bytes).digest('hex'),asset.sha256);}
 assert.ok(manifest.reduce((s,a)=>s+a.byte_size,0)<900000,'Entire media collection stays below 900KB');
});

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {parseUnifiedWorkbook,localNetworkPreview,applyUnifiedReport} from '../js/unified-import.js';
import {parseNetworkRows} from '../js/network-parser.js';
const runtime={};vm.runInNewContext(fs.readFileSync(new URL('../vendor/xlsx-0.18.5.full.min.js',import.meta.url),'utf8'),runtime);const XLSX=runtime.XLSX;
function workbook(rows){const wb=XLSX.utils.book_new();XLSX.utils.book_append_sheet(wb,XLSX.utils.aoa_to_sheet(rows),'TDSheet');return wb;}
const mapping=[{key:'local',kind:'warehouse'},{key:'ov',kind:'display'},{key:'defect',kind:'defect'}].map(w=>({...w,company:'smart_orange',reviewed:true,excluded:false,webbase_network_stores:{is_local:true}}));
const fixture=()=>({columns:[{key:'local',raw_name:'Европолис склад'},{key:'ov',raw_name:'Европолис ОВ'},{key:'defect',raw_name:'Европолис брак'},{key:'other',raw_name:'Другой магазин'}],items:[{raw_name:'Смартфон QA 8/256 Black',values:[5,2,90,800],is_demo:false},{raw_name:'(LDU) Смартфон QA 8/256 Black',values:[1,2,90,800],is_demo:true}]});
test('legacy local SKU report remains local and keeps the old analysis path',()=>{
 const result=parseUnifiedWorkbook(XLSX,workbook([['Артикул','','','Номенклатура','','','Склад','ПФ','ОВ','Итого'],['SKU','','','Телефон','','',2,0,1,3]]));assert.equal(result.type,'local');assert.equal(result.rows[1][0],'SKU');
});
test('wide SKU report dynamically detects D nomenclature, retains SKUs and excludes article-less subtotal rows without outline',()=>{
 const rows=[['Период: 07.11.2026 - 07.11.2026'],['Артикул','','','Номенклатура, Ед. изм.','','','Склад ТЦ Европолис','Склад ТЦ Европолис ОВ','Склад ТЦ Европолис Брак','Склад Другой','Итого'],['','','','','','','Количество','Количество','Количество','Количество','Количество'],['','','','Смартфоны','','',5,2,9,10,26],['SKU-256','','','Смартфон QA 8/256 Black','','',5,2,9,10,26],['Итого','','','','','',5,2,9,10,26]];
 const result=parseUnifiedWorkbook(XLSX,workbook(rows));assert.equal(result.type,'network');assert.equal(result.report.items.length,1);assert.deepEqual(result.report.items[0].source_skus,['SKU-256']);assert.equal(result.report.total,26);
 const broken=structuredClone(rows);broken[4][6]=6;assert.throws(()=>parseNetworkRows(broken));
});
test('local preview only counts Europolis Smart Orange warehouse and OV; all demo units stay on display and defect is excluded',()=>{
 const report=fixture();const other={key:'other',kind:'warehouse',company:'mobility',reviewed:true,excluded:false,webbase_network_stores:{is_local:true}};
 const result=localNetworkPreview(report,[...mapping,other]);assert.equal(result.warehouse,5);assert.equal(result.display,5);assert.equal(result.ldu,3);assert.equal(result.positions,1);assert.deepEqual(result.columns,['Европолис склад','Европолис ОВ']);
});
test('absent local warehouse or OV blocks synchronization instead of treating other stores as local',()=>{
 assert.throws(()=>localNetworkPreview(fixture(),mapping.filter(w=>w.kind!=='display')),/Не найдены/);
 assert.throws(()=>localNetworkPreview(fixture(),mapping.map(w=>({...w,company:'mixtech'}))),/Не найдены/);
});
test('signed local quantities never become sellable or subtract from demo counts; PF product rows are excluded',()=>{
 const report=fixture();report.items[0].values=[-2,4,100,0];report.items[1].values=[-1,2,100,0];report.items.push({raw_name:'(ПФ) Смартфон QA2',values:[99,99,0,0]});
 const result=localNetworkPreview(report,mapping);assert.equal(result.warehouse,0);assert.equal(result.display,5);assert.equal(result.ldu,1);assert.equal(result.positions,1);
});
test('unified upload stages rows then invokes one atomic commit; already-network-imported file still synchronizes local stock',async()=>{
 const calls=[];const db={client:{rpc:async(name,args)=>{calls.push({name,args});return{data:name==='webbase_network_begin'?{id:'import',status:'active'}:{network:{recognized:1},local:{warehouse:5}}}},functions:{invoke:async()=>({})}}};
 const result=await applyUnifiedReport(db,{items:[],columns:[],columnSums:[]});assert.equal(result.local.warehouse,5);assert.deepEqual(calls.map(c=>c.name),['webbase_network_begin','webbase_unified_commit']);
 calls.length=0;db.client.rpc=async(name,args)=>{calls.push({name,args});return{data:name==='webbase_network_begin'?{id:'import',status:'staging'}:{local:{}}}};
 await applyUnifiedReport(db,{items:Array.from({length:151},()=>({})),columns:[],columnSums:[]});assert.deepEqual(calls.filter(c=>c.name==='webbase_network_stage').map(c=>c.args.p_items.length),[75,75,1]);assert.equal(calls.at(-1).name,'webbase_unified_commit');
});
test('archived files are rejected before they can overwrite newer local stock',async()=>{
 const db={client:{rpc:async name=>{assert.equal(name,'webbase_network_begin');return{data:{id:'old',status:'archived'}}}}};await assert.rejects(()=>applyUnifiedReport(db,{items:[],columns:[],columnSums:[]}),/более свежим/);
});
test('real network report is accepted through unified import and isolates Europolis without its five defect units',{skip:!process.env.WEBBASE_NETWORK_REPORT},()=>{
 const wb=XLSX.read(fs.readFileSync(process.env.WEBBASE_NETWORK_REPORT),{type:'buffer',cellStyles:true});const result=parseUnifiedWorkbook(XLSX,wb);assert.equal(result.type,'network');assert.equal(result.report.items.length,791);assert.equal(result.report.total,19625);
 const meta=result.report.columns.filter(c=>/^Склад ТЦ Европолис(?: ОВ| Брак)?$/.test(c.raw_name)).map(c=>({...mapping[0],key:c.key,kind:c.raw_name.endsWith('ОВ')?'display':c.raw_name.endsWith('Брак')?'defect':'warehouse'}));
 const local=localNetworkPreview(result.report,meta);assert.equal(local.warehouse+local.display,164);assert.ok(local.ldu>0);assert.equal(local.warehouse+local.display,119+45);assert.notEqual(local.warehouse+local.display,119+45+5);
});

test('SKU-only LDU markers stay separate from sellable variants and duplicate ordinary SKUs block publication',()=>{
 const rows=[['Период: 07.11.2026 - 07.11.2026'],['Артикул','','','Номенклатура','','','Склад ТЦ Европолис','Склад ТЦ Европолис ОВ','Брак','Склад Другой','Итого'],['','','','','','','Количество','Количество','Количество','Количество','Количество'],['ORDINARY','','','Смартфон QA 8/128 Black','','',2,0,0,0,2],['DEMO (LDU)','','','Смартфон QA 8/128 Black','','',0,1,5,0,6],['Итого','','','','','',2,1,5,0,8]];
 const result=parseUnifiedWorkbook(XLSX,workbook(rows));assert.equal(result.report.items[1].is_demo,true);assert.equal(result.report.items[1].source_raw_name,'Смартфон QA 8/128 Black');assert.notEqual(result.report.items[0].key,result.report.items[1].key);
 rows[4][0]='ORDINARY';rows[4][3]='Смартфон QA 8/256 Black';assert.throws(()=>parseUnifiedWorkbook(XLSX,workbook(rows)),/Артикул.*повторяется/);
});

test('SKU product before a deeper model group is not discarded when group names are merged into A instead of D',()=>{
 const rows=[['Период: 07.11.2026 - 07.11.2026'],['Артикул','','','Номенклатура','','','Склад ТЦ Европолис','Склад ТЦ Европолис ОВ','Брак','Склад Другой','Итого'],['','','','','','','Количество','Количество','Количество','Количество','Количество'],['Категория'],['SKU-A','','','Смартфон QA A','','',2,0,0,0,2],['Новая глубокая группа'],['SKU-B','','','Смартфон QA B','','',3,0,0,0,3],['Итого','','','','','',5,0,0,0,5]];
 const report=parseNetworkRows(rows,{levels:[0,0,0,0,1,0,2,0]});assert.equal(report.items.length,2);assert.equal(report.total,5);assert.equal(report.items[0].source_skus[0],'SKU-A');
});

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {parseNetworkRows} from '../js/network-parser.js';
import {parseUnifiedWorkbook,localNetworkPreview} from '../js/unified-import.js';
const base=()=>[
 ['Период: 08.11.2026 - 08.11.2026'],
 ['Артикул','','','Номенклатура, Ед. изм.','','','Склад ТЦ Европолис','Склад ТЦ Европолис ОВ','Брак','Другой склад','Итого'],
 ['','','','','','','Количество','Количество','Количество','Количество','Количество'],
 ['SKU','','','Товар с артикулом, шт','','',42043,0,0,0,42043],
 ['','','','Фонарик, шт','','',0,0,0,8,8],
 ['','','','Вентилятор, шт','','',0,0,0,3,3],
 ['','','','Кресло, шт','','',0,0,0,3,3],
 ['','','','Наушники, шт','','',0,0,0,-16,-16],
 ['Итого','','','','','',42043,0,0,-2,42041]
];
test('flat SKU report retains real unit-marked positions with blank articles, including negative stock',()=>{
 const r=parseNetworkRows(base());assert.equal(r.total,42041);assert.equal(r.items.length,5);assert.equal(r.negative,1);assert.deepEqual(r.columnSums,[42043,0,0,-2]);assert.equal(r.items.at(-1).total,-16);assert.deepEqual(r.items.at(-1).source_skus,[]);
});
test('blank SKU group headings remain groups; outline parent rows cannot become unit-marked leaf products',()=>{
 const rows=base();rows.splice(3,0,['','','','Смартфоны','','',42043,0,0,0,42043]);const r=parseNetworkRows(rows);assert.equal(r.items.length,5);assert.equal(r.total,42041);assert.equal(r.skipped[0].name,'Смартфоны');
 rows[3][3]='Группа товаров, шт';const levels=rows.map((_,i)=>i===4?1:0);assert.equal(parseNetworkRows(rows,{levels}).items.length,5);
});
test('all warehouse and report checks still reject incorrect totals after accepting blank articles',()=>{
 const rows=base();rows.at(-1)[10]=42042;assert.throws(()=>parseNetworkRows(rows),/не совпадает с общим итогом/);
 const swapped=base();swapped.at(-1)[6]--;swapped.at(-1)[9]++;assert.throws(()=>parseNetworkRows(swapped),/Итог склада/);
});
test('08 Nov real report reconciles all 124 warehouses and retains all four article-less rows',{skip:!process.env.WEBBASE_REPORT_20261108},()=>{
 const c={};vm.runInNewContext(fs.readFileSync(new URL('../vendor/xlsx-0.18.5.full.min.js',import.meta.url),'utf8'),c);
 const wb=c.XLSX.read(fs.readFileSync(process.env.WEBBASE_REPORT_20261108),{type:'buffer',cellStyles:true});const {report:r}=parseUnifiedWorkbook(c.XLSX,wb);
 assert.equal(r.items.length,1614);assert.equal(r.total,42041);assert.equal(r.columns.length,124);assert.equal(r.negative,27);
 const missing=r.items.filter(i=>!i.source_skus.length);assert.deepEqual(missing.map(i=>i.row),[8,323,603,706]);assert.equal(missing.reduce((n,i)=>n+i.total,0),-2);assert.equal(missing.at(-1).total,-16);
 for(const [name,n]of [['Склад ТЦ Европолис',1021],['Склад ТЦ Европолис ОВ',44],['Склад ТЦ Европолис Брак',35]]){const index=r.columns.findIndex(c=>c.raw_name===name);assert.equal(r.columnSums[index],n);}
 const meta=r.columns.filter(c=>/^Склад ТЦ Европолис(?: ОВ| Брак)?$/.test(c.raw_name)).map(c=>({key:c.key,kind:c.raw_name.endsWith('ОВ')?'display':c.raw_name.endsWith('Брак')?'defect':'warehouse',company:'smart_orange',reviewed:true,excluded:false,webbase_network_stores:{is_local:true}}));
 const local=localNetworkPreview(r,meta);assert.equal(local.warehouse,1018);assert.equal(local.display,44);assert.equal(local.ldu,9);
});

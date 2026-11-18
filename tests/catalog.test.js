import test from "node:test";
import assert from "node:assert/strict";
import { compareCatalogProducts, orderedCategories } from "../js/catalog.js";

test("catalog starts with smartphones and follows the fixed category order", () => {
  const products = [
    { name: "Чехол", category: "Аксессуары и другое" },
    { name: "Наушники", category: "Наушники" },
    { name: "Часы", category: "Смарт-часы" },
    { name: "Планшет", category: "Планшеты" },
    { name: "Телефон Б", category: "Смартфоны" },
    { name: "Телефон А", category: "Смартфоны" },
  ].sort(compareCatalogProducts);

  assert.deepEqual(products.map((item) => item.name), ["Телефон А", "Телефон Б", "Планшет", "Часы", "Наушники", "Чехол"]);
});

test("category filter uses the same priority order", () => {
  const categories = orderedCategories([
    { category: "Пылесосы" },
    { category: "Аксессуары и другое" },
    { category: "Смартфоны" },
  ]);
  assert.deepEqual(categories.slice(0, 6), ["Смартфоны", "Планшеты", "Смарт-часы", "Наушники", "Фитнес-браслеты", "Телевизоры"]);
  assert.deepEqual(categories.slice(6, 13), ["Пылесосы", "Бытовая техника для дома", "Умный дом", "Компьютерная техника", "Видеонаблюдение", "Аудио", "Аксессуары для пылесосов"]);
  assert.deepEqual(categories.slice(13), ["Аксессуары и другое"]);
});

test("search supports last four digits of every source SKU and keeps text search", async () => {
  const { matchesProductSearch } = await import("../js/catalog.js");
  const row = { name: "Смартфон Xiaomi", sku: "MAIN", source_skus: ["6941812777756", "ALT-98-76-X"] };
  assert.equal(matchesProductSearch(row, "7756"), true);
  assert.equal(matchesProductSearch(row, "9876"), true);
  assert.equal(matchesProductSearch(row, "xiaomi"), true);
  assert.equal(matchesProductSearch(row, "0000"), false);
  assert.equal(matchesProductSearch(row, ""), true);
});


test("four-digit suffix distinguishes a full-SKU ending from a middle substring", async () => {
  const { matchesSkuSuffix } = await import("../js/catalog.js");
  assert.equal(matchesSkuSuffix({sku:"6941812777756"}, "7756"), true);
  assert.equal(matchesSkuSuffix({sku:"6934177756016"}, "7756"), false);
});

test('available products sort before zero stock across categories and within a category', () => {
  const rows=[
    {name:'A phone',category:'Смартфоны',stock:{warehouse:0,display:0}},
    {name:'Z TV',category:'Телевизоры',stock:{warehouse:0,display:1,ldu:1}},
    {name:'Z phone',category:'Смартфоны',stock:{warehouse:1,display:0}},
    {name:'Demo counter only',category:'Смартфоны',stock:{warehouse:0,display:0,ldu:2}},
  ].sort(compareCatalogProducts);
  assert.deepEqual(rows.map(r=>r.name),['Z phone','A phone','Demo counter only','Z TV']);
});

test('in-stock view puts 18 Pro Max, 18 Pro, 17T, 17T Pro, other 17, Redmi Note and Redmi in the requested order',()=>{
  const names=['REDMI 17','Xiaomi 17T Pro','Xiaomi 18 Pro','POCO F9','Redmi Note 17 Pro','Xiaomi 17 Ultra','Xiaomi 17T','Xiaomi 18 Pro Max'];
  const rows=names.map(model=>({name:`Смартфон ${model} 12GB+256GB Black, шт`,category:'Смартфоны',stock:{warehouse:1}}));
  const before=rows.map(row=>row.name);
  assert.deepEqual([...rows].sort((a,b)=>compareCatalogProducts(a,b,true)).map(row=>row.name),
    [7,2,6,1,5,4,0,3].map(i=>before[i]));
  assert.deepEqual([...rows].sort(compareCatalogProducts).map(row=>row.name),[...before].sort((a,b)=>a.localeCompare(b,'ru')));
  assert.deepEqual(rows.map(row=>row.name),before);
});

test('model priority respects full family names, category boundaries and sellable stock',()=>{
  const phone=name=>({name,category:'Смартфоны',stock:{warehouse:1}});
  const rows=[phone('Смартфон Xiaomi 180 Pro'),phone('Смартфон Xiaomi Redmi Note 17 8/256 ГБ Blue'),phone('Смартфон xiaomi\u00a018 pro max 12/512 ГБ White'),phone('Смартфон REDMI 17 8/128 ГБ Black'),
    {...phone('Смартфон Xiaomi 18 Pro Max 12/256 ГБ Black'),stock:{warehouse:0,display:1,ldu:1}},
    {name:'Смартфон Xiaomi 18 Pro Max',category:'Аксессуары и другое',stock:{warehouse:1}}];
  const sorted=[...rows].sort((a,b)=>compareCatalogProducts(a,b,true));
  assert.deepEqual(sorted.map(row=>row.name),[2,1,3,0,5,4].map(i=>rows[i].name));
});

test('sale stock shows only the main warehouse and never labels display/demo as sellable',async()=>{
 const {saleStockMarkup,renderProductCard}=await import('../js/catalog.js');
 const available=saleStockMarkup({warehouse:3,display:10,ldu:5});
 assert.match(available,/Могу продать/);assert.match(available,/sale-stock--available/);assert.match(available,/<strong>3<small>/);assert.doesNotMatch(available,/ОВ|Всего|Витрина|10/);
 const empty=saleStockMarkup({warehouse:0,display:10,ldu:5});assert.match(empty,/Нет в наличии/);assert.doesNotMatch(empty,/Могу продать/);
 const card=renderProductCard({id:'id',name:'Test',stock:{warehouse:0,display:9},category:'Смартфоны'});assert.doesNotMatch(card,/ОВ|Всего/);
});

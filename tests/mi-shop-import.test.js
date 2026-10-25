import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { analyze1CRows, classifyProduct } from '../js/importer.js';
import { accessoryKind } from '../js/compatibility.js';
const products=JSON.parse(readFileSync(new URL('../supabase/data/mi-shop-catalog-20261025.json',import.meta.url)));

test('reviewed shop snapshot includes only available variants and explicit appliance exceptions',()=>{
  assert.equal(products.length,280);
  assert.equal(new Set(products.map(p=>p.sku.toLowerCase())).size,products.length);
  assert.equal(new Set(products.map(p=>p.id)).size,products.length);
  for(const p of products){
    const exception=p.specs._catalog_unavailable_exception;
    if(exception) assert.match(p.name,/^(Холодильник|Стиральная машина) /);
    else assert.equal(p.specs._catalog_availability,'InStock',p.sku);
    assert.equal(p.source_skus[0],p.sku);
    assert.equal(classifyProduct(p.name),p.category,p.name);
    assert.ok(p.description.length>20&&p.description.length<=5000,p.sku);
    assert.ok(Object.keys(p.specs).some(k=>!k.startsWith('_')),p.sku);
    assert.equal(accessoryKind(p),null,'devices cannot appear as vacuum consumables: '+p.name);
  }
  assert.equal(products.filter(p=>p.specs._catalog_unavailable_exception).length,2);
  assert.ok(products.some(p=>p.category==='Компьютерная техника'));
  assert.ok(products.some(p=>p.category==='Видеонаблюдение'));
});

test('each new shop card has a private optimized gallery tied to its own complete SKU identity',()=>{
  const paths=new Set();
  for(const p of products){
    assert.ok(p.images.length>=1&&p.images.length<=3,p.sku);
    assert.equal(p.images.filter(i=>i.is_primary).length,1);
    for(const i of p.images){
      assert.equal(i.product_id,p.id);assert.equal(i.sku,p.sku);
      assert.ok(i.storage_path.startsWith('products/'+p.id+'/'));
      assert.equal(i.mime_type,'image/webp');assert.ok(i.byte_size>0&&i.byte_size<150000);
      assert.match(i.sha256,/^[a-f0-9]{64}$/);assert.ok(!paths.has(i.storage_path));paths.add(i.storage_path);
      assert.match(i.source_url,/^https:\/\/(mi-shop\.com|www\.mi\.com)\//);
    }
  }
});

test('future 1C imports match every shop variant by full SKU even when 1C uses another product name',()=>{
  const header=['Артикул','','','Номенклатура','','','Склад','ОВ','Брак','Итого'];
  const rows=[header,...products.map((p,i)=>[p.sku,'','',`Название из 1С ${i}`,'','',2,1,0,3])];
  const result=analyze1CRows(rows,products);
  assert.equal(result.errors.length,0);assert.equal(result.ambiguous.length,0);
  assert.equal(result.items.length,products.length);
  result.items.forEach((item,i)=>{assert.equal(item.status,'update');assert.equal(item.matchedProductId,products[i].id);});
  const unseen=analyze1CRows([header,['__UNSEEN_SHOP_SKU__','','','Смартфон новая модель','','',1,0,0,1]],products);
  assert.equal(unseen.items[0].status,'new');
});

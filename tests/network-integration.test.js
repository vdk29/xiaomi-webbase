import test from 'node:test';import assert from 'node:assert/strict';import {normalizeProduct} from '../js/products.js';import{matchesProductSearch}from'../js/catalog.js';
test('a reused private Storage path is displayed as an inherited photo with zero local stock',()=>{const p=normalizeProduct({id:'p',name:'Смартфон Xiaomi 17 Ultra 16GB+512GB Black',network_origin:true,image_path:'products/existing/photo.webp'});assert.equal(p.stock.warehouse,0);assert.equal(p.images[0].storage_path,'products/existing/photo.webp');assert.equal(p.images[0].inherited,true);assert.equal(p.primaryImage.storage_path,'products/existing/photo.webp');});
test('an administrator gallery wins over the auto-enriched bank path',()=>{const p=normalizeProduct({id:'p',name:'Device',network_origin:true,image_path:'bank.webp',webbase_product_images:[{id:'own',storage_path:'own.webp',is_primary:true,sort_order:0}]});assert.equal(p.images.length,1);assert.equal(p.primaryImage.storage_path,'own.webp');});
test('catalog search understands separate model, translated colour and RAM/storage tokens',()=>{const p={name:'Смартфон Xiaomi 17 Ultra 16GB+512GB Black',source_skus:['SKU12345678']};assert.ok(matchesProductSearch(p,'17 Ultra черный 16/512'));assert.ok(matchesProductSearch(p,'5678'));assert.equal(matchesProductSearch(p,'17 Ultra white'),false);assert.equal(matchesProductSearch(p,'16/1024 Black'),false);});


test('network product return preserves only a valid legal entity', async () => {
 const {productReturnUrl}=await import('../js/listing-navigation.js');
 for(const company of ['smart_orange','mobility','mixtech']) {
  const target='index.html?section=network&network_company='+company;
  assert.equal(productReturnUrl('https://example.com/product.html?returnTo='+encodeURIComponent(target)),target);
 }
 assert.equal(productReturnUrl('https://example.com/product.html?returnTo='+encodeURIComponent('index.html?section=network&network_company=invalid')),'index.html?section=network');
});


test('network return retains its category without applying it as the local catalogue category',async()=>{
 const {productReturnUrl}=await import('../js/listing-navigation.js');
 const target='index.html?section=network&network_company=smart_orange&network_category='+encodeURIComponent('Смартфоны');
 const result=new URL(productReturnUrl('https://example.com/product.html?returnTo='+encodeURIComponent(target)),'https://example.com/');
 assert.equal(result.searchParams.get('network_category'),'Смартфоны');assert.equal(result.searchParams.has('category'),false);
});

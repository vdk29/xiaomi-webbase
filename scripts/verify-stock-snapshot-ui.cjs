// Isolated browser import: real Excel parsing, mocked auth/data; no production writes.
const{chromium}=require('playwright');const assert=require('node:assert/strict');const fs=require('node:fs');
(async()=>{const browser=await chromium.launch({headless:true,...(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{})});const base=process.env.WEBBASE_TEST_URL||'http://127.0.0.1:4173/';
try{for(const width of [320,390,1440]){
 const page=await browser.newPage({viewport:{width,height:900}});const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('dialog',d=>d.accept());
 await page.route('**/supabase-client.js*',route=>route.fulfill({contentType:'text/javascript',body:`
 const make=(id,sku,name,w,d)=>({id,external_id:sku.toLowerCase(),sku,source_skus:[sku],name,source_name:name,category:'Смартфоны',active:true,webbase_stock:{warehouse:w,display:d,ldu:0},webbase_product_images:[]});
 window.stockQA={imports:0,rows:JSON.parse(sessionStorage.getItem('stockQARows')||'null')||[make('11111111-1111-4111-8111-111111111111','SKU-A','Смартфон Xiaomi A',8,3),make('22222222-2222-4222-8222-222222222222','SKU-B','Смартфон Xiaomi B',5,0),make('33333333-3333-4333-8333-333333333333','SKU-DEMO','Смартфон Xiaomi Demo',0,12)]};
 window.WebBaseDB={config:{url:'https://test.invalid',bucket:'test'},getSession:async()=>({user:{id:'admin'}}),client:{auth:{onAuthStateChange:()=>{}},from:table=>{const q={select:()=>q,eq:()=>q,order:()=>q,range:async(a,b)=>({data:stockQA.rows.slice(a,b+1)}),maybeSingle:async()=>({data:table==='webbase_staff'?{active:true,role:'admin'}:stockQA.rows.find(p=>p.sku==='SKU-A')})};return q},rpc:async(name,args)=>{if(name!=='webbase_apply_import')throw Error('Unexpected mutation '+name);stockQA.imports++;stockQA.payload=args;for(const row of stockQA.rows)row.webbase_stock={warehouse:0,display:0,ldu:0};let created=0,updated=0;for(const item of args.p_items){let row=stockQA.rows.find(p=>p.source_skus.includes(item.sku));if(!row){row=make('44444444-4444-4444-8444-444444444444',item.sku,item.name,0,0);stockQA.rows.push(row);created++}else updated++;row.webbase_stock={warehouse:item.warehouse,display:item.display,ldu:item.ldu};}sessionStorage.setItem('stockQARows',JSON.stringify(stockQA.rows));return{data:{created,updated,zeroed:2}}}}};`}));
 await page.goto(base);await page.waitForFunction(()=>document.querySelectorAll('#catalog .product-card').length===3);
 assert.equal(await page.locator('[value="display"]').count(),0);assert.doesNotMatch(await page.locator('#catalog').innerText(),/ОВ|Всего/);
 const demo=page.locator('.product-card').filter({hasText:'Xiaomi Demo'});assert.match(await demo.innerText(),/Нет в наличии/);assert.equal(await demo.locator('.sale-stock--available').count(),0);
 await page.screenshot({path:`/workspace/scratch/stock-${width}.png`,fullPage:true});
 await page.locator('[data-nav=import]').click();
 const workbook=await page.evaluate(async()=>{await import('./js/excel-loader.js?v=20261024-11').then(m=>m.loadExcelLibrary());const rows=[['Артикул','','','Номенклатура','','','Склад','ПФ','ОВ','Итого'],['SKU-A','','','Смартфон Xiaomi A','','',2,0,1,3],['SKU-NEW','','','Смартфон Xiaomi New','','',4,0,0,4]];const wb=XLSX.utils.book_new();XLSX.utils.book_append_sheet(wb,XLSX.utils.aoa_to_sheet(rows),'Остатки');return Array.from(new Uint8Array(XLSX.write(wb,{type:'array',bookType:'xlsx'})))});
 // A slower previous file must never replace the most recently selected report.
 await page.evaluate(()=>{const original=File.prototype.arrayBuffer;File.prototype.arrayBuffer=async function(){if(this.name==='older.xlsx')await new Promise(resolve=>window.releaseOlder=resolve);return original.call(this)}});
 await page.locator('#excel').setInputFiles({name:'older.xlsx',mimeType:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',buffer:Buffer.from(workbook)});
 await page.waitForFunction(()=>typeof releaseOlder==='function');
 await page.locator('#excel').setInputFiles({name:'latest.xlsx',mimeType:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',buffer:Buffer.from(workbook)});
 await page.locator('[data-import]').waitFor();
 await page.evaluate(()=>{document.querySelector('#importPreview').dataset.latest='true';const root=document.querySelector('#importPreview');window.previewReplacements=0;new MutationObserver(()=>window.previewReplacements++).observe(root,{childList:true});releaseOlder()});
 await page.waitForTimeout(100);assert.equal(await page.evaluate(()=>previewReplacements),0,'Older file must not replace the latest preview');
 for(let cycle=0;cycle<2;cycle++){
 await page.locator('#excel').setInputFiles({name:'fresh-stock.xlsx',mimeType:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',buffer:Buffer.from(workbook)});
 await page.locator('[data-import]').waitFor();assert.match(await page.locator('#importPreview').innerText(),/отсутствующих в этом файле/);assert.equal(await page.locator('[data-import]').isEnabled(),true);await page.locator('[data-import]').click();await page.waitForFunction(n=>stockQA.imports===n,cycle+1);await page.waitForFunction(()=>!document.querySelector('#excel').disabled);
 }
 assert.equal(await page.evaluate(()=>stockQA.rows.length),4);assert.equal(await page.evaluate(()=>stockQA.rows.find(p=>p.sku==='SKU-A').webbase_stock.warehouse),2);assert.equal(await page.evaluate(()=>stockQA.rows.find(p=>p.sku==='SKU-B').webbase_stock.warehouse),0);
 await page.locator('[data-nav=catalog]').click();await page.selectOption('#availability','available');await page.waitForFunction(()=>document.querySelectorAll('#catalog .product-card').length===2);
 assert.match(await page.locator('#catalog').innerText(),/Могу продать/);assert.doesNotMatch(await page.locator('#catalog').innerText(),/Xiaomi B|Xiaomi Demo/);
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
 await page.locator('.product-card').filter({hasText:'Xiaomi A'}).click();await page.locator('#productStock .stock-breakdown').waitFor();
 assert.match(await page.locator('#productStock').innerText(),/Могу продать/);assert.match(await page.locator('#productStock').innerText(),/ОВ — открытая выкладка/);
 assert.equal(await page.locator('[data-stock-value=sellable]').innerText(),'2');assert.equal(await page.locator('[data-stock-value=warehouse]').innerText(),'2');assert.equal(await page.locator('[data-stock-value=display]').innerText(),'1');
 assert.equal(await page.locator('#productStock .stock-breakdown').evaluate(e=>getComputedStyle(e).gridTemplateColumns.split(' ').length),3);
 assert.match(await page.locator('#productStock .stock-counter--sellable').evaluate(e=>getComputedStyle(e).backgroundImage),/gradient/);
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
 await page.evaluate(()=>{const row=stockQA.rows.find(p=>p.sku==='SKU-A');row.webbase_stock={warehouse:3,display:1,ldu:0};sessionStorage.setItem('stockQARows',JSON.stringify(stockQA.rows))});
 await page.reload();await page.locator('#productStock .stock-breakdown').waitFor();assert.equal(await page.locator('[data-stock-value=sellable]').innerText(),'3');assert.equal(await page.locator('[data-stock-value=warehouse]').innerText(),'3');assert.equal(await page.locator('[data-stock-value=display]').innerText(),'1');
 await page.screenshot({path:`/workspace/scratch/product-stock-detail-${width}.png`,fullPage:true});
 assert.deepEqual(errors,[]);console.log('PASS',width,'px: warehouse-only catalog sale badge/filter; compact product warehouse/display breakdown; real Excel preview, full-snapshot warning, repeated import and refreshed cards');await page.close();
}}finally{await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1});

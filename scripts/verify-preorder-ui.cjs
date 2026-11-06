const {chromium}=require('playwright');const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true,...(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{})});
 const base=process.env.WEBBASE_TEST_URL||'http://127.0.0.1:4173/';
 try{
 for(const width of [1440,768,430,390,320]){
 const page=await browser.newPage({viewport:{width,height:1000}});const errors=[];page.on('pageerror',e=>errors.push(e.message));let requests=[];page.on('request',r=>requests.push(r.url()));
 await page.route('**/supabase-client.js*',route=>route.fulfill({contentType:'text/javascript',body:`window.preorderQA={reads:0};window.WebBaseDB={config:{url:'https://test.invalid',bucket:'test'},getSession:async()=>({user:{id:'test'}}),client:{auth:{onAuthStateChange:()=>{}},from:table=>{const q={select:()=>q,eq:()=>q,order:()=>q,range:async()=>{preorderQA.reads++;return {data:[]}},maybeSingle:async()=>({data:{active:true,role:'staff'}})};return q},rpc:async()=>({data:[]})}};`}));
 await page.goto(base+'index.html?section=preorder');await page.locator('.po-shell').waitFor();
 assert.equal(await page.evaluate(()=>preorderQA.reads),0,'Preorder must not fetch catalog');
 assert.equal(await page.locator('#catalogStatus').isVisible(),false);
 assert.equal(await page.locator('#po-film').getAttribute('src'),null);
 await page.screenshot({path:`/workspace/scratch/preorder/ui-${width}.png`,fullPage:true});
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,'Body must fit viewport');
 if(width<=700){assert.equal(await page.locator('.po-product-stage').evaluate(e=>{const image=e.querySelector('img').getBoundingClientRect(),badge=e.querySelector('.po-product-badge').getBoundingClientRect();return image.top>=badge.bottom+6}),true,'Product badge must not cover the phone');}
 const models=await page.locator('[data-po-model]').evaluateAll(bs=>bs.map(b=>b.dataset.poModel));assert.deepEqual(models,['xiaomi-18-pro','xiaomi-18-pro-max']);
 assert.equal(await page.locator('#po-compare, .po-pending, #po-specs details').count(),0);
 assert.equal(await page.locator('#po-specs .po-spec-card').count(),7);
 assert.equal(await page.locator('#po-specs .po-spec-card:visible').count(),7);
 assert.match(await page.locator('#po-specs').innerText(),/Официальные характеристики китайской версии/);
 assert.equal(await page.locator('.po-spec-card dd').count(),51);
 assert.equal(await page.locator('#po-spec-links a').count(),7);
 assert.doesNotMatch(await page.locator('.po-shell').innerText(),/Global|Fold|17T|17 Max|предварительные|ОБЫЧНЫЙ XIAOMI/);
 for(const model of models){
 await page.locator(`[data-po-model="${model}"]`).click();
 assert.equal(await page.locator('#po-spec-name').innerText(),(model.endsWith('max')?'Xiaomi 18 Pro Max':'Xiaomi 18 Pro')+' · Китай');
 const colors=await page.locator('[data-po-color]').evaluateAll(bs=>bs.map(b=>b.dataset.poColor));
 assert.deepEqual(colors,['black','white','pink','blue','transparent']);
 assert.equal(await page.locator('[data-po-color]').evaluateAll(bs=>bs.every(b=>b.getBoundingClientRect().width>=44&&b.getBoundingClientRect().height>=44)),true);
 for(const color of colors){await page.locator(`[data-po-color="${color}"]`).click();await page.waitForFunction(()=>{const i=document.querySelector('#po-device-image');return i?.complete&&i.naturalWidth>0});assert.equal(new URL(page.url()).searchParams.get('finish'),color);}
 }
 await page.locator('[data-po-model="xiaomi-18-pro-max"]').click();await page.locator('[data-po-color="transparent"]').click();assert.equal(await page.locator('[data-po-capacity]').count(),1);
 assert.match(await page.locator('#po-color-edition').innerText(),/16 ГБ \/ 1 ТБ/);
 if(width<=430){assert.ok(await page.locator('.po-spec-card dd').first().evaluate(e=>parseFloat(getComputedStyle(e).fontSize))>=15);assert.equal(await page.locator('#po-spec-groups').evaluate(e=>getComputedStyle(e).gridTemplateColumns.split(' ').length),1);}
 await page.evaluate(()=>Object.defineProperty(navigator,'clipboard',{value:{writeText:async text=>window.qaCopied=text},configurable:true}));
 await page.locator('[data-po-copy]').click();assert.match(await page.evaluate(()=>qaCopied),/16 ГБ \/ 1 ТБ/);
 for(const demo of ['cards','wallpaper','ai','selfie']){await page.locator(`[data-po-demo="${demo}"]`).click();assert.equal(await page.locator(`[data-po-demo="${demo}"]`).getAttribute('aria-pressed'),'true');}
 for(const shot of ['night','detail','portrait']){await page.locator(`[data-po-shot="${shot}"]`).click();await page.waitForFunction(()=>{const i=document.querySelector('#po-sample');return i.complete&&i.naturalWidth>0});}
 await page.locator('#po-camera').scrollIntoViewIfNeeded();await page.waitForFunction(()=>[...document.querySelectorAll('#po-camera img')].every(i=>i.complete&&i.naturalWidth>0));
 await page.screenshot({path:`/workspace/scratch/preorder/loaded-${width}.png`,fullPage:true});
 assert.equal(await page.locator('#po-specs .po-spec-card:visible').count(),7);
 await page.locator('[data-po-play]').click();await page.waitForFunction(()=>document.querySelector('#po-film').readyState>=2);
 await page.locator('[data-nav=catalog]').click();await page.waitForFunction(()=>preorderQA.reads===1);assert.equal(await page.locator('.po-shell').isVisible(),false);assert.equal(await page.evaluate(()=>document.querySelector('#po-film').paused),true);
 await page.locator('[data-nav=preorder]').click();assert.equal(await page.locator('[data-po-color=transparent]').getAttribute('aria-pressed'),'true');
 await page.reload();await page.locator('.po-shell').waitFor();assert.equal(await page.evaluate(()=>preorderQA.reads),0);assert.equal(await page.locator('[data-po-color=transparent]').getAttribute('aria-pressed'),'true');
 assert.deepEqual(errors,[]);console.log('PASS preorder',width,'px: two China models, five named colors, 51 manufacturer facts, touch controls, no comparison table, all colors, deep links, immediately open specs, video, navigation; no catalog dependency');
 await page.close();
 }
 const legacy=await browser.newPage();await legacy.route('**/supabase-client.js*',route=>route.fulfill({contentType:'text/javascript',body:`window.WebBaseDB={getSession:async()=>({user:{id:'test'}}),client:{auth:{onAuthStateChange:()=>{}},from:()=>{const q={select:()=>q,eq:()=>q,maybeSingle:async()=>({data:{active:true,role:'staff'}})};return q}}};`}));await legacy.goto(base+'index.html?section=preorder&phone=xiaomi-18-fold&finish=transparent&capacity=16%20ГБ%20%2F%201%20ТБ');await legacy.locator('.po-shell').waitFor();assert.match(await legacy.locator('#po-spec-name').innerText(),/^Xiaomi 18 Pro · Китай$/);assert.equal(new URL(legacy.url()).searchParams.get('finish'),'transparent');await legacy.close();
 const page=await browser.newPage();let media=[];page.on('request',r=>{if(/preorder/.test(r.url()))media.push(r.url())});await page.goto(base);await page.locator('#authPanel').waitFor();assert.deepEqual(media,[]);console.log('PASS cold login: no presentation JS, CSS or media downloaded');await page.close();
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});

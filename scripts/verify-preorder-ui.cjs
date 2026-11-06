const {chromium}=require('playwright');const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true,...(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{})});
 const base=process.env.WEBBASE_TEST_URL||'http://127.0.0.1:4173/';
 try{
 for(const width of [1440,390]){
 const page=await browser.newPage({viewport:{width,height:1000}});const errors=[];page.on('pageerror',e=>errors.push(e.message));let requests=[];page.on('request',r=>requests.push(r.url()));
 await page.route('**/supabase-client.js*',route=>route.fulfill({contentType:'text/javascript',body:`window.preorderQA={reads:0};window.WebBaseDB={config:{url:'https://test.invalid',bucket:'test'},getSession:async()=>({user:{id:'test'}}),client:{auth:{onAuthStateChange:()=>{}},from:table=>{const q={select:()=>q,eq:()=>q,order:()=>q,range:async()=>{preorderQA.reads++;return {data:[]}},maybeSingle:async()=>({data:{active:true,role:'staff'}})};return q},rpc:async()=>({data:[]})}};`}));
 await page.goto(base+'index.html?section=preorder');await page.locator('.po-shell').waitFor();
 assert.equal(await page.evaluate(()=>preorderQA.reads),0,'Preorder must not fetch catalog');
 assert.equal(await page.locator('#catalogStatus').isVisible(),false);
 assert.equal(await page.locator('#po-film').getAttribute('src'),null);
 await page.screenshot({path:`/workspace/scratch/preorder/ui-${width}.png`,fullPage:true});
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,'Body must fit viewport');
 const models=await page.locator('[data-po-model]').evaluateAll(bs=>bs.map(b=>b.dataset.poModel));assert.equal(models.length,6);
 for(const model of models){
 await page.locator(`[data-po-model="${model}"]`).click();
 const colors=await page.locator('[data-po-color]').evaluateAll(bs=>bs.map(b=>b.dataset.poColor));
 for(const color of colors){await page.locator(`[data-po-color="${color}"]`).click();await page.waitForFunction(()=>{const i=document.querySelector('#po-device-image');return i?.complete&&i.naturalWidth>0});assert.equal(new URL(page.url()).searchParams.get('finish'),color);}
 }
 await page.locator('[data-po-model="xiaomi-18-pro-max"]').click();await page.locator('[data-po-color="transparent"]').click();assert.equal(await page.locator('[data-po-capacity]').count(),1);
 await page.evaluate(()=>Object.defineProperty(navigator,'clipboard',{value:{writeText:async text=>window.qaCopied=text},configurable:true}));
 await page.locator('[data-po-copy]').click();assert.match(await page.evaluate(()=>qaCopied),/16 ГБ \/ 1 ТБ/);
 for(const demo of ['cards','wallpaper','ai','selfie']){await page.locator(`[data-po-demo="${demo}"]`).click();assert.equal(await page.locator(`[data-po-demo="${demo}"]`).getAttribute('aria-pressed'),'true');}
 for(const shot of ['night','detail','portrait']){await page.locator(`[data-po-shot="${shot}"]`).click();await page.waitForFunction(()=>{const i=document.querySelector('#po-sample');return i.complete&&i.naturalWidth>0});}
 await page.locator('#po-camera').scrollIntoViewIfNeeded();await page.waitForFunction(()=>[...document.querySelectorAll('#po-camera img')].every(i=>i.complete&&i.naturalWidth>0));
 await page.screenshot({path:`/workspace/scratch/preorder/loaded-${width}.png`,fullPage:true});
 await page.locator('[data-po-expand]').click();assert.equal(await page.locator('.po-spec-group:not([open])').count(),0);
 await page.locator('[data-po-play]').click();await page.waitForFunction(()=>document.querySelector('#po-film').readyState>=2);
 await page.locator('[data-nav=catalog]').click();await page.waitForFunction(()=>preorderQA.reads===1);assert.equal(await page.locator('.po-shell').isVisible(),false);assert.equal(await page.evaluate(()=>document.querySelector('#po-film').paused),true);
 await page.locator('[data-nav=preorder]').click();assert.equal(await page.locator('[data-po-color=transparent]').getAttribute('aria-pressed'),'true');
 await page.reload();await page.locator('.po-shell').waitFor();assert.equal(await page.evaluate(()=>preorderQA.reads),0);assert.equal(await page.locator('[data-po-color=transparent]').getAttribute('aria-pressed'),'true');
 assert.deepEqual(errors,[]);console.log('PASS preorder',width,'px: six models, all colors, deep links, display demos, specs, video, navigation; no catalog dependency');
 await page.close();
 }
 const page=await browser.newPage();let media=[];page.on('request',r=>{if(/preorder/.test(r.url()))media.push(r.url())});await page.goto(base);await page.locator('#authPanel').waitFor();assert.deepEqual(media,[]);console.log('PASS cold login: no presentation JS, CSS or media downloaded');await page.close();
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});

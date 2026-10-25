// Reproduce a successful first response followed by persistent transfer failures.
const{chromium}=require('playwright');const assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({headless:true,...(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{})});
try{const page=await browser.newPage({viewport:{width:390,height:844}});const errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.route('**/supabase-client.js*',route=>route.fulfill({contentType:'text/javascript',body:`
const state=window.adaptiveTest={calls:[],release:null};
const rows=Array.from({length:494},(_,i)=>({id:'11111111-1111-4111-8111-'+String(i+1).padStart(12,'0'),sku:'TEST'+i,name:i<18?'Смартфон '+i:'Чехол '+i,category:i<18?'Смартфоны':'Аксессуары и другое',webbase_stock:{warehouse:i<202?1:0,display:0},webbase_product_images:[]}));
window.WebBaseDB={config:{url:'https://test.invalid',bucket:'test'},getSession:async()=>({user:{id:'test'}}),client:{auth:{onAuthStateChange:()=>({})},from:table=>{const q={select:()=>q,eq:()=>q,order:()=>q,maybeSingle:async()=>({data:{active:true,role:'admin'}}),range:async(a,b)=>{
 state.calls.push([a,b]);if(a>0&&b-a+1>20)return{status:200,error:{message:'TypeError: Failed to fetch'}};
 if(a===70)await new Promise(resolve=>state.release=resolve);
 return{data:rows.slice(a,b+1)};
}};return q},rpc:async()=>({data:[]})}};
`}));
const base=process.env.WEBBASE_TEST_URL||'http://127.0.0.1:4173/';await page.goto(new URL('?category='+encodeURIComponent('Смартфоны')+'&availability=available',base).href);
await page.waitForFunction(()=>document.querySelector('#count').textContent.includes('из 70'));
assert.equal(await page.locator('#catalog .product-card').count(),18);assert.equal(await page.locator('#excel').isDisabled(),true);
assert.equal(await page.locator('#catalogError').isVisible(),false);assert.equal(await page.locator('#authPanel').isVisible(),false);
await page.evaluate(()=>adaptiveTest.release());await page.waitForFunction(()=>!document.querySelector('#excel').disabled);
assert.match(await page.locator('#count').innerText(),/18 из 494/);assert.equal(await page.locator('#catalogError').isVisible(),false);
const calls=await page.evaluate(()=>adaptiveTest.calls);assert.deepEqual(calls.slice(0,5),[[0,49],[50,249],[50,99],[50,99],[50,69]]);
assert.equal(await page.locator('#category').inputValue(),'Смартфоны');assert.equal(await page.locator('#availability').inputValue(),'available');
await page.selectOption('#category','');await page.selectOption('#availability','');await page.waitForFunction(()=>document.querySelectorAll('#catalog .product-card').length===494);
assert.deepEqual(errors,[]);console.log('PASS: 18 filtered phones remain usable, large responses fail, same offset recovers with 20 rows, progress 70→494, no lost rows or filters, import protected');
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1});

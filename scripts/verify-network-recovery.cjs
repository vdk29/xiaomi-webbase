// Reproduce dropped catalog responses without real credentials or database writes.
const {chromium}=require('playwright');const assert=require('node:assert/strict');
(async()=>{
const browser=await chromium.launch({headless:true,...(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{})});
try{
const page=await browser.newPage({viewport:{width:390,height:844}});
await page.route('https://cdn.jsdelivr.net/**',r=>r.fulfill({contentType:'text/javascript',body:''}));
await page.route('**/supabase-client.js*',r=>r.fulfill({contentType:'text/javascript',body:`
const state=window.testTransport={mode:'down',calls:0,recoveredFailure:false};
const rows=Array.from({length:51},(_,i)=>({id:'11111111-1111-4111-8111-'+String(i+1).padStart(12,'0'),sku:'TEST'+i,name:'Смартфон Xiaomi Test '+i+' 8GB+256GB Black',category:'Аксессуары и другое',webbase_product_images:[],webbase_stock:{warehouse:1,display:0}}));
window.WebBaseDB={config:{url:'https://test.invalid',bucket:'test'},getSession:async()=>({user:{id:'test-staff'}}),client:{auth:{onAuthStateChange:()=>({})},from:table=>{const q={select:()=>q,eq:()=>q,order:()=>q,maybeSingle:async()=>({data:{active:true,role:'staff'}}),range:async(from,to)=>{state.calls++;if(state.mode==='down'||(state.mode==='recover'&&!state.recoveredFailure)){state.recoveredFailure=true;return {status:200,error:{message:'TypeError: Failed to fetch',code:''}}}return {data:rows.slice(from,to+1)}}};return q},rpc:async(name)=>{if(name!=='webbase_shared_product_images')throw Error('Unexpected write');return state.mode==='photo-fail'?{error:{message:'Failed to fetch'}}:{data:[]}}}};
`}));
await page.goto(process.env.WEBBASE_TEST_URL||'http://127.0.0.1:4173/');
await page.locator('#catalogError').waitFor();assert.equal(await page.locator('#appShell').isVisible(),true);assert.equal(await page.locator('#authPanel').isVisible(),false);
assert.match(await page.locator('#catalogErrorText').innerText(),/Соединение с сервером прервалось/);assert.equal(await page.evaluate(()=>testTransport.calls),3);
await page.evaluate(()=>{testTransport.mode='recover';testTransport.recoveredFailure=false});await page.locator('#retryCatalog').click();await page.waitForFunction(()=>document.querySelectorAll('#catalog .product-card').length===51);
assert.equal(await page.locator('#catalogError').isVisible(),false);assert.equal(await page.evaluate(()=>testTransport.calls),6);
await page.evaluate(()=>testTransport.mode='photo-fail');await page.locator('#refresh').click();await page.locator('#catalogError').waitFor();assert.match(await page.locator('#catalogErrorText').innerText(),/Товары загружены/);assert.equal(await page.locator('#catalog .product-card').count(),51);assert.equal(await page.locator('#authPanel').isVisible(),false);
console.log('PASS: reset reproduced, bounded retries, session retained, manual recovery, 51 paginated products, optional photo failure does not block catalog');
}finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});

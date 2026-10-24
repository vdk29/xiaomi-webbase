// Browser regression with an isolated read adapter; no production data changes.
const assert=require('node:assert/strict');
const {chromium}=require('playwright');
(async()=>{
const browser=await chromium.launch({headless:true,...(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{})});
try{
const page=await browser.newPage({viewport:{width:390,height:844}});const errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.route('https://cdn.jsdelivr.net/**',route=>route.fulfill({contentType:'text/javascript',body:''}));
await page.route('**/supabase-client.js*',route=>route.fulfill({contentType:'text/javascript',body:`
const rows=Array.from({length:60},(_,i)=>({id:'11111111-1111-4111-8111-'+String(i+1).padStart(12,'0'),sku:'TEST'+i,name:(i<30?'Смартфон':'Наушники')+' '+i+' '+(i%3?'Black':'White'),category:i<30?'Смартфоны':'Наушники',specs:{},webbase_stock:{warehouse:2,display:0},webbase_product_images:[]}));
window.WebBaseDB={config:{url:'https://test.invalid',bucket:'test'},getSession:async()=>({user:{id:'test'}}),client:{auth:{onAuthStateChange:()=>({})},rpc:async()=>({data:[]}),from:table=>{let id;const q={select:()=>q,eq:(key,value)=>{if(key==='id')id=value;return q},order:()=>q,range:async(from,to)=>{await new Promise(r=>setTimeout(r,80));return {data:rows.slice(from,to+1)}},maybeSingle:async()=>({data:table==='webbase_staff'?{active:true,role:'staff'}:rows.find(p=>p.id===id)})};return q}}};
`}));
await page.goto(process.env.WEBBASE_TEST_URL||'http://127.0.0.1:4173/');await page.locator('#catalog .product-card').first().waitFor();
await page.selectOption('#category','Наушники');await page.fill('#search','Black');await page.selectOption('#availability','available');
await page.waitForFunction(()=>document.querySelectorAll('#catalog .product-card').length===20);
async function filters(){await page.waitForFunction(()=>document.querySelectorAll('#catalog .product-card').length===20);assert.equal(await page.locator('#category').inputValue(),'Наушники');assert.equal(await page.locator('#search').inputValue(),'Black');assert.equal(await page.locator('#availability').inputValue(),'available');assert.equal(await page.locator('#catalog .product-card').count(),20);}
async function openCard(){const card=page.locator('#catalog .product-card').nth(6);await card.evaluate(e=>e.scrollIntoView({block:'center',behavior:'instant'}));await page.waitForTimeout(120);const y=await page.evaluate(()=>scrollY);assert.ok(y>300);await card.click();await page.locator('#productView').waitFor();assert.ok(new URL(page.url()).searchParams.get('returnTo'));return y;}
let y=await openCard();await page.locator('.back-link').click();await page.locator('#catalog .product-card').first().waitFor();await filters();await page.waitForFunction(y=>Math.abs(scrollY-y)<12,y);
y=await openCard();await page.goBack();await page.locator('#catalog .product-card').first().waitFor();await filters();await page.waitForFunction(y=>Math.abs(scrollY-y)<12,y);
await page.reload();await page.locator('#catalog .product-card').first().waitFor();await filters();
assert.deepEqual(errors,[]);console.log('PASS: category, search, availability, scroll, explicit return, browser Back, refresh and delayed paginated loading');
}finally{await browser.close()}
})().catch(error=>{console.error(error);process.exitCode=1});

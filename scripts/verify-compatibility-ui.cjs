// Isolated browser regression: no production accounts or writes.
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
(async()=>{
const {COMPATIBILITY_BY_SKU}=await import('../js/compatibility-data.js');
const fixtures=Object.values(COMPATIBILITY_BY_SKU).filter(p=>p.kind==='vacuum').concat(Object.values(COMPATIBILITY_BY_SKU).find(p=>p.sku==='4640171463554'));
const rows=fixtures.map((c,i)=>({id:`11111111-1111-4111-8111-${String(i+1).padStart(12,'0')}`,sku:c.sku,name:c.name,category:c.kind==='vacuum'?'Аксессуары для пылесосов':'Аксессуары и другое',specs:{_compatibility:c},webbase_product_images:[],webbase_stock:{warehouse:3,display:1,ldu:0}}));
rows.push({id:'22222222-2222-4222-8222-222222222222',sku:'PHONE',name:'Смартфон Xiaomi 17T Pro',category:'Смартфоны',specs:{},webbase_product_images:[],webbase_stock:{warehouse:1,display:0}});
const browser=await chromium.launch({headless:true,...(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{})});
try{
const page=await browser.newPage({viewport:{width:390,height:844}});const errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.route('https://cdn.jsdelivr.net/**',r=>r.fulfill({contentType:'text/javascript',body:''}));
await page.route('**/supabase-client.js*',r=>r.fulfill({contentType:'text/javascript',body:`
const rows=${JSON.stringify(rows)};window.WebBaseDB={config:{url:'https://test.invalid',bucket:'test'},getSession:async()=>({user:{id:'test-staff'}}),client:{auth:{onAuthStateChange:()=>({})},rpc:async()=>({data:[]}),from:table=>{let id;const q={select:()=>q,eq:(k,v)=>{if(k==='id')id=v;return q},order:()=>q,range:()=>q,maybeSingle:async()=>({data:table==='webbase_staff'?{active:true,role:'staff'}:rows.find(r=>r.id===id)}),then:(resolve,reject)=>Promise.resolve({data:rows}).then(resolve,reject)};return q}}};
`}));
const base=process.env.WEBBASE_TEST_URL||'http://127.0.0.1:4173/';
await page.goto(base);await page.locator('#catalog .product-card').first().waitFor();assert.equal(await page.locator('#staffSectionNav').isVisible(),false);
await page.locator('[data-nav="compatibility"]').click();assert.equal(await page.locator('#compatibilityCatalog .product-card').count(),7);
await page.fill('#compatibilitySearch','S20');await page.waitForFunction(()=>document.querySelectorAll('#compatibilityCatalog .product-card').length===3);
assert.doesNotMatch(await page.locator('#compatibilityCatalog').innerText(),/S20\+/);
await page.fill('#compatibilitySearch','S20+');await page.waitForFunction(()=>[...document.querySelectorAll('#compatibilityCatalog h3')].some(e=>e.textContent.includes('S20+'))&&document.querySelectorAll('#compatibilityCatalog .product-card').length===3);
await page.fill('#compatibilitySearch','E10');await page.waitForFunction(()=>document.querySelectorAll('#compatibilityCatalog .product-card').length===3&&[...document.querySelectorAll('#compatibilityCatalog .compatibility-summary strong')].every(e=>e.textContent.includes('Нужно сверить')));
assert.match(await page.locator('#compatibilityCatalog').innerText(),/Нужно сверить/);
assert.equal(await page.locator('#compatibilityConditional').count(),0);
assert.equal(await page.locator('#compatibilityKind option[value=vacuum]').innerText(),'Для пылесосов');
await page.selectOption('#compatibilityKind','vacuum');
await page.fill('#compatibilitySearch','X10');await page.waitForFunction(()=>document.querySelectorAll('#compatibilityCatalog .product-card').length===2);
const card=page.locator('#compatibilityCatalog .product-card').first();const href=await card.getAttribute('href');assert.match(href,/from=compatibility/);await card.click();await page.locator('#productView').waitFor();
assert.match(await page.locator('#productCompatibility').innerText(),/B101CN-BS/);
assert.ok(await page.locator('#productCompatibility .source-link').count());
await page.reload();await page.locator('#productView').waitFor();assert.match(await page.locator('#productCompatibility').innerText(),/B101CN-BS/);
await page.locator('.back-link').click();await page.locator('#compatibilityCatalog .product-card').first().waitFor();assert.equal(await page.locator('[data-section="compatibility"]').isVisible(),true);
await page.reload();await page.locator('#compatibilityCatalog .product-card').first().waitFor();assert.equal(await page.locator('[data-section="compatibility"]').isVisible(),true);
for(const width of [390,1440]){await page.setViewportSize({width,height:900});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,`Horizontal overflow at ${width}`)}
assert.deepEqual(errors,[]);console.log('PASS: staff navigation, automatic accessories, exact model search, conditional matches, shared product/stock, sources, refresh/back and mobile/desktop layouts');
}finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});

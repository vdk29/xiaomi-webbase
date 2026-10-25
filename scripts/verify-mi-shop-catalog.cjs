// UI regression using a read-only live snapshot and actual signed Storage images.
// Never logs credentials/URLs and never signs in or writes to the database.
const {chromium}=require('playwright');const assert=require('node:assert/strict');const fs=require('node:fs');
(async()=>{
const snapshot=process.env.WEBBASE_CATALOG_SNAPSHOT,linksFile=process.env.WEBBASE_IMAGE_LINKS;
if(!snapshot||!linksFile)throw Error('Set WEBBASE_CATALOG_SNAPSHOT and WEBBASE_IMAGE_LINKS to private local JSON files');
const rows=JSON.parse(fs.readFileSync(snapshot));const links=Object.fromEntries(JSON.parse(fs.readFileSync(linksFile)).map(i=>[i.path,i.signedUrl]));
const browser=await chromium.launch({headless:true,...(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{})});
try{
const page=await browser.newPage({viewport:{width:390,height:844}});const errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.route('**/supabase-client.js*',route=>route.fulfill({contentType:'text/javascript',body:`
const rows=${JSON.stringify(rows)};const links=${JSON.stringify(links)};
window.WebBaseDB={config:{url:'https://test.invalid',bucket:'webbase-products'},getUserId:()=> 'read-only-snapshot',getSession:async()=>({user:{id:'read-only-snapshot'}}),client:{auth:{onAuthStateChange:()=>({})},rpc:async()=>({data:[]}),from:table=>{let id;const q={select:()=>q,eq:(k,v)=>{if(k==='id')id=v;return q},order:()=>q,range:async(a,b)=>({data:rows.slice(a,b+1)}),maybeSingle:async()=>({data:table==='webbase_staff'?{active:true,role:'staff',display_name:'Read-only QA'}:rows.find(p=>p.id===id)})};return q},storage:{from:()=>({createSignedUrls:async paths=>({data:paths.filter(path=>links[path]).map(path=>({path,signedUrl:links[path]}))})})}}};
`}));
const base=process.env.WEBBASE_TEST_URL||'http://127.0.0.1:4173/';await page.goto(base);
await page.waitForFunction(n=>document.querySelectorAll('#catalog .product-card').length===n,rows.length);
for(const category of ['Компьютерная техника','Видеонаблюдение','Смартфоны','Планшеты','Телевизоры','Аудио','Бытовая техника для дома']){
 await page.selectOption('#category',category);
 const count=rows.filter(p=>p.category===category).length;
 await page.waitForFunction(n=>document.querySelectorAll('#catalog .product-card').length===n,count);
 assert.ok(count>0,category);
 const product=rows.find(p=>p.category===category&&p.external_id?.startsWith('mi-shop:'));
 const card=page.locator(`#catalog .product-card[href*="${product.id}"]`);await card.scrollIntoViewIfNeeded();
 await page.waitForFunction(id=>document.querySelector('#catalog .product-card[href*=\"'+id+'\"] img')?.naturalWidth===640,product.id);assert.equal(await card.locator('img').evaluate(i=>i.naturalWidth),640);
 await card.click();await page.locator('#productView').waitFor();
 await page.waitForFunction(()=>document.querySelector('#mainImage').naturalWidth===640);
 assert.equal(await page.locator('#productName').innerText(),product.name);assert.ok((await page.locator('#productDescription').innerText()).length>20);
 assert.equal(await page.locator('#productSpecs > div').count(),Object.keys(product.specs).filter(k=>!k.startsWith('_')).length);
 await page.reload();await page.locator('#productView').waitFor();await page.waitForFunction(()=>document.querySelector('#mainImage').naturalWidth===640);
 await page.locator('.back-link').click();await page.waitForFunction(n=>document.querySelectorAll('#catalog .product-card').length===n,count);
 assert.equal(await page.locator('#category').inputValue(),category);
}
await page.selectOption('#category','');await page.fill('#search','0577');
const washer=rows.find(p=>p.sku==='6932554490577');assert.ok(washer);await page.waitForFunction(()=>document.querySelectorAll('#catalog .product-card').length===1);
assert.match(await page.locator('#catalog').innerText(),/Стиральная машина/);
assert.deepEqual(errors,[]);console.log('PASS: 494-card catalog, seven category filters, live Storage photos, details/specs, refresh/return and SKU suffix search');
}finally{await browser.close()}
})().catch(e=>{console.error(e.stack);process.exitCode=1});

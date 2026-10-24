// Cold startup without third-party access, partial-load protection and real Excel preview.
const {chromium}=require('playwright');const assert=require('node:assert/strict');const fs=require('fs');
(async()=>{
const browser=await chromium.launch({headless:true,...(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{})});
const base=process.env.WEBBASE_TEST_URL||'http://127.0.0.1:4173/';const origin=new URL(base).origin;
try{
const cold=await browser.newContext();const page=await cold.newPage();let external=0,excel=0;
await page.route('**/*',route=>{const url=new URL(route.request().url());if(url.pathname.includes('xlsx-'))excel++;if(url.protocol.startsWith('http')&&url.origin!==origin){external++;return route.abort()}return route.continue()});
const start=Date.now();await page.goto(base);await page.locator('#authPanel').waitFor();assert.equal(excel,0);assert.equal(external,0);console.log('Cold login ready with all external domains blocked:',Date.now()-start,'ms; Excel requests:',excel);
await cold.close();
const brokenContext=await browser.newContext();const broken=await brokenContext.newPage();
await broken.addInitScript(()=>{const original=window.setTimeout;window.setTimeout=(fn,ms,...args)=>original(fn,ms===15000?40:ms,...args)});
await broken.route('**/webbase-app.js*',route=>route.abort('connectionreset'));
await broken.goto(base);await broken.locator('#sessionLoading button').waitFor();assert.match(await broken.locator('#sessionLoading').innerText(),/Не удалось получить файлы/);await brokenContext.close();
console.log('PASS: a dropped application script shows a retry action instead of an endless access screen');
// Exercise the real pinned SDK and adapter, with auth/table responses intercepted.
const sdkContext=await browser.newContext();const sdk=await sdkContext.newPage();let signIns=0;
sdk.on('pageerror',e=>console.log('SDK page error:',e.message));
sdk.on('requestfailed',r=>console.log('SDK failed resource:',new URL(r.url()).pathname,r.failure()?.errorText));
const uid='11111111-1111-4111-8111-111111111111';
const jwt=[{alg:'HS256',typ:'JWT'},{sub:uid,aud:'authenticated',role:'authenticated',exp:Math.floor(Date.now()/1000)+3600}].map(x=>Buffer.from(JSON.stringify(x)).toString('base64url')).join('.')+'.c2lnbmF0dXJl';
await sdk.route('https://dazniyfntumbljkocjoo.supabase.co/**',route=>{
const path=new URL(route.request().url()).pathname;
if(path==='/auth/v1/token'){signIns++;return route.fulfill({json:{access_token:jwt,refresh_token:'isolated-test-refresh',token_type:'bearer',expires_in:3600,user:{id:uid,email:'qa@example.invalid',aud:'authenticated',role:'authenticated'}}})}
if(path==='/auth/v1/logout')return route.fulfill({status:204,body:''});
if(path==='/rest/v1/webbase_staff')return route.fulfill({json:[{user_id:uid,active:true,role:'staff'}]});
if(path==='/rest/v1/webbase_products')return route.fulfill({json:[]});
return route.abort();
});
await sdk.goto(base);await sdk.locator('#authPanel').waitFor();
for(let cycle=0;cycle<3;cycle++){await sdk.fill('#login','qa@example.invalid');await sdk.fill('#password','isolated-test-password');await sdk.locator('#authForm button').click();await sdk.locator('#appShell').waitFor();assert.equal(signIns,cycle+1);await sdk.locator('#signOut').click();await sdk.locator('#authPanel').waitFor();assert.equal(await sdk.locator('#appShell').isVisible(),false)}
await sdkContext.close();
console.log('PASS: real bundled SDK sign-in and 204 logout, no production auth requests');
const context=await browser.newContext({viewport:{width:390,height:844}});const p=await context.newPage();let excelRequests=0;p.on('request',r=>{if(r.url().includes('xlsx-'))excelRequests++});
await p.route('**/supabase-client.js*',route=>route.fulfill({contentType:'text/javascript',body:`
const state=window.loadTest={reads:0,photos:0,profile:0};
const rows=Array.from({length:51},(_,i)=>({id:'11111111-1111-4111-8111-'+String(i+1).padStart(12,'0'),sku:'TEST'+i,name:i===50?'Смартфон Xiaomi Test 8GB+512GB Black':'Чехол '+i,category:'Аксессуары и другое',specs:{},webbase_stock:{warehouse:1,display:0},webbase_product_images:[]}));
window.WebBaseDB={config:{url:'https://test.invalid',bucket:'test'},getSession:async()=>({user:{id:'admin'}}),client:{auth:{onAuthStateChange:fn=>{state.event=fn}},from:table=>{const q={select:()=>q,eq:()=>q,order:()=>q,range:async(from,to)=>{state.reads++;if(from===0)return {data:rows.slice(from,to+1)};return new Promise(resolve=>state.finish=()=>resolve({data:rows.slice(from,to+1)}))},maybeSingle:async()=>{state.profile++;return {data:{active:true,role:'admin'}}}};return q},rpc:(name)=>{if(name!=='webbase_shared_product_images')throw Error('Unexpected database write');state.photos++;return new Promise(resolve=>state.finishPhotos=()=>resolve({data:[]}))}}};
`}));
await p.goto(base);await p.waitForFunction(()=>document.querySelectorAll('#catalog .product-card').length===50);assert.equal(await p.locator('#excel').isDisabled(),true);assert.match(await p.locator('#catalogProgress').innerText(),/50/);assert.equal(excelRequests,0);
await p.evaluate(()=>loadTest.finish());await p.waitForFunction(()=>document.querySelectorAll('#catalog .product-card').length===51);await p.waitForFunction(()=>!document.querySelector('#excel').disabled);assert.equal(await p.evaluate(()=>loadTest.photos),1);assert.equal(await p.locator('#catalogProgress').isVisible(),false);
await p.evaluate(()=>{for(let i=0;i<5;i++)loadTest.event('SIGNED_IN');loadTest.event('TOKEN_REFRESHED')});await p.waitForTimeout(100);assert.equal(await p.evaluate(()=>loadTest.reads),2);await p.evaluate(()=>loadTest.finishPhotos());
console.log('PASS: first 50 cards visible while later page waits; import disabled until complete; photos non-blocking; repeated session events do not reload catalog');
const workbook=process.env.WEBBASE_TEST_WORKBOOK||'/tmp/codex-remote-attachments/01a16a25-7694-7236-82b4-1fa5557ed0ee/6B35F0D2-C3E4-48AC-81DE-20B2F33C3DF2/1-отчет-склада.xlsx';
if(fs.existsSync(workbook)){
await p.locator('[data-nav=import]').click();await p.locator('#excel').setInputFiles(workbook);await p.locator('#importPreview [data-import]').waitFor();assert.equal(excelRequests,1);assert.equal(await p.locator('#importPreview .message.error').count(),0);console.log('PASS: lazy local Excel library parses the actual uploaded 1C workbook; preview only, no writes');
}
assert.equal(await p.locator('#authPanel').isVisible(),false);await context.close();
}finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});

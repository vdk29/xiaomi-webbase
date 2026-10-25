// Real bundled SDK, isolated API responses, 494 products and throttled network/CPU.
const {chromium}=require('playwright');const assert=require('node:assert/strict');
(async()=>{
const browser=await chromium.launch({headless:true,...(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{})});
const base=process.env.WEBBASE_TEST_URL||'http://127.0.0.1:4173/';
try{for(const profile of [{name:'Wi-Fi',latency:70,throughput:1500000},{name:'Mobile',latency:350,throughput:180000}]){
 const context=await browser.newContext({viewport:{width:390,height:844}});const page=await context.newPage();
 const cdp=await context.newCDPSession(page);await cdp.send('Network.enable');await cdp.send('Network.emulateNetworkConditions',{offline:false,latency:profile.latency,downloadThroughput:profile.throughput,uploadThroughput:profile.throughput});await cdp.send('Emulation.setCPUThrottlingRate',{rate:4});
 const uid='11111111-1111-4111-8111-111111111111';const user={id:uid,email:'qa@example.invalid',aud:'authenticated',role:'authenticated'};
 const jwt=[{alg:'HS256',typ:'JWT'},{sub:uid,aud:'authenticated',role:'authenticated',exp:Math.floor(Date.now()/1000)+3600}].map(x=>Buffer.from(JSON.stringify(x)).toString('base64url')).join('.')+'.c2ln';
 await page.addInitScript(({jwt,user})=>{localStorage.setItem('xiaomi-webbase-auth',JSON.stringify({access_token:jwt,refresh_token:'isolated-refresh',expires_at:Math.floor(Date.now()/1000)+3600,expires_in:3600,token_type:'bearer',user}));window.qaLongTasks=[];new PerformanceObserver(list=>window.qaLongTasks.push(...list.getEntries().map(e=>e.duration))).observe({type:'longtask',buffered:true})},{jwt,user});
 const rows=Array.from({length:494},(_,i)=>({id:'11111111-1111-4111-8111-'+String(i+1).padStart(12,'0'),sku:'SKU'+i,name:(i<202?'Z Available ':'A Zero ')+i,category:'Смартфоны',active:true,webbase_stock:{warehouse:i<202?1:0,display:0},webbase_product_images:[{id:'image-'+i,storage_path:'products/'+i+'/photo.webp',is_primary:true,sort_order:0}]}));
 let releaseTail;const tail=new Promise(resolve=>releaseTail=resolve);const calls=[],signed=[];let interrupted=false;const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('https://dazniyfntumbljkocjoo.supabase.co/**',async route=>{
  const req=route.request(),url=new URL(req.url()),path=url.pathname;
  if(path==='/rest/v1/webbase_staff')return route.fulfill({json:[{user_id:uid,role:'admin',active:true}]});
  if(path==='/auth/v1/user')return route.fulfill({json:user});
  if(path==='/rest/v1/webbase_catalog'){
   assert.ok(url.searchParams.get('order').startsWith('catalog_in_stock.desc,'));
   const offset=Number(url.searchParams.get('offset')||0),limit=Number(url.searchParams.get('limit'));calls.push([offset,limit]);
   if(!interrupted){interrupted=true;return route.abort('connectionreset')}
   if(offset>0)await tail;
   await new Promise(r=>setTimeout(r,profile.latency));return route.fulfill({json:rows.slice(offset,offset+limit)});
  }
  if(path==='/storage/v1/object/sign/webbase-products'){
   const paths=req.postDataJSON().paths;signed.push(...paths);
   return route.fulfill({json:paths.map(path=>({path,signedURL:'/object/sign/webbase-products/'+path+'?token=isolated'}))});
  }
  if(path.startsWith('/storage/v1/object/sign/webbase-products/'))return route.fulfill({contentType:'image/svg+xml',body:'<svg xmlns="http://www.w3.org/2000/svg" width="640" height="640"><rect width="640" height="640" fill="white"/></svg>'});
  return route.abort();
 });
 const start=Date.now();await page.goto(base);await page.waitForFunction(()=>document.querySelectorAll('#catalog .product-card').length===50);const first=Date.now()-start;
 assert.equal(await page.locator('#excel').isDisabled(),true);assert.equal(await page.locator('#catalog .product-card').filter({hasText:'A Zero'}).count(),0);
 releaseTail();await page.waitForFunction(()=>document.querySelectorAll('#catalog .product-card').length===494);
 assert.equal(await page.locator('#excel').isEnabled(),true);
 const names=await page.locator('#catalog .product-card h3').allTextContents();assert.ok(names.slice(0,202).every(n=>n.startsWith('Z Available')));assert.ok(names.slice(202).every(n=>n.startsWith('A Zero')));
 assert.deepEqual(calls,[[0,50],[0,50],[50,200],[250,200],[450,200]]);
 await page.waitForTimeout(200);assert.ok(new Set(signed).size<40,'offscreen galleries must not be signed in bulk');
 await page.fill('#search','A Zero 300');await page.waitForFunction(()=>document.querySelectorAll('#catalog .product-card').length===1);
 assert.deepEqual(errors,[]);const tasks=await page.evaluate(()=>window.qaLongTasks);console.log(profile.name+': first 50 available '+first+' ms; 494 rows, reset/retry, four successful reads, visible image links '+new Set(signed).size+', longest CPU task '+Math.round(Math.max(0,...tasks))+' ms; search responsive');
 await context.close();
}}finally{await browser.close()}
})().catch(e=>{console.error(e.stack);process.exitCode=1});

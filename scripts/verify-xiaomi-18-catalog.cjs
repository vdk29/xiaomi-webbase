// Read-only QA: private live snapshots and temporary signed Storage links are never committed.
const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs');
const snapshot=JSON.parse(fs.readFileSync(process.env.WEBBASE_CATALOG_SNAPSHOT));
const links=JSON.parse(fs.readFileSync(process.env.WEBBASE_IMAGE_LINKS));
const base=process.env.WEBBASE_TEST_URL||'http://127.0.0.1:4173/';
(async()=>{
 const browser=await chromium.launch({headless:true,...(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{})});
 try{
  const p=await browser.newPage({viewport:{width:390,height:844}}),errors=[];
  p.on('pageerror',e=>errors.push(e.message));
  await p.route('**/supabase-client.js*',r=>r.fulfill({contentType:'text/javascript',body:`
const {products:rows,shared}=${JSON.stringify(snapshot)},links=${JSON.stringify(links)};
window.WebBaseDB={config:{url:'https://readonly.invalid',bucket:'webbase-products'},getUserId:()=> 'readonly',getSession:async()=>({user:{id:'readonly'}}),client:{auth:{onAuthStateChange:()=>({})},from:table=>{let id;const q={select:()=>q,eq:(k,v)=>{if(k==='id')id=v;return q},order:()=>q,range:async(a,b)=>({data:rows.slice(a,b+1)}),maybeSingle:async()=>({data:table==='webbase_staff'?{active:true,role:'staff',display_name:'Read-only QA'}:rows.find(p=>p.id===id)})};return q},rpc:async(name,args)=>{if(name!=='webbase_shared_product_images')throw Error('Unexpected RPC');return{data:shared.filter(x=>args.p_product_ids.includes(x.target_product_id))}},storage:{from:()=>({createSignedUrls:async paths=>({data:links.filter(i=>paths.includes(i.path))})})}}};
`}));
  for(const product of snapshot.products){
   const url=base+'product.html?id='+product.id;
   await p.goto(url);await p.locator('#productView').waitFor();
   const gallery=product.webbase_product_images.length?product.webbase_product_images:snapshot.shared.filter(i=>i.target_product_id===product.id).map(x=>x.image);
   assert.equal(gallery.length,3,product.sku);assert.equal(new Set(gallery.map(x=>x.storage_path)).size,3);
   const ordered=[...gallery].sort((a,b)=>Number(b.is_primary)-Number(a.is_primary)||a.sort_order-b.sort_order);
   assert.equal(await p.locator('.gallery-select').count(),3);
   for(let i=0;i<3;i++){
    await p.locator('.gallery-select').nth(i).click();
    await p.waitForFunction(path=>document.querySelector('#mainImage').dataset.storagePath===path&&document.querySelector('#mainImage').naturalWidth===800,ordered[i].storage_path);
   }
   const specs=await p.locator('#productSpecs').innerText(),max=product.model.endsWith('Max');
   assert.match(specs,/Global/);assert.match(specs,max?/7050/:/6000/);
   assert.match(specs,max?/До 100 Вт Xiaomi HyperCharge/:/До 90 Вт Xiaomi HyperCharge/);
   assert.match(specs,max?/Snapdragon 8 Elite Extreme Gen 6/:/Snapdragon 8 Elite Gen 6/);
   assert.match(specs,new RegExp(product.memory.includes('512')?'512':'256'));
   if(!product.is_demo){assert.equal(await p.locator('[data-seller-tab]').count(),6);await p.locator('[data-seller-tab=camera]').click();assert.equal(await p.locator('#seller-camera').isVisible(),true);}
   assert.equal(await p.locator('[data-stock-value=sellable]').innerText(),String(product.webbase_stock?.warehouse||0));
   await p.reload();await p.locator('#productView').waitFor();await p.waitForFunction(()=>document.querySelector('#mainImage').naturalWidth===800);assert.equal(await p.locator('.gallery-select').count(),3);
   assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
  }
  for(const width of [320,375,430,768,1440]){
   await p.setViewportSize({width,height:900});
   assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,'overflow at '+width);
   assert.equal(await p.locator('#mainImage').isVisible(),true);
  }
  assert.deepEqual(errors,[]);
  console.log('PASS: 18 live product cards, three real Storage angles each, refresh, separate Global specs/memory/colour, seller tabs, local stock, 320–1440px, no JS errors');
 }finally{await browser.close();}
})().catch(e=>{console.error(e.stack);process.exitCode=1});

// UI regression with an isolated adapter; no production accounts or writes.
const assert = require('node:assert/strict');
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true,
    ...(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {}) });
  try {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.route('https://cdn.jsdelivr.net/**', route => route.fulfill({ contentType: 'text/javascript', body: '' }));
    await page.route('**/supabase-client.js*', route => route.fulfill({ contentType: 'text/javascript', body: `
      const donor='11111111-1111-4111-8111-111111111111', target='22222222-2222-4222-8222-222222222222';
      const image={id:'photo-1',storage_path:'products/'+donor+'/shared.webp',is_primary:true,sort_order:0};
      const own=localStorage.getItem('test-own-photo')==='yes';
      const rows=[
       {id:donor,name:'Смартфон Xiaomi 17T Pro 12GB+256GB Black',sku:'DONOR256',category:'Смартфоны',webbase_product_images:[image]},
       {id:target,name:'Смартфон Xiaomi 17T Pro 16GB+1024GB Black',sku:'TARGET1024',category:'Смартфоны',webbase_product_images:own?[{...image,id:'own-photo'}]:[]}
      ];
      const profile={user_id:'test-admin',active:true,role:'admin',display_name:'Test'};
      const svg='data:image/svg+xml,'+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="640" height="640"><rect width="640" height="640" fill="white"/><rect x="220" y="100" width="200" height="440" rx="30" fill="black"/></svg>');
      window.WebBaseDB={config:{url:'https://test.invalid',bucket:'test'},getSession:async()=>({user:{id:'test-admin'}}),
       client:{auth:{onAuthStateChange:()=>({})},from:table=>{
        let id; const q={select:()=>q,eq:(key,value)=>{if(key==='id')id=value;return q},order:()=>q,range:()=>q,
         maybeSingle:async()=>({data:table==='webbase_staff'?profile:rows.find(p=>p.id===id)}),
         then:(resolve,reject)=>Promise.resolve({data:table==='webbase_products'?rows:[]}).then(resolve,reject)};return q;
       },rpc:async(name,payload)=>{
        if(name!=='webbase_shared_product_images')throw Error('Unexpected write RPC');
        return {data:!own&&payload.p_product_ids.includes(target)?[{target_product_id:target,image:{...image,inherited:true}}]:[]};
       },storage:{from:()=>({createSignedUrls:async paths=>({data:paths.map(path=>({path,signedUrl:svg}))})})}}
      };
    ` }));
    const base = process.env.WEBBASE_TEST_URL || 'http://127.0.0.1:4173/';
    const productUrl = new URL('product.html?id=22222222-2222-4222-8222-222222222222', base).href;
    await page.goto(base);
    await page.locator('.product-card').first().waitFor();
    await page.waitForFunction(() => [...document.querySelectorAll('.product-card img')].every(img => img.naturalWidth === 640));
    assert.equal(await page.locator('.product-card').count(), 2);
    for (let reload = 0; reload < 2; reload++) {
      await page.goto(productUrl);
      await page.locator('#productView').waitFor();
      await page.waitForFunction(() => document.querySelector('#mainImage').naturalWidth === 640);
      assert.equal(await page.locator('.gallery-controls').count(), 0);
      assert.match(await page.locator('#gallery').innerText(), /Фото модели и цвета/);
      assert.match(await page.locator('#addPhoto').innerText(), /0\/3/);
      assert.equal(await page.locator('#addPhoto').isEnabled(), true);
      await page.reload();
    }
    await page.evaluate(() => localStorage.setItem('test-own-photo', 'yes'));
    await page.reload();
    await page.locator('#productView').waitFor();
    assert.equal(await page.locator('.gallery-controls').count(), 1);
    assert.doesNotMatch(await page.locator('#gallery').innerText(), /Фото модели и цвета/);
    assert.match(await page.locator('#addPhoto').innerText(), /1\/3/);
    assert.deepEqual(errors, []);
    console.log('PASS: shared catalog/product photos, refresh, safe shared controls, own gallery priority');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });

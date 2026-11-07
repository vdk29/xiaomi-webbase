// Real product page with isolated read-only auth/data fixtures; no production writes.
const {chromium} = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const phones = require('../tests/fixtures/seller-phones.json');
const base = process.env.WEBBASE_TEST_URL || 'http://127.0.0.1:4173/';
const output = process.env.WEBBASE_SCREENSHOT_DIR || '/workspace/scratch';

(async () => {
  fs.mkdirSync(output, {recursive:true});
  const browser = await chromium.launch({headless:true, ...(process.env.CHROMIUM_PATH ? {executablePath:process.env.CHROMIUM_PATH} : {})});
  try {
    for (const width of [320,390,768,1440]) {
      const page = await browser.newPage({viewport:{width,height:900}});
      const errors = [], requests = [];
      page.on('pageerror', error => errors.push(error.message));
      page.on('request', request => requests.push(request.url()));
      const current = phones.find(product => product.name.includes('Xiaomi 17T 12GB+256GB Black'));
      await page.route('**/supabase-client.js*', route => route.fulfill({contentType:'text/javascript',body:`
        const product = ${JSON.stringify({...current, id:'11111111-1111-4111-8111-111111111111',description:'Прежнее описание',active:true,webbase_stock:{warehouse:3,display:1,ldu:0},webbase_product_images:[]})};
        window.WebBaseDB = {config:{url:'https://test.invalid',bucket:'test'},getSession:async()=>({user:{id:'test'}}),client:{from:table=>{const q={select:()=>q,eq:()=>q,maybeSingle:async()=>({data:table==='webbase_staff'?{active:true,role:'seller',display_name:'Тест'}:product})};return q},rpc:async(name)=>{if(name!=='webbase_shared_product_images')throw Error('Unexpected operation '+name);return{data:[]}}}};
      `}));
      // Change only fixture category and description between independent loads.
      await page.route('**/js/seller-help.js*', async route => route.continue());
      const url = `${base}product.html?id=11111111-1111-4111-8111-111111111111&return=${encodeURIComponent('index.html?category=Смартфоны&availability=available')}`;
      await page.goto(url);
      await page.locator('#productView:visible').waitFor();
      assert.equal(await page.locator('#descriptionTitle').innerText(), 'Помощь продавцу');
      assert.equal(await page.locator('#productDescription').isVisible(), false);
      assert.equal(await page.locator('.seller-card').count(), 6);
      assert.match(await page.locator('#seller-memory').innerText(), /256 ГБ/);
      assert.match(await page.locator('#seller-camera').innerText(), /Leica/);
      assert.equal(await page.locator('[data-stock-value=sellable]').innerText(), '3');
      assert.equal(await page.locator('#specsSection').isVisible(), true);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
      await page.locator('.seller-jumps a[href="#seller-camera"]').click();
      assert.equal(new URL(page.url()).hash, '#seller-camera');
      await page.waitForFunction(() => { const top=document.querySelector('#seller-camera').getBoundingClientRect().top; return top>=90 && top<=120; });
      await page.locator('.seller-details').first().locator('summary').click();
      assert.equal(await page.locator('.seller-answers').isVisible(), true);
      await page.locator('.seller-sources summary').click();
      assert.ok((await page.locator('.seller-sources a').count()) >= 2);
      await page.locator('#descriptionSection').scrollIntoViewIfNeeded();
      await page.screenshot({path:path.join(output,`seller-help-${width}.png`),fullPage:true});
      await page.reload();
      await page.locator('#productSellerHelp:visible').waitFor();
      assert.equal(await page.locator('.seller-card').count(), 6);
      // Nonphone must preserve its old title and paragraph, with no generated advice.
      await page.unroute('**/supabase-client.js*');
      await page.route('**/supabase-client.js*', route => route.fulfill({contentType:'text/javascript',body:`
        window.WebBaseDB={config:{url:'https://test.invalid',bucket:'test'},getSession:async()=>({user:{id:'test'}}),client:{from:table=>{const q={select:()=>q,eq:()=>q,maybeSingle:async()=>({data:table==='webbase_staff'?{active:true,role:'seller'}:{id:'11111111-1111-4111-8111-111111111111',name:'Планшет Xiaomi Pad',category:'Планшеты',active:true,description:'Исходное описание планшета',specs:{},webbase_stock:{warehouse:1,display:0,ldu:0},webbase_product_images:[]}})};return q},rpc:async()=>({data:[]})}};
      `}));
      await page.goto(url);
      await page.locator('#productView:visible').waitFor();
      assert.equal(await page.locator('#descriptionTitle').innerText(), 'Описание');
      assert.equal(await page.locator('#productDescription').innerText(), 'Исходное описание планшета');
      assert.equal(await page.locator('#productSellerHelp').isVisible(), false);
      assert.equal(await page.locator('.seller-card').count(), 0);
      assert.deepEqual(errors, []);
      assert.equal(requests.some(url => /mi\.com|salesforce\.com|supabase\.co/.test(url)), false);
      console.log(`PASS ${width}px: phone guide, variant, topic navigation, sources, reload, unchanged tablet, no extra data requests`);
      await page.close();
    }
  } finally { await browser.close(); }
})().catch(error => {console.error(error);process.exitCode=1;});

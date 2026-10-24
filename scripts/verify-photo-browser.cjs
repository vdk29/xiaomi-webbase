const {chromium}=require('playwright');
const fs=require('fs');
(async()=>{
 const credentials=JSON.parse(fs.readFileSync(process.env.WEBBASE_TEST_CREDENTIALS_FILE,'utf8'));
 const browser=await chromium.launch({headless:true, ...(process.env.CHROMIUM_PATH ? {executablePath:process.env.CHROMIUM_PATH} : {})});
 const context=await browser.newContext({viewport:{width:390,height:844}});
 const page=await context.newPage();
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(process.env.WEBBASE_TEST_URL || 'http://127.0.0.1:4173');
 await page.locator('#login').fill(credentials.email);await page.locator('#password').fill(credentials.password);
 await page.locator('#authForm button').click();await page.locator('.product-card').first().waitFor({timeout:45000});
 async function verify(){return page.evaluate(async()=>{
  const {listProducts}=await import('/js/products.js'); const {getSignedUrl}=await import('/js/images.js');
  const rows=await listProducts(window.WebBaseDB);const withPhotos=rows.filter(p=>p.images.length);
  let decoded=0;for(const p of withPhotos){for(const im of p.images){const url=await getSignedUrl(window.WebBaseDB,im.storage_path);const img=new Image();img.src=url;await img.decode();if(!img.naturalWidth)throw Error('Empty image');decoded++;}}
  return {products:rows.length,withPhotos:withPhotos.length,decoded};
 });}
 const before=await verify();console.log('Before reload',before);
 await page.reload();await page.locator('.product-card').first().waitFor();
 const after=await verify();console.log('After reload',after);
 if(before.withPhotos<55||JSON.stringify(before)!==JSON.stringify(after))throw Error('Persistence failure');
 await page.locator('#search').fill('7756');await page.waitForTimeout(400);
 if(!(await page.locator('.product-card').first().innerText()).includes('6941812777756'))throw Error('Suffix priority failed');
 await page.locator('.product-card').first().click();await page.locator('#productView').waitFor();
 await page.waitForFunction(()=>document.querySelector('#mainImage').naturalWidth>0);
 await page.reload();await page.locator('#productView').waitFor();await page.waitForFunction(()=>document.querySelector('#mainImage').naturalWidth>0);
 if(errors.length)throw Error(errors.join(';'));
 await page.screenshot({path:process.env.WEBBASE_SCREENSHOT || '/tmp/webbase-photo-product.png'});
 console.log('PASS: 55 real photos decode after reload, suffix search, product page reload, mobile viewport');
 await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});

import {createClient} from 'npm:@supabase/supabase-js@2.95.0';
import {prepareNetworkPhoto} from './image.ts';
import {searchShop,matchSourceProduct,extractShopSpecs,shopHeading,partCode} from './source.ts';
declare const EdgeRuntime:{waitUntil(promise:Promise<unknown>):void};
import {networkKey} from '../../../js/network-identity.js';
import {SELLER_PROFILES,SELLER_REVIEWED_AT} from '../../../js/seller-help-data.js';
const cors={'Access-Control-Allow-Origin':'https://vdk29.github.io','Access-Control-Allow-Headers':'authorization,apikey,content-type,x-client-info','Access-Control-Allow-Methods':'POST,OPTIONS'};
const hosts=new Set(['www.mi.com','mi.com','mi-shop.com','www.mi-shop.com','i02.appmifile.com','i01.appmifile.com','cdn.cnbj1.fds.api.mi-img.com']);
const photoKey=(name:string)=>networkKey(name).replace(/(^| )ldu([ -]|$)/g,' ').replace(/\b\d+\/\d+gb\b/g,' ').replace(/\s+/g,' ').trim();
const family=(name:string)=>networkKey(name).replace(/(^| )ldu([ -]|$)/g,' ').replace(/\s+/g,' ').trim().replace(/\s+\d+\/\d+gb.*$/,'');
const safe=(url:string)=>{try{const u=new URL(url);return u.protocol==='https:'&&hosts.has(u.hostname)&&!u.username&&!u.password}catch{return false}};
async function fetchSafe(url:string){if(!safe(url))throw Error('Источник не разрешён');const r=await fetch(url,{signal:AbortSignal.timeout(8000)});if(!r.ok||!safe(r.url))throw Error('Источник недоступен');return r;}
function objects(value:any):any[]{if(Array.isArray(value))return value.flatMap(objects);if(value&&typeof value==='object')return[value,...Object.values(value).filter(x=>x&&typeof x==='object').flatMap(objects)];return[];}
async function findProduct(name:string){
 const urls:string[]=[];const provider=new Map<string,any>();
 // Try manufacturer results first; fall back to the store's own searchable catalogue.
 try{const query=`site:mi.com "${family(name).replace(/^смартфон /,'')}"`;const r=await fetch(`https://www.bing.com/search?format=rss&q=${encodeURIComponent(query)}`,{signal:AbortSignal.timeout(5000)});if(r.ok){const rss=(await r.text()).slice(0,300000);urls.push(...[...rss.matchAll(/<link>(https?:[^<]+)<\/link>/g)].map(m=>m[1].replace(/&amp;/g,'&')).filter(url=>safe(url)&&/\/product\//.test(url)).slice(0,2));}}catch{/* Search availability is independent of stock. */}
 try{for(const item of await searchShop(name)){if(safe(item.url)){urls.push(item.url);provider.set(item.url,item);}}}catch{/* A catalogue outage falls back to reviewed data and a review task. */}
 for(const url of [...new Set(urls)].slice(0,5)){
  try{const html=(await(await fetchSafe(url)).text()).slice(0,2000000);let product:any=null;for(const script of html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)){
   let data;try{data=JSON.parse(script[1])}catch{continue};product=objects(data).find(x=>x['@type']==='Product'&&matchSourceProduct(name,{...x,mpn:x.mpn||partCode(url)}));if(product)break;
  }
  if(!product&&provider.has(url)){const heading=shopHeading(html);if(matchSourceProduct(name,{name:heading,mpn:partCode(url)}))product={name:heading,image:provider.get(url).image};}
  if(product)return {url,product,specs:extractShopSpecs(html)};
  }catch{/* Never substitute a loosely matching image. */}
 }
 return null;
}
async function enrich(db:any,job:any){
 const {data:ctx,error}=await db.rpc('webbase_network_context',{p_product:job.product_id});if(error)throw error;if(!ctx?.product)throw Error('Товар не найден');
 const p=ctx.product;let specs:any={};let description='';let image:any=ctx.own_image?{storage_path:ctx.own_image.storage_path,source_url:ctx.own_image.source_url,new_upload:false}:p.image_path?{storage_path:p.image_path,source_url:p.specs?._network_image_source,new_upload:false}:null;const sources:any[]=[];const notes:string[]=[];
 const donor=ctx.donor;
 if(donor&&family(donor.name)===family(p.name)&&donor.specs?._source_url){
  specs={...donor.specs};for(const key of Object.keys(specs))if(/памят|цвет|_catalog|_description|_compatibility/i.test(key))delete specs[key];
  specs._source_url=donor.specs._source_url;specs._verified_at=donor.specs._verified_at||donor.specs._description_verified_at||null;specs._network_reused_at=new Date().toISOString().slice(0,10);
  sources.push({kind:'specs_reused',url:specs._source_url,details:{donor_id:donor.id}});
 }
 const identity=family(p.name).replace(/^смартфон /,'');const profile=SELLER_PROFILES.find((x:any)=>x.match.test(identity));
 if(profile){specs={...specs,'Экран':profile.screen,'Процессор':profile.processor,'Основные камеры':profile.camera,'Зарядка':profile.charge,'Защита':profile.protection,'_source_url':profile.source,'_verified_at':SELLER_REVIEWED_AT};if(profile.battery)specs['Аккумулятор']=profile.battery;else {delete specs['Аккумулятор'];delete specs['Емкость аккумулятора, мА*ч'];}sources.push({kind:'manufacturer_specs',url:profile.source});}
 if(!image&&ctx.images?.length){const photo=ctx.images[0];const {error:missing}=await db.storage.from('webbase-products').createSignedUrl(photo.storage_path,60);if(!missing){image={storage_path:photo.storage_path,source_url:photo.source_url,new_upload:false};specs._network_image_source=photo.source_url||'';sources.push({kind:'photo_reused',url:photo.source_url||`supabase-storage://webbase-products/${photo.storage_path}`,details:{image_id:photo.id}});}}
 if(!image||!Object.keys(specs).some(k=>!k.startsWith('_'))){
  try { const result=await findProduct(p.name);
  if(result){
   if(!Object.keys(specs).some(k=>!k.startsWith('_'))){
    for(const [key,value]of Object.entries(result.specs||{}))if(!/памят|цвет|__proto__|constructor|prototype/i.test(key))specs[key]=value;
    for(const property of result.product.additionalProperty||[])if(typeof property.name==='string'&&!/памят|цвет|__proto__|constructor|prototype/i.test(property.name)&&['string','number'].includes(typeof property.value))specs[property.name.slice(0,120)]=String(property.value).slice(0,1000);
    if(Object.keys(specs).length){specs._source_url=result.url;specs._verified_at=new Date().toISOString().slice(0,10);sources.push({kind:'specs',url:result.url});}
   }
   if(!image){const candidates=[result.product.image].flat().map((x:any)=>typeof x==='string'?x:x?.url).filter(Boolean).map((url:string)=>new URL(url,result.url).href).filter(safe);if(candidates.length){
    const response=await fetchSafe(candidates[0]);if(Number(response.headers.get('content-length'))>8000000)throw Error('Слишком тяжёлое изображение');const original=new Uint8Array(await response.arrayBuffer());if(original.length>8000000)throw Error('Слишком тяжёлое изображение');
    const prepared=await prepareNetworkPhoto(original);const bytes=prepared.bytes;const hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new Uint8Array(bytes)))).map(x=>x.toString(16).padStart(2,'0')).join('');const contentId=`${hash.slice(0,8)}-${hash.slice(8,12)}-${hash.slice(12,16)}-${hash.slice(16,20)}-${hash.slice(20,32)}`;const path=`products/${contentId}/${hash}.${prepared.extension}`;
    const {error:upload}=await db.storage.from('webbase-products').upload(path,bytes,{contentType:prepared.mime_type,upsert:false,cacheControl:'31536000'});if(upload&&!/already exists|duplicate/i.test(upload.message))throw upload;
    image={storage_path:path,source_url:result.url,new_upload:true,mime_type:prepared.mime_type,byte_size:bytes.length,width:prepared.width,height:prepared.height};specs._network_image_source=result.url;sources.push({kind:'photo',url:result.url,details:{origin_url:candidates[0],sha256:hash}});
   }}
  }
  } catch { notes.push('Источник или изображение требуют ручной проверки'); }
 }
 const visible=Object.entries(specs).filter(([k,v])=>!k.startsWith('_')&&v!==null&&v!=='');
 if(visible.length)description=visible.slice(0,4).map(([k,v])=>`${k}: ${v}`).join('. ')+'.';
 if(!image)notes.push('Надёжная фотография не найдена');if(!description)notes.push('Нет подтверждённых характеристик');
 const {error:finish}=await db.rpc('webbase_network_finish',{p_product:p.id,p_result:{identity:networkKey(p.name),image,specs,description,sources,reason:notes.join('; ')||null}});if(finish)throw finish;return image?.new_upload===true;
}
async function work(db:any){const started=Date.now();let count=0,uploads=0;while(Date.now()-started<40000&&count<20&&uploads<2){const{data:job,error}=await db.rpc('webbase_network_claim');if(error||!job)break;try{if(await enrich(db,job))uploads++;}catch(error){await db.from('webbase_network_jobs').update({status:job.attempts>=3?'error':'pending',lease_until:new Date(Date.now()+300000).toISOString(),reason:String(error).slice(0,350),updated_at:new Date().toISOString()}).eq('product_id',job.product_id)}count++;}}
Deno.serve(async(req)=>{
 if(req.method==='OPTIONS')return new Response(null,{headers:cors});if(req.method!=='POST')return new Response('Method not allowed',{status:405,headers:cors});
 const db=createClient(Deno.env.get('SUPABASE_URL')!,Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);let allowed=false;
 const secret=req.headers.get('x-webbase-worker');if(secret){const{data}=await db.rpc('webbase_network_worker_auth',{p_token:secret});allowed=data===true;}
 if(!allowed){const token=req.headers.get('Authorization')?.replace(/^Bearer\s+/i,'')||'';if(token){const{data:{user}}=await db.auth.getUser(token);if(user){const{data}=await db.from('webbase_staff').select('active,role').eq('user_id',user.id).maybeSingle();allowed=data?.active&&data.role==='admin';}}}
 if(!allowed)return new Response('Administrator required',{status:403,headers:cors});
 EdgeRuntime.waitUntil(work(db));return Response.json({status:'queued'},{status:202,headers:cors});
});

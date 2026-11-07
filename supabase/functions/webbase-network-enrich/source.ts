import {networkKey,networkProductFields} from '../../../js/network-identity.js';
const accessory=(name:string)=>/^(?:\(ldu\)\s*)?(?:щет|щёт|насад|фильтр|меш|моп|салфет|ремеш|чехол|стекло|пленк|плёнк|запчаст|after sale|brush|case|strap|аксессуар|accessor|набор (?:бит|насад)|комплект (?:фильтр|щет|щёт|насад|меш))/i.test(name.trim());
export const partCode=(name:string)=>name.match(/\b(BHR[A-Z0-9]+|MZB[A-Z0-9]+)\b/i)?.[1].toUpperCase()||'';
export function productCore(name:string){let s=networkKey(name).replace(/\b(?:bhr|mzb)[a-z0-9]+\b/gi,' ').replace(/(^| )ldu([ -]|$)/g,' ').replace(/\b\d+\/\d+gb\b/g,' ').replace(/\s+/g,' ').trim();const brand=s.match(/\b(xiaomi|redmi|poco|amazfit|haylou|dreame|roborock|nokia|aqara|yeelight|deerma|zmi|70mai|1more)\b/);if(brand?.index!==undefined&&!accessory(name))s=s.slice(brand.index);return s;}
export function matchSourceProduct(target:string,source:{name?:string;mpn?:string;sku?:string;type?:string}){
 const name=source.name||'';if(!name)return false;
 const targetCode=partCode(target),sourceCode=partCode([name,source.mpn||'',source.sku||''].join(' '));if(targetCode&&sourceCode&&targetCode!==sourceCode)return false;
 const a=accessory(target),b=accessory((source.type?source.type+' ':'')+name);if(a!==b)return false;
 if(productCore(target)===productCore(name))return true;
 if(a)return false; // A compatibility code on a brush/case is not its own device identity.
 const code=partCode(target);if(!code||code!==partCode([name,source.mpn||'',source.sku||''].join(' ')))return false;
 const colorA=networkProductFields(target).color,colorB=networkProductFields(name).color;
 return !colorA||!colorB||colorA===colorB;
}
const plain=(value:string)=>value.replace(/<(script|style)[\s\S]*?<\/\1>/gi,' ').replace(/<[^>]*>/g,' ').replace(/&nbsp;|&#160;/g,' ').replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&#39;|&apos;/g,"'").replace(/&#(\d+);/g,(_,n)=>String.fromCodePoint(Math.min(Number(n),0x10ffff))).replace(/\s+/g,' ').trim();
export function extractShopSpecs(html:string){const specs:Record<string,string>={};const expression=/<div[^>]*class=["'][^"']*\bb-product-features__row\b[^"']*["'][^>]*>[\s\S]*?<div[^>]*class=["'][^"']*\bb-product-features__column\b[^"']*["'][^>]*>([\s\S]*?)<\/div>[\s\S]*?<div[^>]*class=["'][^"']*\bb-product-features__column\b[^"']*["'][^>]*>([\s\S]*?)<\/div>/gi;for(const m of html.matchAll(expression)){const key=plain(m[1]).slice(0,120),value=plain(m[2]).slice(0,1000);if(key&&value&&!['__proto__','prototype','constructor'].includes(key))specs[key]=value;}return specs;}
export function shopHeading(html:string){return plain(html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i)?.[1]||'');}
let searchKey:string|null=null;
export async function searchShop(name:string){
 // Public read-only storefront integration, discovered from the store's own script.
 if(!searchKey){const r=await fetch('https://cdn.diginetica.net/1969/client.js',{signal:AbortSignal.timeout(8000)});if(!r.ok)throw Error('Поиск магазина недоступен');const script=await r.text();searchKey=script.match(/apiKey:"([^"\s]+)"/)?.[1]||null;if(!searchKey)throw Error('Изменился интерфейс поиска магазина');}
 const queries=[...new Set([partCode(name),productCore(name)].filter(Boolean))];
 for(const query of queries){const params=new URLSearchParams({st:query,apiKey:searchKey,strategy:'simple',fullData:'true',withCorrection:'false',showUnavailable:'true',regionId:'global',size:'20',offset:'0'});
 const r=await fetch('https://sort.diginetica.net/search?'+params,{signal:AbortSignal.timeout(8000)});if(!r.ok){if(r.status===401||r.status===403)searchKey=null;throw Error('Поиск магазина недоступен');}const data=await r.json();
 const matches=(data.products||[]).filter((product:any)=>matchSourceProduct(name,{name:product.name,mpn:partCode(product.link_url||''),type:product.attributes?.['тип товара']?.[0]})).slice(0,3).map((product:any)=>({url:new URL(product.link_url,'https://mi-shop.com').href,image:product.image_url,name:product.name}));if(matches.length)return matches;
 }
 return [];
}

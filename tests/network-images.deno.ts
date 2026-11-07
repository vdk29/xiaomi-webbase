import {Image} from 'https://deno.land/x/imagescript@1.3.0/mod.ts';
import {prepareNetworkPhoto} from '../supabase/functions/webbase-network-enrich/image.ts';
function check(value:unknown,message:string){if(!value)throw Error(message)}
Deno.test('PNG/JPEG conversion bounds dimensions, produces JPEG and composites transparency on white',async()=>{
 const png=await new Image(1600,1200).fill(0x00000000).encode();const r=await prepareNetworkPhoto(png);
 check(r.width===960&&r.height===720,'Size must be 960 × 720');check(r.mime_type==='image/jpeg','JPEG expected');check(r.bytes.length<150000,'Thumbnail too large');const decoded=await Image.decode(r.bytes);check(decoded.width===960,'JPEG is decodable');check(decoded.getPixelAt(1,1)===0xffffffff,'Transparency must become white');
});
Deno.test('invalid, oversized and unoptimized WebP never silently become a wrong product photo',async()=>{
 for(const input of [new Uint8Array(10),new Uint8Array(8000001)]){let rejected=false;try{await prepareNetworkPhoto(input)}catch{rejected=true}check(rejected,'Invalid media accepted');}
 const bytes=new Uint8Array(30);bytes.set(new TextEncoder().encode('RIFF'),0);bytes.set(new TextEncoder().encode('WEBPVP8X'),8);bytes[24]=255;bytes[25]=7;bytes[27]=255;bytes[28]=7;let rejected=false;try{await prepareNetworkPhoto(bytes)}catch{rejected=true}check(rejected,'Large WebP requires review');
});

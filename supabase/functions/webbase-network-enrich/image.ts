import {Image} from 'https://deno.land/x/imagescript@1.3.0/mod.ts';
export async function prepareNetworkPhoto(original:Uint8Array){
 if(original.length>8000000)throw Error('Изображение превышает 8 МБ');
 const signature=new TextDecoder('ascii').decode(original.slice(8,16));
 if(signature.startsWith('WEBP')){
  const tag=signature.slice(4);const view=new DataView(original.buffer,original.byteOffset,original.byteLength);let width=0,height=0;
  if(original.length<30)throw Error('Повреждённый WebP');
  if(tag==='VP8X'){width=1+original[24]+(original[25]<<8)+(original[26]<<16);height=1+original[27]+(original[28]<<8)+(original[29]<<16);}
  else if(tag==='VP8L'&&original[20]===47){const bits=view.getUint32(21,true);width=(bits&16383)+1;height=((bits>>>14)&16383)+1;}
  else if(tag==='VP8 '&&original[23]===157&&original[24]===1&&original[25]===42){width=view.getUint16(26,true)&16383;height=view.getUint16(28,true)&16383;}
  if(!width||!height||Math.max(width,height)>960||original.length>524288)throw Error('WebP требует дополнительной оптимизации перед публикацией');
  return{bytes:original,width,height,mime_type:'image/webp',extension:'webp'};
 }
 const decoded=await Image.decode(original);
 if(decoded.width*decoded.height>24000000)throw Error('Разрешение превышает 24 Мп');
 if(Math.max(decoded.width,decoded.height)>960){const scale=960/Math.max(decoded.width,decoded.height);decoded.resize(Math.max(1,Math.round(decoded.width*scale)),Math.max(1,Math.round(decoded.height*scale)));}
 const white=new Image(decoded.width,decoded.height).fill(0xffffffff);white.composite(decoded);
 const bytes=await white.encodeJPEG(80);
 return{bytes,width:decoded.width,height:decoded.height,mime_type:'image/jpeg',extension:'jpg'};
}

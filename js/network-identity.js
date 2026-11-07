// Shared by browser parsing and the server worker. Conservative exact variant identity.
export const COLOR_ALIASES = [
 ['черный','black'],['чёрный','black'],['черная','black'],['чёрная','black'],['черное','black'],['белый','white'],['белая','white'],['белое','white'],['синий','blue'],['синяя','blue'],['голубой','sky blue'],['голубая','sky blue'],['зелёный','green'],['зеленый','green'],['зеленая','green'],['зелёная','green'],['красный','red'],['красная','red'],['розовый','pink'],['розовая','pink'],['фиолетовый','purple'],['фиолетовая','purple'],['серый','gray'],['серая','gray'],['серебристый','silver'],['оранжевый','orange'],['бежевый','beige'],['желтый','yellow'],['жёлтый','yellow']
];
export function networkKey(value) {
 let s=String(value||'').normalize('NFKC').toLowerCase().replace(/ё/g,'е').replace(/[‐‑–—]/g,'-');
 s=s.replace(/\bldu\b/gi,'ldu').replace(/(?:gb|гб)/g,'gb').replace(/(?:tb|тб)/g,'tb');
 s=s.replace(/(\d+)\s*(?:gb)?\s*[+/]\s*(\d+)(?:\s*(gb|tb))?/g,(match,ram,size,unit)=>Number(ram)>=2&&Number(ram)<=64&&Number(size)*(unit==='tb'?1024:1)>=16?`${ram}/${Number(size)*(unit==='tb'?1024:1)}gb`:match);
 s=s.replace(/xiaomi\s+(redmi|poco)\b/g,'$1');
 for(const[from,to]of COLOR_ALIASES)s=s.replace(new RegExp(`(^|[\\s(),])${from.replace(/ё/g,'е')}(?=$|[\\s(),])`,'g'),`$1${to}`);
 return s.replace(/[()]/g,' ').replace(/\s+/g,' ').trim();
}
export function isDemoName(name){return /(?:^|[\s(])ldu(?:[\s)\-]|$)/i.test(String(name));}
export function networkProductFields(name) {
 const clean=String(name).replace(/^\s*\(LDU\)\s*/i,'');
 const memory=/^(смартфон|планшет|мобильный телефон)\s/i.test(clean)?clean.match(/(\d+)\s*(?:GB|ГБ)?\s*[+/]\s*(\d+)\s*(GB|ГБ|TB|ТБ)?/i):null;
 const colorMatch=networkKey(clean.replace(/\([^)]*\)/g,'')).match(/\b(dark black|midnight black|sky blue|deep blue|deep violet|black|white|blue|green|red|pink|purple|violet|gray|silver|orange|beige|yellow)\b(?:\s*[^a-z]*)?$/i);
 const brand=clean.match(/\b(POCO|REDMI|Xiaomi|Amazfit|Haylou|Dreame|Roborock|NOKIA|Aqara|Yeelight)\b/i)?.[1] || (/Яндекс/i.test(clean)?'Яндекс':'');
 return {brand,model:clean.replace(/^(?:смартфон|планшет|смарт-часы|умные часы|наушники)\s+/i,'').split(/\s+\d+\s*(?:gb|гб)?\s*[+/]/i)[0].replace(/\s*\([^)]*\)\s*$/,'').trim(),memory:memory?`${memory[1]}/${Number(memory[2])*(/tb|тб/i.test(memory[3])?1024:1)} ГБ`:'',ram:memory?Number(memory[1]):null,storage:memory?Number(memory[2])*(/tb|тб/i.test(memory[3])?1024:1):null,color:colorMatch?.[1]||'',is_demo:isDemoName(name)};
}
// Warehouse names are directory aliases, never product-colour or memory identities.
export function networkWarehouseKey(value){return String(value||'').normalize('NFKC').toLowerCase().replace(/ё/g,'е').replace(/[‐‑–—]/g,'-').replace(/\s+/g,' ').trim();}

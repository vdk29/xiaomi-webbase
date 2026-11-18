import {escapeHtml as esc} from './utils.js?v=20261023-4';
const A='assets/preorder/20261114-studio/';
// Window coordinates select illustrations from Xiaomi's original compositions.
export const REAR_ART={
 native:{src:'assets/preorder/20261115-hyperos/wallpaper-amber.webp',label:'Обои Xiaomi HyperOS 4'},
 nativeBlue:{src:'assets/preorder/20261115-hyperos/wallpaper-blue.webp',label:'Синие обои Xiaomi HyperOS 4'},
 panda:{src:A+'panda-personalization.webp',width:1181,height:541,window:[390,168,195,261],label:'Малая панда · Xiaomi'},
 painter:{src:A+'wallpaper-collection.webp',width:2560,height:1212,window:[1220,690,220,220],label:'AI-персонаж · Xiaomi'},
 starry:{src:A+'case-art.webp',width:2560,height:1013,window:[757,535,90,88],label:'Искусство и чехол · Xiaomi'},
 character:{src:A+'character-personalization.webp',width:1181,height:541,window:[390,168,195,261],label:'Персонаж · Xiaomi'},
 night:{src:'assets/preorder/20261106/camera-night.webp',label:'Ночная фотография Xiaomi'},
 seaside:{src:A+'leica-seaside.webp',label:'Фотопример Leica · Xiaomi'},
 portrait:{src:'assets/preorder/20261114/portrait.webp',label:'Портрет Xiaomi'},
};
export function artMarkup(id,cls=''){const a=REAR_ART[id]||REAR_ART.night;if(a.window)return `<span class="rd-official-art ${cls}"><svg viewBox="${a.window.join(' ')}" preserveAspectRatio="xMidYMid slice" role="img" aria-label="${esc(a.label)}"><image href="${a.src}" width="${a.width}" height="${a.height}"/></svg></span>`;return `<span class="rd-official-art ${cls}"><img src="${a.src}" alt="${esc(a.label)}" draggable="false" decoding="async"></span>`;}
export const REAR_WALLPAPERS=[{id:'clock',label:'Часы',art:'native'},{id:'orbit',label:'Ночной город',art:'night'},{id:'pet',label:'Панда',art:'panda'},{id:'photo',label:'Портрет',art:'portrait'},{id:'ai',label:'Художник',art:'painter'},{id:'case',label:'Под чехол',art:'starry'},{id:'character',label:'Персонаж',art:'character'},{id:'seaside',label:'Море',art:'seaside'}];
const shots=[['panda-personalization.webp','Питомец становится частью оформления','Сочетание портрета и питомца в иллюстрации Xiaomi.'],['avatar-personalization.webp','Твой собственный персонаж','Пример персонализации из официальной презентации.'],['case-art.webp','Экран в стиле чехла','Искусство, фактуры и цвет — одно оформление.'],['wallpaper-collection.webp','Коллекция настроений','Персонажи и изображения для заднего дисплея.']];
export function officialGalleryMarkup(){return `<section class="rd-official-gallery" aria-labelledby="rd-official-heading"><div class="rd-official-heading"><div><p class="po-kicker">ВИЗУАЛЬНЫЙ МИР XIAOMI</p><h2 id="rd-official-heading">Один экран.<br>Много характеров.</h2></div><p>Материалы с официальной страницы анонса. Анимации в симуляторе созданы для презентации.</p></div><div class="rd-official-grid">${shots.map(([src,title,text],i)=>`<figure class="rd-official-card rd-official-card-${i}"><div><img src="${A+src}" loading="lazy" decoding="async" alt="${esc(title)}"></div><figcaption><h3>${esc(title)}</h3><p>${esc(text)}</p><a href="https://www.mi.com/prod/xiaomi-18-pro-max" target="_blank" rel="noopener noreferrer">Материал Xiaomi ↗︎</a></figcaption></figure>`).join('')}</div></section>`;}

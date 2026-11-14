import {escapeHtml as esc} from './utils.js?v=20261023-4';
import {REAR_MEDIA} from './rear-display-data.js?v=20261114-1';
function demoPreview(id){
 const shapes={
 notifications:'<circle cx="160" cy="65" r="25" fill="#ffffff24"/><text x="160" y="73" text-anchor="middle" font-size="22" fill="white">А</text><rect x="119" y="108" width="82" height="5" rx="2" fill="#ffffffaa"/><circle cx="125" cy="150" r="19" fill="#df6b6b"/><path d="m119 144 12 12m0-12-12 12" stroke="white" stroke-width="2"/><circle cx="195" cy="150" r="19" fill="#74ba99"/><path d="m188 150 5 5 10-10" fill="none" stroke="white" stroke-width="2"/>',
 music:'<rect x="119" y="28" width="82" height="82" rx="18" fill="#a89acc"/><circle cx="160" cy="69" r="27" fill="#665483"/><circle cx="160" cy="69" r="7" fill="#d6cdef"/><rect x="119" y="124" width="82" height="4" rx="2" fill="#ffffff44"/><rect x="119" y="124" width="47" height="4" rx="2" fill="white"/><path d="m153 145 16 10-16 10z" fill="white"/><path d="m123 145-13 10 13 10zm75 0 13 10-13 10z" fill="#ffffff99"/>',
 navigation:'<path d="M65 25v150M255 25v150M50 60h220M50 145h220" stroke="#ffffff12" stroke-width="12"/><path d="M125 175v-75h75V35" stroke="#92dfb2" stroke-width="9" stroke-linejoin="round" fill="none"/><circle cx="125" cy="166" r="11" fill="white"/><path d="m185 48 15-18 15 18" stroke="white" fill="none" stroke-width="5"/><rect x="137" y="116" width="65" height="28" rx="14" fill="#203d34"/><text x="169" y="135" text-anchor="middle" fill="white" font-size="13">180 м</text>',
 ai:'<circle cx="160" cy="90" r="59" fill="none" stroke="#8ad5dc33" stroke-width="10"/><circle cx="160" cy="90" r="39" fill="#96d0d433"/><path d="m160 63 7 20 20 7-20 7-7 20-7-20-20-7 20-7z" fill="#e0f4f4"/><circle cx="120" cy="165" r="4" fill="#b0e4d6"/><circle cx="140" cy="165" r="4" fill="#b0e4d6"/><circle cx="160" cy="165" r="4" fill="#b0e4d6"/><circle cx="180" cy="165" r="4" fill="#ffffff44"/><circle cx="200" cy="165" r="4" fill="#ffffff44"/>'
 };return `<svg class="rd-demo-preview" viewBox="0 0 320 200" aria-hidden="true">${shapes[id]||''}</svg>`;
}
export function rearMediaMarkup(){return `<section class="rd-media-library" aria-labelledby="rd-media-heading"><div class="rd-media-heading"><div><p class="po-kicker">ЗАДНИЙ ЭКРАН В ДЕЙСТВИИ</p><h2 id="rd-media-heading">Сначала попробуй.<br>Потом посмотри.</h2></div><p>Настоящие видео и авторские веб-сцены обозначены отдельно. Видео загружается только после выбора.</p></div><div class="rd-media-grid">${REAR_MEDIA.map(m=>`<button type="button" class="rd-media-card" data-rd-media="${m.id}"><span class="rd-media-preview ${m.kind==='demo'?'rd-media-drawing rd-drawing-'+m.scenario:''}">${m.poster?`<img src="${m.poster}" loading="lazy" width="720" height="405" alt="${m.kind==='local'?'Кадр официального тизера':'Иллюстрация Xiaomi для перехода к обзору'}">`:demoPreview(m.scenario)}<span class="rd-media-play" aria-hidden="true">${m.kind==='demo'?'↗︎':'▶'}</span></span><span class="rd-media-card-copy"><small>${esc(m.label)}</small><strong>${esc(m.title)}</strong><span>${esc(m.text)}</span></span></button>`).join('')}</div></section>`;}
export function mountRearMedia(root,selectScenario){
 const dialog=document.createElement('dialog');dialog.className='rd-media-dialog';dialog.setAttribute('aria-label','Видеодемонстрация заднего экрана');
 dialog.innerHTML='<header><h2></h2><button type="button" data-rd-media-close aria-label="Закрыть видео">×</button></header><div class="rd-media-player"></div><div class="rd-media-description"></div>';
 document.body.append(dialog);let timer=null,probe=null,iframe=null,opened=null;
 const container=dialog.querySelector('.rd-media-player');
 function clear(){clearTimeout(timer);clearInterval(probe);timer=null;probe=null;const video=dialog.querySelector('video');if(video){video.pause();video.removeAttribute('src');video.load();}iframe?.remove();iframe=null;container.replaceChildren();opened=null;}
 function close(){if(dialog.open)dialog.close();clear();}
 function fallback(){clearTimeout(timer);clearInterval(probe);iframe?.remove();iframe=null;if(!opened)return;container.innerHTML=`<div class="rd-media-fallback"><img src="${opened.poster}" alt="Иллюстрация Xiaomi" width="720" height="405"><div><strong>Продолжим в интерактивной сцене</strong><p>Внешний плеер не ответил. Веб-демонстрация доступна без него.</p><button type="button" data-rd-media-fallback>Показать возможности</button></div></div>`;}
 function message(event){if(!iframe||event.source!==iframe.contentWindow||!['https://www.youtube-nocookie.com','https://www.youtube.com'].includes(event.origin))return;let data=event.data;try{if(typeof data==='string')data=JSON.parse(data)}catch{return;}
  if(data?.event==='onError'){fallback();return;}
  if(['onReady','initialDelivery','infoDelivery'].includes(data?.event)){clearTimeout(timer);clearInterval(probe);container.classList.add('rd-player-ready');container.querySelector('.rd-video-loading')?.remove();}
 }
 function open(id){const item=REAR_MEDIA.find(m=>m.id===id);if(!item)return;if(item.kind==='demo'){selectScenario(item.scenario);return;}close();opened=item;dialog.querySelector('header h2').textContent=item.title;
  dialog.querySelector('.rd-media-description').innerHTML=`<p>${esc(item.label)}. ${esc(item.text)}</p><a href="${item.source}" target="_blank" rel="noopener noreferrer">Открыть оригинал у автора ↗︎</a>${item.scenario?'<button type="button" data-rd-media-fallback>Открыть интерактивную сцену</button>':''}`;
  container.classList.remove('rd-player-ready');
  if(item.kind==='local'){container.innerHTML=`<video controls playsinline preload="none" poster="${item.poster}" aria-label="Официальный тизер Xiaomi">Ваш браузер не поддерживает видео.</video>`;const video=container.querySelector('video');video.src=item.src;video.addEventListener('error',fallback,{once:true});}
  else {
   container.innerHTML=`<div class="rd-video-loading"><img src="${item.poster}" alt="Иллюстрация Xiaomi" width="720" height="405"><p>Загружаем внешний плеер YouTube…</p></div>`;
   iframe=document.createElement('iframe');iframe.title=item.title+' — Unbox Therapy';iframe.referrerPolicy='strict-origin-when-cross-origin';iframe.allow='fullscreen; picture-in-picture; encrypted-media';iframe.allowFullscreen=true;iframe.setAttribute('sandbox','allow-scripts allow-same-origin allow-presentation');
   iframe.src=`https://www.youtube-nocookie.com/embed/${item.videoId}?start=${item.start}&enablejsapi=1&autoplay=0&rel=0&origin=${encodeURIComponent(location.origin)}`;container.append(iframe);
   const signal=()=>{iframe?.contentWindow?.postMessage(JSON.stringify({event:'listening',id:'webbase-rear-player'}),'https://www.youtube-nocookie.com');iframe?.contentWindow?.postMessage(JSON.stringify({event:'command',func:'addEventListener',args:['onError']}),'https://www.youtube-nocookie.com');};iframe.onload=signal;probe=setInterval(signal,500);timer=setTimeout(fallback,10000);
  }
  dialog.showModal();
 }
 function click(event){const button=event.target.closest('[data-rd-media]');if(button)open(button.dataset.rdMedia);}
 function dialogClick(event){if(event.target===dialog||event.target.closest('[data-rd-media-close]'))close();if(event.target.closest('[data-rd-media-fallback]')){const id=opened?.scenario||'personal';close();selectScenario(id);}}
 root.addEventListener('click',click);dialog.addEventListener('click',dialogClick);dialog.addEventListener('close',clear);window.addEventListener('message',message);
 return {close,destroy(){close();root.removeEventListener('click',click);window.removeEventListener('message',message);dialog.remove();}};
}

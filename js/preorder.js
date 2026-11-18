import {preorderPrice,formatPreorderPrice} from './preorder-prices.js?v=20261107-22';
import {rearDisplayMarkup,mountRearDisplay} from './rear-display.js?v=20261118-2';
import {PREORDER_MODELS,PREORDER_VERIFIED_AT} from './preorder-data.js?v=20261118-1';
import {phoneFinish} from './phone-finishes.js?v=20261118-1';
import {escapeHtml as esc} from './utils.js?v=20261023-4';

export function preorderSelection(params=new URLSearchParams()){
 const model=PREORDER_MODELS.find(m=>m.id===params.get('phone'))||PREORDER_MODELS[0];
 const color=model.colors.find(c=>c.id===params.get('finish'))||model.colors[0];
 const variants=preorderVariants(model,color);
 return {model,color,capacity:variants.includes(params.get('capacity'))?params.get('capacity'):variants[0]};
}
export const preorderVariants=(model,color)=>color.variants||model.variants;
export function preorderRequest(selection){
 const {model,color,capacity}=selection;
 return `Запрос на предзаказ\n${model.name}\nЦвет: ${color.label} · ${phoneFinish(color.id).name}\nПамять: ${capacity}\nЦена по скриншотам 1С: ${formatPreorderPrice(preorderPrice(selection))}\nХарактеристики: Global\nДоступность, срок и условия поставки: уточнить в магазине.`;
}
export function preorderSpecGroups(m){return [
 ['Экран и изображение',[
  ['Основной дисплей',`${m.display} Xiaomi Privacy Display · AMOLED LTPO · ${m.resolution}`],['Частота обновления','1–120 Гц'],['Пиковая яркость',`До ${m.brightness} нит в отдельных сценариях`],['Защита основного экрана',m.screenGlass],['Задний экран',`${m.rear} · ${m.rearResolution} · 1–120 Гц · 400 PPI`],['Защита заднего экрана',m.rearGlass],['Изображение','12 бит · BT.2020 · DC-димминг · HDR10+ · Dolby Vision'],['Сенсорный опрос','До 300 Гц на основном экране'],['Privacy Display','Аппаратная защита от бокового просмотра; требуется первичная настройка']]],
 ['Производительность и память',[
  ['Процессор',m.chip],['Техпроцесс',m.process],['CPU',m.cpu],['Графика','Qualcomm Adreno'],['Охлаждение',m.cooling],['Оперативная память',m.ram],['Накопитель',m.storage],['Конфигурации',m.variants.join(' · ')]]],
 ['Камеры и видео',[
  ...m.cameras.map(c=>[`${c[1]} · ${c[0]}`,c[2]]),['Фронтальная камера',m.front],['Видео основных камер',m.video],['Оптическое приближение',m.tele],['Стабилизация','OIS основной камеры и телевика'],['С задним экраном','Селфи основными камерами, групповой кадр, видеоблог']]],
 ['Аккумулятор и зарядка',[
  ['Ёмкость',`${m.battery} мА·ч, типичная`],['Проводная зарядка',`До ${m.wired} Вт HyperCharge`],['Беспроводная зарядка',`До ${m.wireless} Вт`],['Адаптер','Продаётся отдельно в Global-комплекте'],['Условия','Для максимальной мощности нужен совместимый адаптер или беспроводная станция']]],
 ['Корпус и защита',[
  ['Размеры',m.dimensions],['Масса',m.weight],['Цвета','Black · White · Cosmic Blue · Velvet Red'],['Защита',m.protection],['Разблокировка',m.fingerprint],['AI-кнопка','Короткое нажатие — перевод разговора; удержание — голосовая заметка. Можно переназначить.']]],
 ['Связь, звук и датчики',[
  ['Wi-Fi',m.wifi],['Bluetooth',m.bluetooth],['SIM',m.sim],['Диапазоны 5G',m.bands5g],['Диапазоны 4G',m.bands4g],['NFC','Есть; сервисы зависят от региона'],['Навигация',m.navigation],['Звук',m.speakers+' · 4 микрофона'],['Датчики','Приближение, освещение, акселерометр, гироскоп, компас, барометр, Холла, мерцания, лазерная фокусировка'],['Дополнительно','ИК-передатчик · линейный вибромотор по оси X']]],
 ['Система и комплект',[
  ['Операционная система',m.os],['Версия','Global'],['Комплект',m.package],['Региональные функции','AI, eSIM и интеграции приложений зависят от рынка, оператора и обновлений системы'],['Проверено',PREORDER_VERIFIED_AT]]],
 ];}
function specMarkup(model){return preorderSpecGroups(model).map(([title,rows],i)=>`<details id="po-spec-${i}" class="po-spec-card"><summary><span>${String(i+1).padStart(2,'0')}</span>${esc(title)}</summary><dl>${rows.map(([label,value])=>`<div><dt>${esc(label)}</dt><dd>${esc(value)}</dd></div>`).join('')}</dl></details>`).join('');}
export async function mountPreorder(root){
 if(root.dataset.mounted)return;
 let selection=preorderSelection(new URLSearchParams(location.search));
 root.innerHTML=`<div class="po-shell po-workbench">
  <section id="po-rear" class="po-section"><header class="po-tool-heading"><div><p class="po-kicker">ПРЕДЗАКАЗ · GLOBAL</p><h1>Xiaomi 18 Pro / Pro Max</h1></div><a href="#po-config">Модели и цены ↓</a></header>${rearDisplayMarkup()}</section>
  <section id="po-config" class="po-section"><div class="po-config-heading"><h2>Модель и конфигурация</h2><span>Global</span></div><div class="po-model-tabs" role="group" aria-label="Выберите модель">${PREORDER_MODELS.map(m=>`<button type="button" data-po-model="${m.id}" aria-pressed="${m.id===selection.model.id}">${esc(m.name)}</button>`).join('')}</div><div id="po-model-panel"></div>
   <section id="po-specs" class="po-model-specs" aria-labelledby="po-spec-name"><div class="po-details-heading"><h3 id="po-spec-name"></h3><p>Открой нужный раздел</p></div><div id="po-spec-groups" class="po-spec-grid"></div></section>
  </section>
  <footer class="po-tool-sources"><details><summary>Источники и сведения о демонстрации · ${PREORDER_VERIFIED_AT}</summary><ul>${PREORDER_MODELS.map(m=>`<li><a href="${m.specSource}" target="_blank" rel="noopener noreferrer">${esc(m.name)} — Xiaomi Global ↗</a></li>`).join('')}<li><a href="https://www.mi.com/global/product/xiaomi-18-pro-max/" target="_blank" rel="noopener noreferrer">Функции заднего экрана и Global-цвета ↗</a></li></ul><p>3D-модель и интерфейсы — интерактивная веб-реконструкция по материалам Xiaomi. Демонстрационные звонки, маршруты, приложения и AI-карточки работают локально; реальные сервисы не подключены. Доступность функций зависит от рынка и прошивки. AI-обои для Global заявлены с OTA в декабре 2026.</p><p>Цены сохранены из предоставленных скриншотов 1С от 07.11.2026. Они не обновляются автоматически. Копирование конфигурации не оформляет заказ.</p></details></footer><p id="po-live" class="po-sr-only" role="status" aria-live="polite"></p></div>`;
 function persist(){const u=new URL(location.href);u.searchParams.set('section','preorder');u.searchParams.set('phone',selection.model.id);u.searchParams.set('finish',selection.color.id);u.searchParams.set('capacity',selection.capacity);history.replaceState({...history.state},'',u);}
 function chooseColor(id){selection.color=selection.model.colors.find(c=>c.id===id)||selection.model.colors[0];updateColor();}
 const rear=mountRearDisplay(root.querySelector('[data-rear-demo]'),{finish:selection.color.id,modelId:selection.model.id,onFinishChange:chooseColor});
 function updateColor(){
  const {model:m,color:c}=selection,f=phoneFinish(c.id),image=root.querySelector('#po-device-image');image.src=c.image;image.alt=`${m.name}, ${f.name}`;
  root.querySelector('#po-color-name').textContent=c.label;root.querySelector('.po-product').style.setProperty('--po-device-accent',f.hex);
  root.querySelector('#po-color-edition').textContent=f.name+(c.id==='blue'?' · глянцевое покрытие':'');
  root.querySelectorAll('[data-po-color]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.poColor===c.id)));
  const variants=preorderVariants(m,c);if(!variants.includes(selection.capacity))selection.capacity=variants[0];
  root.querySelector('#po-capacities').innerHTML=variants.map(v=>`<button data-po-capacity="${esc(v)}" aria-pressed="${v===selection.capacity}">${esc(v)}</button>`).join('');
  root.querySelector('#po-selection-summary').textContent=`${m.name} · ${f.name} · ${selection.capacity}`;
  const price=preorderPrice(selection);root.querySelector('#po-price-amount').textContent=formatPreorderPrice(price);root.querySelector('#po-price-note').textContent=price?'По прайсу 1С от 07.11.2026':'Для этой памяти цена в предоставленном прайсе отсутствует';root.querySelector('#po-price').classList.toggle('po-price--unknown',!price);root.querySelector('#po-copy-status').textContent='';rear.setFinish(c.id);persist();
 }
 function renderModel(){const {model:m,color:c}=selection;rear.setModel(m.id);
  root.querySelectorAll('[data-po-model]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.poModel===m.id)));
  root.querySelector('#po-model-panel').innerHTML=`<article class="po-product"><div class="po-product-stage"><img id="po-device-image" src="${c.image}" alt="${esc(m.name)}" width="300" height="760" loading="lazy" decoding="async"><span class="po-product-badge">${esc(m.tag)}</span></div><div class="po-product-copy"><h3>${esc(m.name)}</h3><p class="po-description">${esc(m.description)}</p><dl class="po-key-facts"><div><dt>Экран</dt><dd>${esc(m.display)}<small>1–120 Гц</small></dd></div><div><dt>Батарея</dt><dd>${m.battery}<small>мА·ч</small></dd></div><div><dt>Зарядка</dt><dd>${m.wired}<small>Вт</small></dd></div></dl><p class="po-chip">${esc(m.chip)}</p><div class="po-color-heading">Цвет: <strong id="po-color-name"></strong></div><div class="po-swatches" role="group" aria-label="Цвет ${esc(m.name)}">${m.colors.map(v=>`<button type="button" data-po-color="${v.id}" style="--po-swatch:${v.hex}" aria-label="${esc(v.label)}" aria-pressed="${v.id===c.id}"><span aria-hidden="true"></span><small>${esc(v.label)}</small></button>`).join('')}</div><p id="po-color-edition" class="po-color-hint"></p><p class="po-field-heading">Оперативная память / накопитель</p><div id="po-capacities" class="po-capacities" role="group" aria-label="Оперативная память и накопитель"></div><div id="po-price" class="po-price"><span>Цена из 1С</span><strong id="po-price-amount" aria-live="polite"></strong><p id="po-price-note"></p></div><button class="po-button po-primary po-copy-button" data-po-copy>Скопировать конфигурацию</button><p id="po-selection-summary" class="po-selection-summary"></p><p id="po-copy-status" class="po-copy-status" role="status"></p></div></article>`;
  root.querySelector('#po-spec-name').textContent=m.name+' · характеристики Global';root.querySelector('#po-spec-groups').innerHTML=specMarkup(m);root.querySelector('#po-live').textContent=`Выбрана модель ${m.name}`;updateColor();
 }
 async function click(event){const b=event.target.closest('button');if(!b)return;
  if(b.dataset.poModel){selection=preorderSelection(new URLSearchParams({phone:b.dataset.poModel,finish:selection.color.id,capacity:selection.capacity}));renderModel();}
  if(b.dataset.poColor)chooseColor(b.dataset.poColor);
  if(b.dataset.poCapacity){selection.capacity=b.dataset.poCapacity;updateColor();}
  if(b.hasAttribute('data-po-copy')){const text=preorderRequest(selection),status=root.querySelector('#po-copy-status');try{if(!navigator.clipboard?.writeText)throw Error('Clipboard unavailable');await navigator.clipboard.writeText(text);status.textContent='Конфигурация скопирована';}catch{let area=root.querySelector('#po-copy-fallback');if(!area){area=document.createElement('textarea');area.id='po-copy-fallback';area.setAttribute('aria-label','Конфигурация для копирования');status.after(area);}area.value=text;area.focus();area.select();status.textContent='Скопируй выделенный текст';}}
 }
 root.addEventListener('click',click);renderModel();root.dataset.mounted='true';return {pause:rear.pause,resume:rear.resume,destroy(){rear.destroy();root.removeEventListener('click',click);delete root.dataset.mounted;}};
}

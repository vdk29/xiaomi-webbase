import { PREORDER_MODELS, PREORDER_VERIFIED_AT } from './preorder-data.js?v=20261106-16';
import { escapeHtml as esc } from './utils.js?v=20261023-4';
const A = 'assets/preorder/20261106/';
const photo = (src, alt, cls = '', eager = false) => `<img src="${esc(src)}" alt="${esc(alt)}" class="${cls}" width="900" height="900" loading="${eager ? 'eager' : 'lazy'}" decoding="async">`;

export function preorderSelection(params = new URLSearchParams()) {
  const model = PREORDER_MODELS.find(m => m.id === params.get('phone')) || PREORDER_MODELS[1];
  const color = model.colors.find(c => c.id === params.get('finish')) || model.colors.find(c => c.id === 'blue') || model.colors[0];
  const variants = color.id === 'transparent' ? model.variants.slice(-1) : model.variants;
  return { model, color, capacity: variants.includes(params.get('capacity')) ? params.get('capacity') : variants[0] };
}

export function preorderRequest({ model, color, capacity }) {
  return `Запрос на предзаказ\n${model.name}\nЦвет: ${color.label}\nПамять: ${capacity}\nВерсия: ${model.region}\nЦена, доступность конфигурации и срок поставки: уточнить в магазине.`;
}

export function preorderSpecGroups(m) {
  const screen = [['Основной дисплей',`${m.display} AMOLED · ${m.resolution}`],['Частота обновления',`До ${m.hz} Гц`],['Пиковая яркость',`До ${m.brightness} нит, в отдельных сценариях`],['Задний экран',m.rear ? `${m.rear} · ${m.rearResolution} · 1–120 Гц` : 'Нет'],['Внешний экран',m.outer || 'Основной дисплей используется напрямую'],['Защита экрана',m.id.includes('fold') ? 'Снаружи Dragon Crystal Glass 3.0; внутри UTG' : m.id.includes('17t') ? 'См. официальную спецификацию исполнения' : 'Xiaomi Dragon Crystal Glass 3.0']];
  if (m.rear) screen.push(['Функции дисплея','Аппаратная защита от бокового просмотра, DC-димминг, HDR10+, HDR Vivid, Dolby Vision'],['Сенсорный опрос','До 300 Гц основной экран; до 120 Гц задний'],['Цвет','12 бит; широкая цветовая гамма BT.2020']);
  const cameras = m.cameras.map(c=>[`${c[1]} · ${c[0]}`,c[2]]);
  cameras.push(['Фронтальная камера',m.front],['Видео основных камер',m.video],['Оптическое приближение',m.tele],['Режимы съёмки','Ночной режим, портрет, профессиональный режим, панорама, таймлапс, замедленное видео, динамические фотографии'],['Стабилизация','Оптическая стабилизация основной камеры и телевика']);
  if(m.rear)cameras.push(['Съёмка с задним экраном','Селфи основными камерами, предварительный просмотр, фотоформаты для заднего дисплея'],['Камера и AI','Leica-стили, AI-помощник съёмки; отдельные облачные функции зависят от прошивки и региона']);
  return [
    ['Экран и изображение',screen],
    ['Производительность и память',[['Процессор',m.chip],['Техпроцесс',m.process],['CPU',m.cpu],['Оперативная память',m.ram],['Накопитель',m.storage],['Конфигурации',m.variants.join(' · ')]]],
    ['Камеры и видео',cameras],
    ['Аккумулятор и зарядка',[['Ёмкость',`${m.battery} мА·ч, типичная${m.minimum ? `; ${m.minimum} мА·ч минимальная` : ''}`],['Проводная зарядка',`До ${m.wired} Вт`],['Беспроводная зарядка',m.wireless ? `До ${m.wireless} Вт` : 'Не заявлена'],['Обратная зарядка',m.reverse],['Условия быстрой зарядки','Нужен совместимый адаптер; для беспроводной зарядки — совместимая зарядная станция']]],
    ['Корпус и защита',[['Размеры',m.dimensions],['Масса',m.weight],['Цвета и исполнения',m.colors.map(c=>c.label).join(' · ')],['Защита',m.protection],['Разблокировка',m.fingerprint],['О защите от воды','Лабораторный рейтинг; защита не постоянна. Повреждение жидкостью не означает гарантийный случай.']]],
    ['Связь, звук и датчики',[['Wi-Fi',m.wifi],['Bluetooth',m.bluetooth],['USB',m.usb],['SIM','Две nano-SIM; перечень услуг зависит от оператора'],['Диапазоны 5G',m.bands5g],['Диапазоны 4G',m.bands4g],['NFC','Есть; платёжные и транспортные сервисы зависят от региона'],['Навигация','GPS, BeiDou, GLONASS, Galileo, QZSS, NavIC; подробные частоты — в спецификации'],['Звук',m.speakers],['Подключение наушников','USB Type-C; Bluetooth'],['Датчики','Освещение, приближение, акселерометр, гироскоп, компас; ИК-передатчик и линейная вибрация']]],
    ['Система, версия и комплект',[['Операционная система',m.os],['Регион данных',`${m.region}, официальная региональная спецификация`],['Комплект по данным производителя','Смартфон, адаптер питания, USB-C кабель, чехол, заводская защитная плёнка, инструмент SIM, документация; состав поставки уточняется'],['Что уточнить до заказа','Прошивка, языки, Google-сервисы, региональные AI-функции, гарантия, наличие цвета и памяти'],['Проверено',PREORDER_VERIFIED_AT]]],
  ];
}

function specMarkup(m) {
  return preorderSpecGroups(m).map(([title,rows],i)=>`<details class="po-spec-group" ${i===0?'open':''}><summary>${esc(title)}<span aria-hidden="true">+</span></summary><dl>${rows.map(([k,v])=>`<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl></details>`).join('');
}

export async function mountPreorder(root) {
  if(root.dataset.mounted)return;
  let selection=preorderSelection(new URLSearchParams(location.search));
  let shot='portrait';
  let demo='selfie';
  const hero = `<header class="po-hero"><div class="po-hero-copy"><p class="po-kicker"><span></span> ПРЕДЗАКАЗ · КОЛЛЕКЦИЯ XIAOMI</p><h1>Ещё одна грань<br><em>возможного.</em></h1><p class="po-lead">Новые флагманы Xiaomi. Камеры Leica, большой запас энергии и экран, который меняет взгляд на смартфон.</p><div class="po-hero-actions"><a href="#po-config" class="po-button po-primary">Выбрать свой Xiaomi <span>↗︎</span></a><a href="#po-rear" class="po-text-link">Познакомиться с задним экраном ↓</a></div><p class="po-edition-note">Официальные модели · Характеристики китайских версий</p></div><div class="po-hero-art"><span class="po-hero-number" aria-hidden="true">18</span>${photo(A+'series-hero.webp','Официальная презентация заднего экрана Xiaomi 18 Pro','po-hero-image',true)}<span class="po-art-caption">ДРУГОЙ ВЗГЛЯД. ТОТ ЖЕ XIAOMI.</span></div></header>`;
  root.innerHTML=`<div class="po-shell">${hero}
    <nav class="po-chapters" aria-label="Разделы презентации"><a href="#po-config">01 · Модели и цвета</a><a href="#po-rear">02 · Задний экран</a><a href="#po-camera">03 · Камеры Leica</a><a href="#po-compare">04 · Сравнение</a><a href="#po-specs">05 · Все характеристики</a></nav>
    <section id="po-config" class="po-section"><div class="po-section-heading"><div><p class="po-kicker">01 / НАЙДИ СВОЙ ХАРАКТЕР</p><h2>Твой цвет.<br>Твой флагман.</h2></div><p>От компактного Pro до нового складного формата. Переключай модели и рассматривай каждое исполнение.</p></div><div class="po-model-tabs" role="group" aria-label="Выберите модель">${PREORDER_MODELS.map(m=>`<button type="button" data-po-model="${m.id}" aria-pressed="${m.id===selection.model.id}">${esc(m.name.replace('Xiaomi ',''))}${m.id.includes('18-')?'<small>НОВИНКА</small>':''}</button>`).join('')}</div><div id="po-model-panel"></div></section>
    <section id="po-rear" class="po-section po-dark"><div class="po-section-heading"><div><p class="po-kicker">02 / XIAOMI 18 PRO И PRO MAX</p><h2>Не просто<br><em>второй экран.</em></h2></div><p>Селфи на основную камеру. Нужная информация одним взглядом. Личный стиль, который виден с другой стороны.</p></div><div class="po-demo-grid"><div class="po-demo-device" aria-label="Схематичная демонстрация заднего экрана"><div class="po-demo-camera"><span></span><span></span><span class="po-leica-dot">Leica</span></div><div id="po-demo-screen" class="po-demo-screen" aria-live="polite"></div><div class="po-demo-back"><span>Xiaomi</span><small>18 PRO SERIES</small></div></div><div class="po-demo-controls"><div class="po-demo-tabs" role="group" aria-label="Возможности заднего экрана">${[['selfie','01','Селфи основной камерой'],['cards','02','Информация под рукой'],['wallpaper','03','Твой стиль'],['ai','04','AI-карточки']].map(([id,n,t])=>`<button data-po-demo="${id}" aria-pressed="${id===demo}"><small>${n}</small><span>${t}</span><b>↗︎</b></button>`).join('')}</div><div id="po-demo-copy"></div><p class="po-caption">Интерактивная схема, не запись интерфейса телефона. Состав функций зависит от региона и версии HyperOS.</p></div></div><div class="po-film"><video id="po-film" controls playsinline preload="none" poster="${A}rear-screen-story.webp" aria-label="Официальный ролик Xiaomi о заднем экране"></video><button class="po-film-play" data-po-play><span>▶︎</span><b>Посмотреть в движении</b><small>Официальный ролик Xiaomi · воспроизведение по нажатию</small></button></div></section>
    <section id="po-camera" class="po-section"><div class="po-section-heading"><div><p class="po-kicker">03 / СВЕТ. ДЕТАЛИ. ХАРАКТЕР.</p><h2>Смотри шире.<br>Снимай ближе.</h2></div><p>У каждой камеры своя задача. Посмотри, чем отличаются основной модуль, телевик и сверхширокоугольная камера выбранной модели.</p></div><div id="po-camera-cards" class="po-camera-cards"></div><div class="po-optics">${photo(A+'leica-optics.webp','Оптическая схема объектива Leica на официальной презентации Xiaomi 18 Pro')}<div><p class="po-kicker">ОПТИКА LEICA</p><h3>История начинается<br>со света.</h3><p>Большая диафрагма, оптическая стабилизация и настройка Leica помогают работать с деталями, перспективой и сложным освещением.</p></div></div><div class="po-gallery"><div class="po-gallery-toolbar"><h3>Взгляд производителя</h3><div role="group" aria-label="Примеры фотографий">${[['portrait','Портрет'],['night','Вечер'],['detail','Детали']].map(([id,t])=>`<button data-po-shot="${id}" aria-pressed="${id===shot}">${t}</button>`).join('')}</div></div><figure><img id="po-sample" src="${A}camera-portrait.webp" loading="lazy" decoding="async" alt="Пример портретной фотографии из официальной галереи Xiaomi 18 Pro" width="1280" height="610"><figcaption id="po-sample-caption">Пример из официальной презентации Xiaomi 18 Pro. Результат съёмки зависит от условий.</figcaption></figure></div></section>
    <section id="po-compare" class="po-section po-comparison"><div class="po-section-heading"><div><p class="po-kicker">04 / РАЗНЫЕ ФОРМАТЫ. ОДНА ФИЛОСОФИЯ.</p><h2>Какой Xiaomi — твой?</h2></div><p>Сравни новые модели рядом. Пролистай таблицу по горизонтали, чтобы увидеть остальные флагманы.</p></div><div class="po-table-scroll" tabindex="0" role="region" aria-label="Сравнение характеристик смартфонов"><table><thead><tr><th scope="col">Характеристика</th>${PREORDER_MODELS.map(m=>`<th scope="col"><button data-po-jump="${m.id}">${esc(m.name)}</button></th>`).join('')}</tr></thead><tbody>${[['Экран',m=>`${m.display} · ${m.hz} Гц`],['Задний экран',m=>m.rear||'Нет'],['Процессор',m=>m.chip],['Камеры',m=>m.cameras.map(c=>c[0]).join(' + ')],['Оптический зум',m=>m.tele],['Аккумулятор',m=>`${m.battery} мА·ч`],['Зарядка',m=>`${m.wired} Вт / ${m.wireless ? m.wireless+' Вт без провода':'без беспроводной'}`],['Масса',m=>m.weight],['Защита',m=>m.protection],['Регион',m=>m.region]].map(([k,f])=>`<tr><th scope="row">${esc(k)}</th>${PREORDER_MODELS.map(m=>`<td>${esc(f(m))}</td>`).join('')}</tr>`).join('')}</tbody></table></div></section>
    <section id="po-specs" class="po-section"><div class="po-section-heading"><div><p class="po-kicker">05 / КАЖДАЯ ДЕТАЛЬ ИМЕЕТ ЗНАЧЕНИЕ</p><h2>Всё о <span id="po-spec-name"></span>.</h2></div><div><label class="po-spec-select-label">Модель для характеристик<select id="po-spec-model">${PREORDER_MODELS.map(m=>`<option value="${m.id}">${esc(m.name)}</option>`).join('')}</select></label><button class="po-link-button" data-po-expand>Развернуть все характеристики</button></div></div><div id="po-spec-groups"></div><p class="po-caption">Ёмкость аккумулятора — типичная. Пиковая яркость и мощность зарядки достигаются в определённых условиях. Подробные методики и ограничения — в источниках производителя.</p></section>
    <aside class="po-pending"><div class="po-pending-mark">18</div><div><p class="po-kicker">ОБЫЧНЫЙ XIAOMI 18</p><h3>Ждём подтверждённые детали.</h3><p>На дату проверки у нас нет подтверждённой спецификации обычного Xiaomi 18. Рендеры и характеристики Pro не выдаём за данные базовой модели.</p></div><a href="https://www.mi.com/shop" target="_blank" rel="noopener noreferrer">Официальный сайт ↗︎</a></aside>
    <footer class="po-sources"><div><p class="po-kicker">О ПРОДУКТАХ И ПРЕДЗАКАЗЕ</p><h3>Красиво — значит точно.</h3><p>Данные относятся к китайским версиям. Прошивка, языки, Google-сервисы, NFC-платежи и AI-функции могут отличаться от глобальных моделей. Цена, доступность сочетания цвета и памяти, гарантия и срок поставки уточняются в магазине.</p><p>Раздел помогает выбрать конфигурацию. Копирование запроса не оформляет заказ и не резервирует товар.</p></div><details><summary>Источники и дата проверки · 06.11.2026</summary><ul>${PREORDER_MODELS.map(m=>`<li><a href="${m.source}" target="_blank" rel="noopener noreferrer">${esc(m.name)} — Xiaomi ↗︎</a> · <a href="${m.specSource}" target="_blank" rel="noopener noreferrer">спецификация ↗︎</a></li>`).join('')}</ul><p>Фотографии, примеры съёмки и ролик — материалы Xiaomi. Используются локальные оптимизированные копии. Подробности происхождения сохранены в манифесте проекта.</p></details></footer><p id="po-live" class="po-sr-only" role="status" aria-live="polite"></p></div>`;

  function persist() {
    const u=new URL(location.href);
    u.searchParams.set('section','preorder');u.searchParams.set('phone',selection.model.id);u.searchParams.set('finish',selection.color.id);u.searchParams.set('capacity',selection.capacity);
    history.replaceState({...history.state},'',u);
  }
  function updateColor() {
    const {model:m,color:c,capacity}=selection;
    const image=root.querySelector('#po-device-image');image.src=c.image;image.alt=`${m.name}, ${c.label}`;
    root.querySelector('#po-color-name').textContent=c.label;
    root.querySelectorAll('[data-po-color]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.poColor===c.id)));
    const variants=c.id==='transparent'?m.variants.slice(-1):m.variants;
    if(!variants.includes(capacity))selection.capacity=variants[0];
    root.querySelector('#po-capacities').innerHTML=variants.map(v=>`<button data-po-capacity="${esc(v)}" aria-pressed="${v===selection.capacity}">${esc(v)}</button>`).join('');
    root.querySelector('#po-selection-summary').textContent=`${m.name} · ${c.label} · ${selection.capacity}`;
    root.querySelector('#po-copy-status').textContent='';
    persist();
  }
  function renderModel() {
    const {model:m,color:c}=selection;
    root.querySelectorAll('[data-po-model]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.poModel===m.id)));
    root.querySelector('#po-model-panel').innerHTML=`<article class="po-product" style="--po-device-accent:${m.accent}"><div class="po-product-stage"><span class="po-stage-halo"></span><span class="po-product-badge">${esc(m.tag)}</span><img id="po-device-image" src="${c.image}" alt="${esc(m.name+', '+c.label)}" width="360" height="700" decoding="async"><span class="po-stage-label">XIAOMI / ${m.id.includes('18-')?'18 SERIES':'2026 COLLECTION'}</span></div><div class="po-product-copy"><p class="po-kicker">${esc(m.name)}</p><h3>${esc(m.line)}</h3><p>${esc(m.description)}</p><dl class="po-key-facts"><div><dt>Экран</dt><dd>${m.display}<small>до ${m.hz} Гц</small></dd></div><div><dt>Аккумулятор</dt><dd>${m.battery}<small>мА·ч, типичная ёмкость</small></dd></div><div><dt>Камера Leica</dt><dd>${esc(m.cameras[0][0])}<small>основной модуль</small></dd></div></dl><div class="po-color-heading">Цвет: <strong id="po-color-name">${esc(c.label)}</strong></div><div class="po-swatches" role="group" aria-label="Цвет ${esc(m.name)}">${m.colors.map(v=>`<button data-po-color="${v.id}" style="--po-swatch:${v.hex}" aria-label="${esc(v.label)}" aria-pressed="${v.id===c.id}"><span></span></button>`).join('')}</div><p class="po-color-hint">Фотография меняется вместе с цветом</p><div id="po-capacities" class="po-capacities" role="group" aria-label="Оперативная память и накопитель"></div><button class="po-button po-primary po-copy-button" data-po-copy>Скопировать конфигурацию <span>↗︎</span></button><p id="po-selection-summary" class="po-selection-summary"></p><p id="po-copy-status" class="po-copy-status" role="status"></p><p class="po-caption">Запрос для магазина. Цена и срок поставки уточняются отдельно.</p></div></article>`;
    root.querySelector('#po-camera-cards').innerHTML=m.cameras.map((c,i)=>`<article><span class="po-lens-mark" aria-hidden="true">${['◎','◉','◌'][i]}</span><p>${esc(c[1])}</p><h3>${esc(c[0])}</h3><p class="po-camera-spec">${esc(c[2])}</p><p>${esc(c[3])}</p></article>`).join('');
    root.querySelector('#po-spec-name').textContent=m.name;
    root.querySelector('#po-spec-model').value=m.id;
    root.querySelector('#po-spec-groups').innerHTML=specMarkup(m);
    root.querySelector('[data-po-expand]').textContent='Развернуть все характеристики';
    root.querySelector('#po-live').textContent=`Выбрана модель ${m.name}`;
    updateColor();
  }
  function renderDemo() {
    const content={
      selfie:{title:'Увидеть себя до кадра.',text:'Задний экран работает как видоискатель: можно снимать себя на основные камеры и сразу проверять композицию. Удобно для селфи и групповых кадров.',screen:`<div class="po-demo-selfie">${photo(A+'camera-portrait.webp','Условный пример предварительного просмотра портрета')}<span class="po-demo-grid-lines"></span><span class="po-shutter"></span></div>`},
      cards:{title:'Не переворачивать. Просто взглянуть.',text:'Карточки показывают полезную информацию и дают быстрый доступ к поддерживаемым функциям. Набор приложений и уведомлений определяется системой и регионом.',screen:'<div class="po-screen-card"><small>СЕГОДНЯ</small><b>09:41</b><span>Встреча через 10 минут</span><i>♫ Любимый трек · ▷</i></div>'},
      wallpaper:{title:'С другой стороны — тоже ты.',text:'Часы, обои и собственные изображения превращают задний экран в часть дизайна. В новых Pro есть персонализация и AI-инструменты; некоторые возможности требуют обновления.',screen:'<div class="po-screen-wallpaper"><span>09<br>41</span><small>MAKE IT YOURS</small></div>'},
      ai:{title:'Маленький экран. Свои сценарии.',text:'Для серии 18 Pro Xiaomi показывает приложение-карточки и их создание с помощью AI. Поддержка сервисов, языка и создание карточек зависят от китайской прошивки и аккаунта.',screen:'<div class="po-screen-card po-screen-ai"><small>ПРИМЕР AI-КАРТОЧКИ</small><b>25:00</b><span>Время сосредоточиться</span><i>● Фокус-таймер</i></div>'},
    }[demo];
    root.querySelector('#po-demo-screen').innerHTML=content.screen;
    root.querySelector('#po-demo-copy').innerHTML=`<h3>${content.title}</h3><p>${content.text}</p>`;
    root.querySelectorAll('[data-po-demo]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.poDemo===demo)));
  }
  function selectModel(id) {
    const model=PREORDER_MODELS.find(m=>m.id===id);if(!model)return;
    selection=preorderSelection(new URLSearchParams({phone:id,finish:selection.color.id,capacity:selection.capacity}));renderModel();
  }
  root.addEventListener('click',async event=>{
    const b=event.target.closest('button');if(!b)return;
    if(b.dataset.poModel)selectModel(b.dataset.poModel);
    if(b.dataset.poJump){selectModel(b.dataset.poJump);root.querySelector('#po-config').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});}
    if(b.dataset.poColor){selection.color=selection.model.colors.find(c=>c.id===b.dataset.poColor)||selection.color;updateColor();}
    if(b.dataset.poCapacity){selection.capacity=b.dataset.poCapacity;updateColor();}
    if(b.dataset.poDemo){demo=b.dataset.poDemo;renderDemo();}
    if(b.dataset.poShot){shot=b.dataset.poShot;root.querySelector('#po-sample').src=A+'camera-'+shot+'.webp';root.querySelector('#po-sample').alt={portrait:'Портрет из галереи Xiaomi 18 Pro',night:'Вечерняя фотография из галереи Xiaomi 18 Pro',detail:'Пример деталей из галереи Xiaomi 18 Pro'}[shot];root.querySelectorAll('[data-po-shot]').forEach(v=>v.setAttribute('aria-pressed',String(v.dataset.poShot===shot)));}
    if(b.hasAttribute('data-po-expand')){const groups=[...root.querySelectorAll('.po-spec-group')];const open=groups.some(g=>!g.open);groups.forEach(g=>g.open=open);b.textContent=open?'Свернуть характеристики':'Развернуть все характеристики';}
    if(b.hasAttribute('data-po-play')){const v=root.querySelector('#po-film');v.src=A+'rear-display-film.mp4';b.hidden=true;try{await v.play()}catch{v.controls=true;}}
    if(b.hasAttribute('data-po-copy')){
      const text=preorderRequest(selection);const status=root.querySelector('#po-copy-status');
      try{if(!navigator.clipboard?.writeText)throw Error('Clipboard unavailable');await navigator.clipboard.writeText(text);status.textContent='Конфигурация скопирована. Передай её сотруднику магазина.';}
      catch{let area=root.querySelector('#po-copy-fallback');if(!area){area=document.createElement('textarea');area.id='po-copy-fallback';area.setAttribute('aria-label','Текст запроса на предзаказ');status.after(area)}area.value=text;area.focus();area.select();status.textContent='Выделенный текст можно скопировать вручную.';}
    }
  });
  root.querySelector('#po-spec-model').addEventListener('change',e=>selectModel(e.target.value));
  renderModel();renderDemo();root.dataset.mounted='true';
  return { pause:()=>root.querySelector('#po-film')?.pause() };
}

import { PREORDER_MODELS } from './preorder-data.js?v=20261106-17';
import { escapeHtml as esc } from './utils.js?v=20261023-4';
const A = 'assets/preorder/20261106/';
const photo = (src, alt, cls = '', eager = false) => `<img src="${esc(src)}" alt="${esc(alt)}" class="${cls}" width="900" height="900" loading="${eager ? 'eager' : 'lazy'}" decoding="async">`;

export function preorderSelection(params = new URLSearchParams()) {
  const model = PREORDER_MODELS.find(m => m.id === params.get('phone')) || PREORDER_MODELS[0];
  const color = model.colors.find(c => c.id === params.get('finish')) || model.colors[0];
  const variants = model.variants;
  return { model, color, capacity: variants.includes(params.get('capacity')) ? params.get('capacity') : variants[0] };
}

export function preorderRequest({ model, color, capacity }) {
  return `Запрос на предзаказ\n${model.name}\nЦвет: ${color.label}\nПамять: ${capacity} (предварительно)\nВерсия: ${model.region}\nОкончательные характеристики, цена, доступность конфигурации и срок поставки: уточнить в магазине.`;
}

export function preorderSpecGroups(model) {
  return model.specGroups.map(group => [group.title, group.items]);
}

function specMarkup(model) {
  return preorderSpecGroups(model).map(([title, items]) => `
    <article class="po-spec-card">
      <h4>${esc(title)}</h4>
      <dl>${items.map(item => `<div><dt>${esc(item.label)}</dt><dd>${esc(item.value)}${item.status === 'reported' ? `<a class="po-fact-source" href="${esc(item.source)}" target="_blank" rel="noopener noreferrer" aria-label="Источник предварительных данных: ${esc(item.label)}">Предварительно ↗︎</a>` : '<span class="po-fact-pending">Требует подтверждения Global</span>'}</dd></div>`).join('')}</dl>
    </article>`).join('');
}

export async function mountPreorder(root) {
  if(root.dataset.mounted)return;
  let selection=preorderSelection(new URLSearchParams(location.search));
  let shot='portrait';
  let demo='selfie';
  const hero = `<header class="po-hero"><div class="po-hero-copy"><p class="po-kicker"><span></span> ПРЕДЗАКАЗ · КОЛЛЕКЦИЯ XIAOMI</p><h1>Ещё одна грань<br><em>возможного.</em></h1><p class="po-lead">Xiaomi 18 Pro и 18 Pro Max. Выбери модель, рассмотри цвет и открой её характеристики в одном месте.</p><div class="po-hero-actions"><a href="#po-config" class="po-button po-primary">Выбрать свой Xiaomi <span>↗︎</span></a><a href="#po-rear" class="po-text-link">Познакомиться с задним экраном ↓</a></div><p class="po-edition-note">Xiaomi 18 Pro · Xiaomi 18 Pro Max · Global</p></div><div class="po-hero-art"><span class="po-hero-number" aria-hidden="true">18</span>${photo(A+'series-hero.webp','Официальная презентация заднего экрана Xiaomi 18 Pro','po-hero-image',true)}<span class="po-art-caption">ДРУГОЙ ВЗГЛЯД. ТОТ ЖЕ XIAOMI.</span></div></header>`;
  root.innerHTML=`<div class="po-shell">${hero}
    <nav class="po-chapters" aria-label="Разделы презентации"><a href="#po-config">01 · Модели и цвета</a><a href="#po-specs">02 · Характеристики</a><a href="#po-rear">03 · Задний экран</a><a href="#po-camera">04 · Камеры Leica</a></nav>
    <section id="po-config" class="po-section"><div class="po-section-heading"><div><p class="po-kicker">01 / НАЙДИ СВОЙ ХАРАКТЕР</p><h2>Твой цвет.<br>Твой флагман.</h2></div><p>Два флагмана. Выбери Pro или Pro Max — ниже будут только его цвета, конфигурации и характеристики.</p></div><div class="po-model-tabs" role="group" aria-label="Выберите модель">${PREORDER_MODELS.map(m=>`<button type="button" data-po-model="${m.id}" aria-pressed="${m.id===selection.model.id}">${esc(m.name.replace('Xiaomi ',''))}${m.id.includes('18-')?'<small>НОВИНКА</small>':''}</button>`).join('')}</div><div id="po-model-panel"></div>
      <section id="po-specs" class="po-model-specs" aria-labelledby="po-spec-name"><div class="po-details-heading"><p class="po-kicker">ХАРАКТЕРИСТИКИ ВЫБРАННОЙ МОДЕЛИ</p><h3 id="po-spec-name"></h3><p>Все разделы открыты сразу. Данные европейских поставок предварительные: полная спецификация Global пока не опубликована Xiaomi.</p></div><div id="po-spec-groups" class="po-spec-grid"></div></section></section>
    <section id="po-rear" class="po-section po-dark"><div class="po-section-heading"><div><p class="po-kicker">03 / XIAOMI 18 PRO И PRO MAX</p><h2>Не просто<br><em>второй экран.</em></h2></div><p>Селфи на основную камеру. Нужная информация одним взглядом. Личный стиль, который виден с другой стороны.</p></div><div class="po-demo-grid"><div class="po-demo-device" aria-label="Схематичная демонстрация заднего экрана"><div class="po-demo-camera"><span></span><span></span><span class="po-leica-dot">Leica</span></div><div id="po-demo-screen" class="po-demo-screen" aria-live="polite"></div><div class="po-demo-back"><span>Xiaomi</span><small>18 PRO SERIES</small></div></div><div class="po-demo-controls"><div class="po-demo-tabs" role="group" aria-label="Возможности заднего экрана">${[['selfie','01','Селфи основной камерой'],['cards','02','Информация под рукой'],['wallpaper','03','Твой стиль'],['ai','04','AI-карточки']].map(([id,n,t])=>`<button data-po-demo="${id}" aria-pressed="${id===demo}"><small>${n}</small><span>${t}</span><b>↗︎</b></button>`).join('')}</div><div id="po-demo-copy"></div><p class="po-caption">Иллюстрация сценариев серии, не запись интерфейса Global. Доступность этих функций в глобальной прошивке требует подтверждения.</p></div></div><div class="po-film"><video id="po-film" controls playsinline preload="none" poster="${A}rear-screen-story.webp" aria-label="Официальный ролик Xiaomi о заднем экране"></video><button class="po-film-play" data-po-play><span>▶︎</span><b>Посмотреть в движении</b><small>Официальный ролик Xiaomi · воспроизведение по нажатию</small></button></div></section>
    <section id="po-camera" class="po-section"><div class="po-section-heading"><div><p class="po-kicker">04 / СВЕТ. ДЕТАЛИ. ХАРАКТЕР.</p><h2>Смотри шире.<br>Снимай ближе.</h2></div><p>Примеры снимков и оптика из презентации серии. Точные параметры камер Global — в характеристиках выбранной модели выше.</p></div><div class="po-optics">${photo(A+'leica-optics.webp','Оптическая схема объектива Leica на официальной презентации Xiaomi 18 Pro')}<div><p class="po-kicker">ОПТИКА LEICA</p><h3>История начинается<br>со света.</h3><p>Так устроена оптика в презентации серии Xiaomi 18 Pro. Финальные сенсоры, объективы и режимы съёмки Global требуют подтверждения.</p></div></div><div class="po-gallery"><div class="po-gallery-toolbar"><h3>Взгляд производителя</h3><div role="group" aria-label="Примеры фотографий">${[['portrait','Портрет'],['night','Вечер'],['detail','Детали']].map(([id,t])=>`<button data-po-shot="${id}" aria-pressed="${id===shot}">${t}</button>`).join('')}</div></div><figure><img id="po-sample" src="${A}camera-portrait.webp" loading="lazy" decoding="async" alt="Пример портретной фотографии из официальной галереи Xiaomi 18 Pro" width="1280" height="610"><figcaption id="po-sample-caption">Материал презентации серии Xiaomi 18 Pro, не тест глобальной версии. Результат съёмки зависит от условий.</figcaption></figure></div></section>
    <footer class="po-sources"><div><p class="po-kicker">О ПРЕДЗАКАЗЕ</p><h3>Выбери модель. Сохрани конфигурацию.</h3><p>Здесь только Xiaomi 18 Pro и Xiaomi 18 Pro Max для Global. Цена, срок поставки, окончательные характеристики и доступность цвета уточняются в магазине.</p><p>Копирование конфигурации не оформляет заказ и не резервирует товар.</p></div><details><summary>Источники · проверено 06.11.2026</summary><ul><li><a href="${PREORDER_MODELS[0].source}" target="_blank" rel="noopener noreferrer">Xiaomi — международный анонс серии ↗︎</a></li><li><a href="${PREORDER_MODELS[0].specSource}" target="_blank" rel="noopener noreferrer">GSMArena — предварительные европейские конфигурации ↗︎</a></li></ul><p>Фото, примеры съёмки и ролик — презентационные материалы Xiaomi для серии. Они иллюстрируют дизайн и сценарии, но не подтверждают окончательную комплектацию Global. Происхождение файлов сохранено в манифесте проекта.</p></details></footer><p id="po-live" class="po-sr-only" role="status" aria-live="polite"></p></div>`;

  function persist() {
    const u=new URL(location.href);
    u.searchParams.set('section','preorder');u.searchParams.set('phone',selection.model.id);u.searchParams.set('finish',selection.color.id);u.searchParams.set('capacity',selection.capacity);if(u.hash==='#po-compare')u.hash='';
    history.replaceState({...history.state},'',u);
  }
  function updateColor() {
    const {model:m,color:c,capacity}=selection;
    const image=root.querySelector('#po-device-image');image.src=c.image;image.alt=`${m.name}, ${c.label}`;
    root.querySelector('#po-color-name').textContent=c.label;
    root.querySelectorAll('[data-po-color]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.poColor===c.id)));
    const variants=m.variants;
    if(!variants.includes(capacity))selection.capacity=variants[0];
    root.querySelector('#po-capacities').innerHTML=variants.map(v=>`<button data-po-capacity="${esc(v)}" aria-pressed="${v===selection.capacity}">${esc(v)}</button>`).join('');
    root.querySelector('#po-selection-summary').textContent=`${m.name} · ${c.label} · ${selection.capacity}`;
    root.querySelector('#po-copy-status').textContent='';
    persist();
  }
  function renderModel() {
    const {model:m,color:c}=selection;
    root.querySelectorAll('[data-po-model]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.poModel===m.id)));
    root.querySelector('#po-model-panel').innerHTML=`<article class="po-product" style="--po-device-accent:${m.accent}"><div class="po-product-stage"><span class="po-stage-halo"></span><span class="po-product-badge">${esc(m.tag)}</span><img id="po-device-image" src="${c.image}" alt="${esc(m.name+', '+c.label)}" width="360" height="700" decoding="async"><span class="po-stage-label">XIAOMI 18 PRO SERIES</span></div><div class="po-product-copy"><p class="po-kicker">${esc(m.name)} · GLOBAL</p><h3>${esc(m.line)}</h3><p>${esc(m.description)}</p><dl class="po-key-facts"><div><dt>Аккумулятор*</dt><dd>${m.battery}<small>мА·ч</small></dd></div><div><dt>Зарядка*</dt><dd>${m.wired} Вт<small>по проводу</small></dd></div><div><dt>Память*</dt><dd>12 ГБ<small>оперативная</small></dd></div></dl><p class="po-global-note">* Предварительные данные европейских поставок. <a href="${esc(m.specSource)}" target="_blank" rel="noopener noreferrer">Источник ↗︎</a></p><p class="po-chip">${esc(m.chip)}<small>Предварительные данные Global</small></p><div class="po-color-heading">Цвет: <strong id="po-color-name">${esc(c.label)}</strong></div><div class="po-swatches" role="group" aria-label="Цвет ${esc(m.name)}">${m.colors.map(v=>`<button data-po-color="${v.id}" style="--po-swatch:${v.hex}" aria-label="${esc(v.label)}" aria-pressed="${v.id===c.id}"><span></span></button>`).join('')}</div><p class="po-color-hint">${esc(m.colorsNote)}</p><div id="po-capacities" class="po-capacities" role="group" aria-label="Оперативная память и накопитель"></div><p class="po-color-hint">Конфигурации предварительные; наличие уточняется в магазине.</p><button class="po-button po-primary po-copy-button" data-po-copy>Скопировать конфигурацию <span>↗︎</span></button><p id="po-selection-summary" class="po-selection-summary"></p><p id="po-copy-status" class="po-copy-status" role="status"></p><a class="po-spec-shortcut" href="#po-specs">Все характеристики ${esc(m.name)} ↓</a></div></article>`;
    root.querySelector('#po-spec-name').textContent=m.name+' · Global';
    root.querySelector('#po-spec-groups').innerHTML=specMarkup(m);
    root.querySelector('#po-live').textContent=`Выбрана модель ${m.name}`;
    updateColor();
  }
  function renderDemo() {
    const content={
      selfie:{title:'Увидеть себя до кадра.',text:'Задний экран работает как видоискатель: можно снимать себя на основные камеры и сразу проверять композицию. Удобно для селфи и групповых кадров.',screen:`<div class="po-demo-selfie">${photo(A+'camera-portrait.webp','Условный пример предварительного просмотра портрета')}<span class="po-demo-grid-lines"></span><span class="po-shutter"></span></div>`},
      cards:{title:'Не переворачивать. Просто взглянуть.',text:'Карточки показывают полезную информацию и дают быстрый доступ к поддерживаемым функциям. Набор приложений и уведомлений определяется системой и регионом.',screen:'<div class="po-screen-card"><small>СЕГОДНЯ</small><b>09:41</b><span>Встреча через 10 минут</span><i>♫ Любимый трек · ▷</i></div>'},
      wallpaper:{title:'С другой стороны — тоже ты.',text:'Часы, обои и собственные изображения превращают задний экран в часть дизайна. В новых Pro есть персонализация и AI-инструменты; некоторые возможности требуют обновления.',screen:'<div class="po-screen-wallpaper"><span>09<br>41</span><small>MAKE IT YOURS</small></div>'},
      ai:{title:'Маленький экран. Свои сценарии.',text:'Для серии 18 Pro Xiaomi показывает приложение-карточки и их создание с помощью AI. Доступность AI-карточек и языков в Global пока не подтверждена.',screen:'<div class="po-screen-card po-screen-ai"><small>ПРИМЕР AI-КАРТОЧКИ</small><b>25:00</b><span>Время сосредоточиться</span><i>● Фокус-таймер</i></div>'},
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
    if(b.dataset.poColor){selection.color=selection.model.colors.find(c=>c.id===b.dataset.poColor)||selection.color;updateColor();}
    if(b.dataset.poCapacity){selection.capacity=b.dataset.poCapacity;updateColor();}
    if(b.dataset.poDemo){demo=b.dataset.poDemo;renderDemo();}
    if(b.dataset.poShot){shot=b.dataset.poShot;root.querySelector('#po-sample').src=A+'camera-'+shot+'.webp';root.querySelector('#po-sample').alt={portrait:'Портрет из галереи Xiaomi 18 Pro',night:'Вечерняя фотография из галереи Xiaomi 18 Pro',detail:'Пример деталей из галереи Xiaomi 18 Pro'}[shot];root.querySelectorAll('[data-po-shot]').forEach(v=>v.setAttribute('aria-pressed',String(v.dataset.poShot===shot)));}
    if(b.hasAttribute('data-po-play')){const v=root.querySelector('#po-film');v.src=A+'rear-display-film.mp4';b.hidden=true;try{await v.play()}catch{v.controls=true;}}
    if(b.hasAttribute('data-po-copy')){
      const text=preorderRequest(selection);const status=root.querySelector('#po-copy-status');
      try{if(!navigator.clipboard?.writeText)throw Error('Clipboard unavailable');await navigator.clipboard.writeText(text);status.textContent='Конфигурация скопирована. Передай её сотруднику магазина.';}
      catch{let area=root.querySelector('#po-copy-fallback');if(!area){area=document.createElement('textarea');area.id='po-copy-fallback';area.setAttribute('aria-label','Текст запроса на предзаказ');status.after(area)}area.value=text;area.focus();area.select();status.textContent='Выделенный текст можно скопировать вручную.';}
    }
  });
  renderModel();renderDemo();root.dataset.mounted='true';
  return { pause:()=>root.querySelector('#po-film')?.pause() };
}

import { escapeHtml as esc } from './utils.js?v=20261023-4';
const MEDIA = 'assets/preorder/20261107/';
const PHONE = 'assets/preorder/20261107/pro-max-rear-detail.webp';
export const REAR_DISPLAY_SCENARIOS = [
  {id:'clock', label:'Время и дата', title:'Достаточно одного взгляда.', text:'Часы и полезная информация доступны на заднем экране, когда телефон лежит основным дисплеем вниз. Погода в этом примере условная.'},
  {id:'gif', label:'GIF / анимация', title:'Небольшой экран с характером.', text:'Xiaomi показывает динамические обои и анимированных персонажей. Здесь воспроизводится настоящая GIF-анимация. Штатный импорт произвольного GIF именно на 18 Pro Max в изученных официальных материалах не подтверждён.'},
  {id:'wallpaper', label:'Фотообои', title:'Твоё оформление с другой стороны.', text:'Фон, изображения и персонализация меняют оформление заднего экрана. Xiaomi также показывает AI-изображения и обои, подобранные под чехол. Здесь — пример фотообоев.'},
  {id:'music', label:'Музыка', title:'Управление без переворота.', text:'Поддерживаемый музыкальный плеер может показываться на заднем экране. В демо — условный трек без звука; совместимость зависит от приложения и прошивки.'},
  {id:'cards', label:'Уведомления', title:'Важное остаётся на виду.', text:'На заднем экране можно видеть поддерживаемые уведомления и входящие звонки. Для уведомлений могут понадобиться разрешения отображения на заблокированном экране.'},
  {id:'timer', label:'Таймер', title:'Обратный отсчёт под рукой.', text:'Отслеживай таймер на небольшом экране. Здесь можно запустить и приостановить демонстрационный отсчёт на 25 минут.'},
  {id:'selfie', label:'Предпросмотр камеры', title:'Селфи на основные камеры.', text:'Задний экран служит видоискателем: можно проверить композицию для селфи или показать кадр человеку, которого снимаешь. В демо использован пример фотографии Xiaomi.'},
  {id:'ai', label:'AI-карточки', title:'Свои маленькие сценарии.', text:'Xiaomi заявляет готовые карточки и создание карточек с помощью AI: например, фокус-таймер или напоминание пить воду. Языки, доступность сервисов и функций зависят от прошивки и аккаунта.'},
];
export function rearDisplayMarkup() {
  return `<div class="rd-layout" data-rear-demo>
    <figure class="rd-photo-stage"><div class="rd-phone">
      <img class="rd-phone-photo" src="${PHONE}" alt="Официальное изображение заднего экрана Xiaomi 18 Pro Max крупным планом" width="2560" height="1136" loading="lazy" decoding="async">
      <div class="rd-display"><div id="po-demo-screen" class="rd-display-inner" role="img" aria-label="Пример часов на заднем экране"></div></div>
    </div><figcaption><strong>Xiaomi 18 Pro Max</strong><span>2,9″ AMOLED · крупным планом</span></figcaption></figure>
    <div class="rd-controls"><p class="rd-instruction">Нажми на сценарий — изображение на телефоне изменится</p>
      <div class="rd-tabs" role="group" aria-label="Возможности заднего экрана">${REAR_DISPLAY_SCENARIOS.map(s=>`<button type="button" data-po-demo="${s.id}" aria-pressed="${s.id==='clock'}">${esc(s.label)}</button>`).join('')}</div>
      <div id="rd-copy" class="rd-copy" aria-live="polite"></div>
      <p class="rd-caption">Корпус — официальное изображение Xiaomi. Содержимое экрана — интерактивное демо, не запись интерфейса HyperOS.</p>
      <details class="rd-guide"><summary>Как настроить на телефоне и источники</summary><p>Открой настройки заднего экрана: выбери оформление и доступные карточки приложений. Для уведомлений проверь разрешения на заблокированном экране. Названия пунктов и функции зависят от версии системы.</p><a href="https://www.mi.com/prod/xiaomi-18-pro-max" target="_blank" rel="noopener noreferrer">Xiaomi: экран, персонализация и карточки ↗</a><a href="https://new.c.mi.com/global/post/2366059" target="_blank" rel="noopener noreferrer">Xiaomi Community: сценарии и AI-карточки ↗</a><a href="https://www.frandroid.com/marques/xiaomi/3273007_xiaomi-18-pro-nos-5-fonctions-preferees-sur-lecran-arriere" target="_blank" rel="noopener noreferrer">Практическая настройка и функции серии: Frandroid ↗</a></details>
    </div></div>`;
}
export function mountRearDisplay(root) {
  let scenario='clock', interval=null, active=true;
  let gifPlaying=!matchMedia('(prefers-reduced-motion: reduce)').matches;
  let remaining=25*60, deadline=null;
  const screen=root.querySelector('#po-demo-screen');
  const copy=root.querySelector('#rd-copy');
  const secondsText=seconds=>`${String(Math.floor(seconds/60)).padStart(2,'0')}:${String(seconds%60).padStart(2,'0')}`;
  function tick() {
    if (!active || document.hidden) return;
    if(scenario==='clock'){
      const d=new Date();
      root.querySelectorAll('[data-rd-time]').forEach(el=>el.textContent=new Intl.DateTimeFormat('ru-RU',{hour:'2-digit',minute:'2-digit'}).format(d));
      root.querySelectorAll('[data-rd-date]').forEach(el=>el.textContent=new Intl.DateTimeFormat('ru-RU',{day:'numeric',month:'short'}).format(d));
    }
    if(deadline){remaining=Math.max(0,Math.ceil((deadline-Date.now())/1000));if(!remaining){deadline=null;render();return;}}
    root.querySelectorAll('[data-rd-countdown]').forEach(el=>el.textContent=secondsText(remaining));
  }
  function manageTick(){clearInterval(interval);interval=null;if(active&&(scenario==='clock'||deadline))interval=setInterval(tick,1000);}
  function render() {
    const mode=REAR_DISPLAY_SCENARIOS.find(s=>s.id===scenario);
    root.querySelectorAll('[data-po-demo]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.poDemo===scenario)));
    const contents={
      clock:'<div class="rd-clock rd-content"><small data-rd-date></small><b data-rd-time>09:41</b><span>☀ 22° <i>пример погоды</i></span></div>',
      gif:`<div class="rd-gif"><img src="${MEDIA}${active&&gifPlaying?'earth.gif':'earth-still.webp'}" alt="Вращающаяся Земля — пример GIF" width="400" height="400"></div>`,
      wallpaper:'<div class="rd-wallpaper"><img src="assets/preorder/20261106/camera-night.webp" alt="Пример фотообоев" width="1280" height="610"><span>ТВОЙ МОМЕНТ</span></div>',
      music:'<div class="rd-content rd-music"><small>ДЕМО-ТРЕК</small><b>Твой ритм</b><div class="rd-bars" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></div><span aria-hidden="true">‹‹ &nbsp; ▷ &nbsp; ››</span></div>',
      cards:'<div class="rd-content rd-notification"><small>ПРИМЕР УВЕДОМЛЕНИЯ</small><b>Новое сообщение</b><span>Встречаемся через 10 минут</span></div>',
      timer:`<div class="rd-content rd-timer"><small>ФОКУС-ТАЙМЕР</small><b data-rd-countdown>${secondsText(remaining)}</b><span>${deadline?'Идёт отсчёт':'Можно начинать'}</span></div>`,
      selfie:'<div class="rd-selfie"><img src="assets/preorder/20261106/camera-portrait.webp" alt="Пример кадра основных камер Xiaomi" width="1280" height="610"><span class="rd-viewfinder" aria-hidden="true"></span><i aria-hidden="true"></i></div>',
      ai:'<div class="rd-content rd-ai"><small>ПРИМЕР AI-КАРТОЧКИ</small><span class="rd-water" aria-hidden="true">♧</span><b>Стакан воды</b><span>Небольшая полезная привычка</span></div>',
    };
    screen.innerHTML=contents[scenario];screen.dataset.scenario=scenario;screen.setAttribute('aria-label',`${mode.label}: демонстрационный экран Xiaomi 18 Pro Max`);
    copy.innerHTML=`<h3>${esc(mode.title)}</h3><p>${esc(mode.text)}</p>${scenario==='gif'?`<button type="button" class="rd-action" data-rd-gif>${gifPlaying?'Пауза GIF':'Запустить GIF'}</button><p class="rd-credit">GIF: <a href="https://commons.wikimedia.org/wiki/File:Rotating_earth_(large).gif" target="_blank" rel="noopener noreferrer">Marvel / Wikimedia Commons</a>, <a href="https://creativecommons.org/licenses/by-sa/3.0/" target="_blank" rel="noopener noreferrer">CC BY-SA 3.0</a>. Постер — первый кадр.</p>`:''}${scenario==='timer'?`<div class="rd-timer-actions"><button type="button" class="rd-action" data-rd-timer>${deadline?'Пауза таймера':'Запустить таймер'}</button><button type="button" class="rd-action" data-rd-reset>Сбросить</button></div>`:''}`;
    tick();manageTick();
  }
  root.addEventListener('click',event=>{
    const b=event.target.closest('button');if(!b)return;
    if(b.dataset.poDemo){scenario=b.dataset.poDemo;render();}
    if(b.hasAttribute('data-rd-gif')){gifPlaying=!gifPlaying;render();}
    if(b.hasAttribute('data-rd-timer')){if(deadline){remaining=Math.max(0,Math.ceil((deadline-Date.now())/1000));deadline=null}else{if(!remaining)remaining=25*60;deadline=Date.now()+remaining*1000}render();}
    if(b.hasAttribute('data-rd-reset')){remaining=25*60;deadline=null;render();}
  });
  render();
  return {
    pause(){active=false;if(deadline){remaining=Math.max(0,Math.ceil((deadline-Date.now())/1000));deadline=null;}clearInterval(interval);interval=null;if(scenario==='gif')screen.querySelector('img').src=MEDIA+'earth-still.webp';root.classList.add('rd-paused');},
    resume(){if(active)return;active=true;root.classList.remove('rd-paused');render();},
  };
}

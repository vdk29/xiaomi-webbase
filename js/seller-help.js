import { SELLER_PROFILES, SELLER_REVIEWED_AT } from './seller-help-data.js?v=20261107-23';

const escape = value => String(value ?? '').replace(/[&<>"']/g, character => ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'}[character]));
const clean = value => String(value || '').normalize('NFKC').replace(/\s+/g, ' ').trim();
const text = value => Array.isArray(value) ? value.join(', ') : typeof value === 'string' || typeof value === 'number' ? String(value) : '';
const httpUrl = value => { try { const url = new URL(value); return ['https:', 'http:'].includes(url.protocol) ? url.href : ''; } catch { return ''; } };

export function isSmartphone(product) {
  return clean(product.category).toLowerCase() === 'смартфоны';
}

export function sellerProfile(product) {
  // The full retail identity matters: REDMI, POCO, Note, Pro, Max, Ultra, 4G/5G.
  // Only an exact family before a RAM/storage suffix may inherit researched facts.
  const identity = clean(product.name).replace(/^смартфон\s+/i, '').split(/\s+\d+\s*(?:gb|гб)?\s*[+/]/i)[0].trim().toLowerCase();
  return SELLER_PROFILES.find(profile => profile.match.test(identity)) || null;
}

export function phoneMemory(product) {
  const expression = /(?:^|\s)(\d+)\s*(?:gb|гб)?\s*[+/]\s*(\d+)\s*(tb|тб|gb|гб)?(?=\s|$|[,;)])/i;
  // 1C names are variant-specific even when an old specs object describes another SKU.
  const match = clean(product.name).match(expression) || clean(product.memory).match(expression);
  if (!match) return null;
  const ram = Number(match[1]);
  const storage = Number(match[2]) * (/^(tb|тб)$/i.test(match[3]) ? 1024 : 1);
  return ram > 0 && storage > 0 ? { ram, storage } : null;
}

function batteryFor(product, profile) {
  if (profile.id !== 'redmi-note-17-pro-max-5g') return profile.battery;
  // Both are manufacturer-confirmed regional versions. Do not pick a region from colour or SKU.
  const specs = product.specs || {};
  const value = text(specs['Емкость аккумулятора, мА*ч']) || text(specs['Аккумулятор']);
  const match = value.replace(/\s/g, '').match(/(?:^|\D)(9210|10000)(?:\D|$)/);
  return match ? `${match[1]} мА·ч по карточке; сверьте регион поставки` : '9210 / 10000 мА·ч — зависит от рынка';
}

export function buildSellerHelp(product) {
  if (!isSmartphone(product)) return null;
  const profile = sellerProfile(product);
  const memory = phoneMemory(product);
  const cards = [];
  if (profile) {
    cards.push({id:'battery', label:'Батарея и зарядка', fact:`${batteryFor(product, profile)} · ${profile.charge}`,
      say:'Часто бываете без розетки? Здесь ёмкая батарея, а быстрая зарядка поможет пополнить заряд во время перерыва. Время работы зависит от нагрузки.'});
    cards.push({id:'camera', label:'Камеры', fact:profile.camera, say:profile.cameraBenefit});
    cards.push({id:'screen', label:'Экран', fact:profile.screen,
      say:/AMOLED|OLED/.test(profile.screen) ? 'Контрастный экран с глубоким чёрным — приятно смотреть фото и видео. Высокая частота делает прокрутку плавнее.' : 'На большом экране удобнее читать, смотреть видео и пользоваться картами. Высокая частота делает прокрутку плавнее.'});
    cards.push({id:'performance', label:'Скорость', fact:profile.processor,
      say:['redmi-17','redmi-note-17'].includes(profile.id) ? 'Для звонков, мессенджеров, карт и видео — повседневные задачи без переплаты за флагманские возможности.' : 'Если используете требовательные приложения, обратите внимание на эту платформу. Давайте проверим привычные вам приложения прямо на телефоне.'});
  }
  cards.push({id:'memory', label:'Память', fact:memory ? `${memory.ram} ГБ оперативной · ${memory.storage} ГБ встроенной` : 'Сверьте память на коробке',
    say:memory ? `Здесь ${memory.storage} ГБ для системы, приложений, фото и видео. Посмотрим, сколько занято на вашем телефоне, чтобы подобрать объём с запасом.` : 'Посмотрим, сколько памяти занято сейчас, и подберём комплектацию с запасом.'});
  if (profile) cards.push({id:'practical', label:'Защита', fact:profile.protection,
    say:profile.protection === 'IP64' ? 'Есть защита от пыли и брызг для повседневных ситуаций. Погружать телефон в воду нельзя.' : 'Защита от пыли и воды помогает при бытовых случайностях. Она не означает, что с телефоном можно плавать.'});
  return {profile, memory, cards};
}

export function sellerHelpMarkup(product) {
  const help = buildSellerHelp(product);
  if (!help) return '';
  const {profile, cards} = help;
  const sourceLinks = profile ? [{label:'Характеристики производителя',url:profile.source},...(profile.extraSources || [])] : [];
  const cardSource = httpUrl(product.specs?._source_url);
  if (cardSource && !sourceLinks.some(item => item.url === cardSource)) sourceLinks.push({label:'Источник карточки',url:cardSource});
  return `<div class="seller-help">
    ${profile ? '' : '<p class="seller-empty">Для этой модели ещё нет проверенного сценария. Сверьте характеристики поставки.</p>'}
    <div class="seller-tabs" role="tablist" aria-label="Подсказки продавцу">${cards.map((card,index)=>`<button type="button" role="tab" id="seller-tab-${card.id}" aria-controls="seller-${card.id}" aria-selected="${index===0}" tabindex="${index===0?'0':'-1'}" data-seller-tab="${card.id}">${escape(card.label)}</button>`).join('')}</div>
    ${cards.map((card,index)=>`<div id="seller-${card.id}" class="seller-tip" role="tabpanel" aria-labelledby="seller-tab-${card.id}" tabindex="0" ${index===0?'':'hidden'}><p class="seller-fact">${escape(card.fact)}</p><p class="seller-say"><span>Что сказать клиенту</span>«${escape(card.say)}»</p></div>`).join('')}
    ${sourceLinks.length ? `<details class="seller-sources"><summary>Источники · ${SELLER_REVIEWED_AT.split('-').reverse().join('.')}</summary>${sourceLinks.map(item=>`<a href="${escape(item.url)}" target="_blank" rel="noopener noreferrer">${escape(item.label)} ↗</a>`).join('')}</details>` : ''}
  </div>`;
}

export function mountSellerHelp(container) {
  const tabs = [...container.querySelectorAll('[data-seller-tab]')];
  const select = (tab, focus = false) => {
    for (const candidate of tabs) {
      const selected = candidate === tab;
      candidate.setAttribute('aria-selected', String(selected));
      candidate.tabIndex = selected ? 0 : -1;
      container.querySelector(`#seller-${candidate.dataset.sellerTab}`).hidden = !selected;
    }
    if (focus) tab.focus();
  };
  container.onclick = event => {
    const tab = event.target.closest('[data-seller-tab]');
    if (tabs.includes(tab)) select(tab);
  };
  container.onkeydown = event => {
    const index = tabs.indexOf(event.target);
    if (index < 0) return;
    const moves = {ArrowRight:(index+1)%tabs.length,ArrowLeft:(index+tabs.length-1)%tabs.length,Home:0,End:tabs.length-1};
    if (!Object.hasOwn(moves, event.key)) return;
    event.preventDefault();
    select(tabs[moves[event.key]], true);
  };
}
